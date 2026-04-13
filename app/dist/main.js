// src/main.ts
var import_electron = require("electron");
var import_path = require("path");
var import_fs = require("fs");
var import_child_process = require("child_process");
import_electron.app.commandLine.appendSwitch("disable-features", "AutofillServerCommunication");
var DEBUG = true;
function dbg(section, ...args) {
  if (!DEBUG)
    return;
  console.log(`[${section}]`, ...args);
}
function findBash() {
  dbg("findBash", "platform =", process.platform);
  if (process.platform !== "win32") {
    try {
      const p = import_child_process.execFileSync("which", ["bash"], { encoding: "utf-8" }).trim();
      dbg("findBash", "found via which →", p);
      return p;
    } catch {
      dbg("findBash", "which failed, fallback /bin/bash");
      return "/bin/bash";
    }
  }
  const candidates = [
    import_path.join(process.env.ProgramFiles ?? "C:\\Program Files", "Git", "bin", "bash.exe"),
    import_path.join(process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)", "Git", "bin", "bash.exe"),
    import_path.join(process.env.LOCALAPPDATA ?? "", "Programs", "Git", "bin", "bash.exe")
  ];
  for (const c of candidates) {
    dbg("findBash", "checking →", c, import_fs.existsSync(c) ? "✅" : "❌");
    if (import_fs.existsSync(c))
      return c;
  }
  try {
    const r = import_child_process.spawnSync("where", ["bash.exe"], { encoding: "utf-8", shell: false });
    const found = r.stdout?.trim().split(`
`)[0].trim();
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
function toShellPath(p) {
  if (process.platform !== "win32")
    return p;
  return p.replace(/\\/g, "/").replace(/^([A-Za-z]):/, (_, d) => `/${d.toLowerCase()}`);
}
var APP_DIR = import_electron.app.getAppPath();
var DIST_DIR = import_path.join(APP_DIR, "dist");
var ROOT = import_electron.app.isPackaged ? import_path.join(process.resourcesPath, "app") : import_path.join(APP_DIR, "..");
var SHELL_ROOT = toShellPath(ROOT);
var BASH = findBash();
function readDataRoot() {
  const configPath = import_path.join(ROOT, "config.json");
  if (import_fs.existsSync(configPath)) {
    try {
      const cfg = JSON.parse(import_fs.readFileSync(configPath, "utf-8"));
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
var DATA_ROOT = readDataRoot();
function parseProjects() {
  const confPath = import_path.join(DATA_ROOT, "projects.conf");
  dbg("parseProjects", "conf =", confPath, import_fs.existsSync(confPath) ? "✅" : "❌ NOT FOUND");
  if (!import_fs.existsSync(confPath))
    return [];
  const lines = import_fs.readFileSync(confPath, "utf-8").split(`
`).map((l) => l.replace(/\r/, "").trim()).filter((l) => l && !l.startsWith("#"));
  dbg("parseProjects", `${lines.length} entries found`);
  return lines.map((line) => {
    const [name, ...rest] = line.split(":");
    const projectDir = import_path.join(DATA_ROOT, "projects", name.trim());
    const hasConfig = import_fs.existsSync(projectDir);
    const entry = {
      name: name.trim(),
      path: rest.join(":").trim(),
      hasConfig,
      lastSync: hasConfig ? import_fs.statSync(projectDir).mtime.toISOString() : null
    };
    dbg("parseProjects", `  ${entry.name} → ${entry.path} | hasConfig=${hasConfig}`);
    return entry;
  });
}
function getGitLog() {
  dbg("getGitLog", "cwd =", DATA_ROOT);
  const r = import_child_process.spawnSync("git", ["-C", DATA_ROOT, "log", "--oneline", "-8"], { encoding: "utf-8" });
  if (r.error) {
    dbg("getGitLog", "error →", r.error.message);
    return "";
  }
  if (r.stderr)
    dbg("getGitLog", "stderr →", r.stderr.trim());
  dbg("getGitLog", "ok →", r.stdout?.split(`
`).length, "lines");
  return r.stdout?.trim() ?? "";
}
var win;
function createWindow() {
  dbg("createWindow", "preload =", import_path.join(DIST_DIR, "preload.js"));
  dbg("createWindow", "html    =", import_path.join(APP_DIR, "renderer", "index.html"));
  win = new import_electron.BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 800,
    minHeight: 500,
    title: "AI Configs",
    backgroundColor: "#0d1117",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      preload: import_path.join(DIST_DIR, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile(import_path.join(APP_DIR, "renderer", "index.html"));
}
import_electron.app.whenReady().then(() => {
  console.log(`
========== AI Configs Debug ==========`);
  console.log("platform  :", process.platform);
  console.log("packaged  :", import_electron.app.isPackaged);
  console.log("APP_DIR   :", APP_DIR);
  console.log("DIST_DIR  :", DIST_DIR);
  console.log("ROOT      :", ROOT);
  console.log("SHELL_ROOT:", SHELL_ROOT);
  console.log("BASH      :", BASH);
  console.log("bash ok   :", import_fs.existsSync(BASH));
  console.log("preload ok:", import_fs.existsSync(import_path.join(DIST_DIR, "preload.js")));
  console.log("html ok   :", import_fs.existsSync(import_path.join(APP_DIR, "renderer", "index.html")));
  console.log("conf ok   :", import_fs.existsSync(import_path.join(ROOT, "projects.conf")));
  console.log("sync.sh ok:", import_fs.existsSync(import_path.join(ROOT, "sync.sh")));
  console.log(`======================================
`);
  createWindow();
  import_electron.globalShortcut.register("F12", () => {
    win?.webContents.toggleDevTools();
  });
  import_electron.app.on("activate", () => {
    if (import_electron.BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});
import_electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin")
    import_electron.app.quit();
});
import_electron.ipcMain.handle("projects:list", () => {
  dbg("IPC", "projects:list called");
  return parseProjects();
});
import_electron.ipcMain.handle("projects:save", (_, entries) => {
  const confPath = import_path.join(DATA_ROOT, "projects.conf");
  const lines = entries.filter((e) => e.name.trim() && e.path.trim()).map((e) => `${e.name.trim()}:${e.path.trim()}`);
  import_fs.writeFileSync(confPath, lines.join(`
`) + `
`, "utf-8");
  dbg("IPC", "projects:save → wrote", lines.length, "entries");
  return true;
});
import_electron.ipcMain.handle("git:log", () => {
  dbg("IPC", "git:log called");
  return getGitLog();
});
import_electron.ipcMain.handle("config:info", () => {
  dbg("IPC", "config:info called, DATA_ROOT =", DATA_ROOT);
  const r = import_child_process.spawnSync("git", ["-C", DATA_ROOT, "remote", "get-url", "origin"], { encoding: "utf-8" });
  const remoteUrl = r.stdout?.trim() ?? "";
  const repoSlug = remoteUrl.replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "").trim();
  const folderName = DATA_ROOT.replace(/\\/g, "/").split("/").pop() ?? DATA_ROOT;
  const DEFAULT_ITEMS = ["CLAUDE.md", ".claude", ".cursor", ".agent", ".gemini", ".toh"];
  let syncItems = DEFAULT_ITEMS;
  const cfgPath = import_path.join(ROOT, "config.json");
  if (import_fs.existsSync(cfgPath)) {
    try {
      const cfg = JSON.parse(import_fs.readFileSync(cfgPath, "utf-8"));
      if (Array.isArray(cfg.syncItems) && cfg.syncItems.length > 0)
        syncItems = cfg.syncItems;
    } catch {}
  }
  return {
    dataRoot: DATA_ROOT,
    repoSlug: repoSlug || folderName,
    remoteUrl: remoteUrl.startsWith("https://") ? remoteUrl.replace(/\.git$/, "") : "",
    syncItems
  };
});
import_electron.ipcMain.handle("config:setSyncItems", (_, items) => {
  const cfgPath = import_path.join(ROOT, "config.json");
  let cfg = {};
  if (import_fs.existsSync(cfgPath)) {
    try {
      cfg = JSON.parse(import_fs.readFileSync(cfgPath, "utf-8"));
    } catch {}
  }
  cfg.syncItems = items;
  import_fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2) + `
`, "utf-8");
  dbg("IPC", "config:setSyncItems →", items);
  return true;
});
import_electron.ipcMain.handle("config:setRemote", (_, url) => {
  dbg("IPC", "config:setRemote →", url);
  const check = import_child_process.spawnSync("git", ["-C", DATA_ROOT, "remote", "get-url", "origin"], { encoding: "utf-8" });
  const cmd = check.status === 0 ? "set-url" : "add";
  const result = import_child_process.spawnSync("git", ["-C", DATA_ROOT, "remote", cmd, "origin", url], { encoding: "utf-8" });
  if (result.status !== 0)
    throw new Error(result.stderr?.trim() || "git remote failed");
  return true;
});
import_electron.ipcMain.handle("shell:open", (_, url) => {
  if (url.startsWith("https://"))
    import_electron.shell.openExternal(url);
});
import_electron.ipcMain.handle("setup:read", () => {
  const p = import_path.join(ROOT, "setup.sh");
  dbg("IPC", "setup:read →", p, import_fs.existsSync(p) ? "✅" : "❌");
  if (!import_fs.existsSync(p))
    return null;
  return import_fs.readFileSync(p, "utf-8");
});
import_electron.ipcMain.handle("dialog:openDir", async () => {
  const result = await import_electron.dialog.showOpenDialog(win, {
    properties: ["openDirectory"],
    title: "Select project directory"
  });
  return result.canceled ? null : result.filePaths[0] ?? null;
});
function readSyncItems() {
  const defaults = ["CLAUDE.md", ".claude", ".cursor", ".agent", ".gemini", ".toh"];
  const cfgPath = import_path.join(ROOT, "config.json");
  if (!import_fs.existsSync(cfgPath))
    return defaults;
  try {
    const cfg = JSON.parse(import_fs.readFileSync(cfgPath, "utf-8"));
    if (Array.isArray(cfg.syncItems) && cfg.syncItems.length > 0)
      return cfg.syncItems;
  } catch {}
  return defaults;
}
import_electron.ipcMain.handle("setup:preview", (_, project) => {
  if (!project)
    return { hasProjectDir: false, items: [] };
  const projectDir = import_path.join(DATA_ROOT, "projects", project);
  const hasProjectDir = import_fs.existsSync(projectDir);
  const items = [];
  if (hasProjectDir) {
    for (const name of readSyncItems()) {
      const src = import_path.join(projectDir, name);
      if (import_fs.existsSync(src))
        items.push({ name, isDir: import_fs.statSync(src).isDirectory() });
    }
  }
  return { hasProjectDir, items };
});
import_electron.ipcMain.handle("setup:run", (_, { project, targetPath }) => {
  dbg("IPC", "setup:run project =", project, "target =", targetPath);
  if (!import_fs.existsSync(targetPath)) {
    return { ok: false, error: `Target path not found: ${targetPath}` };
  }
  const projectDir = import_path.join(DATA_ROOT, "projects", project);
  if (!import_fs.existsSync(projectDir)) {
    return { ok: false, error: `No configs synced for "${project}" yet — run Sync first.` };
  }
  const ITEMS = readSyncItems();
  const results = [];
  for (const item of ITEMS) {
    const src = import_path.join(projectDir, item);
    if (!import_fs.existsSync(src))
      continue;
    const dest = import_path.join(targetPath, item);
    try {
      if (import_fs.statSync(src).isDirectory()) {
        if (import_fs.existsSync(dest))
          rmSync(dest, { recursive: true, force: true });
        cpSync(src, dest, { recursive: true, force: true });
      } else {
        if (import_fs.existsSync(dest))
          rmSync(dest, { force: true });
        copyFileSync(src, dest);
      }
      results.push({ name: item, status: "copied" });
    } catch (e) {
      dbg("setup:run", "copy error", item, e.message);
      results.push({ name: item, status: "error", note: e.message });
    }
  }
  if (results.length === 0) {
    return { ok: false, error: `No config files found for project "${project}".` };
  }
  return { ok: true, results };
});
import_electron.ipcMain.handle("sync:run", (event, project) => {
  dbg("IPC", "sync:run called, project =", project || "(all)");
  const sender = event.sender;
  const syncScript = import_path.join(APP_DIR, "src", "sync.ts");
  const args = [syncScript, project, DATA_ROOT];
  dbg("IPC", "spawning bun run", syncScript, "project =", project || "(all)", "dataRoot =", DATA_ROOT);
  return new Promise((resolve) => {
    const proc = import_child_process.spawn("bun", ["run", ...args], {
      cwd: ROOT,
      env: { ...process.env }
    });
    proc.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      process.stdout.write("[out] " + text);
      sender.send("sync:line", { line: text, error: false });
    });
    proc.stderr.on("data", (chunk) => {
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
      sender.send("sync:line", { line: `❌ spawn error: ${err.message}
`, error: true });
      sender.send("sync:line", { done: true, code: 1 });
      resolve(1);
    });
  });
});
