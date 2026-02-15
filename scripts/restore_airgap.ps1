$Files = Get-ChildItem -Path . -Recurse -Include *.html
foreach ($File in $Files) {
    if ($File.Name -eq "index.html" -or $File.Name -eq "login.html") { continue }
    $content = Get-Content $File.FullName -Raw -Encoding UTF8
    
    # [HARDENED REGEX] Target only the body tag's class attribute
    if ($content -match '(<body[^>]*)\bclass="([^"]*)"') {
        # Already has class, ensure pt-8 and px-8 are there
        if ($content -notmatch '<body[^>]*\bclass="[^"]*pt-8') { $content = $content -replace '(<body[^>]*\bclass=")([^"]*)(")', '$1$2 pt-8$3' }
        if ($content -notmatch '<body[^>]*\bclass="[^"]*px-8') { $content = $content -replace '(<body[^>]*\bclass=")([^"]*)(")', '$1$2 px-8$3' }
        # Cleanup extra spaces
        $content = $content -replace 'class=" +', 'class="'
    }
    else {
        # No class or simple body, add classes ONLY to body
        $content = $content -replace '(<body)', '$1 class="bg-transparent px-8 pt-8 pb-24 overflow-y-auto"'
    }
    
    # Remove redundancy in internal div
    $content = $content -replace '<div class="px-8 space-y-8 pb-20">', '<div class="space-y-8">'
    $content = $content -replace '<div class="px-8 space-y-8 pb-24">', '<div class="space-y-8">'
    
    Set-Content $File.FullName $content -Encoding UTF8
}
Write-Host "Airgap Restoration Complete: All pages now have 32px vertical separation." -ForegroundColor Cyan
