import { existsSync, statSync, copyFileSync, cpSync, rmSync } from "fs";

/** Copy a file or directory, replacing the destination if it exists. */
export function copyItem(src: string, dest: string): void {
  if (statSync(src).isDirectory()) {
    // Remove first to avoid EPERM on read-only files inside
    if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
    cpSync(src, dest, { recursive: true, force: true });
  } else {
    if (existsSync(dest)) rmSync(dest, { force: true });
    copyFileSync(src, dest);
  }
}
