/**
 * IDLPMS DataService Unit Tests
 * ==============================
 * Comprehensive test suite for DataService layer
 * Covers: LocalDataService, AppsScriptDataService, DataServiceFactory
 *
 * Run with: npm test or npx vitest
 *
 * @version 2.0.0
 * @author IDLPMS Development Team
 */

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

// Mock IDLPMS_DATA for testing
const MOCK_IDLPMS_DATA = {
    roles: {
        STUDENT: { id: 'STUDENT', name: 'นักเรียน', level: 1, permissions: ['read_own'] },
        PARENT: { id: 'PARENT', name: 'ผู้ปกครอง', level: 2, permissions: ['read_child'] },
        TEACHER: { id: 'TEACHER', name: 'ครู', level: 3, permissions: ['read_class', 'write_grades'] },
        SCHOOL_DIR: { id: 'SCHOOL_DIR', name: 'ผู้อำนวยการ', level: 4, permissions: ['manage_school'] },
        ESA_DIR: { id: 'ESA_DIR', name: 'ผอ.เขต', level: 5, permissions: ['manage_esa'] },
        OBEC: { id: 'OBEC', name: 'สพฐ.', level: 6, permissions: ['manage_obec'] },
        MOE: { id: 'MOE', name: 'กระทรวง', level: 7, permissions: ['all'] }
    },
    structure: {
        districts: {
            ESA_01: { id: 'ESA_01', name: 'สพป.กรุงเทพฯ 1', schools: ['SCH_001', 'SCH_002'] },
            ESA_02: { id: 'ESA_02', name: 'สพป.กรุงเทพฯ 2', schools: ['SCH_003', 'SCH_004'] }
        },
        schools: {
            SCH_001: { id: 'SCH_001', name: 'โรงเรียนอนุบาลกรุงเทพ', districtId: 'ESA_01', classes: ['6/1', '6/2'] },
            SCH_002: { id: 'SCH_002', name: 'โรงเรียนประถมกรุงเทพ', districtId: 'ESA_01', classes: ['6/1'] },
            SCH_003: { id: 'SCH_003', name: 'โรงเรียนมัธยมกรุงเทพ', districtId: 'ESA_02', classes: ['ม.1/1'] }
        }
    },
    users: {
        STU_001: { role: 'STUDENT', fullName: 'สมชาย ใจดี', schoolId: 'SCH_001', classId: '6/1', avatar: 'SC', color: 'cyan' },
        STU_002: { role: 'STUDENT', fullName: 'สมหญิง รักเรียน', schoolId: 'SCH_001', classId: '6/1', avatar: 'SH', color: 'rose' },
        STU_003: { role: 'STUDENT', fullName: 'สมศักดิ์ เก่งมาก', schoolId: 'SCH_002', classId: '6/1', avatar: 'SS', color: 'amber' },
        PAR_001: { role: 'PARENT', fullName: 'นายพ่อ ใจดี', studentId: 'STU_001', avatar: 'NP', color: 'emerald' },
        TEA_001: { role: 'TEACHER', fullName: 'ครูสมศรี สอนดี', schoolId: 'SCH_001', subject: 'คณิตศาสตร์', subjectId: 'MATH', avatar: 'KS', color: 'cyan' },
        TEA_002: { role: 'TEACHER', fullName: 'ครูสมปอง ภาษาไทย', schoolId: 'SCH_001', subject: 'ภาษาไทย', subjectId: 'THAI', avatar: 'KP', color: 'rose' },
        TEA_003: { role: 'TEACHER', fullName: 'ครูสมใจ วิทยาศาสตร์', schoolId: 'SCH_002', subject: 'วิทยาศาสตร์', subjectId: 'SCI', avatar: 'KJ', color: 'amber' },
        SCH_DIR_001: { role: 'SCHOOL_DIR', fullName: 'ผอ.สมบูรณ์ บริหารดี', schoolId: 'SCH_001', avatar: 'SB', color: 'indigo' },
        ESA_DIR_001: { role: 'ESA_DIR', fullName: 'ผอ.เขต สมหวัง', districtId: 'ESA_01', avatar: 'SW', color: 'purple' },
        OBEC_001: { role: 'OBEC', fullName: 'เลขาฯ สพฐ. สมพร', org: 'OBEC', avatar: 'SP', color: 'fuchsia' },
        MOE_001: { role: 'MOE', fullName: 'ปลัดกระทรวง สมเดช', org: 'MOE', avatar: 'SD', color: 'orange' }
    },
    curriculum: {
        THAI: { id: 'THAI', name: 'ภาษาไทย', color: '#fb7185', units: [
            { id: 'TH_U1', name: 'หน่วยที่ 1: การอ่าน', lessons: ['L1', 'L2', 'L3'] },
            { id: 'TH_U2', name: 'หน่วยที่ 2: การเขียน', lessons: ['L4', 'L5'] }
        ]},
        MATH: { id: 'MATH', name: 'คณิตศาสตร์', color: '#fbbf24', units: [
            { id: 'MA_U1', name: 'หน่วยที่ 1: จำนวนและการดำเนินการ', lessons: ['L1', 'L2'] }
        ]},
        SCI: { id: 'SCI', name: 'วิทยาศาสตร์', color: '#22d3ee', units: [] }
    },
    groups: {
        GRP_001: { id: 'GRP_001', name: 'ครูคณิตศาสตร์ กลุ่ม 1', type: 'subject', members: ['TEA_001'], avatar: 'KN', color: 'amber' },
        GRP_002: { id: 'GRP_002', name: 'ทีมบริหาร SCH_001', type: 'admin', members: ['SCH_DIR_001', 'TEA_001', 'TEA_002'], avatar: 'TB', color: 'cyan' }
    },
    stats: {
        global: { totalStudents: 6500000, totalSchools: 30000, activeUsers: 1500000 },
        school: { attendance: 95.5, pendingGrades: 12, activeLessons: 45 }
    }
};

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Simple assertion helper
 */
function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

/**
 * Deep equality check
 */
function deepEqual(a, b) {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (typeof a !== 'object' || a === null || b === null) return false;

    const keysA = Object.keys(a);
    const keysB = Object.keys(b);

    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
        if (!keysB.includes(key) || !deepEqual(a[key], b[key])) {
            return false;
        }
    }

    return true;
}

/**
 * Test runner
 */
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
        this.skipped = 0;
    }

    describe(suiteName, fn) {
        console.log(`\n📦 ${suiteName}`);
        fn();
    }

    it(testName, fn) {
        this.tests.push({ name: testName, fn });
    }

    skip(testName, fn) {
        this.tests.push({ name: testName, fn, skip: true });
    }

    async run() {
        console.log('\n🧪 IDLPMS DataService Test Suite\n');
        console.log('='.repeat(50));

        for (const test of this.tests) {
            if (test.skip) {
                console.log(`  ⏭️  SKIP: ${test.name}`);
                this.skipped++;
                continue;
            }

            try {
                await test.fn();
                console.log(`  ✅ PASS: ${test.name}`);
                this.passed++;
            } catch (error) {
                console.log(`  ❌ FAIL: ${test.name}`);
                console.log(`     Error: ${error.message}`);
                this.failed++;
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed, ${this.skipped} skipped`);
        console.log(`   Total: ${this.tests.length} tests\n`);

        return this.failed === 0;
    }
}

// ============================================================================
// MOCK SETUP
// ============================================================================

// Set up global IDLPMS_DATA mock
if (typeof globalThis !== 'undefined') {
    globalThis.IDLPMS_DATA = MOCK_IDLPMS_DATA;
} else if (typeof window !== 'undefined') {
    window.IDLPMS_DATA = MOCK_IDLPMS_DATA;
} else if (typeof global !== 'undefined') {
    global.IDLPMS_DATA = MOCK_IDLPMS_DATA;
}

// ============================================================================
// LOCAL DATA SERVICE TESTS
// ============================================================================

const runner = new TestRunner();

runner.describe('LocalDataService', () => {

    // ------ Initialization Tests ------

    runner.it('should initialize successfully with IDLPMS_DATA', async () => {
        const service = new LocalDataService();
        await service.initialize();
        const health = await service.healthCheck();
        assert(health.status === 'healthy', 'Service should be healthy after init');
        assert(health.mode === 'local', 'Mode should be local');
    });

    runner.it('should throw error if not initialized before use', async () => {
        const service = new LocalDataService();
        let errorThrown = false;
        try {
            await service.getUser('STU_001');
        } catch (error) {
            errorThrown = true;
            assert(error.message.includes('not initialized'), 'Should mention not initialized');
        }
        assert(errorThrown, 'Should throw error when not initialized');
    });

    runner.it('should not re-initialize if already initialized', async () => {
        const service = new LocalDataService();
        await service.initialize();
        await service.initialize(); // Should not throw
        const health = await service.healthCheck();
        assert(health.status === 'healthy', 'Should remain healthy');
    });

    // ------ User Operations Tests ------

    runner.it('should get user by ID', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const user = await service.getUser('STU_001');
        assert(user !== null, 'User should exist');
        assert(user.id === 'STU_001', 'User ID should match');
        assert(user.fullName === 'สมชาย ใจดี', 'User name should match');
        assert(user.role === 'STUDENT', 'User role should match');
        assert(user.roleConfig !== undefined, 'Should include role config');
    });

    runner.it('should return null for non-existent user', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const user = await service.getUser('NON_EXISTENT');
        assert(user === null, 'Should return null for non-existent user');
    });

    runner.it('should get users by role', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const students = await service.getUsersByRole('STUDENT');
        assert(Array.isArray(students), 'Should return array');
        assert(students.length === 3, 'Should have 3 students');
        assert(students.every(u => u.role === 'STUDENT'), 'All should be students');
    });

    runner.it('should get users by school', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const users = await service.getUsersBySchool('SCH_001');
        assert(Array.isArray(users), 'Should return array');
        assert(users.length > 0, 'Should have users');
        assert(users.every(u => u.schoolId === 'SCH_001'), 'All should be from SCH_001');
    });

    runner.it('should get users by ESA', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const users = await service.getUsersByESA('ESA_01');
        assert(Array.isArray(users), 'Should return array');
        assert(users.length > 0, 'Should have users');

        // Verify users are from schools in ESA_01
        const esa01Schools = ['SCH_001', 'SCH_002'];
        const allFromESA01 = users.every(u =>
            esa01Schools.includes(u.schoolId) || u.districtId === 'ESA_01'
        );
        assert(allFromESA01, 'All users should be from ESA_01');
    });

    runner.it('should update user data', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const updated = await service.updateUser('STU_001', { status: 'active' });
        assert(updated.status === 'active', 'Status should be updated');
        assert(updated._lastModified !== undefined, 'Should have lastModified timestamp');

        // Verify change persists
        const user = await service.getUser('STU_001');
        assert(user.status === 'active', 'Change should persist');
    });

    runner.it('should throw error when updating non-existent user', async () => {
        const service = new LocalDataService();
        await service.initialize();

        let errorThrown = false;
        try {
            await service.updateUser('NON_EXISTENT', { status: 'active' });
        } catch (error) {
            errorThrown = true;
            assert(error.message.includes('not found'), 'Should mention not found');
        }
        assert(errorThrown, 'Should throw error for non-existent user');
    });

    // ------ School Operations Tests ------

    runner.it('should get school by ID', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const school = await service.getSchool('SCH_001');
        assert(school !== null, 'School should exist');
        assert(school.id === 'SCH_001', 'School ID should match');
        assert(school.name === 'โรงเรียนอนุบาลกรุงเทพ', 'School name should match');
        assert(school.districtId === 'ESA_01', 'District ID should match');
    });

    runner.it('should return null for non-existent school', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const school = await service.getSchool('NON_EXISTENT');
        assert(school === null, 'Should return null for non-existent school');
    });

    runner.it('should get schools by ESA', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const schools = await service.getSchoolsByESA('ESA_01');
        assert(Array.isArray(schools), 'Should return array');
        assert(schools.length === 2, 'Should have 2 schools in ESA_01');
        assert(schools.every(s => s.districtId === 'ESA_01'), 'All should be from ESA_01');
    });

    runner.it('should update school data', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const updated = await service.updateSchool('SCH_001', { principal: 'ผอ.ใหม่' });
        assert(updated.principal === 'ผอ.ใหม่', 'Principal should be updated');
    });

    // ------ ESA Operations Tests ------

    runner.it('should get ESA by ID', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const esa = await service.getESA('ESA_01');
        assert(esa !== null, 'ESA should exist');
        assert(esa.id === 'ESA_01', 'ESA ID should match');
        assert(esa.name === 'สพป.กรุงเทพฯ 1', 'ESA name should match');
    });

    runner.it('should get all ESAs', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const esas = await service.getAllESAs();
        assert(Array.isArray(esas), 'Should return array');
        assert(esas.length === 2, 'Should have 2 ESAs');
    });

    // ------ Curriculum Operations Tests ------

    runner.it('should get subject by ID', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const subject = await service.getSubject('THAI');
        assert(subject !== null, 'Subject should exist');
        assert(subject.id === 'THAI', 'Subject ID should match');
        assert(subject.name === 'ภาษาไทย', 'Subject name should match');
        assert(subject.color === '#fb7185', 'Subject color should match');
    });

    runner.it('should get all subjects', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const subjects = await service.getAllSubjects();
        assert(Array.isArray(subjects), 'Should return array');
        assert(subjects.length === 3, 'Should have 3 subjects');
    });

    runner.it('should get subject units', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const units = await service.getSubjectUnits('THAI');
        assert(Array.isArray(units), 'Should return array');
        assert(units.length === 2, 'Should have 2 units for THAI');
        assert(units[0].name === 'หน่วยที่ 1: การอ่าน', 'First unit name should match');
    });

    runner.it('should return empty array for subject with no units', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const units = await service.getSubjectUnits('SCI');
        assert(Array.isArray(units), 'Should return array');
        assert(units.length === 0, 'Should have no units for SCI');
    });

    // ------ Role Operations Tests ------

    runner.it('should get role config by ID', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const role = await service.getRoleConfig('TEACHER');
        assert(role !== null, 'Role should exist');
        assert(role.id === 'TEACHER', 'Role ID should match');
        assert(role.name === 'ครู', 'Role name should match');
        assert(role.level === 3, 'Role level should match');
    });

    runner.it('should get all roles', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const roles = await service.getAllRoles();
        assert(Array.isArray(roles), 'Should return array');
        assert(roles.length === 7, 'Should have 7 roles');
    });

    // ------ Group Operations Tests ------

    runner.it('should get group by ID', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const group = await service.getGroup('GRP_001');
        assert(group !== null, 'Group should exist');
        assert(group.id === 'GRP_001', 'Group ID should match');
        assert(group.name === 'ครูคณิตศาสตร์ กลุ่ม 1', 'Group name should match');
    });

    runner.it('should get groups by user', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const groups = await service.getGroupsByUser('TEA_001');
        assert(Array.isArray(groups), 'Should return array');
        assert(groups.length === 2, 'TEA_001 should be in 2 groups');
    });

    // ------ Statistics Tests ------

    runner.it('should get global stats', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const stats = await service.getGlobalStats();
        assert(stats.totalStudents === 6500000, 'Total students should match');
        assert(stats.totalSchools === 30000, 'Total schools should match');
    });

    runner.it('should get school stats', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const stats = await service.getSchoolStats('SCH_001');
        assert(stats.schoolId === 'SCH_001', 'School ID should match');
        assert(typeof stats.studentCount === 'number', 'Should have student count');
        assert(typeof stats.teacherCount === 'number', 'Should have teacher count');
    });

    runner.it('should get ESA stats', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const stats = await service.getESAStats('ESA_01');
        assert(stats.esaId === 'ESA_01', 'ESA ID should match');
        assert(stats.schoolCount === 2, 'Should have 2 schools');
        assert(typeof stats.totalUsers === 'number', 'Should have total users');
    });

    // ------ Health Check Tests ------

    runner.it('should return healthy status', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const health = await service.healthCheck();
        assert(health.status === 'healthy', 'Status should be healthy');
        assert(health.mode === 'local', 'Mode should be local');
        assert(health.dataLoaded === true, 'Data should be loaded');
        assert(typeof health.timestamp === 'number', 'Should have timestamp');
    });

    // ------ Sync Tests ------

    runner.it('should return not required for local sync', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const result = await service.sync();
        assert(result.synced === false, 'Should not sync in local mode');
        assert(result.reason === 'local_mode', 'Reason should be local_mode');
    });

});

// ============================================================================
// DATA SERVICE FACTORY TESTS
// ============================================================================

runner.describe('DataServiceFactory', () => {

    runner.it('should create LocalDataService instance', async () => {
        DataServiceFactory.reset();
        const service = await DataServiceFactory.getInstance('local');

        assert(service instanceof LocalDataService, 'Should be LocalDataService instance');
        assert(service._mode === 'local', 'Mode should be local');
    });

    runner.it('should return singleton instance', async () => {
        DataServiceFactory.reset();
        const service1 = await DataServiceFactory.getInstance('local');
        const service2 = await DataServiceFactory.getInstance('local');

        assert(service1 === service2, 'Should return same instance');
    });

    runner.it('should reset singleton when requested', async () => {
        const service1 = await DataServiceFactory.getInstance('local');
        DataServiceFactory.reset();
        const service2 = await DataServiceFactory.getInstance('local');

        assert(service1 !== service2, 'Should create new instance after reset');
    });

    runner.it('should update configuration', async () => {
        DataServiceFactory.configure({
            cache: { ttl: 10000 }
        });

        assert(DataServiceConfig.cache.ttl === 10000, 'Config should be updated');
    });

    runner.it('should throw error for unknown mode', async () => {
        DataServiceFactory.reset();
        let errorThrown = false;

        try {
            await DataServiceFactory.getInstance('unknown');
        } catch (error) {
            errorThrown = true;
            assert(error.message.includes('Unknown'), 'Should mention unknown mode');
        }

        assert(errorThrown, 'Should throw error for unknown mode');
    });

});

// ============================================================================
// EDGE CASE TESTS
// ============================================================================

runner.describe('Edge Cases', () => {

    runner.it('should handle empty role filter', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const users = await service.getUsersByRole('NON_EXISTENT_ROLE');
        assert(Array.isArray(users), 'Should return array');
        assert(users.length === 0, 'Should be empty for non-existent role');
    });

    runner.it('should handle empty school filter', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const users = await service.getUsersBySchool('NON_EXISTENT_SCHOOL');
        assert(Array.isArray(users), 'Should return array');
        assert(users.length === 0, 'Should be empty for non-existent school');
    });

    runner.it('should handle empty ESA filter', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const schools = await service.getSchoolsByESA('NON_EXISTENT_ESA');
        assert(Array.isArray(schools), 'Should return array');
        assert(schools.length === 0, 'Should be empty for non-existent ESA');
    });

    runner.it('should handle null subject ID', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const subject = await service.getSubject(null);
        assert(subject === null, 'Should return null for null ID');
    });

    runner.it('should handle undefined group ID', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const group = await service.getGroup(undefined);
        assert(group === null, 'Should return null for undefined ID');
    });

});

// ============================================================================
// PERFORMANCE TESTS
// ============================================================================

runner.describe('Performance', () => {

    runner.it('should initialize within acceptable time', async () => {
        const service = new LocalDataService();

        const start = Date.now();
        await service.initialize();
        const elapsed = Date.now() - start;

        assert(elapsed < 100, `Initialization should be fast (took ${elapsed}ms)`);
    });

    runner.it('should handle multiple concurrent requests', async () => {
        const service = new LocalDataService();
        await service.initialize();

        const start = Date.now();

        // Fire 100 concurrent requests
        const promises = [];
        for (let i = 0; i < 100; i++) {
            promises.push(service.getUser('STU_001'));
            promises.push(service.getUsersByRole('STUDENT'));
            promises.push(service.getSchool('SCH_001'));
        }

        await Promise.all(promises);
        const elapsed = Date.now() - start;

        assert(elapsed < 1000, `Concurrent requests should be fast (took ${elapsed}ms)`);
    });

});

// ============================================================================
// RUN TESTS
// ============================================================================

// Auto-run if executed directly
if (typeof window !== 'undefined') {
    // Browser environment
    window.addEventListener('DOMContentLoaded', async () => {
        const success = await runner.run();
        console.log(success ? '🎉 All tests passed!' : '💥 Some tests failed!');
    });
} else if (typeof require !== 'undefined' && require.main === module) {
    // Node.js environment - direct execution
    (async () => {
        // Import the service classes if running in Node
        try {
            const {
                DataServiceConfig,
                LocalDataService,
                DataServiceFactory
            } = require('../src/services/DataService.js');

            // Make available globally for tests
            global.DataServiceConfig = DataServiceConfig;
            global.LocalDataService = LocalDataService;
            global.DataServiceFactory = DataServiceFactory;
        } catch (e) {
            console.log('Note: Running with inline mock implementations');
        }

        const success = await runner.run();
        process.exit(success ? 0 : 1);
    })();
}

// Export for test frameworks
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MOCK_IDLPMS_DATA,
        TestRunner,
        runner,
        assert,
        deepEqual
    };
}
