@echo off
title Stray Animals Server
cls

echo ============================================
echo    Stray Animals Management System Server
echo ============================================
echo.

:: Go to backend folder
cd /d "%~dp0backend"

echo [1/3] Checking dependencies...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies OK
)
echo.

echo [2/3] Starting server...
echo Server: http://localhost:3000
echo.

echo NOTE: Keep this window open while using the app.
echo.

echo ============================================

node server-debug.js

pause
