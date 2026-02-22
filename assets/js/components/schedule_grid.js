/**
 * Teacher Schedule Grid Component (IDLPMS Unity Standard)
 * Weekly schedule with Manual/Principal-Assigned modes
 * Supports Drag & Drop for subject reordering
 * Integrated with Subject Card Bank
 */

const DEFAULT_SCHEDULES = {
    'sb-anti-3': { id: 'sb-anti-3', nameTH: 'การป้องกันการทุจริต', nameEN: 'Anti-Corruption', code: 'ส 13201', grade: '3', room: '1', type: 'SOC' },
    'sb-anti-1': { id: 'sb-anti-1', nameTH: 'การป้องกันการทุจริต', nameEN: 'Anti-Corruption', code: 'ส 11201', grade: '1', room: '1/1, 1/2', type: 'SOC' },
    'sb-pe-1-1': { id: 'sb-pe-1-1', nameTH: 'สุขศึกษาและพลศึกษา', nameEN: 'Health and PE', code: 'พ 11101', grade: '1', room: '1', type: 'PE' },
    'sb-guidance-2-1': { id: 'sb-guidance-2-1', nameTH: 'แนะแนว', nameEN: 'Guidance', code: '-', grade: '2', room: '1', type: 'GUIDE' },
    'sb-pe-3': { id: 'sb-pe-3', nameTH: 'สุขศึกษาและพลศึกษา', nameEN: 'Health and PE', code: 'พ 13101', grade: '3', room: '1', type: 'PE' },
    'sb-pe-2-2': { id: 'sb-pe-2-2', nameTH: 'สุขศึกษาและพลศึกษา', nameEN: 'Health and PE', code: 'พ 12101', grade: '2', room: '2', type: 'PE' },
    'sb-guidance-1-1': { id: 'sb-guidance-1-1', nameTH: 'แนะแนว', nameEN: 'Guidance', code: '-', grade: '1', room: '1', type: 'GUIDE' },
    'sb-hist-1-2': { id: 'sb-hist-1-2', nameTH: 'ประวัติศาสตร์', nameEN: 'History', code: 'ส 11102', grade: '1', room: '2', type: 'HIST' },
    'sb-guidance-1-2': { id: 'sb-guidance-1-2', nameTH: 'แนะแนว', nameEN: 'Guidance', code: '-', grade: '1', room: '2', type: 'GUIDE' },
    'sb-guidance-2-2': { id: 'sb-guidance-2-2', nameTH: 'แนะแนว', nameEN: 'Guidance', code: '-', grade: '2', room: '2', type: 'GUIDE' },
    'sb-hist-3': { id: 'sb-hist-3', nameTH: 'ประวัติศาสตร์', nameEN: 'History', code: 'ส 13102', grade: '3', room: '1', type: 'HIST' },
    'sb-anti-2-2': { id: 'sb-anti-2-2', nameTH: 'การป้องกันการทุจริต', nameEN: 'Anti-Corruption', code: 'ส 12202', grade: '2', room: '2', type: 'SOC' },
    'sb-hist-2-1': { id: 'sb-hist-2-1', nameTH: 'ประวัติศาสตร์', nameEN: 'History', code: 'ส 12102', grade: '2', room: '1', type: 'HIST' },
    'sb-anti-2-1': { id: 'sb-anti-2-1', nameTH: 'การป้องกันการทุจริต', nameEN: 'Anti-Corruption', code: 'ส 12202', grade: '2', room: '1', type: 'SOC' },
    'sb-plc': { id: 'sb-plc', nameTH: 'PLC', nameEN: 'PLC', code: '-', grade: '-', room: '-', type: 'PLC' },
    'sb-club': { id: 'sb-club', nameTH: 'ชุมนุม', nameEN: 'Club Activity', code: '-', grade: '-', room: '-', type: 'CLUB' },
    'sb-scout': { id: 'sb-scout', nameTH: 'ลูกเสือ', nameEN: 'Scout', code: '-', grade: '-', room: '-', type: 'SCOUT' },
    'sb-prayer': { id: 'sb-prayer', nameTH: 'สวดมนต์สุดสัปดาห์', nameEN: 'Weekly Prayer', code: '-', grade: '-', room: '-', type: 'PRAY' },
};

const DEFAULT_GRID = {
    'MON': { 3: 'sb-anti-3', 4: 'sb-anti-1', 5: 'sb-pe-1-1' },
    'TUE': { 4: 'sb-guidance-2-1', 6: 'sb-pe-3', 7: 'sb-plc' },
    'WED': { 2: 'sb-pe-2-2', 4: 'sb-guidance-1-1', 5: 'sb-hist-1-2', 6: 'sb-club', 7: 'sb-plc' },
    'THU': { 4: 'sb-guidance-1-2', 5: 'sb-guidance-2-2', 6: 'sb-scout' },
    'FRI': { 2: 'sb-hist-3', 3: 'sb-anti-2-2', 4: 'sb-hist-2-1', 5: 'sb-anti-2-1', 6: 'sb-prayer' }
};

class TeacherScheduleGrid {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);

        // Get active user ID for specific storage
        const activeUserId = localStorage.getItem('idlpms_active_user_id') || 'default_user';

        this.options = {
            mode: 'manual', // 'manual' | 'principal'
            editable: true,
            storageKey: `idlpms_schedule_${activeUserId}`,
            bankKey: `idlpms_bank_${activeUserId}`,
            ...options
        };

        // Time slots configuration
        this.timeSlots = [
            { id: 0, start: '08:00', end: '08:30', label: 'กิจกรรมหน้าเสาธง / Homeroom', isActivity: true },
            { id: 1, start: '08:30', end: '09:30', label: 'Period 1' },
            { id: 2, start: '09:30', end: '10:30', label: 'Period 2' },
            { id: 3, start: '10:30', end: '11:30', label: 'Period 3' },
            { id: 4, start: '11:30', end: '12:30', label: 'Lunch', isLunch: true },
            { id: 5, start: '12:30', end: '13:30', label: 'Period 4' },
            { id: 6, start: '13:30', end: '14:30', label: 'Period 5' },
            { id: 7, start: '14:30', end: '15:30', label: 'Period 6' },
            { id: 8, start: '15:30', end: '16:30', label: 'Period 7' },
        ];

        // Days configuration
        this.days = [
            { id: 'MON', name: 'Monday', nameTH: 'จันทร์', color: 'var(--day-mon)' },
            { id: 'TUE', name: 'Tuesday', nameTH: 'อังคาร', color: 'var(--day-tue)' },
            { id: 'WED', name: 'Wednesday', nameTH: 'พุธ', color: 'var(--day-wed)' },
            { id: 'THU', name: 'Thursday', nameTH: 'พฤหัสบดี', color: 'var(--day-thu)' },
            { id: 'FRI', name: 'Friday', nameTH: 'ศุกร์', color: 'var(--day-fri)' },
        ];

        // Subject meta (Rule 22: RGB Tokens mapped)
        this.subjectMeta = {
            MATH: { color: 'var(--sj-math)', rgb: 'var(--sj-math-rgb)', abbr: 'MA' },
            SCI: { color: 'var(--sj-sci)', rgb: 'var(--sj-sci-rgb)', abbr: 'SC' },
            THAI: { color: 'var(--sj-thai)', rgb: 'var(--sj-thai-rgb)', abbr: 'TH' },
            ENG: { color: 'var(--sj-eng)', rgb: 'var(--sj-eng-rgb)', abbr: 'EN' },
            SOC: { color: 'var(--sj-soc)', rgb: 'var(--sj-soc-rgb)', abbr: 'SO' },
            ART: { color: 'var(--sj-art)', rgb: 'var(--sj-art-rgb)', abbr: 'AR' },
            PE: { color: 'var(--sj-pe)', rgb: 'var(--sj-pe-rgb)', abbr: 'PE' },
            WORK: { color: 'var(--sj-work)', rgb: 'var(--sj-work-rgb)', abbr: 'WK' },
            HIST: { color: 'var(--sj-hist)', rgb: 'var(--sj-hist-rgb)', abbr: 'HI' },
            GUIDE: { color: 'var(--sj-guide)', rgb: 'var(--sj-guide-rgb)', abbr: 'GD' },
            PLC: { color: 'var(--sj-plc)', rgb: 'var(--sj-plc-rgb)', abbr: 'PL' },
            CLUB: { color: 'var(--sj-club)', rgb: 'var(--sj-club-rgb)', abbr: 'CL' },
            SCOUT: { color: 'var(--sj-scout)', rgb: 'var(--sj-scout-rgb)', abbr: 'SC' },
            PRAY: { color: 'var(--sj-pray)', rgb: 'var(--sj-pray-rgb)', abbr: 'PR' }
        };

        // Data
        this.subjectBank = [];
        this.schedule = {};

        // Drag state
        this.dragData = null;

        this.loadFromStorage();
        this.modal = null;
        this.init();
    }

    init() {
        if (!this.container) return;
        this.render();
        this.bindDragEvents();

        // Listen for bank updates
        window.addEventListener('storage', (e) => {
            if (e.key === this.options.bankKey || !e.key) {
                this.loadFromStorage();
                this.render();
            }
        });
    }

    loadFromStorage() {
        try {
            // Load Schedule
            const savedSchedule = localStorage.getItem(this.options.storageKey);
            if (savedSchedule && savedSchedule !== 'null') {
                const data = JSON.parse(savedSchedule);
                if (data) {
                    this.schedule = data.schedule || {};
                    this.options.mode = data.mode || 'manual';
                    // Principal-assigned schedules are read-only for teachers
                    if (this.options.mode === 'principal') {
                        this.options.editable = false;
                    }
                }
            } else {
                // Fallback to default grid if empty
                this.schedule = JSON.parse(JSON.stringify(DEFAULT_GRID));
            }

            // Load Bank
            const savedBank = localStorage.getItem(this.options.bankKey);
            if (savedBank && savedBank !== "null") {
                try {
                    const parsed = JSON.parse(savedBank);
                    this.subjectBank = Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    console.error("[SCHEDULE] Bank Parse Error:", e);
                    this.subjectBank = [];
                }
            } else {
                // Fallback to default subject bank if empty
                this.subjectBank = Object.values(DEFAULT_SCHEDULES);
            }
        } catch (e) {
            console.error('[TeacherScheduleGrid] Load error', e);
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify({
                mode: this.options.mode,
                schedule: this.schedule
            }));
        } catch (e) {
            console.error('[TeacherScheduleGrid] Save error', e);
        }
    }

    render() {
        const html = `
            <div class="schedule-container">
                <!-- Mode Toggle (Optional in standalone page, but keeping for compatibility) -->
                ${this.options.showToggle ? `
                <div class="schedule-mode-toggle">
                    <button class="schedule-mode-btn ${this.options.mode === 'manual' ? 'active' : ''}" 
                            onclick="window.scheduleGrid.setMode('manual')">
                        <i class="icon i-pencil w-4 h-4"></i>
                        Manual
                    </button>
                    <button class="schedule-mode-btn ${this.options.mode === 'principal' ? 'active' : ''}" 
                            onclick="window.scheduleGrid.setMode('principal')" disabled>
                        <i class="icon i-building w-4 h-4"></i>
                        Principal-Assigned
                        <span class="text-[13px] opacity-50 ml-1">(Soon)</span>
                    </button>
                </div>` : ''}
                
                <!-- Subject Bank Palette (hidden in principal mode) -->
            ${this.options.editable ? `
            <div class="schedule-palette">
                <div class="schedule-palette-items">
                    ${this.renderPaletteItems()}
                </div>
            </div>` : `
            <div class="schedule-palette" style="padding: 8px 12px; opacity: 0.5;">
                <span class="text-[13px] font-light uppercase text-[var(--vs-text-muted)]"><i class="icon i-lock w-3 h-3 inline-block mr-1"></i>Principal-Assigned Schedule (Read-Only)</span>
            </div>`}
                
                <!-- Schedule Grid -->
                <div class="schedule-grid">
                    ${this.renderGridHeaders()}
                    ${this.renderGridBody()}
                </div>
            </div>
        `;

        this.container.innerHTML = html;
        window.scheduleGrid = this;
        this.bindDragEvents();
        this.bindScrollEvents();
    }

    /**
     * Shared Subject Card Factory to ensure "Unity" between Bank and Grid
     */
    createCardHTML(card, options = {}) {
        const { isPalette = false, day = null, slot = null, isEditable = false } = options;
        const meta = this.subjectMeta[card.type] || { color: 'var(--vs-accent)', rgb: 'var(--vs-accent-rgb)' };

        // Base classes — vs-neon provides the glow effect
        const baseClass = `vs-neon ${isPalette ? 'schedule-palette-item' : 'schedule-event-card schedule-draggable'}`;
        const draggable = (isPalette || isEditable) ? 'draggable="true"' : '';

        // Drag attributes
        const dragAttrs = isPalette
            ? `data-card-id="${card.id}"`
            : `data-card-id="${card.id}" data-source-day="${day.id}" data-source-slot="${slot.id}"`;

        return `
            <div class="${baseClass}" 
                 ${draggable} 
                 ${dragAttrs} 
                 style="--vs-neon-rgb: ${meta.rgb}; border-color: rgba(${meta.rgb}, 0.3); display: block; text-transform: none;">
                <div class="flex justify-between items-start mb-0 pointer-events-none">
                     <span class="schedule-card-title Thai-Rule" style="color: rgb(${meta.rgb})">${card.nameTH}</span>
                     ${!isPalette && isEditable ? `
                     <button onclick="window.scheduleGrid.clearCell('${day.id}', ${slot.id})" class="text-[var(--vs-text-muted)] hover:text-[var(--vs-danger)] transition-colors p-0.5 pointer-events-auto">
                        <i class="icon i-x w-3 h-3"></i>
                     </button>` : ''}
                </div>
                <div class="schedule-card-subtitle pointer-events-none" style="color: rgb(${meta.rgb}); opacity: 0.7">${card.nameEN}</div>
                <div class="flex justify-between items-center gap-2 pointer-events-none mt-0">
                    <span style="color: rgb(${meta.rgb})" class="font-bold text-[13px]">${card.grade}/${card.room}</span>
                    <span class="schedule-card-code text-[13px] opacity-80">${card.code}</span>
                </div>
            </div>
        `;
    }

    renderPaletteItems() {
        if (this.subjectBank.length === 0) {
            return `<div class="text-[13px] text-[var(--vs-text-muted)] italic opacity-50">ไม่พบการ์ดวิชาในคลัง กรุณาสร้างที่เมนู "สร้างการ์ดวิชา"</div>`;
        }

        return this.subjectBank.map(card => {
            return this.createCardHTML(card, { isPalette: true });
        }).join('');
    }

    renderGridHeaders() {
        let html = '<div class="schedule-header-cell schedule-corner">DAY / TIME</div>';
        this.timeSlots.forEach(slot => {
            html += `
                <div class="schedule-header-cell ${slot.isLunch ? 'schedule-lunch-header' : ''}">
                    <div class="schedule-time">${slot.start} - ${slot.end}</div>
                    <div class="schedule-period uppercase">${slot.label}</div>
                </div>
            `;
        });
        return html;
    }

    renderGridBody() {
        let html = '';
        this.days.forEach((day, dayIndex) => {
            html += `
                <div class="schedule-day-cell" style="--day-accent: ${day.color}">
                    <span class="schedule-day-name">${day.nameTH}</span>
                    <span class="schedule-day-abbr">${day.id}</span>
                </div>
            `;
            this.timeSlots.forEach((slot, slotIndex) => {
                const colIndex = slotIndex + 2;
                if (slot.isLunch) {
                    // Only render the Lunch label for the first day (Monday) and use grid-row span
                    if (dayIndex === 0) {
                        html += `<div class="schedule-cell schedule-lunch-cell" style="grid-row: span 5; grid-column: ${colIndex}; writing-mode: vertical-lr; transform: rotate(180deg); display: flex; align-items: center; justify-content: center; background: rgba(var(--vs-accent-rgb), 0.08); color: var(--vs-accent); font-weight: 300; font-size: 13px; border: 1px solid rgba(63, 63, 70, 0.5);">LUNCH พักรับประทานอาหาร</div>`;
                    }
                } else {
                    const cardId = this.schedule[day.id]?.[slot.id];
                    html += this.renderCell(day, slot, cardId, colIndex);
                }
            });
        });
        return html;
    }

    renderCell(day, slot, cardId, colIndex) {
        const card = cardId ? this.subjectBank.find(c => c.id === cardId) : null;
        const isEditable = this.options.mode === 'manual' && this.options.editable;
        const dropZone = isEditable ? `data-day="${day.id}" data-slot="${slot.id}"` : '';

        if (!card) {
            return `
                <div class="schedule-cell schedule-cell-empty schedule-drop-zone" 
                     style="--day-accent: ${day.color}; grid-column: ${colIndex};"
                     ${dropZone}>
                    ${isEditable ? '<i class="icon i-plus w-4 h-4 opacity-10"></i>' : ''}
                </div>
            `;
        }

        return `
            <div class="schedule-cell schedule-cell-filled schedule-drop-zone" 
                 style="--day-accent: ${day.color}; grid-column: ${colIndex};"
                 ${dropZone}>
                ${this.createCardHTML(card, { isPalette: false, day, slot, isEditable })}
            </div>
        `;
    }

    // ========================================
    // Drag & Drop
    // ========================================

    bindDragEvents() {
        if (!this.options.editable) return;

        this.container.querySelectorAll('.schedule-palette-item').forEach(item => {
            item.addEventListener('dragstart', (e) => this.handleDragStart(e, 'palette'));
            item.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });

        this.container.querySelectorAll('.schedule-draggable').forEach(item => {
            item.addEventListener('dragstart', (e) => this.handleDragStart(e, 'cell'));
            item.addEventListener('dragend', (e) => this.handleDragEnd(e));
        });

        this.container.querySelectorAll('.schedule-drop-zone').forEach(zone => {
            zone.addEventListener('dragover', (e) => this.handleDragOver(e));
            zone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            zone.addEventListener('drop', (e) => this.handleDrop(e));
        });
    }

    bindScrollEvents() {
        const paletteContainer = this.container.querySelector('.schedule-palette-items');
        if (!paletteContainer) return;

        paletteContainer.addEventListener('wheel', (e) => {
            // Prevent standard vertical scroll
            e.preventDefault();

            // Translate vertical wheel delta to horizontal scroll position
            // deltaY positive = wheel down = scroll right
            paletteContainer.scrollLeft += e.deltaY;
        }, { passive: false });
    }

    handleDragStart(e, source) {
        const el = e.currentTarget;
        const cardId = el.dataset.cardId;

        this.dragData = {
            cardId,
            source,
            sourceDay: el.dataset.sourceDay || null,
            sourceSlot: el.dataset.sourceSlot ? parseInt(el.dataset.sourceSlot) : null
        };

        el.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', cardId);

        this.container.querySelectorAll('.schedule-drop-zone').forEach(z => {
            z.classList.add('drop-target-available');
        });
    }

    handleDragEnd(e) {
        e.currentTarget.classList.remove('dragging');
        this.dragData = null;
        this.container.querySelectorAll('.schedule-drop-zone').forEach(z => {
            z.classList.remove('drop-target-available', 'drop-target-hover');
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drop-target-hover');
    }

    handleDragLeave(e) {
        e.currentTarget.classList.remove('drop-target-hover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drop-target-hover');

        // Block drops in read-only (principal) mode
        if (!this.options.editable) return;

        if (!this.dragData) return;

        const targetDay = e.currentTarget.dataset.day;
        const targetSlot = parseInt(e.currentTarget.dataset.slot);
        if (!targetDay || !targetSlot) return;

        const { cardId, source, sourceDay, sourceSlot } = this.dragData;

        // Swap or Move
        if (source === 'cell' && sourceDay && sourceSlot) {
            const existingInTarget = this.schedule[targetDay]?.[targetSlot];
            if (existingInTarget) {
                this.schedule[sourceDay][sourceSlot] = existingInTarget;
            } else {
                delete this.schedule[sourceDay][sourceSlot];
            }
        }

        if (!this.schedule[targetDay]) this.schedule[targetDay] = {};
        this.schedule[targetDay][targetSlot] = cardId;

        this.saveToStorage();
        this.render();
    }

    clearCell(dayId, slotId) {
        // Block deletion in read-only (principal) mode
        if (!this.options.editable) return;

        if (this.schedule[dayId]) {
            delete this.schedule[dayId][slotId];
            this.saveToStorage();
            this.render();
        }
    }

    setMode(mode) {
        this.options.mode = mode;
        this.saveToStorage();
        this.render();
    }
}

if (typeof window !== 'undefined') {
    window.TeacherScheduleGrid = TeacherScheduleGrid;
}
