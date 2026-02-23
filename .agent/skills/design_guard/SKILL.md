---
name: Razor-Sharp Design Guard
description: Enforce Iron Rules and premium HUD aesthetics for the WEBVI project.
---

# Razor-Sharp Design Guard — Single Source of Truth

> [!CAUTION]
> **This SKILL.md is the AUTHORITATIVE source.** If `DESIGN_STANDARDS.md` conflicts with this file, THIS FILE WINS.
> Read this ENTIRE document before writing ANY HTML/CSS.

---

## ⚡ Pre-Flight Checklist (MANDATORY before every UI task)

Before writing ANY UI code, verify your output satisfies ALL of these:

- [ ] **Text size** = `13px` everywhere (no text-sm, text-xs, text-[11px], text-[12px], text-[14px])
- [ ] **Font weight** = `300` (font-light) everywhere (no font-bold, font-extralight, font-semibold)
- [ ] **Corners** = `3px` / `var(--vs-radius)` everywhere (no rounded-lg, rounded-xl, rounded-full except ≤8px dots)
- [ ] **Borders** = `1px` + **50% opacity** always → `rgba(63, 63, 70, 0.5)` (no solid 100% borders, no 2px+)
- [ ] **Inputs** = `var(--vs-bg-deep)` + `border: none` (Sunken Inset — no bg-card, no border on inputs)
- [ ] **Buttons/Badges** = **Neon Style** only (translucent bg + colored text + glow border — NO solid fills)
- [ ] **No letter-spacing** (no tracking-*)
- [ ] **No italic** (no font-style: italic)
- [ ] **No drop shadows** (use glow effects only)
- [ ] **Semantic variables only** (no hardcoded hex colors)
- [ ] **Icon-text gap** = `gap-1.5` (6px) inline / `gap-2` (8px) section headers (no gap-1, no mr-1)
- [ ] **Icon registration** = every `i-*` class used in JS/HTML must have a `mask-image` in `theme.css`
- [ ] **Contrast system** = use `color-mix()` for dynamic colors, `rgba(var(--xxx-rgb))` for static (NO hex suffix hack)
- [ ] **Groove dividers** = inset separators use dark + highlight (not flat `border-bottom`)
- [ ] **Use `components.css`** classes when possible (`neon-btn-*`, `form-input`, `vs-card`, `neon-badge-*`)

> [!IMPORTANT]
> **MANDATORY:** After every UI change, run the lint script before submitting:
> ```powershell
> powershell -ExecutionPolicy Bypass -File ".agent/skills/design_guard/scripts/lint_iron_rules.ps1" -Path "pages"
> ```
> Must achieve **0 errors** to submit. Warnings are acceptable but should be reviewed.

---

## Iron Rules

### Rule 1 — 48px Vertical Rule
- Every header (Main Stage, Sidebar, Explorer) height = **48px**
- All header contents vertically centered (flex center)

### Rule 2 — Zinc Elevation Hierarchy
| Level | Token | Hex | Usage |
|:---|:---|:---|:---|
| 1 (Floor) | `--vs-bg-deep` | #1c1c1f | Canvas / Rail / **Input fields** |
| 2 (Panel) | `--vs-bg-panel` | #27272a | Sidebar / Headers |
| 3 (Surface) | `--vs-bg-card` | #333338 | Cards / Modules |
| 4 (Elevated) | `--vs-border` | #3f3f46 | Borders (at 50% opacity) |
| 5 (Highlight) | — | #52525b | Secondary highlights |
| 6 (Interactive) | — | #71717a | Interactive surfaces |

> [!CAUTION]
> **Depth Limit:** MAX = Zinc-850. ห้ามใช้ Zinc-900, Zinc-950 โดยเด็ดขาด

### Rule 3 — Typography (13px Unity)
- **ALL body text** = `13px`, `font-weight: 300`, `line-height: 1.4`
- **Hero/Page Titles** = 24-36px (text-2xl to text-4xl)
- **Panel Headers** = 13px
- **Font** = Sarabun (Thai + Latin unified)
- **Muted text** = 13px at `rgba(255,255,255,0.45)` (45% opacity)

**BANNED sizes:** `text-sm` ❌, `text-xs` ❌, `text-[10px]` ❌, `text-[11px]` ❌, `text-[12px]` ❌, `text-[14px]` ❌, `text-base`/`16px` ❌ (except `student_input.css`)

**BANNED weights:** `font-extralight`/200 ❌, `font-bold`/700 ❌, `font-semibold`/600 ❌, `font-medium`/500 ❌ (except `.hud-badge-micro` at 400)

### Rule 4 — Strict 3px Corners (Razor-Sharp)
- ALL elements: `border-radius: var(--vs-radius)` = **3px**
- **BANNED:** `rounded-lg` ❌, `rounded-xl` ❌, `rounded-full` ❌, `rounded-2xl` ❌
- **Exception:** Status indicator dots (≤8px) MAY use `border-radius: 50%`

### Rule 5 — Global Line Unity (Borders)
- ALL borders = **1px** thickness. ห้ามใช้ 2px+ โดยเด็ดขาด
- ALL borders = **50% opacity** → `1px solid rgba(63, 63, 70, 0.5)`
- ห้ามใช้ `border: 1px solid var(--vs-border)` (ทึบเกินไป)
- ✅ Correct: `border: 1px solid rgba(63, 63, 70, 0.5)`
- Semantic color borders (e.g., status): use color at 30% opacity for border, 10% for bg

### Rule 6 — Neon Style Policy (Zero Solid Fill)
> [!CAUTION]
> **NO SOLID COLOR FILLS** on buttons, badges, tags, status indicators, or any interactive element. Everything must use Neon aesthetic.

**Neon Pattern:**
```css
/* Button/Badge Template */
.neon-element {
    background: rgba(<color-rgb>, 0.1);     /* 10% translucent bg */
    color: var(--vs-<color>);                /* colored text */
    border: 1px solid rgba(<color-rgb>, 0.3); /* 30% glow border */
    font-weight: 300;
}
.neon-element:hover {
    background: rgba(<color-rgb>, 0.15);
    border-color: rgba(<color-rgb>, 0.5);
    box-shadow: 0 0 8px rgba(<color-rgb>, 0.1); /* subtle glow */
}
```

**Color RGB Values for Neon:**
| Color | Variable | RGB | Usage |
|:---|:---|:---|:---|
| Cyan | `--vs-accent` | `34, 211, 238` | Primary actions / CTA |
| Green | `--vs-success` | `34, 197, 94` | Approve / Success |
| Red | `--vs-danger` | `239, 68, 68` | Reject / Danger |
| Yellow | `--vs-warning` | `234, 179, 8` | Warning / Highlight |

### Rule 7 — Sunken Inset (Input Fields)
ALL native form controls (`input`, `select`, `textarea`) must follow:
```css
.form-input {
    background: var(--vs-bg-deep);  /* Level 1 — sunken below panel */
    border: none;                    /* NO border — depth contrast only */
    border-radius: var(--vs-radius); /* 3px */
    color: var(--vs-text-body);
    font-size: 13px;
    font-weight: 300;
    padding: 8px 12px;
    min-height: 36px;
    outline: none;
    color-scheme: dark;
}
.form-input:focus {
    box-shadow: 0 0 0 1px var(--vs-accent); /* focus ring only */
}
```

### Rule 8 — Progress & Scroll Bars
- Thickness = **3px** (Precision Standard)
- Background: `rgba(255, 255, 255, 0.08)`
- Fill: semantic color at 100%
- Border-radius: 3px

### Rule 9 — Iconography
- **100% Heroicons** via CSS Mask only
- **0% Unicode/Emoji** 
- Activity Bar / Sidebar Nav: `16px` (w-4 h-4)
- Small details: 12-14px

### Rule 10 — Zero Letter-Spacing
- ห้ามใช้ `letter-spacing` หรือ `tracking-*` ทุกกรณี

### Rule 11 — Zero Italic
- ห้ามใช้ `italic` / `font-style: italic` ทุกกรณี 100%

### Rule 12 — No Drop Shadows (Glow Only)
- ห้ามใช้ `box-shadow` แบบ drop shadow ทั่วไป
- ใช้ glow effects: `box-shadow: 0 0 8px rgba(<color>, 0.1)` สำหรับ hover/active

### Rule 13 — Color Integrity
- NO `border-[var(...)]/30` (Tailwind opacity on CSS vars = white fallback risk)
- ✅ Use: `rgba(var(--vs-accent-rgb), 0.3)` or inline style
- ✅ Use: `rgba(34, 211, 238, 0.3)` (explicit RGB)

### Rule 14 — Spacing (4px Grid)
- All padding/margin must divide by 4: `4, 8, 12, 16, 24, 32, 48`
- **BANNED:** `p-7`, `p-9`, `p-10`, `gap-5`, `gap-7`, `space-y-5`, arbitrary px values

### Rule 15 — Template Literal HTML
- NO spaces inside angle brackets in JS template literals
- ❌ `` `< div class= "foo" >` `` → renders as visible text
- ✅ `` `<div class="foo">` `` → correct HTML

### Rule 16 — Icon-Text Gap
- **Inline pairs** (buttons, badges, warnings, labels) = `gap-1.5` (6px) or `mr-1.5`
- **Section headers** (card titles, panel headers) = `gap-2` (8px)
- ห้ามใช้ `gap-1` (4px — แคบเกินไป) หรือ `gap-3` (12px — ห่างเกินไป) สำหรับ icon-text
- **Grid layout gaps** (card grids, form grids) สามารถใช้ `gap-3`, `gap-4`, `gap-6` ได้
- **Tab gaps** = `gap-1` (tabs ติดกัน)
- Prefer `gap-*` on parent over `mr-*`/`ml-*` on icon element

```html
<!-- ✅ Section header -->
<div class="flex items-center gap-2">
    <i class="icon i-check w-4 h-4"></i> Section Title
</div>

<!-- ✅ Inline label / button -->
<div class="flex items-center gap-1.5">
    <i class="icon i-check w-3 h-3"></i> Label
</div>

<!-- ❌ Wrong -->
<div class="flex items-center gap-1">...</div>  <!-- too tight -->
<div class="flex items-center gap-3">...</div>  <!-- too wide -->
```

### Rule 17 — Icon Registration Gate
- **Every `i-*` class** used in HTML or JS MUST have a `mask-image` definition in `theme.css`
- When adding a new icon to a JS service (e.g. `icon: 'i-foo'`), ALWAYS add the CSS `.i-foo { mask-image: ... }` at the same time
- Run `lint_orphan_icons.ps1` after adding icons to verify zero orphans
- Source: **Heroicons v2** outline SVGs only

### Rule 18 — Contrast Opacity System (ระบบคำนวณความชัด)

On dark backgrounds (`--vs-bg-card` ≈ `#333338` / `--vs-bg-deep` ≈ `#1e1e22`):

| Layer | Opacity | Use Case | Method |
|-------|---------|----------|--------|
| **Wash/Tint** | 10-12% | Avatar bg, subtle highlight | `color-mix(…, 12%, transparent)` |
| **Visible Fill** | 15-20% | Badge bg, selected state | `rgba(var(--xxx-rgb), 0.15)` |
| **Thin Border** | 25-30% | Avatar frame, card accent border | `color-mix(…, 25%, transparent)` |
| **Strong Border** | 40-50% | Active state border, focus ring | `rgba(var(--xxx-rgb), 0.4)` |
| **Divider Line** | 50% | Section separator inside cards | `rgba(63,63,70, 0.5)` |
| **Muted Text** | 60% | Timestamps, secondary info | `opacity-60` class |
| **Body Text** | 100% | Primary content | `color: var(--vs-text-body)` |

**API Priority (เลือกวิธีตามกรณี):**
1. **Static CSS** → `rgba(var(--vs-warning-rgb), 0.3)` (ใช้ `-rgb` variants)
2. **Dynamic from JS data** → `color-mix(in srgb, ${color} 25%, transparent)`
3. ❌ **ห้ามใช้** hex suffix hack: `var(--vs-warning)40` (ไม่เสถียร parse ไม่ได้)

```html
<!-- ✅ Dynamic color from JS variable -->
<div style="background: color-mix(in srgb, ${type.color} 12%, transparent);
            border: 1px solid color-mix(in srgb, ${type.color} 25%, transparent)">

<!-- ✅ Static CSS (known variable) -->
<div style="background: rgba(var(--vs-warning-rgb), 0.15);
            border: 1px solid rgba(var(--vs-warning-rgb), 0.3)">

<!-- ❌ BANNED: hex suffix on CSS variable -->
<div style="background: var(--vs-warning)20;
            border: 1px solid var(--vs-warning)40">
```

**Groove Dividers (ร่องลึก) — AUTO-ENFORCED GLOBALLY:**

> ⚠️ **MANDATORY**: Every border/line divider in this system uses the groove effect.
> The system is enforced at the CSS-variable level — you do NOT need to add classes manually.

**How it works:**
- `--vs-border` = `rgba(0,0,0,0.45)` — the **dark shadow line**
- `--vs-border-highlight` = `rgba(255,255,255,0.04)` — the **light ridge**
- Global CSS rules in `theme.css` automatically add `box-shadow` highlight to any element with Tailwind's `border-b` or `border-t` classes.

**AI MUST follow these rules:**
1. ✅ Use `border-b border-[var(--vs-border)]` or `border-t border-[var(--vs-border)]` — groove auto-applies
2. ✅ Use `.groove` / `.groove-top` class for non-Tailwind elements
3. ❌ **NEVER** use flat inline borders: `border-bottom: 1px solid #3f3f46`
4. ❌ **NEVER** override `--vs-border` with a flat color
5. ❌ **NEVER** use `rgba(63,63,70,...)` directly — use `var(--vs-border)` instead
6. If you need a flat border (rare), use `var(--vs-border-flat)` explicitly

```html
<!-- ✅ Standard (groove auto-applied by CSS) -->
<tr class="border-b border-[var(--vs-border)]">
<div class="border-t border-[var(--vs-border)]">

<!-- ✅ Explicit class (for elements outside Tailwind) -->
<div class="groove">
<div class="groove-top">

<!-- ❌ BANNED: flat inline borders -->
<div style="border-bottom: 1px solid #3f3f46">
<div style="border-bottom: 1px solid rgba(63,63,70,0.5)">
```

---

## Master Token Catalog

### Backgrounds
| Variable | Value | Usage |
|:---|:---|:---|
| `--vs-bg-deep` | #1c1c1f (Zinc-850) | Root / Rail / **Input fields** |
| `--vs-bg-panel` | #27272a (Zinc-800) | Sidebar / Header |
| `--vs-bg-card` | #333338 (Zinc-750) | Cards / Modules |

### Borders (Groove System)
| Variable | Value | Usage |
|:---|:---|:---|
| `--vs-border` | rgba(0,0,0,0.45) | Groove dark line (auto) |
| `--vs-border-highlight` | rgba(255,255,255,0.04) | Groove light ridge (auto) |
| `--vs-border-flat` | #3f3f46 | Legacy flat border (rare) |

### Text Luminance
| Variable | Value | Usage |
|:---|:---|:---|
| `--vs-text-title` | #ffffff | Headers / Active labels |
| `--vs-text-body` | rgba(255,255,255,0.60) | Standard content |
| `--vs-text-muted` | rgba(255,255,255,0.45) | Secondary / Support |

### Accents (Neon Colors)
| Variable | Hex | RGB | Usage |
|:---|:---|:---|:---|
| `--vs-accent` | #22d3ee | 34, 211, 238 | CTA / Selection |
| `--vs-success` | #22c55e | 34, 197, 94 | Approve / Online |
| `--vs-warning` | #eab308 | 234, 179, 8 | Warning / Alert |
| `--vs-danger` | #ef4444 | 239, 68, 68 | Reject / Error |

### Rule 20 — Horizontal Alignment Unity (The X-Axis Rule)
- **Iron Rule**: Shell Header padding (`hud.html`) and Functional Page padding MUST be synchronized at **24px (`px-6`)**.
- **Visual Axis**: Breadcrumbs (Left) and Delegation Button (Right) must align perfectly with the page content edges.
- **BANNED**: Using `px-4` (16px) or `px-8` (32px) for functional page layout. Everything must use the 24px standard to prevent "shifting" between views.

### Rule 21 — Edge-to-Edge Fluidity (The Frame Fill Rule)
- **Iron Rule**: BANNED use of `max-width` (e.g., `max-w-7xl`, `max-w-[1200px]`) on all functional pages.
- **Full Frame**: Modules must extend to fill the available horizontal frame (`w-full`).
- **Dynamic Columns**: Use Tailwind breakpoints (`2xl:`, `3xl:`) to increase grid columns as the screen gets wider to prevent awkward stretching.
- **Unity**: Must still maintain the 24px horizontal padding (Rule 20) even when fluid.

### Rule 22 — Domain Color Accent Policy
- **Iron Rule**: The textual labels for working domains (e.g., in sidebars, navigation, or headers) must ALWAYS use the standard primary text color (`var(--vs-text-title)` or `var(--vs-text-body)`).
- **Icon Accent Only**: ONLY the accompanying icon should be injected with the domain's specific color/accent (e.g., `text-pink-400` for Student Affairs).
- **Auto-Collapse**: Hierarchical navigation menus (like accordions) MUST default to the `collapsed` state to maintain a clean initial UI load.
### Rule 23 — Absolute Sidebar Parity (The 1px Iron Rule)
- **Iron Rule**: The layout mathematics of ALL Sidebar Panels (Explorer, Management, Settings, etc.) MUST REMAIN ABSOLUTELY FIXED and IDENTICAL. Future AI agents are **STRICTLY FORBIDDEN** from altering these base equations.
- **Panel Header Strictness**: `.vs-panel-header` MUST retain `height: 48px; min-height: 48px; max-height: 48px; flex-shrink: 0;` to prevent sub-pixel flexbox compression bugs when content overflows.
- **Ghost Padding**: Every interactive `.vs-menu-item`, `.timeline-parent-item`, or `.timeline-child-item` MUST include `border-left: 1px solid transparent;` in its default state. This prevents a `1px` layout shift when the item becomes `.active` and gains a `1px` solid border.
- **Visual Node Parity**: Top-level clickable menus in panels like Explorer MUST utilize the `.timeline-parent-item` HTML structure (without the nested `.timeline-node` dots unless explicitly building a timeline rail) to ensure 100% hover/active aesthetic synchronization with the Mission Control accordion menus.
- **Typography Alignment**: All `.vs-panel-header` instances in `hud.html` must universally use `uppercase font-light text-[13px] text-[var(--vs-text-muted)] Thai-Rule`. Do NOT mix and match `text-[var(--vs-text-title)]` across different panel headers.


### Rule 24 — Icon-Text Alignment Layout (No Line Overflow)
- **Iron Rule**: Any layout utilizing a leading icon accompanied by multi-line trailing text MUST left-align the subsequent lines with the starting edge of the text body. **Subsequent text lines are STRICTLY FORBIDDEN from overflowing underneath the icon.**
- **Enforcement**: Always use the `.vs-icon-layout` global utility (defined in `theme.css`) to bind the icon and text block together rather than loose flex positioning.
- **HTML Structure**:
```html
<div class="vs-icon-layout">
    <div class="icon-col">
        <i class="i-check w-4 h-4"></i>
    </div>
    <div class="content-col">
        <div>Line 1: Main Title</div>
        <div>Line 2: Supporting Subtext (Aligned perfectly to Line 1)</div>
    </div>
</div>
```

### Rule 25 — Binary Toggle Knob Standard
- **Iron Rule**: Any UI element presenting a strict **two-option choice** (e.g., A/B toggles, System vs Adhoc, Inbox vs Dispatched) MUST use the `.vs-toggle` slider knob.
- **BANNED**: Using traditional side-by-side squared tabs or segmented controls (`.vs-tab-bar`) for binary choices. Segmented controls are reserved strictly for 3+ options or distinct routing views.
- **Layout Unity**: The knob must be placed on the right-hand edge of the container (e.g., via `justify-between`). The textual label must reflect the current active state explicitly.
- **HTML Structure**:
```html
<div style="height:48px; display:flex; align-items:center; justify-content:space-between; padding:0 12px;">
    <div style="display:flex; align-items:center; gap:8px;">
        <i class="icon i-example text-[var(--vs-accent)]"></i>
        <span>Active State Name</span>
    </div>
    <button class="vs-toggle" data-tab="NEXT_STATE"></button>
</div>
```

### Rule 26 — The Custom Floating Select and Calendar Standard (Banned Native Selects)
- **Iron Rule**: The native HTML `<select>` element is **BANNED** on all functional pages. System menus, dropdowns, and date pickers MUST use the `vs-dropdown-menu` and `vs-dropdown-wrapper` global aesthetic to guarantee visual parity across the entire app.
- **Visual Standard**: The popup menu MUST utilize `background: var(--vs-bg-deep); border: 1px solid var(--vs-border); padding: 12px; border-radius: var(--vs-radius); margin-top: 4px;` EXACTLY as seen in `eos_calendar.js`.
- **Auto-Collapse**: All floating components (Dropdowns, Calendars) MUST implement an Auto-Collapse mechanism (`closeAllDropdowns()`) where clicking one explicitly hides the others and correctly resets structural `z-index`. Stacked menus are forbidden.
- **HTML Structure**:
```html
<div class="vs-dropdown-wrapper" style="position:relative; z-index:1;">
    <input type="text" class="vs-dropdown-display" readonly placeholder="-- เลือก --" />
    <input type="hidden" class="vs-dropdown-value" />
    <div class="vs-dropdown-menu" style="display:none; position:absolute; top:100%; left:0; right:0; margin-top:4px; background:var(--vs-bg-deep); border:1px solid var(--vs-border); border-radius:var(--vs-radius); padding:12px; z-index:100;">
        <div class="vs-dropdown-opt" data-val="..." style="padding:8px 12px; cursor:pointer;">Option Text</div>
    </div>
</div>
```

---

## Workflow Mandate
1. **Read this SKILL.md** before editing any HTML/CSS
2. **Run Pre-Flight Checklist** before submitting
3. **Scan `styles.css`** for matching tokens before creating new ones
4. **Use semantic variables** — never hardcode hex
5. **Self-Audit**: Search for banned patterns before completing task
