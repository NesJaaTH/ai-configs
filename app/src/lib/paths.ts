import { app } from "electron";
import { join } from "path";
import { findBash, toShellPath } from "./bash";
import { readDataRoot } from "../repositories/configRepository";

// app.getAppPath() → the folder containing package.json (app/)
export const APP_DIR  = app.getAppPath();
export const DIST_DIR = join(APP_DIR, "dist");
export const ROOT     = app.isPackaged
  ? join(process.resourcesPath, "app")
  : join(APP_DIR, "..");

export const SHELL_ROOT = toShellPath(ROOT);
export const BASH       = findBash();
export const DATA_ROOT  = readDataRoot(join(ROOT, "config.json"), ROOT);
