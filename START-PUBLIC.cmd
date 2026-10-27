@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js LTS from https://nodejs.org first.
  pause
  exit /b 1
)
set "HOST=0.0.0.0"
set "PORT=3000"
echo.
echo   CHANGE IN PROGRESS - PUBLIC SERVER
echo   Open http://YOUR_SERVER_PUBLIC_IP:3000
echo   Allow inbound TCP port 3000 in the server and provider firewalls.
echo   Keep this window open. Press Ctrl+C to stop.
echo.
node server.mjs --production
if errorlevel 1 pause
