/* Simulation Commands quiz test: every command step of every terminal lab and simulation becomes a
   multiple-choice question whose right answer the lab's grader accepts and whose wrong options it
   rejects; walk-through order, same-lab distractors, track filtering and a full run through the UI.
   Run:  node tests/sim-cmd-quiz.test.js [path/to/index.html] */
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
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { exposure, getExamPolicy, renderExposureDashboard, cliTrainer, renderCliTab, cmdCards, getCmdSession: () => cmdSession, renderCmdCard, CMD_CARDS, gradeExamQuestion, instantiatePBQ, PBQ_BANK, renderExamQuestion, getExamState: () => examState, startLab, labSubmit, getLabRun: () => labRun, labEngine, showCliSection, CLI_LABS, renderReadiness, computeReadiness, PRACTICE_FORMS, buildPracticeFormExam, practiceFormStatus, renderPracticeFormPicker, EXPOSURE_GROUPS, EXPOSURE_SUPPLEMENTAL_SET, QUESTION_BANKS, switchTab, buildCmdQuiz, startCmdQuiz, getCmdQuiz: () => cmdQuiz, renderCmdQuizQ, finishCmdQuiz, showCliSection, cmdQuizSubmit, buildSimCmdQuiz, simLabsForTrack, startSimQuiz, getSimQuiz: () => simQuiz, renderSimQuizQ, simQuizSubmit, renderSimQuizSetup, getSimRec: () => simRec }; })();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', code);
class Ev { constructor(t){ this.type = t; } }
const errors = [];
try{ run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev); }
catch(err){ errors.push('boot: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }

const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const H = globalThis.__hooks;
try{
  const labs = H.CLI_LABS, grade = (l, s, x) => H.labEngine.gradeStep(l, s, x).ok;
  const totalSteps = labs.reduce((t, l) => t + l.steps.filter(s => s.kind === 'cmd').length, 0);
  let seed = 5; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const bad = []; let covered = new Set();
  for(let run = 0; run < 40; run++){
    seed = run + 3;
    const qs = H.buildSimCmdQuiz(labs, { mode: 'mixed', count: 999 }, grade, rnd);
    qs.forEach(q => {
      covered.add(q.labId + '#' + q.stepIndex);
      const lab = labs.find(l => l.id === q.labId), step = lab.steps[q.stepIndex];
      if(q.options.length !== 4 || new Set(q.options.map(o => o.toLowerCase())).size !== 4) bad.push('options ' + q.labId);
      if(!grade(lab, step, q.answer)) bad.push('answer rejected ' + q.labId + ' ' + q.answer);
      q.options.filter(o => o !== q.answer).forEach(o => { if(grade(lab, step, o)) bad.push('distractor accepted ' + q.labId + ' ' + o); });
      if(q.prompt !== step.prompt) bad.push('prompt ' + q.labId);
    });
  }
  if(bad.length) console.log(bad.slice(0, 8));
  ok('every command step of every simulation becomes a question (' + totalSteps + ' steps)', covered.size === totalSteps);
  ok('the correct option is always accepted by the simulation\'s own grader', !bad.some(b => /answer rejected/.test(b)));
  ok('no wrong option would be accepted by the grader, so there is one right answer', !bad.some(b => /distractor accepted/.test(b)));
  ok('4 distinct options and the exact step prompt on every question', !bad.some(b => /^options|^prompt/.test(b)));
  const multi = labs.filter(l => l.steps.filter(s => s.kind === 'cmd').length >= 3);
  const wq = H.buildSimCmdQuiz(labs, { mode: 'walk', labIds: [multi[0].id] }, grade, rnd);
  const cmdIdx = multi[0].steps.map((s, i) => s.kind === 'cmd' ? i : -1).filter(i => i >= 0);
  ok('walk-through mode covers one simulation\'s command steps in order', wq.length === cmdIdx.length && wq.every((q, k) => q.stepIndex === cmdIdx[k] && q.n === k + 1));
  ok('in multi-step simulations, wrong options include the other steps\' commands', wq.every(q => q.sameLab >= 1));
  ok('later steps show the previous step\'s output for context', wq.slice(1).every(q => q.prevOut.length > 0));
  // track filtering
  const secIds = H.simLabsForTrack().map(l => l.id);
  ok('Security+ track: 24 simulations, none of the Network+-only labs', secIds.length === 24 && !secIds.includes('net-sim-gateway'));
  // UI
  H.showCliSection('simq');
  const sel = document.getElementById('simq-lab');
  ok('setup lists the mixed option and each simulation', (sel.innerHTML.match(/<option/g) || []).length === 25);
  sel.value = multi[0].id;
  document.getElementById('simq-start').click();
  const Q = H.getSimQuiz();
  ok('walk-through quiz starts at step 1', Q && Q.walk && Q.qs[0].n === 1 && /step 1 of/.test(document.getElementById('simq-area').innerHTML));
  Q.sel = Q.qs[0].options.find(o => o !== Q.qs[0].answer); H.simQuizSubmit();
  const fb = document.getElementById('simq-area').innerHTML;
  ok('a wrong answer shows the right command and the simulation\'s output', /Not quite/.test(fb) && /cli-term-line/.test(fb));
  const next = () => { Q.idx++; Q.sel = null; Q.answered = false; H.renderSimQuizQ(); };
  next(); for(let i = 1; i < Q.qs.length; i++){ Q.sel = Q.qs[i].answer; H.simQuizSubmit(); next(); }
  const res = document.getElementById('simq-area').innerHTML.replace(/<[^>]+>/g, ' ');
  ok('results list the missed step with the correct command', new RegExp('Quiz complete: ' + (Q.qs.length - 1) + ' / ' + Q.qs.length).test(res) && /Correct answer:/.test(res));
  ok('quiz history is saved', H.getSimRec().hist.length === 1);
}catch(err){ errors.push('drive: ' + err.message + ' ' + (err.stack || '').split('\n').slice(1, 3).join(' ')); }
ok('no script errors', errors.length === 0);
if(errors.length) console.log(errors);
let failed = 0; checks.forEach(([n, p]) => { console.log((p ? '  ok   ' : '  FAIL ') + n); if(!p) failed++; });
console.log(`${checks.length - failed} passed, ${failed} failed`); process.exit(failed ? 1 : 0);
