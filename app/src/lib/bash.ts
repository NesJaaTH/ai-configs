/**
 * lib/bash.ts — Utilities for locating bash and converting paths.
 *
 * On Windows, Git for Windows ships its own bash.exe. We search the
 * standard install locations before falling back to PATH resolution.
 * On macOS/Linux the system bash is found via `which`.
 */

import { execFileSync, spawnSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { dbg } from "./logger";

/**
 * Locate a usable bash executable for the current platform.
 * Returns the full path, e.g. "C:/Program Files/Git/bin/bash.exe".
 */
export function findBash(): string {
  dbg("findBash", "platform =", process.platform);

  // On Unix-like systems, ask the shell directly.
  if (process.platform !== "win32") {
    try {
      const p = execFileSync("which", ["bash"], { encoding: "utf-8" }).trim();
      dbg("findBash", "found via which →", p);
      return p;
    } catch {
      dbg("findBash", "which failed, fallback /bin/bash");
      return "/bin/bash";
    }
  }

  // On Windows, check the three most common Git for Windows install paths.
  const candidates = [
    join(process.env.ProgramFiles         ?? "C:\\Program Files",       "Git", "bin", "bash.exe"),
    join(process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)", "Git", "bin", "bash.exe"),
    join(process.env.LOCALAPPDATA         ?? "",                         "Programs", "Git", "bin", "bash.exe"),
  ];

  for (const c of candidates) {
    dbg("findBash", "checking →", c, existsSync(c) ? "✅" : "❌");
    if (existsSync(c)) return c;
  }

  // Last resort: ask `where` (Windows equivalent of `which`).
  try {
    const r = spawnSync("where", ["bash.exe"], { encoding: "utf-8", shell: false });
    const found = r.stdout?.trim().split("\n")[0].trim();
    if (found) {
      dbg("findBash", "found via where →", found);
      return found;
    }
  } catch (e) {
    dbg("findBash", "where failed →", e);
  }

  // If nothing works, hope that bash.exe is somewhere on PATH.
  dbg("findBash", "fallback → bash.exe");
  return "bash.exe";
}

/**
 * Convert a Windows absolute path to a POSIX-style path understood by
 * Git bash, e.g. "C:\Users\foo" → "/c/Users/foo".
 * On non-Windows platforms the path is returned unchanged.
 */
export function toShellPath(p: string): string {
  if (process.platform !== "win32") return p;
  return p.replace(/\\/g, "/").replace(/^([A-Za-z]):/, (_, d) => `/${d.toLowerCase()}`);
}
