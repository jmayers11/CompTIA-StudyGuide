/* Exam save/resume test: an untimed exam is saved to storage, survives the app being closed and
   reopened, resumes at the same question with the same answers, flags and PBQs, is kept when
   leaving with the back arrow, and is cleared when submitted. Timed exams are not saved.
   Run:  node tests/exam-save.test.js [path/to/index.html] */
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
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { exposure, getExamPolicy, renderExposureDashboard, cliTrainer, renderCliTab, cmdCards, getCmdSession: () => cmdSession, renderCmdCard, CMD_CARDS, gradeExamQuestion, instantiatePBQ, PBQ_BANK, renderExamQuestion, getExamState: () => examState, startLab, labSubmit, getLabRun: () => labRun, labEngine, showCliSection, CLI_LABS, renderReadiness, computeReadiness, PRACTICE_FORMS, buildPracticeFormExam, practiceFormStatus, renderPracticeFormPicker, EXPOSURE_GROUPS, EXPOSURE_SUPPLEMENTAL_SET, QUESTION_BANKS, switchTab, toggleExamOption, saveExamProgress, loadSavedExam, resumeSavedExam, renderSavedExamCards, finishExam: () => finishExam(), EXAM_SAVE_KEY }; })();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', code);
class Ev { constructor(t){ this.type = t; } }
const errors = [];
try{ run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev); }
catch(err){ errors.push('boot: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }

const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const boot = () => run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev);
let H = globalThis.__hooks;
try{
  // ---- untimed exam with PBQs (incl. a CLI PBQ whose answer pattern is a RegExp) ----
  document.getElementById('exam-cert-select').value = 'security_plus';
  document.getElementById('exam-instant-feedback').checked = true;
  document.getElementById('exam-include-pbq').checked = true;
  document.getElementById('exam-pbq-count').value = 4;
  document.getElementById('exam-question-count').value = 20;
  document.getElementById('exam-untimed').checked = true;
  document.getElementById('exam-start-btn').click();
  let es = H.getExamState();
  ok('untimed exam starts with no end time', es && !es.endTime && es.questions.length === 24);
  ok('untimed exam shows the "saved" label', /Untimed · saved/.test(document.getElementById('exam-timer').textContent));
  const mi = es.questions.findIndex(q => !q.type && q.options), q = es.questions[mi];
  es.currentIndex = mi; H.toggleExamOption(q.answer[0], q.answer.length);
  if(q.answer.length > 1) q.answer.slice(1).forEach(a => H.toggleExamOption(a, q.answer.length));
  document.getElementById('exam-check-btn').click();
  es.flagged[mi + 1] = true; es.currentIndex = mi + 2; H.renderExamQuestion();
  const cliIdx = es.questions.findIndex(x => x.type === 'cli');
  if(cliIdx >= 0) es.selections[cliIdx] = { typed: 'netstat -ano' };
  ok('progress is written to storage', H.saveExamProgress() === true && !!store[H.EXAM_SAVE_KEY]);
  const snap = { idx: es.currentIndex, sel: JSON.stringify(es.selections[mi]), checked: !!es.checked[mi], flag: es.flagged[mi + 1], ids: es.questions.map(x => x.id || x._pbqId).join(','), entry: es.exposureEntry && es.exposureEntry.ts };
  // ---- "close the page": boot the app again on the same storage ----
  boot(); H = globalThis.__hooks;
  ok('after reopening, no exam is running', !H.getExamState());
  H.renderSavedExamCards();
  const home = document.getElementById('home-saved-exam').innerHTML, intro = document.getElementById('exam-saved-slot').innerHTML;
  ok('Home and Exam Mode both show a Resume card with position and answered count', /Resume exam/.test(home) && /Resume exam/.test(intro) && new RegExp('Question ' + (snap.idx + 1) + ' of 24').test(home) && new RegExp((cliIdx >= 0 ? 2 : 1) + ' answered').test(home));
  ok('resume restores the exam', H.resumeSavedExam() === true && !!H.getExamState());
  es = H.getExamState();
  ok('same questions, same position, same answer, same flag, same instant-feedback result', es.currentIndex === snap.idx && JSON.stringify(es.selections[mi]) === snap.sel && !!es.checked[mi] === snap.checked && es.flagged[mi + 1] === true && es.questions.map(x => x.id || x._pbqId).join(',') === snap.ids && es.exposureEntry.ts === snap.entry);
  const cli = es.questions.find(x => x.type === 'cli'), term = es.questions.find(x => x.type === 'terminal');
  ok('CLI PBQ answer pattern and terminal labs survive the save', (!cli || cli.answerPattern instanceof RegExp) && (!term || (term.lab && Array.isArray(term.lab.steps))));
  ok('a resumed CLI PBQ still grades correctly', !cli || H.gradeExamQuestion(cli, { typed: cli.example }).isCorrect === true);
  // ---- leaving with the back arrow keeps the save ----
  document.getElementById('exam-exit-btn').click();
  ok('the back arrow leaves the exam but keeps it saved', !H.getExamState() && !!H.loadSavedExam());
  H.resumeSavedExam(); es = H.getExamState();
  // ---- finishing clears the save ----
  H.finishExam();
  ok('submitting the exam grades it and clears the saved copy', !H.loadSavedExam() && !store[H.EXAM_SAVE_KEY] && /complete|Complete/.test(document.getElementById('exam-summary').innerHTML));
  // ---- timed exams are not saved ----
  document.getElementById('exam-untimed').checked = false;
  document.getElementById('exam-time-limit').value = 30;
  document.getElementById('exam-start-btn').click();
  ok('timed exams are not saved', H.getExamState().endTime && H.saveExamProgress() === false && !H.loadSavedExam());
  H.finishExam();
  // ---- starting a new exam over a saved one asks, then replaces it ----
  document.getElementById('exam-untimed').checked = true;
  document.getElementById('exam-start-btn').click(); H.saveExamProgress();
  const firstIds = H.getExamState().questions.map(x => x.id || x._pbqId).join(',');
  document.getElementById('exam-exit-btn').click();
  document.getElementById('exam-start-btn').click(); // confirm() returns true in this harness
  H.saveExamProgress();
  ok('starting a new exam replaces the saved one', !!H.loadSavedExam() && H.loadSavedExam().state.questions.map(x => x.id || x._pbqId).join(',') !== firstIds);
  // ---- corrupted storage is ignored ----
  store[H.EXAM_SAVE_KEY] = '{not json';
  ok('a corrupted save is ignored instead of breaking the app', H.loadSavedExam() === null);
}catch(err){ errors.push('drive: ' + err.message + ' ' + (err.stack || '').split('\n').slice(1, 3).join(' ')); }
ok('no script errors', errors.length === 0);
if(errors.length) console.log(errors);
let failed = 0; checks.forEach(([n, p]) => { console.log((p ? '  ok   ' : '  FAIL ') + n); if(!p) failed++; });
console.log(`${checks.length - failed} passed, ${failed} failed`); process.exit(failed ? 1 : 0);
