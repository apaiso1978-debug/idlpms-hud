// ═══════════════════════════════════════════════
// TASK SYSTEM — IDLPMS v1.0
// Iron Rule: ทุก function ทำงานบน localStorage 100%
// ═══════════════════════════════════════════════

const TaskSystem = {

    // ── Storage Keys ──
    TASKS_KEY: 'idlpms_tasks_v1',

    // ── Read All Tasks ──
    getAllTasks() {
        try {
            return JSON.parse(localStorage.getItem(this.TASKS_KEY) || '{}');
        } catch (e) {
            console.error('Error reading tasks:', e);
            return {};
        }
    },

    // ── Save Tasks ──
    saveTasks(tasks) {
        try {
            localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
        } catch (e) {
            console.error('Error saving tasks:', e);
        }
    },

    // ──────────────────────────────────────────────
    // DIRECTOR FUNCTIONS (role: 'SCHOOL_DIR')
    // ──────────────────────────────────────────────

    /**
     * ผอ สร้าง Task ใหม่ และ auto-assign ครูทุกคนใน school
     * @param {string} templateId  — 'FITNESS_TEST' | 'HOME_VISIT' | ...
     * @param {string} title       — ชื่อ task
     * @param {string} deadline    — 'YYYY-MM-DD'
     * @param {string} note        — หมายเหตุเพิ่มเติม
     * @param {string} schoolId    — 'SCH_MABLUD'
     * @param {string} createdBy   — 'DIR_MABLUD'
     */
    createTask(templateId, title, deadline, note, schoolId, createdBy) {
        const tasks = this.getAllTasks();

        // สร้าง unique Task ID
        const taskId = `TASK_${templateId}_${Date.now()}`;

        // หาครูทุกคนใน school ที่มี homeroomClass (ครูประจำชั้น)
        const assignments = {};
        if (typeof IDLPMS_DATA !== 'undefined' && IDLPMS_DATA.users) {
            Object.entries(IDLPMS_DATA.users).forEach(([userId, user]) => {
                if (
                    user.role === 'TEACHER' &&
                    user.schoolId === schoolId &&
                    user.homeroomClass  // เฉพาะครูที่มีชั้นเรียน
                ) {
                    assignments[userId] = {
                        teacherId: userId,
                        teacherName: user.fullName,
                        classId: user.homeroomClass,
                        status: 'pending',
                        submittedAt: null,
                    };
                }
            });
        }

        tasks[taskId] = {
            taskId,
            templateId,
            title,
            schoolId,
            createdBy,
            createdAt: new Date().toISOString(),
            deadline,
            note: note || '',
            status: 'active',
            assignments,
        };

        this.saveTasks(tasks);
        return taskId;
    },

    /**
     * ผอ ดู Progress ของ Task ทั้งหมดใน school
     * return: { taskId, title, total, submitted, pending, percent }[]
     */
    getDirectorReport(schoolId) {
        const tasks = this.getAllTasks();

        return Object.values(tasks)
            .filter(t => t.schoolId === schoolId)
            .map(task => {
                const all = Object.values(task.assignments);
                const submitted = all.filter(a => a.status === 'submitted').length;
                return {
                    taskId: task.taskId,
                    templateId: task.templateId,
                    title: task.title,
                    deadline: task.deadline,
                    status: task.status,
                    total: all.length,
                    submitted,
                    pending: all.length - submitted,
                    percent: all.length > 0 ? Math.round((submitted / all.length) * 100) : 0,
                    assignments: task.assignments,  // รายละเอียดรายชั้น
                };
            });
    },

    /**
     * ผอ ปิด Task
     */
    closeTask(taskId) {
        const tasks = this.getAllTasks();
        if (tasks[taskId]) {
            tasks[taskId].status = 'closed';
            this.saveTasks(tasks);
        }
    },

    // ──────────────────────────────────────────────
    // TEACHER FUNCTIONS (role: 'TEACHER')
    // ──────────────────────────────────────────────

    /**
     * ครู ดู Task ที่ได้รับ assign
     * @param {string} teacherId — 'TEA_M_05'
     * return: Task[] ที่มี assignment ของ teacher นี้
     */
    getTeacherInbox(teacherId) {
        const tasks = this.getAllTasks();

        return Object.values(tasks)
            .filter(task =>
                task.status === 'active' &&
                task.assignments[teacherId]
            )
            .map(task => ({
                taskId: task.taskId,
                templateId: task.templateId,
                title: task.title,
                deadline: task.deadline,
                note: task.note,
                myAssignment: task.assignments[teacherId],
            }));
    },

    /**
     * ครู กด Submit งาน
     * @param {string} taskId
     * @param {string} teacherId
     */
    submitTask(taskId, teacherId) {
        const tasks = this.getAllTasks();

        if (tasks[taskId]?.assignments[teacherId]) {
            // Logic enforcement check if completion is 100%
            const templateId = tasks[taskId].templateId;
            const template = IDLPMS_DATA.taskTemplates[templateId];
            if (template?.dataKey) {
                const completion = this.getClassCompletionStatus(tasks[taskId].assignments[teacherId].classId, template.dataKey);
                if (!completion.isComplete) {
                    console.warn('Cannot submit: data collection not complete.');
                    return false;
                }
            }

            tasks[taskId].assignments[teacherId].status = 'submitted';
            tasks[taskId].assignments[teacherId].submittedAt = new Date().toISOString();
            this.saveTasks(tasks);
            return true;
        }
        return false;
    },

    /**
     * ครู ดูว่ากรอกข้อมูลนักเรียนครบชั้นแล้วหรือยัง
     * ใช้กับ fitness_results_v1
     * @param {string} classId    — 'ป.2/1'
     * @param {string} dataKey    — 'fitness_results_v1'
     */
    getClassCompletionStatus(classId, dataKey) {
        try {
            const results = JSON.parse(localStorage.getItem(dataKey) || '{}');

            // หานักเรียนทุกคนในชั้น
            const classStudents = Object.entries(IDLPMS_DATA.users)
                .filter(([_, u]) => u.role === 'STUDENT' && u.classId === classId)
                .map(([id]) => id);

            const recorded = classStudents.filter(id => results[id]);

            return {
                total: classStudents.length,
                recorded: recorded.length,
                percent: classStudents.length > 0
                    ? Math.round((recorded.length / classStudents.length) * 100)
                    : 0,
                isComplete: recorded.length === classStudents.length && classStudents.length > 0,
            };
        } catch (e) {
            console.error('Error checking class completion:', e);
            return { total: 0, recorded: 0, percent: 0, isComplete: false };
        }
    },
};
