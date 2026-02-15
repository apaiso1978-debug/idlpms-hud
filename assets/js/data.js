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
                classes: ['1/1', '1/2', '2/1', '2/2', '3/1', '3/2', '4/1', '5/1', '5/2', '6/1'],
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
        PLC: { id: 'PLC', name: 'PLC ชุมชนแห่งการเรียนรู้', color: '#c084fc', type: 'ACTIVITY', periodsPerWeek: {} },  // Reserve period — managed via preAssignedSlots
    },

    // Expanded 7-Role Mock Users (Explicitly Linked)
    users: {
        // --- WAT MAP CHALUD SCHOOL (โรงเรียนวัดมาบชลูด) ---
        DIR_MABLUD: {
            role: 'SCHOOL_DIR',
            fullName: 'นายวรชัย อภัยโส',
            name: 'ผอ.โรงเรียนวัดมาบชลูด',
            org: 'โรงเรียนวัดมาบชลูด สพป.ระยอง เขต 1',
            schoolId: 'SCH_MABLUD',
            districtId: 'ESA_01',
            avatar: 'WA',
            color: 'id-dir',
            status: 'ONLINE',
        },
        // --- WAT MAP CHALUD TEACHERS (17 คน) ---
        // canTeachSubjects: วิชาหลัก + เสริม + กิจกรรม | homeroomClass: ครูประจำชั้น (for แนะแนว)
        // Note: HIST merged into SOC (สังคมศึกษาฯ รวมประวัติศาสตร์ตามหลักสูตร สพฐ.)
        TEA_M_01: {
            role: 'TEACHER', fullName: 'ครูสายบัว สกุลไทย', schoolId: 'SCH_MABLUD', avatar: 'ST', color: 'sj-thai',
            canTeachSubjects: ['THAI', 'THAI_PLUS', 'GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            homeroomClass: '1/1', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            workloadRoles: ['homeroom', 'grade_head', 'subject_head']
        },
        TEA_M_02: {
            role: 'TEACHER', fullName: 'ครูเก่งกาจ รักงานสอน', schoolId: 'SCH_MABLUD', avatar: 'KR', color: 'sj-math',
            canTeachSubjects: ['MATH', 'MATH_PLUS', 'ICT', 'GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            homeroomClass: '1/2', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            workloadRoles: ['homeroom', 'subject_head']
        },
        TEA_M_03: {
            role: 'TEACHER', fullName: 'ครูวิชิต ศิษย์ดี', schoolId: 'SCH_MABLUD', avatar: 'WS', color: 'sj-sci',
            canTeachSubjects: ['SCI', 'SCI_PLUS', 'ICT', 'GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            homeroomClass: '2/1', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            workloadRoles: ['homeroom', 'grade_head', 'subject_head']
        },
        TEA_M_04: {
            role: 'TEACHER', fullName: 'ครูมานี มีความสุข', schoolId: 'SCH_MABLUD', avatar: 'MM', color: 'sj-soc',
            canTeachSubjects: ['SOC', 'GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            homeroomClass: '2/2', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            workloadRoles: ['homeroom', 'dept_head_academic']
        },
        TEA_M_05: {
            role: 'TEACHER', fullName: 'ครูอารี ดีต่อใจ', schoolId: 'SCH_MABLUD', avatar: 'AD', color: 'sj-pe',
            canTeachSubjects: ['PE', 'GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            homeroomClass: '3/1', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            workloadRoles: ['homeroom', 'grade_head']
        },
        TEA_M_06: {
            role: 'TEACHER', fullName: 'ครูปราณี ศรีระยอง', schoolId: 'SCH_MABLUD', avatar: 'PS', color: 'sj-art',
            canTeachSubjects: ['ART', 'GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            homeroomClass: '3/2', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            workloadRoles: ['homeroom']
        },
        TEA_M_07: {
            role: 'TEACHER', fullName: 'ครูธงไชย ใจมุ่ง', schoolId: 'SCH_MABLUD', avatar: 'TJ', color: 'sj-eng',
            canTeachSubjects: ['ENG', 'ENG_PLUS', 'GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            homeroomClass: '4/1', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            workloadRoles: ['homeroom', 'grade_head', 'subject_head']
        },
        TEA_M_08: {
            role: 'TEACHER', fullName: 'ครูนารี มีวินัย', schoolId: 'SCH_MABLUD', avatar: 'NM', color: 'sj-soc',
            canTeachSubjects: ['SOC', 'GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            workloadRoles: ['dept_head_budget']
        },
        TEA_M_09: {
            role: 'TEACHER', fullName: 'ครูสมชาย มาบชลูด', schoolId: 'SCH_MABLUD', avatar: 'SS', color: 'sj-thai',
            canTeachSubjects: ['THAI', 'THAI_PLUS', 'GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            homeroomClass: '5/1', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            workloadRoles: ['homeroom', 'grade_head']
        },
        TEA_M_10: {
            role: 'TEACHER', fullName: 'ครูสมหญิง ยิ่งเรียน', schoolId: 'SCH_MABLUD', avatar: 'SY', color: 'sj-math',
            canTeachSubjects: ['MATH', 'MATH_PLUS', 'ICT', 'GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            homeroomClass: '5/2', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            workloadRoles: ['homeroom', 'dept_head_personnel']
        },
        TEA_M_11: {
            role: 'TEACHER', fullName: 'ครูวิไล ใฝ่รู้', schoolId: 'SCH_MABLUD', avatar: 'WL', color: 'sj-sci',
            canTeachSubjects: ['SCI', 'SCI_PLUS', 'ICT', 'GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            homeroomClass: '6/1', maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            workloadRoles: ['homeroom', 'grade_head', 'qa_officer']
        },
        TEA_M_12: {
            role: 'TEACHER', fullName: 'ครูสมพร สอนสนาน', schoolId: 'SCH_MABLUD', avatar: 'SS', color: 'sj-soc',
            canTeachSubjects: ['SOC', 'GUIDE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            workloadRoles: ['dept_head_general']
        },
        // ครูเสริม (ไม่มีห้องประจำ — ช่วยสอนเสริมและกิจกรรม)
        TEA_M_13: {
            role: 'TEACHER', fullName: 'ครูประภา แสงธรรม', schoolId: 'SCH_MABLUD', avatar: 'PS', color: 'sj-pe',
            canTeachSubjects: ['PE', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            workloadRoles: ['policy_project']
        },
        TEA_M_14: {
            role: 'TEACHER', fullName: 'ครูจรูญ บูรพา', schoolId: 'SCH_MABLUD', avatar: 'JB', color: 'sj-art',
            canTeachSubjects: ['ART', 'WORK', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            workloadRoles: ['community_service']
        },
        TEA_M_15: {
            role: 'TEACHER', fullName: 'ครูอำไพ ในเมือง', schoolId: 'SCH_MABLUD', avatar: 'AN', color: 'sj-eng',
            canTeachSubjects: ['ENG', 'ENG_PLUS', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            workloadRoles: ['subject_head', 'plc_leader']
        },
        TEA_M_16: {
            role: 'TEACHER', fullName: 'ครูยอดชาย ใจสู้', schoolId: 'SCH_MABLUD', avatar: 'YJ', color: 'sj-soc',
            canTeachSubjects: ['SOC', 'WORK', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            workloadRoles: ['policy_project']
        },
        TEA_M_17: {
            role: 'TEACHER', fullName: 'ครูบุญรอด ยอดขยัน', schoolId: 'SCH_MABLUD', avatar: 'BY', color: 'sj-work',
            canTeachSubjects: ['WORK', 'ICT', 'SCOUT', 'PRAY', 'RILS', 'SOCIAL', 'CLUB', 'PLC'],
            maxPeriodsPerDay: 6, maxPeriodsPerWeek: 25,
            workloadRoles: ['community_service']
        },

        // --- WAT MAP CHALUD STUDENTS (250 คน - แสดงตัวอย่างบางส่วน) ---
        // Note: 250 users are represented here with a range from STU_M_001 to STU_M_250
        STU_M_001: { role: 'STUDENT', fullName: 'น้องดา มีใจ', schoolId: 'SCH_MABLUD', classId: '1/1', gradeLevel: 1, avatar: 'DM', color: 'cyan' },
        STU_M_002: { role: 'STUDENT', fullName: 'น้องดี มีชัย', schoolId: 'SCH_MABLUD', classId: '1/1', gradeLevel: 1, avatar: 'DM', color: 'cyan' },
        // ... (Remaining 248 students follow this pattern)
        STU_M_250: { role: 'STUDENT', fullName: 'น้องสุด ท้ายสายเชี่ยว', schoolId: 'SCH_MABLUD', classId: '6/2', gradeLevel: 6, avatar: 'SC', color: 'cyan' },

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
            fullName: 'อัครพล เก่งเรียน',
            schoolId: 'SCH_001',
            classId: '5/1',
            avatar: 'AK',
            color: 'cyan',
            studentType: 'SYSTEM',
            gradeLevel: 5,
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
            fullName: 'ครูสายบัว สกุลไทย',
            schoolId: 'SCH_001',
            teacherType: 'CLASS_TEACHER',
            subject: 'ภาษาไทย',
            subjectId: 'THAI',
            priority: 1,
            responsibilities: { classTeacherOf: '6/1' },
            avatar: 'SB',
            color: 'sj-thai',
        },
        TEA_002: {
            role: 'TEACHER',
            fullName: 'ครูเก่งกาจ รักงานสอน',
            schoolId: 'SCH_001',
            teacherType: 'CLASS_TEACHER',
            subject: 'คณิตศาสตร์',
            subjectId: 'MATH',
            priority: 1,
            responsibilities: { classTeacherOf: '6/2' },
            avatar: 'KK',
            color: 'sj-math',
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
            icon: 'i-clock-history', // Assuming this icon exists or use a generic one
            scoreRatio: 'academic',
            dltvChannel: 'DLTV1-6',
            totalLessons: 20,
            units: [
                {
                    id: 'HI_U1',
                    name: 'หน่วยที่ 1: อารยธรรมน่ารู้',
                    lessons: [
                        {
                            id: 'HI_L01',
                            name: 'ที่ตั้ง และภูมิศาสตร์ของอารยธรรมอินเดีย',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100753',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_92928-v-202410220907-100753.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                indicator: 'ส 4.2 ป.5/1',
                                summary: 'อารยธรรมอินเดียถือเป็นหนึ่งในอารยธรรมที่เก่าแก่ที่สุดของโลก มีรากฐานมาจากลุ่มแม่น้ำสินธุและแผ่ขยายอิทธิพลไปทั่วเอเชียผ่านการแสวงหาโชคลาภและการเผยแผ่ความเชื่อ อิทธิพลเหล่านี้ไม่ได้เพียงแค่ส่งผ่านสินค้า แต่ยังนำพาเอาปรัชญา ศาสนา และระบับทางสังคมที่หยั่งรากลึกในดินแดนสุวรรณภูมิจนถึงปัจจุบัน',

                                // Step 2: KPA Objectives
                                objectives: {
                                    K: 'อธิบายแหล่งกำเนิดและลักษณะสำคัญของอารยธรรมอินเดียโบราณได้',
                                    P: 'จำแนกอิทธิพลของอารยธรรมอินเดียในด้านศาสนา ภาษา และวรรณกรรมได้',
                                    A: 'ตระหนักถึงคุณค่าของมรดกทางวัฒนธรรมที่รับมาจากอารยธรรมอินเดีย'
                                },

                                // Step 3: Content Sections - Mastery Level
                                contentSections: [
                                    {
                                        title: 'CORE CONCEPT: รากแก้วแห่งตะวันออก',
                                        content: 'อารยธรรมอินเดียมีจุดกำเนิดที่ลุ่มแม่น้ำสินธุ (Indus) และลุ่มแม่น้ำคงคา เป็นแหล่งบ่มเพาะศาสนาสำคัญของโลกอย่างพระพุทธศาสนาและฮินดู ซึ่งแผ่กิ่งก้านสาขาเข้าสู่ไทยผ่านเส้นทางการค้าทั้งทางบกและทางทะเล',
                                        source: 'WEB'
                                    },
                                    {
                                        title: 'DETAILED: ภูมิศาสตร์และทางผ่าน (Khyber Pass)',
                                        content: 'ภูมิศาสตร์อินเดียถูกกั้นด้วยเทือกเขาหิมาลัยทางเหนือ แต่มี "ช่องเขาไคเบอร์" เป็นประตูบกเพียงบานเดียวที่เชื่อมต่อกับโลกภายนอก ส่วนทางใต้ล้อมรอบด้วยมหาสมุทร ทำให้เรือสินค้าสามารถเลียบชายฝั่งโคโรมันเดลมายังสุวรรณภูมิได้ง่าย',
                                        source: 'DLTV'
                                    },
                                    {
                                        title: 'DETAILED: ศาสนาและภาษา (Spiritual & Linguistic)',
                                        content: '1. ศาสนา: พุทธศาสนานำมาซึ่งศิลปะการสร้างสถูปเจดีย์และกฎแห่งกรรม ส่วนศาสนาพราหมณ์-ฮินดูนำมาซึ่งพิธีกรรมศักดิ์สิทธิ์และการปกครองแบบเทวราชา\n2. ภาษา: ภาษาบาลีและสันสกฤตได้กลายเป็นรากฐานของคำศัพท์ในภาษาไทยมากมาย เช่น "วิทยา", "ประวัติ", "ราชา"',
                                        source: 'DLTV'
                                    },
                                    {
                                        title: 'TEACHER’S INSIGHTS: เกร็ดความรู้ (Lecture Notes)',
                                        content: 'รู้หรือไม่? ชื่อจริงของคนไทยส่วนใหญ่เกือบ 80% มีรากมาจากภาษาบาลี-สันสกฤตของอินเดีย! แม้แต่ชื่อวิชา "คณิตศาสตร์" หรือ "วิทยาศาสตร์" ที่เราเรียนอยู่ตอนนี้ ก็คือมรดกทางภาษาที่เราได้รับมาจากอารยธรรมอินเดียโบราณนั่นเอง',
                                        source: 'LECTURE_NOTES'
                                    }
                                ],
                                quiz: [
                                    {
                                        question: "อารยธรรมอินเดียโบราณเกิดขึ้นในบริเวณลุ่มแม่น้ำใด?",
                                        options: ["ก. แม่น้ำไนล์", "ข. แม่น้ำสินธุ", "ค. แม่น้ำเหลือง", "ง. แม่น้ำไทกริส"],
                                        answer: 1,
                                        kpa: 'K'
                                    },
                                    {
                                        question: "เทือกเขาใดที่กั้นทางตอนเหนือของอินเดีย?",
                                        options: ["ก. เทือกเขาแอลป์", "ข. เทือกเขาหิมาลัย", "ค. เทือกเขาร็อกกี้", "ง. เทือกเขาแอนดีส"],
                                        answer: 1,
                                        kpa: 'K'
                                    },
                                    {
                                        question: "ช่องเขาไคเบอร์มีความสำคัญอย่างไรต่ออารยธรรมอินเดีย?",
                                        options: ["ก. แหล่งน้ำจืด", "ข. ทางผ่านติดต่อโลกภายนอก", "ค. ที่ตั้งเมืองหลวง", "ง. แหล่งแร่ธาตุ"],
                                        answer: 1,
                                        kpa: 'P'
                                    },
                                    {
                                        question: "เมืองโบราณใดที่เป็นหลักฐานสำคัญของอารยธรรมลุ่มแม่น้ำสินธุ?",
                                        options: ["ก. บาบิโลน", "ข. โมเฮนโจ-ดาโร", "ค. เอเธนส์", "ง. โรม"],
                                        answer: 1,
                                        kpa: 'K'
                                    },
                                    {
                                        question: "การศึกษาอารยธรรมอินเดียโบราณมีประโยชน์ต่อปัจจุบันอย่างไร?",
                                        options: ["ก. ไม่มีประโยชน์", "ข. เข้าใจรากฐานวัฒนธรรมของภูมิภาค", "ค. เพื่อความบันเทิง", "ง. เพื่อท่องเที่ยว"],
                                        answer: 1,
                                        kpa: 'A'
                                    }
                                ],

                                // Step 4: SYNC Activities (Interactive)
                                syncActivities: {
                                    type: 'MATCH',
                                    instruction: 'จับคู่ภูมิศาสตร์สำคัญกับความหมายให้ถูกต้อง',
                                    pairs: [
                                        { left: 'แม่น้ำสินธุ', right: 'แหล่งกำเนิดอารยธรรมดั้งเดิม' },
                                        { left: 'ช่องเขาไคเบอร์', right: 'ประตูสู่เส้นทางสายไหมทางบก' },
                                        { left: 'เทือกเขาหิมาลัย', right: 'กำแพงธรรมชาติขนาดมหึมา' },
                                        { left: 'แม่น้ำคงคา', right: 'ศูนย์กลางของความเชื่อทางศาสนา' }
                                    ]
                                },

                                // Step 5: REFLECT Tasks (Practice)
                                reflectTasks: [
                                    {
                                        type: 'OPEN_ENDED',
                                        question: 'หากปัจจัยทางภูมิศาสตร์อย่างลุ่มแม่น้ำสินธุหายไป นักเรียนคิดว่าอารยธรรมอินเดียจะยังคงรุ่งเรืองได้หรือไม่? จงอธิบายเหตุผลประกอบข้อมูลเชิงลึก',
                                        hints: ['คิดถึงความอุดมสมบูรณ์เพื่อการเกษตร', 'คิดถึงแหล่งน้ำที่เป็นจุดเริ่มต้นของเมือง'],
                                        source: 'WORKSHEET'
                                    }
                                ],

                                // Step 7: MASTER Challenge (Scenario)
                                masterChallenge: {
                                    type: 'SCENARIO',
                                    scenario: 'นักเรียนได้รับมอบหมายให้เลือกพื้นที่ตั้งมืองใหม่สำหรับชาวอารยธรรมลุ่มแม่น้ำสินธุที่กำลังขยายตัว',
                                    question: 'นักเรียนจะใช้ปัจจัยใดในการตัดสินใจเลือกทำเลที่ตั้ง และจะมีแนวทางป้องกันภัยธรรมชาติจากแม่น้ำอย่างไร?',
                                    rubric: [
                                        'วิเคราะห์ทำเลใกล้แหล่งน้ำแต่ปลอดภัยจากน้ำท่วม',
                                        'มีแนวคิดการวางผังเมืองหรือระบบระบายน้ำเหมือนเมืองโมเฮนโจ-ดาโร',
                                        'แสดงให้เห็นถึงความเข้าใจในความสัมพันธ์ระหว่างคนกับธรรมชาติ'
                                    ]
                                },

                                evaluation: [
                                    '1. ประเมินจากการสรุปผังมโนทัศน์ (Mind Map)',
                                    '2. ตรวจความถูกต้องของการจับคู่กิจกรรม SYNC',
                                    '3. ประเมินการคิดวิเคราะห์ใน MASTER Challenge'
                                ],

                                // Metadata
                                materials: {
                                    slide: 'https://dltv.ac.th/utils/files/download/201362',
                                    worksheet: 'https://dltv.ac.th/utils/files/download/201363'
                                },
                                harvestedAt: '2026-02-05T14:40:00+07:00'
                            }
                        },
                        {
                            id: 'HI_L02',
                            name: 'พัฒนาการทางประวัติศาสตร์ของอินเดีย',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100754',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_93682-v-202411061045-100754.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                indicator: 'ส 4.2 ป.5/1',
                                summary: 'การเข้ามาของอารยธรรมอินเดียในดินแดนไทยและเอเชียตะวันออกเฉียงใต้ไม่ได้เกิดขึ้นเพียงชั่วข้ามคืน แต่เป็นการสั่งสมผ่านเครือข่ายการค้าทางทะเลที่เชื่อมโยงมหาสมุทรอินเดียเข้ากับ "สุวรรณภูมิ" โดยมีกลุ่มพ่อค้า นักบวช และพราหมณ์เป็นตัวกลางสำคัญในการนำเข้าสินค้า ศาสนา ภาษา และระบอบการปกครอง ซึ่งอารยธรรมเหล่านี้ได้ถูกนำมาปรับเปลี่ยนให้เข้ากับบริบทท้องถิ่นจนกลายเป็นรากฐานวัฒนธรรมไทยในปัจจุบัน',

                                // Step 2: KPA Objectives (LINK)
                                objectives: {
                                    K: 'เข้าใจและอธิบายการเข้ามาของอารยธรรมอินเดียในดินแดนไทยและเอเชียตะวันออกเฉียงใต้ได้',
                                    P: 'วิเคราะห์สาเหตุและปัจจัยสำคัญที่ทำให้อารยธรรมอินเดียเผยแผ่เข้ามาในสุวรรณภูมิได้',
                                    A: 'ตระหนักถึงความสำคัญและอิทธิพลของอารยธรรมถิ่นอื่นที่มีต่อวัฒนธรรมไทยในปัจจุบัน'
                                },

                                // Step 3: Content Sections (DO) - Mastery Level Enrichment
                                contentSections: [
                                    {
                                        title: 'CORE CONCEPT: สายสัมพันธ์มหาสมุทร',
                                        content: 'อารยธรรมอินเดียไหลเข้าสู่ "สุวรรณภูมิ" ผ่านเครือข่ายการค้าทางทะเล โดยมี "ลมมรสุม" เป็นฟันเฟืองกำหนดเวลาการเดินทาง นำมาซึ่ง ศาสนา ภาษา และระบอบการปกครองที่กลายเป็นรากฐานวัฒนธรรมไทย',
                                        source: 'WEB'
                                    },
                                    {
                                        title: 'DETAILED: ลมมรสุมและการค้าลูกปัด',
                                        content: '1. ลมมรสุมตะวันตกเฉียงใต้ (พ.ค.-ต.ค.): พัดเรือจากอินเดียมายังไทย\n2. ลมมรสุมตะวันออกเฉียงเหนือ (ต.ค.-ก.พ.): พัดเรือกลับจากไทยสู่อินเดีย\n3. สินค้าหลัก: พ่อค้านำ "ลูกปัดคาร์เนเลียน" (Carnelian) และแก้วจากอินเดียมาแลกกับเครื่องเทศและของป่า ทำให้เกิดเมืองท่าสำคัญอย่าง "เขาสามแก้ว" ในจังหวัดชุมพร',
                                        source: 'DLTV'
                                    },
                                    {
                                        title: 'DETAILED: มรดกทางวัฒนธรรม',
                                        content: '1. ศาสนา: รับพุทธศาสนาและพราหมณ์-ฮินดู ส่งผลต่อวิถีชีวิตและสถาปัตยกรรมวัด\n2. ภาษา: รากศัพท์บาลี-สันสกฤตในชื่อคนและสถานที่\n3. วรรณกรรม: เรื่องราวของ "รามเกียรติ์" หรือรามายณะที่แพร่หลายไปทั่วภูมิภาค',
                                        source: 'DLTV'
                                    },
                                    {
                                        title: 'TEACHER’S INSIGHTS: เกร็ดความรู้ (Lecture Notes)',
                                        content: 'รู้หรือไม่? "ลูกปัดอินโด-แปซิฟิก" ที่พบในไทย คือหลักฐานสำคัญที่บอกว่าเราคือศูนย์กลางการค้าโลกเมื่อ 2,500 ปีก่อน และการที่เรือต้องรอเปลี่ยนทิศทางลมมรสุมนานหลายเดือน ทำให้เกิดการปฏิสัมพันธ์และแลกเปลี่ยนอารยธรรมอย่างลึกซึ้งจนกลมกลืนไปกับวัฒนธรรมเดิมของเรา',
                                        source: 'LECTURE_NOTES'
                                    }
                                ],

                                // Step 4: SYNC Activities (Interactive)
                                syncActivities: {
                                    type: 'MATCH',
                                    instruction: 'จับคู่สาเหตุการเข้ามากับกลุ่มบุคคลให้ถูกต้อง',
                                    pairs: [
                                        { left: 'การค้าขาย', right: 'กลุ่มพ่อค้า' },
                                        { left: 'การเผยแผ่ศาสนา', right: 'นักบวช/พระสงฆ์' },
                                        { left: 'การทูต/ราชการ', right: 'ทูต/ข้าราชการ' },
                                        { left: 'การหาของป่า', right: 'ชาวพื้นเมืองและพ่อค้า' }
                                    ]
                                },

                                // Step 5: REFLECT Tasks (Practice)
                                reflectTasks: [
                                    {
                                        type: 'OPEN_ENDED',
                                        question: 'นอกจากสินค้าแล้ว นักเรียนคิดว่าสิ่งใดที่เป็น "มรดก" ที่สำคัญที่สุดที่พ่อค้าและนักบวชอินเดียนำเข้ามาในเอเชียตะวันออกเฉียงใต้?',
                                        hints: ['คิดถึงความเชื่อและศาสนา', 'คิดถึงภาษาที่ใช้ในวรรณคดี'],
                                        source: 'WORKSHEET'
                                    }
                                ],

                                // Step 7: MASTER Challenge (Scenario)
                                masterChallenge: {
                                    type: 'SCENARIO',
                                    scenario: 'หากนักเรียนเป็นลูกเรือบนเรือสินค้าชาวอินเดียที่กำลังแล่นเข้าสู่ชายฝั่งสุวรรณภูมิ',
                                    question: 'นักเรียนจะแนะนำสินค้าชนิดใดให้ชาวพื้นเมืองรู้จัก และจะบอกพวกเขาว่าดินแดนแห่งนี้มีความสำคัญอย่างไรในสายตาชาวอินเดีย?',
                                    rubric: [
                                        'ระบุสินค้าจากอินเดียได้ถูกต้อง (เช่น ลูกปัด, เครื่องประดับ)',
                                        'อธิบายความหมายของสุวรรณภูมิได้ถูกต้อง (ดินแดนทองคำ)',
                                        'ใช้ทักษะการสื่อสารที่โน้มน้าวใจสอดคล้องกับบทบาท'
                                    ]
                                },

                                evaluation: [
                                    '1. ประเมินจากการเข้าร่วมกิจกรรมกลุ่ม',
                                    '2. ตรวจความถูกต้องของใบงานที่ 2',
                                    '3. สังเกตการแสดงความเห็นในชั้นเรียน'
                                ],

                                // Step 1 & 6: Quiz (Pre-test / Post-test)
                                quiz: [
                                    {
                                        question: "ชาวอินเดียในสมัยโบราณเรียกเอเชียตะวันออกเฉียงใต้ว่าอะไร?",
                                        options: ["ก. สุวรรณภูมิ", "ข. นครธม", "ค. อโยธยา", "ง. ลังกา"],
                                        answer: 0,
                                        kpa: 'K'
                                    },
                                    {
                                        question: "สาเหตุหลักที่ทำให้ชาวอินเดียยุคแรกเริ่มเข้ามาในดินแดนแถบนี้คืออะไร?",
                                        options: ["ก. การท่องเที่ยว", "ข. การค้าขาย", "ค. การทำสงคราม", "ง. การลี้ภัยทางการเมือง"],
                                        answer: 1,
                                        kpa: 'K'
                                    },
                                    {
                                        question: "สิ่งที่พ่อค้าชาวอินเดียมักนำติดตัวเข้ามาเพื่อความสิริมงคลคืออะไร?",
                                        options: ["ก. แผนที่ทันสมัย", "ข. เครื่องรางและรูปเคารพขนาดเล็ก", "ค. ตำราทำอาหาร", "ง. อาวุธปืน"],
                                        answer: 1,
                                        kpa: 'P'
                                    },
                                    {
                                        question: "หลักฐานใดแสดงถึงอิทธิพลด้านศาสนาจากอินเดียในดินแดนไทย?",
                                        options: ["ก. การสร้างคอนโดมิเนียม", "ข. การมีวัดและโบราณสถานทางศาสนา", "ค. การใส่ชุดสูท", "ง. การใช้โทรศัพท์มือถือ"],
                                        answer: 1,
                                        kpa: 'P'
                                    },
                                    {
                                        question: "การศึกษาประวัติศาสตร์การเข้ามาของอินเดียช่วยให้เราเข้าใจสิ่งใดชัดเจนขึ้น?",
                                        options: ["ก. ราคาหุ้น", "ข. รากฐานวัฒนธรรมและความสัมพันธ์ระหว่างประเทศ", "ค. การพยากรณ์อากาศ", "ง. วิธีการขุดน้ำมัน"],
                                        answer: 1,
                                        kpa: 'A'
                                    }
                                ],
                                harvestedAt: '2026-02-05T09:20:00+07:00'
                            }
                        },
                        {
                            id: 'HI_L03',
                            name: 'แหล่งอารยธรรมและแหล่งมรดกโลก ของอารยธรรมอินเดีย',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100755',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_93834-v-202411111149-100755.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'อารยธรรมอินเดียมีความเก่าแก่นานนับพันปีมีแหล่งกำเนิดในบริเวณลุ่มแม่น้ำสินธุ มีหลักฐานแหล่งอารยธรรมที่สำคัญหลายแห่ง เช่น ทัชมาฮาล ตักศิลา ป้อมอาครา ถ้ำอชันตา',
                                objectives: [
                                    '1. บอกแหล่งอารยธรรมมรดกโลกที่สำคัญในภูมิภาคเอเชียใต้และเอเชียตะวันออกเฉียงใต้ได้',
                                    '2. สืบค้นข้อมูลเกี่ยวกับอารยธรรมอินเดียได้พอสังเขป',
                                    '3. เข้าใจและยอมรับความแตกต่างทางวัฒนธรรม'
                                ],
                                evaluation: [
                                    '1. ประเมินผลการเข้าร่วมกิจกรรม',
                                    '2. ประเมินผลการตอบคำถาม',
                                    '3. ประเมินใบงาน'
                                ]
                            }
                        },
                        {
                            id: 'HI_L04',
                            name: 'อิทธิพลของอารยธรรมอินเดีย (1)',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100756',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_93992-v-202411131251-100756.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'เอเชียตะวันออกเฉียงใต้ได้รับอิทธิพลมาจากอารยธรรมอินเดียมาตั้งแต่อดีต โดยเฉพาะด้านอักษรศาสตร์ ด้านกฎหมาย ด้านศาสนา แต่มีการเลือกรับปรับใช้ให้เหมาะสมกับสภาพพื้นที่จนเกิดเป็นตัวตนเฉพาะของเอเชียตะวันออกเฉียงใต้เอง',
                                objectives: [
                                    '1. บอกตัวอย่างอิทธิพลของอารยธรรมอินเดียที่มีต่อสังคมไทยและเอเชียตะวันออกเฉียงใต้',
                                    '2. วิเคราะห์ปัจจัยที่ทำให้อารยธรรมอินเดียมีอิทธิพลต่อสังคมไทยและเอเชียตะวันออกเฉียงใต้',
                                    '3. เห็นคุณค่าของลักษณะพหุวัฒนธรรมในสังคมไทย'
                                ],
                                evaluation: [
                                    '1. ประเมินผลการเข้าร่วมกิจกรรม',
                                    '2. ประเมินผลการตอบคำถาม',
                                    '3. ประเมินใบงาน'
                                ]
                            }
                        },
                        {
                            id: 'HI_L05',
                            name: 'อิทธิพลของอารยธรรมอินเดีย (2)',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100757',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_94063-v-202411180730-100757.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'สังคมไทยและสังคมเอเชียตะวันออกเฉียงใต้ ในปัจจุบันได้รับอิทธิพลมาจากอารยธรรมอินเดียมาตั้งแต่อดีต เช่น ภาษา ศาสนา อาหาร ส่งผลให้ผู้คนที่อาศัยอยู่ในเอเชียตะวันออกเฉียงใต้มีวัฒนธรรมที่หลากหลาย',
                                objectives: [
                                    '1. บอกตัวอย่างอิทธิพลของอารยธรรมอินเดียที่มีต่อสังคมไทยและเอเชียตะวันออกเฉียงใต้',
                                    '2. วิเคราะห์ปัจจัยที่ทำให้อารยธรรมอินเดียมีอิทธิพลต่อสังคมไทยและเอเชียตะวันออกเฉียงใต้',
                                    '3. เห็นคุณค่าของลักษณะพหุวัฒนธรรมในสังคมไทย'
                                ],
                                evaluation: [
                                    '1. ประเมินผลการเข้าร่วมกิจกรรม',
                                    '2. ประเมินผลการตอบคำถาม',
                                    '3. ประเมินใบงาน'
                                ]
                            }
                        },
                        {
                            id: 'HI_L06',
                            name: 'ที่ตั้ง และภูมิศาสตร์ของอารยธรรมจีน',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100758',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_94502-v-202412040754-100758.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'อารยธรรมจีนมีแหล่งกำเนิดบริเวณลุ่มแม่น้ำฮวงโห คือที่ราบตอนปลายของแม่น้ำฮวงโหและแม่น้ำแยงซีเกียง แหล่งอารยธรรมบริเวณลุ่มแม่น้ำฮวงโห พบความเจริญที่เรียกว่า วัฒนธรรมหยางเชา แหล่งอารยธรรมบริเวณลุ่มน้ำแยงซี พบ วัฒนธรรมหลงซาน',
                                objectives: [
                                    '1. อธิบายที่ตั้ง และภูมิศาสตร์ของอารยธรรมจีนได้',
                                    '2. ระบุที่ตั้ง และภูมิศาสตร์ของอารยธรรมจีนได้'
                                ],
                                evaluation: [
                                    '1. ประเมินผลการเข้าร่วมกิจกรรม',
                                    '2. ประเมินผลการตอบคำถาม',
                                    '3. ประเมินใบงาน'
                                ]
                            }
                        },
                        {
                            id: 'HI_L07',
                            name: 'พัฒนาการทางประวัติศาสตร์ของจีน (1)',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100759',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_94600-v-202412090946-100759.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'การแบ่งยุคสมัยประวัติศาสตร์จีนมี ๒ ระยะ คือ สมัยก่อนประวัติศาสตร์ บริเวณที่ราบลุ่มแม่น้ำสินธุ และสมัยประวัติศาสตร์ มีการตั้งถิ่นฐานบริเวณลุ่มแม่น้ำคงคา แบ่งเป็น 3 สมัย คือ มหากาพย์ จักวรรดิ มุสลิม',
                                objectives: [
                                    '1. อธิบายพัฒนาการของอารยธรรมของจีนได้',
                                    '2. วิเคราะห์พัฒนาการของอารยธรรมของจีนได้'
                                ],
                                evaluation: [
                                    '1. ประเมินผลการเข้าร่วมกิจกรรม',
                                    '2. ประเมินผลการตอบคำถาม'
                                ]
                            }
                        },
                        {
                            id: 'HI_L08',
                            name: 'พัฒนาการทางประวัติศาสตร์ของจีน (2)',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100760',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_94822-v-202412181033-100760.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'การแบ่งยุคสมัยประวัติศาสตร์จีนมี ๒ ระยะ คือ สมัยก่อนประวัติศาสตร์ วัฒนธรรมหยางเชา วัฒนธรรมหลงซาน และสมัยประวัติศาสตร์ คือสมัยโบราณ สมัยจักรวรรดิ สมัยใหม่ และร่วมสมัย',
                                objectives: [
                                    '1. อธิบายพัฒนาการด้านสังคมของจีนได้',
                                    '2. วิเคราะห์พัฒนาการด้านสังคมของจีนได้',
                                    '3. เห็นความสำคัญของการศึกษาพัฒนาการด้านสังคมของจีน'
                                ],
                                evaluation: [
                                    '1. ประเมินผลการเข้าร่วมกิจกรรม',
                                    '2. ประเมินผลการตอบคำถาม'
                                ]
                            }
                        },
                        {
                            id: 'HI_L09',
                            name: 'แหล่งอารยธรรมและแหล่งมรดกโลก ของอารยธรรมจีน',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100766',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/37/video_94974-v-202412250750-100766.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'ประเทศจีนเป็นประเทศที่มีอารยธรรมโบราณและมีประวัติศาสตร์อันยาวนาน มีธรรมชาติที่งดงาม มีประวัติศาสตร์ทางวัฒนธรรมและขนบประเพณีพื้นบ้านที่มีสีสันมากมาย เป็นหนึ่งในประเทศที่อุดมไปด้วยแหล่งมรดกโลกมากที่สุด',
                                objectives: [
                                    '1. บอกแหล่งอารยธรรมมรดกโลกที่สำคัญของอารยธรรมจีน',
                                    '2. สืบค้นข้อมูลเกี่ยวกับอารยธรรมจีนได้พอสังเขป',
                                    '3. เข้าใจและยอมรับความแตกต่างทางวัฒนธรรม'
                                ],
                                evaluation: [
                                    '1. ประเมินผลการเข้าร่วมกิจกรรม',
                                    '2. ประเมินผลการตอบคำถาม',
                                    '3. ประเมินใบงาน'
                                ]
                            }
                        },
                        {
                            id: 'HI_L10',
                            name: 'อิทธิพลของอารยธรรมจีน (1)',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100761',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/38/video_95026-v-202412261628-100761.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'สังคมไทยและสังคมเอเชียตะวันออกเฉียงใต้ ในปัจจุบันได้รับอิทธิพลมาจากอารยธรรมจีนมาตั้งแต่อดีต  เช่น ภาษา ศาสนา อาหาร ส่งผลให้ผู้คนที่อาศัยอยู่ในเอเชียตะวันออกเฉียงใต้มีวัฒนธรรมที่หลากหลาย การเรียนรู้วัฒนธรรมที่เหมือนและหลากหลายจะทำให้เกิดความเข้าใจอันดีต่อกันและสามารถอยู่ร่วมกันได้อย่างสันติ',
                                objectives: [
                                    '1. ยกตัวอย่างอิทธิพลของอารยธรรมจีนที่มีต่อสังคมไทยและเอเชียตะวันออกเฉียงใต้',
                                    '2. วิเคราะห์ปัจจัยที่ทำให้อารยธรรมจีนมีอิทธิพลต่อสังคมไทยและเอเชียตะวันออกเฉียงใต้',
                                    '3. เห็นคุณค่าของลักษณะพหุวัฒนธรรมในสังคมไทย'
                                ],
                                evaluation: [
                                    '1. ประเมินผลการเข้าร่วมกิจกรรม',
                                    '2. ประเมินผลการตอบคำถาม',
                                    '3. ประเมินใบงาน'
                                ]
                            }
                        },
                        {
                            id: 'HI_L11',
                            name: 'อิทธิพลของอารยธรรมจีน (2)',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100762',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/38/video_95025-v-202412261625-100762.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'สังคมไทยและสังคมเอเชียตะวันออกเฉียงใต้ ในปัจจุบันได้รับอิทธิพลมาจากอารยธรรมจีนมาตั้งแต่อดีต  เช่น ภาษา ศาสนา อาหาร ส่งผลให้ผู้คนที่อาศัยอยู่ในเอเชียตะวันออกเฉียงใต้มีวัฒนธรรมที่หลากหลาย การเรียนรู้วัฒนธรรมที่เหมือนและหลากหลายจะทำให้เกิดความเข้าใจอันดีต่อกันและสามารถอยู่ร่วมกันได้อย่างสันติ',
                                objectives: [
                                    '1. บอกตัวอย่างอิทธิพลของอารยธรรมจีนที่มีต่อสังคมไทยและเอเชียตะวันออกเฉียงใต้',
                                    '2. วิเคราะห์ปัจจัยที่ทำให้อารยธรรมจีนมีอิทธิพลต่อสังคมไทยและเอเชียตะวันออกเฉียงใต้',
                                    '3. เห็นคุณค่าของลักษณะพหุวัฒนธรรมในสังคมไทย'
                                ],
                                evaluation: [
                                    '1. ประเมินผลการเข้าร่วมกิจกรรม',
                                    '2. ประเมินผลการตอบคำถาม',
                                    '3. ประเมินใบงาน'
                                ]
                            }
                        },
                    ]
                },
                {
                    id: 'HI_U2',
                    name: 'หน่วยที่ 2: วัฒนธรรมกับสังคม',
                    lessons: [
                        {
                            id: 'HI_L12',
                            name: 'อิทธิพลของวัฒนธรรมตะวันตก (1)',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100763',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/38/video_95396-v-202501150858-100763.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'ในสมัยอยุธยา โดยเฉพาะรัชสมัยสมเด็จพระนารายณ์มหาราช ไทยได้เริ่มรับวิทยาการและวัฒนธรรมจากชาติตะวันตกอย่างหลากหลาย เช่น การแพทย์ อาวุธ การศึกษา และการก่อสร้าง เพื่อพัฒนาบ้านเมืองให้ทันสมัยและเสริมสร้างความเข้มแข็ง',
                                indicator: 'มฐ ส 4.2 ป. 5/1',

                                // Step 2: KPA Objectives (LINK)
                                objectives: {
                                    K: 'บอกตัวอย่างอิทธิพลของวัฒนธรรมตะวันตกที่รับเข้ามาในสมัยอยุธยาได้',
                                    P: 'สืบค้นและจำแนกหมวดหมู่วิทยาการตะวันตกที่เข้ามามีบทบาทในไทยได้',
                                    A: 'ตระหนักถึงความสำคัญของการเลือกรับปรับใช้พหุวัฒนธรรมเพื่อการพัฒนาชาติ'
                                },

                                // Step 3: Content Sections (DO)
                                contentSections: [
                                    {
                                        title: 'การแพทย์และการสาธารณสุข',
                                        content: 'มีการนำการแพทย์แผนตะวันตกเข้ามา เช่น การจดบันทึกอาการป่วย การใช้ยาสมุนไพรควบคู่กับยาฝรั่ง และการสร้างโรงพยาบาลแห่งแรกโดยมิชชันนารี',
                                        source: 'DLTV'
                                    },
                                    {
                                        title: 'อาวุธยุทโธปกรณ์',
                                        content: 'การรับอิทธิพลการหล่อปืนไฟ ปืนใหญ่ และการฝึกทหารแบบยุโรป เพื่อเพิ่มศักยภาพในการป้องกันราชอาณาจักร',
                                        source: 'DLTV'
                                    },
                                    {
                                        title: 'สถาปัตยกรรมและการก่อสร้าง',
                                        content: 'การสร้างป้อมปราการ กำแพงเมือง และพระราชวังที่ได้รับแรงบันดาลใจจากยุโรป เช่น พระนารายณ์ราชนิเวศน์ที่มีการใช้ระบบประปาและตึกแบบฝรั่ง',
                                        source: 'WEB'
                                    }
                                ],

                                // Step 4: SYNC Activities (Interactive)
                                syncActivities: {
                                    type: 'MATCH',
                                    instruction: 'จับคู่วิทยาการตะวันตกกับหมวดหมู่ให้ถูกต้อง',
                                    pairs: [
                                        { left: 'ปืนไฟ/ปืนใหญ่', right: 'การทหาร' },
                                        { left: 'การสร้างหอดูดาว', right: 'ดาราศาสตร์' },
                                        { left: 'ระบบท่อประปา', right: 'สถาปัตยกรรม' },
                                        { left: 'การเขียนแผนที่', right: 'ภูมิศาสตร์' },
                                        { left: 'ตำราโอสถพระนารายณ์', right: 'การแพทย์' }
                                    ]
                                },

                                // Step 5: REFLECT Tasks (Practice)
                                reflectTasks: [
                                    {
                                        type: 'OPEN_ENDED',
                                        question: 'หากสมเด็จพระนารายณ์มหาราชไม่ทรงเลือกรับวิทยาการตะวันตกเลย นักเรียนคิดว่าบ้านเมืองจะมีการเปลี่ยนแปลงไปอย่างไรในแง่ของการป้องกันประเทศ?',
                                        hints: ['คิดถึงประสิทธิภาพของอาวุธถิ่นเดิม', 'คิดถึงความก้าวหน้าของประเทศเพื่อนบ้าน'],
                                        source: 'WORKSHEET'
                                    }
                                ],

                                // Step 7: MASTER Challenge (Scenario)
                                masterChallenge: {
                                    type: 'SCENARIO',
                                    scenario: 'นักเรียนได้รับมอบหมายให้เป็นราชทูตที่ต้องไปศึกษาดูงานต่างประเทศในสมัยโบราณ',
                                    question: 'วิทยการใดที่คุณคิดว่าจำเป็นที่สุดที่จะต้องนำกลับมาพัฒนาอยุธยาในเวลานั้น เพราะเหตุใด?',
                                    rubric: [
                                        'ระบุวิทยาการตะวันตกที่ชัดเจน',
                                        'อธิบายความจำเป็นสอดคล้องกับสภาพสังคมสมัยนั้น',
                                        'เสนอแนวทางการนำมาปรับเข้ากับวัฒนธรรมเดิม'
                                    ]
                                },

                                evaluation: [
                                    '1. ประเมินจากความถูกต้องของการจับคู่ (Sync)',
                                    '2. การใช้เหตุผลในการตอบคำถามปลายเปิด (Reflect)',
                                    '3. ความคิดสร้างสรรค์และการประยุกต์ใช้ (Master)'
                                ],

                                // Step 1 & 6: Quiz (Pre-test / Post-test)
                                quiz: [
                                    {
                                        question: "วัฒนธรรมตะวันตกเริ่มมีบทบาทมากที่สุดในสมัยใดของอยุธยา?",
                                        options: ["ก. สมเด็จพระรามาธิบดีที่ 1", "ข. สมเด็จพระบรมไตรโลกนาถ", "ค. สมเด็จพระนารายณ์มหาราช", "ง. สมเด็จพระเจ้าตากสินมหาราช"],
                                        answer: 2,
                                        kpa: 'K'
                                    },
                                    {
                                        question: "วิทยาการด้านใดที่เห็นได้ชัดเจนจากพระนารายณ์ราชนิเวศน์ จังหวัดลพบุรี?",
                                        options: ["ก. การหล่อพระพุทธรูป", "ข. ระบบท่อประปาและอาคารแบบยุโรป", "ค. การทำนาขั้นบันได", "ง. การสานปลาตะเพียน"],
                                        answer: 1,
                                        kpa: 'K'
                                    },
                                    {
                                        question: "เหตุใดความรู้ด้านการทำแผนที่และภูมิศาสตร์จึงสำคัญในสมัยนั้น?",
                                        options: ["ก. เพื่อความสวยงาม", "ข. เพื่อการเดินเรือและการสำรวจทรัพยากร", "ค. เพื่อประกอบพิธีกรรม", "ง. เพื่อการแข่งขันกีฬาระดับโลก"],
                                        answer: 1,
                                        kpa: 'P'
                                    },
                                    {
                                        question: "วิทยาการตะวันตกด้านการทหารส่งผลกระทบโดยตรงต่อสิ่งใด?",
                                        options: ["ก. อาหารที่รับประทาน", "ข. การป้องกันประเทศและการรักษาอำนาจ", "ค. ความเชื่อเรื่องไสยศาสตร์", "ง. การแต่งกายของนางรำ"],
                                        answer: 1,
                                        kpa: 'P'
                                    },
                                    {
                                        question: "การเลือกรับวัฒนธรรมต่างชาติเข้ามารวมกับวัฒนธรรมไทยเดิมแสดงถึงสิ่งใด?",
                                        options: ["ก. ความอ่อนแอของชาติ", "ข. ความเฉลียวฉลาดในการปรับตัว (Adaptability)", "ค. การหมดสิ้นเอกลักษณ์ไทย", "ง. ความบังคับของต่างชาติ"],
                                        answer: 1,
                                        kpa: 'A'
                                    }
                                ],
                                harvestedAt: '2026-02-05T09:05:00+07:00'
                            }
                        },
                        {
                            id: 'HI_L13',
                            name: 'อิทธิพลของวัฒนธรรมตะวันตก (2)',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100764',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/38/video_95376-v-202501141228-100764.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'วัฒนธรรมของชาติตะวันตกเริ่มเข้ามีบทบาทในไทยสมัยอยุธยาและเริ่มมากขึ้นเรื่อย ๆ โดยเฉพาะอย่างยิ่งในสมัยพระบาทสมเด็จนารายณ์มหาราช ทำให้ได้รับวิทยาการความรู้ใหม่ ๆ จากชาติตะวันตกที่นำเข้ามาเผยแพร่ เช่น การแพทย์ อาวุธยุทโธปกรณ์ การทหาร การศึกษา การก่อสร้าง',
                                objectives: [
                                    '1. บอกตัวอย่างอิทธิพลของวัฒนธรรมตะวันตกที่รับเข้ามาเพื่อสร้างความทันสมัยได้',
                                    '2. สืบค้นอิทธิพลของวัฒนธรรมตะวันตกที่รับเข้ามาเพื่อสร้างความทันสมัยได้',
                                    '3. เห็นคุณค่าของลักษณะพหุวัฒนธรรมในสังคมไทย'
                                ],
                                evaluation: [
                                    '1. ประเมินผลการเข้าร่วมกิจกรรม',
                                    '2. ประเมินผลการตอบคำถาม',
                                    '3. ประเมินใบงาน'
                                ]
                            }
                        },
                        {
                            id: 'HI_L14',
                            name: 'การเข้ามาของอารยธรรมต่างชาติที่มีต่อสังคมไทย',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100767',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/38/video_95739-v-202501290746-100767.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'การเข้ามาของอารยธรรมต่างชาติในดินแดนไทยและเอเชียตะวันออกเฉียงใต้ส่งผลให้เกิดการรับวัฒนธรรมด้านต่างๆ เช่น ด้านศาสนา  ภาษาสถาปัตยกรรม นาฏศิลป์  วรรณกรรม',
                                objectives: [
                                    '1. อธิบายและวิเคราะห์การเข้ามาของอารยธรรมต่างชาติที่มีต่อสังคมไทย',
                                    '2. เกิดทักษะในการสืบค้นการเข้ามาของอารยธรรมต่างชาติที่มีต่อสังคมไทย',
                                    '3. เห็นคุณค่าของลักษณะพหุวัฒนธรรมในสังคมไทย'
                                ],
                                evaluation: [
                                    '1. ประเมินผลการเข้าร่วมกิจกรรม',
                                    '2. ประเมินผลการตอบคำถาม',
                                    '3. ประเมินใบงาน'
                                ]
                            }
                        },
                        {
                            id: 'HI_L15',
                            name: 'ผลกระทบของการรับวัฒนธรรมต่างชาติ',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100765',
                            hlsUrl: 'https://dltv.ac.th/vod/upload/data/videos/38/video_95915-v-202502050723-100765.mp4/master.m3u8',
                            videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'การรับวัฒนธรรมต่างชาติทั้งเพื่อพัฒนาบ้านเมืองและเพื่อความทันสมัยล้วนมีผลทําให้เกิดการเปลี่ยนแปลงต่อวิถีชีวิต และวัฒนธรรมดั้งเดิมของชาติซึ่งการเปลี่ยนแปลงดังกล่าวมีทั้งผลดีและผลเสียต่อสังคมไทย',
                                objectives: [
                                    '1. อธิบายและวิเคราะห์ผลกระทบของวัฒนธรรมต่างชาติที่มีต่อสังคมไทยได้',
                                    '2. เกิดทักษะในการสืบค้นผลกระทบของวัฒนธรรมต่างชาติที่มีต่อสังคมไทยได้',
                                    '3. ตระหนักถึงความสำคัญของผลกระทบของวัฒนธรรมต่างชาติที่มีต่อสังคมไทย'
                                ],
                                evaluation: [
                                    '1. ประเมินผลการเข้าร่วมกิจกรรม',
                                    '2. ประเมินผลการตอบคำถาม',
                                    '3. ประเมินใบงาน'
                                ]
                            }
                        },
                    ]
                },
                {
                    id: 'HI_U3',
                    name: 'หน่วยที่ 3: อาณาจักรธนบุรี',
                    lessons: [
                        {
                            id: 'HI_L16',
                            name: 'กำเนิดอาณาจักรธนบุรี',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100768',
                            // videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'ก่อนเสียกรุงศรีอยุธยา 3 เดือน สมเด็จพระเจ้าตากสินมหาราชได้รวบรวมกำลังคนประมาณ 1,000 คน ตีฝ่าลงล้อมกองทัพพม่าออกไปตั้งมั่นที่เมืองจันทบุรี เมื่อกรุงศรอยุธยาเสียแก่พม่าแล้ว จึงนำกำลังไปตีค่ายพม่าที่ค่ายโพธิ์สามต้น และสามารถยึดอำนาจคืนจากพม่าได้สำเร็จ ใช้เวลาเพียง 7 เดือน ในการกอบกู้อิสรภาพคืนมาได้ แล้วจึงปราบดาภิเษกเป็นพระมหากษัตริย์แห่งกรุงธนบุรีศรีมหาสมุทร',
                                objectives: [
                                    '1. อธิบายความเป็นมาของการการก่อตั้งอาณาจักรธนุบรีได้ถูกต้อง',
                                    '2. วิเคราะห์ปัจจัยที่ส่งเสริมให้มีการสถาปนาอาณาจักรธนบุรีได้อย่างถูกต้อง',
                                    '3. เห็นคุณค่าและความสำคัญของการสถาปนาอาณาจักธนบุรีที่มีต่อประเทศไทย'
                                ],
                                evaluation: [
                                    '1. ประเมินผลการเข้าร่วมกิจกรรม',
                                    '2. ประเมินผลการตอบคำถาม',
                                    '3. ประเมินใบงาน'
                                ]
                            }
                        },
                        {
                            id: 'HI_L17',
                            name: 'สมเด็จพระเจ้าตากสินมหาราช',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100769',
                            // videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'ประเทศไทยมีความเป็นมายาวนาน มีอาณาจักรที่เจริญรุ่งเรืองในช่วงเวลาต่างๆ ดังเช่น อาณาจักรกรุงธนบุรี สมเด็จพระเจ้าตากสินมหาราช พระมหากษัตริย์ผู้สถาปนาอาณาจักรกรุงธนบุรี สร้างรากฐานและความมั่นคง จนทำให้มีประเทศไทยจนถึงทุกวันนี้ คนรุ่นหลังจึงควรถือเป็น ตัวอย่างในการทำประโยชน์ให้แก่ชาติบ้านเมือง',
                                objectives: [
                                    '1. บอกพระราชประวัติและพระราชกรณียกิจที่สำคัญของสมเด็จพระเจ้าตากสินมหาราช ได้ถูกต้อง',
                                    '2. เกิดทักษะการทำงานกลุ่ม และสามารถปฏิบัติตามกติกาของกิจกรรมกลุ่มได้',
                                    '3. ตระหนักในพระมหากรุณาธิคุณของสมเด็จพระเจ้าตากสินมหาราช'
                                ],
                                evaluation: [
                                    '1. ประเมินผลการเข้าร่วมกิจกรรม',
                                    '2. ประเมินผลการตอบคำถาม',
                                    '3. ประเมินใบงาน'
                                ]
                            }
                        },
                        {
                            id: 'HI_L18',
                            name: 'พัฒนาการของอาณาจักรธนบุรี',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100770',
                            // videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'อาณาจักรธนบุรี เป็นยุคแห่งการกอบกู้เอกราช และบูรณะฟื้นฟูบ้านเมืองในทุกๆ ด้านโดยมีพระมหากษัตริย์ ทรงเป็นผู้นำสำคัญในการพัฒนาและสร้างความมั่นคงแก่บ้านเมือง',
                                objectives: [
                                    '1. อธิบายพัฒนาการด้านการเมืองการปกครองและด้านเศรษฐกิจของอาณาจักรธนบุรีได้',
                                    '2. เกิดทักษะการทำงานกลุ่ม และสามารถปฏิบัติตามกติกาของกิจกรรมกลุ่มได้',
                                    '3. ตระหนักในพระมหากรุณาธิคุณของสมเด็จพระเจ้าตากสินมหาราช'
                                ],
                                evaluation: [
                                    '1. ประเมินผลการเข้าร่วมกิจกรรม',
                                    '2. ประเมินผลการตอบคำถาม'
                                ]
                            }
                        },
                        {
                            id: 'HI_L19',
                            name: 'ภูมิปัญญาไทยสมัยธนบุรี',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100771',
                            // videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'ภูมิปัญญาไทยสมัยธนบุรี เป็นสิ่งที่มีคุณค่าทำให้เกิดความภาคภูมิใจและควรค่าแก่การอนุรักษ์ ไม่ว่าจะเป็นด้านวิถีชีวิต งานช่าง สถาปัตยกรรม ด้านนาฏดุริยางค์ และด้านวรรณกรรม',
                                objectives: [
                                    '1. ยกตัวอย่างภูมิปัญญาไทยสมัยกรุงธนบุรี',
                                    '2. ร่วมเสนอเส้นทางของกรุงธนบุรี',
                                    '3. เห็นคุณค่าของภูมิปัญญาไทยสมัยธนบุรี'
                                ],
                                evaluation: [
                                    '1. ประเมินผลการเข้าร่วมกิจกรรม',
                                    '2. นำเสนองาน',
                                    '3 ทำใบงานที่ 3 เรื่อง ภูมิปัญญาไทยสมัยธนบุรี'
                                ]
                            }
                        },
                        {
                            id: 'HI_L20',
                            name: 'มรดกทางวัฒนธรรมสมัยธนบุรี',
                            dltvUrl: 'https://dltv.ac.th/teachplan/episode/100772',
                            // videoSource: 'HLS',
                            pedagogicalData: {
                                summary: 'มรดกทางวัฒนธรรมสมัยธนบุรีสะท้อนถึงการฟื้นฟูชาติในสภาวะวิกฤต แสดงออกผ่านภูมิปัญญาและการปรับตัวเพื่อความอยู่รอดและความมั่นคงของชาติ ซึ่งควรค่าแก่การสืบทอดและเรียนรู้',
                                objectives: [
                                    '1. อธิบายมรดกทางวัฒนธรรมที่สำคัญสมัยธนบุรี',
                                    '2. วิเคราะห์ความเชื่อมโยงระหว่างมรดกวัฒนธรรมกับวิถีชีวิตผู้คน',
                                    '3. เห็นคุณค่าของมรดกวัฒนธรรมไทย'
                                ],
                                evaluation: [
                                    '1. ประเมินผลการเข้าร่วมกิจกรรม',
                                    '2. ประเมินผลการตอบคำถาม',
                                    '3. กิจกรรมสร้างสรรค์ผลงาน'
                                ]
                            }
                        },
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
