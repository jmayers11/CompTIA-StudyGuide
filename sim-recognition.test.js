/* Simulation Command Recognition test: the question bank built from the terminal labs and simulations
   (step -> command, command -> purpose, option meanings, output reading, file paths) has one right
   answer per question, randomized positions, missed-first ordering, missed-only mode, saved progress
   and backup coverage, and stays separate from the Command Quiz and exam scores.
   Run:  node tests/sim-recognition.test.js [path/to/index.html] */
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
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { exposure, getExamPolicy, renderExposureDashboard, cliTrainer, renderCliTab, cmdCards, getCmdSession: () => cmdSession, renderCmdCard, CMD_CARDS, gradeExamQuestion, instantiatePBQ, PBQ_BANK, renderExamQuestion, getExamState: () => examState, startLab, labSubmit, getLabRun: () => labRun, labEngine, showCliSection, CLI_LABS, renderReadiness, computeReadiness, PRACTICE_FORMS, buildPracticeFormExam, practiceFormStatus, renderPracticeFormPicker, EXPOSURE_GROUPS, EXPOSURE_SUPPLEMENTAL_SET, QUESTION_BANKS, switchTab, buildCmdQuiz, startCmdQuiz, getCmdQuiz: () => cmdQuiz, renderCmdQuizQ, finishCmdQuiz, showCliSection, cmdQuizSubmit, buildSimCmdQuiz, simLabsForTrack, startSimQuiz, getSimQuiz: () => simQuiz, renderSimQuizQ, simQuizSubmit, renderSimQuizSetup, buildSimRecBank, buildSimRecQuiz, simRecBank, simRecWeights, simRecMissedIds, finishSimQuiz, getSimRec: () => simRec, BACKUP_KEYS, exportBackup }; })();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', code);
class Ev { constructor(t){ this.type = t; } }
const errors = [];
try{ run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev); }
catch(err){ errors.push('boot: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }

const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const H = globalThis.__hooks;
try{
  const grade = (l, s, x) => H.labEngine.gradeStep(l, s, x).ok;
  const labs = H.simLabsForTrack(), bank = H.simRecBank();
  const kinds = {}; bank.forEach(b => kinds[b.kind] = (kinds[b.kind] || 0) + 1);
  ok('bank has all five question types (' + JSON.stringify(kinds) + ')', ['step', 'purpose', 'flag', 'output', 'path'].every(k => kinds[k] >= 5));
  const cmdSteps = labs.flatMap(l => l.steps.map((s, i) => ({ l, s, i })).filter(x => x.s.kind === 'cmd' && x.s.ex));
  ok('every simulation command step has a step and a purpose question (' + cmdSteps.length + ')', cmdSteps.every(x => bank.some(b => b.id === `${x.l.id}#${x.i}#step`) && bank.some(b => b.id === `${x.l.id}#${x.i}#purpose`)));
  const asks = labs.flatMap(l => l.steps.map((s, i) => ({ l, s, i })).filter(x => x.s.kind === 'ask'));
  ok('every output question in the simulations is included (' + asks.length + ')', asks.every(x => bank.some(b => b.id === `${x.l.id}#${x.i}#output`)));
  ok('unique question ids', new Set(bank.map(b => b.id)).size === bank.length);
  const bad = [], pos = {};
  for(let r = 0; r < 30; r++){
    const qs = H.buildSimRecQuiz(bank, { count: 9999 });
    if(r === 0) ok('full bank: every question gets 4 options', qs.length === bank.length);
    qs.forEach(q => {
      pos[q.kind] = pos[q.kind] || [0, 0, 0, 0]; pos[q.kind][q.options.indexOf(q.answer)]++;
      if(q.options.length !== 4 || new Set(q.options.map(o => String(o).toLowerCase())).size !== 4) bad.push('opts ' + q.id);
      const wrong = q.options.filter(o => o !== q.answer);
      const lab = H.CLI_LABS.find(l => l.id === q.labId), step = lab && lab.steps[q.stepIndex];
      if(q.kind === 'step'){
        if(!grade(lab, step, q.answer)) bad.push('step answer ' + q.id);
        wrong.forEach(o => { if(grade(lab, step, o)) bad.push('step distractor accepted ' + q.id + ' ' + o); });
      }
      if(q.kind === 'purpose'){
        if(q.answer !== step.prompt) bad.push('purpose answer ' + q.id);
        wrong.forEach(o => { cmdSteps.filter(x => x.s.prompt === o).forEach(x => { if(grade(x.l, x.s, q.prompt)) bad.push('purpose distractor fits ' + q.id + ' ' + o); }); });
      }
      if(q.kind === 'flag'){
        const f = (q.card.flags || []).find(x => x[0] === q.flag);
        if(!f || f[1] !== q.answer) bad.push('flag answer ' + q.id);
        if(wrong.includes(q.answer)) bad.push('flag dup ' + q.id);
        if(!q.cmd.includes(q.flag[0]) ) bad.push('flag missing ' + q.id);
      }
      if(q.kind === 'output'){
        if(step.answer.type === 'choice'){ if(q.answer !== step.answer.options[step.answer.correct]) bad.push('output answer ' + q.id); }
        else {
          const acc = t => step.answer.accept.some(r => new RegExp(r, 'i').test(t));
          if(!acc(q.answer)) bad.push('output text answer ' + q.id);
          wrong.forEach(o => { if(acc(o)) bad.push('output distractor accepted ' + q.id + ' ' + o); });
        }
      }
      if(q.kind === 'path' && q.labId !== 'common-paths'){
        if(!step.ex.includes(q.answer)) bad.push('path answer ' + q.id);
        if(step.prompt.toLowerCase().includes(q.answer.toLowerCase())) bad.push('path given away ' + q.id);
      }
    });
  }
  if(bad.length) console.log([...new Set(bad)].slice(0, 10));
  ok('4 distinct options on every question', !bad.some(b => /^opts/.test(b)));
  ok('step questions: the grader accepts the answer and rejects every wrong command', !bad.some(b => /^step/.test(b)));
  ok('purpose questions: no wrong purpose is a step the shown command would also pass', !bad.some(b => /^purpose/.test(b)));
  ok('option-meaning answers come from the command deck and appear in the command', !bad.some(b => /^flag/.test(b)));
  ok('output answers match the simulation and wrong options are not accepted', !bad.some(b => /^output/.test(b)));
  ok('file-path questions use the step\'s path without giving it away in the prompt', !bad.some(b => /^path/.test(b)));
  ok('answer position is randomized for every question type', Object.values(pos).every(a => a.every(n => n > 0)));
  // counts
  ok('10 / 20 / 40 question options', [10, 20, 40].every(n => H.buildSimRecQuiz(bank, { count: n }).length === n));
  // missed-first and missed-only
  const target = bank.find(b => b.kind === 'flag'), target2 = bank.find(b => b.kind === 'output');
  const rec = H.getSimRec(); rec.items[target.id] = { right: 0, wrong: 2, lastOk: false }; rec.items[target2.id] = { right: 1, wrong: 1, lastOk: false };
  const w = H.simRecWeights(bank);
  const first = H.buildSimRecQuiz(bank, { count: 10, weights: w });
  ok('previously missed questions are asked first', first[0].id === target.id && first[1].id === target2.id);
  const mo = H.buildSimRecQuiz(bank, { onlyIds: H.simRecMissedIds(), count: 999 });
  ok('missed-only mode asks just the missed questions', mo.length === 2 && mo.every(q => [target.id, target2.id].includes(q.id)));
  const stepQ = bank.find(b => b.kind === 'step' && b.card);
  H.cmdCards.recordPbqResult(stepQ.answer, false);
  ok('a command missed in an exam simulation is boosted', (H.simRecWeights(bank)[stepQ.id] || 0) > 0);
  delete rec.items[target.id]; delete rec.items[target2.id];
  // UI
  const examBefore = localStorage.getItem('cybersec_exam_history_v1'), cmdQuizBefore = JSON.stringify(H.cmdCards.pref('cmdQuizHistory') || null);
  H.showCliSection('simq');
  document.getElementById('simq-lab').value = 'all';
  document.getElementById('simq-kind').value = 'flag';
  document.getElementById('simq-count').value = '10';
  H.startSimQuiz(false);
  const Q = H.getSimQuiz();
  ok('quiz starts with the chosen type and count', Q && Q.qs.length === 10 && Q.qs.every(q => q.kind === 'flag'));
  let html = document.getElementById('simq-area').innerHTML;
  ok('Submit Answer is disabled until an option is picked', /id="simq-submit" disabled/.test(html));
  H.simQuizSubmit();
  ok('submitting with no selection does nothing', !Q.answered);
  Q.sel = Q.qs[0].options.find(o => o !== Q.qs[0].answer); H.renderSimQuizQ();
  ok('no grading before Submit', !/Not quite|Correct/.test(document.getElementById('simq-area').innerHTML.replace(/Correct answer/g, '')));
  H.simQuizSubmit();
  html = document.getElementById('simq-area').innerHTML;
  ok('feedback explains the command and each of its options', /Not quite/.test(html) && /simq-flags/.test(html) && /<li><code>/.test(html));
  const saved = JSON.parse(localStorage.getItem('cybersec_simrec_v1'));
  ok('progress saved per question under cybersec_simrec_v1', saved.items[Q.qs[0].id] && saved.items[Q.qs[0].id].wrong === 1 && saved.items[Q.qs[0].id].lastOk === false);
  for(let i = 1; i < Q.qs.length; i++){ Q.idx = i; Q.sel = Q.qs[i].answer; Q.answered = false; H.simQuizSubmit(); }
  H.finishSimQuiz();
  const res = document.getElementById('simq-area').innerHTML.replace(/<[^>]+>/g, ' ');
  ok('results show the score and the missed question', /Quiz complete: 9 \/ 10/.test(res) && /Correct answer:/.test(res));
  ok('quiz history saved', H.getSimRec().hist.length === 1 && H.getSimRec().hist[0].score === 9);
  H.renderSimQuizSetup();
  ok('Missed only button shows the missed count', /Missed only \(1\)/.test(document.getElementById('simq-missed').textContent) && !document.getElementById('simq-missed').disabled);
  H.startSimQuiz(true);
  ok('Missed only quiz runs the missed question', H.getSimQuiz().qs.length === 1 && H.getSimQuiz().qs[0].id === Q.qs[0].id);
  // one simulation walk-through covers its steps in order
  const multi = labs.find(l => l.id === 'lab-n6-accounts');
  document.getElementById('simq-kind').value = 'mixed'; document.getElementById('simq-lab').value = multi.id;
  H.startSimQuiz(false);
  const W = H.getSimQuiz();
  ok('single-simulation walk-through goes in step order', W.walk && W.qs.every((q, k) => k === 0 || q.stepIndex >= W.qs[k - 1].stepIndex) && W.qs.length >= 6);
  ok('separate from exam scores and the Command Quiz', localStorage.getItem('cybersec_exam_history_v1') === examBefore && JSON.stringify(H.cmdCards.pref('cmdQuizHistory') || null) === cmdQuizBefore);
  ok('Backup/Restore includes the new progress keys', H.BACKUP_KEYS.includes('cybersec_simrec_v1') && H.BACKUP_KEYS.includes('cybersec_attacks_v1'));
}catch(err){ errors.push('drive: ' + err.message + ' ' + (err.stack || '').split('\n').slice(1, 3).join(' ')); }
ok('no script errors', errors.length === 0);
if(errors.length) console.log(errors);
let failed = 0; checks.forEach(([n, p]) => { console.log((p ? '  ok   ' : '  FAIL ') + n); if(!p) failed++; });
console.log(`${checks.length - failed} passed, ${failed} failed`); process.exit(failed ? 1 : 0);
