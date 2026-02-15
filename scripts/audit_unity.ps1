# Unity Guardian - Zinc Compliance & Linguistic Audit
$script:TotalErrors = 0
$Files = Get-ChildItem -Path . -Include *.html, *.css, *.js -Recurse -Exclude "vendor", "node_modules"

Write-Host "[Unity Guardian] Starting Project Audit..." -ForegroundColor Cyan
Write-Host "Targeting: $($Files.Count) files"

foreach ($File in $Files) {
    if ($File.Extension -match "\.html|\.js|\.css") {
        # Force UTF8 encoding for correctly reading Thai characters
        $lines = Get-Content $File.FullName -Encoding UTF8
        for ($i = 0; $i -lt $lines.Count; $i++) {
            
            # [RULE 1] 14px Thai Rule (Thai must be >= 14px / text-sm)
            # Find any tag with text-xs that contains Thai characters
            if ($lines[$i] -match 'class="[^"]*text-xs[^"]*"[^>]*>[^<]*[\u0E00-\u0E7F]' -or 
                ($lines[$i] -match '[\u0E00-\u0E7F]' -and $lines[$i] -match 'text-xs|text-\[(?:[0-9]|1[0-3])px\]')) {
                Write-Host "[FAIL] Thai text < 14px in $($File.Name):L$($i+1) (Must be 14px+ or English)" -ForegroundColor Red
                $script:TotalErrors++
            }

            # [RULE 2] 12px English Rule (English must be >= 12px / text-xs)
            if ($lines[$i] -notmatch '[\u0E00-\u0E7F]' -and $lines[$i] -match 'text-\[(?:[0-9]|1[0-1])px\]') {
                Write-Host "[FAIL] English text < 12px in $($File.Name):L$($i+1)" -ForegroundColor Red
                $script:TotalErrors++
            }

            # [RULE 3] Typography Weight Lockdown (Only 300/500 Allowed)
            if ($lines[$i] -match 'font-(?:thin|extralight|normal|semibold|bold|extrabold|black|100|200|400|600|700|800|900)\b') {
                Write-Host "[FAIL] Forbidden Weight in $($File.Name):L$($i+1) (Allowed: 300/500 only)" -ForegroundColor Red
                $script:TotalErrors++
            }

            # [RULE 4] Sharp Border Hierarchy (No Zinc-800+ borders on surfaces)
            if ($lines[$i] -match 'border-zinc-(?:800|900|950)') {
                Write-Host "[FAIL] Illegal Dark Border in $($File.Name):L$($i+1) (Use Zinc-600/700 at 50%)" -ForegroundColor Red
                $script:TotalErrors++
            }
            # [RULE 5] Black Border Rule (No solid black)
            if ($lines[$i] -match 'border-black') {
                Write-Host "[FAIL] Illegal Black Border in $($File.Name):L$($i+1)" -ForegroundColor Red
                $script:TotalErrors++
            }

            # [RULE 5] Asset Integrity (No inline SVG unless mask-image)
            if ($lines[$i] -match '<svg' -and $lines[$i] -notmatch 'mask-image') {
                Write-Host "[FAIL] Illegal SVG Usage in $($File.Name):L$($i+1)" -ForegroundColor Red
                $script:TotalErrors++
            }

            # [RULE 6] No Letter-Spacing (Iron Rule)
            # Match 'tracking-' in class attributes or 'letter-spacing' in style attributes/CSS
            if ($lines[$i] -match 'class="[^"]*tracking-' -or $lines[$i] -match 'style="[^"]*letter-spacing\s*:(?![\s]*0|[\s]*normal)' -or ($File.Extension -eq ".css" -and $lines[$i] -match 'letter-spacing\s*:(?![\s]*0|[\s]*normal)')) {
                Write-Host "[FAIL] Illegal Letter Spacing in $($File.Name):L$($i+1)" -ForegroundColor Red
                $script:TotalErrors++
            }

            # [RULE 7] No Italic (Iron Rule)
            # Match 'italic' in class attributes or 'font-style' in style attributes/CSS
            if ($lines[$i] -match 'class="[^"]*\bitalic\b' -or $lines[$i] -match 'style="[^"]*font-style\s*:(?![\s]*normal)' -or ($File.Extension -eq ".css" -and $lines[$i] -match 'font-style\s*:(?![\s]*normal)')) {
                Write-Host "[FAIL] Illegal Italic Text in $($File.Name):L$($i+1)" -ForegroundColor Red
                $script:TotalErrors++
            }
            # [RULE 8] 850-Baseline Rule (No Zinc-900/950 allowed)
            if ($lines[$i] -match 'zinc-900|zinc-950|#18181b|#09090b') {
                Write-Host "[FAIL] Illegal Deep Zinc in $($File.Name):L$($i+1) (Deepest allowed: Zinc-850)" -ForegroundColor Red
                $script:TotalErrors++
            }

            # [RULE 9] Global Line Unity (1px/50% Opacity)
            if ($lines[$i] -match 'border-[248]') {
                Write-Host "[FAIL] Illegal Border Width in $($File.Name):L$($i+1) (Must be 1px)" -ForegroundColor Red
                $script:TotalErrors++
            }
            if ($lines[$i] -match 'border-zinc' -and $lines[$i] -notmatch '/(?:50|30|10|40|20|60|70|80|90)') {
                # Force opacity on all utility borders in HTML
                if ($File.Extension -eq '.html' -and $lines[$i] -notmatch 'var\(--vs-border\)') {
                    Write-Host "[FAIL] Illegal Solid Border in $($File.Name):L$($i+1) (Must use opacity e.g. /50)" -ForegroundColor Red
                    $script:TotalErrors++
                }
            }

            # [RULE 10] Strict 3px Corners (Iron Rule)
            if ($lines[$i] -match 'class="[^"]*\brounded\b' -and $lines[$i] -notmatch 'rounded-\[3px\]') {
                Write-Host "[FAIL] Non-Standard Rounding in $($File.Name):L$($i+1) (Use 'rounded-[3px]' only)" -ForegroundColor Red
                $script:TotalErrors++
            }
            if ($lines[$i] -match 'class="[^"]*\brounded-(?:sm|md|lg|xl|2xl|3xl|full)\b') {
                if ($lines[$i] -notmatch 'rounded-\[3px\]') {
                    Write-Host "[FAIL] Illegal Preset Rounding in $($File.Name):L$($i+1) (Use 'rounded-[3px]')" -ForegroundColor Red
                    $script:TotalErrors++
                }
            }

            # [RULE 11] Smart Ceiling Policy (Max-W 1600px for Manuals/Profile)
            if ($File.FullName -match 'manual|profile\.html') {
                if ($lines[$i] -match '<body' -and $lines[$i + 1] -notmatch 'max-w-\[1600px\]') {
                    # Check first child div after body
                    Write-Host "[FAIL] Missing Smart Ceiling in $($File.Name):L$($i+2) (Should have max-w-[1600px])" -ForegroundColor Red
                    $script:TotalErrors++
                }
            }

            # [RULE 12] Syntax Integrity check (Quotation Leakage)
            if ($lines[$i] -match 'overflow-y-auto"[^>]' -or $lines[$i] -match 'antialiased"[^>]') {
                if ($lines[$i] -notmatch 'class=') {
                    # Only fail if it looks like a tag attribute leak
                    Write-Host "[FAIL] Syntax Corruption in $($File.Name):L$($i+1) (Suspected stray quote)" -ForegroundColor Red
                    $script:TotalErrors++
                }
            }

            # [RULE 13] Icon Precision Rule (Must be stroke-width='1')
            if ($lines[$i] -match 'stroke-width=' -and $lines[$i] -notmatch "stroke-width='1'") {
                Write-Host "[FAIL] Non-Standard Icon Stroke in $($File.Name):L$($i+1) (Must be 1px / stroke-width='1')" -ForegroundColor Red
                $script:TotalErrors++
            }
        }
    }
}

Write-Host "`n----------------------------------------"
if ($script:TotalErrors -eq 0) {
    Write-Host "Audit Successful: 0 Errors Found. [UNITY SECURED]" -ForegroundColor Green
}
else {
    Write-Host "Audit Failed: $script:TotalErrors Errors Found. [UNITY BREACHED]" -ForegroundColor Red
}
Write-Host "----------------------------------------"
