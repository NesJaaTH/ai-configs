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

  getConfig: (): Promise<{ dataRoot: string; repoSlug: string; remoteUrl: string; syncItems: string[] }> =>
    ipcRenderer.invoke("config:info"),

  setSyncItems: (items: string[]): Promise<boolean> =>
    ipcRenderer.invoke("config:setSyncItems", items),

  setRemote: (url: string): Promise<boolean> =>
    ipcRenderer.invoke("config:setRemote", url),

  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke("shell:open", url),

  readSetup: (): Promise<string | null> =>
    ipcRenderer.invoke("setup:read"),

  openDirDialog: (): Promise<string | null> =>
    ipcRenderer.invoke("dialog:openDir"),

  previewSetup: (project: string): Promise<{ hasProjectDir: boolean; items: { name: string; isDir: boolean; fromBase?: boolean }[] }> =>
    ipcRenderer.invoke("setup:preview", project),

  runSetup: (opts: { project: string; targetPath: string }): Promise<{ ok: boolean; error?: string; results?: { name: string; status: string; note?: string }[] }> =>
    ipcRenderer.invoke("setup:run", opts),
});
