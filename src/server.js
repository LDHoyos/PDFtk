require('dotenv').config()
const express = require('express')
const cors = require('cors')
const pdfRoutes = require('./routes/pdf.routes')

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'pdf-service',
    timestamp: new Date().toISOString()
  })
})

// Routes
app.use('/api', pdfRoutes)

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  })
})

app.listen(PORT, () => {
  console.log(`🚀 PDF Service running on port ${PORT}`)
})
