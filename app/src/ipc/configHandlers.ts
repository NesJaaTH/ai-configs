/**
 * ipc/configHandlers.ts — IPC handlers for the Config page.
 *
 * Channels:
 *   config:info          → returns ConfigInfo (data repo path, remote URL, sync items)
 *   config:setSyncItems  → persists a new syncItems list to config.json
 *   config:setRemote     → sets the git "origin" remote of the data repo
 *
 * Note: `root` is the app repo root (where config.json lives).
 *       `dataRoot` is the private data repo root (where git remote lives).
 *       These are the same path unless config.json specifies a separate dataRoot.
 */

import { join } from "path";
import type { IpcMain } from "electron";
import { readSyncItems, writeSyncItems } from "../repositories/configRepository";
import { getRemoteUrl, setRemote } from "../repositories/gitRepository";
import type { ConfigInfo } from "../types";
import { dbg } from "../lib/logger";

/**
 * Register config-related IPC handlers.
 *
 * @param ipc       Electron's ipcMain instance.
 * @param root      App repo root — config.json is read/written here.
 * @param dataRoot  Data repo root — git operations run here.
 */
export function registerConfigHandlers(
  ipc:      IpcMain,
  root:     string,
  dataRoot: string,
): void {
  // Aggregate all config info needed by the Config page in one call.
  ipc.handle("config:info", (): ConfigInfo => {
    dbg("IPC", "config:info, DATA_ROOT =", dataRoot);

    const remoteUrl = getRemoteUrl(dataRoot);

    // Convert the full HTTPS URL to a short "owner/repo" slug for display.
    const repoSlug  = remoteUrl
      .replace(/^https?:\/\/github\.com\//, "")
      .replace(/\.git$/, "")
      .trim();

    // Fallback display name when no remote is configured.
    const folderName = dataRoot.replace(/\\/g, "/").split("/").pop() ?? dataRoot;

    return {
      dataRoot,
      repoSlug:  repoSlug || folderName,
      // Only expose HTTPS URLs — SSH URLs are not clickable in the UI.
      remoteUrl: remoteUrl.startsWith("https://") ? remoteUrl.replace(/\.git$/, "") : "",
      syncItems: readSyncItems(join(root, "config.json")),
    };
  });

  // Persist the user's custom sync items list.
  ipc.handle("config:setSyncItems", (_, items: string[]) => {
    dbg("IPC", "config:setSyncItems →", items);
    writeSyncItems(join(root, "config.json"), items);
    return true;
  });

  // Update the git remote — used by the "Edit remote" field in Config page.
  ipc.handle("config:setRemote", (_, url: string) => {
    dbg("IPC", "config:setRemote →", url);
    setRemote(dataRoot, url);
    return true;
  });
}
