import { existsSync, readFileSync, writeFileSync, statSync } from "fs";
import { join } from "path";
import type { ProjectEntry } from "../types";
import { dbg } from "../lib/logger";

export function listProjects(dataRoot: string): ProjectEntry[] {
  const confPath = join(dataRoot, "projects.conf");
  dbg("projectRepo", "conf =", confPath, existsSync(confPath) ? "✅" : "❌ NOT FOUND");
  if (!existsSync(confPath)) return [];

  const lines = readFileSync(confPath, "utf-8")
    .split("\n")
    .map((l) => l.replace(/\r/, "").trim())
    .filter((l) => l && !l.startsWith("#"));

  dbg("projectRepo", `${lines.length} entries found`);

  return lines.map((line) => {
    const [name, ...rest] = line.split(":");
    const projectDir = join(dataRoot, "projects", name.trim());
    const hasConfig  = existsSync(projectDir);
    const entry: ProjectEntry = {
      name:     name.trim(),
      path:     rest.join(":").trim(),
      hasConfig,
      lastSync: hasConfig ? statSync(projectDir).mtime.toISOString() : null,
    };
    dbg("projectRepo", `  ${entry.name} → ${entry.path} | hasConfig=${hasConfig}`);
    return entry;
  });
}

export function saveProjects(
  dataRoot: string,
  entries:  { name: string; path: string }[],
): void {
  const confPath = join(dataRoot, "projects.conf");
  const lines    = entries
    .filter((e) => e.name.trim() && e.path.trim())
    .map((e) => `${e.name.trim()}:${e.path.trim()}`);
  writeFileSync(confPath, lines.join("\n") + "\n", "utf-8");
  dbg("projectRepo", "saved →", lines.length, "entries");
}
