@echo off
setlocal
echo ===================================================
echo   Iniciando Frontend edhen POS (React + Vite)
echo ===================================================

if not exist "node_modules" (
    echo Instalando dependencias de Node.js...
    call npm install
)
call npm run dev
