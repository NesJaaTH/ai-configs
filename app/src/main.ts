import { app, BrowserWindow, ipcMain, Menu, globalShortcut, shell, dialog } from "electron";

app.commandLine.appendSwitch("disable-features", "AutofillServerCommunication");

import { join } from "path";
import { existsSync, readFileSync, writeFileSync, statSync } from "fs";
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

ipcMain.handle("projects:save", (_, entries: { name: string; path: string }[]) => {
  const confPath = join(DATA_ROOT, "projects.conf");
  const lines = entries
    .filter((e) => e.name.trim() && e.path.trim())
    .map((e) => `${e.name.trim()}:${e.path.trim()}`);
  writeFileSync(confPath, lines.join("\n") + "\n", "utf-8");
  dbg("IPC", "projects:save → wrote", lines.length, "entries");
  return true;
});

ipcMain.handle("git:log", () => {
  dbg("IPC", "git:log called");
  return getGitLog();
});

ipcMain.handle("config:info", () => {
  dbg("IPC", "config:info called, DATA_ROOT =", DATA_ROOT);
  const r = spawnSync("git", ["-C", DATA_ROOT, "remote", "get-url", "origin"], { encoding: "utf-8" });
  const remoteUrl = r.stdout?.trim() ?? "";
  const repoSlug = remoteUrl
    .replace(/^https?:\/\/github\.com\//, "")
    .replace(/\.git$/, "")
    .trim();
  const folderName = DATA_ROOT.replace(/\\/g, "/").split("/").pop() ?? DATA_ROOT;

  const DEFAULT_ITEMS = ["CLAUDE.md", ".claude", ".cursor", ".agent", ".gemini", ".toh"];
  let syncItems = DEFAULT_ITEMS;
  const cfgPath = join(ROOT, "config.json");
  if (existsSync(cfgPath)) {
    try {
      const cfg = JSON.parse(readFileSync(cfgPath, "utf-8"));
      if (Array.isArray(cfg.syncItems) && cfg.syncItems.length > 0) syncItems = cfg.syncItems;
    } catch {}
  }

  return {
    dataRoot:  DATA_ROOT,
    repoSlug:  repoSlug || folderName,
    remoteUrl: remoteUrl.startsWith("https://") ? remoteUrl.replace(/\.git$/, "") : "",
    syncItems,
  };
});

ipcMain.handle("config:setSyncItems", (_, items: string[]) => {
  const cfgPath = join(ROOT, "config.json");
  let cfg: Record<string, unknown> = {};
  if (existsSync(cfgPath)) {
    try { cfg = JSON.parse(readFileSync(cfgPath, "utf-8")); } catch {}
  }
  cfg.syncItems = items;
  writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + "\n", "utf-8");
  dbg("IPC", "config:setSyncItems →", items);
  return true;
});

ipcMain.handle("config:setRemote", (_, url: string) => {
  dbg("IPC", "config:setRemote →", url);
  const check = spawnSync("git", ["-C", DATA_ROOT, "remote", "get-url", "origin"], { encoding: "utf-8" });
  const cmd   = check.status === 0 ? "set-url" : "add";
  const result = spawnSync("git", ["-C", DATA_ROOT, "remote", cmd, "origin", url], { encoding: "utf-8" });
  if (result.status !== 0) throw new Error(result.stderr?.trim() || "git remote failed");
  return true;
});

ipcMain.handle("shell:open", (_, url: string) => {
  if (url.startsWith("https://")) shell.openExternal(url);
});

ipcMain.handle("setup:read", () => {
  const p = join(ROOT, "setup.sh");
  dbg("IPC", "setup:read →", p, existsSync(p) ? "✅" : "❌");
  if (!existsSync(p)) return null;
  return readFileSync(p, "utf-8");
});

// ---- Open directory picker ----
ipcMain.handle("dialog:openDir", async () => {
  const result = await dialog.showOpenDialog(win, {
    properties: ["openDirectory"],
    title: "Select project directory",
  });
  return result.canceled ? null : (result.filePaths[0] ?? null);
});

// ---- Read configured sync items (shared helper) ----
function readSyncItems(): string[] {
  const defaults = ["CLAUDE.md", ".claude", ".cursor", ".agent", ".gemini", ".toh"];
  const cfgPath  = join(ROOT, "config.json");
  if (!existsSync(cfgPath)) return defaults;
  try {
    const cfg = JSON.parse(readFileSync(cfgPath, "utf-8"));
    if (Array.isArray(cfg.syncItems) && cfg.syncItems.length > 0) return cfg.syncItems;
  } catch {}
  return defaults;
}

// ---- Preview what setup:run will copy (without doing it) ----
ipcMain.handle("setup:preview", (_, project: string) => {
  if (!project) return { hasProjectDir: false, items: [] };
  const projectDir = join(DATA_ROOT, "projects", project);
  const hasProjectDir = existsSync(projectDir);
  const items: { name: string; isDir: boolean }[] = [];

  if (hasProjectDir) {
    for (const name of readSyncItems()) {
      const src = join(projectDir, name);
      if (existsSync(src)) items.push({ name, isDir: statSync(src).isDirectory() });
    }
  }

  return { hasProjectDir, items };
});

// ---- Run setup: copy saved configs into a target directory ----
ipcMain.handle("setup:run", (_, { project, targetPath }: { project: string; targetPath: string }) => {
  dbg("IPC", "setup:run project =", project, "target =", targetPath);

  if (!existsSync(targetPath)) {
    return { ok: false, error: `Target path not found: ${targetPath}` };
  }

  const projectDir = join(DATA_ROOT, "projects", project);
  if (!existsSync(projectDir)) {
    return { ok: false, error: `No configs synced for "${project}" yet — run Sync first.` };
  }

  const ITEMS = readSyncItems();
  const results: { name: string; status: "copied" | "skipped" | "error"; note?: string }[] = [];

  for (const item of ITEMS) {
    const src = join(projectDir, item);
    if (!existsSync(src)) continue;

    const dest = join(targetPath, item);
    try {
      if (statSync(src).isDirectory()) {
        if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
        cpSync(src, dest, { recursive: true, force: true });
      } else {
        if (existsSync(dest)) rmSync(dest, { force: true });
        copyFileSync(src, dest);
      }
      results.push({ name: item, status: "copied" });
    } catch (e: any) {
      dbg("setup:run", "copy error", item, e.message);
      results.push({ name: item, status: "error", note: e.message });
    }
  }

  if (results.length === 0) {
    return { ok: false, error: `No config files found for project "${project}".` };
  }

  return { ok: true, results };
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
