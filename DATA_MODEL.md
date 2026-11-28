# Data model

All user data lives in `localStorage` on the device. Keys are versioned (`_v1`). Each feature reads its own key with defaults and a try/catch. At startup, `STORAGE_REPAIR` moves any unreadable or wrong-shaped value to `cybersec_quarantine_v1` so that feature starts clean, and nothing is lost.

## Content (inside index.html)
| Structure | Shape (simplified) |
|---|---|
| `RAW_CYSA_BANK` (2,426 MC) | `{domain, question, options[], correct[idx], why, obj:'1.1'..'4.2', rev, lvl:'s'|'a', oid?}` (`rev` = rewrite or new-item batch; no `rev` = supplemental) |
| `PBQ_BANK` (359, 140 CySA+) | `{type, cert, domain, prompt, obj?, rev?, ...type fields}`. Types: match, order, zones, evidence, config, build, cli, terminal (plus calc and macid for Network+) |
| `PRACTICE_FORMS[cert]` | `[{n, reserved?, format:'standard'|'advanced'|'validation', mc:{domain:[ids]}, pbq:[ids]}]` |
| `ATC_DRILLS` | `{id, mod, obj, level, title, art, qs:[{q, o[] (first n correct), n, why}]}` |
| `INVESTIGATIONS` | `{id, title, objs[], brief, stages:[{lvl:'b'|'i'|'a', art, q, o[], n, why, hint}]}` |
| `SOC_SHIFTS` | `{id, title, level, objs[], alerts:[{id, sev, src, tele[], key, disp:'esc'|'btp'|'fp', pri:1-4, why, t2?}]}` |
| `COVERAGE_CONCEPTS` | `[obj, bullet name, keyword regex]` × 194 CS0-004 bullets |

## User data (localStorage)
| Key | Holds | In backup |
|---|---|---|
| `cybersec_notes_v1` | Notes. Built-in seed notes are stored slim and re-hydrated on load | ✓ |
| `cybersec_progress_v1` | Quiz and exam attempts (points, domains, fresh/repeat, form) | ✓ |
| `cybersec_exposure_v1` | Per-question `[seen, lastRun, ?, right, wrong]` per certification, plus run history | ✓ |
| `cybersec_evidence_v1` | `{ev:[[ts, src, cert, id, obj, credit, first, conf]], notes, resolved}`, capped at 6,000 rows | ✓ |
| `cybersec_missed_queue_v1` | Spaced-review queue of missed questions | ✓ |
| `cybersec_flashcard_mastery_v1`, `cybersec_cmd_cards_v1`, `cybersec_acronyms_v1` | Card scheduling (SM-2 / Leitner) | ✓ |
| `cybersec_atc_v1`, `cybersec_invest_v1`, `cybersec_recognition_v1`, `cybersec_cmdquery_v1`, `cybersec_soc_v1`, `cybersec_qsb_v1` | Module progress | ✓ |
| `cybersec_cli_mastery_v1`, `cybersec_cli_lab_v1`, `cybersec_ports_v1`, `cybersec_simrec_v1`, `cybersec_attacks_v1`, `cybersec_helpdrill_v1` | Security+ / Network+ trainers | ✓ |
| `cybersec_study_planner_v1`, `cybersec_exam_date_v1` | Planner settings | ✓ |
| `cybersec_exam_inprogress_v1` | A paused untimed exam | ✓ |
| `cybersec_xp_v1`, `cybersec_badges_seen_v1`, `cybersec_activity_log_v1`, `cybersec_daily_challenge_v1` | Light gamification | ✓ |
| `cybersec_track_v1`, `cybersec_theme_v1`, `cybersec_sound_v1`, text size, density, dyslexia font | Preferences | ✓ |
| `cybersec_restore_undo_v1` | Data replaced by the last backup restore | ✗ (local safety copy) |
| `cybersec_quarantine_v1` | Values set aside by storage repair | ✗ |

## Backups
**Backup / Restore** writes all the "✓" keys into one JSON file. Restore validates the file before writing anything (see SECURITY.md) and keeps an undo copy of the data it replaces.
