# GitHub workflows for leave / attendance refactor

## Automated (recommended)

After push to `refactor/leave-attendance-unify`, GitHub Actions workflow **Sync leave-attendance PR and follow-up issues** will:

1. Open follow-up issues (if not already open) from `.github/ISSUE_TEMPLATE/*`
2. Open or update the PR into `main` with body from `PR-refactor-leave-attendance-unify.md`
3. Add `Related: #…` links on the PR

Run manually: **Actions** → **Sync leave-attendance PR and follow-up issues** → **Run workflow**.

Requires **Actions** enabled on the repository and default `GITHUB_TOKEN` permissions for issues and pull requests.

## Manual

| Task | Link |
|------|------|
| Open / edit PR | [compare `main`…`refactor/leave-attendance-unify`](https://github.com/elsayedhr1993-glitch/aysed-hr-system/compare/main...refactor/leave-attendance-unify?expand=1) |
| Migration issue | [new issue (template)](https://github.com/elsayedhr1993-glitch/aysed-hr-system/issues/new?template=attendance-legacy-migration.md) |
| P2 modularization | [new issue (template)](https://github.com/elsayedhr1993-glitch/aysed-hr-system/issues/new?template=timeoff-app-modularization.md) |

Local helper (opens browser tabs):

```powershell
.\scripts\open-leave-attendance-github-tasks.ps1
```

## Status

See [STATUS.md](./STATUS.md) for live links (#4, #5, PR compare, Actions).

## Files

- `pr-body-generated.md` — PR body used by Actions + `open-leave-attendance-github-tasks.ps1`
- `PR-refactor-leave-attendance-unify.md` — longer PR doc with manual links
- `ISSUE-*-copy.md` — shortened issue bodies for manual paste
