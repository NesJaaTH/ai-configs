import { app, BrowserWindow, ipcMain, Menu } from "electron";

app.commandLine.appendSwitch("disable-features", "AutofillServerCommunication");

import { join } from "path";
import { existsSync, readFileSync, statSync } from "fs";
import { execFileSync, spawnSync, spawn } from "child_process";

// ---- Debug logger ----
const DEBUG = true;
function dbg(section: string, ...args: any[]) {
  if (!DEBUG) return;
  console.log(`[${section}]`, ...args);
}

// ---- Find bash ----
function findBash(): string {
  dbg("findBash", "platform =", process.platform);

  if (process.platform !== "win32") {
    try {
      const p = execFileSync("which", ["bash"], { encoding: "utf-8" }).trim();
      dbg("findBash", "found via which →", p);
      return p;
    } catch {
      dbg("findBash", "which failed, fallback /bin/bash");
      return "/bin/bash";
    }
  }

  const candidates = [
    join(process.env.ProgramFiles         ?? "C:\\Program Files",       "Git", "bin", "bash.exe"),
    join(process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)", "Git", "bin", "bash.exe"),
    join(process.env.LOCALAPPDATA         ?? "",                         "Programs", "Git", "bin", "bash.exe"),
  ];

  for (const c of candidates) {
    dbg("findBash", "checking →", c, existsSync(c) ? "✅" : "❌");
    if (existsSync(c)) return c;
  }

  try {
    const r = spawnSync("where", ["bash.exe"], { encoding: "utf-8", shell: false });
    const found = r.stdout?.trim().split("\n")[0].trim();
    if (found) {
      dbg("findBash", "found via where →", found);
      return found;
    }
  } catch (e) {
    dbg("findBash", "where failed →", e);
  }

  dbg("findBash", "fallback → bash.exe");
  return "bash.exe";
}

// ---- Convert Windows path → bash-compatible path ----
function toShellPath(p: string): string {
  if (process.platform !== "win32") return p;
  return p.replace(/\\/g, "/").replace(/^([A-Za-z]):/, (_, d) => `/${d.toLowerCase()}`);
}

// app.getAppPath() = folder ที่มี package.json → app/
const APP_DIR    = app.getAppPath();
const DIST_DIR   = join(APP_DIR, "dist");
const ROOT       = app.isPackaged ? join(process.resourcesPath, "app") : join(APP_DIR, "..");
const SHELL_ROOT = toShellPath(ROOT);
const BASH       = findBash();

// ---- Parse projects.conf ----
function parseProjects() {
  const confPath = join(ROOT, "projects.conf");
  dbg("parseProjects", "conf =", confPath, existsSync(confPath) ? "✅" : "❌ NOT FOUND");
  if (!existsSync(confPath)) return [];

  const lines = readFileSync(confPath, "utf-8")
    .split("\n")
    .map((l) => l.replace(/\r/, "").trim())
    .filter((l) => l && !l.startsWith("#"));

  dbg("parseProjects", `${lines.length} entries found`);

  return lines.map((line) => {
    const [name, ...rest] = line.split(":");
    const projectDir = join(ROOT, "projects", name.trim());
    const hasConfig  = existsSync(projectDir);
    const entry = {
      name:     name.trim(),
      path:     rest.join(":").trim(),
      hasConfig,
      lastSync: hasConfig ? statSync(projectDir).mtime.toISOString() : null,
    };
    dbg("parseProjects", `  ${entry.name} → ${entry.path} | hasConfig=${hasConfig}`);
    return entry;
  });
}

// ---- Git log ----
function getGitLog(): string {
  dbg("getGitLog", "cwd =", ROOT);
  const r = spawnSync("git", ["-C", ROOT, "log", "--oneline", "-8"], { encoding: "utf-8" });
  if (r.error) {
    dbg("getGitLog", "error →", r.error.message);
    return "";
  }
  if (r.stderr) dbg("getGitLog", "stderr →", r.stderr.trim());
  dbg("getGitLog", "ok →", r.stdout?.split("\n").length, "lines");
  return r.stdout?.trim() ?? "";
}

// ---- Window ----
let win: BrowserWindow;

function createWindow() {
  dbg("createWindow", "preload =", join(DIST_DIR, "preload.js"));
  dbg("createWindow", "html    =", join(APP_DIR, "renderer", "index.html"));

  win = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 800,
    minHeight: 500,
    title: "AI Configs",
    backgroundColor: "#0d1117",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      preload: join(DIST_DIR, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile(join(APP_DIR, "renderer", "index.html"));
}

app.whenReady().then(() => {
  console.log("\n========== AI Configs Debug ==========");
  console.log("platform  :", process.platform);
  console.log("packaged  :", app.isPackaged);
  console.log("APP_DIR   :", APP_DIR);
  console.log("DIST_DIR  :", DIST_DIR);
  console.log("ROOT      :", ROOT);
  console.log("SHELL_ROOT:", SHELL_ROOT);
  console.log("BASH      :", BASH);
  console.log("bash ok   :", existsSync(BASH));
  console.log("preload ok:", existsSync(join(DIST_DIR, "preload.js")));
  console.log("html ok   :", existsSync(join(APP_DIR, "renderer", "index.html")));
  console.log("conf ok   :", existsSync(join(ROOT, "projects.conf")));
  console.log("sync.sh ok:", existsSync(join(ROOT, "sync.sh")));
  console.log("======================================\n");

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
ipcMain.handle("projects:list", () => {
  dbg("IPC", "projects:list called");
  return parseProjects();
});

ipcMain.handle("git:log", () => {
  dbg("IPC", "git:log called");
  return getGitLog();
});

ipcMain.handle("sync:run", (event, project: string) => {
  dbg("IPC", "sync:run called, project =", project || "(all)");

  return new Promise<number>((resolve) => {
    const scriptArgs = project ? [project] : [];
    const cmd  = BASH;
    const args = [`${SHELL_ROOT}/sync.sh`, ...scriptArgs];

    dbg("sync:run", "spawn →", cmd, args.join(" "));
    dbg("sync:run", "cwd   →", ROOT);

    const proc = spawn(cmd, args, {
      cwd: ROOT,
      env: { ...process.env, FORCE_COLOR: "0" },
    });

    dbg("sync:run", "pid   →", proc.pid);

    const sender = event.sender;

    proc.stdout.on("data", (data: Buffer) => {
      const line = data.toString();
      process.stdout.write("[stdout] " + line);
      sender.send("sync:line", { line });
    });

    proc.stderr.on("data", (data: Buffer) => {
      const line = data.toString();
      process.stderr.write("[stderr] " + line);
      sender.send("sync:line", { line, error: true });
    });

    proc.on("error", (err) => {
      dbg("sync:run", "proc error →", err.message);
      sender.send("sync:line", { line: `❌ spawn error: ${err.message}\n`, error: true });
      sender.send("sync:line", { done: true, code: 1 });
      resolve(1);
    });

    proc.on("close", (code) => {
      dbg("sync:run", "exit code →", code);
      sender.send("sync:line", { done: true, code: code ?? 0 });
      resolve(code ?? 0);
    });
  });
});
