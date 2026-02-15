$Files = Get-ChildItem -Path . -Recurse -Include *.html, *.js
foreach ($File in $Files) {
    if ($File.Name -eq "audit_unity.ps1" -or $File.Name -eq "mega_audit_thai.ps1") { continue }
    $content = Get-Content $File.FullName -Encoding UTF8
    $currentSize = "sm" # Assumption
    foreach ($line in $content) {
        if ($line -match 'text-xs|text-\[(?:[0-9]|1[0-3])px\]') {
            $currentSize = "xs"
        }
        elseif ($line -match 'text-(sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)') {
            $currentSize = "legal"
        }
        
        if ($line -match '[\u0E00-\u0E7F]' -and $currentSize -eq "xs") {
            Write-Host "ILLEGAL THAI SIZE: $($File.FullName) -> $line" -ForegroundColor Red
        }
    }
}
