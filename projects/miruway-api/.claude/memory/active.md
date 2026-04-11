# 🔥 Active Task

## Current Focus
Phase 7 — Security Hardening complete (2026-02-27).

## In Progress
- (none)

## Just Completed
- Phase 5 — Docker + CI/CD (2026-02-27)
  - Dockerfile (multi-stage: golang:1.25-alpine → alpine:3.21, ~15-20 MB image)
  - .dockerignore (excludes .git, bin/, .env, .claude/, migrations/, docs/)
  - docker-compose.prod.yml (resource limits: 1 CPU / 512 MB, localhost-only port)
  - docker-compose.yml (fixed: removed broken postgres ref, simplified for local dev)
  - src/cmd/main.go — added GET /health → {"status":"ok"}
  - .github/workflows/deploy.yml (push to main → self-hosted runner → docker compose up --build)
  - README.md — added Docker, CI/CD, GitHub Secrets, Nginx proxy sections

## Just Completed
- Phase 6 — Auth Audit Log + Production Logging (2026-02-27)
  - src/internal/entities/auth_audit_log.go — entity + 10 event constants
  - src/pkg/logger.go — slog JSON (prod) / text (dev) structured logging
  - src/pkg/audit_ctx.go — WithAuditInfo / GetAuditInfo context helpers
  - migrations/000005_auth_audit_log.up.sql + .down.sql
  - src/internal/repository/auth_audit_log_repository.go
  - src/internal/repository/interfaces.go — AuditLogRepository appended
  - src/internal/service/auth_service.go — auditRepo injected, logAudit helper, slog.Warn
  - src/internal/handler/auth_handler.go — WithAuditInfo on every auth route
  - src/cmd/main.go — InitLogger + auditRepo wire + JSON Fiber logger in prod

- Phase 7 — Security Hardening (2026-02-27)
  - Rate limiting: global 60 req/min + auth 10 req/min (Fiber limiter middleware)
  - Security headers: helmet middleware (HSTS, X-Content-Type-Options, X-Frame-Options)
  - Trusted proxy: ProxyHeader: "X-Real-IP" for correct c.IP() behind Nginx
  - Body limit: 2 MB max request body
  - Request ID: requestid middleware → X-Request-Id + logged in production JSON
  - Password max=72 validation (bcrypt truncation prevention)
  - Pagination cap: pkg.ClampPagination (max 100 per page)

## Next Steps
- Run migration 000005 on Supabase (direct URL)
- Register self-hosted runner on VPS (GitHub → Settings → Actions → Runners)
- Add all GitHub Secrets listed in README
- Push to main → verify Actions tab triggers deployment

## Blockers / Issues
- (none — all files created, user needs to configure runner + secrets)

---
*Last updated: 2026-02-27*
