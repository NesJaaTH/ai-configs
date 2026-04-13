/**
 * repositories/configRepository.ts — Read and write config.json.
 *
 * config.json lives at the repo root (ROOT/config.json) and stores
 * user-level settings that persist between sessions:
 *   {
 *     "dataRoot":  "/absolute/path/to/private-data-repo",
 *     "syncItems": ["CLAUDE.md", ".claude", ".cursor", ...]
 *   }
 *
 * All functions accept the full configPath so they remain pure and
 * easily testable without mocking global constants.
 */

import { existsSync, readFileSync, writeFileSync } from "fs";
import type { AppConfig } from "../types";
import { dbg } from "../lib/logger";

/**
 * Files and folders copied on every sync when the user has not customised
 * the list via the Config page.
 */
const DEFAULT_SYNC_ITEMS = ["CLAUDE.md", ".claude", ".cursor", ".agent", ".gemini", ".toh"];

/**
 * Read and parse config.json. Returns an empty object if the file does
 * not exist or cannot be parsed — callers should always handle defaults.
 */
export function readAppConfig(configPath: string): AppConfig {
  if (!existsSync(configPath)) return {};
  try {
    return JSON.parse(readFileSync(configPath, "utf-8")) as AppConfig;
  } catch {
    return {};
  }
}

/**
 * Serialise and write `cfg` to config.json (pretty-printed, LF-terminated).
 * Overwrites the entire file — always merge with readAppConfig first if you
 * only want to update a single field.
 */
export function writeAppConfig(configPath: string, cfg: AppConfig): void {
  writeFileSync(configPath, JSON.stringify(cfg, null, 2) + "\n", "utf-8");
  dbg("configRepo", "wrote →", configPath);
}

/**
 * Return the active syncItems list.
 * Falls back to DEFAULT_SYNC_ITEMS when config.json is missing or the
 * array is empty (prevents the user from accidentally clearing all items).
 */
export function readSyncItems(configPath: string): string[] {
  const cfg = readAppConfig(configPath);
  if (Array.isArray(cfg.syncItems) && cfg.syncItems.length > 0) return cfg.syncItems;
  return DEFAULT_SYNC_ITEMS;
}

/**
 * Persist a new syncItems list to config.json.
 * Merges with the existing config so other fields (e.g. dataRoot) are preserved.
 */
export function writeSyncItems(configPath: string, items: string[]): void {
  const cfg = readAppConfig(configPath);
  writeAppConfig(configPath, { ...cfg, syncItems: items });
  dbg("configRepo", "syncItems saved →", items);
}

/**
 * Resolve the DATA_ROOT from config.json.
 * If config.json is missing or has no dataRoot field, `fallback` is returned
 * (typically ROOT — the app repo itself acts as the data repo).
 */
export function readDataRoot(configPath: string, fallback: string): string {
  const cfg = readAppConfig(configPath);
  if (cfg.dataRoot) {
    dbg("configRepo", "DATA_ROOT from config.json →", cfg.dataRoot);
    return cfg.dataRoot;
  }
  dbg("configRepo", "no dataRoot in config — using fallback →", fallback);
  return fallback;
}
