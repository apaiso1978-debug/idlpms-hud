/**
 * import_real_mablud.cjs
 * =====================
 * Import real Wat Map Chalut school data into InsForge Cloud.
 * Endpoint pattern (from InsForgeDataService.js):
 *   POST /api/database/records/{tableName}
 */

const CONFIG = {
    baseUrl: 'https://3tcdq2dd.ap-southeast.insforge.app',
    apiKey: 'ik_e9ac09dcf4f6732689dd5558fe889c0a',
    schoolId: 'd04aeda2-48c6-483f-ad83-955563ff3031'
};

const HEADERS = {
    'Authorization': `Bearer ${CONFIG.apiKey}`,
    'Content-Type': 'application/json'
};

const GROUP_MAP = {
    "อนุบาล 2": "7edf7180-d93f-4514-a53a-8701ddd90cdb",
    "อนุบาล 3": "262a0534-d9af-49a4-acdd-93175ee9ec74",
    "ป.1/1": "a0bd0ea5-5499-4eea-8e8d-88fb849eb60a",
    "ป.1/2": "4f203ba2-dc00-4f2f-a298-27709a95d54a",
    "ป.2/1": "cd59df0f-1033-43c3-95aa-3e9753ba67c9",
    "ป.2/2": "8417ed61-4ef0-42cf-8d26-6009e29856a0",
    "ป.3": "601da8a5-4253-4f51-b73a-df8ec18a3527",
    "ป.4/1": "391db6d5-76c1-4a35-b5ba-0f5291fd0162",
    "ป.4/2": "1b54781a-3e0e-4be1-a652-32fa0308ff9c",
    "ป.5/1": "6d6ba52f-d350-4ab8-9c78-e521b14b3edb",
    "ป.5/2": "bbcaa620-e175-4d70-afff-5b250eabd25e",
    "ป.6/1": "ee662025-e720-4725-a87c-ae523e72bf27",
    "ป.6/2": "cacd8a0f-967f-4ff6-aa5f-9886bd5ad463"
};

// ============================================================================
// Helper: POST to InsForge table
// ============================================================================
async function post(table, body) {
    const url = `${CONFIG.baseUrl}/api/database/records/${table}`;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(body)
        });
        const text = await res.text();
        if (!res.ok) {
            console.error(`  ✘ POST /${table} ${res.status}: ${text.substring(0, 200)}`);
            return null;
        }
        return JSON.parse(text);
    } catch (e) {
        console.error(`  ✘ Network error POST /${table}: ${e.message}`);
        return null;
    }
}

// ============================================================================
// Helper: GET from InsForge table (to check existing records)
// ============================================================================
async function get(table, query = '') {
    let url = `${CONFIG.baseUrl}/api/database/records/${table}`;
    if (query) url += (query.startsWith('?') ? query : `?${query}`);
    try {
        const res = await fetch(url, { headers: HEADERS });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        return null;
    }
}

// ============================================================================
// 1. Import Staff
// ============================================================================
async function importStaff() {
    console.log('\n══════════════════════════════════════════════');
    console.log('  STEP 1: IMPORTING STAFF');
    console.log('══════════════════════════════════════════════\n');

    // --- Principal ---
    console.log('[Principal] บุญเรือง ถ้ำมณี');
    const p = await post('persons', {
        prefix_th: 'นาย',
        first_name_th: 'บุญเรือง',
        last_name_th: 'ถ้ำมณี',
        org_id: CONFIG.schoolId
    });
    if (p) {
        const r = await post('role_profiles', {
            person_id: p.id,
            role_key: 'SCHOOL_DIR',
            org_id: CONFIG.schoolId,
            is_active: true
        });
        console.log(`  ✔ Principal created: ${p.id}`, r ? '(role OK)' : '(role FAILED)');
    }

    // --- Special Teacher: Worachai Apaiso ---
    console.log('[Special Teacher] วรชัย อภัยโส');
    const w = await post('persons', {
        prefix_th: 'นาย',
        first_name_th: 'วรชัย',
        last_name_th: 'อภัยโส',
        org_id: CONFIG.schoolId
    });
    if (w) {
        const r = await post('role_profiles', {
            person_id: w.id,
            role_key: 'TEACHER',
            org_id: CONFIG.schoolId,
            is_active: true,
            extended_data: JSON.stringify({
                special_roles: ['DEVELOPER', 'ADMIN', 'FOUNDER', 'SPECIAL_TEACHER'],
                special_access: true
            })
        });
        console.log(`  ✔ Worachai created: ${w.id}`, r ? '(role OK)' : '(role FAILED)');
    }

    return { principal: p, worachai: w };
}

// ============================================================================
// 2. Import Sample Students (K2) — partial batch to verify pipeline
// ============================================================================
const K2_STUDENTS = [
    { id: "6703", cid: "1219700139677", name: "เด็กชายกิตติพงษ์ อินทรฉ่ำ", dob: "2019-06-12" },
    { id: "6704", cid: "1200901996846", name: "เด็กชายฉัตรชนก สนิทแสง", dob: "2021-05-08" },
    { id: "6705", cid: "1219901813481", name: "เด็กชายชนะศักดิ์ พรมทัต", dob: "2020-05-18" },
    { id: "6706", cid: "1209001194661", name: "เด็กชายฐาปกรณ์ รัตนวาร", dob: "2020-04-16" },
    { id: "6708", cid: "1209301371223", name: "เด็กชายธนกร บูญเทศ", dob: "2020-09-27" },
    { id: "6709", cid: "1219700165953", name: "เด็กชายธนกฤต เจริญรัตน์", dob: "2021-04-23" },
    { id: "6711", cid: "1209301368087", name: "เด็กชายวราศัย สุวรรณปักษิณ", dob: "2020-06-17" },
    { id: "6712", cid: "1219700157799", name: "เด็กหญิงกัญญ์จิรา บริบุญวงศ์", dob: "2020-08-13" },
    { id: "6713", cid: "1208400018288", name: "เด็กหญิงขนมหวาน ดอกไม้ขาว", dob: "2020-05-28" },
    { id: "6714", cid: "1219700160544", name: "เด็กหญิงชุติกาญจน์ สุขศรี", dob: "2020-10-30" },
    { id: "6715", cid: "1219700161362", name: "เด็กหญิงณัชชา แก้วลือชา", dob: "2020-11-18" },
    { id: "6716", cid: "1200901983701", name: "เด็กหญิงภัทรพร กองดี", dob: "2020-11-23" },
    { id: "6717", cid: "1200901983086", name: "เด็กหญิงวรรณภา ไชยเดช", dob: "2020-11-25" },
    { id: "6718", cid: "1249901318439", name: "เด็กหญิงมีบุญ ศรีวิรัตน์", dob: "2021-04-30" },
    { id: "6720", cid: "1219700162041", name: "เด็กหญิงณัฐนภา สำเภาเงิน", dob: "2020-12-12" },
    { id: "6721", cid: "0021981062866", name: "เด็กชายระยอง โอม", dob: "2020-08-02" }
];

function parseName(fullName) {
    const prefix = fullName.startsWith('เด็กชาย') ? 'เด็กชาย' : 'เด็กหญิง';
    const rest = fullName.replace(prefix, '').trim();
    const parts = rest.split(/\s+/);
    return {
        prefix_th: prefix,
        first_name_th: parts[0] || '',
        last_name_th: parts.slice(1).join(' ') || ''
    };
}

async function importStudents() {
    console.log('\n══════════════════════════════════════════════');
    console.log('  STEP 2: IMPORTING STUDENTS (K2 BATCH)');
    console.log('══════════════════════════════════════════════\n');

    const groupId = GROUP_MAP["อนุบาล 2"];
    let ok = 0, fail = 0;

    for (const s of K2_STUDENTS) {
        const { prefix_th, first_name_th, last_name_th } = parseName(s.name);
        const person = await post('persons', {
            prefix_th,
            first_name_th,
            last_name_th,
            id_number: s.cid,
            birth_date: s.dob,
            org_id: CONFIG.schoolId
        });

        if (!person) { fail++; continue; }

        await post('role_profiles', {
            person_id: person.id,
            role_key: 'STUDENT',
            org_id: CONFIG.schoolId,
            is_active: true
        });

        console.log(`  ✔ ${s.name} → ${person.id}`);
        ok++;
    }

    console.log(`\n  Result: ${ok} OK, ${fail} FAILED out of ${K2_STUDENTS.length}`);
}

// ============================================================================
// 3. Health Check first
// ============================================================================
async function healthCheck() {
    console.log('Checking InsForge connectivity...');
    const tables = await get('../tables');
    if (tables) {
        console.log('  ✔ InsForge tables endpoint reachable');
        return true;
    }
    // Fallback: try direct persons GET
    const persons = await get('persons');
    if (persons !== null) {
        console.log('  ✔ InsForge persons table reachable');
        return true;
    }
    console.error('  ✘ Cannot reach InsForge. Check API key / network.');
    return false;
}

// ============================================================================
// Main
// ============================================================================
async function main() {
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║  InsForge Import: โรงเรียนวัดมาบชลูด           ║');
    console.log('╚══════════════════════════════════════════════╝');

    const alive = await healthCheck();
    if (!alive) {
        console.log('\nAborted. Fix connectivity and retry.');
        process.exit(1);
    }

    const staff = await importStaff();
    await importStudents();

    console.log('\n══════════════════════════════════════════════');
    console.log('  DONE — Check InsForge dashboard to verify.');
    console.log('══════════════════════════════════════════════\n');
}

main();
