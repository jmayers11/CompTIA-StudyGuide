# Architecture

CYBERSEC-OS is a **single-file, offline-first study app**: one `index.html` (about 7.2 MB) holds the markup, the CSS, the question banks and all of the application code. There is no server and no build step. Everything the app learns about you is kept in your browser's `localStorage`.

## Runtime layout
```
index.html
├── <style>        theme variables (dark default, light option), component CSS, mobile shell, a11y rules
├── markup         sidebar + tab bar (#tab-bar, role=navigation), #main (role=main), one panel per tab
├── <script> CDN   jszip, pdf.js (only used for importing files; the app runs without them)
└── <script> main  one IIFE, no globals except what the browser needs
     ├── STORAGE_REPAIR      runs first: quarantines unreadable or wrong-shaped saved data
     ├── data                RAW_*_BANK (MC), PBQ_BANK, PRACTICE_FORMS, ATC_DRILLS, INVESTIGATIONS,
     │                       REC_ITEMS, CQ_TOPICS, ACRONYMS, OBJ_NOTES, SOC_SHIFTS, COVERAGE_CONCEPTS, CLI_LABS
     ├── engines             exposure (fresh/repeat selection), readiness, PBQ grading, SM-2 cards,
     │                       evidence log, adaptive selection, query sandbox interpreter
     └── UI modules          one render function per tab, switched by switchTab(tab)
sw.js                        service worker: network-first for index.html, cache fallback offline
tests/*.test.js              Node tests that load the real index.html (see TESTING.md)
```

Code is grouped into marked sections (`/* NAME_START */ ... /* NAME_END */`). The main Phase 3 sections are:

| Section | Purpose |
|---|---|
| STORAGE_REPAIR | Validates saved data before any feature reads it |
| SECURITY_HARDENING | Note sanitizer and backup payload validator |
| EXPOSURE_ENGINE | Tracks seen and unseen questions per certification; drives Fresh/Cold Run exams |
| PRACTICE_FORMS | 18 fixed CySA+ exams (plus Security+ and Network+ forms); held-back items for untaken exams |
| READINESS / READINESS_EVIDENCE | Certification readiness (Wilson interval on never-seen questions) and analyst proficiency |
| OBJECTIVE_READINESS / COVERAGE_EXPLORER | Per-objective accuracy; subtopic coverage with Practice buttons |
| EVIDENCE_ENGINE | Unified answer log, confidence, adaptive sets, Weakness Notebook |
| SOC_SIM | SOC Simulation Center (Tier 1, Tier 2, shift report) |
| QUERY_SANDBOX | Simulated SPL/KQL/Wireshark-filter interpreter over synthetic data |
| PBQ_A11Y | Keyboard and screen-reader access for drag-and-drop; command-answer normalization |
| PLANNER_SESSIONS | Time-boxed session builder and weekly summary |
| STUDY_REPORT | Markdown progress-report export |

## Design choices and trade-offs
- **One file.** It can be copied to a phone, opened offline and hosted on GitHub Pages without any tooling. The cost is that the file is large and the code can't be split into modules. Inline scripts also rule out a strict Content-Security-Policy (see SECURITY.md).
- **Data inside the code.** Question banks are JavaScript literals, so there are no network requests at runtime. Content updates are applied with patch scripts that keep item IDs stable.
- **Stable question IDs.** IDs are a djb2 hash of the original question text. When a question is rewritten, the old hash is kept as `oid`, so your progress carries over.
- **Additive features.** Each Phase 3 module hooks into existing answer handlers (exam grading, quiz answer, drill submit, case stage) instead of replacing them. That's how earlier features keep working.
