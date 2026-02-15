$Files = Get-ChildItem -Path . -Recurse -Include *.html, *.js
foreach ($File in $Files) {
    if ($File.Name -eq "audit_unity.ps1") { continue }
    $content = Get-Content $File.FullName -Encoding UTF8
    for ($i = 0; $i -lt $content.Count; $i++) {
        $line = $content[$i]
        if ($line -match '[\u0E00-\u0E7F]') {
            # Check for font size class in this line or nearby
            # This is a bit manual, but let's print them out
            Write-Host "$($File.Name):$($i+1) -> $line"
        }
    }
}
