# Key Decisions

## Architecture Decisions

| Date | Decision | Reason |
|------|----------|--------|
| 2026-01-15 | Use Toh Framework | AI-Orchestration Driven Development |
| 2026-03-01 | Tailwind v4 with @theme inline | Figma design tokens map directly to CSS vars |
| 2026-03-01 | Sidebar 364px fixed | Match Figma layout exactly |
| 2026-03-04 | shadcn/ui for dropdowns | User requested framework components over custom |
| 2026-03-09 | Zustand store with 2 slices | Share stats/branchMap between home and individual-record |
| 2026-03-09 | useRef for branchMap | Avoid infinite fetch loop (Zustand state in useEffect deps) |
| 2026-03-09 | RecordStatus pending/completed | API uses pending/completed, not in-progress/done |
| 2026-03-20 | Bearer token in localStorage | API returns token in login response body, not cookies |

## Design Decisions

| Date | Decision | Reason |
|------|----------|--------|
| 2026-03-01 | Split login layout (orange left / white right) | Match Figma 218:6591 |
| 2026-03-04 | State-based loading (not /loading route) | User rejected URL change |
| 2026-03-06 | lg:overflow-y-hidden for home | Desktop locked viewport; mobile scrolls freely |
| 2026-03-06 | lg:grid-cols-2 for dashboard main grid | xl was too late; lg matches iPad landscape |
| 2026-03-20 | Spring physics for row animations | More natural than tween easeOut |
| 2026-03-20 | Responsive bottom bar (no min-w-[500px]) | Mobile-friendly grid instead of forced scroll |

---

*Last updated: 2026-03-20*
