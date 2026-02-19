# sweep_phase2.ps1 — Fix remaining violations after phase 1
# Target: text-[11px], text-base, solid fill buttons, border-2 spinner

param(
    [string]$Path = "pages"
)

$fixCount = 0

$files = Get-ChildItem -Path $Path -Recurse -Include "*.html" -File |
Where-Object { $_.FullName -notmatch "\\manual\\" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    $original = $content

    # Fix: text-[11px] → text-[13px]
    $content = $content -replace 'text-\[11px\]', 'text-[13px]'

    # Fix: text-base (NOT inside JS/config) → text-[13px]  
    $content = $content -replace '\btext-base\b', 'text-[13px]'

    # Fix: Solid fill accent button classes → neon style
    # bg-[var(--vs-accent)] text-[var(--vs-bg-deep)] → neon
    $content = $content -replace 'bg-\[var\(--vs-accent\)\]\s+text-\[var\(--vs-bg-deep\)\]', 'bg-[rgba(34,211,238,0.1)] text-[var(--vs-accent)] border border-[rgba(34,211,238,0.3)]'

    # Fix: background: var(--vs-accent); → neon in <style> blocks
    $content = $content -replace 'background:\s*var\(--vs-accent\);', 'background: rgba(34,211,238,0.1); color: var(--vs-accent); border: 1px solid rgba(34,211,238,0.3);'
    
    # Fix: background: var(--vs-success); → neon in <style> blocks
    $content = $content -replace 'background:\s*var\(--vs-success\);', 'background: rgba(34,197,94,0.1); color: var(--vs-success); border: 1px solid rgba(34,197,94,0.3);'

    # Fix: background: var(--vs-danger); → neon in <style> blocks
    $content = $content -replace 'background:\s*var\(--vs-danger\);', 'background: rgba(239,68,68,0.1); color: var(--vs-danger); border: 1px solid rgba(239,68,68,0.3);'

    # Fix: background: var(--vs-warning); → neon in <style> blocks
    $content = $content -replace 'background:\s*var\(--vs-warning\);', 'background: rgba(234,179,8,0.1); color: var(--vs-warning); border: 1px solid rgba(234,179,8,0.3);'

    # Fix: border-2 on spinners → border (1px)
    $content = $content -replace 'border-2\s+border-\[var\(--vs-accent\)\]\s+border-t-transparent', 'border border-[rgba(34,211,238,0.3)] border-t-transparent'

    # Fix: border: 1px solid var(--vs-border) → rgba 50%
    $content = $content -replace 'border:\s*1px\s+solid\s+var\(--vs-border\)', 'border: 1px solid rgba(63,63,70,0.5)'

    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file.FullName, $content)
        $fixCount++
        Write-Host "  Fixed: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "  Phase 2 sweep: $fixCount file(s) modified" -ForegroundColor Cyan
