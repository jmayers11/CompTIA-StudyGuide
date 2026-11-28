# Accessibility and screen-size audit (Phase 3, P11)

Date: 2026-11-28. WCAG 2.2 AA was used as the reference. This is a self-audit with scripts and a real browser. It is not a certified conformance review, and it was not tested with a screen-reader user.

## How it was checked
1. **Viewport overflow in a real browser.** The browser ran the published copy of the app at 320, 375, 430, 768 and 1024 px wide, and every tab was opened in turn. A script flagged any element that extended past the screen edge without its own scroll container. (390 px sits between the tested 375 and 430 px widths and uses the same layout rules.) The published copy predates Phase 3, so the fixes were injected into the page and then re-measured. The new Phase 3 screens use the same table and grid components plus their own mobile CSS. They were checked by code review and by `tests/*.test.js`, not by this browser pass.
2. **Static audit of the whole file** (`tests/accessibility.test.js`, 28 checks):
   - colour contrast for every theme text colour;
   - form-control names;
   - minimum font size;
   - focus styles and reduced motion;
   - landmarks and skip link;
   - tab order.
3. **Runtime check of accessible names** in the browser: buttons with no name, and visible inputs with no label, on every tab.

## Findings and fixes
| Finding | Where | Fix |
|---|---|---|
| Horizontal scrolling at 320-430 px: some study-sheet cards with long unbroken terms widened the grid to about 410 px | Cram sheet | Grid columns use `minmax(0,1fr)` and terms wrap anywhere |
| Status tag pushed off-screen on narrow phones | Home, track status board | Rows wrap at 420 px or narrower; labels can shrink |
| Light theme accent, warning, success and error text below 4.5:1 (3.0-4.4) | Light theme only | Darker light-theme tones (5.0, 4.5, 4.6 and 5.9:1). The dark theme is unchanged. |
| Orange status text hard-coded (1.8:1 on white in the light theme) | Readiness, Coverage explorer, Notebook, SOC queue, exam review | Uses the theme's warning and danger colours |
| 12 visible inputs and selects with no accessible name, plus 14 more in notes, flashcards and the command palette | Quizzes, Exam Mode, Planner, Notes, Flashcards | `aria-label` added to all 26 |
| Order-step arrow buttons announced only as "↑"/"↓" | PBQs | "Move step N up/down" labels |
| Drag-and-drop matching had no keyboard path | Match and build PBQs | Chips and slots are focusable buttons that respond to Enter and Space (P9) |
| 29 font sizes of 9-10.5 px | Badges, captions | Minimum raised to 11 px |
| `outline:none` on some controls with no replacement focus style | Various | Global `:focus-visible` outline in the accent colour |
| Animations ignored the reduced-motion setting, apart from the sidebar | Boot animation, transitions | Respects `prefers-reduced-motion`. The boot sequence still runs, but without motion. |
| No landmarks or skip link | App shell | `role="main"`, a labelled navigation region and a "Skip to main content" link |

## Already in good shape
- `lang="en"` is set, and the viewport tag allows pinch zoom.
- No positive `tabindex` values.
- On every tab, no visible button lacks a name.
- Dark theme contrast: all text colours are 5.7:1 or higher on panels.

## Known gaps
- No testing with VoiceOver or NVDA users. Labels and roles were checked in code and in the browser, not by listening to them.
- Some long PBQ exhibits still scroll horizontally inside their own box on small phones. That's deliberate, so log lines aren't wrapped mid-field, but it's harder to read.
- The tour, Study-Bot bubbles and some older modal dialogs were not reviewed for focus trapping.
