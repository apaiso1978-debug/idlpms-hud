# ═══════════════════════════════════════════════════════════════════════════
# IRON RULES LINT SCRIPT v2.0
# Covers ALL 16 rules from SKILL.md (Single Source of Truth)
# Run: powershell -ExecutionPolicy Bypass -File ".agent/skills/design_guard/scripts/lint_iron_rules.ps1"
# ═══════════════════════════════════════════════════════════════════════════

param(
    [string]$Path = "pages",
    [switch]$Verbose = $false
)

$ErrorCount = 0
$WarningCount = 0
$RuleNum = 0
$TotalRules = 16

function Check-Rule {
    param(
        [string]$Name,
        [string]$Pattern,
        [string]$Severity = "ERROR",
        [string]$ExcludePattern = "",
        [string[]]$Include = @("*.html", "*.js"),
        [string[]]$ExcludePath = @("node_modules", ".git", "manual")
    )
    
    $script:RuleNum++
    Write-Host "[$script:RuleNum/$TotalRules] $Name" -ForegroundColor Yellow
    
    $files = Get-ChildItem -Path $Path -Recurse -Include $Include -File -ErrorAction SilentlyContinue |
    Where-Object { 
        $p = $_.FullName
        -not ($ExcludePath | Where-Object { $p -match [regex]::Escape($_) })
    }
    
    $findings = [System.Collections.ArrayList]::new()
    foreach ($file in $files) {
        $lineNum = 0
        foreach ($line in (Get-Content $file.FullName -ErrorAction SilentlyContinue)) {
            $lineNum++
            if ($line -match $Pattern) {
                if ($ExcludePattern -and $line -match $ExcludePattern) { continue }
                $null = $findings.Add([PSCustomObject]@{
                        File    = $file.FullName.Replace((Get-Location).Path + "\", "")
                        Line    = $lineNum
                        Content = $line.Trim().Substring(0, [Math]::Min(100, $line.Trim().Length))
                    })
            }
        }
    }
    
    if ($findings.Count -gt 0) {
        if ($Severity -eq "ERROR") {
            Write-Host "  X FAIL: $($findings.Count) violation(s)" -ForegroundColor Red
            $script:ErrorCount += $findings.Count
        }
        else {
            Write-Host "  ! WARN: $($findings.Count) issue(s)" -ForegroundColor DarkYellow
            $script:WarningCount += $findings.Count
        }
        if ($Verbose) {
            $findings | ForEach-Object {
                Write-Host "     $($_.File):$($_.Line)" -ForegroundColor Gray
                Write-Host "     > $($_.Content)" -ForegroundColor DarkGray
            }
        }
        else {
            $findings | Select-Object -First 5 | ForEach-Object {
                Write-Host "     $($_.File):$($_.Line)" -ForegroundColor Gray
            }
            if ($findings.Count -gt 5) {
                Write-Host "     ... and $($findings.Count - 5) more" -ForegroundColor DarkGray
            }
        }
    }
    else {
        Write-Host "  OK PASS" -ForegroundColor Green
    }
    Write-Host ""
}

# ═══════════════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "  IRON RULES COMPLIANCE CHECK v2.0" -ForegroundColor Cyan
Write-Host "  Scanning: $Path" -ForegroundColor Gray
Write-Host "  Rules: $TotalRules" -ForegroundColor Gray
Write-Host ("=" * 65) -ForegroundColor Cyan
Write-Host ""

# ─── Rule 1: Banned Font Sizes ───────────────────────────────────────────
Check-Rule `
    -Name "Banned Font Sizes (text-xs, text-sm, text-[11px], etc.)" `
    -Pattern "text-xs|text-sm(?!\s)|text-\[10px\]|text-\[11px\]|text-\[12px\]|text-\[14px\]|text-base" `
    -ExcludePattern "hud-badge-micro"

# ─── Rule 2: Banned Font Weight: font-bold ───────────────────────────────
Check-Rule `
    -Name "Banned Font Weight: font-bold" `
    -Pattern "font-bold" `
    -ExcludePattern "font-light"

# ─── Rule 3: Banned Font Weight: font-semibold / font-medium ─────────────
Check-Rule `
    -Name "Banned Font Weight: font-semibold / font-medium" `
    -Pattern "font-semibold|font-medium" `
    -ExcludePattern "hud-badge-micro"

# ─── Rule 4: Banned Font Weight: font-extralight ─────────────────────────
Check-Rule `
    -Name "Banned Font Weight: font-extralight (200)" `
    -Pattern "font-extralight|font-weight:\s*200"

# ─── Rule 5: Banned Corners ──────────────────────────────────────────────
Check-Rule `
    -Name "Banned Corners: rounded-full/lg/xl (except <=8px dots)" `
    -Pattern "rounded-(full|lg|xl|2xl|md)" `
    -ExcludePattern "pulse-dot|w-[1-2]\s|h-[1-2]\s"

# ─── Rule 6: Solid Fill Buttons/Badges (Neon Violation) ──────────────────
Check-Rule `
    -Name "Solid Fill (Neon Violation): bg solid accent/success/danger" `
    -Pattern "background:\s*var\(--vs-(accent|success|danger|warning)\)|bg-\[var\(--vs-(accent|success|danger|warning)\)\]" `
    -ExcludePattern "background-color|icon|mask|w-[0-2]|h-[0-4]\s|h-full|animate-|pulse" `
    -Severity "ERROR"

# ─── Rule 7: Border Thickness > 1px ──────────────────────────────────────
Check-Rule `
    -Name "Border Thickness > 1px" `
    -Pattern "border(-[trbl])?:\s*[2-9]px|border-[2-9]\b|border-b-[2-9]" `
    -ExcludePattern "border-radius|border-collapse|animate-spin|spinner"

# ─── Rule 8: Border 100% Opacity (must be 50%) ──────────────────────────
Check-Rule `
    -Name "Border 100% Opacity (should be rgba 50%)" `
    -Pattern "border.*solid\s+var\(--vs-border\)|border-\[var\(--vs-border\)\]" `
    -Severity "WARNING"

# ─── Rule 9: Letter Spacing ─────────────────────────────────────────────
Check-Rule `
    -Name "Letter Spacing (tracking-*)" `
    -Pattern "tracking-(widest|wider|wide|tight|tighter|normal|\[)"

# ─── Rule 10: Color Opacity Shorthand (White Fallback Risk) ─────────────
Check-Rule `
    -Name "Color Opacity Shorthand (white fallback risk)" `
    -Pattern "(border|bg)-\[var\([^\)]+\)\]/"

# ─── Rule 11: Input Background Wrong ────────────────────────────────────
Check-Rule `
    -Name "Input bg should be var(--vs-bg-deep), not bg-card" `
    -Pattern "\.form-input.*bg-card|form-input.*background.*bg-card" `
    -Include @("*.html", "*.css") `
    -Severity "ERROR"

# ─── Rule 12: Icon-Text Gap ──────────────────────────────────────────────
Check-Rule `
    -Name "Icon-Text Gap: items-center gap-1 (too tight, use gap-1.5 or gap-2)" `
    -Pattern "items-center\s+gap-1[^.]|items-start\s+gap-1[^.]" `
    -ExcludePattern "tab-btn|tab-nav|flex gap-1 border|flex gap-1 flex-wrap" `
    -Severity "ERROR"

Check-Rule `
    -Name "Icon-Text Gap: items-center gap-3+ (should be gap-2)" `
    -Pattern "items-center\s+gap-[3-9]|items-start\s+gap-[3-9]" `
    -Severity "WARNING"

# ─── Rule 13: Font Style Italic ──────────────────────────────────────────
Check-Rule `
    -Name "Italic Text (banned)" `
    -Pattern "font-style:\s*italic|(?<!\-)italic\b" `
    -ExcludePattern "font-style:\s*normal|not-italic"

# ─── Rule 14: Drop Shadows ──────────────────────────────────────────────
Check-Rule `
    -Name "Drop Shadows (use glow only)" `
    -Pattern "shadow-(sm|md|lg|xl|2xl)\b" `
    -ExcludePattern "box-shadow:\s*0\s+0\s"

# ─── Rule 15: Hardcoded Zinc Classes ─────────────────────────────────────
Check-Rule `
    -Name "Hardcoded Zinc Classes (use semantic vars)" `
    -Pattern "bg-zinc-(700|800|900)\b|text-zinc-[0-9]" `
    -Severity "WARNING"

# ─── Rule 16: Template Literal Spaces ────────────────────────────────────
Check-Rule `
    -Name "Template Literal HTML (spaces in < >)" `
    -Pattern "<\s+\w+\s+(class|id|style)" `
    -Include @("*.js", "*.html")

# ═══════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════════

Write-Host ("=" * 65) -ForegroundColor Cyan
Write-Host "  SUMMARY" -ForegroundColor Cyan
Write-Host ("=" * 65) -ForegroundColor Cyan
Write-Host "  Errors:   $ErrorCount" -ForegroundColor $(if ($ErrorCount -gt 0) { "Red" } else { "Green" })
Write-Host "  Warnings: $WarningCount" -ForegroundColor $(if ($WarningCount -gt 0) { "Yellow" } else { "Green" })
Write-Host ""

if ($ErrorCount -gt 0) {
    Write-Host "  X COMPLIANCE CHECK FAILED" -ForegroundColor Red
    Write-Host "  Fix all errors before submitting UI work." -ForegroundColor Gray
    exit 1
}
elseif ($WarningCount -gt 0) {
    Write-Host "  ! PASSED WITH WARNINGS" -ForegroundColor Yellow
    exit 0
}
else {
    Write-Host "  OK ALL 16 IRON RULES COMPLIANT" -ForegroundColor Green
    exit 0
}
