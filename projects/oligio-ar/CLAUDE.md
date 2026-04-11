# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite)
npm run build     # Production build
npm run lint      # ESLint check
npm run preview   # Preview production build locally
```

No test runner is configured — there are no unit tests.

## Environment Setup

Copy `.env.example` to `.env.local` and fill in values:

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | API base URL, no trailing slash |
| `VITE_REGISTRATION_TOKEN` | Value for `x-registration-token` header |
| `VITE_TEST_MODE` | Set `true` to skip camera guard for desktop testing |

AR requires HTTPS or `localhost`. Use ngrok for mobile testing (already whitelisted in `vite.config.ts`).

## Architecture

Single-page React app with two routes (`/` and `/ar`) wrapping an AR-based lead-capture campaign.

**Flow:** `HomePage` → [SCAN NOW] sets `sessionStorage("ar_flow_ready")` → `ARPage` reads and clears the flag as a navigation guard.

**`ARPage` renders one of four states** managed by local state + `useAR` + `useLeadForm`:
1. **AR Camera** — live camera feed with MindAR image tracking
2. **Lead Form** — shown after 12-second scan completes (`showCompleted`)
3. **Success** — after `POST /api/registrations/` returns 200
4. **Unsuccess** — after 409/422 (phone already registered)

**`useAR` hook** (`src/hooks/useAR.ts`) manages the full MindAR lifecycle:
- MindAR is dynamically imported to avoid SSR/build issues
- The `ar_flow_ready` sessionStorage guard prevents direct `/ar` access (bypassed in `VITE_TEST_MODE`)
- `startedRef` and `guardCheckedRef` guard against React StrictMode double-invocation
- AR progress (elapsed seconds) is persisted to `localStorage` as a crash-recovery hint
- `AR_DURATION = 12` seconds of continuous target visibility required

**`OpenInBrowser` component** wraps the entire app and intercepts in-app browsers (LINE, Facebook, Instagram). On Android it fires a Chrome Intent; on iOS it shows manual steps. This is the outermost layer — renders before routing.

**Path alias:** `@` maps to `src/` (configured in `vite.config.ts` and `tsconfig.json`).

**UI components** in `src/components/ui/` are shadcn/ui wrappers over Radix UI primitives. The brand color is `#28B9C3` (cyan).

**`public/assets/mind/targets.mind`** is the compiled MindAR image target file. It cannot be regenerated from source in this repo — must be produced externally with the MindAR compiler tool.

## Deployment

```bash
vercel deploy
```

`vercel.json` is already configured. The `--ignore-scripts` flag is used during Vercel builds to skip the native `canvas` build required by MindAR.
