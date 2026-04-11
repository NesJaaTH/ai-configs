# 🧠 Key Decisions

| Date | Decision | Reason |
|------|----------|--------|
| 2026-03-19 | Removed shadcn/tw-animate-css imports | Tailwind v3 doesn't support @apply border-border |
| 2026-03-19 | Inline styles for character colors | Dynamic colors can't use arbitrary Tailwind classes at build time |
| 2026-03-19 | scheduleAIResponses checks human first | Prevents AI firing before human responds |
| 2026-03-19 | Game config in localStorage | No server needed for AI mode config |
| 2026-03-19 | Host-authoritative multiplayer | One client runs engine, broadcasts state; others send moves |
| 2026-03-19 | Supabase RLS: separate policies per operation | `for all using(true)` doesn't cover INSERT — needs `with check(true)` |
| 2026-03-19 | Unified ChallengeDialog (removed BlockDialog from game-board) | canHumanBlock logic: `blockableChars.length > 0 && (!targetId || humanIsTarget)` |
| 2026-03-20 | Removed Play with AI — online only | Simplify app, focus on multiplayer |
| 2026-03-20 | Moved coup-game/ to repo root | Cleaner GitHub structure |
| 2026-03-20 | AI files in .gitignore | .claude/, .toh/, .agents/ are local dev tools only |
| 2026-03-20 | Character rename in README only (not code yet) | Wait for weekly token reset before refactoring code |
| 2026-03-20 | ทูต custom ability: select 1 from hand + draw 2 → keep 1 | Game design decision by user |

---
*Last updated: 2026-03-20*
