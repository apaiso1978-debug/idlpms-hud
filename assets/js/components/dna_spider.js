/**
 * DNASpider: Intelligence DNA Multi-Axis Visualization
 * Part of E-OS "Unity" Design System
 */
class DNASpider {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            size: options.size || 300,
            padding: options.padding || 50,
            axes: options.axes || 5, // DNA Core 5 (K, S, A, E, D)
            levels: options.levels || 5, // 20, 40, 60, 80, 100
            labels: options.labels || ['K', 'P', 'A', 'E', 'D'],
            colors: options.colors || {
                K: 'var(--dna-k)',  // Knowledge (ความรู้)
                P: 'var(--dna-p)',  // Process/Skill (กระบวนการ/ทักษะ)
                A: 'var(--dna-a)',  // Attitude (เจตคติ)
                E: 'var(--dna-e)',  // Effort (ความพยายาม)
                D: 'var(--dna-d)',  // Discipline (วินัย)
                default: 'var(--vs-text-muted)'
            }

        };
        this.init();
    }

    init() {
        if (!this.container) return;
        this.container.innerHTML = '';
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', '100%');
        this.svg.setAttribute('viewBox', `0 0 ${this.options.size} ${this.options.size}`);
        this.svg.style.overflow = 'visible';

        // --- 🧠 Inject CSS Animations (Premium HUD) ---
        const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
        style.textContent = `
            .dna-poly { transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
            .dna-point { transition: all 0.5s ease; cursor: crosshair; }
            .dna-grid { stroke: rgba(161, 161, 170, 0.2); stroke-width: 0.8; }
            .dna-axis { stroke: rgba(161, 161, 170, 0.15); stroke-width: 0.8; filter: drop-shadow(0 0 1px rgba(255,255,255,0.1)); }
            .dna-glow { filter: drop-shadow(0 0 4px var(--vs-accent)); }
            @keyframes pulse-glow {
                0% { opacity: 0.4; stroke-width: 0.8; }
                50% { opacity: 0.8; stroke-width: 1.2; }
                100% { opacity: 0.4; stroke-width: 0.8; }
            }
            .pulse { animation: pulse-glow 3s infinite ease-in-out; }
        `;
        this.svg.appendChild(style);

        this.container.appendChild(this.svg);

        this.centerX = this.options.size / 2;
        this.centerY = this.options.size / 2;
        this.radius = (this.options.size / 2) - this.options.padding;
    }

    /**
     * Render the chart
     * @param {Object} data - { K: 80, P: 70, A: 90, F: 60, ... }
     * @param {Object} [benchmark] - Comparative data
     */
    render(data, benchmark = null) {
        if (!this.svg) return;
        this.svg.innerHTML = '';

        const axesCount = this.options.axes;
        const angleStep = (Math.PI * 2) / axesCount;

        // 1. Draw Web/Grid (Dashed Hexagons/Octagons)
        this.drawGrid(axesCount, angleStep);

        // 2. Draw Comparison/Benchmark (Dashed Zinc-500)
        if (benchmark) {
            this.drawPolygon(benchmark, axesCount, angleStep, {
                stroke: '#71717a', // Zinc-500
                strokeDashArray: '4 4',
                fill: 'none',
                opacity: 0.5,
                curved: true
            });
        }

        // 3. Draw Actual Data (Solid Accent)
        this.drawPolygon(data, axesCount, angleStep, {
            class: 'dna-poly pulse',
            stroke: 'var(--vs-accent, #22d3ee)',
            fill: 'var(--vs-accent, #22d3ee)',
            fillOpacity: 0.1,
            strokeWidth: 1, // Iron Rule
            curved: true
        });

        // 4. Draw Labels & Points
        this.drawLabelsAndFocusPoints(data, axesCount, angleStep);
    }

    drawGrid(count, angleStep) {
        const levels = this.options.levels;
        for (let l = 1; l <= levels; l++) {
            const r = (this.radius / levels) * l;

            // Create a path with curved segments (Spider Web SAG)
            let pathData = "";
            for (let i = 0; i < count; i++) {
                const angle = i * angleStep - Math.PI / 2;
                const nextAngle = (i + 1) * angleStep - Math.PI / 2;

                const x1 = this.centerX + r * Math.cos(angle);
                const y1 = this.centerY + r * Math.sin(angle);
                const x2 = this.centerX + r * Math.cos(nextAngle);
                const y2 = this.centerY + r * Math.sin(nextAngle);

                // Calculate Control Point for Quadratic Bézier (Concave Sag)
                // Aggressive sag to make the curve unmistakably a "spider web"
                const midAngle = (angle + nextAngle) / 2;
                const sagFactor = 0.72; // Pull 28% towards center for heavy sag
                const cx = this.centerX + (r * sagFactor) * Math.cos(midAngle);
                const cy = this.centerY + (r * sagFactor) * Math.sin(midAngle);

                if (i === 0) {
                    pathData += `M ${x1},${y1} Q ${cx},${cy} ${x2},${y2} `;
                } else {
                    pathData += `Q ${cx},${cy} ${x2},${y2} `;
                }
            }

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('class', 'dna-grid');
            // High-visibility Silvery Grid
            path.style.opacity = 0.2 + (l / levels) * 0.6;
            this.svg.appendChild(path);
        }

        // Axis Lines (Radiating Spokes: Center-to-Label)
        const axisExtension = 20; // Reach towards labels
        for (let i = 0; i < count; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const tx = this.centerX + (this.radius + axisExtension) * Math.cos(angle);
            const ty = this.centerY + (this.radius + axisExtension) * Math.sin(angle);

            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', this.centerX);
            line.setAttribute('y1', this.centerY);
            line.setAttribute('x2', tx);
            line.setAttribute('y2', ty);
            line.setAttribute('class', 'dna-axis');
            line.setAttribute('stroke', 'rgba(161, 161, 170, 0.4)'); // Muted Zinc (Subtle Radar)
            line.setAttribute('stroke-width', '1');
            line.style.opacity = '0.3';
            this.svg.appendChild(line);
        }
    }

    drawPolygon(data, count, angleStep, style) {
        const keys = Object.keys(data);
        const points = [];
        const coords = [];

        for (let i = 0; i < count; i++) {
            const val = data[keys[i]] || 0;
            const r = (this.radius * val) / 100;
            const angle = i * angleStep - Math.PI / 2;
            const x = this.centerX + r * Math.cos(angle);
            const y = this.centerY + r * Math.sin(angle);
            coords.push({ x, y, r, angle });
            points.push(`${x},${y}`);
        }

        const el = document.createElementNS('http://www.w3.org/2000/svg', style.curved ? 'path' : 'polygon');

        if (style.curved) {
            let d = "";
            const sagFactor = 0.88; // Subtle sag for data polygons
            for (let i = 0; i < count; i++) {
                const next = (i + 1) % count;
                const p1 = coords[i];
                const p2 = coords[next];
                const midAngle = (p1.angle + (i === count - 1 ? p1.angle + angleStep : p2.angle)) / 2;
                const midR = (p1.r + p2.r) / 2 * sagFactor;
                const cx = this.centerX + midR * Math.cos(midAngle);
                const cy = this.centerY + midR * Math.sin(midAngle);

                if (i === 0) d += `M ${p1.x},${p1.y} `;
                d += `Q ${cx},${cy} ${p2.x},${p2.y} `;
            }
            el.setAttribute('d', d);
        } else {
            el.setAttribute('points', points.join(' '));
        }

        el.setAttribute('class', style.class || 'dna-poly');
        el.setAttribute('fill', style.fill || 'none');
        el.setAttribute('fill-opacity', style.fillOpacity || 1);
        el.setAttribute('stroke', style.stroke || '#fff');
        el.setAttribute('stroke-width', style.strokeWidth || 1);
        if (style.strokeDashArray) el.setAttribute('stroke-dasharray', style.strokeDashArray);
        if (style.opacity) el.style.opacity = style.opacity;

        this.svg.appendChild(el);
    }

    drawLabelsAndFocusPoints(data, count, angleStep) {
        const keys = Object.keys(data);
        for (let i = 0; i < count; i++) {
            const angle = i * angleStep - Math.PI / 2;
            const val = data[keys[i]] || 0;
            const r = (this.radius * val) / 100;

            // Text Label Badge (Circular)
            const labelRadius = this.radius + 32; // Optimized distance
            const lx = this.centerX + labelRadius * Math.cos(angle);
            const ly = this.centerY + labelRadius * Math.sin(angle);

            // 1. Badge Circle (Standard HUD Circle with Category Accent)
            const catColor = this.options.colors[keys[i]] || this.options.colors.default;
            const labelCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            labelCircle.setAttribute('cx', lx);
            labelCircle.setAttribute('cy', ly);
            labelCircle.setAttribute('r', '13');
            labelCircle.setAttribute('fill', catColor); // Category Color Background
            labelCircle.setAttribute('stroke', 'none'); // Hidden border as per user request
            this.svg.appendChild(labelCircle);

            // 2. Centered Text (Dark contrast on Light Accent)
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', lx);
            text.setAttribute('y', ly);
            text.setAttribute('dy', '0.36em');
            text.setAttribute('fill', '#111'); // Dark text for maximum legibility on vibrant colors
            text.setAttribute('font-size', '13'); // Slightly smaller to fit circle
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-family', 'Sarabun');
            text.setAttribute('font-weight', '700'); // Bold for badge clarity
            text.textContent = keys[i];
            this.svg.appendChild(text);

            // Data Point
            const dx = this.centerX + r * Math.cos(angle);
            const dy = this.centerY + r * Math.sin(angle);
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', dx);
            circle.setAttribute('cy', dy);
            circle.setAttribute('r', '3');
            circle.setAttribute('fill', this.options.colors[keys[i]] || this.options.colors.default);
            this.svg.appendChild(circle);
        }
    }
}

window.DNASpider = DNASpider;
