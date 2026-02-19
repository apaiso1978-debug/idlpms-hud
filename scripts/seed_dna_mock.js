/**
 * DNA Mock Generator
 * Populates Phase 4 Intelligence DNA (KPAED) with sample signals
 */
(async () => {
    const ds = new InsForgeDataService();
    await ds.initialize();

    const personId = 'STU_001'; // Mock Student
    const creatorId = 'SYSTEM';

    const traces = [
        { k: 85, p: 40, a: 90, e: 70, d: 95, type: 'quiz', desc: 'Pre-test: Thai Language 101' },
        { k: 88, p: 45, a: 92, e: 75, d: 98, type: 'activity', desc: 'Video Lesson: Suffixes and Prefixes' },
        { k: 90, p: 60, a: 95, e: 80, d: 100, type: 'practice', desc: 'Fill-in-the-blanks: Level 2 Mastery' }
    ];

    console.log('[Mock] Seeding DNA signals for:', personId);
    for (const trace of traces) {
        await ds.addIntelligenceSnapshot(personId, trace, creatorId, {
            type: trace.type,
            description: trace.desc
        });
        console.log(`[Mock] Added signal: ${trace.type} - ${trace.desc}`);
    }

    console.log('[Mock] DNA Seeding Complete.');
})();
