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
| 5 | Readiness analytics and score labeling | Done (2026-11-17) |

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
- **Exam pool:** 824 questions (871 after the batch below).

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

### New questions: General Security Concepts batch
- **47 original application questions** (`src: original-2026-11b`): 35 General Security Concepts, 5 Program Management, 3 Security Operations, 2 Threats, 2 Architecture. They cover change management, PKI and certificates, cryptography choices, zero trust, deception, physical controls and gap analysis.
- **Exam pool:** 871 questions (General 138, Threats 187, Architecture 167, Operations 203, Management 176).
- **This batch's measures:** average stem 30 words, correct answer is the single longest option 4.3%, length ratio 0.97, stem keyword giveaway 0%.
- **Whole pool now:** single longest 11.3%, length ratio 1.04, giveaway 3.1%, BEST/FIRST/NEXT/MOST 55%.
- **Cold Run runway:** General is no longer the first domain to run out. Security Operations (203 questions, about 24 per exam) now runs out first, after about 8 fully fresh Cold Runs.

### Phase 5: readiness analytics
- **New 🎯 Readiness tab** (Progress group). It shows:
  - Raw %, blueprint-weighted % (domains weighted like the real exam), the unofficial 100–900 estimate, and the official passing score, side by side.
  - A confidence level (On track, Borderline, Not yet, or Not enough data), judged **only from questions you had never seen**. It uses the last 5 full exams and needs at least 60 fresh questions. The level comes from a 90% range around fresh accuracy: On track means the whole range clears the passing line, and Borderline means the middle of the range does but the low end doesn't.
  - Fresh vs repeated accuracy, with a warning when repeated questions score more than 10 points higher. It also shows accuracy on questions you had missed before, PBQ accuracy, and the Cold Run trend chart.
  - Domain bars against the passing line, with the weakest domain marked, plus command-line mastery and Terminal Lab progress.
  - A table of recent full exams.
- **Score labeling:** exam results now say "UNOFFICIAL ESTIMATE … / 900 · OFFICIAL PASSING 750". A note under the score explains that the figure is linear (100 + raw% × 800) and is not an official CompTIA score. On this scale, 750 equals 81.25% correct. The real exam's raw cut score is not published.
- **Data:** each exam attempt now also stores Cold Run status, fresh/repeat counts, PBQ counts, previously-missed counts and the weighted %. Older attempts still work. If they have no fresh data, the confidence level uses the Cold Run exposure history. Everything is in the existing progress key, so Backup/Restore already covers it.

### Phase 5: test results
- `tests/readiness.test.js` (new, 20 checks) covers the score scale, each confidence level, repeated questions not inflating confidence, blueprint weighting, drill and other-cert filtering, trend, PBQ and previously-missed totals, legacy migration, and wording that never claims an official result.
- `tests/app-integration.test.js` (16 checks, 3 new) confirms that results show the unofficial label next to 750, that attempts store the new fields, and that the Readiness tab renders from 3 real Cold Runs (258 fresh questions).
- Full regression: coldrun-selection 26/26, cli-mastery 28/28, cli-lab 14/14, readiness 20/20, app-integration 16/16.

### 10 fixed practice exams
- **Choosing an exam:** before a Security+ Cold Run, a **Cold Run exam** menu lets you pick either a **Fresh exam** or **Practice Exam 1–10**. A Fresh exam is a new mix from the whole bank, which contains every practice exam's questions plus extras, using the repetition policy.
- **What each practice exam contains:**
  - 86 multiple-choice questions, split by domain like SY0-701: General 10, Threats 19, Architecture 16, Operations 24, Management 17.
  - 4 exam-style PBQs, at least one of them command line (CLI or terminal).
  - No question or PBQ appears in more than one practice exam, and none contains two near-duplicate questions.
  - Objectives are spread evenly across the exams, so their difficulty profiles are close (average stem 27–29 words, 74–87% scenario stems).
- **Same exam every time:** questions keep their set but are shown in a new order, with options reshuffled.
- **Status shown before you start:** times taken, first, best and latest score, and how many of the exam's questions you have already met in other exams. Those count as repeats, so readiness confidence still uses only never-seen questions.
- **Tracking:**
  - Results are titled "Practice Exam N complete · attempt K".
  - The Readiness tab has a practice-exam table showing attempts, first attempt, best, latest and questions already seen.
  - Each practice exam also counts as a Cold Run.
- **Bank changes:** if a later bank change removes a question, the exam fills that slot from the same domain, never-seen first.
- **New questions:** 51 original application questions (45 Security Operations, 6 Threats, `src: original-2026-11c`), so 10 exams with no overlap fit the blueprint.
  - The exam pool is now 922: General 138, Threats 193, Architecture 167, Operations 248, Management 176.
  - 62 pool questions are in no practice exam and appear only in Fresh exams.
  - Three new drafts were dropped as too close to existing questions.
- **Builder:** the exam lists are generated offline by a builder script and stored as question IDs in a `PRACTICE_FORMS` data block in `index.html`.
- **Tests:** `tests/practice-forms.test.js` (new, 23 checks) checks the blueprint split, no overlap, valid IDs, no near-duplicates and the PBQ mix. Then it takes Practice Exam 3 twice, a Fresh exam and Practice Exam 4 through the real buttons. Full regression: 26 + 28 + 14 + 20 + 16 + 23, all passing.
- **Fix:** the Cold Run exam menu was hidden when the app loaded with the Security+ track saved, because the track set the certification without a change event. Opening Exam Mode now refreshes the menu, and a test checks this.

### PBQ scoring: partial credit, weighting and large simulations
- **Partial credit:** every PBQ is split into parts (pairs, steps, cells, slots, fields or log lines) and earns the share it got right.
  - Ordering tasks credit the longest run of steps in the right relative order.
  - In evidence (log-line) tasks, each wrong selection cancels a right one, so selecting everything earns nothing.
  - Multiple-choice questions stay all-or-nothing, like the real exam.
- **Weighting:** a multiple-choice question is worth 1 point. A PBQ is worth 3 points (up to 3 parts), 4 (4–7 parts), 5 (8 or more parts) or 6 (large simulation). In a practice exam the 4 PBQs carry about 15–17% of the points, while being 4% of the questions. CompTIA does not publish its weights; this models the common view that PBQs count for more.
- **Score:** the unofficial 100–900 estimate is now 100 + points% × 800. Results show points, PBQ points, and how many questions were fully right. The review list tags each PBQ with its points and parts, and marks partly right PBQs in amber. Readiness and the practice-exam table use points. Older attempts keep their raw-percentage scores.
- **10 large simulations** (original, `sim: true`), one in every practice exam, worth 6 points each:
  - 7 terminal simulations with 6 steps each: a web shell on a portal, encoded PowerShell persistence, SQL injection through access logs, password spraying in Windows event logs, Linux hardening, ransomware triage, and cron-based C2 on a build server.
  - 3 large configuration tasks: a three-SSID wireless design, secure protocol replacements with ports, and an identity policy.
  - The terminal simulations stay out of Terminal Lab practice until you meet them in an exam, so your first attempt is fair. After that they unlock for review with hints.
  - Practice exams that already had a small terminal PBQ swapped it for a CLI PBQ, so each exam keeps one terminal-style task. The swapped-out PBQs remain in the Fresh-exam pool.
- **Fix:** in every Terminal Lab multiple-choice step, the right answer used to be the first option. The options are now shuffled in the data.
- **Tests:** `tests/pbq-scoring.test.js` (new, 18 checks) covers partial credit per type, the points tiers, all 10 simulations, the Terminal Lab unlock, and a full practice exam scored in points. The readiness test gained 2 points checks (22). Full regression: 26 + 28 + 14 + 22 + 16 + 23 + 18, all passing.

### Command flashcards (simple memorization)
The five-mode CLI trainer is replaced by plain two-sided flashcards (CLI Mastery → Flashcards). Terminal Lab is unchanged and stays a separate section.
- **Card sides:** the front shows a plain-English description of what a command does, never the command itself. Tap to flip. The back shows the command as the largest element, a one-line explanation, each flag explained, and an optional **Alternative Commands or Syntax** section.
- **Alternatives** are grouped as:
  - *Equivalent syntax (same command)*: accepted when typed.
  - *Different command, similar job*: shown with its platform, never accepted as the answer.
  - *Long form*: a note when no long form exists.
  No card claims what CompTIA's exam simulations accept.
- **Directions:** Description → Command (default) or Command → Description.
- **Type the Command:** an optional toggle with a text box and Check Answer button. It accepts documented equivalent forms only: option order, separate or combined options, long options, sudo, and case on Windows where Windows ignores it.
- **Ratings:** Got It, Almost or Missed It, tracked per command with the app's SM-2 scheduler.
  - Missed It brings the command back in about 10 minutes and puts it first in the next review.
  - Almost brings it back the next day.
  - **Review missed only** reviews just the missed (and Almost) commands.
  - A CLI or terminal PBQ missed in an exam puts that command back into review.
- **Progress:** stats show commands mastered, still being learned and needing review, and the full command list shows each command's status. Progress is saved under `cybersec_cmd_cards_v1` and included in Backup. History from the old trainer carries over once for commands with the same id.
- **Deck:** 85 cards in 5 categories:
  - Windows Networking (18)
  - Windows Security (16)
  - Linux Networking (16)
  - Linux Security and Administration (19)
  - Security Tools (16)
  - The deck covers every command in the spec. Flag variants get their own card when their purpose differs (for example `ipconfig /all`, `ss -tulpn`, `nmap -sV`, `grep -v`). A few existing security commands were kept: `certutil -hashfile`, `icacls`, `sha256sum`, `tail -f` and `systemctl status`.
- **Phone layout:** large text, the whole card is the tap target, large rating and Previous/Next buttons, long commands wrap with no horizontal scrolling, and it works offline like the rest of the app.
- **Tests:** `tests/cmd-cards.test.js` (new, 48 checks) covers:
  - the card data rules: the front never names the command, and flags are explained;
  - typed acceptance across the deck, including that "different command" alternatives are rejected;
  - scheduling, missed-first order and Review missed only;
  - PBQ priority, persistence and the one-time migration.

  `tests/app-integration.test.js` now drives the flip cards and Type the Command through the real UI. Full regression: 16 + 14 + 28 + 48 + 26 + 18 + 23 + 22, all passing.

### Notes
- Practice scores are not an official CompTIA prediction. CompTIA's scaled scoring is proprietary.
- Third-party practice exams (for example, Professor Messer's) are kept out of this app on purpose, so they stay independent readiness checks.
