/**
 * Mr. Worachai Aphaiso's Schedule Injection Script
 * For IDLPMS Teaching Schedule Grid
 */

(function () {
    console.log("[INJECT] Starting schedule data injection...");

    const subjectBank = [
        { id: 'sb-anti-3', nameTH: 'การป้องกันการทุจริต', nameEN: 'Anti-Corruption', code: 'ส 13201', grade: '3', room: '1', type: 'SOC' },
        { id: 'sb-anti-1', nameTH: 'การป้องกันการทุจริต', nameEN: 'Anti-Corruption', code: 'ส 11201', grade: '1', room: '1/1, 1/2', type: 'SOC' },
        { id: 'sb-pe-1-1', nameTH: 'สุขศึกษาและพลศึกษา', nameEN: 'Health and PE', code: 'พ 11101', grade: '1', room: '1', type: 'PE' },
        { id: 'sb-guidance-2-1', nameTH: 'แนะแนว', nameEN: 'Guidance', code: '-', grade: '2', room: '1', type: 'WORK' },
        { id: 'sb-pe-3', nameTH: 'สุขศึกษาและพลศึกษา', nameEN: 'Health and PE', code: 'พ 13101', grade: '3', room: '1', type: 'PE' },
        { id: 'sb-pe-2-2', nameTH: 'สุขศึกษาและพลศึกษา', nameEN: 'Health and PE', code: 'พ 12101', grade: '2', room: '2', type: 'PE' },
        { id: 'sb-guidance-1-1', nameTH: 'แนะแนว', nameEN: 'Guidance', code: '-', grade: '1', room: '1', type: 'WORK' },
        { id: 'sb-hist-1-2', nameTH: 'ประวัติศาสตร์', nameEN: 'History', code: 'ส 11102', grade: '1', room: '2', type: 'HIST' },
        { id: 'sb-guidance-1-2', nameTH: 'แนะแนว', nameEN: 'Guidance', code: '-', grade: '1', room: '2', type: 'WORK' },
        { id: 'sb-guidance-2-2', nameTH: 'แนะแนว', nameEN: 'Guidance', code: '-', grade: '2', room: '2', type: 'WORK' },
        { id: 'sb-hist-3', nameTH: 'ประวัติศาสตร์', nameEN: 'History', code: 'ส 13102', grade: '3', room: '1', type: 'HIST' },
        { id: 'sb-anti-2-2', nameTH: 'การป้องกันการทุจริต', nameEN: 'Anti-Corruption', code: 'ส 12202', grade: '2', room: '2', type: 'SOC' },
        { id: 'sb-hist-2-1', nameTH: 'ประวัติศาสตร์', nameEN: 'History', code: 'ส 12102', grade: '2', room: '1', type: 'HIST' },
        { id: 'sb-anti-2-1', nameTH: 'การป้องกันการทุจริต', nameEN: 'Anti-Corruption', code: 'ส 12202', grade: '2', room: '1', type: 'SOC' },
        { id: 'sb-plc', nameTH: 'PLC', nameEN: 'PLC', code: '-', grade: '-', room: '-', type: 'WORK' },
        { id: 'sb-club', nameTH: 'ชุมนุม', nameEN: 'Club Activity', code: '-', grade: '-', room: '-', type: 'WORK' },
        { id: 'sb-scout', nameTH: 'ลูกเสือ', nameEN: 'Scout', code: '-', grade: '-', room: '-', type: 'WORK' },
        { id: 'sb-prayer', nameTH: 'สวดมนต์สุดสัปดาห์', nameEN: 'Weekly Prayer', code: '-', grade: '-', room: '-', type: 'WORK' },
    ];

    const scheduleData = {
        mode: 'manual',
        schedule: {
            'MON': { 3: 'sb-anti-3', 4: 'sb-anti-1', 5: 'sb-pe-1-1' },
            'TUE': { 4: 'sb-guidance-2-1', 6: 'sb-pe-3', 7: 'sb-plc' },
            'WED': { 2: 'sb-pe-2-2', 4: 'sb-guidance-1-1', 5: 'sb-hist-1-2', 6: 'sb-club', 7: 'sb-plc' },
            'THU': { 4: 'sb-guidance-1-2', 5: 'sb-guidance-2-2', 6: 'sb-scout' },
        },
    };

    // Apply to LocalStorage
    localStorage.setItem('idlpms_subject_bank', JSON.stringify(subjectBank));
    localStorage.setItem('idlpms_teacher_schedule', JSON.stringify(scheduleData));

    console.log("[INJECT] Data applied successfully.");
    console.log("Subject Bank Entries:", subjectBank.length);
    console.log("Schedule Mapping:", scheduleData.schedule);

    // Refresh if we are on the schedule page
    if (window.location.pathname.includes('schedule.html')) {
        console.log("[INJECT] Schedule page detected. Triggering reload...");
        window.location.reload();
    } else {
        console.log("[INJECT] Done. Please refresh the Schedule page to see changes.");
    }
})();
