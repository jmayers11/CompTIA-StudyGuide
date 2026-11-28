# AI in Security Operations (CS0-004 objective 1.6)

Added 2026-11-28 in Phase 3, step P3.

## Scope
The content follows the objective 1.6 bullets as listed in Chapple's *CySA+ Study Guide* (CS0-004):
- **Use cases:** comparing artifacts, analyzing log files, document creation, incident investigation, correlation, automation and orchestration.
- **Governance:** legal and regulatory compliance, AI usage policies.
- **Risks:** hallucinations, data exposure, model poisoning, malicious prompts.

Some content reaches past the objective wording: indirect prompt injection, least privilege for AI tools, and AI audit logs. Each of these is a direct application of a listed risk or governance bullet, not a separate topic. The one EU AI Act item quotes Chapple's framing. No content claims to reproduce real exam questions.

## Why new multiple-choice questions were added
- Before this step, the core pool had 22 questions tagged to 1.6.
- Objective 1.6 is one of six objectives in Domain 1 (34% of the exam), so a full 85-question exam has about 5 questions from it. CompTIA does not publish per-objective weights, so this is an even-split estimate.
- At that rate, Fresh runs start repeating 1.6 questions after roughly four exams.
- 24 new questions bring the core pool to 46. Applied practice is where the real gap was: there were no 1.6 PBQs, drills or cases before this step.

## What was added
| Item | Count | Where |
|---|---|---|
| Multiple choice (rev 2026-11-cs4ai) | 24 (8 Select TWO) | Question bank: Quizzes, Fresh exams, the Coverage explorer |
| PBQs | 8: 2 zones, 2 match, 2 evidence, 1 config, 1 order | Exam Mode PBQ pool |
| Analyst Training drills | 4 (2 core, 2 advanced), new 🤖 module | Analyst Training |
| Investigations | 2 six-stage cases (prompt injection; hallucinated report) | Investigations |
| Recognition items | 20, new 🤖 type | Recognition |

## Verification
- `tests/ai-secops.test.js` checks counts and structure: valid answers, zone mappings, evidence line indexes, config options and drill formats.
- The content was reviewed against the Chapple chapter text by the same AI assistant that wrote it. This is not an independent expert review.
