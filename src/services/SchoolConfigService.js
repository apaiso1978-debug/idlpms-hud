/**
 * SchoolConfigService - Manages dynamic school configuration for scheduling
 */
class SchoolConfigService {
    static STORAGE_KEYS = {
        TEACHER_CONFIG: 'EOS_TeacherConfig_',
        SUBJECT_CARDS: 'EOS_SubjectCards',
        DIRECTOR_SUBJECT_BANK: 'EOS_DirectorSubjectBank',  // ← Hierarchy: Director's master catalog
        TEACHER_SUBJECT_BANK: 'eos_subject_bank'            // ← Teacher's personal bank
    };

    /**
     * Gets the full schoolData object required by the TimetableScheduler
     * @param {string} schoolId 
     * @returns {Promise<Object>}
     */
    static async getSchoolData(schoolId) {
        try {
            // 1. Initialize Services
            const dataService = await DataServiceFactory.getInstance();
            const school = await dataService.getSchool(schoolId);
            if (!school) throw new Error('School not found');

            // 🧬 DYNAMIC PARAMETERS: Use school-specific structure OR defaults
            const scheduleStructure = school.scheduleStructure || {
                daysPerWeek: 5,
                periodsPerDay: 8,
                lunchPeriod: 5,
            };

            // 2. Map Classes dynamically from school profile
            const classes = (school.classes || []).map(c => {
                const parts = c.split('/');
                const grade = parseInt(parts[0]);
                return {
                    grade: grade,
                    section: parts[1] || '1',
                    level: `ป.${grade}`
                };
            });

            // 3. Get Subjects — Priority: data.js > Director Bank > Teacher Bank
            //    Hierarchy: Director's catalog is the authoritative source
            let subjects = [];
            if (typeof EOS_DATA !== 'undefined' && EOS_DATA.subjects) {
                // Use centralized subject bank from data.js
                subjects = Object.values(EOS_DATA.subjects).map(s => ({
                    id: s.id,
                    name: s.name,
                    color: s.color,
                    type: s.type || 'CORE',
                    periodsPerWeek: s.periodsPerWeek || {}
                }));
            } else {
                // Fallback: Director Bank → Teacher Bank → legacy key
                const directorBank = localStorage.getItem(this.STORAGE_KEYS.DIRECTOR_SUBJECT_BANK);
                const teacherBank = localStorage.getItem(this.STORAGE_KEYS.TEACHER_SUBJECT_BANK);
                const legacyBank = localStorage.getItem(this.STORAGE_KEYS.SUBJECT_CARDS);
                const subjectCards = JSON.parse(directorBank || teacherBank || legacyBank || '[]');
                subjects = subjectCards.map(card => ({
                    id: card.subjectId || card.id,
                    name: card.subjectName || card.nameTH || card.name,
                    color: card.color,
                    type: 'CORE',
                    periodsPerWeek: {
                        'ป.1': card.periodsPerWeek, 'ป.2': card.periodsPerWeek,
                        'ป.3': card.periodsPerWeek, 'ป.4': card.periodsPerWeek,
                        'ป.5': card.periodsPerWeek, 'ป.6': card.periodsPerWeek
                    }
                }));
            }

            // 4. Get Teacher Config (DataService is the source of truth)
            const allUsers = await dataService.getUsersBySchool(schoolId);
            const teachers = allUsers
                .filter(u => u.role === 'TEACHER')
                .map(u => ({
                    id: u.id,
                    name: u.fullName || u.name,
                    canTeachSubjects: u.canTeachSubjects || [],
                    homeroomClass: u.homeroomClass || null,
                    maxPeriodsPerDay: u.maxPeriodsPerDay || 6,
                    maxPeriodsPerWeek: u.maxPeriodsPerWeek || 25,
                    unavailableSlots: u.unavailableSlots || [],
                    workloadRoles: u.workloadRoles || []
                }));

            // 5. Build Constraints
            const constraints = {
                maxConsecutivePeriodsPerSubject: 2,
                specialRooms: [],
                subjectPriority: {}
            };

            // Priority: CORE > EXTRA > ACTIVITY
            subjects.forEach(s => {
                constraints.subjectPriority[s.id] = s.type === 'CORE' ? 100 : s.type === 'EXTRA' ? 50 : 10;
            });

            // 6. Pre-assigned slots — Hierarchy cascade:
            //    Priority: school profile (data.js) > Director's Domain 4 policy (localStorage)
            let preAssignedSlots = school.preAssignedSlots || [];

            if (preAssignedSlots.length === 0) {
                // Fallback: build from Director's Domain 2+4 inputs
                const sid = schoolId;
                const domainKey = 'EOS_DomainInputs_';
                try {
                    const d2 = JSON.parse(localStorage.getItem(`${domainKey}${sid}_d2`) || 'null');
                    const d4 = JSON.parse(localStorage.getItem(`${domainKey}${sid}_d4`) || 'null');

                    if (d2) {
                        d2.forEach(a => preAssignedSlots.push({
                            subjectId: (a.id || '').replace(/_\d+$/, ''),
                            day: a.day, period: a.period,
                            domain: 2, visibility: 'teacher-only'
                        }));
                    }
                    if (d4) {
                        d4.forEach(a => preAssignedSlots.push({
                            subjectId: a.id,
                            day: a.day, period: a.period,
                            domain: 4, visibility: 'all'
                        }));
                    }
                } catch (e) {
                    console.warn('SchoolConfigService: Could not load Domain inputs', e);
                }
            }

            return {
                scheduleStructure,
                classes,
                subjects,
                teachers,
                constraints,
                preAssignedSlots
            };

        } catch (error) {
            console.error('SchoolConfigService Error:', error);
            throw error;
        }
    }

    /**
     * Saves teacher assignments for a school
     * @param {string} schoolId 
     * @param {Array} teachers 
     */
    static saveTeacherConfig(schoolId, teachers) {
        localStorage.setItem(`${this.STORAGE_KEYS.TEACHER_CONFIG}${schoolId}`, JSON.stringify({ teachers }));
    }
}

window.SchoolConfigService = SchoolConfigService;
