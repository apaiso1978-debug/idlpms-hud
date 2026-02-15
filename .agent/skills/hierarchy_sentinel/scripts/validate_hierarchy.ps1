# IDLPMS Hierarchy Validator
# This script scans data.js to ensure it adheres to the Hierarchy Sentinel rules.

$dataPath = Join-Path $PSScriptRoot "../../../../assets/js/data.js"
if (-not (Test-Path $dataPath)) {
    Write-Error "Could not find data.js at $dataPath"
    exit 1
}

$content = Get-Content $dataPath -Raw
Write-Host "--- IDLPMS Hierarchy Sentinel Audit ---" -ForegroundColor Cyan

# 1. Basic ID Prefix Check
Write-Host "[1/3] Auditing ID Prefixes..."
$ids = [regex]::Matches($content, "'([A-Z_]+[0-9]+)': {")
$invalidIds = @()
foreach ($m in $ids) {
    $id = $m.Groups[1].Value
    if ($id -match "^(STU|PAR|TEA|SCH_DIR|ESA_DIR|OBEC|MOE|ESA|SCH|GRP|BR)_") {
        # Valid
    }
    else {
        $invalidIds += $id
    }
}

if ($invalidIds.Count -gt 0) {
    Write-Host "WARNING: Found invalid ID prefixes: $($invalidIds -join ', ')" -ForegroundColor Yellow
}
else {
    Write-Host "OK: All ID prefixes are standard." -ForegroundColor Green
}

# 2. Structure Linkage Check (ESA -> School)
Write-Host "[2/3] Auditing Organizational Linkage..."
$missingDistricts = @()
$schools = [regex]::Matches($content, "'(SCH_[0-9]+)': { id: '.*?', name: '.*?', districtId: '(.*?)'")
foreach ($s in $schools) {
    $distId = $s.Groups[2].Value
    if ($content -notmatch "'$distId':") {
        $missingDistricts += "$($s.Groups[1].Value) -> $distId"
    }
}

if ($missingDistricts.Count -gt 0) {
    Write-Host "ERROR: Schools linked to non-existent Districts: $($missingDistricts -join ', ')" -ForegroundColor Red
}
else {
    Write-Host "OK: All School-to-District links are valid." -ForegroundColor Green
}

# 3. Role Consistency Check (Example: School Dir must have schoolId)
Write-Host "[3/3] Auditing Role-specific Requirements..."
$dirChecks = [regex]::Matches($content, "'(SCH_DIR_[0-9]+)': { role: 'SCHOOL_DIR'.*?schoolId: '(.*?)'")
$orphanedDirs = @()
foreach ($d in $dirChecks) {
    $schId = $d.Groups[2].Value
    if ($content -notmatch "'$schId':") {
        $orphanedDirs += "$($d.Groups[1].Value) -> $schId"
    }
}

if ($orphanedDirs.Count -gt 0) {
    Write-Host "WARNING: School Directors linked to non-existent Schools: $($orphanedDirs -join ', ')" -ForegroundColor Yellow
}
else {
    Write-Host "OK: All Director-to-School links are valid." -ForegroundColor Green
}

# 4. Multi-Superior Check (One Primary Boss per School)
Write-Host "[4/4] Auditing Single-Superior Integrity..."
$schoolMap = @{}
foreach ($d in $dirChecks) {
    $schId = $d.Groups[2].Value
    $dirId = $d.Groups[1].Value
    if ($schoolMap.ContainsKey($schId)) {
        $schoolMap[$schId] += ", $dirId"
    }
    else {
        $schoolMap[$schId] = $dirId
    }
}

$multiBoss = @()
foreach ($s in $schoolMap.Keys) {
    if ($schoolMap[$s] -match ",") {
        $multiBoss += "$s (Found: $($schoolMap[$s]))"
    }
}

if ($multiBoss.Count -gt 0) {
    Write-Host "WARNING: Multiple Directors found in single unit: $($multiBoss -join ' | ')" -ForegroundColor Yellow
}
else {
    Write-Host "OK: Single-Superior rule intact." -ForegroundColor Green
}

Write-Host "`nAudit Complete." -ForegroundColor Cyan
