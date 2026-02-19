/**
 * splice_data_v2.cjs — FIXED: Replace the ENTIRE mock block in data.js
 * Range: from "// --- WAT MAP CHALUD SCHOOL" to the line before "// --- GRADE-SPECIFIC"
 */
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'assets', 'js', 'data.js');
const bakPath = dataPath + '.bak';
const blockPath = path.join(__dirname, 'real_users_block_full.txt');

// RESTORE from backup first
if (fs.existsSync(bakPath)) {
    fs.copyFileSync(bakPath, dataPath);
    console.log('Restored from backup');
}

const data = fs.readFileSync(dataPath, 'utf-8');
const block = fs.readFileSync(blockPath, 'utf-8');
const lines = data.split('\n');

let startLine = -1;
let endLine = -1;

for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    // Start: "// --- WAT MAP CHALUD SCHOOL"
    if (l.includes('WAT MAP CHALUD SCHOOL') && startLine === -1) {
        startLine = i;
    }
    // End: line before "// --- GRADE-SPECIFIC STUDENTS"
    if (l.includes('GRADE-SPECIFIC STUDENTS') && endLine === -1) {
        // Go back to find the blank line before this comment
        endLine = i - 1;
        // Skip any blank lines
        while (endLine > startLine && lines[endLine].trim() === '') endLine--;
        endLine++; // include one trailing blank line
    }
}

if (startLine === -1 || endLine === -1) {
    console.error(`FAILED: startLine=${startLine}, endLine=${endLine}`);
    process.exit(1);
}

console.log(`Replacing lines ${startLine + 1} to ${endLine + 1} (${endLine - startLine + 1} lines)`);
console.log(`First replaced line: ${lines[startLine].trim().substring(0, 60)}`);
console.log(`Last replaced line:  ${lines[endLine].trim().substring(0, 60)}`);

const before = lines.slice(0, startLine);
const after = lines.slice(endLine);

const newContent = before.join('\n') + '\n' + block + '\n' + after.join('\n');

// Save backup again
fs.writeFileSync(bakPath, data, 'utf-8');
fs.writeFileSync(dataPath, newContent, 'utf-8');

const newLines = newContent.split('\n').length;
console.log(`Done! data.js: ${lines.length} -> ${newLines} lines`);
