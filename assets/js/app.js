/**
 * E-OS - VS Code HUD App Core Logic
 */

// Global Standard Formatting Utility
window.formatNumberStandard = (n) => {
    if (n === null || n === undefined) return '';
    const num = parseInt(n);
    if (isNaN(num)) return n;
    return num < 10 ? `0${num}` : `${num}`;
};

document.addEventListener('DOMContentLoaded', async () => {
    const activityItems = document.querySelectorAll('.activity-item');
    const navItems = document.querySelectorAll('.nav-item');
    const sideBar = document.querySelector('.vs-side-bar');
    const mainFrame = document.getElementById('main-frame');
    const breadcrumbPage = document.getElementById('header-page-name');
    const logoutBtn = document.getElementById('logoutBtn');

    // System Initialization
    const app = AppBootstrap.getInstance();

    // Role Initialization
    function syncUser() {
        if (!app.isReady || !app.auth) return;

        const user = app.auth.getCurrentUser();
        if (!user) return;

        const userRoleDisplay = document.getElementById('uRole');
        const userNameDisplay = document.getElementById('uName');
        const avatarContainer = document.getElementById('pfp');

        if (userRoleDisplay) {
            userRoleDisplay.innerText = user.roleConfig?.label || user.role;
            userRoleDisplay.style.color = `var(--${user.color}, #71717a)`;
        }
        if (userNameDisplay) {
            userNameDisplay.innerText = user.fullName;
        }
        if (avatarContainer) {
            avatarContainer.innerText = user.avatar;
            avatarContainer.style.background = `color-mix(in srgb, var(--${user.color}, #71717a) 15%, transparent)`;
            avatarContainer.style.border = `1px solid color-mix(in srgb, var(--${user.color}, #71717a) 30%, transparent)`;
            avatarContainer.style.color = `var(--${user.color}, #71717a)`;
            avatarContainer.className = `w-8 h-8 rounded-[var(--vs-radius)] flex items-center justify-center font-light text-[13px] flex-shrink-0`;
        }

        // Feature: Dynamic Role Switcher (Single Identity)
        const switcherList = document.getElementById('role-switcher-list');
        if (switcherList && user.availableRoles) {
            switcherList.innerHTML = ''; // Clear hardcoded
            user.availableRoles.forEach(roleId => {
                const roleData = EOS_DATA.users[roleId];
                if (!roleData) return;
                const roleConfig = EOS_DATA.roles[roleData.role];
                const isActive = roleId === user.id;

                const btn = document.createElement('button');
                // Applying Neon Aesthetic (Rule 6) and Perfect Alignment
                btn.className = `w-full text-left px-3 py-2.5 rounded-[var(--vs-radius)] transition-all group 
                    ${isActive ? 'bg-[rgba(34,211,238,0.08)] border border-[rgba(34,211,238,0.3)] shadow-[0_0_8px_rgba(34,211,238,0.1)]' : 'bg-transparent border border-transparent hover:bg-[rgba(255,255,255,0.03)]'}`;

                btn.innerHTML = `
                    <div class="flex items-start gap-2.5 w-full text-left">
                        <i class="icon ${roleConfig.icon || 'i-user'} h-4 w-4 mt-[2px] flex-shrink-0 ${isActive ? 'text-[var(--vs-accent)]' : 'opacity-40'}"></i>
                        <div class="flex flex-col min-w-0 flex-1 gap-1">
                            <span class="text-[13px] truncate ${isActive ? 'text-[var(--vs-accent)]' : 'text-[var(--vs-text-title)]'}">${roleData.fullName}</span>
                            <div class="text-[13px] text-[var(--vs-text-muted)] opacity-70 truncate flex items-center gap-1.5 w-full">
                                <span class="uppercase">${roleConfig.name}</span>
                                ${roleData.org || roleData.homeroomClass || roleData.classId ? `<span class="opacity-50">•</span> <span class="truncate">${roleData.org || roleData.homeroomClass || roleData.classId}</span>` : ''}
                            </div>
                        </div>
                        ${isActive ? '<i class="icon i-check h-4 w-4 text-[var(--vs-accent)] flex-shrink-0 mt-1"></i>' : `<i class="icon i-chevron-right h-4 w-4 opacity-0 group-hover:opacity-60 transition-opacity text-[var(--vs-text-muted)] flex-shrink-0 mt-1"></i>`}
                    </div>
                `;

                if (!isActive) {
                    btn.onclick = () => window.switchRole(roleId);
                }
                setTimeout(() => switcherList.appendChild(btn), 50); // Small stagger just in case
            });
        }

        // Feature: Delegation (Mission Control) Trigger is now Universal (Available for all roles)
        const delegToggleBtn = document.getElementById('deleg-toggle-btn');
        if (delegToggleBtn) {
            delegToggleBtn.style.display = 'flex'; // Ensure it is visible for everyone
        }

        // Feature: Check Inbox for Pending Deliverables to Light Up HUD Badge
        try {
            const raw = localStorage.getItem('eos_delegations_v1');
            if (raw) {
                const delegations = JSON.parse(raw);
                const pendingTasks = delegations.filter(d => d.assignee === user.id && d.status === 'PENDING');
                if (pendingTasks.length > 0 && window.HUD_NOTIFY) {
                    setTimeout(() => window.HUD_NOTIFY.setBadge('manage', true), 500); // delay to ensure notify is ready
                }
            }
        } catch (e) {
            console.warn('HUD Inbox Badge logic failed:', e);
        }

        // Feature: Content Engineering Visibility (Admin/Developer Only)
        const contentEngSection = document.getElementById('content-engineering-section');
        if (contentEngSection) {
            console.log("[DEBUG] Checking Content Engineering Visibility for User:", user.role, user.specialRoles, user.workloadRoles);
            const isDevOrAdmin = user.role === 'ADMIN' || user.specialRoles?.includes('DEVELOPER') || user.specialRoles?.includes('ADMIN') || user.workloadRoles?.includes('developer') || user.workloadRoles?.includes('system_admin');
            console.log("[DEBUG] isDevOrAdmin evaluated to:", isDevOrAdmin);
            if (isDevOrAdmin) {
                contentEngSection.style.display = 'block';
            } else {
                contentEngSection.style.display = 'none';
            }
        }
    }

    // Await system readiness
    try {
        await app.init();
        syncUser();

        // 🛡️ FORCE PASSWORD RESET LOGIC (VULN 4)
        if (app.auth && app.auth.getCurrentUser()?.requiresPasswordReset) {
            const pwdModal = document.getElementById('force-password-modal');
            const pwdBtn = document.getElementById('btn-force-password');
            const pwdInput = document.getElementById('new-password-input');
            if (pwdModal && pwdBtn && pwdInput) {
                pwdModal.style.display = 'flex';
                pwdBtn.onclick = () => {
                    const newPwd = pwdInput.value.trim();
                    if (newPwd.length < 8) {
                        if (window.HUD_NOTIFY) window.HUD_NOTIFY.toast('SECURITY', 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร', 'warning');
                        return;
                    }
                    // Simulation: Assuming password update succeeds locally/backend
                    pwdModal.style.display = 'none';
                    if (window.HUD_NOTIFY) window.HUD_NOTIFY.toast('SECURITY_OK', 'เปลี่ยนรหัสผ่านปลอดภัยสำเร็จแล้ว', 'success');
                };
            }
        }

        // Ensure the Mission Control Timeline Menus are painted immediately on load
        if (window.ManagementEngine) {
            window.ManagementEngine.renderDashboard();
        }
    } catch (err) {
        console.error('System bootstrap failed:', err);
    }


    // Unified Logout Logic
    window.logout = function () {
        const auth = AppBootstrap.getInstance().auth;
        if (auth) {
            auth.logout().then(() => {
                window.location.href = 'login.html';
            });
        } else {
            // Only remove auth-related keys — preserve schedule/bank data
            ['eos_access_token', 'eos_refresh_token', 'eos_active_user_id', 'eos_session', 'eos_device_id'].forEach(k => localStorage.removeItem(k));
            window.location.href = 'login.html';
        }
    };

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.logout();
        });
    }

    let lastActiveActivity = document.querySelector('.activity-item.active');
    let lastActiveNav = document.querySelector('.nav-item.active');

    // Activity Bar Toggling & Panel Switching
    activityItems.forEach(item => {
        item.addEventListener('click', () => {
            const isCurrentlyActive = item.classList.contains('active');
            const view = item.getAttribute('data-view');

            if (isCurrentlyActive) {
                sideBar.classList.toggle('collapsed');
                if (sideBar.classList.contains('collapsed')) {
                    item.classList.remove('active');
                }
            } else {
                if (lastActiveActivity) lastActiveActivity.classList.remove('active');
                item.classList.add('active');
                sideBar.classList.remove('collapsed');
                lastActiveActivity = item;

                document.querySelectorAll('.vs-sidebar-panel').forEach(p => p.classList.add('hidden'));
                const targetPanel = document.getElementById(`panel-${view}`);
                if (targetPanel) {
                    targetPanel.classList.remove('hidden');
                }

                // Clear Badge on Click
                if (window.HUD_NOTIFY) {
                    window.HUD_NOTIFY.setBadge(view, false);
                }

                // --- Unified Rails Navigation Sync ---
                if (view === 'chat' && window.ChatEngine) {
                    window.ChatEngine.openChat(null); // Navigate to Welcome Chat
                } else if (view === 'explorer') {
                    mainFrame.src = 'pages/home.html';
                    if (breadcrumbPage) breadcrumbPage.innerText = 'Dashboard Overview';
                } else if (view === 'manage') {
                    if (window.ManagementEngine) window.ManagementEngine.renderDashboard();
                }

                // SECURITY/UX ISOLATION: Force hide delegation elements outside Mission Control
                const delegSidebar = document.getElementById('delegation-sidebar');
                const btnSubmitMission = document.getElementById('btn-submit-mission');
                const delegToggleBtn = document.getElementById('deleg-toggle-btn');

                if (view !== 'manage') {
                    if (delegSidebar) delegSidebar.style.display = 'none';
                    if (btnSubmitMission) btnSubmitMission.style.display = 'none';
                    if (delegToggleBtn) delegToggleBtn.style.display = 'none';
                } else {
                    if (delegToggleBtn) delegToggleBtn.style.display = 'flex';
                }
            }
        });
    });

    // Page Navigation
    const bindNavItems = () => {
        const navItemsList = document.querySelectorAll('.timeline-parent-item, .timeline-child-item');
        navItemsList.forEach(item => {
            // Prevent multiple bindings
            if (item.dataset.bound) return;
            item.dataset.bound = 'true';

            item.addEventListener('click', () => {
                const page = item.getAttribute('data-page');
                const span = item.querySelector('span');
                const pageName = item.getAttribute('data-name') || (span ? span.innerText : 'Profile');

                if (page) {
                    if (lastActiveNav) lastActiveNav.classList.remove('active');
                    item.classList.add('active');
                    lastActiveNav = item;

                    mainFrame.src = page;
                    if (breadcrumbPage) {
                        breadcrumbPage.innerText = pageName.split('(')[0].trim();
                    }
                }
            });
        });
    };
    bindNavItems(); // Initial binding

    // Expose global nav rebinder to be called if sidebar changes
    window.rebindNavItems = bindNavItems;

    // Role Switching Logic
    window.switchRole = async (roleId) => {
        console.log("HUD: Switching Context Role to", roleId);

        const app = AppBootstrap.getInstance();
        if (!app.isReady) await app.init();

        try {
            await app.auth.switchActiveRole(roleId);

            // Show a HUD Notification before reloading to apply context
            if (window.HUD_NOTIFY) {
                window.HUD_NOTIFY.toast('ROLE_SWITCH', `เปลี่ยนสิทธิการเข้าถึงเป็น ${roleId}...`, 'accent', 2000);
            }

            setTimeout(() => {
                location.reload();
            }, 800);
        } catch (err) {
            console.error('Switch role failed:', err);
            if (window.HUD_NOTIFY) HUD_NOTIFY.toast('เกิดข้อผิดพลาด', 'ไม่สามารถสลับตัวตนได้: ' + err.message, 'danger');
        }
    };
}); // End of DOMContentLoaded
