import { app, BrowserWindow, ipcMain, Menu, globalShortcut } from "electron";

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

// ---- Read config.json for DATA_ROOT (separate private configs repo) ----
function readDataRoot(): string {
  const configPath = join(ROOT, "config.json");
  if (existsSync(configPath)) {
    try {
      const cfg = JSON.parse(readFileSync(configPath, "utf-8"));
      if (cfg.dataRoot) {
        dbg("config", "DATA_ROOT from config.json →", cfg.dataRoot);
        return cfg.dataRoot;
      }
    } catch (e) {
      dbg("config", "failed to parse config.json →", e);
    }
  }
  dbg("config", "no config.json — using ROOT as DATA_ROOT");
  return ROOT;
}

const DATA_ROOT = readDataRoot();

// ---- Parse projects.conf ----
function parseProjects() {
  const confPath = join(DATA_ROOT, "projects.conf");
  dbg("parseProjects", "conf =", confPath, existsSync(confPath) ? "✅" : "❌ NOT FOUND");
  if (!existsSync(confPath)) return [];

  const lines = readFileSync(confPath, "utf-8")
    .split("\n")
    .map((l) => l.replace(/\r/, "").trim())
    .filter((l) => l && !l.startsWith("#"));

  dbg("parseProjects", `${lines.length} entries found`);

  return lines.map((line) => {
    const [name, ...rest] = line.split(":");
    const projectDir = join(DATA_ROOT, "projects", name.trim());
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
  dbg("getGitLog", "cwd =", DATA_ROOT);
  const r = spawnSync("git", ["-C", DATA_ROOT, "log", "--oneline", "-8"], { encoding: "utf-8" });
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

  createWindow();

  globalShortcut.register("F12", () => {
    win?.webContents.toggleDevTools();
  });

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

  const sender = event.sender;
  const syncScript = join(APP_DIR, "src", "sync.ts");
  // argv: sync.ts [project] [dataRoot]
  const args = [syncScript, project, DATA_ROOT];

  dbg("IPC", "spawning bun run", syncScript, "project =", project || "(all)", "dataRoot =", DATA_ROOT);

  return new Promise<number>((resolve) => {
    const proc = spawn("bun", ["run", ...args], {
      cwd: ROOT,
      env: { ...process.env },
    });

    proc.stdout.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      process.stdout.write("[out] " + text);
      sender.send("sync:line", { line: text, error: false });
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      process.stderr.write("[err] " + text);
      sender.send("sync:line", { line: text, error: true });
    });

    proc.on("close", (code) => {
      const exitCode = code ?? 1;
      dbg("IPC", "bun sync.ts exited with code", exitCode);
      sender.send("sync:line", { done: true, code: exitCode });
      resolve(exitCode);
    });

    proc.on("error", (err) => {
      dbg("IPC", "spawn error →", err.message);
      sender.send("sync:line", { line: `❌ spawn error: ${err.message}\n`, error: true });
      sender.send("sync:line", { done: true, code: 1 });
      resolve(1);
    });
  });
});
