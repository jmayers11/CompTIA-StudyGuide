# CySA+ Validation Exams 16-18

Added 2026-11-28 in Phase 3, step P4.

## Purpose
These are three more full-length practice exams written from scratch. Their job is to check whether a score earned on Exams 1-15 holds up on questions you have never seen. Like Exams 11-15, they are **held back from Fresh exams, quizzes, flashcards and drills until you take each one**, so the first attempt is a clean measurement. Each exam's questions are released into normal practice after you take it.

They follow the Standard profile used by Exams 11-13, not the harder Advanced Analyst profile, so they count toward the Readiness estimate. The score is still an unofficial practice estimate, not a CompTIA scaled score.

## Format
| | Each exam |
|---|---|
| Multiple choice | 81 (Security Operations 28, Vulnerability Management 21, Incident Response 19, Reporting 13) |
| Per-objective quota | Same as Exams 11-15: 1.1:5, 1.2:7, 1.3:6, 1.4:4, 1.5:3, 1.6:3, 2.1:5, 2.2:5, 2.3:7, 2.4:4, 3.1:4, 3.2:7, 3.3:8, 4.1:6, 4.2:7 |
| Select TWO items | 5 (Exams 11-13 have 3-4) |
| PBQs | 4 new, one per domain, no terminal typing (evidence, config, order, match, zones) |

CompTIA publishes a maximum of 85 questions and a 165-minute limit. It does not publish how many PBQs an exam contains, so the 81 + 4 split mirrors this app's other exams and isn't a claim about the real exam.

## How the questions were built
Totals: 243 new multiple-choice questions (rev 2026-11-cs4v) and 12 new PBQs. No question is shared with Exams 1-15 or reuses an existing question ID.

1. **First draft.** Original scenario questions written against each CS0-004 objective bullet.
2. **Verification pass.** This was a separate step after drafting, done with scripts plus a read-through by the same AI assistant that wrote the questions. It is **not** an independent expert review. It made these changes:
   - **Length cue.** In the first draft, the correct answer was the uniquely longest option in about 47% of single-answer items. Distractors were rewritten (about 130 items) and 18 answers were shortened. The final rate is 9%, against a 12% limit, and the correct-to-distractor length ratio is 0.99.
   - **Select TWO count.** The draft had 46 Select TWO items, far more than the Standard profile. 31 were converted to single-answer items with new stems, which leaves 15 (5 per exam).
   - **Joke distractors.** Weak or joke distractors (for example "the cafeteria menu") were replaced throughout with plausible wrong answers.
   - **Overlap with the bank.** Every stem was compared with the existing bank by word overlap. Ten items that tested the same fact as an existing question at an overlap of 0.55 or more were rewritten from a different angle. Examples: reading a pcap instead of writing one, and EPSS versus CVSS on the same pair of findings. Twelve items remain at 0.50-0.55 overlap. They share topic vocabulary but test different facts.
   - **Explanations.** 40 one-line explanations were expanded to say why the answer is right and what the tempting wrong answer misses.
   - **Read-through.** A 30-item random read-through found one item where a distractor could also be defended (fixed) and one where the options didn't match the stem's grammar after conversion (fixed).
3. **Automated gate.** `tests/validation-exams.test.js` (17 checks) enforces:
   - structure, domain split and objective quotas;
   - answer-key validity and Select TWO consistency;
   - the length-cue limits and answer-position balance (no position above 35%);
   - a minimum explanation length;
   - no near-copies (overlap of 0.7 or more) of existing questions;
   - PBQ uniqueness and no terminal PBQs;
   - that these exams count toward Readiness.

## Known limitations
- The reviewer also wrote the content, so blind spots are likely to be shared. An outside reviewer or recent test-taker would catch things this pass can't.
- Difficulty hasn't been calibrated against real performance data. Until attempts exist, there's no evidence these exams predict the real exam better than Exams 11-13.
- Answer position B is somewhat underused (41 of 228 single-answer items, compared with about 60 for the others).
