import { existsSync, readFileSync, writeFileSync } from "fs";
import type { AppConfig } from "../types";
import { dbg } from "../lib/logger";

const DEFAULT_SYNC_ITEMS = ["CLAUDE.md", ".claude", ".cursor", ".agent", ".gemini", ".toh"];

export function readAppConfig(configPath: string): AppConfig {
  if (!existsSync(configPath)) return {};
  try {
    return JSON.parse(readFileSync(configPath, "utf-8")) as AppConfig;
  } catch {
    return {};
  }
}

export function writeAppConfig(configPath: string, cfg: AppConfig): void {
  writeFileSync(configPath, JSON.stringify(cfg, null, 2) + "\n", "utf-8");
  dbg("configRepo", "wrote →", configPath);
}

export function readSyncItems(configPath: string): string[] {
  const cfg = readAppConfig(configPath);
  if (Array.isArray(cfg.syncItems) && cfg.syncItems.length > 0) return cfg.syncItems;
  return DEFAULT_SYNC_ITEMS;
}

export function writeSyncItems(configPath: string, items: string[]): void {
  const cfg = readAppConfig(configPath);
  writeAppConfig(configPath, { ...cfg, syncItems: items });
  dbg("configRepo", "syncItems saved →", items);
}

export function readDataRoot(configPath: string, fallback: string): string {
  const cfg = readAppConfig(configPath);
  if (cfg.dataRoot) {
    dbg("configRepo", "DATA_ROOT from config.json →", cfg.dataRoot);
    return cfg.dataRoot;
  }
  dbg("configRepo", "no dataRoot in config — using fallback →", fallback);
  return fallback;
}
