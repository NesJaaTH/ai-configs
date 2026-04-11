import { readFileSync, existsSync, statSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dir, "..");
const PORT = 3000;

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
  const proc = Bun.spawn(["git", "log", "--oneline", "-8"], {
    cwd: ROOT,
    stdout: "pipe",
    stderr: "pipe",
  });
  const text = await new Response(proc.stdout).text();
  await proc.exited;
  return text.trim();
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
          const args = project
            ? ["bash", join(ROOT, "sync.sh"), project]
            : ["bash", join(ROOT, "sync.sh")];

          const proc = Bun.spawn(args, {
            cwd: ROOT,
            stdout: "pipe",
            stderr: "pipe",
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
