@echo off
echo ========================================
echo INICIANDO SERVIDOR PDF CON PDFTK
echo ========================================
echo.

echo [1/3] Agregando PDFtk al PATH...
set "PATH=%PATH%;C:\Program Files (x86)\PDFtk Server\bin"

echo [2/3] Verificando PDFtk...
pdftk --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PDFtk no encontrado
    echo.
    echo Verifica que PDFtk este instalado en:
    echo C:\Program Files (x86)\PDFtk Server\bin\
    pause
    exit /b 1
)
echo OK - PDFtk encontrado

echo.
echo [3/3] Iniciando servidor...
echo Presiona Ctrl+C para detener el servidor
echo.
call npm run dev
