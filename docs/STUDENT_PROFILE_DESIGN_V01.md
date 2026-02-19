# IDLPMS — Student Profile Design Document
## Version 0.1 (Prototype) | สำหรับ AI Agent อ่านต่อ

---

## 📌 หลักการออกแบบหลัก (Core Design Principles)

### Person-First Architecture
ระบบมองผู้ใช้เป็น **"บุคคล"** ก่อน Role เสมอ
- คนคนเดียวสามารถมีได้หลาย Role (นักเรียน → ครู → ผอ.)
- Role เปลี่ยนได้ผ่าน **Tab 5 (Setting)**
- ข้อมูลส่วนตัวและสุขภาพ **ติดตัวตลอดชีวิต ไม่หายไปเมื่อเปลี่ยน Role**
- Work Passport **สะสมตลอดชีวิต ไม่ reset**

### Unity across all Roles
ทุก Role ใช้โครงสร้าง **5 Tabs เหมือนกัน** — เนื้อหาใน Tab 2 เท่านั้นที่ต่างกันตาม Role

### Scale
ระบบรองรับผู้ใช้ **10 ล้านคนทั่วประเทศ** รวมเด็กไม่มีสัญชาติ (G-Code)

---

## 📋 โครงสร้าง 5 Tabs (ทุก Role)

| Tab | ชื่อ | ลักษณะ |
|-----|------|--------|
| **Tab 1** | ข้อมูลส่วนตัว | คงที่ ติดตัวตลอด |
| **Tab 2** | ข้อมูลเฉพาะบทบาท | เปลี่ยนเนื้อหาตาม Role ปัจจุบัน |
| **Tab 3** | สุขภาพ & พัฒนาการ | คงที่ ติดตัวตลอด (time series) |
| **Tab 4** | Work Passport | สะสมตลอดชีวิต ไม่ reset |
| **Tab 5** | Setting | รหัสผ่าน + การจัดการ Role |

---

## ✅ TAB 1 — ข้อมูลส่วนตัว (Schema จริง)

> **หมายเหตุ:** ใช้ UUID เป็น Primary Key ทุกตาราง | TIMESTAMPTZ สำหรับ timestamp ทั้งหมด

---

### 1.1 ตาราง `persons` — บุคคล (Core Table)

> ตารางกลางที่ทุก Role ใช้ร่วมกัน

```sql
CREATE TABLE persons (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_type             VARCHAR(20) NOT NULL
                            CHECK (id_type IN ('citizen_id', 'g_code', 'foreign_id', 'passport', 'pending')),
    id_number           VARCHAR(20) UNIQUE,
    prefix_th           VARCHAR(20),
    first_name_th       VARCHAR(100) NOT NULL,
    last_name_th        VARCHAR(100) NOT NULL,
    first_name_en       VARCHAR(100),
    last_name_en        VARCHAR(100),
    nickname            VARCHAR(50),
    birth_date          DATE NOT NULL,
    gender              VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    nationality         VARCHAR(50) DEFAULT 'ไทย',
    ethnicity           VARCHAR(50),
    religion            VARCHAR(50),
    blood_type          VARCHAR(5) CHECK (blood_type IN ('A', 'B', 'AB', 'O', 'unknown')),
    phone               VARCHAR(20),
    line_id             VARCHAR(100),
    email               VARCHAR(255),
    avatar_url          VARCHAR(500),
    photo_official_url  VARCHAR(500),
    is_active           BOOLEAN DEFAULT true,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_persons_id_number ON persons(id_number);
CREATE INDEX idx_persons_name ON persons(last_name_th, first_name_th);
```

---

### 1.2 ตาราง `person_addresses` — ที่อยู่

```sql
CREATE TABLE person_addresses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id           UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    address_type        VARCHAR(20) NOT NULL
                            CHECK (address_type IN ('registered', 'current')),
    house_number        VARCHAR(20),
    village             VARCHAR(100),
    moo                 VARCHAR(10),
    soi                 VARCHAR(100),
    road                VARCHAR(100),
    subdistrict         VARCHAR(100),
    district            VARCHAR(100),
    province            VARCHAR(100),
    postal_code         VARCHAR(10),
    stay_type           VARCHAR(30),
    is_primary          BOOLEAN DEFAULT false,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_person ON person_addresses(person_id);
```

---

### 1.3 ตาราง `student_profiles` — ข้อมูลเฉพาะนักเรียน

```sql
CREATE TABLE student_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id           UUID NOT NULL UNIQUE REFERENCES persons(id) ON DELETE CASCADE,
    school_id           UUID NOT NULL REFERENCES schools(id),
    student_code        VARCHAR(20) UNIQUE NOT NULL,
    enrollment_date     DATE NOT NULL,
    student_status      VARCHAR(30) DEFAULT 'active'
                            CHECK (student_status IN (
                                'active', 'transferred_in', 'transferred_out',
                                'graduated', 'dropped_out', 'deceased'
                            )),
    status_date         DATE,
    previous_school     VARCHAR(255),
    previous_school_province VARCHAR(100),
    student_type        VARCHAR(30) DEFAULT 'normal'
                            CHECK (student_type IN (
                                'normal', 'disabled', 'disadvantaged', 'underprivileged',
                                'stateless', 'ethnic_minority', 'child_labor', 'orphan'
                            )),
    scholarship_type    VARCHAR(100),
    scholarship_source  VARCHAR(100),
    scholarship_amount  DECIMAL(10,2),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 1.4 ตาราง `guardians` — ผู้ปกครองและผู้ติดต่อฉุกเฉิน

> รองรับ 3 ลำดับ: ผู้ปกครองหลัก → รอง → ผู้ติดต่อฉุกเฉิน

```sql
CREATE TABLE guardians (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id           UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    contact_priority    SMALLINT DEFAULT 1
                            CHECK (contact_priority IN (1, 2, 3)),
    prefix_th           VARCHAR(20),
    first_name_th       VARCHAR(100) NOT NULL,
    last_name_th        VARCHAR(100) NOT NULL,
    relationship        VARCHAR(50) NOT NULL,
    phone               VARCHAR(20),
    phone_alt           VARCHAR(20),
    line_id             VARCHAR(100),
    email               VARCHAR(255),
    emergency_note      VARCHAR(255),
    occupation          VARCHAR(100),
    workplace           VARCHAR(255),
    family_status       VARCHAR(30),
    monthly_income      DECIMAL(10,2),
    income_range        VARCHAR(20),
    siblings_count      SMALLINT DEFAULT 0,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_guardians_person ON guardians(person_id);
CREATE INDEX idx_guardians_priority ON guardians(person_id, contact_priority);
```

---

### 1.5 ตาราง `student_health_records` — ข้อมูลสุขภาพ (Time Series)

```sql
CREATE TABLE student_health_records (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id           UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    recorded_by         UUID REFERENCES persons(id),
    academic_year       INT NOT NULL,
    semester            SMALLINT CHECK (semester IN (1, 2)),
    record_date         DATE NOT NULL,
    weight_kg           DECIMAL(5,2),
    height_cm           DECIMAL(5,2),
    bmi                 DECIMAL(4,2),
    bmi_status          VARCHAR(20),
    vision_left         DECIMAL(4,2),
    vision_right        DECIMAL(4,2),
    vision_status       VARCHAR(20),
    wears_glasses       BOOLEAN DEFAULT false,
    hearing_status      VARCHAR(20) DEFAULT 'normal',
    dental_caries       SMALLINT DEFAULT 0,
    dental_treatment    BOOLEAN DEFAULT false,
    dental_status       VARCHAR(20),
    blood_pressure      VARCHAR(20),
    chronic_disease     TEXT,
    drug_allergy        TEXT,
    food_allergy        TEXT,
    disability_type     VARCHAR(100),
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_health_person_year ON student_health_records(person_id, academic_year);
```

---

### 1.6 ตาราง `student_vaccines` — ประวัติวัคซีน

```sql
CREATE TABLE student_vaccines (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id           UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    vaccine_name        VARCHAR(100) NOT NULL,
    dose_number         SMALLINT DEFAULT 1,
    vaccinated_date     DATE,
    vaccinated_at       VARCHAR(255),
    next_dose_date      DATE,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vaccines_person ON student_vaccines(person_id);
```

---

### 1.7 ตาราง `student_ld_records` — ข้อมูล LD (Time Series)

```sql
CREATE TABLE student_ld_records (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id           UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    recorded_by         UUID NOT NULL REFERENCES persons(id),
    academic_year       INT NOT NULL,
    record_date         DATE NOT NULL DEFAULT CURRENT_DATE,
    ld_status           VARCHAR(30) NOT NULL
                            CHECK (ld_status IN (
                                'observed', 'screening', 'referred',
                                'diagnosed_true', 'diagnosed_pseudo',
                                'has_plan', 'closed'
                            )),
    ld_type             VARCHAR(30),
    pseudo_cause        VARCHAR(100),
    has_iep             BOOLEAN DEFAULT false,
    referred_to         VARCHAR(255),
    notes               TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ld_person_year ON student_ld_records(person_id, academic_year);
```

---

### 1.8 ตาราง `student_transfer_logs` — ประวัติการย้าย

```sql
CREATE TABLE student_transfer_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id           UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    transfer_type       VARCHAR(20) NOT NULL
                            CHECK (transfer_type IN ('school_in', 'school_out', 'class_change')),
    from_school_id      UUID REFERENCES schools(id),
    from_school_name    VARCHAR(255),
    from_group_id       UUID REFERENCES groups(id),
    to_school_id        UUID REFERENCES schools(id),
    to_school_name      VARCHAR(255),
    to_group_id         UUID REFERENCES groups(id),
    transfer_date       DATE NOT NULL,
    reason              VARCHAR(255),
    notes               TEXT,
    recorded_by         UUID REFERENCES persons(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transfer_person ON student_transfer_logs(person_id, transfer_date DESC);
```

---

## 🗺️ TAB 2-5 Summary

| Tab | Status | Notes |
|-----|--------|-------|
| Tab 2 | Concept only | Content varies by Role |
| Tab 3 | Schema in Tab 1 | Shares `student_health_records` & `student_ld_records` |
| Tab 4 | Concept only | Work Passport — needs schema design |
| Tab 5 | Concept only | Settings, password, role management |

---

## 🔗 Relationships

```
persons (1)
    ├── person_addresses (many)
    ├── student_profiles (1)
    ├── guardians (many, priority 1/2/3)
    ├── student_health_records (many, time series)
    ├── student_vaccines (many)
    ├── student_ld_records (many, time series)
    └── student_transfer_logs (many)
```

---

## 📝 Agent Notes

1. **Person-First** — ทุก Role ผ่าน `persons` table
2. **G-Code / Pending** — `id_type = 'pending'`, `id_number` เป็น NULL ได้
3. **Time Series** — `student_health_records` / `student_ld_records` ห้าม upsert ทับ
4. **LD เทียม vs จริง** — ใช้ `ld_status` + `ld_type` แยก ห้าม merge เป็น boolean
5. **Contact Priority** — `guardians.contact_priority` (1/2/3) — priority 3 ไม่จำเป็นต้องเป็นผู้ปกครองตามกฎหมาย
6. **Line ID** — มีทั้งใน `persons` และ `guardians`
7. **Photos** — `avatar_url` = profile ปกติ / `photo_official_url` = ทางการ
8. **Transfer Logs** — ห้าม delete, เก็บ history ตลอด
9. **Backend** — InsForge (PostgreSQL-based)
10. **RLS** — ครูเห็นเฉพาะห้องตัวเอง, ผอ.เห็นทั้งโรงเรียน

---

*IDLPMS v2.0.0 | Design Document v0.1 | Prototype — อยู่ระหว่างพัฒนา*
