# Phase 3 final acceptance report

Date: 2026-11-28. Scope: the 15-phase "Excellence, Validation and Exam Readiness" request. All 15 phases in PHASE3_CHECKLIST.md are implemented and deployed in `index.html`. 38 test files with 805 checks pass.

**How to read the scores.** This is a self-assessment by the AI assistant that built the work. Each rating cites evidence you can check in the repository, and each lists what holds it back. No category got full marks: the ratings are meant to point at what to improve next, not to certify the app.

## Before and after (CySA+, recounted from the app)
| Measure | Phase 3 start | Now |
|---|---|---|
| Multiple-choice questions | 2,111 (1,242 objective-tagged) | 2,426 (1,557 tagged) |
| PBQs | 120 | 140 |
| Fixed practice exams | 15 | 18 (Validation Exams 16-18) |
| Analyst drills / Investigation stages / Recognition items | 48 / 72 / 213 | 52 / 84 / 233 |
| CS0-004 bullets rated Missing or Insufficient | 16 | 0 (keyword-based measure) |
| New tools | — | SOC Simulator, Query sandbox, Coverage explorer, Weakness Notebook, adaptive practice, session planner, report export |
| Test files / checks | 28 / not totalled | 38 / 805 |

## Scores
| # | Category | Score | Evidence | What holds it back |
|---|---|---|---|---|
| 1 | Technical accuracy | 8/10 | Automated cross-checks of Event IDs, Sysmon IDs, ports, CVSS vectors (recomputed), ATT&CK IDs and IR phases, plus a 60-item manual sample. 5 errors fixed, sources cited (ACCURACY_AUDIT.md). | The review isn't independent. Tool syntax in Commands & Queries and the Security+/Network+ banks weren't part of this audit. 60 items is a small sample. |
| 2 | Exam fidelity | 8/10 | 85 questions / 165 minutes / domain weights match the objectives. Per-objective quotas. Advanced exams excluded from readiness. Select TWO count matches the Standard profile. Unpublished facts (PBQ count, scaling) are labelled as such. | Difficulty isn't calibrated against real exam results. The 81 MC + 4 PBQ split is a convention, not a known blueprint. |
| 3 | Objective coverage | 8.5/10 | All 194 CS0-004 bullets mapped (COVERAGE_MATRIX.md): 102 Strong, 92 Adequate. Objective 1.6 went from multiple choice only to MC, PBQs, drills, cases and recognition items. | Coverage is counted by keyword matching, which can over-count. Some bullets are covered only by multiple choice, with no applied practice. |
| 4 | Assessment and readiness validity | 7.5/10 | Fresh-question Wilson interval, evidence checks, held-back exams, certification readiness separated from analyst proficiency, Validation Exams, documented method (METHODOLOGY.md). | No data yet showing that practice results predict real outcomes. The thresholds are reasoned choices, not fitted to data. |
| 5 | Practical / applied training | 8/10 | 140 CySA+ PBQs, SOC Simulator (Tier 1 and Tier 2, missed incidents penalized), 14 investigations, 52 drills, Query sandbox with 8 checked challenges. | The sandbox covers a subset of each language. Sigma and YARA aren't executable. Only 3 SOC shifts so far. |
| 6 | Adaptive learning and feedback | 7.5/10 | Unified evidence log, confidence ratings, adaptive sets weighted by domain and need, Weakness Notebook with confident-miss detection and self-resolution. Tests cover selection and weighting (`evidence.test.js`). | Adaptivity is a heuristic, not a learner model. Confidence is optional, so calibration data may stay thin. |
| 7 | UX and accessibility | 7.5/10 | Browser overflow audit at 320-1024 px with 2 bugs fixed. Light-theme contrast at or above 4.5:1. 26 controls labelled. Focus styles, reduced motion, landmarks, skip link, keyboard drag-and-drop (ACCESSIBILITY.md). The dark theme and boot animation are preserved. | No screen-reader user testing. The new Phase 3 screens haven't been looked at on a real phone yet, and the browser audit ran on the older published copy. |
| 8 | Security and reliability | 8/10 | Backup validation with an undo copy, note sanitization, XSS fix, storage repair (fixed real startup crashes), backups now cover all user data. 37 hostile-input checks (SECURITY.md). | No CSP, and the CDN scripts load without integrity hashes. Storage isn't encrypted. |
| 9 | Testing and maintainability | 8/10 | 805 checks across 38 dependency-free test files that run the real app. Marked code sections. Stable question IDs. Patch scripts preserve progress. | The single 7 MB file is hard to review, and the mock DOM can't test layout. Some tests check source patterns rather than behaviour. |
| 10 | Documentation and transparency | 8.5/10 | README plus ARCHITECTURE, DATA_MODEL, SECURITY, TESTING, ACCESSIBILITY, METHODOLOGY, CHANGELOG, ACCURACY_AUDIT, COVERAGE_MATRIX, AI_MODULE and VALIDATION_EXAMS. Limits are stated throughout, and a progress report can be exported. | No screenshots in the docs yet. Some README sections from earlier phases are long. |

**Total: 79.5 / 100.**

## Phase 4 update (same day)
Done since the scores above:
- the real-browser check of the new screens (1 bug fixed);
- SRI on the CDN scripts;
- applied practice for all 43 bullets that had only multiple choice;
- 3 more SOC shifts;
- a Commands & Queries syntax pass (2 fixes).

On the same evidence rules, this moves **Objective coverage to 9/10**, **Practical training to 8.5/10** and **Security and reliability to 8.5/10**. The revised total is **81.5 / 100**. Independent review and real outcome data are still missing, and those are the biggest remaining limits.

## Highest-value next steps
1. ~~Real-phone check of the new screens~~ (done in Phase 4 in a real browser at phone widths). Screenshots for the docs are still to do.
2. **Independent review** of a sample of Validation Exam questions by someone who has passed CS0-004.
3. **Collect your own outcome data:** take a Validation Exam and compare it with the readiness estimate before relying on the thresholds.
4. ~~Security: SRI for the CDN scripts~~ (done). Bundling them would remove the CDN dependence completely.
5. ~~Content: C&Q syntax pass, more SOC shifts, applied practice for MC-only bullets~~ (done). Next content step: more Investigations at the advanced level, and Security+ and Network+ audits to the same standard.
