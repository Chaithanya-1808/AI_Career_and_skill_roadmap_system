@echo off
title AI Career & Smart Roadmap System
cd /d "%~dp0"

echo ===================================================
echo   Starting AI CareerPath Full-Stack System
echo ===================================================
echo.

:: 1. Start the unified Full-Stack server (serves React Frontend + FastAPI Backend)
start /b "" "backend\venv\Scripts\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --app-dir backend

:: 2. Wait 2 seconds for server to initialize
timeout /t 2 /nobreak >nul

:: 3. Automatically open the website in your default browser
echo Opening website in browser...
start http://localhost:8000/

echo.
echo [OK] Website is running at: http://localhost:8000/
echo You can close this window now. The website will keep running in the background.
exit
