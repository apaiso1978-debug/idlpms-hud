---
name: Post-Deploy Full System Test
description: ทดสอบระบบครบทุกจุดหลัง Deploy — GitHub → Netlify → Database → UI Browsing — แสดงผลให้ user เห็นว่าทุกอย่างทำงานปกติ
---

# Post-Deploy Full System Test

ทดสอบ **6 จุด** บน **Netlify live URL เท่านั้น** (`https://idlpms.netlify.app`)
ห้ามใช้ localhost — ทุก browser_subagent ต้องเปิด URL ของ Netlify

## Credentials

> [!CAUTION]
> ห้ามใส่ API key หรือ password ตรงๆ ในไฟล์นี้

ดู credentials ที่ source files:
- **InsForge API:** `src/services/FitnessService.js` → `_baseUrl`, `_apiKey`
- **DB Schema scripts:** `scripts/push_fitness_schema.ps1` → `$BASE`, `$HEADERS`
- **Netlify:** login ผ่าน browser (ใช้ session ที่ login ไว้แล้ว)
- **GitHub:** ใช้ git credential ที่ตั้งค่าไว้ในเครื่อง

---

## ① GitHub → Netlify Pipeline

ตรวจว่า commit ขึ้น GitHub → Netlify auto-deploy สำเร็จ

**CLI:**
```powershell
git log -1 --oneline
git status -b --short
```

**Browser:** เปิด `https://app.netlify.com/` → เข้าโปรเจค → จับภาพ deploy status
- ต้องเป็น **Published**
- Commit hash ตรงกับ `git log`

---

## ② หน้าเว็บโหลดได้

ใช้ `read_url_content` ตรวจว่าไฟล์ที่ deploy มีอยู่จริง:

```
read_url_content → https://idlpms.netlify.app/pages/<page>.html
```

- ต้องได้ content กลับมา (ไม่ใช่ 404)
- title ตรงกับที่คาดหวัง

---

## ③ Login Flow

ใช้ `browser_subagent` เปิด Netlify site แล้วทดสอบ login:

```
1. Navigate to https://idlpms.netlify.app
2. Click quick-access login (Director / Teacher / Student — ตามที่เหมาะสม)
3. Take screenshot หลัง login
```

- ต้องเข้าถึง HUD dashboard ได้
- sidebar, header, menu ต้องแสดงถูกต้อง

---

## ④ JS ไม่มี Error

ทุกหน้าที่เปิด ให้ `capture_browser_console_logs`:

- ต้อง **ไม่มี JS error** (สีแดง)
- warning ยอมรับได้ แต่ error = fail

ถ้ามี error → แปลว่า script path ผิด หรือ dependency หาย

---

## ⑤ Database อ่าน/เขียน

### เขียน — กรอกข้อมูลจาก Netlify UI

```
1. เปิดหน้ากรอกข้อมูลบน Netlify
2. กรอกค่าทดสอบ (อะไรก็ได้)
3. รอ save → capture_browser_console_logs
4. ต้องเห็น cloud save success (ไม่มี error)
```

### อ่าน — Query InsForge API ยืนยัน

ดู API credentials จาก `src/services/FitnessService.js` แล้ว query:

```powershell
# อ่าน _baseUrl และ _apiKey จาก FitnessService.js แล้วใช้:
Invoke-RestMethod `
  -Uri "<baseUrl>/api/database/records/<TABLE>" `
  -Headers @{
    Authorization  = "Bearer <apiKey>"
    "Content-Type" = "application/json"
  } -Method GET | ConvertTo-Json -Depth 5
```

- record ใหม่ต้องปรากฏ
- field values ตรงกับที่กรอก

---

## ⑥ UI สมบูรณ์

ระหว่าง browse ทุกหน้า ให้ตรวจ:

- icon แสดงถูก (ไม่เป็นกล่องเปล่า)
- layout ไม่แตก
- ข้อมูลโหลดมาแสดงได้ (ตาราง, card, chart)
- scroll ได้ปกติ ไม่มีส่วนหาย

---

## Output

สรุปผลให้ user พร้อม screenshot:

| # | Check | Status |
|---|-------|--------|
| ① | GitHub → Netlify Published | ✅/❌ |
| ② | หน้าเว็บโหลดได้ | ✅/❌ |
| ③ | Login flow | ✅/❌ |
| ④ | JS ไม่มี error | ✅/❌ |
| ⑤ | DB อ่าน/เขียน | ✅/❌ |
| ⑥ | UI สมบูรณ์ | ✅/❌ |

> [!CAUTION]
> ทดสอบบน **Netlify live URL เท่านั้น** — ห้ามใช้ localhost
