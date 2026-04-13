/**
 * services/setupService.ts — Deploy saved configs into a local project.
 *
 * "Setup" means copying the config snapshot that was previously synced
 * into DATA_ROOT/projects/<name>/ out to an actual project directory.
 * This is the inverse of sync: sync pulls configs IN, setup pushes them OUT.
 *
 * Two operations are exposed:
 *   previewSetup — dry-run: returns what would be copied without touching disk.
 *   runSetup     — actually performs the copy.
 *
 * Both functions are pure (no IPC, no Electron imports) so they are easy
 * to test and reuse.
 */

import { existsSync, statSync } from "fs";
import { join } from "path";
import type { SetupPreviewResult, SetupRunResult } from "../types";
import { dbg } from "../lib/logger";
import { copyItem } from "../lib/fsUtils";

/**
 * Return a preview of what runSetup would copy for a given project,
 * without writing anything to disk.
 *
 * @param dataRoot   Absolute path to the data repo root.
 * @param project    Project name (must match an entry in projects.conf).
 * @param syncItems  List of file/folder names to look for (from config.json).
 */
export function previewSetup(
  dataRoot:  string,
  project:   string,
  syncItems: string[],
): SetupPreviewResult {
  if (!project) return { hasProjectDir: false, items: [] };

  const projectDir    = join(dataRoot, "projects", project);
  const hasProjectDir = existsSync(projectDir);
  const items: { name: string; isDir: boolean }[] = [];

  if (hasProjectDir) {
    for (const name of syncItems) {
      const src = join(projectDir, name);
      // Only include items that actually exist in the snapshot folder.
      if (existsSync(src)) items.push({ name, isDir: statSync(src).isDirectory() });
    }
  }

  return { hasProjectDir, items };
}

/**
 * Copy all available config items from DATA_ROOT/projects/<project>/
 * into `targetPath` (the local project directory chosen by the user).
 *
 * Items that don't exist in the snapshot folder are silently skipped.
 * Returns ok:false early if targetPath or the project snapshot is missing.
 *
 * @param dataRoot    Absolute path to the data repo root.
 * @param project     Project name (must match a synced folder).
 * @param targetPath  Destination directory on the user's machine.
 * @param syncItems   List of file/folder names to copy.
 */
export function runSetup(
  dataRoot:   string,
  project:    string,
  targetPath: string,
  syncItems:  string[],
): SetupRunResult {
  dbg("setupService", "project =", project, "target =", targetPath);

  if (!existsSync(targetPath)) {
    return { ok: false, error: `Target path not found: ${targetPath}` };
  }

  const projectDir = join(dataRoot, "projects", project);
  if (!existsSync(projectDir)) {
    return { ok: false, error: `No configs synced for "${project}" yet — run Sync first.` };
  }

  const results: SetupRunResult["results"] = [];

  for (const item of syncItems) {
    const src = join(projectDir, item);
    if (!existsSync(src)) continue; // item not in snapshot — skip silently

    try {
      copyItem(src, join(targetPath, item));
      results!.push({ name: item, status: "copied" });
    } catch (e: any) {
      dbg("setupService", "copy error", item, e.message);
      results!.push({ name: item, status: "error", note: e.message });
    }
  }

  if (results!.length === 0) {
    return { ok: false, error: `No config files found for project "${project}".` };
  }

  return { ok: true, results };
}
