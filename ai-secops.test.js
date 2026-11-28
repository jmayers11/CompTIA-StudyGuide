/* AI in Security Operations (CS0-004 objective 1.6): content counts and structural validity of the
   multiple choice, PBQs, Analyst Training drills, investigations and recognition items. */
const fs = require('fs');
const html = fs.readFileSync(process.argv[2] || require('path').join(__dirname, '..', 'index.html'), 'utf8');
function lit(name){
  const i = html.indexOf('const ' + name + ' = ');
  const L = html.slice(i).split('\n'); const first = L[0];
  if(/\];\s*$/.test(first)) return eval('(' + first.slice(first.indexOf('= ') + 2).replace(/;\s*$/, '') + ')');
  let b = 1; while(!/^  \];/.test(L[b])) b++;
  return eval('(' + L.slice(0, b + 1).join('\n').slice(first.indexOf('= ') + 2).replace(/;\s*$/, '') + ')');
}
const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const bank = lit('RAW_CYSA_BANK'), pbq = lit('PBQ_BANK'), drills = lit('ATC_DRILLS'), inv = lit('INVESTIGATIONS'), rec = lit('REC_ITEMS');
const mc = bank.filter(q => q.rev === '2026-11-cs4ai');
ok('24 new objective 1.6 MC questions', mc.length === 24 && mc.every(q => q.obj === '1.6' && q.domain === 'secops'));
ok('core 1.6 pool is now 40+', bank.filter(q => q.rev && q.obj === '1.6').length >= 40);
ok('MC answers are valid and multi-select stems say Select TWO', mc.every(q => q.correct.every(c => c >= 0 && c < q.options.length) && (q.correct.length === 1 || /Select TWO/.test(q.question))));
const P = pbq.filter(p => p.rev === '2026-11-cs4ai');
ok('8 AI PBQs, all CySA+ objective 1.6', P.length === 8 && P.every(p => p.cert === 'cysa' && p.obj === '1.6'));
ok('PBQ types are varied', new Set(P.map(p => p.type)).size >= 5);
ok('zones items map to listed zones', P.filter(p => p.type === 'zones').every(p => p.items.every(i => p.zones.includes(i.ans)) && p.zones.every(z => p.items.some(i => i.ans === z))));
ok('evidence answers point at real lines', P.filter(p => p.type === 'evidence').every(p => p.correct.length >= 2 && p.correct.every(c => c >= 0 && c < p.exhibit.lines.length)));
ok('config answers are among their options', P.filter(p => p.type === 'config').every(p => p.rows.every(r => r.cells.slice(1).every(c => c.opts.includes(c.ans)))));
ok('match pairs are unique', P.filter(p => p.type === 'match').every(p => new Set(p.pairs.map(x => x.right)).size === p.pairs.length));
ok('every AI PBQ has an explanation', P.every(p => p.type === 'order' ? p.steps.length >= 4 : (p.explanation || '').length > 40));
const D = drills.filter(d => d.mod === 'ai');
ok('4 AI drills (core and advanced)', D.length === 4 && D.some(d => d.level === 'core') && D.some(d => d.level === 'advanced'));
ok('drill questions are well formed', D.every(d => d.qs.every(q => q.o.length >= 4 && q.n >= 1 && q.n < q.o.length && q.why && (q.n === 1 || /Select TWO/.test(q.q)))));
const V = inv.filter(v => v.objs.includes('1.6'));
ok('2 AI investigations with 6 stages across 3 levels', V.length === 2 && V.every(v => v.stages.length === 6 && ['b','i','a'].every(l => v.stages.some(s => s.lvl === l))));
const R = rec.filter(r => r.t === 'ai');
ok('20 AI recognition items with at least 4 distinct answers', R.length === 20 && new Set(R.map(r => r.a)).size >= 4 && new Set(R.map(r => r.id)).size === 20);
ok('AI module and recognition type are registered', /ai: \{ name: 'AI in Security Operations'/.test(html) && /ai: \{ name: 'AI in SecOps'/.test(html));
let failed = 0; checks.forEach(([n, c]) => { console.log((c ? '  ok   ' : '  FAIL ') + n); if(!c) failed++; });
console.log(`ai-secops: ${checks.length - failed} passed, ${failed} failed`); process.exit(failed ? 1 : 0);
