// src/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("api", {
  getProjects: () => import_electron.ipcRenderer.invoke("projects:list"),
  saveProjects: (entries) => import_electron.ipcRenderer.invoke("projects:save", entries),
  sync: (project) => import_electron.ipcRenderer.invoke("sync:run", project),
  onSyncLine: (cb) => {
    const handler = (_, data) => cb(data);
    import_electron.ipcRenderer.on("sync:line", handler);
    return () => import_electron.ipcRenderer.removeListener("sync:line", handler);
  },
  getGitLog: () => import_electron.ipcRenderer.invoke("git:log"),
  getConfig: () => import_electron.ipcRenderer.invoke("config:info"),
  setSyncItems: (items) => import_electron.ipcRenderer.invoke("config:setSyncItems", items),
  setRemote: (url) => import_electron.ipcRenderer.invoke("config:setRemote", url),
  readSetup: () => import_electron.ipcRenderer.invoke("setup:read"),
  previewSetup: (project) => import_electron.ipcRenderer.invoke("setup:preview", project),
  runSetup: (opts) => import_electron.ipcRenderer.invoke("setup:run", opts),
  openExternal: (url) => import_electron.ipcRenderer.invoke("shell:open", url),
  openDirDialog: () => import_electron.ipcRenderer.invoke("dialog:openDir")
});
