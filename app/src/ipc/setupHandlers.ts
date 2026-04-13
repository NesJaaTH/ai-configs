import { join } from "path";
import { existsSync, readFileSync } from "fs";
import { dialog, shell } from "electron";
import type { BrowserWindow, IpcMain } from "electron";
import { readSyncItems } from "../repositories/configRepository";
import { previewSetup, runSetup } from "../services/setupService";
import { dbg } from "../lib/logger";

export function registerSetupHandlers(
  ipc:      IpcMain,
  root:     string,
  dataRoot: string,
  getWin:   () => BrowserWindow,
): void {
  ipc.handle("setup:read", () => {
    const p = join(root, "setup.sh");
    dbg("IPC", "setup:read →", p, existsSync(p) ? "✅" : "❌");
    if (!existsSync(p)) return null;
    return readFileSync(p, "utf-8");
  });

  ipc.handle("setup:preview", (_, project: string) => {
    return previewSetup(dataRoot, project, readSyncItems(join(root, "config.json")));
  });

  ipc.handle("setup:run", (_, { project, targetPath }: { project: string; targetPath: string }) => {
    return runSetup(dataRoot, project, targetPath, readSyncItems(join(root, "config.json")));
  });

  ipc.handle("dialog:openDir", async () => {
    const result = await dialog.showOpenDialog(getWin(), {
      properties: ["openDirectory"],
      title:      "Select project directory",
    });
    return result.canceled ? null : (result.filePaths[0] ?? null);
  });

  ipc.handle("shell:open", (_, url: string) => {
    if (url.startsWith("https://")) shell.openExternal(url);
  });
}
