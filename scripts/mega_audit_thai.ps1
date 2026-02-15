$Files = Get-ChildItem -Path . -Recurse -Include *.html, *.js
$errorFound = $false
foreach ($File in $Files) {
    if ($File.Name -eq "audit_unity.ps1" -or $File.Name -eq "find_small_thai.ps1") { continue }
    $content = Get-Content $File.FullName -Encoding UTF8 -Raw
    
    # Match blocks with text-xs and Thai
    # This is a bit hard with regex on raw content, but let's try to match segments
    # Actually, simpler to just find any line with Thai and check if it's NOT text-sm or larger
    
    $lines = Get-Content $File.FullName -Encoding UTF8
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        if ($line -match '[\u0E00-\u0E7F]') {
            # If line has Thai, and it has text-xs OR text-[12px] OR text-[10px]
            if ($line -match 'text-xs|text-\[(?:[0-9]|1[0-3])px\]') {
                Write-Host "CRITICAL: $($File.FullName):$($i+1) -> $line" -ForegroundColor Red
                $errorFound = $true
            }
        }
    }
}

if (-not $errorFound) {
    Write-Host "No obvious direct Thai text-xs found. Checking for contextually undersized Thai..." -ForegroundColor Yellow
    # Now check for Thai text that might be inside a text-xs container
    foreach ($File in $Files) {
        $content = Get-Content $File.FullName -Encoding UTF8 -Raw
        # Search for text-xs tags that contain Thai text
        # This is a rough check
        if ($content -match 'class="[^"]*text-xs[^"]*"[^>]*>[^<]*[\u0E00-\u0E7F]') {
            Write-Host "POTENTIAL: $($File.FullName) contains Thai likely under text-xs" -ForegroundColor Yellow
        }
    }
}
