/**
 * TASK UI — IDLPMS Tactical HUD Rendering
 * Enforcing Iron Rules: text-[13px], font-weight: 300, rounded-[3px]
 */

const TaskUI = {
    init() {
        console.log('Task UI Initializing...');
        this.renderAll();
    },

    renderAll() {
        const user = window.getCurrentUser();
        if (!user) return;

        if (user.role === 'SCHOOL_DIR' || user.role === 'ESA_DIR') {
            this.renderDirectorBoard();
        } else if (user.role === 'TEACHER') {
            this.renderTeacherInbox(user.userId);
        }
    },

    // ──────────────────────────────────────────────
    // DIRECTOR VIEW
    // ──────────────────────────────────────────────
    renderDirectorBoard() {
        const container = document.getElementById('management-content');
        if (!container) return;

        const report = TaskSystem.getDirectorReport('SCH_MABLUD'); // Mock schoolId for now

        // Create Section Header
        const section = document.createElement('div');
        section.className = 'mt-6 mb-4 px-3 flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-2';
        section.innerHTML = `
            <span class="hud-badge-micro bg-white/10 text-white/50 px-2 py-0.5 rounded-[2px] uppercase font-bold">MISSION CONTROL — TASK PUSH</span>
            <button onclick="TaskUI.openCreateModal()" class="text-[13px] text-[var(--vs-accent)] hover:underline font-light flex items-center gap-1">
                <i class="icon i-plus h-3 w-3"></i>
                สร้าง TASK
            </button>
        `;
        container.appendChild(section);

        if (report.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'px-3 py-6 text-center border border-dashed border-[var(--vs-border)] rounded-[var(--vs-radius)] opacity-30';
            empty.innerHTML = `<div class="text-[13px] font-light italic">ยังไม่มีงานที่มอบหมาย</div>`;
            container.appendChild(empty);
            return;
        }

        const board = document.createElement('div');
        board.className = 'space-y-3 px-1';

        report.forEach(task => {
            const template = IDLPMS_DATA.taskTemplates[task.templateId] || {};
            const item = document.createElement('div');
            item.className = 'vs-glass border border-[rgba(255,255,255,0.05)] p-3 rounded-[var(--vs-radius)] group hover:border-[rgba(var(--vs-accent-rgb),0.3)] transition-all';

            item.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                        <div class="p-1.5 rounded-[3px]" style="background: rgba(${template.colorRgb || '255,255,255'}, 0.1)">
                            <i class="icon ${template.icon || 'i-clipboard'} h-4 w-4" style="color: ${template.color || 'var(--vs-text-title)'}"></i>
                        </div>
                        <div class="min-w-0">
                            <div class="text-[13px] font-light text-[var(--vs-text-title)] truncate">${task.title}</div>
                            <div class="text-[10px] text-[var(--vs-text-muted)] uppercase tracking-tight">DEADLINE: ${task.deadline}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-[13px] font-bold" style="color: ${task.percent === 100 ? 'var(--vs-success)' : 'var(--vs-accent)'}">${task.percent}%</div>
                        <div class="text-[9px] text-[var(--vs-text-muted)] uppercase">${task.submitted}/${task.total} ชั้นเรียน</div>
                    </div>
                </div>
                
                <!-- Progress Bar Core 6 (3px Standard) -->
                <div class="vs-progress-track mb-2" data-tooltip="${task.submitted}/${task.total} classes submitted">
                    <div class="vs-progress-fill ${task.percent === 100 ? 'vs-progress-fill-success' : ''}" style="width: ${task.percent}%"></div>
                </div>

                <!-- Teacher Progress Detail -->
                <div class="flex flex-wrap gap-1 mt-3">
                    ${Object.values(task.assignments).map(a => `
                        <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] border border-[rgba(255,255,255,0.05)] bg-[rgba(255,255,255,0.02)]" 
                             data-tooltip="${a.teacherName} — ${a.status === 'submitted' ? 'ส่งแล้ว' : 'รอดำเนินการ'}">
                            <div class="w-1.5 h-1.5 rounded-full ${a.status === 'submitted' ? 'bg-[var(--vs-success)]' : 'bg-zinc-600'}"></div>
                            <span class="text-[10px] font-light text-[var(--vs-text-muted)]">${a.classId}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            board.appendChild(item);
        });

        container.appendChild(board);

        // Re-init tooltips
        if (window.initTooltips) window.initTooltips();
    },

    // ──────────────────────────────────────────────
    // TEACHER VIEW
    // ──────────────────────────────────────────────
    renderTeacherInbox(teacherId) {
        const container = document.getElementById('management-content');
        if (!container) return;

        const tasks = TaskSystem.getTeacherInbox(teacherId);

        const section = document.createElement('div');
        section.className = 'mt-6 mb-4 px-3 flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] pb-2';
        section.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="hud-badge-micro bg-white/10 text-white/50 px-2 py-0.5 rounded-[2px] uppercase font-bold">TASK INBOX</span>
                ${tasks.length > 0 ? `<span class="vs-count ml-2">${tasks.length}</span>` : ''}
            </div>
        `;
        container.appendChild(section);

        if (tasks.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'px-3 py-6 text-center border border-dashed border-[var(--vs-border)] rounded-[var(--vs-radius)] opacity-30';
            empty.innerHTML = `<div class="text-[13px] font-light italic">ไม่มีงานค้างใน Inbox</div>`;
            container.appendChild(empty);
            return;
        }

        const inbox = document.createElement('div');
        inbox.className = 'space-y-3 px-1';

        tasks.forEach(task => {
            const template = IDLPMS_DATA.taskTemplates[task.templateId] || {};
            const completion = TaskSystem.getClassCompletionStatus(task.myAssignment.classId, template.dataKey);

            const item = document.createElement('div');
            item.className = 'vs-glass border border-[rgba(255,255,255,0.05)] p-3 rounded-[var(--vs-radius)]';

            const isSubmitted = task.myAssignment.status === 'submitted';

            item.innerHTML = `
                <div class="flex items-center gap-3 mb-3">
                    <div class="p-2 rounded-[3px]" style="background: rgba(${template.colorRgb || '255,255,255'}, 0.1)">
                        <i class="icon ${template.icon || 'i-clipboard'} h-5 w-5" style="color: ${template.color || 'var(--vs-text-title)'}"></i>
                    </div>
                    <div class="flex-1 min-w-0">
                        <div class="text-[13px] font-light text-[var(--vs-text-title)]">${task.title}</div>
                        <div class="text-[13px] text-[var(--vs-text-muted)] flex items-center gap-2 mt-0.5">
                            <span class="text-[var(--vs-accent)]">ชั้น ${task.myAssignment.classId}</span>
                            <span>•</span>
                            <span class="${this.isUrgent(task.deadline) ? 'text-[var(--vs-danger)] font-medium' : ''}">ครบกำหนด: ${task.deadline}</span>
                        </div>
                    </div>
                </div>

                <div class="vs-glass bg-black/20 p-2 rounded-[var(--vs-radius)] mb-3">
                    <div class="flex justify-between text-[10px] uppercase text-[var(--vs-text-muted)] mb-1">
                        <span>ความคืบหน้าการกรอกข้อมูล</span>
                        <span>${completion.recorded}/${completion.total} คน (${completion.percent}%)</span>
                    </div>
                    <div class="vs-progress-track">
                        <div class="vs-progress-fill" style="width: ${completion.percent}%; background: ${completion.isComplete ? 'var(--vs-success)' : 'var(--vs-accent)'}"></div>
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <div class="text-[13px] text-[var(--vs-text-muted)] italic truncate max-w-[150px]">
                        ${task.note || 'ไม่มีหมายเหตุ'}
                    </div>
                    ${isSubmitted ? `
                        <div class="flex items-center gap-1.5 text-[var(--vs-success)] text-[13px] font-light">
                            <i class="icon i-check-circle h-4 w-4"></i>
                            ส่งงานแล้ว
                        </div>
                    ` : `
                        <button onclick="TaskUI.handleSubmit('${task.taskId}')" 
                                ${!completion.isComplete ? 'disabled' : ''}
                                class="px-4 py-1.5 bg-[var(--vs-accent)] text-[var(--vs-bg-deep)] rounded-[3px] text-[13px] font-bold hover:brightness-110 active:scale-95 disabled:opacity-30 disabled:grayscale transition-all">
                            SUBMIT งาน
                        </button>
                    `}
                </div>
            `;
            inbox.appendChild(item);
        });

        container.appendChild(inbox);
    },

    isUrgent(deadlineStr) {
        const deadline = new Date(deadlineStr);
        const today = new Date();
        const diff = (deadline - today) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 3;
    },

    // ──────────────────────────────────────────────
    // MODAL & ACTIONS
    // ──────────────────────────────────────────────
    openCreateModal() {
        // Find existing modal or inject new one
        let modal = document.getElementById('modal-create-task');
        if (!modal) {
            this.injectCreateModal();
            modal = document.getElementById('modal-create-task');
        }
        modal.style.display = 'flex';

        // Reset count
        this.updateTargetCount();
    },

    closeCreateModal() {
        const modal = document.getElementById('modal-create-task');
        if (modal) modal.style.display = 'none';
    },

    injectCreateModal() {
        const modalHtml = `
            <div id="modal-create-task" class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm items-center justify-center p-4 Thai-Rule" style="display:none">
                <div class="vs-glass border border-[var(--vs-border)] w-full max-w-sm rounded-[var(--vs-radius)] overflow-hidden animate-zoom-in">
                    <div class="px-5 py-4 border-b border-[var(--vs-border)] flex items-center justify-between bg-white/5">
                        <div class="flex items-center gap-2">
                            <div class="w-1.5 h-6 bg-[var(--vs-accent)]"></div>
                            <span class="text-[13px] font-light text-[var(--vs-text-title)] uppercase">สั่งงานใหม่ — TASK PUSH</span>
                        </div>
                        <button onclick="TaskUI.closeCreateModal()" class="text-[var(--vs-text-muted)] hover:text-white">
                            <i class="icon i-x h-4 w-4"></i>
                        </button>
                    </div>

                    <div class="p-5 space-y-4">
                        <div class="space-y-1">
                            <label class="text-[13px] text-[var(--vs-text-muted)] uppercase">ประเภทงาน</label>
                            <select id="task-template" class="w-full text-[13px] p-2 vs-setup-input" onchange="TaskUI.onTemplateChange()">
                                ${Object.values(IDLPMS_DATA.taskTemplates).map(t => `
                                    <option value="${t.id}">${t.title}</option>
                                `).join('')}
                            </select>
                        </div>

                        <div class="space-y-1">
                            <label class="text-[13px] text-[var(--vs-text-muted)] uppercase">ชื่อ TASK</label>
                            <input id="task-title" type="text" class="w-full text-[13px] p-2 vs-setup-input" placeholder="เช่น บันทึกผลทดสอบสมรรถภาพ 2568" />
                        </div>

                        <div class="space-y-1">
                            <label class="text-[13px] text-[var(--vs-text-muted)] uppercase">กำหนดส่ง</label>
                            <input id="task-deadline" type="date" class="w-full text-[13px] p-2 vs-setup-input" />
                        </div>

                        <div class="space-y-1">
                            <label class="text-[13px] text-[var(--vs-text-muted)] uppercase">หมายเหตุ (ถ้ามี)</label>
                            <textarea id="task-note" rows="2" class="w-full text-[13px] p-2 vs-setup-input" placeholder="ระบุรายละเอียดเพิ่มเติม..."></textarea>
                        </div>

                        <div class="py-2 px-3 bg-[rgba(var(--vs-accent-rgb),0.05)] border border-[rgba(var(--vs-accent-rgb),0.1)] rounded-[var(--vs-radius)] flex items-center justify-between">
                            <span class="text-[13px] text-[var(--vs-text-muted)]">เป้าหมาย: ครูประจำชั้นทุกคน</span>
                            <span id="target-count" class="text-[13px] text-[var(--vs-accent)] font-bold">... คน</span>
                        </div>

                        <div class="flex gap-3 pt-2">
                            <button onclick="TaskUI.closeCreateModal()" class="flex-1 py-2 rounded-[3px] border border-[var(--vs-border)] text-[13px] font-light hover:bg-white/5">ยกเลิก</button>
                            <button onclick="TaskUI.handleCreateSubmit()" class="flex-1 py-2 rounded-[3px] bg-[var(--vs-accent)] text-[var(--vs-bg-deep)] text-[13px] font-bold hover:brightness-110">ส่ง TASK ทันที</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Populate default values
        this.onTemplateChange();
    },

    onTemplateChange() {
        const tid = document.getElementById('task-template').value;
        const template = IDLPMS_DATA.taskTemplates[tid];
        if (template) {
            document.getElementById('task-title').value = template.title;
        }
        this.updateTargetCount();
    },

    updateTargetCount() {
        const schoolId = 'SCH_MABLUD';
        const teachers = Object.values(IDLPMS_DATA.users).filter(u => u.role === 'TEACHER' && u.schoolId === schoolId && u.homeroomClass);
        const el = document.getElementById('target-count');
        if (el) el.innerText = `${teachers.length} คน`;
    },

    handleCreateSubmit() {
        const tid = document.getElementById('task-template').value;
        const title = document.getElementById('task-title').value.trim();
        const deadline = document.getElementById('task-deadline').value;
        const note = document.getElementById('task-note').value.trim();

        if (!title || !deadline) {
            if (window.HUD_NOTIFY) HUD_NOTIFY.toast('MISSING_DATA', 'กรุณากรอกข้อมูลให้ครบถ้วน', 'warning');
            return;
        }

        const user = window.getCurrentUser();
        TaskSystem.createTask(tid, title, deadline, note, user.schoolId || 'SCH_MABLUD', user.userId);

        this.closeCreateModal();
        if (window.HUD_NOTIFY) HUD_NOTIFY.toast('TASK_PUSHED', 'ส่ง Task ไปยังครูทุกคนแล้ว', 'success');

        this.renderAll();
    },

    handleSubmit(taskId) {
        const user = window.getCurrentUser();
        const success = TaskSystem.submitTask(taskId, user.userId);

        if (success) {
            if (window.HUD_NOTIFY) HUD_NOTIFY.toast('TASK_SUBMITTED', 'ส่งงานเรียบร้อยแล้ว', 'success');
            this.renderAll();
        } else {
            if (window.HUD_NOTIFY) HUD_NOTIFY.toast('SUBMIT_FAILED', 'ไม่สามารถส่งงานได้ กรุณาตรวจสอบข้อมูล', 'error');
        }
    }
};

window.TaskUI = TaskUI;
