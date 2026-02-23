---
name: System Architecture Guard
description: Iron Rules for E-OS Database Schema, UI Fluidity, Notifications, and Sync Architecture. Read before designing new features.
---

# System Architecture Guard — The 4 Core Commandments

> [!CAUTION]
> **This SKILL.md is the AUTHORITATIVE source for System Architecture.**
> Read this ENTIRE document before designing new Data Schemas, APIs, UI Frames, or interacting with the Sync Engine.

---

## ⚡ Pre-Flight Checklist (MANDATORY before architectural decisions)

Before designing a new module or database table, verify:

- [ ] **Person-First Schema:** Is the root entity tied to `persons` (Citizen ID/Passport) rather than a temporary role (`students`, `teachers`)?
- [ ] **Edge-to-Edge Fluidity:** Does the page wrapper use `w-full` instead of `max-w-*`?
- [ ] **Smart Notify:** Are native `alert()` and `confirm()` functions banned? Is `showSmartNotify()` being used?
- [ ] **Offline-First Storage:** Is data being persisted to `LocalDataService` before attempting to `_callMaster` or relying on network state?

---

## 1. Database Commandment: "Person-First" Schema

The E-OS operates on a Lifelong Education model. Users change roles (Student -> Alumni -> Teacher -> Director), but their identity remains fixed.

### 🚫 BANNED PATTERN (Role-First)
Do NOT design fragmented root tables based on temporary status:
```sql
-- ❌ BANNED: Do not use separate tables as root identities
CREATE TABLE students ( id VARCHAR, name VARCHAR );
CREATE TABLE teachers ( id VARCHAR, name VARCHAR );
```

### ✅ APPROVED PATTERN (Person-First)
All primary data (DNA, Health, Work Passport) MUST attach to the `persons` table. Roles are merely relationship lookups.
```sql
-- ✅ APPROVED: The Person is the undeniable root
CREATE TABLE persons (
    id VARCHAR PRIMARY KEY, -- Person ID (e.g. PER_12345)
    citizen_id VARCHAR UNIQUE,
    full_name VARCHAR
);

-- ✅ Roles dictate current context, not lifelong identity
CREATE TABLE user_roles (
    person_id VARCHAR REFERENCES persons(id),
    role_type ENUM('STUDENT', 'TEACHER', 'PARENT'),
    school_id VARCHAR
);
```
**Implication for AI:** When seeding data or creating new schemas in `001_master_unity_schema.sql`, always anchor to the `persons` table.

---

## 2. Layout Commandment: Edge-to-Edge Fluidity

The E-OS HUD is a "Command Center," not a consumer magazine. It must maximize screen real-estate.

*   **Rule 21 (Fluidity):** NEVER use `max-w-7xl`, `max-w-[1200px]`, or `container` on functional pages (dashboards, tables, forms). Modules must scale to `w-full`.
*   **Rule 20 (Horizontal Unity):** The outermost padding for content MUST ALWAYS be `px-6` (24px). This aligns the content edges precisely with the Shell Breadcrumbs and Delegation Buttons regardless of screen width.
*   **Sunken Inputs:** Forms must use Level 1 depth. Use `class="form-input"` (or `bg-[var(--vs-bg-deep)] border-none`). Do not put visible borders on input fields.

---

## 3. Communication Commandment: Premium Smart Notify

The system maintains a high-fidelity aesthetic. Native browser dialogues break the immersion of the Instructional OS.

*   **BANNED:** `alert('Saved')`, `confirm('Are you sure?')`, `prompt()`.
*   **Likewise BANNED:** Generic SweetAlert or standard Toastify imports that conflict with `theme.css`.
*   **MANDATORY:** You must use the integrated `showSmartNotify(message, type)` function (usually found globally or in standard util files). 
    *   *Green/Blue Glow:* `showSmartNotify('บันทึกข้อมูลเรียบร้อย', 'success');`
    *   *Red Glow:* `showSmartNotify('เกิดข้อผิดพลาดในการซิงค์', 'error');`

---

## 4. State Commandment: Offline-First & Sync Engine

E-OS is designed for Thai rural schools with intermittent connectivity.

### 🚫 BANNED PATTERN (Synchronous API Calls)
Do NOT block the UI waiting for a remote database response.
```javascript
// ❌ BANNED: Waiting for remote server breaks Offline-First paradigm
async function saveGrade() {
    const response = await fetch('https://api.moe.go.th/save'); 
    if(response.ok) showSmartNotify('Saved'); 
}
```

### ✅ APPROVED PATTERN (Optimistic UI & SyncQueue)
1. Write to the Memory/Local Storage immediately (`LocalDataService.js`).
2. Update the UI instantly.
3. Queue the operation in `SyncEngine.js` to handle eventual consistency.

```javascript
// ✅ APPROVED: Fast local write, background sync
async function saveGrade(gradeData) {
    // 1. Instant Local Persistence
    await this.dataService.updateGradeLocally(gradeData); 
    
    // 2. Instant Feedback
    showSmartNotify('บันทึกข้อมูลแล้ว (รอการซิงค์)'); 
    
    // 3. Background Queue
    if(window.SyncEngine) {
        window.SyncEngine.queueOperation('UPDATE_GRADE', gradeData);
    }
}
```
**Implication for AI:** If a user asks you to "Add a new feature to save scores," you must integrate it through `LocalDataService` and the `SyncEngine` queue, never directly to an external REST endpoint.
