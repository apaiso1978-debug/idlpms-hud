const fs = require('fs');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function extractPdfText(pdfPath) {
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    const doc = await pdfjsLib.getDocument({ data }).promise;

    console.log('=== PDF TEXT CONTENT ===');
    console.log('Pages:', doc.numPages);
    console.log('---');

    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const textContent = await page.getTextContent();
        const text = textContent.items.map(item => item.str).join(' ');
        console.log(`\n--- Page ${i} ---`);
        console.log(text);
    }
}

extractPdfText('./dltv_worksheet_history_g5_l1.pdf').catch(err => {
    console.error('Error:', err.message);
});
