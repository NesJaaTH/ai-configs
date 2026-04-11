# 📋 Project Summary

## Project Overview
- Name: Oligio X Dashboard API
- Tech Stack: Elysia.js + Bun + Drizzle ORM + PostgreSQL + TypeScript
- Purpose: Clinic registration API — AR experience → customer gets code → clinic redeems

## Flow
User watches AR → POST /registrations (name/email/phone) → gets `code` → goes to clinic
→ Staff: POST /registrations/:code/redeem (pending) → POST /registrations/:code/complete (upload receipt)

## Completed Features
- Auth: JWT + argon2id + HMAC-SHA256 pepper (defense-in-depth)
- Branch management (30 real clinics from wontech-asia.com)
- Customer registration flow (issued→pending→completed)
- SMS messaging (2-step redemption) — provider stubbed, webhook secured with HMAC
- Analytics event tracking
- Audit logging (login, unauthorized, registration_created/completed/cancelled)
- Swagger API docs at /docs
- Security hardening: CSPRNG code gen, no existingCode leak, SMS webhook signature, indexes

## Important Notes
- Enum values lowercase (e.g. "superadmin", "issued", "completed")
- DB via pg Pool + Drizzle ORM
- .env.local for env vars (not .env)
- PASSWORD_PEPPER required in env (min 32 chars)
- SMS_WEBHOOK_SECRET optional but recommended for production
- Seed file at seed/seed.ts
- No `as any` in codebase — uses GuardHandler type for Elysia guard limitation
- Migration pending: drop old schemas in DB before `bun run db:migrate`

---
*Last updated: 2026-03-14*
