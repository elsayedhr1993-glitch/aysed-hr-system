# Pull request: `refactor/leave-attendance-unify` → `main`

Open compare:  
https://github.com/elsayedhr1993-glitch/aysed-hr-system/compare/main...refactor/leave-attendance-unify?expand=1

Paste the body below into the PR description.

---

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
| Repo hygiene | PR template, migration + P2 issue templates, copy-paste docs under `docs/github/` |

### Out of scope

- Removing unwired legacy apps (`LeavesApp`, `OdooLeaveSettlementApp`, …).
- Full modular split of `OdooTimeOffApp` — tracked in follow-up issue (create from template).
- One-shot `attendance` → `attendance_records` migration script — tracked in follow-up issue.

### Risk & rollout

- Tenants without `system_config` policy docs fall back to existing local defaults.
- Environments that only write legacy `attendance` still see data via merge until primary records exist; new writes go to `attendance_records`.
- Source-only commit (no `dist/`).

---

## Test plan

### Build & smoke

- [x] `npm run build` (local)
- [ ] Login; switch company; no console errors on Attendance and Leaves

### Attendance

- [ ] Grid loads for active `companyId`
- [ ] Manual edit → single `attendance_records` doc `ATT-*`
- [ ] Import / biometric / kiosk / QR → same id pattern
- [ ] Attendance wizard save → `system_config/attendance_policy_{companyId}`

### Leaves

- [ ] Balances without monthly accrual button
- [ ] Approve leave → allocations consistent
- [ ] Leave policy wizard → Firestore + `timeoff_policy_updated`
- [ ] Tab غياب تشغيلي lists `attendance_records` absences
- [ ] Finance banner visible

### Navigation

- [ ] Switcher: إجازات والغياب → `leaves`; الحضور والبصمة → `timesheets`

### Regression

- [ ] Leave request + timeline; export actions

---

## Reviewer notes

- Review write paths to `attendance_records`, policy doc ids, leave approval without accrual side effects.
- Legacy merge in `OdooHierarchyContext` is intentional until migration issue is done.

---

## Post-merge

- [ ] Create and triage **migration issue** (template link below); assign owner
- [ ] Create **P2 modularization issue**; can run in parallel with migration dry-run
- [ ] Smoke one tenant on staging/prod Firebase

### Follow-up issues (create on GitHub)

| Track | New issue URL |
|-------|----------------|
| Migration `attendance` → `attendance_records` | https://github.com/elsayedhr1993-glitch/aysed-hr-system/issues/new?template=attendance-legacy-migration.md |
| P2 modularize `OdooTimeOffApp` | https://github.com/elsayedhr1993-glitch/aysed-hr-system/issues/new?template=timeoff-app-modularization.md |

After issues exist, edit this PR description: `Related: #___ , #___`
