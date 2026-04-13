// ---- Shared domain types ----

export interface ProjectEntry {
  name:      string;
  path:      string;
  hasConfig: boolean;
  lastSync:  string | null;
}

export interface AppConfig {
  dataRoot?:  string;
  syncItems?: string[];
}

export interface ConfigInfo {
  dataRoot:  string;
  repoSlug:  string;
  remoteUrl: string;
  syncItems: string[];
}

export interface SetupPreviewResult {
  hasProjectDir: boolean;
  items:         { name: string; isDir: boolean }[];
}

export interface SetupRunResult {
  ok:       boolean;
  error?:   string;
  results?: { name: string; status: "copied" | "skipped" | "error"; note?: string }[];
}

export interface SyncPayload {
  line?:  string;
  error?: boolean;
  done?:  boolean;
  code?:  number;
}
