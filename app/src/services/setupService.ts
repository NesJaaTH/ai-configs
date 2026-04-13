import { existsSync, statSync } from "fs";
import { join } from "path";
import type { SetupPreviewResult, SetupRunResult } from "../types";
import { dbg } from "../lib/logger";
import { copyItem } from "../lib/fsUtils";

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
      if (existsSync(src)) items.push({ name, isDir: statSync(src).isDirectory() });
    }
  }

  return { hasProjectDir, items };
}

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
    if (!existsSync(src)) continue;
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
