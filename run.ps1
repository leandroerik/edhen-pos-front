# Script para iniciar el Frontend edhen POS (React + Vite)
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Iniciando Frontend edhen POS (React + Vite)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

if (-not (Test-Path "node_modules")) {
    Write-Host "`nInstalando dependencias de Node.js (npm install)..." -ForegroundColor Yellow
    npm install
}

Write-Host "`nIniciando servidor de desarrollo Vite..." -ForegroundColor Green
npm run dev
