-- ============================================================================
-- IDLPMS DELEGATION & MIRRORING SCHEMA v1.0
-- ============================================================================
-- Architecture: Dynamic Mirroring & Delegation Protocol (DMDP)
-- Description: Allows superiors to delegate administrative capabilities to subordinates.
-- ============================================================================

-- 1. DELEGATION REGISTRY
CREATE TABLE IF NOT EXISTS role_delegations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id       UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Actors
    delegator_id    UUID NOT NULL REFERENCES persons(id), -- The Director/Superior
    delegatee_id    UUID NOT NULL REFERENCES persons(id), -- The Teacher/Subordinate
    
    -- Capability
    capability_key  VARCHAR(50) NOT NULL, -- e.g., 'ADMIN_STUDENT_MGMT', 'ADMIN_SCHEDULE_MGMT'
    
    -- Metadata
    assignment_note TEXT,
    expiry_date     TIMESTAMPTZ,
    is_active       BOOLEAN DEFAULT true,
    
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure no duplicate delegations for the same capability
    UNIQUE(school_id, delegatee_id, capability_key)
);

-- 2. INDEXES
CREATE INDEX IF NOT EXISTS idx_delegations_active ON role_delegations(delegatee_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_delegations_school ON role_delegations(school_id);

-- 3. AUDIT LOG (Enhancement for Authoritative Tracking)
-- Tracks who did what on behalf of whom
CREATE TABLE IF NOT EXISTS authoritative_audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id        UUID NOT NULL REFERENCES persons(id),
    on_behalf_of    UUID REFERENCES persons(id), -- The original authority (delegator)
    
    action_type     VARCHAR(50) NOT NULL,
    entity_table    VARCHAR(50),
    entity_id       UUID,
    
    old_data        JSONB,
    new_data        JSONB,
    
    ip_address      INET,
    timestamp       TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS POLICIES (Preliminary Mirroring)
ALTER TABLE role_delegations ENABLE ROW LEVEL SECURITY;

-- Directors can manage delegations in their school
CREATE POLICY policy_director_manage_delegations ON role_delegations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM role_profiles 
            WHERE person_id = auth.uid() 
            AND school_id = role_delegations.school_id 
            AND role = 'SCHOOL_DIR'
        )
    );

-- Users can see their own received delegations
CREATE POLICY policy_user_view_own_delegations ON role_delegations
    FOR SELECT
    USING (delegatee_id = auth.uid());

-- COMMENT
COMMENT ON TABLE role_delegations IS 'Registry for Dynamic Mirroring & Delegation Protocol (DMDP)';
