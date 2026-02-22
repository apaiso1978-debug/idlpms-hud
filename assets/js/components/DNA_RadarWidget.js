/**
 * DNA_RadarWidget - Unified 5-Axis Spider Chart
 * ═══════════════════════════════════════════════════════
 * Renders the Intelligence and Physical DNA footprint of a student.
 * Designed to be globally injectable via data-component="DNA_RadarWidget".
 */
class DNA_RadarWidget {
    constructor(element, props) {
        this.container = element;
        this.studentId = props.studentId || null;
        this.chartInstance = null;

        // Render Skeleton immediately
        this.container.innerHTML = `
            <div class="vs-card p-6 w-full h-full min-h-[300px] flex flex-col justify-center items-center">
                <i class="icon i-cpu h-8 w-8 text-[var(--vs-accent)] animate-pulse opacity-50 mb-2"></i>
                <div class="text-[13px] text-[var(--vs-text-muted)] font-light font-mono uppercase">Initializing DNA Matrix...</div>
            </div>
        `;

        // Auto-initialize if props are provided
        if (this.studentId) {
            this.init();
        }
    }

    async init() {
        try {
            // Wait for Chart.js if not already loaded in the environment
            await this._ensureChartLib();

            // Fetch student data from global store (or DataService in real app)
            const data = this._fetchStudentDNA(this.studentId);
            if (!data) {
                this.container.innerHTML = `
                    <div class="vs-card p-6 w-full h-full min-h-[300px] flex flex-col justify-center items-center">
                        <i class="icon i-exclamation-circle h-8 w-8 text-[var(--vs-warning)] opacity-50 mb-2"></i>
                        <div class="text-[13px] text-[var(--vs-text-muted)] font-light uppercase">DNA Payload Error</div>
                        <div class="text-[11px] text-[var(--vs-text-muted)] mt-1 opacity-50">Target: ${this.studentId}</div>
                    </div>
                `;
                return;
            }

            // Render Chart
            this.render(data);

        } catch (e) {
            console.error('[DNA_RadarWidget] Initialization failed:', e);
            this.container.innerHTML = `<span class="text-[var(--vs-danger)] text-[12px]">Widget Error</span>`;
        }
    }

    _fetchStudentDNA(id) {
        // Fallback to global mock data for now
        const localData = window.IDLPMS_DATA || {};
        const students = localData.persons || localData.users || {};
        const student = students[id];

        if (!student) return null;

        // Default to a 5-Axis mapping if DNA object doesn't exist
        const defaultDna = { logic: 50, creativity: 50, communication: 50, leadership: 50, physical: 50 };
        return student.dna || defaultDna;
    }

    render(dnaData) {
        // Prepare HTML Canvas inside the Iron Rules card
        this.container.innerHTML = `
            <div class="relative w-full h-full min-h-[300px] group flex flex-col">
                <!-- Header Component -->
                <div class="flex justify-between items-start mb-4">
                    <div class="vs-icon-layout">
                        <div class="icon-col mt-0.5"><i class="icon i-cpu text-[var(--vs-accent)] h-4 w-4"></i></div>
                        <div class="content-col">
                            <h3 class="text-[13px] text-[var(--vs-text-title)] font-light uppercase tracking-wider mb-0.5">Neural DNA Matrix</h3>
                            <div class="text-[11px] text-[var(--vs-text-muted)] opacity-60 font-mono">5-Axis Cognitive Profile</div>
                        </div>
                    </div>
                    <div class="hud-badge-micro border border-[rgba(34,211,238,0.2)] bg-[rgba(34,211,238,0.05)] text-[var(--vs-accent)] shadow-[0_0_8px_rgba(34,211,238,0.1)]">
                        Active Sync
                    </div>
                </div>
                
                <!-- Chart Canvas Container -->
                <div class="flex-1 relative min-h-[220px] w-full flex items-center justify-center">
                    <canvas class="w-full h-full"></canvas>
                </div>
            </div>
        `;

        const canvas = this.container.querySelector('canvas');
        const ctx = canvas.getContext('2d');

        // Extract Root CSS Variables for Neon Styling
        const style = getComputedStyle(document.body);
        const getVar = (name) => style.getPropertyValue(name).trim();

        const accentHex = getVar('--vs-accent') || '#22d3ee';
        const borderHex = getVar('--vs-border') || '#3f3f46';
        const textMuted = getVar('--vs-text-muted') || '#a1a1aa';
        const bgDeep = getVar('--vs-bg-deep') || '#09090b';

        // Chart.js Configuration
        this.chartInstance = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Logic (L)', 'Creativity (C)', 'Communication (M)', 'Leadership (E)', 'Physical (P)'],
                datasets: [{
                    label: 'DNA Signature',
                    data: [
                        dnaData.logic || 0,
                        dnaData.creativity || 0,
                        dnaData.communication || 0,
                        dnaData.leadership || 0,
                        dnaData.physical || 0
                    ],
                    backgroundColor: 'rgba(34, 211, 238, 0.1)', // Translucent fill
                    borderColor: accentHex,                     // Neon border
                    borderWidth: 1.5,
                    pointBackgroundColor: bgDeep,               // Hollow points
                    pointBorderColor: accentHex,
                    pointBorderWidth: 1.5,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    tension: 0.3 // Smooth curves (Iron Logic allows slight bezier here)
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: borderHex, lineWidth: 1 },
                        grid: { color: borderHex, lineWidth: 1, circular: true },
                        pointLabels: {
                            color: textMuted,
                            font: { family: "'Inter', sans-serif", size: 10, weight: '300' }
                        },
                        ticks: {
                            display: false,           // Hide internal numbers for clean HUD
                            min: 0,
                            max: 100,
                            stepSize: 20
                        }
                    }
                },
                plugins: {
                    legend: { display: false },       // Hide legend
                    tooltip: {
                        backgroundColor: bgDeep,
                        titleColor: accentHex,
                        bodyColor: '#fff',
                        borderColor: borderHex,
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        cornerRadius: 3,
                        titleFont: { family: "'Inter', sans-serif", size: 11, weight: '300' },
                        bodyFont: { family: "'Inter', sans-serif", size: 13, weight: '400' }
                    }
                }
            }
        });
    }

    _ensureChartLib() {
        return new Promise((resolve) => {
            if (typeof Chart !== 'undefined') {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = "https://cdn.jsdelivr.net/npm/chart.js";
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    destroy() {
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }
        this.container.innerHTML = '';
    }
}

// Auto-register to the global registry when script loads
if (window.ComponentRegistry) {
    window.ComponentRegistry.register('DNA_RadarWidget', DNA_RadarWidget);
}
