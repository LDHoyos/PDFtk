@echo off
echo ========================================
echo PRUEBA SIMPLE DE GENERACION DE PDF
echo ========================================
echo.

echo [1/4] Verificando servidor...
curl -s http://localhost:3001/health
if %errorlevel% neq 0 (
    echo ERROR: Servidor no responde
    pause
    exit /b 1
)
echo OK - Servidor activo
echo.

echo [2/4] Generando PDF preview...
curl -X POST http://localhost:3001/api/fill-i589-preview ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer local-dev-secret-key-123" ^
  -d "@test-data.json" ^
  -o preview.pdf ^
  --silent ^
  --show-error ^
  --write-out "HTTP Status: %%{http_code}\n"

if %errorlevel% neq 0 (
    echo ERROR: Fallo al generar PDF
    pause
    exit /b 1
)
echo.

echo [3/4] Verificando archivo generado...
if exist preview.pdf (
    echo OK - PDF generado exitosamente
    for %%A in (preview.pdf) do echo Tamano: %%~zA bytes
) else (
    echo ERROR: No se genero el archivo preview.pdf
    pause
    exit /b 1
)
echo.

echo [4/4] Abriendo PDF...
start preview.pdf

echo.
echo ========================================
echo COMPLETADO EXITOSAMENTE
echo ========================================
pause
