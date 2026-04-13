import type { IpcMain } from "electron";
import { listProjects, saveProjects } from "../repositories/projectRepository";
import { dbg } from "../lib/logger";

export function registerProjectHandlers(ipc: IpcMain, dataRoot: string): void {
  ipc.handle("projects:list", () => {
    dbg("IPC", "projects:list");
    return listProjects(dataRoot);
  });

  ipc.handle("projects:save", (_, entries: { name: string; path: string }[]) => {
    dbg("IPC", "projects:save →", entries.length, "entries");
    saveProjects(dataRoot, entries);
    return true;
  });
}
