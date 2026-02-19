// Student Import - Batch 2: ป.1/1, ป.1/2, ป.2/1, ป.2/2
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
    const p11 = [
        { seat: 1, code: '6531', cid: '1669900871092', name: 'เด็กชายกฤติเดช เย็นกล่ำ', dob: '21 ต.ค. 2561', note: 'ย้ายออก' },
        { seat: 2, code: '6532', cid: '1219700123738', name: 'เด็กชายณัฐกร ศรีจันทร์', dob: '6 มี.ค. 2561', note: '' },
        { seat: 3, code: '6535', cid: '1219700137208', name: 'เด็กชายพศวัฒน์ บัวกระท้อนแก้ว', dob: '22 มี.ค. 2562', note: '' },
        { seat: 4, code: '6545', cid: '1219700132907', name: 'เด็กหญิงกัญจน์ณิชา บริบุญวงศ์', dob: '15 พ.ย. 2561', note: '' },
        { seat: 5, code: '6548', cid: '1279900653111', name: 'เด็กหญิงจิราภา ชื่นอรุณสิน', dob: '4 ธ.ค. 2561', note: 'ย้ายออก' },
        { seat: 6, code: '6549', cid: '1219700127083', name: 'เด็กหญิงณภาวัลย์ ยุงกุล', dob: '14 มิ.ย. 2561', note: '' },
        { seat: 7, code: '6550', cid: '1219700131722', name: 'เด็กหญิงณิชาภัทร ศรีสุข', dob: '14 ต.ค. 2561', note: '' },
        { seat: 8, code: '6556', cid: '1219901729781', name: 'เด็กหญิงวริศรา ชมชิด', dob: '27 พ.ค. 2561', note: '' },
        { seat: 9, code: '6625', cid: '1219901756932', name: 'เด็กชายธีรภัทร สืบพันธุ์', dob: '30 ธ.ค. 2561', note: '' },
        { seat: 10, code: '6646', cid: '1219700130068', name: 'เด็กหญิงกุลณดา อ่อนอ้วน', dob: '6 ก.ย. 2561', note: '' },
        { seat: 11, code: '6725', cid: '1219700131439', name: 'เด็กชายภาณุพงศ์ คุณพรม', dob: '5 ต.ค. 2561', note: '' },
        { seat: 12, code: '6726', cid: '1219901746511', name: 'เด็กชายสุรศักดิ์ หูตาชัย', dob: '12 ต.ค. 2561', note: '' },
        { seat: 13, code: '6727', cid: '0021971113140', name: 'เด็กชายกมล', dob: '18 มิ.ย. 2561', note: '' },
        { seat: 14, code: '6546', cid: '7219700015349', name: 'เด็กหญิงแก้ว', dob: '25 เม.ย. 2561', note: '' },
        { seat: 15, code: '6728', cid: 'G682100006511', name: 'เด็กชายหม่อง ตี หะ จอ', dob: '7 ต.ค. 2559', note: '' },
        { seat: 16, code: '6700', cid: '1219700129001', name: 'เด็กหญิงณัฐวรรณ สามารถ', dob: '9 ส.ค. 2561', note: '' },
        { seat: 17, code: '6750', cid: '1499900860483', name: 'เด็กหญิงสุนิษา แสนสุข', dob: '14 เม.ย. 2562', note: '' },
        { seat: 18, code: '6765', cid: '1219400079962', name: 'เด็กชายชยางกูร ศิริสมบัติ', dob: '11 ม.ค. 2561', note: '' },
    ];
    console.log('=== ป.1/1 (18) ==='); for (const s of p11) await imp(s, 'ป.1/1');

    const p12 = [
        { seat: 1, code: '6381', cid: 'G631900007139', name: 'เด็กชายพิสิทธ์ ซน', dob: '26 ก.พ. 2559', note: 'ย้ายไป ตปท.' },
        { seat: 2, code: '6533', cid: '1219700136953', name: 'เด็กชายเตวินน์ เบ็ญจาภรณ์', dob: '13 มี.ค. 2562', note: '' },
        { seat: 3, code: '6534', cid: '1368100135679', name: 'เด็กชายปุณศักดิ์ เจี๊ยะจิ๋ว', dob: '23 ส.ค. 2561', note: 'ย้ายออก' },
        { seat: 4, code: '6536', cid: '1219700137607', name: 'เด็กชายภานุวัฒน์ พันธ์ศรี', dob: '10 เม.ย. 2562', note: '' },
        { seat: 5, code: '6539', cid: '1218700071346', name: 'เด็กชายศรนารายณ์ แจ่มกระจ่าง', dob: '25 พ.ย. 2561', note: '' },
        { seat: 6, code: '6543', cid: '1219901745396', name: 'เด็กชายอัฐพร ศรีบุญเรือง', dob: '3 ต.ค. 2561', note: '' },
        { seat: 7, code: '6552', cid: '1219700127211', name: 'เด็กหญิงปริชญา คงสุขมาก', dob: '18 มิ.ย. 2561', note: '' },
        { seat: 8, code: '6553', cid: '1219700138514', name: 'เด็กหญิงปรีย์วรา ใจมา', dob: '9 พ.ค. 2562', note: '' },
        { seat: 9, code: '6554', cid: '1347300034336', name: 'เด็กหญิงปารวี วงศ์อ่อน', dob: '12 พ.ค. 2562', note: '' },
        { seat: 10, code: '6567', cid: '1219700130777', name: 'เด็กหญิงจิรภา นูลาภ', dob: '20 ก.ย. 2561', note: '' },
        { seat: 11, code: '6644', cid: '1219700134047', name: 'เด็กชายณัฐภัทร จันทร์ดวง', dob: '14 ธ.ค. 2561', note: '' },
        { seat: 12, code: '6730', cid: '1269900613046', name: 'เด็กชายพันทิวา โพยนอก', dob: '23 ก.ค. 2561', note: '' },
        { seat: 13, code: '6538', cid: '1219700136015', name: 'เด็กชายศรายุทธ ประคองศักดิ์', dob: '12 ก.พ. 2562', note: 'ย้าย' },
        { seat: 14, code: '6731', cid: '219900002600', name: 'เด็กหญิงปรุงฉัตร โจน', dob: '29 ส.ค. 2554', note: 'ย้ายไปอยู่ ป.3' },
        { seat: 15, code: '6732', cid: 'G682100006791', name: 'เด็กหญิงมิ ลิน ซัน', dob: '28 พ.ย. 2561', note: '' },
        { seat: 16, code: '6748', cid: '0024851001614', name: 'เด็กหญิงชญานี นาวัด', dob: '27 ก.พ. 2558', note: 'ย้ายออก' },
        { seat: 17, code: '6753', cid: '1219700126788', name: 'เด็กชายกันตภัทร์ คงทา', dob: '4 มิ.ย. 2561', note: '' },
        { seat: 18, code: '6762', cid: '1409904723847', name: 'เด็กชายพีรพล คำจันทร์', dob: '29 ก.ค. 2561', note: 'ย้ายเข้า' },
    ];
    console.log('\n=== ป.1/2 (18) ==='); for (const s of p12) await imp(s, 'ป.1/2');

    const p21 = [
        { seat: 1, code: '6424', cid: '1219700119391', name: 'เด็กชายกิตติกร ทับแสง', dob: '21 ต.ค. 2560', note: '' },
        { seat: 2, code: '6426', cid: 'G652100000645', name: 'เด็กชายไทวัน บุนทะวง', dob: '13 ต.ค. 2560', note: '' },
        { seat: 3, code: '6427', cid: '1219901696042', name: 'เด็กชายธนกฤต แก้วเกตุสังข์', dob: '1 ส.ค. 2560', note: '' },
        { seat: 4, code: '6435', cid: '1417100146865', name: 'เด็กชายอนาวินทร์ แสนเทพ', dob: '14 ก.พ. 2561', note: '' },
        { seat: 5, code: '6438', cid: '1219700123975', name: 'เด็กหญิงนฤมล พลเมืองนิตย์', dob: '13 มี.ค. 2561', note: '' },
        { seat: 6, code: '6451', cid: '1219901719891', name: 'เด็กชายทินภัทร ศรีบุญ', dob: '22 ก.พ. 2561', note: '' },
        { seat: 7, code: '6472', cid: '1219700117461', name: 'เด็กหญิงตะวันฉาย คำเงิน', dob: '5 ก.ย. 2560', note: '' },
        { seat: 8, code: '6491', cid: '1219700124122', name: 'เด็กหญิงวาสนา พรมทัต', dob: '21 มี.ค. 2561', note: '' },
        { seat: 9, code: '6522', cid: '1219901720121', name: 'เด็กชายอดิเทพ ห้วยศิลา', dob: '24 ก.พ. 2561', note: '' },
        { seat: 10, code: '6577', cid: '1219400078702', name: 'เด็กชายภัทรพล วาสรัต', dob: '22 ก.ค. 2560', note: '' },
        { seat: 11, code: '6579', cid: '1219901722370', name: 'เด็กหญิงศุภิสรา งันปัญญา', dob: '17 มี.ค. 2561', note: '' },
        { seat: 12, code: '6542', cid: 'G662100005612', name: 'เด็กชายหม่อง อ่องไหน่ง์', dob: '12 ส.ค. 2560', note: '' },
        { seat: 13, code: '6661', cid: '1200901866187', name: 'เด็กหญิงสมิตานัน แจ่มจำรัส', dob: '16 มิ.ย. 2560', note: '' },
        { seat: 14, code: '6679', cid: '1209703100305', name: 'เด็กชายกันต์นภัส ศรีสุข', dob: '3 ธ.ค. 2559', note: '' },
        { seat: 15, code: '6688', cid: 'G672100012074', name: 'เด็กชายเชท ซุน', dob: '8 ต.ค. 2557', note: '' },
        { seat: 16, code: '6574', cid: '1679901023184', name: 'เด็กหญิงพิมพ์ประภัทร์ สำราญพันธ์', dob: '20 มิ.ย. 2560', note: 'ย้ายออก' },
        { seat: 17, code: '6699', cid: '1629901148939', name: 'เด็กชายกรวิชญ์ ใสสด', dob: '10 มิ.ย. 2560', note: '' },
        { seat: 18, code: '6576', cid: '1219700124688', name: 'เด็กหญิงวารากร ทองมี', dob: '2 เม.ย. 2561', note: 'เด็กพิเศษเรียนรวม' },
        { seat: 19, code: '6745', cid: '1638900109203', name: 'เด็กชายกฤษณโรจน์ ทรงกิตติกุล', dob: '2 ก.ย. 2560', note: '' },
        { seat: 20, code: '6766', cid: '1339600397673', name: 'เด็กชายปรินทร์ จูมพิลา', dob: '25 ต.ค. 2560', note: 'ย้ายเข้า' },
    ];
    console.log('\n=== ป.2/1 (20) ==='); for (const s of p21) await imp(s, 'ป.2/1');

    const p22 = [
        { seat: 1, code: '6431', cid: '1219700113007', name: 'เด็กชายวรนาคร หงษ์จันทา', dob: '22 พ.ค. 2560', note: '' },
        { seat: 2, code: '6432', cid: '1219901710096', name: 'เด็กชายวัชรพล วรรณดี', dob: '24 พ.ย. 2560', note: '' },
        { seat: 3, code: '6434', cid: '1219901697774', name: 'เด็กชายวิทธวัฒน์ คงลิน', dob: '16 ส.ค. 2560', note: '' },
        { seat: 4, code: '6461', cid: '1248100154623', name: 'เด็กหญิงธัญธิตา นามโท', dob: '8 ธ.ค. 2560', note: '' },
        { seat: 5, code: '6473', cid: '1348800083728', name: 'เด็กหญิงชญาภา สุกรา', dob: '19 ม.ค. 2561', note: '' },
        { seat: 6, code: '6476', cid: '1219700122111', name: 'เด็กชายอัครวิทย์ วันดี', dob: '1 ม.ค. 2561', note: '' },
        { seat: 7, code: '6477', cid: '1219901703430', name: 'เด็กชายภาคิน ถนอมกลาง', dob: '4 ต.ค. 2560', note: '' },
        { seat: 8, code: '6478', cid: '1219700116383', name: 'เด็กชายชยานนท์ ทั่วกลาง', dob: '15 ส.ค. 2560', note: 'ย้ายออก' },
        { seat: 9, code: '6484', cid: '1219700114542', name: 'เด็กชายเบญจมินทร์ ทุมวงศ์', dob: '28 มิ.ย. 2560', note: '' },
        { seat: 10, code: '6500', cid: '1219700121051', name: 'เด็กหญิงวรัญญา สมพงค์', dob: '14 ธ.ค. 2560', note: '' },
        { seat: 11, code: '6604', cid: '1149901532644', name: 'เด็กหญิงชยมล สกุลแก้ว', dob: '11 ต.ค. 2560', note: 'ย้ายออก' },
        { seat: 12, code: '6658', cid: '1648600163539', name: 'เด็กชายภัทรพล เทพประทุม', dob: '4 มิ.ย. 2560', note: '' },
        { seat: 13, code: '6659', cid: '1219901689208', name: 'เด็กชายประเสริฐ สาดเมืองไพร', dob: '3 มิ.ย. 2560', note: '' },
        { seat: 14, code: '6662', cid: '1417500174815', name: 'เด็กหญิงวชิรญาณ์ ศีลานาม', dob: '14 เม.ย. 2561', note: '' },
        { seat: 15, code: '6408', cid: '1219901489314', name: 'เด็กหญิงอุทัยวรรณ ยอดแก้ว', dob: '26 พ.ค. 2556', note: 'ย้ายไปอยู่ ป.4/1' },
        { seat: 16, code: '6523', cid: '1440601445877', name: 'เด็กชายชัชวาลย์ พรแสน', dob: '23 ม.ค. 2561', note: 'ย้ายออก' },
        { seat: 17, code: '6693', cid: '1139900812368', name: 'เด็กหญิงวรรณภา โสภา', dob: '29 ก.ย. 2558', note: '' },
        { seat: 18, code: '6449', cid: '1101501612236', name: 'เด็กหญิงพรจุฑา ทองเนียม', dob: '12 ก.ย. 2560', note: 'ย้ายเข้า' },
        { seat: 19, code: '6878', cid: '1659903012465', name: 'เด็กหญิงธัญชนก ปลัดวิเศษ', dob: '22 ธ.ค. 2560', note: 'ย้ายเข้า' },
        { seat: 20, code: '6761', cid: '1348900437106', name: 'เด็กชายจักรพรรดิ สำราญรื่น', dob: '17 ส.ค. 2560', note: '' },
        { seat: 21, code: '6763', cid: '1218700067942', name: 'เด็กชายอัศวิน ท้วมทอง', dob: '17 ก.ค. 2560', note: 'ย้ายเข้า' },
        { seat: 22, code: '6771', cid: '1129701726917', name: 'เด็กชายกฤษกร แพโกเศษ', dob: '3 พ.ค. 2560', note: 'ย้ายเข้า' },
    ];
    console.log('\n=== ป.2/2 (22) ==='); for (const s of p22) await imp(s, 'ป.2/2');

    console.log(`\n=== Batch 2 Done: ${ok} OK, ${fail} FAIL ===`);
}
main().catch(e => console.error('FATAL:', e));
