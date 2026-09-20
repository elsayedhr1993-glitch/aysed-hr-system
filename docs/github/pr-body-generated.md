## Summary

Unifies **attendance** and **leave/time-off** data paths so each tenant has a single source of truth, without changing payroll EOS settlement flows.

### Problem

- Attendance was written/read through overlapping paths (`attendance` vs `attendance_records`), including bulk re-writes from the UI.
- Time Off mixed Firestore `leave_allocations` with in-memory `leaveAccruals`, so balances and approvals could diverge.
- Master policies lived mainly in `localStorage`, not per-tenant in Firestore.
- Operational absence (no punch / absent) had no dedicated view in Time Off.
- App switcher used `attendance` id for the leaves app.

### Solution

| Area | Change |
|------|--------|
| Attendance SSOT | `src/utils/attendanceRecords.ts` — doc id `ATT-{companyId}-{employeeId}-{date}`, upsert + map helpers |
| Hierarchy | Read `attendance_records`; writes via upsert; legacy `attendance` read-only merge when no primary key |
| Attendances UI | Explicit upserts; policy via `hrPolicyStorage` + event listener |
| Policies | `system_config/{leave_policy\|attendance_policy}_{companyId}` + localStorage cache |
| Time Off | No UI `leaveAccruals`; `leaveEngine` balances; operational absence tab + `OperationalAbsencePanel` |
| Finance UX | Banner: full EOS under Payroll → Settlements |
| Navigation | `OdooAppSwitcher`: `leaves` for إجازات والغياب |
| Repo hygiene | PR template, migration + P2 issue templates, GitHub Actions sync |

### Out of scope

- Removing unwired legacy apps (`LeavesApp`, `OdooLeaveSettlementApp`, …).
- Full modular split of `OdooTimeOffApp` — **#5**.
- One-shot `attendance` → `attendance_records` migration — **#4**.

### Risk & rollout

- Tenants without `system_config` policy docs fall back to existing local defaults.
- Legacy `attendance` read merge until **#4** is done.
- Source-only (no `dist/`).

---

## Test plan

### Build & smoke

- [x] `npm run build` (local)
- [ ] Login; switch company; no console errors on Attendance and Leaves

### Attendance

- [ ] Grid loads for active `companyId`
- [ ] Manual edit → single `attendance_records` doc `ATT-*`
- [ ] Attendance wizard save → `system_config/attendance_policy_{companyId}`

### Leaves

- [ ] Balances without monthly accrual button
- [ ] Approve leave → allocations consistent
- [ ] Tab غياب تشغيلي lists `attendance_records` absences
- [ ] Finance banner visible

### Navigation

- [ ] Switcher: إجازات والغياب → `leaves`; الحضور والبصمة → `timesheets`

---

## Reviewer notes

- Review write paths to `attendance_records`, policy doc ids, leave approval without accrual side effects.
- Legacy merge in `OdooHierarchyContext` is intentional until **#4**.

---

## Post-merge

- [ ] Triage **#4** (migration) and **#5** (P2 modularization)
- [ ] Smoke one tenant on staging/prod Firebase

Related: #4 , #5
