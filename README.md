# CompTIA-StudyGuide
CompTIA Study Guide App: a single-file, offline-capable study app (`index.html` + `sw.js`) for Network+, Security+, CySA+, A+ and Linux Fundamentals, with notes, quizzes, flashcards, exam mode, Cold Run mock exams and PBQs.

Live: https://jmayers11.github.io/CompTIA-StudyGuide/

## Deploying
Upload a new `index.html` to the repo root. `sw.js` loads `index.html` network-first, so updates appear on the next load without bumping `CACHE_VERSION`. Bump it only when `sw.js` itself or its cached library list changes.

## Security+ exam-simulator upgrade

| Phase | Scope | Status |
| --- | --- | --- |
| 1 | Cold Run repetition blocker, persistent question exposure tracking | Done (2026-11-17) |
| 2 | Security+ Command-Line Mastery flashcards with spaced repetition | Done (2026-11-17) |
| 3 | Interactive command-line PBQ lab | Planned |
| 4 | Question-bank quality: rewrites, new scenario questions, new PBQ types | In progress: first 54 original scenario questions added |
| 5 | Readiness analytics and interface refinements | Planned |

### Phase 1: why Cold Run repeated questions
The old selector kept a rolling list of the last 250 questions served (about 3 exams) and skipped those. Anything older came back at the same odds as never-seen questions. That list also filled up with short practice exams and abandoned attempts, a domain fell back to its whole pool when it ran low, and PBQs were drawn with no history. In a simulation, the 10th consecutive Cold Run held only about 42 new questions out of 86.

### Phase 1: new selection algorithm
`createExposureEngine` in `index.html` (between the `EXPOSURE_ENGINE_START/END` markers) keeps a per-certification exposure record in `localStorage` key `cybersec_exposure_v1`. For each question it stores times seen, last Cold Run number, last seen time, and right/wrong counts. It also keeps PBQ history and a summary of each exam.

- Questions are first split across domains by the official blueprint weights, as before.
- Inside each domain, candidates are ranked into tiers. Tier 0: never seen. Tier 1: never seen, but a near-duplicate was seen long ago. Tier 2: seen more than 3 Cold Runs ago, fading back in over the next 3 runs and penalised by how often it has been seen. Tier 3: seen in the last 3 Cold Runs, used only as a last resort.
- Within a tier the pick is weighted random. No question repeats within an exam. Near-duplicate groups never share an exam, and they share exposure.
- Policies:
  - **Strict** (default): maximum novelty.
  - **Balanced**: up to ~15% older repeats.
  - **Review**: up to 60% previously missed questions.
- Strict and Balanced never select on correctness.
- When the pool runs low, rules relax one tier at a time. Domain weighting stays intact and an exam is never refused.
- Question IDs are a fingerprint of the question text: the same hash the old recent-exam list used. That list is imported once, so existing history carries over.
- 91 networking-basics and packet-tool questions (from the HTB traffic-analysis notes) are kept in the bank but left out of Security+ exams unless you tick *Include supplemental packet-analysis questions*.
- After each exam, a *Question freshness* panel shows:
  - new vs repeated questions
  - % unique
  - repeats from the last 3 Cold Runs
  - % of the bank explored
  - questions still unseen
  - your score on never-seen questions
- The *Question Exposure Dashboard* under Exam Mode shows coverage by domain, PBQs seen, and recent exams. It also has a reset button.
- Exposure data and settings are included in Backup/Restore.

### Phase 1: test results
`node tests/coldrun-selection.test.js` runs 25 checks against the real engine and bank, loaded from `index.html`. Ten consecutive 90-question Security+ Cold Runs (86 multiple choice + 4 PBQs), with the app restarted from storage before each run:

| Exam | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Never-seen questions (of 86) | 86 | 86 | 86 | 86 | 86 | 86 | 86 | 86 | 86 | 85 |
| Overlap with previous exam | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| From the last 3 Cold Runs | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| Bank explored | 9% | 18% | 27% | 36% | 45% | 55% | 64% | 73% | 82% | 91% |

Other checks:

- No duplicate IDs in any exam, and exact blueprint domain counts every exam.
- Over 25 exams, exam size and domain weights hold after the 947-question exam pool is exhausted, with zero repeats from the last 3 runs.
- PBQs don't repeat until all 57 have been used.
- Legacy history migrates once.
- Exposure persists across restarts.
- Near-duplicates never appear together.
- Review mode brings back missed questions.

`node tests/app-integration.test.js` boots the full app script against a minimal fake DOM (no browser or npm packages needed). It drives three Security+ Cold Runs and one Network+ Cold Run through the real buttons, then restarts the app to confirm persistence. Result: 5 passed, 0 failed, no script errors.

Run either test with Node 18+ from the repo root.

### Phase 2: Security+ Command-Line Mastery
There is a new **⌨️ CLI Mastery** tab (Study group) covering 43 commands: 19 Windows and 24 Linux. That's the 38 requested plus `certutil -hashfile`, `icacls`, `sha256sum`, `usermod -L` and `ufw status`, so every existing Security+ CLI PBQ maps to a command. SY0-701 doesn't publish a command list, so each command is marked **core** (most useful for Security+ investigation and hardening PBQs) or **supplemental**, and tagged with the objective it supports. The data and grader live between the `CLI_DATA_*` and `CLI_TRAINER_*` markers in `index.html`.

- **Modes (210 cards):**
  - A · Recognition: description → type the command
  - B · Reverse recall: command → what it does (self-rated)
  - C · Scenario: situation → type the command
  - D · Completion: fill in the missing option (e.g. `netstat -___`)
  - E · Terminal: a troubleshooting task in a simulated terminal that shows realistic output
- **Interpretation:** every card explains how to read the output.
- **Grading:** typed answers are checked against an allowlist of valid variants. That covers flag order (`netstat -nao`), separate flags, optional `sudo`, Windows case-insensitivity, Linux case-sensitivity (`nmap -sV`), pasted prompts and smart quotes. Nothing is executed.
- **Spaced repetition:** reuses the app's existing SM-2 scheduler, with three ratings.
  - Didn't Know: the card returns in about 10 minutes.
  - Struggled: a short gap.
  - I Know This: the gap grows.
  - Keys 1/2/3 also work.
- **Tracking:** stored per card and per command: recall accuracy, current/best streak of consecutive successful recalls, last review, next review and status (New / Learning / Needs work / Mastered).
- **PBQ priority:** CLI PBQs you miss in Exam Mode or Cold Run are recorded against their command. With "Commands I missed in PBQs come first" ticked, those commands lead your next session.
- **Storage:** progress is stored in `cybersec_cli_mastery_v1` and included in Backup/Restore.

### Question bank: first batch of original application questions
54 new Security+ questions written for this app (`src:'original-2026-11'`). They target the objectives the audit found thin: 1.1, 1.3, 2.5, 3.3, 4.3, 4.5, 4.9, 5.5 and 5.6. They're scenario-first with BEST/FIRST/NEXT wording, short same-category answer options, three multi-select items, and an explanation on each. Compared with the existing bank:

| Measure | Old bank | Batch 1 |
| --- | --- | --- |
| Scenario-based | 28% | 72% |
| BEST/FIRST/NEXT/MOST wording | 12% | 46% |
| Correct answer is the single longest option | 54.5% | 9.8% |

The Security+ bank now holds 1,092 questions, 1,001 of them eligible for exams. New questions count as never-seen, so Cold Run serves them first.

### Phase 2: test results
- `node tests/cli-mastery.test.js`: 28 passed.
  - Dataset integrity and coverage of the requested list.
  - 193 grading cases: valid variants accepted, near-misses rejected.
  - Recognition and completion rules.
  - Spaced repetition timing, mastery, persistence, session building, and PBQ-miss priority and mapping.
- `node tests/app-integration.test.js`: 9 passed. It now also runs a CLI Mastery session through the real UI code, and confirms missed CLI PBQs from Cold Runs are recorded.
- `node tests/coldrun-selection.test.js`: 25 passed on the enlarged bank. 860 of 860 questions were new across 10 consecutive Cold Runs.

### Notes
- Practice scores are not an official CompTIA prediction. CompTIA's scaled scoring is proprietary.
- Third-party practice exams (for example, Professor Messer's) are kept out of this app on purpose, so they stay independent readiness checks.
