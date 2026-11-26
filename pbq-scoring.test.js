/* PBQ scoring test: partial credit for every PBQ type, the points model (multiple choice 1 point,
   PBQs 3-6 points), the 10 large simulations, exam-only simulations in Terminal Lab, and a full
   practice exam scored in points through the real buttons.
   Run:  node tests/pbq-scoring.test.js [path/to/index.html] */
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
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { exposure, getExamPolicy, renderExposureDashboard, cliTrainer, renderCliTab, cmdCards, getCmdSession: () => cmdSession, renderCmdCard, CMD_CARDS, gradeExamQuestion, instantiatePBQ, PBQ_BANK, renderExamQuestion, getExamState: () => examState, startLab, labSubmit, getLabRun: () => labRun, labEngine, showCliSection, CLI_LABS, renderReadiness, computeReadiness, PRACTICE_FORMS, buildPracticeFormExam, practiceFormStatus, renderPracticeFormPicker, EXPOSURE_GROUPS, EXPOSURE_SUPPLEMENTAL_SET, QUESTION_BANKS, switchTab, pbqPoints, labSeenInExam, renderLabList }; })();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', code);
class Ev { constructor(t){ this.type = t; } }
const errors = [];
try{ run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev); }
catch(err){ errors.push('boot: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }

const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const H = globalThis.__hooks;
try{
  const G = (def, sel) => H.gradeExamQuestion(H.instantiatePBQ(def), sel);
  const sec = H.PBQ_BANK.filter(p => p.cert === 'security_plus');
  // partial credit by type
  const m = sec.find(p => p.type === 'match' && !p.drill);
  const mAll = m.pairs.map(p => p.right), mHalf = mAll.map((r, i) => i < Math.floor(mAll.length / 2) ? r : null);
  const gm = G(m, mHalf), gmFull = G(m, mAll);
  ok('match: half the pairs right earns about half credit', Math.abs(gm.credit - Math.floor(mAll.length / 2) / mAll.length) < 1e-9 && !gm.isCorrect && gmFull.credit === 1 && gmFull.isCorrect);
  const o = sec.find(p => p.type === 'order');
  const swapped = o.steps.slice(); [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
  const go = G(o, swapped);
  ok('order: one swapped pair keeps most of the credit', go.credit === (o.steps.length - 1) / o.steps.length && !go.isCorrect);
  const ev = sec.find(p => p.type === 'evidence');
  const wrongIdx = (ev.mode === 'items' ? ev.items : ev.exhibit.lines).map((_, i) => i).filter(i => !ev.correct.includes(i));
  ok('evidence: selecting everything earns no free credit', G(ev, ev.correct.concat(wrongIdx)).credit === 0);
  ok('evidence: one of the right lines earns a share', Math.abs(G(ev, [ev.correct[0]]).credit - 1 / ev.correct.length) < 1e-9);
  const cfg = sec.find(p => p.type === 'config' && p.sim);
  const cells = []; cfg.rows.forEach((row, r) => row.cells.forEach((c, k) => { if(c.opts) cells.push([r + ':' + k, c.ans]); }));
  const full = {}; cells.forEach(([k, a]) => { full[k] = Array.isArray(a) ? a[0] : a; });
  const most = Object.assign({}, full); const k0 = cells[0][0]; most[k0] = cfg.rows[0].cells[+k0.split(':')[1]].opts.find(x => x !== full[k0]);
  const gc = G(cfg, most);
  ok('config simulation: one wrong cell keeps the rest of the credit, worth 6 points', gc.maxPoints === 6 && Math.abs(gc.credit - (cells.length - 1) / cells.length) < 1e-9 && gc.points > 4.5);
  // terminal simulations
  const sims = sec.filter(p => p.sim && p.type === 'terminal');
  let simOk = 0;
  sims.forEach(def => { const lab = H.CLI_LABS.find(l => l.id === def.lab);
    const ans = lab.steps.map(st => st.kind === 'cmd' ? st.ex : (st.answer.type === 'choice' ? st.answer.correct : st.answer.shown));
    const g1 = G(def, { answers: ans }), half = ans.map((a, i) => i < 3 ? a : (lab.steps[i].kind === 'cmd' ? 'junk' : (lab.steps[i].answer.type === 'choice' ? (lab.steps[i].answer.correct + 1) % lab.steps[i].answer.options.length : 'junk')));
    const g2 = G(def, { answers: half });
    if(g1.isCorrect && g1.points === 6 && !g2.isCorrect && Math.abs(g2.credit - 3 / lab.steps.length) < 1e-9 && lab.steps.length >= 5) simOk++; });
  ok('12 terminal simulations (5+ steps): full answers 6/6 points, 3 right steps earn 3/N', sims.length === 12 && simOk === 12);
  ok('15 large simulations in total (12 terminal, 3 configuration)', sec.filter(p => p.sim).length === 15);
  ok('multiple-choice stays all-or-nothing at 1 point', (() => { const q = { question: 'x', options: ['a','b','c','d'], answer: ['a'] }; const g = H.gradeExamQuestion(q, ['b']); return g.maxPoints === 1 && g.points === 0 && H.gradeExamQuestion(q, ['a']).points === 1; })());
  ok('points tiers: 3 small / 4 medium / 5 large / 6 simulation', H.pbqPoints({}, 2) === 3 && H.pbqPoints({}, 5) === 4 && H.pbqPoints({}, 9) === 5 && H.pbqPoints({ sim: true }, 2) === 6);
  // terminal choice answers are no longer always the first option
  const pos = []; H.CLI_LABS.forEach(l => l.steps.forEach(s => { if(s.kind === 'ask' && s.answer.type === 'choice') pos.push(s.answer.correct); }));
  ok('terminal multiple-choice answers are spread across positions (not always first)', pos.filter(p => p === 0).length < pos.length / 3 && new Set(pos).size >= 3);
  // every practice exam includes one large simulation
  const simIds = new Set(sec.filter(p => p.sim).map(p => H.exposure.qid(p.prompt)));
  ok('each practice exam has exactly one large simulation', H.PRACTICE_FORMS.security_plus.every(f => f.pbq.filter(id => simIds.has(id)).length === 1));
  // exam-only simulations hidden from Terminal Lab until met in an exam
  const lab0 = H.CLI_LABS.find(l => l.examOnly);
  H.renderLabList();
  const before = document.getElementById('lab-list').innerHTML;
  ok('simulations are hidden from Terminal Lab practice before they appear in an exam', !before.includes(lab0.title) && /large exam simulations are kept out of practice/.test(before) && !H.labSeenInExam(lab0));
  // full exam: scored in points, PBQs weighted
  document.getElementById('exam-cert-select').value = 'security_plus'; H.switchTab('exam');
  const formWithLab = H.PRACTICE_FORMS.security_plus.find(f => f.pbq.some(id => { const d = sec.find(p => H.exposure.qid(p.prompt) === id); return d && d.lab === lab0.id; }));
  document.getElementById('exam-coldrun-form').value = String(formWithLab.n);
  document.getElementById('exam-coldrun-btn').click();
  const es = H.getExamState();
  es.questions.forEach((q, i) => { if(q.answer && q.options) es.selections[i] = q.answer.slice(); });
  document.getElementById('exam-submit-btn').click();
  const a = JSON.parse(store['cybersec_progress_v1']).examAttempts.slice(-1)[0];
  const sum = document.getElementById('exam-summary').innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  ok('attempt stores points: 86 MC points + PBQ points possible (≥ 15), PBQs blank earn 0', a.scoring === 'points-v1' && a.points === 86 && a.pointsPossible >= 86 + 15 && a.pbqPoints === 0 && a.pbqPointsPossible === a.pointsPossible - 86);
  ok('scaled estimate comes from points, so blank PBQs pull it below the raw-count figure', a.scaledScore === Math.round(100 + 800 * a.points / a.pointsPossible) && a.scaledScore < Math.round(100 + 800 * 86 / 90));
  ok('results show points and PBQ points, review tags the simulation with its points', /Points: 86 of \d+/.test(sum) && /PBQs 0 of \d+ pts/.test(sum) && /SIMULATION · 0 \/ 6 pts/.test(sum));
  H.renderLabList();
  ok('after the exam, the simulation unlocks in Terminal Lab for review', document.getElementById('lab-list').innerHTML.includes(lab0.title) && H.labSeenInExam(lab0));
  H.renderReadiness();
  const rd = document.getElementById('readiness-content').innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  ok('Readiness shows the points score and PBQ points', /points score \(PBQs weighted, partial credit\)/.test(rd) && /PBQ points earned \(\d+ possible\)/.test(rd));
}catch(err){ errors.push('drive: ' + err.message + ' ' + (err.stack || '').split('\n').slice(1, 3).join(' ')); }
ok('no script errors', errors.length === 0);
if(errors.length) console.log(errors);
let failed = 0; checks.forEach(([n, p]) => { console.log((p ? '  ok   ' : '  FAIL ') + n); if(!p) failed++; });
console.log(`${checks.length - failed} passed, ${failed} failed`); process.exit(failed ? 1 : 0);
