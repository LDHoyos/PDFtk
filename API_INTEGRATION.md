# Guía de Integración API - Generación de PDF I-589

Este documento describe cómo consumir el servicio de generación de PDFs I-589 desde el frontend.

## Endpoints

### 1. Generar PDF (Preview o Final)

**URL:** `POST /api/fill-i589-preview` (o `fill-i589-final`)

**Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <TOKEN>` (según tu middleware de auth)

**Body (JSON):**

El objeto principal debe ser `intakeData`. Dentro de él, la estructura esperada es:

```json
{
  "intakeData": {
    "personal_info": {
      "first_name": "Juan",
      "last_name": "Pérez",
      "middle_name": "Carlos",
      "date_of_birth": "1990-01-15", // Formato YYYY-MM-DD
      "nationality": "Venezuela",
      "gender": "Male", // o "Female"
      "marital_status": "Single", // "Single", "Married", "Divorced", "Widowed"
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
      "last_entry_location": "Miami",
      "last_entry_status": "B-2"
    },
    "spouse": {
      "include_in_application": true,
      "first_name": "María",
      "last_name": "González",
      "date_of_birth": "1992-03-20"
    }
  },
  "clientData": {
    // Datos opcionales del cliente/abogado
  }
}
```

## Campos Soportados

El servicio mapea automáticamente los siguientes datos del JSON a los campos del formulario I-589:

### Información Personal
- `first_name` -> First Name
- `last_name` -> Complete Last Name
- `middle_name` -> Middle Name
- `a_number` -> Alien Registration Number
- `ssn` -> Social Security Number
- `date_of_birth` -> Date of Birth
- `nationality` -> Nationality
- `gender` -> Checkbox (Male/Female)
- `marital_status` -> Checkbox (Single/Married/Divorced/Widowed)

### Dirección Residencia (Physical Address)
- `current_address.street` -> Street Number and Name
- `current_address.city` -> City
- `current_address.state` -> State
- `current_address.zip` -> Zip Code
- `phone` -> Telephone Number

### Dirección Correspondencia (Mailing Address)
*Por defecto se usa la misma que la de residencia.*

### Procesamiento
- `i94_number` -> I-94 Number

### Cónyuge (Spouse)
- `spouse.first_name` -> Spouse First Name
- `spouse.last_name` -> Spouse Last Name
- `spouse.date_of_birth` -> Spouse Date of Birth

> [!TIP]
> **Campos Faltantes**: Si el PDF tiene más campos que no se llenan, asegúrate de que el objeto JSON enviado contenga las claves exactas mencionadas arriba. Si necesitas agregar nuevos campos, debes actualizar `src/services/mapping.service.js`.
