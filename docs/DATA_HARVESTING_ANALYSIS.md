# รายงานการวิเคราะห์: ระบบการเก็บข้อมูล (Data Harvesting) และการบูรณาการ 7 ขั้นตอนการเรียนรู้

## 1. กลไกการเก็บข้อมูล (Harvesting Mechanisms)

ระบบ IDLPMS HUD ใช้กลยุทธ์การเก็บข้อมูลแบบ **Multi-layer Harvesting** เพื่อประเมินผู้เรียนในมิติต่างๆ ดังนี้:

### A. ข้อมูลพฤติกรรม (Micro-behavioral Data)
*   **Anti-Guessing Engine:** ระบบติดตาม `answerHistory` และ `timeHistory` ของผู้เรียนในทุกข้อสอบ เพื่อตรวจจับรูปแบบการเดา (ก-ข-ค-ง หรือ การตอบข้อเดิมซ้ำๆ)
*   **Neural Drift Guard:** ติดตามการเปลี่ยนหน้าต่าง (Tab switching) ขณะเรียน เพื่อประเมินความจดจ่อ (Focus) และส่งผลโดยตรงต่อค่า `CHARACTERISTICS` ของผู้เรียน
*   **Engagement Timing:** บันทึกเวลาที่ใช้ในแต่ละขั้นตอน (`stepTimes`) และคำนวณเป็น **Engagement Score** โดยเทียบกับ "เวลาที่ควรจะเป็น" (Ideal Time)

### B. ข้อมูลผลสัมฤทธิ์ (Performance Data)
*   **Comparative Analysis:** เก็บข้อมูลคำตอบจาก **Pre-test** (Step 1) และ **Post-test** (Step 6) เพื่อคำนวณ "ค่าการพัฒนา" (Improvement Score)
*   **Interactive Success:** บันทึกความสำเร็จในการทำกิจกรรมใน Step 4 (SYNC) ซึ่งต้องผ่านเกณฑ์ 80% จึงจะผ่านขั้นตอนได้

### C. ข้อมูลพุทธิพิสัยระดับสูง (Cognitive Data)
*   **Written Responses:** เก็บข้อมูลการเขียนตอบในขั้นตอน REFLECT และ MASTER
*   **Mastery AI Auditor:** เป็นเครื่องมือ "เก็บเกี่ยว" ความคิดเชิงประจักษ์ โดยใช้ NLP (Natural Language Processing) มาประมวลผลคำตอบว่ามีความลึกซึ้ง (Depth) และเกี่ยวข้อง (Relevance) กับเนื้อหาหรือไม่

---

## 2. การประยุกต์ข้อมูลเข้าสู่ระบบ 7 ขั้นตอน (Mastery Integration)

ข้อมูลที่ "เก็บเกี่ยว" มาได้ จะถูกนำมาขับเคลื่อนวงจรการเรียนรู้ (Learning Cycle) ดังนี้:

1.  **Requirement Gating (การควบคุมการผ่านขั้นตอน):**
    *   ระบบใช้ข้อมูล `videoWatchedPercent` เพื่อปลดล็อกขั้นตอนถัดไป (ต้องดูอย่างน้อย 25% ในครั้งแรก)
    *   ใช้ข้อมูลเวลาในการดูจุดประสงค์ (LINK) ว่าใช้เวลาอ่านจริงหรือไม่ (ขั้นต่ำ 20 วินาที)

2.  **Adaptive Rewind (การย้อนบทเรียนอัตโนมัติ):**
    *   หากผู้เรียนทำ Post-test (Step 6) ไม่ผ่านเกณฑ์ 80% ระบบจะใช้โปรโตคอล **REWIND**
    *   ข้อมูลความล้มเหลวจะถูกนำมาปรับค่า `requiredWatchPercent` ให้สูงขึ้น (จาก 25% เป็น 50-80%) เพื่อบังคับให้ผู้เรียนกลับไปทบทวนวิดีโอให้ละเอียดกว่าเดิม

3.  **Neural DNA Matrix & 8 Characteristics:**
    *   ข้อมูลที่ได้จาก `Engagement Score` จะถูกนำไป Update **คุณลักษณะอันพึงประสงค์ 8 ประการ** (DISCIPLINE, LEARNING, COMMITMENT) ในแบบ Real-time
    *   ความสม่ำเสมอในการตอบและความจดจ่อจะส่งผลต่อ "DNA" ของผู้เรียนที่แสดงผลใน Dashboard

4.  **Mastery Certification:**
    *   เมื่อจบ Step 7 ระบบจะนำข้อมูลทั้งหมด (Pre-test, Post-test, AI Audit Score, Time Spent) มาประมวลผลเป็นระนาบความสำเร็จ (Gold/Silver/Bronze Mastery)

---

## 3. ระบบการบันทึกข้อมูล (Synchronized Persistence)

*   **Offline-First:** ข้อมูลที่เก็บเกี่ยวได้ทั้งหมดจะถูกเก็บไว้ใน `CacheService` (Local Storage/IndexedDB) ก่อน
*   **SyncEngine:** ทำหน้าที่คอยตรวจสอบสถานะออนไลน์ และทำการ "Flush" ข้อมูลที่เก็บไว้ไปยัง Backend (Google Apps Script) ผ่านระบบ **Batch Update** เพื่อความรวดเร็วและประหยัด Resource
*   **Data Integrity:** มีระบบตรวจจับความขัดแย้ง (Conflict Resolution) เพื่อให้มั่นใจว่าข้อมูลความก้าวหน้าของผู้เรียนจะถูกต้องที่สุดแม้จะใช้งานจากหลายอุปกรณ์

---
**สรุปเชิงเทคนิค:** ระบบไม่ได้เพียงแค่ "เก็บข้อมูล" แต่ใช้ข้อมูลเหล่านั้นในการ "ปรับจูน" (Adaptive) ประสบการณ์การเรียนรู้ให้เหมาะสมกับพฤติกรรมและความสามารถของผู้เรียนในขั้นตอนนั้นๆ ทันทีครับ
