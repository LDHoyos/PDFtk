# Inicia el servidor con PDFtk en el PATH
# Ejecuta este archivo con: .\start-server.ps1

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  INICIANDO SERVIDOR PDF CON PDFTK" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "[1/3] Agregando PDFtk al PATH..." -ForegroundColor Yellow
$env:Path += ";C:\Program Files (x86)\PDFtk Server\bin"

Write-Host "[2/3] Verificando PDFtk..." -ForegroundColor Yellow
try {
    $version = pdftk --version 2>&1 | Select-Object -First 1
    Write-Host "✅ PDFtk encontrado: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: PDFtk no encontrado" -ForegroundColor Red
    Write-Host "Verifica que PDFtk esté instalado en:" -ForegroundColor Yellow
    Write-Host "C:\Program Files (x86)\PDFtk Server\bin\" -ForegroundColor Gray
    pause
    exit 1
}

Write-Host "`n[3/3] Iniciando servidor..." -ForegroundColor Yellow
Write-Host "Presiona Ctrl+C para detener el servidor`n" -ForegroundColor Gray

npm run dev
