const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../pages');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Replace border-[var(--vs-border)] -> border-[rgba(63,63,70,0.5)]
    // Replace border border-zinc-700 -> border border-[rgba(63,63,70,0.5)]
    // Replace border-zinc-800 -> border-[rgba(63,63,70,0.5)]

    // Pattern 1: border-[var(--vs-border)]
    content = content.replace(/border-\[var\(--vs-border\)\]/g, 'border-[rgba(63,63,70,0.5)]');

    // Pattern 2: border solid var(--vs-border) inside inline styles
    content = content.replace(/border[:\s]+1px solid var\(--vs-border\)/g, 'border: 1px solid rgba(63, 63, 70, 0.5)');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[AUTO-FIXED] Border rules updated in: ${filePath}`);
    }
}

function walkDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith('.html') || file.endsWith('.js')) {
            processFile(fullPath);
        }
    });
}

console.log('Starting Auto-Fixer for Border Opacity Violations...');
walkDir(pagesDir);
// Also check js components
walkDir(path.join(__dirname, '../assets/js'));
console.log('Auto-Fix completed.');
