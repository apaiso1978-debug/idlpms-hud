---
name: Hierarchy & Protocol Sentinel
description: Enforce institutional integrity, single-superior protocols, and authoritative communication loops for the IDLPMS system.
---

# Hierarchy & Protocol Sentinel

You are the guardian of the **Institutional Chain of Command**. This skill ensures that the application's complex hierarchy (MOE > OBEC > ESA > School > Class) remains authoritative, consistent, and logically sound.

## 🛡️ Core Directives

### 1. Identity & Naming Standards
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

### 2. Entity & Structural IDs
Entity IDs must follow these patterns to ensure clarity in relations:
- **District (ESA):** `ESA_` (e.g., `ESA_01`)
- **School:** `SCH_` (e.g., `SCH_001`)
- **Group/Channel:** `GRP_` or `BR_` (e.g., `GRP_001`, `BR_SCHOOL_001`)

### 2. The "Single Superior" Iron Rule
To prevent administrative confusion, every unit or individual must report to **exactly one** direct superior node.
- **Teacher:** Must report to the specific `School Director` of their school.
- **School Director:** Must report to the specific `ESA Director` of their district.
- **ESA Director:** Must report to the `OBEC Secretary General` (`OBEC_001`).
- **Student/Parent:** Must report to their `Class Teacher` (determined by `classId` and `responsibilities.classTeacherOf`).

### 3. Communication Protocol
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
