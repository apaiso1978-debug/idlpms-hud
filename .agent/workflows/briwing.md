---
description: Harvest pedagogical data from DLTV for curriculum integration
---

# DLTV Briwing Workflow (Data Harvesting Protocol)

This workflow extracts pedagogical data from DLTV (Distance Learning Television) to populate the IDLPMS curriculum database with real lesson content.

## Prerequisites
- Browser access to `dltv.ac.th`
- Target subject, grade level, and semester identified
- Access to `data.js` for data injection

## Workflow Steps

### Phase 1: Discovery (ค้นหาโครงสร้าง)
// turbo
1. Navigate to DLTV website: `https://dltv.ac.th`
2. Select target grade level (e.g., ป.6, ม.1)
3. Select target subject (e.g., ภาษาไทย, คณิตศาสตร์)
4. Extract the lesson list structure:
   - Unit names (หน่วยการเรียนรู้)
   - Lesson names within each unit
   - DLTV episode URLs (e.g., `/teachplan/episode/XXXXXX`)

### Phase 2: HLS Extraction (ดึงลิงก์วิดีโอ)
For each lesson:
// turbo
1. Open the lesson's DLTV page (e.g., `https://dltv.ac.th/teachplan/episode/100753`)
2. Inspect the video player element or network logs
3. Extract the HLS Master URL (typically ends with `/master.m3u8`)
4. Format: `https://dltv.ac.th/vod/upload/data/videos/XX/video_XXXXX-v-XXXXXXXX-XXXXXX.mp4/master.m3u8`

### Phase 3: Pedagogical Harvesting (ดึงข้อมูลวิชาการ)
For each lesson page, extract:

1. **Summary (สาระสำคัญ)**
   - Located in the "สาระสำคัญ" section
   - Clean the text, remove extra whitespace

2. **K-P-A Objectives (จุดประสงค์การเรียนรู้)**
   - Located in "จุดประสงค์การเรียนรู้" section
   - Extract as array of strings
   - Format: `["1. นักเรียนอธิบาย...", "2. นักเรียนวิเคราะห์...", "3. นักเรียนเห็นคุณค่า..."]`

3. **Evaluation (การวัดและประเมินผล)**
   - Located in "การวัดและประเมินผล" section
   - Extract as array of strings
   - Format: `["1. ประเมินผลการเข้าร่วมกิจกรรม", "2. ประเมินผลการตอบคำถาม"]`

### Phase 4: Data Injection (บันทึกเข้าระบบ)
// turbo
1. Open `assets/js/data.js`
2. Locate the target subject in `IDLPMS_DATA.curriculum`
3. For each lesson, add/update the following structure:

```javascript
{
    id: 'XX_LXX',
    name: 'ชื่อบทเรียน',
    dltvUrl: 'https://dltv.ac.th/teachplan/episode/XXXXXX',
    hlsUrl: 'https://dltv.ac.th/vod/.../master.m3u8', // Optional
    videoSource: 'HLS', // If HLS URL is available
    pedagogicalData: {
        summary: 'สาระสำคัญของบทเรียน...',
        objectives: [
            '1. จุดประสงค์ที่ 1 (Knowledge)',
            '2. จุดประสงค์ที่ 2 (Process)',
            '3. จุดประสงค์ที่ 3 (Attitude)'
        ],
        evaluation: [
            '1. วิธีการประเมินผลที่ 1',
            '2. วิธีการประเมินผลที่ 2'
        ]
    }
}
```

4. Verify JSON syntax is valid
5. Test the lesson in the Learning Flow UI

## Data Validation Checklist
- [ ] All 20 lessons have `pedagogicalData`
- [ ] Each lesson has `summary` (non-empty string)
- [ ] Each lesson has `objectives` (array of strings, typically 2-3 items)
- [ ] Each lesson has `evaluation` (array of strings, typically 2-3 items)
- [ ] `hlsUrl` is valid and accessible (optional but preferred)
- [ ] Subject's `totalLessons` matches actual lesson count

## Subject ID Reference
| Subject | ID | DLTV Channel |
|---------|-----|--------------|
| ภาษาไทย | THAI | DLTV1-6 |
| คณิตศาสตร์ | MATH | DLTV1-6 |
| วิทยาศาสตร์ | SCI | DLTV1-6 |
| สังคมศึกษา | SOC | DLTV1-6 |
| ประวัติศาสตร์ | HIST | DLTV1-6 |
| สุขศึกษาและพลศึกษา | PE | DLTV1-6 |
| ศิลปะ | ART | DLTV1-6 |
| การงานอาชีพ | WORK | DLTV1-6 |
| ภาษาอังกฤษ | ENG | DLTV1-6 |

## Progress Tracking
Update this section as subjects are completed:

### ป.6 (Primary 6)
| Subject | Semester 1 | Semester 2 |
|---------|-----------|-----------|
| THAI | ⬜ | ⬜ |
| MATH | ⬜ | ⬜ |
| SCI | ⬜ | ⬜ |
| SOC | ⬜ | ⬜ |
| HIST | ✅ Complete | ⬜ |
| PE | ⬜ | ⬜ |
| ART | ⬜ | ⬜ |
| WORK | ⬜ | ⬜ |
| ENG | ⬜ | ⬜ |

## Notes
- DLTV content is organized by grade level and subject
- Each subject typically has 4-5 units with 4-5 lessons each = 16-25 lessons total
- Some lessons may not have all pedagogical data available
- HLS URLs may change; DLTV page URLs are more stable
