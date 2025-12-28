const express = require('express')
const router = express.Router()
const { authenticateRequest } = require('../middleware/auth.middleware')
const pdftkService = require('../services/pdftk.service')

// Generar preview con marca de agua
router.post('/fill-i589-preview', authenticateRequest, async (req, res) => {
    try {
        const { intakeData, clientData } = req.body

        if (!intakeData) {
            return res.status(400).json({ error: 'Missing intakeData' })
        }

        const pdfBuffer = await pdftkService.generatePreview(intakeData, clientData)

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'inline; filename="i589-preview.pdf"')
        res.send(pdfBuffer)

    } catch (error) {
        console.error('Error generating preview:', error)
        res.status(500).json({ error: error.message })
    }
})

// Generar PDF final sin marca de agua
router.post('/fill-i589-final', authenticateRequest, async (req, res) => {
    try {
        const { snapshotData, clientData } = req.body

        if (!snapshotData) {
            return res.status(400).json({ error: 'Missing snapshotData' })
        }

        const pdfBuffer = await pdftkService.generateFinal(snapshotData, clientData)

        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', 'inline; filename="i589-final.pdf"')
        res.send(pdfBuffer)

    } catch (error) {
        console.error('Error generating final PDF:', error)
        res.status(500).json({ error: error.message })
    }
})

module.exports = router
