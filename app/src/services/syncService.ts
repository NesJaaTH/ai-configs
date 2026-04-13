import { spawn } from "child_process";
import type { WebContents } from "electron";
import type { SyncPayload } from "../types";
import { dbg } from "../lib/logger";

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

    proc.stdout.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      process.stdout.write("[out] " + text);
      sender.send("sync:line", { line: text, error: false } satisfies SyncPayload);
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      const text = chunk.toString();
      process.stderr.write("[err] " + text);
      sender.send("sync:line", { line: text, error: true } satisfies SyncPayload);
    });

    proc.on("close", (code) => {
      const exitCode = code ?? 1;
      dbg("syncService", "exited with code", exitCode);
      sender.send("sync:line", { done: true, code: exitCode } satisfies SyncPayload);
      resolve(exitCode);
    });

    proc.on("error", (err) => {
      dbg("syncService", "spawn error →", err.message);
      sender.send("sync:line", { line: `❌ spawn error: ${err.message}\n`, error: true } satisfies SyncPayload);
      sender.send("sync:line", { done: true, code: 1 } satisfies SyncPayload);
      resolve(1);
    });
  });
}
