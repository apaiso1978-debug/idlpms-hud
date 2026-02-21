/**
 * school_dna_logic.js
 * 
 * Logic bridge for pages/school_dna.html
 * Fetches data from DNACoreService and maps it to the DNASpider and DNAHeatmap UI components.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Wait a moment to ensure IDLPMS_DATA and dependencies are loaded
    setTimeout(() => {
        initSchoolDNA();
    }, 100);
});

function initSchoolDNA() {
    if (typeof DNACoreService === 'undefined') {
        console.error('[SchoolDNA] DNACoreService not found!');
        return;
    }

    const schoolDNA = DNACoreService.getSchoolAverageDNA();
    if (!schoolDNA) return;

    // --- 1. Update KPIs ---
    renderKPIs(schoolDNA);

    // --- 2. Update DNA Axis Dictionary Scores ---
    document.getElementById('score-k').textContent = schoolDNA.k;
    document.getElementById('score-p').textContent = schoolDNA.p;
    document.getElementById('score-a').textContent = schoolDNA.a;
    document.getElementById('score-e').textContent = schoolDNA.e;
    document.getElementById('score-d').textContent = schoolDNA.d;

    // --- 3. Render Spider Chart ---
    const spiderContainer = document.getElementById('school-spider-container');
    spiderContainer.innerHTML = ''; // Remove spinner

    const spider = new DNASpider('school-spider-container', {
        size: 380,
        padding: 55,
        axes: 5,
        levels: 5, // Rings (20,40,60,80,100)
        colors: {
            K: 'var(--dna-k, #fb7185)',
            P: 'var(--dna-p, #60a5fa)',
            A: 'var(--dna-a, #34d399)',
            E: 'var(--dna-e, #fbbf24)',
            D: 'var(--dna-d, #a78bfa)',
            default: 'var(--vs-text-muted)'
        }
    });

    const currentData = {
        K: schoolDNA.k,
        P: schoolDNA.p,
        A: schoolDNA.a,
        E: schoolDNA.e,
        D: schoolDNA.d
    };

    // Ideal target benchmark
    const targetBenchmark = {
        K: 75,
        P: 75,
        A: 80,
        E: 80,
        D: 85
    };

    spider.render(currentData, targetBenchmark);

    // --- 4. Render Class Heatmap ---
    renderHeatmap();
}

function renderKPIs(dna) {
    const kpiContainer = document.getElementById('dna-kpis');

    // Calculate Overall Health
    const avgScore = Math.round((dna.k + dna.p + dna.a + dna.e + dna.d) / 5);
    let healthColor = 'var(--vs-success)';
    if (avgScore < 60) healthColor = 'var(--vs-danger)';
    else if (avgScore < 75) healthColor = 'var(--vs-warning)';

    // Find Strongest and Weakest
    const arr = [
        { label: 'Knowledge (K)', val: dna.k },
        { label: 'Physical/Skill (P)', val: dna.p },
        { label: 'Attitude (A)', val: dna.a },
        { label: 'Effort (E)', val: dna.e },
        { label: 'Discipline (D)', val: dna.d }
    ];

    arr.sort((a, b) => b.val - a.val);
    const strongest = arr[0];
    const weakest = arr[4];

    kpiContainer.innerHTML = `
        <div class="dna-card">
            <div class="text-[13px] text-[var(--vs-text-muted)] uppercase flex items-center gap-1.5 leading-none">
                <i class="icon i-users h-3.5 w-3.5"></i>
                Analyzed Students
            </div>
            <div class="text-2xl font-light mt-2" style="color: var(--vs-accent)">
                ${dna._totalAnalyzed} <span class="text-[13px] text-[var(--vs-text-muted)]">Profiles</span>
            </div>
        </div>
        <div class="dna-card">
            <div class="text-[13px] text-[var(--vs-text-muted)] uppercase flex items-center gap-1.5 leading-none">
                <i class="icon i-chart-bar h-3.5 w-3.5"></i>
                Overall Health
            </div>
            <div class="text-2xl font-light mt-2" style="color: ${healthColor}">
                ${avgScore} <span class="text-[13px] text-[var(--vs-text-muted)]">Avg Score</span>
            </div>
        </div>
        <div class="dna-card">
            <div class="text-[13px] text-[var(--vs-text-muted)] uppercase flex items-center gap-1.5 leading-none">
                <i class="icon i-chevron-double-up h-3.5 w-3.5 text-emerald-400"></i>
                Strongest Axis
            </div>
            <div class="text-lg font-light mt-2" style="color: var(--vs-text-title)">
                ${strongest.label}
            </div>
            <div class="text-[13px] text-emerald-400 mt-0.5">Score: ${strongest.val}</div>
        </div>
        <div class="dna-card">
            <div class="text-[13px] text-[var(--vs-text-muted)] uppercase flex items-center gap-1.5 leading-none">
                <i class="icon i-chevron-double-down h-3.5 w-3.5 text-rose-400"></i>
                Focus Area
            </div>
            <div class="text-lg font-light mt-2" style="color: var(--vs-text-title)">
                ${weakest.label}
            </div>
            <div class="text-[13px] text-rose-400 mt-0.5">Score: ${weakest.val}</div>
        </div>
    `;
}

function renderHeatmap() {
    const hmContainer = document.getElementById('heatmap-container');
    if (!hmContainer) return;
    hmContainer.innerHTML = '';

    // Extract classes
    const ORDER = ['อนุบาล 2', 'อนุบาล 3', 'ป.1/1', 'ป.1/2', 'ป.2/1', 'ป.2/2', 'ป.3', 'ป.4/1', 'ป.4/2', 'ป.5/1', 'ป.5/2', 'ป.6/1', 'ป.6/2'];

    // Format required by DNAHeatmap (it expects { name, dna: { k: x, p: x, a: x, e: x, d: x } })
    const heatmapData = [];

    ORDER.forEach(cls => {
        const avg = DNACoreService.getClassAverageDNA(cls);
        // Only include classes that actually have students
        if (avg && (avg.k > 0 || avg.p > 0 || avg.a > 0)) {
            heatmapData.push({
                name: cls,
                dna: {
                    k: avg.k,
                    p: avg.p,
                    a: avg.a,
                    e: avg.e,
                    d: avg.d
                }
            });
        }
    });

    if (heatmapData.length === 0) {
        hmContainer.innerHTML = '<div class="text-[13px] text-[var(--vs-text-muted)] p-6">ไม่พบข้อมูลนักเรียน</div>';
        return;
    }

    const heatmap = new DNAHeatmap('heatmap-container', {
        cellSize: 45, // Box size
        dimensions: ['K', 'P', 'A', 'E', 'D']
    });

    heatmap.setData(heatmapData);

    // Add interactivity - show basic modal toast when clicking a class cell
    heatmap.onSelect((data, dimension) => {
        if (window.HUD_NOTIFY) {
            HUD_NOTIFY.toast(
                'DNA_INFO',
                `ชั้น ${data.name} — แกน ${dimension}: ${data.dna[dimension.toLowerCase()]} คะแนน`,
                'info',
                { duration: 3000 }
            );
        }
    });
}
