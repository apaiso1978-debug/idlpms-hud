---
description: Harvest pedagogical data from DLTV for curriculum integration
---

# DLTV Briwing Workflow (Data Harvesting Protocol)

This workflow extracts pedagogical data from DLTV (Distance Learning Television) to populate the E-OS curriculum database with rich, enriched lesson content following the 6-Phase harvest pipeline.

> [!IMPORTANT]
> Before starting, read the full skill: `.agent/skills/dltv_briw/SKILL.md`

## Prerequisites
- Browser access to `dltv.ac.th`
- Target subject, grade level, and semester identified
- `pdfjs-dist` installed (already in project)
- Access to InsForge API

---

## Workflow Steps

### Phase 1: Discovery & Metadata (ค้นหา + ดึง metadata)
// turbo
1. Navigate to DLTV: `https://dltv.ac.th/teachplan/lists/{grade}/{subjectCode}`
2. Use sidebar to select ปีการศึกษา, ชั้น, กลุ่มสาระ
3. For each lesson on the list page:
   - Note lesson name, unit number, episode URL
4. Click into each lesson episode page and extract:
   - **ตัวชี้วัด** (indicator badge)
   - **สาระสำคัญ/ความคิดรวบยอด** (summary)
   - **จุดประสงค์การเรียนรู้** (K, P, A objectives)
   - **การวัดผลและประเมินผล** (evaluation)
   - **HLS Video URL** (from video player source)
   - **PDF download URLs** (สื่อประกอบ, ใบงาน, ใบกิจกรรม, ใบความรู้)

### Phase 2: PDF Download & Text Extraction
// turbo
1. Download all PDFs using `read_url_content` (supports PDF)
2. Extract text with `pdfjs-dist` or read_url_content:
   ```
   node scripts/test_pdf_reader.cjs <path-to-pdf>
   ```
3. Check extraction quality:
   - If chars > 0 → text-based ✅ → parse content
   - If chars == 0 → image-based ❌ → mark for Phase 3 enrichment
4. Parse PDF content into `contentSections[]` with `source: 'PDF'`
5. Extract exercise questions from worksheets → `reflectExercises[]`

### Phase 3: Deep Enrichment (Web Search)
// turbo
1. Use `search_web` with Thai queries:
   - `"{topic} ป.{grade} สรุป"` → main enrichment
   - `"{topic} ตัวอย่าง ชีวิตจริง"` → real-world examples
2. Read top results with `read_url_content` if deeper content needed
3. Synthesize into `contentSections[]` (source: `'WEB'`)
4. Create `keywords[]` (5-10 important terms from all sources)
5. Ensure `contentSections` ≥ 3 sections, each ≥ 50 words

### Phase 4: Generate Quiz & Activities
1. **Quiz (5 questions)**:
   - Cover K (≥2), P (≥1), A (≥1)
   - 4 options each (ก ข ค ง)
   - Distractors from related keywords
2. **SYNC Activities** (use Activity Matcher from SKILL.md):
   - Check subject type → get priority activity list
   - Check KPA objectives → filter appropriate types
   - Generate 2-3 activities from keywords + contentSections
3. **REFLECT Exercises**:
   - Priority 1: from PDF worksheets
   - Priority 2: Cloze deletion from contentSections
4. **MASTER Challenge**:
   - MATH → Boss Challenge (5 hard questions)
   - SCI/SOC → Scenario (decision situation)
   - ART/THAI → Creative (create work)

### Phase 5: Prepare Client-Side AI Data
// turbo
1. Create `rubric{}`:
   - Required keywords for open-ended checking
   - Score per keyword match
   - Minimum passing score
2. Create `aiPromptTemplates{}`:
   - checkOpenEnded template
   - giveHint template
   - feedback template
3. Verify all keywords are relevant and specific

### Phase 6: Quality Gate & Save
1. Run Quality Gate checklist (all must pass):
   - [ ] `contentSections` ≥ 3 sections, each ≥ 50 words
   - [ ] `quiz[]` = 5 questions covering KPA
   - [ ] `syncActivities[]` ≥ 2 activities
   - [ ] `keywords[]` ≥ 5 terms
   - [ ] `rubric{}` has scoring criteria
   - [ ] `objectives` has K, P, A
   - [ ] `indicator` is not empty
   - [ ] `summary` is not empty
2. Save lesson pack to InsForge `lesson_packs` table
3. Log: `[✅ Unit X/N] {lessonName} — {sections} sections, {quiz} quiz`

---

## Subject Code Reference

| Subject | Code | DLTV Subject ID |
|---------|------|----------------|
| ภาษาไทย | THAI | 1000 |
| คณิตศาสตร์ | MATH | 2000 |
| วิทยาศาสตร์ | SCI | 34554345 |
| สังคมศึกษา | SOC | 4000 |
| ประวัติศาสตร์ | HIST | 5000 |
| ศิลปะ | ART | 6000 |
| สุขศึกษาฯ | PE | (check sidebar) |
| การงานอาชีพ | WORK | (check sidebar) |
| ภาษาอังกฤษ | ENG | (check sidebar) |

> [!WARNING]
> Subject IDs are non-sequential and may vary by grade. Always verify via sidebar dropdown.

---

## Auto-Loop Mode

When harvesting an entire subject/semester:
```
For each unit (1 to N, max 20):
  → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
  → Log progress
  → Continue to next unit
```

---

## Progress Tracking

### ป.3 (Primary 3) — Pilot Grade
| Subject | Semester 1 | Semester 2 |
|---------|-----------|-----------|
| MATH | 🔍 Probed | ⬜ |
| THAI | 🔍 Probed | ⬜ |
| SCI | 🔍 Probed | ⬜ |
| SOC | 🔍 Probed | ⬜ |
| ART | 🔍 Probed | ⬜ |
| HIST | ⬜ | ⬜ |
| PE | ⬜ | ⬜ |
| WORK | ⬜ | ⬜ |
| ENG | ⬜ | ⬜ |

### ป.6 (Primary 6) — Previous Work
| Subject | Semester 1 | Semester 2 |
|---------|-----------|-----------|
| HIST | ✅ Complete | ⬜ |
| (others) | ⬜ | ⬜ |

### Other Grades
| Grade | Status |
|-------|--------|
| อนุบาล 2-3 | ⬜ Not started (ปฐมวัย format) |
| ป.1 | ⬜ |
| ป.2 | ⬜ |
| ป.4 | ⬜ |
| ป.5 | ⬜ |
