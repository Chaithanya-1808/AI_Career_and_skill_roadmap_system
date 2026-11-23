@echo off
title AI CareerPath - Server + Public Cloudflare Tunnel
cd /d "%~dp0"

echo ===================================================
echo   Starting AI CareerPath + Public Mobile Tunnel
echo ===================================================
echo.

:: 1. Start unified Full-Stack Server
start /b "" "backend\venv\Scripts\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend

:: 2. Wait 2 seconds
timeout /t 2 /nobreak >nul

:: 3. Start Cloudflare Tunnel
start "" "cloudflared.exe" tunnel --url http://127.0.0.1:8000

:: 4. Open website
start http://localhost:8000/

echo.
echo [OK] Server started and public tunnel initialized!
echo The tunnel window will show your public HTTPS link for your phone.
exit
