# 🧠 Key Decisions

## Architecture Decisions
| Date | Decision | Reason |
|------|----------|--------|
| 2026-01-15 | Use Toh Framework | AI-Orchestration Driven Development |
| 2026-03-09 | Use `exceljs` instead of `xlsx` | Full cell styling support (color, font, fill) |
| 2026-03-09 | Shared `src/lib/export-excel.ts` | DRY — 3 export functions in one file |

## Design Decisions
| Date | Decision | Reason |
|------|----------|--------|
| 2026-03-09 | No logo in Excel header | User removed logo; text header only |
| 2026-03-09 | No cell borders in Excel | User requested clean look without lines |
| 2026-03-09 | Zebra striping for row separation | Visual separation without borders |

## Business Logic
| Date | Decision | Reason |
|------|----------|--------|
| 2026-03-09 | Clinic column = branch if done, "-" if in-progress | User spec: not redeemed = no clinic |
| 2026-03-09 | Find Clinic filter = superadmin only | Staff sees own branch only |
| 2026-03-09 | Download Report exports ALL filtered rows (not just current page) | User spec |
| 2026-03-09 | authUser via useState+useEffect | Fixes SSR hydration mismatch from localStorage |

## Rejected Ideas
| Date | Idea | Why Rejected |
|------|------|--------------|
| 2026-03-09 | Logo in Excel header via SVG→canvas | User decided to remove logo entirely |

---
*Last updated: 2026-03-09*
