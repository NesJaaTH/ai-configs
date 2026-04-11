# 🔥 Active Task

## Current Focus
Security hardening + code quality complete. Ready for DB migration.

## Just Completed
- [x] Deleted stale files: lead.ts, record.ts, lead.service.ts, record.service.ts, coupon.service.ts, lead.routes.ts, record.routes.ts, coupon.routes.ts
- [x] Security audit: identified 9 issues across CRITICAL/HIGH/MEDIUM/LOW
- [x] Fixed .env.example — removed real DB credentials + JWT secret (replaced with placeholders)
- [x] Fixed code generation — `Math.random()` → `crypto.getRandomValues()` (CSPRNG)
- [x] Fixed privacy leak — removed `existingCode` from duplicate phone response
- [x] Added SMS webhook HMAC-SHA256 signature verification (timingSafeEqual)
- [x] Added `SMS_WEBHOOK_SECRET` env var to config/env.ts + .env.example
- [x] Added DB indexes on `users.username` and `users.branchId`
- [x] Removed all `as any` casts from routes — replaced with typed `.use(authPlugin)` + `GuardHandler` type
- [x] Added `GuardHandler` type to src/types/index.ts with doc comment
- [x] Fixed `query.period as any` → proper `t.Union` schema + typed cast
- [x] Extended `audit_action` enum: added registration_created, registration_completed, registration_cancelled
- [x] Added audit log calls in registration.service.ts for all 3 new events
- [x] Generated migrations: 0001 (indexes), 0002 (audit enum values)

## Blocking Issue
DB has old schemas (core, lead, record, sms, analytics) — must DROP before migrating.

## Next Steps
1. Run SQL to drop old schemas:
   ```sql
   DROP SCHEMA IF EXISTS core CASCADE;
   DROP SCHEMA IF EXISTS lead CASCADE;
   DROP SCHEMA IF EXISTS record CASCADE;
   DROP SCHEMA IF EXISTS sms CASCADE;
   DROP SCHEMA IF EXISTS analytics CASCADE;
   DROP SCHEMA IF EXISTS audit CASCADE;
   DROP SCHEMA IF EXISTS app CASCADE;
   DROP SCHEMA IF EXISTS crm CASCADE;
   DROP SCHEMA IF EXISTS messaging CASCADE;
   ```
2. `bun run db:migrate`
3. `bun run db:seed`

---
*Last updated: 2026-03-14*
