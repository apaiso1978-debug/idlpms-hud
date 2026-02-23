/**
 * DNACoreService
 * 
 * Calculates and manages the 5-Axis Intelligence DNA for students.
 * Integrates data from multiple sources (like Fitness for the 'P' axis)
 * to provide a unified DNA profile.
 * 
 * Axes:
 * - K: Knowledge (ความรู้)
 * - P: Process/Physical/Skill (กระบวนการ/ทักษะ/สมรรถภาพ)
 * - A: Attitude (เจตคติ)
 * - E: Effort (ความพยายาม)
 * - D: Discipline (วินัย)
 */

class DNACoreService {

    /**
     * Get the complete DNA profile for a specific student.
     * @param {string} studentId 
     * @returns {Object} { k, p, a, e, d }
     */
    static getStudentDNA(studentId) {
        // Base structure
        const dna = { k: 0, p: 0, a: 0, e: 0, d: 0 };

        // --- 1. Calculate P (Physical/Skill) from Fitness Data ---
        let fitnessGrade = 0; // Default if no data
        try {
            // Check if we have local results from FitnessService
            let results = {};
            if (typeof FitnessService !== 'undefined') {
                results = FitnessService.getLocalResults();
            } else {
                results = JSON.parse(localStorage.getItem('fitness_results_v1') || '{}');
            }

            const studentFitness = results[studentId];

            if (studentFitness && studentFitness.sitReach != null && studentFitness.pushUp != null && studentFitness.stepUp != null) {
                // We have complete data. Let's grade it.
                if (typeof FitnessGrading !== 'undefined' && typeof EOS_DATA !== 'undefined' && EOS_DATA.users[studentId]) {
                    const user = EOS_DATA.users[studentId];
                    const age = FitnessGrading.estimateAgeFromClass(user.classId);
                    const gender = FitnessGrading.detectGender(user.fullName);

                    const grades = FitnessGrading.gradeAll(studentFitness, age, gender);

                    // Convert grade level to a 0-100 score for the P axis
                    // Levels: 0=Very Poor, 1=Poor, 2=Moderate, 3=Good, 4=Very Good
                    const levelScores = {
                        0: 30, // Very Poor -> 30%
                        1: 50, // Poor -> 50%
                        2: 70, // Moderate -> 70%
                        3: 85, // Good -> 85%
                        4: 95  // Very Good -> 95%
                    };

                    if (grades && grades.overall) {
                        fitnessGrade = levelScores[grades.overall.levelIndex] || 50;
                    }
                } else {
                    // Fallback if Grading logic missing but data exists
                    fitnessGrade = 60;
                }
            } else {
                // No/incomplete fitness data
                // In a real system, we might leave it as 0 or use historical data.
                // For demonstration, if no data, we simulate a baseline.
                fitnessGrade = this._simulateBaseScore(studentId, 'p', 45, 65);
            }
        } catch (e) {
            console.error('[DNACoreService] Error calculating P axis:', e);
            fitnessGrade = 50;
        }

        dna.p = fitnessGrade;

        // --- 2. Calculate Output for K, A, E, D (Currently Simulated) ---
        // In the future, these will pull from Academic/Behavioral services
        dna.k = this._simulateBaseScore(studentId, 'k', 60, 95);
        dna.a = this._simulateBaseScore(studentId, 'a', 70, 95);
        dna.e = this._simulateBaseScore(studentId, 'e', 65, 95);
        dna.d = this._simulateBaseScore(studentId, 'd', 75, 100);

        return dna;
    }

    /**
     * Get aggregated DNA for a specific class (Average of all students)
     * @param {string} classId 
     * @returns {Object}
     */
    static getClassAverageDNA(classId) {
        if (typeof EOS_DATA === 'undefined' || !EOS_DATA.users) return null;

        const students = Object.entries(EOS_DATA.users)
            .filter(([_, u]) => u.role === 'STUDENT' && u.classId === classId && u.schoolId === '99999999-9999-4999-8999-999999999999')
            .map(([id]) => id);

        if (students.length === 0) return { k: 0, p: 0, a: 0, e: 0, d: 0 };

        const totals = { k: 0, p: 0, a: 0, e: 0, d: 0 };

        students.forEach(id => {
            const dna = this.getStudentDNA(id);
            totals.k += dna.k;
            totals.p += dna.p;
            totals.a += dna.a;
            totals.e += dna.e;
            totals.d += dna.d;
        });

        return {
            k: Math.round(totals.k / students.length),
            p: Math.round(totals.p / students.length),
            a: Math.round(totals.a / students.length),
            e: Math.round(totals.e / students.length),
            d: Math.round(totals.d / students.length)
        };
    }

    /**
     * Get aggregated DNA for the entire school
     * @returns {Object}
     */
    static getSchoolAverageDNA() {
        if (typeof EOS_DATA === 'undefined' || !EOS_DATA.users) return null;

        const students = Object.entries(EOS_DATA.users)
            .filter(([_, u]) => u.role === 'STUDENT' && u.schoolId === '99999999-9999-4999-8999-999999999999')
            .map(([id]) => id);

        if (students.length === 0) return { k: 0, p: 0, a: 0, e: 0, d: 0 };

        const totals = { k: 0, p: 0, a: 0, e: 0, d: 0 };

        students.forEach(id => {
            const dna = this.getStudentDNA(id);
            totals.k += dna.k;
            totals.p += dna.p;
            totals.a += dna.a;
            totals.e += dna.e;
            totals.d += dna.d;
        });

        return {
            k: Math.round(totals.k / students.length),
            p: Math.round(totals.p / students.length),
            a: Math.round(totals.a / students.length),
            e: Math.round(totals.e / students.length),
            d: Math.round(totals.d / students.length),
            _totalAnalyzed: students.length
        };
    }

    /**
     * Helper to simulate a consistent pseudo-random score based on student ID string
     */
    static _simulateBaseScore(studentId, axisKey, min, max) {
        // Simple hash to make the random score consistent for the same student
        let hash = 0;
        const str = studentId + axisKey;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }

        // Normalize hash to 0-1
        const normalized = Math.abs(hash) / 2147483647;
        return Math.round(min + (normalized * (max - min)));
    }

}

// Make globally available
if (typeof window !== 'undefined') {
    window.DNACoreService = DNACoreService;
}
