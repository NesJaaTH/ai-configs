# Component Registry

## Pages

| Route | File | Description |
|-------|------|-------------|
| `/login` | `app/(auth)/login/page.tsx` | Split login: orange panel + form |
| `/home` | `app/(dashboard)/home/page.tsx` | Staff dashboard: insert code, recent table |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | Superadmin analytics + export buttons |
| `/individual-record` | `app/(dashboard)/individual-record/page.tsx` | Searchable records table + export |

## Components

| Component | Location | Key Props | Notes |
|-----------|----------|-----------|-------|
| Sidebar | `components/layout/Sidebar.tsx` | isCollapsed, onToggle, isMobile | Role-based nav, collapse animation |
| StatusBadge | `components/ui/StatusBadge.tsx` | status | in-progress=peach, done=green |
| RecordsTable | `components/ui/RecordsTable.tsx` | height, fillHeight, showViewMore | ScrollArea >9 rows, sticky thead |
| FilterDropdown | `components/ui/FilterDropdown.tsx` | value, onChange | Set<RecordStatus> filter |
| RecordMoreModal | `components/ui/RecordMoreModal.tsx` | record, open, onClose | Edit in-progress record, w-[904px] |
| RecordViewModal | `components/ui/RecordViewModal.tsx` | record, open, onClose, onEdit | View done record |

## Utilities

| Function | Location | Purpose |
|----------|----------|---------|
| cn | `lib/utils.ts` | Merge Tailwind classes |
| getAuthUser / setAuthUser / clearAuthUser | `lib/auth.ts` | localStorage auth helpers |
| mockRecords | `lib/mock-data.ts` | 12 CouponRecord entries (with email) |
| mockUsers | `lib/mock-users.ts` | 3 accounts: admin, staff1, staff2 |
| exportReport | `lib/export-excel.ts` | Export individual records to Excel |
| exportLeads | `lib/export-excel.ts` | Export lead data (Name/Phone/Email/Clinic) |
| exportClinicRanking | `lib/export-excel.ts` | Export clinic ranking by Done count |

## Statistics

| Category | Count |
|----------|-------|
| Pages | 4 |
| Components | 6 |
| Utilities | 7 |

---
*Last updated: 2026-03-09*
