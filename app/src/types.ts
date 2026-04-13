/**
 * types.ts — Shared domain interfaces used across all layers.
 *
 * Keep this file free of any framework imports (Electron, Bun, Node).
 * Both the main process and the preload bridge import from here so that
 * the IPC contract stays in one place and both sides always agree on shapes.
 */

/** A single entry from projects.conf, enriched with runtime state. */
export interface ProjectEntry {
  /** Short identifier, e.g. "miruway-api". Used as the folder name under projects/. */
  name: string;
  /** Absolute path to the project on the local machine. */
  path: string;
  /** Whether a synced config folder already exists for this project in DATA_ROOT/projects/. */
  hasConfig: boolean;
  /** ISO timestamp of the last sync (mtime of the project config folder), or null if never synced. */
  lastSync: string | null;
}

/** Shape of config.json stored at the repo root. All fields are optional. */
export interface AppConfig {
  /** Path to the private data repo that holds synced configs (defaults to repo root). */
  dataRoot?: string;
  /** List of file/folder names to copy on sync. Falls back to DEFAULT_SYNC_ITEMS if absent. */
  syncItems?: string[];
}

/** Data returned by the config:info IPC channel — consumed by the Config page. */
export interface ConfigInfo {
  /** Absolute path to the data repo root. */
  dataRoot: string;
  /** GitHub "owner/repo" slug extracted from the remote URL, or folder name if unavailable. */
  repoSlug: string;
  /** HTTPS remote URL (without .git suffix), or empty string if not set. */
  remoteUrl: string;
  /** Active list of items to copy on sync. */
  syncItems: string[];
}

/** Result returned by setup:preview — shows what would be copied without doing it. */
export interface SetupPreviewResult {
  /** Whether the project config folder exists in DATA_ROOT/projects/. */
  hasProjectDir: boolean;
  /** Files/folders that would be copied (only those that exist in the project folder). */
  items: { name: string; isDir: boolean }[];
}

/** Result returned by setup:run after actually deploying configs. */
export interface SetupRunResult {
  /** Overall success flag. false if the target path or project folder is missing. */
  ok: boolean;
  /** Human-readable error message when ok is false. */
  error?: string;
  /** Per-item copy results (only present when ok is true). */
  results?: { name: string; status: "copied" | "skipped" | "error"; note?: string }[];
}

/**
 * A single message sent from the main process to the renderer via the
 * "sync:line" IPC channel during a sync run.
 *
 * - Normal output:  { line, error: false }
 * - Stderr output:  { line, error: true }
 * - Run finished:   { done: true, code }
 */
export interface SyncPayload {
  line?: string;
  error?: boolean;
  done?: boolean;
  code?: number;
}
