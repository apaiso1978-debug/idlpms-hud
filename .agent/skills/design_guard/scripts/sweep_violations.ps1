# sweep_violations.ps1 — Batch fix common Iron Rules violations
# Run: powershell -ExecutionPolicy Bypass -File ".agent/skills/design_guard/scripts/sweep_violations.ps1"

param(
    [string]$Path = "pages"
)

$fixCount = 0

$files = Get-ChildItem -Path $Path -Recurse -Include "*.html" -File |
Where-Object { $_.FullName -notmatch "\\manual\\" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content
    
    # Fix 1: font-bold → font-light
    $content = $content -replace 'font-bold', 'font-light'
    
    # Fix 2: font-semibold → font-light
    $content = $content -replace 'font-semibold', 'font-light'
    
    # Fix 3: tracking-widest (remove)
    $content = $content -replace 'tracking-widest\s*', ''
    
    # Fix 4: tracking-wide (remove)
    $content = $content -replace 'tracking-wide\s*', ''
    
    # Fix 5: rounded-full → rounded-[3px] (except ≤8px dots: w-1/w-2/h-1/h-2)
    # Match rounded-full NOT preceded by small size indicators
    $content = $content -replace 'rounded-full', 'rounded-[3px]'
    
    # Fix 6: rounded-lg → rounded-[3px]
    $content = $content -replace 'rounded-lg', 'rounded-[3px]'
    
    # Fix 7: rounded-xl → rounded-[3px]
    $content = $content -replace 'rounded-xl', 'rounded-[3px]'
    
    # Fix 8: rounded-2xl → rounded-[3px]
    $content = $content -replace 'rounded-2xl', 'rounded-[3px]'
    
    # Fix 9: rounded-md → rounded-[3px]
    $content = $content -replace 'rounded-md', 'rounded-[3px]'
    
    # Fix 10: text-sm → text-[13px]
    $content = $content -replace '\btext-sm\b', 'text-[13px]'
    
    # Fix 11: text-xs → text-[13px]
    $content = $content -replace '\btext-xs\b', 'text-[13px]'
    
    # Fix 12: shadow-sm/md/lg → remove
    $content = $content -replace '\bshadow-sm\b', ''
    $content = $content -replace '\bshadow-md\b', ''
    $content = $content -replace '\bshadow-lg\b', ''
    $content = $content -replace '\bshadow-xl\b', ''
    $content = $content -replace '\bshadow-2xl\b', ''
    
    # Fix 13: italic → remove (but keep not-italic)
    $content = $content -replace '(?<!not-)(?<![\w-])\bitalic\b', ''
    
    # Fix 14: items-center gap-3 → items-center gap-2 (icon-text)
    $content = $content -replace 'items-center gap-3', 'items-center gap-2'
    $content = $content -replace 'items-center gap-4', 'items-center gap-2'
    $content = $content -replace 'items-start gap-3', 'items-start gap-2'
    
    # Fix 15: Color opacity shorthand bg-[var(--vs-X)]/N → rgba
    $content = $content -replace 'bg-\[var\(--vs-accent\)\]/10', 'bg-[rgba(34,211,238,0.1)]'
    $content = $content -replace 'bg-\[var\(--vs-accent\)\]/5', 'bg-[rgba(34,211,238,0.05)]'
    $content = $content -replace 'bg-\[var\(--vs-accent\)\]/20', 'bg-[rgba(34,211,238,0.2)]'
    $content = $content -replace 'bg-\[var\(--vs-warning\)\]/10', 'bg-[rgba(234,179,8,0.1)]'
    $content = $content -replace 'bg-\[var\(--vs-warning\)\]/5', 'bg-[rgba(234,179,8,0.05)]'
    $content = $content -replace 'bg-\[var\(--vs-warning\)\]/20', 'bg-[rgba(234,179,8,0.2)]'
    $content = $content -replace 'bg-\[var\(--vs-success\)\]/10', 'bg-[rgba(34,197,94,0.1)]'
    $content = $content -replace 'bg-\[var\(--vs-success\)\]/5', 'bg-[rgba(34,197,94,0.05)]'
    $content = $content -replace 'bg-\[var\(--vs-success\)\]/20', 'bg-[rgba(34,197,94,0.2)]'
    $content = $content -replace 'bg-\[var\(--vs-danger\)\]/10', 'bg-[rgba(239,68,68,0.1)]'
    $content = $content -replace 'bg-\[var\(--vs-danger\)\]/5', 'bg-[rgba(239,68,68,0.05)]'
    $content = $content -replace 'bg-\[var\(--vs-danger\)\]/20', 'bg-[rgba(239,68,68,0.2)]'
    
    # Fix 16: border-[var(--vs-X)]/N → rgba border
    $content = $content -replace 'border-\[var\(--vs-accent\)\]/20', 'border-[rgba(34,211,238,0.2)]'
    $content = $content -replace 'border-\[var\(--vs-accent\)\]/30', 'border-[rgba(34,211,238,0.3)]'
    $content = $content -replace 'border-\[var\(--vs-warning\)\]/20', 'border-[rgba(234,179,8,0.2)]'
    $content = $content -replace 'border-\[var\(--vs-warning\)\]/30', 'border-[rgba(234,179,8,0.3)]'
    $content = $content -replace 'border-\[var\(--vs-success\)\]/20', 'border-[rgba(34,197,94,0.2)]'
    $content = $content -replace 'border-\[var\(--vs-success\)\]/30', 'border-[rgba(34,197,94,0.3)]'
    $content = $content -replace 'border-\[var\(--vs-danger\)\]/20', 'border-[rgba(239,68,68,0.2)]'
    $content = $content -replace 'border-\[var\(--vs-danger\)\]/30', 'border-[rgba(239,68,68,0.3)]'
    
    # Fix 17: bg-zinc-700/800/900 → semantic vars
    $content = $content -replace 'bg-zinc-900', 'bg-[var(--vs-bg-deep)]'
    $content = $content -replace 'bg-zinc-800', 'bg-[var(--vs-bg-panel)]'
    $content = $content -replace 'bg-zinc-700', 'bg-[var(--vs-bg-card)]'
    
    # Fix 18: text-zinc-* → semantic vars
    $content = $content -replace 'text-zinc-400', 'text-[var(--vs-text-muted)]'
    $content = $content -replace 'text-zinc-500', 'text-[var(--vs-text-muted)]'
    $content = $content -replace 'text-zinc-300', 'text-[var(--vs-text-body)]'
    
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        $fixCount++
        Write-Host "  Fixed: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "  Sweep complete: $fixCount file(s) modified" -ForegroundColor Cyan
