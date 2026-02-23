/**
 * ══════════════════════════════════════════════════════════════
 * LeaveService.js — Leave Management for E-OS HUD
 * ══════════════════════════════════════════════════════════════
 * ระบบใบลาบุคลากร: ครูยื่น → ผอ.อนุมัติ
 * อ้างอิง: ระเบียบสำนักนายกรัฐมนตรี ว่าด้วยการลาของข้าราชการ พ.ศ. 2555
 */
const LeaveService = (() => {
    'use strict';

    const STORAGE_KEY = 'EOS_LEAVE_REQUESTS';
    const PERSONNEL_KEY = 'EOS_PERSONNEL';

    // ─── Leave Types with Thai Regulation Guide ─────────────────
    const LEAVE_TYPES = {
        SICK: {
            code: 'SICK',
            name: 'ลาป่วย',
            icon: 'i-heart',
            color: 'var(--vs-danger)',
            maxDaysPerYear: 60,
            guide: {
                summary: 'ลาหยุดเพื่อรักษาตัวเมื่อเจ็บป่วย',
                rules: [
                    'ลาได้ปีละไม่เกิน 60 วันทำการ (ได้รับเงินเดือน)',
                    'ลาป่วยต่อเนื่อง 30 วันขึ้นไป ต้องมีใบรับรองแพทย์',
                    'หากป่วยกะทันหัน ให้ผู้อื่นลาแทนได้ แล้วส่งใบลาเมื่อกลับมาปฏิบัติงาน',
                    'กรณีลาป่วยไม่ถึง 30 วัน ผู้บังคับบัญชาอาจขอใบรับรองแพทย์ได้ตามดุลยพินิจ'
                ],
                documents: ['ใบลาป่วย (แบบ ล.1)', 'ใบรับรองแพทย์ (กรณีลา ≥ 30 วัน)'],
                note: 'ควรยื่นใบลาก่อนหรือในวันที่ลา เว้นแต่มีเหตุจำเป็น'
            }
        },
        PERSONAL: {
            code: 'PERSONAL',
            name: 'ลากิจส่วนตัว',
            icon: 'i-briefcase',
            color: 'var(--vs-warning)',
            maxDaysPerYear: 45,
            guide: {
                summary: 'ลาหยุดเพื่อทำธุระส่วนตัวที่จำเป็น',
                rules: [
                    'ลาได้ปีละไม่เกิน 45 วันทำการ (ได้รับเงินเดือน)',
                    'ต้องได้รับอนุญาตจากผู้บังคับบัญชาก่อนจึงจะหยุดราชการได้',
                    'กรณีเร่งด่วน สามารถหยุดก่อนแล้วส่งใบลาภายหลังได้',
                    'ปีแรกที่เข้ารับราชการ ได้เงินระหว่างลาไม่เกิน 15 วันทำการ'
                ],
                documents: ['ใบลากิจ (แบบ ล.1)'],
                note: 'ควรยื่นใบลาล่วงหน้าอย่างน้อย 1 วัน'
            }
        },
        VACATION: {
            code: 'VACATION',
            name: 'ลาพักผ่อนประจำปี',
            icon: 'i-sun',
            color: 'var(--vs-accent)',
            maxDaysPerYear: 10,
            guide: {
                summary: 'ลาหยุดราชการเพื่อพักผ่อนประจำปี',
                rules: [
                    'มีสิทธิ์ลาพักผ่อนปีละ 10 วันทำการ',
                    'รับราชการ < 10 ปี: สะสมรวมปีปัจจุบันได้ไม่เกิน 20 วัน',
                    'รับราชการ ≥ 10 ปี: สะสมรวมปีปัจจุบันได้ไม่เกิน 30 วัน',
                    'ครูที่หยุดภาคเรียนเกินกว่าวันลาพักผ่อน → ไม่มีสิทธิ์ลาพักผ่อน'
                ],
                documents: ['ใบลาพักผ่อน (แบบ ล.2)'],
                note: 'ครูในสถานศึกษาส่วนใหญ่ไม่มีสิทธิ์ลาพักผ่อน เนื่องจากมีวันหยุดภาคเรียน'
            }
        },
        MATERNITY: {
            code: 'MATERNITY',
            name: 'ลาคลอดบุตร',
            icon: 'i-user-plus',
            color: '#e879a8',
            maxDaysPerYear: 90,
            guide: {
                summary: 'ลาเพื่อคลอดบุตรและพักฟื้นหลังคลอด',
                rules: [
                    'ลาได้ครั้งละไม่เกิน 90 วัน (นับรวมวันหยุดราชการ)',
                    'ได้รับเงินเดือนระหว่างลาไม่เกิน 90 วัน',
                    'ไม่ต้องได้รับอนุญาตก่อน สามารถยื่นใบลาได้ทันที',
                    'ลาก่อนคลอดได้ไม่เกิน 7 วัน โดยนับรวมใน 90 วัน'
                ],
                documents: ['ใบลาคลอดบุตร (แบบ ล.4)', 'สำเนาสูติบัตร (ยื่นภายหลัง)'],
                note: 'สามารถลาต่อเนื่องจนครบ 90 วันโดยไม่ต้องยื่นใบลาใหม่'
            }
        },
        ORDAIN: {
            code: 'ORDAIN',
            name: 'ลาอุปสมบท/ฮัจย์',
            icon: 'i-sparkles',
            color: '#c4b5fd',
            maxDaysPerYear: 120,
            guide: {
                summary: 'ลาเพื่ออุปสมบทในพระพุทธศาสนา หรือไปประกอบพิธีฮัจย์',
                rules: [
                    'ลาได้ครั้งหนึ่งไม่เกิน 120 วัน',
                    'ต้องยื่นใบลาล่วงหน้าไม่น้อยกว่า 60 วัน',
                    'ได้รับเงินเดือนระหว่างลาไม่เกิน 120 วัน',
                    'ใช้สิทธิ์ได้เพียงครั้งเดียวตลอดรับราชการ'
                ],
                documents: ['ใบลาอุปสมบท/ฮัจย์ (แบบ ล.5)', 'หนังสือรับรองจากวัด/มัสยิด'],
                note: 'ต้องอุปสมบท/ไปประกอบพิธีภายใน 10 วัน นับจากวันเริ่มลา'
            }
        }
    };

    // ─── Leave Statuses ─────────────────────────────────────────
    const STATUSES = {
        PENDING: { code: 'PENDING', name: 'รออนุมัติ', color: 'var(--vs-warning)', icon: 'i-clock' },
        APPROVED: { code: 'APPROVED', name: 'อนุมัติแล้ว', color: 'var(--vs-success)', icon: 'i-check-circle' },
        REJECTED: { code: 'REJECTED', name: 'ไม่อนุมัติ', color: 'var(--vs-danger)', icon: 'i-x-circle' }
    };

    // ─── Personnel Categories ──────────────────────────────────
    const PERSONNEL_TYPES = {
        TEACHER: { code: 'TEACHER', name: 'ข้าราชการครู', color: 'var(--vs-accent)' },
        CONTRACT: { code: 'CONTRACT', name: 'ครูอัตราจ้าง', color: 'var(--vs-warning)' },
        GOV_EMPLOYEE: { code: 'GOV_EMPLOYEE', name: 'พนักงานราชการ', color: 'var(--vs-success)' },
        SUPPORT: { code: 'SUPPORT', name: 'ลูกจ้าง/ภารโรง', color: '#a78bfa' }
    };

    // ─── Mock Personnel Data ────────────────────────────────────
    const MOCK_PERSONNEL = [
        // ข้าราชการครู
        { id: '22222222-2222-4222-8222-222222222222', name: 'นายวรชัย อภัยโส', type: 'TEACHER', position: 'ครู คศ.1' },
        { id: 'TEA_SOMSRI', name: 'นางสมศรี จันทร์ดี', type: 'TEACHER', position: 'ครู คศ.2' },
        { id: 'TEA_PRANEE', name: 'นางสาวปราณี สุขใจ', type: 'TEACHER', position: 'ครู คศ.2' },
        { id: 'TEA_SOMCHAI_T', name: 'นายสมชาย ใจดี', type: 'TEACHER', position: 'ครู คศ.3' },
        { id: 'TEA_WIPA', name: 'นางวิภา รักเรียน', type: 'TEACHER', position: 'ครู คศ.1' },
        { id: 'TEA_SUTHAT', name: 'นายสุทัศน์ มานะ', type: 'TEACHER', position: 'ครู คศ.2' },
        { id: 'TEA_NATTAYA', name: 'นางสาวณัฐฐิญา วงศ์ใหญ่', type: 'TEACHER', position: 'ครู คศ.1' },
        { id: 'TEA_KANOK', name: 'นายกนก พลศรี', type: 'TEACHER', position: 'ครู คศ.1' },
        { id: 'TEA_ARUNEE', name: 'นางอรุณี แสงจันทร์', type: 'TEACHER', position: 'ครูชำนาญการพิเศษ' },
        { id: 'TEA_PRASIT', name: 'นายประสิทธิ์ เพียรดี', type: 'TEACHER', position: 'ครู คศ.2' },
        { id: 'TEA_SUPAPORN', name: 'นางสุภาพร ศรีวิไล', type: 'TEACHER', position: 'ครู คศ.1' },
        { id: 'TEA_THAWORN', name: 'นายถาวร มั่นคง', type: 'TEACHER', position: 'ครู คศ.2' },
        // ครูอัตราจ้าง
        { id: 'CON_MANEE', name: 'นางสาวมานี รักษ์สวน', type: 'CONTRACT', position: 'ครูอัตราจ้าง' },
        { id: 'CON_PITI', name: 'นายปิติ สมบูรณ์', type: 'CONTRACT', position: 'ครูอัตราจ้าง' },
        // พนักงานราชการ
        { id: 'GOV_SOMCHAI', name: 'นายสมชาย สุดเจริญ', type: 'GOV_EMPLOYEE', position: 'เจ้าหน้าที่ธุรการ' },
        // ลูกจ้าง/ภารโรง
        { id: 'SUP_KAEW', name: 'นายแก้ว ดีสม', type: 'SUPPORT', position: 'ภารโรง' },
        { id: 'SUP_SOM', name: 'นายสม พอเพียง', type: 'SUPPORT', position: 'ยาม' }
    ];

    // ─── Mock Leave Requests ────────────────────────────────────
    const MOCK_LEAVE_REQUESTS = [
        {
            id: 'LV-2568-001',
            personnelId: 'TEA_SOMSRI',
            type: 'SICK',
            startDate: '2025-02-17',
            endDate: '2025-02-18',
            days: 2,
            reason: 'ไข้หวัดใหญ่ มีไข้สูง',
            status: 'APPROVED',
            approvedBy: '11111111-1111-4111-8111-111111111111',
            approvedDate: '2025-02-16',
            approverNote: 'อนุญาต ให้พักผ่อนให้หาย',
            createdAt: '2025-02-16T08:30:00'
        },
        {
            id: 'LV-2568-002',
            personnelId: '22222222-2222-4222-8222-222222222222',
            type: 'PERSONAL',
            startDate: '2025-02-20',
            endDate: '2025-02-20',
            days: 1,
            reason: 'พาบุตรไปพบแพทย์ โรงพยาบาลร้อยเอ็ด',
            status: 'PENDING',
            createdAt: '2025-02-19T09:15:00'
        },
        {
            id: 'LV-2568-003',
            personnelId: 'TEA_PRANEE',
            type: 'SICK',
            startDate: '2025-02-19',
            endDate: '2025-02-21',
            days: 3,
            reason: 'ผ่าตัดเล็ก ต้องพักฟื้น',
            attachments: ['ใบรับรองแพทย์_ปราณี.pdf'],
            status: 'PENDING',
            createdAt: '2025-02-18T14:00:00'
        },
        {
            id: 'LV-2568-004',
            personnelId: 'SUP_KAEW',
            type: 'PERSONAL',
            startDate: '2025-02-21',
            endDate: '2025-02-21',
            days: 1,
            reason: 'ไปติดต่อราชการที่อำเภอ',
            status: 'PENDING',
            createdAt: '2025-02-19T07:00:00'
        },
        {
            id: 'LV-2568-005',
            personnelId: 'TEA_SOMCHAI_T',
            type: 'PERSONAL',
            startDate: '2025-02-10',
            endDate: '2025-02-11',
            days: 2,
            reason: 'งานบวชลูกชาย',
            status: 'APPROVED',
            approvedBy: '11111111-1111-4111-8111-111111111111',
            approvedDate: '2025-02-08',
            approverNote: 'อนุญาต',
            createdAt: '2025-02-07T10:00:00'
        },
        {
            id: 'LV-2568-006',
            personnelId: 'CON_MANEE',
            type: 'SICK',
            startDate: '2025-02-14',
            endDate: '2025-02-14',
            days: 1,
            reason: 'ปวดท้องรุนแรง',
            status: 'APPROVED',
            approvedBy: '11111111-1111-4111-8111-111111111111',
            approvedDate: '2025-02-14',
            approverNote: 'อนุญาต',
            createdAt: '2025-02-14T08:00:00'
        }
    ];

    // ─── Mock Attendance (today) ────────────────────────────────
    const MOCK_ATTENDANCE_TODAY = {
        date: new Date().toISOString().split('T')[0],
        summary: {
            TEACHER: { total: 12, present: 10, leave: 2, absent: 0, late: 1 },
            CONTRACT: { total: 2, present: 2, leave: 0, absent: 0, late: 0 },
            GOV_EMPLOYEE: { total: 1, present: 1, leave: 0, absent: 0, late: 0 },
            SUPPORT: { total: 2, present: 1, leave: 1, absent: 0, late: 0 }
        }
    };

    // ─── Quick Out (ออกธุระชั่วคราว) ────────────────────────────
    const QUICKOUT_KEY = 'EOS_QUICKOUTS';

    const QUICKOUT_REASONS = [
        { code: 'BANK', name: 'ไปธนาคาร', icon: 'i-database' },
        { code: 'GOVT', name: 'ติดต่อราชการ', icon: 'i-office' },
        { code: 'HEALTH', name: 'ไปหาหมอ/ทำฟัน', icon: 'i-heart' },
        { code: 'SCHOOL_ERRAND', name: 'ธุระโรงเรียน', icon: 'i-academic' },
        { code: 'PERSONAL_ERRAND', name: 'ธุระส่วนตัวเร่งด่วน', icon: 'i-lightning' },
        { code: 'OTHER', name: 'อื่นๆ', icon: 'i-dots' }
    ];

    const MOCK_QUICKOUTS = [
        {
            id: 'QO-001',
            personnelId: '22222222-2222-4222-8222-222222222222',
            reasonCode: 'BANK',
            reasonDetail: 'โอนเงินค่าอุปกรณ์การสอน',
            date: '2025-02-18',
            timeOut: '10:30',
            timeIn: '12:15',
            hours: 1.75,
            status: 'COMPLETED',
            createdAt: '2025-02-18T10:30:00'
        },
        {
            id: 'QO-002',
            personnelId: 'TEA_SOMSRI',
            reasonCode: 'HEALTH',
            reasonDetail: 'นัดทำฟัน',
            date: '2025-02-17',
            timeOut: '13:00',
            timeIn: '15:00',
            hours: 2,
            status: 'COMPLETED',
            createdAt: '2025-02-17T13:00:00'
        },
        {
            id: 'QO-003',
            personnelId: '22222222-2222-4222-8222-222222222222',
            reasonCode: 'GOVT',
            reasonDetail: 'ส่งเอกสารที่ สพป.',
            date: '2025-02-14',
            timeOut: '09:00',
            timeIn: '11:30',
            hours: 2.5,
            status: 'COMPLETED',
            createdAt: '2025-02-14T09:00:00'
        },
        {
            id: 'QO-004',
            personnelId: 'TEA_PRANEE',
            reasonCode: 'PERSONAL_ERRAND',
            reasonDetail: 'รับพัสดุไปรษณีย์',
            date: '2025-02-19',
            timeOut: '14:00',
            timeIn: null,
            hours: null,
            status: 'OUT',
            createdAt: '2025-02-19T14:00:00'
        }
    ];

    function _loadQuickOuts() {
        const raw = localStorage.getItem(QUICKOUT_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    function _saveQuickOuts(data) {
        localStorage.setItem(QUICKOUT_KEY, JSON.stringify(data));
    }

    function _ensureQuickOutSeeded() {
        if (!_loadQuickOuts()) {
            _saveQuickOuts(MOCK_QUICKOUTS);
        }
    }

    // ─── Helpers ─────────────────────────────────────────────────
    function _loadAll() {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    function _saveAll(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function _ensureSeeded() {
        if (!_loadAll()) {
            _saveAll(MOCK_LEAVE_REQUESTS);
        }
        if (!localStorage.getItem(PERSONNEL_KEY)) {
            localStorage.setItem(PERSONNEL_KEY, JSON.stringify(MOCK_PERSONNEL));
        }
        _ensureQuickOutSeeded();
    }

    function _generateId() {
        const year = new Date().getFullYear() + 543; // พ.ศ.
        const seq = String((_loadAll() || []).length + 1).padStart(3, '0');
        return `LV-${year}-${seq}`;
    }

    // ─── Public API ─────────────────────────────────────────────
    return {
        LEAVE_TYPES,
        STATUSES,
        PERSONNEL_TYPES,
        QUICKOUT_REASONS,

        /** Initialize with mock data if empty */
        init() {
            _ensureSeeded();
        },

        // ── CRUD ──

        /** Create a new leave request */
        createLeaveRequest({ personnelId, type, startDate, endDate, reason, attachments = [] }) {
            _ensureSeeded();
            const data = _loadAll();
            const start = new Date(startDate);
            const end = new Date(endDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

            const request = {
                id: _generateId(),
                personnelId,
                type,
                startDate,
                endDate,
                days,
                reason,
                attachments,
                status: 'PENDING',
                createdAt: new Date().toISOString()
            };
            data.push(request);
            _saveAll(data);
            return request;
        },

        /** Get all leave requests */
        getAll() {
            _ensureSeeded();
            return _loadAll();
        },

        /** Get leave requests for a specific person */
        getByPersonnel(personnelId) {
            return this.getAll().filter(r => r.personnelId === personnelId);
        },

        /** Get pending leave requests (for Director approval) */
        getPending() {
            return this.getAll().filter(r => r.status === 'PENDING');
        },

        /** Approve a leave request */
        approve(id, approverNote = '') {
            const data = _loadAll();
            const req = data.find(r => r.id === id);
            if (req) {
                req.status = 'APPROVED';
                req.approvedBy = '11111111-1111-4111-8111-111111111111';
                req.approvedDate = new Date().toISOString().split('T')[0];
                req.approverNote = approverNote;
                _saveAll(data);
            }
            return req;
        },

        /** Reject a leave request */
        reject(id, reason = '') {
            const data = _loadAll();
            const req = data.find(r => r.id === id);
            if (req) {
                req.status = 'REJECTED';
                req.approvedBy = '11111111-1111-4111-8111-111111111111';
                req.approvedDate = new Date().toISOString().split('T')[0];
                req.approverNote = reason;
                _saveAll(data);
            }
            return req;
        },

        // ── Quick Out (ออกธุระชั่วคราว) ──

        /** Clock out for quick errand */
        quickOutStart({ personnelId, reasonCode, reasonDetail }) {
            _ensureQuickOutSeeded();
            const data = _loadQuickOuts();
            const now = new Date();
            const record = {
                id: 'QO-' + String(data.length + 1).padStart(3, '0'),
                personnelId,
                reasonCode,
                reasonDetail,
                date: now.toISOString().split('T')[0],
                timeOut: now.toTimeString().slice(0, 5),
                timeIn: null,
                hours: null,
                status: 'OUT',
                createdAt: now.toISOString()
            };
            data.push(record);
            _saveQuickOuts(data);
            return record;
        },

        /** Clock back in from quick errand */
        quickOutEnd(id) {
            const data = _loadQuickOuts();
            const rec = data.find(r => r.id === id);
            if (rec && rec.status === 'OUT') {
                const now = new Date();
                rec.timeIn = now.toTimeString().slice(0, 5);
                const [hOut, mOut] = rec.timeOut.split(':').map(Number);
                const [hIn, mIn] = rec.timeIn.split(':').map(Number);
                rec.hours = Math.round(((hIn * 60 + mIn) - (hOut * 60 + mOut)) / 60 * 100) / 100;
                rec.status = 'COMPLETED';
                _saveQuickOuts(data);
            }
            return rec;
        },

        /** Get quick outs for a person */
        getQuickOutsByPersonnel(personnelId) {
            _ensureQuickOutSeeded();
            return _loadQuickOuts().filter(r => r.personnelId === personnelId);
        },

        /** Get all quick outs (for Director) */
        getAllQuickOuts() {
            _ensureQuickOutSeeded();
            return _loadQuickOuts();
        },

        /** Get Quick Out monthly summary for a person */
        getQuickOutSummary(personnelId) {
            const records = this.getQuickOutsByPersonnel(personnelId)
                .filter(r => r.status === 'COMPLETED');
            const thisMonth = new Date().getMonth();
            const thisYear = new Date().getFullYear();
            const monthRecords = records.filter(r => {
                const d = new Date(r.date);
                return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
            });
            return {
                totalTrips: records.length,
                totalHours: Math.round(records.reduce((s, r) => s + (r.hours || 0), 0) * 100) / 100,
                monthTrips: monthRecords.length,
                monthHours: Math.round(monthRecords.reduce((s, r) => s + (r.hours || 0), 0) * 100) / 100,
                activeOut: this.getQuickOutsByPersonnel(personnelId).find(r => r.status === 'OUT') || null
            };
        },

        // ── Stats ──

        /** Get leave balance for a person */
        getLeaveBalance(personnelId) {
            const requests = this.getByPersonnel(personnelId)
                .filter(r => r.status === 'APPROVED');
            const balance = {};
            for (const [code, type] of Object.entries(LEAVE_TYPES)) {
                const used = requests
                    .filter(r => r.type === code)
                    .reduce((sum, r) => sum + r.days, 0);
                balance[code] = {
                    ...type,
                    used,
                    remaining: type.maxDaysPerYear - used
                };
            }
            return balance;
        },

        /** Get attendance summary for today (all personnel groups) */
        getAttendanceSummary() {
            return MOCK_ATTENDANCE_TODAY;
        },

        /** Get total attendance across all groups */
        getAttendanceTotals() {
            const s = MOCK_ATTENDANCE_TODAY.summary;
            const totals = { total: 0, present: 0, leave: 0, absent: 0, late: 0 };
            for (const group of Object.values(s)) {
                totals.total += group.total;
                totals.present += group.present;
                totals.leave += group.leave;
                totals.absent += group.absent;
                totals.late += group.late;
            }
            return totals;
        },

        // ── Personnel ──

        /** Get all personnel */
        getPersonnel() {
            _ensureSeeded();
            return JSON.parse(localStorage.getItem(PERSONNEL_KEY));
        },

        /** Get personnel by ID */
        getPersonnelById(id) {
            return this.getPersonnel().find(p => p.id === id);
        },

        /** Get leave type guide info */
        getLeaveGuide(typeCode) {
            return LEAVE_TYPES[typeCode]?.guide || null;
        },

        /** Get all leave type guides */
        getAllLeaveGuides() {
            return Object.values(LEAVE_TYPES).map(t => ({
                code: t.code,
                name: t.name,
                icon: t.icon,
                color: t.color,
                maxDays: t.maxDaysPerYear,
                ...t.guide
            }));
        },

        /** Get pending count for badge display */
        getPendingCount() {
            return this.getPending().length;
        }
    };
})();

// Auto-init
if (typeof window !== 'undefined') {
    window.LeaveService = LeaveService;
    LeaveService.init();
}

