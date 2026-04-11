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
function parseProjects() {
  const confPath = import_path.join(ROOT, "projects.conf");
  dbg("parseProjects", "conf =", confPath, import_fs.existsSync(confPath) ? "✅" : "❌ NOT FOUND");
  if (!import_fs.existsSync(confPath))
    return [];
  const lines = import_fs.readFileSync(confPath, "utf-8").split(`
`).map((l) => l.replace(/\r/, "").trim()).filter((l) => l && !l.startsWith("#"));
  dbg("parseProjects", `${lines.length} entries found`);
  return lines.map((line) => {
    const [name, ...rest] = line.split(":");
    const projectDir = import_path.join(ROOT, "projects", name.trim());
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
  dbg("getGitLog", "cwd =", ROOT);
  const r = import_child_process.spawnSync("git", ["-C", ROOT, "log", "--oneline", "-8"], { encoding: "utf-8" });
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
import_electron.ipcMain.handle("git:log", () => {
  dbg("IPC", "git:log called");
  return getGitLog();
});
import_electron.ipcMain.handle("sync:run", (event, project) => {
  dbg("IPC", "sync:run called, project =", project || "(all)");
  return new Promise((resolve) => {
    const scriptArgs = project ? [project] : [];
    const cmd = BASH;
    const args = [`${SHELL_ROOT}/sync.sh`, ...scriptArgs];
    dbg("sync:run", "spawn →", cmd, args.join(" "));
    dbg("sync:run", "cwd   →", ROOT);
    const proc = import_child_process.spawn(cmd, args, {
      cwd: ROOT,
      env: { ...process.env, FORCE_COLOR: "0" }
    });
    dbg("sync:run", "pid   →", proc.pid);
    const sender = event.sender;
    proc.stdout.on("data", (data) => {
      const line = data.toString();
      process.stdout.write("[stdout] " + line);
      sender.send("sync:line", { line });
    });
    proc.stderr.on("data", (data) => {
      const line = data.toString();
      process.stderr.write("[stderr] " + line);
      sender.send("sync:line", { line, error: true });
    });
    proc.on("error", (err) => {
      dbg("sync:run", "proc error →", err.message);
      sender.send("sync:line", { line: `❌ spawn error: ${err.message}
`, error: true });
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
