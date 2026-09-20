---
name: Migration — attendance → attendance_records
about: Checklist to retire the legacy Firestore `attendance` collection after SSOT cutover
title: "[Migration] attendance → attendance_records"
labels: migration, attendance, firebase
assignees: ''
---

## Context

After **PR: unify attendance_records SSOT** (`refactor/leave-attendance-unify`):

- **Writes** go to `attendance_records` via `upsertAttendanceRecordDoc` (`src/utils/attendanceRecords.ts`).
- **Reads** in `OdooHierarchyContext` subscribe to `attendance_records` first; legacy `attendance` is merged **only when no primary key** exists (read-only aid).

Doc id contract:

```text
ATT-{companyId}-{employeeId}-{YYYY-MM-DD}
```

## Goal

1. No tenant relies on legacy `attendance` for current-day operations.
2. Safe to remove legacy listener and (optionally) archive/delete old collection.

## Pre-flight

- [ ] Confirm prod/staging Firebase project id and backup policy (export or PITR).
- [ ] List tenants with `companyId` values used in production.
- [ ] Sample query: count docs in `attendance` vs `attendance_records` per `companyId` (last 90 days).
- [ ] Identify docs in `attendance` with **no** matching `ATT-*` key in `attendance_records`.

## Migration script (one-off or Cloud Function)

- [ ] For each legacy doc: map fields via `mapAttendanceRecordToLog` semantics (lateMinutes → delayMinutes, workHours → actualHours, etc.).
- [ ] `setDoc(attendance_records, id, payload, { merge: true })` using `getAttendanceRecordDocId`.
- [ ] **Do not overwrite** if primary doc exists and `lastUpdated` on primary is newer (define rule: max timestamp or manual review queue).
- [ ] Log conflicts to `migration_attendance_conflicts` collection or CSV for HR review.
- [ ] Dry-run mode (read-only report) before write mode.

## Application changes (follow-up PR)

- [ ] Remove `onSnapshot` on `attendance` in `OdooHierarchyContext.tsx` (legacy merge block).
- [ ] Grep codebase for `collection(db, 'attendance')` writes — must be zero.
- [ ] Update `globalIntegrityService` / reports if they still query `attendance`.
- [ ] Release note for ops: new punches only in `attendance_records`.

## Verification

- [ ] Pick 3 employees × 30 days: legacy vs primary totals (hours, absent days) match after migration.
- [ ] Attendances UI: manual edit, import, biometric path — single doc per day.
- [ ] Payroll month close / attendance approval unchanged for one closed month (regression).
- [ ] Monitor Firebase usage and error logs 48h post-migration.

## Rollback

- [ ] Migration script idempotent; keep legacy collection read-only (no deletes) until sign-off.
- [ ] Re-enable legacy listener via hotfix branch if critical gap found.

## Sign-off

- [ ] Engineering
- [ ] HR / ops (sample tenant validated)
- [ ] Date completed: ___________

## References

- `src/utils/attendanceRecords.ts`
- `src/context/OdooHierarchyContext.tsx` (attendance realtime + legacy merge)
- `src/components/Attendances.tsx` (explicit upserts)
