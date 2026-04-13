const DEBUG = true;

export function dbg(section: string, ...args: unknown[]): void {
  if (!DEBUG) return;
  console.log(`[${section}]`, ...args);
}
