const fs = require('fs');

const css = fs.readFileSync('assets/css/theme.css', 'utf-8');

const usedIcons = [
    'i-academic-cap', 'i-academic', 'i-archive', 'i-arrow-left', 'i-arrow-path',
    'i-arrow-right', 'i-arrow-top-right-on-square', 'i-arrow-trending-up', 'i-beaker',
    'i-bell', 'i-book-open', 'i-book', 'i-briefcase', 'i-building-library',
    'i-building-office-2', 'i-building', 'i-calendar-days', 'i-calendar', 'i-canvas',
    'i-card', 'i-chart-bar', 'i-chart-pie', 'i-chart', 'i-chat-bubble-left-right',
    'i-chat', 'i-check-circle', 'i-check', 'i-chevron-double-down', 'i-chevron-double-up',
    'i-chevron-down', 'i-chevron-left', 'i-chevron-right', 'i-chip', 'i-clipboard-check',
    'i-clipboard-document-check', 'i-clipboard-document-list', 'i-clipboard', 'i-clock',
    'i-cloud-arrow-down', 'i-cog', 'i-color', 'i-command-line', 'i-connect', 'i-container',
    'i-cpu-chip', 'i-cpu', 'i-credit-card', 'i-cube', 'i-data', 'i-database', 'i-document-check',
    'i-document-duplicate', 'i-document-plus', 'i-document-text', 'i-document', 'i-domain',
    'i-dots', 'i-download', 'i-edit', 'i-emoji', 'i-engine', 'i-exclamation-circle',
    'i-exclamation-triangle', 'i-extended-pictographic', 'i-external-link', 'i-eye',
    'i-fetch', 'i-finger-print', 'i-flag', 'i-folder', 'i-fragment', 'i-gear', 'i-ghostbusters',
    'i-globe', 'i-hand-raised', 'i-hash-algorithm-token-set', 'i-heart', 'i-hero', 'i-home',
    'i-inbox', 'i-information-circle', 'i-invalid', 'i-js', 'i-letter', 'i-library',
    'i-lightbulb', 'i-lightning-bolt', 'i-lightning', 'i-line', 'i-link', 'i-list', 'i-lock',
    'i-logout', 'i-manifest', 'i-mock', 'i-modifier', 'i-mouse-pointer-click', 'i-n', 'i-o',
    'i-object', 'i-office', 'i-options', 'i-or-nest', 'i-paper-airplane', 'i-paper-clip',
    'i-pattern', 'i-pencil-square', 'i-pencil', 'i-per-call', 'i-pie', 'i-pipeline', 'i-play',
    'i-plus', 'i-printer', 'i-project', 'i-queue', 'i-rectangle-stack', 'i-reference',
    'i-refresh', 'i-regex', 'i-request', 'i-rgb', 'i-roa', 'i-route', 'i-rs', 'i-save',
    'i-scale', 'i-search', 'i-seconds', 'i-section', 'i-select', 'i-server-cog', 'i-share',
    'i-shield-check', 'i-shield-exclamation', 'i-shield', 'i-shinobu', 'i-spaces', 'i-spacing',
    'i-sparkles', 'i-specific', 'i-squares', 'i-standardized', 'i-star', 'i-str', 'i-stream',
    'i-style', 'i-styles', 'i-sun', 'i-swatch', 'i-switch-horizontal', 'i-t', 'i-template',
    'i-trash', 'i-trending-up', 'i-trophy', 'i-upgrade', 'i-user-check', 'i-user-group',
    'i-user-plus', 'i-user', 'i-users', 'i-v', 'i-valid', 'i-view-grid', 'i-warning',
    'i-whitespace', 'i-x-circle', 'i-x-mark', 'i-x'
];

const missing = usedIcons.filter(icon => !css.includes(`.${icon} {`));
console.log('Missing Icons:', missing);
