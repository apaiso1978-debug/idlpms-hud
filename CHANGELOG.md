# IDLPMS Changelog

All notable changes to the IDLPMS (Integrated Digital Learning Platform Management System) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.1.0] - 2026-02-17

### 🎯 Delegated Authority (DMDP) & Student Registration Form

This release adds the Dynamic Mirroring & Delegation Protocol (DMDP) for authority delegation,
and a complete redesign of the Student Registration form aligned with the Person-First Architecture.

### Added

#### DMDP — Dynamic Mirroring & Delegation Protocol
-  **`getDelegations()` API** in `AbstractDataService` and `LocalDataService` (`src/services/DataService.js`)
   - Returns delegation records filtered by `delegatee_id` and `school_id`
   - Mock data supports both `TEA_M_01/SCH_MABLUD` and `TEA_001/SCH_001` user contexts
- **"DELEGATED AUTHORITY" sidebar group** (`assets/js/management.js`)
   - Dynamically rendered via `capabilityMap` when teacher has active delegations
   - Uses `DataServiceFactory.getInstance()` directly (fixes initialization timing)
   - Supports `ADMIN_STUDENT_MGMT` capability with link to `pages/student_input.html`

#### Student Profile Design Document
- **`docs/STUDENT_PROFILE_DESIGN_V01.md`** — Formal specification for student data model
  - Person-First Architecture (single `persons` table for all roles)
  - 8 tables: `persons`, `person_addresses`, `student_profiles`, `guardians`, `student_health_records`, `student_vaccines`, `student_ld_records`, `student_transfer_logs`
  - 3-priority guardian system (primary, secondary, emergency)
  - G-Code / Pending ID support for stateless children
  - Time-series health and LD tracking

### Changed

#### Student Registration Form — Complete Redesign
- **`pages/student_input.html`** — Rebuilt from scratch
  - **Layout**: Vertical sidebar stepper → horizontal step indicator (saves width in HUD iframe)
  - **5 Steps** aligned with database schema:
    1. Core Identity → `persons` table (19 fields: id_type, name TH/EN, nickname, birth, gender, nationality, ethnicity, religion, blood type, phone, Line ID, email)
    2. Geographic → `person_addresses` (registered + current with "same address" toggle, stay_type)
    3. Guardians → `guardians` (priority 1/2/3 with relationship, income, family status, siblings, emergency note)
    4. Enrollment → `student_profiles` (student_code, enrollment_date, status, type, grade ป.1-ม.6, classroom, previous school, scholarship)
    5. Health Baseline → `student_health_records` (weight, height, vision, chronic disease, drug/food allergies, disability, notes)
  - **Draft save** and **Final submit** buttons in header
- **`assets/css/student_input.css`** — Complete rewrite
  - **iframe-aware**: Removed standalone `max-w-[1600px]` and `p-6`, uses `box-sizing: border-box`
  - **Iron Rules compliant**:
    - Thai text: `16px` minimum (labels, radio groups, descriptions)
    - English text: `14px` (step labels, badges, buttons)
    - Font weight: `200` everywhere (no exceptions except `.hud-badge-micro`)
    - Letter-spacing: `0 !important` on all text elements
    - Input canvas: `var(--vs-bg-card)` background (Iron Rule #11)
    - Border radius: `var(--vs-radius)` (3px) everywhere
    - No drop shadows
  - **Responsive**: `@media` breakpoints at 900px and 600px for narrow iframes
  - **Horizontal step indicator**: `.step-tab`, `.step-num`, `.step-label` with active/complete states
  - **Grid system**: 12-column CSS Grid with `.vs-col-{2,3,4,6,8,12}`

### Fixed
- **DMDP timing bug**: `management.js` now uses `DataServiceFactory.getInstance()` instead of `window.app.data` which was not available during sidebar render
- **Iron Rules violations**: Thai labels previously at 14px, now 16px; removed `text-transform: uppercase` from Thai labels; removed stale `letter-spacing` values

---

## [2.0.0] - 2024-01-XX

### 🚀 Major Architecture Update - Offline-First & Modular Services

This release introduces a complete service layer architecture to support offline functionality, Google Apps Script integration, and improved code maintainability.

### Added

#### Core Services (`src/services/`)

- **DataService.js** - Abstract data access layer
  - `LocalDataService` - Implementation using static `data.js` for development/testing
  - `AppsScriptDataService` - Implementation for Google Apps Script with sharding support
  - `DataServiceFactory` - Singleton factory for service instantiation
  - Full async/await API for all data operations
  - Support for Users, Schools, ESA, Curriculum, Groups, and Statistics

- **CacheService.js** - IndexedDB wrapper for offline support
  - Persistent client-side caching with configurable TTL
  - Priority-based eviction (LRU algorithm)
  - Sync queue management for offline operations
  - Memory cache layer for performance
  - Category-based cache organization

- **SyncEngine.js** - Background sync mechanism
  - Automatic sync when connection restored
  - Conflict resolution strategies (Last-Write-Wins, Server-Wins, Manual)
  - Retry logic with exponential backoff
  - Event-driven status updates
  - Service Worker integration ready

- **AuthService.js** - Secure authentication service
  - Token-based authentication (JWT-ready for future backend)
  - Session management with localStorage
  - Role-based access control (RBAC)
  - Activity tracking and session extension
  - Lockout mechanism for failed login attempts

#### Progressive Web App (PWA)

- **manifest.json** - Complete PWA manifest
  - App icons configuration
  - Shortcuts for quick access
  - Share target support
  - Thai language support

- **sw.js** - Service Worker for offline support
  - Multiple caching strategies (Cache-First, Network-First, Stale-While-Revalidate)
  - Precaching of critical assets
  - Background sync support
  - Push notification ready
  - Offline fallback pages

#### Utilities (`src/utils/`)

- **validators.js** - Comprehensive validation functions
  - Thai-specific validators (Citizen ID, Phone, Postal Code)
  - Educational data validators (Grade, GPA, Education Level)
  - Form validation helpers
  - Permission validators

#### Testing (`tests/`)

- **DataService.test.js** - Unit test suite
  - LocalDataService tests (initialization, CRUD operations)
  - DataServiceFactory tests
  - Edge case coverage
  - Performance tests
  - Custom test runner (works without external dependencies)

#### Quality Assurance (`scripts/audit/`)

- **master-audit.ps1** - Consolidated audit script
  - Thai Typography Audit (Iron Rule #4)
  - Zinc Color Palette Audit (Iron Rule #2)
  - Design Standards Audit (All Iron Rules)
  - Unity & Consistency Audit
  - File Encoding Audit (UTF-8)
  - Placeholder Content Detection
  - Auto-fix capability
  - Markdown report generation

#### Documentation (`pages/manual/`)

- **offline.html** - Offline System & PWA documentation
  - Offline Priority Matrix (Critical, Important, Online-Only)
  - Caching strategies explanation
  - Sync Engine architecture
  - PWA installation guide

- **data-service.html** - DataService & API Layer documentation
  - Architecture overview
  - Design principles
  - Complete API reference
  - Usage examples
  - Mode switching guide

#### Project Configuration

- **package.json** - NPM configuration
  - Scripts for testing, auditing, linting, formatting
  - Development dependencies (vitest, eslint, prettier)
  - ESLint and Prettier configurations

- **.gitignore** - Version control ignore patterns
  - Node modules, build outputs, environment files
  - IDE settings, OS files, temporary files

### Changed

- **index.html** - Updated main application
  - Added PWA meta tags and manifest link
  - Added Service Worker registration
  - Loaded new service modules (DataService, CacheService, SyncEngine, AuthService)
  - Added manual menu items for new documentation (9. Offline & PWA, 10. DataService & API)

### Infrastructure

- Prepared for 3-phase development approach:
  1. **Phase 1 (Current)**: Local static data with `data.js`
  2. **Phase 2 (Next)**: Add necessary attributes and validation
  3. **Phase 3 (Future)**: Google Apps Script with ESA-based sharding

### Technical Notes

- All services use Singleton pattern for memory efficiency
- IndexedDB used for offline data persistence
- Background Sync API support for deferred operations
- Designed for 10M users with sharding strategy (Hybrid ESA-Based)
- Offline support prioritized for remote schools in Thailand

---

## [1.0.0] - Initial Release

### Features

- VS Code HUD-inspired interface design
- Multi-role identity system (7 roles: Student → MOE)
- Iron Rules design standards
- Curriculum explorer with subject color coding
- Mission Control for learning management
- Real-time chat system
- Subject HUD with Neural DNA metrics
- PowerShell audit scripts for quality control

### Design System

- Zinc Elevation System (850-baseline)
- Thai Typography Rules (minimum 14px)
- 48px Vertical Rule for headers
- 3px corner radius standard
- Zero italic, zero letter-spacing policies
- Subject Semantic Color Palette

---

## Migration Guide

### From 1.0.0 to 2.0.0

1. **Service Layer Integration**
   - Replace direct `IDLPMS_DATA` access with `DataServiceFactory.getInstance()`
   - All data operations are now async (use `await`)

   ```javascript
   // Before (1.0.0)
   const user = IDLPMS_DATA.users[userId];

   // After (2.0.0)
   const service = await DataServiceFactory.getInstance();
   const user = await service.getUser(userId);
   ```

2. **Offline Support**
   - No action required - PWA is automatically enabled
   - Service Worker handles caching transparently

3. **Audit Scripts**
   - Old scripts still work but recommend using unified `master-audit.ps1`
   
   ```powershell
   # Run all audits
   .\scripts\audit\master-audit.ps1 -Mode all

   # Run with auto-fix
   .\scripts\audit\master-audit.ps1 -Mode all -Fix
   ```

---

## Roadmap

### v2.1.0 (Planned)
- [ ] Complete AppsScriptDataService implementation
- [ ] Google Sheets integration templates
- [ ] Sharding router for ESA distribution

### v2.2.0 (Planned)
- [ ] Push notification support
- [ ] Real-time collaboration features
- [ ] Advanced conflict resolution UI

### v3.0.0 (Future)
- [ ] Full backend API integration
- [ ] Database migration tools
- [ ] Analytics dashboard

---

## Contributors

- IDLPMS Development Team
- Technical Auditor: Antigravity

---

*For more information, see the [System Manual](pages/manual/) in the application.*