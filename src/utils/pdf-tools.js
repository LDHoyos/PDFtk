const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

const execAsync = promisify(exec);

// Detect paths - prioritize local binary paths if on Windows dev, otherwise use global command
const IS_WINDOWS = process.platform === 'win32';
const PDFTK_PATH = IS_WINDOWS ? '"C:\\Program Files (x86)\\PDFtk Server\\bin\\pdftk.exe"' : 'pdftk';

// Check for local qpdf in project root/bin
const projectRoot = path.resolve(__dirname, '../../');
const localQpdfParams = [
    path.join(projectRoot, 'bin', 'qpdf.exe'),
    path.join(projectRoot, 'bin', 'mingw64', 'bin', 'qpdf.exe') // Common structure when extracting zip
];

let QPDF_PATH = 'qpdf';
for (const p of localQpdfParams) {
    if (fsSync.existsSync(p)) {
        QPDF_PATH = `"${p}"`;
        break;
    }
}

async function unlockPdf(inputPath, outputPath) {
    try {
        console.log(`🔓 Unlocking PDF: ${inputPath} -> ${outputPath}`);
        console.log(`Using QPDF: ${QPDF_PATH}`);
        // --decrypt removes restrictions
        await execAsync(`${QPDF_PATH} --decrypt "${inputPath}" "${outputPath}"`);
        return outputPath;
    } catch (error) {
        console.error('❌ Error unlocking PDF:', error.stderr || error.message);
        throw new Error('Failed to unlock PDF template');
    }
}

async function fillPdf(inputPath, fdfPath, outputPath, flatten = true) {
    try {
        console.log(`✍️ Filling PDF: ${inputPath} + ${fdfPath} -> ${outputPath}`);
        const flattenFlag = flatten ? 'flatten' : '';
        const command = `${PDFTK_PATH} "${inputPath}" fill_form "${fdfPath}" output "${outputPath}" ${flattenFlag}`;

        await execAsync(command);
        return outputPath;
    } catch (error) {
        console.error('❌ Error filling PDF:', error.stderr || error.message);
        throw new Error('Failed to fill PDF form');
    }
}

function generateFdf(fields) {
    let fdf = `%FDF-1.2
1 0 obj
<<
/FDF << /Fields [
`;

    for (const [key, value] of Object.entries(fields)) {
        // Simple escaping for FDF (parentheses and backslashes)
        // This is a basic implementation. For complex strings, more robust escaping is needed.
        const escapedValue = String(value)
            .replace(/\\/g, '\\\\')
            .replace(/\(/g, '\\(')
            .replace(/\)/g, '\\)');

        fdf += `<< /T (${key}) /V (${escapedValue}) >>\n`;
    }

    fdf += `] >>
>>
endobj
trailer
<<
/Root 1 0 R
>>
%%EOF`;

    return fdf;
}

module.exports = {
    unlockPdf,
    fillPdf,
    generateFdf
};
