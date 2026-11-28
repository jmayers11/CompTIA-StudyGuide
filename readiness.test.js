/* Readiness analytics test: extracts computeReadiness() from index.html and checks the scoring,
   the fresh-question confidence levels, domain weighting, fallbacks and labeling rules.
   Run:  node tests/readiness.test.js [path/to/index.html] */
const fs = require('fs');
const html = fs.readFileSync(process.argv[2] || require('path').join(__dirname, '..', 'index.html'), 'utf8');
const s = html.indexOf('/* READINESS_START */'), e = html.indexOf('/* READINESS_END */');
const { computeReadiness, readinessEstimateFromRaw } = new Function(html.slice(s, e) + '; return { computeReadiness, readinessEstimateFromRaw };')();

const DOMAINS = [
  { key: 'general', label: '1.0 General', weight: 0.12 }, { key: 'threats', label: '2.0 Threats', weight: 0.22 },
  { key: 'architecture', label: '3.0 Architecture', weight: 0.18 }, { key: 'secops', label: '4.0 Ops', weight: 0.28 },
  { key: 'management', label: '5.0 Mgmt', weight: 0.20 }];
let t0 = 1e12;
function exam(raw, fresh, opts = {}){
  const total = opts.total || 90, correct = Math.round(raw * total);
  const ds = {}; DOMAINS.forEach(d => { const n = Math.round(total * d.weight); const p = (opts.dom && opts.dom[d.key] !== undefined) ? opts.dom[d.key] : raw; ds[d.key] = { correct: Math.round(n * p), total: n, label: d.label }; });
  const ft = opts.freshTotal === undefined ? 80 : opts.freshTotal;
  return Object.assign({ ts: t0 += 86400000, cert: opts.cert || 'security_plus', correctCount: correct, total, scaledScore: Math.round(100 + raw * 800), passed: false,
    domainStats: ds, coldRun: opts.coldRun !== false, freshTotal: ft, freshCorrect: Math.round(fresh * ft),
    repeatTotal: 6, repeatCorrect: opts.repeatCorrect === undefined ? 6 : opts.repeatCorrect, pbqTotal: 4, pbqCorrect: opts.pbq === undefined ? 2 : opts.pbq,
    retryAttempts: opts.retryA || 0, retryCorrect: opts.retryC || 0 }, opts.extra || {});
}
const R = attempts => computeReadiness({ cert: 'security_plus', attempts, domains: DOMAINS, passingScore: 750 });
const checks = [];
const ok = (name, cond) => checks.push([name, !!cond]);

// scale + passing line
ok('unofficial estimate is 100 + raw x 800', readinessEstimateFromRaw(0) === 100 && readinessEstimateFromRaw(1) === 900 && readinessEstimateFromRaw(0.8125) === 750 && readinessEstimateFromRaw(null) === null);
const empty = R([]);
ok('no data: insufficient level, no latest, no NaN', empty.level === 'insufficient' && empty.latest === null && empty.fresh === null && empty.examsTaken === 0 && !JSON.stringify(empty).includes('NaN'));
ok('passing 750 maps to 81.25% raw', Math.abs(empty.passRaw - 0.8125) < 1e-9);

// confidence levels driven by fresh accuracy, not raw
const strong = R([exam(0.9, 0.92), exam(0.91, 0.93)]);
ok('fresh well above line with 160 fresh -> On track', strong.level === 'ready' && strong.label === 'On track' && strong.freshTotal === 160);
const border = R([exam(0.88, 0.82), exam(0.87, 0.83)]);
ok('fresh near line -> Borderline', border.level === 'borderline');
const inflated = R([exam(0.95, 0.7, { repeatCorrect: 6 }), exam(0.95, 0.7)]);
ok('high raw but low fresh -> Not yet (repeats do not inflate confidence)', inflated.level === 'not-yet' && inflated.latest.raw > 0.9);
const tiny = R([exam(0.9, 0.95, { freshTotal: 30 })]);
ok('fewer than 60 fresh questions -> insufficient', tiny.level === 'insufficient');
ok('Wilson range brackets the point estimate', strong.fresh.lo < strong.fresh.p && strong.fresh.p < strong.fresh.hi && strong.fresh.lo >= 0 && strong.fresh.hi <= 1);

// weighted vs raw
const lopsided = R([exam(0.8, 0.8, { dom: { general: 1, threats: 1, architecture: 1, secops: 0.5, management: 1 } })]);
ok('blueprint weighting penalises a weak heavy domain (secops 28%)', lopsided.latest.weighted < 0.87 && Math.abs(lopsided.latest.weighted - (0.12 + 0.22 + 0.18 + 0.28 * 0.5 + 0.20)) < 0.02);
ok('weakest domain identified', lopsided.weakest && lopsided.weakest.key === 'secops');

// filters
const mixed = R([exam(0.9, 0.9), exam(0.5, 0.5, { total: 10 }), exam(0.6, 0.6, { cert: 'network_plus' }), exam(0.7, 0.7, { coldRun: false })]);
ok('drills under 40 questions and other certs are ignored', mixed.examsTaken === 2);
ok('trend uses Cold Runs only', mixed.coldRunsTaken === 1 && mixed.trend.length === 1);
const prog = R([exam(0.6, 0.6), exam(0.65, 0.62), exam(0.75, 0.74), exam(0.8, 0.79)]);
ok('improvement = later Cold Runs minus earlier', prog.improvement > 0.1 && prog.improvement < 0.2);
ok('recent list newest first, max 8', prog.recent[0].ts > prog.recent[1].ts && R(Array.from({ length: 12 }, () => exam(0.7, 0.7))).recent.length === 8);
ok('fresh confidence uses only the last 5 full exams', R(Array.from({ length: 7 }, () => exam(0.7, 0.7))).freshTotal === 400);

// PBQ + previously-missed
const pr = R([exam(0.8, 0.8, { pbq: 1, retryA: 10, retryC: 7 }), exam(0.8, 0.8, { pbq: 3, retryA: 10, retryC: 9 })]);
ok('PBQ accuracy aggregated', pr.pbqTotal === 8 && pr.pbq === 0.5);
ok('previously-missed accuracy aggregated', pr.retryTotal === 20 && pr.retry === 0.8);

// migration: old attempts without the new fields fall back to exposure history
const legacy = { ts: 5, cert: 'security_plus', correctCount: 70, total: 90, scaledScore: 722, passed: false, domainStats: {} };
const fb = computeReadiness({ cert: 'security_plus', attempts: [legacy], domains: DOMAINS, passingScore: 750,
  hist: [{ graded: 86, freshCorrect: 70, freshTotal: 80, repeatCorrect: 5, repeatTotal: 6 }, { graded: 10, freshCorrect: 0, freshTotal: 10 }] });
ok('legacy attempts (no fresh fields) work and fall back to exposure history', fb.examsTaken === 1 && fb.freshTotal === 80 && fb.freshSource === 'exposure' && fb.latest.raw > 0.77);
ok('legacy attempts with no history stay insufficient without errors', R([legacy]).level === 'insufficient');

// points scoring (PBQs weighted): estimate and trend use points when present
const pe = exam(0.9, 0.9, { extra: { points: 80, pointsPossible: 102, pbqPoints: 3, pbqPointsPossible: 16 } });
const prr = R([pe]);
ok('points-scored attempts: estimate = 100 + points% x 800, PBQ points aggregated', prr.latest.estimate === Math.round(100 + 800 * 80 / 102) && Math.abs(prr.latest.score - 80 / 102) < 1e-9 && Math.abs(prr.pbqPointsPct - 3 / 16) < 1e-9 && Math.abs(prr.trend[0].raw - 80 / 102) < 1e-9);
ok('older attempts without points still use the raw percentage', R([exam(0.8, 0.8)]).latest.score === R([exam(0.8, 0.8)]).latest.raw);
// wording rules
const advice = [strong, border, inflated, empty].map(r => r.label + ' ' + r.advice).join(' ');
ok('no labels claim an official result or a guaranteed pass', !/official|guarantee|will pass|you passed/i.test(advice));

// Advanced-profile exams are excluded from certification readiness and reported separately
{
  const base = [exam(0.9, 0.9), exam(0.9, 0.9)];
  const adv = [exam(0.4, 0.4, { extra: { form: 14 } }), exam(0.45, 0.45, { extra: { form: 15 } })];
  const withAdv = computeReadiness({ cert: 'security_plus', attempts: base.concat(adv), domains: DOMAINS, passingScore: 750, excludeForms: [14, 15] });
  const without = R(base);
  ok('advanced exams do not change the readiness level', withAdv.level === without.level && withAdv.examsTaken === without.examsTaken);
  ok('advanced attempts are counted separately', withAdv.advancedTaken === 2 && Math.abs(withAdv.advancedBest - 0.45) < 0.02);
  ok('without an exclusion list every attempt still counts', R(base.concat(adv)).examsTaken === 4);
}

let failed = 0;
checks.forEach(([n, pass]) => { console.log((pass ? '  ok   ' : '  FAIL ') + n); if(!pass) failed++; });
console.log(`${checks.length - failed} passed, ${failed} failed`); process.exit(failed ? 1 : 0);
