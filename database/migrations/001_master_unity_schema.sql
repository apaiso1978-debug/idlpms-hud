-- ============================================================================
-- IDLPMS MASTER UNITY SCHEMA MIGRATION v1.0
-- ============================================================================
-- Architecture: Person-First
-- Target: InsForge (PostgreSQL-based)
-- Description: Unified core for 10M users, roles, and hierarchy.
-- ============================================================================

-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ORGANIZATIONS (Hierarchy Level 4)
-- Standardizes MOE -> ESA -> SCHOOL relationship
CREATE TABLE IF NOT EXISTS organizations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id       UUID REFERENCES organizations(id),
    org_type        VARCHAR(20) NOT NULL CHECK (org_type IN ('MOE', 'ESA', 'SCHOOL')),
    org_code        VARCHAR(50) UNIQUE NOT NULL, -- e.g., SMIS, OBEC code
    name_th         VARCHAR(255) NOT NULL,
    name_en         VARCHAR(255),
    province        VARCHAR(100),
    district        VARCHAR(100), -- Amphoe
    subdistrict     VARCHAR(100), -- Tambon
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. GROUPS (Classes, Departments, Clubs)
CREATE TABLE IF NOT EXISTS groups (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    group_type      VARCHAR(30) NOT NULL CHECK (group_type IN ('CLASS', 'DEPARTMENT', 'CLUB', 'TEAM')),
    name            VARCHAR(100) NOT NULL, -- e.g., '6/1', 'Academic Affairs'
    academic_year   INT,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PERSONS (The Core Entity)
-- Unified identity for students, teachers, parents, and admins
CREATE TABLE IF NOT EXISTS persons (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identity
    id_type             VARCHAR(20) NOT NULL CHECK (id_type IN ('citizen_id', 'g_code', 'foreign_id', 'passport', 'pending')),
    id_number           VARCHAR(20) UNIQUE, -- Can be NULL if pending
    
    -- Names
    prefix_th           VARCHAR(20),
    first_name_th       VARCHAR(100) NOT NULL,
    last_name_th        VARCHAR(100) NOT NULL,
    first_name_en       VARCHAR(100),
    last_name_en        VARCHAR(100),
    nickname            VARCHAR(50),
    
    -- Personal Data
    birth_date          DATE,
    gender              VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    nationality         VARCHAR(50) DEFAULT 'ไทย',
    ethnicity           VARCHAR(50),
    religion            VARCHAR(50),
    blood_type          VARCHAR(5) CHECK (blood_type IN ('A', 'B', 'AB', 'O', 'unknown')),
    
    -- Contact
    phone               VARCHAR(20),
    line_id             VARCHAR(100),
    email               VARCHAR(255),
    avatar_url          TEXT,
    photo_official_url  TEXT,
    
    is_active           BOOLEAN DEFAULT true,
    created_by          UUID REFERENCES persons(id), -- Self-indexing or admin
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ROLE PROFILES (Capability Overlay)
-- One person can have multiple roles across different schools/ESAs
CREATE TABLE IF NOT EXISTS role_profiles (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id           UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    role                VARCHAR(30) NOT NULL CHECK (role IN ('STUDENT', 'TEACHER', 'SCHOOL_DIR', 'ESA_DIR', 'ESA_STAFF', 'OBEC_ADMIN', 'MOE_ADMIN', 'PARENT')),
    
    -- Context
    school_id           UUID REFERENCES organizations(id),
    esa_id              UUID REFERENCES organizations(id),
    group_id            UUID REFERENCES groups(id), -- Main group (e.g., Home Room)
    
    start_date          DATE DEFAULT CURRENT_DATE,
    end_date            DATE,
    is_active           BOOLEAN DEFAULT true,
    
    -- Flexible Role-Specific Data (The Tab 2 Source)
    extended_data       JSONB DEFAULT '{}'::jsonb,
    
    created_by          UUID REFERENCES persons(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PERSON ADDRESSES (Tab 1 Multi-Address)
CREATE TABLE IF NOT EXISTS person_addresses (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id           UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    address_type        VARCHAR(20) NOT NULL CHECK (address_type IN ('registered', 'current')),
    
    house_number        VARCHAR(20),
    moo                 VARCHAR(10),
    soi                 TEXT,
    road                TEXT,
    subdistrict         VARCHAR(100),
    district            VARCHAR(100),
    province            VARCHAR(100),
    postal_code         VARCHAR(10),
    
    is_primary          BOOLEAN DEFAULT false,
    created_by          UUID REFERENCES persons(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 6. STUDENT HEALTH RECORDS (Tab 3 Time Series)
CREATE TABLE IF NOT EXISTS student_health_records (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id           UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    academic_year       INT NOT NULL,
    semester            SMALLINT CHECK (semester IN (1, 2)),
    record_date         DATE NOT NULL DEFAULT CURRENT_DATE,
    
    weight_kg           DECIMAL(5,2),
    height_cm           DECIMAL(5,2),
    bmi                 DECIMAL(4,2),
    vision_status       JSONB, -- {left: val, right: val, status: "normal"}
    dental_status       JSONB,
    allergies           JSONB, -- {food: [], drugs: []}
    
    notes               TEXT,
    created_by          UUID NOT NULL REFERENCES persons(id),
    created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR 10M SCALE
CREATE INDEX IF NOT EXISTS idx_persons_id_number ON persons(id_number);
CREATE INDEX IF NOT EXISTS idx_persons_search_ids ON persons(last_name_th, first_name_th);
CREATE INDEX IF NOT EXISTS idx_role_profiles_composite ON role_profiles(person_id, school_id, role) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_org_hierarchy ON organizations(parent_id, org_type);
CREATE INDEX IF NOT EXISTS idx_health_history ON student_health_records(person_id, academic_year DESC);

-- B-TREE EXPRESSION INDEXES FOR JSONB SCALING (Unity Strategy v1.1)
-- Faster lookups for common role-specific fields without needing a full GIN index
CREATE INDEX IF NOT EXISTS idx_rp_student_gpa ON role_profiles ((extended_data->>'gpa')) WHERE role = 'STUDENT';
CREATE INDEX IF NOT EXISTS idx_rp_teacher_license ON role_profiles ((extended_data->>'license_number')) WHERE role = 'TEACHER';
CREATE INDEX IF NOT EXISTS idx_rp_student_ld_status ON role_profiles ((extended_data->>'ld_status')) WHERE role = 'STUDENT';

-- GIN INDEX FOR FLEXIBLE SEARCH
CREATE INDEX IF NOT EXISTS idx_rp_extended_search ON role_profiles USING GIN (extended_data);

-- COMMENT
COMMENT ON TABLE persons IS 'Core identity table - Person-First Architecture';
COMMENT ON COLUMN role_profiles.extended_data IS 'JSONB storage for role-specific Tab 2 content';
