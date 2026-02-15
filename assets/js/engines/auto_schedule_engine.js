/**
 * Auto Schedule Engine - Pure Logic
 * Decoupled from UI/DOM
 * 
 * RULES ENFORCED:
 * 1. ตารางนักเรียนเต็ม 100% (35 คาบ/สัปดาห์ หักพักเที่ยง)
 * 2. Pre-assigned slots (สวดมนต์ ศุกร์คาบ 8, ลูกเสือ พุธคาบ 8)
 * 3. ป้องกันครูสอนซ้ำเวลา (Teacher Overlap Prevention)
 * 4. แนะแนว = ครูประจำชั้นเท่านั้น (Homeroom constraint)
 * 5. การจัดลำดับความสำคัญ: CORE > EXTRA > ACTIVITY > Filler
 * 6. เติมคาบให้ครบด้วยวิชาหลัก (THAI, MATH, ENG) อัตโนมัติ
 */

class TimetableScheduler {
    constructor(input) {
        this.input = input;
        this.schedule = {};
        this.teacherSchedule = {};
        this.roomUsage = {};
        this.initializeSchedules();
    }

    initializeSchedules() {
        this.input.classes.forEach(cls => {
            const classKey = `${cls.level}-${cls.section}`;
            this.schedule[classKey] = this.createEmptySchedule();
        });

        this.input.teachers.forEach(teacher => {
            this.teacherSchedule[teacher.id] = this.createEmptySchedule();
        });

        if (this.input.constraints.specialRooms) {
            this.input.constraints.specialRooms.forEach(room => {
                this.roomUsage[room.name] = this.createEmptySchedule();
            });
        }
    }

    createEmptySchedule() {
        const schedule = {};
        for (let day = 1; day <= this.input.scheduleStructure.daysPerWeek; day++) {
            schedule[day] = {};
            for (let period = 1; period <= this.input.scheduleStructure.periodsPerDay; period++) {
                schedule[day][period] = null;
            }
        }
        return schedule;
    }

    generateSchedule() {
        console.log('🚀 Timetable Engine: Starting generation...');

        // Phase 1: Lock pre-assigned slots (สวดมนต์, ลูกเสือ)
        this.assignPreAssignedSlots();

        // Phase 2: Create and sort tasks for remaining subjects
        const tasks = this.createTasks();
        const sortedTasks = this.sortTasksByPriority(tasks);

        // Phase 3: Greedy assignment
        this.greedyAssignSchedule(sortedTasks);

        // Phase 4: Gap-fill — scan every empty slot and fill with RILS
        this.fillGaps();

        const stats = this.calculateStatistics();
        const success = stats.filledSlots >= stats.totalSlots;

        return {
            success: success,
            classSchedules: this.schedule,
            teacherSchedules: this.teacherSchedule,
            statistics: stats,
            message: success ? 'จัดตารางสำเร็จ 100%!' : `จัดตารางได้ ${stats.completionRate}`
        };
    }

    /**
     * Phase 4: Fill any remaining gaps with RILS (ลดเวลาเรียนเพิ่มเวลารู้)
     * Scans all classes for empty slots and assigns any available RILS teacher
     */
    fillGaps() {
        const rilsSubject = this.input.subjects.find(s => s.id === 'RILS')
            || { id: 'RILS', name: 'ลดเวลาเรียนเพิ่มเวลารู้', color: '#10B981', type: 'ACTIVITY' };
        const lunchPeriod = this.input.scheduleStructure.lunchPeriod;
        const { daysPerWeek, periodsPerDay } = this.input.scheduleStructure;
        let gapsFilled = 0;

        for (let classKey in this.schedule) {
            for (let day = 1; day <= daysPerWeek; day++) {
                for (let period = 1; period <= periodsPerDay; period++) {
                    if (period === lunchPeriod) continue;
                    // Last period reserved for pre-assigned activities only
                    if (period === periodsPerDay) continue;
                    if (this.schedule[classKey][day][period] !== null) continue;

                    // Find any teacher who can teach RILS and is free at this slot
                    const availableTeachers = this.input.teachers.filter(t => {
                        if (!t.canTeachSubjects.includes('RILS')) return false;
                        if (this.teacherSchedule[t.id][day][period] !== null) return false;
                        if (this.countTeacherPeriodsInDay(t.id, day) >= t.maxPeriodsPerDay) return false;
                        if (this.countTeacherTotalPeriods(t.id) >= t.maxPeriodsPerWeek) return false;
                        return true;
                    });

                    if (availableTeachers.length > 0) {
                        // Pick the teacher with lowest current workload
                        const teacher = availableTeachers.sort((a, b) =>
                            this.countTeacherTotalPeriods(a.id) - this.countTeacherTotalPeriods(b.id)
                        )[0];

                        const cls = this.input.classes.find(c => `${c.level}-${c.section}` === classKey);
                        const assignment = { subject: rilsSubject, teacher, class: cls, isFiller: true };
                        this.schedule[classKey][day][period] = assignment;
                        this.teacherSchedule[teacher.id][day][period] = assignment;
                        gapsFilled++;
                    }
                }
            }
        }
        console.log(`🔧 Gap-fill: filled ${gapsFilled} remaining slots with RILS`);
    }

    /**
     * Phase 1: Pre-assign locked slots (สวดมนต์ ศุกร์คาบ 8, ลูกเสือ พุธคาบ 8)
     * These are school-wide activities — all classes at the same time, any teacher
     */
    assignPreAssignedSlots() {
        const preAssigned = this.input.preAssignedSlots || [];
        if (preAssigned.length === 0) return;

        preAssigned.forEach(slot => {
            const subject = this.input.subjects.find(s => s.id === slot.subjectId);
            if (!subject) {
                console.warn(`⚠️ Pre-assigned subject ${slot.subjectId} not found`);
                return;
            }

            // Get all teachers who can teach this subject
            const eligibleTeachers = this.input.teachers.filter(t =>
                t.canTeachSubjects.includes(slot.subjectId)
            );

            // Assign to every class at this exact slot
            this.input.classes.forEach((cls, idx) => {
                const classKey = `${cls.level}-${cls.section}`;
                // Round-robin teacher assignment for pre-assigned slots
                const teacher = eligibleTeachers[idx % eligibleTeachers.length];
                if (teacher && this.schedule[classKey][slot.day][slot.period] === null) {
                    const assignment = {
                        subject, teacher, class: cls,
                        isFiller: false, isPreAssigned: true,
                        domain: slot.domain || 1,
                        visibility: slot.visibility || 'all'
                    };
                    this.schedule[classKey][slot.day][slot.period] = assignment;
                    this.teacherSchedule[teacher.id][slot.day][slot.period] = assignment;
                }
            });
        });

        console.log(`🔒 Pre-assigned ${preAssigned.length} slot types across ${this.input.classes.length} classes`);
    }

    greedyAssignSchedule(tasks) {
        let successCount = 0;

        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];
            let assigned = false;

            const possibleSlots = this.getPossibleSlots(task);

            for (const slot of possibleSlots) {
                if (assigned) break;

                // Sort teachers by current workload (ascending) for better distribution
                const sortedTeachers = [...task.availableTeachers].sort((a, b) => {
                    return this.countTeacherTotalPeriods(a.id) - this.countTeacherTotalPeriods(b.id);
                });

                for (const teacher of sortedTeachers) {
                    if (this.canAssign(task, slot, teacher)) {
                        this.assign(task, slot, teacher);
                        assigned = true;
                        successCount++;
                        break;
                    }
                }
            }
        }
        return successCount === tasks.length;
    }

    createTasks() {
        const tasks = [];
        let taskId = 1;

        // Collect pre-assigned subject IDs to skip them in regular task creation
        const preAssignedSubjectIds = (this.input.preAssignedSlots || []).map(s => s.subjectId);

        this.input.classes.forEach(cls => {
            const classKey = `${cls.level}-${cls.section}`;
            const classLabel = `${cls.grade}/${cls.section}`;
            const { periodsPerDay, daysPerWeek, lunchPeriod } = this.input.scheduleStructure;
            const targetPeriods = (periodsPerDay - 2) * daysPerWeek; // Subtract lunch + last period (reserved for activities)

            let assignedPeriods = 0;

            // Count pre-assigned periods already placed
            // IMPORTANT: Skip lunch and Reserve period to match targetPeriods scope
            for (let day = 1; day <= daysPerWeek; day++) {
                for (let period = 1; period <= periodsPerDay; period++) {
                    if (period === lunchPeriod) continue;      // Excluded from target
                    if (period === periodsPerDay) continue;    // Reserve period — excluded from target
                    if (this.schedule[classKey][day] && this.schedule[classKey][day][period]) {
                        assignedPeriods++;
                    }
                }
            }

            // 1. Regular Subjects (skip pre-assigned ones)
            this.input.subjects.forEach(subject => {
                if (preAssignedSubjectIds.includes(subject.id)) return;

                const periodsNeeded = subject.periodsPerWeek[cls.level] || 0;
                if (periodsNeeded > 0) {
                    let availableTeachers;

                    // แนะแนว: Only the homeroom teacher can teach this
                    if (subject.id === 'GUIDE') {
                        const homeroomTeacher = this.input.teachers.find(t =>
                            t.homeroomClass === classLabel && t.canTeachSubjects.includes('GUIDE')
                        );
                        availableTeachers = homeroomTeacher ? [homeroomTeacher] : [];
                    } else {
                        availableTeachers = this.input.teachers.filter(t =>
                            t.canTeachSubjects.includes(subject.id)
                        );
                    }

                    for (let i = 0; i < periodsNeeded; i++) {
                        tasks.push({
                            id: taskId++,
                            classKey: classKey,
                            class: cls,
                            subject: subject,
                            availableTeachers: availableTeachers,
                            periodNumber: i + 1,
                            totalPeriods: periodsNeeded,
                            isFiller: false
                        });
                        assignedPeriods++;
                    }
                }
            });

            // 2. Filler Subjects — use RILS (ลดเวลาเรียนเพิ่มเวลารู้) to fill remaining
            //    RILS is a broad umbrella activity that ALL teachers can teach
            const remainingPeriods = targetPeriods - assignedPeriods;
            if (remainingPeriods > 0) {
                const rilsSubject = this.input.subjects.find(s => s.id === 'RILS');
                if (!rilsSubject) {
                    console.warn('⚠️ RILS subject not found for filler');
                }
                for (let i = 0; i < remainingPeriods; i++) {
                    const subject = rilsSubject || { id: 'RILS', name: 'ลดเวลาเรียนเพิ่มเวลารู้', color: '#10B981', type: 'ACTIVITY' };
                    const availableTeachers = this.input.teachers.filter(t =>
                        t.canTeachSubjects.includes('RILS')
                    );
                    if (availableTeachers.length > 0) {
                        tasks.push({
                            id: taskId++,
                            classKey: classKey,
                            class: cls,
                            subject: subject,
                            availableTeachers: availableTeachers,
                            periodNumber: i + 1,
                            totalPeriods: remainingPeriods,
                            isFiller: true
                        });
                    }
                }
            }
        });
        return tasks;
    }

    sortTasksByPriority(tasks) {
        return tasks.sort((a, b) => {
            // Rule: Normal > Filler
            if (a.isFiller !== b.isFiller) return a.isFiller ? 1 : -1;

            // Rule: High subject priority first (CORE > EXTRA > ACTIVITY)
            const priorityA = this.input.constraints.subjectPriority[a.subject.id] || 0;
            const priorityB = this.input.constraints.subjectPriority[b.subject.id] || 0;
            if (priorityA !== priorityB) return priorityB - priorityA;

            // Rule: Low teacher availability first (Scarcity constraint)
            if (a.availableTeachers.length !== b.availableTeachers.length) {
                return a.availableTeachers.length - b.availableTeachers.length;
            }

            return b.totalPeriods - a.totalPeriods;
        });
    }

    getPossibleSlots(task) {
        const slots = [];
        const { daysPerWeek, periodsPerDay } = this.input.scheduleStructure;
        for (let day = 1; day <= daysPerWeek; day++) {
            for (let period = 1; period <= periodsPerDay; period++) {
                slots.push({ day, period });
            }
        }

        // Randomize for better distribution
        for (let i = slots.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [slots[i], slots[j]] = [slots[j], slots[i]];
        }

        if (task.subject.preferredTime === 'morning') slots.sort((a, b) => a.period - b.period);
        else if (task.subject.preferredTime === 'afternoon') slots.sort((a, b) => b.period - a.period);

        return slots;
    }

    canAssign(task, slot, teacher) {
        const { day, period } = slot;
        const { classKey, subject } = task;

        // Skip lunch period
        if (this.input.scheduleStructure.lunchPeriod && period === this.input.scheduleStructure.lunchPeriod) return false;
        // Last period (คาบ 7) reserved for pre-assigned activities (PLC/Scout/Prayer) only
        if (period === this.input.scheduleStructure.periodsPerDay) return false;
        // Slot already taken for this class
        if (this.schedule[classKey][day][period] !== null) return false;

        // Rule: Teacher Overlap Prevention
        if (this.teacherSchedule[teacher.id][day][period] !== null) return false;

        // Teacher unavailable slots
        if (teacher.unavailableSlots && teacher.unavailableSlots.length > 0) {
            const isUnavailable = teacher.unavailableSlots.some(u => u.day === day && u.periods.includes(period));
            if (isUnavailable) return false;
        }

        // Teacher daily/weekly limits
        if (this.countTeacherPeriodsInDay(teacher.id, day) >= teacher.maxPeriodsPerDay) return false;
        if (this.countTeacherTotalPeriods(teacher.id) >= teacher.maxPeriodsPerWeek) return false;

        // Special room check
        if (subject.requiresSpecialRoom) {
            const room = this.input.constraints.specialRooms.find(r => r.forSubjects.includes(subject.id));
            if (room && this.roomUsage[room.name][day][period] !== null) return false;
        }

        // Max consecutive periods per subject
        if (this.input.constraints.maxConsecutivePeriodsPerSubject) {
            if (this.countConsecutivePeriods(classKey, day, period, subject.id) >= this.input.constraints.maxConsecutivePeriodsPerSubject) return false;
        }
        return true;
    }

    assign(task, slot, teacher) {
        const { day, period } = slot;
        const { classKey, subject } = task;
        const assignment = { subject, teacher, class: task.class, isFiller: task.isFiller || false };
        this.schedule[classKey][day][period] = assignment;
        this.teacherSchedule[teacher.id][day][period] = assignment;
        if (subject.requiresSpecialRoom) {
            const room = this.input.constraints.specialRooms.find(r => r.forSubjects.includes(subject.id));
            if (room) this.roomUsage[room.name][day][period] = assignment;
        }
    }

    countTeacherPeriodsInDay(teacherId, day) {
        let count = 0;
        const schedule = this.teacherSchedule[teacherId][day];
        for (let p in schedule) { if (schedule[p] !== null) count++; }
        return count;
    }

    countTeacherTotalPeriods(teacherId) {
        let count = 0;
        for (let day in this.teacherSchedule[teacherId]) {
            for (let p in this.teacherSchedule[teacherId][day]) {
                if (this.teacherSchedule[teacherId][day][p] !== null) count++;
            }
        }
        return count;
    }

    countConsecutivePeriods(classKey, day, period, subjectId) {
        let count = 1;
        const schedule = this.schedule[classKey][day];
        let p = period - 1;
        while (p >= 1 && schedule[p] && schedule[p].subject.id === subjectId) { count++; p--; }
        p = period + 1;
        while (p <= this.input.scheduleStructure.periodsPerDay && schedule[p] && schedule[p].subject.id === subjectId) { count++; p++; }
        return count;
    }

    calculateStatistics() {
        const { periodsPerDay, daysPerWeek, lunchPeriod } = this.input.scheduleStructure;
        const targetPerClass = (periodsPerDay - 2) * daysPerWeek; // Subtract lunch + last period (reserved)

        const stats = { totalSlots: 0, filledSlots: 0, emptySlots: 0, completionRate: '0%', classStats: {}, teacherStats: {} };
        for (let classKey in this.schedule) {
            let filled = 0, empty = 0;
            for (let day in this.schedule[classKey]) {
                for (let period in this.schedule[classKey][day]) {
                    if (parseInt(period) === lunchPeriod) continue;
                    if (parseInt(period) === periodsPerDay) continue; // Last period = activities only
                    if (this.schedule[classKey][day][period] !== null) filled++;
                    else empty++;
                }
            }
            stats.classStats[classKey] = { total: targetPerClass, filled, empty, completionRate: ((filled / targetPerClass) * 100).toFixed(2) + '%' };
            stats.totalSlots += targetPerClass;
            stats.filledSlots += filled;
            stats.emptySlots += empty;
        }

        // Teacher utilization stats
        for (let teacher of this.input.teachers) {
            const total = this.countTeacherTotalPeriods(teacher.id);
            stats.teacherStats[teacher.id] = {
                name: teacher.name,
                periodsAssigned: total,
                maxPeriods: teacher.maxPeriodsPerWeek,
                utilization: ((total / teacher.maxPeriodsPerWeek) * 100).toFixed(1) + '%'
            };
        }

        stats.completionRate = stats.totalSlots > 0 ? ((stats.filledSlots / stats.totalSlots) * 100).toFixed(2) + '%' : '0%';
        return stats;
    }
}

// Export for use in HTML
window.TimetableScheduler = TimetableScheduler;
