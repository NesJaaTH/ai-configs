import { contextBridge, ipcRenderer } from "electron";
import type {
  ProjectEntry,
  ConfigInfo,
  SetupPreviewResult,
  SetupRunResult,
  SyncPayload,
} from "./types";

contextBridge.exposeInMainWorld("api", {
  // Projects
  getProjects: (): Promise<ProjectEntry[]> =>
    ipcRenderer.invoke("projects:list"),

  saveProjects: (entries: { name: string; path: string }[]): Promise<boolean> =>
    ipcRenderer.invoke("projects:save", entries),

  // Sync
  sync: (project: string): Promise<number> =>
    ipcRenderer.invoke("sync:run", project),

  onSyncLine: (cb: (data: SyncPayload) => void): (() => void) => {
    const handler = (_: unknown, data: SyncPayload) => cb(data);
    ipcRenderer.on("sync:line", handler);
    return () => ipcRenderer.removeListener("sync:line", handler);
  },

  // Git
  getGitLog: (): Promise<string> =>
    ipcRenderer.invoke("git:log"),

  // Config
  getConfig: (): Promise<ConfigInfo> =>
    ipcRenderer.invoke("config:info"),

  setSyncItems: (items: string[]): Promise<boolean> =>
    ipcRenderer.invoke("config:setSyncItems", items),

  setRemote: (url: string): Promise<boolean> =>
    ipcRenderer.invoke("config:setRemote", url),

  // Setup / deploy
  readSetup: (): Promise<string | null> =>
    ipcRenderer.invoke("setup:read"),

  previewSetup: (project: string): Promise<SetupPreviewResult> =>
    ipcRenderer.invoke("setup:preview", project),

  runSetup: (opts: { project: string; targetPath: string }): Promise<SetupRunResult> =>
    ipcRenderer.invoke("setup:run", opts),

  // Shell / dialog
  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke("shell:open", url),

  openDirDialog: (): Promise<string | null> =>
    ipcRenderer.invoke("dialog:openDir"),
});
