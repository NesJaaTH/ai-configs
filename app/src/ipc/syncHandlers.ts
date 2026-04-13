import type { IpcMain } from "electron";
import { spawnSyncProcess } from "../services/syncService";
import { dbg } from "../lib/logger";

export function registerSyncHandlers(
  ipc:      IpcMain,
  appDir:   string,
  root:     string,
  dataRoot: string,
): void {
  ipc.handle("sync:run", (event, project: string) => {
    dbg("IPC", "sync:run, project =", project || "(all)");
    return spawnSyncProcess(event.sender, appDir, root, dataRoot, project);
  });
}
