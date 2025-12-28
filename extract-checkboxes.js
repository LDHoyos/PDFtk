const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

async function run() {
    try {
        const input = 'test-template.pdf';
        const unlocked = 'temp-analyze.pdf';

        // 1. Unlocked using direct path
        const qpdfPath = path.join(__dirname, 'bin', 'qpdf.exe');
        console.log(`Using QPDF: ${qpdfPath}`);

        const unlockCmd = `"${qpdfPath}" --decrypt "${input}" "${unlocked}"`;

        // Use promise for exec
        const execPromise = (cmd) => new Promise((resolve, reject) => {
            exec(cmd, (err, stdout, stderr) => {
                if (err) reject(err);
                else resolve(stdout);
            });
        });

        await execPromise(unlockCmd);
        console.log('Unlocked.');

        // 2. Dump fields
        const cmd = `pdftk "${unlocked}" dump_data_fields`;
        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return;
            }

            // 3. Parse output
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
                    currentField.FieldName = line.split(': ')[1];
                } else if (line.startsWith('FieldType:')) {
                    currentField.FieldType = line.split(': ')[1];
                } else if (line.startsWith('FieldStateOption:')) {
                    const opt = line.split(': ')[1];
                    if (opt !== 'Off') currentField.Options.push(opt);
                }
            });

            // 4. Output Markdown table
            console.log('| Nombre del Campo (FieldName) | Valores (Options) |');
            console.log('|---|---|');
            checkboxes.forEach(cb => {
                if (cb.Options.length > 0) {
                    console.log(`| \`${cb.FieldName}\` | ${cb.Options.map(o => `\`${o}\``).join(', ')} |`);
                }
            });

            // Cleanup
            fs.unlinkSync(unlocked);
        });

    } catch (e) {
        console.error(e);
    }
}

run();
