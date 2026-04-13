import { join } from "path";
import type { IpcMain } from "electron";
import { readSyncItems, writeSyncItems } from "../repositories/configRepository";
import { getRemoteUrl, setRemote } from "../repositories/gitRepository";
import type { ConfigInfo } from "../types";
import { dbg } from "../lib/logger";

export function registerConfigHandlers(
  ipc:      IpcMain,
  root:     string,
  dataRoot: string,
): void {
  ipc.handle("config:info", (): ConfigInfo => {
    dbg("IPC", "config:info, DATA_ROOT =", dataRoot);

    const remoteUrl = getRemoteUrl(dataRoot);
    const repoSlug  = remoteUrl
      .replace(/^https?:\/\/github\.com\//, "")
      .replace(/\.git$/, "")
      .trim();
    const folderName = dataRoot.replace(/\\/g, "/").split("/").pop() ?? dataRoot;

    return {
      dataRoot,
      repoSlug:  repoSlug || folderName,
      remoteUrl: remoteUrl.startsWith("https://") ? remoteUrl.replace(/\.git$/, "") : "",
      syncItems: readSyncItems(join(root, "config.json")),
    };
  });

  ipc.handle("config:setSyncItems", (_, items: string[]) => {
    dbg("IPC", "config:setSyncItems →", items);
    writeSyncItems(join(root, "config.json"), items);
    return true;
  });

  ipc.handle("config:setRemote", (_, url: string) => {
    dbg("IPC", "config:setRemote →", url);
    setRemote(dataRoot, url);
    return true;
  });
}
