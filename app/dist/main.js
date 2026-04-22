// src/main.ts
var import_electron3 = require("electron");
var import_path7 = require("path");
var import_fs7 = require("fs");

// src/lib/paths.ts
var import_electron = require("electron");
var import_path2 = require("path");

// src/lib/bash.ts
var import_child_process = require("child_process");
var import_fs = require("fs");
var import_path = require("path");

// src/lib/logger.ts
var DEBUG = true;
function dbg(section, ...args) {
  if (!DEBUG)
    return;
  console.log(`[${section}]`, ...args);
}

// src/lib/bash.ts
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

// src/repositories/configRepository.ts
var import_fs2 = require("fs");
var DEFAULT_SYNC_ITEMS = ["CLAUDE.md", ".claude", ".cursor", ".agent", ".gemini", ".toh"];
function readAppConfig(configPath) {
  if (!import_fs2.existsSync(configPath))
    return {};
  try {
    return JSON.parse(import_fs2.readFileSync(configPath, "utf-8"));
  } catch {
    return {};
  }
}
function writeAppConfig(configPath, cfg) {
  import_fs2.writeFileSync(configPath, JSON.stringify(cfg, null, 2) + `
`, "utf-8");
  dbg("configRepo", "wrote →", configPath);
}
function readSyncItems(configPath) {
  const cfg = readAppConfig(configPath);
  if (Array.isArray(cfg.syncItems) && cfg.syncItems.length > 0)
    return cfg.syncItems;
  return DEFAULT_SYNC_ITEMS;
}
function writeSyncItems(configPath, items) {
  const cfg = readAppConfig(configPath);
  writeAppConfig(configPath, { ...cfg, syncItems: items });
  dbg("configRepo", "syncItems saved →", items);
}
function readDataRoot(configPath, fallback) {
  const cfg = readAppConfig(configPath);
  if (cfg.dataRoot) {
    dbg("configRepo", "DATA_ROOT from config.json →", cfg.dataRoot);
    return cfg.dataRoot;
  }
  dbg("configRepo", "no dataRoot in config — using fallback →", fallback);
  return fallback;
}

// src/lib/paths.ts
var APP_DIR = import_electron.app.getAppPath();
var DIST_DIR = import_path2.join(APP_DIR, "dist");
var ROOT = import_electron.app.isPackaged ? import_path2.join(process.resourcesPath, "app") : import_path2.join(APP_DIR, "..");
var SHELL_ROOT = toShellPath(ROOT);
var BASH = findBash();
var DATA_ROOT = readDataRoot(import_path2.join(ROOT, "config.json"), ROOT);

// src/repositories/projectRepository.ts
var import_fs3 = require("fs");
var import_path3 = require("path");
function listProjects(dataRoot) {
  const confPath = import_path3.join(dataRoot, "projects.conf");
  dbg("projectRepo", "conf =", confPath, import_fs3.existsSync(confPath) ? "✅" : "❌ NOT FOUND");
  if (!import_fs3.existsSync(confPath))
    return [];
  const lines = import_fs3.readFileSync(confPath, "utf-8").split(`
`).map((l) => l.replace(/\r/, "").trim()).filter((l) => l && !l.startsWith("#"));
  dbg("projectRepo", `${lines.length} entries found`);
  return lines.map((line) => {
    const [name, ...rest] = line.split(":");
    const projectDir = import_path3.join(dataRoot, "projects", name.trim());
    const hasConfig = import_fs3.existsSync(projectDir);
    const entry = {
      name: name.trim(),
      path: rest.join(":").trim(),
      hasConfig,
      lastSync: hasConfig ? import_fs3.statSync(projectDir).mtime.toISOString() : null
    };
    dbg("projectRepo", `  ${entry.name} → ${entry.path} | hasConfig=${hasConfig}`);
    return entry;
  });
}
function saveProjects(dataRoot, entries) {
  const confPath = import_path3.join(dataRoot, "projects.conf");
  const lines = entries.filter((e) => e.name.trim() && e.path.trim()).map((e) => `${e.name.trim()}:${e.path.trim()}`);
  import_fs3.writeFileSync(confPath, lines.join(`
`) + `
`, "utf-8");
  dbg("projectRepo", "saved →", lines.length, "entries");
}

// src/ipc/projectHandlers.ts
function registerProjectHandlers(ipc, dataRoot) {
  ipc.handle("projects:list", () => {
    dbg("IPC", "projects:list");
    return listProjects(dataRoot);
  });
  ipc.handle("projects:save", (_, entries) => {
    dbg("IPC", "projects:save →", entries.length, "entries");
    saveProjects(dataRoot, entries);
    return true;
  });
}

// src/ipc/configHandlers.ts
var import_path4 = require("path");

// src/repositories/gitRepository.ts
var import_child_process2 = require("child_process");
function getGitLog(dataRoot) {
  dbg("gitRepo", "cwd =", dataRoot);
  const r = import_child_process2.spawnSync("git", ["-C", dataRoot, "log", "--oneline", "-8"], { encoding: "utf-8" });
  if (r.error) {
    dbg("gitRepo", "error →", r.error.message);
    return "";
  }
  if (r.stderr)
    dbg("gitRepo", "stderr →", r.stderr.trim());
  dbg("gitRepo", "ok →", r.stdout?.split(`
`).length, "lines");
  return r.stdout?.trim() ?? "";
}
function getRemoteUrl(dataRoot) {
  const r = import_child_process2.spawnSync("git", ["-C", dataRoot, "remote", "get-url", "origin"], { encoding: "utf-8" });
  return r.stdout?.trim() ?? "";
}
function setRemote(dataRoot, url) {
  const check = import_child_process2.spawnSync("git", ["-C", dataRoot, "remote", "get-url", "origin"], { encoding: "utf-8" });
  const cmd = check.status === 0 ? "set-url" : "add";
  const result = import_child_process2.spawnSync("git", ["-C", dataRoot, "remote", cmd, "origin", url], { encoding: "utf-8" });
  if (result.status !== 0)
    throw new Error(result.stderr?.trim() || "git remote failed");
  dbg("gitRepo", "remote set →", url);
}

// src/ipc/configHandlers.ts
function registerConfigHandlers(ipc, root, dataRoot) {
  ipc.handle("config:info", () => {
    dbg("IPC", "config:info, DATA_ROOT =", dataRoot);
    const remoteUrl = getRemoteUrl(dataRoot);
    const repoSlug = remoteUrl.replace(/^https?:\/\/github\.com\//, "").replace(/\.git$/, "").trim();
    const folderName = dataRoot.replace(/\\/g, "/").split("/").pop() ?? dataRoot;
    return {
      dataRoot,
      repoSlug: repoSlug || folderName,
      remoteUrl: remoteUrl.startsWith("https://") ? remoteUrl.replace(/\.git$/, "") : "",
      syncItems: readSyncItems(import_path4.join(root, "config.json"))
    };
  });
  ipc.handle("config:setSyncItems", (_, items) => {
    dbg("IPC", "config:setSyncItems →", items);
    writeSyncItems(import_path4.join(root, "config.json"), items);
    return true;
  });
  ipc.handle("config:setRemote", (_, url) => {
    dbg("IPC", "config:setRemote →", url);
    setRemote(dataRoot, url);
    return true;
  });
}

// src/ipc/setupHandlers.ts
var import_path6 = require("path");
var import_fs6 = require("fs");
var import_electron2 = require("electron");

// src/services/setupService.ts
var import_fs5 = require("fs");
var import_path5 = require("path");

// src/lib/fsUtils.ts
var import_fs4 = require("fs");
function copyItem(src, dest) {
  if (import_fs4.statSync(src).isDirectory()) {
    if (import_fs4.existsSync(dest))
      import_fs4.rmSync(dest, { recursive: true, force: true });
    import_fs4.cpSync(src, dest, { recursive: true, force: true });
  } else {
    if (import_fs4.existsSync(dest))
      import_fs4.rmSync(dest, { force: true });
    import_fs4.copyFileSync(src, dest);
  }
}

// src/services/setupService.ts
function previewSetup(dataRoot, project, syncItems) {
  if (!project)
    return { hasProjectDir: false, items: [] };
  const projectDir = import_path5.join(dataRoot, "projects", project);
  const hasProjectDir = import_fs5.existsSync(projectDir);
  const items = [];
  if (hasProjectDir) {
    for (const name of syncItems) {
      const src = import_path5.join(projectDir, name);
      if (import_fs5.existsSync(src))
        items.push({ name, isDir: import_fs5.statSync(src).isDirectory() });
    }
  }
  return { hasProjectDir, items };
}
function runSetup(dataRoot, project, targetPath, syncItems) {
  dbg("setupService", "project =", project, "target =", targetPath);
  if (!import_fs5.existsSync(targetPath)) {
    return { ok: false, error: `Target path not found: ${targetPath}` };
  }
  const projectDir = import_path5.join(dataRoot, "projects", project);
  if (!import_fs5.existsSync(projectDir)) {
    return { ok: false, error: `No configs synced for "${project}" yet — run Sync first.` };
  }
  const results = [];
  for (const item of syncItems) {
    const src = import_path5.join(projectDir, item);
    if (!import_fs5.existsSync(src))
      continue;
    try {
      copyItem(src, import_path5.join(targetPath, item));
      results.push({ name: item, status: "copied" });
    } catch (e) {
      dbg("setupService", "copy error", item, e.message);
      results.push({ name: item, status: "error", note: e.message });
    }
  }
  if (results.length === 0) {
    return { ok: false, error: `No config files found for project "${project}".` };
  }
  return { ok: true, results };
}

// src/ipc/setupHandlers.ts
function registerSetupHandlers(ipc, root, dataRoot, getWin) {
  ipc.handle("setup:read", () => {
    const p = import_path6.join(root, "setup.sh");
    dbg("IPC", "setup:read →", p, import_fs6.existsSync(p) ? "✅" : "❌");
    if (!import_fs6.existsSync(p))
      return null;
    return import_fs6.readFileSync(p, "utf-8");
  });
  ipc.handle("setup:preview", (_, project) => {
    return previewSetup(dataRoot, project, readSyncItems(import_path6.join(root, "config.json")));
  });
  ipc.handle("setup:run", (_, { project, targetPath }) => {
    return runSetup(dataRoot, project, targetPath, readSyncItems(import_path6.join(root, "config.json")));
  });
  ipc.handle("dialog:openDir", async () => {
    const result = await import_electron2.dialog.showOpenDialog(getWin(), {
      properties: ["openDirectory"],
      title: "Select project directory"
    });
    return result.canceled ? null : result.filePaths[0] ?? null;
  });
  ipc.handle("shell:open", (_, url) => {
    if (url.startsWith("https://"))
      import_electron2.shell.openExternal(url);
  });
}

// src/services/syncService.ts
var import_child_process3 = require("child_process");
function spawnSyncProcess(sender, appDir, root, dataRoot, project) {
  const syncScript = `${appDir}/src/sync.ts`;
  const args = [syncScript, project, dataRoot];
  dbg("syncService", "spawning bun →", syncScript, "project =", project || "(all)", "dataRoot =", dataRoot);
  return new Promise((resolve) => {
    const proc = import_child_process3.spawn("bun", ["run", ...args], {
      cwd: root,
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
      dbg("syncService", "exited with code", exitCode);
      sender.send("sync:line", { done: true, code: exitCode });
      resolve(exitCode);
    });
    proc.on("error", (err) => {
      dbg("syncService", "spawn error →", err.message);
      sender.send("sync:line", { line: `❌ spawn error: ${err.message}
`, error: true });
      sender.send("sync:line", { done: true, code: 1 });
      resolve(1);
    });
  });
}

// src/ipc/syncHandlers.ts
function registerSyncHandlers(ipc, appDir, root, dataRoot) {
  ipc.handle("sync:run", (event, project) => {
    dbg("IPC", "sync:run, project =", project || "(all)");
    return spawnSyncProcess(event.sender, appDir, root, dataRoot, project);
  });
}

// src/ipc/gitHandlers.ts
function registerGitHandlers(ipc, dataRoot) {
  ipc.handle("git:log", () => {
    dbg("IPC", "git:log");
    return getGitLog(dataRoot);
  });
}

// src/main.ts
import_electron3.app.commandLine.appendSwitch("disable-features", "AutofillServerCommunication");
var win;
function createWindow() {
  win = new import_electron3.BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 800,
    minHeight: 500,
    title: "AI Configs",
    backgroundColor: "#0d1117",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      preload: import_path7.join(DIST_DIR, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile(import_path7.join(APP_DIR, "renderer", "index.html"));
}
import_electron3.app.whenReady().then(() => {
  console.log(`
========== AI Configs Debug ==========`);
  console.log("platform  :", process.platform);
  console.log("packaged  :", import_electron3.app.isPackaged);
  console.log("APP_DIR   :", APP_DIR);
  console.log("DIST_DIR  :", DIST_DIR);
  console.log("ROOT      :", ROOT);
  console.log("SHELL_ROOT:", SHELL_ROOT);
  console.log("BASH      :", BASH);
  console.log("DATA_ROOT :", DATA_ROOT);
  console.log("bash ok   :", import_fs7.existsSync(BASH));
  console.log("preload ok:", import_fs7.existsSync(import_path7.join(DIST_DIR, "preload.js")));
  console.log("html ok   :", import_fs7.existsSync(import_path7.join(APP_DIR, "renderer", "index.html")));
  console.log("conf ok   :", import_fs7.existsSync(import_path7.join(DATA_ROOT, "projects.conf")));
  console.log(`======================================
`);
  registerProjectHandlers(import_electron3.ipcMain, DATA_ROOT);
  registerConfigHandlers(import_electron3.ipcMain, ROOT, DATA_ROOT);
  registerSetupHandlers(import_electron3.ipcMain, ROOT, DATA_ROOT, () => win);
  registerSyncHandlers(import_electron3.ipcMain, APP_DIR, ROOT, DATA_ROOT);
  registerGitHandlers(import_electron3.ipcMain, DATA_ROOT);
  createWindow();
  import_electron3.globalShortcut.register("F12", () => win?.webContents.toggleDevTools());
  import_electron3.app.on("activate", () => {
    if (import_electron3.BrowserWindow.getAllWindows().length === 0)
      createWindow();
  });
});
import_electron3.app.on("window-all-closed", () => {
  if (process.platform !== "darwin")
    import_electron3.app.quit();
});
