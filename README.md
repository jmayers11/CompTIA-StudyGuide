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

### UI modernization, increment 1 (mobile shell + exam screen)
- **Audit:** done on the live site at iPhone width (390 × 844). The main problems were:
  - The sidebar filled the first ~520 px of every phone screen, so content started below the fold.
  - The 90-button question grid sat above every exam question.
  - The exam's Previous / Flag / Next / Review row ran past the screen edge (414 px on a 390 px screen).
  - Every form control used 13 px text, which makes iPhone Safari zoom in on focus.
  - Quiz tag filters overflowed to 842 px.
  - The mascot speech bubbles covered question text.
  - The page had a duplicate `exam-nav-buttons` id.
  - Single-answer options showed square checkboxes.
- **Mobile shell (≤ 860 px):**
  - A compact sticky top bar (☰ menu, section name, track) replaces the stacked sidebar.
  - The sidebar becomes a slide-in menu with the tab list first; it closes on navigation, on the backdrop, or with Esc.
  - Tab-specific sidebar controls (notes list, planner form, cram options) move with their listeners into a box at the top of the page while that tab is open. Desktop is unchanged.
- **Exam screen (all sizes):**
  - The header holds ←, the exam title (for example "Security+ · Practice Exam 3"), a compact timer and a Flag button.
  - Progress shows "Question N of M" and a flagged count.
  - The question grid is now a collapsible **Question navigator** showing the answered count. It is collapsed on phones and open on desktop, and it holds a Review & Submit button.
  - Options are larger lettered cards (A–D). Round marks mean single answer, square marks mean multi-answer, and `role=radio/checkbox` with `aria-checked` is set.
  - Previous / Next are pill buttons.
  - On phones the header and the Previous/Next bar are sticky, mascots are hidden during the exam, and Review & Submit sits on the last question and in the navigator.
  - Simulation PBQs no longer print the scenario twice.
- **Forms and overflow:** on phones, inputs and selects use 16 px text with 44 px minimum height, checkboxes are 20 px, tag chips wrap, and terminal output and tables scroll inside their own box.
- **Unchanged:** all questions, answers, explanations, scoring, Cold Run selection, practice exams, PBQ grading and stored progress. No new dependencies.
- **Tests:** the app-integration test (17 checks, 1 new) checks the redesigned exam screen. Full regression: 17 + 14 + 28 + 48 + 26 + 18 + 23 + 22, all passing. Phone layout was checked in a 390 px browser viewport against the live page with the new CSS and markup applied.

### Submit Answer for instant feedback
- In Exam Mode with instant feedback, in Quizzes and in the Daily Challenge, tapping an option now only **selects** it. Tap another option to change your mind. Nothing is graded until you press **Submit Answer**, which prevents mis-taps on phones.
- In Exam Mode, Submit Answer stays disabled until something is selected. While an answer is waiting to be submitted, Submit is the highlighted button and Next is secondary. After you submit, the question locks and shows the feedback.
- In timed quizzes, a selected but unsubmitted answer still counts if time runs out.
- Cold Runs and other exams without instant feedback are unchanged: answers are graded only when you submit the exam.
- **Tests:** `tests/instant-submit.test.js` (new, 14 checks). Full regression: all 9 test files pass.

### Save and resume for untimed exams
- **How saving works:** an untimed exam saves itself to the device after every answer, flag or move, and again when the page is hidden or closed (`visibilitychange` / `pagehide`). Closing the tab on a phone no longer loses progress. The timer area shows "Untimed · saved".
- **Resuming:** a **Resume exam** card appears on Home and at the top of Exam Mode. It shows the exam, the question you were on, how many you've answered and when it was saved. Resume picks up at the same question with the same questions, answers, flags and instant-feedback results. Discard (with confirmation) removes the saved exam.
- **The back arrow** saves the exam and leaves it, instead of discarding it.
- **Submitting** grades the exam as usual and deletes the saved copy.
- **Starting a different exam** while one is saved asks first, then replaces it.
- **Timed exams (including Cold Runs and Practice Exams 1–10) are not saved**, because their clock can't pause fairly.
- **Storage:** key `cybersec_exam_inprogress_v1`. Saved data includes CLI answer patterns and Terminal Lab references. A corrupted or outdated save is ignored rather than breaking the app.
- **Tests:** `tests/exam-save.test.js` (new, 15 checks) saves, simulates closing and reopening the app, resumes, checks every detail, then covers the back arrow, submit, timed exams, replacing a save and a corrupted save. Full regression: all 10 test files pass.

### Network+ and CySA+ upgrade: audit and first step
**Audit** (same scripts as the Security+ audit):

| Measure | Network+ (582 q) | CySA+ (1,089 q) | Security+ now |
| --- | --- | --- | --- |
| Scenario stems (keyword heuristic) | 6% | 8% | 74% |
| Definition-style stems | 16% | 29% | 0% |
| BEST / FIRST / NEXT / MOST wording | 0.7% | 0.5% | 55% |
| Correct answer is the single longest option | 53% | 77% | 11% |
| Correct-to-wrong option length ratio | 1.69 | 2.18 | 1.04 |
| Stem keyword gives away the answer | 8.9% | 13.5% | 3.1% |
| Questions with a written explanation | 0% | 0% | 100% |
| Average stem length (words) | 16 | 16 | 27 |

- **Domain balance, Network+:** Concepts 156, Implementation 140, Operations 95, Security 106, Troubleshooting 85. Troubleshooting is 24% of the exam but has the fewest questions.
- **Domain balance, CySA+:** Security Operations 835 (77% of the bank, 34% of the exam), Vulnerability Management 123, Incident Response 98, Reporting and Communication 33.
- **PBQs:** Network+ has 50 (match, order, cli, subnet calc, MAC id, build). CySA+ has 28 (match, order, cli, build). Neither has log, config, zone, terminal or large-simulation PBQs.
- **Already generic, so Network+ and CySA+ get these with no changes:** Cold Run repetition blocker and exposure tracking, Readiness, unofficial score labels, PBQ partial credit and weighting, Submit Answer, save/resume, and the mobile and exam-screen redesign.
- **Security+ only today:** the question rewrites, the 10 practice exams, the large simulations and terminal labs, and the supplemental set.

**First step done:**
- **Command flashcards follow the track.** Network+ gets 52 cards: Windows and Linux networking, nmap and tcpdump, plus a new **Network Devices (Cisco IOS)** category with 9 cards (`show interfaces`, `show ip interface brief`, `show ip route`, `show mac address-table`, `show vlan brief`, `show running-config`, `show arp`, `show power inline`, `copy running-config startup-config`). The IOS cards accept common abbreviations such as `sh ip ro` and `wr mem`.
- CySA+ uses the full 85-card security deck. Security+ is unchanged. Categories with no cards for the track are hidden, and the heading names the track.
- **Network+ domain names** updated to the N10-009 wording (1.0 Networking Concepts, 2.0 Network Implementation).
- **Tests:** cmd-cards 53 (5 new). Full regression passes.

### CySA+ (CS0-004) upgrade
- **607 new original application questions** (`src: original-2026-11-cysa`), each with an explanation and a domain tag:
  - Security Operations 121, Vulnerability Management 175, Incident Response and Management 182, Reporting and Communication 135.
  - Wrong options were written to match the correct answer's length. Across the new set, the correct answer is the single longest option 25% of the time, and the correct-to-wrong length ratio is 1.09 (the old bank was 77% and 2.18).
- **Old questions kept, not deleted:** 869 of the 1,089 original CySA+ questions failed the quality checks (definition-style, or the answer given away by length or a repeated keyword). They are now **supplemental**, so they're excluded from exams by default and can be included with the checkbox in Exam Mode. The 220 that passed stay in the exam pool. The supplemental checkbox is now shown for any cert that has supplemental items.
- **Exam pool:** Security Operations 284, Vulnerability Management 216, Incident Response 194, Reporting 139, which matches the 34/26/24/16 blueprint.
- **PBQs:** 54 exam-style PBQs.
  - 3 new large simulations: vulnerability triage, phishing header analysis and ransomware response order.
  - The Security+ terminal simulations and log-analysis PBQs are also available on the CySA+ track (23).
  - Terminal Lab unlocks a simulation once you meet it in an exam on any track.
- **10 CySA+ practice exams:** each has 81 multiple-choice questions (28/21/19/13) plus 4 PBQs (one command-line, two others, one large simulation). No overlap between exams. They appear in the Cold Run exam picker on the CySA+ track.
- **Tests:** practice-forms (25 checks, 2 new for CySA+). Full regression passes.

### Network+ (N10-009) upgrade
- **645 new original application questions** (`src: original-2026-11-net`), each with an explanation and a domain tag:
  - Networking Concepts 130, Network Implementation 111, Network Operations 123, Network Security 94, Network Troubleshooting 187.
- **Old questions kept, not deleted:** 348 of the 582 original Network+ questions failed the quality checks and are now supplemental (excluded from exams by default; the checkbox brings them back). The 234 that passed stay in the exam pool.
- **Exam pool:** 879 questions. Concepts 206, Implementation 174, Operations 164, Security 122, Troubleshooting 213, which matches the 23/20/19/14/24 blueprint.
  - Correct answer is the single longest option: 17.6% (was 53%).
  - Correct-to-wrong length ratio: 1.08 (was 1.69).
  - Keyword giveaway: 8.9%.
- **PBQs:** 62 exam-style PBQs, including 10 new large simulations (6 points each):
  - Configuration tasks: switch-port VLAN and trunk setup, VLSM subnet sizing, edge firewall rules, wireless channel and security plan, and DNS record selection.
  - A network-zone placement task, a `show interfaces` output analysis, and the 7-step troubleshooting methodology in order.
  - Two 6-step terminal simulations: a Windows PC with the wrong gateway, and a Linux server with broken DNS. The Security+ APIPA and rogue-DNS labs are also on the Network+ track.
- **10 Network+ practice exams:** each has 86 multiple-choice questions (20/17/16/12/21) plus 4 PBQs (one command-line or subnet-calculation task, two others, one large simulation). No overlap between exams. They appear in the Cold Run exam picker on the Network+ track.
- **Tests:** practice-forms (27 checks, 2 new for Network+). The cli-lab test validates the 2 new Network+ labs. Full regression: all 10 test files pass.

**Known limits:**
- About 27% of exam-pool questions in each cert are older items that passed the structural checks but have no written explanation. They fall back to the glossary "Why" text.
- The new questions are mostly short scenarios. Their stems average 18 words, compared with 27 for Security+ and 36 for Messer.

### Command Quiz (multiple choice)
- **Where:** a new **🎯 Command Quiz** section in CLI Mastery, next to Flashcards and Terminal Lab. It uses the same command deck as the flashcards for the active track (Security+: 85 commands).
- **Question types:**
  - **Description → Command:** which command does this?
  - **Command → Description:** what does this command do?
  - **Options and flags:** in `netstat -ano`, what does `-o` do?
  - Choose mixed or one type, 10/20/40 questions or a full pass, and an optional category.
- **One right answer per question:** wrong options come from the same category or platform first. Commands listed on the card as equivalent syntax or as a similar job are never used as wrong options, and option questions never offer near-identical meanings or the command's other options.
- **Answering:** select an option, then **Submit Answer** (taps can be changed before submitting). The explanation shows the command, its description and every flag. Results list the missed questions.
- **Progress:** missed commands are put back into flashcard review, and the last 50 quiz scores are saved.
- **Tests:** `tests/cmd-quiz.test.js` (new, 16 checks) generates 60 random 40-question quizzes and checks option quality on every question, then runs a full quiz through the UI. Full regression: all 11 test files pass.

### Ports Quiz
- **Where:** a new **🔌 Ports** tab in the Study group.
- **Data:** 40 ports with protocol, full name, TCP/UDP and a short note.
  - 29 are marked exam core for Security+ and Network+ (for example FTP 20/21, SSH 22, DNS 53, HTTPS 443, SMB 445, LDAPS 636, RDP 3389, RADIUS 1812/1813, SIP 5060/5061).
  - 11 are extras, such as BGP 179, MySQL 3306 and Syslog over TLS 6514.
  - SMTPS is listed on 587, as in CompTIA's N10-009 list, with a note that 465 is also used.
- **Question types:**
  - **Port → Service**, which never offers two protocols that share the port, so SSH and SFTP never appear together for 22.
  - **Service → Port**, where wrong options never overlap the right port.
  - **Secure replacements**, for example the secure replacement for LDAP, with exactly one valid replacement among the options.
  - **TCP or UDP.**
  - Choose mixed or one type, 10/20/40 questions, and exam core or all ports.
- **Answering:** select an option, then **Submit Answer**. The explanation shows the protocol, its port(s), TCP/UDP and notes.
- **Progress:** missed ports get a higher priority and are asked first next time; correct answers lower it again. A "Review missed only" button runs a quick quiz on just the missed ports. Scores are saved under `cybersec_ports_v1`, which Backup includes.
- **Port reference** table with a filter box (type `443` or `mail`).
- **Tests:** `tests/ports-quiz.test.js` (new, 17 checks) checks the data and key ports, runs 80 random 40-question quizzes for one-right-answer rules, checks missed-first ordering, and runs a full quiz through the UI. Full regression: all 12 test files pass.

### Simulation Commands quiz
- **Where:** a new **🧩 Simulation Commands** section in CLI Mastery.
- **Coverage:** every command step from every terminal lab and large simulation, 39 steps in 21 simulations, becomes a multiple-choice question. The list is filtered by track: Security+ has 18 simulations. The large exam simulations are included, so their answers are shown here.
- **Two ways to practice:**
  - **Walk through one simulation:** its command steps in order, with the story at step 1.
  - **Mixed:** steps from all simulations, 10/20/all.
- **What each question shows:** the step's exact prompt and the output from the previous command, just like in the simulation.
- **Wrong options:** they come first from the *other* steps of the same simulation, since mixing up step 1 and step 3 is the common mistake, then from other simulations on the same platform. A wrong option is used only if the simulation's own grader would reject it, so each question has one right answer.
- **After submitting:** you see the right command typed at the prompt, the output it produces, and the step's explanation. Results list missed steps with the correct command, and missed commands also go back into flashcard review when the deck has them.
- **Tests:** `tests/sim-cmd-quiz.test.js` (new, 14 checks) confirms all 39 steps produce questions, the grader accepts every right answer and rejects every wrong option, and walk-through order, same-simulation wrong options, track filtering and a UI run work. Full regression: all 13 test files pass.

### New Security+ simulations (2026-11-24)
- **Six new terminal labs**, also used as exam PBQs:
  - mapping a subnet with `nmap -sn` and `nmap -sV`
  - certificate warnings with `openssl s_client` and `openssl x509 -text -noout`
  - verifying a download with `sha256sum`, then `chmod +x`
  - a GPO that isn't applying, with `gpresult /r` and `gpupdate /force`
  - security headers with `curl -I`
  - an unexpected local admin, with `net localgroup administrators`, `net user` and `net user /active:no`
- The track now has 24 Security+ simulations and 51 command steps across all labs.
- Existing questions, practice exams and saved progress are unchanged.

### Simulation Command Recognition (replaces the Simulation Commands section)
- **Where:** **🧩 Sim Command Recognition** in CLI Mastery. It is separate from the Command Quiz.
- **Question bank:** about 200 multiple-choice questions built from every command, option, file path and output in the simulations.
- **Question types:**
  - **Step → command:** full syntax as answers. Wrong options come from other steps of the same simulation, then same-OS simulations, and the simulation's own grader must reject them.
  - **Command → purpose:** a wrong purpose is always a step the shown command would fail.
  - **Option meanings:** what `-n`, `/all`, `-text` and so on mean inside the simulation's command. Meanings come from the command deck, and the other options of the same command are preferred as wrong answers.
  - **Read the output:** every question the simulations ask about their output. Typed answers become multiple choice, with look-alike values from the same output (other PIDs, ports, IPs, accounts).
  - **File paths:** which file a step uses, plus 18 common security paths such as `/etc/shadow`, `/var/log/auth.log`, `sshd_config`, `authorized_keys`, the Windows hosts file, SAM and Startup.
- **Practice options:** walk through one simulation in order, or mixed with 10/20/40/full bank. Pick one question type or mixed. **Missed only** reruns what you got wrong last time.
- **Feedback:** after Submit Answer, you see the command at the prompt with its output, the explanation, and every option of that command with its meaning.
- **Priority:** missed questions come first, and commands missed in exam simulations get a boost.
- **Progress:** saved per question under `cybersec_simrec_v1` and included in Backup/Restore. Old quiz history is carried over.

### Attack Recognition (new 🛡️ Attacks tab)
- **Attacks covered:** 41 commonly confused SY0-701 attacks:
  - XSS (stored, reflected and DOM), SQLi, CSRF, SSRF, directory traversal and command injection
  - buffer overflow, race condition/TOCTOU and privilege escalation
  - replay, on-path, ARP poisoning, DNS poisoning and session hijacking
  - password spraying, credential stuffing, brute force, rainbow tables, birthday/collision and pass-the-hash
  - evil twin, rogue AP, deauth, jamming, bluesnarfing and bluejacking
  - downgrade, DDoS amplification, MAC flooding and VLAN hopping
  - clickjacking, watering hole, typosquatting, BEC, spear phishing, whaling, vishing, smishing and DNS tunneling
- **Question bank:** 205 original questions in four formats: description → attack, attack → description, scenario or sanitized log → attack (two scenarios per attack), and attack → best mitigation.
- **One right answer:**
  - Wrong options favor the attacks most often confused with the right one.
  - A look-alike that could also be correct for a scenario is never offered; for example, on-path is not offered for an ARP-poisoning scenario.
  - Overlapping or catch-all mitigations are never wrong options.
- **Feedback:** after Submit Answer, you see a memory hook, the tell-tale sign, the best mitigation, and how each wrong option differs from the right attack.
- **Options:** 10/20/40/full bank, format and attack-group filters, and **Missed only**.
- **Priority:** missed questions come first, and other questions about a missed attack are moved up too.
- **Comparison table:** a searchable table with what each attack is, its sign, its mitigation and what it's confused with.
- **Progress:** saved under `cybersec_attacks_v1` (per question and per attack) and included in Backup/Restore.

### Separate from exam scores
- Both modules are supplemental drills. They never touch exam history, readiness estimates or practice exam scores.
- They work offline and use the same mobile layout as the Ports and Command quizzes.

### Tests
- New: `tests/sim-recognition.test.js` (30 checks) and `tests/attack-quiz.test.js` (35 checks).
- Updated: `tests/sim-cmd-quiz.test.js`.
- Full regression: all 15 test files pass (346 checks).

### Practice Exams 11-15: new-question exams (2026-11-26)
- **Five new Security+ practice exams**, each built like the real exam: 90 items in total.
  - 86 multiple-choice questions split 10/19/16/24/17 across the five SY0-701 domains.
  - 4 PBQs: a command-line task, two interactive tasks, and a large simulation.
  - Each exam has 3 or 4 "Select TWO" questions.
- **All new content**, original and written for these exams:
  - 432 questions (`src: original-2026-11-pe`). 430 are used in the exams, and the 2 spares go into the general bank.
  - 20 PBQs:
    - 5 command-line tasks: `chmod 600`, `ipconfig /displaydns`, `schtasks /query /fo list /v`, `dig txt`, `sudo -l`.
    - 10 interactive tasks: Windows Security log, firewall log, phishing headers, SPF/DMARC records, scan-report triage, VPN settings, an HR access matrix, a hybrid-cloud zone diagram, order of volatility, and attack-to-mitigation matching.
    - 5 large simulations: an unauthorized SSH key, a malicious Windows service, a SYN flood, an opened phishing payload, and locking down a server with `ufw`.
  - Nothing is shared with Practice Exams 1-10.
- **Style:** questions follow the Messer benchmark style (aggregate statistics only; no Messer content is in this app).

| Measure | New exams | Messer |
| --- | --- | --- |
| Scenario stems | 100% | 85% |
| BEST / FIRST / NEXT / MOST wording | 47% | 51% |
| Correct answer is the single longest option | 10% | 12.4% |
| Correct-to-wrong option length ratio | 1.01 | 1.09 |
| Stem keyword gives away the answer | under 1% | 3.2% |
| Average stem length (words) | 31 | 36 |

- **Kept fresh until you take them:**
  - Until an exam has been taken once, its questions and PBQs are held out of Fresh Cold Runs, quizzes, flashcards, the daily challenge, PBQ practice and the simulation drills.
  - Taking an exam releases only that exam's items.
  - The exam picker shows them as "Practice Exam 11 (new questions)".
- **Unchanged:** Practice Exams 1-10, every existing question and PBQ, and all saved progress.
- **Tests:**
  - New: `tests/new-practice-exams.test.js` (24 checks). It covers structure, originality, answer keys, style measures, PBQ and simulation grading, and the hold-back and release.
  - Updated: `practice-forms`, `pbq-scoring` and `app-integration`, for 15 exams and 15 large simulations.
  - Full regression: all 16 test files pass.

### Practice Exams 16-18: Standard PBQ Format (2026-11-26)
- **Purpose:** an alternative readiness benchmark that relies less on long terminal simulations and exact command syntax. Difficulty stays at exam level.
- **Format of each exam:**
  - 86 original multiple-choice questions, split 10/19/16/24/17 by domain (the SY0-701 weighting), with 4 "Select TWO" questions per exam.
  - 4 interactive PBQs, each taking about 2-5 minutes.
- **The 12 PBQs:**
  - Configuration tables: a DMZ firewall rule base, a clinic access matrix, and risk-to-control selection.
  - Evidence selection: a web attack log, a domain controller log showing lateral movement, a certificate failure, `netstat` output interpretation, and a DMZ scan report.
  - A hospital segmentation diagram.
  - Ransomware incident response ordering.
  - Matching: requirement to control, and indicator to attack.
  - There are no terminal simulations and no typed commands.
- **Objective audit:**
  - The existing Security+ exam pool (1,354 questions) was mapped against 544 concepts from the published SY0-701 objectives, using keyword rules.
  - 223 concepts had 3 or fewer questions, and 41 had none.
  - The 258 new exam questions were chosen to cover all 223; 221 of them address at least one underrepresented concept.
  - The full coverage report is in the Claude doc "Security+ Practice Exams 16-18: Objective Coverage Report".
- **Originality:** no question shares more than 35% of its key words with any earlier question; this is checked by test.
- **Style (benchmark figures are aggregate statistics only):**
  - BEST/FIRST/NEXT/MOST wording: 50%, against 51% for Messer.
  - Correct answer is the single longest option: 13%, against 12.4%.
  - Correct-to-wrong option length ratio: 1.01, against 1.09.
  - Keyword giveaway: 2.4%, against 3.2%.
  - Average stem length: 29 words, against 36.
- **Labels:** the exam picker and Readiness table show "(Standard PBQ Format)". Each exam's note states that neither PBQ format reproduces the real CompTIA exam exactly.
- **Hold-back:** like Exams 11-15, each exam's questions and PBQs stay out of Fresh Cold Runs, quizzes, flashcards, the daily challenge and PBQ practice until that exam has been attempted.
- **Unchanged:** all earlier exams, study modules, scoring and saved progress.
- **Tests:**
  - New: `tests/standard-practice-exams.test.js` (25 checks).
  - Updated: `practice-forms`, `pbq-scoring` and `new-practice-exams`, for 18 exams.
  - Fixed: an intermittent check in `attack-quiz`.
  - Full regression: 17 test files, 396 checks, all passing.

### Terminal help function and Help Drill (2026-11-27)
- **Why:** the real Security+ exam terminal had a help function, and the app's terminals didn't. Every simulated terminal now has one, in Terminal Lab, terminal and simulation PBQs, and single-command PBQs, on all tracks.
- **Linux commands:**
  - `help` or `?` lists the commands.
  - `COMMAND --help`, `man COMMAND`, `help COMMAND` and `sudo COMMAND --help` show usage and options.
  - `openssl x509 -help` shows help for one subcommand.
- **Windows commands:**
  - `HELP` or `/?` lists the commands.
  - `COMMAND /?`, `COMMAND -?`, `HELP COMMAND` and `Get-Help COMMAND` show usage and options.
  - `NET HELP USER` and `NET USER /?` show help for one subcommand.
- **Coverage:** 39 commands, including every command the labs, simulations and the Help Drill use.
- **Rules:**
  - Help never uses up a try or locks an exam step, and it doesn't change scoring.
  - Help describes commands and options only. It never prints a step's answer, and a test checks this.
  - In a single-command PBQ, help output appears under the box and the box is cleared, so a help lookup is never graded as your answer.
- **🆘 Help Drill (CLI Mastery):**
  - 24 "find it with help" tasks (14 Linux, 10 Windows), each needing an option you may not have memorized.
  - Look up the options for free, build the command, and the score counts commands that work on the first try.
  - Choose 5, 10 or all tasks. Missed tasks come back first, and there is a Missed only mode.
  - Progress is saved under `cybersec_helpdrill_v1` and included in Backup/Restore.
- **Tests:**
  - New: `tests/terminal-help.test.js` (25 checks).
  - Full regression: all 18 test files pass.

### CySA+ CS0-004 Phase 2 upgrade (2026-11-27)
Built against the official CS0-004 V4 exam objectives (document version 2.0): 15 objectives in 4 domains weighted 34/26/24/16, and the official acronym list. Everything below is an unofficial study aid. Scores are practice estimates, not CompTIA scaled scores, and nothing here predicts a pass.

**Before and after (CySA+ only)**

| Item | Before | After |
|---|---|---|
| Multiple-choice pool used by exams | 828 (rewritten in place, IDs kept) | 828 rewritten + 414 new (405 in Exams 11-15, 9 extra practice) |
| PBQs | 60 | 120 (60 new interactive PBQs) |
| Fixed practice exams | 10 | 15 (11-13 Standard profile, 14-15 Advanced Analyst profile) |
| Objective-tagged questions | 0 | 1,242 |
| Analyst Training drills | none | 48 drills, 119 questions, 6 modules |
| Recognition quizzes | none | 11 types, 213 items, plus the Acronym Trainer |
| Acronyms | none | 374 (CySA+ 81 + Security+ 336 official entries) |
| Command and query lessons | none | 17 lessons, 60 questions |
| Investigations | none | 12 cases x 3 levels, 72 stages |
| Objective study notes and readiness | none | 15 notes, per-objective readiness with recommendations |

**Coverage matrix (after).** MC = rewritten pool + new exam questions. PBQ before/new. Drills = Analyst Training questions. Cases = investigations touching the objective. Every objective also has one study note. The 'PBQ before' column comes from the earlier mapping, where some older PBQs count under more than one objective.

| Objective | MC pool | MC new | PBQ before | PBQ new | Drills | Cases |
|---|---|---|---|---|---|---|
| 1.1 Architecture | 53 | 26 | 10 | 3 | 0 | 2 |
| 1.2 Indicators | 64 | 36 | 9 | 8 | 29 | 8 |
| 1.3 Tools | 97 | 31 | 8 | 7 | 15 | 4 |
| 1.4 Threat intel and hunting | 48 | 20 | 2 | 6 | 16 | 2 |
| 1.5 Efficiency | 13 | 15 | 1 | 2 | 0 | 0 |
| 1.6 AI in SecOps | 7 | 15 | 0 | 0 | 0 | 0 |
| 2.1 Scanning methods | 32 | 25 | 3 | 1 | 2 | 2 |
| 2.2 Tool output | 51 | 26 | 4 | 4 | 9 | 1 |
| 2.3 Prioritize and mitigate | 92 | 36 | 5 | 5 | 8 | 2 |
| 2.4 Controls and risk | 42 | 20 | 0 | 2 | 0 | 1 |
| 3.1 Attack frameworks | 22 | 20 | 0 | 2 | 0 | 1 |
| 3.2 IR process | 105 | 36 | 13 | 4 | 11 | 4 |
| 3.3 IR techniques | 66 | 41 | 14 | 10 | 8 | 7 |
| 4.1 VM reporting | 63 | 31 | 1 | 3 | 8 | 2 |
| 4.2 IR reporting | 73 | 36 | 2 | 3 | 13 | 3 |

Objective tags come from keyword mapping, then manual review during the rewrite. Some questions touch more than one objective; each is counted once, under its main objective.

**Multiple-choice quality (pool of 828, automated checks)**

| Measure | Before | After | Target |
|---|---|---|---|
| Scenario-based stems (heuristic) | ~27% | ~92% | 85-95% |
| BEST / FIRST / NEXT / MOST wording | 36% | 48% | 45-60% |
| Correct answer uniquely longest | 21% | 7.8% | about 12% |
| Correct-to-distractor length ratio | 1.06 | 0.97 | 0.95-1.10 |
| Keyword giveaways | 9.2% | 2.9% | minimal |
| Average explanation length | 7 words | 23 words | explain the distractors |
| Select TWO items | 0 | 11 (pool) + 46 (new exams and extras) | some |

New exam questions: correct answer uniquely longest in 4%, answers spread A-D (about 90 each). The Advanced Analyst exams average about 23-word stems vs. 15 on Standard, and they have 16-19 Select TWO items each vs. 3-4 on Standard.

**What was added**
- **Rewrite of all 828 pool questions:** trivia was replaced with exam-level questions on the same objective, giveaways and length bias were removed, and explanations now cover the distractors. IDs and progress were kept.
- **🧪 Analyst Training:** 6 modules (SIEM, vulnerability management, threat hunting, network traffic, IR/forensics, reporting). Each drill has synthetic evidence, feedback, missed review and per-module progress. Key `cybersec_atc_v1`.
- **🔤 Acronyms:** official lists, with flashcards (spaced review) and four quiz modes: acronym to meaning, meaning to acronym, what it does to acronym, and scenario to acronym. Notes appear where CompTIA's printed expansion differs from common usage. Key `cybersec_acronyms_v1`.
- **🧠 Recognition:** 11 quick quizzes covering Event IDs (both directions), Linux logs, SIEM alerts, ATT&CK tactics, scanner output, intel terms, tool selection, IR actions, CVSS (both directions), traffic anomalies and reporting metrics. Key `cybersec_recognition_v1`.
- **🧾 Commands & Queries:** 17 lessons tiered core, supplemental or advanced. The tiers are the app's guidance, not CompTIA's; CompTIA lists tools and skills, not syntax. Key `cybersec_cmdquery_v1`.
- **60 new PBQs:** 12 SIEM, 12 vulnerability, 10 IR, 8 network, 8 intel/hunting, 6 reporting, 4 forensics. All give partial credit. Formats: evidence selection, table dropdowns, matching, ordering and zones.
- **🕵️ Investigations:** 12 multi-stage cases at beginner, intermediate and advanced levels, kept separate from exams. Key `cybersec_invest_v1`.
- **Practice Exams 11-15:**
  - Each has 81 MC + 4 PBQs and covers every objective.
  - All five are held back from every other study mode until taken.
  - 20 of the new PBQs are reserved for these exams; the other 40 are in normal practice.
- **Objective readiness (Readiness tab, CySA+):**
  - Accuracy per objective, using exam answers (70%) and drills and cases (30%).
  - An objective needs at least 8 answers before it is rated.
  - Shows the three highest-value objectives to work on next, with study notes and links.

**Remaining gaps (honest list)**
- 1.6 (AI) has no PBQ, Analyst Training drill or investigation yet; it is covered by 22 MC and a study note.
- Analyst Training has no drills tagged 1.1, 1.5, 2.4 or 3.1. Those objectives rely on MC, PBQs, recognition quizzes and notes.
- 1.5 and 3.1 are still the thinnest MC objectives in the main pool (13 and 22). The new exams add 15 and 20.
- The 869 supplemental CySA+ questions (held out of exams) were not rewritten or objective-tagged.
- Objective readiness uses exam answers and two practice modules. Quiz-mode answers, recognition quizzes and command lessons are not counted yet.
- Quality measures are automated heuristics (length, wording, keyword overlap). They don't replace expert review. Technical content was written carefully but has not been independently validated.

**Tests (27 files, all passing)**
- New: `cysa-bank-quality`, `analyst-training`, `acronyms`, `recognition`, `cmd-query`, `cysa-pbq-v2`, `investigations`, `cysa-new-exams`, `objective-readiness`.
- Updated: `practice-forms` now expects 15 CySA+ exams.
- The existing Security+, Network+, A+ and Linux tests are unchanged and still pass. That covers exposure engine, saved exams, partial credit, flashcards, terminal labs and help, readiness and practice forms.
- Mobile: Analyst Training, Acronyms and Commands & Queries were checked in a narrow (about 630 px) preview, and evidence blocks and code tables wrap on small screens. Recognition, Investigations and the objective readiness panel use the same layout but weren't screenshot-checked. Nothing was tested on a physical phone.

**Known limitations**
- All logs, hosts, people and data in drills, PBQs and cases are fictional.
- The Advanced Analyst profile is harder by design, so scores aren't directly comparable with Standard exams.
- Command syntax shown in lessons reflects common tool versions; options can differ by version and platform.

### UI/UX pass (2026-11-27)
Audit first (narrow-screen screenshots), then four increments. The dark theme, colors, boot animation and Study-Bot are unchanged.
- **Navigation:** the sidebar and phone menu follow your track. For CySA+ the groups are Learn (Notes, Flashcards, Acronyms, Commands & Queries, Recognition), Practice (Quizzes, Analyst Training, Investigations, CLI Mastery), Exams and Progress. Security+ and Network+ have their own layouts. Other tools move into a collapsible **More tools** group, so nothing is removed.
- **Readiness** now opens on your track's certification, so the CySA+ objective panel shows without switching. With no data yet, it suggests starting with a full practice exam.
- **Home — Today's plan:** up to four next steps from your own progress: the next untaken practice exam, your weakest objective, due or new acronym cards, missed drill questions and the next investigation. Each step opens with one tap. It replaces the generic suggestion when there is a plan to show.
- **Exam Mode quick start:** Practice Exam N (next untaken), Cold Run and Quick 20 (untimed, instant feedback). The long configuration moved into a **Custom exam settings** section, collapsed on phones and open on wide screens.
- **Polish:**
  - Dropdowns now use the dark theme instead of bright white.
  - Buttons in cards are compact.
  - Stat tiles show two per row on phones, and the objective table becomes stacked cards on phones.
  - The Study-Bot is smaller on phones, closes when tapped, and hides after 3.5 seconds.
  - The Focus button sits bottom-left, and pages leave room at the bottom so the floating buttons don't cover content.
- **Tests:**
  - New: `tests/ux.test.js` (11 checks).
  - All 28 test files pass.
  - A pre-change backup is saved as `index_backup_2026-11-27_before-ux-pass.html`.
- **Round 2:**
  - Quizzes get a quick start (question bank, review queue, speed drill), and the long settings list is collapsible.
  - PBQs no longer show their prompt twice.
  - Quick 20 is now multiple choice only.
  - The Daily Challenge uses the rewritten bank instead of the older supplemental questions.
  - On phones, the intros on the new tabs collapse to two lines (tap to expand).
  - A one-time "New in this update" card appears on Home for the CySA+ track.
  - The quiz tag chips wrap on small screens.
  - `tests/ux.test.js` now has 16 checks.
- **Round 3:**
  - Notes get a search box at the top, wired to the existing search, so you don't need the sidebar on a phone.
  - The Network+ "Load Module 1-11 Notes" button shows only on the Network+ track.
  - Note action buttons sit side by side on phones.
  - Flashcards say that tapping the card flips it, and point to Due for Review and the Acronyms deck.
  - The Dashboard empty state offers Exam Mode and Quiz buttons.
  - `tests/ux.test.js` now has 20 checks.

### Phase 3, step 1: app security and storage reliability (2026-11-28)
Tracked in `PHASE3_CHECKLIST.md`. This step hardens how the app handles saved and imported data. There are no content changes.
- **Backup restore is validated before anything is written.**
  - Only the known backup keys are accepted. Unknown keys are ignored.
  - Every value must be text. Objects are re-serialized, and values that should be JSON must parse.
  - Notes are structurally sanitized.
  - Files over 40 MB are refused before reading.
  - The data being replaced is copied to `cybersec_restore_undo_v1` first, when storage space allows.
  - Nothing from a backup is ever evaluated as code.
- **Notes are sanitized on every load.** This applies to storage, backup restores and Markdown imports.
  - Non-object entries are dropped.
  - Unsafe or duplicate ids are replaced.
  - Text fields are coerced to text, and tags to a list of strings.
  - Unexpected nested objects and `__proto__` keys are discarded.
  - Note ids written into HTML attributes are now escaped. Previously a crafted id could inject an attribute into the note list.
- **Corrupted storage recovery.**
  - Before any feature loads, each saved value is checked for readable JSON and the expected top-level shape (list or object).
  - A bad value is moved to `cybersec_quarantine_v1` and removed from its live key, so that feature starts fresh instead of stopping the app. A short notice is shown.
  - Null entries in the missed-question queue, activity log and badge list are dropped.
  - The activity log loader now tolerates a non-list value. A non-list value used to crash startup.
- **Tests.** New `tests/app-security.test.js` (37 checks) covers:
  - A hostile note rendered on 15 tabs.
  - Hostile settings values.
  - Every backed-up key holding invalid JSON, wrong shapes, `null`, numbers, strings and arrays with null entries.
  - Payload validation and prototype pollution.
  - An end-to-end restore that confirms the undo snapshot, sanitization, non-execution, malformed files and oversized files.
- **Technical accuracy audit (P1).**
  - Automated cross-checks: Event IDs, Sysmon IDs, ports, CVSS vectors, ATT&CK IDs and IR lifecycle names.
  - A 60-item stratified manual sample. It was an AI review, not an independent expert review.
  - Results and classifications are in `ACCURACY_AUDIT.md`.
  - Fixed:
    - Wrong Microsoft Defender Event IDs in the Windows event ID note.
    - A PsExec ATT&CK mapping.
    - An ambiguous indicator-type question.
    - A historically wrong supplemental question.
- **Coverage explorer and gap fill (P2).**
  - Every one of the 194 CS0-004 objective bullets is matched against the app's content. Results are in `COVERAGE_MATRIX.md`, and the Readiness tab now has a Coverage explorer with Practice buttons for each subtopic.
  - 48 new scenario questions fill the bullets that had little or no practice.
- **AI in Security Operations (P3), objective 1.6.** Details in `AI_MODULE.md`.
  - 24 multiple-choice questions and 8 PBQs.
  - A 🤖 Analyst Training module with 4 drills.
  - 2 Investigations.
  - A 🤖 Recognition type with 20 items.
- **CySA+ depth round (2026-11-28).**
  - All CySA+ PBQs are now tagged to an objective.
  - 12 new PBQs for the thinnest objectives.
  - 4 new Investigations focused on vulnerability management and reporting (18 total).
  - A new **🧩 PBQ workout** quick start in Exam Mode: 5 untimed PBQs with instant feedback, aimed at your weakest objectives.
- **Phase 4 follow-ups (2026-11-28).**
  - **Every CS0-004 objective bullet now has hands-on practice.** 22 new Analyst Training drills were added, including a new 🏗️ Architecture & Identity module.
  - **The SOC Simulator now has 6 shifts:** insider data loss, e-commerce web attacks and a manufacturing IT/OT plant were added.
  - **The two CDN libraries are pinned with integrity hashes.**
  - **Fixes:** a dropdown that overflowed on phones, and two Commands & Queries syntax errors.
- **Study planner, documentation and final report (P12, P13, P15).**
  - The planner has an "I have time now" session builder (5, 15, 30, 60 minutes or custom), a weekly summary and exam-weighted domain focus. There are no streaks.
  - The Readiness tab exports a progress report as a Markdown file.
  - Backups now include every user-data key.
  - New documents: `ARCHITECTURE.md`, `DATA_MODEL.md`, `SECURITY.md`, `TESTING.md`, `METHODOLOGY.md`, `CHANGELOG.md` and `FINAL_REPORT.md` (self-assessed at 79.5/100, with gaps listed).
- **Accessibility and small screens (P11).** Fixes from an audit at 320-1024 px:
  - two horizontal-scroll bugs on phones;
  - readable light-theme colours;
  - labels on all form controls;
  - a minimum text size of 11 px;
  - visible keyboard focus;
  - support for the reduced-motion setting;
  - landmarks and a skip link.
  The dark theme is unchanged. Details are in `ACCESSIBILITY.md`.
- **SOC Simulator, PBQ fairness and Query sandbox (P8-P10).**
  - The **🖥️ SOC Simulator** (CySA+) runs three shifts with 18 synthetic alerts. As Tier 1, you pick the key telemetry line, choose a disposition (escalate, benign true positive, or false positive) and set a priority. As Tier 2, you decide the next step for each incident you escalated. A shift report scores triage, escalations and missed incidents.
  - **PBQs:**
    - Command answers now accept different capitalization, extra spaces, quoted search terms and flag letters in a different order.
    - Match and build PBQs work fully by keyboard and screen reader.
    - Order steps have labelled move buttons.
  - The **Query sandbox** in Commands & Queries is labelled "Simulated". It runs SPL-style, KQL-style and Wireshark display-filter queries over synthetic data, includes 8 checked challenges and explains common syntax mistakes.
- **Adaptive learning, readiness and weakness notebook (P5-P7).**
  - Every graded answer from Exam Mode, Quizzes, Analyst Training and Investigations goes into one evidence log, marked first try or repeat.
  - Quizzes and Exam Mode have optional **Sure / Unsure / Guessing** buttons.
  - **🎯 Adaptive · 15** (CySA+ Quizzes) weights questions toward your weakest objectives and recent misses. It never uses questions held back for exams you haven't taken.
  - The Readiness tab reports **certification readiness** (never-seen exam questions) and **analyst proficiency** (first-try drill and case accuracy) separately, each with a list of evidence checks and a "How these are calculated" note.
  - The **📓 Personal Weakness Notebook** lists confident misses first (likely misconceptions), keeps your own notes, has a practice button, and clears an entry after two correct answers in a row.
- **Validation Exams 16-18 (P4).** Three new full-length CySA+ exams: 243 new questions and 12 new PBQs, Standard profile. Each is held back until you take it. A separate check pass and its limits are described in `VALIDATION_EXAMS.md`.
- **Readiness excludes Advanced exams.** Practice Exams 14–15 (Advanced Analyst profile) no longer count toward the certification readiness estimate. They are listed separately on the Readiness tab.
- **Not done.** A Content-Security-Policy header is not set. The app is one offline file with inline scripts, so a strict CSP would need a build step. The mitigations above rely on escaping and validation instead.

### Notes
- Practice scores are not an official CompTIA prediction. CompTIA's scaled scoring is proprietary.
- Third-party practice exams (for example, Professor Messer's) are kept out of this app on purpose, so they stay independent readiness checks.
