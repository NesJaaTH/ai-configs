/**
 * lib/logger.ts — Lightweight debug logger.
 *
 * Set DEBUG = false to silence all [section] logs in production.
 * Every log line is prefixed with the caller's section name so you can
 * quickly grep for a specific subsystem: e.g. grep "[projectRepo]".
 */

const DEBUG = true;

/**
 * Print a debug log line.
 * @param section  Label shown in brackets, e.g. "projectRepo" or "IPC".
 * @param args     Any additional values — printed just like console.log.
 */
export function dbg(section: string, ...args: unknown[]): void {
  if (!DEBUG) return;
  console.log(`[${section}]`, ...args);
}
