# Leave / attendance refactor — GitHub status

| Item | Link |
|------|------|
| Branch | [`refactor/leave-attendance-unify`](https://github.com/elsayedhr1993-glitch/aysed-hr-system/tree/refactor/leave-attendance-unify) |
| Open PR | [Compare → main](https://github.com/elsayedhr1993-glitch/aysed-hr-system/compare/main...refactor/leave-attendance-unify?expand=1) (or run `.\scripts\open-leave-attendance-github-tasks.ps1` for prefilled form) |
| Migration issue | [#4](https://github.com/elsayedhr1993-glitch/aysed-hr-system/issues/4) |
| P2 modularization | [#5](https://github.com/elsayedhr1993-glitch/aysed-hr-system/issues/5) |
| Actions sync | [Workflow runs](https://github.com/elsayedhr1993-glitch/aysed-hr-system/actions/workflows/sync-leave-attendance-github.yml) |

## If Actions could not open the PR

1. Repo **Settings → Actions → General → Workflow permissions**
2. Enable **Read and write permissions**
3. Enable **Allow GitHub Actions to create and approve pull requests**
4. **Actions → Sync leave-attendance PR and follow-up issues → Run workflow**

Issues **#4** and **#5** are created automatically; the workflow reuses them on subsequent runs.
