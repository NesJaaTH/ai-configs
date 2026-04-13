/**
 * repositories/gitRepository.ts — Thin wrappers around git CLI operations.
 *
 * All commands are run synchronously with spawnSync (no async needed here
 * because these are fast metadata reads/writes, not long-running processes).
 * The "-C <dir>" flag runs git in the specified directory without needing
 * to change the process working directory.
 */

import { spawnSync } from "child_process";
import { dbg } from "../lib/logger";

/**
 * Return the last 8 commits of the data repo as a single "oneline" string.
 * Used by the Projects page to show recent sync history.
 * Returns an empty string if git is unavailable or the repo has no commits.
 *
 * @param dataRoot  Absolute path to the data repo.
 */
export function getGitLog(dataRoot: string): string {
  dbg("gitRepo", "cwd =", dataRoot);
  const r = spawnSync("git", ["-C", dataRoot, "log", "--oneline", "-8"], { encoding: "utf-8" });
  if (r.error) {
    dbg("gitRepo", "error →", r.error.message);
    return "";
  }
  if (r.stderr) dbg("gitRepo", "stderr →", r.stderr.trim());
  dbg("gitRepo", "ok →", r.stdout?.split("\n").length, "lines");
  return r.stdout?.trim() ?? "";
}

/**
 * Return the "origin" remote URL of the data repo.
 * Returns an empty string if no remote is configured.
 *
 * @param dataRoot  Absolute path to the data repo.
 */
export function getRemoteUrl(dataRoot: string): string {
  const r = spawnSync(
    "git", ["-C", dataRoot, "remote", "get-url", "origin"],
    { encoding: "utf-8" },
  );
  return r.stdout?.trim() ?? "";
}

/**
 * Set (or add) the "origin" remote URL for the data repo.
 * Detects whether "origin" already exists and uses "set-url" or "add"
 * accordingly, so this is safe to call regardless of current state.
 *
 * @param dataRoot  Absolute path to the data repo.
 * @param url       New remote URL (HTTPS or SSH).
 * @throws          Error if the git command exits with a non-zero status.
 */
export function setRemote(dataRoot: string, url: string): void {
  // Check if "origin" already exists to decide between set-url and add.
  const check  = spawnSync("git", ["-C", dataRoot, "remote", "get-url", "origin"], { encoding: "utf-8" });
  const cmd    = check.status === 0 ? "set-url" : "add";
  const result = spawnSync("git", ["-C", dataRoot, "remote", cmd, "origin", url], { encoding: "utf-8" });
  if (result.status !== 0) throw new Error(result.stderr?.trim() || "git remote failed");
  dbg("gitRepo", "remote set →", url);
}
