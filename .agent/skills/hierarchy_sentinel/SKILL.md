---
name: Hierarchy & Protocol Sentinel
description: Enforce institutional integrity, single-superior protocols, and authoritative communication loops for the E-OS system.
---

# Hierarchy & Protocol Sentinel

You are the guardian of the **Institutional Chain of Command**. This skill ensures that the application's complex hierarchy (MOE > OBEC > ESA > School > Class) remains authoritative, consistent, and logically sound.

## 🛡️ Core Directives

### 1. The "Single Superior" Iron Rule (Delegation & Data Access)
To prevent administrative confusion, every unit or individual must report to **exactly one** direct superior node. This applies universally to Task Delegation, Chat, and Analytics Dashboards.

**The Strict Reporting Map:**
*   **Student:** Reports *only* to their specific `Class Teacher` (determined by `homeroomClass`).
*   **Teacher:** Reports *only* to the `School Director` of their school.
*   **School Director (1 per School):** Reports *only* to the `ESA Director` of their district.
*   **ESA Director:** Reports *only* to the central `Secretary General of OBEC` (สพฐ.).
*   **Secretary General (e.g. OBEC_001):** Reports *only* to the `Ministry of Education (MOE)` command node.

**The MOE Branching Structure (Top-Level):**
The MOE is the overarching umbrella. Beneath it, there are several equivalent parallel authorities. An ESA Director must map strictly to their respective national commission.
*   **OBEC (สพฐ.):** Office of the Basic Education Commission (General K-12)
*   **OVEC (สอศ.):** Office of the Vocational Education Commission (Vocational)
*   **OHEC (สกอ.):** Office of the Higher Education Commission (Universities)

**Systemic Implications:**
*   A Teacher cannot assign tasks to or view data of Students in other homerooms.
*   A School Director cannot assign tasks directly to Students; they must cascade through the Teacher.
*   There can only be **One** active School Director per `schoolId` node.
*   Cross-branch delegation (e.g., OVEC assigning tasks to an OBEC school) must be explicitly authorized via the MOE super-node.

### 2. Identity & Naming Standards
All User IDs in `data.js` must follow the strict role-based prefixing rule:
| Role | ID Prefix | Example |
| :--- | :--- | :--- |
| Minister | `MOE_` | `MOE_001` |
| Secretary Gen | `OBEC_` | `OBEC_001` |
| ESA Director | `ESA_DIR_` | `ESA_DIR_001` |
| School Director | `SCH_DIR_` | `SCH_DIR_001` |
| Teacher | `TEA_` | `TEA_001` |
| Student | `STU_` | `STU_001` |
| Parent | `PAR_` | `PAR_001` |

### 3. Entity & Structural IDs
Entity IDs must follow these patterns to ensure clarity in relations:
- **District (ESA):** `ESA_` (e.g., `ESA_01`)
- **School:** `SCH_` (e.g., `SCH_001`)
- **Group/Channel:** `GRP_` or `BR_` (e.g., `GRP_001`, `BR_SCHOOL_001`)

### 4. Communication Protocol
The `chat.js` filtering logic must reflect the following authoritative circles:
- **COMMAND AUTHORITY:** Upward link to the single direct superior.
- **DIRECT REPORTS:** Downward link to all immediate subordinates (e.g., Director seeing their Teachers).
- **PEER PERSONNEL:** Horizontal links to colleagues within the same unit (e.g., Teachers in the same School).
- **BROADCAST CHANNELS:** One-way command channels from superiors to their entire subordinate pool.

## 🛠️ Operational Checks

Before modifying `data.js` or `chat.js`, you MUST consider:
1.  Does the change introduce a "floating" user (no superior)?
2.  Does the change break the "1 Boss" rule by assigning a user to multiple jurisdictions?
3.  Are the ID prefixes consistent with the role type?

> [!IMPORTANT]
> When adding mass mock data (Batch Expansion), always use the `validate_hierarchy.ps1` tool to ensure structural integrity across thousands of rows.
