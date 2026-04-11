import { app, BrowserWindow, ipcMain, Menu } from "electron";

app.commandLine.appendSwitch("disable-features", "AutofillServerCommunication");
import { join } from "path";
import { existsSync, readFileSync, statSync } from "fs";
import { execFileSync, spawnSync, spawn } from "child_process";

// ---- Find bash ----
function findBash(): string {
  if (process.platform !== "win32") {
    try { return execFileSync("which", ["bash"], { encoding: "utf-8" }).trim(); } catch {}
    return "/bin/bash";
  }

  const candidates = [
    join(process.env.ProgramFiles        ?? "C:\\Program Files",       "Git", "bin", "bash.exe"),
    join(process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)", "Git", "bin", "bash.exe"),
    join(process.env.LOCALAPPDATA        ?? "",                         "Programs", "Git", "bin", "bash.exe"),
  ];

  for (const c of candidates) {
    if (existsSync(c)) return c;
  }

  try {
    const r = spawnSync("where", ["bash.exe"], { encoding: "utf-8", shell: false });
    if (r.stdout) return r.stdout.trim().split("\n")[0].trim();
  } catch {}

  return "bash.exe";
}

// ---- Convert Windows path → bash-compatible path ----
function toShellPath(p: string): string {
  if (process.platform !== "win32") return p;
  return p.replace(/\\/g, "/").replace(/^([A-Za-z]):/, (_, d) => `/${d.toLowerCase()}`);
}

const ROOT = app.isPackaged
  ? join(process.resourcesPath, "app")
  : join(__dirname, "..", "..");

const SHELL_ROOT = toShellPath(ROOT);
const BASH = findBash();

// ---- Parse projects.conf ----
function parseProjects() {
  const confPath = join(ROOT, "projects.conf");
  if (!existsSync(confPath)) return [];

  return readFileSync(confPath, "utf-8")
    .split("\n")
    .map((l) => l.replace(/\r/, "").trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((line) => {
      const [name, ...rest] = line.split(":");
      const projectDir = join(ROOT, "projects", name.trim());
      const hasConfig = existsSync(projectDir);
      return {
        name:     name.trim(),
        path:     rest.join(":").trim(),
        hasConfig,
        lastSync: hasConfig ? statSync(projectDir).mtime.toISOString() : null,
      };
    });
}

// ---- Git log ----
function getGitLog(): string {
  try {
    const r = spawnSync("git", ["-C", ROOT, "log", "--oneline", "-8"], { encoding: "utf-8" });
    return r.stdout?.trim() ?? "";
  } catch {
    return "";
  }
}

// ---- Window ----
let win: BrowserWindow;

function createWindow() {
  win = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 800,
    minHeight: 500,
    title: "AI Configs",
    backgroundColor: "#0d1117",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      preload: join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(join(__dirname, "..", "renderer", "index.html"));
}

app.whenReady().then(() => {
  console.log("=== AI Configs Debug ===");
  console.log("platform  :", process.platform);
  console.log("ROOT      :", ROOT);
  console.log("SHELL_ROOT:", SHELL_ROOT);
  console.log("BASH      :", BASH);
  console.log("bash found:", existsSync(BASH));
  console.log("conf found:", existsSync(join(ROOT, "projects.conf")));
  console.log("projects  :", parseProjects().map((p) => `${p.name} → ${p.path}`));
  console.log("========================");

  Menu.setApplicationMenu(null);
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// ---- IPC ----
ipcMain.handle("projects:list", () => parseProjects());
ipcMain.handle("git:log",       () => getGitLog());

ipcMain.handle("sync:run", (event, project: string) => {
  return new Promise<number>((resolve) => {
    const scriptArgs = project ? [project] : [];
    const proc = spawn(BASH, [`${SHELL_ROOT}/sync.sh`, ...scriptArgs], {
      cwd:  ROOT,
      env:  { ...process.env, FORCE_COLOR: "0" },
    });

    const sender = event.sender;

    proc.stdout.on("data", (data: Buffer) =>
      sender.send("sync:line", { line: data.toString() })
    );
    proc.stderr.on("data", (data: Buffer) =>
      sender.send("sync:line", { line: data.toString(), error: true })
    );
    proc.on("close", (code) => {
      sender.send("sync:line", { done: true, code: code ?? 0 });
      resolve(code ?? 0);
    });
  });
});
