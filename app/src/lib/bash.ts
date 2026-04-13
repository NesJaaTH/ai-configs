import { execFileSync, spawnSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { dbg } from "./logger";

export function findBash(): string {
  dbg("findBash", "platform =", process.platform);

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

  const candidates = [
    join(process.env.ProgramFiles         ?? "C:\\Program Files",       "Git", "bin", "bash.exe"),
    join(process.env["ProgramFiles(x86)"] ?? "C:\\Program Files (x86)", "Git", "bin", "bash.exe"),
    join(process.env.LOCALAPPDATA         ?? "",                         "Programs", "Git", "bin", "bash.exe"),
  ];

  for (const c of candidates) {
    dbg("findBash", "checking →", c, existsSync(c) ? "✅" : "❌");
    if (existsSync(c)) return c;
  }

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

  dbg("findBash", "fallback → bash.exe");
  return "bash.exe";
}

export function toShellPath(p: string): string {
  if (process.platform !== "win32") return p;
  return p.replace(/\\/g, "/").replace(/^([A-Za-z]):/, (_, d) => `/${d.toLowerCase()}`);
}
