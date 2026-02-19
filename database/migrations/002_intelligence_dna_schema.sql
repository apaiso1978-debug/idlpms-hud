-- Phase 4: Intelligence DNA & Work Passport (Tab 4)
-- Version: 1.2 (Extension to Master Unity Schema)

-- 1. INTELLIGENCE SNAPSHOTS (KPAED Model)
-- Time-series data for learning traces across 5-Axis
CREATE TABLE IF NOT EXISTS intelligence_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- KPAED 5-Axis (0.0 to 100.0)
    axis_k NUMERIC(5,2) DEFAULT 0, -- Knowledge
    axis_p NUMERIC(5,2) DEFAULT 0, -- Process
    axis_a NUMERIC(5,2) DEFAULT 0, -- Attitude
    axis_e NUMERIC(5,2) DEFAULT 0, -- Effort
    axis_d NUMERIC(5,2) DEFAULT 0, -- Discipline
    
    source_type VARCHAR(50), -- 'quiz', 'activity', 'attendance'
    source_id VARCHAR(100), -- Reference to actual activity/quiz ID
    description TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID -- Reference to persons(id) for audit
);

-- 2. PERSON CREDENTIALS (Lifelong Work Passport)
-- Certificates, degrees, and micro-credentials
CREATE TABLE IF NOT EXISTS person_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
    
    credential_type VARCHAR(50) NOT NULL, -- 'certificate', 'degree', 'license'
    credential_name VARCHAR(255) NOT NULL,
    issuer_name VARCHAR(255),
    
    issue_date DATE,
    expiry_date DATE,
    credential_url TEXT,
    
    metadata JSONB DEFAULT '{}', -- Scaleable attributes (e.g., score, level)
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- SCALING INDEXES
CREATE INDEX IF NOT EXISTS idx_intel_person_time ON intelligence_snapshots(person_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_credentials_person ON person_credentials(person_id);
CREATE INDEX IF NOT EXISTS idx_intel_source ON intelligence_snapshots(source_type, source_id);

-- COMMENTS
COMMENT ON TABLE intelligence_snapshots IS 'Time-series KPAED DNA data for individual students/persons';
COMMENT ON TABLE person_credentials IS 'Lifelong learning records and certifications mapping to the Person-First identity';
