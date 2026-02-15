/**
 * IDLPMS - Smart HUD Notification Engine
 */

window.HUD_NOTIFY = {
    init() {
        console.log("HUD Notification Engine Initializing...");
        this.container = document.getElementById('vs-toast-container');
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
            <div class="vs-toast-title">${title}</div>
            <div class="vs-toast-text Thai-Rule">${text}</div>
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

        // Example Role-Specific Intelligence
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
                this.toast('ระบบวิชาการ', 'มี 5 รายงานผลการเรียนที่รอการอนุมัติ');
                this.setBadge('explorer', true);
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
    }
};

// Auto-init
document.addEventListener('DOMContentLoaded', () => window.HUD_NOTIFY.init());
