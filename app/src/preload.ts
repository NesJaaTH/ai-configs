/**
 * preload.ts — Secure IPC bridge between the main process and the renderer.
 *
 * Electron's contextIsolation prevents the renderer from accessing Node/Electron
 * APIs directly. This script runs in a privileged context and uses contextBridge
 * to expose a minimal, typed API surface under window.api.
 *
 * Rules:
 *   - Only expose what the renderer actually needs.
 *   - Never expose ipcRenderer itself — that would bypass security entirely.
 *   - All channel names here must have a matching ipc.handle() in main.ts.
 *
 * The shared types imported from ./types are bundled into preload.js at build
 * time, so the renderer gets full type safety without importing Node modules.
 */

import { contextBridge, ipcRenderer } from "electron";
import type {
  ProjectEntry,
  ConfigInfo,
  SetupPreviewResult,
  SetupRunResult,
  SyncPayload,
} from "./types";

contextBridge.exposeInMainWorld("api", {

  // ---- Projects ----

  /** Fetch the full project list (parsed from projects.conf + runtime state). */
  getProjects: (): Promise<ProjectEntry[]> =>
    ipcRenderer.invoke("projects:list"),

  /** Persist an edited project list back to projects.conf. */
  saveProjects: (entries: { name: string; path: string }[]): Promise<boolean> =>
    ipcRenderer.invoke("projects:save", entries),

  // ---- Sync ----

  /**
   * Trigger a sync run for a single project (or all projects if `project` is "").
   * Returns the exit code of the sync process.
   * Use onSyncLine to stream progress output while the sync is running.
   */
  sync: (project: string): Promise<number> =>
    ipcRenderer.invoke("sync:run", project),

  /**
   * Subscribe to sync output lines streamed from the main process.
   * Returns an unsubscribe function — call it when the component unmounts
   * or the sync is complete to avoid memory leaks.
   */
  onSyncLine: (cb: (data: SyncPayload) => void): (() => void) => {
    const handler = (_: unknown, data: SyncPayload) => cb(data);
    ipcRenderer.on("sync:line", handler);
    return () => ipcRenderer.removeListener("sync:line", handler);
  },

  // ---- Git ----

  /** Return the last 8 commits from the data repo (one-line format). */
  getGitLog: (): Promise<string> =>
    ipcRenderer.invoke("git:log"),

  // ---- Config ----

  /** Return all config values needed by the Config page in one round-trip. */
  getConfig: (): Promise<ConfigInfo> =>
    ipcRenderer.invoke("config:info"),

  /** Persist a new syncItems list to config.json. */
  setSyncItems: (items: string[]): Promise<boolean> =>
    ipcRenderer.invoke("config:setSyncItems", items),

  /** Update the git "origin" remote URL of the data repo. */
  setRemote: (url: string): Promise<boolean> =>
    ipcRenderer.invoke("config:setRemote", url),

  // ---- Setup / Deploy ----

  /** Return the raw text of setup.sh for display in the Setup aside panel. */
  readSetup: (): Promise<string | null> =>
    ipcRenderer.invoke("setup:read"),

  /**
   * Dry-run: return which items would be copied for a project without
   * touching the filesystem. Used to render the preview list in the UI.
   */
  previewSetup: (project: string): Promise<SetupPreviewResult> =>
    ipcRenderer.invoke("setup:preview", project),

  /** Copy saved configs from the data repo snapshot into `targetPath`. */
  runSetup: (opts: { project: string; targetPath: string }): Promise<SetupRunResult> =>
    ipcRenderer.invoke("setup:run", opts),

  // ---- Shell / Dialog ----

  /** Open an HTTPS URL in the user's default browser. */
  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke("shell:open", url),

  /** Show a native OS folder-picker dialog. Returns the selected path or null. */
  openDirDialog: (): Promise<string | null> =>
    ipcRenderer.invoke("dialog:openDir"),
});
