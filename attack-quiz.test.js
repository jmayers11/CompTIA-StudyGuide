/* Attack Recognition test: content integrity for the attack set, the four question formats with one
   right answer each (no look-alike that could also be right, no overlapping mitigation), confused
   attacks preferred as wrong options, explanations with hooks and differences, randomized positions,
   missed-first and missed-only, saved progress, backup coverage, the comparison table filter, and
   separation from exam scores.
   Run:  node tests/attack-quiz.test.js [path/to/index.html] */
const fs = require('fs');
const html = fs.readFileSync(process.argv[2] || require('path').join(__dirname, '..', 'index.html'), 'utf8');
const s = html.indexOf('\n<script>\n'), e = html.indexOf('\n</script>', s);
let code = html.slice(s + 10, e);
const store = {};
const localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; }, key: i => Object.keys(store)[i] || null, get length(){ return Object.keys(store).length; }, clear(){ for(const k in store) delete store[k]; } };
function anything(){ const f = function(){ return anything(); };
  return new Proxy(f, { get(t, p){ if(p === Symbol.toPrimitive) return () => ''; if(p === 'length') return 0; if(p === Symbol.iterator) return function*(){}; if(p === 'then') return undefined; return anything(); }, apply(){ return anything(); }, set(){ return true; } }); }
const els = {};
function makeEl(id){
  const handlers = {};
  const el = { id, value: '', checked: false, disabled: false, innerHTML: '', textContent: '', style: {}, dataset: {}, children: [], options: [], open: false,
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    addEventListener(t, fn){ (handlers[t] = handlers[t] || []).push(fn); }, removeEventListener(){},
    dispatchEvent(ev){ try{ ev.target = el; }catch(_){} (handlers[ev.type] || []).forEach(fn => fn(ev)); return true; },
    click(){ (handlers.click || []).forEach(fn => fn({ type: 'click', target: el, preventDefault(){}, stopPropagation(){} })); },
    querySelector(){ return makeEl('_q'); }, querySelectorAll(){ return []; }, appendChild(c){ return c; }, removeChild(){}, insertBefore(){}, remove(){}, setAttribute(){}, getAttribute(){ return null; }, removeAttribute(){},
    focus(){}, blur(){}, scrollIntoView(){}, getBoundingClientRect(){ return { top:0,left:0,width:0,height:0 }; }, getContext(){ return anything(); }, closest(){ return null; }, contains(){ return false; }, select(){},
    _h: handlers };
  return new Proxy(el, { get(t, p){ if(p in t) return t[p]; return anything(); }, set(t, p, v){ t[p] = v; return true; } });
}
const document = new Proxy({
  getElementById(id){ if(!(id in els)) els[id] = makeEl(id); return els[id]; },
  querySelector(){ return null; }, querySelectorAll(){ return []; }, createElement(tag){ return makeEl('_' + tag); }, createElementNS(){ return makeEl('_ns'); }, createTextNode(){ return makeEl('_t'); },
  addEventListener(){}, removeEventListener(){}, body: makeEl('body'), documentElement: makeEl('html'), head: makeEl('head'), hidden: false, visibilityState: 'visible', readyState: 'complete'
}, { get(t, p){ if(p in t) return t[p]; return anything(); } });
// defaults read from the real markup
const re = /<(input|select)[^>]*id="([^"]+)"[^>]*>/g; let m;
while((m = re.exec(html))){ const el = document.getElementById(m[2]); const tag = m[0];
  const v = /value="([^"]*)"/.exec(tag); if(v && m[1] === 'input') el.value = v[1]; if(/\schecked\b/.test(tag)) el.checked = true; }
document.getElementById('exam-source-select').value = 'bank';
document.getElementById('exam-policy-select').value = 'strict';
document.getElementById('exam-cert-select').value = 'security_plus';
const windowObj = new Proxy({ localStorage, document, addEventListener(){}, removeEventListener(){}, setTimeout: (f) => 0, setInterval: () => 0, clearInterval(){}, clearTimeout(){},
  confirm: () => true, alert: () => {}, matchMedia: () => ({ matches: false, addEventListener(){}, addListener(){} }), requestAnimationFrame: () => 0, navigator: { serviceWorker: undefined, userAgent: 'node' }, location: { reload(){}, href: '', hash: '' }, innerWidth: 1200, innerHeight: 800 },
  { get(t, p){ if(p in t) return t[p]; if(p in globalThis) return globalThis[p]; return anything(); } });
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { exposure, getExamPolicy, renderExposureDashboard, cliTrainer, renderCliTab, cmdCards, getCmdSession: () => cmdSession, renderCmdCard, CMD_CARDS, gradeExamQuestion, instantiatePBQ, PBQ_BANK, renderExamQuestion, getExamState: () => examState, startLab, labSubmit, getLabRun: () => labRun, labEngine, showCliSection, CLI_LABS, renderReadiness, computeReadiness, PRACTICE_FORMS, buildPracticeFormExam, practiceFormStatus, renderPracticeFormPicker, EXPOSURE_GROUPS, EXPOSURE_SUPPLEMENTAL_SET, QUESTION_BANKS, switchTab, buildCmdQuiz, startCmdQuiz, getCmdQuiz: () => cmdQuiz, renderCmdQuizQ, finishCmdQuiz, showCliSection, cmdQuizSubmit, buildSimCmdQuiz, simLabsForTrack, startSimQuiz, getSimQuiz: () => simQuiz, renderSimQuizQ, simQuizSubmit, renderSimQuizSetup, buildSimRecBank, buildSimRecQuiz, simRecBank, simRecWeights, simRecMissedIds, finishSimQuiz, getSimRec: () => simRec, BACKUP_KEYS, exportBackup, ATTACKS, ATTACK_CATS, attackQuestionBank, buildAttackQuiz, attackExplain, startAttackQuiz, getAttackQuiz: () => attackQuiz, attackSubmit, renderAttackQ, finishAttackQuiz, renderAttacks, renderAttackTable, attackWeights, attackMissedIds, getAttackData: () => attackData }; })();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', code);
class Ev { constructor(t){ this.type = t; } }
const errors = [];
try{ run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev); }
catch(err){ errors.push('boot: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }

const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const H = globalThis.__hooks;
try{
  const A = H.ATTACKS, byId = {}; A.forEach(a => { byId[a.id] = a; });
  const must = ['xss-stored', 'xss-reflected', 'xss-dom', 'sqli', 'csrf', 'ssrf', 'traversal', 'cmd-inj', 'bof', 'race', 'replay', 'onpath', 'spray', 'stuffing', 'brute', 'dns-poison', 'arp', 'session-hijack', 'evil-twin', 'downgrade'];
  ok('covers every attack named in the request, plus more (' + A.length + ' attacks)', must.every(id => byId[id]) && A.length >= 35);
  ok('unique ids and names', new Set(A.map(a => a.id)).size === A.length && new Set(A.map(a => a.name.toLowerCase())).size === A.length);
  ok('every attack has a description, memory hook, tell-tale sign, mitigation, confusions and 2 scenarios', A.every(a => a.desc && a.hook && a.tell && a.mit && Object.keys(a.conf || {}).length >= 1 && (a.sc || []).length === 2 && H.ATTACK_CATS[a.cat]));
  ok('confusion and notWith references point to real attacks', A.every(a => Object.keys(a.conf).concat(a.notWith || []).every(id => byId[id] && id !== a.id)));
  ok('descriptions, mitigations and scenarios are unique', new Set(A.map(a => a.desc)).size === A.length && new Set(A.map(a => a.mit)).size === A.length && new Set(A.flatMap(a => a.sc)).size === A.length * 2);
  ok('no scenario or description names its own attack', A.every(a => { const n = a.name.replace(/\s*\(.*\)/, '').toLowerCase(); return ![a.desc].concat(a.sc).some(t => t.toLowerCase().includes(n)); }));
  const bank = H.attackQuestionBank(A);
  ok('question bank: 4 formats, about 100+ questions (' + bank.length + ')', bank.length >= 100 && ['d2n', 'n2d', 'scen', 'mit'].every(k => bank.some(b => b.kind === k)));
  const bad = [], pos = {}, prefHits = { n: 0, of: 0 };
  for(let r = 0; r < 25; r++){
    const qs = H.buildAttackQuiz(A, { count: 9999 });
    if(r === 0) ok('full bank: every question builds with 4 options', qs.length === bank.length);
    qs.forEach(q => {
      const a = byId[q.attackId];
      pos[q.kind] = pos[q.kind] || [0, 0, 0, 0]; pos[q.kind][q.options.indexOf(q.answer)]++;
      if(q.options.length !== 4 || new Set(q.options).size !== 4 || new Set(q.optAttack).size !== 4) bad.push('opts ' + q.id);
      if(q.optAttack[q.options.indexOf(q.answer)] !== a.id) bad.push('answer map ' + q.id);
      const wrong = q.optAttack.filter(id => id !== a.id).map(id => byId[id]);
      if(q.kind === 'scen') wrong.forEach(b => { if((a.notWith || []).includes(b.id) || (b.notWith || []).includes(a.id)) bad.push('scen ambiguous ' + q.id + ' ' + b.id); });
      if(q.kind === 'mit') wrong.forEach(b => { if(b.generic || (a.fam || []).some(f => (b.fam || []).includes(f))) bad.push('mit overlap ' + q.id + ' ' + b.id); });
      if(q.kind === 'd2n' || q.kind === 'scen'){ prefHits.of++; if(wrong.some(b => a.conf[b.id] || (b.conf || {})[a.id])) prefHits.n++; }
      const ex = H.attackExplain(A, q);
      if(!ex.hook || ex.notes.length !== 3 || ex.notes.some(n => !n.text)) bad.push('explain ' + q.id);
    });
  }
  if(bad.length) console.log([...new Set(bad)].slice(0, 8));
  ok('4 distinct options and the right answer maps to the right attack', !bad.some(b => /^opts|^answer/.test(b)));
  ok('scenario questions never offer a look-alike that could also be right', !bad.some(b => /^scen/.test(b)));
  ok('mitigation questions never offer an overlapping or catch-all control as a wrong option', !bad.some(b => /^mit/.test(b)));
  ok('wrong options usually include a commonly confused attack (' + Math.round(prefHits.n / prefHits.of * 100) + '%)', prefHits.n / prefHits.of > 0.95);
  ok('every explanation has the memory hook and a note for each wrong option', !bad.some(b => /^explain/.test(b)));
  ok('answer position is randomized in every format', Object.values(pos).every(p => p.every(n => n > 0)));
  const xq = H.buildAttackQuiz(A, { kinds: ['d2n'], count: 9999 }).find(q => q.attackId === 'spray');
  const xe = H.attackExplain(A, xq);
  ok('explanations say how the look-alikes differ (spraying vs brute force / stuffing)', xe.notes.some(n => /Brute force hammers one account|leaked/.test(n.text)));
  ok('10 / 20 / 40 / full counts and type filter', [10, 20, 40].every(n => H.buildAttackQuiz(A, { count: n }).length === n) && H.buildAttackQuiz(A, { kinds: ['mit'], count: 9999 }).length === A.length);
  ok('group filter', H.buildAttackQuiz(A, { cat: 'wireless', count: 9999 }).every(q => byId[q.attackId].cat === 'wireless'));
  // UI and progress
  const examBefore = JSON.stringify(Object.keys(localStorage).filter(k => !/attacks|simrec/.test(k)).map(k => [k, localStorage.getItem(k)]));
  H.switchTab('attacks');
  ok('Attacks tab opens with stats and the comparison table', /attacks covered/.test(document.getElementById('atk-area').innerHTML) && /atk-table/.test(document.getElementById('atk-table').innerHTML));
  document.getElementById('atk-filter').value = 'spray'; H.renderAttackTable();
  const t = document.getElementById('atk-table').innerHTML;
  ok('table search filters rows (spray -> spraying plus the attacks that mention it)', /Password spraying/.test(t) && !/Bluejacking/.test(t));
  document.getElementById('atk-filter').value = '';
  document.getElementById('atk-count').value = '10'; document.getElementById('atk-kind').value = 'scen'; document.getElementById('atk-cat').value = 'all';
  H.startAttackQuiz(false);
  const Q = H.getAttackQuiz();
  ok('quiz starts with the chosen count and format', Q && Q.qs.length === 10 && Q.qs.every(q => q.kind === 'scen'));
  ok('Submit Answer disabled until an option is picked', /id="atk-submit" disabled/.test(document.getElementById('atk-area').innerHTML));
  H.attackSubmit(); ok('submit without a selection does nothing', !Q.answered);
  const q0 = Q.qs[0]; Q.sel = q0.options.find(o => o !== q0.answer); H.renderAttackQ();
  ok('nothing is graded before Submit', !/Not quite|✓ Correct/.test(document.getElementById('atk-area').innerHTML));
  H.attackSubmit();
  const fb = document.getElementById('atk-area').innerHTML;
  ok('feedback shows the hook, tell-tale sign and how each wrong option differs', /Not quite/.test(fb) && /💡/.test(fb) && /Tell-tale sign/.test(fb) && (fb.match(/<li>/g) || []).length === 3);
  const saved = JSON.parse(localStorage.getItem('cybersec_attacks_v1'));
  ok('per-question and per-attack accuracy saved under cybersec_attacks_v1', saved.items[q0.id].wrong === 1 && saved.items[q0.id].lastOk === false && saved.attacks[q0.attackId].wrong === 1);
  for(let i = 1; i < Q.qs.length; i++){ Q.idx = i; Q.sel = Q.qs[i].answer; Q.answered = false; H.attackSubmit(); }
  H.finishAttackQuiz();
  ok('results show score and missed question with its hook', /Quiz complete: 9 \/ 10/.test(document.getElementById('atk-area').innerHTML) && /💡/.test(document.getElementById('atk-area').innerHTML));
  const w = H.attackWeights();
  const next = H.buildAttackQuiz(A, { count: 5, weights: w });
  ok('missed question comes first next time', next[0].id === q0.id);
  ok('other questions about a missed attack are also prioritized', (w[q0.attackId + '#d2n'] || 0) > 0);
  H.renderAttacks();
  ok('Missed only button shows the count', /Missed only \(1\)/.test(document.getElementById('atk-missed').textContent) && !document.getElementById('atk-missed').disabled);
  H.startAttackQuiz(true);
  ok('Missed only quiz runs just the missed question', H.getAttackQuiz().qs.length === 1 && H.getAttackQuiz().qs[0].id === q0.id);
  ok('history saved', H.getAttackData().hist.length === 1);
  const examAfter = JSON.stringify(Object.keys(localStorage).filter(k => !/attacks|simrec/.test(k)).map(k => [k, localStorage.getItem(k)]));
  ok('no other saved data (exam scores, other quizzes) is touched', examBefore === examAfter);
  ok('Backup/Restore includes cybersec_attacks_v1', H.BACKUP_KEYS.includes('cybersec_attacks_v1'));
  const html = require('fs').readFileSync(process.argv[2] || require('path').join(__dirname, '..', 'index.html'), 'utf8');
  ok('tab button, sidebar, panel and mobile title wired', /data-tab="attacks"/.test(html) && /id="attacks-tab"/.test(html) && /id="attacks-panel"/.test(html) && /attacks: 'Attacks'/.test(html));
}catch(err){ errors.push('drive: ' + err.message + ' ' + (err.stack || '').split('\n').slice(1, 3).join(' ')); }
ok('no script errors', errors.length === 0);
if(errors.length) console.log(errors);
let failed = 0; checks.forEach(([n, p]) => { console.log((p ? '  ok   ' : '  FAIL ') + n); if(!p) failed++; });
console.log(`${checks.length - failed} passed, ${failed} failed`); process.exit(failed ? 1 : 0);
