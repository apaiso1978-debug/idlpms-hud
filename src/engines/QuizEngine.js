/**
 * E-OS Quiz Engine
 * ===================
 * Manages the state and logic for lessons, quizzes, and mastery assessments.
 *
 * @version 2.0.0
 * @author E-OS Development Team
 */

class QuizEngine {
    constructor() {
        this.currentLessonIndex = 0;
        this.currentQuestionIndex = 0;
        this.quizState = {
            wrongStreak: 0,
            retryCount: 0,
            lastRetryTime: null,
            answerHistory: [],
            timeHistory: [],
            isLocked: false,
            lockEndTime: null,
            questionStartTime: null
        };
    }

    startQuestion() {
        this.quizState.questionStartTime = Date.now();
    }

    submitAnswer(answer, isCorrect) {
        const timeTaken = (Date.now() - (this.quizState.questionStartTime || Date.now())) / 1000;
        this.quizState.answerHistory.push(answer);
        this.quizState.timeHistory.push(timeTaken);

        if (isCorrect) {
            this.quizState.wrongStreak = 0;
        } else {
            this.quizState.wrongStreak++;
        }

        return {
            timeTaken,
            wrongStreak: this.quizState.wrongStreak,
            shouldLock: this.checkSecurity()
        };
    }

    checkSecurity() {
        // Anti-guessing logic (simplified for extraction)
        if (this.quizState.wrongStreak >= 3) return true;
        // Further logic will be integrated with SecurityEngine
        return false;
    }

    reset() {
        this.currentQuestionIndex = 0;
        this.quizState.wrongStreak = 0;
        this.quizState.answerHistory = [];
        this.quizState.timeHistory = [];
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.QuizEngine = new QuizEngine();
}
