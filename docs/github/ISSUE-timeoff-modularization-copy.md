# Copy-paste: GitHub Issue — OdooTimeOffApp P2 modularization

Use **Issues → New issue → Refactor — modularize OdooTimeOffApp (P2)**, or paste below.

---

## Title

```
[Refactor] Modularize OdooTimeOffApp (P2)
```

## Body

```markdown
## Summary

Split `OdooTimeOffApp.tsx` into focused `timeoff/*` panels and hooks. Behavior unchanged; multiple small PRs.

## Depends on

- [ ] Merged: `refactor/leave-attendance-unify` (SSOT attendance, `OperationalAbsencePanel`, policies, leaveEngine balances)

## PR slices (check as done)

1. [ ] Types + tab constants (`timeoff/types.ts`)
2. [ ] `useTimeOffPolicy` hook
3. [ ] `useOperationalAbsences` hook
4. [ ] `TimeOffRequestsPanel`
5. [ ] `TimeOffFinancePanel` (incl. payroll EOS banner)
6. [ ] `TimeOffAllocationsPanel`
7. [ ] Optional `TimeOffSubNav`

## Acceptance

- [ ] Container ≤ ~500 lines or documented follow-up
- [ ] Build + leaves smoke test each PR
- [ ] No new circular imports

## Out of scope

- Legacy app deletion (`LeavesApp`, etc.)
- Firestore schema changes for leaves

## Test plan (each PR)

- [ ] All main tabs open
- [ ] Approve leave → balance OK
- [ ] Operational absence tab
- [ ] Policy wizard → `timeoff_policy_updated`
```
