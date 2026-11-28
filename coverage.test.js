/* CS0-004 coverage explorer: every objective bullet indexed, practice launches use eligible questions only. */
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
const hooked = BASE.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { switchTab, BACKUP_KEYS, importBackupFile, validateBackupPayload, sanitizeNotesArray, getNotes: () => notes, coverageIndex, coveragePractice, renderCoverageExplorer, getQuiz: () => quizState, reservedPracticeIds, RAW_CYSA_BANK, QUESTION_BANKS };\n})();');
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
  const rows = H.coverageIndex();
  ok('all 194 CS0-004 subtopics are indexed', rows.length === 194);
  ok('every objective 1.1-4.2 is represented', new Set(rows.map(r => r.obj)).size === 15);
  ok('no subtopic is Missing', rows.every(r => r.status !== 'missing'));
  const thin = rows.filter(r => r.status === 'insufficient').map(r => r.obj + ' ' + r.name);
  ok('no subtopic is Thin (' + (thin.join('; ') || 'none') + ')', thin.length === 0);
  const mcOnly = rows.filter(r => r.applied === 0).map(r => r.obj + ' ' + r.name);
  ok('every subtopic has applied practice (PBQ, drill or case): ' + (mcOnly.join('; ') || 'all ' + rows.length), mcOnly.length === 0);
  ok('counts are non-negative integers', rows.every(r => Object.values(r.c).every(v => Number.isInteger(v) && v >= 0)));
  const ret = rows.find(r => r.name === 'Logging: retention');
  ok('a gap-filled subtopic now has questions', ret && ret.c.mc >= 3);
  // practice launch
  const row = rows.find(r => r.singleIdx.length >= 3);
  H.coveragePractice(row);
  const qs = H.getQuiz();
  const bank = H.RAW_CYSA_BANK;
  const reserved = H.reservedPracticeIds('cysa').q;
  const qidOf = t => { let h = 5381; for(let i = 0; i < t.length; i++){ h = ((h << 5) + h + t.charCodeAt(i)) >>> 0; } return '#' + h.toString(36) + t.length.toString(36); };
  ok('practice starts a quiz', qs && qs.questions && qs.questions.length >= 1 && qs.questions.length <= 10);
  ok('practice questions all match the chosen subtopic', qs.questions.every(q => row.singleIdx.some(i => bank[i].question === q.question)));
  ok('practice uses single-answer questions with a valid answer', qs.questions.every(q => q.options.includes(q.answer)));
  ok('practice never uses questions reserved for untaken exams', qs.questions.every(q => { const it = bank.find(b => b.question === q.question); return !reserved.has(it.oid || qidOf(it.question)); }));
  H.switchTab('readiness'); H.renderCoverageExplorer();
  const html = String(els['coverage-explorer'].innerHTML || '');
  ok('explorer renders a table for the selected objective', /cov-table/.test(html) && /Logging: retention|Practice/.test(html));
  ok('explorer labels counts as approximate', /approximate/i.test(html));
}catch(err){ errors.push('coverage: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
let pass = 0; checks.forEach(([n, c]) => { if(c) pass++; else console.log('FAIL', n); });
errors.forEach(e => console.log('ERROR', e));
console.log('coverage: ' + pass + ' passed, ' + (checks.length - pass) + ' failed' + (errors.length ? ', ' + errors.length + ' errors' : ''));
process.exit(pass === checks.length && !errors.length ? 0 : 1);
