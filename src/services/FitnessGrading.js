/**
 * FitnessGrading — เกณฑ์มาตรฐานสมรรถภาพทางกาย ระดับประถมศึกษา (อายุ 7-12 ปี)
 * ========================================================================
 * แหล่งข้อมูล: สำนักวิทยาศาสตร์การกีฬา กรมพลศึกษา กระทรวงการท่องเที่ยวและกีฬา, 2562
 *
 * 3 รายการทดสอบ:
 *   1. นั่งงอตัว (Sit & Reach) — cm
 *   2. ดันพื้น 30 วินาที (Modified Push Ups) — ครั้ง
 *   3. ยืนก้าวขึ้นลง 3 นาที (Step Up & Down) — ครั้ง
 *
 * 5 ระดับ: ต่ำมาก / ต่ำ / ปานกลาง / ดี / ดีมาก
 */

const FitnessGrading = {

    // ══════════════════════════════════════════════════════════
    //  LEVEL LABELS
    // ══════════════════════════════════════════════════════════
    LEVELS: ['ต่ำมาก', 'ต่ำ', 'ปานกลาง', 'ดี', 'ดีมาก'],
    LEVEL_COLORS: {
        'ต่ำมาก': '#ef4444',   // red
        'ต่ำ': '#f97316',   // orange
        'ปานกลาง': '#eab308', // yellow
        'ดี': '#22c55e',   // green
        'ดีมาก': '#3b82f6',   // blue
    },

    // ══════════════════════════════════════════════════════════
    //  CRITERIA TABLES
    //  Format: [ต่ำmax, ต่ำmax, ปานกลางmax, ดีmax]
    //  ต่ำมาก = ≤ [0], ต่ำ = [0]+1 to [1], ปานกลาง = [1]+1 to [2], ดี = [2]+1 to [3], ดีมาก = ≥ [3]+1
    // ══════════════════════════════════════════════════════════

    // ── 1. นั่งงอตัว (Sit & Reach) — cm ──
    SIT_REACH: {
        M: { // เพศชาย
            7: [0, 3, 6, 10],
            8: [1, 4, 7, 10],
            9: [1, 5, 8, 11],
            10: [3, 7, 12, 16],
            11: [4, 9, 14, 18],
            12: [4, 9, 14, 19],
        },
        F: { // เพศหญิง
            7: [0, 4, 8, 12],
            8: [1, 4, 8, 12],
            9: [1, 5, 9, 14],
            10: [4, 9, 14, 18],
            11: [5, 10, 15, 20],
            12: [5, 10, 15, 20],
        }
    },

    // ── 2. ดันพื้น 30 วินาที (Modified Push Ups) — ครั้ง ──
    PUSH_UP: {
        M: { // เพศชาย
            7: [7, 14, 20, 26],
            8: [8, 15, 22, 28],
            9: [9, 16, 22, 29],
            10: [10, 16, 23, 30],
            11: [11, 17, 24, 30],
            12: [11, 18, 24, 31],
        },
        F: { // เพศหญิง
            7: [5, 11, 16, 22],
            8: [7, 13, 19, 25],
            9: [8, 14, 19, 25],
            10: [9, 14, 20, 26],
            11: [9, 15, 22, 28],
            12: [10, 16, 22, 28],
        }
    },

    // ── 3. ยืนก้าวขึ้นลง 3 นาที (Step Up & Down) — ครั้ง ──
    STEP_UP: {
        M: { // เพศชาย
            7: [86, 107, 129, 140],
            8: [88, 108, 128, 146],
            9: [88, 111, 134, 151],
            10: [90, 114, 139, 157],
            11: [96, 120, 144, 158],
            12: [97, 121, 145, 161],
        },
        F: { // เพศหญิง
            7: [82, 103, 123, 136],
            8: [84, 106, 127, 141],
            9: [87, 107, 128, 141],
            10: [89, 110, 131, 145],
            11: [91, 113, 135, 150],
            12: [95, 116, 138, 150],
        }
    },

    // ══════════════════════════════════════════════════════════
    //  CORE GRADING FUNCTION
    // ══════════════════════════════════════════════════════════

    /**
     * ให้เกณฑ์สำหรับค่าทดสอบ 1 รายการ
     * @param {string} testType - 'SIT_REACH' | 'PUSH_UP' | 'STEP_UP'
     * @param {number} value    - ค่าที่วัดได้
     * @param {number} age      - อายุ 7-12 ปี
     * @param {string} gender   - 'M' หรือ 'F'
     * @returns {{ level: string, levelIndex: number, color: string }} | null
     */
    gradeOne(testType, value, age, gender) {
        const table = this[testType];
        if (!table) return null;

        const genderTable = table[gender];
        if (!genderTable) return null;

        // Clamp age to 7-12
        const clampedAge = Math.max(7, Math.min(12, Math.round(age)));
        const thresholds = genderTable[clampedAge];
        if (!thresholds) return null;

        let levelIndex;
        if (value <= thresholds[0]) {
            levelIndex = 0; // ต่ำมาก
        } else if (value <= thresholds[1]) {
            levelIndex = 1; // ต่ำ
        } else if (value <= thresholds[2]) {
            levelIndex = 2; // ปานกลาง
        } else if (value <= thresholds[3]) {
            levelIndex = 3; // ดี
        } else {
            levelIndex = 4; // ดีมาก
        }

        const level = this.LEVELS[levelIndex];
        return {
            level,
            levelIndex,
            color: this.LEVEL_COLORS[level],
        };
    },

    /**
     * ให้เกณฑ์ครบทั้ง 3 ท่า + เกณฑ์รวม
     * @param {object} data - { sitReach, pushUp, stepUp }
     * @param {number} age  - อายุ 7-12 ปี
     * @param {string} gender - 'M' หรือ 'F'
     * @returns {object} { sitReach: {level, color}, pushUp: {...}, stepUp: {...}, overall: {...} }
     */
    gradeAll(data, age, gender) {
        const sitReach = this.gradeOne('SIT_REACH', Number(data.sitReach) || 0, age, gender);
        const pushUp = this.gradeOne('PUSH_UP', Number(data.pushUp) || 0, age, gender);
        const stepUp = this.gradeOne('STEP_UP', Number(data.stepUp) || 0, age, gender);

        // Overall = average of level indices, rounded
        let overallIndex = 0;
        let count = 0;
        if (sitReach) { overallIndex += sitReach.levelIndex; count++; }
        if (pushUp) { overallIndex += pushUp.levelIndex; count++; }
        if (stepUp) { overallIndex += stepUp.levelIndex; count++; }

        const avgIndex = count > 0 ? Math.round(overallIndex / count) : 0;
        const overallLevel = this.LEVELS[avgIndex];

        return {
            sitReach,
            pushUp,
            stepUp,
            overall: {
                level: overallLevel,
                levelIndex: avgIndex,
                color: this.LEVEL_COLORS[overallLevel],
            }
        };
    },

    // ══════════════════════════════════════════════════════════
    //  HELPERS
    // ══════════════════════════════════════════════════════════

    /**
     * คำนวณอายุจาก birthDate
     * @param {string} birthDate - ISO date string or 'YYYY-MM-DD'
     * @returns {number} อายุเต็มปี
     */
    calcAge(birthDate) {
        if (!birthDate) return 0;
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    },

    /**
     * ประมาณอายุจากชั้นเรียน (fallback ถ้าไม่มี birthDate)
     * @param {string} classId - เช่น 'อนุบาล 2', 'ป.1/1', 'ป.6/2'
     * @returns {number} อายุโดยประมาณ
     */
    estimateAgeFromClass(classId) {
        if (!classId) return 10;
        const map = {
            'อนุบาล 2': 5, 'อนุบาล 3': 6,
            'ป.1': 7, 'ป.2': 8, 'ป.3': 9,
            'ป.4': 10, 'ป.5': 11, 'ป.6': 12,
        };
        // Try exact match first, then prefix match
        if (map[classId] !== undefined) return map[classId];
        for (const [prefix, age] of Object.entries(map)) {
            if (classId.startsWith(prefix)) return age;
        }
        return 10; // default
    },

    /**
     * ตรวจจับเพศจากชื่อภาษาไทย
     * @param {string} name - ชื่อเต็ม
     * @returns {string} 'M' หรือ 'F'
     */
    detectGender(name) {
        if (!name) return 'M';
        if (name.includes('เด็กหญิง') || name.includes('ด.ญ.') || name.startsWith('นางสาว') || name.startsWith('นาง')) {
            return 'F';
        }
        return 'M';
    },

    /**
     * ตรวจสอบผ่านเกณฑ์สมรรถภาพทางกาย (ตามเกณฑ์ทางการ)
     * ผ่าน = ระดับ ปานกลาง / ดี / ดีมาก ครบทั้ง 3 ด้าน
     * @param {object} grades - ผลจาก gradeAll()
     * @returns {boolean}
     */
    isPassed(grades) {
        if (!grades || !grades.sitReach || !grades.pushUp || !grades.stepUp) return false;
        // ผ่าน = levelIndex >= 2 (ปานกลาง=2, ดี=3, ดีมาก=4)
        return grades.sitReach.levelIndex >= 2
            && grades.pushUp.levelIndex >= 2
            && grades.stepUp.levelIndex >= 2;
    },

    /**
     * Badge ผ่าน/ไม่ผ่าน
     * @param {boolean} passed
     * @returns {string} HTML
     */
    passBadge(passed) {
        if (passed) {
            return '<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500;background:#22c55e22;border:1px solid #22c55e40;color:#22c55e;">✓ ผ่าน</span>';
        } else {
            return '<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500;background:#ef444422;border:1px solid #ef444440;color:#ef4444;">✗ ไม่ผ่าน</span>';
        }
    },

    /**
     * ให้เกณฑ์พร้อม HTML badge
     * @param {string} level - 'ต่ำมาก', 'ต่ำ', 'ปานกลาง', 'ดี', 'ดีมาก'
     * @returns {string} HTML string
     */
    levelBadge(level) {
        if (!level) return '';
        const color = this.LEVEL_COLORS[level] || '#888';
        return `<span style="display:inline-flex;align-items:center;gap:3px;padding:1px 7px;border-radius:3px;font-size:10px;font-weight:300;background:${color}15;border:1px solid ${color}30;color:${color};">${level}</span>`;
    },
};

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FitnessGrading };
} else if (typeof window !== 'undefined') {
    window.FitnessGrading = FitnessGrading;
}
