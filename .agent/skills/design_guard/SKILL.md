---
name: Razor-Sharp Design Guard
description: Enforce Iron Rules and premium HUD aesthetics for the WEBVI project.
---

# Razor-Sharp Design Guard

This skill ensures that all UI developments stay within the established "Iron Rules" of the WEBVI project. Use this skill whenever you are making changes to HTML or CSS files.

## Iron Rules Checklist

Before submitting any UI work, verify:
1.  **Typography**: No `letter-spacing` (enforce `letter-spacing: 0 !important`).
2.  **Font Weight**: All text must be weight `200` (Universal Standard). Weights 300/500 prohibited (except `.hud-badge-micro`).
3.  **Font Size**: See **Typography Lockdown** section below.
4.  **Corners**: Mandatory `rounded-[3px]` (Unity Standard).
5.  **Colors**: Backgrounds between `zinc-850` (#1c1c1f) and `zinc-700`.
6.  **Elevation**: No Drop Shadows. Use borders and glow effects.
7.  **Progress & Scroll**: Mandatory `3px` thickness (Precision Standard).
8.  **Icons**: No Font Icons or Unicode. Use CSS Mask with `stroke-width="1"`.
9.  **Semantic Variables**: NO Hardcoded Hex colors or direct Zinc-classes (except `zinc-850` baseline). Use Master Tokens.
10. **Color Integrity**: NO `border-[var(...)]/30` or opacity modifiers on CSS variables. Use `rgba(var(...-rgb), alt)` or semantic utility classes. (Ensures NO white fallbacks).

---

## Typography Lockdown System 🔒

> [!CAUTION]
> This is the MOST CRITICAL rule. Violations cause immediate visual degradation.

### Absolute Minimums
| Language | Minimum Size | Tailwind Class | Notes |
|:---|:---|:---|:---|
| **Thai** | **16px** | `text-base` | NEVER smaller. Add `.Thai-Rule` for enforcement. |
| **English** | **14px** | `text-sm` | For metadata, labels, descriptions. |
| **Badge (EN only)** | **10px** | `.hud-badge-micro` | The ONLY exception. See below. |

> [!IMPORTANT]
> **Mixed Language Rule**: If a paragraph/element contains **ANY** Thai text, the entire block MUST use `text-base` (16px) even if it contains English technical terms.

### Prohibited Patterns (VIOLATIONS)
The following are **BANNED** everywhere in the codebase:
- `text-xs` ❌
- `text-[10px]` ❌
- `text-[11px]` ❌
- `text-[12px]` ❌
- `text-[13px]` ❌

### The `.hud-badge-micro` Exception
This is the **ONLY** way to use 10px text:
```html
<span class="hud-badge-micro">BETA</span>
<span class="hud-badge-micro">NEW</span>
```
- Must be **English only** (no Thai)
- Must be **short labels** (1-2 words max)
- Automatically applies: `uppercase`, `font-weight: 500`

### Audit Command
Run before committing any UI changes:
```powershell
powershell .agent/skills/design_guard/scripts/audit_typography.ps1
```

## Master Token Catalog (The Bible)

### Backgrounds
| Variable | Value | Usage |
| :--- | :--- | :--- |
| `--vs-bg-deep` | `zinc-850` | Root background / Rail |
| `--vs-bg-panel` | `zinc-800 / 0.8` | Sidebar / Header (Glass) |
| `--vs-bg-main` | `zinc-850` | Main content background |
| `--vs-bg-card` | `zinc-750 / 0.5` | Modules / Cards |

### Borders & Radius
| Variable | Value | Usage |
| :--- | :--- | :--- |
| `--vs-border` | `zinc-700 / 0.4` | Global grid/borders |
| `--vs-radius` | `3px` | Standard corner rounding |

### Text Luminance
| Variable | Value | Mapping |
| :--- | :--- | :--- |
| `--vs-text-title` | `zinc-50` | Headers / Active labels |
| `--vs-text-body` | `zinc-300` | Standard content |
| `--vs-text-muted` | `zinc-500` | Support / Muted info |

### Accents
- `vs-accent`: `#22d3ee` (cyan-400)
- `vs-success`: `#34d399` (emerald-400)
- `vs-danger`: `#fb7185` (rose-400)

### Color Integrity Rules (HUD Standard)

> [!WARNING]
> **White Fallback Prevention**: Tailwind's `border-[var(...)]/opacity` shorthand can FAIL in some browser environments, resulting in a **White 100% border**. 

**PROHIBITED Patterns ❌**
- `<div class="border-[var(--vs-accent)]/30">` (DANGEROUS)
- `<div class="bg-[var(--vs-accent)]/10">` (DANGEROUS)

**MANDATORY Implementation ✅**
1. **Explicit RGBA (Recommended)**: 
   ```html
   <div style="border-color: rgba(var(--vs-accent-rgb), 0.3)">
   ```
2. **Semantic Utility Class**:
   Add common types to `styles.css` (e.g., `.hud-border-cyan`) and use those.

3. **Tailwind RGBA Variable**:
   ```html
   <div class="border-[rgba(var(--vs-accent-rgb),0.3)]">
   ```

## Mapping Matrix (Tailwind -> Semantic)
Do NOT use the left column. ALWAYS use the right column.

| Tailwind / Hex | Use Semantic Variable / Class |
| :--- | :--- |
| `#1c1c1f` / `zinc-900` | `var(--vs-bg-deep)` |
| `bg-zinc-800` | `bg-zinc-800/40 vs-glass` (or `--vs-bg-panel`) |
| `text-zinc-500` | `var(--vs-text-muted)` |
| `text-cyan-400` | `var(--vs-accent)` |
| `rounded-lg` | `rounded-[var(--vs-radius)]` |

## Workflow Mandate
- **Rule 1**: Before editing HTML, scan `styles.css` for matching tokens.
- **Rule 2**: If no token exists for a specific need, **PROPOSE** a new variable in `styles.css` instead of hardcoding.
- **Rule 3**: All new UI components MUST use `vs-glass` or semantic variables for their surfaces.

1.  **Context Loading**: Read `design.html` and `styles.css` to refresh on current constants.
2.  **Implementation**: Use CSS variables from `styles.css` whenever possible (e.g., `var(--vs-bg-deep)`).
3.  **Self-Audit**: Run the following commands to check for violations:
    ```powershell
    # Iron Rules compliance check (REQUIRED before committing)
    powershell -ExecutionPolicy Bypass -File ".agent/skills/design_guard/scripts/lint_iron_rules.ps1"
    
    # Design audit for specific files
    powershell .agent/skills/design_guard/scripts/audit_design.ps1 <path-to-file>
    ```
4.  **Reporting**: If violations are found, fix them immediately. If correct, state "Design Audit Passed" in your task summary.

## Tool Utilization
- Use `grep_search` to find non-compliant patterns in the codebase.
- Use `view_file` on `design.html` if unsure about a specific layout choice.
