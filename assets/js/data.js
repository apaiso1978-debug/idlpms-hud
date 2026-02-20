/**
 * IDLPMS - System Data Model
 * Primary data source for users, roles, and curriculum.
 * Encoding: UTF-8
 */

const IDLPMS_DATA = {
    // 7 Core Roles Definition
    roles: {
        STUDENT: {
            id: 'student',
            name: 'นักเรียน',
            icon: 'i-user',
            level: 'School',
            status: 'ONLINE',
            permissions: ['read_lessons', 'submit_work', 'view_grades'],
        },
        PARENT: {
            id: 'parent',
            name: 'ผู้ปกครอง',
            icon: 'i-users',
            level: 'School',
            permissions: ['view_student_progress', 'chat_teacher'],
        },
        TEACHER: {
            id: 'teacher',
            name: 'ครูผู้สอน',
            icon: 'i-academic',
            level: 'School',
            permissions: ['manage_classroom', 'grade_work', 'chat_students'],
        },
        SCHOOL_DIR: {
            id: 'school_dir',
            name: 'ผู้อำนวยการโรงเรียน',
            icon: 'i-office',
            level: 'School',
            permissions: ['manage_school', 'view_school_stats', 'approve_plans'],
        },
        ESA_DIR: {
            id: 'esa_dir',
            name: 'ผู้อำนวยการเขตพื้นที่ (ESA)',
            icon: 'i-building',
            level: 'District',
            permissions: ['view_district_stats', 'manage_district_schools'],
        },
        OBEC: {
            id: 'obec',
            name: 'เลขาธิการ สพฐ. (OBEC)',
            icon: 'i-library',
            level: 'National',
            permissions: ['view_national_stats', 'manage_policy'],
        },
        MOE: {
            id: 'moe',
            name: 'กระทรวงศึกษาธิการ (MOE)',
            icon: 'i-globe',
            level: 'National',
            permissions: ['full_system_access', 'national_analytics'],
        },
    },

    // --- Curriculum Structure (Static Decoupling for AppSheet Optimization) ---
    // This allows the HUD and Learning Flow to run without AppSheet Read operations for curriculum
    curriculum: {
        THAI: {
            name: 'ภาษาไทย',
            color: 'var(--sj-thai)',
            units: [
                {
                    name: 'วรรณคดีล้ำค่า',
                    lessons: [
                        { id: 'L_THAI_601', name: 'ขุนช้างขุนแผน ตอน กำเนิดพลายงาม', videoId: 'dQw4w9WgXcQ' },
                        { id: 'L_THAI_602', name: 'สุภาษิตสอนหญิง', videoId: 'dQw4w9WgXcQ' }
                    ]
                }
            ]
        },
        MATH: {
            name: 'คณิตศาสตร์',
            color: 'var(--sj-math)',
            units: [
                {
                    name: 'จำนวนนับและการบวก ลบ คูณ หาร',
                    lessons: [
                        { id: 'L_MATH_601', name: 'ห.ร.ม. และ ค.ร.น.', videoId: 'dQw4w9WgXcQ' },
                        { id: 'L_MATH_602', name: 'โจทย์ปัญหาการบวก ลบ คูณ หารระคน', videoId: 'dQw4w9WgXcQ' }
                    ]
                }
            ]
        },
        SCI: {
            name: 'วิทยาศาสตร์',
            color: 'var(--sj-sci)',
            units: [
                {
                    name: 'ร่างกายของเรา',
                    lessons: [
                        { id: 'L_SCI_601', name: 'สารอาหารและระบบย่อยอาหาร', videoId: 'dQw4w9WgXcQ' }
                    ]
                }
            ]
        }
    },

    // --- Hierarchical Structure (The Backbone) ---
    structure: {
        districts: {
            ESA_01: { id: 'ESA_01', name: 'สพป.ระยอง เขต 1', schools: ['SCH_001', 'SCH_002'] },
            ESA_02: { id: 'ESA_02', name: 'สพม.กรุงเทพมหานคร เขต 1', schools: ['SCH_003'] },
            ESA_03: { id: 'ESA_03', name: 'สพป.เชียงใหม่ เขต 1', schools: ['SCH_004'] },
            ESA_04: { id: 'ESA_04', name: 'สพป.ภูเก็ต', schools: ['SCH_005'] },
            ESA_05: { id: 'ESA_05', name: 'สพป.ขอนแก่น เขต 1', schools: ['SCH_006'] },
        },
        schools: {
            SCH_001: {
                id: 'SCH_001',
                name: 'โรงเรียนวิทยาบ้านเกิด',
                districtId: 'ESA_01',
                classes: ['1/1', '2/1', '3/1', '4/1', '5/1', '5/2', '6/1', '6/2'],
                scheduleStructure: {
                    daysPerWeek: 5,
                    periodsPerDay: 8,
                    lunchPeriod: 5
                },
                preAssignedSlots: [
                    { subjectId: 'PRAY', day: 5, period: 7 },   // ศุกร์ คาบ 6 (14:30): สวดมนต์
                    { subjectId: 'SCOUT', day: 3, period: 7 },  // พุธ คาบ 6 (14:30): ลูกเสือ
                    { subjectId: 'PLC', day: 2, period: 8 },    // อังคาร คาบ 7 (15:30): PLC (Reserve)
                    { subjectId: 'PLC', day: 4, period: 8 }     // พฤหัสบดี คาบ 7 (15:30): PLC (Reserve)
                ]
            },
            SCH_MABLUD: {
                id: 'SCH_MABLUD',
                name: 'โรงเรียนวัดมาบชลูด',
                districtId: 'ESA_01',
                classes: ['อนุบาล 2', 'อนุบาล 3', 'ป.1/1', 'ป.1/2', 'ป.2/1', 'ป.2/2', 'ป.3', 'ป.4/1', 'ป.4/2', 'ป.5/1', 'ป.5/2', 'ป.6/1', 'ป.6/2'],
                scheduleStructure: {
                    daysPerWeek: 5,
                    periodsPerDay: 8,
                    lunchPeriod: 5
                },
                preAssignedSlots: [
                    { subjectId: 'PRAY', day: 5, period: 7 },   // ศุกร์ คาบ 6 (14:30): สวดมนต์
                    { subjectId: 'SCOUT', day: 3, period: 7 },  // พุธ คาบ 6 (14:30): ลูกเสือ
                    { subjectId: 'PLC', day: 2, period: 8 },    // อังคาร คาบ 7 (15:30): PLC (Reserve)
                    { subjectId: 'PLC', day: 4, period: 8 }     // พฤหัสบดี คาบ 7 (15:30): PLC (Reserve)
                ]
            },
            SCH_002: {
                id: 'SCH_002',
                name: 'โรงเรียนเตรียมอุดม',
                districtId: 'ESA_01',
                classes: ['6/1'],
            },
            SCH_003: {
                id: 'SCH_003',
                name: 'โรงเรียนสตรีวิทยา',
                districtId: 'ESA_02',
                classes: ['6/1'],
            },
            SCH_004: {
                id: 'SCH_004',
                name: 'โรงเรียนอนุบาลเชียงใหม่',
                districtId: 'ESA_03',
                classes: ['6/1'],
            },
            SCH_005: {
                id: 'SCH_005',
                name: 'โรงเรียนภูเก็ตวิทยาลัย',
                districtId: 'ESA_04',
                classes: ['6/1'],
            },
            SCH_006: {
                id: 'SCH_006',
                name: 'โรงเรียนขอนแก่นวิทยายน',
                districtId: 'ESA_05',
                classes: ['6/1'],
            },
            SCH_007: {
                id: 'SCH_007',
                name: 'โรงเรียนวัดป่านาบุญ',
                districtId: 'ESA_01',
                classes: ['6/1'],
            },
            SCH_008: {
                id: 'SCH_008',
                name: 'โรงเรียนบ้านหนองใหญ่',
                districtId: 'ESA_01',
                classes: ['6/1'],
            },
            SCH_009: {
                id: 'SCH_009',
                name: 'โรงเรียนสว่างอารมณ์',
                districtId: 'ESA_01',
                classes: ['6/1'],
            },
            SCH_010: {
                id: 'SCH_010',
                name: 'โรงเรียนมิตรภาพไทย-เยอรมัน',
                districtId: 'ESA_01',
                classes: ['6/1'],
            },
            SCH_011: {
                id: 'SCH_011',
                name: 'โรงเรียนประชานุกูล',
                districtId: 'ESA_01',
                classes: ['6/1'],
            },
            SCH_012: {
                id: 'SCH_012',
                name: 'โรงเรียนดรุณศึกษา',
                districtId: 'ESA_01',
                classes: ['6/1'],
            },
            SCH_013: {
                id: 'SCH_013',
                name: 'โรงเรียนบ้านหนองบอน',
                districtId: 'ESA_01',
                classes: ['6/1'],
            },
            SCH_014: {
                id: 'SCH_014',
                name: 'โรงเรียนเมืองปักษ์',
                districtId: 'ESA_01',
                classes: ['6/1'],
            },
            SCH_015: {
                id: 'SCH_015',
                name: 'โรงเรียนไทยพัฒนา',
                districtId: 'ESA_01',
                classes: ['6/1'],
            },
            SCH_016: {
                id: 'SCH_016',
                name: 'โรงเรียนพุทธรักษา',
                districtId: 'ESA_01',
                classes: ['6/1'],
            },
            SCH_017: {
                id: 'SCH_017',
                name: 'โรงเรียนพัฒนาไทย',
                districtId: 'ESA_01',
                classes: ['6/1'],
            },
            SCH_018: {
                id: 'SCH_018',
                name: 'โรงเรียนสิริวัฒนา',
                districtId: 'ESA_01',
                classes: ['6/1'],
            },
            SCH_019: {
                id: 'SCH_019',
                name: 'โรงเรียนมานะศึกษา',
                districtId: 'ESA_01',
                classes: ['6/1'],
            },
            SCH_020: {
                id: 'SCH_020',
                name: 'โรงเรียนอรุณวิทย์',
                districtId: 'ESA_01',
                classes: ['6/1'],
            },
        },
    },

    // --- Subject & Activity Bank (หลักสูตรแกนกลาง 2551 ปรับปรุง 2560) ---
    subjects: {
        // 8 กลุ่มสาระ — วิชาพื้นฐาน
        THAI: { id: 'THAI', name: 'ภาษาไทย', color: '#60a5fa', type: 'CORE', periodsPerWeek: { 'ป.1': 5, 'ป.2': 5, 'ป.3': 5, 'ป.4': 4, 'ป.5': 4, 'ป.6': 4 } },
        MATH: { id: 'MATH', name: 'คณิตศาสตร์', color: '#f472b6', type: 'CORE', periodsPerWeek: { 'ป.1': 5, 'ป.2': 5, 'ป.3': 5, 'ป.4': 4, 'ป.5': 4, 'ป.6': 4 } },
        SCI: { id: 'SCI', name: 'วิทยาศาสตร์และเทคโนโลยี', color: '#34d399', type: 'CORE', periodsPerWeek: { 'ป.1': 2, 'ป.2': 2, 'ป.3': 2, 'ป.4': 2, 'ป.5': 2, 'ป.6': 2 } },
        SOC: { id: 'SOC', name: 'สังคมศึกษาฯ', color: '#fbbf24', type: 'CORE', periodsPerWeek: { 'ป.1': 3, 'ป.2': 3, 'ป.3': 3, 'ป.4': 3, 'ป.5': 3, 'ป.6': 3 } },
        PE: { id: 'PE', name: 'สุขศึกษาและพลศึกษา', color: '#f87171', type: 'CORE', periodsPerWeek: { 'ป.1': 2, 'ป.2': 2, 'ป.3': 2, 'ป.4': 2, 'ป.5': 2, 'ป.6': 2 } },
        ART: { id: 'ART', name: 'ศิลปะ', color: '#fb923c', type: 'CORE', periodsPerWeek: { 'ป.1': 2, 'ป.2': 2, 'ป.3': 2, 'ป.4': 2, 'ป.5': 2, 'ป.6': 2 } },
        WORK: { id: 'WORK', name: 'การงานอาชีพ', color: '#94a3b8', type: 'CORE', periodsPerWeek: { 'ป.1': 1, 'ป.2': 1, 'ป.3': 1, 'ป.4': 2, 'ป.5': 2, 'ป.6': 2 } },
        ENG: { id: 'ENG', name: 'ภาษาอังกฤษ', color: '#22d3ee', type: 'CORE', periodsPerWeek: { 'ป.1': 1, 'ป.2': 1, 'ป.3': 1, 'ป.4': 2, 'ป.5': 2, 'ป.6': 2 } },

        // วิชาเพิ่มเติม (โรงเรียนจัดเอง)
        THAI_PLUS: { id: 'THAI_PLUS', name: 'ภาษาไทยเสริม', color: '#93c5fd', type: 'EXTRA', periodsPerWeek: { 'ป.1': 2, 'ป.2': 2, 'ป.3': 2, 'ป.4': 1, 'ป.5': 1, 'ป.6': 1 } },
        MATH_PLUS: { id: 'MATH_PLUS', name: 'คณิตศาสตร์เสริม', color: '#f9a8d4', type: 'EXTRA', periodsPerWeek: { 'ป.1': 2, 'ป.2': 2, 'ป.3': 2, 'ป.4': 1, 'ป.5': 1, 'ป.6': 1 } },
        SCI_PLUS: { id: 'SCI_PLUS', name: 'วิทยาศาสตร์เสริม', color: '#6ee7b7', type: 'EXTRA', periodsPerWeek: { 'ป.1': 1, 'ป.2': 1, 'ป.3': 1, 'ป.4': 1, 'ป.5': 1, 'ป.6': 1 } },
        ENG_PLUS: { id: 'ENG_PLUS', name: 'ภาษาอังกฤษเสริม', color: '#67e8f9', type: 'EXTRA', periodsPerWeek: { 'ป.1': 1, 'ป.2': 1, 'ป.3': 1, 'ป.4': 1, 'ป.5': 1, 'ป.6': 1 } },
        ICT: { id: 'ICT', name: 'คอมพิวเตอร์', color: '#a78bfa', type: 'EXTRA', periodsPerWeek: { 'ป.1': 1, 'ป.2': 1, 'ป.3': 1, 'ป.4': 1, 'ป.5': 1, 'ป.6': 1 } },

        // กิจกรรมพัฒนาผู้เรียน + กิจกรรมพิเศษ
        RILS: { id: 'RILS', name: 'ลดเวลาเรียนเพิ่มเวลารู้', color: '#e879f9', type: 'ACTIVITY', periodsPerWeek: { 'ป.1': 2, 'ป.2': 2, 'ป.3': 2, 'ป.4': 2, 'ป.5': 2, 'ป.6': 2 } },
        SCOUT: { id: 'SCOUT', name: 'ลูกเสือ/เนตรนารี', color: '#a3e635', type: 'ACTIVITY', periodsPerWeek: { 'ป.1': 1, 'ป.2': 1, 'ป.3': 1, 'ป.4': 1, 'ป.5': 1, 'ป.6': 1 } },
        CLUB: { id: 'CLUB', name: 'ชุมนุม', color: '#fcd34d', type: 'ACTIVITY', periodsPerWeek: { 'ป.1': 1, 'ป.2': 1, 'ป.3': 1, 'ป.4': 1, 'ป.5': 1, 'ป.6': 1 } },
        GUIDE: { id: 'GUIDE', name: 'แนะแนว', color: '#5eead4', type: 'ACTIVITY', periodsPerWeek: { 'ป.1': 1, 'ป.2': 1, 'ป.3': 1, 'ป.4': 1, 'ป.5': 1, 'ป.6': 1 } },
        PRAY: { id: 'PRAY', name: 'สวดมนต์', color: '#fde68a', type: 'ACTIVITY', periodsPerWeek: { 'ป.1': 1, 'ป.2': 1, 'ป.3': 1, 'ป.4': 1, 'ป.5': 1, 'ป.6': 1 } },
        SOCIAL: { id: 'SOCIAL', name: 'กิจกรรมเพื่อสังคม', color: '#86efac', type: 'ACTIVITY', periodsPerWeek: { 'ป.1': 1, 'ป.2': 1, 'ป.3': 1, 'ป.4': 1, 'ป.5': 1, 'ป.6': 1 } },
        PLC: { id: 'PLC', name: 'PLC ชุมชนแห่งการเรียนรู้', color: '#c084fc', type: 'ACTIVITY', periodsPerWeek: {} },
    },

    // --- Task Templates for Director Push System ---
    taskTemplates: {
        FITNESS_TEST: {
            id: 'FITNESS_TEST',
            title: 'ทดสอบสมรรถภาพทางกาย',
            titleEN: 'Physical Fitness Test',
            icon: 'i-chart-bar',
            dataKey: 'fitness_results_v1',
            requiredFields: ['sitReach', 'pushUp', 'stepUp'],
            color: 'var(--sj-pe)',
            colorRgb: 'var(--sj-pe-rgb)',
        },
        HOME_VISIT: {
            id: 'HOME_VISIT',
            title: 'การเยี่ยมบ้านนักเรียน',
            titleEN: 'Home Visit Report',
            icon: 'i-home',
            dataKey: 'home_visit_v1',
            requiredFields: ['visited', 'notes'],
            color: 'var(--sj-work)',
            colorRgb: 'var(--sj-work-rgb)',
        },
        SDQ_SURVEY: {
            id: 'SDQ_SURVEY',
            title: 'แบบประเมินพฤติกรรม SDQ',
            titleEN: 'SDQ Behavior Assessment',
            icon: 'i-clipboard-document-list',
            dataKey: 'sdq_results_v1',
            requiredFields: ['sdqScore', 'category'],
            color: 'var(--sj-soc)',
            colorRgb: 'var(--sj-soc-rgb)',
        },
    },

    // Expanded 7-Role Mock Users (Explicitly Linked)
    users: {
        // ═══ โรงเรียนวัดมาบชลูด — ข้อมูลจริง ปีการศึกษา 2568 ═══
        // ═══ ผู้อำนวยการ ═══
        DIR_MABLUD: {
            role: 'SCHOOL_DIR',
            fullName: 'นายบุญเรือง ถ้ำมณี',
            name: 'ผอ.โรงเรียนวัดมาบชลูด',
            org: 'โรงเรียนวัดมาบชลูด สพป.ระยอง เขต 1',
            schoolId: 'SCH_MABLUD',
            districtId: 'ESA_01',
            avatar: 'BT',
            color: 'id-dir',
            status: 'ONLINE',
        },
        // ═══ ครูพิเศษ / Developer / Admin / Founder ═══
        TEA_WORACHAI: {
            role: 'TEACHER',
            fullName: 'นายวรชัย อภัยโส',
            schoolId: 'SCH_MABLUD',
            avatar: 'WA',
            color: 'id-dir',
            specialRoles: ['SPECIAL_TEACHER', 'DEVELOPER', 'ADMIN', 'FOUNDER'],
            email: 'Apaiso1978@gmail.com',
            credentials: { email: 'Apaiso1978@gmail.com', password: 'Yuri@04032526' },
            canTeachSubjects: ['ICT', 'SCI', 'SCI_PLUS', 'GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            workloadRoles: ['system_admin', 'developer', 'founder'],
            status: 'ONLINE',
        },
        // ═══ ครูประจำชั้น (14 คน) ═══
        TEA_M_01: {
            role: 'TEACHER', fullName: 'นางนิติพร โฆเกียรติมานนท์', schoolId: 'SCH_MABLUD', avatar: 'นโ', color: 'sj-thai',
            homeroomClass: 'อนุบาล 2', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            canTeachSubjects: ['GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            workloadRoles: ['homeroom'],
        },
        TEA_M_02: {
            role: 'TEACHER', fullName: 'นางสุภาภรณ์ ชุ่มแอ่น', schoolId: 'SCH_MABLUD', avatar: 'สช', color: 'sj-math',
            homeroomClass: 'อนุบาล 3', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            canTeachSubjects: ['GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            workloadRoles: ['homeroom'],
        },
        TEA_M_03: {
            role: 'TEACHER', fullName: 'นางสาวรัตนาวลี ทิศเสถียร', schoolId: 'SCH_MABLUD', avatar: 'สท', color: 'sj-sci',
            homeroomClass: 'ป.1/1', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            canTeachSubjects: ['GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            workloadRoles: ['homeroom'],
        },
        TEA_M_04: {
            role: 'TEACHER', fullName: 'นางสาวริศรา แก้วเคน', schoolId: 'SCH_MABLUD', avatar: 'สแ', color: 'sj-soc',
            homeroomClass: 'ป.1/2', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            canTeachSubjects: ['GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            workloadRoles: ['homeroom'],
        },
        TEA_M_05: {
            role: 'TEACHER', fullName: 'นางสาววาสนา ปะทะนมปีย์', schoolId: 'SCH_MABLUD', avatar: 'สป', color: 'sj-pe',
            homeroomClass: 'ป.2/1', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            canTeachSubjects: ['GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            workloadRoles: ['homeroom'],
        },
        TEA_M_06: {
            role: 'TEACHER', fullName: 'นางสาวพิมพร สาตรา', schoolId: 'SCH_MABLUD', avatar: 'สส', color: 'sj-art',
            homeroomClass: 'ป.2/2', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            canTeachSubjects: ['GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            workloadRoles: ['homeroom'],
        },
        TEA_M_07: {
            role: 'TEACHER', fullName: 'นางสาวเจนจิรา มั่นหมาย', schoolId: 'SCH_MABLUD', avatar: 'สม', color: 'sj-eng',
            homeroomClass: 'ป.3', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            canTeachSubjects: ['GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            workloadRoles: ['homeroom'],
        },
        TEA_M_08: {
            role: 'TEACHER', fullName: 'นางสาวสุนิษา สองสี', schoolId: 'SCH_MABLUD', avatar: 'สส', color: 'sj-thai',
            homeroomClass: 'ป.3', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            canTeachSubjects: ['GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            workloadRoles: ['homeroom'],
        },
        TEA_M_09: {
            role: 'TEACHER', fullName: 'นายณัฐนนท์ มหาเสน', schoolId: 'SCH_MABLUD', avatar: 'ณม', color: 'sj-math',
            homeroomClass: 'ป.4/1', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            canTeachSubjects: ['GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            workloadRoles: ['homeroom'],
        },
        TEA_M_10: {
            role: 'TEACHER', fullName: 'นางสาววิชุดา บุญเฟรือง', schoolId: 'SCH_MABLUD', avatar: 'สบ', color: 'sj-sci',
            homeroomClass: 'ป.4/2', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            canTeachSubjects: ['GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            workloadRoles: ['homeroom'],
        },
        TEA_M_11: {
            role: 'TEACHER', fullName: 'นายธิติพงศ์ ขจรภพ', schoolId: 'SCH_MABLUD', avatar: 'ธข', color: 'sj-soc',
            homeroomClass: 'ป.4/2', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            canTeachSubjects: ['GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            workloadRoles: ['homeroom'],
        },
        TEA_M_12: {
            role: 'TEACHER', fullName: 'นายภานุวัฒน์ สุวรรณมาโจ', schoolId: 'SCH_MABLUD', avatar: 'ภส', color: 'sj-pe',
            homeroomClass: 'ป.5/1', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            canTeachSubjects: ['GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            workloadRoles: ['homeroom'],
        },
        TEA_M_13: {
            role: 'TEACHER', fullName: 'นายยุทธนา คุณอุตส่าห์', schoolId: 'SCH_MABLUD', avatar: 'ยค', color: 'sj-art',
            homeroomClass: 'ป.5/2', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            canTeachSubjects: ['GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            workloadRoles: ['homeroom'],
        },
        TEA_M_14: {
            role: 'TEACHER', fullName: 'นายวุฒิไกร ปุรินัย', schoolId: 'SCH_MABLUD', avatar: 'วป', color: 'sj-eng',
            homeroomClass: 'ป.6/1', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            canTeachSubjects: ['GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            workloadRoles: ['homeroom'],
        },
        TEA_M_15: {
            role: 'TEACHER', fullName: 'นางสาวแพรวพรรณ สมพงษ์', schoolId: 'SCH_MABLUD', avatar: 'สส', color: 'sj-thai',
            homeroomClass: 'ป.6/2', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            canTeachSubjects: ['GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            workloadRoles: ['homeroom'],
        },
        // ═══ อนุบาล 2 (30 คน) ═══
        STU_M_001: { role: 'STUDENT', fullName: 'เด็กชายกิตติพงษ์ อินทรฉ่ำ', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'กอ', color: 'cyan', insforgeStudentCode: '6703', citizenId: '1219700139677' },
        STU_M_002: { role: 'STUDENT', fullName: 'เด็กชายฉัตรชนก สนิทแสง', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'ฉส', color: 'cyan', insforgeStudentCode: '6704', citizenId: '1200901996846' },
        STU_M_003: { role: 'STUDENT', fullName: 'เด็กชายชนะศักดิ์ พรมทัต', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'ชพ', color: 'cyan', insforgeStudentCode: '6705', citizenId: '1219901813481' },
        STU_M_004: { role: 'STUDENT', fullName: 'เด็กชายฐาปกรณ์ รัตนวาร', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'ฐร', color: 'cyan', insforgeStudentCode: '6706', citizenId: '1209001194661' },
        STU_M_005: { role: 'STUDENT', fullName: 'เด็กชายไตรนรินทร์ จันทร์ดากุล', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'ไจ', color: 'cyan', insforgeStudentCode: '6707', citizenId: '1219901821114', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_006: { role: 'STUDENT', fullName: 'เด็กชายธนกร บุญเทศ', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'ธบ', color: 'cyan', insforgeStudentCode: '6708', citizenId: '1209301371223' },
        STU_M_007: { role: 'STUDENT', fullName: 'เด็กชายธนกฤต เจริญรัตน์', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'ธเ', color: 'cyan', insforgeStudentCode: '6709', citizenId: '1219700165953' },
        STU_M_008: { role: 'STUDENT', fullName: 'เด็กชายธนภัทร ใจตา', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'ธใ', color: 'cyan', insforgeStudentCode: '6710', citizenId: '1219700157144', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_009: { role: 'STUDENT', fullName: 'เด็กชายวราศัย สุวรรณปักษิณ', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'วส', color: 'cyan', insforgeStudentCode: '6711', citizenId: '1209301368087' },
        STU_M_010: { role: 'STUDENT', fullName: 'เด็กหญิงกัญญ์จิรา บริบุญวงศ์', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'กบ', color: 'cyan', insforgeStudentCode: '6712', citizenId: '1219700157799' },
        STU_M_011: { role: 'STUDENT', fullName: 'เด็กหญิงขนมหวาน ดอกไม้ขาว', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'ขด', color: 'cyan', insforgeStudentCode: '6713', citizenId: '1208400018288' },
        STU_M_012: { role: 'STUDENT', fullName: 'เด็กหญิงชุติกาญจน์ สุขศรี', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'ชส', color: 'cyan', insforgeStudentCode: '6714', citizenId: '1219700160544' },
        STU_M_013: { role: 'STUDENT', fullName: 'เด็กหญิงณัชชา แก้วลือชา', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'ณแ', color: 'cyan', insforgeStudentCode: '6715', citizenId: '1219700161362' },
        STU_M_014: { role: 'STUDENT', fullName: 'เด็กหญิงภัทรพร กองดี', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'ภก', color: 'cyan', insforgeStudentCode: '6716', citizenId: '1200901983701' },
        STU_M_015: { role: 'STUDENT', fullName: 'เด็กหญิงวรรณภา ไชยเดช', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'วไ', color: 'cyan', insforgeStudentCode: '6717', citizenId: '1200901983086' },
        STU_M_016: { role: 'STUDENT', fullName: 'เด็กหญิงมีบุญ ศรีวิรัตน์', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'มศ', color: 'cyan', insforgeStudentCode: '6718', citizenId: '1249901318439' },
        STU_M_017: { role: 'STUDENT', fullName: 'เด็กหญิงเขมิสรา มีอยู่สามเสน', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'เม', color: 'cyan', insforgeStudentCode: '6719', citizenId: '1849903036117', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_018: { role: 'STUDENT', fullName: 'เด็กหญิงณัฐนภา สำเภาเงิน', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'ณส', color: 'cyan', insforgeStudentCode: '6720', citizenId: '1219700162041' },
        STU_M_019: { role: 'STUDENT', fullName: 'เด็กชายระยอง โอม', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'รโ', color: 'cyan', insforgeStudentCode: '6721', citizenId: '0021981062866' },
        STU_M_020: { role: 'STUDENT', fullName: 'เด็กชายกฤติเดช บุญเจริญ', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'กบ', color: 'cyan', insforgeStudentCode: '6738', citizenId: '1219700159082', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_021: { role: 'STUDENT', fullName: 'เด็กชายศุภวัฒน์ สนตะเถน', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'ศส', color: 'cyan', insforgeStudentCode: '6749', citizenId: '1219400087272', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_022: { role: 'STUDENT', fullName: 'เด็กชายวีรภัทร อุฤทธิ์', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'วอ', color: 'cyan', insforgeStudentCode: '6729', citizenId: '1139600970456' },
        STU_M_023: { role: 'STUDENT', fullName: 'เด็กชายชานนท์', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'ช', color: 'cyan', insforgeStudentCode: '6641', citizenId: '0021971114499' },
        STU_M_024: { role: 'STUDENT', fullName: 'เด็กหญิงมะนะเวเนียนโม', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'ม', color: 'cyan', insforgeStudentCode: '6752', citizenId: 'G682100012627' },
        STU_M_025: { role: 'STUDENT', fullName: 'เด็กหญิงสุรัตน์ดา ลดุลพันธ์', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'สล', color: 'cyan', insforgeStudentCode: '6756', citizenId: '1349902351315', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_026: { role: 'STUDENT', fullName: 'เด็กหญิงสุธาสินี ดวงแก้ว', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'สด', color: 'cyan', insforgeStudentCode: '6760', citizenId: '1209602176144' },
        STU_M_027: { role: 'STUDENT', fullName: 'เด็กหญิงปทิตา แก้วนิ่ม', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'ปแ', color: 'cyan', insforgeStudentCode: '6768', citizenId: '1219901846575' },
        STU_M_028: { role: 'STUDENT', fullName: 'เด็กหญิงณัฏณิชา ซาเฟื้อย', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'ณซ', color: 'cyan', insforgeStudentCode: '6770', citizenId: '1219700159503' },
        STU_M_029: { role: 'STUDENT', fullName: 'เด็กชายดิน', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'ด', color: 'cyan', insforgeStudentCode: '', citizenId: '0021971126250' },
        STU_M_030: { role: 'STUDENT', fullName: 'เด็กหญิงศริญญา สุขราช', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 2', gradeLevel: 0, avatar: 'ศส', color: 'cyan', insforgeStudentCode: '', citizenId: '1219901857267' },
        // ═══ อนุบาล 3 (26 คน) ═══
        STU_M_031: { role: 'STUDENT', fullName: 'เด็กชายณัฐสุพัฒน์ สุพล', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'ณส', color: 'cyan', insforgeStudentCode: '6635', citizenId: '1219901771753' },
        STU_M_032: { role: 'STUDENT', fullName: 'เด็กชายกรวีร์ อินทอง', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'กอ', color: 'cyan', insforgeStudentCode: '6637', citizenId: '1200901944986' },
        STU_M_033: { role: 'STUDENT', fullName: 'เด็กชายนิธิพงศ์ ศรีสกล', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'นศ', color: 'cyan', insforgeStudentCode: '6638', citizenId: '1219700149249', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_034: { role: 'STUDENT', fullName: 'เด็กชายไมยราพ พรมเสน', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'ไพ', color: 'cyan', insforgeStudentCode: '6639', citizenId: '1219901775741' },
        STU_M_035: { role: 'STUDENT', fullName: 'เด็กหญิงรัตนากร ทองแสน', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'รท', color: 'cyan', insforgeStudentCode: '6645', citizenId: '1219700143861' },
        STU_M_036: { role: 'STUDENT', fullName: 'เด็กชายฐิติพัชร สุวรรณโชติ', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'ฐส', color: 'cyan', insforgeStudentCode: '6647', citizenId: '1200901965452' },
        STU_M_037: { role: 'STUDENT', fullName: 'เด็กหญิงปิยะดา สาริยง', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'ปส', color: 'cyan', insforgeStudentCode: '6648', citizenId: '1219700139944' },
        STU_M_038: { role: 'STUDENT', fullName: 'เด็กหญิงรัดเกล้า สวัสดิ์แสน', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'รส', color: 'cyan', insforgeStudentCode: '6649', citizenId: '1219700144999' },
        STU_M_039: { role: 'STUDENT', fullName: 'เด็กหญิงนิรดา วรรณโคตร', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'นว', color: 'cyan', insforgeStudentCode: '6650', citizenId: '1200901942037' },
        STU_M_040: { role: 'STUDENT', fullName: 'เด็กหญิงอริสรา พิลากรณ์', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'อพ', color: 'cyan', insforgeStudentCode: '6651', citizenId: '1332000045761', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_041: { role: 'STUDENT', fullName: 'เด็กหญิงลลิล ประเสริฐศิลป์', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'ลป', color: 'cyan', insforgeStudentCode: '6652', citizenId: '1219700147564' },
        STU_M_042: { role: 'STUDENT', fullName: 'เด็กหญิงนิระดา วันทะวงษ์', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'นว', color: 'cyan', insforgeStudentCode: '6655', citizenId: '1249901268008', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_043: { role: 'STUDENT', fullName: 'เด็กหญิงภาวิดา สุกรา', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'ภส', color: 'cyan', insforgeStudentCode: '6656', citizenId: '1200901961872' },
        STU_M_044: { role: 'STUDENT', fullName: 'เด็กหญิงธนพร ศรีราทา', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'ธศ', color: 'cyan', insforgeStudentCode: '6657', citizenId: '1339100169868' },
        STU_M_045: { role: 'STUDENT', fullName: 'เด็กหญิงชลธิชา มณีรัตน์', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'ชม', color: 'cyan', insforgeStudentCode: '6683', citizenId: '1219700147866' },
        STU_M_046: { role: 'STUDENT', fullName: 'เด็กหญิงชลิตา กายยาคำ', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'ชก', color: 'cyan', insforgeStudentCode: '6685', citizenId: '1347900063531', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_047: { role: 'STUDENT', fullName: 'เด็กชายภูษิต วงเวียน', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'ภว', color: 'cyan', insforgeStudentCode: '6691', citizenId: '1219700154196' },
        STU_M_048: { role: 'STUDENT', fullName: 'เด็กชายสงกรานต์ โสภา', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'สโ', color: 'cyan', insforgeStudentCode: '6692', citizenId: '1729901154849' },
        STU_M_049: { role: 'STUDENT', fullName: 'เด็กหญิงรัตนกร นาหัวนิล', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'รน', color: 'cyan', insforgeStudentCode: '6696', citizenId: '1219700146240' },
        STU_M_050: { role: 'STUDENT', fullName: 'เด็กชายชนาธิป รักกลาง', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'ชร', color: 'cyan', insforgeStudentCode: '6697', citizenId: '1218700072261', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_051: { role: 'STUDENT', fullName: 'เด็กชายสุรธัช ยอดขาว', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'สย', color: 'cyan', insforgeStudentCode: '6723', citizenId: '1200901950846' },
        STU_M_052: { role: 'STUDENT', fullName: 'เด็กชายกิตติพัฒน์ ดียางหวาย', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'กด', color: 'cyan', insforgeStudentCode: '6724', citizenId: '1567700170952', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_053: { role: 'STUDENT', fullName: 'เด็กชายอาทิตย์ สุจะวี', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'อส', color: 'cyan', insforgeStudentCode: '6739', citizenId: '1348600118919' },
        STU_M_054: { role: 'STUDENT', fullName: 'เด็กชายอชิตพล ทรงกิตติกุล', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'อท', color: 'cyan', insforgeStudentCode: '6744', citizenId: '1638900122200', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_055: { role: 'STUDENT', fullName: 'เด็กหญิงมลฤดี อยู่ลือ', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'มอ', color: 'cyan', insforgeStudentCode: '6722', citizenId: '1639800611552' },
        STU_M_056: { role: 'STUDENT', fullName: 'เด็กหญิงฐานิดา แจ่มผล', schoolId: 'SCH_MABLUD', classId: 'อนุบาล 3', gradeLevel: 0, avatar: 'ฐแ', color: 'cyan', insforgeStudentCode: '6764', citizenId: '1219700144166' },
        // ═══ ป.1/1 (18 คน) ═══
        STU_M_057: { role: 'STUDENT', fullName: 'เด็กชายกฤติเดช เย็นกล่ำ', schoolId: 'SCH_MABLUD', classId: 'ป.1/1', gradeLevel: 1, avatar: 'กเ', color: 'cyan', insforgeStudentCode: '6531', citizenId: '1669900871092', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_058: { role: 'STUDENT', fullName: 'เด็กชายณัฐกร ศรีจันทร์', schoolId: 'SCH_MABLUD', classId: 'ป.1/1', gradeLevel: 1, avatar: 'ณศ', color: 'cyan', insforgeStudentCode: '6532', citizenId: '1219700123738' },
        STU_M_059: { role: 'STUDENT', fullName: 'เด็กชายพศวัฒน์ บัวกระท้อนแก้ว', schoolId: 'SCH_MABLUD', classId: 'ป.1/1', gradeLevel: 1, avatar: 'พบ', color: 'cyan', insforgeStudentCode: '6535', citizenId: '1219700137208' },
        STU_M_060: { role: 'STUDENT', fullName: 'เด็กหญิงกัญจน์ณิชา บริบุญวงศ์', schoolId: 'SCH_MABLUD', classId: 'ป.1/1', gradeLevel: 1, avatar: 'กบ', color: 'cyan', insforgeStudentCode: '6545', citizenId: '1219700132907' },
        STU_M_061: { role: 'STUDENT', fullName: 'เด็กหญิงจิราภา ชื่นอรุณสิน', schoolId: 'SCH_MABLUD', classId: 'ป.1/1', gradeLevel: 1, avatar: 'จช', color: 'cyan', insforgeStudentCode: '6548', citizenId: '1279900653111', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_062: { role: 'STUDENT', fullName: 'เด็กหญิงณภาวัลย์ ยุงกุล', schoolId: 'SCH_MABLUD', classId: 'ป.1/1', gradeLevel: 1, avatar: 'ณย', color: 'cyan', insforgeStudentCode: '6549', citizenId: '1219700127083' },
        STU_M_063: { role: 'STUDENT', fullName: 'เด็กหญิงณิชาภัทร ศรีสุข', schoolId: 'SCH_MABLUD', classId: 'ป.1/1', gradeLevel: 1, avatar: 'ณศ', color: 'cyan', insforgeStudentCode: '6550', citizenId: '1219700131722' },
        STU_M_064: { role: 'STUDENT', fullName: 'เด็กหญิงวริศรา ชมชิด', schoolId: 'SCH_MABLUD', classId: 'ป.1/1', gradeLevel: 1, avatar: 'วช', color: 'cyan', insforgeStudentCode: '6556', citizenId: '1219901729781' },
        STU_M_065: { role: 'STUDENT', fullName: 'เด็กชายธีรภัทร สืบพันธุ์', schoolId: 'SCH_MABLUD', classId: 'ป.1/1', gradeLevel: 1, avatar: 'ธส', color: 'cyan', insforgeStudentCode: '6625', citizenId: '1219901756932' },
        STU_M_066: { role: 'STUDENT', fullName: 'เด็กหญิงกุลณดา อ่อนอ้วน', schoolId: 'SCH_MABLUD', classId: 'ป.1/1', gradeLevel: 1, avatar: 'กอ', color: 'cyan', insforgeStudentCode: '6646', citizenId: '1219700130068' },
        STU_M_067: { role: 'STUDENT', fullName: 'เด็กชายภาณุพงศ์ คุณพรม', schoolId: 'SCH_MABLUD', classId: 'ป.1/1', gradeLevel: 1, avatar: 'ภค', color: 'cyan', insforgeStudentCode: '6725', citizenId: '1219700131439' },
        STU_M_068: { role: 'STUDENT', fullName: 'เด็กชายสุรศักดิ์ หูตาชัย', schoolId: 'SCH_MABLUD', classId: 'ป.1/1', gradeLevel: 1, avatar: 'สห', color: 'cyan', insforgeStudentCode: '6726', citizenId: '1219901746511' },
        STU_M_069: { role: 'STUDENT', fullName: 'เด็กชายกมล', schoolId: 'SCH_MABLUD', classId: 'ป.1/1', gradeLevel: 1, avatar: 'ก', color: 'cyan', insforgeStudentCode: '6727', citizenId: '0021971113140' },
        STU_M_070: { role: 'STUDENT', fullName: 'เด็กหญิงแก้ว', schoolId: 'SCH_MABLUD', classId: 'ป.1/1', gradeLevel: 1, avatar: 'แ', color: 'cyan', insforgeStudentCode: '6546', citizenId: '7219700015349' },
        STU_M_071: { role: 'STUDENT', fullName: 'เด็กชายหม่อง ตี หะ จอ', schoolId: 'SCH_MABLUD', classId: 'ป.1/1', gradeLevel: 1, avatar: 'หต', color: 'cyan', insforgeStudentCode: '6728', citizenId: 'G682100006511' },
        STU_M_072: { role: 'STUDENT', fullName: 'เด็กหญิงณัฐวรรณ สามารถ', schoolId: 'SCH_MABLUD', classId: 'ป.1/1', gradeLevel: 1, avatar: 'ณส', color: 'cyan', insforgeStudentCode: '6700', citizenId: '1219700129001' },
        STU_M_073: { role: 'STUDENT', fullName: 'เด็กหญิงสุนิษา แสนสุข', schoolId: 'SCH_MABLUD', classId: 'ป.1/1', gradeLevel: 1, avatar: 'สแ', color: 'cyan', insforgeStudentCode: '6750', citizenId: '1499900860483' },
        STU_M_074: { role: 'STUDENT', fullName: 'เด็กชายชยางกูร ศิริสมบัติ', schoolId: 'SCH_MABLUD', classId: 'ป.1/1', gradeLevel: 1, avatar: 'ชศ', color: 'cyan', insforgeStudentCode: '6765', citizenId: '1219400079962' },
        // ═══ ป.1/2 (17 คน) ═══
        STU_M_075: { role: 'STUDENT', fullName: 'เด็กชายพิสิทธ์ ซน', schoolId: 'SCH_MABLUD', classId: 'ป.1/2', gradeLevel: 1, avatar: 'พซ', color: 'cyan', insforgeStudentCode: '6381', citizenId: 'G631900007139', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_076: { role: 'STUDENT', fullName: 'เด็กชายเตวินน์ เบ็ญจาภรณ์', schoolId: 'SCH_MABLUD', classId: 'ป.1/2', gradeLevel: 1, avatar: 'เเ', color: 'cyan', insforgeStudentCode: '6533', citizenId: '1219700136953' },
        STU_M_077: { role: 'STUDENT', fullName: 'เด็กชายปุณศักดิ์ เจี๊ยะจิ๋ว', schoolId: 'SCH_MABLUD', classId: 'ป.1/2', gradeLevel: 1, avatar: 'ปเ', color: 'cyan', insforgeStudentCode: '6534', citizenId: '1368100135679', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_078: { role: 'STUDENT', fullName: 'เด็กชายภานุวัฒน์ พันธ์ศรี', schoolId: 'SCH_MABLUD', classId: 'ป.1/2', gradeLevel: 1, avatar: 'ภพ', color: 'cyan', insforgeStudentCode: '6536', citizenId: '1219700137607' },
        STU_M_079: { role: 'STUDENT', fullName: 'เด็กชายศรนารายณ์ แจ่มกระจ่าง', schoolId: 'SCH_MABLUD', classId: 'ป.1/2', gradeLevel: 1, avatar: 'ศแ', color: 'cyan', insforgeStudentCode: '6539', citizenId: '1218700071346' },
        STU_M_080: { role: 'STUDENT', fullName: 'เด็กชายอัฐพร ศรีบุญเรือง', schoolId: 'SCH_MABLUD', classId: 'ป.1/2', gradeLevel: 1, avatar: 'อศ', color: 'cyan', insforgeStudentCode: '6543', citizenId: '1219901745396' },
        STU_M_081: { role: 'STUDENT', fullName: 'เด็กหญิงปริชญา คงสุขมาก', schoolId: 'SCH_MABLUD', classId: 'ป.1/2', gradeLevel: 1, avatar: 'ปค', color: 'cyan', insforgeStudentCode: '6552', citizenId: '1219700127211' },
        STU_M_082: { role: 'STUDENT', fullName: 'เด็กหญิงปรีย์วรา ใจมา', schoolId: 'SCH_MABLUD', classId: 'ป.1/2', gradeLevel: 1, avatar: 'ปใ', color: 'cyan', insforgeStudentCode: '6553', citizenId: '1219700138514' },
        STU_M_083: { role: 'STUDENT', fullName: 'เด็กหญิงปารวี วงศ์อ่อน', schoolId: 'SCH_MABLUD', classId: 'ป.1/2', gradeLevel: 1, avatar: 'ปว', color: 'cyan', insforgeStudentCode: '6554', citizenId: '1347300034336' },
        STU_M_084: { role: 'STUDENT', fullName: 'เด็กหญิงจิรภา นูลาภ', schoolId: 'SCH_MABLUD', classId: 'ป.1/2', gradeLevel: 1, avatar: 'จน', color: 'cyan', insforgeStudentCode: '6567', citizenId: '1219700130777' },
        STU_M_085: { role: 'STUDENT', fullName: 'เด็กชายณัฐภัทร จันทร์ดวง', schoolId: 'SCH_MABLUD', classId: 'ป.1/2', gradeLevel: 1, avatar: 'ณจ', color: 'cyan', insforgeStudentCode: '6644', citizenId: '1219700134047' },
        STU_M_086: { role: 'STUDENT', fullName: 'เด็กชายพันทิวา โพยนอก', schoolId: 'SCH_MABLUD', classId: 'ป.1/2', gradeLevel: 1, avatar: 'พโ', color: 'cyan', insforgeStudentCode: '6730', citizenId: '1269900613046' },
        STU_M_087: { role: 'STUDENT', fullName: 'เด็กชายศรายุทธ ประคองศักดิ์', schoolId: 'SCH_MABLUD', classId: 'ป.1/2', gradeLevel: 1, avatar: 'ศป', color: 'cyan', insforgeStudentCode: '6538', citizenId: '1219700136015' },
        STU_M_088: { role: 'STUDENT', fullName: 'เด็กหญิงมิ ลิน ซัน', schoolId: 'SCH_MABLUD', classId: 'ป.1/2', gradeLevel: 1, avatar: 'มล', color: 'cyan', insforgeStudentCode: '6732', citizenId: 'G682100006791' },
        STU_M_089: { role: 'STUDENT', fullName: 'เด็กหญิงชญานี นาวัด', schoolId: 'SCH_MABLUD', classId: 'ป.1/2', gradeLevel: 1, avatar: 'ชน', color: 'cyan', insforgeStudentCode: '6748', citizenId: '0024851001614', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_090: { role: 'STUDENT', fullName: 'เด็กชายกันตภัทร์ คงทา', schoolId: 'SCH_MABLUD', classId: 'ป.1/2', gradeLevel: 1, avatar: 'กค', color: 'cyan', insforgeStudentCode: '6753', citizenId: '1219700126788' },
        STU_M_091: { role: 'STUDENT', fullName: 'เด็กชายพีรพล คำจันทร์', schoolId: 'SCH_MABLUD', classId: 'ป.1/2', gradeLevel: 1, avatar: 'พค', color: 'cyan', insforgeStudentCode: '6762', citizenId: '1409904723847' },
        // ═══ ป.2/1 (20 คน) ═══
        STU_M_092: { role: 'STUDENT', fullName: 'เด็กชายกิตติกร ทับแสง', schoolId: 'SCH_MABLUD', classId: 'ป.2/1', gradeLevel: 2, avatar: 'กท', color: 'cyan', insforgeStudentCode: '6424', citizenId: '1219700119391' },
        STU_M_093: { role: 'STUDENT', fullName: 'เด็กชายไทวัน บุนทะวง', schoolId: 'SCH_MABLUD', classId: 'ป.2/1', gradeLevel: 2, avatar: 'ไบ', color: 'cyan', insforgeStudentCode: '6426', citizenId: 'G652100000645' },
        STU_M_094: { role: 'STUDENT', fullName: 'เด็กชายธนกฤต แก้วเกตุสังข์', schoolId: 'SCH_MABLUD', classId: 'ป.2/1', gradeLevel: 2, avatar: 'ธแ', color: 'cyan', insforgeStudentCode: '6427', citizenId: '1219901696042' },
        STU_M_095: { role: 'STUDENT', fullName: 'เด็กชายอนาวินทร์ แสนเทพ', schoolId: 'SCH_MABLUD', classId: 'ป.2/1', gradeLevel: 2, avatar: 'อแ', color: 'cyan', insforgeStudentCode: '6435', citizenId: '1417100146865' },
        STU_M_096: { role: 'STUDENT', fullName: 'เด็กหญิงนฤมล พลเมืองนิตย์', schoolId: 'SCH_MABLUD', classId: 'ป.2/1', gradeLevel: 2, avatar: 'นพ', color: 'cyan', insforgeStudentCode: '6438', citizenId: '1219700123975' },
        STU_M_097: { role: 'STUDENT', fullName: 'เด็กชายทินภัทร ศรีบุญ', schoolId: 'SCH_MABLUD', classId: 'ป.2/1', gradeLevel: 2, avatar: 'ทศ', color: 'cyan', insforgeStudentCode: '6451', citizenId: '1219901719891' },
        STU_M_098: { role: 'STUDENT', fullName: 'เด็กหญิงตะวันฉาย คำเงิน', schoolId: 'SCH_MABLUD', classId: 'ป.2/1', gradeLevel: 2, avatar: 'ตค', color: 'cyan', insforgeStudentCode: '6472', citizenId: '1219700117461' },
        STU_M_099: { role: 'STUDENT', fullName: 'เด็กหญิงวาสนา พรมทัต', schoolId: 'SCH_MABLUD', classId: 'ป.2/1', gradeLevel: 2, avatar: 'วพ', color: 'cyan', insforgeStudentCode: '6491', citizenId: '1219700124122' },
        STU_M_100: { role: 'STUDENT', fullName: 'เด็กชายอดิเทพ ห้วยศิลา', schoolId: 'SCH_MABLUD', classId: 'ป.2/1', gradeLevel: 2, avatar: 'อห', color: 'cyan', insforgeStudentCode: '6522', citizenId: '1219901720121' },
        STU_M_101: { role: 'STUDENT', fullName: 'เด็กชายภัทรพล วาสรัต', schoolId: 'SCH_MABLUD', classId: 'ป.2/1', gradeLevel: 2, avatar: 'ภว', color: 'cyan', insforgeStudentCode: '6577', citizenId: '1219400078702' },
        STU_M_102: { role: 'STUDENT', fullName: 'เด็กหญิงศุภิสรา งันปัญญา', schoolId: 'SCH_MABLUD', classId: 'ป.2/1', gradeLevel: 2, avatar: 'ศง', color: 'cyan', insforgeStudentCode: '6579', citizenId: '1219901722370' },
        STU_M_103: { role: 'STUDENT', fullName: 'เด็กชายหม่อง อ่องไหน่ง์', schoolId: 'SCH_MABLUD', classId: 'ป.2/1', gradeLevel: 2, avatar: 'หอ', color: 'cyan', insforgeStudentCode: '6542', citizenId: 'G662100005612' },
        STU_M_104: { role: 'STUDENT', fullName: 'เด็กหญิงสมิตานัน แจ่มจำรัส', schoolId: 'SCH_MABLUD', classId: 'ป.2/1', gradeLevel: 2, avatar: 'สแ', color: 'cyan', insforgeStudentCode: '6661', citizenId: '1200901866187' },
        STU_M_105: { role: 'STUDENT', fullName: 'เด็กชายกันต์นภัส ศรีสุข', schoolId: 'SCH_MABLUD', classId: 'ป.2/1', gradeLevel: 2, avatar: 'กศ', color: 'cyan', insforgeStudentCode: '6679', citizenId: '1209703100305' },
        STU_M_106: { role: 'STUDENT', fullName: 'เด็กชายเชท ซุน', schoolId: 'SCH_MABLUD', classId: 'ป.2/1', gradeLevel: 2, avatar: 'เซ', color: 'cyan', insforgeStudentCode: '6688', citizenId: 'G672100012074' },
        STU_M_107: { role: 'STUDENT', fullName: 'เด็กหญิงพิมพ์ประภัทร์ สำราญพันธ์', schoolId: 'SCH_MABLUD', classId: 'ป.2/1', gradeLevel: 2, avatar: 'พส', color: 'cyan', insforgeStudentCode: '6574', citizenId: '1679901023184', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_108: { role: 'STUDENT', fullName: 'เด็กชายกรวิชญ์ ใสสด', schoolId: 'SCH_MABLUD', classId: 'ป.2/1', gradeLevel: 2, avatar: 'กใ', color: 'cyan', insforgeStudentCode: '6699', citizenId: '1629901148939' },
        STU_M_109: { role: 'STUDENT', fullName: 'เด็กหญิงวารากร ทองมี', schoolId: 'SCH_MABLUD', classId: 'ป.2/1', gradeLevel: 2, avatar: 'วท', color: 'cyan', insforgeStudentCode: '6576', citizenId: '1219700124688' },
        STU_M_110: { role: 'STUDENT', fullName: 'เด็กชายกฤษณโรจน์ ทรงกิตติกุล', schoolId: 'SCH_MABLUD', classId: 'ป.2/1', gradeLevel: 2, avatar: 'กท', color: 'cyan', insforgeStudentCode: '6745', citizenId: '1638900109203', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_111: { role: 'STUDENT', fullName: 'เด็กชายปรินทร์ จูมพิลา', schoolId: 'SCH_MABLUD', classId: 'ป.2/1', gradeLevel: 2, avatar: 'ปจ', color: 'cyan', insforgeStudentCode: '6766', citizenId: '1339600397673' },
        // ═══ ป.2/2 (22 คน) ═══
        STU_M_112: { role: 'STUDENT', fullName: 'เด็กชายวรนาคร หงษ์จันทา', schoolId: 'SCH_MABLUD', classId: 'ป.2/2', gradeLevel: 2, avatar: 'วห', color: 'cyan', insforgeStudentCode: '6431', citizenId: '1219700113007' },
        STU_M_113: { role: 'STUDENT', fullName: 'เด็กชายวัชรพล วรรณดี', schoolId: 'SCH_MABLUD', classId: 'ป.2/2', gradeLevel: 2, avatar: 'วว', color: 'cyan', insforgeStudentCode: '6432', citizenId: '1219901710096' },
        STU_M_114: { role: 'STUDENT', fullName: 'เด็กชายวิทธวัฒน์ คงลิน', schoolId: 'SCH_MABLUD', classId: 'ป.2/2', gradeLevel: 2, avatar: 'วค', color: 'cyan', insforgeStudentCode: '6434', citizenId: '1219901697774' },
        STU_M_115: { role: 'STUDENT', fullName: 'เด็กหญิงธัญธิตา นามโท', schoolId: 'SCH_MABLUD', classId: 'ป.2/2', gradeLevel: 2, avatar: 'ธน', color: 'cyan', insforgeStudentCode: '6461', citizenId: '1248100154623' },
        STU_M_116: { role: 'STUDENT', fullName: 'เด็กหญิงชญาภา สุกรา', schoolId: 'SCH_MABLUD', classId: 'ป.2/2', gradeLevel: 2, avatar: 'ชส', color: 'cyan', insforgeStudentCode: '6473', citizenId: '1348800083728' },
        STU_M_117: { role: 'STUDENT', fullName: 'เด็กชายอัครวิทย์ วันดี', schoolId: 'SCH_MABLUD', classId: 'ป.2/2', gradeLevel: 2, avatar: 'อว', color: 'cyan', insforgeStudentCode: '6476', citizenId: '1219700122111' },
        STU_M_118: { role: 'STUDENT', fullName: 'เด็กชายภาคิน ถนอมกลาง', schoolId: 'SCH_MABLUD', classId: 'ป.2/2', gradeLevel: 2, avatar: 'ภถ', color: 'cyan', insforgeStudentCode: '6477', citizenId: '1219901703430' },
        STU_M_119: { role: 'STUDENT', fullName: 'เด็กชายชยานนท์ ทั่วกลาง', schoolId: 'SCH_MABLUD', classId: 'ป.2/2', gradeLevel: 2, avatar: 'ชท', color: 'cyan', insforgeStudentCode: '6478', citizenId: '1219700116383', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_120: { role: 'STUDENT', fullName: 'เด็กชายเบญจมินทร์ ทุมวงศ์', schoolId: 'SCH_MABLUD', classId: 'ป.2/2', gradeLevel: 2, avatar: 'เท', color: 'cyan', insforgeStudentCode: '6484', citizenId: '1219700114542' },
        STU_M_121: { role: 'STUDENT', fullName: 'เด็กหญิงวรัญญา สมพงค์', schoolId: 'SCH_MABLUD', classId: 'ป.2/2', gradeLevel: 2, avatar: 'วส', color: 'cyan', insforgeStudentCode: '6500', citizenId: '1219700121051' },
        STU_M_122: { role: 'STUDENT', fullName: 'เด็กหญิงชยมล สกุลแก้ว', schoolId: 'SCH_MABLUD', classId: 'ป.2/2', gradeLevel: 2, avatar: 'ชส', color: 'cyan', insforgeStudentCode: '6604', citizenId: '1149901532644', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_123: { role: 'STUDENT', fullName: 'เด็กชายภัทรพล เทพประทุม', schoolId: 'SCH_MABLUD', classId: 'ป.2/2', gradeLevel: 2, avatar: 'ภเ', color: 'cyan', insforgeStudentCode: '6658', citizenId: '1648600163539' },
        STU_M_124: { role: 'STUDENT', fullName: 'เด็กชายประเสริฐ สาดเมืองไพร', schoolId: 'SCH_MABLUD', classId: 'ป.2/2', gradeLevel: 2, avatar: 'ปส', color: 'cyan', insforgeStudentCode: '6659', citizenId: '1219901689208' },
        STU_M_125: { role: 'STUDENT', fullName: 'เด็กหญิงวชิรญาณ์ ศีลานาม', schoolId: 'SCH_MABLUD', classId: 'ป.2/2', gradeLevel: 2, avatar: 'วศ', color: 'cyan', insforgeStudentCode: '6662', citizenId: '1417500174815' },
        STU_M_126: { role: 'STUDENT', fullName: 'เด็กหญิงอุทัยวรรณ ยอดแก้ว', schoolId: 'SCH_MABLUD', classId: 'ป.2/2', gradeLevel: 2, avatar: 'อย', color: 'cyan', insforgeStudentCode: '6408', citizenId: '1219901489314' },
        STU_M_127: { role: 'STUDENT', fullName: 'เด็กชายชัชวาลย์ พรแสน', schoolId: 'SCH_MABLUD', classId: 'ป.2/2', gradeLevel: 2, avatar: 'ชพ', color: 'cyan', insforgeStudentCode: '6523', citizenId: '1440601445877', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_128: { role: 'STUDENT', fullName: 'เด็กหญิงวรรณภา โสภา', schoolId: 'SCH_MABLUD', classId: 'ป.2/2', gradeLevel: 2, avatar: 'วโ', color: 'cyan', insforgeStudentCode: '6693', citizenId: '1139900812368' },
        STU_M_129: { role: 'STUDENT', fullName: 'เด็กหญิงพรจุฑา ทองเนียม', schoolId: 'SCH_MABLUD', classId: 'ป.2/2', gradeLevel: 2, avatar: 'พท', color: 'cyan', insforgeStudentCode: '6449', citizenId: '1101501612236' },
        STU_M_130: { role: 'STUDENT', fullName: 'เด็กหญิงธัญชนก ปลัดวิเศษ', schoolId: 'SCH_MABLUD', classId: 'ป.2/2', gradeLevel: 2, avatar: 'ธป', color: 'cyan', insforgeStudentCode: '6878', citizenId: '1659903012465' },
        STU_M_131: { role: 'STUDENT', fullName: 'เด็กชายจักรพรรดิ สำราญรื่น', schoolId: 'SCH_MABLUD', classId: 'ป.2/2', gradeLevel: 2, avatar: 'จส', color: 'cyan', insforgeStudentCode: '6761', citizenId: '1348900437106', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_132: { role: 'STUDENT', fullName: 'เด็กชายอัศวิน ท้วมทอง', schoolId: 'SCH_MABLUD', classId: 'ป.2/2', gradeLevel: 2, avatar: 'อท', color: 'cyan', insforgeStudentCode: '6763', citizenId: '1218700067942' },
        STU_M_133: { role: 'STUDENT', fullName: 'เด็กชายกฤษกร แพโกเศษ', schoolId: 'SCH_MABLUD', classId: 'ป.2/2', gradeLevel: 2, avatar: 'กแ', color: 'cyan', insforgeStudentCode: '6771', citizenId: '1129701726917' },
        // ═══ ป.3 (29 คน) ═══
        STU_M_134: { role: 'STUDENT', fullName: 'เด็กชายติณณภพ อินทรฉ่ำ', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'ตอ', color: 'cyan', insforgeStudentCode: '6293', citizenId: '1189900661769' },
        STU_M_135: { role: 'STUDENT', fullName: 'เด็กชายกิตติกวิน เนียมเฟือง', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'กเ', color: 'cyan', insforgeStudentCode: '6385', citizenId: '1219700109875' },
        STU_M_136: { role: 'STUDENT', fullName: 'เด็กหญิงจิรัชญา วิฑูรย์', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'จว', color: 'cyan', insforgeStudentCode: '6387', citizenId: '1200901836890' },
        STU_M_137: { role: 'STUDENT', fullName: 'เด็กหญิงณพารัตน์ ฦาชา', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'ณฦ', color: 'cyan', insforgeStudentCode: '6388', citizenId: '1479901242902' },
        STU_M_138: { role: 'STUDENT', fullName: 'เด็กชายกรณพัฒน์ สิงหเดช', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'กส', color: 'cyan', insforgeStudentCode: '6390', citizenId: '1200901840218' },
        STU_M_139: { role: 'STUDENT', fullName: 'เด็กชายคณาธิป กุลบุญมา', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'คก', color: 'cyan', insforgeStudentCode: '6391', citizenId: '1219700111004' },
        STU_M_140: { role: 'STUDENT', fullName: 'เด็กชายปุณณวิชร์ บุญภา', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'ปบ', color: 'cyan', insforgeStudentCode: '6392', citizenId: '1219700110113' },
        STU_M_141: { role: 'STUDENT', fullName: 'เด็กหญิงเกวลิน บุญมา', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'เบ', color: 'cyan', insforgeStudentCode: '6395', citizenId: '1129902531064' },
        STU_M_142: { role: 'STUDENT', fullName: 'เด็กหญิงอารีรัตน์ ภูปรางค์', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'อภ', color: 'cyan', insforgeStudentCode: '6398', citizenId: '1219700102781' },
        STU_M_143: { role: 'STUDENT', fullName: 'เด็กชายวิชยา แซ่หาญ', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'วแ', color: 'cyan', insforgeStudentCode: '6412', citizenId: '1510101746877' },
        STU_M_144: { role: 'STUDENT', fullName: 'เด็กหญิงปพิชญา อุปฮาด', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'ปอ', color: 'cyan', insforgeStudentCode: '6457', citizenId: '1439600183991' },
        STU_M_145: { role: 'STUDENT', fullName: 'เด็กชายวัชรินทร์ หาศิริ', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'วห', color: 'cyan', insforgeStudentCode: '6466', citizenId: '1219901672232' },
        STU_M_146: { role: 'STUDENT', fullName: 'เด็กหญิงกัญญาภัค บัวสิงห์', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'กบ', color: 'cyan', insforgeStudentCode: '6512', citizenId: '1369901166085' },
        STU_M_147: { role: 'STUDENT', fullName: 'เด็กชายณัฐพงษ์ ชูยศ', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'ณช', color: 'cyan', insforgeStudentCode: '6560', citizenId: '1219901673336' },
        STU_M_148: { role: 'STUDENT', fullName: 'เด็กชายมาร์ค', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'ม', color: 'cyan', insforgeStudentCode: '6561', citizenId: '0021971053031' },
        STU_M_149: { role: 'STUDENT', fullName: 'เด็กชายสมจิต ศรีสังข์', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'สศ', color: 'cyan', insforgeStudentCode: '6562', citizenId: '1219700111080' },
        STU_M_150: { role: 'STUDENT', fullName: 'เด็กหญิงเกวลิน จันทนานาค', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'เจ', color: 'cyan', insforgeStudentCode: '6563', citizenId: '1101000618819' },
        STU_M_151: { role: 'STUDENT', fullName: 'เด็กหญิงปภาวรินท์ บุญเจริญ', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'ปบ', color: 'cyan', insforgeStudentCode: '6565', citizenId: '1399200046717', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_152: { role: 'STUDENT', fullName: 'เด็กชายศรัณญ์ เฉลิมวัฒน์', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'ศเ', color: 'cyan', insforgeStudentCode: '6667', citizenId: '1209703012058' },
        STU_M_153: { role: 'STUDENT', fullName: 'เด็กหญิงภัณฑิรา โนรีราษฎร์', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'ภโ', color: 'cyan', insforgeStudentCode: '6668', citizenId: '1200601574172' },
        STU_M_154: { role: 'STUDENT', fullName: 'เด็กหญิงสุขปภา มิงกุระ', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'สม', color: 'cyan', insforgeStudentCode: '6675', citizenId: '1369901164724' },
        STU_M_155: { role: 'STUDENT', fullName: 'เด็กชายพสธร มุละสิวะ', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'พม', color: 'cyan', insforgeStudentCode: '6690', citizenId: '1219700106663', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_156: { role: 'STUDENT', fullName: 'เด็กชายกรกวรรษ รินเพ็ง', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'กร', color: 'cyan', insforgeStudentCode: '6383', citizenId: '1458600084339' },
        STU_M_157: { role: 'STUDENT', fullName: 'เด็กชายกฤษฎา ชาตะบุตร', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'กช', color: 'cyan', insforgeStudentCode: '6740', citizenId: '1219700105306' },
        STU_M_158: { role: 'STUDENT', fullName: 'เด็กชายปัญจพล บุตรกลิ่น', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'ปบ', color: 'cyan', insforgeStudentCode: '6741', citizenId: '1239300041688' },
        STU_M_159: { role: 'STUDENT', fullName: 'เด็กหญิงสุวนัน เดชบุรัมย์', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'สเ', color: 'cyan', insforgeStudentCode: '6751', citizenId: '1749901604607' },
        STU_M_160: { role: 'STUDENT', fullName: 'เด็กชายปูรณ์ จูมพิลา', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'ปจ', color: 'cyan', insforgeStudentCode: '6767', citizenId: '1100704638221' },
        STU_M_161: { role: 'STUDENT', fullName: 'เด็กหญิงปรุงฉัตร โจน', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'ปโ', color: 'cyan', insforgeStudentCode: '6731', citizenId: '219900002600' },
        STU_M_162: { role: 'STUDENT', fullName: 'เด็กหญิงตั๊ก', schoolId: 'SCH_MABLUD', classId: 'ป.3', gradeLevel: 3, avatar: 'ต', color: 'cyan', insforgeStudentCode: '6564', citizenId: '0021971132047' },
        // ═══ ป.4/1 (24 คน) ═══
        STU_M_163: { role: 'STUDENT', fullName: 'เด็กหญิงภิญญดา ทองมี', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'ภท', color: 'cyan', insforgeStudentCode: '6223', citizenId: '1219700088444' },
        STU_M_164: { role: 'STUDENT', fullName: 'เด็กหญิงรัตติยาภรณ์ ยอดขาว', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'รย', color: 'cyan', insforgeStudentCode: '6285', citizenId: '1200901784105' },
        STU_M_165: { role: 'STUDENT', fullName: 'เด็กหญิงพรนภา เกลี้ยงเกลา', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'พเ', color: 'cyan', insforgeStudentCode: '6287', citizenId: '1219700093367' },
        STU_M_166: { role: 'STUDENT', fullName: 'เด็กหญิงชญานี แก้วย่อย', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'ชแ', color: 'cyan', insforgeStudentCode: '6289', citizenId: '1219700093995' },
        STU_M_167: { role: 'STUDENT', fullName: 'เด็กหญิงรุ่งนภา พรกมลวรรณ', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'รพ', color: 'cyan', insforgeStudentCode: '6290', citizenId: '1219700096919' },
        STU_M_168: { role: 'STUDENT', fullName: 'เด็กชายธนศักดิ์ ประสิทธิการ', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'ธป', color: 'cyan', insforgeStudentCode: '6294', citizenId: '1320300425771' },
        STU_M_169: { role: 'STUDENT', fullName: 'เด็กชายณัฐภณ บุญปาน', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'ณบ', color: 'cyan', insforgeStudentCode: '6298', citizenId: '1219700097516' },
        STU_M_170: { role: 'STUDENT', fullName: 'เด็กชายกิตติภูมิ สาทพุ่ม', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'กส', color: 'cyan', insforgeStudentCode: '6300', citizenId: '1260401310228' },
        STU_M_171: { role: 'STUDENT', fullName: 'เด็กหญิงอัศดาพร งันปัญญา', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'อง', color: 'cyan', insforgeStudentCode: '6306', citizenId: '1219901595157' },
        STU_M_172: { role: 'STUDENT', fullName: 'เด็กหญิงกัลยารัตน์ เย็งประโคน', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'กเ', color: 'cyan', insforgeStudentCode: '6443', citizenId: '1219901606841' },
        STU_M_173: { role: 'STUDENT', fullName: 'เด็กหญิงนิตยา ผะงาตุนัด', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'นผ', color: 'cyan', insforgeStudentCode: '6445', citizenId: '1219400072763' },
        STU_M_174: { role: 'STUDENT', fullName: 'เด็กชายคเนศ ผึ้งคุ้ม', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'คผ', color: 'cyan', insforgeStudentCode: '6446', citizenId: '1200901806737' },
        STU_M_175: { role: 'STUDENT', fullName: 'เด็กชายธนะเทพ ตะเพียนทอง', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'ธต', color: 'cyan', insforgeStudentCode: '6467', citizenId: '1219700093529' },
        STU_M_176: { role: 'STUDENT', fullName: 'เด็กชายอนุชิต พันธมาศ', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'อพ', color: 'cyan', insforgeStudentCode: '6470', citizenId: '1339300047600', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_177: { role: 'STUDENT', fullName: 'เด็กชายอัครเดช จงสมัคร', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'อจ', color: 'cyan', insforgeStudentCode: '6581', citizenId: '1208300104123' },
        STU_M_178: { role: 'STUDENT', fullName: 'เด็กหญิงกัญญาพัชร์ เคล้าคล่อง', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'กเ', color: 'cyan', insforgeStudentCode: '6601', citizenId: '1219700094185' },
        STU_M_179: { role: 'STUDENT', fullName: 'เด็กชายมงคล รัตนอุบล', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'มร', color: 'cyan', insforgeStudentCode: '6606', citizenId: '1417500155071' },
        STU_M_180: { role: 'STUDENT', fullName: 'เด็กชายธนภัทร เปราะขาน', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'ธเ', color: 'cyan', insforgeStudentCode: '6452', citizenId: '1219700098261' },
        STU_M_181: { role: 'STUDENT', fullName: 'เด็กหญิงพรรณิภา จิ๋วโคราช', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'พจ', color: 'cyan', insforgeStudentCode: '6627', citizenId: '1309701405647', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_182: { role: 'STUDENT', fullName: 'เด็กชายวีรภัทร เทพประทุม', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'วเ', color: 'cyan', insforgeStudentCode: '6664', citizenId: '1648600141365' },
        STU_M_183: { role: 'STUDENT', fullName: 'เด็กชายเพลิงปาณัท ชูพรหมแก้ว', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'เช', color: 'cyan', insforgeStudentCode: '6678', citizenId: '1800901656918' },
        STU_M_184: { role: 'STUDENT', fullName: 'เด็กชายเขตโสภณ รัตนบรรลือชัย', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'เร', color: 'cyan', insforgeStudentCode: '6733', citizenId: '1219400071571' },
        STU_M_185: { role: 'STUDENT', fullName: 'เด็กหญิงพัชญา บุตรกลิ่น', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'พบ', color: 'cyan', insforgeStudentCode: '6742', citizenId: '1239300040576' },
        STU_M_186: { role: 'STUDENT', fullName: 'เด็กชายจรูญพัฒน์ มะสันเทียะ', schoolId: 'SCH_MABLUD', classId: 'ป.4/1', gradeLevel: 4, avatar: 'จม', color: 'cyan', insforgeStudentCode: '6309', citizenId: '1348900387656' },
        // ═══ ป.4/2 (26 คน) ═══
        STU_M_187: { role: 'STUDENT', fullName: 'เด็กชายภูมิสิทธิ์ เจริญสาริภัณฑ์', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'ภเ', color: 'cyan', insforgeStudentCode: '6277', citizenId: '1219901599225' },
        STU_M_188: { role: 'STUDENT', fullName: 'เด็กชายโชคชัย สารินันท์', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'โส', color: 'cyan', insforgeStudentCode: '6279', citizenId: '1219901603702' },
        STU_M_189: { role: 'STUDENT', fullName: 'เด็กชายปวิชญา ชัยปัญญา', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'ปช', color: 'cyan', insforgeStudentCode: '6284', citizenId: '1219700099446' },
        STU_M_190: { role: 'STUDENT', fullName: 'เด็กหญิงธัญญรัตน์ บุญหล้า', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'ธบ', color: 'cyan', insforgeStudentCode: '6288', citizenId: '1219700093804' },
        STU_M_191: { role: 'STUDENT', fullName: 'เด็กชายกฤตกวิน แสงเหลา', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'กแ', color: 'cyan', insforgeStudentCode: '6299', citizenId: '1219700098601' },
        STU_M_192: { role: 'STUDENT', fullName: 'เด็กหญิงกตัญญุตา โพธิ์อุดม', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'กโ', color: 'cyan', insforgeStudentCode: '6303', citizenId: '1200901813083' },
        STU_M_193: { role: 'STUDENT', fullName: 'เด็กหญิงกัญญารัตน์ ทับแสง', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'กท', color: 'cyan', insforgeStudentCode: '6304', citizenId: '1219700099551' },
        STU_M_194: { role: 'STUDENT', fullName: 'เด็กชายจตุรภัทร พงษ์ศิลา', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'จพ', color: 'cyan', insforgeStudentCode: '6335', citizenId: '3300200561717' },
        STU_M_195: { role: 'STUDENT', fullName: 'เด็กหญิงวิราภรณ์ จี่พิมาย', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'วจ', color: 'cyan', insforgeStudentCode: '6339', citizenId: '1301502222260' },
        STU_M_196: { role: 'STUDENT', fullName: 'เด็กหญิงนภาภัทร สำเภาเงิน', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'นส', color: 'cyan', insforgeStudentCode: '6372', citizenId: '1849400030569' },
        STU_M_197: { role: 'STUDENT', fullName: 'เด็กชายภูวรินท์ แจ่มกระจ่าง', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'ภแ', color: 'cyan', insforgeStudentCode: '6444', citizenId: '1219901624173' },
        STU_M_198: { role: 'STUDENT', fullName: 'เด็กชายรัชชนนท์ คำมนตรี', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'รค', color: 'cyan', insforgeStudentCode: '6494', citizenId: '1379300042632' },
        STU_M_199: { role: 'STUDENT', fullName: 'เด็กชายชานนท์', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'ช', color: 'cyan', insforgeStudentCode: '6498', citizenId: '7219700014172' },
        STU_M_200: { role: 'STUDENT', fullName: 'เด็กหญิงวาสนา ศาลาคำ', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'วศ', color: 'cyan', insforgeStudentCode: '6513', citizenId: '1418000158587' },
        STU_M_201: { role: 'STUDENT', fullName: 'เด็กหญิงสิริวิภา บุตดีแพง', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'สบ', color: 'cyan', insforgeStudentCode: '6514', citizenId: '1219901589297' },
        STU_M_202: { role: 'STUDENT', fullName: 'เด็กหญิงนรมน หัตยะฤทธิ์', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'นห', color: 'cyan', insforgeStudentCode: '6617', citizenId: '1219901621417' },
        STU_M_203: { role: 'STUDENT', fullName: 'เด็กหญิงจันทิพย์ จุลทะ', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'จจ', color: 'cyan', insforgeStudentCode: '6676', citizenId: '1349902052571' },
        STU_M_204: { role: 'STUDENT', fullName: 'เด็กชายธนกิจ นราภิยวัฒน์', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'ธน', color: 'cyan', insforgeStudentCode: '6681', citizenId: '1200901788186', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_205: { role: 'STUDENT', fullName: 'เด็กหญิงกัญดาพร คำเงิน', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'กค', color: 'cyan', insforgeStudentCode: '6508', citizenId: '1219700095157' },
        STU_M_206: { role: 'STUDENT', fullName: 'เด็กหญิงพิมพ์ลภัส ยอดขาว', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'พย', color: 'cyan', insforgeStudentCode: '6736', citizenId: '1200901805285' },
        STU_M_207: { role: 'STUDENT', fullName: 'เด็กชายกิตติคมน์ ดียางหวาย', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'กด', color: 'cyan', insforgeStudentCode: '6737', citizenId: '1567700107541', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_208: { role: 'STUDENT', fullName: 'เด็กชายธีรภัทร นามโสภา', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'ธน', color: 'cyan', insforgeStudentCode: '6734', citizenId: '1241000111195', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_209: { role: 'STUDENT', fullName: 'เด็กชายณัฐพล พินิจดี', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'ณพ', color: 'cyan', insforgeStudentCode: '6735', citizenId: '1329200125757' },
        STU_M_210: { role: 'STUDENT', fullName: 'เด็กชายณัฐกรณ์ พานันท์', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'ณพ', color: 'cyan', insforgeStudentCode: '6757', citizenId: '1219901633211' },
        STU_M_211: { role: 'STUDENT', fullName: 'เด็กหญิงบัวชมภู แก้วพิจิตร', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'บแ', color: 'cyan', insforgeStudentCode: '6769', citizenId: '1219901613457', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_212: { role: 'STUDENT', fullName: 'เด็กหญิงตั๊ก', schoolId: 'SCH_MABLUD', classId: 'ป.4/2', gradeLevel: 4, avatar: 'ต', color: 'cyan', insforgeStudentCode: '6564', citizenId: '0021971132047' },
        // ═══ ป.5/1 (26 คน) ═══
        STU_M_213: { role: 'STUDENT', fullName: 'เด็กชายวิทยาธร สมบูรณ์', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'วส', color: 'cyan', insforgeStudentCode: '6185', citizenId: '1219700088339' },
        STU_M_214: { role: 'STUDENT', fullName: 'เด็กชายวีรยุทธ ผลบุญ', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'วผ', color: 'cyan', insforgeStudentCode: '6194', citizenId: '1219700092000' },
        STU_M_215: { role: 'STUDENT', fullName: 'เด็กชายธีรเมธ ไกรวิเศษ', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'ธไ', color: 'cyan', insforgeStudentCode: '6197', citizenId: '1219901591216' },
        STU_M_216: { role: 'STUDENT', fullName: 'เด็กชายวีรการณ์ มะลิหอม', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'วม', color: 'cyan', insforgeStudentCode: '6199', citizenId: '1200901781408' },
        STU_M_217: { role: 'STUDENT', fullName: 'เด็กหญิงพจนีย์ นามขันธ์', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'พน', color: 'cyan', insforgeStudentCode: '6203', citizenId: '1219901562674' },
        STU_M_218: { role: 'STUDENT', fullName: 'เด็กหญิงชรินทร์ทิพย์ ชัยปัญญา', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'ชช', color: 'cyan', insforgeStudentCode: '6204', citizenId: '1219901572475' },
        STU_M_219: { role: 'STUDENT', fullName: 'เด็กหญิงเนตรนภา นามเอี่ยม', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'เน', color: 'cyan', insforgeStudentCode: '6207', citizenId: '1200901775581' },
        STU_M_220: { role: 'STUDENT', fullName: 'เด็กชายรัชตะ คมคาย', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'รค', color: 'cyan', insforgeStudentCode: '6209', citizenId: '1200901742232' },
        STU_M_221: { role: 'STUDENT', fullName: 'เด็กชายสิริวุฒิ พรมทัต', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'สพ', color: 'cyan', insforgeStudentCode: '6212', citizenId: '1219700089351' },
        STU_M_222: { role: 'STUDENT', fullName: 'เด็กชายธีรศักดิ์ แสนกล้า', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'ธแ', color: 'cyan', insforgeStudentCode: '6219', citizenId: '1219700091089' },
        STU_M_223: { role: 'STUDENT', fullName: 'เด็กหญิงกรวรรณ ทิพาดุษฎีกุล', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'กท', color: 'cyan', insforgeStudentCode: '6224', citizenId: '1200901740957' },
        STU_M_224: { role: 'STUDENT', fullName: 'เด็กหญิงปรารถนา คงลิน', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'ปค', color: 'cyan', insforgeStudentCode: '6227', citizenId: '1478600278052' },
        STU_M_225: { role: 'STUDENT', fullName: 'เด็กหญิงจันทร์จิรา ไพราม', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'จไ', color: 'cyan', insforgeStudentCode: '6228', citizenId: '1219901570375' },
        STU_M_226: { role: 'STUDENT', fullName: 'เด็กหญิงวรัญญา สมัคราช', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'วส', color: 'cyan', insforgeStudentCode: '6365', citizenId: '1660601213206' },
        STU_M_227: { role: 'STUDENT', fullName: 'เด็กชายศักดิ์ทวีโชค ไผ่สวรร', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'ศไ', color: 'cyan', insforgeStudentCode: '6409', citizenId: '7219900032247' },
        STU_M_228: { role: 'STUDENT', fullName: 'เด็กชายชยพล พลัดกลาง', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'ชพ', color: 'cyan', insforgeStudentCode: '6456', citizenId: '1200901746572' },
        STU_M_229: { role: 'STUDENT', fullName: 'เด็กชายพาน พืช', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'พพ', color: 'cyan', insforgeStudentCode: '6510', citizenId: 'G632000011947' },
        STU_M_230: { role: 'STUDENT', fullName: 'เด็กชายจิรายุ ศรแก้ว', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'จศ', color: 'cyan', insforgeStudentCode: '6669', citizenId: '1210800044645', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_231: { role: 'STUDENT', fullName: 'เด็กหญิงชลาธร สมร', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'ชส', color: 'cyan', insforgeStudentCode: '6670', citizenId: '1129701662129' },
        STU_M_232: { role: 'STUDENT', fullName: 'เด็กหญิงกรรณิกา เที่ยงปา', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'กเ', color: 'cyan', insforgeStudentCode: '6677', citizenId: '1319800729670' },
        STU_M_233: { role: 'STUDENT', fullName: 'เด็กหญิงวิมลสิริ อรุณรัตน์', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'วอ', color: 'cyan', insforgeStudentCode: '6660', citizenId: '1199901560672' },
        STU_M_234: { role: 'STUDENT', fullName: 'เด็กหญิงพิชญาดา ปานจันทร์', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'พป', color: 'cyan', insforgeStudentCode: '6684', citizenId: '1219700087880', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_235: { role: 'STUDENT', fullName: 'เด็กหญิงพิชชา นามโสภา', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'พน', color: 'cyan', insforgeStudentCode: '6507', citizenId: '1379900565750', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_236: { role: 'STUDENT', fullName: 'เด็กหญิงธรรมสรณ์ ใสสด', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'ธใ', color: 'cyan', insforgeStudentCode: '6743', citizenId: '1629901057135' },
        STU_M_237: { role: 'STUDENT', fullName: 'เด็กชายโชกัน แก้วรุ่ง', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'โแ', color: 'cyan', insforgeStudentCode: '6623', citizenId: '1907500235356' },
        STU_M_238: { role: 'STUDENT', fullName: 'เด็กหญิงธัญสินี ปลัดวิเศษ', schoolId: 'SCH_MABLUD', classId: 'ป.5/1', gradeLevel: 5, avatar: 'ธป', color: 'cyan', insforgeStudentCode: '6759', citizenId: '1539901236936' },
        // ═══ ป.5/2 (24 คน) ═══
        STU_M_239: { role: 'STUDENT', fullName: 'เด็กชายอนุชิต ประวัติ', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'อป', color: 'cyan', insforgeStudentCode: '6188', citizenId: '1200901748427' },
        STU_M_240: { role: 'STUDENT', fullName: 'เด็กชายพิพัฒพล พงษ์ขวาน้อย', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'พพ', color: 'cyan', insforgeStudentCode: '6192', citizenId: '1369901097075' },
        STU_M_241: { role: 'STUDENT', fullName: 'เด็กชายธนกฤต สอนรัตน์', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'ธส', color: 'cyan', insforgeStudentCode: '6193', citizenId: '1219700090228' },
        STU_M_242: { role: 'STUDENT', fullName: 'เด็กชายชินวุฒิ เหล่ากาวี', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'ชเ', color: 'cyan', insforgeStudentCode: '6195', citizenId: '1200901774606' },
        STU_M_243: { role: 'STUDENT', fullName: 'เด็กชายมงคล ศรีชมภู', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'มศ', color: 'cyan', insforgeStudentCode: '6198', citizenId: '1219901593138' },
        STU_M_244: { role: 'STUDENT', fullName: 'เด็กหญิงเพชรณิชา สุภา', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'เส', color: 'cyan', insforgeStudentCode: '6201', citizenId: '1219700088801' },
        STU_M_245: { role: 'STUDENT', fullName: 'เด็กหญิงณิชกานต์ ต๊ะโพธิ์', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'ณต', color: 'cyan', insforgeStudentCode: '6202', citizenId: '1219700089386' },
        STU_M_246: { role: 'STUDENT', fullName: 'เด็กหญิงธรรมรัตน์ ธรรมแสง', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'ธธ', color: 'cyan', insforgeStudentCode: '6206', citizenId: '1219700091992' },
        STU_M_247: { role: 'STUDENT', fullName: 'เด็กชายอาเซี่ยน ดอกไม้ขาว', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'อด', color: 'cyan', insforgeStudentCode: '6210', citizenId: '1208400012611' },
        STU_M_248: { role: 'STUDENT', fullName: 'เด็กชายพุฒิพงศ์ แหยมคง', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'พแ', color: 'cyan', insforgeStudentCode: '6211', citizenId: '1279200042909' },
        STU_M_249: { role: 'STUDENT', fullName: 'เด็กชายภัครพงษ์ หงส์มาลา', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'ภห', color: 'cyan', insforgeStudentCode: '6213', citizenId: '1200901750821' },
        STU_M_250: { role: 'STUDENT', fullName: 'เด็กชายณรงค์ฤทธิ์ แปลงไธสง', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'ณแ', color: 'cyan', insforgeStudentCode: '6216', citizenId: '1219901568036' },
        STU_M_251: { role: 'STUDENT', fullName: 'เด็กชายพีรวิชญ์ พุ่มคำ', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'พพ', color: 'cyan', insforgeStudentCode: '6220', citizenId: '1219700091241' },
        STU_M_252: { role: 'STUDENT', fullName: 'เด็กหญิงวิรดา คะสุดใจ', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'วค', color: 'cyan', insforgeStudentCode: '6222', citizenId: '1479901119353' },
        STU_M_253: { role: 'STUDENT', fullName: 'เด็กหญิงกัญญาพัชญ์ นวนมีศรี', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'กน', color: 'cyan', insforgeStudentCode: '6337', citizenId: '1417500148661' },
        STU_M_254: { role: 'STUDENT', fullName: 'เด็กหญิงวรรณิศา พรหมณรงค์', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'วพ', color: 'cyan', insforgeStudentCode: '6347', citizenId: '1219901546741' },
        STU_M_255: { role: 'STUDENT', fullName: 'เด็กหญิงสุขภาดา ชัยชนะ', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'สช', color: 'cyan', insforgeStudentCode: '6379', citizenId: '1200901748061' },
        STU_M_256: { role: 'STUDENT', fullName: 'เด็กหญิงศิริขวัญ บุญเทศ', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'ศบ', color: 'cyan', insforgeStudentCode: '6406', citizenId: '1200901738201' },
        STU_M_257: { role: 'STUDENT', fullName: 'เด็กชายนรงค์กรณ์ ไกรราชฉิมพลี', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'นไ', color: 'cyan', insforgeStudentCode: '6583', citizenId: '1200901741716' },
        STU_M_258: { role: 'STUDENT', fullName: 'เด็กชายวัชรินทร์ เทียบสี', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'วเ', color: 'cyan', insforgeStudentCode: '6186', citizenId: '1200901739428' },
        STU_M_259: { role: 'STUDENT', fullName: 'เด็กหญิงศิริวิภาษ์ ผลศิริ', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'ศผ', color: 'cyan', insforgeStudentCode: '6631', citizenId: '1219901531086', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_260: { role: 'STUDENT', fullName: 'เด็กหญิงสุธาทิพย์ โนนจุ่น', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'สโ', color: 'cyan', insforgeStudentCode: '6111', citizenId: '1200901717785' },
        STU_M_261: { role: 'STUDENT', fullName: 'เด็กหญิงอนัญญา ทรงกิตติกุล', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'อท', color: 'cyan', insforgeStudentCode: '6746', citizenId: '1350102041909', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_262: { role: 'STUDENT', fullName: 'เด็กหญิงจิรภิญญา ขันคำ', schoolId: 'SCH_MABLUD', classId: 'ป.5/2', gradeLevel: 5, avatar: 'จข', color: 'cyan', insforgeStudentCode: '6758', citizenId: '1500401234081' },
        // ═══ ป.6/1 (27 คน) ═══
        STU_M_263: { role: 'STUDENT', fullName: 'เด็กชายณัฐภัทร แก้วหิน', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'ณแ', color: 'cyan', insforgeStudentCode: '6072', citizenId: '1200901715260' },
        STU_M_264: { role: 'STUDENT', fullName: 'เด็กชายธนกฤต โพธิ์อุดม', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'ธโ', color: 'cyan', insforgeStudentCode: '6075', citizenId: '1200901723351' },
        STU_M_265: { role: 'STUDENT', fullName: 'เด็กหญิงกรกนก คำทิ้ง', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'กค', color: 'cyan', insforgeStudentCode: '6084', citizenId: '1208400011526' },
        STU_M_266: { role: 'STUDENT', fullName: 'เด็กหญิงญาณพัฒน์ อินทร์เพ็ง', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'ญอ', color: 'cyan', insforgeStudentCode: '6089', citizenId: '1200901717289' },
        STU_M_267: { role: 'STUDENT', fullName: 'เด็กชายอิสรานุวัฒน์ พันธ์ศรี', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'อพ', color: 'cyan', insforgeStudentCode: '6094', citizenId: '1219901488440' },
        STU_M_268: { role: 'STUDENT', fullName: 'เด็กชายพุทธิพัฒน์ สิมสวน', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'พส', color: 'cyan', insforgeStudentCode: '6096', citizenId: '1219700084902' },
        STU_M_269: { role: 'STUDENT', fullName: 'เด็กชายสุทธิภัทร ฉิมภัย', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'สฉ', color: 'cyan', insforgeStudentCode: '6097', citizenId: '1200901717041' },
        STU_M_270: { role: 'STUDENT', fullName: 'เด็กชายศุภโชค พรมงาม', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'ศพ', color: 'cyan', insforgeStudentCode: '6104', citizenId: '1209601859906' },
        STU_M_271: { role: 'STUDENT', fullName: 'เด็กหญิงวรัณชยา แป้นเหมือน', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'วแ', color: 'cyan', insforgeStudentCode: '6107', citizenId: '1219901497252' },
        STU_M_272: { role: 'STUDENT', fullName: 'เด็กหญิงศิโรรัตน์ แต่งตั้ง', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'ศแ', color: 'cyan', insforgeStudentCode: '6118', citizenId: '1219400065767' },
        STU_M_273: { role: 'STUDENT', fullName: 'เด็กหญิงประติภา สัมมัชนิ', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'ปส', color: 'cyan', insforgeStudentCode: '6119', citizenId: '1417900019205' },
        STU_M_274: { role: 'STUDENT', fullName: 'เด็กชายปฐวี แซ่หาญ', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'ปแ', color: 'cyan', insforgeStudentCode: '6121', citizenId: '1160201156196' },
        STU_M_275: { role: 'STUDENT', fullName: 'เด็กชายพีรวัส จี่พิมาย', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'พจ', color: 'cyan', insforgeStudentCode: '6124', citizenId: '1301502205837' },
        STU_M_276: { role: 'STUDENT', fullName: 'เด็กชายณรงค์ศักดิ์ วารินทร์', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'ณว', color: 'cyan', insforgeStudentCode: '6363', citizenId: '1220900067345' },
        STU_M_277: { role: 'STUDENT', fullName: 'เด็กหญิงแพรทอง ศิลชาติ', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'แศ', color: 'cyan', insforgeStudentCode: '6370', citizenId: '1348500159915' },
        STU_M_278: { role: 'STUDENT', fullName: 'เด็กชายอภิวิชญ์ หาศิริ', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'อห', color: 'cyan', insforgeStudentCode: '6465', citizenId: '1219901519752' },
        STU_M_279: { role: 'STUDENT', fullName: 'เด็กหญิงปุญภัทร์ วันดี', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'ปว', color: 'cyan', insforgeStudentCode: '6480', citizenId: '1200901709057', status: 'PENDING_TRANSFER', transferDate: '2568-11-07' },
        STU_M_280: { role: 'STUDENT', fullName: 'เด็กหญิงนิภาธร ลัดกรูด', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'นล', color: 'cyan', insforgeStudentCode: '6516', citizenId: '1368700052065' },
        STU_M_281: { role: 'STUDENT', fullName: 'เด็กหญิงอรวรรณ พรมบุตร', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'อพ', color: 'cyan', insforgeStudentCode: '6568', citizenId: '1468100045776' },
        STU_M_282: { role: 'STUDENT', fullName: 'เด็กชายอัฐพร อ่อนมิ่ง', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'ออ', color: 'cyan', insforgeStudentCode: '6584', citizenId: '1478600253483' },
        STU_M_283: { role: 'STUDENT', fullName: 'เด็กชายจิตติพัฒน์ สมภาร', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'จส', color: 'cyan', insforgeStudentCode: '6609', citizenId: '1459901582991' },
        STU_M_284: { role: 'STUDENT', fullName: 'เด็กชายวรพงษ์ วิชระโภชน์', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'วว', color: 'cyan', insforgeStudentCode: '6671', citizenId: '1449901112596' },
        STU_M_285: { role: 'STUDENT', fullName: 'เด็กชายกิตติคุณ ศรีสุข', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'กศ', color: 'cyan', insforgeStudentCode: '6680', citizenId: '1209301284274' },
        STU_M_286: { role: 'STUDENT', fullName: 'เด็กหญิงกฤตยา จำปาทอง', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'กจ', color: 'cyan', insforgeStudentCode: '6665', citizenId: '1409600550811' },
        STU_M_287: { role: 'STUDENT', fullName: 'เด็กหญิงณัฐรดา มณีรัตน์', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'ณม', color: 'cyan', insforgeStudentCode: '6082', citizenId: '1418800053372' },
        STU_M_288: { role: 'STUDENT', fullName: 'เด็กชายเอกวิญญ์ บำรุงชาติ', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'เบ', color: 'cyan', insforgeStudentCode: '6367', citizenId: '1219700086891' },
        STU_M_289: { role: 'STUDENT', fullName: 'เด็กหญิงกรองแก้ว แซ่ตั้ง', schoolId: 'SCH_MABLUD', classId: 'ป.6/1', gradeLevel: 6, avatar: 'กแ', color: 'cyan', insforgeStudentCode: '6755', citizenId: '2119901027239' },
        // ═══ ป.6/2 (26 คน) ═══
        STU_M_290: { role: 'STUDENT', fullName: 'เด็กชายกิตติคุณ ทองสาหร่าย', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'กท', color: 'cyan', insforgeStudentCode: '6071', citizenId: '1219700086191' },
        STU_M_291: { role: 'STUDENT', fullName: 'เด็กชายเกียรติคุณ บริบุญวงศ์', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'เบ', color: 'cyan', insforgeStudentCode: '6074', citizenId: '1219901519060' },
        STU_M_292: { role: 'STUDENT', fullName: 'เด็กหญิงเก้ากัลยา แสวงกลาง', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'เแ', color: 'cyan', insforgeStudentCode: '6087', citizenId: '1219901504666' },
        STU_M_293: { role: 'STUDENT', fullName: 'เด็กชายเตชินท์ หัตยะฤทธิ์', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'เห', color: 'cyan', insforgeStudentCode: '6095', citizenId: '1219901489250' },
        STU_M_294: { role: 'STUDENT', fullName: 'เด็กชายเจษฎา มีเค้า', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'เม', color: 'cyan', insforgeStudentCode: '6098', citizenId: '1219901516036' },
        STU_M_295: { role: 'STUDENT', fullName: 'เด็กชายกฤติเดช ยศปัญญา', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'กย', color: 'cyan', insforgeStudentCode: '6105', citizenId: '1219901537718' },
        STU_M_296: { role: 'STUDENT', fullName: 'เด็กหญิงพัชนก พลไกร', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'พพ', color: 'cyan', insforgeStudentCode: '6109', citizenId: '1200901707003' },
        STU_M_297: { role: 'STUDENT', fullName: 'เด็กหญิงวราวรรณ วงรินยอง', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'วว', color: 'cyan', insforgeStudentCode: '6110', citizenId: '1399000105272' },
        STU_M_298: { role: 'STUDENT', fullName: 'เด็กหญิงมณีรัตน์ ผลบุญ', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'มผ', color: 'cyan', insforgeStudentCode: '6114', citizenId: '1219901529677' },
        STU_M_299: { role: 'STUDENT', fullName: 'เด็กหญิงแกงส้ม ไชยาวุต', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'แไ', color: 'cyan', insforgeStudentCode: '6180', citizenId: 'G616200000772' },
        STU_M_300: { role: 'STUDENT', fullName: 'เด็กหญิงอรภิญญา กุนอก', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'อก', color: 'cyan', insforgeStudentCode: '6181', citizenId: '1439600151487' },
        STU_M_301: { role: 'STUDENT', fullName: 'เด็กชายธนกฤต ลิ้มไธสง', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'ธล', color: 'cyan', insforgeStudentCode: '6322', citizenId: '1200901733896' },
        STU_M_302: { role: 'STUDENT', fullName: 'เด็กหญิงปิยฉัตร เผยกลาง', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'ปเ', color: 'cyan', insforgeStudentCode: '6324', citizenId: '1301502199519' },
        STU_M_303: { role: 'STUDENT', fullName: 'เด็กชายชัยกฤตย์ แก้วแดง', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'ชแ', color: 'cyan', insforgeStudentCode: '6325', citizenId: '1219700088177' },
        STU_M_304: { role: 'STUDENT', fullName: 'เด็กชายทัตพิชา เส็งประโคน', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'ทเ', color: 'cyan', insforgeStudentCode: '6355', citizenId: '1329400174310' },
        STU_M_305: { role: 'STUDENT', fullName: 'เด็กชายวิทวัส กลัดลัด', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'วก', color: 'cyan', insforgeStudentCode: '6407', citizenId: '1669800439440' },
        STU_M_306: { role: 'STUDENT', fullName: 'เด็กหญิงชุติกาญจน์ สงวนพานิช', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'ชส', color: 'cyan', insforgeStudentCode: '6422', citizenId: '1739902661124' },
        STU_M_307: { role: 'STUDENT', fullName: 'เด็กชายกิจติภัทร์ ศรีราทา', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'กศ', color: 'cyan', insforgeStudentCode: '6585', citizenId: '1219400067174' },
        STU_M_308: { role: 'STUDENT', fullName: 'เด็กชายธนดล สุวรรณสาร', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'ธส', color: 'cyan', insforgeStudentCode: '6586', citizenId: '1219901499506' },
        STU_M_309: { role: 'STUDENT', fullName: 'เด็กชายสมศักดิ์ พันธ์ทอง', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'สพ', color: 'cyan', insforgeStudentCode: '6596', citizenId: '1417500140317' },
        STU_M_310: { role: 'STUDENT', fullName: 'เด็กชายชุติวัต สุกิจพิทยานันท์', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'ชส', color: 'cyan', insforgeStudentCode: '6618', citizenId: '1100202141061' },
        STU_M_311: { role: 'STUDENT', fullName: 'เด็กชายภูผา คำภาเขียว', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'ภค', color: 'cyan', insforgeStudentCode: '6674', citizenId: '1200901702460' },
        STU_M_312: { role: 'STUDENT', fullName: 'เด็กชายวรฤทธิ์ คงยัง', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'วค', color: 'cyan', insforgeStudentCode: '6673', citizenId: '1959901242070' },
        STU_M_313: { role: 'STUDENT', fullName: 'เด็กชายสุชานนท์ ฤาเดช', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'สฤ', color: 'cyan', insforgeStudentCode: '6689', citizenId: '1200901700661' },
        STU_M_314: { role: 'STUDENT', fullName: 'เด็กหญิงศิริวรรณ วงเวียน', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'ศว', color: 'cyan', insforgeStudentCode: '6261', citizenId: '1218500058192' },
        STU_M_315: { role: 'STUDENT', fullName: 'เด็กหญิงวนิดา บริหาร', schoolId: 'SCH_MABLUD', classId: 'ป.6/2', gradeLevel: 6, avatar: 'วบ', color: 'cyan', insforgeStudentCode: '6747', citizenId: '1318600074211' },

        // --- GRADE-SPECIFIC STUDENTS (สำหรับทดสอบทุกระดับชั้น) ---
        STU_G1: {
            role: 'STUDENT',
            fullName: 'น้องหนึ่ง ใจดี',
            schoolId: 'SCH_001',
            classId: '1/1',
            avatar: 'G1',
            color: 'cyan',
            studentType: 'SYSTEM',
            gradeLevel: 1,
        },
        STU_G2: {
            role: 'STUDENT',
            fullName: 'น้องสอง รักเรียน',
            schoolId: 'SCH_001',
            classId: '2/1',
            avatar: 'G2',
            color: 'cyan',
            studentType: 'SYSTEM',
            gradeLevel: 2,
        },
        STU_G3: {
            role: 'STUDENT',
            fullName: 'น้องสาม ขยัน',
            schoolId: 'SCH_001',
            classId: '3/1',
            avatar: 'G3',
            color: 'cyan',
            studentType: 'SYSTEM',
            gradeLevel: 3,
        },
        STU_G4: {
            role: 'STUDENT',
            fullName: 'น้องสี่ ฉลาด',
            schoolId: 'SCH_001',
            classId: '4/1',
            avatar: 'G4',
            color: 'cyan',
            studentType: 'SYSTEM',
            gradeLevel: 4,
        },
        STU_G5: {
            role: 'STUDENT',
            fullName: 'น้องห้า เก่งมาก',
            schoolId: 'SCH_001',
            classId: '5/1',
            avatar: 'G5',
            color: 'cyan',
            studentType: 'SYSTEM',
            gradeLevel: 5,
        },
        STU_G6: {
            role: 'STUDENT',
            fullName: 'น้องหก ใกล้จบ',
            schoolId: 'SCH_001',
            classId: '6/1',
            avatar: 'G6',
            color: 'cyan',
            studentType: 'SYSTEM',
            gradeLevel: 6,
        },
        // --- ORIGINAL STUDENTS (เก็บไว้สำหรับ backward compatibility) ---
        STU_001: {
            role: 'STUDENT',
            fullName: 'ติณณภพ อินทรฉ่ำ',
            schoolId: 'SCH_MABLUD',
            classId: 'ป.3',
            avatar: 'TP',
            color: 'cyan',
            studentType: 'SYSTEM',
            gradeLevel: 3,
            citizenId: '1189900661769',
            insforgeStudentCode: '6293',
        },
        STU_002: {
            role: 'STUDENT',
            fullName: 'บวรนันท์ มั่นคง',
            schoolId: 'SCH_001',
            classId: '6/1',
            avatar: 'BM',
            color: 'cyan',
            studentType: 'SYSTEM',
            gradeLevel: 6,
        },
        STU_003: {
            role: 'STUDENT',
            fullName: 'น้องเหนือ รักเรียน',
            schoolId: 'SCH_004',
            classId: '6/1',
            avatar: 'NH',
            color: 'cyan',
            studentType: 'SYSTEM',
            gradeLevel: 6,
        },
        STU_004: {
            role: 'STUDENT',
            fullName: 'น้องเกาะ ชาวพุทธ',
            schoolId: 'SCH_005',
            classId: '6/1',
            avatar: 'NK',
            color: 'cyan',
            studentType: 'SYSTEM',
            gradeLevel: 6,
        },
        STU_005: {
            role: 'STUDENT',
            fullName: 'น้องแก่น มารยาทงาม',
            schoolId: 'SCH_006',
            classId: '6/1',
            avatar: 'NG',
            color: 'cyan',
            studentType: 'SYSTEM',
            gradeLevel: 6,
        },
        STU_HS_001: {
            role: 'STUDENT',
            fullName: 'หนูดี มีปัญญา (Homeschool)',
            districtId: 'ESA_01',
            avatar: 'ND',
            color: 'cyan',
            studentType: 'HOMESCHOOL',
            parentId: 'PAR_HS_001',
            status: 'AWAY',
        },
        STU_HS_002: {
            role: 'STUDENT',
            fullName: 'น้องภู ขยันยิ่ง (Homeschool)',
            districtId: 'ESA_04',
            avatar: 'NP',
            color: 'cyan',
            studentType: 'HOMESCHOOL',
            parentId: 'PAR_HS_002',
            status: 'OFFLINE',
        },
        STU_006: {
            role: 'STUDENT',
            fullName: 'ภานุวัฒน์ แสงดี',
            schoolId: 'SCH_001',
            classId: '6/1',
            avatar: 'PW',
            color: 'cyan',
            studentType: 'SYSTEM',
            status: 'ONLINE',
        },
        STU_007: {
            role: 'STUDENT',
            fullName: 'กัญญาภัทร ใจซื่อ',
            schoolId: 'SCH_001',
            classId: '6/1',
            avatar: 'KJ',
            color: 'cyan',
            studentType: 'SYSTEM',
            status: 'AWAY',
        },
        STU_008: {
            role: 'STUDENT',
            fullName: 'ธนวัต มณีโชติ',
            schoolId: 'SCH_001',
            classId: '6/1',
            avatar: 'TM',
            color: 'cyan',
            studentType: 'SYSTEM',
            status: 'ONLINE',
        },
        STU_009: {
            role: 'STUDENT',
            fullName: 'วรัญญา วงศ์ศรี',
            schoolId: 'SCH_001',
            classId: '6/1',
            avatar: 'WW',
            color: 'cyan',
            studentType: 'SYSTEM',
            status: 'BUSY',
        },
        STU_010: {
            role: 'STUDENT',
            fullName: 'ณัฐนนท์ คนขยัน',
            schoolId: 'SCH_001',
            classId: '6/1',
            avatar: 'NK',
            color: 'cyan',
            studentType: 'SYSTEM',
            status: 'ONLINE',
        },
        STU_011: {
            role: 'STUDENT',
            fullName: 'พิมพิศา รักษาธรรม',
            schoolId: 'SCH_001',
            classId: '6/1',
            avatar: 'PR',
            color: 'cyan',
            studentType: 'SYSTEM',
            status: 'ONLINE',
        },
        STU_012: {
            role: 'STUDENT',
            fullName: 'เกรียงไกร ใฝ่ดี',
            schoolId: 'SCH_001',
            classId: '6/1',
            avatar: 'KD',
            color: 'cyan',
            studentType: 'SYSTEM',
            status: 'ONLINE',
        },
        STU_013: {
            role: 'STUDENT',
            fullName: 'มนัสนันท์ มั่นใจ',
            schoolId: 'SCH_001',
            classId: '6/1',
            avatar: 'MM',
            color: 'cyan',
            studentType: 'SYSTEM',
            status: 'AWAY',
        },
        STU_014: {
            role: 'STUDENT',
            fullName: 'ชยพล ทนงศักดิ์',
            schoolId: 'SCH_001',
            classId: '6/1',
            avatar: 'CT',
            color: 'cyan',
            studentType: 'SYSTEM',
            status: 'ONLINE',
        },
        STU_015: {
            role: 'STUDENT',
            fullName: 'รินรดา วิชุดา',
            schoolId: 'SCH_001',
            classId: '6/1',
            avatar: 'RW',
            color: 'cyan',
            studentType: 'SYSTEM',
            status: 'BUSY',
        },

        // --- PARENTS ---
        PAR_001: {
            role: 'PARENT',
            fullName: 'นายสมพล เก่งเรียน',
            studentId: 'STU_001',
            avatar: 'SP',
            color: 'cyan',
        },
        PAR_003: {
            role: 'PARENT',
            fullName: 'คุณพ่อเมืองเหนือ รักเรียน',
            studentId: 'STU_003',
            avatar: 'MN',
            color: 'cyan',
        },
        PAR_004: {
            role: 'PARENT',
            fullName: 'คุณแม่แหลมพรหมเทพ ชาวพุทธ',
            studentId: 'STU_004',
            avatar: 'ML',
            color: 'cyan',
        },
        PAR_005: {
            role: 'PARENT',
            fullName: 'คุณพ่อดินแก่นนคร มารยาทงาม',
            studentId: 'STU_005',
            avatar: 'DK',
            color: 'cyan',
        },
        PAR_HS_001: {
            role: 'PARENT',
            fullName: 'คุณแม่ประณีต มีปัญญา',
            studentId: 'STU_HS_001',
            districtId: 'ESA_01',
            avatar: 'PN',
            color: 'id-parent',
            status: 'ONLINE',
        },
        PAR_HS_002: {
            role: 'PARENT',
            fullName: 'คุณพ่อภูผา ขยันยิ่ง',
            studentId: 'STU_HS_002',
            districtId: 'ESA_04',
            avatar: 'PP',
            color: 'id-parent',
            status: 'BUSY',
        },
        PAR_006: {
            role: 'PARENT',
            fullName: 'นางวิภา แสงดี',
            studentId: 'STU_006',
            avatar: 'WS',
            color: 'id-parent',
        },
        PAR_007: {
            role: 'PARENT',
            fullName: 'นายธีระ ใจซื่อ',
            studentId: 'STU_007',
            avatar: 'TJ',
            color: 'id-parent',
        },
        PAR_008: {
            role: 'PARENT',
            fullName: 'นางสายใจ มณีโชติ',
            studentId: 'STU_008',
            avatar: 'SJ',
            color: 'id-parent',
        },
        PAR_009: {
            role: 'PARENT',
            fullName: 'นายวัชระ วงศ์ศรี',
            studentId: 'STU_009',
            avatar: 'WC',
            color: 'id-parent',
        },
        PAR_010: {
            role: 'PARENT',
            fullName: 'นางกานดา คนขยัน',
            studentId: 'STU_010',
            avatar: 'GK',
            color: 'id-parent',
        },
        PAR_011: {
            role: 'PARENT',
            fullName: 'นายวีระ รักษาธรรม',
            studentId: 'STU_011',
            avatar: 'VR',
            color: 'id-parent',
        },
        PAR_012: {
            role: 'PARENT',
            fullName: 'นางปรียา ใฝ่ดี',
            studentId: 'STU_012',
            avatar: 'PD',
            color: 'id-parent',
        },
        PAR_013: {
            role: 'PARENT',
            fullName: 'นายชูชาติ มั่นใจ',
            studentId: 'STU_013',
            avatar: 'CM',
            color: 'id-parent',
        },
        PAR_014: {
            role: 'PARENT',
            fullName: 'นางเบญจวรรณ ทนงศักดิ์',
            studentId: 'STU_014',
            avatar: 'BT',
            color: 'id-parent',
        },
        PAR_015: {
            role: 'PARENT',
            fullName: 'นายสมบัติ วิชุดา',
            studentId: 'STU_015',
            avatar: 'SW',
            color: 'id-parent',
        },

        // --- TEACHERS (Thai Core Curriculum Subjects) ---
        // Priority 1: Class Teachers (ครูประจำชั้น)
        TEA_001: {
            role: 'TEACHER',
            fullName: 'ครูวรชัย อภัยโส',
            schoolId: 'SCH_MABLUD',
            teacherType: 'SPECIAL_TEACHER',
            subject: 'สังคมศึกษา',
            subjectId: 'SOC',
            priority: 2,
            responsibilities: {},
            avatar: 'WC',
            color: 'sj-soc',
            insforgePersonId: 'd8ae8b6b-1f23-4073-99ab-15cfb0c2fe05',
        },
        TEA_002: {
            role: 'TEACHER',
            fullName: 'ครูนิติพร โฆเกียรติมานนท์',
            schoolId: 'SCH_MABLUD',
            teacherType: 'CLASS_TEACHER',
            subject: 'ภาษาไทย',
            subjectId: 'THAI',
            priority: 1,
            responsibilities: { classTeacherOf: 'อนุบาล 2' },
            avatar: 'NP',
            color: 'sj-thai',
            insforgePersonId: 'e47c1309-b65f-4547-a174-c22c80832f97',
        },

        // Priority 2: Subject Teachers (ครูประจำวิชา)
        TEA_003: {
            role: 'TEACHER',
            fullName: 'ครูมณี มีความรู้',
            schoolId: 'SCH_001',
            teacherType: 'SUBJECT_TEACHER',
            subject: 'วิทยาศาสตร์และเทคโนโลยี',
            subjectId: 'SCI',
            priority: 2,
            avatar: 'MM',
            color: 'sj-sci',
        },
        TEA_004: {
            role: 'TEACHER',
            fullName: 'ครูวิชัย ใจดี',
            schoolId: 'SCH_001',
            teacherType: 'SUBJECT_TEACHER',
            subject: 'สังคมศึกษา ศาสนา และวัฒนธรรม',
            subjectId: 'SOC',
            priority: 2,
            avatar: 'VC',
            color: 'sj-soc',
        },
        TEA_005: {
            role: 'TEACHER',
            fullName: 'ครูสมปอง ส่องสว่าง',
            schoolId: 'SCH_001',
            teacherType: 'SUBJECT_TEACHER',
            subject: 'สุขศึกษาและพลศึกษา',
            subjectId: 'PE',
            priority: 2,
            avatar: 'SP',
            color: 'sj-pe',
        },
        TEA_006: {
            role: 'TEACHER',
            fullName: 'ครูประภาศ แสงเทียน',
            schoolId: 'SCH_001',
            teacherType: 'SUBJECT_TEACHER',
            subject: 'ศิลปะ',
            subjectId: 'ART',
            priority: 2,
            avatar: 'PP',
            color: 'sj-art',
        },
        TEA_007: {
            role: 'TEACHER',
            fullName: 'ครูวารุณี มีธรรม',
            schoolId: 'SCH_001',
            teacherType: 'SUBJECT_TEACHER',
            subject: 'การงานอาชีพ',
            subjectId: 'WORK',
            priority: 2,
            avatar: 'VM',
            color: 'sj-work',
        },
        TEA_008: {
            role: 'TEACHER',
            fullName: 'ครูปัญญา มานะ',
            schoolId: 'SCH_001',
            teacherType: 'SUBJECT_TEACHER',
            subject: 'ภาษาต่างประเทศ (English)',
            subjectId: 'ENG',
            priority: 2,
            avatar: 'PM',
            color: 'sj-eng',
        },
        TEA_009: {
            role: 'TEACHER',
            fullName: 'ครูสุดา สอนดี',
            schoolId: 'SCH_001',
            teacherType: 'SUBJECT_TEACHER',
            subject: 'ประวัติศาสตร์',
            subjectId: 'HIST',
            priority: 2,
            avatar: 'SD',
            color: 'sj-hist',
        },
        TEA_010: {
            role: 'TEACHER',
            fullName: 'ครูเชียงดาว พงศ์เพชร',
            schoolId: 'SCH_004',
            teacherType: 'CLASS_TEACHER',
            subject: 'ภาษาไทย',
            subjectId: 'THAI',
            priority: 1,
            responsibilities: { classTeacherOf: '6/1' },
            avatar: 'CD',
            color: 'sj-thai',
        },
        TEA_011: {
            role: 'TEACHER',
            fullName: 'ครูแหลมพรหมเทพ อันดามัน',
            schoolId: 'SCH_005',
            teacherType: 'CLASS_TEACHER',
            subject: 'คณิตศาสตร์',
            subjectId: 'MATH',
            priority: 1,
            responsibilities: { classTeacherOf: '6/1' },
            avatar: 'LT',
            color: 'sj-math',
        },
        TEA_012: {
            role: 'TEACHER',
            fullName: 'ครูแก่นนคร มิตรมั่น',
            schoolId: 'SCH_006',
            teacherType: 'CLASS_TEACHER',
            subject: 'วิทยาศาสตร์',
            subjectId: 'SCI',
            priority: 1,
            responsibilities: { classTeacherOf: '6/1' },
            avatar: 'KN',
            color: 'sj-sci',
        },
        TEA_013: {
            role: 'TEACHER',
            fullName: 'ครูอำพล มั่นคง',
            schoolId: 'SCH_001',
            teacherType: 'SUBJECT_TEACHER',
            subject: 'ภาษาต่างประเทศ',
            subjectId: 'ENG',
            avatar: 'AM',
            color: 'sj-eng',
            status: 'ONLINE',
        },
        TEA_014: {
            role: 'TEACHER',
            fullName: 'ครูสมรักษ์ รักวิชา',
            schoolId: 'SCH_001',
            teacherType: 'SUBJECT_TEACHER',
            subject: 'สุขศึกษา',
            subjectId: 'PE',
            avatar: 'SR',
            color: 'sj-pe',
            status: 'AWAY',
        },
        TEA_015: {
            role: 'TEACHER',
            fullName: 'ครูวิไล แสงทอง',
            schoolId: 'SCH_001',
            teacherType: 'SUBJECT_TEACHER',
            subject: 'ศิลปะ',
            subjectId: 'ART',
            avatar: 'WL',
            color: 'sj-art',
            status: 'ONLINE',
        },
        TEA_016: {
            role: 'TEACHER',
            fullName: 'ครูธงไชย ใจดี',
            schoolId: 'SCH_001',
            teacherType: 'SUBJECT_TEACHER',
            subject: 'สังคมศึกษา',
            subjectId: 'SOC',
            avatar: 'TC',
            color: 'sj-soc',
            status: 'BUSY',
        },
        TEA_017: {
            role: 'TEACHER',
            fullName: 'ครูนารี มีความสุข',
            schoolId: 'SCH_001',
            teacherType: 'SUBJECT_TEACHER',
            subject: 'การงานอาชีพ',
            subjectId: 'WORK',
            avatar: 'NR',
            color: 'sj-work',
            status: 'ONLINE',
        },
        TEA_018: {
            role: 'TEACHER',
            fullName: 'ครูพงศ์เทพ รักไทย',
            schoolId: 'SCH_001',
            teacherType: 'SUBJECT_TEACHER',
            subject: 'ดนตรี',
            subjectId: 'ART',
            avatar: 'PR',
            color: 'sj-art',
            status: 'ONLINE',
        },
        TEA_019: {
            role: 'TEACHER',
            fullName: 'ครูวรุณี มีวินัย',
            schoolId: 'SCH_001',
            teacherType: 'SUBJECT_TEACHER',
            subject: 'การงานอาชีพ',
            subjectId: 'WORK',
            avatar: 'VM',
            color: 'sj-work',
            status: 'ONLINE',
        },
        TEA_020: {
            role: 'TEACHER',
            fullName: 'ครูศิริพงษ์ วิริยะ',
            schoolId: 'SCH_001',
            teacherType: 'SUBJECT_TEACHER',
            subject: 'สังคมศึกษา/สุขศึกษา',
            subjectId: 'SOC',
            avatar: 'SW',
            color: 'sj-soc',
            status: 'ONLINE',
        },
        TEA_021: {
            role: 'TEACHER',
            fullName: 'ครูอภิสิทธิ์ คิดไว',
            schoolId: 'SCH_001',
            teacherType: 'SUBJECT_TEACHER',
            subject: 'คอมพิวเตอร์',
            subjectId: 'SCI',
            avatar: 'AK',
            color: 'sj-sci',
            status: 'ONLINE',
        },

        // --- SCHOOL DIRECTORS (Linked to Schools) ---
        SCH_DIR_001: {
            role: 'SCHOOL_DIR',
            fullName: 'ผอ.ปรีชา เกียรติวินัย',
            name: 'ผอ.รร.วิทยาบ้านเกิด',
            org: 'โรงเรียนวิทยาบ้านเกิด สพป.ระยอง เขต 1',
            schoolId: 'SCH_001',
            avatar: 'PK',
            color: 'id-dir',
        },
        SCH_DIR_002: {
            role: 'SCHOOL_DIR',
            fullName: 'ผอ.ธราธร พัฒนศึกษา',
            name: 'ผอ.รร.เตรียมอุดม',
            schoolId: 'SCH_002',
            avatar: 'TP',
            color: 'id-dir',
        },
        SCH_DIR_003: {
            role: 'SCHOOL_DIR',
            fullName: 'ผอ.เกียรติศักดิ์ อบรม',
            name: 'ผอ.รร.สตรีวิทยา',
            schoolId: 'SCH_003',
            avatar: 'KA',
            color: 'id-dir',
        },
        SCH_DIR_004: {
            role: 'SCHOOL_DIR',
            fullName: 'ผอ.เมืองเหนือ พัฒนา',
            name: 'ผอ.รร.อนุบาลเชียงใหม่',
            schoolId: 'SCH_004',
            avatar: 'MN',
            color: 'id-dir',
        },
        SCH_DIR_005: {
            role: 'SCHOOL_DIR',
            fullName: 'ผอ.สุรินทร์ รัตน์',
            name: 'ผอ.รร.ภูเก็ตวิทยาลัย',
            schoolId: 'SCH_005',
            avatar: 'SR',
            color: 'id-dir',
        },
        SCH_DIR_006: {
            role: 'SCHOOL_DIR',
            fullName: 'ผอ.ดอกคูน บานสะพรั่ง',
            name: 'ผอ.รร.ขอนแก่นวิทยายน',
            schoolId: 'SCH_006',
            avatar: 'DK',
            color: 'id-dir',
        },
        SCH_DIR_007: {
            role: 'SCHOOL_DIR',
            fullName: 'ผอ.สมบูรณ์ แบบ',
            name: 'ผอ.รร.พุทธรักษา',
            schoolId: 'SCH_016',
            avatar: 'SB',
            color: 'id-dir',
            status: 'ONLINE',
        },
        SCH_DIR_008: {
            role: 'SCHOOL_DIR',
            fullName: 'ผอ.วัฒนา ก้าวหน้า',
            name: 'ผอ.รร.พัฒนาไทย',
            schoolId: 'SCH_017',
            avatar: 'WK',
            color: 'id-dir',
            status: 'AWAY',
        },
        SCH_DIR_009: {
            role: 'SCHOOL_DIR',
            fullName: 'ผอ.สิริมา ใจงาม',
            name: 'ผอ.รร.สิริวัฒนา',
            schoolId: 'SCH_018',
            avatar: 'SJ',
            color: 'id-dir',
        },
        SCH_DIR_010: {
            role: 'SCHOOL_DIR',
            fullName: 'ผอ.ทนงศักดิ์ รักเรียน',
            name: 'ผอ.รร.มานะศึกษา',
            schoolId: 'SCH_019',
            avatar: 'TR',
            color: 'id-dir',
        },
        SCH_DIR_011: {
            role: 'SCHOOL_DIR',
            fullName: 'ผอ.วิภาวรรณ สดใส',
            name: 'ผอ.รร.อรุณวิทย์',
            schoolId: 'SCH_020',
            avatar: 'VS',
            color: 'id-dir',
        },
        SCH_DIR_012: {
            role: 'SCHOOL_DIR',
            fullName: 'ผอ.ศักดิ์ดา บารมี',
            name: 'ผอ.รร.วัดป่านาบุญ',
            schoolId: 'SCH_007',
            avatar: 'SB',
            color: 'id-dir',
            status: 'ONLINE',
        },
        SCH_DIR_013: {
            role: 'SCHOOL_DIR',
            fullName: 'ผอ.จตุพล จงเจริญ',
            name: 'ผอ.รร.บ้านหนองใหญ่',
            schoolId: 'SCH_008',
            avatar: 'JJ',
            color: 'id-dir',
            status: 'AWAY',
        },
        SCH_DIR_014: {
            role: 'SCHOOL_DIR',
            fullName: 'ผอ.พิมพ์ใจ ใฝ่เรียน',
            name: 'ผอ.รร.สว่างอารมณ์',
            schoolId: 'SCH_009',
            avatar: 'PJ',
            color: 'id-dir',
            status: 'ONLINE',
        },
        SCH_DIR_015: {
            role: 'SCHOOL_DIR',
            fullName: 'ผอ.เกียรติ พัฒนา',
            name: 'ผอ.รร.มิตรภาพฯ',
            schoolId: 'SCH_010',
            avatar: 'KP',
            color: 'id-dir',
        },
        SCH_DIR_016: {
            role: 'SCHOOL_DIR',
            fullName: 'ผอ.นลินี มีความสุข',
            name: 'ผอ.รร.ประชานุกูล',
            schoolId: 'SCH_011',
            avatar: 'NM',
            color: 'id-dir',
            status: 'ONLINE',
        },
        SCH_DIR_017: {
            role: 'SCHOOL_DIR',
            fullName: 'ผอ.อุทัย รุ่งอรุณ',
            name: 'ผอ.รร.ดรุณศึกษา',
            schoolId: 'SCH_012',
            avatar: 'UR',
            color: 'id-dir',
        },
        SCH_DIR_018: {
            role: 'SCHOOL_DIR',
            fullName: 'ผอ.บุญส่ง มั่งคั่ง',
            name: 'ผอ.รร.บ้านหนองบอน',
            schoolId: 'SCH_013',
            avatar: 'BM',
            color: 'id-dir',
            status: 'ONLINE',
        },
        SCH_DIR_019: {
            role: 'SCHOOL_DIR',
            fullName: 'ผอ.ประกาย ดาวเหนือ',
            name: 'ผอ.รร.เมืองปักษ์',
            schoolId: 'SCH_014',
            avatar: 'PD',
            color: 'id-dir',
        },
        SCH_DIR_020: {
            role: 'SCHOOL_DIR',
            fullName: 'ผอ.วีระศักดิ์ รักไทย',
            name: 'ผอ.รร.ไทยพัฒนา',
            schoolId: 'SCH_015',
            avatar: 'VR',
            color: 'id-dir',
            status: 'AWAY',
        },

        // --- ESA DIRECTORS (Linked to Districts) ---
        ESA_DIR_001: {
            role: 'ESA_DIR',
            fullName: 'ดร.สมเกียรติ ยอดเยี่ยม',
            name: 'ผอ.สพป.ระยอง เขต 1',
            districtId: 'ESA_01',
            avatar: 'SY',
            color: 'id-esa',
        },
        ESA_DIR_002: {
            role: 'ESA_DIR',
            fullName: 'ดร.พงศกร พัฒนา',
            name: 'ผอ.สพม.กทม. เขต 1',
            districtId: 'ESA_02',
            avatar: 'PP',
            color: 'id-esa',
        },
        ESA_DIR_003: {
            role: 'ESA_DIR',
            fullName: 'ดร.ระพีพรรณ เชียงใหม่',
            name: 'ผอ.สพป.เชียงใหม่ เขต 1',
            districtId: 'ESA_03',
            avatar: 'RC',
            color: 'id-esa',
        },
        ESA_DIR_004: {
            role: 'ESA_DIR',
            fullName: 'ดร.อันดามัน ปักษ์ใต้',
            name: 'ผอ.สพป.ภูเก็ต',
            districtId: 'ESA_04',
            avatar: 'AP',
            color: 'id-esa',
        },
        ESA_DIR_005: {
            role: 'ESA_DIR',
            fullName: 'ดร.อีสาน มั่นคง',
            name: 'ผอ.สพป.ขอนแก่น เขต 1',
            districtId: 'ESA_05',
            avatar: 'EM',
            color: 'id-esa',
        },
        ESA_DIR_006: {
            role: 'ESA_DIR',
            fullName: 'ดร.ธนธรณ์ มานะ',
            name: 'ผอ.สพป.นครราชสีมา เขต 1',
            districtId: 'ESA_06',
            avatar: 'TM',
            color: 'id-esa',
            status: 'ONLINE',
        },
        ESA_DIR_007: {
            role: 'ESA_DIR',
            fullName: 'ดร.กิตติศักดิ์ มีสุข',
            name: 'ผอ.สพป.สุราษฎร์ธานี เขต 1',
            districtId: 'ESA_07',
            avatar: 'KM',
            color: 'id-esa',
            status: 'AWAY',
        },
        ESA_DIR_008: {
            role: 'ESA_DIR',
            fullName: 'ดร.พัชราภรณ์ วงเวียน',
            name: 'ผอ.สพป.อุดรธานี เขต 1',
            districtId: 'ESA_08',
            avatar: 'PW',
            color: 'id-esa',
        },
        ESA_DIR_009: {
            role: 'ESA_DIR',
            fullName: 'ดร.บรรพต ใจเด็ด',
            name: 'ผอ.สพป.ชลบุรี เขต 1',
            districtId: 'ESA_09',
            avatar: 'BJ',
            color: 'id-esa',
        },
        ESA_DIR_010: {
            role: 'ESA_DIR',
            fullName: 'ดร.อรุณ แสงสว่าง',
            name: 'ผอ.สพป.สงขลา เขต 1',
            districtId: 'ESA_10',
            avatar: 'AS',
            color: 'id-esa',
        },

        // --- OBEC (National Level) ---
        OBEC_001: {
            role: 'OBEC',
            fullName: 'ท่านเลขาฯ สมคิด สพฐ.',
            org: 'สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน',
            avatar: 'SK',
            color: 'id-obec',
        },
        OBEC_002: {
            role: 'OBEC',
            fullName: 'ท่านรองฯ วิชาญ สพฐ.',
            org: 'สำนักนโยบายและแผน',
            avatar: 'WC',
            color: 'id-obec',
            status: 'ONLINE',
        },
        OBEC_003: {
            role: 'OBEC',
            fullName: 'ท่านผู้อำนวยการ สุชาติ',
            org: 'สำนักทดสอบทางการศึกษา',
            avatar: 'SC',
            color: 'id-obec',
            status: 'AWAY',
        },
        OBEC_004: {
            role: 'OBEC',
            fullName: 'ท่านผู้อำนวยการ นงลักษณ์',
            org: 'สำนักการลูกเสือ ยุวกาชาด',
            avatar: 'NL',
            color: 'id-obec',
        },
        OBEC_005: {
            role: 'OBEC',
            fullName: 'ท่านผู้เชี่ยวชาญ พิสิษฐ์',
            org: 'สำนักบริหารงานการศึกษาพิเศษ',
            avatar: 'PS',
            color: 'id-obec',
        },
        OBEC_006: {
            role: 'OBEC',
            fullName: 'ท่านเลขานุการ สุวรรณา',
            org: 'สำนักอำนวยการ',
            avatar: 'SW',
            color: 'id-obec',
        },

        // --- MOE (Ministry Level) ---
        MOE_001: {
            role: 'MOE',
            fullName: 'ท่านรัฐมนตรี อนันต์',
            org: 'กระทรวงศึกษาธิการ',
            avatar: 'AN',
            color: 'id-moe',
        },
        MOE_002: {
            role: 'MOE',
            fullName: 'ท่านที่ปรึกษา วิทยา',
            org: 'สำนักงานรัฐมนตรี',
            avatar: 'WT',
            color: 'id-moe',
            status: 'ONLINE',
        },
        MOE_003: {
            role: 'MOE',
            fullName: 'ท่านปลัด สุรเวช',
            org: 'สำนักงานปลัดกระทรวงการศึกษา',
            avatar: 'SV',
            color: 'id-moe',
            status: 'AWAY',
        },
        MOE_004: {
            role: 'MOE',
            fullName: 'ท่านรองปลัด พิมพ์ใจ',
            org: 'สำนักงานปลัดกระทรวงการศึกษา',
            avatar: 'PJ',
            color: 'id-moe',
        },
        MOE_005: {
            role: 'MOE',
            fullName: 'ท่านผู้ตรวจราชการ ธีรพล',
            org: 'สำนักงานปลัดกระทรวงการศึกษา',
            avatar: 'TP',
            color: 'id-moe',
        },
        MOE_006: {
            role: 'MOE',
            fullName: 'ท่านหัวหน้าผู้ตรวจ สุพรรณ',
            org: 'สำนักงานปลัดกระทรวงการศึกษา',
            avatar: 'SP',
            color: 'id-moe',
        },

        // --- SYSTEM ADMIN ---
        SYS_ADMIN_001: {
            role: 'ADMIN',
            fullName: 'ผู้ดูแลระบบส่วนกลาง (System Admin)',
            name: 'IDLPMS Admin',
            org: 'Central Administration',
            avatar: 'SA',
            color: 'vs-accent',
            specialRoles: ['ADMIN', 'DEVELOPER']
        }
    },

    // Dashboard Stats Mock
    stats: {
        global: {
            totalStudents: '10,245,670',
            totalSchools: '30,120',
            activeUsers: '1.2M',
        },
        school: {
            attendance: '98%',
            pendingGrades: 12,
            activeLessons: 4,
        },
    },

    // --- Command Groups (Multi-user Channels) ---
    groups: {
        GRP_001: {
            id: 'GRP_001',
            name: 'คณะกรรมการสถานศึกษา (SCH_001)',
            type: 'COUNCIL',
            members: ['SCH_DIR_001', 'TEA_001', 'PAR_001'],
            avatar: 'CS',
            color: 'id-dir',
        },
        GRP_002: {
            id: 'GRP_002',
            name: 'ทีมบริหารเขตพื้นที่ (ESA_01)',
            type: 'ADMIN',
            members: ['ESA_DIR_001', 'SCH_DIR_001', 'SCH_DIR_002'],
            avatar: 'EA',
            color: 'id-esa',
        },
        GRP_003: {
            id: 'GRP_003',
            name: 'กลุ่มสาระการเรียนรู้ภาษาไทย (Core)',
            type: 'SUBJECT',
            members: ['TEA_001', 'TEA_005'],
            avatar: 'TH',
            color: 'sj-thai',
        },
    },

    // --- Score System Configuration ---
    scoreSystem: {
        semestersPerYear: 2,
        lessonsPerSemester: 20,
        questionsPerPretest: 5,
        questionsPerPosttest: 5,
        // Score breakdown per semester (total 50)
        semesterScore: {
            total: 50,
            learningScore: 25, // คะแนนเก็บจากระบบ (Normalize จาก Post-test)
            finalExamScore: 15, // สอบปลายภาค
            teacherScore: 10, // คะแนนจากครู (Manual)
        },
        // Final exam breakdown (15 points)
        finalExam: {
            multipleChoice: 10, // ปรนัย 20 ข้อ (2 ข้อ = 1 คะแนน)
            shortAnswer: 5, // อัตนัย (AI ตรวจ)
        },
        // Score ratio by subject type (เก็บ:สอบ)
        scoreRatio: {
            academic: { learning: 70, exam: 30 }, // วิชาการ
            practical: { learning: 80, exam: 20 }, // ปฏิบัติ
        },
        // Pass conditions for each step
        passConditions: {
            KNOW: { type: 'complete' },
            LINK: { type: 'acknowledge' },
            DO: { type: 'video', minPercent: 25 },
            SYNC: { type: 'score', minPercent: 80 },
            REFLECT: { type: 'score', minPercent: 70 },
            PROVE: { type: 'score', minPercent: 70 },
            MASTER: { type: 'score', minPercent: 80 },
        },
    },

    // --- 7 Steps Learning Model ---
    learningSteps: {
        KNOW: {
            id: 'KNOW',
            order: 1,
            label: 'Know',
            labelTH: 'รู้จักตัวเอง',
            meta: 'Pre-test',
            description: 'ทำ Pre-test 5 ข้อ เพื่อวัดความรู้เดิม',
            icon: 'i-clipboard-check',
        },
        LINK: {
            id: 'LINK',
            order: 2,
            label: 'Link',
            labelTH: 'เชื่อมโยง',
            meta: 'KPA Objectives',
            description: 'เรียนรู้จุดประสงค์ K-P-A ของบทเรียน',
            icon: 'i-link',
        },
        DO: {
            id: 'DO',
            order: 3,
            label: 'Do',
            labelTH: 'ลงมือเรียน',
            meta: 'Video + Content',
            description: 'ดู Video (DLTV) + อ่านสรุป + Infographic',
            icon: 'i-play',
        },
        SYNC: {
            id: 'SYNC',
            order: 4,
            label: 'Sync',
            labelTH: 'เชื่อมความรู้',
            meta: 'Integration',
            description: 'Fill-in / Drag-drop / Match',
            icon: 'i-squares',
        },
        REFLECT: {
            id: 'REFLECT',
            order: 5,
            label: 'Reflect',
            labelTH: 'ฝึกฝน',
            meta: 'Practice',
            description: 'แบบฝึกหัด / ใบงาน',
            icon: 'i-document-check',
        },
        PROVE: {
            id: 'PROVE',
            order: 6,
            label: 'Prove',
            labelTH: 'พิสูจน์',
            meta: 'Post-test',
            description: 'Post-test 5 ข้อ + Self-rating',
            icon: 'i-shield',
        },
        MASTER: {
            id: 'MASTER',
            order: 7,
            label: 'Master',
            labelTH: 'เชี่ยวชาญ',
            meta: 'Challenge',
            description: 'Mastery Challenge',
            icon: 'i-trophy',
        },
    },

    // --- Curriculum Map (The Academic Backbone) ---
    // 8 กลุ่มสาระการเรียนรู้ + 20 บทเรียน/วิชา/เทอม
    curriculum: {
        THAI: {
            id: 'THAI',
            name: 'ภาษาไทย',
            nameEN: 'Thai Language',
            color: 'sj-thai',
            icon: 'i-book',
            scoreRatio: 'academic',
            dltvChannel: 'DLTV1-6',
            totalLessons: 20,
            units: [
                {
                    id: 'TH_U1',
                    name: 'หน่วยที่ 1: การอ่าน',
                    lessons: [
                        {
                            id: 'TH_L01',
                            name: 'การอ่านจับใจความจากสารานุกรมไทย',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100488',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_93663-v-202411051545-100488.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'การอ่านจับใจความเป็นการอ่านเพื่อหาสาระสำคัญของเรื่อง ช่วยให้เข้าใจแนวความคิดหรือทัศนะของผู้เขียนที่ต้องการสื่อสารไปถึงผู้อ่าน ซึ่งการอ่านจับใจความโดยคำนึงถึงมารยาทในการอ่านจะช่วยให้เราสามารถนำไปใช้ในชีวิตประจำวันได้',
                                objectives: [
                                    'บอกหลักการอ่านจับใจความจากเรื่องที่อ่านได้ (K)',
                                    'จับใจความจากสารานุกรมได้ (P)',
                                    'มีมารยาทในการอ่าน (A)'
                                ],
                                evaluation: [
                                    'ตรวจการเขียนแผนภาพความคิด (ร้อยละ 60 ขึ้นไป)',
                                    'ตรวจใบงานที่ 1 เรื่อง การอ่านจับใจความจากสารานุกรม',
                                    'สังเกตพฤติกรรมมารยาทในการอ่าน'
                                ]
                            }
                        },
                        {
                            id: 'TH_L02',
                            name: 'การระบุความรู้จากเรื่องที่อ่าน',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100489',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_93665-v-202411051548-100489.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'การระบุความรู้จากเรื่องที่อ่านเป็นการอ่านเพื่อจับใจความ เพิ่มพูนความรู้ของตนเอง ซึ่งจะต้องอาศัยการอ่านละเอียดพิจารณาข้อความแยกสารที่เป็นข้อเท็จจริงและข้อคิดเห็น แล้วจึงจะสามารถจับประเด็นที่เป็นความรู้ที่สามารถนำมาเป็นประโยชน์กับตนเองได้',
                                objectives: [
                                    'บอกหลักการระบุความรู้จากเรื่องที่อ่านได้ (K)',
                                    'ระบุความรู้จากการอ่านสารานุกรมได้ (P)',
                                    'มีมารยาทในการอ่าน (A)'
                                ],
                                evaluation: [
                                    'ตรวจการเขียนแผนภาพความคิดสรุปหลักการระบุความรู้',
                                    'ตรวจใบงานที่ 2 เรื่อง การระบุความรู้จากการอ่าน',
                                    'สังเกตพฤติกรรมมารยาทในการอ่าน'
                                ]
                            }
                        },
                        {
                            id: 'TH_L03',
                            name: 'การวิเคราะห์และแสดงความคิดเห็นจากเรื่องที่อ่าน',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100490',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_93666-v-202411051550-100490.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'การวิเคราะห์เรื่องที่อ่านเป็นการพิจารณาไตร่ตรองสารที่อ่านโดยละเอียด ช่วยให้ผู้อ่านเข้าใจเรื่องที่อ่านทั้งด้านความรู้และข้อมูลต่าง ๆ และเมื่อวิเคราะห์อย่างถี่ถ้วนแล้ว การแสดงความคิดเห็นจะเป็นการพัฒนากระบวนการคิดขั้นสูง',
                                objectives: [
                                    'บอกหลักการวิเคราะห์และแสดงความคิดเห็นจากเรื่องที่อ่านได้ (K)',
                                    'เขียนวิเคราะห์และแสดงความคิดเห็นจากการอ่านสารานุกรมได้ (P)',
                                    'นำประโยชน์ที่ได้จากการอ่านไปใช้ในชีวิตประจำวันได้ (A)'
                                ],
                                evaluation: [
                                    'สังเกตการตอบคำถามสำคัญ',
                                    'ตรวจใบงานที่ 3 เรื่อง การวิเคราะห์และแสดงความคิดเห็นจากเรื่องที่อ่าน',
                                    'ประเมินการบอกประโยชน์และการนำความรู้ไปปรับใช้'
                                ]
                            }
                        },
                        {
                            id: 'TH_L04',
                            name: 'การแยกข้อเท็จจริงและข้อคิดเห็น จากเรื่องที่อ่าน',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100491',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_93668-v-202411051553-100491.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'ผู้อ่านจะต้องทำความเข้าใจและทำการวิเคราะห์ข้อเท็จหรือข้อคิดเห็น เพื่อเลือกรับข้อมูลข่าวสารที่เป็นประโยชน์ต่อการดำเนินชีวิตประจำวัน',
                                objectives: [
                                    'บอกหลักการแยกข้อเท็จจริงและข้อคิดเห็นจากเรื่องที่อ่านได้ (K)',
                                    'แยกข้อเท็จจริงและข้อคิดเห็นจากเรื่องที่อ่านได้ถูกต้อง (P)',
                                    'พิจารณาสารได้อย่างมีวิจารณญาณ (A)'
                                ],
                                evaluation: [
                                    'ตรวจแผนภาพความคิดการแยกข้อเท็จจริงและข้อคิดเห็น',
                                    'ประเมินการทำใบงานที่ 4',
                                    'พิจารณาการตอบคำถามสำคัญเกี่ยวกับการนำความรู้ไปใช้'
                                ]
                            }
                        },
                        {
                            id: 'TH_L05_ext',
                            name: 'การวิเคราะห์ความน่าเชื่อถือจากเรื่องที่ฟังและดู',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100492',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_93669-v-202411051555-100492.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'ผู้รับสารต้องวิเคราะห์ความน่าเชื่อถือจากเรื่องที่ฟังและดู เพื่อกลั่นกรองความน่าเชื่อถือของสารและสามารถนำข้อมูลความรู้ต่าง ๆ ไปปรับใช้ให้เกิดประโยชน์ได้อย่างถูกต้องเหมาะสม',
                                objectives: [
                                    'บอกหลักการวิเคราะห์ความน่าเชื่อถือ (K)',
                                    'วิเคราะห์ความน่าเชื่อถือจากเรื่องที่ฟังและดูได้ (P)',
                                    'วิเคราะห์ความน่าเชื่อถือได้อย่างมีวิจารณญาณ (A)'
                                ],
                                evaluation: [
                                    'สังเกตการตอบคำถามหลักการวิเคราะห์ความน่าเชื่อถือ',
                                    'ตรวจใบงานที่ 5 เรื่อง การวิเคราะห์ความน่าเชื่อถือ',
                                    'สังเกตการตอบคำถามสรุปบทเรียนและประโยชน์ที่ได้รับ'
                                ]
                            }
                        },
                    ],
                },
                {
                    id: 'TH_U2',
                    name: 'หน่วยที่ 2: หลักภาษา',
                    lessons: [
                        {
                            id: 'TH_L06',
                            name: 'คำบุพบท',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100493',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'คำบุพบท เป็นคำที่ปรากฏหน้านามวลีและประกอบเข้าด้วยกันเป็นบุพบทวลี ซึ่งคำบุพบทใช้บอกความหมายหลายประการจึงควรใช้คำบุพบทได้อย่างถูกต้อง',
                                objectives: [
                                    'บอกความหมาย ลักษณะ และหน้าที่ของคำบุพบทได้ (K)',
                                    'ใช้คำบุพบทได้ถูกต้องตามความหมาย และหน้าที่ (P)',
                                    'เห็นความสำคัญของการใช้คำบุพบทให้ถูกต้อง (A)'
                                ],
                                evaluation: [
                                    'สังเกตการตอบคำถามสรุปความหมาย ลักษณะ และหน้าที่ของคำบุพบท',
                                    'ตรวจใบงานที่ 6 เรื่อง คำบุพบท',
                                    'สังเกตการตอบคำถามสรุปบทเรียน'
                                ]
                            }
                        },
                        {
                            id: 'TH_L07',
                            name: 'คำลงท้าย',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100494',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'คำลงท้ายเป็นคำที่อยู่ท้ายประโยคที่แสดงเจตนา ความรู้สึก หรือเป็นคำลงท้ายที่แสดงความสุภาพหรือไม่สุภาพ จึงต้องเลือกใช้คำลงท้ายให้เหมาะสม',
                                objectives: [
                                    'บอกความหมาย ลักษณะของคำลงท้ายได้ (K)',
                                    'ใช้คำลงท้ายได้ถูกต้องตามลักษณะ (P)',
                                    'เห็นความสำคัญของการใช้คำลงท้ายให้เหมาะสม (A)'
                                ],
                                evaluation: [
                                    'สังเกตการตอบคำถาม โดยบอกความหมาย ลักษณะของคำลงท้าย',
                                    'ตรวจใบงานที่ 7 เรื่อง คำลงท้าย',
                                    'สังเกตการตอบคำถามสรุปบทเรียน'
                                ]
                            }
                        },
                        {
                            id: 'TH_L08',
                            name: 'คำปฏิเสธ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100495',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_93828-v-202411110813-100495.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'คำปฏิเสธ คือ คำที่ใช้บอกปัดหรือไม่ยอมรับ การเลือกใช้คำปฏิเสธจะต้องทำความเข้าใจเพื่อนำไปใช้ได้เหมาะสมตามสถานการณ์',
                                objectives: [
                                    'บอกความหมาย ลักษณะของคำปฏิเสธได้ (K)',
                                    'ใช้คำปฏิเสธได้ถูกต้องตามลักษณะ (P)',
                                    'เห็นความสำคัญของการใช้คำปฏิเสธให้เหมาะสม (A)'
                                ],
                                evaluation: [
                                    'สังเกตการตอบคำถาม โดยบอกความหมาย ลักษณะของคำปฏิเสธ',
                                    'ตรวจใบงานที่ 8 เรื่อง คำปฏิเสธ',
                                    'สังเกตการตอบคำถามสรุปบทเรียน'
                                ]
                            }
                        },
                        {
                            id: 'TH_L09',
                            name: 'การเขียนแผนภาพโครงเรื่อง (1)',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100496',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_93709-v-202411061313-100496.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'การเขียนแผนภาพโครงเรื่อง เป็นงานเขียนที่มีการวางโครงเรื่องโดยตัวละคร ฉาก และดำเนินเรื่องตามเหตุการณ์ ต้องอาศัยการตั้งคำถาม ตอบคำถามจากเรื่องที่อ่าน แผนภาพโครงเรื่องช่วยให้งานเขียนมีคุณภาพ สื่อสารได้ตรงตามจุดประสงค์และได้ความสมบูรณ์ครบถ้วน',
                                objectives: [
                                    'บอกหลักการเขียนแผนภาพโครงเรื่องได้ (K)',
                                    'เขียนแผนภาพโครงเรื่องโดยใช้ความรู้จากเรื่องชนิดของคำได้ (P)',
                                    'มีมารยาทในการเขียนแผนภาพโครงเรื่อง (A)'
                                ],
                                evaluation: [
                                    'สังเกตการตอบคำถาม โดยบอกหลักการเขียนแผนภาพโครงเรื่อง',
                                    'ตรวจใบงานที่ 9 เรื่อง การเขียนแผนภาพโครงเรื่อง (1)',
                                    'สังเกตการตอบคำถามสรุปบทเรียน'
                                ]
                            }
                        },
                        {
                            id: 'TH_L10',
                            name: 'การเขียนแผนภาพโครงเรื่อง (2)',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100497',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_93710-v-202411061315-100497.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'การเขียนแผนภาพโครงเรื่อง เป็นงานเขียนที่มีการวางโครงเรื่องโดยตัวละคร ฉาก และดำเนินเรื่องตามเหตุการณ์ ต้องอาศัยการตั้งคำถาม ตอบคำถามจากเรื่องที่อ่าน แผนภาพโครงเรื่องช่วยให้งานเขียนมีคุณภาพ สื่อสารได้ตรงตามจุดประสงค์และได้ความสมบูรณ์ครบถ้วน',
                                objectives: [
                                    'บอกหลักการเขียนแผนภาพโครงเรื่องได้ (K)',
                                    'เขียนเรื่องสั้นจากแผนภาพโครงเรื่องได้ (P)',
                                    'มีมารยาทในการเขียน (A)'
                                ],
                                evaluation: [
                                    'สังเกตการตอบคำถาม โดยบอกหลักการเขียนแผนภาพโครงเรื่อง',
                                    'ตรวจใบงานที่ 10 เรื่อง การเขียนแผนภาพโครงเรื่อง (2)',
                                    'สังเกตการตอบคำถามสรุปบทเรียน'
                                ]
                            }
                        },
                    ],
                },
                {
                    id: 'TH_U3',
                    name: 'หน่วยที่ 3: หลักภาษา และการอ่าน',
                    lessons: [
                        {
                            id: 'TH_L11',
                            name: 'การอ่านงานเขียนเชิงอธิบาย',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100498',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_93894-v-202411111535-100498.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'การอ่านงานเขียนเชิงอธิบายเป็นการอ่านเพื่อหาความรู้สร้างความเข้าใจชัดเจนและสามารถปฏิบัติตามได้อย่างถูกต้อง เหมาะสม โดยคำนึงถึงมารยาทในการอ่าน',
                                objectives: [
                                    'บอกหลักการอ่านงานเขียนเชิงอธิบายได้ (K)',
                                    'ปฏิบัติตามการเขียนเชิงอธิบายได้ (P)',
                                    'นำความรู้ไปปรับใช้ในชีวิตประจำวันได้ (A)'
                                ],
                                evaluation: [
                                    'ตรวจใบงานที่ 1 เรื่อง การอ่านงานเขียนเชิงอธิบาย',
                                    'ประเมินการเขียนแผนภาพความคิด',
                                    'สังเกตการตอบคำถามสรุปบทเรียน'
                                ]
                            }
                        },
                        {
                            id: 'TH_L12',
                            name: 'การวิเคราะห์ความน่าเชื่อถือจากเรื่องที่ฟังและดูอย่างมีเหตุผล',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100499',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_93963-v-202411130740-100499.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'การวิเคราะห์ความน่าเชื่อถือจากเรื่องที่ฟังและดูอย่างมีเหตุผล ควรวิเคราะห์ ตีความเพื่อทำความเข้าใจเนื้อเรื่อง รวมทั้งวิเคราะห์คุณค่าที่ได้รับจากเรื่องที่ฟังและดู',
                                objectives: [
                                    'บอกหลักการวิเคราะห์ความน่าเชื่อถือจากเรื่องที่ฟังและดู (K)',
                                    'วิเคราะห์ความน่าเชื่อถือจากเรื่องที่ฟังและดูได้อย่างมีเหตุผล (P)',
                                    'นำความรู้ไปปรับใช้ในชีวิตประจำวันได้ (A)'
                                ],
                                evaluation: [
                                    'ตรวจใบงานที่ 2 เรื่อง การวิเคราะห์ความน่าเชื่อถือ',
                                    'ประเมินการเขียนแผนภาพความคิดวิเคราะห์ความน่าเชื่อถือ',
                                    'สังเกตพฤติกรรมการฟังและดู'
                                ]
                            }
                        },
                    ],
                },
                {
                    id: 'TH_U4',
                    name: 'หน่วยที่ 4: การใช้ประโยค และการอ่านจับใจความ',
                    lessons: [
                        {
                            id: 'TH_L13',
                            name: 'การจำแนกส่วนประกอบของประโยค',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100500',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_94047-v-202411151022-100500.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'การจำแนกส่วนประกอบของประโยค เป็นการพิจารณาหน้าที่ของคำในประโยค จะช่วยให้เข้าใจโครงสร้างของประโยค และใช้ประโยคในการสื่อสารได้ถูกต้อง',
                                objectives: [
                                    'บอกหลักการจำแนกส่วนประกอบของประโยคได้ (K)',
                                    'จำแนกส่วนประกอบของประโยคได้ถูกต้อง (P)',
                                    'เห็นความสำคัญของการใช้ประโยคในการสื่อสาร (A)'
                                ],
                                evaluation: [
                                    'ตรวจใบงานที่ 3 เรื่อง การจำแนกส่วนประกอบของประโยค',
                                    'สังเกตการตอบคำถาม',
                                    'สังเกตความตั้งใจเรียน'
                                ]
                            }
                        },
                        {
                            id: 'TH_L14',
                            name: 'การจับใจความ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100501',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_93964-v-202411130741-100501.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'การอ่านจับใจความเป็นการอ่านเพื่อหาสาระสำคัญของเรื่อง ช่วยให้เข้าใจเนื้อหา ความรู้ แนวความคิดหรือทัศนะของผู้เขียนที่ต้องการสื่อสารไปถึงผู้อ่าน',
                                objectives: [
                                    'บอกหลักการอ่านจับใจความจากเรื่องที่อ่านได้ (K)',
                                    'จับใจความจากการอ่านได้ (P)',
                                    'มีมารยาทในการอ่าน (A)'
                                ],
                                evaluation: [
                                    'ตรวจใบงานที่ 4 เรื่อง การจับใจความจากเรื่องที่อ่าน',
                                    'สังเกตพฤติกรรมมารยาทในการอ่าน',
                                    'สังเกตการร่วมกิจกรรมกลุ่ม'
                                ]
                            }
                        },
                        {
                            id: 'TH_L15',
                            name: 'การระบุความรู้จากการอ่าน',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100502',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_94147-v-202411201004-100502.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'การระบุความรู้จากเรื่องที่อ่านเป็นการอ่านเพื่อจับใจความ เพิ่มพูนความรู้ของตนเอง ระบุความรู้จากเรื่องที่อ่านและนำมาเรียบเรียงเป็นสำนวนภาษาของตนเอง',
                                objectives: [
                                    'บอกหลักการระบุความรู้จากเรื่องที่อ่านได้ (K)',
                                    'ระบุความรู้จากการอ่านได้ (P)',
                                    'มีมารยาทในการอ่าน (A)'
                                ],
                                evaluation: [
                                    'ตรวจใบงานที่ 5 เรื่อง การระบุความรู้จากการอ่าน',
                                    'สังเกตพฤติกรรมมารยาทในการอ่าน',
                                    'ประเมินการเขียนสรุปความรู้'
                                ]
                            }
                        },
                    ],
                },
                {
                    id: 'TH_U5',
                    name: 'หน่วยที่ 5: การเขียนบันทึก และการวิเคราะห์วรรณคดี',
                    lessons: [
                        {
                            id: 'TH_L16',
                            name: 'การเขียนบันทึก (1)',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100503',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_94137-v-202411200856-100503.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'การเขียนบันทึกเป็นการจดบันทึกข้อมูล หรือประสบการณ์ความรู้ เป็นการนำกระบวนการเรียนรู้ต่าง ๆ เรียบเรียงและเขียนอย่างเป็นระบบ',
                                objectives: [
                                    'บอกหลักการเขียนบันทึกเหตุการณ์ได้ (K)',
                                    'เขียนบันทึกเหตุการณ์ได้ (P)',
                                    'นำความรู้ไปปรับใช้ในชีวิตประจำวันได้ (A)'
                                ],
                                evaluation: [
                                    'ประเมินการตอบคำถามเกี่ยวกับหลักการเขียนบันทึกเหตุการณ์',
                                    'ตรวจใบงานที่ 6 เรื่อง การเขียนบันทึกเหตุการณ์',
                                    'สังเกตพฤติกรรมการเขียน'
                                ]
                            }
                        },
                        {
                            id: 'TH_L17',
                            name: 'การเขียนบันทึก (2)',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100504',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_94138-v-202411200857-100504.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'การเขียนบันทึกเป็นการจดบันทึกข้อมูล หรือประสบการณ์ความรู้ เป็นการนำกระบวนการเรียนรู้ต่าง ๆ เรียบเรียงและเขียนอย่างเป็นระบบ',
                                objectives: [
                                    'บอกหลักการเขียนบันทึกประสบการณ์ได้ (K)',
                                    'เขียนบันทึกประสบการณ์ได้ (P)',
                                    'นำความรู้ไปปรับใช้ได้ (A)'
                                ],
                                evaluation: [
                                    'ประเมินการตอบคำถามเกี่ยวกับหลักการเขียนบันทึกประสบการณ์',
                                    'ตรวจใบงานที่ 7 เรื่อง การเขียนบันทึกประสบการณ์',
                                    'สังเกตพฤติกรรมความมุ่งมั่นในการทำงาน'
                                ]
                            }
                        },
                        {
                            id: 'TH_L18',
                            name: 'การวิเคราะห์วรรณคดีหรือวรรณกรรม (1)',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100505',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_94148-v-202411201005-100505.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'การวิเคราะห์วรรณคดีหรือวรรณกรรม จำเป็นต้องศึกษาเนื้อหา คำศัพท์ต่าง ๆ เพื่อสร้างความรู้ ความเข้าใจ เกี่ยวกับเนื้อหาได้อย่างถูกต้อง อีกทั้งฝึกการเรียบเรียงภาษา จะช่วยให้ผู้อ่านเข้าใจเรื่องราวและแสดงความคิดเห็นได้อย่างมีมารยาท',
                                objectives: [
                                    'บอกหลักการวิเคราะห์วรรณคดีหรือวรรณกรรมขั้นพื้นฐาน (K)',
                                    'วิเคราะห์วรรณคดีหรือวรรณกรรมขั้นพื้นฐาน (P)',
                                    'เห็นถึงคุณค่าของการวิเคราะห์วรรณคดีหรือวรรณกรรมขั้นพื้นฐาน (A)'
                                ],
                                evaluation: [
                                    'บอกหลักการสรุปเรื่องจากเรื่องที่อ่านได้',
                                    'เขียนสรุปเรื่องผู้รู้ดีเป็นผู้เจริญได้ (ใบงานที่ 8)',
                                    'นำความรู้และข้อคิดไปปรับใช้ได้'
                                ]
                            }
                        },
                        {
                            id: 'TH_L19',
                            name: 'การวิเคราะห์วรรณคดีหรือวรรณกรรม (2)',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100506',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_94202-v-202411211203-100506.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'การวิเคราะห์วรรณคดีหรือวรรณกรรม จำเป็นต้องศึกษาเนื้อหา คำศัพท์ต่าง ๆ เพื่อสร้างความรู้ ความเข้าใจ เกี่ยวกับเนื้อหาได้อย่างถูกต้อง อีกทั้งฝึกการเรียบเรียงภาษา จะช่วยให้ผู้อ่านเข้าใจเรื่องราวและแสดงความคิดเห็นได้อย่างมีมารยาท',
                                objectives: [
                                    'บอกหลักการวิเคราะห์วรรณคดีหรือวรรณกรรมขั้นพื้นฐาน (K)',
                                    'วิเคราะห์วรรณคดีหรือวรรณกรรมขั้นพื้นฐาน (P)',
                                    'เห็นถึงคุณค่าของการวิเคราะห์วรรณคดีหรือวรรณกรรมขั้นพื้นฐาน (A)'
                                ],
                                evaluation: [
                                    'บอกหลักการสรุปเรื่องจากเรื่องที่อ่านได้',
                                    'เขียนสรุปเรื่องผู้รู้ดีเป็นผู้เจริญได้ (ใบงานที่ 8)',
                                    'นำความรู้และข้อคิดไปปรับใช้ได้'
                                ]
                            }
                        },
                        {
                            id: 'TH_L20',
                            name: 'การวิเคราะห์คุณค่าจากเรื่องที่อ่าน',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100507',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_94368-v-202411280806-100507.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'การวิเคราะห์คุณค่าจากเรื่องที่อ่านมีคุณค่าด้านเนื้อหา ด้านวรรณศิลป์ คุณค่าด้านสังคมและวัฒนธรรม และให้ข้อคิดคติเตือนใจ สามารถนำไปปรับใช้ในชีวิตประจำวันได้',
                                objectives: [
                                    'บอกหลักการวิเคราะห์คุณค่าจากเรื่องที่อ่านได้ (K)',
                                    'เขียนวิเคราะห์คุณค่าเรื่องที่อ่านได้ (P)',
                                    'นำคุณค่าและข้อคิดไปใช้ในชีวิตประจำวันได้ (A)'
                                ],
                                evaluation: [
                                    'บอกหลักการวิเคราะห์คุณค่าจากเรื่องที่อ่านได้',
                                    'เขียนวิเคราะห์คุณค่าจากเรื่องที่อ่านได้ (ใบงานที่ 9)',
                                    'สังเกตพฤติกรรมการนำข้อคิดไปปรับใช้'
                                ]
                            }
                        },
                    ],
                },
            ],
        },
        MATH: {
            id: 'MATH',
            name: 'คณิตศาสตร์',
            nameEN: 'Mathematics',
            color: 'sj-math',
            icon: 'i-calculator',
            scoreRatio: 'academic',
            dltvChannel: 'DLTV1-6',
            totalLessons: 20,
            units: [
                {
                    id: 'MA_U1',
                    name: 'หน่วยที่ 1: จำนวนและการดำเนินการ',
                    lessons: [
                        {
                            id: 'MA_L01',
                            name: 'ทบทวนคูณหาร',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100558',
                            videoSource: 'HLS',
                        },
                        {
                            id: 'MA_L02',
                            name: 'คูณเศษส่วน',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100559',
                            videoSource: 'HLS',
                        },
                        {
                            id: 'MA_L03',
                            name: 'บัญญัติไตรยางศ์ (1)',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100560',
                            videoSource: 'HLS',
                        },
                        {
                            id: 'MA_L04',
                            name: 'บัญญัติไตรยางศ์ (2)',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100561',
                            videoSource: 'HLS',
                        },
                    ],
                },
                {
                    id: 'MA_U2',
                    name: 'หน่วยที่ 2: อัตราส่วนและร้อยละ',
                    lessons: [
                        {
                            id: 'MA_L05',
                            name: 'อัตราส่วน',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/200005',
                        },
                        {
                            id: 'MA_L06',
                            name: 'สัดส่วน',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/200006',
                        },
                        {
                            id: 'MA_L07',
                            name: 'ร้อยละ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/200007',
                        },
                        {
                            id: 'MA_L08',
                            name: 'โจทย์ปัญหาร้อยละ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/200008',
                        },
                    ],
                },
                {
                    id: 'MA_U3',
                    name: 'หน่วยที่ 3: การวัด',
                    lessons: [
                        {
                            id: 'MA_L09',
                            name: 'ความยาว',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/200009',
                        },
                        {
                            id: 'MA_L10',
                            name: 'พื้นที่',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/200010',
                        },
                        {
                            id: 'MA_L11',
                            name: 'ปริมาตร',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/200011',
                        },
                        {
                            id: 'MA_L12',
                            name: 'น้ำหนักและเวลา',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/200012',
                        },
                    ],
                },
                {
                    id: 'MA_U4',
                    name: 'หน่วยที่ 4: เรขาคณิต',
                    lessons: [
                        {
                            id: 'MA_L13',
                            name: 'รูปเรขาคณิต',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/200013',
                        },
                        {
                            id: 'MA_L14',
                            name: 'มุมและเส้นขนาน',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/200014',
                        },
                        {
                            id: 'MA_L15',
                            name: 'รูปสามเหลี่ยม',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/200015',
                        },
                        {
                            id: 'MA_L16',
                            name: 'รูปวงกลม',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/200016',
                        },
                    ],
                },
                {
                    id: 'MA_U5',
                    name: 'หน่วยที่ 5: สถิติและความน่าจะเป็น',
                    lessons: [
                        {
                            id: 'MA_L17',
                            name: 'การเก็บรวบรวมข้อมูล',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/200017',
                        },
                        {
                            id: 'MA_L18',
                            name: 'แผนภูมิและกราฟ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/200018',
                        },
                        {
                            id: 'MA_L19',
                            name: 'ค่าเฉลี่ย',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/200019',
                        },
                        {
                            id: 'MA_L20',
                            name: 'ความน่าจะเป็น',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/200020',
                        },
                    ],
                },
            ],
        },
        SCI: {
            id: 'SCI',
            name: 'วิทยาศาสตร์',
            nameEN: 'Science',
            color: 'sj-sci',
            icon: 'i-beaker',
            scoreRatio: 'academic',
            dltvChannel: 'DLTV1-6',
            totalLessons: 20,
            units: [
                {
                    id: 'SC_U1',
                    name: 'หน่วยที่ 1: สิ่งมีชีวิต',
                    lessons: [
                        {
                            id: 'SC_L01',
                            name: 'เราจะเลือกรับประทานอาหารอย่างไรให้เหมาะกับตนเอง (1)',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100673',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_92864-v-202409020921-100673.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                indicator: 'ว 1.2 ป.6/1',
                                summary: 'บทเรียนนี้ครอบคลุมทั้ง "สารอาหาร" ที่ร่างกายต้องการ และ "ระบบย่อยอาหาร" ที่ทำหน้าที่แปรสภาพอาหารเหล่านั้น ระบบย่อยอาหารทำงานร่วมกันระหว่างฟัน เอนไซม์ และอวัยวะภายใน เพื่อเปลี่ยนโมเลกุลใหญ่ให้เป็นสารอาหารขนาดเล็กที่ดูดซึมเข้าสู่กระแสเลือดได้ รวมถึงเน้นความเข้าใจเรื่องการทำงานของเอนไซม์เฉพาะจุด',

                                // Step 2: KPA Objectives
                                objectives: {
                                    K: 'อธิบายหน้าที่ของอวัยวะในระบบย่อยอาหารและระบุชื่อเอนไซม์ที่เกี่ยวข้องได้',
                                    P: 'วิเคราะห์ความสัมพันธ์ระหว่างสารอาหารประเภทต่างๆ กับการดูดซึมในทางเดินอาหาร',
                                    A: 'ตระหนักถึงการดูแลรักษาระบบย่อยอาหารเพื่อสุขภาพที่ดีในระยะยาว'
                                },

                                // Step 3: Content Sections - Mastery Level
                                contentSections: [
                                    {
                                        title: 'CORE CONCEPT: โรงงานแปรสภาพพลังงาน',
                                        content: 'ร่างกายเปลี่ยน "อาหาร" เป็น "พลังงาน" ผ่านการเดินทางจากปากสู่ทวารหนัก การย่อยเชิงเคมีโดยเอนไซม์คือหัวใจสำคัญที่ทำให้สารอาหารซึมผ่านผนังลำไส้เล็กเข้าสู่กระแสเลือดได้',
                                        source: 'WEB'
                                    },
                                    {
                                        title: 'DETAILED: การเดินทางสารอาหารและเอนไซม์',
                                        content: '1. ปาก: น้ำลายมีเอนไซม์ "อะไมเลส" (Amylase) ย่อยแป้งเป็นน้ำตาล\n2. กระเพาะอาหาร: ย่อยโปรตีนด้วย "เพปซิน" (Pepsin) ทำงานได้ดีในสภาวะกรด (HCl)\n3. ตับและตับอ่อน: ตับสร้าง "น้ำดี" (Bile) มาช่วยให้ไขมันแตกตัว ส่วนตับอ่อนสร้าง "ทริปซิน" (Trypsin) ย่อยโปรตีนต่อ และ "สเตียปซิน/ไลเปส" (Steapsin/Lipase) ย่อยไขมัน',
                                        source: 'DLTV'
                                    },
                                    {
                                        title: 'DETAILED: การดูดซึมที่ลำไส้เล็กและใหญ่',
                                        content: 'ลำไส้เล็กคือจุดที่ "ย่อยเสร็จสิ้นทุกอย่าง" และ "ดูดซึมมากที่สุด" มีผนังขรุขระช่วยเพิ่มพื้นที่ผิวในการดูดซึม ส่วนลำไส้ใหญ่จะรับหน้าที่ดูดซึมน้ำและแร่ธาตุที่เหลือกลับคืนสู่ร่างกาย ก่อนจะเหลือเป็นกากอาหารถูกขับออก',
                                        source: 'DLTV'
                                    },
                                    {
                                        title: 'TEACHER’S INSIGHTS: เกร็ดความรู้จากบทเรียน 50 นาที',
                                        content: 'รู้หรือไม่? ทำไมเราควรเคี้ยวอาหารให้ละเอียด? เพราะการเคี้ยวคือการ "ย่อยเชิงกล" ที่ช่วยเพิ่มพื้นที่ผิวให้อาหารสัมผัสกับเอนไซม์ได้มากขึ้น ทำให้ระบบย่อยทำงานได้เร็วและมีประสิทธิภาพสูงขึ้น ลดอาการท้องอืด! และจำไว้ว่า "น้ำดี" จากตับ ไม่ใช่เอนไซม์ แต่เป็นตัวช่วยทำให้ไขมันแตกตัวคล้ายน้ำยาล้างจานทำปฏิกิริยากับคราบไขมันนั่นเอง',
                                        source: 'LECTURE_NOTES'
                                    }
                                ],

                                // Step 4: SYNC Activities (Interactive)
                                syncActivities: {
                                    type: 'MATCH',
                                    instruction: 'จับคู่สารอาหารกับหน้าที่หลักให้ถูกต้อง',
                                    pairs: [
                                        { left: 'โปรตีน', right: 'ซ่อมแซมส่วนที่สึกหรอ' },
                                        { left: 'คาร์โบไฮเดรต', right: 'แหล่งพลังงานหลัก' },
                                        { left: 'ไขมัน', right: 'ให้ความอบอุ่นแก่ร่างกาย' },
                                        { left: 'วิตามิน/แร่ธาตุ', right: 'ช่วยให้ร่างกายทำงานปกติ' }
                                    ]
                                },

                                // Step 5: REFLECT Tasks (Practice)
                                reflectTasks: [
                                    {
                                        type: 'OPEN_ENDED',
                                        question: 'หากนักเรียนต้องเลือกรับประทานอาหาร 1 อย่าง เพื่อให้ได้พลังงานในการวิ่งแข่ง นักเรียนจะเลือกอาหารประเภทใด เพราะเหตุใด?',
                                        hints: ['คิดถึงสารอาหารที่ให้พลังงานเร็วที่สุด', 'ข้าว แป้ง น้ำตาล คืออะไร'],
                                        source: 'WORKSHEET'
                                    }
                                ],

                                // Step 7: MASTER Challenge (Scenario)
                                masterChallenge: {
                                    type: 'SCENARIO',
                                    scenario: 'สมมติว่านักเรียนกำลังวางแผนรายการอาหารกลางวันสำหรับเพื่อนที่ต้องการเสริมสร้างกล้ามเนื้อและต้องการพลังงานในการทำกิจกรรม',
                                    question: 'ให้นักเรียนออกแบบรายการอาหาร 1 มื้อ โดยระบุว่าในแต่ละเมนูมีสารอาหารประเภทใดบ้างและส่งผลดีต่อร่างกายอย่างไร?',
                                    rubric: [
                                        'ระบุรายการอาหารที่ครบ 5 หมู่',
                                        'อธิบายประเภทสารอาหารในแต่ละหมู่ได้ถูกต้อง',
                                        'บอกประโยชน์ที่สอดคล้องกับความต้องการ (สร้างกล้ามเนื้อ/พลังงาน)'
                                    ]
                                },

                                // Step 1 & 6: Quiz (Pre-test / Post-test)
                                quiz: [
                                    {
                                        question: "อาหารหลัก 5 หมู่ประกอบด้วยสารอาหารกี่ประเภท?",
                                        options: ["ก. 4 ประเภท", "ข. 5 ประเภท", "ค. 6 ประเภท", "ง. 7 ประเภท"],
                                        answer: 2,
                                        kpa: 'K'
                                    },
                                    {
                                        question: "สารอาหารประเภทใดเป็นแหล่งพลังงานหลักของร่างกาย?",
                                        options: ["ก. โปรตีน", "ข. คาร์โบไฮเดรต", "ค. วิตามิน", "ง. แร่ธาตุ"],
                                        answer: 1,
                                        kpa: 'K'
                                    },
                                    {
                                        question: "ถ้าต้องการซ่อมแซมส่วนที่สึกหรอของร่างกาย ควรรับประทานอาหารที่เน้นสารอาหารประเภทใด?",
                                        options: ["ก. ไขมัน", "ข. โปรตีน", "ค. วิตามิน", "ง. แร่ธาตุ"],
                                        answer: 1,
                                        kpa: 'P'
                                    },
                                    {
                                        question: "วิตามินและแร่ธาตุมีหน้าที่สำคัญอย่างไร?",
                                        options: ["ก. ให้พลังงานสูง", "ข. ช่วยให้ร่างกายทำงานได้เป็นปกติ", "ค. สร้างกล้ามเนื้อ", "ง. ให้ความอบอุ่น"],
                                        answer: 1,
                                        kpa: 'P'
                                    },
                                    {
                                        question: "ทำไมน้ำจึงจัดเป็นสารอาหารที่ร่างกายขาดไม่ได้?",
                                        options: ["ก. เพราะให้พลังงานมาก", "ข. เพราะเป็นส่วนประกอบหลักของเลือดและช่วยปรับสมดุล", "ค. เพราะทำให้อิ่มนาน", "ง. เพราะช่วยสร้างไขมัน"],
                                        answer: 1,
                                        kpa: 'A'
                                    }
                                ],

                                harvestedAt: '2026-02-05T10:45:00+07:00'
                            }
                        },
                        {
                            id: 'SC_L02',
                            name: 'ทักษะกระบวนการ (1)',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100625',
                            videoSource: 'HLS',
                        },
                        {
                            id: 'SC_L03',
                            name: 'ทักษะกระบวนการ (2)',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100626',
                            videoSource: 'HLS',
                        },
                        {
                            id: 'SC_L04',
                            name: 'การเกิดเมฆและหมอก',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100630',
                            videoSource: 'HLS',
                        },
                    ],
                },
                {
                    id: 'SC_U2',
                    name: 'หน่วยที่ 2: สารและการเปลี่ยนแปลง',
                    lessons: [
                        {
                            id: 'SC_L05',
                            name: 'สมบัติของสาร',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/300005',
                        },
                        {
                            id: 'SC_L06',
                            name: 'การแยกสาร',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/300006',
                        },
                        {
                            id: 'SC_L07',
                            name: 'การเปลี่ยนแปลงทางกายภาพ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/300007',
                        },
                        {
                            id: 'SC_L08',
                            name: 'การเปลี่ยนแปลงทางเคมี',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/300008',
                        },
                    ],
                },
                {
                    id: 'SC_U3',
                    name: 'หน่วยที่ 3: แรงและการเคลื่อนที่',
                    lessons: [
                        {
                            id: 'SC_L09',
                            name: 'แรงและผลของแรง',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/300009',
                        },
                        {
                            id: 'SC_L10',
                            name: 'แรงเสียดทาน',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/300010',
                        },
                        {
                            id: 'SC_L11',
                            name: 'แรงลอยตัว',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/300011',
                        },
                        {
                            id: 'SC_L12',
                            name: 'การเคลื่อนที่',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/300012',
                        },
                    ],
                },
                {
                    id: 'SC_U4',
                    name: 'หน่วยที่ 4: พลังงาน',
                    lessons: [
                        {
                            id: 'SC_L13',
                            name: 'รูปของพลังงาน',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/300013',
                        },
                        {
                            id: 'SC_L14',
                            name: 'ไฟฟ้า',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/300014',
                        },
                        {
                            id: 'SC_L15',
                            name: 'แสง',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/300015',
                        },
                        {
                            id: 'SC_L16',
                            name: 'เสียง',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/300016',
                        },
                    ],
                },
                {
                    id: 'SC_U5',
                    name: 'หน่วยที่ 5: โลกและอวกาศ',
                    lessons: [
                        {
                            id: 'SC_L17',
                            name: 'โครงสร้างโลก',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/300017',
                        },
                        {
                            id: 'SC_L18',
                            name: 'ปรากฏการณ์ทางธรรมชาติ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/300018',
                        },
                        {
                            id: 'SC_L19',
                            name: 'ระบบสุริยะ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/300019',
                        },
                        {
                            id: 'SC_L20',
                            name: 'ดาวและกาแล็กซี',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/300020',
                        },
                    ],
                },
            ],
        },
        SOC: {
            id: 'SOC',
            name: 'สังคมศึกษา',
            nameEN: 'Social Studies',
            color: 'sj-soc',
            icon: 'i-globe',
            scoreRatio: 'academic',
            dltvChannel: 'DLTV1-6',
            totalLessons: 20,
            units: [
                {
                    id: 'SO_U1',
                    name: 'หน่วยที่ 1: ศาสนา',
                    lessons: [
                        {
                            id: 'SO_L01',
                            name: 'มรดกวัฒนธรรม (1)',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100699',
                            videoSource: 'HLS',
                        },
                        {
                            id: 'SO_L02',
                            name: 'มรดกวัฒนธรรม (2)',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100700',
                            videoSource: 'HLS',
                        },
                        {
                            id: 'SO_L03',
                            name: 'มรดกวัฒนธรรม (3)',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100701',
                            videoSource: 'HLS',
                        },
                        {
                            id: 'SO_L04',
                            name: 'วันสำคัญทางศาสนา',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100702',
                            videoSource: 'HLS',
                        },
                    ],
                },
                {
                    id: 'SO_U2',
                    name: 'หน่วยที่ 2: หน้าที่พลเมือง',
                    lessons: [
                        {
                            id: 'SO_L05',
                            name: 'สิทธิและหน้าที่',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/400005',
                        },
                        {
                            id: 'SO_L06',
                            name: 'กฎหมายเบื้องต้น',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/400006',
                        },
                        {
                            id: 'SO_L07',
                            name: 'ประชาธิปไตย',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/400007',
                        },
                        {
                            id: 'SO_L08',
                            name: 'สถาบันพระมหากษัตริย์',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/400008',
                        },
                    ],
                },
                {
                    id: 'SO_U3',
                    name: 'หน่วยที่ 3: เศรษฐศาสตร์',
                    lessons: [
                        {
                            id: 'SO_L09',
                            name: 'การผลิตและบริโภค',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/400009',
                        },
                        {
                            id: 'SO_L10',
                            name: 'เศรษฐกิจพอเพียง',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/400010',
                        },
                        {
                            id: 'SO_L11',
                            name: 'สหกรณ์',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/400011',
                        },
                        {
                            id: 'SO_L12',
                            name: 'การออมและการลงทุน',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/400012',
                        },
                    ],
                },
                {
                    id: 'SO_U4',
                    name: 'หน่วยที่ 4: ประวัติศาสตร์',
                    lessons: [
                        {
                            id: 'SO_L13',
                            name: 'อารยธรรมอินเดีย',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100753',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_92928-v-202410220907-100753.mp4/master.m3u8',
                            videoSource: 'HLS',
                        },
                        {
                            id: 'SO_L14',
                            name: 'อารยธรรมจีน',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100754',
                            videoSource: 'HLS',
                        },
                        {
                            id: 'SO_L15',
                            name: 'อิทธิพลอารยธรรม',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100755',
                            videoSource: 'HLS',
                        },
                        {
                            id: 'SO_L16',
                            name: 'ตัวอย่างอิทธิพล',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100756',
                            videoSource: 'HLS',
                        },
                    ],
                },
                {
                    id: 'SO_U5',
                    name: 'หน่วยที่ 5: ภูมิศาสตร์',
                    lessons: [
                        {
                            id: 'SO_L17',
                            name: 'แผนที่และเครื่องมือ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/400017',
                        },
                        {
                            id: 'SO_L18',
                            name: 'ภูมิศาสตร์ประเทศไทย',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/400018',
                        },
                        {
                            id: 'SO_L19',
                            name: 'ทรัพยากรธรรมชาติ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/400019',
                        },
                        {
                            id: 'SO_L20',
                            name: 'สิ่งแวดล้อม',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/400020',
                        },
                    ],
                },
            ],
        },
        HIST: {
            id: 'HIST',
            name: 'ประวัติศาสตร์',
            nameEN: 'History',
            color: 'sj-hist',
            icon: 'i-clock-history',
            scoreRatio: 'academic',
            dltvChannel: 'DLTV1-6',
            totalLessons: 20,
            units: [
                {
                    id: 'HI_U1',
                    name: 'หน่วยที่ 1: ศักราชและการสืบค้นทางประวัติศาสตร์',
                    lessons: [
                        {
                            id: 'HI_L01',
                            name: 'ความหมายและที่มาของศักราช',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/89998',
                            hlsUrl: '',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                indicator: 'ส 4.1 ป.3/1',
                                summary: 'พุทธศักราช หรือ พ.ศ. เป็นศักราชตามปฏิทินไทย คริสต์ศักราช หรือ ค.ศ. เป็นศักราชสากลที่ใช้กันทั่วไป และฮิจเราะห์ศักราช หรือ ฮ.ศ. เป็นปฏิทินในหลักศาสนาอิสลาม เหตุการณ์สำคัญทางศาสนามักเป็นที่มาของศักราช',
                                objectives: {
                                    K: 'บอกความหมายและที่มาของศักราชได้ (พ.ศ. ค.ศ. ฮ.ศ.)',
                                    P: 'นำเสนอผลงานและการทำงานร่วมกับผู้อื่น',
                                    A: 'ตระหนักถึงความสำคัญของที่มาของศักราช'
                                },
                                contentSections: [
                                    {
                                        title: 'ศักราชคืออะไร',
                                        content: 'ศักราช (สัก-กะ-หฺราด) หมายถึง อายุเวลาซึ่งกำหนดตั้งขึ้นเป็นทางการ เริ่มแต่จุดใดจุดหนึ่ง ซึ่งถือว่าเป็นที่หมายเหตุการณ์สำคัญ เรียงลำดับกันเป็นปีๆ ไป ศักราชที่นักเรียนควรรู้มี 3 ศักราชหลัก ได้แก่ พุทธศักราช (พ.ศ.) คริสต์ศักราช (ค.ศ.) และฮิจเราะห์ศักราช (ฮ.ศ.)',
                                        source: 'PDF'
                                    },
                                    {
                                        title: 'พุทธศักราช (พ.ศ.)',
                                        content: 'พุทธศักราช เป็นศักราชที่พุทธศาสนิกชนกำหนดขึ้น โดยเริ่มนับจากปีที่พระพุทธเจ้าเสด็จดับขันธปรินิพพาน ประเทศไทยเริ่มนับ พ.ศ. 1 หลังจากพระพุทธเจ้าปรินิพพานไปแล้ว 1 ปี ประเทศไทยเริ่มใช้พุทธศักราชอย่างเป็นทางการในสมัยรัชกาลที่ 6 เมื่อ พ.ศ. 2455',
                                        source: 'WEB'
                                    },
                                    {
                                        title: 'คริสต์ศักราช (ค.ศ.)',
                                        content: 'คริสต์ศักราช เป็นศักราชสากลที่ใช้กันทั่วโลก โดยเริ่มนับปีที่พระเยซูคริสต์ประสูติเป็น ค.ศ. 1 สูตรเปลี่ยน: พ.ศ. - 543 = ค.ศ. ตัวอย่าง: พ.ศ. 2568 - 543 = ค.ศ. 2025',
                                        source: 'WEB'
                                    },
                                    {
                                        title: 'ฮิจเราะห์ศักราช (ฮ.ศ.)',
                                        content: 'ฮิจเราะห์ศักราช เป็นปฏิทินในหลักศาสนาอิสลาม เริ่มนับจากปีที่ท่านนบีมุฮัมมัดอพยพจากเมืองมักกะฮ์ไปเมืองมะดีนะฮ์ คำว่า "ฮิจเราะห์" แปลว่า "การอพยพ"',
                                        source: 'WEB'
                                    },
                                    {
                                        title: 'ปฏิทินกับศักราช',
                                        content: 'ปฏิทินบอกข้อมูลสำคัญหลายอย่าง ได้แก่ ชื่อวัน วันที่ เดือน ปีพุทธศักราช ปีคริสต์ศักราช และวันสำคัญ ปฏิทินมีหลายรูปแบบ เช่น ปฏิทินตั้งโต๊ะ ปฏิทินแขวน ปฏิทินติดผนัง',
                                        source: 'PDF'
                                    }
                                ],
                                quiz: [
                                    { question: '"ศักราช" หมายถึงอะไร', options: ['ก. ชื่อของประเทศ', 'ข. อายุเวลาที่กำหนดขึ้นจากเหตุการณ์สำคัญ', 'ค. ชื่อของดวงดาว', 'ง. วันสำคัญทางศาสนา'], answer: 1, kpa: 'K' },
                                    { question: 'พุทธศักราช (พ.ศ.) เริ่มนับจากเหตุการณ์ใด', options: ['ก. พระพุทธเจ้าประสูติ', 'ข. พระพุทธเจ้าตรัสรู้', 'ค. พระพุทธเจ้าปรินิพพาน', 'ง. พระพุทธเจ้าแสดงปฐมเทศนา'], answer: 2, kpa: 'K' },
                                    { question: 'คริสต์ศักราช (ค.ศ.) เริ่มนับจากเหตุการณ์ใด', options: ['ก. พระเยซูคริสต์สิ้นพระชนม์', 'ข. พระเยซูคริสต์ประสูติ', 'ค. พระเยซูคริสต์ฟื้นคืนพระชนม์', 'ง. พระเยซูคริสต์รับบัพติศมา'], answer: 1, kpa: 'K' },
                                    { question: 'ถ้าปีนี้เป็น พ.ศ. 2568 จะเป็น ค.ศ. อะไร', options: ['ก. ค.ศ. 2024', 'ข. ค.ศ. 2025', 'ค. ค.ศ. 2026', 'ง. ค.ศ. 3111'], answer: 1, kpa: 'P' },
                                    { question: 'ทำไมเราจึงควรเรียนรู้เรื่องศักราช', options: ['ก. เพราะจะได้คะแนนดี', 'ข. เพราะช่วยให้เข้าใจลำดับเวลาของเหตุการณ์ทางประวัติศาสตร์', 'ค. เพราะครูบังคับให้เรียน', 'ง. เพราะจะได้ท่องจำตัวเลข'], answer: 1, kpa: 'A' }
                                ],
                                syncActivities: {
                                    type: 'MATCH',
                                    instruction: 'จับคู่ศักราชกับที่มาให้ถูกต้อง',
                                    pairs: [
                                        { left: 'พุทธศักราช (พ.ศ.)', right: 'พระพุทธเจ้าปรินิพพาน' },
                                        { left: 'คริสต์ศักราช (ค.ศ.)', right: 'พระเยซูคริสต์ประสูติ' },
                                        { left: 'ฮิจเราะห์ศักราช (ฮ.ศ.)', right: 'ท่านนบีมุฮัมมัดอพยพ' }
                                    ]
                                },
                                reflectTasks: [
                                    {
                                        type: 'OPEN_ENDED',
                                        question: 'ให้นักเรียนสรุปที่มาของศักราชทั้ง 3 ศักราช ได้แก่ พุทธศักราช คริสต์ศักราช และฮิจเราะห์ศักราช',
                                        hints: ['คิดถึงเหตุการณ์สำคัญทางศาสนา', 'แต่ละศักราชเริ่มนับจากเหตุการณ์อะไร'],
                                        source: 'WORKSHEET'
                                    }
                                ],
                                masterChallenge: {
                                    type: 'SCENARIO',
                                    scenario: 'นักเรียนพบเอกสารเก่าในห้องสมุดโรงเรียน เขียนว่า "จัดงานฉลองครบรอบ 50 ปีโรงเรียน ค.ศ. 1990"',
                                    question: 'งานฉลองนี้จัดขึ้นเมื่อ พ.ศ. อะไร และโรงเรียนนี้ก่อตั้งเมื่อ ค.ศ. ใด',
                                    rubric: [
                                        'เทียบ ค.ศ. 1990 เป็น พ.ศ. 2533 ได้ถูกต้อง',
                                        'คำนวณปีก่อตั้งได้ (ค.ศ. 1940 / พ.ศ. 2483)',
                                        'แสดงวิธีคิดในการเทียบศักราชได้ชัดเจน'
                                    ]
                                },
                                evaluation: [
                                    'ประเมินผลการตอบคำถาม',
                                    'ประเมินผลการตรวจใบงาน',
                                    'ประเมินผลการสังเกตพฤติกรรมนักเรียนรายบุคคล'
                                ],
                                materials: {
                                    slide: 'https://dltv.ac.th/utils/files/download/177233',
                                    worksheet: 'https://dltv.ac.th/utils/files/download/177234',
                                    knowledgeSheet: 'https://dltv.ac.th/utils/files/download/177235'
                                },
                                harvestedAt: '2026-02-18T00:20:00+07:00'
                            }
                        },
                        { id: 'HI_L02', name: 'การเทียบศักราช', dltvUrl: 'https://dltv.ac.th/teachplan/episode/89999', hlsUrl: '', videoSource: 'HLS', pedagogicalData: { indicator: 'ส 4.1 ป.3/1', summary: 'รอ harvest', objectives: { K: '-', P: '-', A: '-' } } },
                        { id: 'HI_L03', name: 'การเทียบศักราชในชีวิตประจำวัน', dltvUrl: 'https://dltv.ac.th/teachplan/episode/90000', hlsUrl: '', videoSource: 'HLS', pedagogicalData: { indicator: 'ส 4.1 ป.3/1', summary: 'รอ harvest', objectives: { K: '-', P: '-', A: '-' } } },
                        { id: 'HI_L04', name: 'ขั้นตอนการสืบค้นเรื่องราวในอดีตของโรงเรียน', dltvUrl: 'https://dltv.ac.th/teachplan/episode/90001', hlsUrl: '', videoSource: 'HLS', pedagogicalData: { indicator: 'ส 4.1 ป.3/2', summary: 'รอ harvest', objectives: { K: '-', P: '-', A: '-' } } },
                        { id: 'HI_L05', name: 'หลักฐานที่สืบค้นเหตุการณ์สำคัญของโรงเรียน', dltvUrl: 'https://dltv.ac.th/teachplan/episode/90002', hlsUrl: '', videoSource: 'HLS', pedagogicalData: { indicator: 'ส 4.1 ป.3/2', summary: 'รอ harvest', objectives: { K: '-', P: '-', A: '-' } } },
                        { id: 'HI_L06', name: 'เส้นเวลา (Time Line) โรงเรียนของฉัน', dltvUrl: 'https://dltv.ac.th/teachplan/episode/90003', hlsUrl: '', videoSource: 'HLS', pedagogicalData: { indicator: 'ส 4.1 ป.3/2', summary: 'รอ harvest', objectives: { K: '-', P: '-', A: '-' } } },
                        { id: 'HI_L07', name: 'หลักฐานที่สืบค้นเหตุการณ์สำคัญของชุมชน', dltvUrl: 'https://dltv.ac.th/teachplan/episode/90004', hlsUrl: '', videoSource: 'HLS', pedagogicalData: { indicator: 'ส 4.1 ป.3/3', summary: 'รอ harvest', objectives: { K: '-', P: '-', A: '-' } } },
                        { id: 'HI_L08', name: 'เส้นเวลา (Time Line) ชุมชนของฉัน', dltvUrl: 'https://dltv.ac.th/teachplan/episode/90005', hlsUrl: '', videoSource: 'HLS', pedagogicalData: { indicator: 'ส 4.1 ป.3/3', summary: 'รอ harvest', objectives: { K: '-', P: '-', A: '-' } } },
                        { id: 'HI_L09', name: 'แผนผังชุมชน', dltvUrl: 'https://dltv.ac.th/teachplan/episode/90006', hlsUrl: '', videoSource: 'HLS', pedagogicalData: { indicator: 'ส 4.1 ป.3/3', summary: 'รอ harvest', objectives: { K: '-', P: '-', A: '-' } } }
                    ]
                },
                {
                    id: 'HI_U2',
                    name: 'หน่วยที่ 2: ถิ่นฐานและวัฒนธรรม',
                    lessons: [
                        { id: 'HI_L10', name: 'ปัจจัยทางภูมิศาสตร์ที่มีผลต่อการตั้งถิ่นฐาน', dltvUrl: 'https://dltv.ac.th/teachplan/episode/90007', hlsUrl: '', videoSource: 'HLS', pedagogicalData: { indicator: 'ส 4.3 ป.3/1', summary: 'รอ harvest', objectives: { K: '-', P: '-', A: '-' } } },
                        { id: 'HI_L11', name: 'ปัจจัยทางสังคมที่มีผลต่อการตั้งถิ่นฐาน', dltvUrl: 'https://dltv.ac.th/teachplan/episode/90008', hlsUrl: '', videoSource: 'HLS', pedagogicalData: { indicator: 'ส 4.3 ป.3/1', summary: 'รอ harvest', objectives: { K: '-', P: '-', A: '-' } } },
                        { id: 'HI_L12', name: 'ปัจจัยที่มีอิทธิพลต่อพัฒนาการของชุมชน (ด้านภูมิศาสตร์)', dltvUrl: 'https://dltv.ac.th/teachplan/episode/90009', hlsUrl: '', videoSource: 'HLS', pedagogicalData: { indicator: 'ส 4.3 ป.3/2', summary: 'รอ harvest', objectives: { K: '-', P: '-', A: '-' } } },
                        { id: 'HI_L13', name: 'ปัจจัยที่มีผลต่อการตั้งถิ่นฐานฯ ภาคเหนือ', dltvUrl: 'https://dltv.ac.th/teachplan/episode/90010', hlsUrl: '', videoSource: 'HLS', pedagogicalData: { indicator: 'ส 4.3 ป.3/2', summary: 'รอ harvest', objectives: { K: '-', P: '-', A: '-' } } },
                        { id: 'HI_L14', name: 'ปัจจัยที่มีผลต่อการตั้งถิ่นฐานฯ ภาคกลาง', dltvUrl: 'https://dltv.ac.th/teachplan/episode/90011', hlsUrl: '', videoSource: 'HLS', pedagogicalData: { indicator: 'ส 4.3 ป.3/2', summary: 'รอ harvest', objectives: { K: '-', P: '-', A: '-' } } },
                        { id: 'HI_L15', name: 'ปัจจัยที่มีผลต่อการตั้งถิ่นฐานฯ ภาคใต้', dltvUrl: 'https://dltv.ac.th/teachplan/episode/90012', hlsUrl: '', videoSource: 'HLS', pedagogicalData: { indicator: 'ส 4.3 ป.3/2', summary: 'รอ harvest', objectives: { K: '-', P: '-', A: '-' } } },
                        { id: 'HI_L16', name: 'ปัจจัยที่มีผลต่อการตั้งถิ่นฐานฯ ภาคตะวันออกเฉียงเหนือ', dltvUrl: 'https://dltv.ac.th/teachplan/episode/90013', hlsUrl: '', videoSource: 'HLS', pedagogicalData: { indicator: 'ส 4.3 ป.3/2', summary: 'รอ harvest', objectives: { K: '-', P: '-', A: '-' } } },
                        { id: 'HI_L17', name: 'ประเพณีและวัฒนธรรมของชุมชน', dltvUrl: 'https://dltv.ac.th/teachplan/episode/90014', hlsUrl: '', videoSource: 'HLS', pedagogicalData: { indicator: 'ส 4.3 ป.3/3', summary: 'รอ harvest', objectives: { K: '-', P: '-', A: '-' } } },
                        { id: 'HI_L18', name: 'ท้องถิ่นของฉัน', dltvUrl: 'https://dltv.ac.th/teachplan/episode/90015', hlsUrl: '', videoSource: 'HLS', pedagogicalData: { indicator: 'ส 4.3 ป.3/3', summary: 'รอ harvest', objectives: { K: '-', P: '-', A: '-' } } },
                        { id: 'HI_L19', name: 'ประเพณีที่เกิดจากความเชื่อและศาสนาของชุมชน', dltvUrl: 'https://dltv.ac.th/teachplan/episode/90016', hlsUrl: '', videoSource: 'HLS', pedagogicalData: { indicator: 'ส 4.3 ป.3/3', summary: 'รอ harvest', objectives: { K: '-', P: '-', A: '-' } } },
                        { id: 'HI_L20', name: 'ความเหมือนและความแตกต่างทางวัฒนธรรมของชุมชน', dltvUrl: 'https://dltv.ac.th/teachplan/episode/90017', hlsUrl: '', videoSource: 'HLS', pedagogicalData: { indicator: 'ส 4.3 ป.3/3', summary: 'รอ harvest', objectives: { K: '-', P: '-', A: '-' } } }
                    ]
                }
            ]
        },
        PE: {
            id: 'PE',
            name: 'สุขศึกษาและพลศึกษา',
            nameEN: 'Health and Physical Education',
            color: 'sj-pe',
            icon: 'i-heart',
            scoreRatio: 'practical',
            dltvChannel: 'DLTV1-6',
            totalLessons: 20,
            units: [
                {
                    id: 'PE_U1',
                    name: 'หน่วยที่ 1: ร่างกายของเรา',
                    lessons: [
                        {
                            id: 'PE_L01',
                            name: 'ระบบอวัยวะ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/500001',
                        },
                        {
                            id: 'PE_L02',
                            name: 'การเจริญเติบโต',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/500002',
                        },
                        {
                            id: 'PE_L03',
                            name: 'สุขอนามัย',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/500003',
                        },
                        {
                            id: 'PE_L04',
                            name: 'โภชนาการ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/500004',
                        },
                    ],
                },
                {
                    id: 'PE_U2',
                    name: 'หน่วยที่ 2: ความปลอดภัย',
                    lessons: [
                        {
                            id: 'PE_L05',
                            name: 'ความปลอดภัยในชีวิต',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/500005',
                        },
                        {
                            id: 'PE_L06',
                            name: 'การปฐมพยาบาล',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/500006',
                        },
                        {
                            id: 'PE_L07',
                            name: 'สารเสพติด',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/500007',
                        },
                        {
                            id: 'PE_L08',
                            name: 'ความรุนแรง',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/500008',
                        },
                    ],
                },
                {
                    id: 'PE_U3',
                    name: 'หน่วยที่ 3: การเคลื่อนไหว',
                    lessons: [
                        {
                            id: 'PE_L09',
                            name: 'การเคลื่อนไหวพื้นฐาน',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/500009',
                        },
                        {
                            id: 'PE_L10',
                            name: 'การออกกำลังกาย',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/500010',
                        },
                        {
                            id: 'PE_L11',
                            name: 'สมรรถภาพทางกาย',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/500011',
                        },
                        {
                            id: 'PE_L12',
                            name: 'กิจกรรมเข้าจังหวะ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/500012',
                        },
                    ],
                },
                {
                    id: 'PE_U4',
                    name: 'หน่วยที่ 4: กีฬา',
                    lessons: [
                        {
                            id: 'PE_L13',
                            name: 'กรีฑา',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/500013',
                        },
                        {
                            id: 'PE_L14',
                            name: 'ฟุตบอล',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/500014',
                        },
                        {
                            id: 'PE_L15',
                            name: 'วอลเลย์บอล',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/500015',
                        },
                        {
                            id: 'PE_L16',
                            name: 'บาสเกตบอล',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/500016',
                        },
                    ],
                },
                {
                    id: 'PE_U5',
                    name: 'หน่วยที่ 5: นันทนาการ',
                    lessons: [
                        {
                            id: 'PE_L17',
                            name: 'กีฬาพื้นบ้าน',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/500017',
                        },
                        {
                            id: 'PE_L18',
                            name: 'กิจกรรมนันทนาการ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/500018',
                        },
                        {
                            id: 'PE_L19',
                            name: 'มารยาทนักกีฬา',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/500019',
                        },
                        {
                            id: 'PE_L20',
                            name: 'การแข่งขันกีฬา',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/500020',
                        },
                    ],
                },
            ],
        },
        ART: {
            id: 'ART',
            name: 'ศิลปะ',
            nameEN: 'Arts',
            color: 'sj-art',
            icon: 'i-swatch',
            scoreRatio: 'practical',
            dltvChannel: 'DLTV1-6',
            totalLessons: 20,
            units: [
                {
                    id: 'AR_U1',
                    name: 'หน่วยที่ 1: ทัศนศิลป์',
                    lessons: [
                        {
                            id: 'AR_L01',
                            name: 'ทัศนธาตุ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/600001',
                        },
                        {
                            id: 'AR_L02',
                            name: 'การวาดภาพ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/600002',
                        },
                        {
                            id: 'AR_L03',
                            name: 'การระบายสี',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/600003',
                        },
                        {
                            id: 'AR_L04',
                            name: 'การปั้น',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/600004',
                        },
                    ],
                },
                {
                    id: 'AR_U2',
                    name: 'หน่วยที่ 2: ดนตรี',
                    lessons: [
                        {
                            id: 'AR_L05',
                            name: 'องค์ประกอบดนตรี',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/600005',
                        },
                        {
                            id: 'AR_L06',
                            name: 'เครื่องดนตรีไทย',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/600006',
                        },
                        {
                            id: 'AR_L07',
                            name: 'เครื่องดนตรีสากล',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/600007',
                        },
                        {
                            id: 'AR_L08',
                            name: 'การอ่านโน้ต',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/600008',
                        },
                    ],
                },
                {
                    id: 'AR_U3',
                    name: 'หน่วยที่ 3: การขับร้อง',
                    lessons: [
                        {
                            id: 'AR_L09',
                            name: 'เพลงไทย',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/600009',
                        },
                        {
                            id: 'AR_L10',
                            name: 'เพลงสากล',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/600010',
                        },
                        {
                            id: 'AR_L11',
                            name: 'การร้องประสานเสียง',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/600011',
                        },
                        {
                            id: 'AR_L12',
                            name: 'เพลงพื้นบ้าน',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/600012',
                        },
                    ],
                },
                {
                    id: 'AR_U4',
                    name: 'หน่วยที่ 4: นาฏศิลป์',
                    lessons: [
                        {
                            id: 'AR_L13',
                            name: 'นาฏศิลป์ไทย',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/600013',
                        },
                        {
                            id: 'AR_L14',
                            name: 'การแสดงพื้นบ้าน',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/600014',
                        },
                        {
                            id: 'AR_L15',
                            name: 'การละคร',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/600015',
                        },
                        {
                            id: 'AR_L16',
                            name: 'การเต้นสมัยใหม่',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/600016',
                        },
                    ],
                },
                {
                    id: 'AR_U5',
                    name: 'หน่วยที่ 5: การสร้างสรรค์',
                    lessons: [
                        {
                            id: 'AR_L17',
                            name: 'งานประดิษฐ์',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/600017',
                        },
                        {
                            id: 'AR_L18',
                            name: 'ศิลปะประยุกต์',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/600018',
                        },
                        {
                            id: 'AR_L19',
                            name: 'การออกแบบ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/600019',
                        },
                        {
                            id: 'AR_L20',
                            name: 'นิทรรศการ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/600020',
                        },
                    ],
                },
            ],
        },
        WORK: {
            id: 'WORK',
            name: 'การงานอาชีพ',
            nameEN: 'Occupations and Technology',
            color: 'sj-work',
            icon: 'i-cog',
            scoreRatio: 'practical',
            dltvChannel: 'DLTV1-6',
            totalLessons: 20,
            units: [
                {
                    id: 'WK_U1',
                    name: 'หน่วยที่ 1: งานบ้าน',
                    lessons: [
                        {
                            id: 'WK_L01',
                            name: 'การดูแลบ้าน',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/700001',
                        },
                        {
                            id: 'WK_L02',
                            name: 'การประกอบอาหาร',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/700002',
                        },
                        {
                            id: 'WK_L03',
                            name: 'การตัดเย็บ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/700003',
                        },
                        {
                            id: 'WK_L04',
                            name: 'การซ่อมแซม',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/700004',
                        },
                    ],
                },
                {
                    id: 'WK_U2',
                    name: 'หน่วยที่ 2: งานเกษตร',
                    lessons: [
                        {
                            id: 'WK_L05',
                            name: 'การปลูกพืช',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/700005',
                        },
                        {
                            id: 'WK_L06',
                            name: 'การเลี้ยงสัตว์',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/700006',
                        },
                        {
                            id: 'WK_L07',
                            name: 'เกษตรอินทรีย์',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/700007',
                        },
                        {
                            id: 'WK_L08',
                            name: 'เกษตรทฤษฎีใหม่',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/700008',
                        },
                    ],
                },
                {
                    id: 'WK_U3',
                    name: 'หน่วยที่ 3: งานช่าง',
                    lessons: [
                        {
                            id: 'WK_L09',
                            name: 'งานช่างไม้',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/700009',
                        },
                        {
                            id: 'WK_L10',
                            name: 'งานช่างไฟฟ้า',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/700010',
                        },
                        {
                            id: 'WK_L11',
                            name: 'งานช่างโลหะ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/700011',
                        },
                        {
                            id: 'WK_L12',
                            name: 'การบำรุงรักษา',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/700012',
                        },
                    ],
                },
                {
                    id: 'WK_U4',
                    name: 'หน่วยที่ 4: เทคโนโลยี',
                    lessons: [
                        {
                            id: 'WK_L13',
                            name: 'คอมพิวเตอร์เบื้องต้น',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/700013',
                        },
                        {
                            id: 'WK_L14',
                            name: 'การใช้อินเทอร์เน็ต',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/700014',
                        },
                        {
                            id: 'WK_L15',
                            name: 'การเขียนโปรแกรม',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/700015',
                        },
                        {
                            id: 'WK_L16',
                            name: 'ความปลอดภัยไซเบอร์',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/700016',
                        },
                    ],
                },
                {
                    id: 'WK_U5',
                    name: 'หน่วยที่ 5: อาชีพ',
                    lessons: [
                        {
                            id: 'WK_L17',
                            name: 'การวางแผนอาชีพ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/700017',
                        },
                        {
                            id: 'WK_L18',
                            name: 'ผู้ประกอบการ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/700018',
                        },
                        {
                            id: 'WK_L19',
                            name: 'ทักษะอาชีพ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/700019',
                        },
                        {
                            id: 'WK_L20',
                            name: 'คุณธรรมในอาชีพ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/700020',
                        },
                    ],
                },
            ],
        },
        ENG: {
            id: 'ENG',
            name: 'ภาษาต่างประเทศ',
            nameEN: 'Foreign Languages (English)',
            color: 'sj-eng',
            icon: 'i-chat',
            scoreRatio: 'academic',
            dltvChannel: 'DLTV1-6',
            totalLessons: 20,
            units: [
                {
                    id: 'EN_U1',
                    name: 'Unit 1: Greetings',
                    lessons: [
                        {
                            id: 'EN_L01',
                            name: 'Nice to See You',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100663',
                            videoSource: 'HLS',
                        },
                        {
                            id: 'EN_L02',
                            name: 'What Do You Do?',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100664',
                            videoSource: 'HLS',
                        },
                        {
                            id: 'EN_L03',
                            name: 'What Are You Like?',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100665',
                            videoSource: 'HLS',
                        },
                        {
                            id: 'EN_L04',
                            name: 'My Favorite Person',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100666',
                            videoSource: 'HLS',
                        },
                    ],
                },
                {
                    id: 'EN_U2',
                    name: 'Unit 2: Daily Life',
                    lessons: [
                        {
                            id: 'EN_L05',
                            name: 'Time & Routines',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/800005',
                        },
                        {
                            id: 'EN_L06',
                            name: 'At School',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/800006',
                        },
                        {
                            id: 'EN_L07',
                            name: 'Food & Drinks',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/800007',
                        },
                        {
                            id: 'EN_L08',
                            name: 'Hobbies',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/800008',
                        },
                    ],
                },
                {
                    id: 'EN_U3',
                    name: 'Unit 3: Places',
                    lessons: [
                        {
                            id: 'EN_L09',
                            name: 'My House',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/800009',
                        },
                        {
                            id: 'EN_L10',
                            name: 'Around Town',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/800010',
                        },
                        {
                            id: 'EN_L11',
                            name: 'Directions',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/800011',
                        },
                        {
                            id: 'EN_L12',
                            name: 'Transportation',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/800012',
                        },
                    ],
                },
                {
                    id: 'EN_U4',
                    name: 'Unit 4: Nature',
                    lessons: [
                        {
                            id: 'EN_L13',
                            name: 'Animals',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/800013',
                        },
                        {
                            id: 'EN_L14',
                            name: 'Weather',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/800014',
                        },
                        {
                            id: 'EN_L15',
                            name: 'Seasons',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/800015',
                        },
                        {
                            id: 'EN_L16',
                            name: 'Environment',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/800016',
                        },
                    ],
                },
                {
                    id: 'EN_U5',
                    name: 'Unit 5: Communication',
                    lessons: [
                        {
                            id: 'EN_L17',
                            name: 'Reading Stories',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/800017',
                        },
                        {
                            id: 'EN_L18',
                            name: 'Writing Messages',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/800018',
                        },
                        {
                            id: 'EN_L19',
                            name: 'Conversations',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/800019',
                        },
                        {
                            id: 'EN_L20',
                            name: 'Presentations',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/800020',
                        },
                    ],
                },
            ],
        },
    },

    // --- KPA Template (Knowledge, Process, Attitude) ---
    kpaTemplate: {
        K: {
            label: 'Knowledge',
            labelTH: 'ความรู้',
            prefix: 'นักเรียนอธิบาย/บอก/ระบุ',
            icon: 'i-lightbulb',
        },
        P: {
            label: 'Process',
            labelTH: 'กระบวนการ',
            prefix: 'นักเรียนวิเคราะห์/เปรียบเทียบ/ประยุกต์',
            icon: 'i-cog',
        },
        A: {
            label: 'Attitude',
            labelTH: 'เจตคติ',
            prefix: 'นักเรียนเห็นคุณค่า/ตระหนัก/ชื่นชม',
            icon: 'i-heart',
        },
    },
};

// Helper for UI synchronization
function getCurrentUser() {
    // Standardize: Look for specific User ID key first, fallback to legacy role key
    const userId = localStorage.getItem('idlpms_active_user_id') ||
        localStorage.getItem('idlpms_active_role') ||
        'MOE_001';

    if (typeof IDLPMS_DATA === 'undefined' || !IDLPMS_DATA.users) return null;

    const userProfile = IDLPMS_DATA.users[userId];
    if (!userProfile) return null;

    const roleConfig = IDLPMS_DATA.roles[userProfile.role];

    // Safety Spread: Ensure ID is preserved and NOT overwritten by role-level IDs
    return {
        ...roleConfig,
        ...userProfile,
        id: userId,
        roleConfig // Preserve original config if needed
    };
}
