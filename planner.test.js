/* Study planner (P12): time-boxed sessions, weekly summary, exam-weighted domain focus, no streak pressure. */
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
const hooked = BASE.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { switchTab, BACKUP_KEYS, importBackupFile, validateBackupPayload, sanitizeNotesArray, getNotes: () => notes, plannerSessionSteps, plannerWeekSummary, buildStudyPlan, renderStudyPlanner, evidenceAdd, getQuiz: () => quizState };\n})();');
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
  const H = boot({ cybersec_track_v1: 'cysa' });
  [5, 15, 30, 60, 25, 120].forEach(m => {
    const st = H.plannerSessionSteps(m, 'cysa'), total = st.filter(s => s.mins < 165).reduce((a, s) => a + s.mins, 0);
    ok(`${m}-minute session fits the time (${total} min, ${st.length} steps)`, st.length >= 1 && total <= Math.max(m * 1.35, m + 5) && total >= Math.min(m * 0.5, 4) && st.every(s => typeof s.go === 'function' && s.label));
  });
  ok('long sessions mention the full practice exam option', H.plannerSessionSteps(120, 'cysa').some(s => /full practice exam/.test(s.label)));
  ok('other certifications get sessions too', H.plannerSessionSteps(30, 'security_plus').length >= 2);
  H.plannerSessionSteps(15, 'cysa')[0].go();
  ok('starting a session step launches practice', H.getQuiz() && H.getQuiz().questions.length > 0);
  H.evidenceAdd('quiz', 'cysa', '#w1', '2.3', 0, 0); H.evidenceAdd('quiz', 'cysa', '#w2', '2.3', 0, 0); H.evidenceAdd('quiz', 'cysa', '#w3', '2.3', 0, 0); H.evidenceAdd('quiz', 'cysa', '#w4', '2.3', 1, 0); H.evidenceAdd('atc', 'cysa', 'd#1', '1.2', 1, 0);
  const W = H.plannerWeekSummary('cysa');
  ok('weekly summary counts answers, days and objectives', W.n === 5 && W.days === 1 && W.objs === 2 && Math.abs(W.acc - 0.4) < 1e-9);
  ok('weekly summary names the weakest objective with enough answers', W.weakest === '2.3');
  const d = new Date(Date.now() + 60 * 864e5).toISOString().slice(0, 10);
  const plan = H.buildStudyPlan('cysa', d, 5, 5);
  ok('a 5-minute daily plan is allowed', plan && !plan.error && plan.schedule.every(s => s.minutes === 5));
  const w = {}; plan.domainWeights.forEach(x => { w[x.key] = x.weight; });
  ok('with no data, domain emphasis follows the official exam weights (secops > reporting)', w.secops > w.reporting && w.vulnmgmt > w.reporting);
  H.switchTab('planner');
  const ui = Object.keys(els).map(k => String(els[k].innerHTML || '')).find(x => /I have time now/.test(x)) || '';
  ok('planner shows the session builder and weekly summary', /I have time now/.test(ui) && /This week/.test(ui) && /5 min/.test(ui) && /Custom/.test(ui));
  ok('planner avoids streak pressure', /No streaks here/.test(ui) && !/streak/i.test(ui.replace(/No streaks here/, '')));
}catch(err){ errors.push('planner: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
let pass = 0; checks.forEach(([n, c]) => { if(c) pass++; else console.log('FAIL', n); });
errors.forEach(e => console.log('ERROR', e));
console.log('planner: ' + pass + ' passed, ' + (checks.length - pass) + ' failed' + (errors.length ? ', ' + errors.length + ' errors' : ''));
process.exit(pass === checks.length && !errors.length ? 0 : 1);
