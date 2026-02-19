/**
 * gen_login_buttons.cjs — Generate the login.html teacher quick-select buttons  
 * with real teacher names matching data.js
 */
const fs = require('fs');
const path = require('path');

// Real teachers from data.js  [key, displayName, classLabel, borderColor]
const teachers = [
    // TEA_WORACHAI first (Developer/Admin — special purple styling)
    ['TEA_WORACHAI', 'ครูวรชัย', 'Dev/Admin', 'purple'],
    // Homeroom teachers
    ['TEA_M_01', 'ครูนิติพร', 'อ.2', 'emerald'],
    ['TEA_M_02', 'ครูสุภาภรณ์', 'อ.3', 'emerald'],
    ['TEA_M_03', 'ครูรัตนาวลี', 'ป.1/1', 'emerald'],
    ['TEA_M_04', 'ครูริศรา', 'ป.1/2', 'emerald'],
    ['TEA_M_05', 'ครูวาสนา', 'ป.2/1', 'emerald'],
    ['TEA_M_06', 'ครูพิมพร', 'ป.2/2', 'emerald'],
    ['TEA_M_07', 'ครูเจนจิรา', 'ป.3', 'emerald'],
    ['TEA_M_08', 'ครูสุนิษา', 'ป.3', 'teal'],
    ['TEA_M_09', 'ครูณัฐนนท์', 'ป.4/1', 'emerald'],
    ['TEA_M_10', 'ครูวิชุดา', 'ป.4/2', 'emerald'],
    ['TEA_M_11', 'ครูธิติพงศ์', 'ป.4/2', 'teal'],
    ['TEA_M_12', 'ครูภานุวัฒน์', 'ป.5/1', 'emerald'],
    ['TEA_M_13', 'ครูยุทธนา', 'ป.5/2', 'emerald'],
    ['TEA_M_14', 'ครูวุฒิไกร', 'ป.6/1', 'emerald'],
    ['TEA_M_15', 'ครูแพรวพรรณ', 'ป.6/2', 'emerald'],
];

let html = '';
for (const [key, name, label, color] of teachers) {
    html += `                <button onclick="quickSelect('${key}')"
                    class="vs-persona-card border-${color}-500/20 group hover:border-${color}-500/50 py-3">
                    <div class="vs-persona-icon-container border-${color}-500/10"><i
                            class="icon i-academic h-4 w-4 text-${color}-500/50 group-hover:text-${color}-500 transition-colors"></i>
                    </div>
                    <span
                        class="text-sm text-[var(--vs-text-muted)] group-hover:text-${color}-500 Thai-Rule font-extralight">${name}<br><span
                            class="opacity-50">${label}</span></span>
                </button>\n`;
}

fs.writeFileSync(path.join(__dirname, 'login_teacher_buttons.html'), html, 'utf-8');
console.log(`Generated ${teachers.length} teacher buttons`);
console.log(html.substring(0, 500));
