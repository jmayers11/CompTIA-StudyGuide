/* CySA+ new practice exams test (Practice Exams 11-15): structure, Standard vs Advanced Analyst profiles, objective coverage,
   brand-new questions, PBQs from the v2 set, and the hold-back that keeps these items out of other study modes until each exam is taken.
   Run:  node tests/cysa-new-exams.test.js [path/to/index.html] */
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
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { exposure, getExamPolicy, renderExposureDashboard, cliTrainer, renderCliTab, cmdCards, getCmdSession: () => cmdSession, renderCmdCard, CMD_CARDS, gradeExamQuestion, instantiatePBQ, PBQ_BANK, renderExamQuestion, getExamState: () => examState, startLab, labSubmit, getLabRun: () => labRun, labEngine, showCliSection, CLI_LABS, renderReadiness, computeReadiness, PRACTICE_FORMS, buildPracticeFormExam, practiceFormStatus, renderPracticeFormPicker, EXPOSURE_GROUPS, EXPOSURE_SUPPLEMENTAL_SET, QUESTION_BANKS, switchTab, getCombinedDomainPool, selectPBQs, fcCollectBankCards, dailyChallengePool, reservedPracticeIds, simLabsForTrack, getProgress: () => progressHistory, RAW_SECPLUS_BANK, RAW_CYSA_BANK }; })();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', code);
class Ev { constructor(t){ this.type = t; } }
const errors = [];
try{ run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev); }
catch(err){ errors.push('boot: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }

const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const H = globalThis.__hooks;
try{
  const forms = H.PRACTICE_FORMS.cysa, newForms = forms.filter(f => f.n >= 11), oldForms = forms.filter(f => f.n <= 10);
  const NEED = { secops: 28, vulnmgmt: 21, ir_mgmt: 19, reporting: 13 };
  const ids = f => Object.keys(f.mc).reduce((a, k) => a.concat(f.mc[k]), []);
  const bank = H.RAW_CYSA_BANK, byId = {}; bank.forEach(q => { byId[q.oid || H.exposure.qid(q.question)] = q; });
  ok('5 new CySA+ exams numbered 11-15, all reserved', newForms.length === 5 && newForms.map(f => f.n).join() === '11,12,13,14,15' && newForms.every(f => f.reserved));
  ok('profiles: 11-13 Standard, 14-15 Advanced Analyst', newForms.every(f => f.format === (f.n >= 14 ? 'advanced' : 'standard')));
  ok('each: 81 MC split 28/21/19/13 + 4 PBQs (85 items)', newForms.every(f => Object.keys(NEED).every(k => f.mc[k].length === NEED[k]) && f.pbq.length === 4));
  const newIds = [].concat(...newForms.map(ids)), oldIds = new Set([].concat(...oldForms.map(ids)));
  ok('405 brand-new questions, none shared with exams 1-10', newIds.length === 405 && new Set(newIds).size === 405 && newIds.every(id => byId[id] && byId[id].rev === '2026-11-cs4x' && !oldIds.has(id)));
  const NQ = newIds.map(id => byId[id]);
  ok('answer keys valid; Select TWO items have 2 answers', NQ.every(q => q.correct.every(i => i >= 0 && i < q.options.length) && new Set(q.options).size === q.options.length && (/Select TWO/.test(q.question) ? q.correct.length === 2 : q.correct.length === 1)));
  ok('every question has an explanation and a CS0-004 objective', NQ.every(q => q.why && q.why.length > 30 && /^[1-4]\.[1-6]$/.test(q.obj)));
  const objCount = f => { const c = {}; ids(f).forEach(id => { const o = byId[id].obj; c[o] = (c[o] || 0) + 1; }); return c; };
  ok('every exam covers all 15 objectives, including at least 3 each for 1.5, 1.6 and 3.1', newForms.every(f => { const c = objCount(f); return Object.keys(c).length === 15 && c['1.5'] >= 3 && c['1.6'] >= 3 && c['3.1'] >= 3; }));
  ok('Advanced Analyst exams use only advanced-level items', newForms.filter(f => f.n >= 14).every(f => ids(f).every(id => byId[id].lvl === 'a')));
  const multi = f => ids(f).filter(id => byId[id].correct.length > 1).length;
  ok('every exam has Select TWO items, more on Advanced (' + newForms.map(multi).join('/') + ')', newForms.every(f => multi(f) >= 2) && Math.min(...newForms.filter(f => f.n >= 14).map(multi)) > Math.max(...newForms.filter(f => f.n <= 13).map(multi)) - 3);
  const W = s => (String(s).match(/\S+/g) || []).length;
  const avgStem = fs => { const a = [].concat(...fs.map(ids)).map(id => W(byId[id].question)); return a.reduce((x, y) => x + y, 0) / a.length; };
  ok(`Advanced stems are longer on average (${avgStem(newForms.filter(f => f.n >= 14)).toFixed(0)} vs ${avgStem(newForms.filter(f => f.n <= 13)).toFixed(0)} words)`, avgStem(newForms.filter(f => f.n >= 14)) > avgStem(newForms.filter(f => f.n <= 13)) + 5);
  const single = NQ.filter(q => q.correct.length === 1);
  const longest = single.filter(q => { const L = q.options.map(W), c = L[q.correct[0]]; return c === Math.max(...L) && L.filter(x => x === c).length === 1; }).length / single.length;
  ok(`correct answer is uniquely longest in only ${Math.round(longest * 100)}% of items`, longest <= 0.12);
  const pos = [0, 0, 0, 0]; single.forEach(q => pos[q.correct[0]] = (pos[q.correct[0]] || 0) + 1);
  ok('correct answers spread across A-D (' + pos.join('/') + ')', pos.every(n => n > 60));
  const defs = {}; H.PBQ_BANK.filter(p => p.cert === 'cysa').forEach(p => { defs[H.exposure.qid(p.prompt)] = p; });
  const newP = [].concat(...newForms.map(f => f.pbq)), oldP = new Set([].concat(...oldForms.map(f => f.pbq)));
  ok('20 PBQs from the new v2 set, one per domain in each exam, none used in exams 1-10', newP.length === 20 && new Set(newP).size === 20 && newP.every(id => defs[id] && defs[id].rev === '2026-11-cs4v2' && !oldP.has(id)) && newForms.every(f => new Set(f.pbq.map(id => defs[id].domain)).size === 4));
  const ex = H.buildPracticeFormExam('cysa', 14);
  ok('Practice Exam 14 builds with all 81 questions and 4 PBQs, nothing replaced', ex && ex.mc.length === 81 && ex.pbq.length === 4 && ex.replaced === 0);
  const R = H.reservedPracticeIds('cysa');
  ok('before any new exam is taken, all 405 questions and 20 PBQs are held back', R.q.size === 405 && R.p.size === 20);
  const poolIds = new Set(); Object.keys(NEED).forEach(k => H.getCombinedDomainPool('cysa', k, 'bank').forEach(q => poolIds.add(q.id)));
  ok('Fresh exams and quizzes never draw held-back questions', newIds.every(id => !poolIds.has(id)) && poolIds.size > 700);
  const picked = H.selectPBQs(400, 'cysa').map(q => q._pbqId);
  ok('Fresh exams and PBQ practice never draw held-back PBQs', picked.length > 20 && picked.every(id => !R.p.has(id)));
  const dp = H.dailyChallengePool('cysa');
  ok('daily challenge skips held-back questions', dp.every(q => !R.q.has(q.oid || H.exposure.qid(q.question))));
  H.getProgress().examAttempts = (H.getProgress().examAttempts || []).concat([{ ts: Date.now(), cert: 'cysa', form: 15, correctCount: 60, total: 85 }]);
  const R2 = H.reservedPracticeIds('cysa'), f15 = newForms.find(f => f.n === 15);
  ok('after Practice Exam 15 is taken, only its items are released', R2.q.size === 324 && ids(f15).every(id => !R2.q.has(id)) && R2.p.size === 16);
  document.getElementById('exam-cert-select').value = 'cysa';
  H.renderPracticeFormPicker();
  const opts = document.getElementById('exam-coldrun-form').innerHTML;
  ok('exam picker labels both profiles', /Practice Exam 11 \(Standard profile, new questions\): not taken/.test(opts) && /Practice Exam 15 \(Advanced Analyst profile, new questions\): taken 1/.test(opts));
}catch(err){ errors.push('drive: ' + err.message + ' ' + (err.stack || '').split('\n').slice(1, 3).join(' ')); }
ok('no script errors', errors.length === 0);
let pass = 0; checks.forEach(([n, c]) => { console.log((c ? '  ok   ' : '  FAIL ') + n); if(c) pass++; });
errors.forEach(e => console.log('ERROR', e));
console.log(pass + ' passed, ' + (checks.length - pass) + ' failed');
process.exit(pass === checks.length ? 0 : 1);
