# Builds dist/semera-tabs-<version>.zip for Plugins > Add New > Upload Plugin.
# The zip has one top-level folder, semera-tabs/, and only what runs on a site:
# the compiled build/, no sources, .git, dev scripts or notes. Entry names use forward
# slashes (Compress-Archive in Windows PowerShell 5.1 writes backslashes, which break
# on Linux servers).
#   pwsh bin/build-zip.ps1            # npm run build first
#   pwsh bin/build-zip.ps1 -SkipBuild
param(
	[switch]$SkipBuild
)
$ErrorActionPreference = 'Stop'

$root    = Split-Path -Parent $PSScriptRoot
$slug    = 'semera-tabs'
$version = (Select-String -Path (Join-Path $root "$slug.php") -Pattern '^\s*\*\s*Version:\s*(\S+)').Matches[0].Groups[1].Value
$dist    = Join-Path $root 'dist'
$zipPath = Join-Path $dist "$slug-$version.zip"

if (-not $SkipBuild) {
	Push-Location $root
	try {
		if (-not (Test-Path 'node_modules')) { npm install --no-audit --no-fund; if ($LASTEXITCODE) { throw 'npm install failed' } }
		npm run build
		if ($LASTEXITCODE) { throw 'npm run build failed' }
	} finally {
		Pop-Location
	}
}

# Everything below is left out (matched against the path relative to the plugin folder).
$exclude = @('^\.git/', '^\.claude/', '^bin/', '^dist/', '^node_modules/', '^src/', '^CLAUDE\.md$', '^\.editorconfig$', '^\.gitignore$', '^package(-lock)?\.json$', '\.zip$')

New-Item -ItemType Directory -Force $dist | Out-Null
if (Test-Path $zipPath) { Remove-Item $zipPath }

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')
try {
	Get-ChildItem -Path $root -Recurse -File -Force | ForEach-Object {
		$relative = $_.FullName.Substring($root.Length + 1).Replace('\', '/')
		if ($exclude | Where-Object { $relative -match $_ }) { return }
		[void][System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $_.FullName, "$slug/$relative", 'Optimal')
		Write-Host "  $slug/$relative"
	}
} finally {
	$zip.Dispose()
}

Write-Host "`nCreated $zipPath"
