# IDLPMS One-Click Deploy Script
# ==========================================
# สคริปต์สำหรับการอัปโหลดหน้าเว็บขึ้น Netlify อัตโนมัติ
# พร้อมระบบ Credential Guard ป้องกันค่าความลับรั่วไหล

$SITE_ID = "0df70491-f08d-4572-aefa-c1458e8fd7f2"
Write-Host "`n🚀 Starting Deployment to idlpms.netlify.app..." -ForegroundColor Cyan

# ==========================================
# 🛑 CREDENTIAL GUARD (IRON RULE ENFORCEMENT)
# ==========================================
Write-Host "🛡️ Running Credential Guard pre-check..." -ForegroundColor Gray
$TargetFile = "src/services/DataService.js"
$ForbiddenKeys = @("ik_e9ac09dcf4f6732689dd5558fe889c0a", "Yuri@04032526")

foreach ($key in $ForbiddenKeys) {
    if (Select-String -Path $TargetFile -Pattern $key -Quiet) {
        Write-Host "`n❌ CREDENTIAL LEAK DETECTED!" -ForegroundColor Red
        Write-Host "พบ Hardcoded API Key หรือ Password ของระบบ InsForge ในไฟล์ $TargetFile" -ForegroundColor Yellow
        Write-Host "กรุณาลบค่าความลับออก หรือเปลี่ยนไปใช้ window.LOCAL_SECRETS ก่อนทำการ Deploy" -ForegroundColor Yellow
        Write-Host "Deployment Aborted.`n" -ForegroundColor Red
        Read-Host "กด Enter เพื่อปิด..."
        exit 1
    }
}
Write-Host "✅ Credential Check Passed. No leaks found." -ForegroundColor Green

# ตรวจสอบสถานะการ Login
Write-Host "`nChecking Netlify Authentication status..." -ForegroundColor Gray
$status = npx netlify-cli status 2>&1
if ($status -match "Not logged in") {
    Write-Host "🔑 กรุณา Login ผ่านหน้าต่าง Browser ที่จะเปิดขึ้นมา..." -ForegroundColor Yellow
    npx netlify-cli login
}

# สั่ง Deploy โดยเจาะจง Site ID และโฟลเดอร์ปัจจุบัน
Write-Host "Uploading files to Netlify..." -ForegroundColor Cyan
npx netlify-cli deploy --dir=. --site $SITE_ID --prod --message "Update from Local HUD Script"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Deployment Successful!" -ForegroundColor Green
    Write-Host "🌍 Live at: https://idlpms.netlify.app" -ForegroundColor Cyan
    Write-Host "คุณสามารถปิดหน้าต่างนี้ได้เลยครับ`n"
}
else {
    Write-Host "`n❌ Deployment Failed. กรุณาตรวจสอบ Error ด้านบนครับ" -ForegroundColor Red
    Read-Host "กด Enter เพื่อปิด..."
}
