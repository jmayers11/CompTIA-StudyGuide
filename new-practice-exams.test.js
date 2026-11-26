/* New-question practice exams test (Practice Exams 11-15): structure, brand-new original questions,
   style measures, gradable PBQs and simulations, and the hold-back that keeps these items out of every
   other study mode until each exam has been taken once.
   Run:  node tests/new-practice-exams.test.js [path/to/index.html] */
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
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { exposure, getExamPolicy, renderExposureDashboard, cliTrainer, renderCliTab, cmdCards, getCmdSession: () => cmdSession, renderCmdCard, CMD_CARDS, gradeExamQuestion, instantiatePBQ, PBQ_BANK, renderExamQuestion, getExamState: () => examState, startLab, labSubmit, getLabRun: () => labRun, labEngine, showCliSection, CLI_LABS, renderReadiness, computeReadiness, PRACTICE_FORMS, buildPracticeFormExam, practiceFormStatus, renderPracticeFormPicker, EXPOSURE_GROUPS, EXPOSURE_SUPPLEMENTAL_SET, QUESTION_BANKS, switchTab, getCombinedDomainPool, selectPBQs, fcCollectBankCards, dailyChallengePool, reservedPracticeIds, simLabsForTrack, getProgress: () => progressHistory, RAW_SECPLUS_BANK }; })();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', code);
class Ev { constructor(t){ this.type = t; } }
const errors = [];
try{ run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev); }
catch(err){ errors.push('boot: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }

const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const H = globalThis.__hooks;
try{
  const forms = H.PRACTICE_FORMS.security_plus, newForms = forms.filter(f => f.reserved), oldForms = forms.filter(f => !f.reserved);
  const NEED = { general: 10, threats: 19, architecture: 16, secops: 24, management: 17 };
  const ids = f => Object.keys(f.mc).reduce((a, k) => a.concat(f.mc[k]), []);
  ok('5 new exams numbered 11-15, marked as new-question exams', newForms.length === 5 && newForms.map(f => f.n).join() === '11,12,13,14,15');
  ok('each: 86 MC split 10/19/16/24/17 + 4 PBQs (90 items, like the real exam)', newForms.every(f => Object.keys(NEED).every(k => f.mc[k].length === NEED[k]) && f.pbq.length === 4));
  const raw = H.RAW_SECPLUS_BANK, byId = {};
  raw.forEach(q => { byId[q.oid || H.exposure.qid(q.question)] = q; });
  const newIds = newForms.reduce((a, f) => a.concat(ids(f)), []), oldIds = new Set(oldForms.reduce((a, f) => a.concat(ids(f)), []));
  ok('430 questions, all brand new (written for these exams) and none shared with exams 1-10', newIds.length === 430 && new Set(newIds).size === 430 && newIds.every(id => byId[id] && byId[id].src === 'original-2026-11-pe' && !oldIds.has(id)));
  const oldText = new Set(raw.filter(q => q.src !== 'original-2026-11-pe').map(q => q.question.toLowerCase()));
  ok('no new question repeats an existing question\'s wording', newIds.every(id => !oldText.has(byId[id].question.toLowerCase())));
  const NQ = newIds.map(id => byId[id]);
  const multi = NQ.filter(q => q.correct.length > 1);
  ok('answer keys are valid; Select TWO questions have 5 options and 2 answers', NQ.every(q => q.correct.every(i => i >= 0 && i < q.options.length) && new Set(q.options).size === q.options.length && (q.correct.length === 1 ? q.options.length === 4 : (q.options.length === 5 && q.correct.length === 2 && /Select TWO/.test(q.question)))));
  ok('every exam has some Select TWO questions (' + newForms.map(f => ids(f).filter(id => byId[id].correct.length > 1).length).join('/') + ')', newForms.every(f => ids(f).some(id => byId[id].correct.length > 1)));
  ok('every question has an explanation and an objective', NQ.every(q => q.why && q.why.length > 30 && /^[1-5]\.\d$/.test(q.obj)));
  const pos = [0, 0, 0, 0]; NQ.filter(q => q.correct.length === 1).forEach(q => pos[q.correct[0]]++);
  ok('correct answers are spread across A-D (' + pos.join('/') + ')', pos.every(n => n > 60));
  const W = s => s.split(/\s+/).length, mean = a => a.reduce((x, y) => x + y, 0) / a.length;
  const single = NQ.filter(q => q.correct.length === 1);
  const longest = single.filter(q => { const L = q.options.map(W), c = L[q.correct[0]]; return c === Math.max(...L) && L.filter(x => x === c).length === 1; }).length / single.length;
  const ratio = mean(single.map(q => { const L = q.options.map(W); return L[q.correct[0]] / mean(L.filter((x, i) => i !== q.correct[0])); }));
  const stem = mean(NQ.map(q => W(q.question))), scen = NQ.filter(q => W(q.question) >= 18).length / NQ.length;
  ok(`style close to the benchmark: stems ${stem.toFixed(0)} words, ${Math.round(scen * 100)}% scenario-length, correct answer longest ${Math.round(longest * 100)}%, length ratio ${ratio.toFixed(2)}`, stem >= 25 && scen > 0.85 && longest < 0.15 && ratio > 0.85 && ratio < 1.15);
  // PBQs and simulations
  const defs = {}; H.PBQ_BANK.filter(p => p.cert === 'security_plus').forEach(p => { defs[H.exposure.qid(p.prompt)] = p; });
  const newP = newForms.reduce((a, f) => a.concat(f.pbq), []);
  ok('20 new PBQs: each exam has a command-line task, two interactive tasks and a large simulation', newP.length === 20 && new Set(newP).size === 20 && newForms.every(f => { const t = f.pbq.map(id => defs[id]); return t.every(Boolean) && t[0].type === 'cli' && !t[1].sim && !t[2].sim && t[3].sim && t[3].type === 'terminal'; }));
  const oldP = new Set(oldForms.reduce((a, f) => a.concat(f.pbq), []));
  ok('new PBQs are not used in exams 1-10', newP.every(id => !oldP.has(id)));
  const cli = newP.map(id => defs[id]).filter(d => d.type === 'cli');
  ok('command-line PBQs accept their example answer and reject a blank', cli.length === 5 && cli.every(d => d.answerPattern.test(d.example) && !d.answerPattern.test('')));
  const sims = newP.map(id => defs[id]).filter(d => d.sim);
  let simOk = 0;
  sims.forEach(d => { const lab = H.CLI_LABS.find(l => l.id === d.lab);
    if(!lab || !lab.examOnly || lab.steps.length < 5) return;
    const good = lab.steps.every(s => H.labEngine.gradeStep(lab, s, s.kind === 'cmd' ? s.ex : (s.answer.type === 'choice' ? s.answer.correct : s.answer.shown)).ok);
    const bad = lab.steps.every(s => !H.labEngine.gradeStep(lab, s, s.kind === 'cmd' ? 'echo nope' : (s.answer.type === 'choice' ? (s.answer.correct + 1) % s.answer.options.length : 'nope')).ok);
    if(good && bad) simOk++; });
  ok('5 new large simulations (5-6 steps, exam-only) grade right and wrong answers correctly', sims.length === 5 && simOk === 5);
  const inter = newP.map(id => defs[id]).filter(d => !d.sim && d.type !== 'cli');
  let interOk = 0;
  inter.forEach(d => { try{ const q = H.instantiatePBQ(d); if(q && q.type === d.type) interOk++; }catch(e){} });
  ok('10 interactive PBQs (logs, headers, DNS, scan report, VPN and access config, zones, order, match) build without errors', inter.length === 10 && interOk === 10);
  // the exam itself
  const ex = H.buildPracticeFormExam('security_plus', 13);
  ok('Practice Exam 13 builds with all 86 questions and 4 PBQs, nothing replaced', ex && ex.mc.length === 86 && ex.pbq.length === 4 && ex.replaced === 0);
  // hold-back
  const R = H.reservedPracticeIds('security_plus');
  ok('before any new exam is taken, all 430 questions and 20 PBQs are held back', R.q.size === 430 && R.p.size === 20);
  const poolIds = new Set(); Object.keys(NEED).forEach(k => H.getCombinedDomainPool('security_plus', k, 'bank').forEach(q => poolIds.add(q.id)));
  ok('Fresh exams and quizzes never draw held-back questions', newIds.every(id => !poolIds.has(id)) && poolIds.size > 800);
  const picked = H.selectPBQs(400, 'security_plus').map(q => q._pbqId);
  ok('Fresh exams and PBQ practice never draw held-back PBQs', picked.length > 40 && picked.every(id => !R.p.has(id)));
  H.switchTab('climastery');
  ok('new simulations stay out of the simulation command drills', H.simLabsForTrack().every(l => !sims.some(d => d.lab === l.id)) && H.simLabsForTrack().length >= 24);
  const dp = H.dailyChallengePool('security_plus');
  ok('daily challenge skips held-back questions', dp.every(q => !R.q.has(q.oid || H.exposure.qid(q.question))));
  // take exam 12 -> its items are released, the others stay held back
  H.getProgress().examAttempts = (H.getProgress().examAttempts || []).concat([{ ts: Date.now(), cert: 'security_plus', form: 12, correctCount: 70, total: 90 }]);
  const R2 = H.reservedPracticeIds('security_plus'), f12 = newForms.find(f => f.n === 12);
  ok('after Practice Exam 12 is taken, only its items are released', R2.q.size === 344 && ids(f12).every(id => !R2.q.has(id)) && R2.p.size === 16);
  const pool2 = new Set(); Object.keys(NEED).forEach(k => H.getCombinedDomainPool('security_plus', k, 'bank').forEach(q => pool2.add(q.id)));
  ok('released questions join the Fresh exam pool', ids(f12).every(id => pool2.has(id)));
  H.renderPracticeFormPicker();
  const opts = document.getElementById('exam-coldrun-form').innerHTML;
  ok('exam picker labels the new exams', /Practice Exam 11 \(new questions\): not taken/.test(opts) && /Practice Exam 12 \(new questions\): taken 1/.test(opts));
}catch(err){ errors.push('drive: ' + err.message + ' ' + (err.stack || '').split('\n').slice(1, 3).join(' ')); }
{ const s0 = html.indexOf('\n<script>\n'), e1 = html.indexOf('</script>', s0), e2 = html.indexOf('\n</script>', s0) + 1;
  ok('no text inside the app script closes the script tag early (the browser would show code as text)', s0 > 0 && e1 === e2); }
ok('no script errors', errors.length === 0);
if(errors.length) console.log(errors);
let failed = 0; checks.forEach(([n, p]) => { console.log((p ? '  ok   ' : '  FAIL ') + n); if(!p) failed++; });
console.log(`${checks.length - failed} passed, ${failed} failed`); process.exit(failed ? 1 : 0);
