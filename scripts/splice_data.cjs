/**
 * splice_data.cjs — Replace mock users in data.js with real data
 * Replaces lines 296-421 (the WAT MAP CHALUD section) with real data
 */
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'assets', 'js', 'data.js');
const blockPath = path.join(__dirname, 'real_users_block_full.txt');

const data = fs.readFileSync(dataPath, 'utf-8');
const block = fs.readFileSync(blockPath, 'utf-8');

const lines = data.split('\n');

// Find the exact markers
let startLine = -1; // "// --- WAT MAP CHALUD SCHOOL" or users section start
let endLine = -1;   // End of STU_M_250 or last mock student

for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (l.includes('--- WAT MAP CHALUD SCHOOL') || l.includes('--- WAT MAP CHALUD')) {
        startLine = i;
    }
    if (l.startsWith('STU_M_250:') || l.includes('STU_M_250:')) {
        endLine = i;
    }
}

if (startLine === -1 || endLine === -1) {
    console.error('Could not find markers!');
    console.log('Searching for alternative markers...');

    for (let i = 0; i < lines.length; i++) {
        const l = lines[i].trim();
        if (l.includes('WAT MAP CHALUD') && startLine === -1) {
            startLine = i;
            console.log(`Found start at line ${i + 1}: ${l}`);
        }
        if (l.includes('STU_M_250') || (l.includes('GRADE-SPECIFIC STUDENTS') && endLine === -1)) {
            endLine = i - 1;
            console.log(`Found end at line ${i + 1}: ${l}`);
        }
    }
}

// Find the line before GRADE-SPECIFIC STUDENTS as the true end
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('GRADE-SPECIFIC STUDENTS')) {
        endLine = i - 1; // blank line before it
        break;
    }
}

console.log(`Replacing lines ${startLine + 1} to ${endLine + 1} (${endLine - startLine + 1} lines)`);

// Build new file
const before = lines.slice(0, startLine);
const after = lines.slice(endLine + 1);
const newContent = before.join('\n') + '\n' + block + '\n' + after.join('\n');

// Backup first
fs.writeFileSync(dataPath + '.bak', data, 'utf-8');
fs.writeFileSync(dataPath, newContent, 'utf-8');

const newLines = newContent.split('\n').length;
console.log(`Done! data.js: ${lines.length} -> ${newLines} lines`);
console.log(`Backup saved as data.js.bak`);
