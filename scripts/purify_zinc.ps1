$Files = Get-ChildItem -Path . -Recurse -Include *.html, *.css, *.js
foreach ($File in $Files) {
    if ($File.Name -eq "audit_unity.ps1" -or $File.Name -eq "purify_zinc.ps1" -or $File.Name -eq "state_audit_thai.ps1") { continue }
    $content = Get-Content $File.FullName -Raw -Encoding UTF8
    
    # Phase 1: Shield existing levels
    $content = $content -replace 'zinc-700', 'ZINC_SHIELD_700'
    $content = $content -replace 'zinc-800', 'ZINC_SHIELD_800'
    
    # Phase 2: Shift deep levels up
    # 950 -> 800
    $content = $content -replace 'zinc-950', 'zinc-800'
    $content = $content -replace '#09090b', '#27272a'
    # 900 -> 800
    $content = $content -replace 'zinc-900', 'zinc-800'
    $content = $content -replace '#18181b', '#27272a'
    
    # Phase 3: Unshield and shift
    # Old 800 (Workspace) -> 700
    $content = $content -replace 'ZINC_SHIELD_800', 'zinc-700'
    # Old 700 (Borders) -> 600
    $content = $content -replace 'ZINC_SHIELD_700', 'zinc-600'
    
    Set-Content $File.FullName $content -Encoding UTF8
}
Write-Host "Zinc Shifting Complete. New Baseline: 800." -ForegroundColor Cyan
