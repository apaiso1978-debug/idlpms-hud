/**
 * IDLPMS Security Engine (Anti-Guessing)
 * ========================================
 * Monitors for suspicious behavioral patterns (clicking fast, repeating answers).
 * Enforces cooldowns and lockouts to ensure learning integrity.
 *
 * @version 2.0.0
 * @author IDLPMS Development Team
 */

class SecurityEngine {
    constructor() {
        this.config = {
            minTimePerQuestion: { short: 5, long: 10, matching: 15, fillIn: 8 },
            wrongStreakPenalty: {
                2: { action: 'warning', message: 'ลองอ่านทบทวนอีกครั้งนะ' },
                3: { action: 'lockout', duration: 30 },
                4: { action: 'lockout', duration: 60 },
                5: { action: 'lockout', duration: 120 }
            }
        };
    }

    validateTiming(questionType, startTime) {
        const elapsed = (Date.now() - startTime) / 1000;
        const minTime = this.config.minTimePerQuestion[questionType] || 5;
        return {
            ok: elapsed >= minTime,
            remaining: Math.max(0, minTime - elapsed)
        };
    }

    detectPattern(history) {
        if (history.length < 5) return null;

        // Same answer streak
        const lastFive = history.slice(-5);
        if (lastFive.every(a => a === lastFive[0])) return 'SAME_ANSWER_STREAK';

        return null;
    }

    handleLockout(duration) {
        if (window.HUD_NOTIFY) {
            window.HUD_NOTIFY.toast('SECURITY_LOCK', `กรุณาทบทวนก่อนทำต่อ (${duration} วินาที)`, 'error');
        }
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.SecurityEngine = new SecurityEngine();
}
