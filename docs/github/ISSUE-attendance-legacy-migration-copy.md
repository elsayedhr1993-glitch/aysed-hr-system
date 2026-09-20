# Copy-paste: GitHub Issue — attendance legacy migration

Use **Issues → New issue → Migration — attendance → attendance_records**, or paste the body below into a blank issue.

---

## Title

```
[Migration] attendance → attendance_records
```

## Body

```markdown
## Context

After merging **refactor/leave-attendance-unify**:

- Writes use `upsertAttendanceRecordDoc` → Firestore `attendance_records`.
- Reads in `OdooHierarchyContext` use `attendance_records`; legacy `attendance` is merged read-only when no primary key exists.

Doc id: `ATT-{companyId}-{employeeId}-{YYYY-MM-DD}` (`src/utils/attendanceRecords.ts`).

## Goal

- Tenants no longer depend on legacy `attendance` for day-to-day ops.
- Safe to remove legacy listener and archive old data after sign-off.

## Tasks

### Pre-flight
- [ ] Firebase backup / export for target project
- [ ] Per-tenant counts: `attendance` vs `attendance_records` (90d window)
- [ ] Report: legacy docs without matching `ATT-*` primary

### Migration
- [ ] Dry-run script: map fields (`mapAttendanceRecordToLog` rules), propose ids
- [ ] Write mode: `setDoc` with merge; skip or queue if primary newer
- [ ] Conflict log (`migration_attendance_conflicts` or CSV)

### App follow-up PR
- [ ] Remove legacy `onSnapshot` on `attendance` in `OdooHierarchyContext.tsx`
- [ ] Zero `collection(db, 'attendance')` writes in repo
- [ ] Integrity/reports updated if still querying `attendance`

### Verification
- [ ] 3 employees × 30 days: totals match post-migration
- [ ] Attendances: one doc per employee-day on edit/import/biometric
- [ ] One payroll month regression
- [ ] 48h log monitoring post-deploy

### Rollback
- [ ] Legacy collection kept read-only until sign-off; script idempotent

## Sign-off

- [ ] Engineering — @
- [ ] HR/Ops — @
- [ ] Completed: YYYY-MM-DD

## Links

- PR: (paste PR URL after merge)
- Related: `refactor/leave-attendance-unify`
```
