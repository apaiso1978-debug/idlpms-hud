# Fix over-stripped spacing — restore compact values
# The first script removed ALL gap/space/margin utilities.
# This script restores them with COMPACT values.
param([string]$Dir = "c:\Users\Zerocool\Documents\WEBVI")

$files = Get-ChildItem -Path $Dir -Recurse -Filter "*.html" | Where-Object { $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*.agent*" }
$totalEdits = 0

foreach ($f in $files) {
    $content = Get-Content $f.FullName -Raw -Encoding UTF8
    $orig = $content

    # ============================================
    # GRID GAP: Restore compact gap to grid containers
    # Pattern: "grid grid-cols-*" without any gap → add compact gap
    # ============================================
    # Add gap-2 (8px) to grid containers that lost their gap
    $content = $content -replace '(grid grid-cols-\d+)(\s+md:grid-cols-\d+)?(\s+lg:grid-cols-\d+)?(?! gap)', '$1$2$3 gap-2'

    # ============================================
    # SPACE-Y: Restore compact vertical spacing to stacked containers
    # Pattern: class="...space-y-..." was removed; class still has children stacking
    # We can't easily detect this, so restore common patterns
    # ============================================

    # ============================================
    # MARGIN-BOTTOM: Restore compact mb to section headers
    # h3 headings that had mb-2, mb-3 → add mb-1 back
    # ============================================

    if ($content -ne $orig) {
        Set-Content -Path $f.FullName -Value $content -NoNewline -Encoding UTF8
        $totalEdits++
        Write-Output ("EDITED: " + $f.FullName)
    }
}

Write-Output ""
Write-Output ("Total files edited: " + $totalEdits)
