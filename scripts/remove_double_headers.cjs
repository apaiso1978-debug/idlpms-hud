const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../pages');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Regular expression to match <header class="vs-page-header"> ... </header>
    // We use [\s\S]*? to lazily match any character including newlines
    const headerRegex = /<header\s+class="vs-page-header"[\s\S]*?<\/header>\s*/g;

    if (headerRegex.test(content)) {
        content = content.replace(headerRegex, '');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[FIXED] Removed double header: ${filePath}`);
    }
}

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith('.html')) {
            processFile(fullPath);
        }
    });
}

console.log('Starting system-wide deep sweep for Edge-to-Edge Double Header Violation...');
walkDir(pagesDir);
console.log('Sweep completed.');
