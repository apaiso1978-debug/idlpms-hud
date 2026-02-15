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
        { id: 1, year: 2568, masterCategory: 'position', title: 'Current Position Active', org: 'IDLPMS', verifyStatus: 'VERIFIED', verifiedBy: 'System' },
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
    populateBasicTab(user);
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

// ── Basic Tab ──────────────────────────────────────────────────────
function populateBasicTab(user) {
    const fields = {
        'in-name': user.fullName || '',
        'in-citizen': user.citizenId || '1-XXXX-XXXXX-XX-X',
        'in-email': user.email || `${(user.id || 'user').toLowerCase()}@idlpms.moe.go.th`,
        'in-phone': user.phone || '',
        'in-address': user.address || '',
    };

    Object.entries(fields).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    });

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
        <div class="p-4 rounded-[var(--vs-radius)] bg-[var(--vs-bg-deep)] border border-[var(--vs-border)]">
            <div class="text-sm text-[var(--vs-text-muted)] uppercase mb-2">${m.label}</div>
            <div class="text-2xl font-extralight text-[var(--vs-text-title)]">${m.value}</div>
        </div>
    `).join('');
}

// ── Workflow Tab ───────────────────────────────────────────────────
function populateWorkflowTab(user) {
    const timeline = document.getElementById('workflow-timeline');
    if (!timeline) return;

    const entries = PASSPORT_WORKFLOWS[user.role] || PASSPORT_WORKFLOWS.DEFAULT;
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
            <div class="passport-empty">
                <i class="icon i-clipboard-check h-8 w-8"></i>
                <div class="text-sm font-extralight mt-2">No workflow entries yet</div>
            </div>`;
        return;
    }

    container.innerHTML = entries.map(entry => {
        const statusHTML = getVerifyBadge(entry.verifyStatus);
        const catInfo = CATEGORY_MAP[entry.masterCategory] || { iconClass: 'i-document', label: 'Other' };

        return `
        <div class="timeline-entry" data-category="${entry.masterCategory}">
            <div class="timeline-year">${entry.year}</div>
            <div class="flex-shrink-0">
                <i class="icon ${catInfo.iconClass} h-4 w-4" style="color: var(--vs-accent);"></i>
            </div>
            <div class="timeline-content">
                <div class="timeline-title">${entry.title}</div>
                <div class="timeline-meta">${entry.org}${entry.verifiedBy ? ' — ' + entry.verifiedBy : ''}</div>
            </div>
            <div class="timeline-status">${statusHTML}</div>
        </div>`;
    }).join('');
}

function getVerifyBadge(status) {
    switch (status) {
        case 'VERIFIED':
            return `<span class="verify-badge verified"><i class="icon i-check h-3 w-3"></i></span>`;
        case 'PENDING':
            return `<span class="verify-badge pending"><i class="icon i-clock h-3 w-3"></i></span>`;
        case 'REJECTED':
            return `<span class="verify-badge rejected"><i class="icon i-x h-3 w-3"></i></span>`;
        default:
            return '';
    }
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
