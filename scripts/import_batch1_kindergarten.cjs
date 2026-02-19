// Student Import - Batch 1: อนุบาล 2 + อนุบาล 3
const B = 'https://3tcdq2dd.ap-southeast.insforge.app';
const K = 'ik_e9ac09dcf4f6732689dd5558fe889c0a';
const H = { 'Authorization': 'Bearer ' + K, 'Content-Type': 'application/json' };
const SID = 'd04aeda2-48c6-483f-ad83-955563ff3031'; // school
const G = require('./group_ids.json');

// Thai month map
const TM = { 'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'เม.ย.': 4, 'พ.ค.': 5, 'มิ.ย.': 6, 'ก.ค.': 7, 'ส.ค.': 8, 'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12 };

function parseDate(d) {
    if (!d) return null;
    const p = d.trim().split(/\s+/);
    if (p.length !== 3) return null;
    const day = parseInt(p[0]);
    const mon = TM[p[1]];
    let yr = parseInt(p[2]);
    if (yr > 2400) yr -= 543; // BE to CE
    if (!mon || !day || !yr) return null;
    return `${yr}-${String(mon).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseName(full) {
    let gender = 'male', fn = '', ln = null;
    if (full.startsWith('เด็กชาย')) { gender = 'male'; full = full.replace('เด็กชาย', '').trim(); }
    else if (full.startsWith('เด็กหญิง')) { gender = 'female'; full = full.replace('เด็กหญิง', '').trim(); }
    const parts = full.split(/\s+/);
    fn = parts[0] || '';
    ln = parts.length > 1 ? parts.slice(1).join(' ') : null;
    return { gender, fn, ln };
}

function classifyId(id) {
    if (!id || id === 'None' || id === '—') return { type: 'pending', num: null };
    if (id.startsWith('G')) return { type: 'g_code', num: id };
    if (id.startsWith('0') || id.startsWith('7')) return { type: 'foreign_id', num: id };
    if (/^\d{13}$/.test(id)) return { type: 'citizen_id', num: id };
    return { type: 'foreign_id', num: id };
}

async function post(table, data) {
    const r = await fetch(`${B}/api/database/records/${table}`, { method: 'POST', headers: H, body: JSON.stringify(data) });
    if (!r.ok) { const e = await r.text(); console.log(`[ERR] ${table}: ${e}`); return null; }
    return true;
}
async function findPerson(idNum, fn) {
    const all = await (await fetch(`${B}/api/database/records/persons`, { headers: H })).json();
    if (idNum) return all.find(p => p.id_number === idNum);
    return all.find(p => p.first_name_th === fn);
}

let ok = 0, fail = 0;
async function importStudent(s, groupName) {
    const { gender, fn, ln } = parseName(s.name);
    const { type, num } = classifyId(s.cid);
    const bd = parseDate(s.dob);
    const isActive = !s.note?.includes('ย้ายออก') && !s.note?.includes('ย้ายไป');

    await post('persons', {
        id_type: type, id_number: num, prefix_th: gender === 'male' ? 'เด็กชาย' : 'เด็กหญิง',
        first_name_th: fn, last_name_th: ln, birth_date: bd, gender, nationality: 'ไทย', is_active: String(isActive)
    });
    const p = await findPerson(num, fn);
    if (!p) { console.log(`[FAIL] ${fn}`); fail++; return; }

    await post('role_profiles', { person_id: p.id, role: 'STUDENT', school_id: SID, group_id: G[groupName], is_active: String(isActive) });
    await post('student_profiles', { person_id: p.id, school_id: SID, group_id: G[groupName], student_code: s.code || 'N/A', seat_number: s.seat ? parseInt(s.seat) : null, academic_year: 2568, student_status: isActive ? 'active' : 'transferred' });
    console.log(`[OK] ${s.seat || '-'} ${fn} ${ln || ''} (${type})`);
    ok++;
}

async function main() {
    // อนุบาล 2 (30 students)
    const k2 = [
        { seat: 1, code: '6703', cid: '1219700139677', name: 'เด็กชายกิตติพงษ์ อินทรฉ่ำ', dob: '12 มิ.ย. 2562', note: '' },
        { seat: 2, code: '6704', cid: '1200901996846', name: 'เด็กชายฉัตรชนก สนิทแสง', dob: '8 พ.ค. 2564', note: '' },
        { seat: 3, code: '6705', cid: '1219901813481', name: 'เด็กชายชนะศักดิ์ พรมทัต', dob: '18 พ.ค. 2563', note: '' },
        { seat: 4, code: '6706', cid: '1209001194661', name: 'เด็กชายฐาปกรณ์ รัตนวาร', dob: '16 เม.ย. 2563', note: '' },
        { seat: 5, code: '6707', cid: '1219901821114', name: 'เด็กชายไตรนรินทร์ จันทร์ดากุล', dob: '28 ก.ค. 2563', note: 'ย้ายออก 7/11/2568' },
        { seat: 6, code: '6708', cid: '1209301371223', name: 'เด็กชายธนกร บุญเทศ', dob: '27 ก.ย. 2563', note: '' },
        { seat: 7, code: '6709', cid: '1219700165953', name: 'เด็กชายธนกฤต เจริญรัตน์', dob: '23 เม.ย. 2564', note: '' },
        { seat: 8, code: '6710', cid: '1219700157144', name: 'เด็กชายธนภัทร ใจตา', dob: '29 ก.ค. 2563', note: 'ย้ายออก 11/9/2568' },
        { seat: 9, code: '6711', cid: '1209301368087', name: 'เด็กชายวราศัย สุวรรณปักษิณ', dob: '17 มิ.ย. 2563', note: '' },
        { seat: 10, code: '6712', cid: '1219700157799', name: 'เด็กหญิงกัญญ์จิรา บริบุญวงศ์', dob: '13 ส.ค. 2563', note: '' },
        { seat: 11, code: '6713', cid: '1208400018288', name: 'เด็กหญิงขนมหวาน ดอกไม้ขาว', dob: '28 พ.ค. 2563', note: '' },
        { seat: 12, code: '6714', cid: '1219700160544', name: 'เด็กหญิงชุติกาญจน์ สุขศรี', dob: '30 ต.ค. 2563', note: '' },
        { seat: 13, code: '6715', cid: '1219700161362', name: 'เด็กหญิงณัชชา แก้วลือชา', dob: '18 พ.ย. 2563', note: '' },
        { seat: 14, code: '6716', cid: '1200901983701', name: 'เด็กหญิงภัทรพร กองดี', dob: '23 พ.ย. 2563', note: '' },
        { seat: 15, code: '6717', cid: '1200901983086', name: 'เด็กหญิงวรรณภา ไชยเดช', dob: '25 พ.ย. 2563', note: '' },
        { seat: 16, code: '6718', cid: '1249901318439', name: 'เด็กหญิงมีบุญ ศรีวิรัตน์', dob: '30 เม.ย. 2564', note: '' },
        { seat: 17, code: '6719', cid: '1849903036117', name: 'เด็กหญิงเขมิสรา มีอยู่สามเสน', dob: '11 ก.พ. 2564', note: 'ย้ายออก 8/8/2568' },
        { seat: 18, code: '6720', cid: '1219700162041', name: 'เด็กหญิงณัฐนภา สำเภาเงิน', dob: '12 ธ.ค. 2563', note: '' },
        { seat: 19, code: '6721', cid: '0021981062866', name: 'เด็กชายระยอง โอม', dob: '2 ส.ค. 2563', note: '' },
        { seat: 20, code: '6738', cid: '1219700159082', name: 'เด็กชายกฤติเดช บุญเจริญ', dob: '17 ก.ย. 2563', note: 'ย้ายออก 9/10/2568' },
        { seat: 21, code: '6749', cid: '1219400087272', name: 'เด็กชายศุภวัฒน์ สนตะเถน', dob: '17 เม.ย. 2564', note: 'ย้ายออก 20/11/68' },
        { seat: 22, code: '6729', cid: '1139600970456', name: 'เด็กชายวีรภัทร อุฤทธิ์', dob: '10 มิ.ย. 2563', note: 'ย้ายเข้า 5/06/68' },
        { seat: 23, code: '6641', cid: '0021971114499', name: 'เด็กชายชานนท์', dob: '27 พ.ย. 2562', note: 'ย้ายเข้า 6/6/2568' },
        { seat: 24, code: '6752', cid: 'G682100012627', name: 'เด็กหญิงมะนะเวเนียนโม', dob: '13 ธ.ค. 2561', note: 'ย้ายเข้า 30/6/2568' },
        { seat: 25, code: '6756', cid: '1349902351315', name: 'เด็กหญิงสุรัตน์ดา ลดุลพันธ์', dob: '13 ก.ย. 2563', note: '' },
        { seat: 26, code: '6760', cid: '1209602176144', name: 'เด็กหญิงสุธาสินี ดวงแก้ว', dob: '6 ก.พ. 2564', note: 'ย้ายเข้า 4/11/2568' },
        { seat: 27, code: '6768', cid: '1219901846575', name: 'เด็กหญิงปทิตา แก้วนิ่ม', dob: '23 มี.ค. 2564', note: 'ย้ายเข้า 24/11/2568' },
        { seat: 28, code: '6770', cid: '1219700159503', name: 'เด็กหญิงณัฏณิชา ซาเฟื้อย', dob: '28 ก.ย. 2563', note: 'ย้ายเข้า 20/1/2569' },
        { seat: 29, code: null, cid: '0021971126250', name: 'เด็กชายดิน', dob: '27 พ.ค. 2564', note: 'อายุไม่ถึงเกณฑ์' },
        { seat: 30, code: null, cid: '1219901857267', name: 'เด็กหญิงศริญญา สุขราช', dob: '5 ก.ค. 2564', note: 'อายุไม่ถึงเกณฑ์' },
    ];
    console.log('=== อนุบาล 2 (30 students) ===');
    for (const s of k2) await importStudent(s, 'อนุบาล 2');

    // อนุบาล 3 (26 students)
    const k3 = [
        { seat: 1, code: '6635', cid: '1219901771753', name: 'เด็กชายณัฐสุพัฒน์ สุพล', dob: '14 พ.ค. 2562', note: '' },
        { seat: 2, code: '6637', cid: '1200901944986', name: 'เด็กชายกรวีร์ อินทอง', dob: '26 ก.ย. 2562', note: '' },
        { seat: 3, code: '6638', cid: '1219700149249', name: 'เด็กชายนิธิพงศ์ ศรีสกล', dob: '13 ม.ค. 2563', note: 'ย้ายออก 26/8/2568' },
        { seat: 4, code: '6639', cid: '1219901775741', name: 'เด็กชายไมยราพ พรมเสน', dob: '17 มิ.ย. 2562', note: '' },
        { seat: 5, code: '6645', cid: '1219700143861', name: 'เด็กหญิงรัตนากร ทองแสน', dob: '23 ก.ย. 2562', note: '' },
        { seat: 6, code: '6647', cid: '1200901965452', name: 'เด็กชายฐิติพัชร สุวรรณโชติ', dob: '7 พ.ค. 2563', note: '' },
        { seat: 7, code: '6648', cid: '1219700139944', name: 'เด็กหญิงปิยะดา สาริยง', dob: '20 มิ.ย. 2562', note: '' },
        { seat: 8, code: '6649', cid: '1219700144999', name: 'เด็กหญิงรัดเกล้า สวัสดิ์แสน', dob: '11 ต.ค. 2562', note: '' },
        { seat: 9, code: '6650', cid: '1200901942037', name: 'เด็กหญิงนิรดา วรรณโคตร', dob: '24 ต.ค. 2562', note: '' },
        { seat: 10, code: '6651', cid: '1332000045761', name: 'เด็กหญิงอริสรา พิลากรณ์', dob: '8 พ.ย. 2562', note: 'ย้ายออก 10/11/2568' },
        { seat: 11, code: '6652', cid: '1219700147564', name: 'เด็กหญิงลลิล ประเสริฐศิลป์', dob: '6 ธ.ค. 2562', note: '' },
        { seat: 12, code: '6655', cid: '1249901268008', name: 'เด็กหญิงนิระดา วันทะวงษ์', dob: '19 ก.ค. 2562', note: 'ย้ายออก 10/11/2568' },
        { seat: 13, code: '6656', cid: '1200901961872', name: 'เด็กหญิงภาวิดา สุกรา', dob: '1 เม.ย. 2563', note: '' },
        { seat: 14, code: '6657', cid: '1339100169868', name: 'เด็กหญิงธนพร ศรีราทา', dob: '20 ม.ค. 2563', note: '' },
        { seat: 15, code: '6683', cid: '1219700147866', name: 'เด็กหญิงชลธิชา มณีรัตน์', dob: '13 ธ.ค. 2562', note: '' },
        { seat: 16, code: '6685', cid: '1347900063531', name: 'เด็กหญิงชลิตา กายยาคำ', dob: '27 ม.ค. 2562', note: 'ย้ายออก 9/10/2568' },
        { seat: 17, code: '6691', cid: '1219700154196', name: 'เด็กชายภูษิต วงเวียน', dob: '15 พ.ค. 2563', note: '' },
        { seat: 18, code: '6692', cid: '1729901154849', name: 'เด็กชายสงกรานต์ โสภา', dob: '17 เม.ย. 2562', note: '' },
        { seat: 19, code: '6696', cid: '1219700146240', name: 'เด็กหญิงรัตนกร นาหัวนิล', dob: '8 พ.ย. 2562', note: '' },
        { seat: 20, code: '6697', cid: '1218700072261', name: 'เด็กชายชนาธิป รักกลาง', dob: '27 มิ.ย. 2562', note: 'ย้ายออก 7/2/2568' },
        { seat: 21, code: '6723', cid: '1200901950846', name: 'เด็กชายสุรธัช ยอดขาว', dob: '23 พ.ย. 2562', note: '' },
        { seat: 22, code: '6724', cid: '1567700170952', name: 'เด็กชายกิตติพัฒน์ ดียางหวาย', dob: '22 ก.พ. 2563', note: 'ย้ายออก 10/11/2568' },
        { seat: 23, code: '6739', cid: '1348600118919', name: 'เด็กชายอาทิตย์ สุจะวี', dob: '29 ธ.ค. 2562', note: 'ย้ายเข้า 14/05/68' },
        { seat: 24, code: '6744', cid: '1638900122200', name: 'เด็กชายอชิตพล ทรงกิตติกุล', dob: '9 พ.ย. 2562', note: '' },
        { seat: 25, code: '6722', cid: '1639800611552', name: 'เด็กหญิงมลฤดี อยู่ลือ', dob: '1 ส.ค. 2562', note: '' },
        { seat: 26, code: '6764', cid: '1219700144166', name: 'เด็กหญิงฐานิดา แจ่มผล', dob: '27 ก.ย. 2562', note: 'ย้ายเข้า 6/11/2568' },
    ];
    console.log('\n=== อนุบาล 3 (26 students) ===');
    for (const s of k3) await importStudent(s, 'อนุบาล 3');

    console.log(`\n=== Batch 1 Done: ${ok} OK, ${fail} FAIL ===`);
}
main().catch(e => console.error('FATAL:', e));
