/**
 * E-OS Custom Calendar Engine (9-Grid Zoom-In)
 * ═══════════════════════════════════════════════════════
 * Strict Iron Rules compliant date picker.
 * Features:
 * - 100% width alignment with target input
 * - Deep Zoom UI: Days -> Months (12-Grid) -> Years (9-Grid)
 * - Thin border hovers (No solid fills)
 * - Sunken panel aesthetic (Level -1)
 */

class EOSCalendar {
    constructor(inputElement) {
        this.input = typeof inputElement === 'string' ? document.querySelector(inputElement) : inputElement;
        if (!this.input) return;

        this.currentDate = new Date();
        this.selectedDate = new Date();
        this.viewMode = 'DAYS'; // 'DAYS', 'MONTHS', 'YEARS'
        this.yearRangeStart = this.currentDate.getFullYear() - 4; // Center on current for 9-grid

        this.isOpen = false;

        // Ensure input is text to prevent native browser datepicker
        this.input.type = 'text';
        this.input.readOnly = true; // Prevent manual typing to force UI usage
        this.input.style.cursor = 'pointer';

        // Default to today if empty
        if (!this.input.value) {
            this._setDate(this.currentDate);
        } else {
            this.selectedDate = new Date(this.input.value);
            this.currentDate = new Date(this.input.value);
        }

        this._buildUI();
        this._bindEvents();
    }

    _buildUI() {
        this.container = document.createElement('div');
        this.container.className = 'idlpms-calendar-panel';
        Object.assign(this.container.style, {
            display: 'none',
            position: 'absolute',
            background: 'var(--vs-bg-deep)',
            border: '1px solid var(--vs-border)',
            borderRadius: 'var(--vs-radius)',
            padding: '12px',
            zIndex: '9999',
            boxSizing: 'border-box',
            userSelect: 'none',
            fontFamily: 'inherit',
            marginTop: '4px'
        });

        // Determine exact width of input
        this._syncWidth();

        this.header = document.createElement('div');
        Object.assign(this.header.style, {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
        });

        this.btnPrev = this._createNavBtn('i-chevron-left');
        this.btnNext = this._createNavBtn('i-chevron-right');

        this.titleBtn = document.createElement('button');
        Object.assign(this.titleBtn.style, {
            background: 'transparent',
            border: 'none',
            color: 'var(--vs-text-title)',
            fontSize: '14px',
            fontWeight: '300',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '3px',
            transition: 'background 0.2s'
        });
        this.titleBtn.onmouseover = () => this.titleBtn.style.background = 'rgba(255,255,255,0.05)';
        this.titleBtn.onmouseout = () => this.titleBtn.style.background = 'transparent';

        this.header.appendChild(this.btnPrev);
        this.header.appendChild(this.titleBtn);
        this.header.appendChild(this.btnNext);

        this.body = document.createElement('div');
        Object.assign(this.body.style, {
            position: 'relative',
            minHeight: '180px' // Prevent jumping
        });

        this.container.appendChild(this.header);
        this.container.appendChild(this.body);

        // Append right after input inside relative wrapper
        if (this.input.parentNode) {
            this.input.parentNode.appendChild(this.container);
        }

        this._renderBody();
    }

    _createNavBtn(iconClass) {
        const btn = document.createElement('button');
        btn.innerHTML = `<i class="icon ${iconClass}" style="width:16px;height:16px;"></i>`;
        Object.assign(btn.style, {
            background: 'transparent',
            border: 'none',
            color: 'var(--vs-text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '3px',
            transition: 'color 0.2s, background 0.2s'
        });
        btn.onmouseover = () => {
            btn.style.color = 'var(--vs-accent)';
            btn.style.background = 'rgba(255,255,255,0.05)';
        };
        btn.onmouseout = () => {
            btn.style.color = 'var(--vs-text-muted)';
            btn.style.background = 'transparent';
        };
        return btn;
    }

    _syncWidth() {
        const rect = this.input.getBoundingClientRect();
        this.container.style.width = `${rect.width}px`;
    }

    _bindEvents() {
        // Toggle on input click
        this.input.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.isOpen) this.close();
            else this.open();
        });

        // Determine input changes
        window.addEventListener('resize', () => {
            if (this.isOpen) this._syncWidth();
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.container.contains(e.target) && e.target !== this.input) {
                this.close();
            }
        });

        // Header Navigation
        this.titleBtn.addEventListener('click', () => {
            if (this.viewMode === 'DAYS') this.viewMode = 'MONTHS';
            else if (this.viewMode === 'MONTHS') this.viewMode = 'YEARS';
            // If YEARS, stay in YEARS
            this._renderBody();
        });

        this.btnPrev.addEventListener('click', () => {
            if (this.viewMode === 'DAYS') {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            } else if (this.viewMode === 'MONTHS') {
                this.currentDate.setFullYear(this.currentDate.getFullYear() - 1);
            } else if (this.viewMode === 'YEARS') {
                this.yearRangeStart -= 9;
            }
            this._renderBody();
        });

        this.btnNext.addEventListener('click', () => {
            if (this.viewMode === 'DAYS') {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            } else if (this.viewMode === 'MONTHS') {
                this.currentDate.setFullYear(this.currentDate.getFullYear() + 1);
            } else if (this.viewMode === 'YEARS') {
                this.yearRangeStart += 9;
            }
            this._renderBody();
        });
    }

    open() {
        this._syncWidth();
        this.viewMode = 'DAYS';
        this.currentDate = new Date(this.selectedDate);
        this._renderBody();
        this.container.style.display = 'block';
        this.isOpen = true;
    }

    close() {
        this.container.style.display = 'none';
        this.isOpen = false;
    }

    _setDate(date) {
        this.selectedDate = new Date(date);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        this.input.value = `${y}-${m}-${d}`;
    }

    // ── Rendering Engine ──

    _renderBody() {
        this.body.innerHTML = '';

        if (this.viewMode === 'DAYS') {
            const monthsStr = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            this.titleBtn.textContent = `${monthsStr[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
            this._renderDaysView();
        } else if (this.viewMode === 'MONTHS') {
            this.titleBtn.textContent = `${this.currentDate.getFullYear()}`;
            this._renderMonthsView();
        } else if (this.viewMode === 'YEARS') {
            this.titleBtn.textContent = `${this.yearRangeStart} - ${this.yearRangeStart + 8}`;
            this._renderYearsView();
        }
    }

    _renderCell(text, isSelected, isToday, isFaded, onClick) {
        const cell = document.createElement('div');
        cell.textContent = text;
        Object.assign(cell.style, {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            fontWeight: '300',
            color: isFaded ? 'rgba(255,255,255,0.2)' : 'var(--vs-text-body)',
            cursor: 'pointer',
            borderRadius: '3px',
            border: '1px solid transparent',
            transition: 'border-color 0.2s, color 0.2s'
        });

        if (isSelected) {
            cell.style.borderColor = 'rgba(34, 211, 238, 0.5)';
            cell.style.color = 'var(--vs-accent)';
            cell.style.boxShadow = 'inset 0 0 10px rgba(34, 211, 238, 0.05)';
        } else if (isToday) {
            cell.style.borderBottom = '1px solid rgba(255,255,255,0.3)';
        }

        cell.onmouseover = () => {
            if (!isSelected) {
                cell.style.borderColor = 'rgba(255,255,255,0.2)'; // Thin subtle border, NO solid background
            }
        };
        cell.onmouseout = () => {
            if (!isSelected) cell.style.borderColor = 'transparent';
        };

        cell.addEventListener('click', onClick);
        return cell;
    }

    _renderDaysView() {
        const grid = document.createElement('div');
        Object.assign(grid.style, {
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '4px'
        });

        // Weekdays
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        days.forEach(d => {
            const headerCell = document.createElement('div');
            headerCell.textContent = d;
            Object.assign(headerCell.style, {
                fontSize: '11px',
                fontWeight: '400',
                color: 'var(--vs-text-muted)',
                textAlign: 'center',
                paddingBottom: '8px'
            });
            grid.appendChild(headerCell);
        });

        const y = this.currentDate.getFullYear();
        const m = this.currentDate.getMonth();

        let firstDay = new Date(y, m, 1).getDay();
        if (firstDay === 0) firstDay = 7; // Convert Sun(0) to 7
        const prevMonthLastDate = new Date(y, m, 0).getDate();
        const daysInMonth = new Date(y, m + 1, 0).getDate();

        const todayDate = new Date();
        const selY = this.selectedDate.getFullYear();
        const selM = this.selectedDate.getMonth();
        const selD = this.selectedDate.getDate();

        // Prev month padding
        for (let i = firstDay - 1; i > 0; i--) {
            const d = prevMonthLastDate - i + 1;
            const cell = this._renderCell(d, false, false, true, () => {
                this.currentDate.setMonth(m - 1);
                this.currentDate.setDate(d);
                this._setDate(this.currentDate);
                this.close();
            });
            cell.style.padding = '6px 0';
            grid.appendChild(cell);
        }

        // Current month
        for (let d = 1; d <= daysInMonth; d++) {
            const isSelected = selY === y && selM === m && selD === d;
            const isToday = todayDate.getFullYear() === y && todayDate.getMonth() === m && todayDate.getDate() === d;

            const cell = this._renderCell(d, isSelected, isToday, false, () => {
                this.currentDate.setDate(d);
                this._setDate(this.currentDate);
                this.close();
            });
            cell.style.padding = '6px 0';
            grid.appendChild(cell);
        }

        // Next month padding
        const totalCells = (firstDay - 1) + daysInMonth;
        const remainder = 42 - totalCells; // 6 rows of 7
        for (let i = 1; i <= remainder; i++) {
            const cell = this._renderCell(i, false, false, true, () => {
                this.currentDate.setMonth(m + 1);
                this.currentDate.setDate(i);
                this._setDate(this.currentDate);
                this.close();
            });
            cell.style.padding = '6px 0';
            grid.appendChild(cell);
        }

        this.body.appendChild(grid);
    }

    _renderMonthsView() {
        const grid = document.createElement('div');
        Object.assign(grid.style, {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)', // 4x3 Grid
            gap: '8px',
            height: '100%'
        });

        const monthsStr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const selM = this.selectedDate.getMonth();
        const selY = this.selectedDate.getFullYear();
        const y = this.currentDate.getFullYear();

        monthsStr.forEach((mStr, idx) => {
            const isSelected = selY === y && selM === idx;
            const cell = this._renderCell(mStr, isSelected, false, false, () => {
                this.currentDate.setMonth(idx);
                this.viewMode = 'DAYS';
                this._renderBody();
            });
            cell.style.padding = '18px 0';
            grid.appendChild(cell);
        });

        this.body.appendChild(grid);
    }

    _renderYearsView() {
        const grid = document.createElement('div');
        Object.assign(grid.style, {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)', // 3x3 Grid
            gap: '8px',
            height: '100%'
        });

        const selY = this.selectedDate.getFullYear();
        const todayY = new Date().getFullYear();

        for (let i = 0; i < 9; i++) {
            const displayYear = this.yearRangeStart + i;
            const isSelected = displayYear === selY;
            const isToday = displayYear === todayY;

            const cell = this._renderCell(displayYear, isSelected, isToday, false, () => {
                this.currentDate.setFullYear(displayYear);
                this.viewMode = 'MONTHS';
                this._renderBody();
            });
            cell.style.padding = '24px 0';
            grid.appendChild(cell);
        }

        this.body.appendChild(grid);
    }
}

// Global Export
window.EOSCalendar = EOSCalendar;
