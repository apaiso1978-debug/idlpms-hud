---
name: System Security Guard
description: Iron Rules for preventing XSS, insecure local storage, and brute-force vulnerabilities across the E-OS platform.
---

# System Security Guard 🔒

## 🛑 THE IRON RULES OF SYSTEM SECURITY
This skill defines the mandatory security practices that **must** be followed by any AI agent modifying or creating features in the E-OS system.

### 1. 🚫 Zero Plaintext Credentials in Storage
**Rule:** NEVER store sensitive user data, API keys, or JWT tokens in `localStorage` or `sessionStorage` in plaintext.
**Why:** These web storage APIs are accessible via JavaScript and are highly vulnerable to Cross-Site Scripting (XSS) attacks.
**Action:** 
- If tokens are needed on the client, prefer HttpOnly/Secure cookies if a backend is available.
- If a backend is not available (e.g., purely client-side MVP), use JavaScript memory (variables) or consider IndexedDB with encryption (`crypto.subtle`) for larger datasets.
- **Never** write passwords to `localStorage`, even for mock data.

### 2. 🛡️ XSS Prevention (Strict DOM Injection)
**Rule:** ALWAYS sanitize user input before rendering it to the DOM.
**Why:** Directly injecting user-provided strings (like chat messages, names, or task descriptions) using `innerHTML` allows malicious scripts to run.
**Action:**
- Use `textContent` or `innerText` instead of `innerHTML` when displaying user input.
- If HTML formatting is required, use a proven sanitizer library (like DOMPurify) before injection.

### 3. 🛡️ Insecure Auth Fallback Prevention
**Rule:** NEVER deploy authentication mechanisms with hardcoded fallback passwords (e.g., `password123` or `1234`).
**Why:** This creates a massive vulnerability where any account that hasn't changed its password can be easily breached.
**Action:**
- If a default password is required for initial setup, the system **MUST** force a password change upon the very first login (Force Password Reset).
- Passwords must be hashed (e.g., bcrypt/argon2) on the server. The client must never compare plaintext passwords.

### 4. 🛡️ Rate Limiting & Brute Force Protection (Backend Requirement)
**Rule:** Client-side rate limiting (like `maxLoginAttempts` in JavaScript) is a UX feature, NOT a security measure.
**Why:** Attackers can bypass client-side limits by refreshing the page, using incognito mode, or interacting with the API directly.
**Action:**
- True lockout and rate-limiting logic must reside on the backend (e.g., InsForge edge functions or Node.js server).
- When developing frontend login logic, implement the UI for lockouts but document that the actual enforcement requires backend integration.

## 🔄 Security Audit Checklist (Pre-Deploy)
Before deploying any new module, verify:
- [ ] No `localStorage.setItem` calls contain sensitive user data or tokens.
- [ ] No `innerHTML` assignments use raw, unsanitized user input.
- [ ] No hardcoded bypass passwords exist in authentication logic.
