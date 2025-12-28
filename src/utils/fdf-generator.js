/**
 * Genera archivo FDF (Form Data Format) para PDFtk
 */
function generateFDF(fields) {
    let fdf = '%FDF-1.2\n'
    fdf += '1 0 obj\n<<\n/FDF << /Fields [\n'

    for (const [key, value] of Object.entries(fields)) {
        if (value) {
            const escapedValue = value.toString().replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
            fdf += `<< /T (${key}) /V (${escapedValue}) >>\n`
        }
    }

    fdf += '] >>\n>>\nendobj\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF'

    return fdf
}

module.exports = { generateFDF }
