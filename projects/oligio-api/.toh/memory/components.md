# 📦 Component Registry

## 🗄️ Schema Files
| File | Schema | Tables |
|------|--------|--------|
| common.ts | - | timestamps + auditColumns helpers |
| enums.ts | all | 6 pgSchema + 6 pgEnum definitions |
| user.ts | core | branches, users |
| record.ts | record | coupon_records |
| analytics.ts | analytics | analytics_events |
| audit.ts | audit | audit_logs |
| lead.ts | lead | leads |
| sms.ts | sms | sms_logs |

## 🔌 Plugins
| Plugin | Location | Purpose |
|--------|----------|---------|
| authPlugin | plugins/auth.ts | JWT + user context |
| dbPlugin | plugins/db.ts | DB decorator |
| securityHeaders | plugins/security.ts | Security headers |
| globalRateLimit | plugins/security.ts | 100 req/60s |
| authRateLimit | plugins/security.ts | 5 req/60s |
| exportRateLimit | plugins/security.ts | 10 req/60s |

## 🛡️ Middleware
| Guard | Purpose |
|-------|---------|
| requireAuth | 401 if no user |
| requireSuperadmin | 403 if not superadmin |
| requireBranch | 403 if wrong branch |

## 📊 Statistics
| Category | Count |
|----------|-------|
| Routes | 6 |
| Services | 8 |
| Schema Tables | 7 |
| PG Schemas | 6 |
| Enums | 6 |

---
*Last updated: 2026-03-08*
