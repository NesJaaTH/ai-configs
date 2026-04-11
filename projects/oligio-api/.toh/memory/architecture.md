# 🏗️ Project Architecture

## 📁 Entry Points
| Type | Path | Purpose |
|------|------|---------|
| Main | `src/index.ts` | Elysia server + route registration |
| DB | `src/db/index.ts` | Drizzle + pg Pool connection |
| Config | `src/config/env.ts` | Env validation |
| Drizzle | `drizzle.config.ts` | Drizzle Kit config |

## 🗂️ PostgreSQL Schemas (separated by domain)
| Schema | Tables | Enums |
|--------|--------|-------|
| `core` | branches, users | user_role |
| `record` | coupon_records | record_status |
| `analytics` | analytics_events | event_type |
| `audit` | audit_logs | audit_action |
| `lead` | leads | lead_status |
| `sms` | sms_logs | sms_status |

## 🔧 Common Columns (all tables)
`created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by`
Defined in `src/db/schema/common.ts` via spread pattern.

## 🗂️ Services
| File | Key Functions |
|------|--------------|
| auth.service.ts | authenticateUser() |
| record.service.ts | getRecords(), verifyRecord(), updateRecord(), uploadPhoto(), exportRecords() |
| analytics.service.ts | getAnalyticsSummary(), getUsageData(), getClinicRankings() |
| stats.service.ts | getHomeStats() |
| coupon.service.ts | generateCoupon() |
| lead.service.ts | createLead(), redeemStep1(), redeemStep2(), cancelLead() |
| sms.service.ts | sendSms(), handleSmsCallback() |
| audit.service.ts | createAuditLog() |

## 🔄 Data Flow
Client → Elysia Route → Service → Drizzle ORM → PostgreSQL (multi-schema)

---
*Last updated: 2026-03-08*
