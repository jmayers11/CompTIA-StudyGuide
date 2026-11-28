# Changelog

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
