/**
 * DNA Bar Chart Component (Phase 3)
 * Aggregated visualization for Admin/Principal View
 * Unity 6 Standard - Consistent with DNA Spider Chart aesthetics
 */

class DNABarChart {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.options = {
            barHeight: options.barHeight || 24,
            dimensions: options.dimensions || ['K', 'P', 'A', 'E', 'D'],
            dimensionLabels: options.dimensionLabels || {
                'K': 'Knowledge',
                'P': 'Process',
                'A': 'Attitude',
                'E': 'Effort',
                'D': 'Discipline'
            },
            colors: options.colors || [
                'var(--dna-k)', // K: Cyan
                'var(--dna-p)', // P: Emerald
                'var(--dna-a)', // A: Rose
                'var(--dna-e)', // E: Amber
                'var(--dna-d)'  // D: Indigo
            ],

            showBenchmark: options.showBenchmark !== false,
            benchmarkValue: options.benchmarkValue || 60,
            ...options
        };
        this.data = {};
        this.svg = null;
    }

    /**
     * Set aggregate data for bar chart
     * @param {Object} data - { k: value, p: value, a: value, f: value, l: value, m: value }
     * @param {Object} comparison - Optional comparison data (e.g., district average)
     */
    setData(data, comparison = null) {
        this.data = data;
        this.comparison = comparison;
        this.render();
    }

    render() {
        if (!this.container) return;

        const { barHeight, dimensions, dimensionLabels, colors, showBenchmark, benchmarkValue } = this.options;

        // Calculate dimensions
        const labelWidth = 100;
        const valueWidth = 50;
        const barWidth = 200;
        const padding = 16;
        const width = labelWidth + barWidth + valueWidth + padding * 2;
        const height = (dimensions.length * (barHeight + 12)) + padding * 2;

        // Clear container
        this.container.innerHTML = '';

        // Create SVG
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', height);
        this.svg.style.fontFamily = "'Sarabun', sans-serif";

        // Draw dimension bars
        dimensions.forEach((dim, i) => {
            const key = dim.toLowerCase();
            const value = this.data[key] || 0;
            const y = padding + (i * (barHeight + 12));
            const barX = labelWidth + padding;
            const barFillWidth = (value / 100) * barWidth;

            // Dimension label
            const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            labelText.setAttribute('x', labelWidth);
            labelText.setAttribute('y', y + barHeight / 2 + 4);
            labelText.setAttribute('text-anchor', 'end');
            labelText.setAttribute('fill', 'var(--vs-text-body)');
            labelText.setAttribute('font-size', '12');
            labelText.setAttribute('font-weight', '300');
            labelText.textContent = dim;
            this.svg.appendChild(labelText);

            // Background bar (track)
            const trackRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            trackRect.setAttribute('x', barX);
            trackRect.setAttribute('y', y);
            trackRect.setAttribute('width', barWidth);
            trackRect.setAttribute('height', barHeight);
            trackRect.setAttribute('rx', '3');
            trackRect.setAttribute('fill', 'rgba(var(--vs-border-rgb), 0.5)'); // Zinc-700/50% (Standard Border)
            this.svg.appendChild(trackRect);

            // Filled bar
            const fillRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            fillRect.setAttribute('x', barX);
            fillRect.setAttribute('y', y);
            fillRect.setAttribute('width', barFillWidth);
            fillRect.setAttribute('height', barHeight);
            fillRect.setAttribute('rx', '3');
            fillRect.setAttribute('fill', colors[i]);
            fillRect.setAttribute('opacity', '0.8');
            fillRect.style.transition = 'width 0.5s ease-out';
            this.svg.appendChild(fillRect);

            // Benchmark line
            if (showBenchmark) {
                const benchmarkX = barX + (benchmarkValue / 100) * barWidth;
                const benchLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                benchLine.setAttribute('x1', benchmarkX);
                benchLine.setAttribute('y1', y - 2);
                benchLine.setAttribute('x2', benchmarkX);
                benchLine.setAttribute('y2', y + barHeight + 2);
                benchLine.setAttribute('stroke', 'var(--vs-text-muted)');
                benchLine.setAttribute('stroke-width', '1');
                benchLine.setAttribute('stroke-dasharray', '3 2');
                benchLine.setAttribute('opacity', '0.6');
                this.svg.appendChild(benchLine);
            }

            // Comparison indicator (if provided)
            if (this.comparison && this.comparison[key] !== undefined) {
                const compX = barX + (this.comparison[key] / 100) * barWidth;
                const compMarker = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                compMarker.setAttribute('points', `${compX},${y - 4} ${compX - 4},${y - 10} ${compX + 4},${y - 10}`);
                compMarker.setAttribute('fill', 'var(--vs-accent)');
                this.svg.appendChild(compMarker);
            }

            // Value text
            const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            valueText.setAttribute('x', barX + barWidth + 12);
            valueText.setAttribute('y', y + barHeight / 2 + 4);
            valueText.setAttribute('text-anchor', 'start');
            valueText.setAttribute('fill', colors[i]);
            valueText.setAttribute('font-size', '14');
            valueText.setAttribute('font-weight', '500');
            valueText.textContent = `${Math.round(value)}%`;
            this.svg.appendChild(valueText);
        });

        // Legend for benchmark
        if (showBenchmark) {
            const legendY = height - 12;
            const legendLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            legendLine.setAttribute('x1', labelWidth + padding);
            legendLine.setAttribute('y1', legendY);
            legendLine.setAttribute('x2', labelWidth + padding + 20);
            legendLine.setAttribute('y2', legendY);
            legendLine.setAttribute('stroke', 'var(--vs-text-muted)');
            legendLine.setAttribute('stroke-width', '1');
            legendLine.setAttribute('stroke-dasharray', '3 2');
            this.svg.appendChild(legendLine);

            const legendText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            legendText.setAttribute('x', labelWidth + padding + 26);
            legendText.setAttribute('y', legendY + 4);
            legendText.setAttribute('fill', 'var(--vs-text-muted)');
            legendText.setAttribute('font-size', '10');
            legendText.setAttribute('font-weight', '300');
            legendText.textContent = `Benchmark (${benchmarkValue}%)`;
            this.svg.appendChild(legendText);
        }

        this.container.appendChild(this.svg);
    }

    /**
     * Animate bars from 0 to current value
     */
    animateIn() {
        const bars = this.svg?.querySelectorAll('rect[opacity="0.8"]');
        bars?.forEach((bar, i) => {
            const targetWidth = bar.getAttribute('width');
            bar.setAttribute('width', '0');
            setTimeout(() => {
                bar.setAttribute('width', targetWidth);
            }, i * 100);
        });
    }

    /**
     * Get summary statistics
     */
    getSummary() {
        const values = Object.values(this.data);
        if (values.length === 0) return { avg: 0, min: 0, max: 0 };

        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);

        return {
            avg: Math.round(avg),
            min: Math.round(min),
            max: Math.round(max)
        };
    }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.DNABarChart = DNABarChart;
}
