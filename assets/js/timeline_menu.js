/**
 * Timeline Menu System - Visual hierarchical menu with vertical timeline
 * Used for Mission Control panel with parent-child menu structure
 * Features: collapsible groups, locked items, timeline rail + nodes
 */

window.TimelineMenu = {
    /**
     * Render a timeline menu with parent and children items
     * @param {string} containerId - ID of the container element
     * @param {Object} menuConfig - Menu configuration object
     */
    render(containerId, menuConfig) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`TimelineMenu: Container #${containerId} not found`);
            return;
        }

        const { parent, children = [], activeItem } = menuConfig;
        let html = '';

        // Parent menu item (group header)
        html += this._renderParentItem(parent, children.length > 0, containerId);

        // Timeline children
        if (children.length > 0) {
            html += `<div class="timeline-children-container collapsed" id="${containerId}-children">`;

            children.forEach((child) => {
                html += this._renderChildItem(child, activeItem);
            });

            html += '</div>';
        }

        container.innerHTML = html;
        this._attachEventListeners(container, menuConfig, containerId);
    },

    /**
     * Render parent menu item (collapsible group header)
     */
    _renderParentItem(item, hasChildren, containerId) {
        return `
            <button 
                class="timeline-parent-item collapsed${hasChildren ? ' menu-has-children' : ''}${item.active ? ' active' : ''}"
                data-page="${item.page || '#'}"
                data-name="${item.name}"
                data-action="${item.action || ''}"
                data-toggle="${containerId}-children"
            >
                <i class="icon ${item.icon || 'i-folder'} ${item.colorClass || ''}"></i>
                <span style="color: var(--vs-text-title) !important;" class="font-light">${item.name}</span>
                ${hasChildren ? '<i class="icon i-chevron-right timeline-chevron"></i>' : ''}
            </button>
        `;
    },

    /**
     * Render child menu item with timeline node
     */
    _renderChildItem(item, activeItem) {
        const isActive = activeItem === item.action || activeItem === item.page;
        const isLocked = item.locked === true;

        let classes = 'timeline-child-item';
        if (isActive) classes += ' active';
        if (isLocked) classes += ' locked';

        const lockBadge = isLocked
            ? '<span class="lock-badge"><i class="icon i-lock"></i></span>'
            : '';

        return `
            <button 
                class="${classes}"
                data-page="${isLocked ? '#' : (item.page || '#')}"
                data-name="${item.name}"
                data-action="${item.action || ''}"
                ${isLocked ? 'data-locked="true"' : ''}
            >
                <div class="timeline-node"></div>
                <i class="icon ${item.icon || 'i-chevron-right'}"></i>
                <span>${item.name}</span>
                ${item.statusIndicator ? item.statusIndicator : ''}
                ${item.badge ? `<span class="vs-count">${window.formatNumberStandard(item.badge)}</span>` : ''}
                ${lockBadge}
            </button>
        `;
    },

    /**
     * Attach event listeners to menu items
     */
    _attachEventListeners(container, menuConfig, containerId) {
        // Parent toggle (collapse/expand)
        const parentBtn = container.querySelector('.timeline-parent-item');
        const childrenContainer = container.querySelector('.timeline-children-container');

        if (parentBtn && childrenContainer) {
            parentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                parentBtn.classList.toggle('collapsed');
                childrenContainer.classList.toggle('collapsed');
            });
        }

        // Child item clicks
        const childItems = container.querySelectorAll('.timeline-child-item');

        childItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const page = item.getAttribute('data-page');
                const action = item.getAttribute('data-action');
                const name = item.getAttribute('data-name');
                const isLocked = item.getAttribute('data-locked') === 'true';

                // Handle locked items
                if (isLocked) {
                    if (window.HUD_NOTIFY) {
                        window.HUD_NOTIFY.toast('Phase 2', `${name} \u2014 \u0e2d\u0e22\u0e39\u0e48\u0e23\u0e30\u0e2b\u0e27\u0e48\u0e32\u0e07\u0e1e\u0e31\u0e12\u0e19\u0e32`, 'info', 3000);
                    }
                    return;
                }

                // Update active state across ALL timeline menus in the MC panel
                document.querySelectorAll('.timeline-child-item').forEach(i => {
                    if (i.getAttribute('data-locked') !== 'true') i.classList.remove('active');
                });
                item.classList.add('active');

                // Handle navigation
                if (page && page !== '#') {
                    const mainFrame = document.getElementById('main-frame');
                    if (mainFrame) {
                        let loadPath = page;

                        // Handle System Tasks (Delegation Inbox)
                        if (loadPath.startsWith('__SYSTEM_TASK__')) {
                            const sysModuleId = loadPath.replace('__SYSTEM_TASK__', '');
                            if (window.ManagementEngine) {
                                const sysItem = window.ManagementEngine.findMenuItem(sysModuleId);
                                if (sysItem && (sysItem.page || sysItem.path)) {
                                    loadPath = sysItem.page || sysItem.path;
                                } else {
                                    // Fuzzy recovery for old corrupted tasks in localStorage
                                    const rawId = String(sysModuleId).trim();
                                    const upperId = rawId.toUpperCase();

                                    if (upperId.includes('FITNESS') || upperId.includes('สมรรถภาพ') || rawId === '100' || rawId === 'fitness-test') {
                                        loadPath = 'pages/fitness_test.html';
                                    } else if (upperId === 'GENERAL') {
                                        // Ad-Hoc / General tasks should open the inbox logic or detailed view
                                        loadPath = 'pages/teacher_inbox.html';
                                    } else {
                                        loadPath = 'pages/home.html';
                                    }
                                }
                            } else {
                                loadPath = 'pages/home.html';
                            }
                        } else if (loadPath.startsWith('__ACCEPT_MISSION__')) {
                            const taskId = loadPath.replace('__ACCEPT_MISSION__', '');
                            loadPath = `pages/mission_accept.html#taskId=${taskId}`;
                        } else if (loadPath.startsWith('__COMPONENT__')) {
                            const componentName = loadPath.replace('__COMPONENT__', '');
                            loadPath = `pages/mission_hud.html#cmp=${componentName}&ctx=DELEGATED`;
                        }

                        mainFrame.src = loadPath;
                    }

                    // Update breadcrumb
                    const breadcrumbPage = document.getElementById('header-page-name');
                    if (breadcrumbPage) {
                        breadcrumbPage.innerText = name;
                    }
                }

                // --- Sync Active Module for Delegation System ---
                if (window.ManagementEngine) {
                    window.ManagementEngine.activeModule = action || page;
                }

                // Handle custom action
                if (action && window.TimelineMenu.actions[action]) {
                    window.TimelineMenu.actions[action](e);
                }

                // Emit custom event
                container.dispatchEvent(new CustomEvent('timelineMenuClick', {
                    detail: { page, action, name, item }
                }));
            });
        });
    },

    /**
     * Custom actions that can be triggered by menu items
     */
    actions: {
        // Personnel: Add/manage teacher
        'manage-personnel': function (e) {
            const mainFrame = document.getElementById('main-frame');
            if (mainFrame) {
                mainFrame.src = 'pages/add_teacher.html';
            }
        },

        // Academic: Assignment Matrix
        'assignment-matrix': function (e) {
            const mainFrame = document.getElementById('main-frame');
            if (mainFrame) {
                mainFrame.src = 'pages/teacher_management.html';
            }
        },

        // Domain Pages: 4-Domain Input System
        'schedule-d1': function (e) {
            const mainFrame = document.getElementById('main-frame');
            if (mainFrame) {
                mainFrame.src = 'pages/schedule/domain1.html';
            }
        },

        'schedule-d2': function (e) {
            const mainFrame = document.getElementById('main-frame');
            if (mainFrame) {
                mainFrame.src = 'pages/schedule/domain2.html';
            }
        },

        'schedule-d3': function (e) {
            const mainFrame = document.getElementById('main-frame');
            if (mainFrame) {
                mainFrame.src = 'pages/schedule/domain3.html';
            }
        },

        'schedule-d4': function (e) {
            const mainFrame = document.getElementById('main-frame');
            if (mainFrame) {
                mainFrame.src = 'pages/schedule/domain4.html';
            }
        },

        // Student Affairs: Physical Fitness Test
        'fitness-test': function (e) {
            const mainFrame = document.getElementById('main-frame');
            if (mainFrame) {
                mainFrame.src = 'pages/fitness_test.html';
            }
        },

        // School Setup
        'school-setup': function (e) {
            const mainFrame = document.getElementById('main-frame');
            if (mainFrame) {
                mainFrame.src = 'pages/school_setup.html';
            }
        }
    },

    /**
     * Set active menu item by action or page
     */
    setActive(containerId, identifier) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const items = container.querySelectorAll('.timeline-child-item');
        items.forEach(item => {
            const action = item.getAttribute('data-action');
            const page = item.getAttribute('data-page');

            if (action === identifier || page === identifier) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    },

    /**
     * Expand/Collapse children
     */
    toggleChildren(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const parentBtn = container.querySelector('.timeline-parent-item');
        const childrenContainer = container.querySelector('.timeline-children-container');
        if (parentBtn && childrenContainer) {
            parentBtn.classList.toggle('collapsed');
            childrenContainer.classList.toggle('collapsed');
        }
    }
};
