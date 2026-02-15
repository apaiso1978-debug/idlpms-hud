$Files = Get-ChildItem -Path . -Recurse -Include *.html -Exclude "index.html", "login.html"
$Files += Get-Item -Path index.html, login.html

foreach ($File in $Files) {
    $content = Get-Content $File.FullName -Raw -Encoding UTF8
    
    # [SYNTAX SANITIZATION] Fix stray quotes and spaces in attributes
    $content = $content -replace "overflow-y-auto`" +font-", "overflow-y-auto font-"
    $content = $content -replace "overflow-y-auto`" font-", "overflow-y-auto font-"
    $content = $content -replace "antialiased`" +", "antialiased "
    $content = $content -replace "antialiased`">", "antialiased`">"
    $content = $content -replace '(<body[^>]*)" font-shard', '$1 font-shard'
    
    # [LAYOUT SANITIZATION] Apply Smart Ceiling to Manuals/Profile
    if ($File.FullName -match 'manual|profile\.html') {
        if ($File.Name -ne "template.html") {
            # Template is treated separately
            if ($content -match '<div class="space-y-8">') {
                $content = $content -replace '<div class="space-y-8">', '<div class="max-w-[1600px] space-y-8">'
            }
            if ($content -match 'max-w-7xl mx-auto') {
                $content = $content -replace 'max-w-7xl mx-auto', 'max-w-[1600px]'
            }
        }
    }

    # [ELEVATION SANITIZATION] Sync Cards to 800-Baseline (700 Surface)
    # Context: 600 was Card base when floor was 700. Now floor is 800, so card base is 700.
    $content = $content -replace 'bg-zinc-600/50', 'bg-zinc-700/50'
    $content = $content -replace '\brounded-\[3px\]-\[3px\]\b', 'rounded-[3px]'
    
    # [BORDER SANITIZATION] Ensure 1px Visibility
    $content = $content -replace 'border-zinc-500/50', 'border-zinc-600/50'
    
    # [SHELL FIX] index.html sidebar class/color
    if ($File.Name -eq "index.html") {
        $content = $content -replace 'bg-zinc-750', 'bg-[var(--vs-bg-panel)]'
        $content = $content -replace 'bg-zinc-700', 'bg-[var(--vs-bg-main)]'
    }

    Set-Content $File.FullName $content -Encoding UTF8
}

# Surgical fix for Template.html
$template = Get-Content "pages/manual/template.html" -Raw -Encoding UTF8
$template = $template -replace 'overflow-y-auto" +font-', 'overflow-y-auto font-'
$template = $template -replace 'max-w-7xl mx-auto', 'max-w-[1600px]'
$template = $template -replace 'rounded-\[3px\]-\[3px\]', 'rounded-[3px]'
Set-Content "pages/manual/template.html" $template -Encoding UTF8

Write-Host "Unity Final Sanitization Complete." -ForegroundColor Green
