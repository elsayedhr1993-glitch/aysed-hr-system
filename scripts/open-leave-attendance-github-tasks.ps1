# Opens GitHub compare PR + follow-up issue forms (requires browser login to github.com).
$base = 'https://github.com/elsayedhr1993-glitch/aysed-hr-system'
$urls = @(
  "$base/compare/main...refactor/leave-attendance-unify?expand=1",
  "$base/issues/new?template=attendance-legacy-migration.md",
  "$base/issues/new?template=timeoff-app-modularization.md"
)
foreach ($u in $urls) {
  Start-Process $u
  Start-Sleep -Milliseconds 800
}
Write-Host 'Opened: PR compare + 2 issue templates. Submit each GitHub tab after review.'
