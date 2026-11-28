/* Evidence engine (P5/P7): unified log, first-attempt flags, confidence, adaptive selection, weakness notebook. */
const fs = require('fs');
const html = fs.readFileSync(process.argv[2] || require('path').join(__dirname, '..', 'index.html'), 'utf8');
const s = html.indexOf('\n<script>\n'), e = html.indexOf('\n</script>', s);
let code = html.slice(s + 10, e);
let store = {};
const localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; }, key: i => Object.keys(store)[i] || null, get length(){ return Object.keys(store).length; }, clear(){ for(const k in store) delete store[k]; } };
let alerts = [];
function anything(){ const f = function(){ return anything(); };
  return new Proxy(f, { get(t, p){ if(p === Symbol.toPrimitive) return () => ''; if(p === 'length') return 0; if(p === Symbol.iterator) return function*(){}; if(p === 'then') return undefined; return anything(); }, apply(){ return anything(); }, set(){ return true; } }); }
let els = {};
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
  confirm: () => true, alert: (m) => alerts.push(String(m)), matchMedia: () => ({ matches: false, addEventListener(){}, addListener(){} }), requestAnimationFrame: () => 0, navigator: { serviceWorker: undefined, userAgent: 'node' }, location: { reload(){}, href: '', hash: '' }, innerWidth: 1200, innerHeight: 800 },
  { get(t, p){ if(p in t) return t[p]; if(p in globalThis) return globalThis[p]; return anything(); } });

const BASE = code;
const hooked = BASE.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { switchTab, BACKUP_KEYS, importBackupFile, validateBackupPayload, sanitizeNotesArray, getNotes: () => notes, evidenceAdd, evidenceLoad, evidenceItems, evidenceSummary, weaknessEntries, buildAdaptiveSet, startAdaptivePractice, renderWeaknessNotebook, selectQuizAnswer, getQuiz: () => quizState, reservedPracticeIds, RAW_CYSA_BANK, evidenceQid, renderQuizQuestion, buildStudyReport };\n})();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
class Ev { constructor(t){ this.type = t; } }
let pendingReader = null;
globalThis.FileReader = class { readAsText(f){ this.result = f._text; pendingReader = this; } };
const errors = [];
function boot(seed){
  store = {}; els = {}; alerts = []; Object.keys(seed).forEach(k => { store[k] = seed[k]; });
  const re2 = /<(input|select)[^>]*id="([^"]+)"[^>]*>/g; let mm;
  while((mm = re2.exec(html))){ const el = document.getElementById(mm[2]); const v = /value="([^"]*)"/.exec(mm[0]); if(v && mm[1] === 'input') el.value = v[1]; if(/\schecked\b/.test(mm[0])) el.checked = true; }
  document.getElementById('exam-source-select').value = 'bank'; document.getElementById('exam-policy-select').value = 'strict'; document.getElementById('exam-cert-select').value = 'security_plus';
  ['fc-source-select','fc-domain-select'].forEach(id => { const el = document.getElementById(id); el.options = new Proxy([], { get(t, p){ if(p === 'length') return 1; if(typeof p === 'string' && /^\d+$/.test(p)) return { text: 'All', value: '' }; return t[p]; } }); el.selectedIndex = 0; });
  const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', hooked);
  run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, (m) => alerts.push(String(m)), () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev);
  return globalThis.__hooks;
}

const checks = []; const ok = (n, c) => checks.push([n, !!c]);
try{
  let H = boot({ cybersec_track_v1: 'cysa' });
  H.evidenceAdd('quiz', 'cysa', '#a1', '2.3', 0, 1);
  H.evidenceAdd('quiz', 'cysa', '#a1', '2.3', 0, 0);
  H.evidenceAdd('exam', 'cysa', '#b2', '3.2', 0, 3);
  H.evidenceAdd('exam', 'cysa', '#c3', '1.1', 1, 1);
  let d = H.evidenceLoad();
  ok('rows are stored with source, cert, id, objective, credit, first flag and confidence', d.ev.length === 4 && d.ev[0].length === 8 && d.ev[0][1] === 'quiz' && d.ev[0][4] === '2.3');
  ok('first attempt is flagged once per item', d.ev[0][6] === 1 && d.ev[1][6] === 0 && d.ev[2][6] === 1);
  ok('log persists to storage', JSON.parse(store.cybersec_evidence_v1).ev.length === 4);
  let W = H.weaknessEntries('cysa');
  ok('confident miss is classified as a misconception and listed first', W[0].id === '#a1' && W[0].kind === 'misconception');
  ok('correct items are not in the notebook', !W.some(e => e.id === '#c3'));
  H.evidenceAdd('exam', 'cysa', '#b2', '3.2', 1, 0); H.evidenceAdd('exam', 'cysa', '#b2', '3.2', 1, 0);
  ok('two correct answers in a row resolve an entry', !H.weaknessEntries('cysa').some(e => e.id === '#b2'));
  H.evidenceAdd('exam', 'cysa', '#b2', '3.2', 0, 0);
  ok('a new miss reopens a resolved entry', H.weaknessEntries('cysa').some(e => e.id === '#b2'));
  const S = H.evidenceSummary('cysa');
  ok('summary separates first-attempt and repeat accuracy', S.first.n === 3 && S.repeat.n === 4);
  ok('summary reports accuracy by confidence', S.sure.n === 2 && S.sure.p === 0.5 && S.guess.n === 1);
  // adaptive selection
  const bank = H.RAW_CYSA_BANK; const ids23 = bank.filter(q => q.rev && q.obj === '2.3').slice(0, 30).map(q => q.oid || H.evidenceQid(q.question));
  ids23.forEach(id => H.evidenceAdd('quiz', 'cysa', id, '2.3', 0, 0));
  bank.filter(q => q.rev && q.obj === '1.1').slice(0, 30).forEach(q => H.evidenceAdd('quiz', 'cysa', q.oid || H.evidenceQid(q.question), '1.1', 1, 0));
  const A = H.buildAdaptiveSet(15);
  ok('adaptive set has 15 single-answer questions', A.questions.length === 15 && A.questions.every(q => q.options.includes(q.answer)));
  const reserved = H.reservedPracticeIds('cysa').q;
  ok('adaptive set never uses held-back practice-exam questions', A.questions.every(q => { const it = bank.find(b => b.question === q.question); return it && it.rev && !reserved.has(it.oid || H.evidenceQid(it.question)); }));
  const objOf = q => bank.find(b => b.question === q.question).obj;
  const n23 = A.questions.filter(q => objOf(q) === '2.3').length, n11 = A.questions.filter(q => objOf(q) === '1.1').length;
  ok('weak objective gets more questions than a mastered one (2.3: ' + n23 + ', 1.1: ' + n11 + ')', n23 > n11);
  ok('weak objective is named in the focus list', A.focus.includes('2.3'));
  // quiz hook with confidence
  H.startAdaptivePractice();
  const Q = H.getQuiz(); ok('adaptive practice opens the quiz runner', Q && Q.source === 'adaptive' && Q.questions.length === 15);
  const before = H.evidenceLoad().ev.length;
  Q.conf = 1; H.selectQuizAnswer(Q.questions[0].answer, { classList: { add(){}, remove(){} } });
  const last = H.evidenceLoad().ev.slice(-1)[0];
  ok('answering a quiz question logs evidence with its confidence and objective', H.evidenceLoad().ev.length === before + 1 && last[1] === 'quiz' && last[5] === 1 && last[7] === 1 && /^\d\.\d$/.test(last[4]));
  // notebook render + escaping
  const d2 = H.evidenceLoad(); const key = 'cysa|' + ids23[1]; d2.notes[key] = '<img src=x onerror=alert(1)>';
  H.renderWeaknessNotebook();
  const nb = String(els['weakness-notebook'].innerHTML || '');
  ok('notebook renders entries with labels', /Personal Weakness Notebook/.test(nb) && /Confident miss|Repeated miss|Missed|Nothing here/.test(nb));
  ok('user notes are shown and escaped', nb.indexOf('&lt;img src=x') > 0 && !/<img src=x/.test(nb));
  H.switchTab('readiness');
  const rd = Object.keys(els).map(k => String(els[k].innerHTML || '')).find(x => /Two separate measures/.test(x)) || '';
  ok('readiness shows certification readiness and analyst proficiency separately', /Certification readiness/.test(rd) && /Analyst proficiency/.test(rd));
  ok('readiness lists evidence checks and the method, without claiming an official score', /evidence checks met/.test(rd) && /How these are calculated/.test(rd) && /not an official score|isn't an official score|neither measure is an official score/.test(rd));
  const md = H.buildStudyReport('cysa');
  ok('exportable report covers readiness, proficiency, evidence, objectives and exams', /# Study progress report/.test(md) && /## Certification readiness/.test(md) && /## Analyst proficiency/.test(md) && /## Evidence log/.test(md) && /## Objectives/.test(md) && /## Practice exams/.test(md));
  ok('report repeats the unofficial-score caveat', /nothing here is an official score or a probability of passing/.test(md));
  // corrupted evidence storage
  H = boot({ cybersec_track_v1: 'cysa', cybersec_evidence_v1: JSON.stringify({ ev: [null, 5, ['bad'], [1, 'quiz', 'cysa', '#z', '1.1', 1, 1, 0]], notes: 'x' }) });
  ok('malformed evidence rows are dropped on load', H.evidenceLoad().ev.length === 1 && typeof H.evidenceLoad().notes === 'object');
  ok('evidence key is included in backups', html.indexOf("'cybersec_evidence_v1', 'cybersec_soc_v1', 'cybersec_qsb_v1',") > 0);
}catch(err){ errors.push('evidence: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
let pass = 0; checks.forEach(([n, c]) => { if(c) pass++; else console.log('FAIL', n); });
errors.forEach(e => console.log('ERROR', e));
console.log('evidence: ' + pass + ' passed, ' + (checks.length - pass) + ' failed' + (errors.length ? ', ' + errors.length + ' errors' : ''));
process.exit(pass === checks.length && !errors.length ? 0 : 1);
