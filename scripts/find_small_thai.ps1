$Files = Get-ChildItem -Path . -Recurse -Include *.html, *.js
foreach ($File in $Files) {
    if ($File.Name -eq "audit_unity.ps1") { continue }
    $content = Get-Content $File.FullName -Encoding UTF8
    for ($i = 0; $i -lt $content.Count; $i++) {
        $line = $content[$i]
        # Check for Thai characters
        if ($line -match '[\u0E00-\u0E7F]') {
            # Check if this line OR a parent line (in the same file) sets text-xs
            # For simplicity, let's just find matches on the same line first
            if ($line -match 'text-xs') {
                Write-Host "FOUND: $($File.FullName):$($i+1): $line" -ForegroundColor Red
            }
        }
    }
}
