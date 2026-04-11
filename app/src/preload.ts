import { contextBridge, ipcRenderer } from "electron";

type SyncPayload = {
  line?:  string;
  error?: boolean;
  done?:  boolean;
  code?:  number;
};

contextBridge.exposeInMainWorld("api", {
  getProjects: (): Promise<any[]> =>
    ipcRenderer.invoke("projects:list"),

  getGitLog: (): Promise<string> =>
    ipcRenderer.invoke("git:log"),

  sync: (project: string): Promise<number> =>
    ipcRenderer.invoke("sync:run", project),

  onSyncLine: (cb: (data: SyncPayload) => void): (() => void) => {
    const handler = (_: unknown, data: SyncPayload) => cb(data);
    ipcRenderer.on("sync:line", handler);
    return () => ipcRenderer.removeListener("sync:line", handler);
  },
});
