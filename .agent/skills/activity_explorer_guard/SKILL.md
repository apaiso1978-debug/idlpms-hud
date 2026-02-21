---
name: Activity Explorer Integration Guard
description: Iron Rule for ensuring every newly developed module is immediately integrated into the Activity Explorer and relevant main dashboards.
---

# 🔰 Iron Rule: Activity Explorer Integration Guard
**Context:** The IDLPMS system has numerous standalone modules (like DNA, Fitness, Leave, etc.). Without a centralized hub, these pages become "orphaned" and inaccessible to end-users unless they manually type the URL.

**The Rule ("สัญญาใจ"):** 
Every time a new module or page is developed, the developer MUST explicitly integrate it into the system's core navigation hubs before the task is considered complete.

## Implementation Checklist

### 1. Activity Explorer (`assets/js/explorer.js`)
Whenever a new module is created, it **must** be added to the Activity Explorer.
- The entry should include an icon, title, description, and the correct link.
- If it's role-specific, ensure it's categorized correctly.

### 2. Main Dashboards
If the module provides significant data (like KPIs, graphs, or actionable tasks), its top-level summary data MUST be routed to the relevant command centers:
- **Director Dashboard (`director_dashboard.html`)**: For school-wide overviews, approvals, or alerts.
- **Teacher Dashboard (`dashboard_teacher.html`)**: For classroom-level insights and daily operations.
- **Admin Dashboard (`dashboard.html` in `/admin`)**: For system-level configuration and telemetry.

### 3. Delegation Panel (HUD)
If the page represents a distinct system function, it must feature the Delegation Panel (HUD) in the right-hand column (`delegation_panel.js`), unless space constraints absolutely forbid it (e.g., full-screen grids).

## Example: The "DNA / Fitness" Module
When `school_dna.html` was created, the immediately required actions under this rule are:
1. Add "School DNA Analysis" to `explorer.js` so it appears in the global sidebar menu.
2. Add a KPI widget or a quick-link button to `director_dashboard.html` so the Director can see the DNA Overview at a glance.
