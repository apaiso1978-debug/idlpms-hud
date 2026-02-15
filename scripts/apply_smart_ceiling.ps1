$Files = Get-ChildItem -Path pages/manual/ -Recurse -Include *.html
$Files += Get-Item -Path pages/profile.html

foreach ($File in $Files) {
    if ($File.Name -eq "template.html") { continue }
    $content = Get-Content $File.FullName -Raw -Encoding UTF8
    
    # Target the first div inside body which is our root container
    # We want to change <div class="space-y-8"> to <div class="max-w-[1600px] space-y-8">
    # Note: We ensure there is NO mx-auto to keep it left-aligned.
    
    if ($content -match '<body[^>]*>\s*<div class="([^"]*)"') {
        $content = $content -replace '(<body[^>]*>\s*<div class=")([^"]*)(")', '$1max-w-[1600px] $2$3'
    }
    
    # Cleanup any accidental mx-auto if it exists in the root div
    $content = $content -replace 'max-w-\[1600px\] mx-auto', 'max-w-[1600px]'
    
    Set-Content $File.FullName $content -Encoding UTF8
}
Write-Host "Smart Ceiling Applied: Content limited to 1600px and left-aligned." -ForegroundColor Cyan
