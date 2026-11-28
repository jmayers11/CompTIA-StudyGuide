# Methodology: how this app measures progress

Everything here is a practice indicator. CompTIA does not publish how raw answers convert to its 100-900 scaled score, how much each PBQ is worth, or how many PBQs an exam contains, so the app never reports an official score or a probability of passing.

## Exams
- **Points.** Multiple-choice questions are worth 1 point. PBQs are worth 3-6 points with partial credit per part. The practice estimate maps the points percentage straight onto 100-900, so 750 is about 81% of points. This is a simple convention, not CompTIA's scaling.
- **Fresh vs repeat.** Every question you're served is recorded. Accuracy on questions you've **never seen before** is the main readiness signal, because accuracy on repeats is inflated by memory.
- **Held-back exams.** Exams 11-18 keep their questions out of all other modes until you take them, so the first attempt is a clean measurement.
- **Profiles.** Standard (11-13) and Validation (16-18) exams follow the official domain weights and a per-objective quota. Advanced Analyst exams (14-15) are deliberately harder and are left out of readiness.

## Certification readiness
- Uses never-seen questions from your last five full-length exams (40+ questions each).
- Computes a 90% Wilson interval: *On track* if the lower bound clears the passing line, *Borderline* if the point estimate does, otherwise *Not yet*. With fewer than 60 never-seen answers, it reports *Not enough fresh data*.
- Evidence checks are listed alongside: 60+ never-seen questions, 3+ full exams, 20+ answers per domain, at least one Validation Exam, and 8+ PBQs.

## Analyst proficiency (CySA+)
First-try accuracy in Analyst Training and Investigations. It needs at least 30 answers. The thresholds are 60%, 75% and 85%. It measures applied analysis and is reported separately from certification readiness.

## Objective readiness and coverage
- **Objective readiness** combines exam answers (70%) with drill and case answers (30%) for each CS0-004 objective. It needs at least 8 answers.
- **Coverage** counts, for each of the 194 objective bullets, how many items match a keyword pattern. It's approximate (see COVERAGE_MATRIX.md).

## Evidence log, confidence and adaptivity
- **Evidence log.** Every graded answer is logged with a first-attempt flag and an optional confidence rating: Sure, Unsure or Guessing.
- **Adaptive sets.** Each objective is weighted by its official domain weight × (0.25 + need), where need = 1 − recent accuracy, or 0.6 when there's little data. Within an objective, confident misses come first, then other misses, then unseen items, then the least recently seen.
- **Weakness Notebook.** Lists items whose latest answer was wrong. An entry clears after two correct answers in a row.

## SOC Simulator
- Each Tier 1 ticket is scored 50% disposition, 20% priority (one level off earns half) and 30% key evidence.
- The two "close" dispositions earn half credit if confused with each other.
- The shift score is 75% Tier 1 and 25% Tier 2, minus 10 points per real incident closed by mistake.

## Study planner
Domain emphasis = official domain weight × (1 − accuracy). There are no streaks: missed days don't count against you, and the schedule always restarts from today.
