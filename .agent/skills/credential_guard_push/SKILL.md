---
name: Credential Guard & Safe Push
description: Iron Rule for managing sensitive API keys and tokens during development. Prevents accidental Git commits of live credentials.
---

# Credential Guard & Safe Push 🛡️

## 🛑 THE IRON RULE OF DEPLOYMENT
**NEVER commit hardcoded API keys, JWT tokens, LINE tokens, or any production credentials directly into Git-tracked source code files.**

The user wants the AI to manage credentials continuously during the "Dev Phase" for convenience, but requires absolute security when pushing updates to GitHub.

## ✅ The "Dev Phase" Best Practice
Instead of hardcoding in `.js` files, implement the **Local Secrets Pattern**:

1. Store all live credentials in a dedicated, **untracked** file: `assets/js/secrets.local.js`
2. Ensure `secrets.local.js` is added to `.gitignore`.
3. Load the file in HTML templates conditionally or let it silently fail in production.
4. Access credentials via the global `window.LOCAL_SECRETS` object, falling back to empty strings for production.

Example `secrets.local.js` (DO NOT COMMIT):
```javascript
window.LOCAL_SECRETS = {
    INSFORGE_API_KEY: 'ik_...',
    LINE_CHANNEL_TOKEN: 'khx...',
    LINE_TARGET_ID: 'U2b...',
    NETLIFY_TOKEN: 'nfp_...'
};
```

## 🔄 The Pre-Push Audit
Whenever the user asks to "deploy", "commit", or "update GitHub":
1. **STOP.** Do not run `git commit -a` blindly.
2. Run `git diff` or review the files in the staging area.
3. Use `grep_search` to actively hunt for leaked tokens (e.g., search for `ik_`, `nfp_`, `Bearer`).
4. If a token is found hardcoded in a tracked file, **strip it out** and move it to `secrets.local.js` before proceeding with the commit.
