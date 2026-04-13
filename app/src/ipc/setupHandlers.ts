/**
 * ipc/setupHandlers.ts — IPC handlers for the Setup (deploy) page.
 *
 * Channels:
 *   setup:read     → returns the raw text of setup.sh (shown in the aside)
 *   setup:preview  → dry-run: returns what would be copied for a project
 *   setup:run      → actually copies configs from the snapshot to targetPath
 *   dialog:openDir → opens a native folder-picker dialog
 *   shell:open     → opens an HTTPS URL in the default browser
 *
 * `getWin` is a callback (not the window directly) because the BrowserWindow
 * is created after IPC registration, so we capture it lazily at call time.
 */

import { join } from "path";
import { existsSync, readFileSync } from "fs";
import { dialog, shell } from "electron";
import type { BrowserWindow, IpcMain } from "electron";
import { readSyncItems } from "../repositories/configRepository";
import { previewSetup, runSetup } from "../services/setupService";
import { dbg } from "../lib/logger";

/**
 * Register setup/deploy-related IPC handlers.
 *
 * @param ipc       Electron's ipcMain instance.
 * @param root      App repo root — setup.sh and config.json are resolved here.
 * @param dataRoot  Data repo root — project snapshot folders live here.
 * @param getWin    Returns the current BrowserWindow (used for the dialog parent).
 */
export function registerSetupHandlers(
  ipc:      IpcMain,
  root:     string,
  dataRoot: string,
  getWin:   () => BrowserWindow,
): void {
  // Return setup.sh contents for syntax-highlighted display in the aside panel.
  ipc.handle("setup:read", () => {
    const p = join(root, "setup.sh");
    dbg("IPC", "setup:read →", p, existsSync(p) ? "✅" : "❌");
    if (!existsSync(p)) return null;
    return readFileSync(p, "utf-8");
  });

  // Dry-run: tell the renderer which items would be copied.
  // syncItems are re-read each time so changes on the Config page take effect immediately.
  ipc.handle("setup:preview", (_, project: string) => {
    return previewSetup(dataRoot, project, readSyncItems(join(root, "config.json")));
  });

  // Perform the actual deploy: copy snapshot → targetPath.
  ipc.handle("setup:run", (_, { project, targetPath }: { project: string; targetPath: string }) => {
    return runSetup(dataRoot, project, targetPath, readSyncItems(join(root, "config.json")));
  });

  // Open a native OS folder-picker and return the selected path (or null if cancelled).
  ipc.handle("dialog:openDir", async () => {
    const result = await dialog.showOpenDialog(getWin(), {
      properties: ["openDirectory"],
      title:      "Select project directory",
    });
    return result.canceled ? null : (result.filePaths[0] ?? null);
  });

  // Open an external HTTPS URL in the default browser.
  // Non-HTTPS URLs are silently ignored as a safety measure.
  ipc.handle("shell:open", (_, url: string) => {
    if (url.startsWith("https://")) shell.openExternal(url);
  });
}
