#!/usr/bin/env bun
/**
 * sync.ts — Standalone Bun script that copies AI config files from local
 * project directories into the data repo for versioning.
 *
 * This script is intentionally separate from the Electron app so it can
 * also be run manually from the terminal:
 *   bun run app/src/sync.ts [project-name] [data-root]
 *
 * argv:
 *   [2]  project name — sync only this project (omit to sync all)
 *   [3]  DATA_ROOT    — absolute path to the data repo (defaults to ROOT)
 *
 * Flow for each project:
 *   1. Check that the project path exists on disk.
 *   2. Create DATA_ROOT/projects/<name>/ if it doesn't exist.
 *   3. Copy each item from SYNC_ITEMS that exists in the project directory.
 *   4. After all projects are processed, commit and push via gh CLI.
 *
 * Shared modules (configRepository, projectRepository, fsUtils) are imported
 * directly — Bun resolves TypeScript imports natively without a build step.
 */

import { $ } from "bun";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import { listProjects }  from "./repositories/projectRepository";
import { readSyncItems } from "./repositories/configRepository";
import { copyItem }      from "./lib/fsUtils";

// ROOT = ai-configs/ repo root (two levels up from app/src/)
const ROOT      = join(import.meta.dir, "..", "..");
const project   = process.argv[2] ?? "";   // "" means sync all projects
const DATA_ROOT = process.argv[3] ?? ROOT; // where synced snapshots are stored

// Read the active sync items list (user-configured or defaults).
const SYNC_ITEMS = readSyncItems(join(ROOT, "config.json"));

// Load projects from projects.conf and optionally filter to one project.
const projects = listProjects(DATA_ROOT);
const toSync   = project ? projects.filter((p) => p.name === project) : projects;
const total    = toSync.length;

if (total === 0) {
  console.log(`⚠️  No projects found${project ? ` matching "${project}"` : ""}`);
  process.exit(0);
}

/** Format a progress percentage string, e.g. "[ 33%]". */
function pct(current: number, total: number): string {
  return `[${String(Math.round((current / total) * 100)).padStart(3)}%]`;
}

console.log(`\n==============================`);
console.log(` AI Configs Sync`);
console.log(` Total: ${total} project${total !== 1 ? "s" : ""}`);
console.log(`==============================`);

let success = 0, skipped = 0, failed = 0;

for (let i = 0; i < toSync.length; i++) {
  const p      = toSync[i];
  // Normalise Windows backslashes so existsSync works on all platforms.
  const target = p.path.replace(/\\/g, "/");

  process.stdout.write(`\n ${pct(i + 1, total)} ${p.name}`);

  // Skip projects whose local path no longer exists on disk.
  if (!existsSync(target)) {
    console.log(`  ⚠️  path not found`);
    skipped++;
    continue;
  }

  // Ensure the snapshot folder exists (first sync creates it).
  const dest = join(DATA_ROOT, "projects", p.name);
  mkdirSync(dest, { recursive: true });

  const itemResults: string[] = [];
  let copied = 0;

  for (const item of SYNC_ITEMS) {
    const src = join(target, item);
    if (!existsSync(src)) continue; // item not in this project — skip silently
    try {
      copyItem(src, join(dest, item));
      itemResults.push(`✅ ${item}`);
      copied++;
    } catch {
      itemResults.push(`❌ ${item}`);
      failed++;
    }
  }

  if (copied === 0) {
    console.log(`  ⚠️  no configs`);
    skipped++;
  } else {
    console.log(`  →  ${itemResults.join("  ")}`);
    success++;
  }
}

console.log(`\n==============================`);
console.log(` ✅ Success : ${success}`);
console.log(` ⏭️  Skipped : ${skipped}`);
console.log(` ❌ Failed  : ${failed}`);
console.log(`==============================`);

// ---- Git Push ----
// Uses the gh CLI for authentication so no personal access tokens are needed.
// Requires: gh auth login (run once in the terminal before first use).
console.log(`\n==============================`);
console.log(` Git Push`);
console.log(`==============================`);

try {
  // Verify gh is authenticated before attempting any git operations.
  await $`gh auth status`.quiet();

  // Auto-configure git identity from the gh account if not already set.
  const hasEmail = (await $`git -C ${DATA_ROOT} config user.email`.nothrow().text()).trim();
  if (!hasEmail) {
    const email = (await $`gh api user/emails --jq '[.[] | select(.primary==true)] | .[0].email'`.nothrow().text()).trim();
    const name  = (await $`gh api user --jq '.name // .login'`.nothrow().text()).trim();
    if (email) await $`git config --global user.email ${email}`.nothrow();
    if (name)  await $`git config --global user.name ${name}`.nothrow();
  }

  await $`git -C ${DATA_ROOT} add -A`;

  // Only commit when there are actual changes (avoids empty commits).
  const diff = await $`git -C ${DATA_ROOT} diff --cached --quiet`.nothrow();
  if (diff.exitCode === 0) {
    console.log(` ℹ️  Nothing to commit`);
  } else {
    const ts = new Date().toLocaleString("sv").replace("T", " ");
    await $`git -C ${DATA_ROOT} commit -m ${"sync: " + ts}`;
    console.log(` ✅ Committed`);
  }

  // Increase the HTTP post buffer to avoid HTTP 408 errors on large pushes.
  await $`git -C ${DATA_ROOT} config http.postBuffer 524288000`.nothrow();

  // Retry up to 3 times to handle transient network failures.
  let pushed = false;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const result = await $`git -C ${DATA_ROOT} -c ${"credential.helper=!gh auth git-credential"} push origin HEAD`.nothrow();
    if (result.exitCode === 0) {
      console.log(` ✅ Pushed to origin`);
      pushed = true;
      break;
    }
    if (attempt < 3) console.log(` ⚠️  Push attempt ${attempt} failed, retrying...`);
  }
  if (!pushed) throw new Error("Push failed after 3 attempts");

} catch (e: any) {
  console.error(` ❌ Push failed: ${e.message}`);
  console.error(`    Run: gh auth login`);
  process.exit(1);
}
