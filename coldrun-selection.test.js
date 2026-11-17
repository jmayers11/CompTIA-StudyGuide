/* Automated tests for the Cold Run question-selection engine.
   Run:  node tests/coldrun-selection.test.js [path/to/index.html]
   Loads the engine and the Security+ bank straight out of index.html, so it tests the
   code that actually ships. No dependencies beyond Node 18+. */
const fs = require('fs'), path = require('path');
const htmlPath = process.argv[2] || path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

function between(a, b){ const i = html.indexOf(a), j = html.indexOf(b, i); if(i < 0 || j < 0) throw new Error('marker missing: ' + a); return html.slice(i, j + b.length); }
function grabArray(name){
  const c = html, i = c.indexOf('const ' + name + ' = ['); if(i < 0) throw new Error('array missing: ' + name);
  let d = 0, k = c.indexOf('[', i), inS = null, esc = false;
  for(let p = k; p < c.length; p++){ const ch = c[p];
    if(inS){ if(esc){ esc = false; continue; } if(ch === '\\'){ esc = true; continue; } if(ch === inS) inS = null; continue; }
    if(ch === "'" || ch === '"' || ch === '`'){ inS = ch; continue; }
    if(ch === '/' && c[p+1] === '*'){ p = c.indexOf('*/', p) + 1; continue; }
    if(ch === '/' && c[p+1] === '/'){ p = c.indexOf('\n', p); continue; }
    if(ch === '/' && /[:,(\[=]\s*$/.test(c.slice(Math.max(0, p-12), p))){ let q = p+1, cls = false; for(; q < c.length; q++){ const x = c[q]; if(x === '\\'){ q++; continue; } if(x === '[') cls = true; else if(x === ']') cls = false; else if(x === '/' && !cls) break; } p = q; continue; }
    if(ch === '[') d++; else if(ch === ']'){ d--; if(d === 0) return eval(c.slice(k, p+1)); } }
}
const createExposureEngine = new Function(between('/* EXPOSURE_ENGINE_START */', '/* EXPOSURE_ENGINE_END */') + '; return createExposureEngine;')();
const meta = new Function(between('/* EXPOSURE_DATA_START */', '/* EXPOSURE_DATA_END */') + '; return { EXPOSURE_GROUPS, EXPOSURE_SUPPLEMENTAL };')();
const BANK = grabArray('RAW_SECPLUS_BANK');
const PBQS = grabArray('PBQ_BANK').filter(p => p.cert === 'security_plus');
const DOMAINS = [['general', .12], ['threats', .22], ['architecture', .18], ['secops', .28], ['management', .20]];

let failures = 0, passes = 0;
function check(name, cond, detail){ if(cond){ passes++; } else { failures++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); } }
function seeded(seed){ return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
function memStore(){ const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); return true; }, m }; }
function makeEngine(store, seed){ return createExposureEngine({ getItem: store.getItem, setItem: store.setItem, random: seeded(seed), groups: meta.EXPOSURE_GROUPS }); }
function allocate(n, pools){ // mirrors computeDomainAllocation
  const al = {}; let t = 0; DOMAINS.forEach(([k, w]) => { al[k] = Math.min(Math.round(n * w), pools[k].length); t += al[k]; });
  let diff = n - t; while(diff > 0){ let added = false; for(const [k] of DOMAINS){ if(al[k] < pools[k].length){ al[k]++; diff--; added = true; if(!diff) break; } } if(!added) break; }
  while(diff < 0){ for(const [k] of DOMAINS){ if(al[k] > 0){ al[k]--; diff++; if(!diff) break; } } }
  return al;
}
function pools(E){
  const p = {}; DOMAINS.forEach(([k]) => p[k] = []);
  BANK.forEach(q => { const id = E.qid(q.question); if(!meta.EXPOSURE_SUPPLEMENTAL.includes(id)) p[q.domain].push({ id, domain: q.domain, question: q.question }); });
  return p;
}
const pbqId = (E) => d => E.qid(d.prompt);

function runColdRuns(n, opts){
  opts = opts || {};
  const store = opts.store || memStore(); let seed = opts.seed || 7;
  const rows = [], history = []; const ever = new Set(); let prev = null;
  for(let e = 1; e <= n; e++){
    const E = makeEngine(store, seed++);          // fresh engine per exam = app restart between exams
    const P = pools(E), al = allocate(86, P);
    const picked = E.select('security_plus', P, al, opts.policy || 'strict');
    const pbq = E.selectPBQs('security_plus', PBQS, 4, pbqId(E));
    const ids = picked.map(q => q.id);
    const last3 = new Set(history.slice(-3).flat());
    const counts = {}; picked.forEach(q => counts[q.domain] = (counts[q.domain] || 0) + 1);
    const entry = E.recordServed('security_plus', ids, pbq.map(pbqId(E)), { coldRun: true, policy: opts.policy || 'strict' });
    if(opts.answer) E.recordResults('security_plus', picked.map(q => ({ id: q.id, correct: opts.answer(q), fresh: q._exposure.fresh })), entry.ts);
    rows.push({ exam: e, size: ids.length, dupInExam: ids.length - new Set(ids).size, neverSeen: ids.filter(i => !ever.has(i)).length,
      overlapPrev: prev ? ids.filter(i => prev.has(i)).length : 0, fromLast3: ids.filter(i => last3.has(i)).length,
      domainsOk: DOMAINS.every(([k]) => (counts[k] || 0) === al[k]), pbqs: pbq.length, entry,
      groupClash: (meta.EXPOSURE_GROUPS.security_plus || []).filter(g => picked.filter(q => g.includes(q.id)).length > 1).length });
    ids.forEach(i => ever.add(i)); rows[rows.length - 1].bankSeenPct = +(100 * ever.size / Object.values(P).flat().length).toFixed(1);
    prev = new Set(ids); history.push(ids);
  }
  return { rows, store };
}

console.log('Cold Run selection tests — ' + path.basename(htmlPath));
console.log('Bank: ' + BANK.length + ' Security+ questions (' + meta.EXPOSURE_SUPPLEMENTAL.length + ' supplemental excluded from exams), ' + PBQS.length + ' PBQs');

// 1. Ten consecutive 90-question Cold Runs (86 multiple choice + 4 PBQs), engine reloaded from storage each time
const ten = runColdRuns(10);
console.table(ten.rows.map(r => ({ exam: r.exam, questions: r.size + r.pbqs, dupInExam: r.dupInExam, neverSeen: r.neverSeen, overlapPrev: r.overlapPrev, fromLast3: r.fromLast3, domainsOk: r.domainsOk, bankSeenPct: r.bankSeenPct })));
check('no duplicate question IDs within any exam', ten.rows.every(r => r.dupInExam === 0));
check('every exam has exactly 86 MC + 4 PBQs', ten.rows.every(r => r.size === 86 && r.pbqs === 4));
check('domain counts match the blueprint allocation every exam', ten.rows.every(r => r.domainsOk));
check('nothing from the previous 3 Cold Runs while unseen questions remain', ten.rows.every(r => r.fromLast3 === 0));
const firstTenNew = ten.rows.reduce((s, r) => s + r.neverSeen, 0);
// a few never-seen questions are deliberately held back because a near-duplicate was just served
check('never-seen questions preferred: >= 98% of the first 10 exams are new', firstTenNew >= 0.98 * 860, firstTenNew + '/860 new: ' + ten.rows.map(r => r.neverSeen).join(','));
check('consecutive exams share no questions', ten.rows.every(r => r.overlapPrev === 0));
check('never two near-duplicates in one exam', ten.rows.concat().every(r => r.groupClash === 0));
check('analytics entry agrees with the simulation', ten.rows.every(r => r.entry.fresh === r.neverSeen && r.entry.last3 === r.fromLast3 && r.entry.unique === 86));

// 2. Exhaustion: 25 Cold Runs never fail, keep domain weights, and still avoid the last 3 runs when the pool allows
const many = runColdRuns(25, { seed: 99 });
check('25 exams all generated at full size', many.rows.every(r => r.size === 86 && r.dupInExam === 0));
check('domain weighting holds after the pool is exhausted', many.rows.every(r => r.domainsOk));
const maxLast3 = Math.max(...many.rows.map(r => r.fromLast3));
check('after exhaustion, repeats from the last 3 runs stay at zero (pool allows it)', maxLast3 === 0, 'max fromLast3=' + maxLast3);
const late = many.rows.slice(12);
const avgPrev = late.reduce((s, r) => s + r.overlapPrev, 0) / late.length;
check('no recycling of one subset: consecutive overlap stays at 0 after exhaustion', avgPrev === 0, 'avg overlapPrev=' + avgPrev.toFixed(1));
console.log('  exams 11-25 never-seen counts: ' + many.rows.slice(10).map(r => r.neverSeen).join(', '));

// 3. Tiny pool fallback: when a domain cannot avoid recent questions, it relaxes instead of failing
(() => {
  const store = memStore(), E = makeEngine(store, 3);
  const P = { general: pools(E).general.slice(0, 12) };
  let ok = true;
  for(let e = 0; e < 5; e++){ const E2 = makeEngine(store, 10 + e); const got = E2.select('security_plus', P, { general: 10 }, 'strict');
    if(got.length !== 10 || new Set(got.map(q => q.id)).size !== 10) ok = false;
    E2.recordServed('security_plus', got.map(q => q.id), [], { coldRun: true }); }
  check('small pool relaxes gracefully (always 10 unique of 12)', ok);
})();

// 4. Persistence survives restart, and migration of the old recent-exam list
(() => {
  const store = memStore(); let E = makeEngine(store, 1);
  const P = pools(E), al = allocate(86, P);
  const first = E.select('security_plus', P, al, 'strict'); E.recordServed('security_plus', first.map(q => q.id), [], { coldRun: true });
  E = makeEngine(store, 2); // restart
  check('exposure persists across a restart', E.summary('security_plus', P).seen === 86 && E.summary('security_plus', P).runs === 1);
  const legacyStore = memStore(); const L = makeEngine(legacyStore, 5);
  const legacy = P.general.slice(0, 40).map(q => L.qid(q.question));
  const migrated = L.migrateLegacy('security_plus', legacy);
  check('legacy recent list migrates', migrated === 40);
  check('migration is one-time', L.migrateLegacy('security_plus', legacy) === 0);
  const pick = L.select('security_plus', { general: P.general }, { general: 11 }, 'strict');
  check('migrated questions are kept out of the next Cold Run', pick.every(q => !legacy.includes(q.id)));
})();

// 5. Near-duplicate groups: never two members of one group in the same exam, and they share exposure
(() => {
  const store = memStore(), E = makeEngine(store, 11);
  const G = meta.EXPOSURE_GROUPS.security_plus; const grp = G.find(g => g.length >= 3) || G[0];
  const items = BANK.filter(q => grp.includes(E.qid(q.question))).map(q => ({ id: E.qid(q.question), domain: q.domain }));
  const filler = pools(E)[items[0].domain].filter(q => !grp.includes(q.id)).slice(0, 30);
  const got = E.select('security_plus', { d: items.concat(filler) }, { d: 20 }, 'strict');
  check('at most one member of a near-duplicate group per exam', got.filter(q => grp.includes(q.id)).length <= 1);
  E.recordServed('security_plus', [items[0].id], [], { coldRun: true });
  check('a group-mate of a recently seen question is treated as recent', E.standing('security_plus', items[1].id).tier === 3);
})();

// 6. Policies
(() => {
  const bal = runColdRuns(8, { policy: 'balanced', seed: 21 });
  check('balanced: still no duplicates and correct domain counts', bal.rows.every(r => r.dupInExam === 0 && r.domainsOk));
  check('balanced: mostly unseen (>=80% new in exams 1-8)', bal.rows.every(r => r.neverSeen >= 0.8 * 86), bal.rows.map(r => r.neverSeen).join(','));
  const store = memStore();
  const rev = runColdRuns(3, { store, seed: 31, answer: q => q.id.charCodeAt(2) % 3 !== 0 }); // ~1/3 wrong
  const E = makeEngine(store, 32); const P = pools(E), al = allocate(86, P);
  const got = E.select('security_plus', P, al, 'review');
  const missed = got.filter(q => E.standing('security_plus', q.id).wrong > 0).length;
  check('review: brings back previously missed questions', missed >= 30, missed + ' missed questions selected');
  const strict = E.select('security_plus', P, al, 'strict');
  check('strict ignores correctness (no missed repeats while unseen remain)', strict.every(q => E.standing('security_plus', q.id).seen === 0));
})();

// 7. PBQs: unseen first
(() => {
  const store = memStore(); const seen = new Set(); let ok = true;
  for(let e = 0; e < Math.floor(PBQS.length / 4); e++){ const E = makeEngine(store, 50 + e); const got = E.selectPBQs('security_plus', PBQS, 4, pbqId(E));
    got.forEach(d => { if(seen.has(d.prompt)) ok = false; seen.add(d.prompt); }); E.recordServed('security_plus', [], got.map(pbqId(E)), { coldRun: true }); }
  check('PBQs do not repeat until all ' + PBQS.length + ' have been used', ok);
})();

// 8. Results bookkeeping (fresh vs repeated accuracy)
(() => {
  const store = memStore(), E = makeEngine(store, 61), P = pools(E);
  const got = E.select('security_plus', P, allocate(20, P), 'strict');
  const entry = E.recordServed('security_plus', got.map(q => q.id), [], { coldRun: true });
  E.recordResults('security_plus', got.map((q, i) => ({ id: q.id, correct: i % 2 === 0, fresh: true })), entry.ts);
  const h = E.summary('security_plus', P).hist.at(-1);
  check('exam summary records fresh-question accuracy', h.freshTotal === 20 && h.freshCorrect === 10 && h.correct === 10);
})();

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
