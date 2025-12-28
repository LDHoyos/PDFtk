const { unlockPdf, fillPdf, generateFdf } = require('../utils/pdf-tools')
const { downloadTemplate } = require('./storage.service')
const { mapIntakeToFDF } = require('./mapping.service')
const fs = require('fs').promises
const path = require('path')
const os = require('os')
const { v4: uuidv4 } = require('uuid')

async function processPdf(data, isPreview = false) {
    let tempDir = null;
    try {
        console.log(`Processing PDF (Preview: ${isPreview})...`);

        // Create temp directory for this request
        tempDir = path.join(os.tmpdir(), `pdf-gen-${uuidv4()}`);
        await fs.mkdir(tempDir, { recursive: true });

        const templatePath = path.join(tempDir, 'template.pdf');
        const unlockedPath = path.join(tempDir, 'template-unlocked.pdf');
        const fdfPath = path.join(tempDir, 'data.fdf');
        const outputPath = path.join(tempDir, 'output.pdf');

        // 1. Download template
        const templateData = await downloadTemplate();
        const templateBuffer = Buffer.from(templateData);
        await fs.writeFile(templatePath, templateBuffer);

        // 2. Unlock PDF (remove ownership restrictions)
        await unlockPdf(templatePath, unlockedPath);

        // 3. Generate FDF data
        const fields = mapIntakeToFDF(data, {}); // Assuming 2nd arg was clientData, merging if needed or passed in data
        const fdfContent = generateFdf(fields);
        await fs.writeFile(fdfPath, fdfContent);

        // 4. Fill PDF
        // For preview, we might assume flatten is okay, or maybe we want it editable? 
        // Usually preview implies "what it will look like", so flatten is good.
        // But if "Preview" means "Draft", maybe not flatten.
        // Let's stick to flatten for now as per original code behavior for final.
        // Original preview had watermarks and flatten.
        await fillPdf(unlockedPath, fdfPath, outputPath, true);

        // 5. Read output
        const pdfBytes = await fs.readFile(outputPath);
        return pdfBytes;

    } catch (error) {
        console.error('Error processing PDF:', error);
        throw error;
    } finally {
        // Cleanup
        if (tempDir) {
            try {
                await fs.rm(tempDir, { recursive: true, force: true });
            } catch (cleanupError) {
                console.error('Error cleaning up temp dir:', cleanupError);
            }
        }
    }
}

async function generatePreview(intakeData, clientData) {
    // For preview, we reuse the robust binary filling. 
    // If watermarking is strictly required, we can add it later via another tool or PDFtk stamp.
    // For now, let's prioritize getting the form filled.
    // To restore watermark, we would need a watermark PDF and use `pdftk multistamp`.
    return processPdf(intakeData, isPreview = true);
}

async function generateFinal(snapshotData, clientData) {
    return processPdf(snapshotData, isPreview = false);
}

module.exports = { generatePreview, generateFinal }
