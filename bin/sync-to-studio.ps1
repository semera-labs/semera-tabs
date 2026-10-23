# Builds the blocks, then copies the plugin into a WordPress Studio site for testing
# (Studio's PHP only sees files inside the site folder, so a symlink would not work).
#   pwsh bin/sync-to-studio.ps1                  # default site: C:\Users\<you>\Studio\semera-dev
#   pwsh bin/sync-to-studio.ps1 -Site C:\path\to\site
#   pwsh bin/sync-to-studio.ps1 -SkipBuild       # copy only
param(
	[string]$Site = (Join-Path $env:USERPROFILE 'Studio\semera-dev'),
	[switch]$SkipBuild
)

$source = Split-Path -Parent $PSScriptRoot
$target = Join-Path $Site 'wp-content\plugins\semera-tabs'

if (-not $SkipBuild) {
	Push-Location $source
	try {
		if (-not (Test-Path 'node_modules')) { npm install --no-audit --no-fund; if ($LASTEXITCODE) { throw 'npm install failed' } }
		npm run build
		if ($LASTEXITCODE) { throw 'npm run build failed' }
	} finally {
		Pop-Location
	}
}

# src/ and node_modules/ are not needed on the site.
robocopy $source $target /MIR /XD .git .claude node_modules src dist bin /XF .gitignore CLAUDE.md package.json package-lock.json .editorconfig /NFL /NDL /NJH /NJS | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed ($LASTEXITCODE)" }
Write-Host "Synced to $target"
exit 0
