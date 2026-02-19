# Typography Audit Script
# Scans for prohibited font-size patterns in HTML/JS files

param(
    [string]$Path = "."
)

$violations = @()
$patterns = @(
    @{ Pattern = 'text-xs'; Label = 'text-xs (12px)' },
    @{ Pattern = 'text-sm(?!\s)'; Label = 'text-sm (14px)' },
    @{ Pattern = 'text-base'; Label = 'text-base (16px)' },
    @{ Pattern = 'text-\[10px\]'; Label = 'text-[10px]' },
    @{ Pattern = 'text-\[11px\]'; Label = 'text-[11px]' },
    @{ Pattern = 'text-\[12px\]'; Label = 'text-[12px]' },
    @{ Pattern = 'text-\[14px\]'; Label = 'text-[14px]' }
)

# NOTE: text-[13px] is the STANDARD — do NOT flag it as a violation!

$files = Get-ChildItem -Path $Path -Recurse -Include *.html, *.js -File | Where-Object { $_.FullName -notmatch '\\node_modules\\|\\.git\\' }

foreach ($file in $files) {
    $lineNum = 0
    foreach ($line in Get-Content $file.FullName) {
        $lineNum++
        foreach ($p in $patterns) {
            if ($line -match $p.Pattern) {
                $violations += [PSCustomObject]@{
                    File    = $file.FullName.Replace((Get-Location).Path + "\", "")
                    Line    = $lineNum
                    Pattern = $p.Label
                    Content = $line.Trim().Substring(0, [Math]::Min(80, $line.Trim().Length))
                }
            }
        }
    }
}

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "  TYPOGRAPHY AUDIT REPORT" -ForegroundColor Cyan
Write-Host "  Standard: text-[13px] font-light (weight 300)" -ForegroundColor Gray
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""

if ($violations.Count -eq 0) {
    Write-Host "  OK NO VIOLATIONS FOUND" -ForegroundColor Green
    Write-Host "  All text sizes comply with 13px Unity Rule." -ForegroundColor Gray
}
else {
    Write-Host "  X $($violations.Count) VIOLATION(S) FOUND" -ForegroundColor Red
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
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""
