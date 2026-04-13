/**
 * repositories/projectRepository.ts — Read and write projects.conf.
 *
 * projects.conf is a plain-text file in DATA_ROOT with one project per line:
 *   project-name:/absolute/path/to/project
 *
 * Lines starting with # are treated as comments and ignored.
 * Windows-style CRLF line endings are normalised to LF before parsing.
 *
 * The "projects/" sub-folder inside DATA_ROOT is where synced config
 * snapshots are stored, one sub-folder per project name.
 */

import { existsSync, readFileSync, writeFileSync, statSync } from "fs";
import { join } from "path";
import type { ProjectEntry } from "../types";
import { dbg } from "../lib/logger";

/**
 * Parse projects.conf and return every project with its runtime state.
 *
 * hasConfig is true when a snapshot folder already exists under
 * DATA_ROOT/projects/<name>/, indicating at least one successful sync.
 * lastSync is the mtime of that folder (ISO string) or null if absent.
 *
 * @param dataRoot  Absolute path to the data repo root.
 */
export function listProjects(dataRoot: string): ProjectEntry[] {
  const confPath = join(dataRoot, "projects.conf");
  dbg("projectRepo", "conf =", confPath, existsSync(confPath) ? "✅" : "❌ NOT FOUND");
  if (!existsSync(confPath)) return [];

  const lines = readFileSync(confPath, "utf-8")
    .split("\n")
    .map((l) => l.replace(/\r/, "").trim())
    .filter((l) => l && !l.startsWith("#")); // skip blank lines and comments

  dbg("projectRepo", `${lines.length} entries found`);

  return lines.map((line) => {
    // Split on the first ":" only — Windows paths contain colons (C:\...)
    // so we join the remainder back with ":".
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

/**
 * Serialise `entries` back to projects.conf, one "name:path" line each.
 * Entries with blank name or path are silently dropped.
 *
 * @param dataRoot  Absolute path to the data repo root.
 * @param entries   Updated list of project name+path pairs.
 */
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
