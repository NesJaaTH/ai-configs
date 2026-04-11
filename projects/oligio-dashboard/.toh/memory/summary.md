# Project Summary

## Project Overview

- Name: Oligio X - Coupon Management System
- Brand: WONTECH | ASIA
- Type: B2B Dashboard / Coupon Redemption System
- Tech Stack: Next.js 16 (App Router), Tailwind v4, TypeScript strict, shadcn/ui
- Language: English UI + Thai subtitle text

## Completed Features

- Login page (orange/white split, real API auth with Bearer token)
- LoadingScreen shared component (3-square pulse spinner)
- Sidebar navigation (role-based: superadmin vs staff, profile card, logout)
- Home page (Insert Code card → API verify/redeem/complete, stat cards from API, detail card, recent table)
- Individual Record page (API-connected table, search/filter/sort/clinic dropdowns, pagination)
- Dashboard analytics page (KPI cards, donut chart, branch bar chart — still uses mock for exports)
- RecordMoreModal + RecordViewModal with drag/drop upload
- Excel export (exceljs): Report, Lead Data, Clinic Ranking
- Auth system: real API login, Bearer token in localStorage, auto-refresh on 401
- Zustand store (registrations): home slice + table slice with shared stats/branchMap
- Responsive design: all pages, mobile-first with lg: breakpoints
- Framer Motion animations: spring physics, staggered entries, micro-interactions
- Branch filter: dynamic from GET /api/branches/ (superadmin only)

## Current State

Build passing (0 errors, 5 routes). Auth connected to real API. Home + Individual Record use real API. Dashboard exports still use mockRecords.

## Key Files

- `src/lib/api.ts` - apiFetch with Bearer token + auto-refresh on 401
- `src/lib/auth.ts` - login/logout + token management (localStorage)
- `src/lib/records-api.ts` - API functions: lookup, update, redeem, complete, fetchRegistrations, fetchBranches
- `src/stores/registrations.ts` - Zustand store (home + table slices)
- `src/lib/export-excel.ts` - Excel export (exceljs)

## Important Notes

- Using Tailwind v4 (@theme inline in globals.css, no tailwind.config.ts)
- motion/react v12 (import from "motion/react")
- RecordStatus: "pending" | "completed" (not "in-progress" | "done")
- API base: NEXT_PUBLIC_API_URL env var (default localhost:3002)

---

*Last updated: 2026-03-20*
