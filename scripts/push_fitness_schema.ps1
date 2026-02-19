# ============================================================================
# IDLPMS — Push Fitness Schema to InsForge
# ============================================================================
# Creates student_fitness_records table
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

# ── student_fitness_records ──────────────────────────────────────────────
$result = New-Table "student_fitness_records" '[
    {"columnName":"person_id","type":"uuid","isNullable":false,"isUnique":false},
    {"columnName":"school_id","type":"uuid","isNullable":false,"isUnique":false},
    {"columnName":"academic_year","type":"integer","isNullable":false,"isUnique":false},
    {"columnName":"semester","type":"integer","isNullable":true,"isUnique":false},
    {"columnName":"record_date","type":"date","isNullable":false,"isUnique":false},
    {"columnName":"class_id","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"sit_reach_cm","type":"float","isNullable":true,"isUnique":false},
    {"columnName":"push_up_count","type":"integer","isNullable":true,"isUnique":false},
    {"columnName":"step_up_count","type":"integer","isNullable":true,"isUnique":false},
    {"columnName":"sit_reach_level","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"push_up_level","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"step_up_level","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"overall_level","type":"string","isNullable":true,"isUnique":false},
    {"columnName":"recorded_by","type":"uuid","isNullable":true,"isUnique":false},
    {"columnName":"notes","type":"string","isNullable":true,"isUnique":false}
]'

# ── Summary ──
Write-Host ""
if ($result) {
    Write-Host "=== SCHEMA PUSH COMPLETE ===" -ForegroundColor Green
}
else {
    Write-Host "=== SCHEMA PUSH FAILED ===" -ForegroundColor Red
}

# Verify
Write-Host ""
Write-Host "Verifying table list..." -ForegroundColor Yellow
$tables = Invoke-RestMethod -Uri "$BASE/api/database/tables" -Headers $HEADERS -Method GET
$found = $tables | Where-Object { $_ -like "*fitness*" }
if ($found) {
    Write-Host "[VERIFIED] student_fitness_records found in table list" -ForegroundColor Green
}
else {
    Write-Host "[WARNING] student_fitness_records NOT found" -ForegroundColor Yellow
    Write-Host "All tables:" -ForegroundColor Gray
    $tables | ForEach-Object { Write-Host "  - $_" }
}
