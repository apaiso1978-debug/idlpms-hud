# กฎเหล็กแห่งความความกลมกลืน (The Iron Law of Unity) - IDLPMS

เพื่อให้ระบบมีมาตรฐานการออกแบบสูงสุด (Unity & Cohesion) และให้ความรู้สึกเหมือน "ซอฟต์แวร์ระดับอาชีพ" ไม่ใช่แค่เว็บไซต์ทั่วไป เราจะใช้ชุดกฏกลางดังนี้:

## 1. กฏแนวตั้ง 48px (The 48px Vertical Rule)
*   **Header ทุกจุด** (Main Stage, Sidebar Panel, Explorer Title) **ต้องมีส่วนประกอบสูง 48px เท่ากันทั้งหมด**
*   **Vertical Alignment:** ทุกอย่างใน Header ต้องอยู่กึ่งกลางแนวตั้ง (Flex Center)
*   **Unity Point:** เมื่อวาดเส้นขนานแนวนอน (Horizontal Line) จากซ้ายไปขวา เส้น Border-Bottom ของทุุก Header ต้องวิ่งตรงกันเป็นเส้นเดียว

## 2. ระบบสี Zinc Elevation (The Hierarchy Rule)
*   เราจะใช้ **หลักการลำดับชั้นความลึก 6 ระดับ (6-Level Elevation)** โดยมีจุดที่ลึกที่สุดเริ่มที่ `Zinc-850`:
    *   **Level 1 (Floor):** `Zinc-850` (#1c1c1f) - Activity Bar / **Workspace Canvas (Main Stage)**
    *   **Level 2:** `Zinc-800` (#27272a) - Sidebar / Side Panel / Hover states
    *   **Level 3:** `Zinc-750` (#333338) - Cards / Modules (Base Surface)
    *   **Level 4:** `Zinc-700` (#3f3f46) - Secondary Modules / Surface Highlight
    *   **Level 5:** `Zinc-600` (#52525b) - Secondary Highlights / Muted Sections
    *   **Level 6:** `Zinc-500` (#71717a) - Interactive Surfaces / Borders Highlight
*   **Borders:** ใช้ `Zinc-700` (`--vs-border`) หรือ `Zinc-600` สำหรับพื้นผิวที่สว่างกว่า
*   **Accents:** ใช้สี Cyan (#22d3ee) เฉพาะจุดที่เป็น Active หรือ Highlight สำคัญ

> [!CAUTION]
> **กฎเหล็กเรื่องความลึก (Depth Iron Rule):**
> ความลึกสูงสุดที่อนุญาตคือ `Zinc-850` **ห้ามใช้ Zinc-900 และ Zinc-950 โดยเด็ดขาด** (Total Dark Purge) เพื่อให้ UI ดูมีความสว่างและพรีเมียมตามมาตรฐานใหม่

## 3. นโยบาย Iconography ชัดเจน (Icon Consistency)
*   **100% Heroicons:** ใช้ Heroicons ผ่าน CSS Mask เท่านั้น
*   **0% Unicode/Emoji:** ห้ามใช้ตัวอักษรพิเศษหรือ Emoji แทนไอคอน
*   **Sizing:** 
    *   Activity Bar: 16px (h-4 w-4) — Compact, สอดคล้องกับ Sidebar Nav
    *   Sidebar Nav: 16px (h-4 w-4)
    *   Small Details: 12-14px
*   **Activity Bar Compact:** Width 36px, Item Height 36px

## 4. Typography & Linguistic Rules
*   **Font:** Sarabun — รองรับ Thai + Latin ใน font face เดียว เหมาะกับบริบทราชการไทย
*   **Weight Baseline:** `font-weight: 300` (Light) — เหตุผล: ที่ 200 (ExtraLight) ตัว Latin บางกว่า Thai มากเกินไปทางสายตา การใช้ 300 ทำให้ทั้งสอง script ดู visual weight ใล่เลี่ยกัน
*   **Linguistic Discipline (Mandatory):**
    *   **ทุกภาษา (Primary):** มาตรฐานเดียวที่ **13px** เท่านั้น (VS Code / Cursor standard — HUD dense)
    *   **ทุกภาษา (Secondary/Muted):** 13px เช่นกัน แต่ลดความสว่างเหลือ **45%** (`rgba(255,255,255,0.45)`)
*   **Line Height:** `1.4` (VS Code standard — tighter, code-editor-like)
*   **Hierarchy Standard:**
    *   **Hero / Page Titles:** 24px - 36px (`text-2xl` - `text-4xl`)
    *   **Panel Headers / Section Headers:** 13px
    *   **Primary/Secondary Body:** 13px
*   **Exception (Intentional):** `student_input.css` ใช้ 16px สำหรับ Thai body text — เพื่อ readability ของนักเรียน ป.1-6 เท่านั้น
*   **Corner Radius:** 3px (Razor-sharp) คงที่ทั่วทั้งระบบ

> [!IMPORTANT]
> **Typography Iron Law #1 (The 13px Standard):**
> *   **Primary Text:** ต้องเป็น **13px** 100% ทั่วทั้งระบบ HUD
> *   **font-weight:** ต้องเป็น **300** ทุกกรณี (ยกเว้น `.hud-badge-micro` ที่ใช้ 400)
> *   **line-height:** ต้องเป็น **1.4** ทุกกรณี
> *   **Submenu / Secondary:** 13px เช่นกัน แต่ opacity **45%**
> *   **Banned:** ห้ามใช้ขนาด 16px ในทุก context ยกเว้น `student_input.css` โดยเด็ดขาด

## 5. นโยบาย Zero Letter-Spacing (No Tracking)
*   **Iron Rule:** ห้ามใช้ `letter-spacing` หรือ Tailwind `tracking-*` ทุกกรณี
*   **Consistency:** ตัวอักษรต้องมีระยะห่างตามมาตรฐานของ Font (Sarabun) เท่านั้น เพื่อความสะอาดตาและคมชัดสูงสุด
*   **Enforcement:** ระบบ Audit จะทำการ Block ทุกไฟล์ที่มีการใช้คุณสมบัตินี้

## 6. ลำดับความสำคัญของแสง (Luminance Hierarchy)
*   **Brightest = Most Important:** ข้อความที่เป็นหัวข้อต้องสว่างที่สุด (Zinc 50/100)
*   **Dimmed = Secondary:** ข้อมูลประกอบต้องจางลง (Zinc 400/500)
*   **Shadowless Elevation:** ใช้ความต่างของความสว่างพื้นหลัง (Zinc 800 vs 900) แทนการใช้เงา

## 7. ระบบสีสาระการเรียนรู้ (Subject Semantic Palette)
*   สำหรับการเรียนรู้แบบอัตโนมัติ (Automated Learning) เราจะใช้ชุดสีตามกลุ่มสาระการเรียนรู้เพื่อสร้าง **Visual Anchor** ให้นักเรียน:
    *   **ภาษาไทย:** `--sj-thai` (#fb7185 - Rose) - รากวัฒนธรรมและการสื่อสาร
    *   **คณิตศาสตร์:** `--sj-math` (#fbbf24 - Amber) - พลังแห่งการคำนวณและความตื่นตัว
    *   **วิทยาศาสตร์:** `--sj-sci` (#22d3ee - Cyan) - เทคโนโลยีและการค้นพบ
    *   **สังคมศึกษา:** `--sj-soc` (#fb923c - Orange) - สังคมและมนุษยธรรม
    *   **ประวัติศาสตร์:** `--sj-hist` (#a1a1aa - Zinc-400) - อดีตและลำดับเหตุการณ์
    *   **สุขศึกษา/พละ:** `--sj-pe` (#f43f5e - Red) - พลังงานและสุขภาพ
    *   **ศิลปะ:** `--sj-art` (#d946ef - Fuchsia) - ความคิดสร้างสรรค์และการแสดงออก
    *   **การงานอาชีพ:** `--sj-work` (#34d399 - Emerald) - ทักษะการลงมือทำ
    *   **อังกฤษ/ต่างประเทศ:** `--sj-eng` (#818cf8 - Indigo) - การสื่อสารสากล
*   **Application Rule:** ห้ามใช้สีเหล่านี้เพื่อความสวยงามเพียงอย่างเดียว (Decorative Purge) ต้องใช้เพื่อระบุตัวตนของวิชาเสมอ โดยใช้ค่าความโปร่งแสง (**Opacity**) ที่ **20%** สำหรับพื้นหลัง และ **30-50%** สำหรับเส้นขอบ

## 8. สีเชิงสัญลักษณ์ (Semantic Color Integrity)
*   **Focus:** สีพื้นฐานระบบ (System Defaults)
*   **Cyan:** Action / Selection / **Science Interface**
*   **Emerald:** Success / Online / **Productivity Skills**
*   **Rose/Red:** Danger / Error / **Thai Literacy Context**
*   **Rule:** ห้ามใช้สีเหล่านี้ทับซ้อนกับความหมายของระบบสาระฯ หากไม่ได้ส่งผลต่อระบบแจ้งเตือน

## 9. การตอบสนองระดับไมโคร (Micro-interaction)
*   **Interactive Feedback:** ทุกจุดที่คลิกได้ต้องมีการเปลี่ยนแปลง (Hover/Active states)
*   **Consistent Cursor:** ใช้ `cursor-pointer` สำหรับองค์ประกอบที่โต้ตอบได้เท่านั้น

## 10. ระบบตาราง 4 พิกเซล (4-Pixel Grid System)
*   **Mathematical Unity:** ระยะห่าง (Padding/Margin) ทั้งหมดต้องหารด้วย 4 ลงตัว (4, 8, 12, 16, 24, 32, 48)

### 9.1 Spacing Scale (Approved Values Only)

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `sp-1` | 4px | `1` | Micro: label gaps, icon-text pairs |
| `sp-2` | 8px | `2` | XS: badges, compact lists |
| `sp-3` | 12px | `3` | SM: tight cards, small grids |
| `sp-4` | 16px | `4` | MD: standard cards, form fields |
| `sp-5` | 20px | `5` | MD+: feature cards, medium panels |
| `sp-6` | 24px | `6` | LG: section padding, major gaps |
| `sp-8` | 32px | `8` | XL: page chrome, hero sections |
| `sp-12` | 48px | `12` | 2XL: reserved for extreme breathing |

### 9.2 Page Body Padding (Iron Rule)

| Page Type | Required Class | Value |
|-----------|---------------|-------|
| **Functional pages** (schedule, config, dashboard, etc.) | `p-6` | 24px all sides |
| **Manual/Document pages** | `px-8 pt-8 pb-24` | 32px sides + top, 96px bottom scroll |
| **Chat interface** | No body padding | Uses flex column layout |

### 9.3 Context-Specific Usage Rules

| Context | Required Value | Tailwind Class |
|---------|---------------|---------------|
| Root container vertical rhythm | 24px | `space-y-6` |
| Section card (`.dna-zone`) internal padding | 24px | `p-6` |
| Form group spacing | 16px | `space-y-4` |
| Grid gap (major section grids) | 24px | `gap-6` |
| Grid gap (card grids) | 16px | `gap-4` |
| Grid gap (inline icon-text) | 8px | `gap-2` |
| Button padding | 24px × 10px | `px-6 py-2.5` |
| Input field padding | 12px × 8px | `px-3 py-2` |
| Inline items horizontal | 8-16px | `space-x-2` to `space-x-4` |

### 9.4 Banned Spacing Values

> [!CAUTION]
> The following values are **BANNED** and must never appear in new code:
> `p-7`, `p-9`, `p-10`, `p-11`, `gap-5`, `gap-7`, `gap-9`, `space-y-5`, `space-y-7`, `space-y-9`
> Any arbitrary pixel value like `p-[13px]`, `gap-[19px]`, or `m-[27px]`
> Mixing `space-x` and `gap` in the same flex container

## 11. CSS-First Policy (Clean Code Integrity)
*   **หลีกเลี่ยง Inline Styles:** ห้ามใช้ `style="..."` ยกเว้นกรณี Dynamic จริงๆ
*   **Maintainability:** การแก้ไขดีไซน์ต้องทำผ่าน CSS Class กลางใน `styles.css` เพื่อให้ส่งผลกระทบทั้งระบบ

## 12. นโยบาย Zero Italic (No Slant)
*   **Iron Rule:** ห้ามใช้ตัวเอียง (`italic`, `font-style: italic`) ทุกกรณี 100%
*   **Visual Sharpness:** ข้อความต้องตั้งตรงและคมชัด เพื่อรักษาความนิ่งและระดับของ UI ระดับโปร
*   **Enforcement:** ระบบ Audit จะทำการ Block ทุกไฟล์ที่มีการใช้ตัวเอียง

## 13. นโยบายความสม่ำเสมอของเส้น (Global Line Unity)
*   **Iron Rule:** ทุกเส้น (Borders, HR, Dividers) ต้องมีขนาด **1px** และใช้ค่าความโปร่งแสง (**Opacity**) ที่ **50%** เสมอ
*   **Color Standard:** ใช้ `Zinc-700` ผสมค่าความโปร่งแสงเช่น `border-zinc-700/50` หรือ `rgba(63, 63, 70, 0.5)`
*   **Consistency:** ห้ามใช้เส้นที่หนากว่า 1px หรือทึบแสง (Solid 100%) เพื่อให้ UI ดูเบา คมชัด และไม่หนาเตอะจนเกินไป

## 14. นโยบายมุมโค้ง 3px (Strict 3px Corners)
*   **Iron Rule:** ทุก Element (Cards, Buttons, Inputs, Panels) ต้องมีค่า **Border-Radius** เท่ากับ **3px** เท่านั้น
*   **Aesthetic:** เพื่อรักษาลุค "Razor-Sharp HUD" ที่ดูคมแต่ไม่แข็งกร้าวจนเกินไป
*   **Consistency:** ห้ามใช้ `rounded-lg`, `rounded-xl` หรือ `rounded-full` โดยเด็ดขาด
*   **Implementation:** ใช้ Utility class `rounded-[3px]` หรือตั้งค่าผ่าน CSS Variable `--vs-radius: 3px;`

## 15. นโยบาย Zero Phantom Class (Class Must Exist)
*   **Iron Rule:** ห้ามใช้ CSS Class ใน HTML ที่ไม่ได้ถูก **define** ไว้ใน CSS (`theme.css`, `styles.css`, `submenu.css` ฯลฯ) หรือไม่ใช่ Tailwind Utility Class
*   **เหตุผล:** เมื่อใช้ Class ที่ไม่มีอยู่จริง (Phantom Class) เบราว์เซอร์จะ **fallback เป็น default** — ซึ่งใน Dark Theme หมายความว่าจะเห็น **พื้นขาว, ขอบเทา, ฟอนต์ผิด** ทันที
*   **ก่อนใช้ Custom Class:** ตรวจสอบว่า Class นั้นมีอยู่ใน CSS จริง ถ้าไม่มีให้เลือก:
    1.  ใช้ Tailwind Utility แทน (เช่น `bg-[rgba(255,255,255,0.03)]`)
    2.  ใช้ Class ที่มีอยู่แล้ว (เช่น `vs-setup-input`, `vs-section-card`, `dna-zone`)
    3.  สร้าง Class ใหม่ใน CSS ก่อน แล้วค่อยใช้ใน HTML
*   **ตัวอย่างที่ผิด:** `class="setup-input"` (ไม่มี define ใน CSS ใดๆ → fallback ขาว)
*   **ตัวอย่างที่ถูก:** `class="vs-setup-input"` (define อยู่ใน `theme.css`)

## 16. นโยบาย Native Control Override (No Browser Defaults)
*   **Iron Rule:** ทุก Native Form Control (`<input>`, `<select>`, `<textarea>`, `<button>`) ต้องถูก **override styling** ให้ตรงกับ Dark Theme เสมอ ห้ามปล่อยให้เบราว์เซอร์แสดง Default สีขาว
*   **Nuanced Reset (Safety Net):**
    *   **Inputs & Fields:** ต้องใช้รูปแบบ **"Sunken Inset"** — พื้นหลัง `background: var(--vs-bg-deep)` (Canvas Floor) เพื่อให้ Input **บุ๋มลึก** กว่าพื้นผิว Panel ที่อยู่รอบข้าง ห้ามใช้ `rgba(255,255,255,0.03)` เดี่ยวๆ โดยไม่มีบริบท
    *   **Buttons:** ต้อง Reset เป็น `background: transparent` และ `border: none` เพื่อรักษาดีไซน์เมนู/รายการที่สะอาดตา (ห้ามใส่กรอบ Default ให้ปุ่มทั่วไป)
*   **Number Input:** ต้องซ่อน spinner buttons ด้วย `-webkit-appearance: none` (ใช้ class `vs-setup-input` ที่มี override ไว้แล้ว)
*   **Select Dropdown:** ต้อง style arrow indicator ให้เป็นสีที่เข้ากับ Dark Theme
*   **Checkbox / Radio:** ต้องใช้ Custom Styling หรือ Tailwind Forms Plugin — ห้ามใช้ Default Browser
*   **Required Properties สำหรับ Inputs (Sunken Inset Rule):**
    *   `background: var(--vs-bg-deep)` — **Canvas Floor** ทำให้ Input บุ๋มลงจาก Panel (Iron Rule)
    *   `border: none` — ไม่มีขอบ (ใช้ depth contrast แทน)
    *   `color: var(--vs-text-body)` — ตัวอักษรอ่านได้
    *   `border-radius: var(--vs-radius)` — มุมโค้ง 3px
    *   `padding: 8px 12px` (`py-2 px-3`) — ตาม §9.3 Input Field Padding
    *   `min-height: 36px` — ป้องกัน input บีบอัด
    *   `outline: none` — ไม่มี outline default
    *   `font-size: 13px; font-weight: 300` — ตาม §4 Typography

---
> [!IMPORTANT]
> กฏเหล่านี้คือกฏที่ห้ามละเมิด (Iron Rules) เพื่อรักษาความรู้สึกพรีเมียมของระบบ IDLPMS
## 17. HUD Content Layout (Smart Ceiling)
*   **Documentation & Content:** ใช้ `max-w-[1600px]` เพื่อจำกัดระยะสายตา (Readability) ในหน้าจอขนาดใหญ่
*   **Alignment:** จัดวางชิดซ้าย (Left Aligned) เสมอ เพื่อรักษา Unity กับ Sidebar (ห้ามใช้ `mx-auto` ในหน้าที่มี Sidebar)
*   **Dashboard:** ปล่อย Full Fluid (100% Width) เพื่อข้อมูลที่หนาแน่น

## 18. DNA Radar HUD (Unity 6 Standard)
*กฎการออกแบบกราฟ "ใยแมงมุม" สำหรับการแสดงผล Intelligence DNA ทุก Role*

### 15.1 Structural Elements
*   **Grid Lines (`.dna-grid-line`):** เส้นหกเหลี่ยมซ้อนกัน 5 ชั้น ใช้ `stroke-dasharray: 4 2` สี Zinc-400/25%
*   **Radial Axes (`.dna-axis`):** 3 เส้นเต็มความยาว (K↔F, P↔L, A↔M) ผ่าศูนย์กลาง สี Zinc-400/40% Opacity 30%
*   **Data Polygon (`.dna-data-polygon`):** พื้นที่ข้อมูล Fill Accent/15% Stroke Accent/100%

### 15.2 Label System
*   **Label Badges (`.dna-label-badge`):** วงกลมสี Panel พร้อมขอบ Zinc-500/40%
*   **Label Text (`.dna-label-text`):** 14px Sarabun Weight 300 สี Title (#fafafa)
*   **Abbreviations (Iron Rule):** ใช้ตัวย่ออักษรเดียวเสมอ (K, P, A, F, L, M)

### 15.3 Animation & Interaction
*   **Focus Points (`.dna-focus-point`):** จุดข้อมูลขนาด r=3.5 พร้อม Transition 0.3s
*   **Data Transition:** Data Polygon ใช้ Transition 0.5s ease-out

> [!IMPORTANT]
> **Unity Core Mandate:** ทุก Role (Student, Teacher, Admin, Parent) ต้องใช้โครงสร้าง 6 แกนเดียวกันเพื่อความเป็นหนึ่งเดียวของระบบ

## 19. Unified DNA Layout Architecture (Phase 1)
*กฎการจัดวาง DNA Zone ในตำแหน่งเดียวกันสำหรับทุก Role*

### 16.1 DNA Zone Container (`.dna-zone`)
*   **Position:** Relative within parent, Top-Right alignment
*   **Dimensions:** max-width 320px, min-height 280px
*   **Responsive:** ปรับ max-width เป็น 280px ที่ 1280px, 100% ที่ 1024px

### 16.2 Role-Specific Visualizations
| Role | Visualization | Class |
|------|---------------|-------|
| Student | Spider Chart | `.dna-spider` |
| Parent | Spider Chart (Child) | `.dna-spider` |
| Teacher (Individual) | Spider Chart | `.dna-spider` |
| Teacher (Class) | Heatmap Grid | `.dna-heatmap` |
| Admin | Aggregated Bar Chart | `.dna-bar-chart` |
| ESA Director | District Line Chart | `.dna-line-chart` |

### 16.3 Role Badges
*   **Student:** `.role-badge-student` (Cyan)
*   **Teacher:** `.role-badge-teacher` (Emerald)
*   **Admin:** `.role-badge-admin` (Amber)
*   **Parent:** `.role-badge-parent` (Purple)
*   **Director:** `.role-badge-director` (Rose)

### 16.4 View Toggle (Teacher Only)
*   `.view-toggle` container with `.view-toggle-btn` buttons
*   Toggle between "Individual" (Spider) and "Class" (Heatmap) views
