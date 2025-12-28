// Minimal test
console.log('Step 1: Loading dotenv...')
require('dotenv').config()
console.log('Step 2: dotenv OK')

console.log('Step 3: Loading express...')
const express = require('express')
console.log('Step 4: express OK')

console.log('Step 5: Loading cors...')
const cors = require('cors')
console.log('Step 6: cors OK')

console.log('Step 7: Loading auth middleware...')
const { authenticateRequest } = require('./middleware/auth.middleware')
console.log('Step 8: auth middleware OK')

console.log('Step 9: Loading pdftk service...')
const pdftkService = require('./services/pdftk.service')
console.log('Step 10: pdftk service OK')

console.log('\n✅ All modules loaded!')
