/**
 * Phase 18: E-OS Performance Assessor Module (PA Evaluator)
 * 
 * Master Engine for aggregating points, ranking personnel, and functioning as a Sandbox
 * PA (Performance Agreement) and Salary Evaluation tool customized for Thai Context.
 */

const PerformanceAssessor = {

    // ── Configuration ──
    TIERS: [
        { name: 'ดีเด่น (Outstanding)', minScore: 90, class: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
        { name: 'ดีมาก (Excellent)', minScore: 80, class: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
        { name: 'ดี (Good)', minScore: 70, class: 'text-[var(--vs-accent)] bg-[rgba(34,211,238,0.1)] border-[rgba(34,211,238,0.3)]' },
        { name: 'พอใช้ (Fair)', minScore: 60, class: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
        { name: 'ปรับปรุง (Needs Improvement)', minScore: 0, class: 'text-red-400 bg-red-500/10 border-red-500/30' }
    ],

    init() {
        console.log('[PerformanceAssessor] Booting Master Evaluation Engine...');
    },

    // ── Data Ingestion & Evaluation ──
    /**
     * Extracts and evaluates the workforce under a specific commander.
     * ESA Dir evaluates School Dirs. School Dir evaluates Teachers.
     * @param {string} commanderId - ID of the reviewing entity
     * @param {string} commanderRole - 'ESA_DIR' or 'SCHOOL_DIR'
     */
    evaluateWorkforce(commanderId, commanderRole) {
        const idlpmsData = window.EOS_DATA || (window.parent && window.parent.EOS_DATA);
        if (!idlpmsData || !idlpmsData.users) return [];

        let targetRole = commanderRole === 'ESA_DIR' ? 'SCHOOL_DIR' : 'TEACHER';
        let targetPersonnel = [];

        // Find commander's scope (school or district)
        let commanderSchoolId = null;
        let commanderDistrictId = null;

        if (idlpmsData.users[commanderId]) {
            commanderSchoolId = idlpmsData.users[commanderId].schoolId;
            commanderDistrictId = idlpmsData.users[commanderId].districtId;
        }

        // 1. Gather Target Subjects
        Object.values(idlpmsData.users).forEach(user => {
            if (user.role !== targetRole) return;

            if (commanderRole === 'SCHOOL_DIR' && user.schoolId === commanderSchoolId) {
                targetPersonnel.push(this._initializeSubject(user));
            } else if (commanderRole === 'ESA_DIR' && user.districtId === commanderDistrictId) {
                targetPersonnel.push(this._initializeSubject(user));
            }
        });

        // 2. Ingest Delegation Data (Workload & Timeliness)
        const storage = window.localStorage || (window.parent && window.parent.localStorage);
        const rawDel = storage.getItem('eos_delegations_v1');
        if (rawDel) {
            const delegations = JSON.parse(rawDel);
            delegations.forEach(del => {
                const subject = targetPersonnel.find(p => p.id === del.assignee);
                if (!subject) return;

                subject.metrics.totalTasksAssigned++;

                if (del.status === 'COMPLETED') {
                    subject.metrics.tasksCompleted++;
                    // Base points are awarded based on score inside delegation if available, else standard 100
                    const awardedPts = (del.score !== null && del.score !== undefined) ? Number(del.score) : (Number(del.baseScore) || 100);
                    subject.metrics.earnedGamificationPts += awardedPts;

                    // Timeliness calculation
                    const submitTime = del.completedAt ? new Date(del.completedAt).getTime() : new Date().getTime();
                    const deadlineTime = del.deadline ? new Date(del.deadline).getTime() : new Date().getTime() + 86400000;

                    if (submitTime <= deadlineTime) {
                        subject.metrics.completedOnTime++;
                    } else {
                        subject.metrics.completedLate++;
                        // Minor penalty for late work affecting the final PA
                        subject.metrics.earnedGamificationPts -= (awardedPts * 0.1);
                    }
                } else if (del.status === 'IN_PROGRESS' || del.status === 'PENDING') {
                    subject.metrics.tasksPending++;
                }
            });
        }

        // 3. Ingest Passport Credits (Achievements & Training)
        targetPersonnel.forEach(subject => {
            const passportKey = `eos_passport_${subject.id}`;
            const rawPassport = storage.getItem(passportKey);
            if (rawPassport) {
                const passportData = JSON.parse(rawPassport);
                if (passportData.credentials) {
                    passportData.credentials.forEach(cred => {
                        if (cred.status === 'COMPLETED' || cred.status === 'VERIFIED') {
                            subject.metrics.passportCredits++;
                            subject.metrics.earnedGamificationPts += 50; // Bonus for verified achievements outside standard tasks
                        }
                    });
                }
            }
        });

        // 4. Calculate Final PA Score & Tier
        targetPersonnel.forEach(subject => {
            subject.assessment = this._calculateFinalAssesment(subject.metrics);
        });

        // 5. Rank
        const finalRanking = targetPersonnel.sort((a, b) => b.assessment.finalScore - a.assessment.finalScore);

        // 6. 👁️ Drop Neural Signal to Activity Explorer (Transparency Rule)
        this._logToActivityExplorer(commanderId, finalRanking);

        return finalRanking;
    },

    /**
     * Creates a blank evaluation frame for a user
     */
    _initializeSubject(user) {
        return {
            id: user.id,
            name: user.fullName,
            role: user.role,
            position: user.position || 'บุคลากร',
            avatar: user.avatar,
            metrics: {
                totalTasksAssigned: 0,
                tasksCompleted: 0,
                tasksPending: 0,
                completedOnTime: 0,
                completedLate: 0,
                earnedGamificationPts: 0,
                passportCredits: 0
            },
            assessment: null // Generated post-calculation
        };
    },

    /**
     * Translates raw metrics into a 0-100% KPA+ Score (Thai Master Evaluator).
     * Formula: 
     * 1. World-Class Delivery (40%) : Completion Rate (25%) + Timeliness SLA (15%)
     * 2. Learner DNA Outcomes (40%) : 5-Axis Student KPI Mapping (Pillar 2)
     * 3. Self-Development (20%)     : Gamification & Passport Credentials (Pillar 3)
     */
    _calculateFinalAssesment(metrics) {
        // --- Pillar 1: World-Class Agile Delivery (Max 40 Points) ---
        let deliveryScore = 0;
        let completionRatePct = 0;

        if (metrics.totalTasksAssigned > 0) {
            completionRatePct = (metrics.tasksCompleted / metrics.totalTasksAssigned) * 100;
        } else {
            completionRatePct = 85; // Benevolent baseline
        }

        let timelinessPct = 0;
        if (metrics.tasksCompleted > 0) {
            timelinessPct = (metrics.completedOnTime / metrics.tasksCompleted) * 100;
        } else {
            timelinessPct = 85; // Benevolent baseline
        }

        // 25% weight for getting work done, 15% for doing it strictly on time
        deliveryScore = (completionRatePct * 0.25) + (timelinessPct * 0.15);

        // --- Pillar 2: Learner Outcomes / Thai 5-Axis DNA (Max 40 Points) ---
        // (Connecting to future student outcomes tracking, currently simulated based on baseline performance)
        // A teacher with high task delivery usually manages student DNA well in a simulated setup.
        let estimatedStudentDNAPct = 75 + (completionRatePct * 0.2);
        estimatedStudentDNAPct = Math.min(100, estimatedStudentDNAPct);
        let dnaOutcomesScore = estimatedStudentDNAPct * 0.40;

        // --- Pillar 3: Self-Development & Passport (Max 20 Points) ---
        // Expected average Gamification Points per PA cycle = 800
        let gamificationPct = (Math.min(metrics.earnedGamificationPts, 800) / 800) * 100;
        // Bonus 5% for having 5+ approved Passport credentials
        let passportBonusPct = Math.min((metrics.passportCredits / 5) * 100, 100);

        let combinedDevPct = (gamificationPct * 0.6) + (passportBonusPct * 0.4);
        let selfDevScore = combinedDevPct * 0.20;

        // --- Grand Total (100 Points) ---
        let finalScore = deliveryScore + dnaOutcomesScore + selfDevScore;
        finalScore = Math.max(0, Math.min(100, Math.round(finalScore * 10) / 10));

        // Locate Tier (Thai PA Evaluation Standards)
        const tier = this.TIERS.find(t => finalScore >= t.minScore) || this.TIERS[this.TIERS.length - 1];

        return {
            finalScore,
            completionRate: Math.round(completionRatePct),
            timelinessRate: Math.round(timelinessPct),
            dnaOutcomes: Math.round(estimatedStudentDNAPct),
            selfDevRate: Math.round(combinedDevPct),
            tierName: tier.name,
            tierClass: tier.class
        };
    },

    /**
     * 👁️ Drops Neural Signals into the system's Activity Log (Activity Explorer view)
     * Ensuring absolute transparency for both the Commander and the Subject.
     */
    _logToActivityExplorer(commanderId, rankings) {
        try {
            const storage = window.localStorage || (window.parent && window.parent.localStorage);
            const key = 'eos_activity_signals_v1';
            const raw = storage.getItem(key);
            let signals = raw ? JSON.parse(raw) : [];

            // Add batch evaluation event
            signals.push({
                id: `SIG_${Date.now()}`,
                type: 'SYSTEM_EVALUATION',
                actor: commanderId,
                action: 'KPA+ Master Evaluation Refresh',
                timestamp: new Date().toISOString(),
                visibility: ['DIR_MABLUD', 'ESA_DIR'] // Visible to admins
            });

            // Add individual notifications for top performers
            rankings.forEach((subject, idx) => {
                const isOutstanding = subject.assessment.finalScore >= 90;

                signals.push({
                    id: `SIG_${Date.now()}_${idx}`,
                    type: isOutstanding ? 'ACHIEVEMENT_UNLOCKED' : 'PERFORMANCE_UPDATE',
                    actor: subject.id,
                    target: subject.id,
                    action: `KPA+ Score Calculated: ${subject.assessment.finalScore}% (${subject.assessment.tierName})`,
                    details: `Task Delivery: ${subject.assessment.completionRate}%, Student DNA: ${subject.assessment.dnaOutcomes}%`,
                    timestamp: new Date().toISOString(),
                    visibility: [subject.id, commanderId] // Visible to the user and their boss
                });
            });

            storage.setItem(key, JSON.stringify(signals));
        } catch (e) {
            console.warn('[ActivityExplorer] Failed to log PA Evaluation signals', e);
        }
    }
};

window.PerformanceAssessor = PerformanceAssessor;
