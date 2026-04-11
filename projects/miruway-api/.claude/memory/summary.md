# 📋 Project Summary

## Project Overview
- Name: Go Miruway Api
- Type: REST API Backend — Go Fiber v3 + GORM + Supabase PostgreSQL
- Module: github.com/Miruway-Official/Miruway-Api
- Reference Spec: docs/go-miruway-api-claude-code-prompt.md

## Tech Stack
- Language: Go 1.25.6 | Framework: Fiber v3 | ORM: GORM v1.31
- DB: Supabase PostgreSQL (auth + tts schemas, 16 tables)
- Auth: JWT (golang-jwt/v5) + bcrypt + SHA256
- Validation: go-playground/validator/v10
- Config: godotenv + struct-based | UUID: google/uuid

## Architecture
Clean Architecture → Handler → Service → Repository → Domain (DI via constructors)

## Completed Features
- [Phase 1] Foundation complete (2026-02-25)
  - src/config/config.go, src/config/database.go
  - src/pkg/{response,validator,hash,jwt}.go
  - migrations/000001-000004 (schemas, auth tables, tts tables, seed)
  - .env.example, Makefile

- [Phase 2] Auth System complete (2026-02-25)
  - src/internal/entities/{user,auth_provider,session,role,email_verification,password_reset}.go
  - src/internal/dto/{auth_dto,user_dto}.go
  - src/internal/repository/{interfaces,user,auth_provider,session,role}_repository.go
  - src/internal/service/{auth_service,user_service}.go
  - src/internal/middleware/{auth_middleware,role_middleware,error_handler}.go
  - src/internal/handler/{auth_handler,user_handler}.go
  - src/cmd/main.go — DI wiring + all routes

- [Phase 3] TTS System complete (2026-02-25)
  - src/internal/entities/tts_{language,blacklist,message,target_user,voice_session,bot_log}.go
  - src/internal/dto/tts_dto.go
  - src/internal/repository/tts_{language,blacklist,queue,target_user,voice_session,bot_log}_repository.go
  - src/internal/service/tts_service.go
  - src/internal/handler/tts_handler.go
  - src/cmd/main.go updated — TTS routes + CORS

- [Phase 4] Polish complete (2026-02-25)
  - CORS middleware added (fiber/v3/middleware/cors)
  - README.md
  - docker-compose.yml

- [Phase 5] Docker + CI/CD complete (2026-02-27)
  - Dockerfile (multi-stage, golang:1.25-alpine → alpine:3.21)
  - .dockerignore
  - docker-compose.prod.yml (resource limits, localhost-only port, healthcheck)
  - docker-compose.yml (fixed: removed broken postgres reference)
  - src/cmd/main.go — GET /health endpoint added
  - .github/workflows/deploy.yml (push to main → self-hosted runner → docker compose)
  - README.md updated (Docker, CI/CD, GitHub Secrets, Nginx sections)

## Current State
All 5 phases complete. Runner + Secrets setup required on VPS before first deployment.

## Key Files
- src/cmd/main.go — entry point, DI wiring, all routes
- src/config/config.go — Config struct
- src/config/database.go — GORM ConnectDB with Supabase pool
- src/pkg/{response,validator,hash,jwt}.go — shared utilities
- src/internal/entities/ — 16 domain structs (auth + tts schemas)
- src/internal/dto/ — auth_dto, user_dto, tts_dto
- src/internal/repository/ — interfaces + 10 implementations
- src/internal/service/ — auth_service, user_service, tts_service
- src/internal/handler/ — auth_handler, user_handler, tts_handler
- src/internal/middleware/ — auth_middleware, role_middleware, error_handler
- migrations/ — 8 SQL files (000001-000004 up/down)

## API Surface (complete)
- POST/GET /api/auth/* (8 public endpoints)
- GET/PUT/DELETE /api/users/me/* (5 protected endpoints)
- GET/PUT/POST/DELETE /api/admin/users/* (5 admin endpoints)
- GET/POST/PUT/DELETE /api/tts/languages (4 endpoints)
- GET/POST/DELETE /api/tts/blacklist (3 endpoints)
- GET/POST/PUT/DELETE /api/tts/queue/:guildId/* (5 endpoints)
- GET/POST/PUT/DELETE /api/tts/target-users/:guildId/* (5 endpoints)
- GET/POST/PUT /api/tts/sessions/* (3 endpoints)
- GET/POST /api/tts/logs (2 endpoints)

## Important Notes
- Use SUPABASE_DB_URL (pooler) for app; SUPABASE_DB_DIRECT_URL (direct) for migrations
- auth schema: not using Supabase Auth — managing auth schema directly
- Fiber v3: c.Context() used consistently (compatible with context.Context interface)
- Tokens stored as SHA256 hash only; pkg.SHA256Hash() for all token storage
- Route ordering: /next and /reload registered before param routes to avoid capture

---
*Last updated: 2026-02-25*
