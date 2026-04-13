/**
 * ipc/syncHandlers.ts — IPC handler for triggering a project sync.
 *
 * Channel:
 *   sync:run  → spawns sync.ts as a Bun child process and streams its
 *               output back to the renderer via "sync:line" events.
 *
 * The actual process management lives in syncService.ts; this handler
 * is just the thin IPC entry point that unpacks arguments and delegates.
 */

import type { IpcMain } from "electron";
import { spawnSyncProcess } from "../services/syncService";
import { dbg } from "../lib/logger";

/**
 * Register the sync:run IPC handler.
 *
 * @param ipc       Electron's ipcMain instance.
 * @param appDir    APP_DIR — used to resolve the sync.ts script path.
 * @param root      ROOT — working directory for the child process.
 * @param dataRoot  DATA_ROOT — passed to sync.ts so it knows where to write snapshots.
 */
export function registerSyncHandlers(
  ipc:      IpcMain,
  appDir:   string,
  root:     string,
  dataRoot: string,
): void {
  // project is "" when the user clicks "Sync All"; otherwise a single project name.
  ipc.handle("sync:run", (event, project: string) => {
    dbg("IPC", "sync:run, project =", project || "(all)");
    return spawnSyncProcess(event.sender, appDir, root, dataRoot, project);
  });
}
