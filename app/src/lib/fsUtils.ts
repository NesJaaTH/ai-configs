/**
 * lib/fsUtils.ts — File-system utility shared across the app.
 *
 * Centralises the copy logic so both setupService (deploy) and sync.ts
 * (sync) use the same behaviour: remove-then-copy prevents EPERM errors
 * that occur when overwriting read-only files inside .git folders.
 */

import { existsSync, statSync, copyFileSync, cpSync, rmSync } from "fs";

/**
 * Copy a file or directory from `src` to `dest`, replacing `dest` if it
 * already exists.
 *
 * For directories we delete the destination first to avoid EPERM errors
 * caused by read-only files (common inside .claude/ or .cursor/ folders).
 *
 * @param src   Absolute path to the source file or directory.
 * @param dest  Absolute path to the destination.
 */
export function copyItem(src: string, dest: string): void {
  if (statSync(src).isDirectory()) {
    // Remove dest first to avoid EPERM on read-only files inside
    if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
    cpSync(src, dest, { recursive: true, force: true });
  } else {
    if (existsSync(dest)) rmSync(dest, { force: true });
    copyFileSync(src, dest);
  }
}
