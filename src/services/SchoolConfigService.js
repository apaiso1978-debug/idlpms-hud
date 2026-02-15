/**
 * SchoolConfigService - Manages dynamic school configuration for scheduling
 */
class SchoolConfigService {
    static STORAGE_KEYS = {
        TEACHER_CONFIG: 'IDLPMS_TeacherConfig_',
        SUBJECT_CARDS: 'IDLPMS_SubjectCards'
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

            // 3. Get Subjects — Priority: IDLPMS_DATA.subjects (data.js) > LocalStorage SubjectCards
            let subjects = [];
            if (typeof IDLPMS_DATA !== 'undefined' && IDLPMS_DATA.subjects) {
                // Use centralized subject bank from data.js
                subjects = Object.values(IDLPMS_DATA.subjects).map(s => ({
                    id: s.id,
                    name: s.name,
                    color: s.color,
                    type: s.type || 'CORE',
                    periodsPerWeek: s.periodsPerWeek || {}
                }));
            } else {
                // Fallback to LocalStorage Subject Cards
                const subjectCards = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.SUBJECT_CARDS) || '[]');
                subjects = subjectCards.map(card => ({
                    id: card.subjectId || card.id,
                    name: card.subjectName || card.name,
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

            // 6. Pre-assigned slots (สวดมนต์ ศุกร์คาบ 8, ลูกเสือ พุธคาบ 8, etc.)
            const preAssignedSlots = school.preAssignedSlots || [];

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
