/* ========================================================================
   WORK PASSPORT — JavaScript Controller
   Handles: Tab switching, data rendering, filters, toggles
   ======================================================================== */

// ── Mock Workflow Data (per role) ──────────────────────────────────
const PASSPORT_WORKFLOWS = {
    TEACHER: [
        { id: 1, year: 2568, masterCategory: 'position', title: 'Position: Expert Teacher Level 2', org: 'Wat Map Chalud School', verifyStatus: 'VERIFIED', verifiedBy: 'School Director' },
        { id: 2, year: 2568, masterCategory: 'development', title: 'Training: Advanced STEM Workshop (12 hrs)', org: 'OBEC', verifyStatus: 'VERIFIED', verifiedBy: 'School Director' },
        { id: 3, year: 2568, masterCategory: 'achievement', title: 'Research: Local Media for Reading Enhancement', org: 'Wat Map Chalud School', verifyStatus: 'PENDING', verifiedBy: null },
        { id: 4, year: 2567, masterCategory: 'award', title: 'Award: Outstanding Teacher (District)', org: 'Rayong ESA 2', verifyStatus: 'VERIFIED', verifiedBy: 'ESA Director' },
        { id: 5, year: 2567, masterCategory: 'achievement', title: 'Innovation: Thai Language Board Game', org: 'Wat Map Chalud School', verifyStatus: 'VERIFIED', verifiedBy: 'School Director' },
        { id: 6, year: 2567, masterCategory: 'development', title: 'Training: Active Learning PLC (20 hrs)', org: 'Rayong ESA 2', verifyStatus: 'VERIFIED', verifiedBy: 'School Director' },
        { id: 7, year: 2565, masterCategory: 'position', title: 'Position: Teacher Level 1', org: 'Wat Map Chalud School', verifyStatus: 'VERIFIED', verifiedBy: 'School Director' },
        { id: 8, year: 2562, masterCategory: 'position', title: 'Position: Assistant Teacher (First Appointment)', org: 'Wat Map Chalud School', verifyStatus: 'VERIFIED', verifiedBy: 'System' },
        { id: 9, year: 2562, masterCategory: 'transfer', title: 'Appointed to Wat Map Chalud School', org: 'Ministry of Education', verifyStatus: 'VERIFIED', verifiedBy: 'System' },
    ],
    STUDENT: [
        { id: 1, year: 2568, masterCategory: 'achievement', title: 'Grade Report: Semester 1/2568 — GPA 3.72', org: 'Wat Map Chalud School', verifyStatus: 'VERIFIED', verifiedBy: 'Homeroom Teacher' },
        { id: 2, year: 2568, masterCategory: 'development', title: 'Activity: Scout Camp Level 2', org: 'Wat Map Chalud School', verifyStatus: 'VERIFIED', verifiedBy: 'Advisor' },
        { id: 3, year: 2568, masterCategory: 'award', title: 'Award: Science Quiz Competition — Gold Medal', org: 'Rayong ESA 2', verifyStatus: 'VERIFIED', verifiedBy: 'School Director' },
        { id: 4, year: 2567, masterCategory: 'achievement', title: 'Grade Report: Semester 2/2567 — GPA 3.65', org: 'Wat Map Chalud School', verifyStatus: 'VERIFIED', verifiedBy: 'Homeroom Teacher' },
        { id: 5, year: 2567, masterCategory: 'achievement', title: 'Portfolio: Art Project — Watercolor Painting', org: 'Wat Map Chalud School', verifyStatus: 'PENDING', verifiedBy: null },
        { id: 6, year: 2567, masterCategory: 'position', title: 'Enrolled: Grade 5 Room 1', org: 'Wat Map Chalud School', verifyStatus: 'VERIFIED', verifiedBy: 'System' },
    ],
    SCHOOL_DIR: [
        { id: 1, year: 2568, masterCategory: 'achievement', title: 'KPI: School O-NET Average 52.3 (+4.2)', org: 'Wat Map Chalud School', verifyStatus: 'VERIFIED', verifiedBy: 'ESA Director' },
        { id: 2, year: 2568, masterCategory: 'development', title: 'Project: Safe School Lunch Program', org: 'Wat Map Chalud School', verifyStatus: 'VERIFIED', verifiedBy: 'ESA Director' },
        { id: 3, year: 2568, masterCategory: 'award', title: 'Award: Sufficiency Economy School', org: 'OBEC', verifyStatus: 'PENDING', verifiedBy: null },
        { id: 4, year: 2566, masterCategory: 'position', title: 'Position: School Director', org: 'Wat Map Chalud School', verifyStatus: 'VERIFIED', verifiedBy: 'ESA Director' },
        { id: 5, year: 2562, masterCategory: 'position', title: 'Position: Deputy Director', org: 'Ban Nong Kok School', verifyStatus: 'VERIFIED', verifiedBy: 'ESA Director' },
        { id: 6, year: 2558, masterCategory: 'position', title: 'Position: Expert Teacher Level 3', org: 'Wat Bang Muang School', verifyStatus: 'VERIFIED', verifiedBy: 'School Director' },
    ],
    DEFAULT: [
        { id: 1, year: 2568, masterCategory: 'position', title: 'Current Position Active', org: 'E-OS', verifyStatus: 'VERIFIED', verifiedBy: 'System' },
    ]
};

// ── Category Map ──────────────────────────────────────────────────
const CATEGORY_MAP = {
    position: { label: 'Position', iconClass: 'i-office' },
    achievement: { label: 'Achievement', iconClass: 'i-star' },
    development: { label: 'Development', iconClass: 'i-chart' },
    award: { label: 'Award', iconClass: 'i-academic' },
    transfer: { label: 'Transfer', iconClass: 'i-globe' },
};

// ── Init ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const user = getUserData();
    if (!user) return;

    populateProfileHeader(user);
    populatePersonalTab(user);
    populateRoleTab(user); // New tab
    populateHealthTab(user); // New tab
    populateWorkflowTab(user);
    populateSettingsTab(user);
    initPassportTabs();
    initCategoryFilters();
    initSettingsToggles();
    initPrivacySelector();
});

function getUserData() {
    return typeof parent.window.getCurrentUser === 'function'
        ? parent.window.getCurrentUser()
        : typeof getCurrentUser === 'function'
            ? getCurrentUser()
            : null;
}

// ── Tab Switching ──────────────────────────────────────────────────
function initPassportTabs() {
    const tabs = document.querySelectorAll('.passport-tab');
    const panels = document.querySelectorAll('.passport-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => p.classList.add('hidden'));

            tab.classList.add('active');
            const panel = document.getElementById(`panel-${target}`);
            if (panel) panel.classList.remove('hidden');
        });
    });
}

// ── Profile Header ─────────────────────────────────────────────────
function populateProfileHeader(user) {
    const avatar = document.getElementById('prof-avatar');
    const nameEl = document.getElementById('prof-name');
    const idEl = document.getElementById('prof-id');
    const roleBadge = document.getElementById('prof-role-badge');
    const orgBadge = document.getElementById('prof-org-badge');

    if (avatar) {
        avatar.innerText = user.avatar || user.fullName?.substring(0, 2) || 'U';
        avatar.style.backgroundColor = 'rgba(34, 211, 238, 0.15)';
    }
    if (nameEl) nameEl.innerText = user.fullName || 'Unknown User';
    if (idEl) idEl.innerText = `ID: ${user.id || '0000'}`;
    if (roleBadge) roleBadge.innerText = user.name || user.role || 'User';
    if (orgBadge) orgBadge.innerText = user.org || user.schoolId || 'N/A';
}

// ── Personal Tab (Single Identity Sync) ──────────────────────────────────
function populatePersonalTab(user) {
    let fullName = user.fullName || '';
    let citizenId = user.citizenId || '1-XXXX-XXXXX-XX-X';

    // Feature: Pull real identity from Person-First schema
    if (user.personId && typeof EOS_DATA !== 'undefined' && EOS_DATA.persons && EOS_DATA.persons[user.personId]) {
        const person = EOS_DATA.persons[user.personId];
        fullName = `${person.firstName} ${person.lastName}`;
        citizenId = person.citizenId || citizenId;
    }

    const fields = {
        'in-name': fullName,
        'in-citizen': citizenId,
        'in-email': user.email || `${(user.id || 'user').toLowerCase()}@idlpms.moe.go.th`,
        'in-phone': user.phone || '',
        'in-address': user.address || '',
    };

    Object.entries(fields).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    });
}

// ── Role Tab ───────────────────────────────────────────────────────
function populateRoleTab(user) {

    // Role Metrics
    const metricsGrid = document.getElementById('metrics-grid');
    const metricsTitle = document.getElementById('metrics-title');
    if (!metricsGrid) return;

    const roleMetrics = {
        STUDENT: [
            { label: 'Mastery Level', value: '78%' },
            { label: 'Lessons Done', value: '42' },
            { label: 'Current Streak', value: '7 Days' },
            { label: 'Achievements', value: '12' },
        ],
        TEACHER: [
            { label: 'Students', value: '156' },
            { label: 'Lessons Created', value: '24' },
            { label: 'Avg. Score', value: '82%' },
            { label: 'PD Hours', value: '68' },
        ],
        SCHOOL_DIR: [
            { label: 'Teachers', value: '17' },
            { label: 'Students', value: '245' },
            { label: 'O-NET Avg', value: '52.3' },
            { label: 'Projects', value: '4' },
        ],
        DEFAULT: [
            { label: 'Active Sessions', value: '3' },
            { label: 'Reports', value: '12' },
            { label: 'Uptime', value: '99.9%' },
            { label: 'Last Login', value: 'Today' },
        ],
    };

    const metrics = roleMetrics[user.role] || roleMetrics.DEFAULT;
    if (metricsTitle) {
        const titles = { STUDENT: 'Learning Metrics', TEACHER: 'Teaching Metrics', SCHOOL_DIR: 'Administrative Metrics' };
        metricsTitle.innerText = titles[user.role] || 'Performance Metrics';
    }

    metricsGrid.innerHTML = metrics.map(m => `
        <div class="p-4 rounded-[var(--vs-radius)] bg-[var(--vs-bg-deep)] border border-[rgba(63,63,70,0.5)]">
            <div class="text-[13px] text-[var(--vs-text-muted)] uppercase mb-2">${m.label}</div>
            <div class="text-2xl font-light text-[var(--vs-text-title)]">${m.value}</div>
        </div>
    `).join('');
}

function populateHealthTab(user) {
    if (user.role !== 'STUDENT') {
        const healthContainer = document.getElementById('panel-health');
        if (healthContainer) {
            healthContainer.innerHTML = `
                <section class="p-6 rounded-[var(--vs-radius)] bg-[var(--vs-bg-card)] hud-border text-center">
                    <i class="icon i-heart h-8 w-8 text-[var(--vs-text-muted)] mb-4 inline-block"></i>
                    <h3 class="text-lg font-light text-[var(--vs-text-title)]">Health Records</h3>
                    <p class="text-[13px] text-[var(--vs-text-muted)] mt-2">Physical fitness tracking and DNA Dashboards are specifically tailored for student profiles.</p>
                </section>`;
        }
        return;
    }

    if (typeof DNACoreService === 'undefined' || typeof DNASpider === 'undefined') return;

    // 1. Fetch DNA Profile (Optional, as Widget fetches its own but we can pass ID)
    const dna = DNACoreService.getStudentDNA(user.id);

    // 2. Render Component-Based DNA Radar Widget
    const spiderContainer = document.getElementById('student-spider-container');
    if (spiderContainer) {
        // Set the props attribute so the registry knows which student to render
        spiderContainer.setAttribute('data-props', JSON.stringify({ studentId: user.id }));

        // If the ComponentRegistry is already available and the element is mounted,
        // we can forcibly re-init it with the new props.
        if (window.ComponentRegistry) {
            const instanceId = spiderContainer.getAttribute('data-instance-id');
            if (instanceId && window.ComponentRegistry.activeInstances.has(instanceId)) {
                const widget = window.ComponentRegistry.activeInstances.get(instanceId);
                widget.studentId = user.id;
                widget.init();
            } else {
                // Not mounted yet, tell registry to mount it
                window.ComponentRegistry.mount(spiderContainer, 'DNA_RadarWidget', { studentId: user.id });
            }
        }
    }

    // 3. Render Fitness Metrics (P-Axis Source)
    const metricsContainer = document.getElementById('fitness-metrics-container');
    if (metricsContainer) {
        let fitnessData = null;
        if (typeof FitnessService !== 'undefined') {
            const results = FitnessService.getLocalResults();
            fitnessData = results[user.id];
        }

        if (fitnessData && fitnessData.sitReach != null) {
            metricsContainer.innerHTML = `
                <div class="flex items-center justify-between p-3 rounded-[var(--vs-radius)] bg-[rgba(255,255,255,0.02)] border border-[rgba(63,63,70,0.5)]">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded bg-[rgba(var(--sj-pe-rgb),0.1)] text-[var(--sj-pe)] flex items-center justify-center">
                            <i class="icon i-hand-raised h-4 w-4"></i>
                        </div>
                        <div>
                            <div class="text-[12px] text-[var(--vs-text-muted)] uppercase">Sit & Reach (cm)</div>
                            <div class="text-[14px] text-[var(--vs-text-title)]">${fitnessData.sitReach} cm</div>
                        </div>
                    </div>
                </div>
                <div class="flex items-center justify-between p-3 rounded-[var(--vs-radius)] bg-[rgba(255,255,255,0.02)] border border-[rgba(63,63,70,0.5)]">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded bg-[rgba(var(--sj-pe-rgb),0.1)] text-[var(--sj-pe)] flex items-center justify-center">
                            <i class="icon i-bolt h-4 w-4"></i>
                        </div>
                        <div>
                            <div class="text-[12px] text-[var(--vs-text-muted)] uppercase">Push-Ups (30s)</div>
                            <div class="text-[14px] text-[var(--vs-text-title)]">${fitnessData.pushUp} reps</div>
                        </div>
                    </div>
                </div>
                <div class="flex items-center justify-between p-3 rounded-[var(--vs-radius)] bg-[rgba(255,255,255,0.02)] border border-[rgba(63,63,70,0.5)]">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded bg-[rgba(var(--sj-pe-rgb),0.1)] text-[var(--sj-pe)] flex items-center justify-center">
                            <i class="icon i-heart h-4 w-4"></i>
                        </div>
                        <div>
                            <div class="text-[12px] text-[var(--vs-text-muted)] uppercase">Step-Ups (3m)</div>
                            <div class="text-[14px] text-[var(--vs-text-title)]">${fitnessData.stepUp} reps</div>
                        </div>
                    </div>
                </div>
                <div class="mt-4 pt-4 border-t border-[rgba(63,63,70,0.5)] flex items-center justify-between">
                    <div class="text-[13px] text-[var(--vs-text-muted)]">Calculated P-Axis Score:</div>
                    <div class="text-lg text-[var(--dna-p, #60a5fa)] font-bold">${dna.p}</div>
                </div>
            `;
        } else {
            metricsContainer.innerHTML = `
                <div class="text-[13px] text-[var(--vs-text-muted)] p-6 text-center border border-[rgba(63,63,70,0.5)] rounded-[var(--vs-radius)] bg-[rgba(255,255,255,0.02)]">
                    <i class="icon i-document-text h-6 w-6 mx-auto mb-2 opacity-50 text-[var(--sj-pe)]"></i>
                    No physical fitness data recorded for this academic year. 
                    <br><span class="text-[11px] mt-1 inline-block">Estimated Base Score: ${dna.p} Pts</span>
                </div>
                <div class="mt-2 text-right">
                    <a href="fitness_input.html" class="text-[12px] text-[var(--vs-accent)] hover:underline">Record Fitness Data &rarr;</a>
                </div>
            `;
        }
    }
}

// ── Workflow Tab (Lifelong Timeline) ───────────────────────────────────
function populateWorkflowTab(user) {
    const timeline = document.getElementById('workflow-timeline');
    if (!timeline) return;

    let entries = [];

    // Feature: Lifelong Identity (Person-First) - Aggregate workflows across all roles
    if (user.availableRoles && typeof EOS_DATA !== 'undefined' && EOS_DATA.users) {
        user.availableRoles.forEach(roleId => {
            const roleData = EOS_DATA.users[roleId];
            if (roleData) {
                const roleWorkflows = PASSPORT_WORKFLOWS[roleData.role] || [];
                const roleName = EOS_DATA.roles[roleData.role]?.name || roleData.role;
                entries = entries.concat(roleWorkflows.map(wf => ({
                    ...wf,
                    title: `[${roleName}] ${wf.title}`
                })));
            }
        });
    }

    if (entries.length === 0) {
        entries = PASSPORT_WORKFLOWS[user.role] || PASSPORT_WORKFLOWS.DEFAULT;
        // Make a copy so we don't mutate the constant
        entries = [...entries];
    }

    // Feature: Merge dynamic completed tasks from Delegation Panel (Transparency Sync)
    try {
        const storage = window.localStorage || (window.parent && window.parent.localStorage);
        const rawDel = storage.getItem('eos_delegations_v1');
        if (rawDel) {
            const delegations = JSON.parse(rawDel);
            const myCompletedTasks = delegations.filter(d =>
                (d.assignee === user.id || d.assignee === user.role) &&
                d.status === 'COMPLETED'
            );

            myCompletedTasks.forEach((task, idx) => {
                const year = task.completedAt ? new Date(task.completedAt).getFullYear() + 543 : new Date().getFullYear() + 543;

                // Construct score/detail string
                let extraDetails = '';
                if (task.score !== undefined && task.score !== null) {
                    extraDetails += ` [Score: ${task.score}${task.maxScore ? '/' + task.maxScore : ''}]`;
                }

                entries.push({
                    id: `del_${task.id || idx}`,
                    year: year,
                    masterCategory: 'achievement',
                    title: `Mission Accomplished: ${task.moduleTitle}${extraDetails}`,
                    org: 'E-OS Delegation System',
                    verifyStatus: 'VERIFIED',
                    verifiedBy: task.assignedByName || 'System Administrator'
                });
            });
        }
    } catch (err) {
        console.warn('[Work Passport] Failed to merge delegation tasks:', err);
    }

    // Sort entries by year descending to create a coherent lifelong timeline
    entries.sort((a, b) => b.year - a.year);

    renderTimeline(timeline, entries);

    // Update stats
    const totalEl = document.getElementById('wf-total');
    const verifiedEl = document.getElementById('wf-verified');
    const pendingEl = document.getElementById('wf-pending');

    if (totalEl) totalEl.innerText = entries.length;
    if (verifiedEl) verifiedEl.innerText = entries.filter(e => e.verifyStatus === 'VERIFIED').length;
    if (pendingEl) pendingEl.innerText = entries.filter(e => e.verifyStatus === 'PENDING').length;
}

function renderTimeline(container, entries) {
    if (entries.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 text-center text-[var(--vs-text-muted)] border border-[rgba(63,63,70,0.5)] rounded-[var(--vs-radius)] bg-[var(--vs-bg-deep)]">
                <i class="icon i-clipboard-document-check h-8 w-8 mb-3 opacity-50"></i>
                <div class="text-[13px] font-light">ยังไม่มีประวัติการทำงานในระบบ</div>
            </div>`;
        return;
    }

    let html = `<div class="relative pl-6 ml-4 mt-4 pb-8 before:absolute before:inset-y-0 before:-left-px before:w-px before:bg-[rgba(63,63,70,0.5)]">`;

    html += entries.map(entry => {
        const catInfo = CATEGORY_MAP[entry.masterCategory] || { iconClass: 'i-document', label: 'Other' };

        // Strict Neon Aesthetic Badges (Rule 6)
        let statusBadge = '';
        if (entry.verifyStatus === 'VERIFIED') {
            statusBadge = `<div class="flex items-center gap-1.5 px-3 py-1 flex-shrink-0 rounded-[var(--vs-radius)] bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] text-[var(--vs-success)] text-[13px] uppercase"><i class="icon i-check h-3 w-3"></i> Verified</div>`;
        } else if (entry.verifyStatus === 'PENDING') {
            statusBadge = `<div class="flex items-center gap-1.5 px-3 py-1 flex-shrink-0 rounded-[var(--vs-radius)] bg-[rgba(234,179,8,0.1)] border border-[rgba(234,179,8,0.3)] text-[var(--vs-warning)] text-[13px] uppercase"><i class="icon i-clock h-3 w-3"></i> Pending</div>`;
        } else if (entry.verifyStatus === 'REJECTED') {
            statusBadge = `<div class="flex items-center gap-1.5 px-3 py-1 flex-shrink-0 rounded-[var(--vs-radius)] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[var(--vs-danger)] text-[13px] uppercase"><i class="icon i-x h-3 w-3"></i> Rejected</div>`;
        }

        return `
        <div class="relative mb-6 group timeline-entry animate-fade-in" data-category="${entry.masterCategory}">
            <!-- Razor-Sharp Node Dot (No Blur, No Solid Fill) -->
            <div class="absolute -left-[30px] top-[18px] h-[7px] w-[7px] border border-[rgba(34,211,238,0.5)] bg-[rgba(34,211,238,0.1)] transition-all duration-300 group-hover:bg-[rgba(34,211,238,0.25)] group-hover:border-[var(--vs-accent)] group-hover:shadow-[0_0_8px_rgba(34,211,238,0.1)]"></div>
            
            <!-- Horizontal Branch Line -->
            <div class="absolute -left-[23px] top-[21px] w-[15px] h-px bg-[rgba(63,63,70,0.5)] transition-colors duration-300 group-hover:bg-[rgba(34,211,238,0.3)]"></div>
            
            <!-- Razor-Sharp Flat Panel (Rule 4, 5) -->
            <div class="bg-[var(--vs-bg-deep)] border border-[rgba(63,63,70,0.5)] rounded-[var(--vs-radius)] p-4 transition-all duration-300 hover:bg-[var(--vs-bg-panel)] relative">
                
                <div class="flex flex-col md:flex-row justify-between md:items-start gap-4">
                    <div class="flex-1 min-w-0">
                        <!-- Meta Header -->
                        <div class="flex items-center flex-wrap gap-2 mb-2">
                            <i class="icon ${catInfo.iconClass} h-4 w-4 text-[var(--vs-accent)]"></i>
                            <span class="text-[13px] text-[var(--vs-text-title)] font-light px-2 py-0.5 rounded-[var(--vs-radius)] border border-[rgba(63,63,70,0.5)] bg-[var(--vs-bg-card)]">${entry.year}</span>
                            <span class="text-[13px] text-[var(--vs-text-muted)] opacity-50">•</span>
                            <span class="text-[13px] text-[var(--vs-text-muted)] uppercase opacity-80">${catInfo.label}</span>
                        </div>
                        
                        <!-- Title -->
                        <div class="text-[13px] text-[var(--vs-text-title)] font-light mb-2 leading-relaxed">${entry.title}</div>
                        
                        <!-- Details Footer (Icon-Text Rule 16) -->
                        <div class="text-[13px] text-[var(--vs-text-muted)] flex flex-wrap gap-x-4 gap-y-2 items-center">
                            <span class="flex items-center gap-1.5 whitespace-nowrap"><i class="icon i-building-office h-3 w-3 opacity-60"></i> ${entry.org}</span>
                            ${entry.verifiedBy ? `<span class="flex items-center gap-1.5 whitespace-nowrap"><i class="icon i-user-check h-3 w-3 opacity-60"></i> Verified by: ${entry.verifiedBy}</span>` : ''}
                        </div>
                    </div>
                    
                    <div class="flex-shrink-0 mt-2 md:mt-0">
                        ${statusBadge}
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');

    html += `</div>`;
    container.innerHTML = html;
}

// ── Category Filters ──────────────────────────────────────────────
function initCategoryFilters() {
    const filters = document.querySelectorAll('.passport-filter');
    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            filters.forEach(f => f.classList.remove('active'));
            btn.classList.add('active');

            const cat = btn.dataset.cat;
            const entries = document.querySelectorAll('.timeline-entry');

            entries.forEach(entry => {
                if (cat === 'all' || entry.dataset.category === cat) {
                    entry.style.display = '';
                } else {
                    entry.style.display = 'none';
                }
            });
        });
    });
}

// ── Settings Tab ──────────────────────────────────────────────────
function populateSettingsTab(user) {
    // Set active role display
    const roleEl = document.getElementById('settings-active-role');
    if (roleEl) roleEl.innerText = user.name || user.role || 'User';
}

function initSettingsToggles() {
    const toggles = document.querySelectorAll('.settings-toggle');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
        });
    });
}

function initPrivacySelector() {
    const options = document.querySelectorAll('.privacy-option');
    options.forEach(opt => {
        opt.addEventListener('click', () => {
            options.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
        });
    });
}

// ── Save Handler ──────────────────────────────────────────────────
function handleSave() {
    const btn = document.getElementById('save-btn');
    if (!btn) return;
    const originalHTML = btn.innerHTML;

    btn.innerHTML = '<i class="icon i-check h-4 w-4"></i><span>Saved!</span>';
    btn.classList.add('bg-emerald-500');

    setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.classList.remove('bg-emerald-500');
    }, 2000);
}
