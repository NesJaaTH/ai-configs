# Active Task

## Current Focus
Sidebar refactored to shadcn/ui primitives

## Completed This Session (2026-03-20)
- [x] Fix forced logout: save Bearer token from login response, send Authorization header on all requests
- [x] Remove dead mock auth: delete mock-users.ts + MockUser type
- [x] RecordMoreModal responsive: fluid width, vertical stack on mobile, spring animation
- [x] Individual-record bottom bar: responsive grid (1-col mobile, 3-col sm+)
- [x] Home bottom row: responsive lg:grid-cols, flex-1 min-h-0
- [x] Stat numbers: motion.p with key re-animation on value change
- [x] Stat cards: staggered x-slide entrance animation
- [x] Buttons: whileHover/whileTap spring micro-interactions
- [x] FilterDropdown: styled to match app design system
- [x] Individual-record rows: spring physics animation
- [x] Home Done button: triggers fetchRecent to refresh Recent table

## Next Steps
- Dashboard page still uses mockRecords for Export Lead Data / Export Clinic Ranking
- Connect dashboard exports to real /api/registrations/ API
- ESLint: 1 remaining error (set-state-in-effect in RecordMoreModal.tsx; Sidebar.tsx ESLint issue resolved by refactor)

---
*Last updated: 2026-03-20*
