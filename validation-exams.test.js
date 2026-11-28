/* CySA+ Validation Exams 16-18: structure, objective quotas, answer-key quality and freshness checks.
   This is the automated half of the separate verification pass described in VALIDATION_EXAMS.md. */
const fs = require('fs');
const html = fs.readFileSync(process.argv[2] || require('path').join(__dirname, '..', 'index.html'), 'utf8');
function lit(name){
  const i = html.indexOf('const ' + name + ' = '); const L = html.slice(i).split('\n'); const first = L[0];
  if(/[\]}];\s*$/.test(first)) return eval('(' + first.slice(first.indexOf('= ') + 2).replace(/;\s*$/, '') + ')');
  let b = 1; while(!/^  \];/.test(L[b])) b++;
  return eval('(' + L.slice(0, b + 1).join('\n').slice(first.indexOf('= ') + 2).replace(/;\s*$/, '') + ')');
}
const qid = t => { t = String(t || ''); let h = 5381; for(let i = 0; i < t.length; i++){ h = ((h << 5) + h + t.charCodeAt(i)) >>> 0; } return '#' + h.toString(36) + t.length.toString(36); };
const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const bank = lit('RAW_CYSA_BANK'), pbqs = lit('PBQ_BANK').filter(p => p.cert === 'cysa'), PF = lit('PRACTICE_FORMS');
const byId = {}; bank.forEach(q => { byId[q.oid || qid(q.question)] = q; });
const pById = {}; pbqs.forEach(p => { pById[qid(p.prompt)] = p; });
const V = PF.cysa.filter(f => f.n >= 16);
ok('three validation exams numbered 16-18', V.length === 3 && V.map(f => f.n).join() === '16,17,18');
ok('all reserved until taken, labelled validation', V.every(f => f.reserved && f.format === 'validation'));
ok('81 MC per exam with the 28/21/19/13 domain split', V.every(f => f.mc.secops.length === 28 && f.mc.vulnmgmt.length === 21 && f.mc.ir_mgmt.length === 19 && f.mc.reporting.length === 13));
const ids = f => Object.values(f.mc).flat();
const all = V.flatMap(ids);
ok('243 distinct questions, all new (rev 2026-11-cs4v)', new Set(all).size === 243 && all.every(id => byId[id] && byId[id].rev === '2026-11-cs4v'));
const others = new Set(PF.cysa.filter(f => f.n < 16).flatMap(ids));
ok('no question shared with exams 1-15', all.every(id => !others.has(id)));
const QUOTA = {'1.1':5,'1.2':7,'1.3':6,'1.4':4,'1.5':3,'1.6':3,'2.1':5,'2.2':5,'2.3':7,'2.4':4,'3.1':4,'3.2':7,'3.3':8,'4.1':6,'4.2':7};
ok('every exam meets the per-objective quota', V.every(f => Object.keys(QUOTA).every(o => ids(f).filter(id => byId[id].obj === o).length === QUOTA[o])));
const multi = f => ids(f).filter(id => byId[id].correct.length > 1).length;
ok('Select TWO count matches the Standard profile (3-6 per exam: ' + V.map(multi).join('/') + ')', V.every(f => multi(f) >= 3 && multi(f) <= 6));
const items = all.map(id => byId[id]);
ok('answer keys valid; Select TWO stems have exactly 2 answers', items.every(q => q.correct.every(c => c >= 0 && c < q.options.length) && (/Select TWO/.test(q.question) ? q.correct.length === 2 : q.correct.length === 1)));
ok('options are distinct within each item', items.every(q => new Set(q.options.map(o => o.toLowerCase())).size === q.options.length));
const W = s => s.split(/\s+/).filter(Boolean).length;
const single = items.filter(q => q.correct.length === 1);
const longest = single.filter(q => { const L = q.options.map(W), c = L[q.correct[0]]; return c === Math.max(...L) && L.filter(x => x === c).length === 1; }).length / single.length;
ok(`correct answer uniquely longest in only ${Math.round(longest * 100)}% of items (<= 12%)`, longest <= 0.12);
const ratio = single.map(q => { const L = q.options.map(W), c = L[q.correct[0]], o = L.filter((_, k) => k !== q.correct[0]); return c / (o.reduce((a, b) => a + b, 0) / o.length); }).reduce((a, b) => a + b, 0) / single.length;
ok(`correct/distractor length ratio ${ratio.toFixed(2)} within 0.90-1.10`, ratio >= 0.9 && ratio <= 1.1);
const pos = [0, 0, 0, 0]; single.forEach(q => pos[q.correct[0]]++);
ok('no answer position used more than 35% of the time (' + pos.join('/') + ')', Math.max(...pos) / single.length <= 0.35);
ok('every item has an explanation', items.every(q => W(q.why || '') >= 8));
const T = s => new Set(s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 3));
const restT = bank.filter(q => q.rev !== '2026-11-cs4v').map(q => T(q.question));
const near = items.filter(q => { const a = T(q.question); return restT.some(t => { let x = 0; a.forEach(w => { if(t.has(w)) x++; }); return x / (a.size + t.size - x) >= 0.7; }); });
ok('no stem is a near copy of an existing bank question (word overlap >= 0.7: ' + near.length + ')', near.length === 0);
ok('4 new PBQs per exam, one per domain, none used elsewhere', V.every(f => f.pbq.length === 4 && new Set(f.pbq.map(id => pById[id] && pById[id].domain)).size === 4) && V.flatMap(f => f.pbq).every(id => pById[id] && pById[id].rev === '2026-11-cs4v' && !PF.cysa.filter(f => f.n < 16).some(g => g.pbq.includes(id))));
ok('validation PBQs need no terminal typing', V.flatMap(f => f.pbq).every(id => !['cli', 'terminal'].includes(pById[id].type)));
ok('readiness excludes only Advanced exams, so validation exams count', /filter\(f => f\.format === 'advanced'\)\.map\(f => f\.n\)/.test(html));
let failed = 0; checks.forEach(([n, c]) => { console.log((c ? '  ok   ' : '  FAIL ') + n); if(!c) failed++; });
console.log(`validation-exams: ${checks.length - failed} passed, ${failed} failed`); process.exit(failed ? 1 : 0);
