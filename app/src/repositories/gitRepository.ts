import { spawnSync } from "child_process";
import { dbg } from "../lib/logger";

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

export function getRemoteUrl(dataRoot: string): string {
  const r = spawnSync(
    "git", ["-C", dataRoot, "remote", "get-url", "origin"],
    { encoding: "utf-8" },
  );
  return r.stdout?.trim() ?? "";
}

export function setRemote(dataRoot: string, url: string): void {
  const check  = spawnSync("git", ["-C", dataRoot, "remote", "get-url", "origin"], { encoding: "utf-8" });
  const cmd    = check.status === 0 ? "set-url" : "add";
  const result = spawnSync("git", ["-C", dataRoot, "remote", cmd, "origin", url], { encoding: "utf-8" });
  if (result.status !== 0) throw new Error(result.stderr?.trim() || "git remote failed");
  dbg("gitRepo", "remote set →", url);
}
