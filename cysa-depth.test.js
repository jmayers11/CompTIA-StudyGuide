/* CySA+ depth round (Phase 5): PBQ objective tags, new PBQs and Investigations, PBQ workout mode. */
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
const hooked = BASE.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { switchTab, BACKUP_KEYS, importBackupFile, validateBackupPayload, sanitizeNotesArray, getNotes: () => notes, PBQ_BANK, INVESTIGATIONS, startPbqWorkout, pbqWorkoutObjectives, getExam: () => examState, reservedPracticeIds, exposure, plannerSessionSteps };\n})();');
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
  const P = H.PBQ_BANK.filter(p => p.cert === 'cysa');
  ok('152 CySA+ PBQs', P.length === 152);
  ok('every CySA+ PBQ is tagged to a CS0-004 objective in its own domain', P.every(p => /^[1-4]\.[1-6]$/.test(p.obj || '') && ({ '1': 'secops', '2': 'vulnmgmt', '3': 'ir_mgmt', '4': 'reporting' })[p.obj[0]] === p.domain));
  const counts = {}; P.forEach(p => { counts[p.obj] = (counts[p.obj] || 0) + 1; });
  ok('thin objectives now have at least 3 PBQs (' + ['2.1', '2.4', '3.1', '4.1', '4.2', '1.5'].map(o => o + ':' + counts[o]).join(' ') + ')', ['2.1', '2.4', '3.1', '4.1', '4.2', '1.5'].every(o => counts[o] >= 3));
  const N = P.filter(p => p.rev === '2026-11-cs4p5');
  ok('12 new depth PBQs with explanations and valid keys', N.length === 12 && N.every(p => (p.type === 'order' ? p.steps.length >= 4 : (p.explanation || '').length > 40)) && N.filter(p => p.type === 'zones').every(p => p.items.every(i => p.zones.includes(i.ans))) && N.filter(p => p.type === 'config').every(p => p.rows.every(r => r.cells.slice(1).every(c => c.opts.includes(c.ans)))));
  ok('18 investigations, 4 new ones covering domains 2 and 4', H.INVESTIGATIONS.length === 18 && ['patchday', 'lateral', 'breachcomms', 'cloudexpo'].every(id => H.INVESTIGATIONS.some(v => v.id === id)) && H.INVESTIGATIONS.filter(v => v.objs.some(o => o[0] === '2' || o[0] === '4')).length >= 8);
  // PBQ workout
  H.switchTab('exam');
  const objs = H.pbqWorkoutObjectives();
  ok('workout targets up to 3 objectives', objs.length >= 1 && objs.length <= 3);
  H.startPbqWorkout(5);
  const E = H.getExam();
  ok('workout starts an exam of 5 PBQs and no multiple choice', E && E.questions.length === 5 && E.questions.every(q => q._pbqId));
  ok('workout is untimed with instant feedback', E.endTime === null && E.instant === true);
  const res = H.reservedPracticeIds('cysa').p;
  ok('workout never uses held-back exam PBQs', E.questions.every(q => !res.has(q._pbqId)));
  const defs = {}; P.forEach(p => { defs[H.exposure.qid(p.prompt)] = p; });
  ok('workout PBQs come from the targeted objectives', E.questions.filter(q => defs[q._pbqId] && objs.includes(defs[q._pbqId].obj)).length >= 3);
  ok('60-minute planner sessions include the PBQ workout', H.plannerSessionSteps(60, 'cysa').some(s => /PBQ workout/.test(s.label)));
}catch(err){ errors.push('depth: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
let pass = 0; checks.forEach(([n, c]) => { if(c) pass++; else console.log('FAIL', n); });
errors.forEach(e => console.log('ERROR', e));
console.log('cysa-depth: ' + pass + ' passed, ' + (checks.length - pass) + ' failed' + (errors.length ? ', ' + errors.length + ' errors' : ''));
process.exit(pass === checks.length && !errors.length ? 0 : 1);
