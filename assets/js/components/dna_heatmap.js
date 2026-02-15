/**
 * DNA Heatmap Component (Phase 2)
 * Aggregate visualization for Teacher Class View
 * Unity 6 Standard - Consistent with DNA Spider Chart aesthetics
 */

class DNAHeatmap {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.options = {
            cellSize: options.cellSize || 40,
            dimensions: options.dimensions || ['K', 'P', 'A', 'E', 'D'],
            colorScale: options.colorScale || this.getDefaultColorScale(),
            ...options
        };
        this.data = [];
        this.svg = null;
    }

    getDefaultColorScale() {
        // Zinc to Accent gradient
        return [
            { threshold: 0, color: 'rgba(var(--vs-border-rgb), 0.8)' },   // Zinc-700 (Border)
            { threshold: 30, color: 'rgba(var(--vs-text-muted-rgb), 0.8)' }, // Zinc-500 (Muted)
            { threshold: 50, color: 'rgba(var(--vs-accent-rgb), 0.4)' },  // Cyan/40%
            { threshold: 70, color: 'rgba(var(--vs-accent-rgb), 0.7)' },  // Cyan/70%
            { threshold: 90, color: 'rgba(var(--vs-accent-rgb), 1.0)' }   // Cyan/100%
        ];
    }

    getColorForValue(value) {
        const scale = this.options.colorScale;
        for (let i = scale.length - 1; i >= 0; i--) {
            if (value >= scale[i].threshold) {
                return scale[i].color;
            }
        }
        return scale[0].color;
    }

    /**
     * Set student data for heatmap
     * @param {Array} students - Array of { name, id, dna: {k, p, a, f, l, m} }
     */
    setData(students) {
        this.data = students;
        this.render();
    }

    render() {
        if (!this.container) return;

        const { cellSize, dimensions } = this.options;
        const students = this.data;

        // Calculate dimensions
        const labelWidth = 100;
        const headerHeight = 30;
        const width = labelWidth + (dimensions.length * cellSize);
        const height = headerHeight + (students.length * cellSize);

        // Clear container
        this.container.innerHTML = '';

        // Create SVG
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', height);
        this.svg.style.fontFamily = "'Sarabun', sans-serif";

        // Draw header labels
        dimensions.forEach((dim, i) => {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', labelWidth + (i * cellSize) + (cellSize / 2));
            text.setAttribute('y', headerHeight / 2 + 4);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', 'var(--vs-text-title)');
            text.setAttribute('font-size', '12');
            text.setAttribute('font-weight', '300');
            text.textContent = dim;
            this.svg.appendChild(text);
        });

        // Draw student rows
        students.forEach((student, rowIndex) => {
            const y = headerHeight + (rowIndex * cellSize);

            // Student name label
            const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            nameText.setAttribute('x', labelWidth - 8);
            nameText.setAttribute('y', y + (cellSize / 2) + 4);
            nameText.setAttribute('text-anchor', 'end');
            nameText.setAttribute('fill', 'var(--vs-text-body)');
            nameText.setAttribute('font-size', '11');
            nameText.setAttribute('font-weight', '300');
            nameText.textContent = student.name.length > 12 ? student.name.substring(0, 12) + '...' : student.name;
            this.svg.appendChild(nameText);

            // DNA cells
            dimensions.forEach((dim, colIndex) => {
                const x = labelWidth + (colIndex * cellSize);
                const key = dim.toLowerCase();
                const value = student.dna[key] || 0;

                // Cell rectangle
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', x + 2);
                rect.setAttribute('y', y + 2);
                rect.setAttribute('width', cellSize - 4);
                rect.setAttribute('height', cellSize - 4);
                rect.setAttribute('rx', '3');
                rect.setAttribute('fill', this.getColorForValue(value));
                rect.setAttribute('stroke', 'var(--vs-border)');
                rect.setAttribute('stroke-width', '1');
                rect.style.cursor = 'pointer';
                rect.style.transition = 'all 0.2s ease';

                // Hover effect
                rect.addEventListener('mouseenter', () => {
                    rect.style.filter = 'brightness(1.2)';
                    rect.style.strokeWidth = '2';
                });
                rect.addEventListener('mouseleave', () => {
                    rect.style.filter = 'none';
                    rect.style.strokeWidth = '1';
                });

                // Click to select student
                rect.addEventListener('click', () => {
                    this.onStudentSelect?.(student, dim);
                });

                this.svg.appendChild(rect);

                // Value text (only show if cell is large enough)
                if (cellSize >= 36) {
                    const valText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                    valText.setAttribute('x', x + (cellSize / 2));
                    valText.setAttribute('y', y + (cellSize / 2) + 4);
                    valText.setAttribute('text-anchor', 'middle');
                    valText.setAttribute('fill', value >= 50 ? 'rgba(var(--vs-bg-deep-rgb), 0.9)' : 'var(--vs-text-muted)');
                    valText.setAttribute('font-size', '10');
                    valText.setAttribute('font-weight', '500');
                    valText.textContent = Math.round(value);
                    valText.style.pointerEvents = 'none';
                    this.svg.appendChild(valText);
                }
            });
        });

        this.container.appendChild(this.svg);
    }

    /**
     * Callback when student cell is clicked
     * @param {Function} callback - (student, dimension) => void
     */
    onSelect(callback) {
        this.onStudentSelect = callback;
    }

    /**
     * Highlight specific students
     * @param {Array} studentIds - Array of student IDs to highlight
     */
    highlightStudents(studentIds) {
        // Implementation for highlighting specific students
        // Could add visual indicators like borders or glow
    }

    /**
     * Get class average for each dimension
     */
    getClassAverages() {
        if (this.data.length === 0) return {};

        const totals = { k: 0, p: 0, a: 0, e: 0, d: 0 };
        this.data.forEach(student => {
            Object.keys(totals).forEach(key => {
                totals[key] += student.dna[key] || 0;
            });
        });

        const averages = {};
        Object.keys(totals).forEach(key => {
            averages[key] = Math.round(totals[key] / this.data.length);
        });

        return averages;
    }

}

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.DNAHeatmap = DNAHeatmap;
}
