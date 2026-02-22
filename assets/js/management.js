/**
 * IDLPMS Management Hub - Coordinator
 * =====================================
 * Orchestrates the specialized learning engines:
 * - QuizEngine (State & Progression)
 * - DNAHarvester (Intelligence Harvesting)
 * - AIAuditor (Semantic Analysis)
 * - SecurityEngine (Anti-Guessing)
 */

const ManagementEngineCoordinator = {
    // These will be wired to the global instances created by individual scripts
    get ai() { return window.MasteryAIAuditor; },
    get dna() { return window.DNAHarvester; },
    get quiz() { return window.QuizEngine; },
    get security() { return window.SecurityEngine; },

    init() {
        console.log('Management Coordinator Initializing...');
        // Component initialization handled by individual scripts
    }
};

window.ManagementEngine = {
    activeModule: 'OVERVIEW',
    currentStep: 1,
    videoWatchedPercent: 0,
    startTime: Date.now(),
    lastStepTime: Date.now(),
    currentLessonIndex: 0,
    currentQuestionIndex: 0,
    dnaHistory: {}, // { subjectId: [{ k, p, a, f }] }

    // Fail Protocol & Rewind State
    isRewindCoolingDown: false,
    failData: null, // { score, required, reason, failedStep }
    rewindCountdown: 0,

    // Core Curriculum Groups (กลุ่มสาระการเรียนรู้ 8 กลุ่ม)
    curriculumGroups: {
        THAI: {
            name: 'ภาษาไทย',
            icon: 'i-book',
            color: 'var(--sj-thai)',
            bg: 'rgba(var(--sj-thai-rgb), 0.1)',
            border: 'rgba(var(--sj-thai-rgb), 0.2)',
        },
        MATH: {
            name: 'คณิตศาสตร์',
            icon: 'i-calculator',
            color: 'var(--sj-math)',
            bg: 'rgba(var(--sj-math-rgb), 0.1)',
            border: 'rgba(var(--sj-math-rgb), 0.2)',
        },
        SCI: {
            name: 'วิทยาศาสตร์',
            icon: 'i-beaker',
            color: 'var(--sj-sci)',
            bg: 'rgba(var(--sj-sci-rgb), 0.1)',
            border: 'rgba(var(--sj-sci-rgb), 0.2)',
        },
        SOC: {
            name: 'สังคมศึกษา',
            icon: 'i-globe',
            color: 'var(--sj-soc)',
            bg: 'rgba(var(--sj-soc-rgb), 0.1)',
            border: 'rgba(var(--sj-soc-rgb), 0.2)',
        },
        HIST: {
            name: 'ประวัติศาสตร์',
            icon: 'i-library',
            color: 'var(--sj-hist)',
            bg: 'rgba(var(--sj-hist-rgb), 0.1)',
            border: 'rgba(var(--sj-hist-rgb), 0.2)',
        },
        PE: {
            name: 'สุขศึกษา',
            icon: 'i-heart',
            color: 'var(--sj-pe)',
            bg: 'rgba(var(--sj-pe-rgb), 0.1)',
            border: 'rgba(var(--sj-pe-rgb), 0.2)',
        },
        ART: {
            name: 'ศิลปะ',
            icon: 'i-swatch',
            color: 'var(--sj-art)',
            bg: 'rgba(var(--sj-art-rgb), 0.1)',
            border: 'rgba(var(--sj-art-rgb), 0.2)',
        },
        WORK: {
            name: 'การงานอาชีพ',
            icon: 'i-cog',
            color: 'var(--sj-work)',
            bg: 'rgba(var(--sj-work-rgb), 0.1)',
            border: 'rgba(var(--sj-work-rgb), 0.2)',
        },
        ENG: {
            name: 'ภาษาต่างประเทศ',
            icon: 'i-chat',
            color: 'var(--sj-eng)',
            bg: 'rgba(var(--sj-eng-rgb), 0.1)',
            border: 'rgba(var(--sj-eng-rgb), 0.2)',
        },
        ACTIVITIES: {
            name: 'กิจกรรมพัฒนาผู้เรียน',
            icon: 'i-user-group',
            color: 'var(--vs-text-muted)',
            bg: 'rgba(255,255,255,0.05)',
            border: 'var(--vs-border)',
        },
    },

    // Neural DNA Matrix (5-Axis KPA+ Model: K, P, A, E, D)
    neuralMatrix: {
        'K': 84,  // Knowledge (ความรู้)
        'P': 78,  // Process/Skill (กระบวนการ/ทักษะ)
        'A': 92,  // Attitude (เจตคติ)
        'E': 88,  // Effort (ความพยายาม)
        'D': 90,  // Discipline (วินัย)
    },


    // 8 Thai Desirable Characteristics (Behavioral Matrix)
    characteristics: {
        PATRIOTISM: 95,
        INTEGRITY: 88,
        DISCIPLINE: 92,
        LEARNING: 85,
        SUFFICIENCY: 90,
        COMMITMENT: 87,
        THAINESS: 94,
        PUBLIC_MIND: 89,
    },

    // 7 Steps Mastery Flow (IDLPMS Learning Model)
    masterySteps: [
        {
            id: 'KNOW',
            label: 'Know',
            labelTH: 'รู้จักตัวเอง',
            meta: 'Pre-test',
            description: 'ทำ Pre-test 5 ข้อ เพื่อวัดความรู้เดิม',
            passCondition: 'complete',
            icon: 'i-clipboard-check',
        },
        {
            id: 'LINK',
            label: 'Link',
            labelTH: 'เชื่อมโยง',
            meta: 'KPA Objectives',
            description: 'เรียนรู้จุดประสงค์ K-P-A ของบทเรียน',
            passCondition: 'acknowledge',
            icon: 'i-link',
        },
        {
            id: 'DO',
            label: 'Do',
            labelTH: 'ลงมือเรียน',
            meta: 'Video + Content',
            description: 'ดู Video (DLTV) + อ่านสรุป + Infographic',
            passCondition: 'video>=25%',
            icon: 'i-play',
        },
        {
            id: 'SYNC',
            label: 'Sync',
            labelTH: 'เชื่อมความรู้',
            meta: 'Integration',
            description: 'Fill-in / Drag-drop / Match',
            passCondition: 'score>=80%',
            icon: 'i-squares',
        },
        {
            id: 'REFLECT',
            label: 'Reflect',
            labelTH: 'ฝึกฝน',
            meta: 'Practice',
            description: 'แบบฝึกหัด / ใบงาน',
            passCondition: 'score>=70%',
            icon: 'i-document-check',
        },
        {
            id: 'PROVE',
            label: 'Prove',
            labelTH: 'พิสูจน์',
            meta: 'Post-test',
            description: 'Post-test 5 ข้อ + Self-rating',
            passCondition: 'score>=70%',
            icon: 'i-shield',
        },
        {
            id: 'MASTER',
            label: 'Master',
            labelTH: 'เชี่ยวชาญ',
            meta: 'Challenge',
            description: 'Mastery Challenge',
            passCondition: 'score>=80%',
            icon: 'i-academic',
        },
    ],

    // Anti-Guessing System Configuration
    antiGuessing: {
        // Minimum time per question (seconds)
        minTimePerQuestion: {
            short: 5, // ปรนัยสั้น
            long: 10, // ปรนัยยาว/มีรูป
            matching: 15, // จับคู่/เรียงลำดับ
            fillIn: 8, // เติมคำ
        },
        // Wrong streak penalty
        wrongStreakPenalty: {
            2: { action: 'warning', message: 'ลองอ่านทบทวนอีกครั้งนะ' },
            3: { action: 'lockout', duration: 30, showSummary: true },
            4: { action: 'lockout', duration: 60, showVideoHint: true },
            5: { action: 'lockout', duration: 120, suggestReview: true },
        },
        // Retry cooldown (minutes)
        retryCooldown: {
            1: 0, // ครั้งแรก: ทำได้เลย
            2: 5, // ครั้งที่ 2: รอ 5 นาที
            3: 15, // ครั้งที่ 3: รอ 15 นาที
            4: 30, // ครั้งที่ 4: รอ 30 นาที
            5: 60, // ครั้งที่ 5+: รอ 1 ชั่วโมง
        },
        // Pattern detection
        patternDetection: {
            sameAnswerStreak: 5, // ตอบคำตอบเดียวกัน 5 ครั้ง
            cyclicPattern: true, // ตรวจจับ ก ข ค ง ก ข ค ง
            uniformTiming: true, // ตรวจจับเวลาตอบเท่ากันหมด
        },
        // 7-Step Specific Behavior Rules
        stepBehavior: {
            KNOW: {
                // Pre-test: ตรวจจับการกดมัว่
                minTimePerQ: 5,
                maxSpeedWarning: true,
                patternCheck: true,
            },
            LINK: {
                // Objectives: ต้องอ่านจริง
                minViewTime: 15, // 15 วินาทีขั้นต่ำ
                scrollRequired: false,
            },
            DO: {
                // Video: ต้องดูจริง
                minWatchPercent: 25,
                tabSwitchPenalty: true,
                pauseTooLongWarning: 120, // 2 นาที
            },
            SYNC: {
                // Integration: ต้องคิด
                minTimePerActivity: 10,
                randomOrderRequired: true,
            },
            REFLECT: {
                // Practice: ต้องฝึก
                minTimePerQ: 8,
                hintUsagePenalty: true,
            },
            PROVE: {
                // Post-test: เปรียบเทียบกับ Pre-test
                compareWithPretest: true,
                identicalAnswerFlag: true,
                minTimePerQ: 5,
            },
            MASTER: {
                // Challenge: ยากที่สุด
                minTimePerQ: 15,
                noHintsAllowed: true,
                strictPatternCheck: true,
            },
        },
    },



    // Current quiz state for anti-guessing
    quizState: {
        wrongStreak: 0,
        retryCount: 0,
        lastRetryTime: null,
        answerHistory: [],
        timeHistory: [],
        isLocked: false,
        lockEndTime: null,
    },

    // Step Timing for 8 Characteristics Assessment
    stepTiming: {
        stepStartTime: null,
        stepTimes: {}, // { stepId: { duration: ms, score: 0-100 } }
        lessonStartTime: null,
        totalLessonTime: 0,
        pretestAnswers: [], // Store answers separately for comparison with posttest
        posttestAnswers: [],
        // New Neural Buffer for Intelligent DNA Harvesting (Unity Core 6)
        neuralBuffer: {
            K: [], P: [], A: [], F: [], L: [], M: []
        }
    },

    /**
     * Smart Video URL Router
     * Routes DLTV URLs through Netlify proxy to bypass CORS
     * YouTube and other sources are left untouched
     * @param {string} url - Original video URL
     * @returns {string} - Proxied URL for DLTV, original URL otherwise
     */
    getSmartVideoUrl(url) {
        if (!url) return url;

        try {
            const currentUrl = new URL(window.location.href);
            const targetUrl = new URL(url);
            const hostname = targetUrl.hostname.toLowerCase();

            // Check if DLTV domain
            if (hostname.includes('dltv.ac.th')) {
                // Determine environment
                const isLocalFile = window.location.protocol === 'file:';
                const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
                const isNetlifyDev = window.location.port === '8888';

                // 1. If running via Netlify Dev (Standard)
                if (isNetlifyDev) {
                    const proxyBase = '/.netlify/functions/dltv-proxy';
                    console.info('[DLTV Proxy] Netlify Dev detected. Routing through proxy.');
                    return `${proxyBase}?url=${encodeURIComponent(url)}`;
                }

                // 2. If running on other localhost ports (e.g., 3333 as seen in troubleshooting)
                // We attempt to use the proxy path, but warn the user if it's likely to fail
                if (isLocalhost) {
                    const proxyBase = '/.netlify/functions/dltv-proxy';
                    console.warn(`[DLTV Proxy] Running on localhost:${window.location.port}. Proxy will ONLY work if you started with 'netlify dev'.`);
                    return `${proxyBase}?url=${encodeURIComponent(url)}`;
                }

                // 3. Fallback for Local File (file://) - Cannot use relative proxy paths
                if (isLocalFile) {
                    console.info('[DLTV Proxy] Dev mode (file://) - using direct URL. CORS extension required.');
                    return url;
                }

                // 4. Production (Deployed on Netlify)
                const proxyBase = '/api/dltv-proxy';
                return `${proxyBase}?url=${encodeURIComponent(url)}`;
            }

            // YouTube and other sources - return as-is
            return url;

        } catch (e) {
            console.warn('[DLTV Proxy] URL parse error:', e);
            return url;
        }
    },

    /**
     * Show Netlify Technical Guide
     * Opens the guide for solving CORS issues using Netlify Dev
     */
    showNetlifyGuide() {
        window.open('./NETLIFY_GUIDE.md', '_blank');
    },

    init() {
        console.log('Mission Control [IDLPMS 7-Step Learning] Initialized...');
        this.resetNeuralBuffer(); // Initialize buffer
        this.setupFocusGuard();
        this.setupAntiGuessing();
        this.initDNAObserver(); // 🧬 Activate Unity Signal Harvesting

        // Auto-Collapse Protocol: Close dropdown when clicking outside
        const handleOutsideClick = (e) => {
            const selector = document.getElementById('lesson-selector-dropdown')
                || window.frames['main-frame']?.contentDocument?.getElementById('lesson-selector-dropdown');

            if (selector && !selector.classList.contains('hidden')) {
                const isTrigger = e.target.closest('[onclick*="toggleLessonSelector"]');
                if (!selector.contains(e.target) && !isTrigger) {
                    selector.classList.add('hidden');
                }
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);

        // Inject listener into iframe to capture clicks there too
        const observer = new MutationObserver(() => {
            const frame = document.getElementById('main-frame');
            if (frame && frame.contentDocument) {
                frame.contentDocument.removeEventListener('mousedown', handleOutsideClick);
                frame.contentDocument.addEventListener('mousedown', handleOutsideClick);
            }
        });
        observer.observe(document.body, { childList: true, subtree: true });
    },

    resetNeuralBuffer() {
        this.stepTiming.neuralBuffer = { K: [], P: [], A: [], F: [], L: [], M: [] };
    },

    /**
     * Capture a neural signal for Intelligence DNA
     * @param {string} dimension - K, P, A, F, L, or M
     * @param {number} value - 0-100 score
     * @param {object} metadata - Extra context (action, desc, toast)
     */
    captureNeuralSignal(dimension, value, metadata = {}) {
        const dim = dimension.toUpperCase();
        if (!this.stepTiming.neuralBuffer[dim]) {
            this.stepTiming.neuralBuffer[dim] = [];
        }

        // 🧬 Neural Decay (Diminishing Returns)
        // เพื่อป้องกันการปั๊มคะแนน: กิจกรรมที่มีคีย์เวิร์ดซ้ำในเซสชันเดียวกันจะลดค่าน้ำหนักลง
        const decayFactor = this.calculateNeuralDecay(dim, metadata.action);
        const adjustedValue = Math.round(value * decayFactor);

        if (adjustedValue <= 0 && value > 0) return; // Skip zero-value spam

        const signal = {
            timestamp: Date.now(), // 🕒 Global Time Tracking
            date: new Date().toLocaleDateString('th-TH'),
            time: new Date().toLocaleTimeString('th-TH'),
            value: Math.max(0, Math.min(100, adjustedValue)),
            originalValue: value,
            action: metadata.action || 'กิจกรรมทั่วไป',
            decayed: decayFactor < 1,
            ...metadata
        };

        this.stepTiming.neuralBuffer[dim].push(signal);

        // 🧠 Real-time Transparency: Show Neural Star (1px SVG)
        if (adjustedValue >= 5 || metadata.forceToast) {
            window.DNAHarvester?.showNeuralStarToast(dim, adjustedValue, signal.action);
        }

        this.broadcastDNAUpdate();
    },

    /**
     * Calculate Diminishing Returns for repeated signals
     */
    calculateNeuralDecay(dim, action) {
        if (!action) return 1;
        const recentSignals = this.stepTiming.neuralBuffer[dim] || [];
        const sameActionCount = recentSignals.filter(s => s.action === action).length;

        // Formula: 1.0 (ครั้งแรก), 0.5 (ครั้งสอง), 0.25 (ครั้งสาม)... ขั้นต่ำ 0.1
        const decay = Math.pow(0.5, sameActionCount);
        return Math.max(0.1, decay);
    },




    /**
     * Global Signal Observer: Automatically catches data-dna attributes
     * Plus: Admin Analytical Depth Tracking
     */
    initDNAObserver() {
        // 1. Generic Event Listener (Click-based)
        document.addEventListener('click', (e) => {
            const el = e.target.closest('[data-dna-slot]');
            if (el) {
                const slot = el.getAttribute('data-dna-slot');
                const value = parseInt(el.getAttribute('data-dna-value') || '5');
                const action = el.getAttribute('data-dna-action') || el.innerText || 'Interaction';

                this.captureNeuralSignal(slot, value, { action, source: 'GlobalObserver' });
            }
        });

        // 2. Admin/Director Analytical Depth Tracking
        // Capture signals when viewing dashboards or charts
        const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        if (currentUser && ['MOE', 'OBEC', 'ESA_DIR', 'SCHOOL_DIR'].includes(currentUser.role)) {
            // Observer for chart visibility
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const target = entry.target;
                        const action = target.getAttribute('data-admin-action') || 'กำลังวิเคราะห์ข้อมูลแดชบอร์ด';
                        // Effort (E) and Discipline (D) DNA for Admins
                        this.captureNeuralSignal('E', 15, { action, source: 'AnalyticalObserver' });
                        this.captureNeuralSignal('D', 10, { action, source: 'AnalyticalObserver' });
                        observer.unobserve(target); // Only once per session/view
                    }
                });
            }, { threshold: 0.5 });

            // Targets: Spider charts, Stats cards, Data tables
            document.querySelectorAll('#spider-chart-container, .hud-stats-card, table').forEach(el => {
                observer.observe(el);
            });
        }

        console.log('[IDLPMS] DNA Global Observer Initialized');
    },

    broadcastDNAUpdate() {
        // Broadcast to Subject HUD if active
        try {
            const hudFrame = window.parent.document.getElementById('main-frame');
            if (hudFrame && hudFrame.contentWindow.updateDNABars) {
                hudFrame.contentWindow.updateDNABars(this.calculateDNAStats());
            }
        } catch (e) { }
    },

    // Anti-Guessing System Setup
    setupAntiGuessing() {
        this.quizState = {
            wrongStreak: 0,
            retryCount: 0,
            lastRetryTime: null,
            answerHistory: [],
            timeHistory: [],
            isLocked: false,
            lockEndTime: null,
            questionStartTime: null,
        };
    },

    // Check if user can submit answer (minimum time)
    canSubmitAnswer(questionType = 'short') {
        if (!this.quizState.questionStartTime) return true;
        const elapsed = (Date.now() - this.quizState.questionStartTime) / 1000;
        const minTime = this.antiGuessing.minTimePerQuestion[questionType] || 5;
        return elapsed >= minTime;
    },

    // Get remaining time before can submit
    getRemainingTime(questionType = 'short') {
        if (!this.quizState.questionStartTime) return 0;
        const elapsed = (Date.now() - this.quizState.questionStartTime) / 1000;
        const minTime = this.antiGuessing.minTimePerQuestion[questionType] || 5;
        return Math.max(0, minTime - elapsed);
    },

    // Start timing for a question
    startQuestionTimer() {
        this.quizState.questionStartTime = Date.now();
    },

    // Record answer and check for patterns
    recordAnswer(answer, isCorrect, timeTaken) {
        this.quizState.answerHistory.push(answer);
        this.quizState.timeHistory.push(timeTaken);

        if (isCorrect) {
            this.quizState.wrongStreak = 0;
        } else {
            this.quizState.wrongStreak++;
            this.handleWrongStreak();
        }

        // Check for guessing patterns
        this.detectGuessingPatterns();
    },

    // Handle wrong answer streak
    handleWrongStreak() {
        const streak = this.quizState.wrongStreak;
        const penalty = this.antiGuessing.wrongStreakPenalty[streak];

        if (penalty) {
            if (penalty.action === 'warning') {
                window.HUD_NOTIFY?.toast('LEARNING_HINT', penalty.message, 'warning');
            } else if (penalty.action === 'lockout') {
                this.quizState.isLocked = true;
                this.quizState.lockEndTime = Date.now() + penalty.duration * 1000;
                window.HUD_NOTIFY?.toast(
                    'LOCKOUT',
                    `กรุณาทบทวนก่อนทำต่อ (${penalty.duration} วินาที)`,
                    'error'
                );
            }
        }
    },

    // Detect guessing patterns
    detectGuessingPatterns() {
        const history = this.quizState.answerHistory;
        const times = this.quizState.timeHistory;
        const config = this.antiGuessing.patternDetection;

        // Check same answer streak
        if (history.length >= config.sameAnswerStreak) {
            const last = history.slice(-config.sameAnswerStreak);
            if (last.every((a) => a === last[0])) {
                this.triggerPatternWarning('same_answer');
                return;
            }
        }

        // Check cyclic pattern (ก ข ค ง ก ข ค ง)
        if (config.cyclicPattern && history.length >= 8) {
            const pattern1 = history.slice(-8, -4).join('');
            const pattern2 = history.slice(-4).join('');
            if (pattern1 === pattern2) {
                this.triggerPatternWarning('cyclic');
                return;
            }
        }

        // Check uniform timing
        if (config.uniformTiming && times.length >= 5) {
            const lastTimes = times.slice(-5);
            const avg = lastTimes.reduce((a, b) => a + b, 0) / lastTimes.length;
            const isUniform = lastTimes.every((t) => Math.abs(t - avg) < 0.5);
            if (isUniform) {
                this.triggerPatternWarning('uniform_timing');
            }
        }
    },

    // Trigger pattern warning
    triggerPatternWarning(type) {
        const messages = {
            same_answer: 'ดูเหมือนคุณกำลังกดคำตอบเดิมซ้ำๆ ลองอ่านคำถามให้ดีนะ',
            cyclic: 'ตรวจพบรูปแบบการตอบซ้ำ กรุณาตั้งใจทำข้อสอบ',
            uniform_timing: 'คุณตอบเร็วมากทุกข้อ ลองใช้เวลาคิดมากขึ้นนะ',
        };

        window.HUD_NOTIFY?.toast(
            'PATTERN_DETECTED',
            messages[type] || 'กรุณาตั้งใจทำข้อสอบ',
            'warning'
        );

        // Lockout for 60 seconds
        this.quizState.isLocked = true;
        this.quizState.lockEndTime = Date.now() + 60000;
    },

    // Check if can retry quiz
    canRetryQuiz() {
        const retryCount = this.quizState.retryCount;
        const cooldown = this.antiGuessing.retryCooldown[Math.min(retryCount + 1, 5)] || 60;

        if (!this.quizState.lastRetryTime) return true;

        const elapsed = (Date.now() - this.quizState.lastRetryTime) / 60000; // minutes
        return elapsed >= cooldown;
    },

    // Get retry cooldown remaining (minutes)
    getRetryCooldownRemaining() {
        const retryCount = this.quizState.retryCount;
        const cooldown = this.antiGuessing.retryCooldown[Math.min(retryCount + 1, 5)] || 60;

        if (!this.quizState.lastRetryTime) return 0;

        const elapsed = (Date.now() - this.quizState.lastRetryTime) / 60000;
        return Math.max(0, cooldown - elapsed);
    },

    // Start a retry attempt
    startRetry() {
        this.quizState.retryCount++;
        this.quizState.lastRetryTime = Date.now();
        this.quizState.wrongStreak = 0;
        this.quizState.answerHistory = [];
        this.quizState.timeHistory = [];
        this.quizState.isLocked = false;
    },

    // ═══════════════════════════════════════════════════════════════════
    // 7-STEP BEHAVIOR ANALYSIS SYSTEM
    // ═══════════════════════════════════════════════════════════════════

    // Track behavior violations per step
    behaviorLog: {
        violations: [],
        tabSwitchCount: 0,
        focusLossCount: 0,
        suspiciousFlags: [],
    },

    // Initialize behavior tracking for a step
    initStepBehaviorTracking() {
        const stepId = this.masterySteps[this.currentStep - 1]?.id;
        const rules = this.antiGuessing.stepBehavior[stepId] || {};

        // Setup tab switch listener for video step
        if (rules.tabSwitchPenalty) {
            this.setupTabSwitchListener();
        }

        console.log(`[BEHAVIOR] Initialized tracking for ${stepId}`, rules);
    },

    // Tab switch detection for DO step
    setupTabSwitchListener() {
        if (this._tabSwitchHandler) {
            document.removeEventListener('visibilitychange', this._tabSwitchHandler);
        }

        this._tabSwitchHandler = () => {
            if (document.hidden && this.currentStep === 3) { // DO step
                this.behaviorLog.tabSwitchCount++;
                this.behaviorLog.violations.push({
                    type: 'TAB_SWITCH',
                    step: 'DO',
                    timestamp: new Date().toISOString(),
                });

                // Reduce DISCIPLINE score
                this.characteristics.DISCIPLINE = Math.max(0, (this.characteristics.DISCIPLINE || 90) - 3);

                // 🧠 DNA Harvesting: Focus (F) and Affective (A) Signals
                this.captureNeuralSignal('F', 0, { type: 'tab_switch', detail: 'Focus Lost' });
                this.captureNeuralSignal('A', 50, { type: 'tab_switch', detail: 'Discipline Risk' });

                window.HUD_NOTIFY?.toast(
                    'FOCUS_DRIFT',
                    'กรุณาอย่าเปลี่ยนหน้าต่างขณะดูวิดีโอ',
                    'warning'
                );

                console.log(`[BEHAVIOR] Tab switch detected! Count: ${this.behaviorLog.tabSwitchCount}`);
            }
        };

        document.addEventListener('visibilitychange', this._tabSwitchHandler);
    },

    // Validate behavior at step completion
    validateStepBehavior() {
        const stepId = this.masterySteps[this.currentStep - 1]?.id;
        const rules = this.antiGuessing.stepBehavior[stepId] || {};
        const stepTime = this.stepTiming.stepTimes[stepId];
        const violations = [];

        // Check minimum time requirements
        if ((stepId === 'KNOW' || stepId === 'PROVE') && rules.minTimePerQ) {
            const quiz = this.currentStep === 1 ? this.stepTiming.pretestAnswers : this.stepTiming.posttestAnswers;
            const rushedQuestions = quiz.filter(a => a.timeTaken < rules.minTimePerQ);

            if (rushedQuestions.length > 0) {
                violations.push({
                    type: 'RUSHED_QUIZ',
                    step: stepId,
                    count: rushedQuestions.length,
                    message: `ทำข้อสอบเร็วเกินไป (${rushedQuestions.length} ข้อที่ใช้เวลาน้อยกว่า ${rules.minTimePerQ} วินาที)`,
                });
            }
        }

        if (stepId === 'LINK' && rules.minViewTime) {
            const actualSeconds = (stepTime?.duration || 0) / 1000;
            if (actualSeconds < rules.minViewTime) {
                violations.push({
                    type: 'TOO_FAST',
                    step: stepId,
                    expected: rules.minViewTime,
                    actual: actualSeconds,
                    message: 'อ่านจุดประสงค์เร็วเกินไป',
                });
            }
        }

        // Check video watch requirements
        if (stepId === 'DO' && rules.minWatchPercent) {
            if (this.videoWatchedPercent < rules.minWatchPercent) {
                violations.push({
                    type: 'INCOMPLETE_VIDEO',
                    step: stepId,
                    expected: rules.minWatchPercent,
                    actual: this.videoWatchedPercent,
                    message: 'ดูวิดีโอไม่ครบตามเกณฑ์',
                });
            }
        }

        // Check Pre-test vs Post-test comparison
        if (stepId === 'PROVE' && rules.compareWithPretest) {
            const comparison = this.compareTestAnswers();
            if (comparison.identicalPercent === 100 && comparison.allCorrect) {
                violations.push({
                    type: 'SUSPICIOUS_POSTTEST',
                    step: stepId,
                    message: 'คำตอบ Post-test เหมือน Pre-test ทุกข้อ',
                    flag: 'REVIEW_REQUIRED',
                });
            }
        }

        // Log violations
        violations.forEach(v => {
            this.behaviorLog.violations.push({
                ...v,
                timestamp: new Date().toISOString(),
            });
        });

        // Update characteristics based on violations
        if (violations.length > 0) {
            this.characteristics.DISCIPLINE = Math.max(0, (this.characteristics.DISCIPLINE || 90) - (violations.length * 2));

            // 🧠 DNA Harvesting: Negative signals for violations
            violations.forEach(v => {
                const dim = (v.type === 'RUSHED_QUIZ' || v.type === 'TOO_FAST') ? 'F' : 'A';
                this.captureNeuralSignal(dim, 20, { violation: v.type });
            });

            // 🧠 DNA Harvesting: Low Responsibility (R)
            this.captureNeuralSignal('R', 30, { type: 'violation_impact' });
        } else {
            // 🧠 DNA Harvesting: High Responsibility (R) - Perfect Behavior
            this.captureNeuralSignal('R', 100, { type: 'perfect_step' });
        }

        return {
            valid: violations.length === 0,
            violations: violations,
        };
    },

    // Compare Pre-test and Post-test answers
    compareTestAnswers() {
        const pre = this.stepTiming.pretestAnswers;
        const post = this.stepTiming.posttestAnswers;

        if (pre.length === 0 || post.length === 0) {
            return { comparable: false };
        }

        let identical = 0;
        let bothCorrect = 0;
        let improved = 0;

        for (let i = 0; i < Math.min(pre.length, post.length); i++) {
            if (pre[i].selected === post[i].selected) identical++;
            if (pre[i].isCorrect && post[i].isCorrect) bothCorrect++;
            if (!pre[i].isCorrect && post[i].isCorrect) improved++;
        }

        const total = Math.min(pre.length, post.length);
        const result = {
            comparable: true,
            identicalPercent: Math.round((identical / total) * 100),
            bothCorrectPercent: Math.round((bothCorrect / total) * 100),
            improvementCount: improved,
            allCorrect: post.every(a => a.isCorrect),
        };

        // Flag suspicious patterns
        if (result.identicalPercent === 100) {
            this.behaviorLog.suspiciousFlags.push({
                type: 'IDENTICAL_ANSWERS',
                details: result,
                timestamp: new Date().toISOString(),
            });
        }

        // Positive: Improvement shows learning happened
        if (result.improvementCount > 0) {
            this.characteristics.LEARNING = Math.min(100, (this.characteristics.LEARNING || 85) + result.improvementCount);

            // 🧠 DNA Harvesting: Affective (A) Signal for Growth Mindset
            this.captureNeuralSignal('A', 100, { type: 'improvement', count: result.improvementCount });
        }

        console.log('[BEHAVIOR] Test Comparison:', result);
        return result;
    },

    // Get behavior report for teacher/admin
    getBehaviorReport() {
        return {
            lessonId: this.currentLessonIndex,
            subjectId: this.currentSubjectID,
            totalTime: this.stepTiming.totalLessonTime,
            stepTimes: this.stepTiming.stepTimes,
            violations: this.behaviorLog.violations,
            suspiciousFlags: this.behaviorLog.suspiciousFlags,
            tabSwitchCount: this.behaviorLog.tabSwitchCount,
            testComparison: this.compareTestAnswers(),
            characteristics: this.characteristics,
            timestamp: new Date().toISOString(),
        };
    },

    // Check if quiz is currently locked
    isQuizLocked() {
        if (!this.quizState.isLocked) return false;
        if (Date.now() >= this.quizState.lockEndTime) {
            this.quizState.isLocked = false;
            return false;
        }
        return true;
    },

    // Get lock remaining time (seconds)
    getLockRemainingTime() {
        if (!this.quizState.isLocked) return 0;
        return Math.max(0, (this.quizState.lockEndTime - Date.now()) / 1000);
    },

    setupFocusGuard() {
        // Simple Focus Guard: Track visibility and movement
        this.focusScore = 100;
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.focusScore = Math.max(0, this.focusScore - 20);

                // 🧠 DNA Harvesting: Focus (F) Signal
                this.captureNeuralSignal('F', 30, { type: 'focus_guard_loss' });

                window.HUD_NOTIFY?.toast('NEURAL_DRIFT', 'Attention Drift Detected!', 'warning');
            }
        });
    },

    renderDashboard() {
        const currentUser = window.getCurrentUser();
        const container = document.getElementById('management-content');
        if (!container) return;

        if (this.activeModule === 'LEARNING_FLOW') {
            if (this.currentSubjectID) {
                this.activeModule = this.currentSubjectID;
                this.renderDashboard();
                return;
            }
        }

        // Use unified TimelineMenu system for ALL roles
        const configs = this.getRoleTimelineConfigs(currentUser);

        // Create containers and render immediately (no setTimeout = no flash)
        container.innerHTML = configs.map((cfg, i) =>
            `<div id="tl-group-${i}" class="timeline-menu-container"></div>`
        ).join('');

        if (window.TimelineMenu) {
            configs.forEach((cfg, i) => {
                TimelineMenu.render(`tl-group-${i}`, cfg);
            });
        }
    },

    /**
     * Get timeline menu configs by role
     */
    getRoleTimelineConfigs(user) {
        let configs = [];
        switch (user.role) {
            case 'SCHOOL_DIR':
                configs = this.getAdminTimelineConfigs(); break;
            case 'ESA_DIR':
                configs = this.getAdminTimelineConfigs(); break; // same groups
            case 'OBEC':
            case 'MOE':
                configs = this.getAdminTimelineConfigs(); break;
            case 'TEACHER':
                configs = this.getTeacherTimelineConfigs(); break;
            case 'STUDENT':
                configs = this.getStudentTimelineConfigs(); break;
            case 'PARENT':
                configs = this.getParentTimelineConfigs(); break;
            default:
                configs = [];
        }

        // --- INJECT MISSION: DIRECTIVE ---
        try {
            const userId = localStorage.getItem('idlpms_active_user_id') || localStorage.getItem('current_user_id');
            const raw = localStorage.getItem('idlpms_delegations_v1');
            if (raw && userId) {
                const delegations = JSON.parse(raw);
                // Inbox Zero: Only show PENDING and IN_PROGRESS tasks.
                const inboxTasks = delegations.filter(d =>
                    d.assignee === userId &&
                    (d.status === 'PENDING' || d.status === 'IN_PROGRESS')
                );

                if (inboxTasks.length > 0) {
                    const directiveChildren = inboxTasks.map((task, index) => {
                        const isAdhoc = task.moduleId && String(task.moduleId).startsWith('ADHOC');
                        const isPending = task.status === 'PENDING';

                        let badgeStr = '';
                        if (isPending) badgeStr = 'ACCEPT';
                        else if (task.status === 'IN_PROGRESS') badgeStr = 'IN PROG';

                        let pageRoute = `__SYSTEM_TASK__${task.moduleId}`;
                        if (isPending && !isAdhoc) {
                            pageRoute = `__ACCEPT_MISSION__${task.id}`;
                        } else if (isAdhoc) {
                            pageRoute = 'pages/teacher_inbox.html';
                        }

                        return {
                            name: task.moduleTitle || 'ภารกิจสั่งการ',
                            icon: isAdhoc ? 'i-chat-bubble-left-ellipsis' : 'i-lightning',
                            page: pageRoute,
                            action: task.moduleId, // Trigger the action if defined
                            badge: badgeStr
                        };
                    });

                    // Prepend to top
                    configs.unshift({
                        parent: { name: 'Mission: Directive', icon: 'i-command-line', page: '#', active: true, colorClass: 'text-rose-400' },
                        children: directiveChildren,
                        activeItem: directiveChildren[0].action
                    });
                }
            }
        } catch (e) {
            console.warn('[ManagementEngine] Failed to read delegations for Timeline configs:', e);
        }

        return configs;
    },

    /**
     * ─── SCHOOL_DIR / ESA_DIR: 4 groups ───
     */
    getAdminTimelineConfigs() {
        return [
            // Group 0: Dashboard ผอ. (Director Command Center)
            {
                parent: { name: 'Dashboard ผอ.', icon: 'i-home', page: 'pages/director_dashboard.html', active: true, colorClass: 'text-cyan-400' },
                children: [
                    { name: 'Overview โรงเรียน', icon: 'i-chart', page: 'pages/director_dashboard.html', action: 'dir-overview' },
                    { name: 'กล่องรออนุมัติ', icon: 'i-inbox', page: 'pages/director_inbox.html', action: 'dir-inbox', badge: 3 },
                    { name: 'แจ้งเตือนด่วน', icon: 'i-bell', page: 'pages/director_alerts.html', action: 'dir-alerts', badge: 2 },
                    { name: 'ปฏิทินโรงเรียน', icon: 'i-calendar', page: 'pages/school_calendar.html', action: 'school-cal' },
                ],
                activeItem: 'dir-overview'
            },
            // Group 1: วิชาการ (Academic Affairs)
            {
                parent: { name: 'วิชาการ', icon: 'i-book', page: 'pages/schedule/domain1.html', colorClass: 'text-emerald-400' },
                children: [
                    { name: 'ตารางสอน (Domain 1)', icon: 'i-calendar', page: 'pages/schedule/domain1.html', action: 'schedule-d1' },
                    { name: 'งานสนับสนุน (Domain 2)', icon: 'i-shield', page: 'pages/schedule/domain2.html', action: 'schedule-d2' },
                    { name: 'พัฒนาคุณภาพ (Domain 3)', icon: 'i-chart', page: 'pages/schedule/domain3.html', action: 'schedule-d3' },
                    { name: 'นโยบาย (Domain 4)', icon: 'i-globe', page: 'pages/schedule/domain4.html', action: 'schedule-d4' },
                    { name: 'Auto Schedule + ผลลัพธ์', icon: 'i-lightning', page: 'pages/auto_schedule.html', action: 'auto-schedule' },
                    { name: 'มอบหมายวิชา/ครู (Matrix)', icon: 'i-squares', page: 'pages/teacher_management.html', action: 'assignment-matrix' },
                    { name: 'สร้างการ์ดวิชา', icon: 'i-academic', page: 'pages/subject_cards.html', action: 'subject-cards' },
                    { name: 'ผลการเรียนรวม', icon: 'i-chart', page: 'pages/academic_results.html', action: 'academic-results' },
                    { name: 'ลงนาม ปพ.1', icon: 'i-document', page: 'pages/sign_sor1.html', action: 'sign-sor1', directorOnly: true }
                ]
            },
            // Group 2: บุคคล (Personnel Management)
            {
                parent: { name: 'บุคคล', icon: 'i-users', page: 'pages/teacher_management.html', colorClass: 'text-amber-400' },
                children: [
                    { name: 'ฐานข้อมูลบุคลากร', icon: 'i-users', page: 'pages/teacher_management.html', action: 'manage-personnel' },
                    { name: 'ใบลาบุคลากร', icon: 'i-document-text', page: 'pages/leave_approval.html', action: 'leave-approval' },
                    { name: 'เพิ่มบุคลากร', icon: 'i-user-plus', page: 'pages/add_teacher.html', action: 'add-personnel' },
                    { name: 'ภาระงาน 4 ด้าน (รวม)', icon: 'i-chart', page: 'pages/workload_overview.html', action: 'workload-overview' },
                    { name: 'ประเมิน วPA (ผู้ประเมิน)', icon: 'i-shield', page: 'pages/wpa_director.html', action: 'wpa-dir', directorOnly: true },
                    { name: 'PLC ติดตาม', icon: 'i-users', page: 'pages/plc_tracker.html', action: 'plc-track', locked: true },
                    { name: 'คำสั่งมอบหมายงาน', icon: 'i-document', page: 'pages/duty_orders.html', action: 'duty-orders', directorOnly: true }
                ]
            },
            // Group 3: กิจการนักเรียน (Student Affairs)
            {
                parent: { name: 'กิจการนักเรียน', icon: 'i-academic', page: 'pages/students.html', colorClass: 'text-pink-400' },
                children: [
                    { name: 'ทะเบียนนักเรียน', icon: 'i-users', page: 'pages/students.html', action: 'student-registry' },
                    { name: 'เพิ่ม/รับนักเรียน', icon: 'i-user-plus', page: 'pages/student_input.html', action: 'student-add' },
                    { name: 'สถิติการมาเรียน', icon: 'i-clock', page: 'pages/attendance_overview.html', action: 'attendance-ov' },
                    { name: 'นักเรียนกลุ่มเสี่ยง', icon: 'i-alert', page: 'pages/at_risk_students.html', action: 'at-risk', badge: 2 },
                    { name: 'สมรรถภาพทางกาย', icon: 'i-heart', page: 'pages/fitness_test.html', action: 'fitness-test' },
                    { name: 'ลงนาม ปพ.2', icon: 'i-document', page: 'pages/sign_sor2.html', action: 'sign-sor2', directorOnly: true },
                ]
            },
            // Group 4: งบประมาณ (Budget Management)
            {
                parent: { name: 'งบประมาณ', icon: 'i-database', page: 'pages/budget.html', colorClass: 'text-sky-400' },
                children: [
                    { name: 'แผนงบประมาณ', icon: 'i-document', page: 'pages/budget_plan.html', action: 'budget-plan', locked: true },
                    { name: 'ติดตามเบิกจ่าย', icon: 'i-chart', page: 'pages/budget_tracker.html', action: 'budget-track', locked: true },
                    { name: 'อนุมัติเบิกจ่าย', icon: 'i-check', page: 'pages/budget_approve.html', action: 'budget-approve', locked: true, directorOnly: true },
                ]
            },
            // Group 5: บริหารทั่วไป (General Administration)
            {
                parent: { name: 'บริหารทั่วไป', icon: 'i-cog', page: 'pages/school_setup.html', colorClass: 'text-indigo-400' },
                children: [
                    { name: 'โครงสร้างสถานศึกษา', icon: 'i-office', page: 'pages/school_setup.html', action: 'school-setup' },
                    { name: 'Smart Config (ผอ.)', icon: 'i-cog', page: 'pages/director_config.html', action: 'dir-config', directorOnly: true },
                    { name: 'ระบบเอกสารราชการ', icon: 'i-folder', page: 'pages/admin_docs.html', action: 'admin-docs' },
                    { name: 'ลงนามเอกสารด่วน', icon: 'i-document', page: 'pages/sign_queue.html', action: 'sign-queue', directorOnly: true },
                ]
            },
            // Group 6: ประกันคุณภาพ & รายงาน (QA & Reports)
            {
                parent: { name: 'ประกันคุณภาพ', icon: 'i-chart', page: 'pages/admin_stats.html', colorClass: 'text-purple-400' },
                children: [
                    { name: 'สถิติรวมโรงเรียน', icon: 'i-chart', page: 'pages/admin_stats.html', action: 'admin-stats' },
                    { name: 'ผลสัมฤทธิ์นักเรียน', icon: 'i-trending-up', page: 'pages/achievement_report.html', action: 'achieve-report' },
                    { name: 'SAR (รายงานตนเอง)', icon: 'i-document', page: 'pages/sar.html', action: 'sar-report', locked: true },
                ]
            }
        ];
    },

    /**
     * ─── TEACHER: 3 groups ───
     */
    getTeacherTimelineConfigs() {
        return [
            {
                parent: { name: '\u0e2b\u0e49\u0e2d\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e02\u0e2d\u0e07\u0e09\u0e31\u0e19', icon: 'i-users', page: 'pages/class_hud.html?id=61', active: true, colorClass: 'text-violet-400' },
                children: [
                    { name: '\u0e2b\u0e49\u0e2d\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19 \u0e1b.6/1', icon: 'i-users', page: 'pages/class_hud.html?id=61', action: 'class-61' },
                    { name: '\u0e2b\u0e49\u0e2d\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19 \u0e1b.6/2', icon: 'i-users', page: 'pages/class_hud.html?id=62', action: 'class-62' }
                ],
                activeItem: 'class-61'
            },
            {
                parent: { name: '\u0e07\u0e32\u0e19\u0e2a\u0e2d\u0e19', icon: 'i-clipboard-check', page: 'pages/grades.html', colorClass: 'text-emerald-400' },
                children: [
                    { name: '\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e04\u0e30\u0e41\u0e19\u0e19 (\u0e1b\u0e1e.)', icon: 'i-clipboard-check', page: 'pages/grades.html', action: 'grades' },
                    { name: '\u0e41\u0e1c\u0e19\u0e01\u0e32\u0e23\u0e08\u0e31\u0e14\u0e01\u0e32\u0e23\u0e40\u0e23\u0e35\u0e22\u0e19\u0e23\u0e39\u0e49', icon: 'i-document-duplicate', page: 'pages/lesson_plans.html', action: 'lesson-plans' },
                    { name: '\u0e08\u0e31\u0e14\u0e01\u0e32\u0e23\u0e01\u0e32\u0e23\u0e4c\u0e14\u0e27\u0e34\u0e0a\u0e32', icon: 'i-document-plus', page: 'pages/subject_cards.html', action: 'subject-cards' }
                ]
            },
            {
                parent: { name: '\u0e1b\u0e23\u0e30\u0e08\u0e33\u0e27\u0e31\u0e19', icon: 'i-calendar', page: 'pages/attendance.html', colorClass: 'text-cyan-400' },
                children: [
                    { name: '\u0e40\u0e0a\u0e47\u0e04\u0e0a\u0e37\u0e48\u0e2d/\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e40\u0e27\u0e25\u0e32', icon: 'i-check', page: 'pages/attendance.html', action: 'attendance' },
                    { name: '\u0e15\u0e32\u0e23\u0e32\u0e07\u0e2a\u0e2d\u0e19\u0e02\u0e2d\u0e07\u0e15\u0e19\u0e40\u0e2d\u0e07', icon: 'i-calendar', page: 'pages/schedule.html', action: 'my-schedule' }
                ]
            },
            // Group 4: งานบุคคล (Personnel / Leave)
            {
                parent: { name: 'งานบุคคล', icon: 'i-user', page: 'pages/teacher_leave.html', colorClass: 'text-amber-400' },
                children: [
                    { name: 'ยื่นใบลา', icon: 'i-document-plus', page: 'pages/teacher_leave.html', action: 'leave-request' },
                    { name: 'ประวัติการลา', icon: 'i-clock', page: 'pages/teacher_leave.html#history', action: 'leave-history' },
                    { name: 'สิทธิ์ลาคงเหลือ', icon: 'i-chart', page: 'pages/teacher_leave.html#balance', action: 'leave-balance' }
                ]
            }
        ];
    },

    /**
     * ─── STUDENT: 2 groups ───
     */
    getStudentTimelineConfigs() {
        return [
            {
                parent: { name: '\u0e27\u0e34\u0e0a\u0e32\u0e40\u0e23\u0e35\u0e22\u0e19', icon: 'i-book', page: 'pages/mission_hud.html?id=THAI', active: true, colorClass: 'text-pink-400' },
                children: [
                    { name: '\u0e20\u0e32\u0e29\u0e32\u0e44\u0e17\u0e22', icon: 'i-book', page: 'pages/mission_hud.html?id=THAI', action: 'sub-thai' },
                    { name: '\u0e04\u0e13\u0e34\u0e15\u0e28\u0e32\u0e2a\u0e15\u0e23\u0e4c', icon: 'i-squares', page: 'pages/mission_hud.html?id=MATH', action: 'sub-math' },
                    { name: '\u0e27\u0e34\u0e17\u0e22\u0e32\u0e28\u0e32\u0e2a\u0e15\u0e23\u0e4c', icon: 'i-lightning', page: 'pages/mission_hud.html?id=SCI', action: 'sub-sci' },
                    { name: '\u0e2a\u0e31\u0e07\u0e04\u0e21\u0e28\u0e36\u0e01\u0e29\u0e32', icon: 'i-users', page: 'pages/mission_hud.html?id=SOC', action: 'sub-soc' },
                    { name: '\u0e1b\u0e23\u0e30\u0e27\u0e31\u0e15\u0e34\u0e28\u0e32\u0e2a\u0e15\u0e23\u0e4c', icon: 'i-library', page: 'pages/mission_hud.html?id=HIST', action: 'sub-hist' },
                    { name: '\u0e2a\u0e38\u0e02\u0e28\u0e36\u0e01\u0e29\u0e32\u0e41\u0e25\u0e30\u0e1e\u0e25\u0e28\u0e36\u0e01\u0e29\u0e32', icon: 'i-shield', page: 'pages/mission_hud.html?id=PE', action: 'sub-pe' },
                    { name: '\u0e28\u0e34\u0e25\u0e1b\u0e30', icon: 'i-academic', page: 'pages/mission_hud.html?id=ART', action: 'sub-art' },
                    { name: '\u0e01\u0e32\u0e23\u0e07\u0e32\u0e19\u0e2d\u0e32\u0e0a\u0e35\u0e1e', icon: 'i-cog', page: 'pages/mission_hud.html?id=WORK', action: 'sub-work' },
                    { name: '\u0e20\u0e32\u0e29\u0e32\u0e15\u0e48\u0e32\u0e07\u0e1b\u0e23\u0e30\u0e40\u0e17\u0e28', icon: 'i-cube', page: 'pages/mission_hud.html?id=ENG', action: 'sub-eng' }
                ],
                activeItem: 'sub-thai'
            },
            {
                parent: { name: '\u0e07\u0e32\u0e19\u0e02\u0e2d\u0e07\u0e09\u0e31\u0e19', icon: 'i-clipboard-check', page: 'pages/tasks.html', colorClass: 'text-indigo-400' },
                children: [
                    { name: '\u0e2a\u0e48\u0e07\u0e07\u0e32\u0e19/\u0e01\u0e32\u0e23\u0e1a\u0e49\u0e32\u0e19', icon: 'i-clipboard-check', page: 'pages/tasks.html', action: 'homework' },
                    { name: '\u0e1b\u0e23\u0e30\u0e01\u0e32\u0e28\u0e08\u0e32\u0e01\u0e42\u0e23\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19', icon: 'i-chart', page: 'pages/announcements.html', action: 'announcements' },
                    { name: '\u0e15\u0e32\u0e23\u0e32\u0e07\u0e40\u0e23\u0e35\u0e22\u0e19\u0e02\u0e2d\u0e07\u0e15\u0e19\u0e40\u0e2d\u0e07', icon: 'i-calendar', page: 'pages/schedule.html', action: 'my-schedule' }
                ]
            }
        ];
    },

    /**
     * ─── PARENT: 1 group ───
     */
    getParentTimelineConfigs() {
        return [
            {
                parent: { name: '\u0e14\u0e39\u0e41\u0e25\u0e1a\u0e38\u0e15\u0e23', icon: 'i-users', page: 'pages/child_progress.html', active: true, colorClass: 'text-orange-400' },
                children: [
                    { name: '\u0e15\u0e34\u0e14\u0e15\u0e32\u0e21\u0e01\u0e32\u0e23\u0e40\u0e23\u0e35\u0e22\u0e19', icon: 'i-trending-up', page: 'pages/child_progress.html', action: 'child-progress' },
                    { name: '\u0e1b\u0e23\u0e30\u0e27\u0e31\u0e15\u0e34\u0e40\u0e02\u0e49\u0e32\u0e40\u0e23\u0e35\u0e22\u0e19', icon: 'i-clock', page: 'pages/child_attendance.html', action: 'child-attend' },
                    { name: '\u0e15\u0e34\u0e14\u0e15\u0e48\u0e2d\u0e04\u0e23\u0e39\u0e1b\u0e23\u0e30\u0e08\u0e33\u0e0a\u0e31\u0e49\u0e19', icon: 'i-chat', page: 'pages/chat.html', action: 'teacher-chat' }
                ],
                activeItem: 'child-progress'
            }
        ];
    },

    getRoleMenu(user) {
        switch (user.role) {
            case 'STUDENT':
                return this.getStudentMenu();
            case 'TEACHER':
                return this.getTeacherMenu();
            case 'SCHOOL_DIR':
                return this.getAdminMenu('School Management');
            case 'ESA_DIR':
                return this.getAdminMenu('District Strategy');
            case 'OBEC':
            case 'MOE':
                return this.getAdminMenu('National Vision');
            case 'PARENT':
                return this.getParentMenu();
            default:
                return [];
        }
    },

    renderSidebarZones(sections) {
        return sections
            .map(
                (section) => `
            <div class="mb-6">
                <div class="px-3 mb-3">
                    <span class="hud-badge-micro bg-white/10 text-white/50 px-2 py-0.5 rounded-[2px] uppercase font-bold">${section.section}</span>
                </div>
                <div class="space-y-0.5">
                    ${section.items
                        .map(
                            (item, index, array) => {
                                const isSubmenu = item.isSubmenu || false;
                                const isLocked = item.locked || false;
                                const hasBadge = item.badge && item.badge > 0;
                                const isDirOnly = item.directorOnly || false;

                                return `
                        <button onclick="${isLocked ? `HUD_NOTIFY.warn('FEATURE LOCKED', 'This module is scheduled for Phase 3 rollout.')` : `window.ManagementEngine.handleMenuClick('${item.id}', '${item.path}', '${item.type}')`}"
                                class="nav-item vs-menu-item w-full text-left ${isSubmenu ? 'pl-8 menu-submenu-item' : 'px-3'} py-2 rounded-[var(--vs-radius)] transition-all flex items-center group ${this.activeModule === item.id ? 'active' : ''} ${isLocked ? 'opacity-40 grayscale cursor-not-allowed' : ''}">
                            ${isSubmenu ? '<div class="menu-timeline-connector"></div>' : ''}
                            <i class="icon ${item.icon} h-4 w-4 mr-3 transition-colors ${isDirOnly ? 'text-[var(--vs-accent)]' : ''}" ${item.color ? `style="color:${item.color}"` : ''}></i>
                            <span class="text-[13px] font-light Thai-Rule truncate ${isDirOnly ? 'text-white' : ''}">${item.label}</span>
                            
                            <div class="ml-auto flex items-center gap-2">
                                ${isLocked ? '<i class="icon i-lock h-3 w-3 opacity-50"></i>' : ''}
                                ${isDirOnly && !isLocked && !hasBadge ? '<i class="icon i-shield-check h-3 w-3 text-[var(--vs-accent)] opacity-80"></i>' : ''}
                                ${hasBadge ? `<span class="vs-count">${item.badge}</span>` : ''}
                                ${item.type === 'PRIMARY' ? `<div class="w-1 h-[3px] rounded-[3px] bg-[var(--vs-accent)] animate-pulse"></div>` : ''}
                            </div>
                        </button>
                    `;
                            }
                        )
                        .join('')}
                </div>
            </div>
        `
            )
            .join('');
    },

    handleMenuClick(id, path, type = 'SECONDARY') {
        this.activeModule = id;

        // If it's a primary mission (except the Inbox), we open the Subject HUD instead of just a page
        if (type === 'PRIMARY' && id !== 'TASK_INBOX') {
            this.renderSubjectHUD(id);
            this.renderDashboard(); // Update sidebar active state
        } else {
            this.renderDashboard();
            // Sync to Main Stage
            const mainFrame = document.getElementById('main-frame');
            if (mainFrame && path) {
                let loadPath = path;
                let targetIdForLabel = id;

                // Handle Component-Based Routing (OS Handoff)
                if (loadPath.startsWith('__COMPONENT__')) {
                    const componentName = loadPath.replace('__COMPONENT__', '');
                    const props = { context: 'DELEGATED' };

                    // We load the empty mission_hud shell, and pass the component instruction via URL hash
                    // The receiving page will read the hash and mount the component.
                    loadPath = `pages/mission_hud.html#cmp=${componentName}&ctx=DELEGATED`;
                    targetIdForLabel = componentName;
                }
                // Handle Cross-Role Delegated System Tasks
                else if (loadPath.startsWith('__SYSTEM_TASK__')) {
                    const sysModuleId = loadPath.replace('__SYSTEM_TASK__', '');
                    const sysItem = this.findMenuItem(sysModuleId);

                    if (sysItem && (sysItem.page || sysItem.path)) {
                        loadPath = sysItem.page || sysItem.path;
                    } else {
                        // Fuzzy recovery for old corrupted tasks in localStorage
                        const rawId = String(sysModuleId).trim();
                        const upperId = rawId.toUpperCase();

                        if (upperId.includes('FITNESS') || upperId.includes('สมรรถภาพ') || rawId === '100' || rawId === 'fitness-test') {
                            loadPath = 'pages/fitness_test.html';
                        } else if (upperId === 'GENERAL') {
                            // Ad-Hoc / General tasks should open the inbox logic or detailed view
                            loadPath = 'pages/teacher_inbox.html';
                        } else {
                            // If it purely relies on an action but no specific page is defined
                            loadPath = 'pages/home.html';
                        }
                    }
                    targetIdForLabel = sysItem ? (sysItem.id || sysItem.action) : sysModuleId;
                }

                mainFrame.src = loadPath;
                const breadcrumbPage = document.getElementById('header-page-name');
                const item = this.findMenuItem(targetIdForLabel);

                if (breadcrumbPage) {
                    if (item && item.label) {
                        breadcrumbPage.innerText = item.label;
                    } else if (loadPath.includes('#cmp=')) {
                        breadcrumbPage.innerText = 'Delegated Module';
                    } else {
                        breadcrumbPage.innerText = 'ภารกิจสั่งการ';
                    }
                }
            }
        }
    },

    /**
     * --- SUBJECT HUD SUMMARY ---
     * The intermediary view between Mission Board and 7-Step Mastery
     */
    renderSubjectHUD(subjectId) {
        const currentUser = window.getCurrentUser();
        const subject = IDLPMS_DATA.curriculum[subjectId.replace('SUB_', '')] || {
            name: 'Unknown Subject',
            color: 'var(--vs-text-muted)',
        };

        // Find teacher for this subject in the same school
        const teacher = Object.values(IDLPMS_DATA.users).find(
            (u) =>
                u.role === 'TEACHER' &&
                u.schoolId === currentUser.schoolId &&
                (u.subjectId === subjectId.replace('SUB_', '') || u.subject === subject.name)
        );

        const mainFrame = document.getElementById('main-frame');
        if (!mainFrame) return;

        // Note: For now we inject HTML directly or we could load a specialized page.
        // Given the HUD requirement, we will load a base HUD page and let it initialize.
        // But for this demo, we'll use a data-driven approach.

        // We'll simulate loading a specific page
        mainFrame.src = `pages/mission_hud.html?id=${subjectId}`;

        window.ManagementEngine.currentSubjectID = subjectId;

        const breadcrumbPage = document.getElementById('header-page-name');
        if (breadcrumbPage) {
            breadcrumbPage.innerHTML = `<span class="text-[var(--vs-accent)]">${subject.name}</span> <span class="opacity-30">/</span> HUD SUMMARY`;
        }
    },

    findMenuItemByPath(path) {
        const roles = ['TEACHER', 'SCHOOL_DIR', 'STUDENT'];
        for (const r of roles) {
            const configs = this.getRoleTimelineConfigs({ role: r });
            for (const group of configs) {
                if (group.parent && group.parent.page && group.parent.page.includes(path)) return group.parent;
                if (group.children) {
                    const found = group.children.find(c => c.page && c.page.includes(path));
                    if (found) return found;
                }
            }
        }
        return null;
    },

    findMenuItem(id) {
        if (id === 'OVERVIEW') return { label: 'Dashboard Overview' };

        // Priority 1: Search Timeline Configs First (Modern Sidebar)
        const user = window.getCurrentUser();
        const searchTimeline = (role) => {
            const configs = this.getRoleTimelineConfigs({ role });
            for (const group of configs) {
                if (group.parent && (group.parent.action === id || group.parent.id === id)) return group.parent;
                if (group.children) {
                    const item = group.children.find(i => i.id === id || i.action === id);
                    if (item) return item;
                }
            }
            return null;
        };

        let found = searchTimeline(user.role);
        if (found) return { ...found, label: found.name }; // map modern name to legacy label

        // Priority 2: Search Current User's Role Menu (Legacy)
        const menu = this.getRoleMenu(user);
        for (const section of menu) {
            const item = section.items.find((i) => i.id === id || i.action === id);
            if (item) return item;
        }

        // Priority 3: Full System Fallback (If task was delegated from another role)
        const fallbackRoles = ['SCHOOL_DIR', 'TEACHER', 'STUDENT'];
        for (const fallbackRole of fallbackRoles) {
            if (fallbackRole === user.role) continue; // Already checked

            // Check Timeline Configs
            found = searchTimeline(fallbackRole);
            if (found) return { ...found, label: found.name };

            // Check Legacy Menus
            const fallbackMenu = this.getRoleMenu({ role: fallbackRole });
            for (const section of fallbackMenu) {
                const item = section.items.find((i) => i.id === id || i.action === id);
                if (item) return item;
            }
        }

        // Priority 4: Hardcoded Fallbacks for System Tasks (If all else fails)
        if (id === 'FITNESS_TEST' || id === 'fitness-test') {
            return { id: 'FITNESS_TEST', action: 'fitness-test', label: 'สมรรถภาพทางกาย', page: 'pages/fitness_test.html', icon: 'i-heart', colorClass: 'text-rose-400' };
        }

        return { label: id };
    },

    submitActiveMission() {
        // 1. Check if there's an active Mission Context stored globally
        const activeTaskId = window.ManagementEngine.currentActiveTaskId || sessionStorage.getItem('IDLPMS_ACTIVE_TASK_ID');

        if (!activeTaskId) {
            if (window.HUD_NOTIFY) HUD_NOTIFY.toast('ไม่พบภารกิจรอดำเนินการ', 'กรุณาเลือกงานจาก Inbox เพื่อเริ่มดำเนินการก่อน', 'warning');
            return;
        }

        // 2. Locate the Delegation object
        if (!window.DelegationPanel) {
            if (window.HUD_NOTIFY) HUD_NOTIFY.toast('ระบบขัดข้อง', 'ไม่สามารถเชื่อมต่อ Delegation Engine ได้', 'error');
            return;
        }

        const list = window.DelegationPanel.getAllDelegations();
        const task = list.find(t => t.id === activeTaskId);

        if (!task) {
            if (window.HUD_NOTIFY) HUD_NOTIFY.toast('ข้อมูลผิดพลาด', 'ไม่พบข้อมูลภารกิจนี้ในระบบ', 'error');
            return;
        }

        // 3. Confirm Submission
        const confirmed = confirm(`ยืนยันการนำส่งผลงาน:\n"${task.moduleTitle}"\n\nระบบจะบันทึกสถานะเป็นเสร็จสมบูรณ์ และตัดออกจาก Inbox ของคุณ`);
        if (confirmed) {
            // Auto-grant full base score for non-graded system tasks, or prompt for details if AdHoc
            const score = task.baseScore || 10;
            const details = task.type === 'ADHOC' ? prompt('โปรดระบุรายละเอียด/ผลการดำเนินงานโดยสังเขป (ถ้ามี):') : '';

            // 4. Dispatch the completion via the Panel API
            window.DelegationPanel.submitWork(task.id, score, score, details || '');

            // 5. Hide the Submit Button
            const btn = document.getElementById('btn-submit-mission');
            if (btn) btn.style.display = 'none';

            // Clear Context
            window.ManagementEngine.currentActiveTaskId = null;
            sessionStorage.removeItem('IDLPMS_ACTIVE_TASK_ID');

            // Optionally route back
            try { this.handleMenuClick('MISSION_INBOX', 'pages/teacher_inbox.html'); } catch (e) { }
        }
    },

    renderMiniMatrix() {
        return `
            <div class="space-y-1.5 px-1">
                ${Object.entries(this.neuralMatrix)
                .slice(0, 3)
                .map(
                    ([key, val]) => {
                        const dnaColor = `var(--dna-${key.toLowerCase()})`;

                        return `
                    <div>
                        <div class="flex justify-between mb-0.5">
                            <span class="text-[var(--vs-text-muted)] uppercase font-light text-[13px]">${key}</span>
                            <span class="text-zinc-300 font-light text-[13px]">${val}%</span>
                        </div>
                        <div class="h-[3px] bg-[var(--vs-border)] rounded-[3px] overflow-hidden">
                            <div class="h-full" style="width: ${val}%; background: ${dnaColor}"></div>
                        </div>
                    </div>
                `;
                    }
                )
                .join('')}
            </div>
        `;
    },

    /**
     * --- UNITY COMPONENT: SUBJECT CARD ---
     */
    renderSubjectCard(options) {
        const group = this.curriculumGroups[options.groupKey] || {
            name: options.altTitle || 'General',
            icon: options.icon || 'i-squares',
            color: 'var(--vs-text-muted)',
            bg: 'var(--vs-bg-deep)',
            border: 'var(--vs-border)',
        };

        return `
            <div class="rounded-[3px] border border-[rgba(63,63,70,0.5)] bg-[var(--vs-bg-card)] p-3 hover:border-[rgba(var(--vs-accent-rgb),0.3)] transition-all group ">
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-[3px] flex items-center justify-center border border-[rgba(63,63,70,0.5)]" style="background-color: ${group.bg}">
                            <i class="icon ${group.icon} h-4 w-4" style="background-color: ${group.color} !important"></i>
                        </div>
                        <div>
                            <h3 class="text-[13px] font-light text-[var(--vs-text-title)] Thai-Rule">${group.name} ${options.subtitle ? `<span class="text-[13px] text-[var(--vs-text-muted)] font-light">| ${options.subtitle}</span>` : ''}</h3>
                            <p class="text-[13px] text-[var(--vs-text-muted)]">Core National Curriculum Standard</p>
                        </div>
                    </div>
                </div>

                <!-- Performance Hub -->
                <div class="mb-3">
                    <div class="flex justify-between hud-badge-micro mb-1 uppercase font-light">
                        <span>${options.progressLabel || 'Progress'}</span>
                        <span style="color: ${group.color}">${options.progressValue || 0}%</span>
                    </div>
                    <div class="h-[3px] bg-[var(--vs-border)] rounded-[3px] overflow-hidden">
                        <div class="h-full" style="background-color: ${group.color} !important; width: ${options.progressValue || 0}%"></div>
                    </div>
                </div>

                <button onclick="${options.onClick}" class="w-full py-1.5 bg-[var(--vs-bg-deep)] border border-[rgba(63,63,70,0.5)] rounded-[3px] text-[13px] font-light uppercase transition-all hover:bg-[var(--vs-bg-panel)]" style="color: ${group.color}">
                    Establish Mastery Flow
                </button>
            </div>
        `;
    },

    /**
     * --- ROLE VIEWS ---
     */
    getStudentView(user) {
        return `
            <div class="space-y-6 animate-in fade-in duration-300 pb-10">
                <!-- Neural DNA Matrix -->
                <div class="p-4 rounded-[3px] border border-[rgba(63,63,70,0.5)] bg-[var(--vs-bg-deep)]">
                    <span class="hud-badge-micro mb-4 block">Neural DNA Matrix</span>
                    <div class="grid grid-cols-2 gap-x-6 gap-y-4">
                        ${Object.entries(this.neuralMatrix)
                .map(
                    ([key, val]) => `
                            <div class="space-y-1.5">
                                <div class="flex justify-between hud-badge-micro font-light uppercase">
                                    <span class="text-[var(--vs-text-muted)]">${key}</span>
                                    <span class="text-[var(--vs-accent)]">${val}%</span>
                                </div>
                                <div class="h-[3px] bg-[var(--vs-border)] rounded-[3px] overflow-hidden">
                                    <div class="h-full bg-[var(--vs-accent)]" style="width: ${val}%"></div>
                                </div>
                            </div>
                        `
                )
                .join('')}
                    </div>
                </div>

                <!-- ACTIVE MISSION SENTINEL -->
                <div class="p-4 rounded-[3px] border border-[rgba(63,63,70,0.5)] bg-[var(--vs-bg-panel)] ">
                    <span class="hud-badge-micro mb-3 block">Mission Focus</span>
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-[3px] hud-bg-cyan flex items-center justify-center hud-border-cyan">
                            <i class="icon i-book h-5 w-5 text-[var(--vs-accent)]"></i>
                        </div>
                        <div>
                            <h3 class="text-[13px] font-light text-[var(--vs-text-title)] Thai-Rule leading-tight">ภาษาไทย ป.6/1</h3>
                            <p class="text-[13px] text-[var(--vs-text-muted)]">Step 2: Acquisition</p>
                        </div>
                    </div>
                    <div class="mt-4">
                        <button onclick="ManagementEngine.startMission()" class="w-full py-2 bg-[var(--vs-accent)] text-zinc-900 hud-badge-micro rounded-[3px]">
                            Resume Mastery
                        </button>
                    </div>
                </div>

                <!-- Behavioral Matrix (8 Traits) -->
                <div class="p-4 rounded-[3px] border border-[rgba(63,63,70,0.5)] bg-[var(--vs-bg-deep)]">
                    <span class="hud-badge-micro mb-4 block">Behavioral Matrix</span>
                    <div class="grid grid-cols-2 gap-x-4 gap-y-4">
                        ${this.renderTrait('PATRIOTISM', this.characteristics.PATRIOTISM, 'text-pink-500')}
                        ${this.renderTrait('INTEGRITY', this.characteristics.INTEGRITY, 'text-zinc-100')}
                        ${this.renderTrait('DISCIPLINE', this.characteristics.DISCIPLINE, 'text-[var(--vs-text-muted)]')}
                        ${this.renderTrait('LEARNING_DHAMMA', this.characteristics.LEARNING, 'text-[var(--vs-accent)]')}
                        ${this.renderTrait('SUFFICIENCY', this.characteristics.SUFFICIENCY, 'text-emerald-500')}
                        ${this.renderTrait('COMMITMENT', this.characteristics.COMMITMENT, 'text-amber-500')}
                        ${this.renderTrait('THAINESS', this.characteristics.THAINESS, 'text-rose-500')}
                        ${this.renderTrait('PUBLIC_MIND', this.characteristics.PUBLIC_MIND, 'text-violet-500')}
                    </div>
                </div>
            </div>
        `;
    },

    // --- LEGACY RENDERERS REMOVED FOR CLEAN SLATE ---
    renderMainDashboard(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const user = window.getCurrentUser();

        container.innerHTML = `
            <div class="space-y-10 animate-in fade-in duration-500 pb-20">
                <!-- CLEAN SLATE: AWAITING INTELLIGENCE HUB DESIGN -->
                <section class="flex flex-col items-center justify-center p-20 border border-dashed border-[rgba(63,63,70,0.5)] rounded-[3px] opacity-20">
                    <i class="icon i-cpu h-16 w-16 mb-6"></i>
                    <div class="hud-badge-micro text-lg uppercase mb-2">Protocol: CLEAN_SLATE_V1</div>
                    <div class="text-[10px] font-mono uppercase">Awaiting Unified Intelligence Hub Matrix for role: ${user.role}</div>
                </section>

                <!-- Intelligence DNA Matrix (Global Context) -->
                ${user.role === 'STUDENT'
                ? `
                <section class="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-10 border-t border-[rgba(63,63,70,0.5)]">
                    <div class="space-y-4">
                        <h2 class="text-[13px] font-light text-[var(--vs-text-muted)] uppercase">Neural DNA Profile</h2>
                        ${this.renderNeuralDNA()}
                    </div>
                    <div class="space-y-4">
                        <h2 class="text-[13px] font-light text-[var(--vs-text-muted)] uppercase">Active Behavioral Matrix</h2>
                        <div class="p-6 rounded-[3px] bg-[var(--vs-bg-deep)] border border-[rgba(63,63,70,0.5)] h-full">
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                ${this.renderTrait('Patriotism', 95, 'text-red-400')}
                                ${this.renderTrait('Integrity', 88, 'text-emerald-400')}
                                ${this.renderTrait('Discipline', 92, 'text-amber-400')}
                                ${this.renderTrait('Learning Mindset', 85, 'text-blue-400')}
                                ${this.renderTrait('Sufficient Living', 90, 'text-green-500')}
                                ${this.renderTrait('Dedication', 87, 'text-violet-400')}
                            </div>
                        </div>
                    </div>
                </section>
                `
                : ''
            }
            </div>
        `;
    },

    renderUnityCard(mission) {
        const group = this.curriculumGroups[mission.id.replace('SUB_', '')] || {
            name: mission.label,
            icon: mission.icon,
            color: 'var(--vs-accent)',
            bg: 'rgba(var(--vs-accent-rgb), 0.1)',
        };

        return `
            <div class="group relative rounded-[3px] border border-[rgba(63,63,70,0.5)] bg-[var(--vs-bg-card)] hover:border-white/40 transition-all duration-300  overflow-hidden cursor-pointer"
                 onclick="window.ManagementEngine.handleMenuClick('${mission.id}', '${mission.path}', 'PRIMARY')">
                <div class="absolute top-0 left-0 w-full h-[2px] bg-[var(--vs-accent)] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div class="p-6">
                    <div class="flex justify-between items-start mb-6">
                        <div class="w-12 h-12 rounded-[3px] flex items-center justify-center border border-[rgba(63,63,70,0.5)] bg-[var(--vs-bg-deep)] group-hover:bg-white/10 transition-colors">
                            <i class="icon ${group.icon} h-6 w-6" style="background-color: ${group.color} !important"></i>
                        </div>
                        <div class="flex items-center justify-center p-1 rounded-[3px] border border-white/20 bg-white/10">
                            <span class="hud-badge-micro font-light text-[var(--vs-accent)] uppercase px-1">Protocol Ready</span>
                        </div>
                    </div>

                    <div class="mb-6">
                        <h3 class="text-xl font-light text-[var(--vs-text-title)] Thai-Rule mb-1">${group.name}</h3>
                        <p class="text-[13px] text-[var(--vs-text-muted)] uppercase font-light opacity-40">Status: Mission Active</p>
                    </div>

                    <div class="space-y-2">
                        <div class="flex justify-between hud-badge-micro font-light">
                            <span>Mastery Progress</span>
                            <span style="color: ${group.color}">70%</span>
                        </div>
                        <div class="h-[3px] bg-[var(--vs-bg-deep)] rounded-[3px] overflow-hidden">
                            <div class="h-full transition-all duration-1000" style="background-color: ${group.color} !important; width: 70%"></div>
                        </div>
                    </div>

                    <div class="mt-6 flex items-center justify-between hud-badge-micro uppercase opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                        <span>Initiate HUD Link</span>
                        <i class="icon i-chevron-right h-3 w-3"></i>
                    </div>
                </div>
            </div>
        `;
    },

    // --- LEGACY RENDERERS REMOVED ---

    renderNeuralDNA() {
        return `
            <div class="p-6 rounded-[3px] border border-[rgba(var(--vs-accent-rgb),0.2)] bg-[var(--vs-bg-card)]  space-y-6">
                <!-- Core Behavioral Traits -->
                <div class="grid grid-cols-2 gap-4">
                    ${this.renderTrait('Grit & Resilience', 85, 'text-[var(--vs-accent)]')}
                    ${this.renderTrait('Soft Skills', 72, 'text-amber-500')}
                    ${this.renderTrait('Analytical Cognitive', 94, 'text-blue-400')}
                    ${this.renderTrait('Public Mindset', 68, 'text-[var(--vs-success)]')}
                </div>

                <!-- Live Neural Activity -->
                <div class="pt-6 border-t border-[rgba(63,63,70,0.5)]">
                    <div class="hud-badge-micro mb-4">Live Cognitive Load</div>
                    <div class="space-y-3">
                        ${Object.entries(this.neuralMatrix)
                .map(
                    ([key, val]) => `
                            <div>
                                <div class="flex justify-between text-[13px] mb-1.5">
                                    <span class="text-[var(--vs-text-title)] uppercase font-light">${key} Pulse</span>
                                    <span class="text-[var(--vs-accent)]">${val}%</span>
                                </div>
                                <div class="h-[3px] bg-[var(--vs-bg-deep)] rounded-[3px] overflow-hidden">
                                    <div class="h-full bg-[var(--vs-accent)] transition-all duration-1000" style="width: ${val}%"></div>
                                </div>
                            </div>
                        `
                )
                .join('')}
                    </div>
                </div>

                <!-- Character Assessment Indicator -->
                <div class="pt-6 border-t border-[rgba(63,63,70,0.5)]">
                    <div class="p-3 bg-[var(--vs-bg-deep)] rounded-[3px] border border-[rgba(63,63,70,0.5)]">
                        <div class="hud-badge-micro uppercase font-light mb-1">Active Character Status</div>
                        <div class="flex justify-between items-center">
                            <span class="text-[13px] font-light text-[var(--vs-text-title)] Thai-Rule">วินัยและความรับผิดชอบ</span>
                            <span class="text-[13px] text-[var(--vs-success)] font-light uppercase italic">A+ Excellent</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Teacher Specific State
    teacherViewMode: 'CLASS', // 'CLASS' or 'SUBJECT'

    // Mock Intervention Data (Stuck in Mastery steps)
    interventions: [
        { name: 'ด.ช. แมน สมใจ', step: 'Sync', duration: '45m', risk: 'High' },
        { name: 'ด.ญ. มาลี รักเรียน', step: 'Audit', duration: '12m', risk: 'Low' },
        { name: 'ด.ช. สมชาย มีโชค', step: 'Do', duration: '30m', risk: 'Medium' },
    ],

    getStudentMenu() {
        return [
            {
                section: 'Mission: Primary',
                items: [
                    {
                        id: 'SUB_THAI',
                        label: 'ภาษาไทย',
                        icon: 'i-book',
                        color: '#60a5fa',
                        type: 'PRIMARY',
                        path: 'pages/mission_hud.html?id=THAI',
                    },
                    {
                        id: 'SUB_MATH',
                        label: 'คณิตศาสตร์',
                        icon: 'i-squares',
                        color: '#f472b6',
                        type: 'PRIMARY',
                        path: 'pages/mission_hud.html?id=MATH',
                    },
                    {
                        id: 'SUB_SCI',
                        label: 'วิทยาศาสตร์',
                        icon: 'i-lightning',
                        color: '#34d399',
                        type: 'PRIMARY',
                        path: 'pages/mission_hud.html?id=SCI',
                    },
                    {
                        id: 'SUB_SOC',
                        label: 'สังคมศึกษา',
                        icon: 'i-users',
                        color: '#fbbf24',
                        type: 'PRIMARY',
                        path: 'pages/mission_hud.html?id=SOC',
                    },
                    {
                        id: 'SUB_HIST',
                        label: 'ประวัติศาสตร์',
                        icon: 'i-library',
                        color: '#c084fc',
                        type: 'PRIMARY',
                        path: 'pages/mission_hud.html?id=HIST',
                    },
                    {
                        id: 'SUB_PE',
                        label: 'สุขศึกษาและพลศึกษา',
                        icon: 'i-shield',
                        color: '#f87171',
                        type: 'PRIMARY',
                        path: 'pages/mission_hud.html?id=PE',
                    },
                    {
                        id: 'SUB_ART',
                        label: 'ศิลปะ',
                        icon: 'i-academic',
                        color: '#fb923c',
                        type: 'PRIMARY',
                        path: 'pages/mission_hud.html?id=ART',
                    },
                    {
                        id: 'SUB_WORK',
                        label: 'การงานอาชีพ',
                        icon: 'i-cog',
                        color: '#94a3b8',
                        type: 'PRIMARY',
                        path: 'pages/mission_hud.html?id=WORK',
                    },
                    {
                        id: 'SUB_ENG',
                        label: 'ภาษาต่างประเทศ',
                        icon: 'i-cube',
                        color: '#22d3ee',
                        type: 'PRIMARY',
                        path: 'pages/mission_hud.html?id=ENG',
                    },
                ],
            },
            {
                section: 'Mission: Secondary',
                items: [
                    {
                        id: 'TASK_HOMEWORK',
                        label: 'ส่งงาน/การบ้าน',
                        icon: 'i-clipboard-check',
                        type: 'SECONDARY',
                        path: 'pages/tasks.html',
                    },
                    {
                        id: 'TASK_ANNOUNCE',
                        label: 'ประกาศจากโรงเรียน',
                        icon: 'i-chart',
                        type: 'SECONDARY',
                        path: 'pages/announcements.html',
                    },
                    {
                        id: 'TASK_SCHEDULE',
                        label: 'ตารางเรียนของตนเอง',
                        icon: 'i-calendar',
                        type: 'SECONDARY',
                        path: 'pages/schedule.html',
                    },
                ],
            },
        ];
    },

    getTeacherMenu() {
        // Base Menu
        const menu = [
            {
                section: 'Mission: Primary',
                items: [
                    {
                        id: 'CLASS_61',
                        label: 'ห้องเรียน ป.6/1',
                        icon: 'i-users',
                        type: 'PRIMARY',
                        path: 'pages/class_hud.html?id=61',
                    },
                    {
                        id: 'CLASS_62',
                        label: 'ห้องเรียน ป.6/2',
                        icon: 'i-users',
                        type: 'PRIMARY',
                        path: 'pages/class_hud.html?id=62',
                    },
                ],
            },
            {
                section: 'Mission: Secondary',
                items: [
                    {
                        id: 'TASK_GRADES',
                        label: 'บันทึกคะแนน (ปพ.)',
                        icon: 'i-clipboard-check',
                        type: 'SECONDARY',
                        path: 'pages/grades.html',
                    },
                    {
                        id: 'TASK_ATTENDANCE',
                        label: 'เช็คชื่อ/บันทึกเวลา',
                        icon: 'i-check',
                        type: 'SECONDARY',
                        path: 'pages/attendance.html',
                    },
                    {
                        id: 'TASK_SCHEDULE',
                        label: 'ตารางสอนของตนเอง',
                        icon: 'i-calendar',
                        type: 'SECONDARY',
                        path: 'pages/schedule.html',
                    },
                    {
                        id: 'TASK_PLAN',
                        label: 'แผนการจัดการเรียนรู้',
                        icon: 'i-document-duplicate',
                        type: 'SECONDARY',
                        path: 'pages/lesson_plans.html',
                    },
                    {
                        id: 'TASK_SUBJECT_CARDS',
                        label: 'จัดการการ์ดวิชา',
                        icon: 'i-document-plus',
                        type: 'SECONDARY',
                        path: 'pages/subject_cards.html',
                    },
                ],
            },
        ];

        return menu;
    },

    getAdminMenu(title) {
        return [
            {
                section: '0 — 🏠 DASHBOARD ผอ.',
                items: [
                    { id: 'DIR_DASHBOARD', label: 'Overview โรงเรียน', icon: 'i-chart', path: 'pages/director_dashboard.html', directorOnly: true },
                    { id: 'DIR_INBOX', label: 'กล่องรออนุมัติ', icon: 'i-inbox', path: 'pages/director_inbox.html', badge: 3, directorOnly: true },
                    { id: 'DIR_ALERTS', label: 'แจ้งเตือนด่วน', icon: 'i-bell', path: 'pages/director_alerts.html', badge: 2, directorOnly: true },
                    { id: 'SCHOOL_CALENDAR', label: 'ปฏิทินโรงเรียน', icon: 'i-calendar', path: 'pages/school_calendar.html' },
                ],
            },
            {
                section: '1 — 📚 วิชาการ',
                items: [
                    { id: 'ADMIN_SCHEDULE_D1', label: 'ตารางสอน (Domain 1)', icon: 'i-calendar', path: 'pages/schedule/domain1.html' },
                    { id: 'ADMIN_SCHEDULE_D2', label: 'งานสนับสนุน (Domain 2)', icon: 'i-shield', path: 'pages/schedule/domain2.html' },
                    { id: 'ADMIN_SCHEDULE_D3', label: 'พัฒนาคุณภาพ (Domain 3)', icon: 'i-chart', path: 'pages/schedule/domain3.html' },
                    { id: 'ADMIN_SCHEDULE_D4', label: 'นโยบาย (Domain 4)', icon: 'i-globe', path: 'pages/schedule/domain4.html' },
                    { id: 'ADMIN_AUTO_SCHED', label: 'Auto Schedule + ผลลัพธ์', icon: 'i-lightning', path: 'pages/auto_schedule.html' },
                    { id: 'ADMIN_MATRIX', label: 'มอบหมายวิชา/ครู (Matrix)', icon: 'i-squares', path: 'pages/teacher_management.html' },
                    { id: 'ADMIN_RESULTS', label: 'ผลการเรียนรวม', icon: 'i-trending-up', path: 'pages/academic_results.html' },
                    { id: 'DIR_SIGN_SOR1', label: 'ลงนาม ปพ.1', icon: 'i-document', path: 'pages/sign_sor1.html', directorOnly: true },
                    { id: 'ADMIN_DNA_VIEW', label: 'DNA Overview โรงเรียน', icon: 'i-cpu', path: 'pages/school_dna.html' },
                ],
            },
            {
                section: '2 — 👥 บุคคล',
                items: [
                    { id: 'ADMIN_PERSONNEL', label: 'ฐานข้อมูลบุคลากร', icon: 'i-users', path: 'pages/teacher_management.html' },
                    { id: 'ADMIN_ADD_TEACHER', label: 'เพิ่มบุคลากร', icon: 'i-user-plus', path: 'pages/add_teacher.html', isSubmenu: true },
                    { id: 'ADMIN_WORKLOAD', label: 'ภาระงาน 4 ด้าน (รวม)', icon: 'i-chart', path: 'pages/workload_overview.html' },
                    { id: 'DIR_WPA', label: 'ประเมิน วPA (ผู้ประเมิน)', icon: 'i-shield', path: 'pages/wpa_director.html', directorOnly: true },
                    { id: 'ADMIN_PLC', label: 'PLC ติดตาม', icon: 'i-users', path: 'pages/plc_tracker.html' },
                    { id: 'DIR_ORDERS', label: 'คำสั่งมอบหมายงาน', icon: 'i-document', path: 'pages/duty_orders.html', directorOnly: true },
                    { id: 'DIR_DELEG_TRACK', label: 'ติดตามภาระงานมอบหมาย', icon: 'i-clipboard', path: 'pages/delegation_tracker.html', directorOnly: true },
                ],
            },
            {
                section: '3 — 🎓 กิจการนักเรียน',
                items: [
                    { id: 'STU_REGISTRY', label: 'ทะเบียนนักเรียน', icon: 'i-users', path: 'pages/students.html' },
                    { id: 'STU_INPUT', label: 'เพิ่ม/รับนักเรียน', icon: 'i-user-plus', path: 'pages/student_input.html' },
                    { id: 'STU_ATTEND_OV', label: 'สถิติการมาเรียน (รวม)', icon: 'i-clock', path: 'pages/attendance_overview.html' },
                    { id: 'STU_AT_RISK', label: 'นักเรียนกลุ่มเสี่ยง', icon: 'i-alert', path: 'pages/at_risk_students.html', badge: 2 },
                    { id: 'DIR_SIGN_SOR2', label: 'ลงนาม ปพ.2', icon: 'i-document', path: 'pages/sign_sor2.html', directorOnly: true },
                ],
            },
            {
                section: '4 — 💰 งบประมาณ',
                items: [
                    { id: 'BUDGET_PLAN', label: 'แผนงบประมาณประจำปี', icon: 'i-document', path: 'pages/budget_plan.html' },
                    { id: 'BUDGET_TRACK', label: 'ติดตามการเบิกจ่าย', icon: 'i-chart', path: 'pages/budget_tracker.html' },
                    { id: 'DIR_APPROVE', label: 'อนุมัติเบิกจ่าย', icon: 'i-check', path: 'pages/budget_approve.html', directorOnly: true },
                ],
            },
            {
                section: '5 — 🏫 บริหารทั่วไป',
                items: [
                    { id: 'ADMIN_SCHOOL_SETUP', label: 'โครงสร้างสถานศึกษา', icon: 'i-office', path: 'pages/school_setup.html' },
                    { id: 'DIR_CONFIG', label: 'Smart Config (ผอ.)', icon: 'i-cog', path: 'pages/director_config.html', directorOnly: true },
                    { id: 'ADMIN_DOCS', label: 'ระบบเอกสารราชการ', icon: 'i-folder', path: 'pages/admin_docs.html' },
                    { id: 'DIR_SIGN_QUEUE', label: 'ลงนามเอกสารด่วน', icon: 'i-document', path: 'pages/sign_queue.html', directorOnly: true },
                ],
            },
            {
                section: '6 — 📊 ประกันคุณภาพ',
                items: [
                    { id: 'ADMIN_STATS', label: 'สถิติรวมโรงเรียน', icon: 'i-chart', path: 'pages/admin_stats.html' },
                    { id: 'ADMIN_ACHIEVE', label: 'ผลสัมฤทธิ์นักเรียน', icon: 'i-trending-up', path: 'pages/achievement_report.html' },
                    { id: 'ADMIN_SAR', label: 'SAR (รายงานตนเอง)', icon: 'i-document', path: 'pages/sar.html' },
                    { id: 'ADMIN_STANDARDS', label: 'ตัวชี้วัดมาตรฐาน 3 ด้าน', icon: 'i-shield', path: 'pages/standards_kpi.html' },
                ],
            },
        ];
    },

    getParentMenu() {
        return [
            {
                section: 'Child Supervision',
                items: [
                    {
                        id: 'CHILD_PROGRESS',
                        label: 'ติดตามการเรียน',
                        icon: 'i-trending-up',
                        type: 'PRIMARY',
                        path: 'pages/child_progress.html',
                    },
                    {
                        id: 'CHILD_ATTEND',
                        label: 'ประวัติเข้าเรียน',
                        icon: 'i-clock',
                        type: 'SECONDARY',
                        path: 'pages/child_attendance.html',
                    },
                    {
                        id: 'TEACHER_CHAT',
                        label: 'ติดต่อครูประจำชั้น',
                        icon: 'i-chat',
                        type: 'SECONDARY',
                        path: 'pages/chat.html',
                    },
                ],
            },
        ];
    },

    /**
     * --- MASTERY FLOW (7-STEP) ---
     */
    startMission(isNew = false) {
        if (!this.currentSubjectID) return;

        // Redirection logic: Move from Sidebar focus to Main Stage focus
        const mainFrame = document.getElementById('main-frame');
        if (mainFrame) {
            mainFrame.src = 'pages/learning_flow.html';

            // Update breadcrumb to show we are inside a mission
            const subjectId = this.currentSubjectID.replace('SUB_', '');
            const subject = IDLPMS_DATA.curriculum[subjectId] || { name: 'Active Mission' };
            const breadcrumbPage = document.getElementById('header-page-name');
            if (breadcrumbPage) {
                breadcrumbPage.innerHTML = `<span class="text-[var(--vs-accent)]">${subject.name}</span> <span class="opacity-30">/</span> MASTERY EXECUTION`;
            }
        }

        // Keep activeModule on currentSubjectID so sidebar stays on Subject HUD
        this.isMissionActive = true;

        if (isNew) {
            this.currentStep = 1;
            this.videoWatchedPercent = 0;
            this._hlsPassNotified = false;
            // Reset step timing for new lesson
            this.stepTiming = {
                stepStartTime: null,
                stepTimes: {},
                lessonStartTime: null,
                totalLessonTime: 0,
                pretestAnswers: [],
                posttestAnswers: [],
                stepCompleted: [false, false, false, false, false, false, false], // Tracks completion for steps 1-7
            };
            // Dev bypass mode (toggle with hidden button)
            this.devBypassEnabled = this.devBypassEnabled || false;
            // Reset behavior log for new lesson
            this.behaviorLog = {
                violations: [],
                tabSwitchCount: 0,
                focusLossCount: 0,
                suspiciousFlags: [],
            };
        }

        // Start timing for current step
        this.startStepTimer();
        // Initialize step-specific behavior tracking
        this.initStepBehaviorTracking();

        this.renderDashboard();

        if (this.currentStep === 3) {
            setTimeout(() => this.loadHLSVideo(), 200);
        }
    },

    exitMission() {
        const mainFrame = document.getElementById('main-frame');
        if (mainFrame && this.currentSubjectID) {
            mainFrame.src = `pages/mission_hud.html?id=${this.currentSubjectID.replace('SUB_', '')}`;
        }

        if (this.missionTimerInterval) {
            clearInterval(this.missionTimerInterval);
            this.missionTimerInterval = null;
        }

        this.activeModule = 'OVERVIEW';
        this.renderDashboard();
    },

    currentLessonIndex: 0, // State for active lesson
    currentQuestionIndex: 0, // State for active quiz question

    // History of DNA scores per lesson for calculation
    dnaHistory: {
        // e.g., 'HIST': [ { k: 80, p: 70, a: 90, e: 85, d: 88 }, ... ]
    },

    renderDNAItem(label, value, colorClass) {
        return `
            <div class="space-y-1">
                <div class="flex justify-between items-center hud-badge-micro">
                    <span class="text-[var(--vs-text-muted)] uppercase font-light">${label}</span>
                    <span class="${colorClass} font-mono">${value}%</span>
                </div>
                <div class="h-[2px] bg-[var(--vs-border)] rounded-[3px] overflow-hidden">
                    <div class="h-full bg-current ${colorClass}" style="width: ${value}%"></div>
                </div>
            </div>
        `;
    },

    /**
     * Get Unified DNA Dimensions based on Role & Archetype
     * Ensures "Unity" across the IDLPMS ecosystem.
     */
    getRoleDimensions(user) {
        const role = user.role || 'STUDENT';
        const grade = user.gradeLevel || 1;
        const type = user.type || 'SYSTEM_ENROLLED';

        // 🧬 Unity Core: 5-Axis KPA+ Standard (K, P, A, E, D)
        let config = {
            labels: ['K', 'P', 'A', 'E', 'D'],
            keys: ['k', 'p', 'a', 'e', 'd'],
            benchmark: { K: 70, P: 70, A: 70, E: 70, D: 70 }
        };

        if (role === 'STUDENT') {
            if (grade <= 3) {
                // Primary Core 4 (K, P, A, D)
                config = {
                    labels: ['K', 'P', 'A', 'D'],
                    keys: ['k', 'p', 'a', 'd'],
                    benchmark: { K: 70, P: 70, A: 70, D: 70 }
                };
            } else {
                // Standard KPA+ for Grade 4-12 and Vocational
                config = {
                    labels: ['K', 'P', 'A', 'E', 'D'],
                    keys: ['k', 'p', 'a', 'e', 'd'],
                    benchmark: { K: 75, P: 75, A: 75, E: 80, D: 85 }
                };
            }
        } else if (role === 'TEACHER') {
            // Teacher Dimensions mapped to KPA+ (C: Content, P: Pedagogy, M: Management)
            config = {
                labels: ['C', 'P', 'A', 'E', 'M'],
                keys: ['k', 'p', 'a', 'e', 'd'],
                benchmark: { C: 85, P: 85, A: 80, E: 80, M: 85 }
            };
        } else if (role === 'PARENT') {
            // Parent Dimensions (M: Monitor, S: Support, E: Engagement)
            config = {
                labels: ['M', 'S', 'A', 'C', 'P'],
                keys: ['d', 'p', 'a', 'e', 'k'],
                benchmark: { M: 80, S: 80, A: 90, C: 80, P: 70 }
            };
        } else { // Admin/Director
            config = {
                labels: ['A', 'Q', 'E', 'S', 'L'],
                keys: ['k', 'p', 'a', 'e', 'd'],
                benchmark: { A: 80, Q: 85, E: 90, S: 85, L: 95 }
            };
        }
        return config;
    },

    /**
     * Calculate DNA Stats for the Spider Chart
     */
    calculateDNAStats() {
        const rawId = this.currentSubjectID?.replace('SUB_', '');
        const history = (this.dnaHistory && this.dnaHistory[rawId]) || [];

        // 🧬 Baseline for KPA+ 5-Axis: k, p, a, e, d
        let k = 55, p = 55, a = 55, e = 55, d = 55;

        if (history.length > 0) {
            const totals = history.reduce((acc, curr) => ({
                k: acc.k + (curr.k || 50),
                p: acc.p + (curr.p || 50),
                a: acc.a + (curr.a || 50),
                e: acc.e + (curr.e || 50),
                d: acc.d + (curr.d || 50)
            }), { k: 0, p: 0, a: 0, e: 0, d: 0 });

            k = totals.k / history.length;
            p = totals.p / history.length;
            a = totals.a / history.length;
            e = totals.e / history.length;
            d = totals.d / history.length;
        }

        // 🧠 Live DNA Integration: factor in current session's neural buffer
        const buffer = this.stepTiming.neuralBuffer;
        const getBufferAvg = (dim, currentVal) => {
            const signals = buffer[dim] || [];
            if (signals.length === 0) return currentVal;
            const avg = signals.reduce((sum, s) => sum + s.value, 0) / signals.length;
            return (currentVal * 0.7) + (avg * 0.3);
        };

        return {
            k: Math.round(getBufferAvg('K', k)),
            p: Math.round(getBufferAvg('P', p)),
            a: Math.round(getBufferAvg('A', a)),
            e: Math.round(getBufferAvg('E', e)),
            d: Math.round(getBufferAvg('D', d))
        };
    },

    toggleLessonSelector() {
        const selector = document.getElementById('lesson-selector-dropdown')
            || window.frames['main-frame']?.contentDocument?.getElementById('lesson-selector-dropdown');
        if (selector) {
            selector.classList.toggle('hidden');
        }
    },

    changeLesson(globalIndex) {
        this.currentLessonIndex = globalIndex;
        this.currentStep = 1; // Start at step 1 for new lesson
        this.currentQuestionIndex = 0;
        this.videoWatchedPercent = 0;
        this._hlsPassNotified = false;

        // Hide selector
        const selector = document.getElementById('lesson-selector-dropdown')
            || window.frames['main-frame']?.contentDocument?.getElementById('lesson-selector-dropdown');
        if (selector) selector.classList.add('hidden');

        // If already in mission flow, re-render
        if (this.activeMissionContainer || document.getElementById('learning-flow-container')) {
            this.renderMasteryFlow();
        }
    },

    renderMasteryFlow(container) {
        // If container is provided, store it as the target for this mission session
        if (container) this.activeMissionContainer = container;

        // Target container resolution
        const targetContainer = container || this.activeMissionContainer || document.getElementById('learning-flow-container');
        if (!targetContainer) return;

        // CHECK: If failing/cooling down, render the FAIL layout instead
        if (this.isRewindCoolingDown && this.failData) {
            return this.renderFailState(targetContainer);
        }

        const step = this.masterySteps[this.currentStep - 1];
        const subject = IDLPMS_DATA.curriculum[this.currentSubjectID?.replace('SUB_', '')] || { name: 'วิชาทั่วไป' };

        // Flatten all lessons into a single array
        const allLessons = [];
        subject.units?.forEach(unit => {
            unit.lessons.forEach(l => {
                allLessons.push({ ...l, unitName: unit.name });
            });
        });

        // Resolve current lesson dynamic
        const lesson = allLessons[this.currentLessonIndex] || allLessons[0] || { name: 'บทนำ' };

        targetContainer.innerHTML = `
            <div class="flex flex-col h-full animate-in slide-in-from-right-2 duration-300 relative">
                 <!-- Lesson Selector Overlay -->
                <div id="lesson-selector-dropdown" class="hidden absolute top-16 left-0 z-50 w-96 max-h-[600px] overflow-y-auto bg-[var(--vs-bg-deep)] border border-[rgba(63,63,70,0.5)] rounded-[3px] animate-in fade-in zoom-in-95 duration-200">
                    <div class="p-4 border-b border-[rgba(63,63,70,0.5)] bg-[var(--vs-bg-panel)] sticky top-0 flex items-center justify-between">
                        <h3 class="text-[13px] font-light text-[var(--vs-text-title)] uppercase">Select Learning Module</h3>
                        <span class="hud-badge-micro text-[var(--vs-text-muted)] opacity-50">PROTOCOL</span>
                    </div>
                    <div class="p-2 space-y-1">
                        ${allLessons.map((l, idx) => `
                            <button onclick="parent.ManagementEngine.changeLesson(${idx})" class="w-full text-left p-3 rounded-[3px] hover:bg-[rgba(var(--vs-accent-rgb),0.1)] border border-transparent hover:border-[rgba(var(--vs-accent-rgb),0.3)] group transition-all ${idx === this.currentLessonIndex ? 'bg-[rgba(var(--vs-accent-rgb),0.2)] border-[rgba(var(--vs-accent-rgb),0.5)]' : ''}">
                                <div class="flex items-center justify-between mb-1">
                                    <div class="hud-badge-micro text-[var(--vs-accent)] uppercase">MODULE ${idx + 1}</div>
                                    <div class="hud-badge-micro text-[var(--vs-text-muted)] opacity-50 uppercase">${l.type || 'PROTOCOL'}</div>
                                </div>
                                <div class="text-[13px] font-light text-[var(--vs-text-title)] Thai-Rule line-clamp-1 mb-0.5 group-hover:text-white">${l.name}</div>
                                <div class="text-[13px] font-light text-[var(--vs-text-muted)] Thai-Rule line-clamp-1 opacity-70 group-hover:opacity-100">${l.unitName}</div>
                            </button>
                        `).join('')}
                    </div>
                    </div>
                </div>

            <!-- Module Header (simplified, keeps only text context) -->
            <div class="flex items-center justify-between mb-6 pb-4 border-b border-[rgba(63,63,70,0.5)]">
                <div class="flex items-center gap-4">
                    <button onclick="parent.ManagementEngine.exitMission()" class="p-2 hover:bg-[rgba(39,39,42,0.5)] rounded-[3px] text-[var(--vs-text-muted)] transition-colors">
                        <i class="icon i-chevron-left h-6 w-6"></i>
                    </button>
                    <div>
                        <div class="flex items-baseline gap-3 group cursor-pointer" onclick="parent.ManagementEngine.toggleLessonSelector()">
                            <h1 class="text-2xl font-light text-[var(--vs-text-title)] Thai-Rule leading-none">${subject.name}</h1>
                            <span class="text-xl text-[var(--vs-text-muted)] font-light">|</span>
                            <h2 class="text-xl font-light text-[var(--vs-accent)] Thai-Rule hover:text-white transition-all">
                                บทที่ ${window.formatNumberStandard(this.currentLessonIndex + 1)}: ${lesson.name}
                                <i class="icon i-chevron-down inline-block ml-2 w-4 h-4 opacity-50 group-hover:opacity-100"></i>
                            </h2>
                        </div>
                    </div>
                </div>
                
                <div class="flex flex-col items-end">
                    <div class="text-[13px] text-[var(--vs-text-muted)] uppercase mb-1 font-mono">Mastery Status</div>
                    <div class="text-2xl font-black text-[var(--vs-accent)] uppercase">
                        MODULE ${(this.currentLessonIndex + 1).toString().padStart(2, '0')}
                        <span class="text-[13px] opacity-30 text-[var(--vs-text-title)]">/${allLessons.length.toString().padStart(2, '0')}</span>
                    </div>
                </div>
            </div>

                <!-- Content Area -->
            <div class="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div class="lg:col-span-3 space-y-6">
                    <div class="p-8 rounded-[3px] bg-[var(--vs-bg-panel)] border border-[rgba(63,63,70,0.5)] relative overflow-hidden min-h-[500px] flex flex-col">
                        <!-- Internal Mastery Step Roadmap (Unified 7-Step conduit - FULL WIDTH) -->
                        <div class="relative mb-8 w-full">
                            <!-- Horizontal Conduit Line -->
                            <div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-white/10 z-0"></div>
                            
                            <!-- Nodes Container -->
                            <div class="relative z-10 flex justify-between items-center w-full">
                                ${this.masterySteps.map((s, idx) => {
            const stepNum = idx + 1;
            const isActive = stepNum === this.currentStep;
            const isPast = stepNum < this.currentStep;
            return `
                                    <div class="flex flex-col items-center group cursor-pointer relative" onclick="try { parent.ManagementEngine.changeStep(${stepNum}); } catch(e) { }">
                                        <div class="vs-milestone-node 
                                            ${isActive ? 'vs-node-active animate-node-pulse' :
                    isPast ? 'vs-node-past' : 'vs-node-future'}">
                                            ${stepNum.toString().padStart(2, '0')}
                                        </div>
                                    </div>
                                `;
        }).join('')}
                            </div>
                        </div>

                        <!-- Phase Info -->
                        <div class="mb-6">
                            <div class="flex items-center justify-between mb-2">
                                <div class="hud-badge-micro text-[var(--vs-accent)] uppercase bg-[rgba(var(--vs-accent-rgb),0.1)] px-2 py-1 rounded-[3px] inline-block">
                                    Phase ${window.formatNumberStandard(this.currentStep)}/07: ${step.id}
                                </div>
                                <div class="flex items-center gap-2">
                                    <button onclick="parent.ManagementEngine.toggleDevBypass()"
                                        class="px-2 py-1 ${this.devBypassEnabled
                ? 'text-[rgba(251,191,36,1)] bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.3)]'
                : 'text-[var(--vs-text-muted)] opacity-30 hover:opacity-100'} transition-all rounded-[3px]"
                                        title="Toggle Dev Bypass Mode">
                                        <span class="uppercase font-light text-[13px]">${this.devBypassEnabled ? 'DEV ON' : 'DEV'}</span>
                                    </button>
                                    <div class="px-3 py-1 bg-[rgba(39,39,42,0.8)] rounded-[3px]">
                                        <span class="hud-badge-micro uppercase">${step.meta}</span>
                                    </div>
                                </div>
                            </div>
                            <h2 class="vs-title-thai-hero text-[var(--vs-text-title)] Thai-Rule leading-tight">${step.labelTH}</h2>
                            <p class="text-[13px] text-[var(--vs-text-muted)] mt-2 italic font-light">${step.description}</p>
                        </div>

                        <div class="flex-1">
                            ${this.renderStepContent()}
                        </div>
                    </div>
                </div>

                <!-- Right Feedback Panel -->
                <div class="lg:col-span-1 space-y-6 flex flex-col">
                    <div class="p-6 rounded-[3px] bg-[var(--vs-bg-card)] border border-[rgba(63,63,70,0.5)]">
                        <h3 class="hud-badge-micro text-[var(--vs-text-muted)] mb-4 uppercase">K-P-A Objectives</h3>
                        <div class="space-y-3">
                            ${(() => {
                const objectives = lesson.pedagogicalData?.objectives;
                if (!objectives) return '';

                // Handle both Array and Object formats
                if (Array.isArray(objectives) && objectives.length > 0) {
                    return objectives.map((obj, idx) => `
                                        <div class="flex items-start gap-3">
                                            <div class="w-2 h-2 rounded-[3px] mt-1.5 ${idx === 0 ? 'bg-[var(--vs-accent)]' : 'bg-zinc-600'}"></div>
                                            <span class="text-[13px] font-light text-[var(--vs-text-body)] Thai-Rule leading-relaxed">${obj}</span>
                                        </div>
                                    `).join('');
                } else if (typeof objectives === 'object') {
                    return ['K', 'P', 'A'].map(key => objectives[key] ? `
                                        <div class="flex items-start gap-3">
                                            <div class="w-2 h-2 rounded-[3px] mt-1.5 ${key === 'K' ? 'bg-[var(--vs-accent)]' : 'bg-zinc-600'}"></div>
                                            <span class="text-[13px] font-light text-[var(--vs-text-body)] Thai-Rule leading-relaxed">${key}: ${objectives[key]}</span>
                                        </div>
                                    ` : '').join('');
                }
                return `
                                    <div class="flex items-center gap-3 opacity-40">
                                        <div class="w-2 h-2 rounded-[3px] bg-zinc-700"></div>
                                        <span class="text-[13px] font-light text-[var(--vs-text-body)] Thai-Rule italic">ยังไม่มีข้อมูลจุดประสงค์</span>
                                    </div>
                                `;
            })()}
                        </div>
                    </div>

                    <div class="p-6 rounded-[3px] bg-[var(--vs-bg-deep)] border border-[rgba(63,63,70,0.5)]">
                        <h3 class="text-[var(--vs-text-muted)] mb-4 uppercase text-[13px] font-light">Neural DNA Impact</h3>
                        ${this.renderMiniMatrix()}
                    </div>

                    <div class="mt-auto">
                        <button id="next-step-btn" onclick="parent.ManagementEngine.nextStep()" class="w-full py-4 bg-[var(--vs-accent)] hover:bg-[rgba(var(--vs-accent-rgb),0.8)] text-zinc-900 rounded-[3px] text-[13px] font-light uppercase transition-all flex items-center justify-center gap-3">
                            <span>${this.currentStep === 7 ? 'FINISH MASTERY' : 'ESTABLISH NEXT PROTOCOL'}</span>
                            <i class="icon i-chevron-right h-5 w-5"></i>
                        </button>
                    </div>
                </div>
            </div>
            </div>
            `;

        // Start timer if not running
        if (!this.missionTimerInterval) {
            this.startMissionTimer();
        }
    },

    startMissionTimer() {
        if (this.missionTimerInterval) clearInterval(this.missionTimerInterval);

        this.missionTimerInterval = setInterval(() => {
            const timerEl = window.frames['main-frame']?.contentDocument?.getElementById('mission-timer')
                || document.getElementById('mission-timer');

            if (timerEl) {
                const diff = Math.floor((Date.now() - this.startTime) / 1000);
                const m = Math.floor(diff / 60).toString().padStart(2, '0');
                const s = (diff % 60).toString().padStart(2, '0');
                timerEl.innerText = `${m}:${s} `;
            }
        }, 1000);
    },

    renderStepContent() {
        const subject = IDLPMS_DATA.curriculum[this.currentSubjectID?.replace('SUB_', '')];

        // Flatten lessons for lookup (consistent with renderMasteryFlow)
        const allLessons = [];
        subject?.units?.forEach(unit => {
            unit.lessons.forEach(l => allLessons.push(l));
        });

        const lesson = allLessons[this.currentLessonIndex] || allLessons[0];
        const pedagogy = lesson?.pedagogicalData || {};

        // ─── Step 1: KNOW (Pre-test) ───
        if (this.currentStep === 1) {
            const quiz = pedagogy.quiz || [];
            if (quiz.length === 0) {
                return `<div class="p-10 text-center opacity-40">
            <p class="text-[13px] font-light text-[var(--vs-text-muted)] Thai-Rule italic">ยังไม่มีข้อมูล Pre-test สำหรับบทเรียนนี้</p>
                </div>`;
            }

            const q = quiz[this.currentQuestionIndex];
            const isLast = this.currentQuestionIndex === quiz.length - 1;

            return `
            <div class="space-y-8 animate-in fade-in duration-500">
                    <div class="flex items-center justify-between mb-2">
                        <div class="hud-badge-micro text-[var(--vs-accent)]">Question ${this.currentQuestionIndex + 1} of ${quiz.length}</div>
                        <div class="text-[13px] font-mono text-zinc-500">${Math.round(((this.currentQuestionIndex) / quiz.length) * 100)}% Complete</div>
                    </div>
                    
                    <div class="h-1 bg-zinc-800 rounded-[3px] overflow-hidden mb-8">
                        <div class="h-full bg-[var(--vs-accent)] transition-all duration-500" style="width: ${((this.currentQuestionIndex) / quiz.length) * 100}%"></div>
                    </div>

                    <h3 class="text-2xl font-light text-[var(--vs-text-title)] Thai-Rule leading-relaxed mb-8">
                        ${q.question}
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${q.options.map((opt, idx) => `
                            <button onclick="parent.ManagementEngine.submitQuizAnswer(${idx})" 
                                    class="p-4 text-left rounded-[3px] bg-[rgba(255,255,255,0.02)] border border-[rgba(63,63,70,0.5)] hover:bg-[rgba(var(--vs-accent-rgb),0.1)] hover:border-[rgba(var(--vs-accent-rgb),0.3)] group transition-all">
                                <span class="text-[13px] font-light text-[var(--vs-text-body)] Thai-Rule group-hover:text-white">${opt}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // ─── Step 2: LINK (K-P-A Objectives) ───
        if (this.currentStep === 2) {
            const objectives = pedagogy.objectives || {};
            const indicator = pedagogy.indicator || '';
            const isObjectFormat = typeof objectives === 'object' && !Array.isArray(objectives);

            const kpaLabels = {
                K: { label: 'K: ความรู้', color: 'var(--vs-accent)' },
                P: { label: 'P: กระบวนการ', color: '#22c55e' },
                A: { label: 'A: เจตคติ', color: '#a855f7' }
            };

            // Start countdown timer for Step 2
            setTimeout(() => this.startStep2Countdown(), 100);

            return `
            <div class="space-y-6">
                    <!-- Countdown Timer -->
            <div class="flex items-center justify-between p-3 bg-[rgba(var(--vs-accent-rgb),0.1)] border border-[rgba(var(--vs-accent-rgb),0.3)] rounded-[var(--vs-radius)]">
                <div class="flex items-center gap-3">
                    <i class="icon i-clock h-5 w-5 text-[var(--vs-accent)]"></i>
                    <span class="text-[13px] text-[var(--vs-text-body)]">Reading Time</span>
                </div>
                <div class="flex items-center gap-2">
                    <span id="step2-countdown" class="text-[13px] font-mono text-[var(--vs-accent)]">20</span>
                    <span class="text-[13px] text-[var(--vs-text-muted)]">sec remaining</span>
                </div>
            </div>
                    
                    ${indicator ? `
                        <div class="flex items-center gap-3">
                            <div class="px-3 py-1.5 bg-[rgba(var(--vs-accent-rgb),0.15)] border border-[rgba(var(--vs-accent-rgb),0.3)] rounded-[var(--vs-radius)]">
                                <span class="text-[13px] font-mono text-[var(--vs-accent)] uppercase">${indicator}</span>
                            </div>
                        </div>
                    ` : ''
                }

        <div class="p-6 bg-[var(--vs-bg-deep)] rounded-[3px] border border-[rgba(63,63,70,0.5)]">
            <h3 class="text-[13px] text-[var(--vs-accent)] mb-4 uppercase font-light">จุดประสงค์การเรียนรู้ K-P-A</h3>
            <div class="space-y-4">
                ${isObjectFormat
                    ? ['K', 'P', 'A'].map(key => objectives[key] ? `
                                    <div class="flex items-start gap-4 p-4 bg-[rgba(255,255,255,0.02)] rounded-[3px] border border-[rgba(63,63,70,0.5)]">
                                        <div class="w-10 h-10 rounded-[3px] flex items-center justify-center flex-shrink-0" style="background: rgba(${key === 'K' ? '0,204,255' : key === 'P' ? '34,197,94' : '168,85,247'},0.2)">
                                            <span class="text-[13px] font-light" style="color: ${kpaLabels[key].color}">${key}</span>
                                        </div>
                                        <div class="flex-1">
                                            <p class="text-[13px] text-[var(--vs-text-muted)] mb-1 uppercase font-light">${kpaLabels[key].label}</p>
                                            <p class="text-[13px] font-light text-[var(--vs-text-title)] Thai-Rule leading-relaxed">${objectives[key]}</p>
                                        </div>
                                    </div>
                                ` : '').join('')
                    : (Array.isArray(objectives) && objectives.length > 0
                        ? objectives.map((obj, idx) => `
                                        <div class="flex items-start gap-4 p-4 bg-[rgba(var(--vs-accent-rgb),0.05)] rounded-[3px] border border-[rgba(var(--vs-accent-rgb),0.2)]">
                                            <div class="w-8 h-8 rounded-[3px] bg-[rgba(var(--vs-accent-rgb),0.2)] flex items-center justify-center flex-shrink-0">
                                                <span class="text-[13px] font-light text-[var(--vs-accent)]">${idx + 1}</span>
                                            </div>
                                            <div class="flex-1">
                                                <p class="text-[13px] font-light text-[var(--vs-text-title)] Thai-Rule leading-relaxed">${obj}</p>
                                            </div>
                                        </div>
                                    `).join('')
                        : `
                                        <div class="text-center py-10 opacity-40">
                                            <p class="text-[13px] font-light text-[var(--vs-text-muted)] Thai-Rule italic">ยังไม่มีข้อมูลจุดประสงค์สำหรับบทเรียนนี้</p>
                                        </div>
                                    `
                    )
                }
            </div>
        </div>
                </div>
            `;
        }

        // ─── Step 3: DO (Video + Summary) ───
        if (this.currentStep === 3) {
            const useHLS = true;
            const summary = pedagogy.summary || '';
            const playerHTML = `
            <video id="dltv-hls-player" class="w-full h-full" controls playsinline>
                <source type="application/x-mpegURL" />
                </video>
            `;

            // REWIND Mode Banner (shown when returning after failure)
            const isRewindMode = this.rewindSourceStep !== null;
            const failedStepName = isRewindMode ? this.masterySteps[this.rewindSourceStep - 1]?.label : '';
            const rewindBanner = isRewindMode ? `
            <div class="p-4 bg-[rgba(239,68,68,0.15)] border-2 border-[rgba(239,68,68,0.5)] rounded-[var(--vs-radius)] mb-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-[var(--vs-radius)] bg-[rgba(239,68,68,0.2)] flex items-center justify-center flex-shrink-0">
                        <i class="icon i-refresh h-5 w-5 text-[rgba(239,68,68,0.9)]"></i>
                    </div>
                    <div class="flex-1">
                        <div class="hud-badge-micro text-[rgba(239,68,68,0.9)] mb-1 uppercase">
                            REWIND Protocol Active — Attempt ${this.rewatchCount}
                        </div>
                        <div class="text-[13px] font-light text-[var(--vs-text-title)] Thai-Rule">
                            คุณตกที่ขั้นตอน <span class="text-[rgba(239,68,68,0.9)] font-light">${failedStepName}</span> — ต้องดูวีดีโอผ่าน <span class="text-[var(--vs-accent)] font-mono">${this.requiredWatchPercent}%</span> ก่อนลองใหม่
                        </div>
                    </div>
                </div>
                </div>
            ` : '';

            return `
            <div class="space-y-4">
                ${rewindBanner}
                    
                    <!-- Video Player -->
                    <div class="aspect-video bg-black rounded-[var(--vs-radius)] overflow-hidden border border-[rgba(63,63,70,0.5)] relative group">
                        ${playerHTML}
                    </div>

                    <!-- Status Bar -->
                    <div class="flex items-center justify-between p-4 bg-[rgba(28,28,31,0.5)] rounded-[var(--vs-radius)] border border-[rgba(255,255,255,0.05)]${isRewindMode ? ' border-[rgba(239,68,68,0.3)]' : ''}">
                        <div class="flex items-center gap-4">
                            <div class="w-10 h-10 rounded-[var(--vs-radius)] ${isRewindMode ? 'bg-[rgba(239,68,68,0.1)]' : 'bg-[rgba(var(--vs-accent-rgb),0.1)]'} flex items-center justify-center">
                                <i class="icon ${isRewindMode ? 'i-refresh' : 'i-play'} h-5 w-5 ${isRewindMode ? 'text-[rgba(239,68,68,0.8)]' : 'text-[var(--vs-accent)]'}"></i>
                            </div>
                            <div>
                                <div class="hud-badge-micro mb-1 uppercase">
                                    ${isRewindMode ? `REWIND MODE — Required ${this.requiredWatchPercent}%` : (useHLS ? 'DLTV Live Stream Active' : 'Video Protocol Active')}
                                </div>
                                <div class="text-[13px] font-light text-[var(--vs-text-title)] Thai-Rule">
                                    ${isRewindMode ? 'ทบทวนเนื้อหาเพื่อเตรียมพร้อมลองอีกครั้ง' : 'รับชมวิดีโอเพื่อปลดล็อกขั้นตอนถัดไป'}
                                </div>
                            </div>
                        </div>

                        <div class="text-right">
                            <div class="hud-badge-micro mb-1 uppercase">Watch Progress</div>
                            <div class="flex items-center gap-2">
                                <div class="w-32 h-[3px] bg-[rgba(255,255,255,0.1)] rounded-[var(--vs-radius)] overflow-hidden">
                                <div id="watch-progress-bar" class="h-full ${isRewindMode ? 'bg-[rgba(239,68,68,0.8)]' : 'bg-[var(--vs-accent)]'} transition-all duration-500" style="width: ${this.videoWatchedPercent}%"></div>
                            </div>
                            <span class="text-[13px] font-mono ${isRewindMode ? 'text-[rgba(239,68,68,0.8)]' : 'text-[var(--vs-accent)]'}" id="watch-progress-text">${this.videoWatchedPercent}%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Lesson Summary (from Harvested Data) -->
            ${summary ? `
                        <div class="p-6 bg-[var(--vs-bg-deep)] rounded-[var(--vs-radius)] border border-[rgba(63,63,70,0.5)]">
                            <h3 class="hud-badge-micro text-[var(--vs-accent)] mb-3 uppercase">Key Points</h3>
                            <p class="text-[13px] font-light text-[var(--vs-text-body)] Thai-Rule leading-relaxed">${summary}</p>
                        </div>
                    ` : ''
                }

                    <!-- Sim button (HLS simulation placeholder) -->
            ${useHLS ? '' : `
                        <button onclick="parent.ManagementEngine.simulateVideoWatch()" class="w-full py-2 text-[13px] text-zinc-600 uppercase font-light hover:text-zinc-400 transition-colors">
                            [ Simulation: Advance Video Progress ]
                        </button>
                    `}
                </div>
            `;
        }

        // ─── Step 6: AUDIT (Post-test) ───
        if (this.currentStep === 6) {
            const quiz = pedagogy.quiz || [];
            if (quiz.length === 0) {
                return `<div class="p-10 text-center opacity-40">
            <p class="text-[13px] font-light text-[var(--vs-text-muted)] Thai-Rule italic">ยังไม่มีข้อมูล Post-test สำหรับบทเรียนนี้</p>
                </div>`;
            }

            const q = quiz[this.currentQuestionIndex];
            const isLast = this.currentQuestionIndex === quiz.length - 1;

            return `
            <div class="space-y-8 animate-in fade-in duration-500">
                    <div class="flex items-center justify-between mb-2">
                        <div class="hud-badge-micro text-[var(--vs-accent)]">Question ${this.currentQuestionIndex + 1} of ${quiz.length}</div>
                        <div class="text-[13px] font-mono text-zinc-500">${Math.round(((this.currentQuestionIndex) / quiz.length) * 100)}% Complete</div>
                    </div>
                    
                    <div class="h-1 bg-zinc-800 rounded-[3px] overflow-hidden mb-8">
                        <div class="h-full bg-[var(--vs-accent)] transition-all duration-500" style="width: ${((this.currentQuestionIndex) / quiz.length) * 100}%"></div>
                    </div>

                    <h3 class="text-2xl font-light text-[var(--vs-text-title)] Thai-Rule leading-relaxed mb-8">
                        ${q.question}
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${q.options.map((opt, idx) => `
                            <button onclick="parent.ManagementEngine.submitQuizAnswer(${idx})" 
                                    class="p-4 text-left rounded-[3px] bg-[rgba(255,255,255,0.02)] border border-[rgba(63,63,70,0.5)] hover:bg-[rgba(var(--vs-accent-rgb),0.1)] hover:border-[rgba(var(--vs-accent-rgb),0.3)] group transition-all">
                                <span class="text-[13px] font-light text-[var(--vs-text-body)] Thai-Rule group-hover:text-white">${opt}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // ─── Step 4: SYNC (Interactive Integration - Line Drawing Match) ───
        if (this.currentStep === 4) {
            const syncData = pedagogy.syncActivities || {};
            const pairs = syncData.pairs || [];
            const instruction = syncData.instruction || 'ลากเส้นเชื่อมจากซ้ายไปขวาให้ถูกต้อง';

            if (pairs.length === 0) {
                return `<div class="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-[3px] text-center py-20 opacity-40 italic text-[13px] uppercase">Interactive SYNC Content Placeholder</div>`;
            }

            // Store pairs for validation and shuffle right side
            this.syncPairs = pairs;
            this.syncShuffledRight = [...pairs.map(p => p.right)].sort(() => Math.random() - 0.5);
            this.syncConnections = {}; // Store user connections

            return `
            <div class="space-y-6">
                <div class="p-6 bg-[var(--vs-bg-deep)] rounded-[3px] border border-[rgba(63,63,70,0.5)]">
                    <h3 class="hud-badge-micro text-[var(--vs-accent)] mb-4 uppercase">กิจกรรมจับคู่ความหมาย</h3>
                    <p class="text-[13px] font-light text-[var(--vs-text-body)] Thai-Rule mb-2">${instruction}</p>
                    <p class="text-[13px] font-light text-[var(--vs-text-muted)] mb-6 flex items-center gap-2"><i class="icon i-lightning h-4 w-4 text-amber-500"></i> คลิกที่กล่องซ้าย แล้วคลิกที่กล่องขวาเพื่อเชื่อม (คลิกซ้ายซ้ำเพื่อยกเลิก)</p>

                    <div id="sync-match-container" class="relative">
                        <!-- SVG Layer for drawing lines -->
                        <svg id="sync-lines-svg" class="absolute top-0 left-0 w-full h-full pointer-events-none z-10" style="min-height: 400px;">
                            <!-- Lines will be drawn here -->
                        </svg>

                        <div class="grid grid-cols-2 gap-16 relative z-20">
                            <!-- Left Column -->
                            <div class="space-y-3" id="sync-left-column">
                                <div class="hud-badge-micro text-[var(--vs-text-muted)] mb-2 uppercase">ภูมิศาสตร์</div>
                                ${pairs.map((pair, idx) => `
                                        <div class="sync-left-item p-4 bg-[rgba(0,204,255,0.1)] border-2 border-[rgba(0,204,255,0.3)] rounded-[3px] cursor-pointer hover:bg-[rgba(0,204,255,0.25)] hover:border-[rgba(0,204,255,0.6)] transition-all" 
                                             data-left-idx="${idx}" 
                                             data-left-text="${pair.left}"
                                             onclick="parent.ManagementEngine.selectSyncLeft(${idx})">
                                            <span class="text-[13px] font-light text-[var(--vs-text-title)] Thai-Rule">${pair.left}</span>
                                        </div>
                                    `).join('')}
                            </div>

                            <!-- Right Column -->
                            <div class="space-y-3" id="sync-right-column">
                                <div class="hud-badge-micro text-[var(--vs-text-muted)] mb-2 uppercase">ความสำคัญ</div>
                                ${this.syncShuffledRight.map((right, idx) => `
                                        <div class="sync-right-item p-4 bg-[rgba(34,197,94,0.1)] border-2 border-[rgba(34,197,94,0.3)] rounded-[3px] cursor-pointer hover:bg-[rgba(34,197,94,0.25)] hover:border-[rgba(34,197,94,0.6)] transition-all" 
                                             data-right-idx="${idx}" 
                                             data-right-text="${right}"
                                             onclick="parent.ManagementEngine.selectSyncRight(${idx})">
                                            <span class="text-[13px] font-light text-[var(--vs-text-title)] Thai-Rule">${right}</span>
                                        </div>
                                    `).join('')}
                            </div>
                        </div>
                    </div>

                    <div class="mt-6 pt-4 border-t border-[rgba(63,63,70,0.5)] flex gap-4">
                        <button onclick="parent.ManagementEngine.clearSyncConnections()" class="flex-1 py-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(63,63,70,0.5)] rounded-[3px] text-[var(--vs-text-muted)] hover:bg-[rgba(255,255,255,0.1)] transition-colors font-light uppercase text-[13px]">
                            ล้างทั้งหมด
                        </button>
                        <button onclick="parent.ManagementEngine.checkSyncAnswers()" class="flex-1 py-3 bg-[rgba(var(--vs-accent-rgb),0.2)] border border-[rgba(var(--vs-accent-rgb),0.4)] rounded-[3px] text-[var(--vs-accent)] hover:bg-[rgba(var(--vs-accent-rgb),0.3)] transition-colors font-light uppercase text-[13px]">
                            ตรวจคำตอบ
                        </button>
                    </div>
                </div>
                </div>
            `;
        }

        // ─── Step 5: REFLECT (Practice - Open-ended Task) ───
        if (this.currentStep === 5) {
            const tasks = pedagogy.reflectTasks || [];

            if (tasks.length === 0) {
                return `<div class="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-[3px] text-center py-20 opacity-40 italic text-[13px] uppercase">Interactive REFLECT Content Placeholder</div>`;
            }

            const task = tasks[0]; // First task

            return `
            <div class="space-y-6">
                <div class="p-6 bg-[var(--vs-bg-deep)] rounded-[3px] border border-[rgba(63,63,70,0.5)]">
                    <h3 class="hud-badge-micro text-[var(--vs-accent)] mb-4 uppercase">กิจกรรมสะท้อนคิด</h3>

                    <div class="p-4 bg-[rgba(168,85,247,0.1)] border border-[rgba(168,85,247,0.3)] rounded-[3px] mb-6">
                        <p class="text-[13px] font-light text-[var(--vs-text-title)] Thai-Rule leading-relaxed">${task.question}</p>
                    </div>

                    <textarea id="reflect-answer"
                        class="w-full h-40 p-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(63,63,70,0.5)] rounded-[3px] text-[13px] font-light text-[var(--vs-text-body)] Thai-Rule resize-none focus:outline-none focus:border-[var(--vs-accent)]"
                        placeholder="เขียนคำตอบของนักเรียนที่นี่..."
                        onkeydown="if(event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); parent.ManagementEngine.submitReflection(); }"></textarea>

                    ${task.hints && task.hints.length > 0 ? `
                            <div class="mt-4 p-3 bg-[rgba(255,193,7,0.1)] border border-[rgba(255,193,7,0.3)] rounded-[3px]">
                                <div class="hud-badge-micro text-[rgba(255,193,7,0.8)] mb-2 uppercase">HINTS</div>
                                <ul class="space-y-1">
                                    ${task.hints.map(hint => `
                                        <li class="text-[13px] font-light text-[var(--vs-text-muted)] Thai-Rule">- ${hint}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}

                    <div class="mt-6 pt-4 border-t border-[rgba(63,63,70,0.5)]">
                        <button onclick="parent.ManagementEngine.submitReflection()" class="w-full py-3 bg-[rgba(168,85,247,0.2)] border border-[rgba(168,85,247,0.4)] rounded-[3px] text-[rgb(168,85,247)] hover:bg-[rgba(168,85,247,0.3)] transition-colors font-light uppercase text-[13px]">
                            บันทึกคำตอบ
                        </button>
                    </div>
                </div>
                </div>
            `;
        }

        // ─── Step 7: MASTER (Challenge - Scenario) ───
        if (this.currentStep === 7) {
            const challenge = pedagogy.masterChallenge || {};

            if (!challenge.scenario) {
                return `<div class="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-[3px] text-center py-20 opacity-40 italic text-[13px] uppercase">Interactive MASTER Content Placeholder</div>`;
            }

            return `
            <div class="space-y-6">
                <div class="p-6 bg-[var(--vs-bg-deep)] rounded-[3px] border border-[rgba(63,63,70,0.5)]">
                    <h3 class="hud-badge-micro text-[var(--vs-accent)] mb-4 uppercase"><i class="icon i-academic h-4 w-4 inline-block mr-1"></i> Mastery Challenge</h3>

                    <!-- Scenario Box -->
                    <div class="p-5 bg-[rgba(255,193,7,0.1)] border border-[rgba(255,193,7,0.3)] rounded-[3px] mb-6">
                        <div class="hud-badge-micro text-[rgba(255,193,7,0.8)] mb-2 uppercase">สถานการณ์</div>
                        <p class="text-[13px] font-light text-[var(--vs-text-title)] Thai-Rule leading-relaxed">${challenge.scenario}</p>
                    </div>

                    <!-- Question Box -->
                    <div class="p-5 bg-[rgba(var(--vs-accent-rgb),0.1)] border border-[rgba(var(--vs-accent-rgb),0.3)] rounded-[3px] mb-6">
                        <div class="hud-badge-micro text-[var(--vs-accent)] mb-2 uppercase">คำถาม</div>
                        <p class="text-[13px] font-light text-[var(--vs-text-title)] Thai-Rule leading-relaxed">${challenge.question}</p>
                    </div>

                    <!-- Answer Area -->
                    <textarea id="master-answer"
                        class="w-full h-48 p-4 bg-[rgba(255,255,255,0.03)] border border-[rgba(63,63,70,0.5)] rounded-[3px] text-[13px] font-light text-[var(--vs-text-body)] Thai-Rule resize-none focus:outline-none focus:border-[var(--vs-accent)]"
                        placeholder="เขียนคำตอบอย่างละเอียด..."
                        onkeydown="if(event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); parent.ManagementEngine.submitMasterChallenge(); }"></textarea>

                    ${challenge.rubric && challenge.rubric.length > 0 ? `
                            <div class="mt-4 p-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(63,63,70,0.5)] rounded-[3px]">
                                <div class="hud-badge-micro text-[var(--vs-text-muted)] mb-2 uppercase">เกณฑ์การให้คะแนน</div>
                                <ul class="space-y-1">
                                    ${challenge.rubric.map((r, i) => `
                                        <li class="text-[13px] font-light text-[var(--vs-text-muted)] Thai-Rule flex items-center gap-2"><i class="icon i-check h-3 w-3 text-[var(--vs-success)]"></i> ${r}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        ` : ''}

                    <div class="mt-6 pt-4 border-t border-[rgba(63,63,70,0.5)]">
                        <button onclick="parent.ManagementEngine.submitMasterChallenge()" class="w-full py-3 bg-[rgba(255,193,7,0.2)] border border-[rgba(255,193,7,0.4)] rounded-[3px] text-[rgba(255,193,7,1)] hover:bg-[rgba(255,193,7,0.3)] transition-colors font-light uppercase text-[13px]">
                            <i class="icon i-chevron-right h-4 w-4 inline-block mr-1"></i> ส่งคำตอบ Master Challenge
                        </button>
                    </div>
                </div>
                </div>
            `;
        }

        // ─── Default Placeholder for other steps ───
        return `<div class="p-4 bg-zinc-900/50 border border-zinc-800/50 rounded-[3px] text-center py-20 opacity-40 italic text-[13px] uppercase">Interactive ${this.masterySteps[this.currentStep - 1].label} Content Placeholder</div>`;
    },

    // ─── Quiz Answer Handler (Pre-test: NO ANSWER REVEAL) ───
    submitQuizAnswer(selectedIndex) {
        const subject = IDLPMS_DATA.curriculum[this.currentSubjectID?.replace('SUB_', '')];
        const allLessons = [];
        subject?.units?.forEach(unit => {
            unit.lessons.forEach(l => allLessons.push(l));
        });
        const lesson = allLessons[this.currentLessonIndex] || allLessons[0];
        const quiz = lesson?.pedagogicalData?.quiz || [];

        if (quiz.length === 0) return;

        const q = quiz[this.currentQuestionIndex];
        const isCorrect = selectedIndex === q.answer;
        const timeTaken = (Date.now() - (this.quizState.questionStartTime || Date.now())) / 1000;

        // Record answer for anti-guessing
        this.startQuestionTimer();
        this.recordAnswer(selectedIndex, isCorrect, timeTaken);

        // Store Pre-test answers for later comparison (NO reveal!)
        if (this.currentStep === 1) {
            this.stepTiming.pretestAnswers.push({
                questionIndex: this.currentQuestionIndex,
                selected: selectedIndex,
                correct: q.answer,
                isCorrect: isCorrect,
                timeTaken: timeTaken
            });
            // 🧠 DNA Harvesting: Cognitive Signal (Baseline)
            this.captureNeuralSignal('K', isCorrect ? 100 : 0, { type: 'pre-test', qIndex: this.currentQuestionIndex });
        }
        // Store Post-test answers
        if (this.currentStep === 6) {
            this.stepTiming.posttestAnswers.push({
                questionIndex: this.currentQuestionIndex,
                selected: selectedIndex,
                correct: q.answer,
                isCorrect: isCorrect,
                timeTaken: timeTaken
            });
            // 🧠 DNA Harvesting: Cognitive Signal (Mastery)
            this.captureNeuralSignal('K', isCorrect ? 100 : 0, { type: 'post-test', qIndex: this.currentQuestionIndex });

            // 🧠 DNA Harvesting: Focus Signal (Accuracy/Time ratio)
            if (isCorrect && timeTaken > 3) this.captureNeuralSignal('F', 100);
        }

        // Silent feedback - just acknowledge click, NO answer reveal
        window.HUD_NOTIFY?.toast('RECORDED', 'บันทึกคำตอบแล้ว', 'accent');

        // Move to next question or complete step
        if (this.currentQuestionIndex < quiz.length - 1) {
            this.currentQuestionIndex++;
            setTimeout(() => this.renderMasteryFlow(), 500);
        } else {
            // Pre-test/Post-test complete
            this.recordStepCompletion();

            // Validate behavior before moving to next step
            const behaviorCheck = this.validateStepBehavior();
            if (!behaviorCheck.valid) {
                console.log('[BEHAVIOR] Violations found:', behaviorCheck.violations);
            }

            this.currentQuestionIndex = 0;

            const nextStep = this.currentStep + 1;
            const stepLabel = this.currentStep === 1 ? 'Pre-test' : 'Post-test';

            // ─── REWIND Protocol for PROVE (Post-test) ───
            if (this.currentStep === 6) {
                // Calculate post-test score
                const correctCount = this.stepTiming.posttestAnswers.filter(a => a.isCorrect).length;
                const totalQuestions = this.stepTiming.posttestAnswers.length;
                const postTestScore = Math.round((correctCount / totalQuestions) * 100);

                if (postTestScore < 80) {
                    // Failed Post-test → REWIND with longer cooldown
                    window.HUD_NOTIFY?.toast('PROVE_FAILED',
                        `❌ Post - test: ${correctCount}/${totalQuestions} (${postTestScore}%) - ไม่ผ่านเกณฑ์ 80%`,
                        'error'
                    );

                    // Clear post-test answers for retry
                    this.stepTiming.posttestAnswers = [];

                    // Trigger REWIND with 60 second cooldown (stricter for PROVE)
                    this.triggerRewindProtocol(6, postTestScore, 60);
                    return; // Don't proceed to next step
                }

                // Passed! Show comparison with Pre-test
                const pretestCorrect = this.stepTiming.pretestAnswers.filter(a => a.isCorrect).length;
                const pretestScore = Math.round((pretestCorrect / this.stepTiming.pretestAnswers.length) * 100) || 0;
                const improvement = postTestScore - pretestScore;

                window.HUD_NOTIFY?.toast('PROVE_PASSED',
                    `✅ Post-test ผ่าน! ${postTestScore}% (Pre: ${pretestScore}%, +${improvement > 0 ? improvement : 0}%)`,
                    'success'
                );
            } else {
                window.HUD_NOTIFY?.toast('STEP_COMPLETE', `${stepLabel} เสร็จสิ้น! กำลังไปขั้นตอนถัดไป...`, 'success');
            }

            setTimeout(() => {
                this.currentStep = nextStep;
                this.startStepTimer(); // Start timing for next step
                this.initStepBehaviorTracking(); // Init behavior tracking for new step
                this.renderMasteryFlow();
            }, 1000);
        }
    },

    // ─── Step 4: SYNC Line Drawing Match Handlers ───
    syncSelectedLeft: null,
    syncPairs: [],
    syncShuffledRight: [],
    syncConnections: {},

    // ─── REWIND Protocol State ───
    rewatchCount: 0,
    rewindCooldownActive: false,
    requiredWatchPercent: 25, // Default, increases on REWIND
    rewindSourceStep: null,

    /**
     * REWIND Protocol - Sends student back to video when failing checkpoints
     */
    triggerRewindProtocol(failedStep, score, cooldownSeconds = 30) {
        const stepName = this.masterySteps[failedStep - 1]?.labelTH || `ขั้นตอนที่ ${failedStep}`;

        // Track rewind
        this.rewatchCount++;
        this.isRewindCoolingDown = true;
        this.rewindCountdown = cooldownSeconds;
        this.failData = {
            score: score,
            required: 80,
            failedStep: failedStep,
            stepLabel: stepName
        };

        // Increase required watch percentage on rewind
        this.requiredWatchPercent = Math.min(80, 50 + (this.rewatchCount - 1) * 10);

        // Initial render of fail state
        this.renderMasteryFlow();

        // Start High-Frequency Countdown for UI update
        const cooldownInterval = setInterval(() => {
            this.rewindCountdown--;

            // Try to find the timer element in the rendered fail state
            const timerEl = (this.activeMissionContainer?.ownerDocument || document).getElementById('rewind-timer-display');
            if (timerEl) {
                timerEl.innerText = this.rewindCountdown.toString().padStart(2, '0');
            }

            if (this.rewindCountdown <= 0) {
                clearInterval(cooldownInterval);
                this.isRewindCoolingDown = false;
                this.failData = null;

                // Reset video progress and go to Step 3
                this.videoWatchedPercent = 0;
                this._hlsPassNotified = false;
                this.currentStep = 3;

                window.HUD_NOTIFY?.toast('REWIND_START',
                    `ทบทวนใหม่ ครั้งที่ ${this.rewatchCount}`,
                    'warning'
                );

                this.startStepTimer();
                this.initStepBehaviorTracking();
                this.renderMasteryFlow();

                // Auto-load HLS
                setTimeout(() => this.loadHLSVideo(), 150);
            }
        }, 1000);
    },

    renderFailState(targetContainer) {
        const data = this.failData;

        targetContainer.innerHTML = `
            <div class="protocol-fail-bg h-full p-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-700">
                <div class="fail-scanning-line"></div>
                
                <div class="relative z-10 space-y-8 max-w-2xl">
                    <!-- Failure Status Header -->
                    <div class="space-y-4">
                        <div class="flex justify-center mb-8">
                            <div class="w-24 h-24 rounded-[3px] border-2 border-[rgba(239,68,68,0.5)] bg-[rgba(239,68,68,0.1)] flex items-center justify-center fail-signal-glitch">
                                <i class="icon i-x-circle h-12 w-12 text-[rgba(239,68,68,0.9)]"></i>
                            </div>
                        </div>
                        <h1 class="text-4xl font-light text-[var(--vs-text-title)] uppercase">Mastery Protocol Failed</h1>
                        <div class="hud-badge-micro text-[rgba(239,68,68,0.9)] bg-[rgba(239,68,68,0.1)] px-4 py-1.5 rounded-[3px] inline-block border border-[rgba(239,68,68,0.3)]">
                            UNSATISFACTORY PERFORMANCE AT: ${data.stepLabel.toUpperCase()}
                        </div>
                    </div>

                    <!-- Progress Statistics -->
                    <div class="grid grid-cols-2 gap-8 py-8 border-y border-[rgba(255,255,255,0.05)]">
                        <div class="text-right border-r border-[rgba(255,255,255,0.05)] pr-8">
                            <div class="text-[13px] text-[var(--vs-text-muted)] uppercase mb-2">Achieved Score</div>
                            <div class="text-6xl font-black text-[rgba(239,68,68,0.9)]">${data.score}%</div>
                        </div>
                        <div class="text-left pl-8">
                            <div class="text-[13px] text-[var(--vs-text-muted)] uppercase mb-2">Threshold Goal</div>
                            <div class="text-6xl font-black text-white opacity-40">${data.required}%</div>
                        </div>
                    </div>

                    <!-- Instruction & Timer -->
                    <div class="space-y-6 pt-4">
                        <p class="text-lg font-light text-[var(--vs-text-body)] Thai-Rule leading-relaxed">
                            คะแนนของคุณยังไม่ผ่านเกณฑ์พื้นฐานที่ระบบกำหนด<br/>
                            กรุณาทบทวน <span class="text-[var(--vs-accent)] font-normal">PROTOCOL 03: วิดีโอบทเรียน</span> อีกครั้งเพื่อความเข้าใจที่ชัดเจน
                        </p>
                        
                        <div class="flex flex-col items-center">
                            <div class="text-[13px] text-[var(--vs-text-muted)] uppercase mb-2 opacity-50">Rewind Cooldown Active</div>
                            <div class="flex items-baseline gap-2">
                                <span id="rewind-timer-display" class="text-7xl font-mono font-black text-white digital-timer-glow">${this.rewindCountdown.toString().padStart(2, '0')}</span>
                                <span class="text-xl font-light text-[var(--vs-text-muted)] uppercase">sec</span>
                            </div>
                        </div>
                    </div>

                    <!-- Dev Bypass Button (shown only if dev bypass enabled) -->
                    ${this.devBypassEnabled ? `
                        <div class="pt-8 opacity-40 hover:opacity-100 transition-opacity">
                            <button onclick="parent.ManagementEngine.bypassFailCooldown()" class="px-6 py-2 border border-amber-500/30 text-amber-500/70 text-[13px] hover:bg-amber-500/10 rounded-[3px] uppercase">
                                Dev Bypass: Skip Cooldown
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    bypassFailCooldown() {
        this.rewindCountdown = 1; // Set to 1 to trigger the interval completion next tick
    },


    selectSyncLeft(leftIdx) {
        const doc = this.activeMissionContainer?.ownerDocument || document;
        const leftItems = doc.querySelectorAll('.sync-left-item');

        // If clicking same item, deselect
        if (this.syncSelectedLeft === leftIdx) {
            this.syncSelectedLeft = null;
            leftItems.forEach(item => item.classList.remove('ring-2', 'ring-[rgba(0,204,255,0.8)]', 'scale-105'));
            return;
        }

        // Clear previous selection
        leftItems.forEach(item => item.classList.remove('ring-2', 'ring-[rgba(0,204,255,0.8)]', 'scale-105'));

        // Select this item
        this.syncSelectedLeft = leftIdx;
        leftItems[leftIdx]?.classList.add('ring-2', 'ring-[rgba(0,204,255,0.8)]', 'scale-105');
    },

    selectSyncRight(rightIdx) {
        if (this.syncSelectedLeft === null) {
            window.HUD_NOTIFY?.toast('SELECT_LEFT', 'เลือกกล่องซ้ายก่อน', 'warning');
            return;
        }

        const doc = this.activeMissionContainer?.ownerDocument || document;
        const leftIdx = this.syncSelectedLeft;
        const rightText = this.syncShuffledRight[rightIdx];

        // Store connection: leftIdx -> rightText
        this.syncConnections[leftIdx] = { rightIdx, rightText };

        // Clear selection
        this.syncSelectedLeft = null;
        doc.querySelectorAll('.sync-left-item').forEach(item => {
            item.classList.remove('ring-2', 'ring-[rgba(0,204,255,0.8)]', 'scale-105');
        });

        // Redraw all lines
        this.drawSyncLines();

        window.HUD_NOTIFY?.toast('CONNECTED', 'เชื่อมแล้ว!', 'accent');
    },

    drawSyncLines() {
        const doc = this.activeMissionContainer?.ownerDocument || document;
        const svg = doc.getElementById('sync-lines-svg');
        const container = doc.getElementById('sync-match-container');
        if (!svg || !container) return;

        // Clear existing lines
        svg.innerHTML = '';

        // Get container bounds
        const containerRect = container.getBoundingClientRect();

        // Draw each connection
        Object.entries(this.syncConnections).forEach(([leftIdx, conn]) => {
            const leftItem = doc.querySelector(`[data-left-idx="${leftIdx}"]`);
            const rightItem = doc.querySelector(`[data-right-idx="${conn.rightIdx}"]`);

            if (!leftItem || !rightItem) return;

            const leftRect = leftItem.getBoundingClientRect();
            const rightRect = rightItem.getBoundingClientRect();

            // Calculate positions relative to container
            const x1 = leftRect.right - containerRect.left;
            const y1 = leftRect.top + leftRect.height / 2 - containerRect.top;
            const x2 = rightRect.left - containerRect.left;
            const y2 = rightRect.top + rightRect.height / 2 - containerRect.top;

            // Node offset for positioning (used for both line and nodes)
            const nodeOffset = 3;

            // Calculate line start/end points (matching node positions)
            const lineX1 = x1 - nodeOffset;
            const lineX2 = x2 + nodeOffset;

            // Create Bezier Curve path
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            // Calculate control points for a smooth S-curve
            const cp1x = lineX1 + (lineX2 - lineX1) / 2;
            const cp2x = lineX1 + (lineX2 - lineX1) / 2;

            const d = `M ${lineX1} ${y1} C ${cp1x} ${y1}, ${cp2x} ${y2}, ${lineX2} ${y2}`;

            path.setAttribute('d', d);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', 'rgba(0,204,255,0.7)');
            path.setAttribute('stroke-width', '1.5');
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('data-left-idx', leftIdx);
            path.classList.add('sync-line-path');

            svg.appendChild(path);

            // Create node circles at endpoints
            const nodeRadius = 5;
            const nodeColor = 'rgba(0,204,255,0.9)';

            // Left node (start point) - uses lineX1 which is already offset
            const leftNode = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            leftNode.setAttribute('cx', lineX1);
            leftNode.setAttribute('cy', y1);
            leftNode.setAttribute('r', nodeRadius);
            leftNode.setAttribute('fill', nodeColor);
            leftNode.setAttribute('data-left-idx', leftIdx);
            leftNode.classList.add('sync-line-node', 'sync-line-node-left');
            svg.appendChild(leftNode);

            // Right node (end point) - uses lineX2 which is already offset
            const rightNode = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            rightNode.setAttribute('cx', lineX2);
            rightNode.setAttribute('cy', y2);
            rightNode.setAttribute('r', nodeRadius);
            rightNode.setAttribute('fill', nodeColor);
            rightNode.setAttribute('data-left-idx', leftIdx);
            rightNode.classList.add('sync-line-node', 'sync-line-node-right');
            svg.appendChild(rightNode);
        });
    },

    clearSyncConnections() {
        const doc = this.activeMissionContainer?.ownerDocument || document;
        this.syncConnections = {};
        this.syncSelectedLeft = null;

        // Clear visual selection
        doc.querySelectorAll('.sync-left-item, .sync-right-item').forEach(item => {
            item.classList.remove('ring-2', 'ring-[rgba(0,204,255,0.8)]', 'ring-green-500', 'ring-red-500', 'scale-105');
            item.style.borderColor = '';
        });

        // Clear lines
        const svg = doc.getElementById('sync-lines-svg');
        if (svg) svg.innerHTML = '';

        window.HUD_NOTIFY?.toast('CLEARED', 'ล้างคำตอบทั้งหมดแล้ว', 'info');
    },

    checkSyncAnswers() {
        const doc = this.activeMissionContainer?.ownerDocument || document;
        const connections = Object.entries(this.syncConnections);

        if (connections.length < this.syncPairs.length) {
            window.HUD_NOTIFY?.toast('INCOMPLETE', `จับคู่ให้ครบ ${this.syncPairs.length} คู่ก่อน`, 'warning');
            return;
        }

        let correct = 0;
        const svg = doc.getElementById('sync-lines-svg');

        connections.forEach(([leftIdx, conn]) => {
            const correctAnswer = this.syncPairs[leftIdx].right;
            const isCorrect = conn.rightText === correctAnswer;

            // Update line color (now a path)
            const line = svg?.querySelector(`[data-left-idx="${leftIdx}"].sync-line-path`);
            if (line) {
                line.setAttribute('stroke', isCorrect ? 'rgba(34,197,94,0.9)' : 'rgba(239,68,68,0.9)');
                line.setAttribute('stroke-width', '4');
            }

            // Update left item color
            const leftItem = doc.querySelector(`[data-left-idx="${leftIdx}"]`);
            if (leftItem) {
                leftItem.style.borderColor = isCorrect ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)';
            }

            if (isCorrect) correct++;
        });

        const score = Math.round((correct / this.syncPairs.length) * 100);

        // 🧠 DNA Harvesting: Practice Signal (P) & Cognitive (K)
        this.captureNeuralSignal('P', score, { type: 'sync_practice' });
        this.captureNeuralSignal('K', score, { type: 'sync_concept' });

        const passed = score >= 80;

        if (passed) {
            window.HUD_NOTIFY?.toast('SYNC_COMPLETE', `ผ่าน! ${correct}/${this.syncPairs.length} คู่ (${score}%)`, 'success');
            this.recordStepCompletion();

            setTimeout(() => {
                this.currentStep = 5; // Move to REFLECT
                this.startStepTimer();
                this.initStepBehaviorTracking();
                this.renderMasteryFlow();
            }, 2000);
        } else {
            // REWIND Protocol: Failed SYNC → Back to Video
            this.triggerRewindProtocol(4, score, 30);
        }
    },

    // ─── Step 5: REFLECT Submission Handler ───
    submitReflection() {
        try {
            console.log('[REFLECT] submitReflection called');

            const doc = this.activeMissionContainer?.ownerDocument || document;
            console.log('[REFLECT] doc:', doc ? 'found' : 'NOT FOUND');

            const textarea = doc.getElementById('reflect-answer');
            console.log('[REFLECT] textarea:', textarea ? 'found' : 'NOT FOUND');

            const answer = textarea?.value || '';
            console.log('[REFLECT] answer length:', answer.length);

            // Get lesson context for AI Audit
            console.log('[REFLECT] currentSubjectID:', this.currentSubjectID);
            console.log('[REFLECT] currentLessonIndex:', this.currentLessonIndex);

            const rawKey = this.currentSubjectID?.replace('SUB_', '') || '';
            const subjectKey = MasteryAIAuditor.subjectKeyMap[rawKey] || rawKey;
            console.log('[REFLECT] rawKey:', rawKey, '-> mapped to:', subjectKey);

            const subject = IDLPMS_DATA?.curriculum?.[subjectKey] || {};
            console.log('[REFLECT] subject:', subject.name || 'NOT FOUND');

            const allLessons = [];
            subject.units?.forEach(unit => unit.lessons?.forEach(l => allLessons.push(l)));
            console.log('[REFLECT] allLessons count:', allLessons.length);

            const lesson = allLessons[this.currentLessonIndex] || {};
            console.log('[REFLECT] lesson:', lesson.name || 'NOT FOUND');

            const task = lesson.pedagogicalData?.reflectTasks?.[0] || {};
            console.log('[REFLECT] task question:', task.question ? 'exists' : 'NOT FOUND');

            // 1. Basic length check
            if (answer.trim().length < 10) {
                window.HUD_NOTIFY?.toast('TOO_SHORT', 'กรุณาเขียนคำตอบให้มากกว่านี้', 'warning');
                return;
            }

            // 2. AI Audit (Relevance & Anti-Cheat) - with fallback for missing data
            console.log('[REFLECT] Starting AI Audit...');
            const audit = MasteryAIAuditor.audit(answer, {
                question: task.question || "",
                keywords: lesson.pedagogicalData?.objectives ? Object.values(lesson.pedagogicalData.objectives) : [],
                summary: lesson.pedagogicalData?.summary || ""
            });
            console.log('[REFLECT] Audit result:', audit);

            if (!audit.passed) {
                window.HUD_NOTIFY?.toast('AI_AUDIT_FAILED', audit.reason, 'warning');

                // 🧠 DNA Harvesting: Low Affective Signal (Low Effort/Relevance)
                this.captureNeuralSignal('A', audit.score, { type: 'reflection_fail' });

                // Punishment: Trigger REWIND to Step 3 (Video)
                setTimeout(() => {
                    this.triggerRewindProtocol(3, audit.score, 30);
                }, 1500);
                return;
            }

            // 🧠 DNA Harvesting: High Affective (A) & Effort (E)
            this.captureNeuralSignal('A', audit.score, { type: 'reflection_success' });
            this.captureNeuralSignal('E', Math.min(100, (answer.trim().length / 5)), { type: 'reflection_depth' });

            // Store reflection answer
            this.stepTiming.reflectionAnswer = answer;

            this.recordStepCompletion();
            const behaviorCheck = this.validateStepBehavior();

            if (!behaviorCheck.valid) {
                console.log('[BEHAVIOR] REFLECT Violations:', behaviorCheck.violations);
            }

            window.HUD_NOTIFY?.toast('REFLECT_COMPLETE', '✨ AI ผ่านการตรวจสอบ! บันทึกคำตอบแล้ว', 'success');

            setTimeout(() => {
                this.currentStep = 6; // Move to PROVE (Post-test)
                this.currentQuestionIndex = 0;
                this.startStepTimer();
                this.initStepBehaviorTracking();
                this.renderMasteryFlow();
            }, 1000);
        } catch (e) {
            console.error('[MASTERY] Error in submitReflection:', e);
            window.HUD_NOTIFY?.toast('ERROR', 'เกิดข้อผิดพลาดในการส่งคำตอบ กรุณาลองใหม่', 'error');
        }
    },

    // ─── Step 7: MASTER Challenge Handler ───
    submitMasterChallenge() {
        try {
            const doc = this.activeMissionContainer?.ownerDocument || document;
            const textarea = doc.getElementById('master-answer');
            const answer = textarea?.value || '';

            // Get lesson context
            const rawKey = this.currentSubjectID?.replace('SUB_', '') || '';
            const subjectKey = MasteryAIAuditor.subjectKeyMap[rawKey] || rawKey;
            const subject = IDLPMS_DATA?.curriculum?.[subjectKey] || {};
            const allLessons = [];
            subject.units?.forEach(unit => unit.lessons?.forEach(l => allLessons.push(l)));
            const lesson = allLessons[this.currentLessonIndex] || {};
            const challenge = lesson.pedagogicalData?.masterChallenge || {};

            if (answer.trim().length < 20) {
                window.HUD_NOTIFY?.toast('TOO_SHORT', 'กรุณาเขียนคำตอบให้ละเอียดกว่านี้', 'warning');
                return;
            }

            // AI Audit (Stricter for Step 7)
            const audit = MasteryAIAuditor.audit(answer, {
                question: challenge.question || challenge.scenario || "",
                keywords: lesson.pedagogicalData?.objectives ? Object.values(lesson.pedagogicalData.objectives) : [],
                summary: lesson.pedagogicalData?.summary || ""
            });

            if (!audit.passed) {
                window.HUD_NOTIFY?.toast('AI_AUDIT_FAILED', audit.reason, 'warning');

                // 🧠 DNA Harvesting: Low P/K Signal
                this.captureNeuralSignal('P', audit.score, { type: 'master_fail' });

                setTimeout(() => {
                    this.triggerRewindProtocol(3, audit.score, 60); // Heavier punishment for Master Step
                }, 1500);
                return;
            }

            // 🧠 DNA Harvesting: Practice (P) & Cognitive (K)
            this.captureNeuralSignal('P', audit.score, { type: 'master_success' });
            this.captureNeuralSignal('K', audit.score, { type: 'master_concept' });

            // Store master challenge answer
            this.stepTiming.masterAnswer = answer;

            this.recordStepCompletion();
            const behaviorCheck = this.validateStepBehavior();

            // Calculate lesson completion stats
            const pretestCorrect = this.stepTiming.pretestAnswers?.filter(a => a.isCorrect).length || 0;
            const pretestTotal = this.stepTiming.pretestAnswers?.length || 5;
            const pretestScore = Math.round((pretestCorrect / pretestTotal) * 100);

            const posttestCorrect = this.stepTiming.posttestAnswers?.filter(a => a.isCorrect).length || 0;
            const posttestTotal = this.stepTiming.posttestAnswers?.length || 5;
            const posttestScore = Math.round((posttestCorrect / posttestTotal) * 100);

            const improvement = posttestScore - pretestScore;
            const totalTimeMs = Date.now() - (this.stepTiming.lessonStartTime || Date.now());
            const totalMins = Math.round(totalTimeMs / 60000);

            // Determine badge tier
            let badge = 'bronze';
            if (posttestScore >= 90 && improvement >= 20) badge = 'gold';
            else if (posttestScore >= 80) badge = 'silver';

            // Show Victory Screen
            this.showVictoryScreen({
                lessonName: lesson.name || 'บทเรียน',
                pretestScore,
                posttestScore,
                improvement,
                totalMins,
                badge,
                auditScore: audit.score
            });

            this.masteryFlowActive = false;
        } catch (e) {
            console.error('[MASTERY] Error in submitMasterChallenge:', e);
            window.HUD_NOTIFY?.toast('ERROR', 'เกิดข้อผิดพลาดในการส่งคำตอบ กรุณาลองใหม่', 'error');
        }
    },

    // ─── Victory Screen with Confetti ───
    showVictoryScreen(stats) {
        const doc = this.activeMissionContainer?.ownerDocument || document;
        const container = this.activeMissionContainer || doc.getElementById('main-content');
        if (!container) return;

        // Badge display based on tier (using SVG icons, not unicode per Iron Rules)
        const badgeConfig = {
            gold: { iconClass: 'i-academic', label: 'GOLD MASTERY', color: '#fbbf24' },
            silver: { iconClass: 'i-academic', label: 'SILVER MASTERY', color: '#71717a' },
            bronze: { iconClass: 'i-academic', label: 'BRONZE MASTERY', color: '#cd7f32' }
        };
        const badge = badgeConfig[stats.badge] || badgeConfig.bronze;

        container.innerHTML = `
            <div id="victory-overlay" style="
                position: fixed;
                inset: 0;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0,0,0,0.85);
            ">
                <canvas id="confetti-canvas" style="position:absolute;inset:0;pointer-events:none;"></canvas>
                
                <div style="
                    position: relative;
                    z-index: 1;
                    max-width: 480px;
                    padding: 32px;
                    text-align: center;
                    background: var(--vs-bg-card);
                    border: 1px solid rgba(63, 63, 70, 0.5);
                    border-radius: var(--vs-radius);
                ">
                    <!-- Badge (SVG Icon) -->
                    <div style="width: 64px; height: 64px; margin: 0 auto 16px;">
                        <i class="icon ${badge.iconClass}" style="width: 64px; height: 64px; background-color: ${badge.color};"></i>
                    </div>
                    <div style="
                        font-size: 13px;
                        font-weight: 300;
                        color: ${badge.color};
                        text-transform: uppercase;
                        margin-bottom: 8px;
                    ">${badge.label}</div>
                    
                    <!-- Congrats Message -->
                    <h1 style="
                        font-size: 24px;
                        font-weight: 300;
                        color: var(--vs-accent);
                        margin-bottom: 8px;
                    ">ยินดีด้วย!</h1>
                    <p style="
                        font-size: 13px;
                        font-weight: 300;
                        color: var(--vs-text-body);
                        margin-bottom: 24px;
                    ">คุณเชี่ยวชาญบทเรียน <strong style="color:var(--vs-text-title)">${stats.lessonName}</strong> แล้ว!</p>
                    
                    <!-- Stats Grid -->
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 16px;
                        margin-bottom: 24px;
                        padding: 16px;
                        background: var(--vs-bg-deep);
                        border-radius: var(--vs-radius);
                        border: 1px solid rgba(63, 63, 70, 0.5);
                    ">
                        <div>
                            <div style="font-size: 13px; color: var(--vs-text-muted); font-weight: 300;">PRE-TEST</div>
                            <div style="font-size: 24px; color: var(--vs-text-title); font-weight: 300;">${stats.pretestScore}%</div>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: var(--vs-text-muted); font-weight: 300;">POST-TEST</div>
                            <div style="font-size: 24px; color: var(--vs-success); font-weight: 300;">${stats.posttestScore}%</div>
                        </div>
                        <div>
                            <div style="font-size: 13px; color: var(--vs-text-muted); font-weight: 300;">IMPROVEMENT</div>
                            <div style="font-size: 24px; color: ${stats.improvement >= 0 ? 'var(--vs-success)' : 'var(--vs-danger)'}; font-weight: 300;">
                                ${stats.improvement >= 0 ? '+' : ''}${stats.improvement}%
                            </div>
                        </div>
                    </div>
                    
                    <div style="font-size: 13px; color: var(--vs-text-muted); margin-bottom: 24px; font-weight: 300;">
                        เวลาที่ใช้: ${stats.totalMins} นาที
                    </div>
                    
                    <!-- Action Buttons -->
                    <div style="display: flex; gap: 12px; justify-content: center;">
                        <button onclick="(parent.window.ManagementEngine || window.ManagementEngine).gotoNextLesson()" style="
                            padding: 12px 24px;
                            font-size: 13px;
                            font-weight: 300;
                            color: var(--vs-bg-deep);
                            background: var(--vs-accent);
                            border: none;
                            border-radius: var(--vs-radius);
                            cursor: pointer;
                        ">เรียนบทถัดไป →</button>
                        <button onclick="(parent.window.ManagementEngine || window.ManagementEngine).closeVictoryScreen()" style="
                            padding: 12px 24px;
                            font-size: 13px;
                            font-weight: 300;
                            color: var(--vs-text-body);
                            background: transparent;
                            border: 1px solid rgba(63, 63, 70, 0.5);
                            border-radius: var(--vs-radius);
                            cursor: pointer;
                        ">กลับหน้าหลัก</button>
                    </div>
                </div>
            </div>
        `;

        // Start confetti animation
        this.startConfetti(doc.getElementById('confetti-canvas'));
    },

    startConfetti(canvas) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#22d3ee', '#34d399', '#fbbf24', '#fb7185', '#a78bfa'];

        // Create particles
        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                w: Math.random() * 10 + 5,
                h: Math.random() * 6 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 3 + 2,
                angle: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 0.2
            });
        }

        let animationId;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let allDone = true;
            particles.forEach(p => {
                if (p.y < canvas.height + 50) {
                    allDone = false;
                    p.y += p.speed;
                    p.x += Math.sin(p.angle) * 0.5;
                    p.angle += p.spin;

                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.angle);
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                    ctx.restore();
                }
            });

            if (!allDone) {
                animationId = requestAnimationFrame(animate);
            }
        };

        animate();

        // Store animation ID for cleanup
        this.confettiAnimationId = animationId;
    },

    closeVictoryScreen() {
        if (this.confettiAnimationId) {
            cancelAnimationFrame(this.confettiAnimationId);
        }
        this.exitMission();
    },

    gotoNextLesson() {
        if (this.confettiAnimationId) {
            cancelAnimationFrame(this.confettiAnimationId);
        }

        // Calculate next lesson index
        const nextIndex = (this.currentLessonIndex || 0) + 1;

        // Get current subject's lessons
        const rawKey = this.currentSubjectID?.replace('SUB_', '') || '';
        const subjectKey = MasteryAIAuditor.subjectKeyMap[rawKey] || rawKey;
        const subject = IDLPMS_DATA?.curriculum?.[subjectKey] || {};

        const allLessons = [];
        subject.units?.forEach(unit => unit.lessons?.forEach(l => allLessons.push(l)));

        if (nextIndex < allLessons.length) {
            // Start next lesson
            this.currentLessonIndex = nextIndex;
            this.currentStep = 1;
            this.masteryFlowActive = true;
            this.stepTiming = {
                lessonStartTime: Date.now(),
                stepStartTime: Date.now(),
                stepTimes: {},
                pretestAnswers: [],
                posttestAnswers: []
            };

            // Reload mission HUD with new lesson
            const mainFrame = document.getElementById('main-frame');
            if (mainFrame) {
                mainFrame.src = `pages/mission_hud.html?id=${rawKey}&lesson=${nextIndex}`;
            }
        } else {
            // No more lessons - show completion message
            window.HUD_NOTIFY?.toast('SUBJECT_COMPLETE', 'คุณจบวิชานี้แล้ว! ย้อนกลับไปเลือกวิชาใหม่', 'success');
            this.closeVictoryScreen();
        }
    },

    // ─── Step Timing Functions ───
    startStepTimer() {
        this.stepTiming.stepStartTime = Date.now();
        if (!this.stepTiming.lessonStartTime) {
            this.stepTiming.lessonStartTime = Date.now();
        }
    },

    recordStepCompletion() {
        const stepId = this.masterySteps[this.currentStep - 1]?.id || `STEP_${this.currentStep}`;
        const duration = Date.now() - (this.stepTiming.stepStartTime || Date.now());

        // Calculate engagement score based on time spent
        // Ideal time per step varies, but we use a baseline
        const idealTimes = {
            KNOW: 120000,    // 2 mins for Pre-test
            LINK: 60000,     // 1 min for objectives
            DO: 900000,      // 15 mins for video
            SYNC: 300000,    // 5 mins for integration
            REFLECT: 600000, // 10 mins for practice
            PROVE: 180000,   // 3 mins for Post-test
            MASTER: 300000   // 5 mins for challenge
        };

        const idealTime = idealTimes[stepId] || 300000;
        const ratio = duration / idealTime;

        // Score: 100 if within range, lower if too fast (rushed) or too slow (distracted)
        let score = 100;
        if (ratio < 0.3) score = 40; // Too fast = possibly cheating/rushing
        else if (ratio < 0.7) score = 70; // Fast but acceptable
        else if (ratio > 2) score = 60; // Too slow = possibly distracted
        else if (ratio > 1.5) score = 80; // Slightly slow

        this.stepTiming.stepTimes[stepId] = {
            duration: duration,
            score: score,
            timestamp: new Date().toISOString()
        };

        this.stepTiming.totalLessonTime += duration;

        // Update 8 Characteristics based on engagement
        this.updateCharacteristicsFromTiming(stepId, score);

        // 💡 ADAPT: Standalone persistence (localStorage)
        this.persistMasteryData();

        console.log(`[STEP TIMING] ${stepId}: ${Math.round(duration / 1000)}s, Score: ${score}`);
    },

    // 💡 ADAPT: Standalone Mode - Persist to localStorage
    persistMasteryData() {
        try {
            const lessonId = `LESSON_${this.currentSubjectID}_${this.currentLessonIndex}`;
            const data = {
                subjectId: this.currentSubjectID,
                lessonIndex: this.currentLessonIndex,
                stepTiming: this.stepTiming,
                characteristics: this.characteristics,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem(`IDLPMS_MASTERY_${lessonId}`, JSON.stringify(data));
            console.log(`[STANDALONE] Data persisted for ${lessonId}`);
        } catch (e) {
            console.warn('[STANDALONE] Persistence failed:', e);
        }
    },

    updateCharacteristicsFromTiming(stepId, score) {
        // Map step performance to 8 Thai Desirable Characteristics
        // DISCIPLINE (วินัย) - Consistent timing, not rushing
        // LEARNING (ใฝ่เรียนรู้) - Spending adequate time on content
        // COMMITMENT (มุ่งมั่นในการทำงาน) - Completing steps without abandoning

        if (score >= 80) {
            this.characteristics.DISCIPLINE = Math.min(100, (this.characteristics.DISCIPLINE || 90) + 1);
            this.characteristics.LEARNING = Math.min(100, (this.characteristics.LEARNING || 85) + 2);
        } else if (score < 50) {
            this.characteristics.DISCIPLINE = Math.max(0, (this.characteristics.DISCIPLINE || 90) - 2);
        }

        // Commitment always increases for completing a step
        this.characteristics.COMMITMENT = Math.min(100, (this.characteristics.COMMITMENT || 87) + 1);
    },


    simulateVideoWatch() {
        // Fallback for YouTube mode only
        if (this.videoWatchedPercent < 100) {
            this.videoWatchedPercent = Math.min(100, this.videoWatchedPercent + 5);
            this.renderMasteryFlow();
            if (this.videoWatchedPercent >= 25) {
                window.HUD_NOTIFY?.toast('PROTOCOL_OK', 'Next step protocol established', 'success');
            }
        }
    },

    // ─── HLS Loader: เรียกหลัง renderStepContent ทำงาน ───
    loadHLSVideo() {
        const video = document.getElementById('dltv-hls-player')
            || (window.frames['main-frame']?.contentDocument?.getElementById('dltv-hls-player'));
        if (!video) return;

        const subject = IDLPMS_DATA.curriculum[this.currentSubjectID?.replace('SUB_', '')];

        // Flatten lessons for lookup (consistent with renderStepContent and renderMasteryFlow)
        const allLessons = [];
        subject?.units?.forEach(unit => {
            unit.lessons.forEach(l => allLessons.push(l));
        });

        const lesson = allLessons[this.currentLessonIndex] || allLessons[0];

        // Dynamic Fallback Hierarchy:
        // 1. Specific VOD URL (if found/provided)
        // 2. DLTV 5 Live Stream (Fallback for missing VODs)
        const rawHlsUrl = lesson?.hlsUrl || 'https://cdn-live.dltv.ac.th/dltv5/dltv5.m3u8';

        // ─── DLTV Proxy Integration ───
        // Route DLTV URLs through Netlify proxy to bypass CORS
        // This allows playback without needing the CORS browser extension
        const hlsUrl = this.getSmartVideoUrl(rawHlsUrl);
        console.log('[HLS] Loading Protocol Launch:', hlsUrl, '(Original:', rawHlsUrl, ')');

        // ── กรณี HLS.js available ──
        if (window.Hls && Hls.isSupported()) {
            if (this.hlsInstance) {
                this.hlsInstance.destroy();
                this.hlsInstance = null;
            }
            const hls = new Hls({ enableWorker: true, maxBufferLength: 30 });
            this.hlsInstance = hls;
            hls.attachMedia(video);
            hls.on(Hls.Events.MEDIA_ATTACHED, () => { hls.loadSource(hlsUrl); });
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.details === 'manifestLoadError') {
                    console.error('[HLS] CORS Blocked:', hlsUrl);
                    const container = document.getElementById('learning-flow-container')
                        || window.frames['main-frame']?.contentDocument?.getElementById('learning-flow-container');

                    if (container) {
                        const videoArea = container.querySelector('.aspect-video');
                        if (videoArea) {
                            videoArea.innerHTML = `
                                <div class="flex flex-col items-center justify-center h-full bg-zinc-900 border-2 border-dashed border-zinc-800 p-8 text-center relative overflow-hidden">
                                    <div class="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none"></div>
                                    <div class="relative z-10 flex flex-col items-center">
                                        <i class="icon i-exclamation-circle h-14 w-14 text-zinc-700 mb-6"></i>
                                        <h3 class="text-zinc-300 font-light text-lg mb-2 Thai-Rule">Security Protocol: Access Restricted</h3>
                                        <p class="text-[13px] text-zinc-500 mb-8 Thai-Rule max-w-sm">
                                            ตรวจพบปัญหาโครงสร้างความปลอดภัย (CORS) <br>
                                            <span class="text-zinc-400">วิธีที่แนะนำ:</span> รันด้วย <span class="text-[var(--vs-accent)]">netlify dev</span> แทนการใช้ Extension
                                        </p>
                                        
                                        <div class="flex flex-col sm:flex-row gap-4">
                                            <button onclick="parent.ManagementEngine.loadHLSVideo()" class="px-8 py-2.5 bg-[var(--vs-accent)] text-black rounded-[3px] text-[13px] font-light uppercase transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                                                <i class="icon i-refresh h-4 w-4"></i>
                                                RETRY CONNECTION
                                            </button>
                                            <button onclick="parent.ManagementEngine.showNetlifyGuide()" class="px-8 py-2.5 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-[3px] text-[13px] font-light uppercase transition-all hover:bg-zinc-700">
                                                HOW TO FIX
                                            </button>
                                        </div>
                                        
                                        <div class="mt-8 hud-badge-micro text-zinc-600 uppercase font-mono opacity-40">
                                            ERR_CORS_ORIGIN_BLOCKED | ACTION_REQUIRED: REFRESH OR RETRY
                                        </div>
                                    </div>
                                </div>
                            `;
                        }
                    }
                }
                if (data.fatal) {
                    console.error('[HLS] Fatal:', data.details);
                    hls.destroy();
                }
            });
        }
        // ── กรณี Safari (native HLS) ──
        else if (video.canPlayType && video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = hlsUrl;
        }
        // ── Fallback: เรียก sim แทน ──
        else {
            console.warn('[HLS] Not supported, fallback to simulation');
            return;
        }

        // ── Track progress จาก video element จริง ──
        video.addEventListener('timeupdate', () => {
            if (video.duration && video.duration > 0) {
                const pct = Math.round((video.currentTime / video.duration) * 100);
                if (pct !== this.videoWatchedPercent) {
                    this.videoWatchedPercent = pct;

                    // Update UI เฉพาะ progress bar (ไม่ re-render ทั้งหมด)
                    const frameDoc = window.frames['main-frame']?.contentDocument || document;
                    const bar = frameDoc.getElementById('watch-progress-bar');
                    const label = frameDoc.getElementById('watch-progress-text');
                    if (bar) bar.style.width = pct + '%';
                    if (label) label.innerText = pct + '%';

                    if (pct >= this.requiredWatchPercent && !this._hlsPassNotified) {
                        this._hlsPassNotified = true;
                        window.parent?.HUD_NOTIFY?.toast('PROTOCOL_OK', `วิดีโอผ่าน ${this.requiredWatchPercent}% — สามารถไปขั้นถัดไปได้`, 'success');
                    }
                }
            }
        });
    },

    openCompatibilityGuide() {
        window.HUD_NOTIFY?.toast('COMPATIBILITY', 'Opening HLS Security Protocol Guide...', 'accent');
        // Use an absolute-ish path to prevent double "pages/" prefix
        const rootPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) || '';
        window.open(rootPath + '/pages/manual/compatibility.html', '_blank');
    },

    gotoStep(stepNum) {
        if (stepNum > this.currentStep) return;
        this.currentStep = stepNum;
        console.log(`[MANAGEMENT] Manual Step Navigation -> Step ${stepNum}`);
        this.renderMasteryFlow();
    },

    nextStep() {
        // Dev bypass mode skips all validation
        if (!this.devBypassEnabled) {
            // Step 1 (Pre-test): Must complete all quiz questions
            if (this.currentStep === 1) {
                const subject = IDLPMS_DATA.curriculum[this.currentSubjectID?.replace('SUB_', '')];
                const allLessons = [];
                subject?.units?.forEach(unit => { unit.lessons.forEach(l => allLessons.push(l)); });
                const lesson = allLessons[this.currentLessonIndex] || allLessons[0];
                const quizLength = lesson?.pedagogicalData?.quiz?.length || 0;

                if (this.stepTiming.pretestAnswers.length < quizLength) {
                    window.parent.HUD_NOTIFY?.toast('MASTERY_LOCKED', `ต้องทำ Pre-test ให้ครบ ${quizLength} ข้อก่อน`, 'error');
                    return;
                }
            }

            // Step 2 (LINK): Must spend at least 5 seconds reading
            if (this.currentStep === 2) {
                const elapsedMs = Date.now() - (this.stepTiming.stepStartTime || Date.now());
                const elapsedSec = Math.floor(elapsedMs / 1000);
                const requiredSec = 20;

                if (elapsedSec < requiredSec) {
                    const remaining = requiredSec - elapsedSec;
                    window.parent.HUD_NOTIFY?.toast('MASTERY_LOCKED', `กรุณาอ่านจุดประสงค์อีก ${remaining} วินาที`, 'info');
                    return;
                }
            }

            // Step 3 (Video): Must watch required percentage
            if (this.currentStep === 3 && this.videoWatchedPercent < this.requiredWatchPercent) {
                window.parent.HUD_NOTIFY?.toast('MASTERY_LOCKED', `ต้องดูวีดีโอผ่าน ${this.requiredWatchPercent}% ก่อน`, 'error');
                return;
            }

            // Step 4 (SYNC): Handled by checkSyncAnswers() - no additional check needed
            // Step 5 (PRIME): Handled by PRIME submission
            // Step 6 (Post-test): Must complete all quiz questions
            if (this.currentStep === 6) {
                const subject = IDLPMS_DATA.curriculum[this.currentSubjectID?.replace('SUB_', '')];
                const allLessons = [];
                subject?.units?.forEach(unit => { unit.lessons.forEach(l => allLessons.push(l)); });
                const lesson = allLessons[this.currentLessonIndex] || allLessons[0];
                const quizLength = lesson?.pedagogicalData?.quiz?.length || 0;

                if (this.stepTiming.posttestAnswers.length < quizLength) {
                    window.parent.HUD_NOTIFY?.toast('MASTERY_LOCKED', `ต้องทำ Post-test ให้ครบ ${quizLength} ข้อก่อน`, 'error');
                    return;
                }
            }
        }

        // If in REWIND mode and completed video rewatch, go back to failed step
        if (this.currentStep === 3 && this.rewindSourceStep !== null) {
            const returnToStep = this.rewindSourceStep;
            this.rewindSourceStep = null; // Clear REWIND mode
            this.requiredWatchPercent = 25; // Reset to default for next time

            window.parent.HUD_NOTIFY?.toast('REWIND_COMPLETE',
                `Rewatch complete! Returning to ${this.masterySteps[returnToStep - 1]?.label}`,
                'success'
            );

            this.currentStep = returnToStep;
            this.startStepTimer();
            this.initStepBehaviorTracking();
            this.renderMasteryFlow();
            return;
        }

        if (this.currentStep < 7) {
            // Mark current step as completed
            if (this.stepTiming.stepCompleted) {
                this.stepTiming.stepCompleted[this.currentStep - 1] = true;
            }

            this.currentStep++;
            this.videoWatchedPercent = 0;
            this._hlsPassNotified = false;
            this.renderMasteryFlow();
            // Auto-load HLS หลัง render เสร็จ (เลยเรียก setTimeout เพื่อรอ DOM)
            if (this.currentStep === 3) {
                setTimeout(() => this.loadHLSVideo(), 150);
            }
        } else {
            // Final Step (Step 7: MASTER) Completed -> Show Victory Celebration
            // 1. Resolve lesson info
            const rawKey = this.currentSubjectID?.replace('SUB_', '') || '';
            const subjectKey = MasteryAIAuditor.subjectKeyMap[rawKey] || rawKey;
            const subject = IDLPMS_DATA?.curriculum?.[subjectKey] || {};
            const allLessons = [];
            subject.units?.forEach(unit => unit.lessons?.forEach(l => allLessons.push(l)));
            const lesson = allLessons[this.currentLessonIndex] || { name: 'บทเรียน' };

            // 2. Calculate Final Stats
            const pretestCorrect = this.stepTiming.pretestAnswers?.filter(a => a.isCorrect).length || 0;
            const pretestTotal = Math.max(1, this.stepTiming.pretestAnswers?.length || 5);
            const pretestScore = Math.round((pretestCorrect / pretestTotal) * 100);

            const posttestCorrect = this.stepTiming.posttestAnswers?.filter(a => a.isCorrect).length || 0;
            const posttestTotal = Math.max(1, this.stepTiming.posttestAnswers?.length || 5);
            const posttestScore = Math.round((posttestCorrect / posttestTotal) * 100);

            const improvement = posttestScore - pretestScore;
            const totalTimeMs = Date.now() - (this.stepTiming.lessonStartTime || Date.now());
            const totalMins = Math.round(totalTimeMs / 60000);

            // 3. Determine Badge
            let badge = 'bronze';
            if (posttestScore >= 90 && improvement >= 20) badge = 'gold';
            else if (posttestScore >= 80) badge = 'silver';

            // 4. Show Victory Screen
            this.showVictoryScreen({
                lessonName: lesson.name,
                pretestScore,
                posttestScore,
                improvement,
                totalMins,
                badge
            });

            window.parent.HUD_NOTIFY?.toast('MISSION_DONE', 'High-Level Mastery Established!', 'success');
        }
    },

    // Toggle dev bypass mode
    toggleDevBypass() {
        this.devBypassEnabled = !this.devBypassEnabled;
        const status = this.devBypassEnabled ? 'ON' : 'OFF';
        window.parent.HUD_NOTIFY?.toast('DEV_MODE', `Dev Bypass: ${status}`, this.devBypassEnabled ? 'warning' : 'info');
        this.renderMasteryFlow();
    },

    // Step 2 countdown timer
    step2CountdownInterval: null,
    startStep2Countdown() {
        // Clear any existing interval
        if (this.step2CountdownInterval) {
            clearInterval(this.step2CountdownInterval);
        }

        const requiredSec = 20;
        const startTime = this.stepTiming.stepStartTime || Date.now();

        const updateCountdown = () => {
            const countdownEl = document.getElementById('step2-countdown')
                || window.frames['main-frame']?.contentDocument?.getElementById('step2-countdown');

            if (!countdownEl || this.currentStep !== 2) {
                clearInterval(this.step2CountdownInterval);
                return;
            }

            const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
            const remaining = Math.max(0, requiredSec - elapsedSec);

            if (remaining > 0) {
                countdownEl.textContent = remaining;
                countdownEl.className = 'text-[13px] font-mono text-[var(--vs-accent)]';
            } else {
                countdownEl.textContent = 'READY';
                countdownEl.className = 'text-[13px] font-mono text-[rgba(34,197,94,1)]';
                countdownEl.nextElementSibling.textContent = '';
                clearInterval(this.step2CountdownInterval);
            }
        };

        // Initial update
        updateCountdown();
        // Update every second
        this.step2CountdownInterval = setInterval(updateCountdown, 1000);
    },

    renderTrait(label, percent, colorClass) {
        return `
            <div>
                <div class="flex justify-between text-[13px] mb-1 font-light">
                    <span class="text-[var(--vs-text-muted)] uppercase">${label}</span>
                    <span class="${colorClass}">${percent}%</span>
                </div>
                <div class="h-[3px] bg-[var(--vs-border)] rounded-[3px] overflow-hidden">
                    <div class="h-full bg-current ${colorClass}" style="width: ${percent}%"></div>
                </div>
            </div>
        `;
    },

    renderMiniCard(label, value, colorClass, icon) {
        return `
            <div class="p-4 rounded-[3px] bg-[var(--vs-bg-card)] border border-[rgba(63,63,70,0.5)]  flex items-center justify-between group hover:border-white/30 transition-all">
                <div>
                    <div class="text-[13px] text-[var(--vs-text-muted)] uppercase font-light mb-1">${label}</div>
                    <div class="text-2xl font-light text-[var(--vs-text-title)]">${value}</div>
                </div>
                <div class="w-10 h-10 rounded-[3px] bg-[var(--vs-bg-deep)] border border-[rgba(63,63,70,0.5)] flex items-center justify-center">
                    <i class="icon ${icon} h-5 w-5 opacity-40 group-hover:opacity-100 transition-opacity"></i>
                </div>
            </div>
        `;
    },

    renderActivityItem(name, icon, task, percent) {
        return `
            <div class="p-4 rounded-[3px] bg-[var(--vs-bg-card)] border border-[rgba(63,63,70,0.5)]  flex items-center space-x-4">
                <div class="w-10 h-10 rounded-[3px] bg-[var(--vs-bg-deep)] border border-[rgba(63,63,70,0.5)] flex items-center justify-center">
                    <i class="icon ${icon} h-5 w-5 opacity-40"></i>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-[13px] font-light text-[var(--vs-text-title)] Thai-Rule truncate">${name}</span>
                        <span class="text-[13px] text-[var(--vs-accent)] font-light">${percent}</span>
                    </div>
                    <div class="text-[13px] text-[var(--vs-text-muted)] uppercase font-light truncate">${task}</div>
                </div>
            </div>
        `;
    },
};

document.addEventListener('DOMContentLoaded', () => {
    window.ManagementEngine.init();
});
