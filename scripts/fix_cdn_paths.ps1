# Fix relative paths to utilities.css by file location
$rootDir = "c:\Users\Zerocool\Documents\WEBVI"

# Map: directory path -> correct relative CSS path
$pathMap = @{
    # Root level files
    "$rootDir"                = "assets/css/utilities.css"
    # Pages level
    "$rootDir\pages"          = "../assets/css/utilities.css"
    # Docs level
    "$rootDir\docs"           = "../assets/css/utilities.css"
    # Subdirectories under pages
    "$rootDir\pages\manual"   = "../../assets/css/utilities.css"
    "$rootDir\pages\schedule" = "../../assets/css/utilities.css"
    "$rootDir\pages\student"  = "../../assets/css/utilities.css"
}

$files = Get-ChildItem -Path $rootDir -Recurse -Filter "*.html" | Where-Object {
    $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.agent*" -and $_.FullName -notlike "*_tailwind_build*"
}

$edited = 0

foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw -Encoding UTF8
    
    if ($content -match 'utilities\.css') {
        $dir = $f.DirectoryName
        $correctPath = $pathMap[$dir]
        
        if (-not $correctPath) {
            Write-Output "WARNING: No mapping for $dir ($($f.Name))"
            continue
        }
        
        # Replace any incorrect path
        $content = $content -replace 'href="[^"]*utilities\.css"', "href=""$correctPath"""
        
        Set-Content -Path $f.FullName -Value $content -NoNewline -Encoding UTF8
        $edited++
        Write-Output "$($f.Name) -> $correctPath"
    }
}

Write-Output ""
Write-Output "Fixed: $edited files"
