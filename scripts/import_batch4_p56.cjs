// Student Import - Batch 4 (FINAL): ป.5/1, ป.5/2, ป.6/1, ป.6/2
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
    const p51 = [
        { seat: 1, code: '6185', cid: '1219700088339', name: 'เด็กชายวิทยาธร สมบูรณ์', dob: '19 พ.ค. 2557', note: '' },
        { seat: 2, code: '6194', cid: '1219700092000', name: 'เด็กชายวีรยุทธ ผลบุญ', dob: '6 มี.ค. 2558', note: '' },
        { seat: 3, code: '6197', cid: '1219901591216', name: 'เด็กชายธีรเมธ ไกรวิเศษ', dob: '21 เม.ย. 2558', note: '' },
        { seat: 4, code: '6199', cid: '1200901781408', name: 'เด็กชายวีรการณ์ มะลิหอม', dob: '12 พ.ค. 2558', note: '' },
        { seat: 5, code: '6203', cid: '1219901562674', name: 'เด็กหญิงพจนีย์ นามขันธ์', dob: '28 ก.ย. 2557', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 6, code: '6204', cid: '1219901572475', name: 'เด็กหญิงชรินทร์ทิพย์ ชัยปัญญา', dob: '25 พ.ย. 2557', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 7, code: '6207', cid: '1200901775581', name: 'เด็กหญิงเนตรนภา นามเอี่ยม', dob: '18 มี.ค. 2558', note: '' },
        { seat: 8, code: '6209', cid: '1200901742232', name: 'เด็กชายรัชตะ คมคาย', dob: '12 มิ.ย. 2557', note: '' },
        { seat: 9, code: '6212', cid: '1219700089351', name: 'เด็กชายสิริวุฒิ พรมทัต', dob: '21 ส.ค. 2557', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 10, code: '6219', cid: '1219700091089', name: 'เด็กชายธีรศักดิ์ แสนกล้า', dob: '11 ธ.ค. 2557', note: '' },
        { seat: 11, code: '6224', cid: '1200901740957', name: 'เด็กหญิงกรวรรณ ทิพาดุษฎีกุล', dob: '3 มิ.ย. 2557', note: '' },
        { seat: 12, code: '6227', cid: '1478600278052', name: 'เด็กหญิงปรารถนา คงลิน', dob: '15 ก.ย. 2557', note: '' },
        { seat: 13, code: '6228', cid: '1219901570375', name: 'เด็กหญิงจันทร์จิรา ไพราม', dob: '11 พ.ย. 2557', note: '' },
        { seat: 14, code: '6365', cid: '1660601213206', name: 'เด็กหญิงวรัญญา สมัคราช', dob: '23 พ.ย. 2557', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 15, code: '6409', cid: '7219900032247', name: 'เด็กชายศักดิ์ทวีโชค ไผ่สวรร', dob: '11 ก.ค. 2557', note: '' },
        { seat: 16, code: '6456', cid: '1200901746572', name: 'เด็กชายชยพล พลัดกลาง', dob: '21 ก.ค. 2557', note: '' },
        { seat: 17, code: '6510', cid: 'G632000011947', name: 'เด็กชายพาน พืช', dob: '13 พ.ค. 2556', note: '' },
        { seat: 18, code: '6669', cid: '1210800044645', name: 'เด็กชายจิรายุ ศรแก้ว', dob: '23 มี.ค. 2558', note: 'ย้ายออก' },
        { seat: 19, code: '6670', cid: '1129701662129', name: 'เด็กหญิงชลาธร สมร', dob: '25 มี.ค. 2558', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 20, code: '6677', cid: '1319800729670', name: 'เด็กหญิงกรรณิกา เที่ยงปา', dob: '5 มี.ค. 2558', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 21, code: '6660', cid: '1199901560672', name: 'เด็กหญิงวิมลสิริ อรุณรัตน์', dob: '14 มี.ค. 2558', note: '' },
        { seat: 22, code: '6684', cid: '1219700087880', name: 'เด็กหญิงพิชญาดา ปานจันทร์', dob: '31 มี.ค. 2500', note: 'ย้ายออก' },
        { seat: 23, code: '6507', cid: '1379900565750', name: 'เด็กหญิงพิชชา นามโสภา', dob: '8 ก.ค. 2557', note: 'ย้ายออก' },
        { seat: 24, code: '6743', cid: '1629901057135', name: 'เด็กหญิงธรรมสรณ์ ใสสด', dob: '7 ก.ค. 2557', note: 'ย้ายเข้า' },
        { seat: 25, code: '6623', cid: '1907500235356', name: 'เด็กชายโชกัน แก้วรุ่ง', dob: '16 ม.ค. 2558', note: 'ย้ายเข้า' },
        { seat: 26, code: '6759', cid: '1539901236936', name: 'เด็กหญิงธัญสินี ปลัดวิเศษ', dob: '19 มี.ค. 2558', note: 'ย้ายเข้า' },
    ];
    console.log('=== ป.5/1 (26) ==='); for (const s of p51) await imp(s, 'ป.5/1');

    const p52 = [
        { seat: 1, code: '6188', cid: '1200901748427', name: 'เด็กชายอนุชิต ประวัติ', dob: '3 ส.ค. 2557', note: '' },
        { seat: 2, code: '6192', cid: '1369901097075', name: 'เด็กชายพิพัฒพล พงษ์ขวาน้อย', dob: '25 ก.ย. 2557', note: '' },
        { seat: 3, code: '6193', cid: '1219700090228', name: 'เด็กชายธนกฤต สอนรัตน์', dob: '8 ต.ค. 2557', note: '' },
        { seat: 4, code: '6195', cid: '1200901774606', name: 'เด็กชายชินวุฒิ เหล่ากาวี', dob: '9 มี.ค. 2558', note: '' },
        { seat: 5, code: '6198', cid: '1219901593138', name: 'เด็กชายมงคล ศรีชมภู', dob: '5 พ.ค. 2558', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 6, code: '6201', cid: '1219700088801', name: 'เด็กหญิงเพชรณิชา สุภา', dob: '30 มิ.ย. 2557', note: '' },
        { seat: 7, code: '6202', cid: '1219700089386', name: 'เด็กหญิงณิชกานต์ ต๊ะโพธิ์', dob: '22 ส.ค. 2557', note: '' },
        { seat: 8, code: '6206', cid: '1219700091992', name: 'เด็กหญิงธรรมรัตน์ ธรรมแสง', dob: '8 มี.ค. 2558', note: '' },
        { seat: 9, code: '6210', cid: '1208400012611', name: 'เด็กชายอาเซี่ยน ดอกไม้ขาว', dob: '22 มิ.ย. 2557', note: '' },
        { seat: 10, code: '6211', cid: '1279200042909', name: 'เด็กชายพุฒิพงศ์ แหยมคง', dob: '7 ส.ค. 2557', note: '' },
        { seat: 11, code: '6213', cid: '1200901750821', name: 'เด็กชายภัครพงษ์ หงส์มาลา', dob: '21 ส.ค. 2557', note: '' },
        { seat: 12, code: '6216', cid: '1219901568036', name: 'เด็กชายณรงค์ฤทธิ์ แปลงไธสง', dob: '29 ต.ค. 2557', note: '' },
        { seat: 13, code: '6220', cid: '1219700091241', name: 'เด็กชายพีรวิชญ์ พุ่มคำ', dob: '23 ธ.ค. 2557', note: '' },
        { seat: 14, code: '6222', cid: '1479901119353', name: 'เด็กหญิงวิรดา คะสุดใจ', dob: '21 พ.ค. 2557', note: '' },
        { seat: 15, code: '6337', cid: '1417500148661', name: 'เด็กหญิงกัญญาพัชญ์ นวนมีศรี', dob: '1 ส.ค. 2557', note: '' },
        { seat: 16, code: '6347', cid: '1219901546741', name: 'เด็กหญิงวรรณิศา พรหมณรงค์', dob: '19 มิ.ย. 2557', note: '' },
        { seat: 17, code: '6379', cid: '1200901748061', name: 'เด็กหญิงสุขภาดา ชัยชนะ', dob: '2 ส.ค. 2557', note: '' },
        { seat: 18, code: '6406', cid: '1200901738201', name: 'เด็กหญิงศิริขวัญ บุญเทศ', dob: '9 พ.ค. 2557', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 19, code: '6583', cid: '1200901741716', name: 'เด็กชายนรงค์กรณ์ ไกรราชฉิมพลี', dob: '9 มิ.ย. 2557', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 20, code: '6186', cid: '1200901739428', name: 'เด็กชายวัชรินทร์ เทียบสี', dob: '21 พ.ค. 2557', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 21, code: '6631', cid: '1219901531086', name: 'เด็กหญิงศิริวิภาษ์ ผลศิริ', dob: '5 มี.ค. 2557', note: 'ย้ายออก' },
        { seat: 22, code: '6111', cid: '1200901717785', name: 'เด็กหญิงสุธาทิพย์ โนนจุ่น', dob: '5 พ.ย. 2556', note: '' },
        { seat: 23, code: '6746', cid: '1350102041909', name: 'เด็กหญิงอนัญญา ทรงกิตติกุล', dob: '20 มิ.ย. 2557', note: '' },
        { seat: 24, code: '6758', cid: '1500401234081', name: 'เด็กหญิงจิรภิญญา ขันคำ', dob: '26 เม.ย. 2558', note: 'ย้ายเข้า' },
    ];
    console.log('\n=== ป.5/2 (24) ==='); for (const s of p52) await imp(s, 'ป.5/2');

    const p61 = [
        { seat: 1, code: '6072', cid: '1200901715260', name: 'เด็กชายณัฐภัทร แก้วหิน', dob: '17 ต.ค. 2556', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 2, code: '6075', cid: '1200901723351', name: 'เด็กชายธนกฤต โพธิ์อุดม', dob: '23 ธ.ค. 2556', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 3, code: '6084', cid: '1208400011526', name: 'เด็กหญิงกรกนก คำทิ้ง', dob: '10 มิ.ย. 2556', note: '' },
        { seat: 4, code: '6089', cid: '1200901717289', name: 'เด็กหญิงญาณพัฒน์ อินทร์เพ็ง', dob: '1 พ.ย. 2556', note: '' },
        { seat: 5, code: '6094', cid: '1219901488440', name: 'เด็กชายอิสรานุวัฒน์ พันธ์ศรี', dob: '23 พ.ค. 2556', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 6, code: '6096', cid: '1219700084902', name: 'เด็กชายพุทธิพัฒน์ สิมสวน', dob: '5 ก.ค. 2556', note: '' },
        { seat: 7, code: '6097', cid: '1200901717041', name: 'เด็กชายสุทธิภัทร ฉิมภัย', dob: '29 ต.ค. 2556', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 8, code: '6104', cid: '1209601859906', name: 'เด็กชายศุภโชค พรมงาม', dob: '6 มี.ค. 2557', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 9, code: '6107', cid: '1219901497252', name: 'เด็กหญิงวรัณชยา แป้นเหมือน', dob: '21 ก.ค. 2556', note: '' },
        { seat: 10, code: '6118', cid: '1219400065767', name: 'เด็กหญิงศิโรรัตน์ แต่งตั้ง', dob: '16 ส.ค. 2556', note: '' },
        { seat: 11, code: '6119', cid: '1417900019205', name: 'เด็กหญิงประติภา สัมมัชนิ', dob: '9 ก.ค. 2556', note: '' },
        { seat: 12, code: '6121', cid: '1160201156196', name: 'เด็กชายปฐวี แซ่หาญ', dob: '31 ก.ค. 2556', note: '' },
        { seat: 13, code: '6124', cid: '1301502205837', name: 'เด็กชายพีรวัส จี่พิมาย', dob: '3 ก.พ. 2557', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 14, code: '6363', cid: '1220900067345', name: 'เด็กชายณรงค์ศักดิ์ วารินทร์', dob: '31 ต.ค. 2556', note: '' },
        { seat: 15, code: '6370', cid: '1348500159915', name: 'เด็กหญิงแพรทอง ศิลชาติ', dob: '12 ก.ค. 2556', note: '' },
        { seat: 16, code: '6465', cid: '1219901519752', name: 'เด็กชายอภิวิชญ์ หาศิริ', dob: '11 ธ.ค. 2556', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 17, code: '6480', cid: '1200901709057', name: 'เด็กหญิงปุญภัทร์ วันดี', dob: '22 ส.ค. 2556', note: 'ย้ายออก' },
        { seat: 18, code: '6516', cid: '1368700052065', name: 'เด็กหญิงนิภาธร ลัดกรูด', dob: '15 ก.ค. 2556', note: '' },
        { seat: 19, code: '6568', cid: '1468100045776', name: 'เด็กหญิงอรวรรณ พรมบุตร', dob: '29 ธ.ค. 2556', note: '' },
        { seat: 20, code: '6584', cid: '1478600253483', name: 'เด็กชายอัฐพร อ่อนมิ่ง', dob: '18 ก.ค. 2556', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 21, code: '6609', cid: '1459901582991', name: 'เด็กชายจิตติพัฒน์ สมภาร', dob: '29 ต.ค. 2556', note: '' },
        { seat: 22, code: '6671', cid: '1449901112596', name: 'เด็กชายวรพงษ์ วิชระโภชน์', dob: '3 มี.ค. 2557', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 23, code: '6680', cid: '1209301284274', name: 'เด็กชายกิตติคุณ ศรีสุข', dob: '11 ก.พ. 2556', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 24, code: '6665', cid: '1409600550811', name: 'เด็กหญิงกฤตยา จำปาทอง', dob: '16 ก.ย. 2556', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 25, code: '6082', cid: '1418800053372', name: 'เด็กหญิงณัฐรดา มณีรัตน์', dob: '17 ก.ค. 2499', note: '' },
        { seat: 26, code: '6367', cid: '1219700086891', name: 'เด็กชายเอกวิญญ์ บำรุงชาติ', dob: '26 ธ.ค. 2556', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 27, code: '6755', cid: '2119901027239', name: 'เด็กหญิงกรองแก้ว แซ่ตั้ง', dob: '29 ธ.ค. 2556', note: 'ย้ายเข้า' },
    ];
    console.log('\n=== ป.6/1 (27) ==='); for (const s of p61) await imp(s, 'ป.6/1');

    const p62 = [
        { seat: 1, code: '6071', cid: '1219700086191', name: 'เด็กชายกิตติคุณ ทองสาหร่าย', dob: '10 ต.ค. 2556', note: '' },
        { seat: 2, code: '6074', cid: '1219901519060', name: 'เด็กชายเกียรติคุณ บริบุญวงศ์', dob: '6 ธ.ค. 2556', note: '' },
        { seat: 3, code: '6087', cid: '1219901504666', name: 'เด็กหญิงเก้ากัลยา แสวงกลาง', dob: '9 ก.ย. 2556', note: '' },
        { seat: 4, code: '6095', cid: '1219901489250', name: 'เด็กชายเตชินท์ หัตยะฤทธิ์', dob: '28 พ.ค. 2556', note: '' },
        { seat: 5, code: '6098', cid: '1219901516036', name: 'เด็กชายเจษฎา มีเค้า', dob: '16 พ.ย. 2556', note: '' },
        { seat: 6, code: '6105', cid: '1219901537718', name: 'เด็กชายกฤติเดช ยศปัญญา', dob: '20 เม.ย. 2557', note: '' },
        { seat: 7, code: '6109', cid: '1200901707003', name: 'เด็กหญิงพัชนก พลไกร', dob: '6 ส.ค. 2556', note: '' },
        { seat: 8, code: '6110', cid: '1399000105272', name: 'เด็กหญิงวราวรรณ วงรินยอง', dob: '19 ก.ย. 2556', note: '' },
        { seat: 9, code: '6114', cid: '1219901529677', name: 'เด็กหญิงมณีรัตน์ ผลบุญ', dob: '23 ก.พ. 2557', note: '' },
        { seat: 10, code: '6180', cid: 'G616200000772', name: 'เด็กหญิงแกงส้ม ไชยาวุต', dob: '26 ก.ย. 2556', note: '' },
        { seat: 11, code: '6181', cid: '1439600151487', name: 'เด็กหญิงอรภิญญา กุนอก', dob: '15 พ.ย. 2556', note: '' },
        { seat: 12, code: '6322', cid: '1200901733896', name: 'เด็กชายธนกฤต ลิ้มไธสง', dob: '29 มี.ค. 2557', note: '' },
        { seat: 13, code: '6324', cid: '1301502199519', name: 'เด็กหญิงปิยฉัตร เผยกลาง', dob: '13 มิ.ย. 2556', note: '' },
        { seat: 14, code: '6325', cid: '1219700088177', name: 'เด็กชายชัยกฤตย์ แก้วแดง', dob: '4 พ.ค. 2557', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 15, code: '6355', cid: '1329400174310', name: 'เด็กชายทัตพิชา เส็งประโคน', dob: '26 ก.ค. 2556', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 16, code: '6407', cid: '1669800439440', name: 'เด็กชายวิทวัส กลัดลัด', dob: '10 พ.ค. 2556', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 17, code: '6422', cid: '1739902661124', name: 'เด็กหญิงชุติกาญจน์ สงวนพานิช', dob: '2 ส.ค. 2556', note: '' },
        { seat: 18, code: '6585', cid: '1219400067174', name: 'เด็กชายกิจติภัทร์ ศรีราทา', dob: '13 ธ.ค. 2556', note: '' },
        { seat: 19, code: '6586', cid: '1219901499506', name: 'เด็กชายธนดล สุวรรณสาร', dob: '6 ส.ค. 2556', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 20, code: '6596', cid: '1417500140317', name: 'เด็กชายสมศักดิ์ พันธ์ทอง', dob: '3 ส.ค. 2556', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 21, code: '6618', cid: '1100202141061', name: 'เด็กชายชุติวัต สุกิจพิทยานันท์', dob: '6 ต.ค. 2556', note: '' },
        { seat: 22, code: '6674', cid: '1200901702460', name: 'เด็กชายภูผา คำภาเขียว', dob: '24 มิ.ย. 2556', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 23, code: '6673', cid: '1959901242070', name: 'เด็กชายวรฤทธิ์ คงยัง', dob: '11 มี.ค. 2554', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 24, code: '6689', cid: '1200901700661', name: 'เด็กชายสุชานนท์ ฤาเดช', dob: '7 มิ.ย. 2556', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 25, code: '6261', cid: '1218500058192', name: 'เด็กหญิงศิริวรรณ วงเวียน', dob: '5 มิ.ย. 2499', note: '' },
        { seat: 26, code: '6747', cid: '1318600074211', name: 'เด็กหญิงวนิดา บริหาร', dob: '25 เม.ย. 2556', note: 'ย้ายเข้า' },
    ];
    console.log('\n=== ป.6/2 (26) ==='); for (const s of p62) await imp(s, 'ป.6/2');

    console.log(`\n=== FINAL BATCH Done: ${ok} OK, ${fail} FAIL ===`);

    // Final verification
    const persons = await (await fetch(`${B}/api/database/records/persons`, { headers: H })).json();
    const roles = await (await fetch(`${B}/api/database/records/role_profiles`, { headers: H })).json();
    const sprofs = await (await fetch(`${B}/api/database/records/student_profiles`, { headers: H })).json();
    console.log(`\n=== TOTAL DATABASE ===`);
    console.log(`Persons: ${persons.length}`);
    console.log(`Role Profiles: ${roles.length}`);
    console.log(`Student Profiles: ${sprofs.length}`);
}
main().catch(e => console.error('FATAL:', e));
