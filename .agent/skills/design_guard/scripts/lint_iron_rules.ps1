# ═══════════════════════════════════════════════════════════════════════════
# IRON RULES LINT SCRIPT
# Automatically detects violations of the WEBVI Design Guard rules
# Run: powershell .agent/skills/design_guard/scripts/lint_iron_rules.ps1
# ═══════════════════════════════════════════════════════════════════════════

param(
    [string]$Path = ".",
    [switch]$Fix = $false
)

$ErrorCount = 0
$WarningCount = 0

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           IRON RULES COMPLIANCE CHECK                            ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# RULE 1: Typography (text-xs banned for English)
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "[1/4] Checking Typography (text-xs)..." -ForegroundColor Yellow

$textXsFiles = Get-ChildItem -Path $Path -Recurse -Include "*.html", "*.js" | 
Select-String -Pattern "text-xs" -SimpleMatch |
Where-Object { $_.Path -notmatch "node_modules|\.git|manual" }

if ($textXsFiles) {
    Write-Host "  ❌ FAIL: Found text-xs violations:" -ForegroundColor Red
    $textXsFiles | ForEach-Object {
        Write-Host "     $($_.Path):$($_.LineNumber)" -ForegroundColor Gray
        $ErrorCount++
    }
}
else {
    Write-Host "  ✅ PASS: No text-xs violations" -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────────────────────
# RULE 2: Color Integrity (opacity shorthand banned)
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "[2/4] Checking Color Integrity (opacity shorthand)..." -ForegroundColor Yellow

$colorViolations = Get-ChildItem -Path $Path -Recurse -Include "*.html", "*.js" |
Select-String -Pattern "(border|bg)-\[var\(--[^\)]+\)\]/" |
Where-Object { $_.Path -notmatch "node_modules|\.git|manual" }

if ($colorViolations) {
    Write-Host "  ❌ FAIL: Found unsafe color patterns:" -ForegroundColor Red
    $colorViolations | ForEach-Object {
        Write-Host "     $($_.Path):$($_.LineNumber)" -ForegroundColor Gray
        $ErrorCount++
    }
}
else {
    Write-Host "  ✅ PASS: No color integrity violations" -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────────────────────
# RULE 3: Font Weight (font-medium banned except in hud-badge-micro)
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "[3/4] Checking Font Weight (font-medium)..." -ForegroundColor Yellow

$fontMediumFiles = Get-ChildItem -Path $Path -Recurse -Include "*.html", "*.js" |
Select-String -Pattern "font-medium" -SimpleMatch |
Where-Object { $_.Path -notmatch "node_modules|\.git" -and $_.Line -notmatch "hud-badge-micro" }

if ($fontMediumFiles) {
    Write-Host "  ⚠️ WARN: Found font-medium (may need review):" -ForegroundColor DarkYellow
    $fontMediumFiles | ForEach-Object {
        Write-Host "     $($_.Path):$($_.LineNumber)" -ForegroundColor Gray
        $WarningCount++
    }
}
else {
    Write-Host "  ✅ PASS: No font-medium violations" -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────────────────────
# RULE 4: Letter Spacing (tracking-* banned)
# ─────────────────────────────────────────────────────────────────────────────
Write-Host "[4/4] Checking Letter Spacing (tracking-*)..." -ForegroundColor Yellow

$trackingFiles = Get-ChildItem -Path $Path -Recurse -Include "*.html", "*.js" |
Select-String -Pattern "tracking-(widest|tighter|tight|wide|\[)" |
Where-Object { $_.Path -notmatch "node_modules|\.git" }

if ($trackingFiles) {
    Write-Host "  ⚠️ WARN: Found tracking-* classes:" -ForegroundColor DarkYellow
    $trackingFiles | ForEach-Object {
        Write-Host "     $($_.Path):$($_.LineNumber)" -ForegroundColor Gray
        $WarningCount++
    }
}
else {
    Write-Host "  ✅ PASS: No letter-spacing violations" -ForegroundColor Green
}

# ─────────────────────────────────────────────────────────────────────────────
# SUMMARY
# ─────────────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SUMMARY" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Errors:   $ErrorCount" -ForegroundColor $(if ($ErrorCount -gt 0) { "Red" } else { "Green" })
Write-Host "  Warnings: $WarningCount" -ForegroundColor $(if ($WarningCount -gt 0) { "Yellow" } else { "Green" })
Write-Host ""

if ($ErrorCount -gt 0) {
    Write-Host "  ❌ COMPLIANCE CHECK FAILED" -ForegroundColor Red
    exit 1
}
elseif ($WarningCount -gt 0) {
    Write-Host "  ⚠️ COMPLIANCE CHECK PASSED WITH WARNINGS" -ForegroundColor Yellow
    exit 0
}
else {
    Write-Host "  ✅ ALL IRON RULES COMPLIANT" -ForegroundColor Green
    exit 0
}
