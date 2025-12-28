/**
 * PDF Service Client for Vercel Integration
 * 
 * Este archivo debe ser colocado en: lib/pdf/pdf-service-client.ts
 * en tu proyecto de Vercel.
 * 
 * Variables de entorno requeridas en Vercel:
 * - PDF_SERVICE_URL=https://pdf-service.onrender.com
 * - PDF_SERVICE_API_KEY=<mismo-api-secret-key-del-microservicio>
 */

export interface IntakeData {
  personal_info?: {
    first_name?: string
    last_name?: string
    middle_name?: string
    a_number?: string
    ssn?: string
    date_of_birth?: string
    nationality?: string
    current_address?: {
      street?: string
      city?: string
      state?: string
      zip?: string
    }
    phone?: string
  }
  processing_info?: {
    i94_number?: string
    last_entry_date?: string
    last_entry_location?: string
    last_entry_status?: string
  }
  persecution?: {
    description?: string
  }
  spouse?: {
    include_in_application?: boolean
    first_name?: string
    last_name?: string
    date_of_birth?: string
  }
  // Agregar más campos según tu estructura
}

export interface ClientData {
  // Define la estructura de clientData según tus necesidades
  [key: string]: any
}

/**
 * Genera un PDF preview con marca de agua del formulario I-589
 * 
 * @param intakeData - Datos del formulario de intake de asilo
 * @param clientData - Datos adicionales del cliente (opcional)
 * @returns ArrayBuffer del PDF generado
 * @throws Error si la generación falla
 */
export async function generateI589Preview(
  intakeData: IntakeData,
  clientData?: ClientData
): Promise<ArrayBuffer> {
  const serviceUrl = process.env.PDF_SERVICE_URL
  const apiKey = process.env.PDF_SERVICE_API_KEY

  if (!serviceUrl || !apiKey) {
    throw new Error('PDF service configuration missing. Check PDF_SERVICE_URL and PDF_SERVICE_API_KEY')
  }

  const response = await fetch(`${serviceUrl}/api/fill-i589-preview`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ intakeData, clientData })
  })

  if (!response.ok) {
    let errorMessage = 'PDF service failed'
    try {
      const error = await response.json()
      errorMessage = error.message || error.error || errorMessage
    } catch {
      // Si no se puede parsear el error, usar el mensaje por defecto
    }
    throw new Error(errorMessage)
  }

  return await response.arrayBuffer()
}

/**
 * Genera un PDF final sin marca de agua del formulario I-589
 * 
 * @param snapshotData - Snapshot de datos del formulario (datos finales congelados)
 * @param clientData - Datos adicionales del cliente (opcional)
 * @returns ArrayBuffer del PDF generado
 * @throws Error si la generación falla
 */
export async function generateI589Final(
  snapshotData: IntakeData,
  clientData?: ClientData
): Promise<ArrayBuffer> {
  const serviceUrl = process.env.PDF_SERVICE_URL
  const apiKey = process.env.PDF_SERVICE_API_KEY

  if (!serviceUrl || !apiKey) {
    throw new Error('PDF service configuration missing. Check PDF_SERVICE_URL and PDF_SERVICE_API_KEY')
  }

  const response = await fetch(`${serviceUrl}/api/fill-i589-final`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ snapshotData, clientData })
  })

  if (!response.ok) {
    let errorMessage = 'PDF service failed'
    try {
      const error = await response.json()
      errorMessage = error.message || error.error || errorMessage
    } catch {
      // Si no se puede parsear el error, usar el mensaje por defecto
    }
    throw new Error(errorMessage)
  }

  return await response.arrayBuffer()
}

/**
 * Helper para descargar el PDF en el navegador
 * 
 * @param pdfBuffer - ArrayBuffer del PDF
 * @param filename - Nombre del archivo a descargar
 */
export function downloadPDF(pdfBuffer: ArrayBuffer, filename: string = 'i589.pdf') {
  const blob = new Blob([pdfBuffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Helper para abrir el PDF en una nueva pestaña
 * 
 * @param pdfBuffer - ArrayBuffer del PDF
 */
export function openPDFInNewTab(pdfBuffer: ArrayBuffer) {
  const blob = new Blob([pdfBuffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
  // Nota: No revocamos el URL inmediatamente porque la nueva pestaña lo necesita
}

// Ejemplo de uso en un componente React:
/*
'use client'

import { generateI589Preview, downloadPDF } from '@/lib/pdf/pdf-service-client'
import { useState } from 'react'

export function GeneratePDFButton({ intakeData }: { intakeData: any }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGeneratePreview = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const pdfBuffer = await generateI589Preview(intakeData)
      downloadPDF(pdfBuffer, 'i589-preview.pdf')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate PDF')
      console.error('PDF generation error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button 
        onClick={handleGeneratePreview}
        disabled={loading}
      >
        {loading ? 'Generating...' : 'Generate Preview'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  )
}
*/
