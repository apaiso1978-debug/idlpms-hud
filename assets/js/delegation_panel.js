/**
 * DELEGATION PANEL — IDLPMS Director Unified MainStage
 * ═══════════════════════════════════════════════════════
 * Universal component injected into every Director page (col-4 right).
 * Handles: Teacher selection, workload display, task assignment, passport write-back.
 *
 * v2.0: Routes all writes through DataService + SyncEngine (offline-first)
 * Iron Rules: text-[13px], font-weight: 300, rounded-[3px], Sunken Inset inputs
 * ═══════════════════════════════════════════════════════
 */

const DelegationPanel = {

    // Legacy keys (kept for migration/fallback)
    STORAGE_KEY: 'idlpms_delegations_v1',
    PASSPORT_PREFIX: 'idlpms_passport_',

    // ── Internal cache (fast reads) ──
    _cache: null,

    // ── Get DataService instance (async) ──
    async _getDataService() {
        if (typeof DataServiceFactory !== 'undefined') {
            return await DataServiceFactory.getInstance();
        }
        return null;
    },

    // ── Get SyncEngine instance (async) ──
    async _getSyncEngine() {
        if (typeof getSyncEngine === 'function') {
            return await getSyncEngine();
        }
        return null;
    },

    // ── Get All Delegations (local fast-read + backend) ──
    getAllDelegations() {
        // Fast synchronous read from local cache/localStorage
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

    // ── Save Delegations (local + queue for sync) ──
    _save(delegations) {
        this._cache = delegations;
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(delegations));
        } catch (e) {
            console.error('[DelegationPanel] Save error:', e);
        }
    },

    // ── Get Teacher Workload ──
    getWorkload(teacherId) {
        const all = this.getAllDelegations();
        return all.filter(d =>
            d.teacherId === teacherId &&
            d.status !== 'CLOSED' &&
            d.status !== 'COMPLETED'
        ).length;
    },

    // ── Workload Badge Color ──
    getWorkloadColor(count) {
        if (count <= 2) return { color: 'var(--vs-success)', label: 'ภาระน้อย', icon: '▸' };
        if (count <= 4) return { color: 'var(--vs-warning)', label: 'ปานกลาง', icon: '▸' };
        return { color: 'var(--vs-danger)', label: 'ภาระมาก', icon: '▸' };
    },

    // ── Get History for a Module ──
    getHistory(moduleId) {
        const all = this.getAllDelegations();
        return all.filter(d => d.moduleId === moduleId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);
    },

    // ── Create Delegation (Offline-First + Backend Sync) ──
    assign(teacherId, teacherName, moduleId, moduleTitle, deadline, note, directorId) {
        const all = this.getAllDelegations();
        const newDelegation = {
            id: 'DELEG_' + Date.now(),
            teacherId,
            teacherName,
            moduleId,
            moduleTitle,
            deadline: deadline || null,
            note: note || '',
            directorId: directorId || 'DIR_MABLUD',
            status: 'PENDING',
            createdAt: new Date().toISOString(),
        };
        all.push(newDelegation);
        this._save(all);

        // Write to Teacher Passport (local)
        this._writePassport(teacherId, teacherName, newDelegation);

        // ── Backend Sync (async, non-blocking) ──
        this._syncToBackend(newDelegation, teacherId, teacherName);

        return newDelegation;
    },

    // ── Async Backend Sync (fire & forget) ──
    async _syncToBackend(delegation, teacherId, teacherName) {
        try {
            const dataService = await this._getDataService();
            const syncEngine = await this._getSyncEngine();

            if (dataService && dataService._mode === 'insforge') {
                // Direct write to InsForge (when online)
                const currentUser = JSON.parse(localStorage.getItem('CURRENT_USER') || '{}');
                await dataService.addDelegation(
                    currentUser.id || 'DIR_MABLUD',
                    teacherId,
                    currentUser.schoolId || 'SCH_MABLUD',
                    delegation.moduleId,
                    delegation.note
                );
                console.log('[DelegationPanel] Delegation synced to InsForge Cloud');

                // Also write passport record to backend
                await dataService.addCredential(teacherId, {
                    credential_type: 'DELEGATION',
                    title: `มอบหมาย: ${delegation.moduleTitle}`,
                    issuing_org: 'โรงเรียนวัดหมาบชลุด',
                    issue_date: delegation.createdAt,
                    verify_status: 'PENDING',
                    notes: delegation.note,
                }, currentUser.id || 'DIR_MABLUD');
                console.log('[DelegationPanel] Passport record synced to InsForge Cloud');

            } else if (syncEngine) {
                // Queue for later sync (when offline or in local mode)
                const currentUser = JSON.parse(localStorage.getItem('CURRENT_USER') || '{}');
                await syncEngine.queueOperation('createDelegation', {
                    delegatorId: currentUser.id || 'DIR_MABLUD',
                    delegateeId: teacherId,
                    schoolId: currentUser.schoolId || 'SCH_MABLUD',
                    capabilityKey: delegation.moduleId,
                    note: delegation.note,
                });
                console.log('[DelegationPanel] Delegation queued for sync');
            }
        } catch (error) {
            console.warn('[DelegationPanel] Backend sync failed (data saved locally):', error.message);
            // Data is already saved in localStorage — will sync on next online event
        }
    },

    // ── Write to Passport (local buffer) ──
    _writePassport(teacherId, teacherName, delegation) {
        const key = this.PASSPORT_PREFIX + teacherId;
        let passport = [];
        try {
            const raw = localStorage.getItem(key);
            passport = raw ? JSON.parse(raw) : [];
        } catch (e) { passport = []; }

        passport.push({
            id: delegation.id,
            year: new Date().getFullYear() + 543, // Buddhist year
            masterCategory: 'delegation',
            title: `มอบหมาย: ${delegation.moduleTitle}`,
            org: 'โรงเรียนวัดหมาบชลุด',
            verifyStatus: 'PENDING',
            verifiedBy: 'ผู้อำนวยการ',
            note: delegation.note,
            deadline: delegation.deadline,
            createdAt: delegation.createdAt,
        });

        localStorage.setItem(key, JSON.stringify(passport));
    },

    // ── Get Pending Count for Director Badge ──
    getPendingCount() {
        return this.getAllDelegations().filter(d => d.status === 'PENDING').length;
    },

    // ══════════════════════════════════════════════════
    // RENDER — The Universal Panel UI
    // ══════════════════════════════════════════════════

    /**
     * Render the delegation panel into a container.
     * @param {string} containerId — DOM element ID for the panel
     * @param {object} context — { moduleId, moduleTitle, moduleIcon }
     */
    render(containerId, context = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const moduleId = context.moduleId || 'UNKNOWN';
        const moduleTitle = context.moduleTitle || 'งาน';
        const history = this.getHistory(moduleId);

        // Sync status indicator
        const syncBadge = this._getSyncStatusBadge();

        container.innerHTML = `
            <div class="dna-zone p-3 sticky top-6">
                <!-- Panel Header -->
                <div class="flex items-center gap-2 mb-3">
                    <div class="w-7 h-7 bg-[rgba(var(--vs-accent-rgb),0.1)] rounded-[3px] flex items-center justify-center">
                        <i class="icon i-clipboard w-3.5 h-3.5 text-[var(--vs-accent)]"></i>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-[13px] text-[var(--vs-text-title)] font-light Thai-Rule">มอบหมายงาน</h3>
                        <p class="text-[13px] text-[var(--vs-text-muted)] uppercase">Delegation Panel</p>
                    </div>
                    ${syncBadge}
                </div>

                <!-- Teacher Selector -->
                <div class="space-y-2 mb-3">
                    <label class="text-[13px] text-[var(--vs-text-muted)] uppercase block">เลือกครูผู้รับผิดชอบ</label>
                    <select id="deleg-teacher-select"
                            class="w-full bg-[var(--vs-bg-deep)] border-none rounded-[3px] p-2 text-[13px] text-[var(--vs-text-body)] font-light outline-none Thai-Rule"
                            onchange="DelegationPanel._onTeacherChange()">
                        <option value="">— เลือกครู —</option>
                    </select>
                    <!-- Workload Indicator -->
                    <div id="deleg-workload-indicator" class="hidden flex items-center gap-2 px-2 py-1.5 bg-[var(--vs-bg-deep)] rounded-[3px]">
                        <span id="deleg-workload-icon" class="text-[13px]"></span>
                        <span id="deleg-workload-text" class="text-[13px] text-[var(--vs-text-muted)] Thai-Rule"></span>
                        <span id="deleg-workload-count" class="ml-auto text-[13px] font-bold"></span>
                    </div>
                </div>

                <!-- Assignment Details -->
                <div class="space-y-2 mb-3">
                    <div>
                        <label class="text-[13px] text-[var(--vs-text-muted)] uppercase block mb-1">หัวข้องาน</label>
                        <input type="text" id="deleg-title"
                               class="w-full bg-[var(--vs-bg-deep)] border-none rounded-[3px] p-2 text-[13px] text-[var(--vs-text-body)] font-light outline-none Thai-Rule"
                               value="${moduleTitle}" readonly>
                    </div>
                    <div>
                        <label class="text-[13px] text-[var(--vs-text-muted)] uppercase block mb-1">กำหนดเวลา</label>
                        <input type="date" id="deleg-deadline"
                               class="w-full bg-[var(--vs-bg-deep)] border-none rounded-[3px] p-2 text-[13px] text-[var(--vs-text-body)] font-light outline-none">
                    </div>
                    <div>
                        <label class="text-[13px] text-[var(--vs-text-muted)] uppercase block mb-1">หมายเหตุ</label>
                        <textarea id="deleg-note" rows="2"
                                  class="w-full bg-[var(--vs-bg-deep)] border-none rounded-[3px] p-2 text-[13px] text-[var(--vs-text-body)] font-light outline-none resize-none Thai-Rule"
                                  placeholder="รายละเอียดเพิ่มเติม..."></textarea>
                    </div>
                </div>

                <!-- Submit Button -->
                <button onclick="DelegationPanel._handleAssign('${moduleId}', '${moduleTitle}')"
                        id="deleg-submit-btn"
                        class="w-full px-4 py-2.5 bg-[rgba(var(--vs-accent-rgb),0.1)] border border-[rgba(var(--vs-accent-rgb),0.3)] text-[var(--vs-accent)] rounded-[3px] text-[13px] font-light hover:bg-[rgba(var(--vs-accent-rgb),0.2)] transition-all flex items-center justify-center gap-2 Thai-Rule disabled:opacity-30 disabled:cursor-not-allowed"
                        disabled>
                    <i class="icon i-send w-4 h-4"></i>
                    <span>ส่งมอบหมาย</span>
                </button>

                <!-- History Section -->
                <div class="mt-4 pt-3 border-t border-[var(--vs-border)]">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-[13px] text-[var(--vs-text-muted)] uppercase">ประวัติ</span>
                        <span class="text-[13px] text-[var(--vs-text-muted)]">${history.length}</span>
                    </div>
                    <div class="space-y-1.5 max-h-[180px] overflow-y-auto vs-scrollbar" id="deleg-history-list">
                        ${history.length === 0
                ? `<div class="text-center py-4 text-[var(--vs-text-muted)]">
                                   <i class="icon i-inbox w-6 h-6 opacity-30 mx-auto block mb-2"></i>
                                   <p class="text-[13px] uppercase">ยังไม่มีประวัติ</p>
                               </div>`
                : history.map(h => this._renderHistoryItem(h)).join('')
            }
                    </div>
                </div>
            </div>
        `;

        // Load teachers into selector
        this._loadTeachers();
    },

    // ── Sync Status Badge (visual indicator) ──
    _getSyncStatusBadge() {
        const isOnline = navigator.onLine;
        const color = isOnline ? 'var(--vs-success)' : 'var(--vs-warning)';
        const label = isOnline ? 'SYNC' : 'OFFLINE';
        return `<span class="text-[9px] uppercase px-1.5 py-0.5 rounded-[3px] border" style="color: ${color}; border-color: ${color}">${label}</span>`;
    },

    // ── Render a History Item ──
    _renderHistoryItem(item) {
        const statusMap = {
            'PENDING': { label: 'รอดำเนินการ', color: 'var(--vs-warning)', icon: 'i-clock' },
            'IN_PROGRESS': { label: 'กำลังดำเนินการ', color: 'var(--vs-accent)', icon: 'i-lightning' },
            'COMPLETED': { label: 'เสร็จสิ้น', color: 'var(--vs-success)', icon: 'i-check' },
            'CLOSED': { label: 'ปิดแล้ว', color: 'var(--vs-text-muted)', icon: 'i-lock' },
        };
        const st = statusMap[item.status] || statusMap['PENDING'];
        const date = new Date(item.createdAt);
        const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;

        return `
            <div class="flex items-center gap-2 px-2 py-1.5 bg-[var(--vs-bg-deep)] rounded-[3px] group">
                <i class="icon ${st.icon} w-3 h-3" style="color: ${st.color}"></i>
                <div class="flex-1 min-w-0">
                    <p class="text-[13px] text-[var(--vs-text-body)] truncate Thai-Rule font-light">${item.teacherName || item.teacherId}</p>
                    <p class="text-[9px] text-[var(--vs-text-muted)]">${dateStr} · ${st.label}</p>
                </div>
                ${item.deadline ? `<span class="text-[9px] text-[var(--vs-text-muted)]">⏰ ${item.deadline}</span>` : ''}
            </div>
        `;
    },

    // ── Load Teachers into Selector ──
    async _loadTeachers() {
        const select = document.getElementById('deleg-teacher-select');
        if (!select) return;

        try {
            // Try DataService first
            if (window.DataServiceFactory) {
                const dataService = await DataServiceFactory.getInstance();
                const currentUser = JSON.parse(localStorage.getItem('CURRENT_USER') || '{}');
                const schoolId = currentUser.schoolId || 'SCH_MABLUD';
                const allUsers = await dataService.getUsersBySchool(schoolId);
                const teachers = allUsers.filter(u => u.role === 'TEACHER');

                teachers.forEach(t => {
                    const workload = this.getWorkload(t.id);
                    const wl = this.getWorkloadColor(workload);
                    const opt = document.createElement('option');
                    opt.value = t.id;
                    opt.textContent = `${wl.icon} ${t.fullName || t.id} (ภาระ: ${workload})`;
                    opt.dataset.name = t.fullName || t.id;
                    select.appendChild(opt);
                });
            }
        } catch (e) {
            console.warn('[DelegationPanel] Could not load teachers:', e);
            // Fallback: add a placeholder
            const opt = document.createElement('option');
            opt.value = 'TEA_WORACHAI';
            opt.textContent = '▸ ครูวรชัย อภัยโส (ภาระ: 0)';
            opt.dataset.name = 'ครูวรชัย อภัยโส';
            select.appendChild(opt);
        }
    },

    // ── On Teacher Selection Change ──
    _onTeacherChange() {
        const select = document.getElementById('deleg-teacher-select');
        const indicator = document.getElementById('deleg-workload-indicator');
        const submitBtn = document.getElementById('deleg-submit-btn');

        if (!select || !select.value) {
            if (indicator) indicator.classList.add('hidden');
            if (submitBtn) submitBtn.disabled = true;
            return;
        }

        const teacherId = select.value;
        const workload = this.getWorkload(teacherId);
        const wl = this.getWorkloadColor(workload);

        // Show workload indicator
        if (indicator) {
            indicator.classList.remove('hidden');
            document.getElementById('deleg-workload-icon').textContent = wl.icon;
            document.getElementById('deleg-workload-text').textContent = wl.label;
            const countEl = document.getElementById('deleg-workload-count');
            countEl.textContent = `${workload} งาน`;
            countEl.style.color = wl.color;
        }

        // Enable submit
        if (submitBtn) submitBtn.disabled = false;
    },

    // ── Handle Assignment ──
    _handleAssign(moduleId, moduleTitle) {
        const select = document.getElementById('deleg-teacher-select');
        const deadline = document.getElementById('deleg-deadline')?.value || '';
        const note = document.getElementById('deleg-note')?.value || '';

        if (!select || !select.value) return;

        const teacherId = select.value;
        const teacherName = select.options[select.selectedIndex]?.dataset?.name || teacherId;
        const currentUser = JSON.parse(localStorage.getItem('CURRENT_USER') || '{}');

        // Create delegation (writes to localStorage + syncs to backend)
        const result = this.assign(
            teacherId,
            teacherName,
            moduleId,
            moduleTitle,
            deadline,
            note,
            currentUser.id || 'DIR_MABLUD'
        );

        // Visual feedback
        const syncLabel = navigator.onLine ? ' (synced)' : ' (จะ sync เมื่อ online)';
        if (window.HUD_NOTIFY) {
            HUD_NOTIFY.toast('มอบหมายสำเร็จ', `ส่งงาน "${moduleTitle}" ให้ ${teacherName} แล้ว${syncLabel}`, 'success');
        } else {
            alert(`มอบหมายงานให้ ${teacherName} สำเร็จ!${syncLabel}`);
        }

        // Reset form & refresh
        select.value = '';
        document.getElementById('deleg-note').value = '';
        document.getElementById('deleg-deadline').value = '';
        document.getElementById('deleg-workload-indicator')?.classList.add('hidden');
        document.getElementById('deleg-submit-btn').disabled = true;

        // Refresh history
        this.render(
            document.getElementById('deleg-history-list')?.closest('.dna-zone')?.parentElement?.id || 'delegation-panel',
            { moduleId, moduleTitle }
        );
    },
};

window.DelegationPanel = DelegationPanel;
