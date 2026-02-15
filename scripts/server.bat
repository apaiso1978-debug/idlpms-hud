@echo off
setlocal
title IDLPMS - Educational Portal Server

:: Configuration
set PORT=3333
set URL=http://localhost:%PORT%

echo ======================================================
echo   IDLPMS: Educational Portal - VS Code HUD Style
echo ======================================================
echo.

:: Navigate to project root (parent of scripts/)
cd /d "%~dp0.."
echo [OK] Project Root: %cd%
echo [OK] Starting Unity-Secured HUD server...
echo [INFO] Target URL: %URL%
echo.

:: Force Professional PowerShell Server (Ensures MIME & Encoding)
powershell -ExecutionPolicy Bypass -File scripts\server.ps1

pause
