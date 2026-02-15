$Files = Get-ChildItem -Path pages/manual/, pages/ -Filter *.html
foreach ($File in $Files) {
    if ($File.Name -eq "index.html" -or $File.Name -eq "login.html") { continue }
    $content = Get-Content $File.FullName -Raw -Encoding UTF8
    
    # Shift Elevation: Card (Old 600) -> New 700
    # Context: Background is now 800 (via styles.css variables)
    $content = $content -replace 'bg-zinc-600/50', 'bg-zinc-700/50'
    $content = $content -replace 'bg-zinc-600', 'bg-zinc-700'
    
    # Secondary surfaces (Old 500) -> New 600
    $content = $content -replace 'bg-zinc-500/30', 'bg-zinc-600/30'
    $content = $content -replace 'bg-zinc-500/50', 'bg-zinc-600/50'
    
    # Borders (Old 500) -> New 600/700
    $content = $content -replace 'border-zinc-500/50', 'border-zinc-600/50'
    
    Set-Content $File.FullName $content -Encoding UTF8
}
Write-Host "Card Elevation Shift Complete: Levels adjusted for 800-baseline." -ForegroundColor Green
