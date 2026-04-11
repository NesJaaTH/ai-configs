# 🔥 Active Task

## Current Focus
Excel Export polish — removed all borders, borderline between rows fixed

## Just Completed
- [x] Find Clinic dropdown restricted to superadmin only
- [x] Added `email` field to `CouponRecord` type + mock data
- [x] Download Report (individual-record) → exports filtered/sorted Excel
- [x] Export Lead Data (dashboard) → Name, Phone, Email, Clinic (- if not redeemed)
- [x] Export Clinic Ranking (dashboard) → Branch, Done, In Progress, Total sorted desc
- [x] Installed `exceljs` for full cell styling support
- [x] Created `src/lib/export-excel.ts` shared export utility
- [x] Excel header: orange/teal title row + grey date row + spacer
- [x] Zebra striping, Done=green, In Progress=orange, bold styling
- [x] Removed all cell borders from Excel output
- [x] Dashboard responsive: removed overflow-x-auto + min-w, use flex-wrap
- [x] Hydration fix: authUser moved to useState+useEffect (individual-record)

## Next Steps
- Waiting for user command

## Just Completed (2026-03-20)
- [x] Created `src/lib/animations.ts` — shared ease curves, spring presets, dur scale, fadeUp/fadeRight variants
- [x] Appended `prefers-reduced-motion` block to `src/app/globals.css`
- [x] Created `src/app/(dashboard)/template.tsx` — opacity fade page transition (0.28s, ease-out-quart)
- [x] Build verified: npm run build passes with no errors

## Blockers / Issues
- (none)

---
*Last updated: 2026-03-09*
