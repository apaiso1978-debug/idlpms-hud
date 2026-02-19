// Phase 1 Complete Fix: Clean corrupted persons + reimport teachers + link role_profiles
const BASE = 'https://3tcdq2dd.ap-southeast.insforge.app';
const KEY = 'ik_e9ac09dcf4f6732689dd5558fe889c0a';
const SCHOOL_ID = 'd04aeda2-48c6-483f-ad83-955563ff3031';
const H = { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' };

async function get(table) {
    const r = await fetch(`${BASE}/api/database/records/${table}`, { headers: H });
    return r.json();
}
async function del(table, id) {
    await fetch(`${BASE}/api/database/records/${table}/${id}`, { method: 'DELETE', headers: H });
}
async function post(table, data) {
    await fetch(`${BASE}/api/database/records/${table}`, { method: 'POST', headers: H, body: JSON.stringify(data) });
}
async function findLatest(table, field, value) {
    const all = await get(table);
    return all.find(r => r[field] === value);
}

async function main() {
    // 1. Delete all corrupted persons
    const persons = await get('persons');
    console.log(`Deleting ${persons.length} corrupted persons...`);
    for (const p of persons) { await del('persons', p.id); }
    console.log('[OK] All corrupted persons deleted');

    // Also delete the test group
    const groups = await get('groups');
    const test = groups.find(g => g.name === '_test_delete');
    if (test) { await del('groups', test.id); console.log('[OK] Test group deleted'); }

    // 2. Get group IDs (already created correctly by Node.js)
    const grps = await get('groups');
    const gMap = {};
    for (const g of grps) { gMap[g.name] = g.id; }
    console.log(`Groups: ${Object.keys(gMap).length}`);

    // 3. Create teachers with proper UTF-8
    const teachers = [
        { pre: 'นาง', fn: 'นิติพร', ln: 'โฆเกียรติมานนท์', g: 'female', gr: 'อนุบาล 2' },
        { pre: 'นาง', fn: 'สุภาภรณ์', ln: 'ชุ่มแอ่น', g: 'female', gr: 'อนุบาล 3' },
        { pre: 'นางสาว', fn: 'รัตนาวลี', ln: 'ทิศเสถียร', g: 'female', gr: 'ป.1/1' },
        { pre: 'นางสาว', fn: 'ริศรา', ln: 'แก้วเคน', g: 'female', gr: 'ป.1/2' },
        { pre: 'นางสาว', fn: 'วาสนา', ln: 'ปะทะนมปีย์', g: 'female', gr: 'ป.2/1' },
        { pre: 'นางสาว', fn: 'พิมพร', ln: 'สาตรา', g: 'female', gr: 'ป.2/2' },
        { pre: 'นางสาว', fn: 'เจนจิรา', ln: 'มั่นหมาย', g: 'female', gr: 'ป.3' },
        { pre: 'นางสาว', fn: 'สุนิษา', ln: 'สองสี', g: 'female', gr: 'ป.3' },
        { pre: 'นาย', fn: 'ณัฐนนท์', ln: 'มหาเสน', g: 'male', gr: 'ป.4/1' },
        { pre: 'นางสาว', fn: 'วิชุดา', ln: 'บุญเฟรือง', g: 'female', gr: 'ป.4/2' },
        { pre: 'นาย', fn: 'ภานุวัฒน์', ln: 'สุวรรณมาโจ', g: 'male', gr: 'ป.5/1' },
        { pre: 'นาย', fn: 'ยุทธนา', ln: 'คุณอุตส่าห์', g: 'male', gr: 'ป.5/2' },
        { pre: 'นาย', fn: 'วุฒิไกร', ln: 'ปุรินัย', g: 'male', gr: 'ป.6/1' },
        { pre: 'นางสาว', fn: 'แพรวพรรณ', ln: 'สมพงษ์', g: 'female', gr: 'ป.6/2' },
        { pre: 'นาย', fn: 'วรชัย', ln: 'อภัยโส', g: 'male', gr: null },
    ];

    for (const t of teachers) {
        await post('persons', {
            id_type: 'pending', prefix_th: t.pre,
            first_name_th: t.fn, last_name_th: t.ln,
            gender: t.g, nationality: 'ไทย', is_active: 'true'
        });
        // Find the person we just created
        const p = await findLatest('persons', 'first_name_th', t.fn);
        if (!p) { console.log(`[FAIL] ${t.fn} not found after create`); continue; }

        // Create role_profile
        await post('role_profiles', {
            person_id: p.id, role: 'TEACHER',
            school_id: SCHOOL_ID,
            group_id: t.gr ? gMap[t.gr] : null,
            is_active: 'true'
        });
        console.log(`[OK] ${t.pre}${t.fn} ${t.ln} => ${t.gr || 'ครูพิเศษ'} (${p.id})`);
    }

    // 4. Verify
    const finalP = await get('persons');
    const finalR = await get('role_profiles');
    console.log(`\n=== Phase 1 Complete ===`);
    console.log(`Persons: ${finalP.length} | Role Profiles: ${finalR.length} | Groups: ${Object.keys(gMap).length}`);
    console.log('Sample person:', finalP[0]?.first_name_th, finalP[0]?.last_name_th);
}

main().catch(e => console.error('FATAL:', e));
