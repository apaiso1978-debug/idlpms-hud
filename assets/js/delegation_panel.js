/**
 * DELEGATION PANEL v3.0 — Unity Mission Control
 * ═══════════════════════════════════════════════════════
 * Global Shell-layer sidebar for ALL Director operations.
 * Single entry → Toggle Mode (System Tasks / Ad-hoc Missions)
 * DISPATCHED / INBOX dual views
 * Hierarchical targeting: Director → Teachers
 * Passport auto-write on every delegation
 *
 * Iron Rules: 13px, font-300, 3px corners, Neon style, Sunken inputs
 * ═══════════════════════════════════════════════════════
 */

const DelegationPanel = {

    // ── Storage ──
    STORAGE_KEY: 'idlpms_delegations_v1',
    PASSPORT_PREFIX: 'idlpms_passport_',

    // ── State ──
    _cache: null,
    _mode: 'SYSTEM',        // 'SYSTEM' | 'ADHOC'
    _viewTab: 'DISPATCHED',  // 'DISPATCHED' | 'INBOX'
    _teachers: [],
    _selectedTeacherId: null,
    _isOpen: false,

    // ── Service Helpers ──
    async _getDataService() {
        if (typeof DataServiceFactory !== 'undefined') {
            return await DataServiceFactory.getInstance();
        }
        return null;
    },

    async _getSyncEngine() {
        if (typeof getSyncEngine === 'function') {
            return await getSyncEngine();
        }
        return null;
    },

    // ═══════════════════════════════════════════
    //  DATA LAYER
    // ═══════════════════════════════════════════

    getAllDelegations() {
        if (this._cache) return this._cache;
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            this._cache = raw ? JSON.parse(raw) : [];
            return this._cache;
        } catch (e) {
            console.error('[DelegationPanel] Read error:', e);
            return [];
        }
    },

    _saveDelegations(list) {
        this._cache = list;
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list));
    },

    // ── Get current user ──
    _getCurrentUser() {
        try {
            // Try CURRENT_USER first
            const raw = localStorage.getItem('CURRENT_USER');
            if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed && parsed.role) return parsed;
            }
            // Fallback: reconstruct from individual keys
            const userId = localStorage.getItem('current_user_id');
            const role = localStorage.getItem('current_role');
            if (userId || role) {
                return { id: userId || 'DIR_MABLUD', role: role || 'SCHOOL_DIR' };
            }
            // Final fallback: check URL / page context
            return { id: 'DIR_MABLUD', role: 'SCHOOL_DIR' };
        } catch { return { id: 'DIR_MABLUD', role: 'SCHOOL_DIR' }; }
    },

    // ── Get current module context from HUD ──
    _getModuleContext() {
        // Try active sidebar item first (Mission Control / Explorer)
        const activeSidebarItem = document.querySelector('.timeline-child-item.active, .vs-menu-item.active');
        if (activeSidebarItem) {
            const iconNode = activeSidebarItem.querySelector('.icon');
            const textNode = activeSidebarItem.querySelector('span');

            if (textNode) {
                const title = textNode.textContent.trim();
                const id = title.replace(/\s+/g, '_').toUpperCase();
                // Extract icon class
                let iconClass = 'i-academic'; // default fallback
                let colorClass = '';
                if (iconNode) {
                    // Extract all i-* classes
                    const classes = Array.from(iconNode.classList);
                    const iClass = classes.find(c => c.startsWith('i-'));
                    if (iClass) iconClass = iClass;

                    // Extract color classes if any (e.g., text-rose-400)
                    const cClass = classes.find(c => c.startsWith('text-'));
                    if (cClass) colorClass = cClass;
                }

                return { title, id, icon: iconClass, colorClass };
            }
        }

        // Try breadcrumb first
        const breadcrumb = document.querySelector('.vs-breadcrumb-text, #breadcrumb-title');
        const moduleTitle = breadcrumb ? breadcrumb.textContent.trim() : '';

        // Try iframe title
        const iframe = document.getElementById('main-content');
        let iframeTitle = '';
        try {
            iframeTitle = iframe?.contentDocument?.title || '';
        } catch { /* cross-origin */ }

        return {
            title: moduleTitle || iframeTitle || 'งานทั่วไป',
            id: moduleTitle ? moduleTitle.replace(/\s+/g, '_').toUpperCase() : 'GENERAL',
            icon: 'i-command-line', // fallback icon
            colorClass: 'text-[var(--vs-accent)]'
        };
    },

    // ── Get workload for a teacher ──
    getWorkload(teacherId) {
        const all = this.getAllDelegations();
        return all.filter(d => d.assignee === teacherId && d.status !== 'COMPLETED').length;
    },

    getWorkloadColor(count) {
        if (count >= 5) return { icon: '●', cls: 'danger', label: 'สูง' };
        if (count >= 3) return { icon: '●', cls: 'warning', label: 'ปานกลาง' };
        return { icon: '●', cls: 'success', label: 'ปกติ' };
    },

    // ── Custom Confirm Modal ──
    showConfirm(title, msg, onConfirm, onCancel = null) {
        const overlay = document.createElement('div');
        overlay.className = 'vs-modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'vs-modal warning';

        modal.innerHTML = `
            <div class="vs-modal-header">
                <i class="icon i-exclamation-triangle"></i>
                <h3 class="vs-modal-title">${title}</h3>
            </div>
            <div class="vs-modal-body">${msg}</div>
            <div class="vs-modal-footer">
                <button id="confirm-cancel" class="Thai-Rule" style="
                    background: transparent; color: var(--vs-text-muted); border: 1px solid rgba(255,255,255,0.1); 
                    padding: 6px 16px; border-radius: var(--vs-radius); cursor: pointer; font-size: 13px; font-weight: 300;
                    transition: all 0.2s; outline: none;
                " onmouseover="this.style.background='rgba(255,255,255,0.05)'; this.style.borderColor='rgba(255,255,255,0.2)';" 
                  onmouseout="this.style.background='transparent'; this.style.borderColor='rgba(255,255,255,0.1)';">ยกเลิก</button>
                  
                <button id="confirm-ok" class="Thai-Rule" style="
                    background: rgba(var(--vs-warning-rgb), 0.1); color: var(--vs-warning); border: 1px solid rgba(var(--vs-warning-rgb), 0.3); 
                    padding: 6px 16px; border-radius: var(--vs-radius); cursor: pointer; font-size: 13px; font-weight: 300;
                    transition: all 0.2s; outline: none;
                " onmouseover="this.style.background='rgba(var(--vs-warning-rgb), 0.15)'; this.style.borderColor='rgba(var(--vs-warning-rgb), 0.5)'; this.style.boxShadow='0 0 8px rgba(var(--vs-warning-rgb), 0.1)';" 
                  onmouseout="this.style.background='rgba(var(--vs-warning-rgb), 0.1)'; this.style.borderColor='rgba(var(--vs-warning-rgb), 0.3)'; this.style.boxShadow='none';">ตกลง</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Trigger reflow for transition
        overlay.offsetHeight;
        overlay.classList.add('active');
        modal.classList.add('active');

        const closeConfirm = (isConfirmed) => {
            overlay.classList.remove('active');
            modal.classList.remove('active');
            setTimeout(() => {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                if (isConfirmed && onConfirm) onConfirm();
                else if (!isConfirmed && onCancel) onCancel();
            }, 300);
        };

        modal.querySelector('#confirm-cancel').addEventListener('click', () => closeConfirm(false));
        modal.querySelector('#confirm-ok').addEventListener('click', () => closeConfirm(true));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeConfirm(false); });
    },

    // ── Custom Alert Modal (Replaces Native Alert) ──
    showAlert(title, msg, type = 'warning') {
        const overlay = document.createElement('div');
        overlay.className = 'vs-modal-overlay';

        const modal = document.createElement('div');
        modal.className = `vs-modal ${type}`;

        const typeIcons = {
            'warning': 'i-exclamation-triangle',
            'danger': 'i-x-circle',
            'success': 'i-check-circle',
            'error': 'i-x-circle'
        };
        const icon = typeIcons[type] || typeIcons['warning'];
        const rgbVar = type === 'error' ? 'var(--vs-danger-rgb)' : (type === 'success' ? 'var(--vs-success-rgb)' : 'var(--vs-warning-rgb)');
        const colorVar = type === 'error' ? 'var(--vs-danger)' : (type === 'success' ? 'var(--vs-success)' : 'var(--vs-warning)');

        modal.innerHTML = `
            <div class="vs-modal-header">
                <i class="icon ${icon}"></i>
                <h3 class="vs-modal-title">${title}</h3>
            </div>
            <div class="vs-modal-body">${msg}</div>
            <div class="vs-modal-footer">
                <button id="alert-btn" class="Thai-Rule" style="
                    background: rgba(${rgbVar}, 0.1); color: ${colorVar}; border: 1px solid rgba(${rgbVar}, 0.3); 
                    padding: 6px 16px; border-radius: var(--vs-radius); cursor: pointer; font-size: 13px; font-weight: 300;
                    transition: all 0.2s; outline: none;
                " onmouseover="this.style.background='rgba(${rgbVar}, 0.15)'; this.style.borderColor='rgba(${rgbVar}, 0.5)'; this.style.boxShadow='0 0 8px rgba(${rgbVar}, 0.1)';" 
                  onmouseout="this.style.background='rgba(${rgbVar}, 0.1)'; this.style.borderColor='rgba(${rgbVar}, 0.3)'; this.style.boxShadow='none';">ตกลง</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Trigger reflow for transition
        overlay.offsetHeight;
        overlay.classList.add('active');
        modal.classList.add('active');

        const closeAlert = () => {
            overlay.classList.remove('active');
            modal.classList.remove('active');
            setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
        };

        modal.querySelector('#alert-btn').addEventListener('click', closeAlert);
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeAlert(); });
    },

    // ═══════════════════════════════════════════
    //  ASSIGN + SYNC
    // ═══════════════════════════════════════════

    assign(teacherId, teacherName, moduleTitle, moduleId, ctx = {}) {
        const user = this._getCurrentUser();
        const list = this.getAllDelegations();

        // 🚨 PREVENT DUPES: Iron Rule - Single Active Assignment per Task per Person
        const isDuplicate = list.some(d =>
            d.assignee === teacherId &&
            d.moduleId === moduleId &&
            (d.status === 'PENDING' || d.status === 'IN_PROGRESS')
        );

        if (isDuplicate) {
            console.warn(`[Delegation Guard] Blocked duplicate assignment of ${moduleId} to ${teacherId}`);
            if (window.HUD_NOTIFY) {
                HUD_NOTIFY.toast(
                    'การมอบหมายซ้ำซ้อน (Blocked)',
                    `คุณได้มอบหมายงาน <b>${moduleTitle}</b> ให้ <b>${teacherName}</b> ไปแล้ว และงานนี้ยังอยู่ระหว่างดำเนินการ`,
                    'warning'
                );
            }
            this.showAlert('ปฏิเสธการมอบหมาย', `${teacherName} กำลังดำเนินการภารกิจนี้อยู่แล้ว`, 'warning');
            return null; // Stop execution
        }

        const delegation = {
            id: `DEL_${Date.now()}`,
            type: this._mode,
            moduleTitle,
            moduleId,
            icon: ctx.icon || 'i-command-line', // Store icon
            colorClass: ctx.colorClass || 'text-[var(--vs-accent)]', // Store color
            assignee: teacherId,
            assigneeName: teacherName,
            assignedBy: user.id || 'DIR_MABLUD',
            assignedByName: user.fullName || 'ผอ.',
            timestamp: new Date().toISOString(),
            status: 'PENDING',
            schoolId: user.schoolId || 'SCH_MABLUD'
        };

        // Save locally
        // list is already loaded at beginning of assign
        list.push(delegation);
        this._saveDelegations(list);

        // Write to Passport
        this._writePassport(delegation);

        // Sync to backend (fire-and-forget)
        this._syncToBackend(delegation);

        return delegation;
    },

    _writePassport(delegation) {
        try {
            const key = `${this.PASSPORT_PREFIX}${delegation.assignee}`;
            const raw = localStorage.getItem(key);
            const passport = raw ? JSON.parse(raw) : { credentials: [] };
            passport.credentials.push({
                type: 'DELEGATION',
                title: delegation.moduleTitle,
                from: delegation.assignedByName,
                date: delegation.timestamp,
                status: delegation.status,
                delegationId: delegation.id
            });
            localStorage.setItem(key, JSON.stringify(passport));
        } catch (e) {
            console.warn('[DelegationPanel] Passport write failed:', e.message);
        }
    },

    async _syncToBackend(delegation) {
        try {
            const dataService = await this._getDataService();
            if (dataService && typeof dataService.addDelegation === 'function') {
                const currentUser = this._getCurrentUser();
                // InsForge signature: addDelegation(delegatorId, delegateeId, schoolId, capabilityKey, note)
                await dataService.addDelegation(
                    currentUser.id || 'DIR_MABLUD',   // delegatorId (director)
                    delegation.assignee,                // delegateeId (teacher)
                    delegation.schoolId || currentUser.schoolId || 'SCH_MABLUD',
                    delegation.moduleId,                // capabilityKey
                    delegation.moduleTitle              // note
                );
                console.log('[DelegationPanel] Synced to backend');
                return true;
            }
        } catch (e) {
            console.warn('[DelegationPanel] Backend sync failed (local saved):', e.message);
        }
        return false;
    },

    // ═══════════════════════════════════════════
    //  TEACHER LOADING (3-tier fallback)
    // ═══════════════════════════════════════════

    async _loadTeachers() {
        // Tier 1: DataService
        try {
            if (window.DataServiceFactory) {
                const ds = await DataServiceFactory.getInstance();
                const user = this._getCurrentUser();
                const schoolId = user.schoolId || 'SCH_MABLUD';
                const allUsers = await ds.getUsersBySchool(schoolId);
                const teachers = allUsers.filter(u => u.role === 'TEACHER');
                if (teachers.length > 0) {
                    this._teachers = teachers.map(t => ({
                        id: t.id || t.personId,
                        name: t.fullName || t.id,
                        homeroomClass: t.homeroomClass || ''
                    }));
                    console.log(`[DelegationPanel] Loaded ${this._teachers.length} teachers from DataService`);
                    return;
                }
            }
        } catch (e) {
            console.warn('[DelegationPanel] DataService load failed:', e.message);
        }

        // Tier 2: data.js (IDLPMS_DATA)
        try {
            const localData = window.IDLPMS_DATA || {};
            const users = localData.users || {};
            const teachers = Object.entries(users)
                .filter(([, u]) => u.role === 'TEACHER')
                .map(([id, u]) => ({
                    id,
                    name: u.fullName || id,
                    homeroomClass: u.homeroomClass || ''
                }));
            if (teachers.length > 0) {
                this._teachers = teachers;
                console.log(`[DelegationPanel] Loaded ${this._teachers.length} teachers from data.js`);
                return;
            }
        } catch (e) {
            console.warn('[DelegationPanel] data.js load failed:', e.message);
        }

        // Tier 3: Hardcoded fallback
        this._teachers = [
            { id: 'TEA_WORACHAI', name: 'นายวรชัย อภัยโส', homeroomClass: '' },
            { id: 'TEA_M_01', name: 'นางนิติพร โฆเกียรติมานนท์', homeroomClass: 'อนุบาล 2' },
            { id: 'TEA_M_02', name: 'นางสุภาภรณ์ ชุ่มแอ่น', homeroomClass: 'อนุบาล 3' }
        ];
        console.warn('[DelegationPanel] Using hardcoded fallback teachers');
    },

    // ═══════════════════════════════════════════
    //  RENDER — Shell Sidebar
    // ═══════════════════════════════════════════

    async render(containerId = 'delegation-sidebar') {
        const container = document.getElementById(containerId);
        if (!container) return;

        await this._loadTeachers();
        const ctx = this._getModuleContext();
        const user = this._getCurrentUser();
        const isDirector = !user.role || user.role === 'SCHOOL_DIR' || user.role === 'ESA_DIR' || user.role === 'OBEC' || user.role === 'MOE';

        container.innerHTML = `
            <div class="deleg-v3" style="display:flex;flex-direction:column;height:100%;font-size:13px;font-weight:300;">
                ${this._renderHeader()}
                ${isDirector ? this._renderAssignForm(ctx) : ''}
                ${this._renderViewTabs()}
                ${this._renderDelegationList()}
            </div>
        `;

        this._bindEvents(container);
    },

    _renderHeader() {
        const isSys = this._mode === 'SYSTEM';
        const title = isSys ? 'งานระบบ' : 'ภารกิจพิเศษ';

        return `
            <div style="height:48px;display:flex;align-items:center;justify-content:space-between;padding:0 12px;
                        background:var(--vs-bg-panel);border-bottom:1px solid var(--vs-border);">
                <div style="display:flex;align-items:center;gap:8px;">
                    <i class="icon i-command-line" style="width:16px;height:16px;color:var(--vs-accent);"></i>
                    <span style="color:var(--vs-text-title);text-transform:uppercase;font-size:13px;font-weight:300;">${title}</span>
                </div>
                <button class="vs-toggle deleg-toggle-btn${isSys ? '' : ' active'}" data-mode="${isSys ? 'ADHOC' : 'SYSTEM'}"></button>
            </div>`;
    },

    // Legacy toggle (deprecated — now integrated into header)
    _renderToggle() { return ''; },

    _renderAssignForm(ctx) {
        const teacherOptions = this._teachers.map(t => {
            const wl = this.getWorkload(t.id);
            const wlc = this.getWorkloadColor(wl);
            const classInfo = t.homeroomClass ? ` (${t.homeroomClass})` : '';
            return `<option value="${t.id}" data-name="${t.name}">${t.name}${classInfo} — ภาระ: ${wl}</option>`;
        }).join('');

        const isAdHoc = this._mode === 'ADHOC';

        return `
            <div style="padding:8px 12px;border-bottom:1px solid var(--vs-border);">
                <!-- Module Context -->
                <div style="margin-bottom:8px;">
                    <label style="color:var(--vs-text-muted);font-size:13px;font-weight:300;display:block;margin-bottom:4px;">
                        ${isAdHoc ? 'ชื่อภารกิจ' : 'งาน'}
                    </label>
                    ${isAdHoc
                ? `<input id="deleg-adhoc-title" type="text" placeholder="ระบุชื่อภารกิจ..."
                            style="width:100%;padding:8px 12px;background:var(--vs-bg-deep);border:none;
                                   border-radius:3px;color:var(--vs-text-body);font-size:13px;font-weight:300;
                                   outline:none;color-scheme:dark;box-sizing:border-box;" />`
                : `<div style="padding:8px 12px;background:var(--vs-bg-deep);border-radius:3px;
                                      color:var(--vs-text-body);font-size:13px;font-weight:300;
                                      display:flex;align-items:center;gap:8px;">
                            <i class="icon ${ctx.icon || 'i-command-line'} ${ctx.colorClass || 'text-[var(--vs-accent)]'}" 
                               style="width:16px;height:16px;flex-shrink:0;"></i>
                            <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${ctx.title}</span>
                           </div>`
            }
                </div>

                ${isAdHoc ? `
                <div style="margin-bottom:8px;">
                    <label style="color:var(--vs-text-muted);font-size:13px;font-weight:300;display:block;margin-bottom:4px;">
                        รายละเอียด
                    </label>
                    <textarea id="deleg-adhoc-desc" rows="2" placeholder="รายละเอียดเพิ่มเติม..."
                        style="width:100%;padding:8px 12px;background:var(--vs-bg-deep);border:none;
                               border-radius:3px;color:var(--vs-text-body);font-size:13px;font-weight:300;
                               outline:none;resize:none;color-scheme:dark;box-sizing:border-box;"></textarea>
                </div>
                ` : ''}

                <div style="margin-bottom:8px;">
                    <label style="color:var(--vs-text-muted);font-size:13px;font-weight:300;display:block;margin-bottom:4px;">
                        มอบหมายให้
                    </label>
                    <select id="deleg-teacher-select"
                        style="width:100%;padding:8px 12px;background:var(--vs-bg-deep);border:none;
                               border-radius:3px;color:var(--vs-text-body);font-size:13px;font-weight:300;
                               outline:none;color-scheme:dark;box-sizing:border-box;cursor:pointer;">
                        <option value="">-- เลือกครู --</option>
                        ${teacherOptions}
                    </select>
                </div>

                <!-- Score Points -->
                <div style="margin-bottom:12px;">
                    <label style="color:var(--vs-text-muted);font-size:12px;font-weight:300;display:block;margin-bottom:6px;text-transform:uppercase;">
                        น้ำหนักงาน (Score Point)
                    </label>
                    <input id="deleg-score" type="number" placeholder="-- ระบุคะแนน --" min="1" max="100" autocomplete="off"
                        style="width:100%;padding:10px 12px;background:var(--vs-bg-deep);border:none;
                               border-radius:var(--vs-radius);color:var(--vs-text-body);font-size:13px;font-weight:300;
                               outline:none;transition:box-shadow 0.2s;box-sizing:border-box;"
                        onfocus="this.style.boxShadow='inset 0 0 0 1px rgba(var(--vs-accent-rgb),0.5)'" onblur="this.style.boxShadow='none'" />
                </div>

                <!-- SLA Deadline -->
                <div style="margin-bottom:16px;">
                    <label style="color:var(--vs-text-muted);font-size:12px;font-weight:300;display:block;margin-bottom:6px;text-transform:uppercase;">
                        กำหนดส่ง (SLA Deadline)
                    </label>
                    <div style="position:relative;">
                        <i class="icon i-calendar" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:rgba(255,255,255,0.4);pointer-events:none;z-index:2;"></i>
                        <input id="deleg-deadline" type="text" placeholder="-- เลือกกำหนดส่ง --" autocomplete="off" readonly
                            style="width:100%;padding:10px 12px 10px 34px;background:var(--vs-bg-deep);border:none;
                                   border-radius:var(--vs-radius);color:var(--vs-text-body);font-size:13px;font-weight:300;
                                   outline:none;transition:box-shadow 0.2s;box-sizing:border-box;cursor:pointer;"
                            onfocus="this.style.boxShadow='inset 0 0 0 1px rgba(var(--vs-accent-rgb),0.5)'" onblur="this.style.boxShadow='none'" />
                    </div>
                </div>


                <!-- Submit -->
                <button id="deleg-submit-btn" disabled
                    style="width:100%;padding:8px 0;border-radius:3px;font-size:13px;font-weight:300;
                           cursor:pointer;transition:all 0.2s;
                           background:rgba(34,211,238,0.1);color:var(--vs-accent);
                           border:1px solid rgba(34,211,238,0.3);
                           opacity:0.5;">
                    <span style="display:flex;align-items:center;justify-content:center;gap:6px;">
                        <i class="icon i-paper-airplane" style="width:14px;height:14px;"></i>
                        ส่งมอบหมาย
                    </span>
                </button>
            </div>`;
    },

    _renderViewTabs() {
        const dispActive = this._viewTab === 'DISPATCHED';

        const allDel = this.getAllDelegations();
        const user = this._getCurrentUser();
        const dispatched = allDel.filter(d => d.assignedBy === (user.id || 'DIR_MABLUD'));
        const inbox = allDel.filter(d => d.assignee === (user.id || 'DIR_MABLUD'));

        return `
            <div class="vs-tab-bar" style="margin:0 12px;">
                <button class="vs-tab-bar-btn deleg-view-tab${dispActive ? ' active' : ''}" data-tab="DISPATCHED">
                    งานที่ส่ง (${dispatched.length})
                </button>
                <button class="vs-tab-bar-btn deleg-view-tab${!dispActive ? ' active' : ''}" data-tab="INBOX">
                    งานที่ได้รับ (${inbox.length})
                </button>
            </div>`;
    },

    _renderDelegationList() {
        const allDel = this.getAllDelegations();
        const user = this._getCurrentUser();
        const userId = user.id || 'DIR_MABLUD';

        let items;
        if (this._viewTab === 'DISPATCHED') {
            items = allDel.filter(d => d.assignedBy === userId);
        } else {
            items = allDel.filter(d => d.assignee === userId);
        }

        // Sort by newest first
        items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (items.length === 0) {
            return `
                <div style="flex:1;display:flex;align-items:center;justify-content:center;
                            color:var(--vs-text-muted);font-size:13px;font-weight:300;padding:24px;">
                    ${this._viewTab === 'DISPATCHED' ? 'ยังไม่มีงานที่ส่ง' : 'ยังไม่มีงานที่ได้รับ'}
                </div>`;
        }

        const listHtml = items.slice(0, 50).map(d => {
            const isRevoked = d.status === 'REVOKED';
            const statusColor = isRevoked ? 'var(--vs-danger)' :
                (d.status === 'COMPLETED' ? 'var(--vs-success)' :
                    d.status === 'IN_PROGRESS' ? 'var(--vs-warning)' : 'var(--vs-accent)');

            const statusLabel = isRevoked ? 'ยกเลิก' :
                (d.status === 'COMPLETED' ? 'เสร็จ' :
                    d.status === 'IN_PROGRESS' ? 'กำลังทำ' : 'รอ');

            const typeBadge = d.type === 'ADHOC' ? 'ADH' : 'SYS';
            const time = this._formatTime(d.timestamp);
            const person = this._viewTab === 'DISPATCHED' ? d.assigneeName : d.assignedByName;

            // Strikethrough logic
            const textStyle = isRevoked ? 'text-decoration:line-through;opacity:0.5;' : '';

            // Revoke Button (only show if dispatched and pending/in_progress)
            const showRevoke = this._viewTab === 'DISPATCHED' && !isRevoked && d.status !== 'COMPLETED';
            const revokeBtnHtml = showRevoke ? `
                <button class="deleg-revoke-btn" data-id="${d.id}"
                    style="margin-left:8px;background:none;border:none;color:var(--vs-danger);cursor:pointer;
                           padding:2px;display:flex;align-items:center;opacity:0.7;transition:all 0.2s;"
                    onmouseover="this.style.opacity='1'; this.style.transform='scale(1.1)';"
                    onmouseout="this.style.opacity='0.7'; this.style.transform='scale(1)';">
                    <i class="icon i-x" style="width:14px;height:14px;"></i>
                </button>
            ` : '';

            return `
                <div style="padding:12px 16px;border-bottom:1px solid var(--vs-border);
                            transition:background 0.15s;cursor:default;"
                     onmouseenter="this.style.background='var(--vs-bg-card)'"
                     onmouseleave="this.style.background='transparent'">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                        <span style="display:flex;align-items:center;gap:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:160px;${textStyle}">
                            <i class="icon ${d.icon || 'i-command-line'} ${d.colorClass || 'text-[var(--vs-text-title)]'}" style="width:14px;height:14px;flex-shrink:0;"></i>
                            <span style="color:var(--vs-text-title);font-size:13px;font-weight:300;">${d.moduleTitle}</span>
                        </span>
                        <div style="display:flex;align-items:center;">
                            ${revokeBtnHtml}
                        </div>
                    </div>
                    <!-- Line 2: Person + Badge -->
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                        <span style="color:var(--vs-text-muted);font-size:13px;font-weight:300;${textStyle}">
                            ${this._viewTab === 'DISPATCHED' ? '→' : '←'} ${person}
                        </span>
                        <span style="font-size:12px;font-weight:300;padding:1px 6px;border-radius:3px;
                                     background:rgba(34,211,238,0.1);color:var(--vs-accent);
                                     border:1px solid rgba(34,211,238,0.15);${textStyle}">
                            ${typeBadge}
                        </span>
                    </div>
                    <!-- Line 3: Time + Status -->
                    <div style="display:flex;align-items:center;justify-content:space-between;">
                        <div style="color:var(--vs-text-muted);font-size:12px;font-weight:300;opacity:0.6;">
                            ${time}
                        </div>
                        <div style="display:flex;align-items:center;gap:6px;">
                            <span style="width:6px;height:6px;border-radius:50%;background:${statusColor};display:inline-block;"></span>
                            <span style="color:var(--vs-text-muted);font-size:13px;font-weight:300;">${statusLabel}</span>
                        </div>
                    </div>
                </div>`;
        }).join('');

        return `<div style="flex:1;overflow-y:auto;">${listHtml}</div>`;
    },

    _revokeDelegation(id) {
        this.showConfirm(
            'ยืนยันการยกเลิก',
            'คุณแน่ใจหรือไม่ว่าต้องการยกเลิกภารกิจนี้? การดำเนินการนี้จะระงับการทำงานของปลายทางทันที',
            () => {
                const list = this.getAllDelegations();
                const dlg = list.find(d => d.id === id);
                if (dlg) {
                    dlg.status = 'REVOKED';
                    this._saveDelegations(list);

                    // Soft sync to backend (status update)
                    this._syncToBackend({ ...dlg, status: 'REVOKED' });

                    if (window.HUD_NOTIFY) {
                        HUD_NOTIFY.toast('ยกเลิกภารกิจ', `ระงับภารกิจ "${dlg.moduleTitle}" เรียบร้อยแล้ว`, 'info');
                    } else {
                        this.showAlert('ยกเลิกสำเร็จ', `ระงับภารกิจ "${dlg.moduleTitle}" ออกจากระบบแล้ว`, 'success');
                    }
                    this.render();
                }
            }
        );
    },

    _formatTime(iso) {
        try {
            const d = new Date(iso);
            const now = new Date();
            const diff = now - d;
            if (diff < 60000) return 'เมื่อสักครู่';
            if (diff < 3600000) return `${Math.floor(diff / 60000)} นาทีที่แล้ว`;
            if (diff < 86400000) return `${Math.floor(diff / 3600000)} ชม.ที่แล้ว`;
            return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
        } catch { return ''; }
    },

    // ═══════════════════════════════════════════
    //  EVENT BINDING
    // ═══════════════════════════════════════════

    _bindEvents(container) {
        // Initialize Calendar for Deadline Input
        const deadlineInput = container.querySelector('#deleg-deadline');
        if (deadlineInput && typeof IDLPMSCalendar !== 'undefined') {
            // Re-initialize to avoid duplicate calendars if already created
            if (!deadlineInput._calendarInstance) {
                deadlineInput._calendarInstance = new IDLPMSCalendar(deadlineInput);
            }
        }

        // Toggle mode buttons
        container.querySelectorAll('.deleg-toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this._mode = btn.dataset.mode;
                this.render();
            });
        });

        // View tabs
        container.querySelectorAll('.deleg-view-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                this._viewTab = btn.dataset.tab;
                this.render();
            });
        });

        // Teacher select → enable/disable submit
        const select = container.querySelector('#deleg-teacher-select');
        const submitBtn = container.querySelector('#deleg-submit-btn');
        if (select && submitBtn) {
            select.addEventListener('change', () => {
                const hasSelection = select.value !== '';
                const adHocTitle = container.querySelector('#deleg-adhoc-title');
                const hasAdHocTitle = this._mode !== 'ADHOC' || (adHocTitle && adHocTitle.value.trim());

                if (hasSelection && hasAdHocTitle) {
                    submitBtn.disabled = false;
                    submitBtn.style.opacity = '1';
                    submitBtn.style.cursor = 'pointer';
                } else {
                    submitBtn.disabled = true;
                    submitBtn.style.opacity = '0.5';
                    submitBtn.style.cursor = 'not-allowed';
                }
                this._selectedTeacherId = select.value;
            });
        }

        // Ad-hoc title input → recheck submit state
        const adHocInput = container.querySelector('#deleg-adhoc-title');
        if (adHocInput && select) {
            adHocInput.addEventListener('input', () => {
                select.dispatchEvent(new Event('change'));
            });
        }

        // Submit button
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this._handleSubmit(container));
        }

        // Revoke buttons
        container.querySelectorAll('.deleg-revoke-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this._revokeDelegation(btn.dataset.id);
            });
        });
    },

    _handleSubmit(container) {
        // Validation 1: Teacher Selection
        const select = container.querySelector('#deleg-teacher-select');
        if (!select || !select.value) {
            const msg = 'กรุณาเลือกบุคลากรเป้าหมายก่อนมอบหมายงาน';
            if (window.HUD_NOTIFY) HUD_NOTIFY.toast('ข้อมูลไม่ครบถ้วน', msg, 'error');
            this.showAlert('ข้อมูลไม่ครบถ้วน', msg, 'error');
            return;
        }

        const teacherId = select.value;
        const teacherName = select.options[select.selectedIndex]?.dataset?.name || teacherId;

        let moduleTitle, moduleId, moduleDesc;
        let finalCtx = {};
        if (this._mode === 'ADHOC') {
            const titleInput = container.querySelector('#deleg-adhoc-title');
            moduleTitle = titleInput?.value?.trim();
            if (!moduleTitle) {
                const msg = 'กรุณาระบุชื่อภารกิจที่ต้องการมอบหมาย';
                if (window.HUD_NOTIFY) HUD_NOTIFY.toast('ข้อมูลไม่ครบถ้วน', msg, 'error');
                this.showAlert('ข้อมูลไม่ครบถ้วน', msg, 'error');
                return;
            }
            const descInput = container.querySelector('#deleg-adhoc-desc');
            moduleDesc = descInput?.value?.trim() || '';
            moduleId = 'ADHOC_' + Date.now();
            finalCtx = { icon: 'i-lightning-bolt', colorClass: 'text-amber-400' };
        } else {
            const ctx = this._getModuleContext();
            moduleTitle = ctx.title;
            moduleId = ctx.id;
            finalCtx = ctx;
        }

        // Capture Score and Deadline
        const scoreInput = container.querySelector('#deleg-score');
        const deadlineInput = container.querySelector('#deleg-deadline');
        const score = scoreInput ? parseInt(scoreInput.value) || 0 : 0;
        const deadline = deadlineInput ? deadlineInput.value : null;

        // Create delegation (duplicate validation inside assign)
        const delegation = this.assign(teacherId, teacherName, moduleTitle, moduleId, finalCtx);
        if (!delegation) return; // Blocked by duplicate guard

        // Attach extended payload
        delegation.score = score;
        if (deadline) delegation.deadline = deadline;
        if (this._mode === 'ADHOC' && moduleDesc) {
            delegation.description = moduleDesc;
        }

        // Update list with full payload
        const list = this.getAllDelegations();
        const idx = list.findIndex(t => t.id === delegation.id);
        if (idx > -1) { list[idx] = delegation; this._saveDelegations(list); }

        // Toast notification
        const syncLabel = navigator.onLine ? ' (synced)' : ' (จะ sync เมื่อ online)';
        if (window.HUD_NOTIFY) {
            HUD_NOTIFY.toast('มอบหมายสำเร็จ',
                `ส่งงาน "${moduleTitle}" ให้ ${teacherName} แล้ว${syncLabel}`, 'success');
        }

        this.close();

        // Re-render to show in list
        this.render();
    },

    // ═══════════════════════════════════════════
    //  PUBLIC API — Toggle Panel
    // ═══════════════════════════════════════════

    toggle() {
        const sidebar = document.getElementById('delegation-sidebar');
        if (!sidebar) return;
        this._isOpen = !this._isOpen;
        sidebar.style.display = this._isOpen ? 'flex' : 'none';
        if (this._isOpen) this.render();

        // Update grid columns on parent <main>
        const main = sidebar.closest('main');
        if (main) main.style.gridTemplateColumns = this._isOpen ? '1fr auto' : '1fr';

        // Toggle button state
        const btn = document.getElementById('deleg-toggle-btn');
        if (btn) btn.classList.toggle('active', this._isOpen);
    },

    open(mode = 'SYSTEM') {
        this._mode = mode;
        this._isOpen = true;
        const sidebar = document.getElementById('delegation-sidebar');
        if (sidebar) {
            sidebar.style.display = 'flex';
            const main = sidebar.closest('main');
            if (main) main.style.gridTemplateColumns = '1fr auto';
        }
        this.render();
    },

    close() {
        this._isOpen = false;
        const sidebar = document.getElementById('delegation-sidebar');
        if (sidebar) {
            sidebar.style.display = 'none';
            const main = sidebar.closest('main');
            if (main) main.style.gridTemplateColumns = '1fr';
        }
    },

    // ═══════════════════════════════════════════
    //  INIT — auto-render on DOMContentLoaded
    // ═══════════════════════════════════════════

    init(retryCount = 0) {
        const user = this._getCurrentUser();
        const isDirector = !user.role || user.role === 'SCHOOL_DIR' || user.role === 'ESA_DIR' || user.role === 'OBEC' || user.role === 'MOE';

        if (isDirector && document.getElementById('delegation-sidebar')) {
            this._isOpen = false; // Start closed, user clicks to open
            console.log('[DelegationPanel] v3.0 initialized', { role: user.role, isDirector });
        } else if (retryCount < 10) {
            // Retry — AuthService may not have set the user yet
            setTimeout(() => this.init(retryCount + 1), 300);
            return;
        }

        console.log('[DelegationPanel] v3.0 ready', { role: user.role, isDirector, retries: retryCount });
    }
};

// ── Global shortcuts ──
window.DelegationPanel = DelegationPanel;
window.toggleDelegation = () => DelegationPanel.toggle();
window.openDelegation = (mode) => DelegationPanel.open(mode);

// Auto-init after bootstrap
document.addEventListener('DOMContentLoaded', () => {
    // Delay to let AppBootstrap finish
    setTimeout(() => DelegationPanel.init(), 500);
});
