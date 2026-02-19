# IDLPMS — UI Architecture Blueprint
> เอกสารนี้ใช้สำหรับให้ AI อ่านเป็น Context ในการพัฒนา UI ต่อ
> Version: 2.0 | อัปเดตหลัง Full CSS Audit (theme + curriculum + passport + notifications + student_input + submenu + timeline_menu + styles)

---

## 1. ภาพรวมระบบ (System Overview)

IDLPMS (Instructional Data-driven Learning Platform Management System) คือ **Instructional OS** สำหรับการศึกษาไทย ประกอบด้วย 7 Role ใน Hierarchy และ Core Feature คือ **7-Step Learning Flow** + **Intelligence DNA (KPAED Model)**

### Role Hierarchy (7 ระดับ)
```
Lvl 07 — MOE        (กระทรวงศึกษาธิการ)
Lvl 06 — OBEC       (สพฐ.)
Lvl 05 — ESA Dir    (ผู้อำนวยการเขตพื้นที่)
Lvl 04 — Director   (ผู้อำนวยการโรงเรียน)
Lvl 03 — Teacher    (ครูผู้สอน)
Lvl 02 — Parent     (ผู้ปกครอง)
Lvl 01 — Student    (นักเรียน ป.1-6)
```

### Intelligence DNA Model (6 มิติ — KPAED)
```
K — Knowledge    (ความรู้)
P — Process      (ทักษะกระบวนการ)
A — Attitude     (เจตคติ)
E — Effort       (ความพยายาม)
D — Discipline   (วินัย)
Characteristics: PATRIOTISM, INTEGRITY, DISCIPLINE, LEARNING,
                 SUFFICIENCY, COMMITMENT, THAINESS, PUBLIC_MIND
```

---

## 2. Device Strategy — Responsive-by-Role

> **หลักการ:** ไม่ใช้ Mobile First หรือ Desktop First แบบ Global แต่ตัดสินใจในระดับ **Role**

| Role | Primary Device | Strategy |
|------|---------------|----------|
| Student (ป.1-6) | มือถือ / แท็บเล็ต | **Mobile First** — Standalone Shell |
| Parent | มือถือ 90% | **Mobile First** — Standalone Shell |
| Teacher | PC/Laptop | **Desktop First** — Full HUD Shell |
| Director | PC + มือถือ | **Desktop First** + Mobile Summary |
| ESA / OBEC / MOE | PC เป็นหลัก | **Desktop First** — Full HUD Shell |

---

## 3. โครงสร้างไฟล์ (File Structure)

```
/
├── index.html              ← Landing Page — Desktop First, Scroll-based
├── login.html              ← Auth + Persona Quick Select — Responsive
├── hud.html                ← Desktop App Shell (Teacher+) — Desktop Only
├── student.html            ← [TODO] Student Mobile Shell — Mobile First
├── parent.html             ← [TODO] Parent Mobile Shell — Mobile First
│
├── pages/                  ← iframe Content Pages
│   ├── home.html
│   ├── schedule.html
│   ├── dashboard_admin.html
│   ├── subject_cards.html
│   ├── profile.html        ← Work Passport (passport.css)
│   ├── student/            ← [TODO]
│   │   ├── learn.html      ← 7-Step Learning Flow
│   │   ├── dna.html
│   │   └── quiz.html
│   └── manual/             ← 11 หน้า
│
└── assets/
    └── css/
        ├── theme.css           ← Global tokens + shell components + icons
        ├── curriculum.css      ← Subject color RGB overrides (loads AFTER theme.css)
        ├── styles.css          ← Legacy icons (i-user-plus, i-user-add) — nearly empty
        ├── student_input.css   ← Student data entry forms (16px Thai exception)
        ├── passport.css        ← Work Passport 3-tab profile page
        ├── notifications.css   ← Toast + badge system
        ├── submenu.css         ← Nav group collapse
        └── timeline_menu.css   ← Mission Control hierarchical nav
```

---

## 4. CSS Load Order (Critical)

```html
<!-- ลำดับนี้สำคัญมาก อย่าสลับ -->
<link rel="stylesheet" href="assets/css/theme.css">       <!-- Base tokens -->
<link rel="stylesheet" href="assets/css/curriculum.css">  <!-- Overrides --sj-*-rgb -->
<link rel="stylesheet" href="assets/css/[page-specific].css">
```

> ⚠️ `curriculum.css` ต้อง load หลัง `theme.css` เสมอ เพราะมันทำหน้าที่ override subject color RGB ให้ตรงกับ DESIGN_STANDARDS

---

## 5. Shell Architecture

### 5A. Desktop HUD Shell (hud.html)
```
┌──────┬────────────────┬──────────────────────────────┐
│ Act. │ Side Panel     │ Header h-12 (48px)            │
│ Bar  │ 352px          ├──────────────────────────────┤
│ 48px │ .vs-panel-     │                              │
│      │ header 36px *  │   iframe (.vs-iframe-         │
│      │ (BUG: ≠ 48px)  │   container)                 │
│      │                │                              │
│      │                ├──────────────────────────────┤
│      │                │ Status Bar h-6 (24px)         │
└──────┴────────────────┴──────────────────────────────┘

* .vs-panel-header = 36px — ขัด 48px Rule (known bug)
```

**Activity Bar Views:** `explorer` | `manage` | `manual` | `chat` | `search` | `settings`

**Sidebar width:** `352px` (ใหญ่กว่าที่เคย document ไว้ว่า 240px — ค่าจริงในไฟล์คือ 352px)

**Sidebar collapse:** `.vs-side-bar.collapsed { width: 0; opacity: 0; pointer-events: none; }` — มีอยู่แล้ว

### 5B. Student Mobile Shell (student.html) — [TODO]
```
┌─────────────────────┐
│ Header 48px          │
├─────────────────────┤
│   Main Content       │
│   (Scrollable)       │
├─────────────────────┤
│ Bottom Nav 56px      │  เรียน | DNA | ตาราง | แจ้งเตือน
└─────────────────────┘
```

---

## 6. Design System — Source of Truth

### 6A. Color Tokens (theme.css :root)

#### UI Foundation
```css
--vs-bg-deep:    #1c1c1f    /* Level 1 — Floor / Main Canvas */
--vs-bg-main:    #1c1c1f    /* Level 1 — (alias ของ deep) */
--vs-bg-panel:   #27272a    /* Level 2 — Sidebar / Panel */
--vs-bg-card:    #333338    /* Level 3 — Cards */
--vs-border:     #3f3f46    /* Level 4 — Borders */

--vs-text-title: #ffffff
--vs-text-body:  rgba(255,255,255,0.60)
--vs-text-muted: rgba(255,255,255,0.45)

--vs-accent:   #22d3ee   /* Cyan */
--vs-success:  #22c55e   /* Green */
--vs-warning:  #eab308   /* Amber */
--vs-danger:   #ef4444   /* Red */
--vs-radius:   3px
```

#### Identity Colors (per Role)
```css
--id-moe:    #22d3ee   /* Cyan */
--id-obec:   #818cf8   /* Indigo */
--id-esa:    #34d399   /* Emerald */
--id-dir:    #fbbf24   /* Amber */
--id-parent: #a78bfa   /* Violet */
--id-stu:    #38bdf8   /* Sky */
--id-def:    #94a3b8   /* Slate */
```

#### Thai Day Colors (สีประจำวัน)
```css
--day-mon: #FFD600  /* จันทร์ — เหลือง */
--day-tue: #FF80AB  /* อังคาร — ชมพู */
--day-wed: #69F0AE  /* พุธ — เขียว */
--day-thu: #FF6E40  /* พฤหัส — ส้ม */
--day-fri: #40C4FF  /* ศุกร์ — ฟ้า */
```

### 6B. Subject Color System

> ⚠️ **BUG ที่ยังไม่ได้แก้:** `theme.css` มี `--sj-*` (hex) และ `--sj-*-rgb` ที่ **ไม่ตรงกัน**
> `curriculum.css` fix เฉพาะ RGB แต่ไม่ fix hex
> code ที่ใช้ `var(--sj-thai)` กับ `rgba(var(--sj-thai-rgb), 0.2)` ได้สีคนละสีบนหน้าเดียวกัน

**ค่าที่ถูกต้อง (ตาม DESIGN_STANDARDS + curriculum.css):**

| Subject | Variable | Hex ที่ถูก | RGB ที่ถูก |
|---------|----------|-----------|----------|
| ภาษาไทย | `--sj-thai` | `#fb7185` | `251, 113, 133` |
| คณิตศาสตร์ | `--sj-math` | `#fbbf24` | `251, 191, 36` |
| วิทยาศาสตร์ | `--sj-sci` | `#22d3ee` | `34, 211, 238` |
| สังคมศึกษา | `--sj-soc` | `#fb923c` | `251, 146, 60` |
| ประวัติศาสตร์ | `--sj-hist` | `#a1a1aa` | `161, 161, 170` |
| พละ | `--sj-pe` | `#f43f5e` | `244, 63, 94` |
| ศิลปะ | `--sj-art` | `#d946ef` | `217, 70, 239` |
| การงานอาชีพ | `--sj-work` | `#34d399` | `52, 211, 153` |
| ภาษาอังกฤษ | `--sj-eng` | `#818cf8` | `129, 140, 248` |

**Activity-specific:**
```css
--sj-guide: #CE93D8  /* แนะแนว */
--sj-plc:   #4DD0E1  /* PLC */
--sj-club:  #AED581  /* ชุมนุม */
--sj-scout: #A1887F  /* ลูกเสือ */
--sj-pray:  #FFF176  /* กิจกรรมหน้าเสาธง */
```

**วิธีใช้ที่ถูกต้อง (รอหลัง fix hex):**
```css
background: rgba(var(--sj-thai-rgb), 0.15);
border: 1px solid rgba(var(--sj-thai-rgb), 0.35);
color: rgb(var(--sj-thai-rgb));
```

### 6C. Typography (Iron Rules)

```
Font Family: Sarabun — Thai + Latin in one face (suitable for Thai gov context)
Global: * { font-weight: 300 !important; }  ← weight 300, NOT 200
         (เหตุผล: 200 ทำ Latin บางกว่า Thai ทางสายตา, 300 optical-balanced)

Standard UI Text: 13px  ← VS Code / Cursor standard
Line Height: 1.4  ← VS Code standard (tighter, code-editor-like)
Thai Body Text (student forms): 16px — INTENTIONAL EXCEPTION
  → documented ใน student_input.css header: "Thai 16px | readability ป.1-6"

BANNED: 14px, 16px ใน context อื่น ยกเว้น Hero titles (24-36px) และ student_input.css
BANNED: italic, letter-spacing ≠ 0, font-weight 200
```

### 6D. Spacing (4px Grid)

```
Approved: 4, 8, 12, 16, 20, 24, 32, 48px
BANNED: 7, 9, 10, 11, 18px และ arbitrary px เช่น p-[13px]
Known violation: nav items ใน hud.html ใช้ px-[18px] → ต้องแก้เป็น px-4
```

### 6E. Layout Iron Rules

```
Border Radius: 3px เท่านั้น (var(--vs-radius))
BANNED: rounded-lg, rounded-xl, rounded-full

Exceptions (intentional + documented):
  - passport.css .settings-toggle → border-radius: 11px / 50% (toggle UX)
  - timeline_menu.css .timeline-node → border-radius: 50% (dot indicator)
  - student_input.css .step-num → border-radius: 50% (step circle)

Border: 1px solid เท่านั้น
Box Shadow: BANNED (Sharpness compliance — ดู notifications.css comment)
  Inconsistency: timeline_menu.css node hover/active มี box-shadow อยู่ → todo

Header Height: 48px (48px Rule) — ENFORCED
  Fixed ✅: .vs-panel-header = 48px (was 36px)
```

---

## 7. CSS Class Reference (ยืนยันจากไฟล์จริง)

### จาก theme.css

**Shell Layout:**
```
.vs-activity-bar          width: 48px, bg-deep, border-right
.vs-side-bar              width: 352px, bg-card, collapsible
.vs-side-bar.collapsed    width: 0, hidden
.vs-content               flex: 1, column
.vs-iframe-container      flex: 1, overflow hidden
.vs-panel-header          height: 36px ⚠️ (ควรเป็น 48px), padding: 0 24px
.vs-sidebar-panel         full height column
```

**Activity Bar:**
```
.activity-item            48px tall, centered icon, opacity 0.6
.activity-item:hover      opacity 1, bg rgba(white, 0.05)
.activity-item.active     opacity 1 + cyan left border 1px
.activity-item[data-view="explorer"] .icon  color: #fb923c
.activity-item[data-view="manage"] .icon    color: var(--vs-accent)
.activity-item[data-view="manual"] .icon    color: #34d399
.activity-item[data-view="chat"] .icon      color: #a78bfa
.activity-item[data-view="search"] .icon    color: #fbbf24
.activity-item[data-view="settings"] .icon  color: muted
```

**Navigation:**
```
.vs-menu-item             border-left: 1px transparent, transition
.vs-menu-item:hover       bg-deep
.vs-menu-item.active      bg-deep + border-left accent
.nav-item                 legacy class (ใช้คู่กับ vs-menu-item)
.nav-item.active          bg-deep + border-left accent + icon cyan
.vs-hover-inset:hover     bg-deep
```

**Sidebar page-specific icon colors (data-page attribute):**
```
pages/home.html           cyan
pages/schedule.html       orange #fb923c
pages/subject_cards.html  emerald #34d399
pages/school_setup.html   violet #a78bfa
```

**Components:**
```
.role-badge / .vs-neon    neon badge base (uppercase, padding 4px 12px)
  .role-badge-student     cyan | .role-badge-teacher  green
  .role-badge-admin       purple | .role-badge-parent  amber
  .role-badge-director    rose | .role-badge-esa       indigo
  .role-badge-moe         teal | .role-badge-obec      indigo

.vs-badge                 notification dot (8x8, danger, top-right absolute)
.vs-badge.active          display: block
.hud-badge-micro          font-weight: 400 exception, padding 2px 8px
.hud-bg-cyan              rgba(accent, 0.1)
.hud-border-cyan          1px solid rgba(accent, 0.3)
.hud-bg-rose / .hud-border-rose
.hud-border-white-05 / .hud-border-white-10
.hud-border-zinc-700 / .hud-border-zinc-800

.vs-section-card          bg-card, border, radius, padding 24px
.vs-setup-input           subtle input, rgba(white,0.03) bg
.dna-zone                 bg-card, border, radius, backdrop-blur
.dna-zone-header / .dna-zone-title / .dna-zone-content

.vs-progress-track        height: 3px, bg-deep
.vs-progress-fill / -success / -warning / -danger

.view-toggle / .view-toggle-btn / .view-toggle-btn.active
.vs-pulse-cyan            glow animation (2s infinite)
.Thai-Rule                Sarabun utility class
```

**Milestone Nodes (40x40):**
```
.vs-milestone-node        40x40, bg-deep, border, radius 3px
.vs-node-active           cyan border, glow
.vs-node-past             cyan, full opacity
.vs-node-future           opacity 0.4, grayscale
.animate-node-pulse       pulse keyframe 2s infinite
```

**Schedule Grid:**
```
.schedule-grid            grid: 100px + repeat(9, minmax(100px,1fr))
.schedule-day-cell        border-left: 1px solid var(--day-accent)
.schedule-cell            min-height: 80px
.schedule-event-card      draggable card
.schedule-palette         subject bank (horizontal scroll)
.schedule-mode-btn.active cyan theme
```

**Login Page:**
```
.vs-login-container       bg-deep + grid overlay (::before)
.vs-login-card            bg-card, border, hover glow
.vs-login-input           dark input, left-padding 44px (icon space)
.vs-login-input:focus     accent border + box-shadow ⚠️ (Sharpness inconsistency)
.vs-persona-card          120px min, centered, uppercase
.vs-persona-icon-container 36x36, bg-deep
.vs-persona-grid          auto-fit minmax(120px, 1fr)
.vs-login-footer          border-top, space-between
.vs-identity-badge        9px, uppercase, accent color
.vs-divider-text / .vs-divider-line / .vs-divider-label
.vs-bg-ornament           fixed decorative element
```

**Icon System (CSS Mask — ทั้งหมดอยู่ใน theme.css):**
```
.icon    base class (mask-size contain, bg currentColor)

Available:
  .i-folder  .i-cog  .i-dots  .i-user  .i-logout  .i-finger-print
  .i-eye  .i-database  .i-cube  .i-swatch  .i-office  .i-chart
  .i-lightning  .i-academic  .i-calendar  .i-user-plus  .i-globe
  .i-library  .i-building  .i-shield  .i-chevron-right  .i-sparkles
  .i-chip  .i-calculator  .i-paper-clip  .i-emoji  .i-paper-airplane
  .i-beaker  .i-heart  .i-flag  .i-save  .i-lock  .i-clock
  .i-check  .i-x  .i-plus  .i-minus  .i-play  .i-refresh
  .i-trash  .i-pencil  .i-download  .i-upload  .i-document  .i-bell
  .i-home  .i-mail  .i-phone  .i-star  .i-adjustments
  .i-external-link  .i-exclamation-circle  .i-shield-check
  .i-user-group  .i-mouse-pointer-click  .i-document-check
  .i-check-circle  .i-document-duplicate  .i-document-plus
  .i-clipboard-check  .i-link  .i-users  .i-squares  .i-book  .i-chat
  .i-search

Extra (styles.css only):
  .i-user-add (stroke-width: 1)

Extra (submenu.css only):
  .i-chevron-down (stroke-width: 1)

⚠️ stroke-width inconsistency: theme.css = 1.5, styles.css/submenu.css = 1
```

### จาก student_input.css (Thai 16px Exception)
```
.student-page             padding 16px 24px, bg-deep
.student-header           height: 48px ✅
.step-indicator           horizontal tabs, overflow-x auto
.step-tab / .step-tab.active / .step-tab.complete
.step-num                 24x24, border-radius: 50% (intentional)
.step-label-en            14px uppercase
.step-label-th            16px (intentional — Thai readability)
.vs-form-grid             12-col, gap: 14px (≠ 4px grid ⚠️ minor)
.vs-col-{2,3,4,6,8,12}
.vs-field-group / .vs-field-label (16px) / .vs-field-label-en (14px)
.vs-input-industrial      bg-card, 16px Thai, border, focus accent
.vs-radio-group / .vs-radio-label (16px)
.vs-btn / .vs-btn-outline / .vs-btn-accent / .vs-btn-solid
.vs-range-group           DNA sliders (3px track)
.vs-description           16px, line-height 1.6
.form-tab / .form-tab.active  fade animation
```

### จาก passport.css
```
.passport-tabs / .passport-tab / .passport-tab.active
.passport-panel / .passport-panel.hidden
.passport-filter / .passport-filter.active
.timeline-entry / .timeline-entry:hover (glow)
.verify-badge.verified (emerald) / .pending (amber) / .rejected (red)
.settings-toggle         border-radius: 11px / 50% (intentional)
.privacy-option / .privacy-option.selected
.passport-empty          empty state
```

### จาก notifications.css
```
.vs-badge                 8x8, danger, NO box-shadow (Sharpness compliant)
#vs-toast-container       fixed top-right
.vs-toast                 border-left: 3px accent, NO box-shadow
.vs-toast-title           10px uppercase
.vs-toast-text            13px ⚠️ (exception จาก 14px standard)
.vs-toast.danger / .success
```

### จาก timeline_menu.css
```
.timeline-parent-item     padding: 6px 12px, hover bg-deep
.timeline-chevron         rotates on collapse
.timeline-children-container  20px margin/padding-left
  ::before = vertical rail (cyan gradient)
.timeline-children-container.collapsed  max-height: 0
.timeline-child-item.active  bg-deep + border-left accent
.timeline-node            8x8, border-radius: 50% (dot — intentional)
  :hover/.active          box-shadow ⚠️ (ขัด Sharpness compliance)
.timeline-child-item span  0.875rem ⚠️ (ควรเป็น 14px)
.timeline-child-item.locked  opacity 0.35, cursor not-allowed
```

### จาก submenu.css
```
.nav-group / .nav-submenu / .nav-submenu.visible (max-height: 200px)
.i-chevron-down           (stroke-width: 1)
```

---

## 8. Known Issues / Technical Debt

### 🔴 Critical

| # | ปัญหา | ไฟล์ | แก้ยังไง |
|---|-------|------|----------|
| 1 | **Subject Color hex ≠ RGB** — `var(--sj-thai)` กับ `rgba(var(--sj-thai-rgb),x)` คนละสี | theme.css | แก้ hex ทั้ง 9 วิชาใน theme.css ให้ตรงกับ table ด้านบน |
| 2 | **vs-panel-header = 36px** ขัด 48px Rule | theme.css | `height: 48px` |

### 🟡 Medium

| # | ปัญหา | ไฟล์ | แก้ยังไง |
|---|-------|------|----------|
| 3 | `px-[18px]` ใน nav items (≠ 4px grid) | hud.html | เปลี่ยนเป็น `px-4` |
| 4 | `box-shadow` ใน timeline nodes ขัด Sharpness compliance | timeline_menu.css | ลบหรือ document intentional |
| 5 | `.timeline-child-item span` ใช้ `0.875rem` | timeline_menu.css | เปลี่ยนเป็น `font-size: 14px` |
| 6 | `i-user-plus` มีสองนิยาม (stroke-width ต่างกัน) | styles.css vs theme.css | ลบ styles.css version |
| 7 | `.vs-login-input:focus` มี `box-shadow` | theme.css | ลบหรือ document exception |

### 🟢 Intentional Exceptions (อย่าแก้)

| ดูเหมือนผิด แต่ถูก | เหตุผล |
|--------------------|--------|
| `student_input.css` ทั้งไฟล์ใช้ 16px | Thai readability ป.1-6 (documented ใน file header) |
| `passport.css` toggle → border-radius: 50% | Toggle switch UX ต้องกลม |
| `timeline_menu.css` node → border-radius: 50% | Dot indicator |
| `student_input.css` step-num → border-radius: 50% | Step circle |
| `vs-toast-text` = 13px | Toast space constraint |

---

## 9. Core Feature: 7-Step Learning Flow

```
Step 1: ENGAGE    → Hook / คำถามกระตุ้น
Step 2: EXPLORE   → วิดีโอ DLTV (HLS.js)
Step 3: EXPLAIN   → สรุปเนื้อหา
Step 4: ELABORATE → กิจกรรมเพิ่มเติม
Step 5: EVALUATE  → แบบทดสอบ (QuizEngine.js)
Step 6: EXTEND    → โจทย์ขั้นสูง (AIAuditor.js)
Step 7: REFLECT   → บันทึก DNA Signal (DNAHarvester.js)
```

### Quiz Security (SecurityEngine.js)
```
minTimePerQuestion: { short: 5s, long: 10s, matching: 15s, fillIn: 8s }
wrongStreak 2 → warning toast
wrongStreak 3 → lockout 30s
wrongStreak 4 → lockout 60s
wrongStreak 5 → lockout 120s
sameAnswerStreak 5 → SAME_ANSWER_STREAK flag
```

---

## 10. Service Layer

### Bootstrap Sequence (AppBootstrap.js)
```
1. DataService (Factory → InsForgeDataService หรือ LocalDataService)
2. AuthService (Session & Identity)
3. CacheService (Storage buffer)
4. SyncEngine (Background persistence)
```

### API (InsForgeDataService)
```
Base: https://3tcdq2dd.ap-southeast.insforge.app
Auth: Bearer token
Pattern: /api/database/records/{tableName}

Tables: persons, role_profiles, organizations, groups,
        intelligence_snapshots, person_credentials, role_delegations
```

---

## 11. Development Backlog

### Priority 1 — Fix Critical Bugs
- [ ] แก้ Subject Color hex ใน theme.css (9 วิชา) ให้ตรงกับ table Section 6B
- [ ] แก้ `.vs-panel-header` 36px → 48px
- [ ] แก้ `px-[18px]` → `px-4` ใน hud.html

### Priority 2 — New Pages
- [ ] `student.html` Mobile Shell (Bottom Nav)
- [ ] `pages/student/learn.html` 7-Step UI
- [ ] `pages/student/quiz.html` Quiz Interface
- [ ] `pages/student/dna.html` DNA Radar

### Priority 3 — Consistency Fixes
- [ ] `timeline_menu.css` box-shadow → ลบ
- [ ] `timeline_menu.css` 0.875rem → 14px
- [ ] `styles.css` i-user-plus duplicate → merge เข้า theme.css
- [ ] `.vs-login-input:focus` box-shadow → ตัดสินใจ

---

## 12. Entry Points Summary

| URL | สำหรับ | Shell | Device |
|-----|--------|-------|--------|
| `index.html` | ทุกคน | Landing Scroll | Desktop → Mobile |
| `login.html` | ทุกคน | Centered Form | Responsive |
| `hud.html` | Teacher+ | VS Code HUD | Desktop Only |
| `student.html` | Student | Bottom Nav | Mobile First |
| `parent.html` | Parent | Card Feed | Mobile First |

---

*Source of Truth: `assets/css/theme.css` + `curriculum.css`*
*Audit: v2.0 — ยืนยันทุก class จากไฟล์จริง*
