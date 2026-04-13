/**
 * services/syncService.ts — Spawn the sync.ts Bun script as a child process.
 *
 * Sync is intentionally run as a separate process (not imported as a module)
 * because it is a long-running operation that streams output line by line.
 * Each stdout/stderr chunk is forwarded to the renderer via the "sync:line"
 * IPC channel so the terminal UI updates in real time.
 *
 * argv passed to sync.ts:
 *   [0] path to sync.ts
 *   [1] project name  (empty string = sync all projects)
 *   [2] DATA_ROOT     (absolute path to the private data repo)
 */

import { spawn } from "child_process";
import type { WebContents } from "electron";
import type { SyncPayload } from "../types";
import { dbg } from "../lib/logger";

/**
 * Launch sync.ts with Bun and stream its output to the renderer.
 *
 * @param sender    The renderer's WebContents — used to push "sync:line" events.
 * @param appDir    APP_DIR (the "app/" folder) — used to resolve sync.ts path.
 * @param root      ROOT — the working directory for the spawned process.
 * @param dataRoot  DATA_ROOT — passed as argv[2] to sync.ts.
 * @param project   Project name to sync, or "" to sync all projects.
 * @returns         Exit code of the sync process (0 = success).
 */
export function spawnSyncProcess(
  sender:   WebContents,
  appDir:   string,
  root:     string,
  dataRoot: string,
  project:  string,
): Promise<number> {
  const syncScript = `${appDir}/src/sync.ts`;
  const args       = [syncScript, project, dataRoot];

  dbg("syncService", "spawning bun →", syncScript, "project =", project || "(all)", "dataRoot =", dataRoot);

  return new Promise<number>((resolve) => {
    const proc = spawn("bun", ["run", ...args], {
      cwd: root,
      env: { ...process.env },
    });

    // Forward stdout lines to the renderer terminal.
    proc.stdout.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      process.stdout.write("[out] " + text);
      sender.send("sync:line", { line: text, error: false } satisfies SyncPayload);
    });

    // Forward stderr lines (shown in red in the terminal UI).
    proc.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      process.stderr.write("[err] " + text);
      sender.send("sync:line", { line: text, error: true } satisfies SyncPayload);
    });

    // Signal completion so the renderer can re-enable the Sync button.
    proc.on("close", (code) => {
      const exitCode = code ?? 1;
      dbg("syncService", "exited with code", exitCode);
      sender.send("sync:line", { done: true, code: exitCode } satisfies SyncPayload);
      resolve(exitCode);
    });

    // Handle spawn failure (e.g. bun not found on PATH).
    proc.on("error", (err) => {
      dbg("syncService", "spawn error →", err.message);
      sender.send("sync:line", { line: `❌ spawn error: ${err.message}\n`, error: true } satisfies SyncPayload);
      sender.send("sync:line", { done: true, code: 1 } satisfies SyncPayload);
      resolve(1);
    });
  });
}
