// Student Import - Batch 3: ป.3, ป.4/1, ป.4/2
const B = 'https://3tcdq2dd.ap-southeast.insforge.app';
const K = 'ik_e9ac09dcf4f6732689dd5558fe889c0a';
const H = { 'Authorization': 'Bearer ' + K, 'Content-Type': 'application/json' };
const SID = 'd04aeda2-48c6-483f-ad83-955563ff3031';
const G = require('./group_ids.json');
const TM = { 'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'เม.ย.': 4, 'พ.ค.': 5, 'มิ.ย.': 6, 'ก.ค.': 7, 'ส.ค.': 8, 'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12 };
function parseDate(d) { if (!d) return null; const p = d.trim().split(/\s+/); if (p.length !== 3) return null; const day = parseInt(p[0]), mon = TM[p[1]]; let yr = parseInt(p[2]); if (yr > 2400) yr -= 543; if (!mon || !day || !yr) return null; return `${yr}-${String(mon).padStart(2, '0')}-${String(day).padStart(2, '0')}`; }
function parseName(f) { let g = 'male', fn = '', ln = null; if (f.startsWith('เด็กชาย')) { g = 'male'; f = f.replace('เด็กชาย', '').trim(); } else if (f.startsWith('เด็กหญิง')) { g = 'female'; f = f.replace('เด็กหญิง', '').trim(); } const p = f.split(/\s+/); fn = p[0] || ''; ln = p.length > 1 ? p.slice(1).join(' ') : null; return { gender: g, fn, ln }; }
function classifyId(id) { if (!id || id === 'None' || id === '—') return { type: 'pending', num: null }; if (id.startsWith('G')) return { type: 'g_code', num: id }; if (id.startsWith('0') || id.startsWith('7')) return { type: 'foreign_id', num: id }; if (/^\d{13}$/.test(id)) return { type: 'citizen_id', num: id }; return { type: 'foreign_id', num: id }; }
async function post(t, d) { const r = await fetch(`${B}/api/database/records/${t}`, { method: 'POST', headers: H, body: JSON.stringify(d) }); if (!r.ok) { console.log(`[ERR] ${t}: ${await r.text()}`); return null; } return true; }
async function findPerson(num, fn) { const all = await (await fetch(`${B}/api/database/records/persons`, { headers: H })).json(); if (num) return all.find(p => p.id_number === num); return all.find(p => p.first_name_th === fn); }
let ok = 0, fail = 0;
async function imp(s, gr) {
    const { gender, fn, ln } = parseName(s.name); const { type, num } = classifyId(s.cid); const bd = parseDate(s.dob); const act = !s.note?.includes('ย้ายออก') && !s.note?.includes('ย้ายไป');
    await post('persons', { id_type: type, id_number: num, prefix_th: gender === 'male' ? 'เด็กชาย' : 'เด็กหญิง', first_name_th: fn, last_name_th: ln, birth_date: bd, gender, nationality: 'ไทย', is_active: String(act) });
    const p = await findPerson(num, fn); if (!p) { console.log(`[FAIL] ${fn}`); fail++; return; }
    await post('role_profiles', { person_id: p.id, role: 'STUDENT', school_id: SID, group_id: G[gr], is_active: String(act) });
    await post('student_profiles', { person_id: p.id, school_id: SID, group_id: G[gr], student_code: s.code || 'N/A', seat_number: s.seat ? parseInt(s.seat) : null, academic_year: 2568, student_status: act ? 'active' : 'transferred' });
    console.log(`[OK] ${s.seat || '-'} ${fn} ${ln || ''} (${type})`); ok++;
}

async function main() {
    const p3 = [
        { seat: 1, code: '6293', cid: '1189900661769', name: 'เด็กชายติณณภพ อินทรฉ่ำ', dob: '5 ต.ค. 2558', note: '' },
        { seat: 2, code: '6385', cid: '1219700109875', name: 'เด็กชายกิตติกวิน เนียมเฟือง', dob: '28 ก.พ. 2560', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 3, code: '6387', cid: '1200901836890', name: 'เด็กหญิงจิรัชญา วิฑูรย์', dob: '23 ส.ค. 2559', note: '' },
        { seat: 4, code: '6388', cid: '1479901242902', name: 'เด็กหญิงณพารัตน์ ฦาชา', dob: '30 ม.ค. 2560', note: 'ย้ายออก' },
        { seat: 5, code: '6390', cid: '1200901840218', name: 'เด็กชายกรณพัฒน์ สิงหเดช', dob: '19 ก.ย. 2559', note: '' },
        { seat: 6, code: '6391', cid: '1219700111004', name: 'เด็กชายคณาธิป กุลบุญมา', dob: '27 มี.ค. 2560', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 7, code: '6392', cid: '1219700110113', name: 'เด็กชายปุณณวิชร์ บุญภา', dob: '6 มี.ค. 2560', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 8, code: '6395', cid: '1129902531064', name: 'เด็กหญิงเกวลิน บุญมา', dob: '25 ก.ย. 2559', note: '' },
        { seat: 9, code: '6398', cid: '1219700102781', name: 'เด็กหญิงอารีรัตน์ ภูปรางค์', dob: '31 ก.ค. 2559', note: '' },
        { seat: 10, code: '6412', cid: '1510101746877', name: 'เด็กชายวิชยา แซ่หาญ', dob: '28 ก.ย. 2559', note: '' },
        { seat: 11, code: '6457', cid: '1439600183991', name: 'เด็กหญิงปพิชญา อุปฮาด', dob: '24 ก.ค. 2559', note: '' },
        { seat: 12, code: '6466', cid: '1219901672232', name: 'เด็กชายวัชรินทร์ หาศิริ', dob: '28 ธ.ค. 2559', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 13, code: '6512', cid: '1369901166085', name: 'เด็กหญิงกัญญาภัค บัวสิงห์', dob: '15 ก.ย. 2559', note: '' },
        { seat: 14, code: '6560', cid: '1219901673336', name: 'เด็กชายณัฐพงษ์ ชูยศ', dob: '7 ม.ค. 2560', note: '' },
        { seat: 15, code: '6561', cid: '0021971053031', name: 'เด็กชายมาร์ค', dob: '5 พ.ค. 2556', note: '' },
        { seat: 16, code: '6562', cid: '1219700111080', name: 'เด็กชายสมจิต ศรีสังข์', dob: '30 มี.ค. 2560', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 17, code: '6563', cid: '1101000618819', name: 'เด็กหญิงเกวลิน จันทนานาค', dob: '5 เม.ย. 2560', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 18, code: '6564', cid: '0021971132047', name: 'เด็กหญิงตั๊ก', dob: '1 ก.ย. 2556', note: 'ย้ายไปอยู่ ป.4/2' },
        { seat: 19, code: '6565', cid: '1399200046717', name: 'เด็กหญิงปภาวรินท์ บุญเจริญ', dob: '21 พ.ค. 2559', note: 'ย้ายออก' },
        { seat: 20, code: '6667', cid: '1209703012058', name: 'เด็กชายศรัณญ์ เฉลิมวัฒน์', dob: '15 ต.ค. 2558', note: '' },
        { seat: 21, code: '6668', cid: '1200601574172', name: 'เด็กหญิงภัณฑิรา โนรีราษฎร์', dob: '29 ธ.ค. 2559', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 22, code: '6675', cid: '1369901164724', name: 'เด็กหญิงสุขปภา มิงกุระ', dob: '1 ก.ย. 2559', note: '' },
        { seat: 23, code: '6690', cid: '1219700106663', name: 'เด็กชายพสธร มุละสิวะ', dob: '21 พ.ย. 2559', note: 'ย้ายออก' },
        { seat: 24, code: '6383', cid: '1458600084339', name: 'เด็กชายกรกวรรษ รินเพ็ง', dob: '1 ส.ค. 2559', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 25, code: '6740', cid: '1219700105306', name: 'เด็กชายกฤษฎา ชาตะบุตร', dob: '13 ต.ค. 2559', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 26, code: '6741', cid: '1239300041688', name: 'เด็กชายปัญจพล บุตรกลิ่น', dob: '8 ต.ค. 2559', note: 'ย้ายเข้า' },
        { seat: 27, code: '6751', cid: '1749901604607', name: 'เด็กหญิงสุวนัน เดชบุรัมย์', dob: '8 ส.ค. 2559', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 28, code: '6767', cid: '1100704638221', name: 'เด็กชายปูรณ์ จูมพิลา', dob: '9 ส.ค. 2559', note: 'ย้ายเข้า' },
        { seat: 29, code: '6731', cid: '219900002600', name: 'เด็กหญิงปรุงฉัตร โจน', dob: '29 ส.ค. 2554', note: '' },
    ];
    console.log('=== ป.3 (29) ==='); for (const s of p3) await imp(s, 'ป.3');

    const p41 = [
        { seat: 1, code: '6223', cid: '1219700088444', name: 'เด็กหญิงภิญญดา ทองมี', dob: '28 พ.ค. 2557', note: '' },
        { seat: 2, code: '6285', cid: '1200901784105', name: 'เด็กหญิงรัตติยาภรณ์ ยอดขาว', dob: '3 มิ.ย. 2558', note: '' },
        { seat: 3, code: '6287', cid: '1219700093367', name: 'เด็กหญิงพรนภา เกลี้ยงเกลา', dob: '30 มิ.ย. 2558', note: '' },
        { seat: 4, code: '6289', cid: '1219700093995', name: 'เด็กหญิงชญานี แก้วย่อย', dob: '28 ก.ค. 2558', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 5, code: '6290', cid: '1219700096919', name: 'เด็กหญิงรุ่งนภา พรกมลวรรณ', dob: '13 ธ.ค. 2558', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 6, code: '6294', cid: '1320300425771', name: 'เด็กชายธนศักดิ์ ประสิทธิการ', dob: '11 ต.ค. 2558', note: '' },
        { seat: 7, code: '6298', cid: '1219700097516', name: 'เด็กชายณัฐภณ บุญปาน', dob: '4 ม.ค. 2559', note: '' },
        { seat: 8, code: '6300', cid: '1260401310228', name: 'เด็กชายกิตติภูมิ สาทพุ่ม', dob: '30 มี.ค. 2559', note: '' },
        { seat: 9, code: '6306', cid: '1219901595157', name: 'เด็กหญิงอัศดาพร งันปัญญา', dob: '20 พ.ค. 2558', note: '' },
        { seat: 10, code: '6443', cid: '1219901606841', name: 'เด็กหญิงกัลยารัตน์ เย็งประโคน', dob: '12 ส.ค. 2558', note: '' },
        { seat: 11, code: '6445', cid: '1219400072763', name: 'เด็กหญิงนิตยา ผะงาตุนัด', dob: '13 มิ.ย. 2558', note: '' },
        { seat: 12, code: '6446', cid: '1200901806737', name: 'เด็กชายคเนศ ผึ้งคุ้ม', dob: '3 ธ.ค. 2558', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 13, code: '6467', cid: '1219700093529', name: 'เด็กชายธนะเทพ ตะเพียนทอง', dob: '10 ก.ค. 2558', note: '' },
        { seat: 14, code: '6470', cid: '1339300047600', name: 'เด็กชายอนุชิต พันธมาศ', dob: '6 ม.ค. 2559', note: 'ย้ายออก' },
        { seat: 15, code: '6570', cid: '1219901830342', name: 'เด็กหญิงณัฐณิชา เซี่ยงผุง', dob: '31 ธ.ค. 2558', note: 'ย้ายออก' },
        { seat: 16, code: '6581', cid: '1208300104123', name: 'เด็กชายอัครเดช จงสมัคร', dob: '14 ต.ค. 2558', note: '' },
        { seat: 17, code: '6601', cid: '1219700094185', name: 'เด็กหญิงกัญญาพัชร์ เคล้าคล่อง', dob: '9 ส.ค. 2558', note: '' },
        { seat: 18, code: '6606', cid: '1417500155071', name: 'เด็กชายมงคล รัตนอุบล', dob: '14 พ.ค. 2558', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 19, code: '6452', cid: '1219700098261', name: 'เด็กชายธนภัทร เปราะขาน', dob: '3 ก.พ. 2559', note: '' },
        { seat: 20, code: '6627', cid: '1309701405647', name: 'เด็กหญิงพรรณิภา จิ๋วโคราช', dob: '31 ม.ค. 2559', note: 'ย้ายออก' },
        { seat: 21, code: '6664', cid: '1648600141365', name: 'เด็กชายวีรภัทร เทพประทุม', dob: '16 ก.พ. 2559', note: '' },
        { seat: 22, code: '6678', cid: '1800901656918', name: 'เด็กชายเพลิงปาณัท ชูพรหมแก้ว', dob: '7 ก.พ. 2559', note: '' },
        { seat: 23, code: '6733', cid: '1219400071571', name: 'เด็กชายเขตโสภณ รัตนบรรลือชัย', dob: '6 ก.พ. 2558', note: '' },
        { seat: 24, code: '6742', cid: '1239300040576', name: 'เด็กหญิงพัชญา บุตรกลิ่น', dob: '20 มิ.ย. 2558', note: 'ย้ายเข้า' },
        { seat: 25, code: '6408', cid: '1219901489314', name: 'เด็กหญิงอุทัยวรรณ ยอดแก้ว', dob: '26 พ.ค. 2556', note: 'เลื่อนชั้น' },
        { seat: 26, code: '6309', cid: '1348900387656', name: 'เด็กชายจรูญพัฒน์ มะสันเทียะ', dob: '15 ธ.ค. 2558', note: 'ย้ายเข้า' },
    ];
    console.log('\n=== ป.4/1 (26) ==='); for (const s of p41) await imp(s, 'ป.4/1');

    const p42 = [
        { seat: 1, code: '6277', cid: '1219901599225', name: 'เด็กชายภูมิสิทธิ์ เจริญสาริภัณฑ์', dob: '19 มิ.ย. 2558', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 2, code: '6279', cid: '1219901603702', name: 'เด็กชายโชคชัย สารินันท์', dob: '20 ก.ค. 2558', note: '' },
        { seat: 3, code: '6284', cid: '1219700099446', name: 'เด็กชายปวิชญา ชัยปัญญา', dob: '21 มี.ค. 2559', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 4, code: '6288', cid: '1219700093804', name: 'เด็กหญิงธัญญรัตน์ บุญหล้า', dob: '26 ก.ค. 2558', note: '' },
        { seat: 5, code: '6299', cid: '1219700098601', name: 'เด็กชายกฤตกวิน แสงเหลา', dob: '16 ก.พ. 2559', note: '' },
        { seat: 6, code: '6303', cid: '1200901813083', name: 'เด็กหญิงกตัญญุตา โพธิ์อุดม', dob: '29 ม.ค. 2559', note: '' },
        { seat: 7, code: '6304', cid: '1219700099551', name: 'เด็กหญิงกัญญารัตน์ ทับแสง', dob: '25 มี.ค. 2559', note: '' },
        { seat: 8, code: '6335', cid: '3300200561717', name: 'เด็กชายจตุรภัทร พงษ์ศิลา', dob: '29 ก.ย. 2558', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 9, code: '6339', cid: '1301502222260', name: 'เด็กหญิงวิราภรณ์ จี่พิมาย', dob: '30 ส.ค. 2558', note: '' },
        { seat: 10, code: '6372', cid: '1849400030569', name: 'เด็กหญิงนภาภัทร สำเภาเงิน', dob: '21 ต.ค. 2558', note: '' },
        { seat: 11, code: '6444', cid: '1219901624173', name: 'เด็กชายภูวรินท์ แจ่มกระจ่าง', dob: '14 ธ.ค. 2558', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 12, code: '6494', cid: '1379300042632', name: 'เด็กชายรัชชนนท์ คำมนตรี', dob: '7 มิ.ย. 2558', note: 'ย้ายออก' },
        { seat: 13, code: '6498', cid: '7219700014172', name: 'เด็กชายชานนท์', dob: '27 ก.ย. 2557', note: '' },
        { seat: 14, code: '6513', cid: '1418000158587', name: 'เด็กหญิงวาสนา ศาลาคำ', dob: '13 พ.ค. 2558', note: '' },
        { seat: 15, code: '6514', cid: '1219901589297', name: 'เด็กหญิงสิริวิภา บุตดีแพง', dob: '3 เม.ย. 2558', note: '' },
        { seat: 16, code: '6617', cid: '1219901621417', name: 'เด็กหญิงนรมน หัตยะฤทธิ์', dob: '23 พ.ย. 2558', note: '' },
        { seat: 17, code: '6676', cid: '1349902052571', name: 'เด็กหญิงจันทิพย์ จุลทะ', dob: '29 มิ.ย. 2558', note: 'ย้ายออก' },
        { seat: 18, code: '6681', cid: '1200901788186', name: 'เด็กชายธนกิจ นราภิยวัฒน์', dob: '7 ก.ค. 2558', note: 'ย้ายออก' },
        { seat: 19, code: '6508', cid: '1219700095157', name: 'เด็กหญิงกัญดาพร คำเงิน', dob: '23 ก.ย. 2558', note: '' },
        { seat: 20, code: '6736', cid: '1200901805285', name: 'เด็กหญิงพิมพ์ลภัส ยอดขาว', dob: '11 พ.ย. 2558', note: '' },
        { seat: 21, code: '6737', cid: '1567700107541', name: 'เด็กชายกิตติคมน์ ดียางหวาย', dob: '9 ม.ค. 2559', note: 'ย้ายออก' },
        { seat: 22, code: '6734', cid: '1241000111195', name: 'เด็กชายธีรภัทร นามโสภา', dob: '14 ม.ค. 2559', note: 'ย้ายออก' },
        { seat: 23, code: '6735', cid: '1329200125757', name: 'เด็กชายณัฐพล พินิจดี', dob: '22 ธ.ค. 2558', note: '' },
        { seat: 24, code: '6757', cid: '1219901633211', name: 'เด็กชายณัฐกรณ์ พานันท์', dob: '25 ก.พ. 2559', note: 'ย้ายเข้า' },
        { seat: 25, code: '6769', cid: '1219901613457', name: 'เด็กหญิงบัวชมภู แก้วพิจิตร', dob: '26 ก.ย. 2558', note: '' },
        { seat: 26, code: '6564', cid: '0021971132047', name: 'เด็กหญิงตั๊ก', dob: '1 ก.ย. 2556', note: 'เลื่อนชั้น' },
    ];
    console.log('\n=== ป.4/2 (26) ==='); for (const s of p42) await imp(s, 'ป.4/2');

    console.log(`\n=== Batch 3 Done: ${ok} OK, ${fail} FAIL ===`);
}
main().catch(e => console.error('FATAL:', e));
