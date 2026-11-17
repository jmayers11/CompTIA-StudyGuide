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
| 3 | Interactive command-line PBQ lab | Done (2026-11-17) |
| 4 | Question-bank quality: rewrites, new scenario questions, new PBQ types | Done (2026-11-17) |
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

Run any test with Node 18+ from the repo root.

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

### Phase 4: question-bank quality
- **273 questions rewritten** as original, scenario-based items. That covers the recall items the audit flagged and all three ambiguous or misfiled items. The rest of the flagged set moved to the supplemental set.
  - Each rewrite tests the same concept in the same domain, with same-length, plausible wrong answers and an explanation.
  - Rewritten questions keep their original ID (`oid`), so exposure history and progress carry over. They are marked `rev:'2026-11'`.
- **102 more off-objective trivia items moved to the supplemental set** (193 in total). These are named-malware trivia, vendor products, deep crypto history and packet-tool internals. They stay in the bank for practice but are excluded from Security+ exams unless you opt in.
- **Exam-eligible pool:** 899 questions.

| Measure (exam pool) | Before | After Phase 4 | Messer |
| --- | --- | --- | --- |
| Scenario-based | 28% | 56% | 85% |
| Definition-style stems | 18% | 2% | 2% |
| Correct answer is the single longest option | 54.5% | 21.2% | 12.4% |
| Correct-to-wrong option length ratio | 1.87 | 1.20 | 1.09 |
| Stem keyword gives away the answer | 12.9% | 7.5% | 3.2% |

- **New interactive PBQ types**, rendered in exams, graded and explained per step: `evidence`, `config` and `zones`.
  - `evidence`: a log or exhibit viewer where you click the lines that answer the question, or tick statements about an exhibit.
  - `config`: drop-down configuration tables for firewall rules, ACL actions, an access-control matrix and wireless settings.
  - `zones`: a network diagram where you assign items to zones and the diagram redraws as you go.
  - 14 original PBQs use these types:
    - 5 log analyses: auth.log brute force and persistence, web access log attacks, Windows password spray, C2 beaconing, DNS tunneling
    - 2 certificate inspections
    - 1 incident-response containment item
    - 2 firewall/ACL builds
    - 1 access-control matrix
    - 1 wireless configuration
    - 2 network-zone diagrams
- **Cold Run PBQ selection:** Cold Run now draws exam-style PBQs only. The 13 short definition-matching drills stay available in "Practice All PBQ Types".

### Phase 3: Terminal Lab and terminal PBQs
- **Terminal Lab** (CLI Mastery tab → 🧪 Terminal Lab): 12 multi-step troubleshooting scenarios. There are 4 each at beginner, intermediate and advanced level, across Windows and Linux, 37 steps in total.
  - You type commands into a simulated terminal, read realistic output, then answer what it means (a PID, the attacking IP, the next best action).
  - Several valid approaches are accepted, for example `netstat -nao`, `tasklist` or `Get-Process -Id 4412`.
  - Common mistakes get specific feedback, for example "without -o there's no PID" or "/var/log/secure is RHEL".
  - Hints are available in the lab. Scoring: first try = 1 point, after a retry = ½, revealed = 0.
  - Results are stored separately in `cybersec_cli_lab_v1` and included in Backup.
- **Terminal PBQs in exams:** 8 labs also appear as `terminal` PBQs in Exam Mode and Cold Run. They have no hints and one try per step. If a command is wrong, the correct output is still shown so the scenario can continue.
  - A terminal PBQ is marked correct only if every step is right.
  - The result is also logged to your lab history, and the commands you missed are pushed to the front of your CLI flashcards.
- **Security+ PBQ count:** 79 in total, 66 of them eligible for Cold Run.

### Phase 3–4: test results
- `node tests/cli-lab.test.js`: 14 passed.
  - The lab dataset, expected answers, wrong-answer rejection and feedback.
  - Alternate valid commands and per-platform syntax.
  - Partial-credit scoring and persistence.
  - Terminal PBQs point at real labs, and no hints appear in exams.
- `node tests/app-integration.test.js`: 13 passed.
  - The new PBQ types and terminal PBQs grade right, wrong and blank answers correctly and render inside a real practice exam.
  - A full Terminal Lab run (with a near-miss retry) scores 3.5/4.
- `node tests/coldrun-selection.test.js`: 26 passed, including the check that rewritten questions keep their original IDs.
- `node tests/cli-mastery.test.js`: 28 passed.

### Question rewrites, round 2: matching the Messer benchmark
- **Scope:** 523 more questions rewritten as original scenarios (485 + 38 in two passes). 139 identification stems were reworded to BEST/MOST form, and about 140 answer options were rebalanced so that neither length nor a repeated keyword gives the answer away.
- **IDs:** every changed question keeps its original ID (`oid`), so exposure history and progress carry over.
- **Supplemental set:** 75 more trivia items moved there (268 in total), including named-malware history, HTTP/FTP/TCP internals, ISO and NIST trivia, and duplicated drills.
- **Exam pool:** 824 questions.

All measures below use the same scripts on both sets. The Messer figures are aggregate statistics only. No Messer content is in this app.

| Exam pool measure | Original bank | Now | Messer |
| --- | --- | --- | --- |
| Stems that set up a situation before asking | 32% | 98% | 85% |
| Keyword-based "scenario" heuristic | 28% | 74% | 85% |
| Definition-style stems | 18% | 0% | 2% |
| BEST / FIRST / NEXT / MOST wording | 12% | 59% | 51% |
| Correct answer is the single longest option | 54.5% | 11.7% | 12.4% |
| Correct-to-wrong option length ratio | 1.87 | 1.04 | 1.09 |
| Stem keyword gives away the answer | 12.9% | 3.2% | 3.2% |
| Average stem length (words) | 20 | 27 | 36 |

The keyword heuristic undercounts this bank's scenarios. It only recognizes particular actor and verb words, and many stems here open with a situation using other words ("Thieves break a server room door…"). Messer's stems are still about 9 words longer on average.

**Effect on Cold Run:** the smaller, cleaner pool covers about 9 full Cold Runs with no repeats. The General Security Concepts domain (103 questions, 11 per exam) runs out first. The selection test now checks that every exam uses all unseen questions still available. Pass: 26/26.

### Notes
- Practice scores are not an official CompTIA prediction. CompTIA's scaled scoring is proprietary.
- Third-party practice exams (for example, Professor Messer's) are kept out of this app on purpose, so they stay independent readiness checks.
