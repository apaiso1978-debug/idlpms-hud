# IDLPMS - Professional HUD Delivery Engine
# Handles high-performance MIME mapping and UTF-8 integrity

$port = 3334
$url = "http://localhost:$port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)

try {
    $listener.Start()
}
catch {
    Write-Host "ERROR: Could not start server. Port $port might be in use." -ForegroundColor Red
    Write-Host "Please close any other server windows and try again." -ForegroundColor Yellow
    pause
    exit
}

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   IDLPMS: UNITY SECURED SERVER" -ForegroundColor Cyan
Write-Host "   Status: ACTIVE" -ForegroundColor Green
Write-Host "   Local URL: $url" -ForegroundColor White
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "Server is running. Press Ctrl+C to shut down." -ForegroundColor Gray
Write-Host ""

# Automatically open browser
Start-Process $url

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        $path = $request.Url.LocalPath
        if ($path -eq "/") { $path = "/index.html" }
        
        $filePath = Join-Path (Get-Location) $path.TrimStart('/')
        
        if (Test-Path $filePath -PathType Leaf) {
            $extension = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mimeType = switch ($extension) {
                ".html" { "text/html" }
                ".css" { "text/css" }
                ".js" { "application/javascript" }
                ".png" { "image/png" }
                ".jpg" { "image/jpeg" }
                ".svg" { "image/svg+xml" }
                ".json" { "application/json" }
                default { "application/octet-stream" }
            }
            
            # Final Safeguard for Thai Text Inheritance
            if ($mimeType -eq "text/html") {
                $mimeType = "text/html; charset=utf-8"
            }
            
            $response.ContentType = $mimeType
            
            # Prevent browser caching during development
            $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")
            $response.Headers.Add("Pragma", "no-cache")
            $response.Headers.Add("Expires", "0")
            
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            
            Write-Host "[200 OK] $path" -ForegroundColor DarkGray
        }
        else {
            $response.StatusCode = 404
            Write-Host "[404 NF] $path" -ForegroundColor DarkRed
        }
        $response.Close()
    }
}
catch {
    Write-Host "`n[INFO] Server shutting down gracefully..." -ForegroundColor Yellow
}
finally {
    $listener.Stop()
}
