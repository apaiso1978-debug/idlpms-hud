---
description: Deploy & Test — commit, push, verify Netlify + DB ทุกจุด
---

# Deploy

เมื่อ user พูดว่า "Deploy" ให้ทำตามลำดับนี้:

## 1. Commit & Push
// turbo
```powershell
git add -A
```
```powershell
git commit --no-verify -m "<สรุปสิ่งที่เปลี่ยน>"
```
```powershell
git push origin main
```

## 2. Post-Deploy Test (6 จุด)
อ่าน Skill `.agent/skills/post_deploy_test/SKILL.md` แล้วทำครบ 6 จุด:
- ① GitHub → Netlify Published
- ② หน้าเว็บโหลดได้
- ③ Login flow
- ④ JS ไม่มี error
- ⑤ DB อ่าน/เขียน
- ⑥ UI สมบูรณ์

## 3. Report
สรุปตาราง 6 จุด พร้อม screenshot ให้ user
