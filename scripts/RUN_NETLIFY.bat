@echo off
setlocal
title IDLPMS - Netlify Development Server (CORS Enabled)

echo ======================================================
echo   IDLPMS: Educational Portal - Netlify Dev Mode
echo ======================================================
echo.
echo [INFO] Starting Netlify Dev...
echo [INFO] This will enable the DLTV Proxy on port 8888.
echo.

:: Execute Netlify Dev
echo [INFO] Attempting to start server...
echo [INFO] Browser will open manually in 5 seconds...

:: Start a delayed browser open in background
:: This runs in parallel with the server startup
start /b cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:8888"

:: Check for global netlify first
where netlify >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] Using global netlify-cli...
    call netlify dev
) else (
    echo [INFO] netlify-cli not found globally, attempting npx fallback...
    echo [TIP] If you see "Lock compromised", please run: npm cache clean --force
    call npx -y netlify-cli dev
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ======================================================
    echo   [ERROR] Failed to start Netlify Dev.
    echo ======================================================
    echo.
    echo [SOLUTION 1] Error "Lock compromised"? 
    echo              Run this command first: npm cache clean --force
    echo.
    echo [SOLUTION 2] Permanent Fix (Recommended):
    echo              Run this command: npm install -g netlify-cli
    echo.
    pause
)

pause
