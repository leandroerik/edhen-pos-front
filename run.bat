@echo off
title edhen POS - Frontend (React + Vite)
echo ========================================================
echo   Iniciando Frontend edhen POS (Puerto 5173)
echo ========================================================
echo.

cd /d "%~dp0"

if not exist "node_modules" (
    echo Instalando dependencias de Node.js...
    call npm install
)

call npm run dev
pause
