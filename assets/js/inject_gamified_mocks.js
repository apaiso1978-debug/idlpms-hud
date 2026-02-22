// Inject Mock Tasks to test Transparency Ledger
const TASKS_KEY = 'idlpms_tasks_v1';
let tasks = JSON.parse(localStorage.getItem(TASKS_KEY) || '{}');

// Determine a valid schoolId
let schoolId = '99999999-9999-4999-8999-999999999999';
if (window.IDLPMS_DATA && IDLPMS_DATA.users) {
    // find the school id of DIR_MABLUD or similar
    const dir = Object.values(IDLPMS_DATA.users).find(u => u.role === 'SCHOOL_DIR');
    if (dir) schoolId = dir.schoolId;
}

// Generate Dates
const now = new Date();
const past3Days = new Date(now.getTime() - (3 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
const future2Days = new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
const future20Days = new Date(now.getTime() + (20 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
const future10Hours = new Date(now.getTime() + (10 * 60 * 60 * 1000)).toISOString();

// Find some teachers
const teachers = Object.entries(window.IDLPMS_DATA ? IDLPMS_DATA.users : {}).filter(([id, u]) => u.role === 'TEACHER' && u.schoolId === schoolId);

if (teachers.length >= 3) {
    const t1 = teachers[0][0]; // Excellent (Early)
    const t2 = teachers[1][0]; // Normal (On-Time)
    const t3 = teachers[2][0]; // Late (Late)

    // Task 1: Past Deadline (Overdue/Late)
    tasks['MOCK_TASK_1'] = {
        taskId: 'MOCK_TASK_1', title: 'ส่งแผนการสอนล่วงหน้าเทอม 2', schoolId: schoolId, deadline: past3Days, baseScore: 50,
        assignments: {
            [t1]: { status: 'submitted', submittedAt: new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000)).toISOString() }, // Earlybird
            [t2]: { status: 'submitted', submittedAt: past3Days }, // On-time
            [t3]: { status: 'submitted', submittedAt: now.toISOString() }, // 3 days late
            [teachers[3][0]]: { status: 'pending' } // Overdue right now
        }
    };

    // Task 2: Critical Deadline (< 12 Hours)
    tasks['MOCK_TASK_2'] = {
        taskId: 'MOCK_TASK_2', title: 'รายงานผลการเยี่ยมนักเรียนกลุ่มเสี่ยง (กรณีเร่งด่วน)', schoolId: schoolId, deadline: future10Hours, baseScore: 200,
        assignments: Object.fromEntries(teachers.map(t => [t[0], { status: 'pending' }]))
    };

    // Task 3: Warning (> 15 Days)
    tasks['MOCK_TASK_3'] = {
        taskId: 'MOCK_TASK_3', title: 'สรุปงบประมาณประจำหมวดปี 2569', schoolId: schoolId, deadline: future20Days, baseScore: 10,
        assignments: {
            [t1]: { status: 'pending' },
            [t2]: { status: 'pending' }
        }
    };

    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    console.log("Injected Gamified Ledger mock tasks");
}
