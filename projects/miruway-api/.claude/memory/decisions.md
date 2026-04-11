# 🧠 Key Decisions

## Architecture Decisions
| Date | Decision | Reason |
|------|----------|--------|
| 2026-02-08 | Use Toh Framework | AI-Orchestration Driven Development |
| 2026-02-25 | src/config/ separate from src/pkg/ | Config owns DB + env loading; pkg is stateless utilities |
| 2026-02-25 | go-playground/validator/v10 (not asaskevich) | Better struct tags, field-level errors, industry standard |
| 2026-02-25 | JWT functions take secret+expiry as params | Avoids coupling pkg/jwt.go to config; service passes values |
| 2026-02-25 | migrations/ at project root | Matches golang-migrate -path flag in Makefile |
| 2026-02-25 | ON CONFLICT DO NOTHING in seed | Safe idempotent re-run of seed migration |

## Design Decisions
| Date | Decision | Reason |
|------|----------|--------|
| 2026-02-25 | auth schema (not app_auth) | Not using Supabase Auth; using custom auth system |

## Business Logic
| Date | Decision | Reason |
|------|----------|--------|
| 2026-02-25 | SHA256 hash for all tokens | Refresh tokens, email verify tokens, password reset tokens stored as hash only |
| 2026-02-25 | Per-guild roles via user_roles.guild_id nullable | NULL=global role, value=per-guild role |

## Rejected Ideas
| Date | Idea | Why Rejected |
|------|------|--------------|
| 2026-02-25 | GORM AutoMigrate | Not for production; use golang-migrate for version control |
| 2026-02-25 | Supabase Go Client SDK | GORM direct connection gives more control; avoid vendor lock-in |

---
*Last updated: 2026-02-25*
