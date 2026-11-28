# Phase 3: Excellence, Validation and Exam Readiness — implementation checklist

Persistent tracker for the multi-session Phase 3 request. Status: [ ] open, [~] in progress, [x] done.
Order follows risk: user-data safety and technical correctness first, then exam fidelity and coverage, then new training features, then polish and documentation.

## Baseline (recounted from index.html on 2026-11-28, not taken from the README)
- CySA+ multiple choice: 2,111 total = 828 rewritten pool + 414 new-exam/extra + 869 supplemental (not objective-tagged); 1,242 objective-tagged; 57 multi-select.
- CySA+ PBQs: 120 (evidence 28, terminal 21, config 20, match 18, order 13, cli 10, build 5, zones 5).
- CySA+ fixed exams: 15 (1-10 original, 11-13 Standard, 14-15 Advanced; 11-15 reserved until taken).
- Analyst Training: 48 drills / 119 questions. Investigations: 12 cases / 72 stages. Recognition: 213 items.
- Commands & Queries: 17 lessons / 60 questions. Acronyms: 374. Objective study notes: 15. Terminal labs (all tracks): 32.
- Checkpoint: index_backup_2026-11-28_before-phase3-excellence.html

## Priority 1 — safety and correctness
- [x] P14 App security: backup import validation (schema, size, key allow-list, no code execution), XSS review of user-data rendering, corrupted storage recovery, tests
  - Fixed: unescaped note ids in attributes (3 places); unvalidated restore; startup crash on non-list activity log; crashes on wrong-shaped saved data (now quarantined). `tests/app-security.test.js`, 37 checks. Open: no CSP, because the app uses inline scripts (documented).
- [x] P1 Technical accuracy: automated cross-checks (Windows/Sysmon Event IDs, ports, CVSS ranges/metrics, IR phase names, ATT&CK tactic names, tool facts) across MC, PBQs, drills, cases, recognition, lessons, acronyms, notes; fix findings; classification log
  - Done: see ACCURACY_AUDIT.md. Fixed A1 (Defender Event IDs were wrong in a note), A2, A3 (PsExec ATT&CK mapping), A4 (ambiguous IoC item) and A5 (NT history). Open: a tool-syntax pass on Commands & Queries.
- [x] P1 Manual review sample with classification (Correct / Poorly worded / Ambiguous / Outdated / Incorrect / Out of scope / Advanced-only); add source references to nuanced explanations
  - Done: 60-item stratified sample. 46 Correct, 9 Advanced-only, 2 Poorly worded, 1 Ambiguous, 1 Incorrect, 1 Out of scope. Core pool: 32 of 35 correct as written.
- [x] P4 Exam fidelity: verify 85 max questions / 165 min / domain weights from the official objectives; Advanced exams excluded from standard readiness; document that PBQ count per exam is not published
  - Done: 85/165/weights match. Advanced exams 14-15 are now excluded from the readiness estimate and reported separately (with a test). Disclaimers already state that the scoring conversion and PBQ weights are not published. Exam Mode now notes that the real PBQ count is not published.

## Priority 2 — coverage and assessment
- [x] P2 Subobjective matrix: every CS0-004 bullet x (MC, scenario MC, notes, flashcards, recognition, PBQ, investigation) with Missing/Insufficient/Adequate/Strong
- [x] P2 Coverage explorer UI (objective -> subtopic -> resources)
- [x] P2 Fill meaningful gaps (1.1, 1.5, 1.6, 2.4, 3.1 first)
  - Done (COVERAGE_MATRIX.md): the matrix had 2 Missing and 14 Insufficient bullets. 48 new MC were added, 3 per weak bullet. Now 102 Strong and 92 Adequate. The Readiness tab has a live Coverage explorer with per-subtopic Practice buttons.
- [x] P3 AI in SecOps module (exam vs supplemental labels; MC only if audit justifies; 6-10 PBQs; 4 drills; 2 investigations; recognition set)
  - Done (AI_MODULE.md): 24 MC, 8 PBQs, 4 drills, 2 cases, 20 recognition items. All 6 objective 1.6 bullets are now rated Strong.
- [x] P4 Validation exams 16-18 (new questions and PBQs, reserved, separate verification pass documented as not independent)
  - Done (VALIDATION_EXAMS.md): 243 MC and 12 PBQs, Standard profile, counted in Readiness. The verification pass fixed the length cue (47% to 9%), Select TWO overuse, joke distractors, bank overlap and terse explanations. Test: `tests/validation-exams.test.js`.

## Priority 3 — adaptive learning and readiness
- [x] P5 Unified evidence log across modules; first-attempt vs repeat vs fresh; confidence ratings; adaptive selection
- [x] P6 Readiness redesign: certification readiness vs analyst proficiency; evidence thresholds; methodology text
- [x] P7 Misconception tracker + Personal Weakness Notebook
  - Done: the evidence log (cybersec_evidence_v1, backed up and repaired on load) records Exam, Quiz, Analyst Training and Investigation answers with a first-attempt flag and optional Sure/Unsure/Guessing confidence. Quizzes have an Adaptive · 15 start for CySA+. Readiness shows certification readiness and analyst proficiency separately, with evidence checks and a method note. The notebook lists confident misses first, keeps user notes, resolves itself after 2 correct answers in a row and has its own practice button. Test: `tests/evidence.test.js` (21 checks).

## Priority 4 — practical training and engine
- [x] P8 SOC Simulation Center (alert queue, tickets, telemetry, Tier 1/Tier 2, reports; separate scoring)
  - Done: a 🖥️ SOC Simulator tab (CySA+) with 3 shifts and 18 alerts. Tier 1 picks the evidence, disposition and priority for each alert and writes a note. Tier 2 handles each incident the analyst escalated. The shift report penalizes missed incidents. Test: `tests/soc-sim.test.js` (18 checks).
- [x] P9 PBQ engine audit: alternative syntax, whitespace/case tolerance, feedback detail, accessible drag-drop
- [x] P10 Query sandbox (simulated SPL/KQL/Wireshark/Sigma/YARA), help expansion, clear "simulated" labels
  - Done: a Query sandbox in Commands & Queries runs SPL-style, KQL-style and Wireshark display-filter queries over synthetic data. It has 8 checked challenges, explains common mistakes (KQL =, BPF in display filters, unsupported commands) and is labelled "Simulated" throughout. Sigma and YARA stay as reading practice in the lessons (not executable). Test: `tests/query-sandbox.test.js` (24 checks).

## Priority 5 — UX, planning, docs, acceptance
- [x] P11 Accessibility + viewport audit (320/375/390/430/768/1024), focus, keyboard, contrast, screen reader labels
  - Done (ACCESSIBILITY.md): real-browser overflow audit at 320-1024 px found 2 overflow bugs (fixed). Light-theme contrast fixed, 26 unlabeled controls named, minimum font 11 px, focus-visible, reduced motion, landmarks and skip link added. Test: `tests/accessibility.test.js` (28 checks). Not tested with real screen-reader users.
- [x] P12 Study planner (exam date, daily minutes, session lengths, weekly summary, no streak pressure)
  - Done: 5/15/30/60/custom session builder from current weak spots, weekly summary from the evidence log, domain emphasis = exam weight × need, 5-minute days allowed, no streak pressure. Test: `tests/planner.test.js`.
- [x] P13 Portfolio docs (README, ARCHITECTURE, DATA_MODEL, SECURITY, TESTING, ACCESSIBILITY, CHANGELOG, methodology), screenshots, exportable reports
  - Done: ARCHITECTURE, DATA_MODEL, SECURITY, TESTING, ACCESSIBILITY, METHODOLOGY and CHANGELOG, plus a Markdown progress-report export on the Readiness tab. Screenshots are still to do (needs a real-phone pass of the new screens).
- [x] P15 Final acceptance + scored report (10 categories, evidence for each rating)
  - Done: FINAL_REPORT.md, self-assessed at 79.5/100 with evidence and gaps for each category (not independent).

## Phase 4 (post-acceptance follow-ups)
- [x] Real-browser audit of the new screens at 320/375 px (1 overflow bug fixed)
- [x] Subresource Integrity for the CDN scripts, plus import fallback messages
- [x] Applied drills for all 43 MC-only bullets (22 drills, new Architecture & Identity module)
- [x] 3 more SOC shifts (6 total, 36 alerts)
- [x] Commands & Queries syntax pass (2 fixes)
- [ ] Screenshots for the documentation
- [ ] Independent review of a Validation Exam sample (needs a human reviewer)
- [ ] Compare a Validation Exam score with the readiness estimate (needs your attempts)

## CySA+ depth round
- [x] Tag all CySA+ PBQs with objectives (60 were untagged)
- [x] 12 PBQs for thin objectives (2.1, 2.3, 2.4, 3.1, 4.1, 4.2, 1.5)
- [x] 4 Investigations weighted to domains 2 and 4 (18 total)
- [x] PBQ workout mode (Exam Mode quick start and planner)

## Session log
- 2026-11-28 session 1: baseline recount, checkpoint, checklist created.
- 2026-11-28 session 1: P14 complete and deployed. 29 test files pass.
- 2026-11-28 session 9: CySA+ depth round deployed. 39 test files pass.
- 2026-11-28 session 8: Phase 4 follow-ups deployed. 38 test files and 808 checks pass.
- 2026-11-28 session 7: P12, P13 and P15 done, and backups now cover all user data. 38 test files and 805 checks pass. All 15 phases are complete; remaining follow-ups are listed in FINAL_REPORT.md.
- 2026-11-28 session 6: P11 deployed. 37 test files pass.
- 2026-11-28 session 5: P8-P10 deployed. 36 test files pass. Priority 4 complete. Next: P11 accessibility and viewport audit.
- 2026-11-28 session 4: P5-P7 deployed. 33 test files pass. Next: P8 SOC Simulation Center.
- 2026-11-28 session 3: P4 Validation Exams 16-18 deployed. 32 test files pass. Priority 2 complete. Next: P5 adaptive engine and confidence ratings.
- 2026-11-28 session 2: P2 matrix, explorer and gap fill, plus the P3 AI module, deployed. 31 test files pass. Next: P4 validation exams 16-18.
- 2026-11-28 session 1: P1 automated and manual audit complete, 5 fixes, Advanced exams excluded from readiness. Deployed.
