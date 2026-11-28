# Testing

39 Node test files, 819 checks, all passing as of 2026-11-28 (CySA+ depth round). There are no dependencies: every test reads the real `index.html`, and most run the actual application script against a small mock DOM and a fake `localStorage`.

Run one file with `node tests/<name>.test.js [path/to/index.html]`. Run them all with `for f in tests/*.test.js; do node "$f" || echo "FAIL $f"; done`.

| Test file | Checks | Covers |
|---|---|---|
| `accessibility.test.js` | 28 | contrast, labels, focus, motion, landmarks, 320px fixes |
| `acronyms.test.js` | 25 | acronym trainer |
| `ai-secops.test.js` | 15 | objective 1.6 module content and structure |
| `analyst-training.test.js` | 24 | Analyst Training drills and sessions |
| `app-integration.test.js` | 17 | exam screen integration |
| `app-security.test.js` | 39 | hostile notes, corrupted storage, crafted backups |
| `attack-quiz.test.js` | 35 | Security+ attack recognition |
| `cli-lab.test.js` | 14 | terminal labs |
| `cli-mastery.test.js` | 28 | CLI trainer |
| `cmd-cards.test.js` | 53 | command flashcards |
| `cmd-query.test.js` | 16 | Commands & Queries lessons |
| `cmd-quiz.test.js` | 16 | command quiz |
| `coldrun-selection.test.js` | 26 | fresh/repeat exam selection |
| `coverage.test.js` | 13 | subobjective coverage explorer |
| `cysa-bank-quality.test.js` | 18 | CySA+ rewritten pool quality (length cues, keys, objectives) |
| `cysa-depth.test.js` | 11 | PBQ objective tags, depth PBQs and cases, PBQ workout |
| `cysa-new-exams.test.js` | 21 | Exams 11-15 and held-back logic |
| `cysa-pbq-v2.test.js` | 8 | CySA+ PBQ set v2 |
| `evidence.test.js` | 23 | evidence log, confidence, adaptive, notebook, readiness, report |
| `exam-save.test.js` | 15 | pause and resume exams |
| `instant-submit.test.js` | 14 | instant feedback mode |
| `investigations.test.js` | 17 | Investigations |
| `new-practice-exams.test.js` | 25 | Security+ exams 11-15 |
| `objective-readiness.test.js` | 11 | objective readiness and notes |
| `pbq-engine.test.js` | 13 | command tolerance, keyboard PBQs, grading sanity |
| `pbq-scoring.test.js` | 18 | PBQ partial credit and points |
| `planner.test.js` | 15 | study planner sessions and summary |
| `ports-quiz.test.js` | 17 | ports quiz |
| `practice-forms.test.js` | 28 | all fixed exams across certs |
| `query-sandbox.test.js` | 24 | SPL/KQL/Wireshark sandbox and challenges |
| `readiness.test.js` | 25 | readiness math, labels, advanced exclusion |
| `recognition.test.js` | 18 | Recognition quizzes |
| `sim-cmd-quiz.test.js` | 14 | simulation command quiz |
| `sim-recognition.test.js` | 30 | simulation recognition |
| `soc-sim.test.js` | 18 | SOC Simulator |
| `standard-practice-exams.test.js` | 25 | Security+ exams 16-18 |
| `terminal-help.test.js` | 25 | help in terminal labs |
| `ux.test.js` | 20 | navigation, quick starts, mobile UI |
| `validation-exams.test.js` | 17 | Exams 16-18 structure, quotas and quality gates |

## What the tests can't show
- **Visual layout.** The mock DOM has no layout engine. Screen-size overflow was checked in a real browser at 320-1024 px (see ACCESSIBILITY.md), but only on the published copy plus the CSS fixes.
- **Content correctness.** Answer keys are validated structurally, and a sample was reviewed by hand (ACCURACY_AUDIT.md, VALIDATION_EXAMS.md). That review isn't independent.
- **Real devices.** iOS Safari storage limits and touch behaviour have only been covered by earlier manual phone checks, not by automated tests.
