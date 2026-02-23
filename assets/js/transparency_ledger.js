/**
 * Phase 17: E-OS Transparency Ledger Engine
 * Handles Dynamic Countdowns, Gamified Scoring logic, and Leaderboard Generation.
 */

const TransparencyLedger = {
    // 1. Core Config
    DOM_CONTAINER: 'ledger-content',

    init() {
        this.refreshData();
        // Start live countdown ticker
        this.startTicker();
    },

    startTicker() {
        if (this.tickerId) clearInterval(this.tickerId);
        this.tickerId = setInterval(() => {
            this.updateAllCountdowns();
        }, 60000); // update every minute
    },

    // 2. Main Data Fetch and Compile
    refreshData() {
        const container = document.getElementById(this.DOM_CONTAINER);
        if (!container) return;

        // Secure extraction of Auth and System Data
        const idlpmsData = window.EOS_DATA || (window.parent && window.parent.EOS_DATA);

        let currentUser = null;
        try {
            // Priority 1: Unified Auth Key
            const storage = window.localStorage || (window.parent && window.parent.localStorage);
            const activeUserId = storage.getItem('eos_active_user_id') || storage.getItem('eos_active_role');

            if (activeUserId && idlpmsData && idlpmsData.users[activeUserId]) {
                currentUser = idlpmsData.users[activeUserId];
            } else {
                // Priority 2: Legacy fallback
                const rawLegacy = storage.getItem('CURRENT_USER') || storage.getItem('currentUser');
                if (rawLegacy) currentUser = JSON.parse(rawLegacy);
            }
        } catch (err) {
            console.error('[TransparencyLedger] Session Extraction Error:', err);
        }

        if (!currentUser || !idlpmsData || !idlpmsData.users) {
            container.innerHTML = `<div class="p-8 text-center text-red-400">Error: User Session or Core Data not found. Active ID Check Failed.</div>`;
            return;
        }

        const role = currentUser.role;
        const mySchoolId = currentUser.schoolId;

        // Determine user's district for upward/downward visibility
        let myDistrictId = currentUser.districtId;
        if (!myDistrictId && mySchoolId && idlpmsData.structure && idlpmsData.structure.schools[mySchoolId]) {
            myDistrictId = idlpmsData.structure.schools[mySchoolId].districtId;
        }

        let targetPersonnel = []; // RESTORED THIS LINE

        Object.entries(idlpmsData.users).forEach(([uid, uData]) => {
            // TRANSPARENCY VISIBILITY: Vertical and Horizontal
            let shouldInclude = false;

            if (role === 'ESA_DIR') {
                // ESA Director sees themselves and all School Directors in their district
                if (uData.districtId === myDistrictId && (uData.role === 'SCHOOL_DIR' || uData.role === 'ESA_DIR')) {
                    shouldInclude = true;
                }
            } else if (role === 'SCHOOL_DIR' || role === 'TEACHER') {
                // School personnel see everyone in their school + their ESA Director
                if (uData.schoolId === mySchoolId || (uData.role === 'ESA_DIR' && uData.districtId === myDistrictId)) {
                    shouldInclude = true;
                }
            } else {
                // Fallback (e.g., MOE, OBEC) sees peers
                if (uData.role === role) {
                    shouldInclude = true;
                }
            }

            if (shouldInclude) {
                targetPersonnel.push({
                    id: uid,
                    name: uData.fullName,
                    roleLabel: uData.position || (uData.role === 'SCHOOL_DIR' ? 'ผู้อำนวยการ' : 'ครูผู้สอน'),
                    img: uData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(uData.fullName)}&background=3f3f46&color=e4e4e7`,
                    score: 0,
                    completedEarly: 0,
                    completedOnTime: 0,
                    completedLate: 0,
                    activeTasks: [] // to hold raw active tasks for countdowns
                });
            }
        });

        // 3. Score Processing Engine
        // Pull tasks from TaskSystem
        let allTasks = {};
        const activeTaskSys = window.TaskSystem || (window.parent && window.parent.TaskSystem);

        if (activeTaskSys) {
            allTasks = activeTaskSys.getAllTasks();
        }

        // Loop tasks and calculate bounds
        Object.values(allTasks).forEach(task => {
            // Check if any of the target personnel are assigned to this task before processing
            const hasRelevantAssignment = Object.keys(task.assignments || {}).some(assignedId =>
                targetPersonnel.some(p => p.id === assignedId)
            );

            if (!hasRelevantAssignment && task.schoolId !== mySchoolId) return; // isolated to school if no direct assignment

            const baseTaskScore = parseInt(task.baseScore, 10) || 100;
            const deadlineTime = task.deadline ? new Date(task.deadline).getTime() : new Date().getTime() + 86400000;

            Object.entries(task.assignments || {}).forEach(([teacherId, assignment]) => {
                const person = targetPersonnel.find(p => p.id === teacherId);
                if (!person) return;

                if (assignment.status === 'submitted' || assignment.status === 'approved') {
                    // It's finished. Let's grade it based on Gamification Rules.
                    const submitTime = assignment.submittedAt ? new Date(assignment.submittedAt).getTime() : new Date().getTime();
                    const diffHours = (deadlineTime - submitTime) / (1000 * 60 * 60);

                    if (diffHours >= 24) {
                        // Early Bird (+20%)
                        person.score += (baseTaskScore * 1.2);
                        person.completedEarly++;
                    } else if (diffHours >= 0) {
                        // On-Time (100%)
                        person.score += baseTaskScore;
                        person.completedOnTime++;
                    } else {
                        // Late (-10% per 24h overdue)
                        const lateDays = Math.ceil(Math.abs(diffHours) / 24);
                        if (lateDays > 7) {
                            // Critical Penalty
                            person.score += 0;
                        } else {
                            const penaltyAmount = (lateDays * 0.10);
                            const finalMultiplier = Math.max(0, 1.0 - penaltyAmount);
                            person.score += (baseTaskScore * finalMultiplier);
                        }
                        person.completedLate++;
                    }
                } else {
                    // Active Task. Save to render dynamic countdown.
                    person.activeTasks.push({
                        title: task.title,
                        deadline: task.deadline || new Date(deadlineTime).toISOString(),
                        baseScore: baseTaskScore,
                        status: assignment.status || 'PENDING'
                    });
                }
            });
        });

        // Pull delegated tasks (Mission: Directive / ภารกิจพิเศษ) from localStorage
        try {
            const storage = window.localStorage || (window.parent && window.parent.localStorage);
            const rawDel = storage.getItem('eos_delegations_v1');
            if (rawDel) {
                const delegatedTasks = JSON.parse(rawDel);
                delegatedTasks.forEach(del => {
                    // Filter for assignments to our target personnel
                    const person = targetPersonnel.find(p => p.id === del.assignee);
                    if (!person) return;

                    const baseTaskScore = parseInt(del.baseScore, 10) || 100;
                    const deadlineTime = del.deadline ? new Date(del.deadline).getTime() : new Date().getTime() + 86400000;

                    if (del.status === 'COMPLETED') {
                        const submitTime = del.completedAt ? new Date(del.completedAt).getTime() : new Date().getTime();
                        const diffHours = (deadlineTime - submitTime) / (1000 * 60 * 60);

                        if (diffHours >= 24) {
                            person.score += (baseTaskScore * 1.2);
                            person.completedEarly++;
                        } else if (diffHours >= 0) {
                            person.score += baseTaskScore;
                            person.completedOnTime++;
                        } else {
                            const lateDays = Math.ceil(Math.abs(diffHours) / 24);
                            if (lateDays > 7) {
                                person.score += 0;
                            } else {
                                const penaltyAmount = (lateDays * 0.10);
                                const finalMultiplier = Math.max(0, 1.0 - penaltyAmount);
                                person.score += (baseTaskScore * finalMultiplier);
                            }
                            person.completedLate++;
                        }
                    } else if (del.status !== 'CANCELLED') {
                        // Active/Pending Task
                        person.activeTasks.push({
                            title: del.moduleTitle || 'ภารกิจพิเศษ (มอบหมาย)',
                            deadline: del.deadline || new Date(deadlineTime).toISOString(),
                            baseScore: baseTaskScore,
                            status: del.status // Pass status for SLA triage logic
                        });
                    }
                });
            }
        } catch (err) {
            console.warn('[TransparencyLedger] Failed to process delegated tasks:', err);
        }

        // 4. Ranking Sort Engine (Highest Score floats to top)
        targetPersonnel.sort((a, b) => b.score - a.score);

        // 5. Render to UI
        container.innerHTML = '';
        if (targetPersonnel.length === 0) {
            container.innerHTML = `<div class="p-8 text-center text-[var(--vs-text-muted)]">ไม่พบบุคลากรในสายการบังคับบัญชานี้</div>`;
            return;
        }

        targetPersonnel.forEach((p, index) => {
            const card = this.createPersonCard(p, index + 1);
            container.appendChild(card);
        });

        // Run countdown parse immediately
        this.updateAllCountdowns();
    },

    createPersonCard(person, rank) {
        const div = document.createElement('div');
        div.className = "vs-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors group";

        // Format rank display
        let rankEl = `<div class="text-[13px] text-[var(--vs-text-muted)] min-w-[24px] text-center">#${rank}</div>`;
        if (rank === 1) rankEl = `<div class="text-[13px] text-[var(--vs-warning)] min-w-[24px] flex justify-center"><i class="icon i-star h-4 w-4"></i></div>`;
        if (rank === 2) rankEl = `<div class="text-[13px] text-[var(--vs-text-muted)] min-w-[24px] flex justify-center"><i class="icon i-star h-4 w-4"></i></div>`;
        if (rank === 3) rankEl = `<div class="text-[13px] text-[var(--vs-warning)] opacity-60 min-w-[24px] flex justify-center"><i class="icon i-star h-4 w-4"></i></div>`;

        // Active task badges mapped for dynamic countdowns
        let activeTaskHTML = '';
        if (person.activeTasks.length > 0) {
            // Show up to 2 active tasks
            const displayTasks = person.activeTasks.slice(0, 2);
            activeTaskHTML = displayTasks.map(t => {
                return `
                <div class="flex items-center gap-1.5 mt-2">
                    <span class="w-[3px] h-[3px] rounded-full bg-[var(--vs-success)]"></span>
                    <span class="text-[13px] text-[var(--vs-text-title)] truncate max-w-[150px]">${t.title}</span>
                    <span class="text-[13px] text-[var(--vs-text-muted)] ml-1">${t.baseScore} PT</span>
                    <span class="dynamic-countdown text-[13px] px-2 py-0.5 rounded-[3px] bg-[var(--vs-bg-deep)] border border-[rgba(63,63,70,0.5)] ml-auto" data-deadline="${t.deadline}" data-status="${t.status}">...</span>
                </div>`;
            }).join('');

            if (person.activeTasks.length > 2) {
                activeTaskHTML += `<div class="text-[13px] text-[var(--vs-text-muted)] mt-2">และอีก ${person.activeTasks.length - 2} ภารกิจ</div>`;
            }
        } else {
            activeTaskHTML = `<div class="text-[13px] text-[var(--vs-text-muted)] mt-2">ไม่มีภารกิจค้าง</div>`;
        }

        const avatarImage = person.img ? `<img src="${person.img}" class="w-full h-full object-cover" alt="Avatar" onerror="this.outerHTML='<i class=\\'icon i-user w-5 h-5 opacity-30\\'></i>'">` : `<i class="icon i-user w-5 h-5 opacity-30"></i>`;

        div.innerHTML = `
            <!-- Profile Section -->
            <div class="flex items-center gap-4 flex-1">
                ${rankEl}
                <div class="w-10 h-10 flex-shrink-0 rounded-[3px] border border-[rgba(63,63,70,0.5)] bg-[var(--vs-bg-deep)] flex items-center justify-center overflow-hidden">
                    ${avatarImage}
                </div>
                <div>
                    <div class="text-[13px] text-[var(--vs-text-title)] mb-1">${person.name}</div>
                    <div class="text-[13px] text-[var(--vs-text-muted)]">${person.roleLabel}</div>
                </div>
            </div>

            <!-- Stats Divider -->
            <div class="hidden md:block w-px h-[48px] bg-[var(--vs-border)] mx-2"></div>

            <!-- Active Mission Triage Section -->
            <div class="flex-1 min-w-[260px]">
                <div class="text-[13px] text-[var(--vs-text-muted)] mb-2">ภารกิจปัจจุบัน (Current Missions)</div>
                <div class="flex flex-col">
                    ${activeTaskHTML}
                </div>
            </div>

            <!-- Stats Divider -->
            <div class="hidden md:block w-px h-[48px] bg-[var(--vs-border)] mx-2"></div>

            <!-- Score & Punctuality Board -->
            <div class="flex-1 flex items-center justify-end gap-6 text-right">
                <div class="flex gap-4 text-[13px] text-[var(--vs-text-muted)]">
                    <div class="flex flex-col items-center" title="Early Bird">
                        <i class="icon i-check-circle h-4 w-4 text-[var(--vs-success)] mb-1"></i>
                        <span>${person.completedEarly}</span>
                    </div>
                    <div class="flex flex-col items-center" title="On Time">
                        <i class="icon i-clock h-4 w-4 text-[var(--vs-text-title)] mb-1"></i>
                        <span>${person.completedOnTime}</span>
                    </div>
                    <div class="flex flex-col items-center" title="Late">
                        <i class="icon i-x h-4 w-4 text-[var(--vs-danger)] mb-1"></i>
                        <span>${person.completedLate}</span>
                    </div>
                </div>
                
                <div class="flex flex-col items-end min-w-[80px]">
                    <div class="text-[13px] text-[var(--vs-text-muted)] mb-1">คะแนนรวม</div>
                    <div class="text-[18px] text-[var(--vs-accent)] whitespace-nowrap">${Math.round(person.score).toLocaleString()}</div>
                </div>
            </div>
        `;
        return div;
    },

    // 6. Dynamic Triage Math Engine
    updateAllCountdowns() {
        const els = document.querySelectorAll('.dynamic-countdown');
        const now = new Date().getTime();

        els.forEach(el => {
            const dateStr = el.getAttribute('data-deadline');
            if (!dateStr) return;

            // Fix iOS/Safari date parsing by ensuring consistent format
            // e.g., '2026-02-25' usually works but just in case
            const dl = new Date(dateStr).getTime();
            if (isNaN(dl)) {
                el.innerText = "N/A";
                return;
            }

            const status = el.getAttribute('data-status');

            // Reset classes
            el.className = 'dynamic-countdown text-[11px] font-mono px-2 py-0.5 rounded-[3px] ';

            if (status === 'PENDING') {
                el.classList.add('bg-amber-500/10', 'text-amber-500', 'border', 'border-amber-500/30');
                el.innerText = 'รอการกดรับงาน';
                el.title = `ครบกำหนด: ${new Date(dl).toLocaleDateString('th-TH')}`;
                return;
            }

            const diffMs = dl - now;
            const absoluteMs = Math.abs(diffMs);

            const days = Math.floor(absoluteMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((absoluteMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((absoluteMs % (1000 * 60 * 60)) / (1000 * 60));

            if (diffMs < 0) {
                // OVERDUE
                el.classList.add('bg-red-500/20', 'text-red-400', 'border', 'border-red-400/50', 'animate-pulse');
                el.innerText = `💀 ล่าช้า ${days} วัน ${hours} ชม.`;
            } else {
                // ACTIVE
                if (days > 30) {
                    const months = Math.floor(days / 30);
                    const remainingDays = days % 30;
                    el.classList.add('bg-[var(--vs-bg-deep)]', 'text-[var(--vs-text-title)]', 'border', 'border-[rgba(63,63,70,0.5)]');
                    el.innerText = `⏳ ${months} ด. ${remainingDays} ว.`;
                } else if (days > 15) {
                    el.classList.add('bg-emerald-500/10', 'text-emerald-400');
                    el.innerText = `${days} วัน`;
                } else if (days > 2) {
                    el.classList.add('bg-yellow-500/20', 'text-yellow-400');
                    el.innerText = `🟡 ${days} วัน`;
                } else if (days > 0 || hours > 12) {
                    // Less than 48 hours but more than 12
                    el.classList.add('bg-amber-500/20', 'text-amber-400');
                    el.innerText = `🟠 ${days > 0 ? days + ' ว. ' : ''}${hours} ชม.`;
                } else {
                    // Mission Critical (< 12 Hours)
                    el.classList.add('bg-red-500/20', 'text-red-400', 'border', 'border-red-500/30', 'shadow-[0_0_10px_rgba(239,68,68,0.3)]');
                    el.innerText = `🔴 ${hours}:${minutes.toString().padStart(2, '0')} ชม.`;
                }
            }
        });
    }
};

// Expose globally
window.TransparencyLedger = TransparencyLedger;
