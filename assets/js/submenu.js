/**
 * Submenu Navigation - Handles dropdown menus in sidebar
 */

document.addEventListener('DOMContentLoaded', () => {
    const navGroups = document.querySelectorAll('.nav-group');

    navGroups.forEach(group => {
        const mainButton = group.querySelector('.nav-item[data-page="#"]');
        const submenu = group.querySelector('.nav-submenu');

        if (mainButton && submenu) {
            mainButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                // Toggle current submenu
                const isVisible = submenu.classList.contains('visible');

                // Close all other submenus
                document.querySelectorAll('.nav-submenu').forEach(sm => {
                    sm.classList.remove('visible');
                });

                // Toggle current submenu
                if (!isVisible) {
                    submenu.classList.add('visible');
                }
            });
        }
    });

    // Close submenus when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-group')) {
            document.querySelectorAll('.nav-submenu').forEach(sm => {
                sm.classList.remove('visible');
            });
        }
    });
});
