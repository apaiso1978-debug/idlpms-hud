$Files = Get-ChildItem -Path . -Recurse -Include *.html
foreach ($File in $Files) {
    $content = Get-Content $File.FullName -Encoding UTF8
    for ($i = 0; $i -lt $content.Count; $i++) {
        if ($content[$i] -match 'placeholder' -and $content[$i] -match 'text-xs') {
            Write-Host "FOUND: $($File.Name):$($i+1) -> $($content[$i])"
        }
    }
}
