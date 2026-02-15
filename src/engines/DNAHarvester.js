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
            this.showNeuralToast(dim, adjustedValue, signal.action);
        }
    }

    calculateDecay(dim, action) {
        if (!action) return 1;
        const recentSignals = this.neuralBuffer[dim] || [];
        const sameActionCount = recentSignals.filter(s => s.action === action).length;
        return Math.max(0.1, Math.pow(0.5, sameActionCount));
    }

    showNeuralToast(dim, value, action) {
        if (typeof window.ManagementEngine?.showNeuralStarToast === 'function') {
            window.ManagementEngine.showNeuralStarToast(dim, value, action);
        }
    }

    resetBuffer() {
        this.neuralBuffer = { K: [], P: [], A: [], F: [], L: [], M: [] };
    }
}

// Export for browser
if (typeof window !== 'undefined') {
    window.DNAHarvester = new DNAHarvester();
}
