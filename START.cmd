@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 20 or newer is required. Install it from https://nodejs.org
  pause
  exit /b 1
)
echo.
echo   CHANGE IN PROGRESS
echo   Open http://127.0.0.1:3000 in your browser.
echo   Keep this window open while using the installation.
echo   Press Ctrl+C to stop.
echo.
node server.mjs
if errorlevel 1 pause
