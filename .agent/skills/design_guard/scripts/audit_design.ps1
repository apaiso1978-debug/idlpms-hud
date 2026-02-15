# audit_design.ps1
# Usage: powershell .agent/skills/design_guard/scripts/audit_design.ps1 <file_path>

param (
    [Parameter(Mandatory = $true)]
    [string]$FilePath
)

if (-not (Test-Path $FilePath)) {
    Write-Error "File not found: $FilePath"
    exit 1
}

$content = Get-Content $FilePath -Raw
$violations = @()

# 1. Check for letter-spacing
if ($content -match "letter-spacing\s*:\s*(?!0)") {
    $violations += "ERROR: Forbidden 'letter-spacing' detected. Must be 0."
}

# 2. Check for rounded sizes other than 3px or standard vars
# Matches rounded-lg, rounded-xl, rounded-2xl, rounded-full
if ($content -match "rounded-(lg|xl|2xl|full|md)") {
    $violations += "ERROR: Non-standard corner radius detected. Use 'rounded-[3px]' or 'var(--vs-radius)'."
}

# 3. Check for forbidden font-weights
if ($content -match "font-weight\s*:\s*200" -or $content -match "font-weight\s*:\s*100") {
    $violations += "ERROR: Forbidden font-weight detected (100/200). Use 300 or 500."
}
if ($content -match "font-(normal|bold|semibold)") {
    $violations += "WARNING: Default font-weight detected (normal/bold). Ensure it matches 300/500 requirements (use .font-medium or explicit var)."
}

# 4. Check for HARDCODED HEX COLORS in HTML (Zero-Hardcode Policy)
if ($FilePath -match "\.html$") {
    if ($content -match "#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})") {
        $violations += "ERROR: Hardcoded Hex color found in HTML. Use '--vs-*' variables or 'vs-glass' semantic classes."
    }
}

# 5. Check for Inline SVGs (Policy: Use CSS Mask icon classes)
if ($FilePath -match "\.html$") {
    if ($content -match "<svg") {
        $violations += "WARNING: Inline SVG detected. Project policy prefers 0% Unicode/Inline SVG (use CSS Mask icon classes)."
    }
}

# 6. Check for Progress bar thickness (should be h-[3px])
if ($content -match "bg-zinc-700" -and $content -match "\bh-(1|2|3|4|5|8|10|12|16)\b") {
    $violations += "WARNING: Likely progress bar detected with non-3px height. Use 'h-[3px]'."
}

# 7. Check for Non-Semantic Tailwind Classes (Zinc Overuse)
if ($FilePath -match "\.html$") {
    if ($content -match "bg-zinc-(700|800|900)") {
        $violations += "WARNING: Direct bg-zinc-* class detected. Use --vs-bg-panel, --vs-bg-card, etc."
    }
}

if ($violations.Count -gt 0) {
    Write-Host "`n--- DESIGN AUDIT FAILED for $FilePath ---" -ForegroundColor Red
    foreach ($v in $violations) {
        Write-Host "  [!] $v" -ForegroundColor Yellow
    }
    exit 1
}
else {
    Write-Host "DESIGN AUDIT PASSED: $FilePath" -ForegroundColor Green
    exit 0
}
