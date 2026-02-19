# Fix: Recreate student_fitness_records with STRING type columns
# (was uuid → causes error with IDLPMS string IDs like STU_M_069)

$BASE = "https://3tcdq2dd.ap-southeast.insforge.app"
$HEADERS = @{
    Authorization  = "Bearer ik_e9ac09dcf4f6732689dd5558fe889c0a"
    "Content-Type" = "application/json"
}

# Step 1: Delete old table
Write-Host "Deleting old table..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$BASE/api/database/tables/student_fitness_records" -Headers $HEADERS -Method DELETE
    Write-Host "[OK] Deleted student_fitness_records" -ForegroundColor Green
}
catch {
    Write-Host "[INFO] Delete: $($_.ErrorDetails.Message)" -ForegroundColor Gray
}

Start-Sleep -Seconds 1

# Step 2: Recreate with STRING types for person_id and school_id
Write-Host "Creating new table with string columns..." -ForegroundColor Yellow
$body = '{
    "tableName": "student_fitness_records",
    "columns": [
        {"columnName":"person_id","type":"string","isNullable":false,"isUnique":false},
        {"columnName":"school_id","type":"string","isNullable":false,"isUnique":false},
        {"columnName":"academic_year","type":"integer","isNullable":false,"isUnique":false},
        {"columnName":"semester","type":"integer","isNullable":true,"isUnique":false},
        {"columnName":"record_date","type":"string","isNullable":false,"isUnique":false},
        {"columnName":"class_id","type":"string","isNullable":true,"isUnique":false},
        {"columnName":"sit_reach_cm","type":"float","isNullable":true,"isUnique":false},
        {"columnName":"push_up_count","type":"integer","isNullable":true,"isUnique":false},
        {"columnName":"step_up_count","type":"integer","isNullable":true,"isUnique":false},
        {"columnName":"sit_reach_level","type":"string","isNullable":true,"isUnique":false},
        {"columnName":"push_up_level","type":"string","isNullable":true,"isUnique":false},
        {"columnName":"step_up_level","type":"string","isNullable":true,"isUnique":false},
        {"columnName":"overall_level","type":"string","isNullable":true,"isUnique":false},
        {"columnName":"recorded_by","type":"string","isNullable":true,"isUnique":false},
        {"columnName":"notes","type":"string","isNullable":true,"isUnique":false}
    ]
}'

try {
    Invoke-RestMethod -Uri "$BASE/api/database/tables" -Headers $HEADERS -Method POST -Body $body
    Write-Host "[OK] Created student_fitness_records (string IDs)" -ForegroundColor Green
}
catch {
    $err = $_.ErrorDetails.Message
    Write-Host "[FAIL] Create: $err" -ForegroundColor Red
}

# Verify
Write-Host ""
Write-Host "Verifying..." -ForegroundColor Yellow
$tables = Invoke-RestMethod -Uri "$BASE/api/database/tables" -Headers $HEADERS -Method GET
$found = $tables | Where-Object { $_ -like "*fitness*" }
if ($found) {
    Write-Host "[VERIFIED] student_fitness_records exists" -ForegroundColor Green
}
else {
    Write-Host "[WARNING] NOT found in table list" -ForegroundColor Red
}
