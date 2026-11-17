/* Practice exams test: checks the 10 fixed Security+ practice exams (blueprint split, no overlap,
   valid IDs, no near-duplicates, PBQ mix), then boots the real app against a fake DOM and takes
   Practice Exam 3 twice, a Fresh exam and Practice Exam 4 through the real buttons.
   Run:  node tests/practice-forms.test.js [path/to/index.html] */
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
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { exposure, getExamPolicy, renderExposureDashboard, cliTrainer, renderCliTab, renderCliCard, cliExpected, getCliSession: () => cliSession, gradeExamQuestion, instantiatePBQ, PBQ_BANK, renderExamQuestion, getExamState: () => examState, startLab, labSubmit, getLabRun: () => labRun, labEngine, showCliSection, CLI_LABS, renderReadiness, computeReadiness, PRACTICE_FORMS, buildPracticeFormExam, practiceFormStatus, renderPracticeFormPicker, EXPOSURE_GROUPS, EXPOSURE_SUPPLEMENTAL_SET, QUESTION_BANKS, switchTab }; })();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', code);
class Ev { constructor(t){ this.type = t; } }
const errors = [];
try{ run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev); }
catch(err){ errors.push('boot: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }

const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const H = globalThis.__hooks;
try{
  const forms = H.PRACTICE_FORMS.security_plus;
  const bankIds = new Set(H.QUESTION_BANKS.security_plus.map(q => q.oid || H.exposure.qid(q.question)));
  const defs = {}; H.PBQ_BANK.filter(p => p.cert === 'security_plus').forEach(p => { defs[H.exposure.qid(p.prompt)] = p; });
  const NEED = { general: 10, threats: 19, architecture: 16, secops: 24, management: 17 };
  const all = [], allP = [];
  forms.forEach(f => { Object.keys(f.mc).forEach(k => all.push(...f.mc[k])); allP.push(...f.pbq); });
  ok('10 practice exams', forms.length === 10 && forms.every((f, i) => f.n === i + 1));
  ok('each exam: 86 MC split 10/19/16/24/17 by domain + 4 PBQs', forms.every(f => Object.keys(NEED).every(k => (f.mc[k] || []).length === NEED[k]) && f.pbq.length === 4));
  ok('no question or PBQ appears in two exams', all.length === 860 && new Set(all).size === 860 && allP.length === 40 && new Set(allP).size === 40);
  ok('every question exists in the bank and is not supplemental', all.every(id => bankIds.has(id) && !H.EXPOSURE_SUPPLEMENTAL_SET.has(id)));
  ok('every PBQ exists, is exam-style (not a drill)', allP.every(id => defs[id] && !defs[id].drill));
  const domOf = {}; H.QUESTION_BANKS.security_plus.forEach(q => { domOf[q.oid || H.exposure.qid(q.question)] = q.domain; });
  ok('questions sit in the right domain list', forms.every(f => Object.keys(f.mc).every(k => f.mc[k].every(id => domOf[id] === k))));
  const groups = H.EXPOSURE_GROUPS.security_plus || [];
  ok('no exam contains two near-duplicate questions', forms.every(f => { const s = new Set(Object.keys(f.mc).reduce((a, k) => a.concat(f.mc[k]), [])); return groups.every(g => g.filter(id => s.has(id)).length <= 1); }));
  ok('each exam has a command-line PBQ (cli or terminal)', forms.every(f => f.pbq.some(id => ['cli', 'terminal'].includes(defs[id].type))));
  ok('the fresh mix draws from a bank that contains every practice exam', all.every(id => bankIds.has(id)));

  // drive the real UI the way a user does: the saved track sets the cert with no change event, then Exam Mode opens
  document.getElementById('exam-form-row').style.display = 'none';
  document.getElementById('exam-cert-select').value = 'security_plus';
  H.switchTab('exam');
  ok('opening Exam Mode on Security+ shows the Cold Run exam picker', document.getElementById('exam-form-row').style.display === '');
  document.getElementById('exam-cert-select').value = 'network_plus'; H.switchTab('exam');
  ok('picker is hidden for certs without practice exams', document.getElementById('exam-form-row').style.display === 'none');
  document.getElementById('exam-cert-select').value = 'security_plus'; H.switchTab('exam');
  const opts0 = document.getElementById('exam-coldrun-form').innerHTML;
  ok('picker lists Fresh + Practice Exams 1-10', /Fresh exam/.test(opts0) && (opts0.match(/Practice Exam \d+: not taken/g) || []).length === 10);
  const take = (formVal, answerAll) => {
    document.getElementById('exam-coldrun-form').value = String(formVal);
    document.getElementById('exam-coldrun-btn').click();
    const es = H.getExamState();
    const ids = es.questions.filter(q => !q.type || q.type === 'mc' || q.options).map(q => q.id).filter(Boolean);
    const pbqIds = es.questions.map(q => q._pbqId).filter(Boolean);
    if(answerAll) es.questions.forEach((q, i) => { if(q.answer && q.options) es.selections[i] = q.answer.slice(); });
    document.getElementById('exam-submit-btn').click();
    return { es, ids, pbqIds, sum: document.getElementById('exam-summary').innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ') };
  };
  const f3 = forms[2], f3ids = Object.keys(f3.mc).reduce((a, k) => a.concat(f3.mc[k]), []);
  const a1 = take(3, true);
  ok('Practice Exam 3 serves exactly its 86 questions and 4 PBQs', a1.es.questions.length === 90 && a1.ids.length === 86 && a1.ids.every(id => f3ids.includes(id)) && a1.pbqIds.every(id => f3.pbq.includes(id)) && a1.pbqIds.length === 4);
  ok('results title names the exam and attempt', /Practice Exam 3 complete · attempt 1/.test(a1.sum));
  const att = () => JSON.parse(store['cybersec_progress_v1']).examAttempts.filter(a => a.cert === 'security_plus');
  ok('first attempt stored with form 3, attempt 1, 86 fresh', att().length === 1 && att()[0].form === 3 && att()[0].formAttempt === 1 && att()[0].freshTotal === 86);
  ok('answering every MC question correctly scores 86 of 90 or more', att()[0].correctCount >= 86);
  const a2 = take(3, false);
  ok('retake: same questions, attempt 2, all repeats (0 fresh)', /attempt 2/.test(a2.sum) && a2.ids.slice().sort().join() === a1.ids.slice().sort().join() && att()[1].freshTotal === 0 && att()[1].repeatTotal === 86);
  H.renderPracticeFormPicker();
  const opts1 = document.getElementById('exam-coldrun-form').innerHTML;
  ok("picker shows attempts and best score for Exam 3", /Practice Exam 3: taken 2×, best \d+%/.test(opts1));
  const a3 = take('fresh', false);
  ok('Fresh exam still works and avoids the just-used Practice Exam 3', a3.ids.length === 86 && a3.ids.filter(id => f3ids.includes(id)).length === 0 && !/Practice Exam/.test(a3.sum.slice(0, 60)));
  const fr = take(4, false);
  const seenInF4 = H.practiceFormStatus('security_plus').find(s => s.n === 4);
  ok('Practice Exam 4 counts questions already met in the fresh exam as repeats', att()[3].form === 4 && att()[3].repeatTotal === a3.ids.filter(id => Object.keys(forms[3].mc).reduce((a, k) => a.concat(forms[3].mc[k]), []).includes(id)).length && seenInF4.seen === 86);
  H.renderReadiness();
  const rd = document.getElementById('readiness-content').innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  ok('Readiness lists practice exams with first/best attempts', /Practice exams \(2 of 10 taken\)/.test(rd) && /Practice Exam 3 2 /.test(rd));
  // a removed question is replaced from the same domain
  const saved = forms[0].mc.secops[0]; forms[0].mc.secops[0] = '#doesnotexist';
  const built = H.buildPracticeFormExam('security_plus', 1);
  forms[0].mc.secops[0] = saved;
  ok('a missing question is replaced from the same domain (86 kept)', built.mc.length === 86 && built.replaced === 1 && built.mc.filter(q => q.domain === 'secops').length === 24);
}catch(err){ errors.push('drive: ' + err.message + ' ' + (err.stack || '').split('\n').slice(1, 3).join(' ')); }
ok('no script errors', errors.length === 0);
if(errors.length) console.log(errors);
let failed = 0; checks.forEach(([n, p]) => { console.log((p ? '  ok   ' : '  FAIL ') + n); if(!p) failed++; });
console.log(`${checks.length - failed} passed, ${failed} failed`); process.exit(failed ? 1 : 0);
