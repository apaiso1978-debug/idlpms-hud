# Replace Tailwind CDN script with utilities.css link in all HTML files
$rootDir = "c:\Users\Zerocool\Documents\WEBVI"
$files = Get-ChildItem -Path $rootDir -Recurse -Filter "*.html" | Where-Object {
    $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.agent*" -and $_.FullName -notlike "*_tailwind_build*"
}

$edited = 0

foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw -Encoding UTF8
    
    if ($content -match 'cdn\.tailwindcss\.com') {
        # Determine relative path to assets/css/utilities.css
        $rel = [System.IO.Path]::GetRelativePath($f.DirectoryName, "$rootDir\assets\css")
        $rel = $rel -replace '\\', '/'
        $cssPath = "$rel/utilities.css"
        
        # Replace the script tag with a link tag
        $content = $content -replace '<script\s+src="https?://cdn\.tailwindcss\.com/?"\s*>\s*</script>', "<link rel=""stylesheet"" href=""$cssPath"" />"
        
        Set-Content -Path $f.FullName -Value $content -NoNewline -Encoding UTF8
        $edited++
        Write-Output "DONE: $($f.FullName) -> $cssPath"
    }
}

Write-Output ""
Write-Output "Total files edited: $edited"
