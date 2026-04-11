# Component Registry

## Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Redirect to /login |
| `/login` | `app/(auth)/login/page.tsx` | Split login + real API auth |
| `/home` | `app/(dashboard)/home/page.tsx` | Insert Code, stats, detail, recent |
| `/individual-record` | `app/(dashboard)/individual-record/page.tsx` | API table, filters, pagination |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | KPI, charts, activity (mock exports) |

## Components

### Layout

| Component | Location | Used By |
|-----------|----------|---------|
| Sidebar | `components/layout/Sidebar.tsx` | Dashboard layout |

### UI (Custom)

| Component | Location | Key Props | Used By |
|-----------|----------|-----------|---------|
| LoadingScreen | `components/ui/LoadingScreen.tsx` | fullScreen, message | Login |
| StatusBadge | `components/ui/StatusBadge.tsx` | status | Table, Modals |
| RecordsTable | `components/ui/RecordsTable.tsx` | records, fillHeight | Home |
| RecordMoreModal | `components/ui/RecordMoreModal.tsx` | record, open, onConfirm | Table, IndRecord |
| RecordViewModal | `components/ui/RecordViewModal.tsx` | record, open, onEdit | Table, IndRecord |
| FilterDropdown | `components/ui/FilterDropdown.tsx` | value, onChange | Home, IndRecord |

### UI (shadcn)

| Component | Location |
|-----------|----------|
| Button | `components/ui/button.tsx` |
| Input | `components/ui/input.tsx` |
| Badge | `components/ui/badge.tsx` |
| DropdownMenu | `components/ui/dropdown-menu.tsx` |
| Dialog | `components/ui/dialog.tsx` |
| ScrollArea | `components/ui/scroll-area.tsx` |

## Stores

| Store | Location | Key Actions |
|-------|----------|-------------|
| registrations | `stores/registrations.ts` | fetchRecent, fetchTable (shared stats, branchMap) |

## Utilities

| Function | Location | Purpose |
|----------|----------|---------|
| cn | `lib/utils.ts` | Class merge |
| apiFetch | `lib/api.ts` | Bearer token + 401 refresh |
| exportReport | `lib/export-excel.ts` | Excel export |

## Statistics

| Category | Count |
|----------|-------|
| Pages | 5 |
| Components | 12 (6 custom + 6 shadcn) |
| Stores | 1 |
| Hooks | 0 |

---

*Last updated: 2026-03-20*
