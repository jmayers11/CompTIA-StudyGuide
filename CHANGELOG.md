# Changelog

## 2026-11-28: CySA+ depth round
- **PBQ tagging.** All 152 CySA+ PBQs now carry a CS0-004 objective. 60 older PBQs had none, which kept them out of objective readiness and coverage. This also makes it possible to target PBQs by objective.
- **12 new PBQs** for the thinnest objectives: 2.1 scan planning, 2.4 control types and remediation, 2.3 context-based prioritization, 3.1 Kill Chain and Diamond Model, 4.1 reporting by audience and remediation inhibitors, 4.2 escalation order and metrics, and 1.5 automation decisions.
- **4 new Investigations** with more weight on vulnerability management and reporting: Patch Tuesday triage, lateral movement mapped to ATT&CK and the Kill Chain, the first 24 hours of a data breach, and a public cloud bucket found by CSPM. That makes 18 cases and 108 stages.
- **🧩 PBQ workout** in the Exam Mode quick start (also offered in 60-minute planner sessions): 5 untimed PBQs with instant feedback, aimed at your weakest or least-practised PBQ objectives. It never uses held-back exam PBQs.

## 2026-11-28: Phase 4 (post-acceptance follow-ups)
- **Live phone-width audit** of the new Phase 3 screens on the published app. Fixed a Coverage explorer dropdown overflow at 320-375 px.
- **Subresource Integrity** for the jszip and pdf.js CDN scripts, with a clear message if a library is blocked.
- **Applied practice for every objective bullet:** 22 new Analyst Training drills (including a new 🏗️ Architecture & Identity module) for the 43 bullets that had only multiple choice. The coverage matrix is now 133 Strong and 61 Adequate, and no bullet is MC-only.
- **SOC Simulator:** 3 new shifts (insider data loss at a law firm, e-commerce web attacks, an IT/OT manufacturing plant). That makes 6 shifts and 36 alerts.
- **Commands & Queries syntax pass** over 17 lessons and 60 questions: 2 fixes (a journalctl `--until` date, an `openssl x509 -enddate` example missing its input file).

## 2026-11-28: Phase 3 "Excellence, Validation and Exam Readiness"
- **P14 Security.**
  - Backups are validated before restore, with an undo copy kept.
  - Notes are sanitized on load, and note-ID escaping was fixed (an XSS bug).
  - Storage repair runs at startup; it fixed real startup crashes on wrong-shaped data.
  - Backups now include all user data.
- **P1 Accuracy.**
  - Automated cross-checks for Event IDs, Sysmon IDs, ports, CVSS and ATT&CK.
  - A 60-item manual sample.
  - Five fixes, including wrong Defender Event IDs in a note.
- **P4 Fidelity.** Advanced exams are excluded from readiness, and the app notes that PBQ counts are not published.
- **P2 Coverage.** A 194-bullet coverage matrix, a Coverage explorer and 48 gap-fill questions.
- **P3 AI in Security Operations (objective 1.6).** 24 MC, 8 PBQs, 4 drills, 2 investigations and 20 recognition items.
- **P4 Validation Exams 16-18.** 243 new MC and 12 PBQs, with a documented verification pass.
- **P5-P7.**
  - An evidence log and confidence ratings.
  - Adaptive practice.
  - Readiness split into certification readiness and analyst proficiency.
  - A Weakness Notebook.
- **P8 SOC Simulator.** 3 shifts and 18 alerts, with Tier 1, Tier 2 and a shift report.
- **P9 PBQ engine.** More tolerant command answers, keyboard and screen-reader drag-and-drop, and a grading sanity sweep.
- **P10 Query sandbox.** Simulated SPL, KQL and Wireshark filters, with 8 challenges.
- **P11 Accessibility.**
  - Overflow fixes at 320 px.
  - Light-theme contrast, labels, focus, reduced motion and landmarks.
- **P12 Study planner.** 5/15/30/60/custom sessions, a weekly summary, exam-weighted emphasis and no streak pressure.
- **P13 Docs and report export.** ARCHITECTURE, DATA_MODEL, SECURITY, TESTING, ACCESSIBILITY, METHODOLOGY and this changelog, plus a Markdown progress report.

## 2026-11-27 and earlier
CySA+ Phase 2 (rewritten pool, Analyst Training, Investigations, Recognition, Commands & Queries, Acronyms, Exams 11-15, objective readiness), three rounds of UI work, and the Security+ and Network+ work described in README.md.
