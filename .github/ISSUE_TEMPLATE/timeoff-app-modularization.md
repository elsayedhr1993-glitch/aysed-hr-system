---
name: Refactor — modularize OdooTimeOffApp (P2)
about: Split the monolithic Time Off app into maintainable modules without behavior change
title: "[Refactor] Modularize OdooTimeOffApp (P2)"
labels: refactor, leaves, tech-debt
assignees: ''
---

## Context

`src/components/OdooTimeOffApp.tsx` is a large single file (requests, allocations, timeline, finance, operational absence, policy wiring, Firestore listeners).

**P0/P1 already done on branch `refactor/leave-attendance-unify`:**
- `attendance_records` SSOT; operational absence extracted to `OperationalAbsencePanel.tsx`
- Firestore tenant policies; unified balance via `leaveEngine`
- No in-memory `leaveAccruals` in UI

This issue tracks **structure-only** splits; no new product features unless explicitly scoped.

## Goal

- Reduce file size and coupling so each area can be tested and reviewed independently.
- Keep **one** public entry: `OdooTimeOffApp` (or thin container + hooks).
- Zero user-visible behavior change per PR slice.

## Proposed module map

| Module | Responsibility | Suggested path |
|--------|----------------|----------------|
| Container | tabs, companyId, shared listeners | `OdooTimeOffApp.tsx` (slim) |
| Requests | list, approve/reject, create | `timeoff/TimeOffRequestsPanel.tsx` |
| Timeline | `AbsenceTimelineView` wiring | `timeoff/TimeOffTimelinePanel.tsx` |
| Allocations | balances table, FIFO display | `timeoff/TimeOffAllocationsPanel.tsx` |
| Finance | advance / cash-out sub-tabs | `timeoff/TimeOffFinancePanel.tsx` |
| Operational absence | already `OperationalAbsencePanel.tsx` | extend props only if needed |
| Hooks | policy load, `attendance_records` absence query, leave snapshots | `hooks/useTimeOffData.ts` |
| Types | tab ids, row DTOs | `timeoff/types.ts` |

## Suggested PR sequence (small slices)

1. [ ] Extract **types** + tab constants; no JSX move.
2. [ ] Extract **`useTimeOffPolicy`** (loadTenantPolicy + `timeoff_policy_updated`).
3. [ ] Extract **`useOperationalAbsences`** (Firestore query used by operational tab).
4. [ ] Move **requests** tab JSX + handlers to `TimeOffRequestsPanel`.
5. [ ] Move **finance** tab (+ EOS banner) to `TimeOffFinancePanel`.
6. [ ] Move **allocations** tab to `TimeOffAllocationsPanel`.
7. [ ] Optional: shared `TimeOffSubNav` component for main tabs.

Each PR: `npm run build`, smoke leaves app, link this issue.

## Non-goals

- Removing `LeaveSettlementCalculator` or rewiring payroll EOS.
- Deleting legacy `LeavesApp` / `OdooLeaveSettlementApp` (separate cleanup issue).
- Changing Firestore schema for `leave_requests` / `leave_allocations`.

## Acceptance criteria

- [ ] `OdooTimeOffApp.tsx` under ~400–500 lines (container + composition) OR documented exception with follow-up.
- [ ] No new circular imports between `timeoff/*` and `leaves/*`.
- [ ] All strings/labels remain Arabic as today (i18n later).
- [ ] Build green; manual test plan from PR template completed.

## Test plan (per slice)

- [ ] Open **إجازات والغياب** → all main tabs render.
- [ ] Approve one leave request; balance updates.
- [ ] Operational absence tab shows `attendance_records` rows.
- [ ] Finance tab: banner + advance sub-flow opens without errors.
- [ ] Policy wizard save still dispatches `timeoff_policy_updated`.

## References

- `src/components/OdooTimeOffApp.tsx`
- `src/components/timeoff/OperationalAbsencePanel.tsx`
- `src/utils/leaveEngine.ts`
- `src/services/leaveApprovalService.ts`
