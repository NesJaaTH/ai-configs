import { app, BrowserWindow, ipcMain, globalShortcut } from "electron";

app.commandLine.appendSwitch("disable-features", "AutofillServerCommunication");

import { join } from "path";
import { existsSync } from "fs";
import { APP_DIR, DIST_DIR, ROOT, SHELL_ROOT, BASH, DATA_ROOT } from "./lib/paths";
import { registerProjectHandlers } from "./ipc/projectHandlers";
import { registerConfigHandlers }  from "./ipc/configHandlers";
import { registerSetupHandlers }   from "./ipc/setupHandlers";
import { registerSyncHandlers }    from "./ipc/syncHandlers";

// ---- Window ----
let win: BrowserWindow;

function createWindow(): void {
  win = new BrowserWindow({
    width:       1100,
    height:      700,
    minWidth:    800,
    minHeight:   500,
    title:       "AI Configs",
    backgroundColor: "#0d1117",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      preload:          join(DIST_DIR, "preload.js"),
      contextIsolation: true,
      nodeIntegration:  false,
    },
  });

  win.loadFile(join(APP_DIR, "renderer", "index.html"));
}

// ---- App lifecycle ----
app.whenReady().then(() => {
  console.log("\n========== AI Configs Debug ==========");
  console.log("platform  :", process.platform);
  console.log("packaged  :", app.isPackaged);
  console.log("APP_DIR   :", APP_DIR);
  console.log("DIST_DIR  :", DIST_DIR);
  console.log("ROOT      :", ROOT);
  console.log("SHELL_ROOT:", SHELL_ROOT);
  console.log("BASH      :", BASH);
  console.log("DATA_ROOT :", DATA_ROOT);
  console.log("bash ok   :", existsSync(BASH));
  console.log("preload ok:", existsSync(join(DIST_DIR, "preload.js")));
  console.log("html ok   :", existsSync(join(APP_DIR, "renderer", "index.html")));
  console.log("conf ok   :", existsSync(join(DATA_ROOT, "projects.conf")));
  console.log("======================================\n");

  // Register IPC handlers
  registerProjectHandlers(ipcMain, DATA_ROOT);
  registerConfigHandlers(ipcMain, ROOT, DATA_ROOT);
  registerSetupHandlers(ipcMain, ROOT, DATA_ROOT, () => win);
  registerSyncHandlers(ipcMain, APP_DIR, ROOT, DATA_ROOT);

  createWindow();

  globalShortcut.register("F12", () => win?.webContents.toggleDevTools());

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
