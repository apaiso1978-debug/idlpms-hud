# ============================================================================
# IDLPMS Master Audit Script
# ============================================================================
# Unified quality assurance tool that combines all audit functions:
# - Design Standards Validation (Iron Rules)
# - Thai Typography Compliance
# - Zinc Color Palette Verification
# - Code Quality Checks
# - Unity & Consistency Audits
#
# Version: 2.0.0
# Author: IDLPMS Development Team
# ============================================================================

param(
    [Parameter(Position=0)]
    [ValidateSet("all", "thai", "design", "zinc", "unity", "encoding", "report", "fix")]
    [string]$Mode = "all",

    [Parameter()]
    [string]$Path = ".",

    [Parameter()]
    [switch]$Fix,

    [Parameter()]
    [switch]$Verbose,

    [Parameter()]
    [switch]$Report,

    [Parameter()]
    [string]$OutputFile = ""
)

# ============================================================================
# CONFIGURATION
# ============================================================================

$Script:Config = @{
    # Iron Rules Configuration
    IronRules = @{
        MinThaiSize = 14          # Minimum Thai text size (px) - text-sm
        MinEnglishSize = 12       # Minimum English text size (px) - text-xs
        CornerRadius = 3          # Standard border-radius (px)
        HeaderHeight = 48         # Standard header height (px)
        BorderWidth = 1           # Standard border width (px)
        BorderOpacity = 50        # Standard border opacity (%)
    }

    # Zinc Elevation System (Allowed values)
    ZincPalette = @{
        Allowed = @("zinc-850", "zinc-800", "zinc-750", "zinc-700", "zinc-600", "zinc-500",
                    "zinc-400", "zinc-300", "zinc-200", "zinc-100", "zinc-50")
        Forbidden = @("zinc-900", "zinc-950")  # Total Dark Purge
        DeepestAllowed = "zinc-850"
    }

    # Forbidden Patterns
    ForbiddenPatterns = @{
        Italic = @("italic", "font-style:\s*italic", "font-italic")
        LetterSpacing = @("letter-spacing", "tracking-")
        LargeRadius = @("rounded-lg", "rounded-xl", "rounded-2xl", "rounded-full", "rounded-3xl")
        DarkZinc = @("zinc-900", "zinc-950", "bg-zinc-900", "bg-zinc-950", "text-zinc-900", "text-zinc-950")
    }

    # File Patterns
    FilePatterns = @{
        HTML = "*.html"
        CSS = "*.css"
        JS = "*.js"
        All = @("*.html", "*.css", "*.js")
    }

    # Thai Text Patterns (for small text detection)
    ThaiSmallTextPatterns = @(
        "text-\[(\d+)px\]",     # text-[Npx] format
        "text-xs",              # 12px
        "text-\[1[0-3]px\]",    # text-[10px] to text-[13px]
        "font-size:\s*(\d+)px"  # inline font-size
    )
}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

function Write-AuditHeader {
    param([string]$Title)

    $line = "=" * 60
    Write-Host ""
    Write-Host $line -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor White
    Write-Host $line -ForegroundColor Cyan
    Write-Host ""
}

function Write-AuditSection {
    param([string]$Title)

    Write-Host ""
    Write-Host "--- $Title ---" -ForegroundColor Yellow
    Write-Host ""
}

function Write-AuditResult {
    param(
        [string]$Status,  # PASS, FAIL, WARN, INFO
        [string]$Message,
        [string]$File = "",
        [int]$Line = 0
    )

    $icon = switch ($Status) {
        "PASS" { "[OK]"; $color = "Green" }
        "FAIL" { "[!!]"; $color = "Red" }
        "WARN" { "[??]"; $color = "Yellow" }
        "INFO" { "[--]"; $color = "Cyan" }
        default { "[  ]"; $color = "White" }
    }

    $location = ""
    if ($File) {
        $location = " ($File"
        if ($Line -gt 0) { $location += ":$Line" }
        $location += ")"
    }

    Write-Host "$icon " -ForegroundColor $color -NoNewline
    Write-Host "$Message$location"
}

function Get-ProjectFiles {
    param(
        [string]$BasePath,
        [string[]]$Patterns
    )

    $files = @()
    foreach ($pattern in $Patterns) {
        $found = Get-ChildItem -Path $BasePath -Filter $pattern -Recurse -File -ErrorAction SilentlyContinue |
                 Where-Object { $_.FullName -notmatch "node_modules|\.git|\.agent" }
        $files += $found
    }
    return $files | Sort-Object -Property FullName -Unique
}

function Test-ContainsThai {
    param([string]$Text)
    return $Text -match '[\u0E00-\u0E7F]'
}

function Get-TextSizeFromClass {
    param([string]$Class)

    $sizeMap = @{
        "text-xs" = 12
        "text-sm" = 14
        "text-base" = 16
        "text-lg" = 18
        "text-xl" = 20
        "text-2xl" = 24
        "text-3xl" = 30
        "text-4xl" = 36
        "text-5xl" = 48
    }

    if ($sizeMap.ContainsKey($Class)) {
        return $sizeMap[$Class]
    }

    # Check for custom size text-[Npx]
    if ($Class -match 'text-\[(\d+)px\]') {
        return [int]$Matches[1]
    }

    return $null
}

# ============================================================================
# AUDIT FUNCTIONS
# ============================================================================

function Invoke-ThaiTypographyAudit {
    param([string]$BasePath)

    Write-AuditSection "Thai Typography Audit (Iron Rule #4)"

    $results = @{
        Passed = 0
        Failed = 0
        Warnings = 0
        Issues = @()
    }

    $files = Get-ProjectFiles -BasePath $BasePath -Patterns @("*.html", "*.js")

    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        $lines = Get-Content -Path $file.FullName -Encoding UTF8
        $lineNum = 0

        foreach ($line in $lines) {
            $lineNum++

            # Skip if line doesn't contain Thai
            if (-not (Test-ContainsThai $line)) { continue }

            # Check for small text classes with Thai content
            $smallTextClasses = @("text-xs", "text-\[1[0-3]px\]", "text-\[10px\]", "text-\[11px\]", "text-\[12px\]", "text-\[13px\]")

            foreach ($pattern in $smallTextClasses) {
                if ($line -match $pattern) {
                    $results.Failed++
                    $results.Issues += @{
                        File = $file.Name
                        Line = $lineNum
                        Issue = "Thai text with small size class: $($Matches[0])"
                        Content = $line.Trim().Substring(0, [Math]::Min(80, $line.Trim().Length))
                    }
                    Write-AuditResult -Status "FAIL" -Message "Thai text too small" -File $file.Name -Line $lineNum
                }
            }

            # Check for hud-badge-micro with Thai (should be English only)
            if ($line -match 'hud-badge-micro' -and (Test-ContainsThai $line)) {
                $results.Warnings++
                Write-AuditResult -Status "WARN" -Message "hud-badge-micro contains Thai text" -File $file.Name -Line $lineNum
            }
        }
    }

    if ($results.Failed -eq 0) {
        Write-AuditResult -Status "PASS" -Message "All Thai text meets minimum size requirement (14px)"
        $results.Passed++
    }

    return $results
}

function Invoke-ZincPaletteAudit {
    param([string]$BasePath)

    Write-AuditSection "Zinc Color Palette Audit (Iron Rule #2)"

    $results = @{
        Passed = 0
        Failed = 0
        Warnings = 0
        Issues = @()
    }

    $files = Get-ProjectFiles -BasePath $BasePath -Patterns @("*.html", "*.css", "*.js")

    foreach ($file in $files) {
        $lines = Get-Content -Path $file.FullName -Encoding UTF8
        $lineNum = 0

        foreach ($line in $lines) {
            $lineNum++

            # Check for forbidden dark zinc colors
            foreach ($forbidden in $Script:Config.ZincPalette.Forbidden) {
                if ($line -match $forbidden) {
                    $results.Failed++
                    $results.Issues += @{
                        File = $file.Name
                        Line = $lineNum
                        Issue = "Forbidden zinc color: $forbidden (Total Dark Purge)"
                    }
                    Write-AuditResult -Status "FAIL" -Message "Forbidden color: $forbidden" -File $file.Name -Line $lineNum
                }
            }
        }
    }

    if ($results.Failed -eq 0) {
        Write-AuditResult -Status "PASS" -Message "No forbidden zinc colors found (zinc-900, zinc-950 purged)"
        $results.Passed++
    }

    return $results
}

function Invoke-DesignStandardsAudit {
    param([string]$BasePath)

    Write-AuditSection "Design Standards Audit (Iron Rules)"

    $results = @{
        Passed = 0
        Failed = 0
        Warnings = 0
        Issues = @()
    }

    $files = Get-ProjectFiles -BasePath $BasePath -Patterns @("*.html", "*.css", "*.js")

    foreach ($file in $files) {
        $lines = Get-Content -Path $file.FullName -Encoding UTF8
        $lineNum = 0

        foreach ($line in $lines) {
            $lineNum++

            # Check for italic (Iron Rule #11)
            foreach ($pattern in $Script:Config.ForbiddenPatterns.Italic) {
                if ($line -match $pattern) {
                    $results.Failed++
                    Write-AuditResult -Status "FAIL" -Message "Italic detected (forbidden)" -File $file.Name -Line $lineNum
                }
            }

            # Check for letter-spacing (Iron Rule #5)
            foreach ($pattern in $Script:Config.ForbiddenPatterns.LetterSpacing) {
                if ($line -match $pattern -and $line -notmatch 'tracking-\[0') {
                    # Allow tracking-[0.1em] etc for HUD badges
                    if ($line -notmatch 'hud-badge' -and $line -notmatch 'ACTIVE') {
                        $results.Warnings++
                        Write-AuditResult -Status "WARN" -Message "Letter-spacing detected" -File $file.Name -Line $lineNum
                    }
                }
            }

            # Check for large border-radius (Iron Rule #13)
            foreach ($pattern in $Script:Config.ForbiddenPatterns.LargeRadius) {
                if ($line -match $pattern) {
                    $results.Failed++
                    Write-AuditResult -Status "FAIL" -Message "Large border-radius: $pattern (use rounded-[3px])" -File $file.Name -Line $lineNum
                }
            }
        }
    }

    if ($results.Failed -eq 0 -and $results.Warnings -eq 0) {
        Write-AuditResult -Status "PASS" -Message "All design standards met"
        $results.Passed++
    }

    return $results
}

function Invoke-UnityAudit {
    param([string]$BasePath)

    Write-AuditSection "Unity & Consistency Audit"

    $results = @{
        Passed = 0
        Failed = 0
        Warnings = 0
        Issues = @()
    }

    $files = Get-ProjectFiles -BasePath $BasePath -Patterns @("*.html")

    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8

        # Check for 48px header height consistency
        if ($content -match 'h-\[48px\]|height:\s*48px|--vs-header-height') {
            Write-AuditResult -Status "INFO" -Message "48px header rule applied" -File $file.Name
        }

        # Check for vs-glass usage on panels
        if ($content -match 'vs-sidebar-panel|vs-activity-bar') {
            if ($content -notmatch 'vs-glass') {
                $results.Warnings++
                Write-AuditResult -Status "WARN" -Message "Panel without vs-glass class" -File $file.Name
            }
        }

        # Check for consistent CSS variable usage
        $cssVars = @("--vs-bg-deep", "--vs-bg-panel", "--vs-border", "--vs-accent")
        foreach ($var in $cssVars) {
            if ($content -match [regex]::Escape($var)) {
                $results.Passed++
            }
        }
    }

    Write-AuditResult -Status "PASS" -Message "Unity audit completed"
    return $results
}

function Invoke-EncodingAudit {
    param([string]$BasePath)

    Write-AuditSection "File Encoding Audit (UTF-8)"

    $results = @{
        Passed = 0
        Failed = 0
        Warnings = 0
        Issues = @()
    }

    $files = Get-ProjectFiles -BasePath $BasePath -Patterns @("*.html", "*.css", "*.js")

    foreach ($file in $files) {
        try {
            $bytes = [System.IO.File]::ReadAllBytes($file.FullName)

            # Check for BOM
            $hasBOM = ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)

            if ($hasBOM) {
                $results.Warnings++
                Write-AuditResult -Status "WARN" -Message "File has UTF-8 BOM" -File $file.Name
            }

            # Check for charset declaration in HTML
            if ($file.Extension -eq ".html") {
                $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
                if ($content -match 'charset=["'']?UTF-8["'']?' -or $content -match 'charset=["'']?utf-8["'']?') {
                    $results.Passed++
                } else {
                    $results.Warnings++
                    Write-AuditResult -Status "WARN" -Message "Missing charset=UTF-8 declaration" -File $file.Name
                }
            }
        } catch {
            $results.Failed++
            Write-AuditResult -Status "FAIL" -Message "Cannot read file: $_" -File $file.Name
        }
    }

    Write-AuditResult -Status "PASS" -Message "Encoding audit completed"
    return $results
}

function Invoke-PlaceholderAudit {
    param([string]$BasePath)

    Write-AuditSection "Placeholder Content Audit"

    $results = @{
        Passed = 0
        Failed = 0
        Warnings = 0
        Issues = @()
    }

    $placeholders = @(
        "TODO",
        "FIXME",
        "XXX",
        "HACK",
        "Lorem ipsum",
        "placeholder",
        "example.com",
        "test@test.com"
    )

    $files = Get-ProjectFiles -BasePath $BasePath -Patterns @("*.html", "*.js")

    foreach ($file in $files) {
        $lines = Get-Content -Path $file.FullName -Encoding UTF8
        $lineNum = 0

        foreach ($line in $lines) {
            $lineNum++

            foreach ($placeholder in $placeholders) {
                if ($line -match [regex]::Escape($placeholder)) {
                    $results.Warnings++
                    Write-AuditResult -Status "WARN" -Message "Placeholder found: $placeholder" -File $file.Name -Line $lineNum
                }
            }
        }
    }

    if ($results.Warnings -eq 0) {
        Write-AuditResult -Status "PASS" -Message "No placeholder content found"
        $results.Passed++
    }

    return $results
}

# ============================================================================
# FIX FUNCTIONS
# ============================================================================

function Invoke-AutoFix {
    param([string]$BasePath)

    Write-AuditSection "Auto-Fix Mode"
    Write-Host "Running automatic fixes..." -ForegroundColor Magenta

    $fixCount = 0
    $files = Get-ProjectFiles -BasePath $BasePath -Patterns @("*.html", "*.css")

    foreach ($file in $files) {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        $originalContent = $content

        # Fix: Replace zinc-900/950 with zinc-850
        $content = $content -replace 'bg-zinc-900', 'bg-zinc-850'
        $content = $content -replace 'bg-zinc-950', 'bg-zinc-850'
        $content = $content -replace 'text-zinc-900(?!/)', 'text-zinc-850'
        $content = $content -replace 'text-zinc-950', 'text-zinc-850'

        # Fix: Replace rounded-lg/xl/full with rounded-[3px]
        $content = $content -replace 'rounded-lg(?!\[)', 'rounded-[3px]'
        $content = $content -replace 'rounded-xl', 'rounded-[3px]'
        $content = $content -replace 'rounded-2xl', 'rounded-[3px]'
        $content = $content -replace 'rounded-full(?!\s*overflow)', 'rounded-[3px]'  # Keep rounded-full for avatars

        # Save if changed
        if ($content -ne $originalContent) {
            Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
            $fixCount++
            Write-AuditResult -Status "INFO" -Message "Fixed" -File $file.Name
        }
    }

    Write-Host ""
    Write-Host "Fixed $fixCount file(s)" -ForegroundColor Green
}

# ============================================================================
# REPORT GENERATION
# ============================================================================

function New-AuditReport {
    param(
        [hashtable]$Results,
        [string]$OutputFile
    )

    $report = @"
# IDLPMS Audit Report
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Summary

| Category | Passed | Failed | Warnings |
|----------|--------|--------|----------|
| Thai Typography | $($Results.Thai.Passed) | $($Results.Thai.Failed) | $($Results.Thai.Warnings) |
| Zinc Palette | $($Results.Zinc.Passed) | $($Results.Zinc.Failed) | $($Results.Zinc.Warnings) |
| Design Standards | $($Results.Design.Passed) | $($Results.Design.Failed) | $($Results.Design.Warnings) |
| Unity | $($Results.Unity.Passed) | $($Results.Unity.Failed) | $($Results.Unity.Warnings) |
| Encoding | $($Results.Encoding.Passed) | $($Results.Encoding.Failed) | $($Results.Encoding.Warnings) |

## Total
- **Passed:** $($Results.Thai.Passed + $Results.Zinc.Passed + $Results.Design.Passed + $Results.Unity.Passed + $Results.Encoding.Passed)
- **Failed:** $($Results.Thai.Failed + $Results.Zinc.Failed + $Results.Design.Failed + $Results.Unity.Failed + $Results.Encoding.Failed)
- **Warnings:** $($Results.Thai.Warnings + $Results.Zinc.Warnings + $Results.Design.Warnings + $Results.Unity.Warnings + $Results.Encoding.Warnings)

## Iron Rules Reference
1. 48px Vertical Rule
2. Zinc Elevation System (850-baseline, no 900/950)
3. 100% Heroicons
4. Thai minimum 14px, English minimum 12px
5. Zero Letter-Spacing
6. Luminance Hierarchy
7. Semantic Colors
8. Micro-interactions
9. 4-Pixel Grid System
10. CSS-First Policy
11. Zero Italic
12. 1px Border at 50% opacity
13. 3px Corner Radius
14. Subject Semantic Palette

---
*IDLPMS Audit System v2.0.0*
"@

    if ($OutputFile) {
        Set-Content -Path $OutputFile -Value $report -Encoding UTF8
        Write-Host "Report saved to: $OutputFile" -ForegroundColor Green
    }

    return $report
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

function Main {
    Write-AuditHeader "IDLPMS Master Audit System v2.0.0"

    $startTime = Get-Date
    $basePath = Resolve-Path $Path

    Write-Host "Audit Path: $basePath" -ForegroundColor Gray
    Write-Host "Mode: $Mode" -ForegroundColor Gray
    Write-Host ""

    $allResults = @{
        Thai = @{ Passed = 0; Failed = 0; Warnings = 0; Issues = @() }
        Zinc = @{ Passed = 0; Failed = 0; Warnings = 0; Issues = @() }
        Design = @{ Passed = 0; Failed = 0; Warnings = 0; Issues = @() }
        Unity = @{ Passed = 0; Failed = 0; Warnings = 0; Issues = @() }
        Encoding = @{ Passed = 0; Failed = 0; Warnings = 0; Issues = @() }
    }

    # Run audits based on mode
    switch ($Mode) {
        "all" {
            $allResults.Thai = Invoke-ThaiTypographyAudit -BasePath $basePath
            $allResults.Zinc = Invoke-ZincPaletteAudit -BasePath $basePath
            $allResults.Design = Invoke-DesignStandardsAudit -BasePath $basePath
            $allResults.Unity = Invoke-UnityAudit -BasePath $basePath
            $allResults.Encoding = Invoke-EncodingAudit -BasePath $basePath
            Invoke-PlaceholderAudit -BasePath $basePath | Out-Null
        }
        "thai" {
            $allResults.Thai = Invoke-ThaiTypographyAudit -BasePath $basePath
        }
        "design" {
            $allResults.Design = Invoke-DesignStandardsAudit -BasePath $basePath
        }
        "zinc" {
            $allResults.Zinc = Invoke-ZincPaletteAudit -BasePath $basePath
        }
        "unity" {
            $allResults.Unity = Invoke-UnityAudit -BasePath $basePath
        }
        "encoding" {
            $allResults.Encoding = Invoke-EncodingAudit -BasePath $basePath
        }
        "fix" {
            Invoke-AutoFix -BasePath $basePath
        }
        "report" {
            $allResults.Thai = Invoke-ThaiTypographyAudit -BasePath $basePath
            $allResults.Zinc = Invoke-ZincPaletteAudit -BasePath $basePath
            $allResults.Design = Invoke-DesignStandardsAudit -BasePath $basePath
            $allResults.Unity = Invoke-UnityAudit -BasePath $basePath
            $allResults.Encoding = Invoke-EncodingAudit -BasePath $basePath
        }
    }

    # Auto-fix if requested
    if ($Fix -and $Mode -ne "fix") {
        Invoke-AutoFix -BasePath $basePath
    }

    # Generate report if requested
    if ($Report -or $Mode -eq "report") {
        $reportFile = if ($OutputFile) { $OutputFile } else { "audit_report_$(Get-Date -Format 'yyyyMMdd_HHmmss').md" }
        New-AuditReport -Results $allResults -OutputFile $reportFile
    }

    # Summary
    $endTime = Get-Date
    $duration = ($endTime - $startTime).TotalSeconds

    Write-AuditHeader "Audit Complete"

    $totalFailed = $allResults.Thai.Failed + $allResults.Zinc.Failed + $allResults.Design.Failed + $allResults.Unity.Failed + $allResults.Encoding.Failed
    $totalWarnings = $allResults.Thai.Warnings + $allResults.Zinc.Warnings + $allResults.Design.Warnings + $allResults.Unity.Warnings + $allResults.Encoding.Warnings

    if ($totalFailed -eq 0 -and $totalWarnings -eq 0) {
        Write-Host "  Status: ALL CHECKS PASSED" -ForegroundColor Green
    } elseif ($totalFailed -eq 0) {
        Write-Host "  Status: PASSED WITH WARNINGS ($totalWarnings)" -ForegroundColor Yellow
    } else {
        Write-Host "  Status: FAILED ($totalFailed issues, $totalWarnings warnings)" -ForegroundColor Red
    }

    Write-Host "  Duration: $([math]::Round($duration, 2))s" -ForegroundColor Gray
    Write-Host ""

    # Return exit code
    if ($totalFailed -gt 0) {
        exit 1
    }
    exit 0
}

# Run main
Main
