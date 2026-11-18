/* Instant feedback submit test: in Exam Mode (instant feedback), Quizzes and the Daily Challenge,
   tapping an option only selects it; nothing is graded until Submit Answer is pressed.
   Run:  node tests/instant-submit.test.js [path/to/index.html] */
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
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { exposure, getExamPolicy, renderExposureDashboard, cliTrainer, renderCliTab, cmdCards, getCmdSession: () => cmdSession, renderCmdCard, CMD_CARDS, gradeExamQuestion, instantiatePBQ, PBQ_BANK, renderExamQuestion, getExamState: () => examState, startLab, labSubmit, getLabRun: () => labRun, labEngine, showCliSection, CLI_LABS, renderReadiness, computeReadiness, PRACTICE_FORMS, buildPracticeFormExam, practiceFormStatus, renderPracticeFormPicker, EXPOSURE_GROUPS, EXPOSURE_SUPPLEMENTAL_SET, QUESTION_BANKS, switchTab, toggleExamOption, renderQuizQuestion, setQuiz: s => { quizState = s; }, getQuiz: () => quizState, renderDailyChallenge, setDC: s => { activeTrack = "security_plus"; dailyChallengeState = Object.assign({}, dailyChallengeState, s); } }; })();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', code);
class Ev { constructor(t){ this.type = t; } }
const errors = [];
try{ run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev); }
catch(err){ errors.push('boot: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }

const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const H = globalThis.__hooks;
try{
  // ---- Exam Mode with instant feedback ----
  document.getElementById('exam-cert-select').value = 'security_plus';
  document.getElementById('exam-instant-feedback').checked = true;
  document.getElementById('exam-include-pbq').checked = false;
  document.getElementById('exam-question-count').value = 5;
  document.getElementById('exam-start-btn').click();
  const es = H.getExamState();
  ok('practice exam starts in instant-feedback mode', es && es.instant === true && es.questions.length === 5);
  const q = es.questions[0];
  const wrong = q.options.find(o => !q.answer.includes(o)), right = q.answer[0];
  H.toggleExamOption(wrong, q.answer.length);
  ok('first tap only selects: nothing is graded yet', !es.checked[0] && es.selections[0].includes(wrong));
  const cb = document.getElementById('exam-check-btn');
  ok('Submit Answer button is shown and enabled once an answer is selected', cb.style.display === 'inline-block' && cb.disabled === false && /Submit Answer/.test(document.getElementById('exam-select-hint').textContent));
  H.toggleExamOption(right, q.answer.length);
  ok('a mis-tap can be changed before submitting', !es.checked[0] && es.selections[0].includes(right) && (q.answer.length > 1 || (es.selections[0].length === 1 && !es.selections[0].includes(wrong))));
  if(q.answer.length > 1) q.answer.slice(1).forEach(a => H.toggleExamOption(a, q.answer.length));
  cb.click();
  ok('Submit Answer grades the selected answer and locks the question', es.checked[0] && es.checked[0].isCorrect === true && cb.style.display === 'none' && document.getElementById('exam-feedback').style.display === 'block');
  const before = JSON.stringify(es.selections[0]); H.toggleExamOption(wrong, q.answer.length);
  ok('after submitting, taps no longer change the answer', JSON.stringify(es.selections[0]) === before);
  es.currentIndex = 1; H.renderExamQuestion();
  ok('next question starts with Submit disabled until something is selected', cb.style.display === 'inline-block' && cb.disabled === true);
  document.getElementById('exam-check-btn').click();
  ok('submitting with nothing selected does not grade', !es.checked[1]);
  // ---- Cold Run (no instant feedback) is unchanged ----
  H.getExamState().finished = true;
  // ---- Quizzes ----
  const made = []; const ce = document.createElement; document.createElement = tag => { const el = ce(tag); made.push(el); return el; };
  H.setQuiz({ questions: [{ question: 'Pick B', options: ['A', 'B', 'C', 'D'], answer: 'B' }], currentIndex: 0, score: 0, log: [], source: 'bank', timed: false });
  H.renderQuizQuestion();
  document.createElement = ce;
  const qb = made.filter(e => e.className === 'quiz-option-btn' || String(e.className).includes('quiz-option-btn'));
  const sub = document.getElementById('quiz-submit-btn');
  ok('quiz: Submit Answer starts disabled', qb.length === 4 && sub.disabled === true);
  qb[0].click();
  ok('quiz: tapping an option selects it without grading', H.getQuiz().answered === false && H.getQuiz().pending.opt === 'A' && sub.disabled === false);
  qb[1].click();
  ok('quiz: selection can be changed', H.getQuiz().pending.opt === 'B' && H.getQuiz().answered === false);
  sub.click();
  ok('quiz: Submit Answer grades the chosen option', H.getQuiz().answered === true && H.getQuiz().score === 1 && H.getQuiz().log[0].chosen === 'B' && sub.style.display === 'none');
  // ---- Daily challenge ----
  H.setDC({ cert: 'security_plus', qIndex: 0, picked: null }); H.renderDailyChallenge();
  const dc = document.getElementById('home-daily-challenge').innerHTML;
  ok('daily challenge shows a Submit Answer button (disabled until an option is picked)', /daily-challenge-submit/.test(dc) && /Submit Answer/.test(dc) && /id="daily-challenge-submit"\s+disabled/.test(dc) && !/daily-challenge-opt[^"]*selected/.test(dc));
}catch(err){ errors.push('drive: ' + err.message + ' ' + (err.stack || '').split('\n').slice(1, 3).join(' ')); }
ok('no script errors', errors.length === 0);
if(errors.length) console.log(errors);
let failed = 0; checks.forEach(([n, p]) => { console.log((p ? '  ok   ' : '  FAIL ') + n); if(!p) failed++; });
console.log(`${checks.length - failed} passed, ${failed} failed`); process.exit(failed ? 1 : 0);
