$Path = "c:\Users\Zerocool\Documents\WEBVI\home.html"
$content = Get-Content $Path -Raw
# If it's already corrupted with ?, we might need to restore from a known state or just fix the obvious ones.
# But let's try to re-save it as UTF8 without BOM.
[System.IO.File]::WriteAllText($Path, $content, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Encoding for home.html updated to UTF8."
