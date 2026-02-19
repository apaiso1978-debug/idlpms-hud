# Bulk remove inline Tailwind vertical spacing from all HTML files
param([string]$Dir = "c:\Users\Zerocool\Documents\WEBVI\pages")

$files = Get-ChildItem -Path $Dir -Recurse -Filter "*.html"
$totalEdits = 0

foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw -Encoding UTF8
    $orig = $content

    # Remove py-* (vertical padding) - keep px-*
    $content = $content -replace ' py-1\.5', ''
    $content = $content -replace ' py-2', ''
    $content = $content -replace ' py-3', ''
    $content = $content -replace ' py-4', ''
    $content = $content -replace ' py-6', ''
    $content = $content -replace ' py-8', ''

    # Remove space-y-* and space-x-*
    $content = $content -replace ' space-y-1\.5', ''
    $content = $content -replace ' space-y-1', ''
    $content = $content -replace ' space-y-2', ''
    $content = $content -replace ' space-y-3', ''
    $content = $content -replace ' space-y-4', ''
    $content = $content -replace ' space-x-2', ''
    $content = $content -replace ' space-x-3', ''
    $content = $content -replace ' space-x-4', ''

    # Remove gap-*
    $content = $content -replace ' gap-3', ''
    $content = $content -replace ' gap-4', ''
    $content = $content -replace ' gap-6', ''
    $content = $content -replace ' gap-8', ''

    # Remove mb-* and mt-*
    $content = $content -replace ' mb-1', ''
    $content = $content -replace ' mb-2', ''
    $content = $content -replace ' mb-3', ''
    $content = $content -replace ' mb-4', ''
    $content = $content -replace ' mb-6', ''
    $content = $content -replace ' mb-8', ''
    $content = $content -replace ' mt-1', ''
    $content = $content -replace ' mt-2', ''
    $content = $content -replace ' mt-3', ''
    $content = $content -replace ' mt-4', ''
    $content = $content -replace ' mt-6', ''
    $content = $content -replace ' mt-8', ''

    # Replace standalone p-* with compact px + py
    $content = $content -replace '(?<= )p-3(?= |")', 'px-3 py-2'
    $content = $content -replace '(?<= )p-4(?= |")', 'px-4 py-2'
    $content = $content -replace '(?<= )p-6(?= |")', 'px-6 py-2'
    $content = $content -replace '(?<= )p-8(?= |")', 'px-8 py-2'

    if ($content -ne $orig) {
        Set-Content -Path $f.FullName -Value $content -NoNewline -Encoding UTF8
        $totalEdits++
        Write-Output ("EDITED: " + $f.Name)
    }
}

Write-Output ""
Write-Output ("Total files edited: " + $totalEdits)
