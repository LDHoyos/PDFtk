# PDF Microservice - I-589 Form Auto-Fill with PDFtk

Microservicio Node.js para generar PDFs del formulario I-589 (Application for Asylum) con auto-llenado de campos usando PDFtk.

## 🎯 Características

- ✅ Generación de PDFs con auto-llenado usando PDFtk
- ✅ Descarga de plantillas desde Supabase Storage
- ✅ Marca de agua para previews
- ✅ API REST con autenticación Bearer token
- ✅ Compatible con Windows, macOS y Linux
- ✅ Manejo de archivos temporales con limpieza automática

## 📋 Requisitos

- Node.js 18+
- PDFtk instalado en el sistema
- Cuenta en Supabase con Storage configurado

## 🔧 Instalación de PDFtk en Windows

### Opción 1: PDFtk Server (Recomendado)

1. **Descargar PDFtk Server**
   - Ve a: https://www.pdflabs.com/tools/pdftk-server/
   - Descarga "PDFtk Server for Windows"
   - Ejecuta el instalador

2. **Agregar PDFtk al PATH**
   - El instalador debería agregarlo automáticamente
   - Ubicación por defecto: `C:\Program Files (x86)\PDFtk Server\bin\`

3. **Verificar instalación**
   ```powershell
   pdftk --version
   ```

### Opción 2: PDFtk Free (Alternativa)

Si PDFtk Server no funciona, usa PDFtk Free:

```powershell
# Usando Chocolatey
choco install pdftk

# O descarga desde:
# https://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/
```

## 🚀 Instalación Local

### 1. Clonar/Navegar al proyecto

```powershell
cd c:\Users\leine\Downloads\PDFtk
```

### 2. Instalar dependencias

```powershell
npm install
```

### 3. Configurar variables de entorno

```powershell
# Copiar el archivo de ejemplo
copy .env.example .env
```

Editar `.env` con tus valores:

```env
PORT=3001
NODE_ENV=development
API_SECRET_KEY=local-dev-secret-key-123
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
PDF_TEMPLATE_BUCKET=form-templates
PDF_TEMPLATE_PATH=i-589/2025-01-20/i-589.pdf
```

> [!IMPORTANT]
> **Obtener credenciales de Supabase:**
> 1. Ve a tu proyecto en https://supabase.com/dashboard
> 2. Settings → API
> 3. Copia `URL` y `service_role key`

### 4. Ejecutar en desarrollo

```powershell
npm run dev
```

El servidor estará disponible en: http://localhost:3001

## 📡 Probar la API Localmente

### 1. Health Check

```powershell
curl http://localhost:3001/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "service": "pdf-service",
  "timestamp": "2025-12-27T23:15:00.000Z"
}
```

### 2. Generar Preview

```powershell
curl -X POST http://localhost:3001/api/fill-i589-preview `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer local-dev-secret-key-123" `
  -d '{\"intakeData\":{\"personal_info\":{\"first_name\":\"Juan\",\"last_name\":\"Pérez\"}}}' `
  --output test-preview.pdf
```

### 3. Abrir el PDF generado

```powershell
start test-preview.pdf
```

## 🧪 Testing con Datos de Ejemplo

Crear archivo `test-data.json`:

```json
{
  "intakeData": {
    "personal_info": {
      "first_name": "Juan",
      "last_name": "Pérez",
      "middle_name": "Carlos",
      "date_of_birth": "1990-01-15",
      "nationality": "Venezuela",
      "a_number": "A123456789",
      "ssn": "123-45-6789",
      "phone": "(555) 123-4567",
      "current_address": {
        "street": "123 Main St",
        "city": "Miami",
        "state": "FL",
        "zip": "33101"
      }
    },
    "processing_info": {
      "i94_number": "12345678901",
      "last_entry_date": "2023-06-15",
      "last_entry_location": "Miami International Airport",
      "last_entry_status": "B-2 Tourist"
    },
    "persecution": {
      "description": "Descripción de persecución..."
    },
    "spouse": {
      "include_in_application": true,
      "first_name": "María",
      "last_name": "González",
      "date_of_birth": "1992-03-20"
    }
  }
}
```

Luego probar:

```powershell
curl -X POST http://localhost:3001/api/fill-i589-preview `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer local-dev-secret-key-123" `
  -d "@test-data.json" `
  --output preview.pdf

start preview.pdf
```

## 🔍 Extraer Nombres de Campos del PDF

Para obtener los nombres reales de los campos del formulario I-589:

```powershell
# Descargar el PDF I-589 desde Supabase o tenerlo localmente
pdftk i-589.pdf dump_data_fields > fields.txt

# Ver los campos
notepad fields.txt
```

Luego actualiza `src/services/mapping.service.js` con los nombres correctos.

## 🐛 Troubleshooting

### Error: "pdftk: command not found"

**Solución:**
1. Verifica que PDFtk esté instalado: `pdftk --version`
2. Si no está instalado, sigue las instrucciones de instalación arriba
3. Reinicia PowerShell después de instalar

### Error: "Failed to create signed URL for template"

**Solución:**
1. Verifica que `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` sean correctos
2. Verifica que el bucket `form-templates` exista en Supabase Storage
3. Verifica que el archivo `i-589/2025-01-20/i-589.pdf` exista en el bucket

### Error: "Unauthorized"

**Solución:**
- Verifica que uses el mismo `API_SECRET_KEY` en el header:
  ```
  Authorization: Bearer local-dev-secret-key-123
  ```

### El servidor no inicia

**Solución:**
1. Verifica que el puerto 3001 no esté en uso:
   ```powershell
   netstat -ano | findstr :3001
   ```
2. Cambia el puerto en `.env` si es necesario

## 📁 Estructura del Proyecto

```
PDFtk/
├── src/
│   ├── server.js              # Servidor Express principal
│   ├── routes/
│   │   └── pdf.routes.js      # Rutas de generación de PDF
│   ├── services/
│   │   ├── pdftk.service.js   # Lógica de PDFtk (compatible Windows)
│   │   ├── storage.service.js # Interacción con Supabase
│   │   └── mapping.service.js # Mapeo de datos a campos PDF
│   ├── utils/
│   │   ├── fdf-generator.js   # Generador de archivos FDF
│   │   └── watermark.js       # Agregar marca de agua
│   └── middleware/
│       └── auth.middleware.js # Autenticación de requests
├── package.json
├── .env                        # Tu configuración local (no commitear)
├── .env.example               # Template de configuración
└── README.md
```

## 🚀 Próximos Pasos

1. **Configurar Supabase Storage**
   - Crear bucket `form-templates`
   - Subir PDF I-589

2. **Actualizar mapeo de campos**
   - Extraer campos reales del PDF
   - Actualizar `mapping.service.js`

3. **Probar localmente**
   - Generar previews
   - Generar PDFs finales
   - Verificar campos

4. **Deployment (opcional)**
   - Ver `deployment-checklist.md` para Render
   - O mantener como servicio local

## 📝 Notas de Desarrollo

- El servidor usa `nodemon` en modo desarrollo para hot-reload
- Los archivos temporales se crean en `%TEMP%\pdf-*`
- Los logs se muestran en la consola
- CORS está habilitado para desarrollo local

## 📄 Licencia

MIT
