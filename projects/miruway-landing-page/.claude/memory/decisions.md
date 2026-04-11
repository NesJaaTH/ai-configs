# 🧠 Key Decisions

## Architecture Decisions
| Date | Decision | Reason |
|------|----------|--------|
| 2026-03-18 | Use bun runtime | User explicitly requested; faster than npm |
| 2026-03-18 | Auth pages: single-column centered, no split panels | Match homepage's floating-content-over-WebGL aesthetic |
| 2026-03-18 | NavbarRedesign in auth layout (not standalone wordmark) | Consistent header across all pages |
| 2026-03-18 | next/dynamic with ssr:false for WebGL components | LightRays, CurvedLoop need browser APIs |
| 2026-03-18 | Fixed `z-0` for LightRays, `relative z-10` for content | Proper layering over WebGL background |
| 2026-03-19 | Remove wildcard `hostname: "**"` from image remotePatterns | CRITICAL security — wildcard allows any external image host, enabling SSRF |
| 2026-03-19 | Remove ignoreBuildErrors and ignoreDuringBuilds | HIGH security — suppressing build errors hides real TypeScript and ESLint issues |
| 2026-03-19 | Add HSTS header (max-age=31536000; includeSubDomains; preload) | HIGH — enforces HTTPS, prevents protocol downgrade attacks |
| 2026-03-19 | Add Content-Security-Policy header | HIGH — mitigates XSS by restricting script/style/resource origins |
| 2026-03-19 | Add Permissions-Policy header | MEDIUM — disables unused browser features (camera, mic, geolocation) |
| 2026-03-19 | Tighten Referrer-Policy to strict-origin-when-cross-origin | MEDIUM — reduces information leakage on cross-origin navigations |
| 2026-03-19 | Remove env variable values from /api/health response | HIGH — health endpoint was leaking API_URL_AUTH and FRONTEND_URL values in plaintext |
| 2026-03-19 | Stub lib/supabase.ts (remove @supabase/supabase-js import) | No Supabase backend yet; missing package caused build failure |
| 2026-03-19 | Add CountUp.d.ts and LogoLoop.d.ts type declarations | .jsx components lacked TypeScript types; surfaced by removing ignoreBuildErrors |
| 2026-03-19 | Fix Framer Motion ease type annotations (cubicBezier / as const / tuple cast) | number[] is not assignable to Easing type in framer-motion v12 |

## Design Decisions
| Date | Decision | Reason |
|------|----------|--------|
| 2026-03-18 | OKLCH color space throughout | Perceptually uniform, impeccable guidelines |
| 2026-03-18 | Purple #A855F7 → Pink #EC4899 gradient | Match Miruway logo color direction |
| 2026-03-18 | Sora + DM Sans fonts | impeccable typography guidelines |
| 2026-03-18 | Underline-only inputs on auth forms | Matches contact section style; no glassmorphism |
| 2026-03-18 | ease-out-quart [0.25,1,0.5,1] for hero/auth | Matches homepage hero easing |
| 2026-03-18 | Large faded "M" watermark on auth pages | Decorative depth without glassmorphism |

## Rejected Ideas
| Date | Idea | Why Rejected |
|------|------|--------------|
| 2026-03-18 | Split two-column auth layout with tinted panel | Broke WebGL continuity; impeccable anti-pattern |
| 2026-03-18 | Glassmorphism on auth form | Impeccable anti-pattern |
| 2026-03-18 | Skeleton loading delay (800ms) | Artificial; removed |

---
*Last updated: 2026-03-19*
