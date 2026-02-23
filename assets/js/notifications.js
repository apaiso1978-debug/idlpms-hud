/**
 * E-OS - Smart HUD Notification Engine
 */

window.HUD_NOTIFY = {
    init() {
        console.log("HUD Notification Engine Initializing...");
        this.container = document.getElementById('vs-toast-container');
        // Auto-create container if missing
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'vs-toast-container';
            // Inline styles to guarantee position even without CSS
            Object.assign(this.container.style, {
                position: 'fixed',
                top: '64px',
                right: '16px',
                zIndex: '9999',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '10px',
                pointerEvents: 'none'
            });
            document.body.appendChild(this.container);
            console.warn('[HUD_NOTIFY] Auto-created vs-toast-container');
        }
        this.badges = {
            explorer: document.getElementById('badge-explorer'),
            manual: document.getElementById('badge-manual'),
            chat: document.getElementById('badge-chat')
        };

        // Initial state
        this.runRoleSpecificLogic();
    },

    toast(title, text, type = 'accent', duration = 5000) {
        if (!this.container) return;

        const toast = document.createElement('div');
        toast.className = `vs-toast ${type}`;
        toast.innerHTML = `
            <div class="vs-icon-layout">
                <div class="icon-col text-[var(--vs-text-title)]" style="margin-top: 1px;">
                    <i class="i-information-circle w-4 h-4"></i>
                </div>
                <div class="content-col Thai-Rule">
                    <div class="vs-toast-title">${title}</div>
                    <div class="vs-toast-text">${text}</div>
                </div>
            </div>
        `;

        toast.onclick = () => this.dismiss(toast);
        this.container.appendChild(toast);

        if (duration > 0) {
            setTimeout(() => this.dismiss(toast), duration);
        }
    },

    dismiss(toast) {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    },

    confirm(title, text, type = 'warning') {
        return new Promise((resolve) => {
            if (!this.container) {
                resolve(confirm(title + '\n\n' + text));
                return;
            }

            const modalOverlay = document.createElement('div');
            Object.assign(modalOverlay.style, {
                position: 'fixed',
                top: '0', left: '0', right: '0', bottom: '0',
                backgroundColor: 'rgba(0,0,0,0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '10000',
                backdropFilter: 'blur(10px)'
            });

            const modal = document.createElement('div');
            modal.className = `vs-card p-6 border border-[var(--vs-${type})]`;
            Object.assign(modal.style, {
                backgroundColor: 'var(--vs-bg-panel)',
                width: '400px',
                maxWidth: '90%',
                boxShadow: `0 0 20px rgba(var(--vs-${type}-rgb), 0.15)`
            });

            modal.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="text-[var(--vs-${type})] shrink-0 mt-0.5"><i class="icon i-warning w-6 h-6"></i></div>
                <div class="flex-1">
                    <div class="text-[var(--vs-text-title)] text-[15px] mb-1">${title}</div>
                    <div class="text-[var(--vs-text-muted)] text-[13px] mb-5 leading-snug whitespace-pre-wrap">${text.replace(/\n+/g, '\n')}</div>
                    <div class="flex justify-end gap-3 pt-2">
                        <button class="neon-btn neon-btn-ghost px-5" id="hud-confirm-cancel">ยกเลิก</button>
                        <button class="neon-btn neon-btn-${type} px-5" id="hud-confirm-ok">ยืนยัน</button>
                    </div>
                </div>
            </div>
        `;
            modalOverlay.appendChild(modal);
            document.body.appendChild(modalOverlay);

            const cleanup = () => {
                modalOverlay.style.opacity = '0';
                setTimeout(() => modalOverlay.remove(), 200);
            };

            modal.querySelector('#hud-confirm-cancel').onclick = () => {
                cleanup();
                resolve(false);
            };

            modal.querySelector('#hud-confirm-ok').onclick = () => {
                cleanup();
                resolve(true);
            };
        });
    },

    setBadge(key, active) {
        const badge = this.badges[key];
        if (badge) {
            if (active) badge.classList.add('active');
            else badge.classList.remove('active');
        }
    },

    runRoleSpecificLogic() {
        const user = window.getCurrentUser ? window.getCurrentUser() : null;
        if (!user) return;

        console.log("HUD: Running Smart Logic for", user.role);

        // ── Transfer Escalation Alerts (Unity: shared logic) ──
        this._checkTransferAlerts(user);

        // ── Role-Specific Notifications ──
        setTimeout(() => {
            if (user.role === 'STUDENT') {
                this.toast('การสื่อสาร', 'คุณได้รับข้อความใหม่จากเจ้าหน้าที่ (FACULTY_ID_042)');
                this.setBadge('chat', true);
            }
            else if (user.role === 'PARENT') {
                this.toast('ติดตามบุตรหลาน', 'บันทึกการเข้าเรียนของบุตรหลาน: ยืนยันเรียบร้อย');
                this.setBadge('explorer', true);
                this.toast('ประกาศสำคัญ', 'กำหนดการประชุมผู้ปกครอง: วันศุกร์นี้ (Q1)', 'success');
            }
            else if (user.role === 'TEACHER') {
                this.toast('คำสั่งจากผู้บริหาร', 'ผอ. มอบหมาย: สรุปผลการเรียนประจำเดือน กุมภาพันธ์', 'danger', 10000);
                setTimeout(() => {
                    this.toast('งานรอตรวจ', 'มีงานนักเรียน 2 ชิ้นรอการตรวจ (REFLECT + MASTER)', 'accent');
                    this.setBadge('explorer', true);
                }, 2000);
                setTimeout(() => {
                    this.toast('AI แจ้งเตือน', 'พบคำตอบที่ AI ให้คะแนนต่ำ (55%) ควรตรวจด้วยตนเอง', 'warning');
                }, 5000);
            }
            else if (user.role === 'SCHOOL_DIR') {
                this.toast('แจ้งเตือนสถานศึกษา', 'พบความผิดปกติของการมาเรียน: ลดลง 5% จากเกณฑ์');
                this.setBadge('explorer', true);
                this.toast('คำสั่งการด่วน', 'มีคำสั่งด่วนจากสำนักงานเขตพื้นที่ (ESA)', 'danger', 10000);
            }
            else if (user.role === 'ESA_DIR') {
                this.toast('ติดตามระดับเขต', 'สรุปแผนงบประมาณประจำปีพร้อมรับการตรวจสอบ');
                this.setBadge('explorer', true);
            }
            else if (user.role === 'OBEC' || user.role === 'MOE') {
                this.toast('ยุทธศาสตร์ชาติ', 'อัปเดตข้อมูลตัวชี้วัดผลสัมฤทธิ์ทางการเรียนระดับภาคี');
                this.setBadge('explorer', true);
            }
        }, 3000);
    },

    /**
     * Transfer Escalation Alert — Unity pattern for all authority levels
     * ครู: เห็นเฉพาะนักเรียนในห้องตัวเอง
     * ผอ.: เห็นทั้งโรงเรียน
     * ESA/OBEC: เห็นเมื่อ escalate ถึงระดับ
     */
    _checkTransferAlerts(user) {
        try {
            const ds = window.getApp?.()?.data;
            if (!ds || typeof ds.getTransferAlerts !== 'function') return;

            const schoolId = user.schoolId || null;
            const alerts = ds.getTransferAlerts(schoolId);
            if (!alerts.length) return;

            // Filter by role scope
            let scopedAlerts = alerts;
            if (user.role === 'TEACHER' && user.homeroomClass) {
                scopedAlerts = alerts.filter(a => a.classId === user.homeroomClass);
            } else if (user.role === 'ESA_DIR') {
                scopedAlerts = alerts.filter(a => ['ESA', 'OBEC'].includes(a.alertLevel));
            } else if (user.role === 'OBEC' || user.role === 'MOE') {
                scopedAlerts = alerts.filter(a => a.alertLevel === 'OBEC');
            }

            if (!scopedAlerts.length) return;

            // Group by severity
            const critical = scopedAlerts.filter(a => a.alertStatus === 'DROPOUT');
            const atRisk = scopedAlerts.filter(a => a.alertStatus === 'CRITICAL');
            const pending = scopedAlerts.filter(a => a.alertStatus === 'AT_RISK');

            setTimeout(() => {
                if (critical.length) {
                    this.toast('🚨 เด็กหลุดระบบ', `พบ ${critical.length} คน เกิน 90 วัน — ต้องรายงานหน่วยเหนือ`, 'danger', 15000);
                }
                if (atRisk.length) {
                    this.toast('🔴 วิกฤต', `พบ ${atRisk.length} คน เกิน 60 วัน — แจ้ง สพป. แล้ว`, 'danger', 10000);
                }
                if (pending.length) {
                    this.toast('⚠️ ติดตามนักเรียนย้าย', `พบ ${pending.length} คน เกิน 30 วัน ยังไม่มีโรงเรียนรับ`, 'warning', 8000);
                }
                this.setBadge('explorer', true);
            }, 1500);

        } catch (e) {
            console.warn('Transfer alert check failed:', e.message);
        }
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => window.HUD_NOTIFY.init());
