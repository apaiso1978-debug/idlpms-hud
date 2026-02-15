/**
 * IDLPMS - VS Code HUD App Core Logic
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
            avatarContainer.style.background = `color-mix(in srgb, var(--${user.color}, #71717a), transparent 85%)`;
            avatarContainer.style.border = `1px solid color-mix(in srgb, var(--${user.color}, #71717a), transparent 60%)`;
            avatarContainer.style.color = `var(--${user.color}, #71717a)`;
            avatarContainer.className = `w-10 h-10 rounded-full flex items-center justify-center font-extralight text-sm`;
        }
    }

    // Await system readiness
    try {
        await app.init();
        syncUser();
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
            ['idlpms_access_token', 'idlpms_refresh_token', 'idlpms_active_user_id', 'idlpms_session', 'idlpms_device_id'].forEach(k => localStorage.removeItem(k));
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
            }
        });
    });

    // Page Navigation
    navItems.forEach(item => {
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

    // Role Switching Logic
    window.switchRole = async (userId) => {
        console.log("HUD: Switching Session Identity to", userId);

        const app = AppBootstrap.getInstance();
        if (!app.isReady) await app.init();

        try {
            await app.auth.login(userId);

            // Show a HUD Notification before reloading
            if (window.HUD_NOTIFY) {
                window.HUD_NOTIFY.toast('IDENTITY_SYNC', `SWITCHING PERSONA... PLEASE STAND BY`, 'accent', 2000);
            }

            setTimeout(() => {
                location.reload();
            }, 1000);
        } catch (err) {
            console.error('Switch role failed:', err);
            alert('ไม่สามารถสลับตัวตนได้: ' + err.message);
        }
    };
});
