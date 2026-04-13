#!/usr/bin/env bun
import { $ } from "bun";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import { listProjects }  from "./repositories/projectRepository";
import { readSyncItems } from "./repositories/configRepository";
import { copyItem }      from "./lib/fsUtils";

const ROOT      = join(import.meta.dir, "..", "..");
const project   = process.argv[2] ?? "";
const DATA_ROOT = process.argv[3] ?? ROOT;

const SYNC_ITEMS = readSyncItems(join(ROOT, "config.json"));
const projects   = listProjects(DATA_ROOT);
const toSync     = project ? projects.filter((p) => p.name === project) : projects;
const total      = toSync.length;

if (total === 0) {
  console.log(`⚠️  No projects found${project ? ` matching "${project}"` : ""}`);
  process.exit(0);
}

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
  const target = p.path.replace(/\\/g, "/");

  process.stdout.write(`\n ${pct(i + 1, total)} ${p.name}`);

  if (!existsSync(target)) {
    console.log(`  ⚠️  path not found`);
    skipped++;
    continue;
  }

  const dest = join(DATA_ROOT, "projects", p.name);
  mkdirSync(dest, { recursive: true });

  const itemResults: string[] = [];
  let copied = 0;

  for (const item of SYNC_ITEMS) {
    const src = join(target, item);
    if (!existsSync(src)) continue;
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
console.log(`\n==============================`);
console.log(` Git Push`);
console.log(`==============================`);

try {
  await $`gh auth status`.quiet();

  const hasEmail = (await $`git -C ${DATA_ROOT} config user.email`.nothrow().text()).trim();
  if (!hasEmail) {
    const email = (await $`gh api user/emails --jq '[.[] | select(.primary==true)] | .[0].email'`.nothrow().text()).trim();
    const name  = (await $`gh api user --jq '.name // .login'`.nothrow().text()).trim();
    if (email) await $`git config --global user.email ${email}`.nothrow();
    if (name)  await $`git config --global user.name ${name}`.nothrow();
  }

  await $`git -C ${DATA_ROOT} add -A`;

  const diff = await $`git -C ${DATA_ROOT} diff --cached --quiet`.nothrow();
  if (diff.exitCode === 0) {
    console.log(` ℹ️  Nothing to commit`);
  } else {
    const ts = new Date().toLocaleString("sv").replace("T", " ");
    await $`git -C ${DATA_ROOT} commit -m ${"sync: " + ts}`;
    console.log(` ✅ Committed`);
  }

  await $`git -C ${DATA_ROOT} config http.postBuffer 524288000`.nothrow();

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
