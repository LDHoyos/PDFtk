require('dotenv').config();
const { downloadTemplate } = require('./src/services/storage.service');
const { unlockPdf } = require('./src/utils/pdf-tools');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function analyze() {
    try {
        console.log('⬇️ Downloading template...');
        const buffer = await downloadTemplate();
        // Convert ArrayBuffer to Buffer (using the fix we just made or ensuring it here)
        // Ideally storage service returns Buffer now, but let's be safe
        const pdfBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);

        await fs.writeFile('temp-locked.pdf', pdfBuffer);

        console.log('🔓 Unlocking...');
        // We know where qpdf is locally
        const qpdfPath = path.join(__dirname, 'bin', 'qpdf.exe');
        // Manual unlock command to be safe
        const execPromise = (cmd) => new Promise((resolve, reject) => {
            exec(cmd, (err, stdout, stderr) => {
                if (err) reject(err);
                else resolve(stdout);
            });
        });

        await execPromise(`"${qpdfPath}" --decrypt temp-locked.pdf temp-analyzable.pdf`);

        console.log('📝 Dumping fields...');
        exec(`"C:\\Program Files (x86)\\PDFtk Server\\bin\\pdftk.exe" temp-analyzable.pdf dump_data_fields`, (err, stdout) => {
            if (err) {
                console.error('PDFtk error:', err);
                return;
            }

            const lines = stdout.split('\n');
            let currentField = {};
            const checkboxes = [];

            lines.forEach(line => {
                if (line === '---') {
                    if (currentField.FieldType === 'Button') {
                        checkboxes.push(currentField);
                    }
                    currentField = { Options: [] };
                } else if (line.startsWith('FieldName:')) {
                    currentField.FieldName = line.split(': ')[1].trim();
                } else if (line.startsWith('FieldNameAlt:')) {
                    currentField.FieldNameAlt = line.split(': ')[1].trim();
                } else if (line.startsWith('FieldType:')) {
                    currentField.FieldType = line.split(': ')[1].trim();
                } else if (line.startsWith('FieldStateOption:')) {
                    const opt = line.split(': ')[1].trim();
                    if (opt !== 'Off') currentField.Options.push(opt);
                }
            });

            console.log('\n### CAMPOS DE TIPO CHECKBOX (Button)');
            checkboxes.forEach(cb => {
                // Filter out boring ones or show all
                if (cb.Options.length > 0) {
                    console.log(`- **Campo**: \`${cb.FieldName}\``);
                    console.log(`  - *Descripción*: ${cb.FieldNameAlt || 'N/A'}`);
                    console.log(`  - *Opciones Válidas*: [ ${cb.Options.map(o => `"${o}"`).join(', ')} ]`);
                    console.log('');
                }
            });

            // Cleanup
            fs.unlink('temp-locked.pdf').catch(() => { });
            fs.unlink('temp-analyzable.pdf').catch(() => { });
        });

    } catch (e) {
        console.error('Error:', e);
    }
}

analyze();
