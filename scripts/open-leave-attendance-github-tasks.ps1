# Opens GitHub PR form (prefilled) + follow-up issues. Requires browser login to github.com.
$ErrorActionPreference = 'Stop'
$base = 'https://github.com/elsayedhr1993-glitch/aysed-hr-system'
$title = 'refactor(hr): unify attendance_records SSOT, Firestore policies, and Time Off operational absence'
$bodyPath = Join-Path $PSScriptRoot '..\docs\github\pr-body-generated.md'
$body = Get-Content -Raw -Path $bodyPath

function Encode-Gh([string]$s) {
  [uri]::EscapeDataString($s)
}

$prUrl = '{0}/compare/main...refactor/leave-attendance-unify?expand=1&title={1}&body={2}' -f $base, (Encode-Gh $title), (Encode-Gh $body)
$urls = @(
  $prUrl,
  "$base/issues/4",
  "$base/issues/5",
  "$base/actions/workflows/sync-leave-attendance-github.yml"
)
foreach ($u in $urls) {
  Start-Process $u
  Start-Sleep -Milliseconds 600
}
Write-Host 'Opened: PR compare (prefilled), issues #4 #5, Actions workflow (re-run sync if PR missing).'
