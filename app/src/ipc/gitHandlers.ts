/**
 * ipc/gitHandlers.ts — IPC handler for git log queries.
 *
 * Channel:
 *   git:log  → returns the last 8 commits from the data repo (one-line format)
 *
 * Used by the Projects page to display recent sync history.
 */

import type { IpcMain } from "electron";
import { getGitLog } from "../repositories/gitRepository";
import { dbg } from "../lib/logger";

/**
 * Register the git:log IPC handler.
 *
 * @param ipc       Electron's ipcMain instance.
 * @param dataRoot  DATA_ROOT — the data repo to query git history from.
 */
export function registerGitHandlers(
  ipc:      IpcMain,
  dataRoot: string,
): void {
  ipc.handle("git:log", () => {
    dbg("IPC", "git:log");
    return getGitLog(dataRoot);
  });
}
