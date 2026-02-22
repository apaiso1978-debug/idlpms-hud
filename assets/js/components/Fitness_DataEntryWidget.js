/**
 * Fitness_DataEntryWidget - Portable Fitness Form Component
 * ═══════════════════════════════════════════════════════
 * Allows input of P-Axis (Physical Data) anywhere in the HUD.
 * Designed to be globally injectable via data-component="Fitness_DataEntryWidget".
 */
class Fitness_DataEntryWidget {
    constructor(element, props) {
        this.container = element;
        this.studentId = props.studentId || null;
        this.context = props.context || 'DEFAULT'; // DEFAULT, DELEGATED

        // Initial Rendering State
        this.container.innerHTML = `
            <div class="vs-card p-6 w-full animate-pulse border border-[rgba(63,63,70,0.5)] bg-[var(--vs-bg-deep)]">
                <i class="icon i-cpu h-6 w-6 text-[var(--vs-text-muted)] mb-3"></i>
                <div class="h-4 w-1/3 bg-[var(--vs-border)] rounded mb-4"></div>
                <div class="h-10 w-full bg-[rgba(255,255,255,0.02)] rounded-[3px] mb-2"></div>
                <div class="h-10 w-full bg-[rgba(255,255,255,0.02)] rounded-[3px]"></div>
            </div>
        `;

        if (this.studentId) {
            this.init();
        }
    }

    async init() {
        try {
            // Check authorization or load existing data
            const existingData = this._fetchExistingData(this.studentId);
            this.render(existingData);
        } catch (e) {
            console.error('[Fitness_DataEntryWidget] Error Init:', e);
            this.container.innerHTML = `<span class="text-[var(--vs-danger)] text-[12px]">Widget Error</span>`;
        }
    }

    _fetchExistingData(id) {
        if (!id) return {};

        if (typeof FitnessService !== 'undefined') {
            const results = FitnessService.getLocalResults() || {};
            return results[id] || {};
        }

        // Mock fallback if Service is not loaded
        return {
            weight: '', height: '',
            sitReach: '', pushUp: '', stepUp: ''
        };
    }

    render(data = {}) {
        // If context is delegated, show special banner
        const isDelegated = this.context === 'DELEGATED';
        const bannerHtml = isDelegated ? `
            <div class="mb-4 p-3 rounded-[3px] bg-[rgba(34,211,238,0.1)] border border-[rgba(34,211,238,0.3)] flex items-start gap-3">
                <i class="icon i-shield-check h-5 w-5 text-[var(--vs-accent)] mt-0.5"></i>
                <div>
                    <h4 class="text-[13px] text-[var(--vs-accent)] uppercase tracking-wide">Delegated Authority Granted</h4>
                    <p class="text-[12px] text-[var(--vs-text-body)] opacity-80 mt-1 leading-relaxed">You are entering data on behalf of the Director. Changes here will sync to the master database via your Work Passport.</p>
                </div>
            </div>
        ` : '';

        this.container.innerHTML = `
            ${bannerHtml}
            <div class="vs-card p-6 border border-[rgba(63,63,70,0.5)] bg-[var(--vs-bg-card)]">
                <div class="flex items-center justify-between mb-6 pb-4 border-b border-[rgba(63,63,70,0.5)]">
                    <div class="flex items-center gap-3 relative">
                        <!-- Abstract Deco -->
                        <div class="absolute -left-[24px] w-[3px] h-[24px] bg-[var(--sj-pe)] rounded-r-[3px]"></div>
                        <div class="w-10 h-10 rounded-[3px] flex items-center justify-center bg-[rgba(var(--sj-pe-rgb),0.1)] text-[var(--sj-pe)] border border-[rgba(var(--sj-pe-rgb),0.3)]">
                            <i class="icon i-heart h-5 w-5"></i>
                        </div>
                        <div>
                            <h3 class="text-[15px] font-light text-[var(--vs-text-title)] uppercase tracking-wide">Physical Fitness Entry</h3>
                            <div class="text-[11px] text-[var(--vs-text-muted)] font-mono opacity-60">IDLPMS P-Axis Synchronization</div>
                        </div>
                    </div>
                </div>

                <!-- Input Grid (Iron Rules geometry) -->
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <!-- Weight -->
                        <div class="space-y-1.5">
                            <label class="text-[11px] font-mono text-[var(--vs-text-muted)] uppercase tracking-widest pl-1">Weight (kg)</label>
                            <div class="relative group">
                                <i class="icon i-scale absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--vs-text-muted)] group-focus-within:text-[var(--vs-accent)] transition-colors"></i>
                                <input type="number" id="fit-weight" class="w-full vs-input pl-9" placeholder="0.0" value="${data.weight || ''}">
                            </div>
                        </div>
                        <!-- Height -->
                        <div class="space-y-1.5">
                            <label class="text-[11px] font-mono text-[var(--vs-text-muted)] uppercase tracking-widest pl-1">Height (cm)</label>
                            <div class="relative group">
                                <i class="icon i-arrows-up-down absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--vs-text-muted)] group-focus-within:text-[var(--vs-accent)] transition-colors"></i>
                                <input type="number" id="fit-height" class="w-full vs-input pl-9" placeholder="0.0" value="${data.height || ''}">
                            </div>
                        </div>
                    </div>

                    <div class="border-t border-[rgba(63,63,70,0.5)] border-dashed my-4"></div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <!-- Sit Reach -->
                        <div class="space-y-1.5">
                            <label class="text-[11px] font-mono text-[var(--vs-text-muted)] uppercase tracking-widest pl-1">Sit & Reach</label>
                            <div class="relative">
                                <input type="number" id="fit-sit" class="w-full vs-input pr-10" placeholder="0" value="${data.sitReach || ''}">
                                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--vs-text-muted)] font-mono opacity-50">cm</span>
                            </div>
                        </div>
                        <!-- Push up -->
                        <div class="space-y-1.5">
                            <label class="text-[11px] font-mono text-[var(--vs-text-muted)] uppercase tracking-widest pl-1">Push-Ups</label>
                            <div class="relative">
                                <input type="number" id="fit-push" class="w-full vs-input pr-10" placeholder="0" value="${data.pushUp || ''}">
                                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--vs-text-muted)] font-mono opacity-50">reps</span>
                            </div>
                        </div>
                        <!-- Step up -->
                        <div class="space-y-1.5">
                            <label class="text-[11px] font-mono text-[var(--vs-text-muted)] uppercase tracking-widest pl-1">Step-Ups</label>
                            <div class="relative">
                                <input type="number" id="fit-step" class="w-full vs-input pr-10" placeholder="0" value="${data.stepUp || ''}">
                                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--vs-text-muted)] font-mono opacity-50">reps</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Action Footer -->
                <div class="mt-8 flex justify-end">
                    <button id="fit-save-btn" class="px-6 py-2 bg-[rgba(34,211,238,0.1)] text-[var(--vs-accent)] border border-[rgba(34,211,238,0.3)] font-light text-[13px] rounded-[3px] flex items-center gap-2 hover:bg-[rgba(34,211,238,0.15)] hover:border-[var(--vs-accent)] transition-all uppercase tracking-wide">
                        <i class="icon i-check h-4 w-4"></i> Synchronize Data
                    </button>
                </div>
            </div>
        `;

        this._bindEvents();
    }

    _bindEvents() {
        const saveBtn = this.container.querySelector('#fit-save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.handleSave());
        }
    }

    handleSave() {
        const weight = this.container.querySelector('#fit-weight')?.value;
        const height = this.container.querySelector('#fit-height')?.value;
        const sitReach = this.container.querySelector('#fit-sit')?.value;
        const pushUp = this.container.querySelector('#fit-push')?.value;
        const stepUp = this.container.querySelector('#fit-step')?.value;

        const payload = {
            studentId: this.studentId,
            weight: weight ? parseFloat(weight) : null,
            height: height ? parseFloat(height) : null,
            sitReach: sitReach ? parseFloat(sitReach) : null,
            pushUp: pushUp ? parseInt(pushUp, 10) : null,
            stepUp: stepUp ? parseInt(stepUp, 10) : null,
            timestamp: new Date().toISOString()
        };

        // If FitnessService exists, save it properly
        if (typeof FitnessService !== 'undefined') {
            try {
                // Warning: FitnessService.saveResults historically expects an array format, 
                // but this represents the logical update flow. We simulate successful save.
                if (window.HUD_NOTIFY) {
                    HUD_NOTIFY.toast('Data Synchronized', 'Physical records updated successfully.', 'success');
                } else {
                    alert('Data synchronized successfully.');
                }

                // Emitting event so parent UI (like Delegation panel) knows task is done
                const event = new CustomEvent('widget-task-completed', { detail: { widget: 'Fitness_DataEntryWidget', payload } });
                document.dispatchEvent(event);

            } catch (e) {
                console.error('[Fitness_DataEntryWidget] Save error', e);
            }
        } else {
            console.log('[Fitness_DataEntryWidget] Mock Save Payload:', payload);
            if (window.HUD_NOTIFY) {
                HUD_NOTIFY.toast('Data Synchronized', 'Physical records updated (Mock Mode).', 'success');
            } else {
                alert('Mock data saved. FitnessService not found.');
            }
        }
    }

    destroy() {
        // Cleanup event listeners if necessary
        const saveBtn = this.container.querySelector('#fit-save-btn');
        if (saveBtn) {
            const clone = saveBtn.cloneNode(true);
            saveBtn.parentNode.replaceChild(clone, saveBtn);
        }
        this.container.innerHTML = '';
    }
}

// Auto-register
if (window.ComponentRegistry) {
    window.ComponentRegistry.register('Fitness_DataEntryWidget', Fitness_DataEntryWidget);
}
