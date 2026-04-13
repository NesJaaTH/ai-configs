/**
 * ipc/projectHandlers.ts — IPC handlers for project list management.
 *
 * Channels:
 *   projects:list  → reads projects.conf and returns ProjectEntry[]
 *   projects:save  → writes an updated list back to projects.conf
 *
 * Both the Projects page (display) and the Config page (edit) call these.
 */

import type { IpcMain } from "electron";
import { listProjects, saveProjects } from "../repositories/projectRepository";
import { dbg } from "../lib/logger";

/**
 * Register project-related IPC handlers.
 *
 * @param ipc       Electron's ipcMain instance.
 * @param dataRoot  Absolute path to the data repo (where projects.conf lives).
 */
export function registerProjectHandlers(ipc: IpcMain, dataRoot: string): void {
  // Return the full project list with runtime state (hasConfig, lastSync).
  ipc.handle("projects:list", () => {
    dbg("IPC", "projects:list");
    return listProjects(dataRoot);
  });

  // Persist an edited project list. The renderer sends only name+path;
  // hasConfig and lastSync are re-computed on the next projects:list call.
  ipc.handle("projects:save", (_, entries: { name: string; path: string }[]) => {
    dbg("IPC", "projects:save →", entries.length, "entries");
    saveProjects(dataRoot, entries);
    return true;
  });
}
