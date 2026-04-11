# 🧠 Key Decisions

## Architecture Decisions
| Date | Decision | Reason |
|------|----------|--------|
| 2026-03-06 | Elysia.js + Bun runtime | Fast TypeScript-native API framework |
| 2026-03-06 | Split logging: Analytics + Audit | Analytics = business metrics, Audit = security events |
| 2026-03-08 | Migrate Prisma → Drizzle ORM | Lighter ORM, no code generation |
| 2026-03-08 | Lowercase enum values | PostgreSQL convention |
| 2026-03-08 | Separate PG schemas per domain | Future-proof: each schema can grow independently |
| 2026-03-14 | Drop couponRecords table | Only one flow: AR → registration, no physical coupons |
| 2026-03-14 | Rename schemas: core→app, customer→crm, sms→messaging | Clearer domain names |
| 2026-03-14 | Rename tables: analytics_events→events, audit_logs→logs, sms_logs→messages | Remove schema name redundancy |
| 2026-03-14 | POST /registrations returns only `{ code }` | Minimal surface, code is all user needs |
| 2026-03-14 | Pepper = HMAC-SHA256(password, PEPPER) → argon2id | Defense in depth against DB leak |
| 2026-03-14 | CSPRNG for code generation | Math.random() is not crypto-safe |
| 2026-03-14 | Remove existingCode from duplicate response | Privacy: don't reveal another customer's code |
| 2026-03-14 | SMS webhook HMAC-SHA256 + timingSafeEqual | Prevent fake delivery confirmations |
| 2026-03-14 | GuardHandler type instead of `as any` | Elysia scoped derive doesn't propagate to guard types; named type documents why |
| 2026-03-14 | Audit log: registration_created/completed/cancelled | Full audit trail for registration lifecycle |

---
*Last updated: 2026-03-14*
