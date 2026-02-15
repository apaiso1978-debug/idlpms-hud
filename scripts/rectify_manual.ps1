$Files = Get-ChildItem -Path pages/manual/ -Recurse -Include *.html
foreach ($File in $Files) {
    if ($File.Name -eq "template.html") { continue }
    $content = Get-Content $File.FullName -Raw -Encoding UTF8
    
    # 1. Fix Elevation: Background is 700, Cards must be 600 or lighter
    $content = $content -replace 'bg-zinc-800/50', 'bg-zinc-600/50'
    $content = $content -replace 'bg-zinc-700/50', 'bg-zinc-500/30'
    $content = $content -replace 'border-zinc-600/50', 'border-zinc-500/50'
    
    # 2. Fix Padding: Remove max-w-7xl and mx-auto. Use px-8 instead.
    $content = $content -replace 'max-w-7xl mx-auto space-y-[0-9]+', 'px-8 space-y-8'
    $content = $content -replace 'max-w-7xl mx-auto space-y-12', 'px-8 space-y-8'
    
    # 3. Fix Corrupted Rounded Class
    $content = $content -replace 'rounded-\[3px\]-\[3px\]', 'rounded-[3px]'
    
    Set-Content $File.FullName $content -Encoding UTF8
}
Write-Host "Manual Pages Rectified: Elevation & Padding Sync Complete." -ForegroundColor Green
