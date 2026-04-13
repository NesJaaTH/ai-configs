/**
 * lib/paths.ts — Resolved path constants for the main process.
 *
 * All other modules import from here instead of computing paths themselves.
 * This is the single source of truth for directory layout.
 *
 * Directory layout (development):
 *   ROOT/          ← repo root (ai-configs/)
 *     config.json  ← optional: { dataRoot, syncItems }
 *     app/         ← APP_DIR  (contains package.json)
 *       dist/      ← DIST_DIR (compiled main.js + preload.js)
 *       renderer/  ← index.html
 *       src/       ← TypeScript source
 *
 * DATA_ROOT defaults to ROOT but can be overridden via config.json so that
 * the private configs repo lives separately from this app repo.
 */

import { app } from "electron";
import { join } from "path";
import { findBash, toShellPath } from "./bash";
import { readDataRoot } from "../repositories/configRepository";

/** Folder containing package.json — the "app/" directory. */
export const APP_DIR = app.getAppPath();

/** Compiled output folder (main.js, preload.js live here). */
export const DIST_DIR = join(APP_DIR, "dist");

/**
 * Repo root in development; resources/app in a packaged build.
 * config.json and projects.conf are resolved relative to this.
 */
export const ROOT = app.isPackaged
  ? join(process.resourcesPath, "app")
  : join(APP_DIR, "..");

/** POSIX-style ROOT for use in shell scripts / bash commands. */
export const SHELL_ROOT = toShellPath(ROOT);

/** Path to the bash executable on the current machine. */
export const BASH = findBash();

/**
 * Root of the private data repository that holds synced project configs.
 * Defaults to ROOT if config.json does not specify a dataRoot.
 */
export const DATA_ROOT = readDataRoot(join(ROOT, "config.json"), ROOT);
