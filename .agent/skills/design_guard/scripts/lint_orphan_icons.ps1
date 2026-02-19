<#
.SYNOPSIS
    Detects orphaned icon classes and inconsistent icon-text spacing.

.DESCRIPTION
    Iron Rule: Every class="icon i-*" used in the codebase MUST have
    a corresponding .i-* CSS definition with a mask-image in theme.css.
    Without it, the icon renders as a solid colored square.

.PARAMETER Path
    Root path to scan (default: pages)
#>
param(
    [string]$Path = "pages"
)

$themeFile = "assets/css/theme.css"
if (-not (Test-Path $themeFile)) {
    Write-Host "  ERROR: Cannot find $themeFile" -ForegroundColor Red
    exit 1
}

$themeContent = Get-Content $themeFile -Raw
$definedIcons = @{}
$iconMatches = [regex]::Matches($themeContent, '\.(i-[a-z][a-z0-9-]+)\s*\{')
foreach ($m in $iconMatches) {
    $definedIcons[$m.Groups[1].Value] = $true
}

Write-Host ""
Write-Host "  ORPHAN ICON & SPACING CHECK" -ForegroundColor Cyan
Write-Host "  Defined icons in theme.css: $($definedIcons.Count)"
Write-Host "  Scanning: $Path"
Write-Host "  =================================================================" -ForegroundColor DarkGray

$files = Get-ChildItem -Recurse -Include *.html, *.js -Path $Path -ErrorAction SilentlyContinue
$orphans = @()
$spacingIssues = @()

foreach ($file in $files) {
    $lines = Get-Content $file.FullName -ErrorAction SilentlyContinue
    $lineNum = 0
    foreach ($line in $lines) {
        $lineNum++

        # Check for icon class references (exclude i-phone, i-pad, i-os etc.)
        $refMatches = [regex]::Matches($line, '\bi-((?!phone|pad|os)[a-z][a-z0-9-]+)')
        foreach ($rm in $refMatches) {
            $iconName = "i-$($rm.Groups[1].Value)"
            if (-not $definedIcons.ContainsKey($iconName)) {
                $relPath = $file.FullName -replace [regex]::Escape("$(Get-Location)\"), ''
                $orphans += @{ File = $relPath; Line = $lineNum; Icon = $iconName }
            }
        }

        # Check icon-text gap inconsistency
        if ($line -match 'gap-([3-9]|1[0-9])' -and $line -match 'items-center' -and $line -match 'icon') {
            $gv = [regex]::Match($line, 'gap-(\d+)').Groups[1].Value
            $relPath = $file.FullName -replace [regex]::Escape("$(Get-Location)\"), ''
            $spacingIssues += @{ File = $relPath; Line = $lineNum; Gap = "gap-$gv" }
        }
    }
}

# ---- Report ----
$hasIssues = $false

if ($orphans.Count -gt 0) {
    $hasIssues = $true
    Write-Host ""
    Write-Host "  ORPHAN ICONS (no CSS definition)" -ForegroundColor Red
    $grouped = $orphans | Group-Object { $_.Icon }
    foreach ($g in $grouped) {
        $count = $g.Count
        Write-Host "   X $($g.Name) ($count usages)" -ForegroundColor Red
        foreach ($item in $g.Group) {
            Write-Host "     $($item.File):$($item.Line)" -ForegroundColor DarkGray
        }
    }
}

if ($spacingIssues.Count -gt 0) {
    $hasIssues = $true
    Write-Host ""
    Write-Host "  ICON-TEXT SPACING VIOLATIONS" -ForegroundColor Yellow
    foreach ($s in $spacingIssues) {
        Write-Host "   ! $($s.File):$($s.Line) -- $($s.Gap) (should be gap-2)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "  =================================================================" -ForegroundColor DarkGray
Write-Host -NoNewline "  Orphan Icons:    $($orphans.Count)"
if ($orphans.Count -eq 0) { Write-Host " OK" -ForegroundColor Green } else { Write-Host " FAIL" -ForegroundColor Red }
Write-Host -NoNewline "  Spacing Issues:  $($spacingIssues.Count)"
if ($spacingIssues.Count -eq 0) { Write-Host " OK" -ForegroundColor Green } else { Write-Host " WARN" -ForegroundColor Yellow }

if (-not $hasIssues) {
    Write-Host ""
    Write-Host "  ALL ICONS REGISTERED" -ForegroundColor Green
}
Write-Host ""
