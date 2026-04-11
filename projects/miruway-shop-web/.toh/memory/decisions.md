# Key Decisions

## Architecture Decisions
| Date | Decision | Reason |
|------|----------|--------|
| 2026-03-18 | Use Toh Framework v1.8.1 | AI-Orchestration Driven Development |

## Design Decisions
| Date | Decision | Reason |
|------|----------|--------|
| 2026-04-01 | Shop page: `categoryKey` (Thai) separate from `category` (English display) | ProductCard badge shows English; filter pills use Thai strings — both must coexist |
| 2026-04-01 | Shop page: no hero banner in redesign | Cleaner UX — user lands directly on search + browse without scrolling past marketing |
| 2026-04-01 | Removed parallax (useScroll/useTransform) from home page | Spec requires natural scroll, no parallax |
| 2026-04-01 | Flash Sale banner uses inline gradient styles not Tailwind gradient classes | Ensures exact violet-to-fuchsia stop colors match brand |
| 2026-04-01 | Category cards use onMouseEnter/Leave for violet glow shadow | Tailwind can't animate box-shadow via hover alone with custom rgba values |
| 2026-04-01 | FadeSection uses whileInView not useInView hook | Simpler, no extra ref wiring, meets spec requirement |
| 2026-04-01 | Dropped BlurText, SpotlightCard, ShinyText from home page | Spec explicitly bans these imports for simplicity |

## Technical Decisions
| Date | Decision | Reason |
|------|----------|--------|
| 2026-04-01 | No useState on home page | No search feature in redesign spec; removes complexity |

---
*Updated: 2026-04-01*
