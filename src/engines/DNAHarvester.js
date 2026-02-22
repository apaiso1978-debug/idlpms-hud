/**
 * IDLPMS Intelligence DNA Harvester
 * =================================
 * Captures learning signals and behavioral data to build a student's Neural DNA.
 *
 * @version 2.0.0
 * @author IDLPMS Development Team
 */

class DNAHarvester {
    constructor() {
        this.neuralBuffer = { K: [], P: [], A: [], F: [], L: [], M: [] };
        this.characteristics = {
            PATRIOTISM: 95, INTEGRITY: 88, DISCIPLINE: 92, LEARNING: 85,
            SUFFICIENCY: 90, COMMITMENT: 87, THAINESS: 94, PUBLIC_MIND: 89
        };
        this.initObserver();
    }

    initObserver() {
        document.addEventListener('click', (e) => {
            const el = e.target.closest('[data-dna-slot]');
            if (el) {
                const slot = el.getAttribute('data-dna-slot');
                const value = parseInt(el.getAttribute('data-dna-value') || '5');
                const action = el.getAttribute('data-dna-action') || el.innerText || 'Interaction';
                this.captureNeuralSignal(slot, value, { action, source: 'GlobalObserver' });
            }
        });
        console.log('[DNA] Global Observer Initialized');
    }

    captureNeuralSignal(dimension, value, metadata = {}) {
        const dim = dimension.toUpperCase();
        if (!this.neuralBuffer[dim]) this.neuralBuffer[dim] = [];

        const decayFactor = this.calculateDecay(dim, metadata.action);
        const adjustedValue = Math.round(value * decayFactor);

        if (adjustedValue <= 0 && value > 0) return;

        const signal = {
            timestamp: Date.now(),
            value: Math.max(0, Math.min(100, adjustedValue)),
            action: metadata.action || 'กิจกรรมทั่วไป',
            ...metadata
        };

        this.neuralBuffer[dim].push(signal);

        if (adjustedValue >= 5 || metadata.forceToast) {
            this.showNeuralStarToast(dim, adjustedValue, signal.action);
        }
    }

    calculateDecay(dim, action) {
        if (!action) return 1;
        const recentSignals = this.neuralBuffer[dim] || [];
        const sameActionCount = recentSignals.filter(s => s.action === action).length;
        return Math.max(0.1, Math.pow(0.5, sameActionCount));
    }

    showNeuralStarToast(dim, value, action) {
        // Remove existing toast if any (keep it clean)
        const oldToast = document.getElementById('neural-star-toast');
        if (oldToast) oldToast.remove();

        const toast = document.createElement('div');
        toast.id = 'neural-star-toast';
        toast.className = 'fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none animate-fade-in-up';

        // 1px SVG Neural Star icon per Iron Rules
        toast.innerHTML = `
            <div class="flex items-center gap-3 px-4 py-2 bg-[rgba(var(--vs-bg-deep-rgb),0.9)] border border-[rgba(var(--vs-border-rgb),0.3)] rounded-[var(--vs-radius)] backdrop-blur-md">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1" stroke="#fbbf24" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
                <div class="flex flex-col">
                    <span class="text-[10px] text-[var(--vs-text-muted)] font-light uppercase Thai-Rule">ตรวจพบสัญญาณจากระบบ</span>
                    <span class="text-[13px] font-light text-[var(--vs-text-title)] Thai-Rule">บันทึกข้อมูล DNA: <span class="text-[#fbbf24] font-bold">+${value}%</span></span>
                    <span class="text-[9px] text-[var(--vs-text-muted)] font-light italic truncate max-w-[150px] opacity-60">${action}</span>
                </div>
            </div>
        `;

        document.body.appendChild(toast);
        setTimeout(() => toast?.classList.add('opacity-0'), 2500);
        setTimeout(() => toast?.remove(), 3000);
    }

    resetBuffer() {
        this.neuralBuffer = { K: [], P: [], A: [], F: [], L: [], M: [] };
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.DNAHarvester = new DNAHarvester();
}
