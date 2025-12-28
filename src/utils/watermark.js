const { PDFDocument, rgb, StandardFonts, degrees } = require('pdf-lib')

async function addWatermark(pdfBuffer) {
    try {
        const pdfDoc = await PDFDocument.load(pdfBuffer)
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
        const pages = pdfDoc.getPages()

        for (const page of pages) {
            const { width, height } = page.getSize()

            // Marca de agua diagonal (usando degrees() correctamente)
            page.drawText('VISTA PREVIA - NO VALIDO PARA PRESENTACION', {
                x: width / 2 - 250,
                y: height / 2,
                size: 40,
                font: font,
                color: rgb(1, 0, 0),
                opacity: 0.2,
                rotate: degrees(45)  // Sintaxis correcta para pdf-lib
            })

            // Header
            page.drawText('PREVIEW ONLY', {
                x: width / 2 - 60,
                y: height - 30,
                size: 16,
                font: font,
                color: rgb(1, 0, 0),
                opacity: 0.5
            })
        }

        return await pdfDoc.save()
    } catch (error) {
        console.error('Error adding watermark:', error)
        // Si falla la marca de agua, devolver el PDF original
        return pdfBuffer
    }
}

module.exports = { addWatermark }

