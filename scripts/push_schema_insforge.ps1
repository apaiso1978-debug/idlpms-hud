# ============================================================================
# IDLPMS Schema Push to InsForge
# ============================================================================
# Executes all 3 migration files + design document tables
# InsForge API: POST /api/database/tables
# Auto-fields: id (UUID), created_at, updated_at
# ============================================================================

$BASE = "https://3tcdq2dd.ap-southeast.insforge.app"
$HEADERS = @{
    Authorization  = "Bearer ik_e9ac09dcf4f6732689dd5558fe889c0a"
    "Content-Type" = "application/json"
}

function New-Table {
    param([string]$Name, [string]$ColumnsJson)
    $body = "{`"tableName`":`"$Name`",`"columns`":$ColumnsJson}"
    try {
        $r = Invoke-RestMethod -Uri "$BASE/api/database/tables" -Headers $HEADERS -Method POST -Body $body
        Write-Host "[OK] $Name" -ForegroundColor Green
        return $true
    }
    catch {
        $err = $_.ErrorDetails.Message
        Write-Host "[FAIL] $Name => $err" -ForegroundColor Red
        return $false
    }
}

$results = @()

# ── Migration 001: Master Unity Schema ──────────────────────────────────

# 1. organizations
$results += New-Table "organizations" '[
    {"columnName":"parent_id","type":"uuid","isNullable":true,"isUnique":false},
    {"columnName":"org_type","type":"string","isNullable":false,"isUnique":false},
    {"columnName":"org_code","type":"string","isNullable":false,"isUnique":true},
    {"columnName":"name_th","type":"string","isNullable":false,"isUnique":false},
    {"columnName":"name_en","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"province","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"district","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"subdistrict","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"is_active","type":"string","isNullable":true,"isUnique":false}
]'

# 2. groups
$results += New-Table "groups" '[
    {"columnName":"org_id","type":"uuid","isNullable":false,"isUnique":false},
    {"columnName":"group_type","type":"string","isNullable":false,"isUnique":false},
    {"columnName":"name","type":"string","isNullable":false,"isUnique":false},
    {"columnName":"academic_year","type":"integer","isNullable":true,"isUnique":false},
    {"columnName":"is_active","type":"string","isNullable":true,"isUnique":false}
]'

# 3. persons
$results += New-Table "persons" '[
    {"columnName":"id_type","type":"string","isNullable":false,"isUnique":false},
    {"columnName":"id_number","type":"string","isNullable":true,"isUnique":true},
    {"columnName":"prefix_th","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"first_name_th","type":"string","isNullable":false,"isUnique":false},
    {"columnName":"last_name_th","type":"string","isNullable":false,"isUnique":false},
    {"columnName":"first_name_en","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"last_name_en","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"nickname","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"birth_date","type":"date","isNullable":true,"isUnique":false},
    {"columnName":"gender","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"nationality","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"ethnicity","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"religion","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"blood_type","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"phone","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"line_id","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"email","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"avatar_url","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"photo_official_url","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"is_active","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"created_by","type":"uuid","isNullable":true,"isUnique":false}
]'

# 4. role_profiles
$results += New-Table "role_profiles" '[
    {"columnName":"person_id","type":"uuid","isNullable":false,"isUnique":false},
    {"columnName":"role","type":"string","isNullable":false,"isUnique":false},
    {"columnName":"school_id","type":"uuid","isNullable":true,"isUnique":false},
    {"columnName":"esa_id","type":"uuid","isNullable":true,"isUnique":false},
    {"columnName":"group_id","type":"uuid","isNullable":true,"isUnique":false},
    {"columnName":"start_date","type":"date","isNullable":true,"isUnique":false},
    {"columnName":"end_date","type":"date","isNullable":true,"isUnique":false},
    {"columnName":"is_active","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"extended_data","type":"json","isNullable":true,"isUnique":false},
    {"columnName":"created_by","type":"uuid","isNullable":true,"isUnique":false}
]'

# 5. person_addresses
$results += New-Table "person_addresses" '[
    {"columnName":"person_id","type":"uuid","isNullable":false,"isUnique":false},
    {"columnName":"address_type","type":"string","isNullable":false,"isUnique":false},
    {"columnName":"house_number","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"village","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"moo","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"soi","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"road","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"subdistrict","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"district","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"province","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"postal_code","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"stay_type","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"is_primary","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"created_by","type":"uuid","isNullable":true,"isUnique":false}
]'

# 6. student_health_records
$results += New-Table "student_health_records" '[
    {"columnName":"person_id","type":"uuid","isNullable":false,"isUnique":false},
    {"columnName":"academic_year","type":"integer","isNullable":false,"isUnique":false},
    {"columnName":"semester","type":"integer","isNullable":true,"isUnique":false},
    {"columnName":"record_date","type":"date","isNullable":false,"isUnique":false},
    {"columnName":"weight_kg","type":"float","isNullable":true,"isUnique":false},
    {"columnName":"height_cm","type":"float","isNullable":true,"isUnique":false},
    {"columnName":"bmi","type":"float","isNullable":true,"isUnique":false},
    {"columnName":"bmi_status","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"vision_left","type":"float","isNullable":true,"isUnique":false},
    {"columnName":"vision_right","type":"float","isNullable":true,"isUnique":false},
    {"columnName":"vision_status","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"wears_glasses","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"hearing_status","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"dental_caries","type":"integer","isNullable":true,"isUnique":false},
    {"columnName":"dental_treatment","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"dental_status","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"blood_pressure","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"chronic_disease","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"drug_allergy","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"food_allergy","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"disability_type","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"notes","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"recorded_by","type":"uuid","isNullable":true,"isUnique":false}
]'

# ── Migration 002: Intelligence DNA Schema ──────────────────────────────

# 7. intelligence_snapshots
$results += New-Table "intelligence_snapshots" '[
    {"columnName":"person_id","type":"uuid","isNullable":false,"isUnique":false},
    {"columnName":"timestamp","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"axis_k","type":"float","isNullable":true,"isUnique":false},
    {"columnName":"axis_p","type":"float","isNullable":true,"isUnique":false},
    {"columnName":"axis_a","type":"float","isNullable":true,"isUnique":false},
    {"columnName":"axis_e","type":"float","isNullable":true,"isUnique":false},
    {"columnName":"axis_d","type":"float","isNullable":true,"isUnique":false},
    {"columnName":"source_type","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"source_id","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"description","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"created_by","type":"uuid","isNullable":true,"isUnique":false}
]'

# 8. person_credentials
$results += New-Table "person_credentials" '[
    {"columnName":"person_id","type":"uuid","isNullable":false,"isUnique":false},
    {"columnName":"credential_type","type":"string","isNullable":false,"isUnique":false},
    {"columnName":"credential_name","type":"string","isNullable":false,"isUnique":false},
    {"columnName":"issuer_name","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"issue_date","type":"date","isNullable":true,"isUnique":false},
    {"columnName":"expiry_date","type":"date","isNullable":true,"isUnique":false},
    {"columnName":"credential_url","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"metadata","type":"json","isNullable":true,"isUnique":false},
    {"columnName":"created_by","type":"uuid","isNullable":true,"isUnique":false}
]'

# ── Migration 003: Delegation Schema ────────────────────────────────────

# 9. role_delegations
$results += New-Table "role_delegations" '[
    {"columnName":"school_id","type":"uuid","isNullable":false,"isUnique":false},
    {"columnName":"delegator_id","type":"uuid","isNullable":false,"isUnique":false},
    {"columnName":"delegatee_id","type":"uuid","isNullable":false,"isUnique":false},
    {"columnName":"capability_key","type":"string","isNullable":false,"isUnique":false},
    {"columnName":"assignment_note","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"expiry_date","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"is_active","type":"string","isNullable":true,"isUnique":false}
]'

# 10. authoritative_audit_logs
$results += New-Table "authoritative_audit_logs" '[
    {"columnName":"actor_id","type":"uuid","isNullable":false,"isUnique":false},
    {"columnName":"on_behalf_of","type":"uuid","isNullable":true,"isUnique":false},
    {"columnName":"action_type","type":"string","isNullable":false,"isUnique":false},
    {"columnName":"entity_table","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"entity_id","type":"uuid","isNullable":true,"isUnique":false},
    {"columnName":"old_data","type":"json","isNullable":true,"isUnique":false},
    {"columnName":"new_data","type":"json","isNullable":true,"isUnique":false},
    {"columnName":"ip_address","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"timestamp","type":"string","isNullable":true,"isUnique":false}
]'

# ── Design Document v0.1: New Student Profile Tables ────────────────────

# 11. guardians
$results += New-Table "guardians" '[
    {"columnName":"person_id","type":"uuid","isNullable":false,"isUnique":false},
    {"columnName":"contact_priority","type":"integer","isNullable":true,"isUnique":false},
    {"columnName":"prefix_th","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"first_name_th","type":"string","isNullable":false,"isUnique":false},
    {"columnName":"last_name_th","type":"string","isNullable":false,"isUnique":false},
    {"columnName":"relationship","type":"string","isNullable":false,"isUnique":false},
    {"columnName":"phone","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"phone_alt","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"line_id","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"email","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"emergency_note","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"occupation","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"workplace","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"family_status","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"monthly_income","type":"float","isNullable":true,"isUnique":false},
    {"columnName":"income_range","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"siblings_count","type":"integer","isNullable":true,"isUnique":false}
]'

# 12. student_profiles
$results += New-Table "student_profiles" '[
    {"columnName":"person_id","type":"uuid","isNullable":false,"isUnique":true},
    {"columnName":"school_id","type":"uuid","isNullable":false,"isUnique":false},
    {"columnName":"student_code","type":"string","isNullable":false,"isUnique":true},
    {"columnName":"enrollment_date","type":"date","isNullable":false,"isUnique":false},
    {"columnName":"student_status","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"status_date","type":"date","isNullable":true,"isUnique":false},
    {"columnName":"previous_school","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"previous_school_province","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"student_type","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"scholarship_type","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"scholarship_source","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"scholarship_amount","type":"float","isNullable":true,"isUnique":false}
]'

# 13. student_vaccines
$results += New-Table "student_vaccines" '[
    {"columnName":"person_id","type":"uuid","isNullable":false,"isUnique":false},
    {"columnName":"vaccine_name","type":"string","isNullable":false,"isUnique":false},
    {"columnName":"dose_number","type":"integer","isNullable":true,"isUnique":false},
    {"columnName":"vaccinated_date","type":"date","isNullable":true,"isUnique":false},
    {"columnName":"vaccinated_at","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"next_dose_date","type":"date","isNullable":true,"isUnique":false}
]'

# 14. student_ld_records
$results += New-Table "student_ld_records" '[
    {"columnName":"person_id","type":"uuid","isNullable":false,"isUnique":false},
    {"columnName":"recorded_by","type":"uuid","isNullable":false,"isUnique":false},
    {"columnName":"academic_year","type":"integer","isNullable":false,"isUnique":false},
    {"columnName":"record_date","type":"date","isNullable":false,"isUnique":false},
    {"columnName":"ld_status","type":"string","isNullable":false,"isUnique":false},
    {"columnName":"ld_type","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"pseudo_cause","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"has_iep","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"referred_to","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"notes","type":"string","isNullable":true,"isUnique":false}
]'

# 15. student_transfer_logs
$results += New-Table "student_transfer_logs" '[
    {"columnName":"person_id","type":"uuid","isNullable":false,"isUnique":false},
    {"columnName":"transfer_type","type":"string","isNullable":false,"isUnique":false},
    {"columnName":"from_school_id","type":"uuid","isNullable":true,"isUnique":false},
    {"columnName":"from_school_name","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"from_group_id","type":"uuid","isNullable":true,"isUnique":false},
    {"columnName":"to_school_id","type":"uuid","isNullable":true,"isUnique":false},
    {"columnName":"to_school_name","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"to_group_id","type":"uuid","isNullable":true,"isUnique":false},
    {"columnName":"transfer_date","type":"date","isNullable":false,"isUnique":false},
    {"columnName":"reason","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"notes","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"recorded_by","type":"uuid","isNullable":true,"isUnique":false}
]'

# ── Summary ─────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
$ok = ($results | Where-Object { $_ -eq $true }).Count
$fail = ($results | Where-Object { $_ -eq $false }).Count
Write-Host "MIGRATION COMPLETE: $ok OK / $fail FAILED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Verify final table list
Write-Host ""
Write-Host "Verifying final table list..." -ForegroundColor Yellow
$tables = Invoke-RestMethod -Uri "$BASE/api/database/tables" -Headers $HEADERS -Method GET
Write-Host "Total tables on InsForge: $($tables.Count)" -ForegroundColor Yellow
$tables | ForEach-Object { Write-Host "  - $_" }
