const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../pages');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Pattern 1: Card Base (replaces bg, border, padding, and rounding that matching vs-card)
    // Common combinations found:
    // class="bg-[var(--vs-bg-card)] border border-[rgba(63,63,70,0.5)] rounded-[var(--vs-radius)] p-4"
    const cardRegexes = [
        /bg-\[var\(--vs-bg-card\)\]\s+border\s+border-\[rgba\(63,63,70,0\.5\)\]\s+rounded-\[var\(--vs-radius\)\]\s+p-4/g,
        /bg-\[var\(--vs-bg-card\)\]\s+border\s+border-\[rgba\(63,63,70,0\.5\)\]\s+p-4\s+rounded-\[var\(--vs-radius\)\]/g,
        /vs-glass\s+border\s+border-\[rgba\(63,63,70,0\.5\)\]\s+p-4\s+rounded-\[var\(--vs-radius\)\]/g,
        /border\s+border-\[rgba\(63,63,70,0\.5\)\]\s+rounded-\[var\(--vs-radius\)\]\s+p-4\s+bg-\[var\(--vs-bg-card\)\]/g
    ];

    cardRegexes.forEach(regex => {
        content = content.replace(regex, 'vs-card');
    });

    // Pattern 2: Form Inputs
    // class="w-full bg-[var(--vs-bg-deep)] border-none rounded-[var(--vs-radius)] px-3 py-2 text-[13px] text-[var(--vs-text-body)]"
    // We already styled global inputs, but some explicit classes can be swapped to vs-input
    const inputRegexes = [
        /bg-\[var\(--vs-bg-deep\)\]\s+border-none\s+rounded-\[var\(--vs-radius\)\]\s+px-\d+\s+py-\d+/g,
        /form-input/g
    ];

    inputRegexes.forEach(regex => {
        content = content.replace(regex, 'vs-input');
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[COMPONENTIZED] Refactored classes in: ${filePath}`);
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

console.log('Sweeping View Templates for Single-Source Component mapping...');
walkDir(pagesDir);
walkDir(path.join(__dirname, '../assets/js'));
console.log('Sweep completed.');
