import { readFileSync, existsSync, statSync } from "fs";
import { join } from "path";
import { $ } from "bun";

const PORT = 3000;

// Detect environment
function detectEnv(): "wsl" | "gitbash" | "macos" | "linux" {
  if (process.platform === "win32") return "gitbash";
  try {
    const v = readFileSync("/proc/version", "utf-8").toLowerCase();
    if (v.includes("microsoft")) return "wsl";
  } catch {}
  return process.platform === "darwin" ? "macos" : "linux";
}

const ENV = detectEnv();

// Convert Windows path → Unix path for use in bash
function toShellPath(p: string): string {
  if (ENV === "wsl") {
    // D:\git\... or D:/git/... → /mnt/d/git/...
    return p.replace(/\\/g, "/").replace(/^([A-Za-z]):/, (_, d) => `/mnt/${d.toLowerCase()}`);
  }
  if (ENV === "gitbash") {
    // D:\git\... → /d/git/...
    return p.replace(/\\/g, "/").replace(/^([A-Za-z]):/, (_, d) => `/${d.toLowerCase()}`);
  }
  return p;
}

const ROOT = join(import.meta.dir, "..");       // for Node fs calls
const SHELL_ROOT = toShellPath(ROOT);           // for bash args

// Parse projects.conf
function parseProjects() {
  const conf = readFileSync(join(ROOT, "projects.conf"), "utf-8");
  return conf
    .split("\n")
    .map((l) => l.replace(/\r/, "").trim())
    .filter((l) => l && !l.startsWith("#"))
    .map((line) => {
      const [name, ...rest] = line.split(":");
      const rawPath = rest.join(":").trim();
      const projectDir = join(ROOT, "projects", name.trim());
      const hasConfig = existsSync(projectDir);
      const lastSync = hasConfig
        ? statSync(projectDir).mtime.toISOString()
        : null;
      return {
        name: name.trim(),
        path: rawPath,
        hasConfig,
        lastSync,
      };
    });
}

// Git log
async function gitLog() {
  try {
    const result = await $`git -C ${ROOT} log --oneline -8`.quiet().text();
    return result.trim();
  } catch {
    return "";
  }
}

Bun.serve({
  port: PORT,
  idleTimeout: 0,
  async fetch(req) {
    const url = new URL(req.url);

    // Static files
    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(Bun.file(join(import.meta.dir, "public/index.html")));
    }

    // API: list projects
    if (url.pathname === "/api/projects" && req.method === "GET") {
      return Response.json(parseProjects());
    }

    // API: git log
    if (url.pathname === "/api/git/log" && req.method === "GET") {
      const log = await gitLog();
      return Response.json({ log });
    }

    // API: sync (SSE stream)
    if (url.pathname === "/api/sync" && req.method === "POST") {
      const body = await req.json().catch(() => ({})) as { project?: string };
      const project = body.project ?? "";

      const encoder = new TextEncoder();
      const send = (data: object) =>
        encoder.encode(`data: ${JSON.stringify(data)}\n\n`);

      const stream = new ReadableStream({
        async start(controller) {
          const bashCmd = ENV === "gitbash" ? "bash.exe" : "bash";
          const args = project
            ? [bashCmd, `${SHELL_ROOT}/sync.sh`, project]
            : [bashCmd, `${SHELL_ROOT}/sync.sh`];

          const proc = Bun.spawn(args, {
            cwd: SHELL_ROOT,
            stdout: "pipe",
            stderr: "pipe",
            env: process.env,
          });

          const decoder = new TextDecoder();

          // Stream stdout
          for await (const chunk of proc.stdout) {
            controller.enqueue(send({ line: decoder.decode(chunk) }));
          }

          // Stream stderr
          for await (const chunk of proc.stderr) {
            controller.enqueue(send({ line: decoder.decode(chunk), error: true }));
          }

          const code = await proc.exited;
          controller.enqueue(send({ done: true, code }));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`🚀  http://localhost:${PORT}`);
