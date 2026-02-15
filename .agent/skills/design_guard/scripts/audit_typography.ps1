# Typography Audit Script
# Scans for prohibited font-size patterns in HTML/JS files

param(
    [string]$Path = "."
)

$violations = @()
$patterns = @(
    'text-xs',
    'text-\[10px\]',
    'text-\[11px\]',
    'text-\[12px\]',
    'text-\[13px\]'
)

$files = Get-ChildItem -Path $Path -Recurse -Include *.html, *.js -File | Where-Object { $_.FullName -notmatch '\\node_modules\\|\\\.git\\' }

foreach ($file in $files) {
    $lineNum = 0
    foreach ($line in Get-Content $file.FullName) {
        $lineNum++
        foreach ($pattern in $patterns) {
            if ($line -match $pattern) {
                $violations += [PSCustomObject]@{
                    File    = $file.FullName.Replace((Get-Location).Path + "\", "")
                    Line    = $lineNum
                    Pattern = $pattern
                    Content = $line.Trim().Substring(0, [Math]::Min(80, $line.Trim().Length))
                }
            }
        }
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  TYPOGRAPHY AUDIT REPORT" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($violations.Count -eq 0) {
    Write-Host "  ✅ NO VIOLATIONS FOUND" -ForegroundColor Green
    Write-Host "  All text sizes comply with Typography Lockdown rules." -ForegroundColor Gray
}
else {
    Write-Host "  ❌ $($violations.Count) VIOLATION(S) FOUND" -ForegroundColor Red
    Write-Host ""
    
    foreach ($v in $violations) {
        Write-Host "  File: " -NoNewline -ForegroundColor Yellow
        Write-Host $v.File
        Write-Host "  Line: " -NoNewline -ForegroundColor Yellow
        Write-Host $v.Line
        Write-Host "  Pattern: " -NoNewline -ForegroundColor Red
        Write-Host $v.Pattern
        Write-Host "  Content: " -NoNewline -ForegroundColor Gray
        Write-Host $v.Content
        Write-Host "  ---"
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
