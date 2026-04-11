// src/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("api", {
  getProjects: () => import_electron.ipcRenderer.invoke("projects:list"),
  getGitLog: () => import_electron.ipcRenderer.invoke("git:log"),
  sync: (project) => import_electron.ipcRenderer.invoke("sync:run", project),
  onSyncLine: (cb) => {
    const handler = (_, data) => cb(data);
    import_electron.ipcRenderer.on("sync:line", handler);
    return () => import_electron.ipcRenderer.removeListener("sync:line", handler);
  }
});
