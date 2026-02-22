/**
 * Tooltip Component (Unity 6 Standard)
 * JavaScript-based tooltips that append to body to avoid overflow clipping
 */

class TooltipManager {
    constructor() {
        this.tooltip = null;
        this.hideTimeout = null;
        this.currentTrigger = null;
        this.init();
    }

    init() {
        // Create tooltip element
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'vs-tooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            padding: 6px 12px;
            background: var(--vs-bg-panel);
            color: var(--vs-text-title);
            font-size: 12px;
            font-family: 'Sarabun', sans-serif;
            font-weight: 300;
            border: 1px solid rgba(63, 63, 70, 0.5);
            border-radius: 3px;
            z-index: 10000;
            pointer-events: none;
            display: none;
            white-space: nowrap;
            max-width: 300px;
        `;
        document.body.appendChild(this.tooltip);

        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener('mouseover', (e) => {
            const target = e.target && e.target.closest ? e.target.closest('[data-tooltip]') : null;
            if (target && target !== this.currentTrigger) {
                this.show(target);
            }
        }, true);

        document.addEventListener('mouseout', (e) => {
            const target = e.target && e.target.closest ? e.target.closest('[data-tooltip]') : null;
            if (target && target === this.currentTrigger) {
                this.hide();
            }
        }, true);
    }

    show(element) {
        // Disable tooltips for activity items when sidebar is expanded
        if (element.classList.contains('activity-item')) {
            const sideBar = document.querySelector('.vs-side-bar');
            if (sideBar && !sideBar.classList.contains('collapsed')) {
                return;
            }
        }

        clearTimeout(this.hideTimeout);
        this.currentTrigger = element;

        const text = element.getAttribute('data-tooltip');
        if (!text) return;

        this.tooltip.textContent = text;
        this.tooltip.style.display = 'block';

        // Position the tooltip
        const rect = element.getBoundingClientRect();
        const tooltipRect = this.tooltip.getBoundingClientRect();

        // Position to the right of the element
        let left = rect.right + 12;
        let top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);

        // Keep within viewport (horizontal)
        if (left + tooltipRect.width > window.innerWidth - 8) {
            left = rect.left - tooltipRect.width - 12; // Show on left if no space on right
        }
        if (left < 8) left = 8;

        // Keep within viewport (vertical)
        if (top < 8) top = 8;
        if (top + tooltipRect.height > window.innerHeight - 8) {
            top = window.innerHeight - tooltipRect.height - 8;
        }

        this.tooltip.style.left = `${left}px`;
        this.tooltip.style.top = `${top}px`;

        this.tooltip.style.opacity = '1';
    }

    hide() {
        clearTimeout(this.hideTimeout);
        this.currentTrigger = null;
        this.tooltip.style.display = 'none';
        this.tooltip.style.opacity = '0';
    }
}

// Initialize tooltip manager on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new TooltipManager());
} else {
    new TooltipManager();
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.TooltipManager = TooltipManager;
}
