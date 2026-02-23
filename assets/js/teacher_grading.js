/**
 * E-OS — Teacher Grading Engine
 * ตรวจงานนักเรียน: Dashboard + Review Panel + Override
 */

const TeacherGrading = {

    currentFilter: 'all',
    activeSubmissionId: null,

    // ── Mock Submissions Data ──────────────────────────────────────
    // In production: fetched from InsForge via ManagementEngine
    submissions: [
        {
            id: 'SUB_001',
            studentId: 'STU_001',
            studentName: 'ด.ช. ติณณภพ เกตุแก้ว',
            studentAvatar: 'ติณ',
            subjectName: 'ประวัติศาสตร์',
            subjectIcon: 'i-library',
            subjectColor: '#c084fc',
            lessonName: 'ความหมายและที่มาของศักราช',
            stepType: 'REFLECT',
            stepNumber: 5,
            answer: 'พุทธศักราช หรือ พ.ศ. เริ่มนับตั้งแต่พระพุทธเจ้าเสด็จดับขันธปรินิพพาน โดยนับปีแรกเป็น พ.ศ. 1 ส่วนคริสต์ศักราช เริ่มนับจากปีที่พระเยซูประสูติ ศักราชมีความสำคัญเพราะช่วยให้เราระบุเวลาของเหตุการณ์ในอดีตได้ชัดเจน และสามารถเปรียบเทียบเหตุการณ์ในประวัติศาสตร์ของแต่ละชาติได้',
            aiScore: 78,
            aiReason: 'พบ keyword 4/5 (พุทธศักราช, คริสต์ศักราช, ปรินิพพาน, เปรียบเทียบ), ความยาวเพียงพอ, มีการอ้างอิงเชิงเหตุผล',
            question: 'อธิบายความหมายของศักราชและยกตัวอย่างศักราชที่ใช้ในปัจจุบัน',
            rubric: [
                { criterion: 'กล่าวถึงศักราชอย่างน้อย 2 ชนิด', maxScore: 3, description: 'นักเรียนสามารถบอกชื่อศักราชได้อย่างน้อย 2 ชนิด เช่น พ.ศ., ค.ศ., ม.ศ., ฮ.ศ.' },
                { criterion: 'อธิบายที่มาของศักราชได้', maxScore: 3, description: 'นักเรียนสามารถอธิบายจุดเริ่มต้นของศักราชนั้นๆ ได้ถูกต้อง เช่น พ.ศ. นับจากปรินิพพาน' },
                { criterion: 'เชื่อมโยงกับชีวิตจริง', maxScore: 4, description: 'นักเรียนสามารถยกตัวอย่างการใช้ศักราชในชีวิตจริงได้ เช่น บัตรประชาชน ปฏิทิน หรือเอกสารราชการ' },
            ],
            totalScore: 10,
            submittedAt: '2026-02-18T05:30:00+07:00',
            teacherReview: null, // ยังไม่ตรวจ
        },
        {
            id: 'SUB_002',
            studentId: 'STU_001',
            studentName: 'ด.ช. ติณณภพ เกตุแก้ว',
            studentAvatar: 'ติณ',
            subjectName: 'ประวัติศาสตร์',
            subjectIcon: 'i-library',
            subjectColor: '#c084fc',
            lessonName: 'ความหมายและที่มาของศักราช',
            stepType: 'MASTER',
            stepNumber: 7,
            answer: 'สถานการณ์: ถ้าเราเห็นจารึกที่เขียนว่า ม.ศ. ​1205 และต้องบอกเป็น พ.ศ. — ผมคิดว่าต้องเอา ม.ศ. บวก 621 จะได้ พ.ศ. 1826 เพราะมหาศักราชเริ่มนับก่อนพุทธศักราช 621 ปี ซึ่งตรงกับสมัยสุโขทัย เหตุการณ์ที่เกิดขึ้นในช่วงนี้อาจเป็นเรื่องของพ่อขุนรามคำแหงที่ประดิษฐ์อักษรไทย',
            aiScore: 85,
            aiReason: 'พบ keyword 5/5, คำนวณเทียบศักราชถูกต้อง, มีการวิเคราะห์เชิงประวัติศาสตร์',
            question: 'สถานการณ์: คุณพบจารึกโบราณที่ระบุ ม.ศ. 1205 จงเทียบเป็น พ.ศ. และบอกว่าตรงกับเหตุการณ์สำคัญใดในประวัติศาสตร์ไทย',
            rubric: [
                { criterion: 'เทียบศักราชถูกต้อง', maxScore: 4, description: 'นักเรียนใช้สูตรเทียบ ม.ศ. → พ.ศ. ได้ถูกต้อง (ม.ศ. + 621 = พ.ศ.)' },
                { criterion: 'วิเคราะห์เหตุการณ์ทางประวัติศาสตร์', maxScore: 3, description: 'สามารถระบุเหตุการณ์สำคัญในช่วงเวลานั้นได้ ไม่จำเป็นต้องแม่นยำ 100% แต่ต้องอยู่ในยุคสมัยที่ถูกต้อง' },
                { criterion: 'ใช้เหตุผลและหลักฐานประกอบ', maxScore: 3, description: 'นักเรียนอธิบายวิธีคิด แสดงกระบวนการเทียบศักราช ไม่ใช่ตอบลอยๆ' },
            ],
            totalScore: 10,
            submittedAt: '2026-02-18T05:45:00+07:00',
            teacherReview: null,
        },
        {
            id: 'SUB_003',
            studentId: 'STU_002',
            studentName: 'ด.ญ. ปลายฟ้า จันทะคุณ',
            studentAvatar: 'ปล',
            subjectName: 'ประวัติศาสตร์',
            subjectIcon: 'i-library',
            subjectColor: '#c084fc',
            lessonName: 'ความหมายและที่มาของศักราช',
            stepType: 'REFLECT',
            stepNumber: 5,
            answer: 'ศักราชเป็นระบบการนับปีเพื่อใช้อ้างอิงในทางประวัติศาสตร์ ถ้าไม่มีศักราชเราจะไม่สามารถรู้ว่าเหตุการณ์เกิดขึ้นเมื่อไร ในประเทศไทยเราใช้พุทธศักราช',
            aiScore: 55,
            aiReason: 'พบ keyword 2/5 (พุทธศักราช, ประวัติศาสตร์), คำตอบสั้นเกินไป, ขาดตัวอย่างประกอบ',
            question: 'อธิบายความหมายของศักราชและยกตัวอย่างศักราชที่ใช้ในปัจจุบัน',
            rubric: [
                { criterion: 'กล่าวถึงศักราชอย่างน้อย 2 ชนิด', maxScore: 3, description: 'นักเรียนสามารถบอกชื่อศักราชได้อย่างน้อย 2 ชนิด เช่น พ.ศ., ค.ศ., ม.ศ., ฮ.ศ.' },
                { criterion: 'อธิบายที่มาของศักราชได้', maxScore: 3, description: 'นักเรียนสามารถอธิบายจุดเริ่มต้นของศักราชนั้นๆ ได้ถูกต้อง เช่น พ.ศ. นับจากปรินิพพาน' },
                { criterion: 'เชื่อมโยงกับชีวิตจริง', maxScore: 4, description: 'นักเรียนสามารถยกตัวอย่างการใช้ศักราชในชีวิตจริงได้ เช่น บัตรประชาชน ปฏิทิน หรือเอกสารราชการ' },
            ],
            totalScore: 10,
            submittedAt: '2026-02-18T06:10:00+07:00',
            teacherReview: {
                score: 5,
                comment: 'ตอบได้แต่ยังไม่ครบถ้วน ควรยกตัวอย่างศักราชเพิ่มอย่างน้อยอีก 1 ชนิด และอธิบายที่มาให้ชัดเจน',
                reviewedBy: 'TEA_001',
                reviewedAt: '2026-02-18T06:20:00+07:00',
                aiScore: 55,
            },
        },
    ],

    // ── Init ───────────────────────────────────────────────────────
    init(filter = 'all') {
        this.currentFilter = filter;
        this.updateFilterUI();
        this.renderSubmissions();
        this.updateStats();
    },

    // ── Filter ─────────────────────────────────────────────────────
    setFilter(filter) {
        this.currentFilter = filter;
        this.activeSubmissionId = null;
        document.getElementById('review-panel').classList.add('hidden');
        this.updateFilterUI();
        this.renderSubmissions();
    },

    updateFilterUI() {
        document.querySelectorAll('.grading-filter').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`filter-${this.currentFilter}`);
        if (activeBtn) activeBtn.classList.add('active');
    },

    getFilteredSubmissions() {
        if (this.currentFilter === 'pending') {
            return this.submissions.filter(s => !s.teacherReview);
        }
        if (this.currentFilter === 'reviewed') {
            return this.submissions.filter(s => s.teacherReview);
        }
        return this.submissions;
    },

    updateStats() {
        const pending = this.submissions.filter(s => !s.teacherReview).length;
        const reviewed = this.submissions.filter(s => s.teacherReview).length;
        document.getElementById('count-pending').textContent = pending;
        document.getElementById('count-reviewed').textContent = reviewed;
    },

    // ── Render Submissions List ────────────────────────────────────
    renderSubmissions() {
        const container = document.getElementById('submissions-list');
        const items = this.getFilteredSubmissions();

        if (items.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center h-40 opacity-30">
                    <i class="icon i-clipboard-check h-8 w-8 mb-2"></i>
                    <span class="text-[13px] font-light Thai-Rule">${this.currentFilter === 'pending' ? 'ไม่มีงานรอตรวจ' : this.currentFilter === 'reviewed' ? 'ยังไม่มีงานที่ตรวจแล้ว' : 'ยังไม่มีงานนักเรียน'}</span>
                </div>`;
            return;
        }

        container.innerHTML = items.map(sub => {
            const isPending = !sub.teacherReview;
            const finalScore = sub.teacherReview ? sub.teacherReview.score : sub.aiScore;
            const statusBadge = isPending
                ? `<span class="px-2 py-0.5 rounded-[3px] text-[13px] font-light bg-[rgba(251,191,36,0.15)] text-amber-400 border border-[rgba(251,191,36,0.3)]">AI ตรวจ</span>`
                : `<span class="px-2 py-0.5 rounded-[3px] text-[13px] font-light bg-[rgba(52,211,153,0.15)] text-emerald-400 border border-[rgba(52,211,153,0.3)]">ครูตรวจแล้ว</span>`;

            const stepBadge = sub.stepType === 'REFLECT'
                ? `<span class="hud-badge-micro bg-[rgba(168,85,247,0.2)] text-purple-400 px-2 py-0.5 rounded-[3px]">STEP ${sub.stepNumber}: REFLECT</span>`
                : `<span class="hud-badge-micro bg-[rgba(255,193,7,0.2)] text-amber-400 px-2 py-0.5 rounded-[3px]">STEP ${sub.stepNumber}: MASTER</span>`;

            const scoreColor = finalScore >= 80 ? 'text-emerald-400' : finalScore >= 60 ? 'text-amber-400' : 'text-rose-400';

            const timeAgo = this.getTimeAgo(sub.submittedAt);

            const isActive = this.activeSubmissionId === sub.id;

            return `
            <div class="submission-card ${isActive ? 'active-review' : ''} p-5 rounded-[3px] bg-[var(--vs-bg-card)] border border-[rgba(63,63,70,0.5)] cursor-pointer"
                 onclick="TeacherGrading.openReview('${sub.id}')">
                <div class="flex items-center gap-4">
                    <!-- Avatar -->
                    <div class="w-10 h-10 rounded-[3px] bg-[rgba(var(--vs-accent-rgb),0.15)] flex items-center justify-center text-[13px] font-light text-[var(--vs-accent)] flex-shrink-0">
                        ${sub.studentAvatar}
                    </div>

                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-[13px] font-light text-[var(--vs-text-title)] Thai-Rule">${sub.studentName}</span>
                            ${stepBadge}
                        </div>
                        <div class="flex items-center gap-2 text-[13px] font-light text-[var(--vs-text-muted)] Thai-Rule">
                            <i class="icon ${sub.subjectIcon} h-3 w-3" style="color:${sub.subjectColor}"></i>
                            <span>${sub.subjectName}</span>
                            <span class="text-[var(--vs-border)]">|</span>
                            <span class="truncate">${sub.lessonName}</span>
                        </div>
                    </div>

                    <!-- Score -->
                    <div class="text-right flex-shrink-0">
                        <div class="text-xl font-light ${scoreColor}">${sub.teacherReview ? sub.teacherReview.score : sub.aiScore}${sub.teacherReview ? `<span class="text-[13px]">/${sub.totalScore}</span>` : `<span class="text-[13px]">%</span>`}</div>
                        <div class="text-[13px] font-light text-[var(--vs-text-muted)]">${timeAgo}</div>
                    </div>

                    <!-- Status -->
                    <div class="flex-shrink-0">
                        ${statusBadge}
                    </div>
                </div>
            </div>`;
        }).join('');
    },

    // ── Open Review Panel ──────────────────────────────────────────
    openReview(submissionId) {
        const sub = this.submissions.find(s => s.id === submissionId);
        if (!sub) return;

        this.activeSubmissionId = submissionId;
        this.renderSubmissions(); // Re-render to highlight active

        const panel = document.getElementById('review-panel');
        panel.classList.remove('hidden');

        const existingReview = sub.teacherReview;
        const currentScore = existingReview ? existingReview.score : '';
        const currentComment = existingReview ? existingReview.comment : '';

        panel.innerHTML = `
        <div class="p-6 rounded-[3px] bg-[var(--vs-bg-panel)] border border-[rgba(63,63,70,0.5)] space-y-6">

            <!-- Header -->
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-[3px] bg-[rgba(var(--vs-accent-rgb),0.15)] flex items-center justify-center text-[13px] text-[var(--vs-accent)]">
                        ${sub.studentAvatar}
                    </div>
                    <div>
                        <h2 class="text-base font-light text-[var(--vs-text-title)] Thai-Rule">${sub.studentName}</h2>
                        <div class="text-[13px] font-light text-[var(--vs-text-muted)] Thai-Rule">${sub.subjectName} — ${sub.lessonName}</div>
                    </div>
                </div>
                <button onclick="TeacherGrading.closeReview()" class="p-2 rounded-[3px] hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                    <i class="icon i-x h-5 w-5 text-[var(--vs-text-muted)]"></i>
                </button>
            </div>

            <!-- Grid: Answer + Rubric -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <!-- Left: Student Answer + AI Score -->
                <div class="space-y-4">

                    <!-- Question -->
                    <div class="p-4 rounded-[3px] bg-[var(--vs-bg-deep)] border border-[rgba(63,63,70,0.5)]">
                        <div class="hud-badge-micro text-[var(--vs-accent)] mb-2 uppercase">QUESTION</div>
                        <p class="text-[13px] font-light text-[var(--vs-text-body)] Thai-Rule">${sub.question}</p>
                    </div>

                    <!-- Student Answer -->
                    <div class="p-4 rounded-[3px] bg-[var(--vs-bg-deep)] border border-[rgba(63,63,70,0.5)]">
                        <div class="hud-badge-micro text-purple-400 mb-2 uppercase">คำตอบนักเรียน</div>
                        <p class="text-[13px] font-light text-[var(--vs-text-body)] Thai-Rule leading-relaxed">${sub.answer}</p>
                    </div>

                    <!-- AI Score -->
                    <div class="p-4 rounded-[3px] bg-[rgba(var(--vs-accent-rgb),0.05)] border border-[rgba(var(--vs-accent-rgb),0.2)]">
                        <div class="flex items-center justify-between mb-2">
                            <div class="hud-badge-micro text-[var(--vs-accent)] uppercase">AI SCORE</div>
                            <div class="text-xl font-light text-[var(--vs-accent)]">${sub.aiScore}%</div>
                        </div>
                        <p class="text-[13px] font-light text-[var(--vs-text-muted)] Thai-Rule">${sub.aiReason}</p>
                    </div>
                </div>

                <!-- Right: Rubric + Teacher Override -->
                <div class="space-y-4">

                    <!-- Rubric -->
                    <div class="p-4 rounded-[3px] bg-[var(--vs-bg-deep)] border border-[rgba(63,63,70,0.5)]">
                        <div class="hud-badge-micro text-amber-400 mb-3 uppercase">เกณฑ์การให้คะแนน (RUBRIC)</div>
                        <div class="space-y-3">
                            ${sub.rubric.map((r, i) => `
                                <div class="p-3 rounded-[3px] bg-[rgba(255,255,255,0.02)] border border-[rgba(63,63,70,0.5)]">
                                    <div class="flex items-center justify-between mb-1">
                                        <span class="text-[13px] font-light text-[var(--vs-text-title)] Thai-Rule">${r.criterion}</span>
                                        <span class="hud-badge-micro text-amber-400">${r.maxScore} คะแนน</span>
                                    </div>
                                    <p class="text-[13px] font-light text-[var(--vs-text-muted)] Thai-Rule">${r.description}</p>
                                </div>
                            `).join('')}
                            <div class="flex items-center justify-end pt-2 border-t border-[rgba(63,63,70,0.5)]">
                                <span class="text-[13px] font-light text-[var(--vs-text-muted)]">คะแนนเต็ม: </span>
                                <span class="text-base font-light text-[var(--vs-text-title)] ml-1">${sub.totalScore}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Teacher Override -->
                    <div class="p-4 rounded-[3px] bg-[rgba(52,211,153,0.05)] border border-[rgba(52,211,153,0.2)]">
                        <div class="hud-badge-micro text-emerald-400 mb-3 uppercase">ให้คะแนนโดยครู (OVERRIDE)</div>

                        <div class="space-y-3">
                            <!-- Score Input -->
                            <div>
                                <label class="text-[13px] font-light text-[var(--vs-text-muted)] Thai-Rule mb-1 block">คะแนนที่ครูให้</label>
                                <div class="flex items-center gap-2">
                                    <input type="number" id="teacher-score" min="0" max="${sub.totalScore}" step="1"
                                        value="${currentScore}"
                                        placeholder="0"
                                        class="w-24 px-3 py-2 rounded-[3px] bg-[var(--vs-bg-deep)] border-none text-[var(--vs-text-title)] text-center text-lg font-light focus:ring-1 focus:ring-[var(--vs-accent)] outline-none transition-all" />
                                    <span class="text-[13px] font-light text-[var(--vs-text-muted)]">/ ${sub.totalScore}</span>
                                </div>
                            </div>

                            <!-- Comment Input -->
                            <div>
                                <label class="text-[13px] font-light text-[var(--vs-text-muted)] Thai-Rule mb-1 block">ความเห็นครู</label>
                                <textarea id="teacher-comment" rows="3"
                                    placeholder="เขียนคำแนะนำ ข้อเสนอแนะ หรือเหตุผลที่ให้คะแนน..."
                                    class="w-full px-3 py-2 rounded-[3px] bg-[var(--vs-bg-deep)] border-none text-[13px] font-light text-[var(--vs-text-body)] Thai-Rule focus:ring-1 focus:ring-[var(--vs-accent)] outline-none transition-all resize-none">${currentComment}</textarea>
                            </div>

                            <!-- Save Button -->
                            <button onclick="TeacherGrading.saveOverride('${sub.id}')"
                                class="w-full py-3 rounded-[3px] bg-[rgba(52,211,153,0.2)] border border-[rgba(52,211,153,0.4)] text-emerald-400 hover:bg-[rgba(52,211,153,0.3)] transition-colors text-[13px] font-light uppercase">
                                <i class="icon i-check h-4 w-4 inline-block mr-1"></i>
                                ${existingReview ? 'อัปเดตคะแนน' : 'บันทึกคะแนนครู'}
                            </button>
                        </div>
                    </div>

                    ${existingReview ? `
                    <!-- Previous Review Info -->
                    <div class="p-3 rounded-[3px] bg-[rgba(255,255,255,0.02)] border border-[rgba(63,63,70,0.5)]">
                        <div class="text-[13px] font-light text-[var(--vs-text-muted)] Thai-Rule">
                            ตรวจล่าสุดโดย ${existingReview.reviewedBy} เมื่อ ${this.formatDate(existingReview.reviewedAt)}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>`;

        // Smooth scroll to review panel
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },

    // ── Close Review ───────────────────────────────────────────────
    closeReview() {
        this.activeSubmissionId = null;
        document.getElementById('review-panel').classList.add('hidden');
        this.renderSubmissions();
    },

    // ── Save Override ──────────────────────────────────────────────
    saveOverride(submissionId) {
        const sub = this.submissions.find(s => s.id === submissionId);
        if (!sub) return;

        const scoreInput = document.getElementById('teacher-score');
        const commentInput = document.getElementById('teacher-comment');

        const score = parseInt(scoreInput.value);
        const comment = commentInput.value.trim();

        // Validation
        if (isNaN(score) || score < 0 || score > sub.totalScore) {
            this.showToast('กรุณาใส่คะแนนที่ถูกต้อง (0-' + sub.totalScore + ')', 'warning');
            scoreInput.focus();
            return;
        }

        if (comment.length < 5) {
            this.showToast('กรุณาเขียนความเห็นอย่างน้อย 5 ตัวอักษร', 'warning');
            commentInput.focus();
            return;
        }

        // Get teacher info
        let teacherId = 'TEA_001';
        try {
            const user = parent?.window?.getCurrentUser?.() || window.getCurrentUser?.();
            if (user) teacherId = user.id;
        } catch (e) { /* ignore */ }

        // Save review
        sub.teacherReview = {
            score: score,
            comment: comment,
            reviewedBy: teacherId,
            reviewedAt: new Date().toISOString(),
            aiScore: sub.aiScore,
        };

        // TODO: In production — save to InsForge via ManagementEngine
        // ManagementEngine.saveTeacherReview(submissionId, sub.teacherReview);

        this.showToast('บันทึกคะแนนเรียบร้อย ✅', 'success');
        this.updateStats();
        this.renderSubmissions();
        this.openReview(submissionId); // Re-render review panel with updated data
    },

    // ── Toast (uses parent HUD_NOTIFY if available) ────────────────
    showToast(message, type = 'accent') {
        try {
            const notify = parent?.window?.HUD_NOTIFY || window.HUD_NOTIFY;
            if (notify) {
                notify.toast(type === 'success' ? 'สำเร็จ' : type === 'warning' ? 'แจ้งเตือน' : 'ข้อมูล', message, type);
                return;
            }
        } catch (e) { /* ignore */ }

        // Fallback: simple alert
        console.warn('Toast Fallback:', message);
    },

    // ── Utilities ──────────────────────────────────────────────────
    getTimeAgo(dateStr) {
        const now = new Date();
        const then = new Date(dateStr);
        const diffMs = now - then;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'เมื่อสักครู่';
        if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
        if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
        return `${diffDays} วันที่แล้ว`;
    },

    formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    },
};
