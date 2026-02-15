/**
 * IDLPMS Mastery AI Auditor
 * ==========================
 * Local Semantic Heuristic Engine for auditing student answers.
 * Detects relevance, depth, and anti-copying patterns.
 *
 * @version 2.0.0
 * @author IDLPMS Development Team
 */

class MasteryAIAuditor {
    constructor() {
        this.subjectKeyMap = {
            'THAI': 'THAI',
            'MATH': 'MATH',
            'SCI': 'SCI',
            'SOC': 'SOC',
            'HIST': 'HIST',
            'PE': 'PE',
            'ART': 'ART',
            'WORK': 'WORK',
            'ENG': 'ENG',
            'HISTORY': 'HIST',
            'SOCIAL': 'SOC',
            'SCIENCE': 'SCI',
            'ENGLISH': 'ENG',
            'CAREERS': 'WORK'
        };

        this.educationalTerms = ['เพราะ', 'เนื่องจาก', 'สำคัญ', 'ส่งผล', 'เห็นว่า', 'เข้าใจ'];
    }

    /**
     * Audit a student answer against lesson context
     */
    audit(answer, context) {
        const text = (answer || '').trim().toLowerCase();
        const question = (context.question || '').trim().toLowerCase();

        // 1. Keyword check
        let keywords = [];
        if (Array.isArray(context.keywords)) {
            keywords = context.keywords.map(k => String(k).toLowerCase());
        }
        const summary = (context.summary || '').toLowerCase();

        // 1. Anti-Copying Detection (Similarity Audit)
        const similarity = this.calculateSimilarity(text, question);
        if (similarity > 0.6) {
            return {
                passed: false,
                score: 20,
                reason: 'AI ตรวจพบว่าคุณคัดลอกโจทย์มาตอบ กรุณาใช้ความคิดเห็นของคุณเอง'
            };
        }

        // 2. Depth Check (Word Count & Complexity)
        const words = text.split(/\s+/).filter(w => w.length > 0);
        if (words.length < 3 && text.length < 15) {
            return {
                passed: false,
                score: 30,
                reason: 'คำตอบสั้นเกินไป AI ไม่สามารถประมวลผลความเข้าใจได้'
            };
        }

        // 3. Relevance Check (Keyword Density)
        let matchCount = 0;
        keywords.forEach(keyword => {
            if (text.includes(keyword)) matchCount += 2;
        });

        this.educationalTerms.forEach(term => {
            if (text.includes(term)) matchCount += 1;
        });

        const score = Math.min(100, (matchCount * 15) + (text.length / 5));

        if (score < 40) {
            return {
                passed: false,
                score,
                reason: 'คำตอบดูเหมือนจะไม่เกี่ยวข้องกับเนื้อหาบทเรียน กรุณาทบทวนวิดีโออีกครั้ง'
            };
        }

        return { passed: true, score, reason: 'ผ่านการตรวจสอบความเกี่ยวข้อง' };
    }

    calculateSimilarity(s1, s2) {
        if (!s1 || !s2) return 0;
        const set1 = new Set(s1.split(''));
        const set2 = new Set(s2.split(''));
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        return union.size === 0 ? 0 : intersection.size / union.size;
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.MasteryAIAuditor = new MasteryAIAuditor();
}
