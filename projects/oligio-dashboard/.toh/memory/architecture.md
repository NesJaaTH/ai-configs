# Project Architecture

## Entry Points

| Type | Path | Purpose |
|------|------|---------|
| Root | `src/app/page.tsx` | Redirects to /login |
| Auth Layout | `src/app/(auth)/layout.tsx` | Passthrough for auth pages |
| Dashboard Layout | `src/app/(dashboard)/layout.tsx` | Sidebar + toggle + content shell |
| Root Layout | `src/app/layout.tsx` | HTML shell, Sarabun font import |

## Route Tree

```text
/                    -> redirect to /login
/login               -> (auth)/login/page.tsx
/home                -> (dashboard)/home/page.tsx        [staff]
/individual-record   -> (dashboard)/individual-record/page.tsx [all]
/dashboard           -> (dashboard)/dashboard/page.tsx   [superadmin]
```

## Core Modules

### `/src/lib/` - API & Utilities

| File | Purpose |
|------|---------|
| `api.ts` | apiFetch with Bearer token, auto-refresh 401 |
| `auth.ts` | login/logout, token/user localStorage helpers |
| `records-api.ts` | Registration CRUD, fetchBranches, ApiError |
| `export-excel.ts` | Excel export (exceljs): report, leads, ranking |
| `mock-data.ts` | 12 mock CouponRecord (used only by dashboard exports) |
| `utils.ts` | cn() clsx + twMerge |

### `/src/stores/` - State Management

| File | Purpose |
|------|---------|
| `registrations.ts` | Zustand: home slice (recent) + table slice (individual-record) |

## Data Flow

```text
User -> Component -> Zustand Store -> apiFetch (Bearer token) -> API
API response -> Store update -> React re-render
```

## External Services

| Service | Purpose | Config |
|---------|---------|--------|
| API Backend | Auth, registrations, branches | NEXT_PUBLIC_API_URL |
| Google Fonts | Sarabun font | layout.tsx import |

---

*Last updated: 2026-03-20*
