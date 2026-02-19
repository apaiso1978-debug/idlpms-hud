/**
 * splice_login.cjs — Replace teacher buttons in login.html with real teacher data
 * Also updates: principal name, student quick-select
 */
const fs = require('fs');
const path = require('path');

const loginPath = path.join(__dirname, '..', 'login.html');
const buttonsPath = path.join(__dirname, 'login_teacher_buttons.html');

let html = fs.readFileSync(loginPath, 'utf-8');
const buttons = fs.readFileSync(buttonsPath, 'utf-8');

// 1. Fix principal display name (ผอ.วรชัย → ผอ.บุญเรือง)
html = html.replace('ผอ.วรชัย', 'ผอ.บุญเรือง');

// 2. Fix comment "Director + 17 Teachers Grid" → "Director + 16 Teachers Grid"
html = html.replace('Director + 17 Teachers Grid', 'ผอ. + ครูวรชัย(Dev) + 15 ครูประจำชั้น');

// 3. Replace teacher buttons block
// Find: from first TEA_M_01 button to end of TEA_M_17 button
const startMarker = `                <button onclick="quickSelect('TEA_M_01')"`;
const endMarker = `</span></span>\n                </button>\n            </div>`;

const startIdx = html.indexOf(startMarker);
// Find the closing of the teacher grid div (</div> after the last teacher button)
const teaM17Idx = html.indexOf(`quickSelect('TEA_M_17')`);
// Find the </button> after TEA_M_17
const endBtnIdx = html.indexOf('</button>', teaM17Idx);
const afterEndBtn = endBtnIdx + '</button>'.length;

// Find the next </div> which closes the grid
const gridCloseIdx = html.indexOf('</div>', afterEndBtn);

if (startIdx === -1 || teaM17Idx === -1) {
    console.error('Could not find teacher button markers');
    console.log('startIdx:', startIdx, 'teaM17Idx:', teaM17Idx);
    process.exit(1);
}

// Replace from first teacher button to just before the grid close div
const before = html.substring(0, startIdx);
const after = html.substring(gridCloseIdx);

html = before + buttons + '            ' + after;

// 4. Update student quick-select (น้องดา มีใจ → real student)
html = html.replace(
    `น้องดา\n                        มีใจ — นักเรียน ป.1/1`,
    `ติณณภพ อินทรฉ่ำ — นักเรียน ป.3`
);
// Also update the student key reference
html = html.replace(`quickSelect('STU_M_001')`, `quickSelect('STU_001')`);

// Save
fs.writeFileSync(loginPath, html, 'utf-8');
console.log('login.html updated successfully');
console.log('Lines:', html.split('\n').length);
