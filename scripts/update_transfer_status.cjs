/**
 * update_transfer_status.cjs — Batch update WITHDRAWN → PENDING_TRANSFER + add transferDate
 * Token-efficient: single pass string replace
 */
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'assets', 'js', 'data.js');
let data = fs.readFileSync(dataPath, 'utf-8');

// Replace all `status: 'WITHDRAWN'` with `status: 'PENDING_TRANSFER', transferDate: '2568-11-07'`
const count = (data.match(/status: 'WITHDRAWN'/g) || []).length;
data = data.replace(
    /status: 'WITHDRAWN'/g,
    "status: 'PENDING_TRANSFER', transferDate: '2568-11-07'"
);

fs.writeFileSync(dataPath, data, 'utf-8');
console.log(`Updated ${count} entries: WITHDRAWN → PENDING_TRANSFER + transferDate`);
