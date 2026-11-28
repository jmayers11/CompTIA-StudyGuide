/* SOC Simulation Center (P8): shift data, Tier 1 scoring, Tier 2 hand-off, report, persistence, escaping. */
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
const hooked = BASE.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { switchTab, BACKUP_KEYS, importBackupFile, validateBackupPayload, sanitizeNotesArray, getNotes: () => notes, SOC_SHIFTS, renderSoc, startSocShift, socSubmitTicket, startSocTier2, socShiftScore, finishSocShift, socScoreTicket, getSocRun: () => socRun, evidenceLoad };\n})();');
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
  const S = H.SOC_SHIFTS;
  ok('3 shifts with 18 alerts', S.length === 3 && S.reduce((a, s) => a + s.alerts.length, 0) === 18);
  ok('every alert has valid evidence index, disposition and priority', S.every(s => s.alerts.every(a => a.key >= 0 && a.key < a.tele.length && ['esc','btp','fp'].includes(a.disp) && [1,2,3,4].includes(a.pri) && a.why.length > 40)));
  ok('every escalation-worthy alert has a Tier 2 step, and only those', S.every(s => s.alerts.every(a => (a.disp === 'esc') === !!a.t2)));
  ok('each shift mixes real incidents with alerts to close', S.every(s => s.alerts.some(a => a.disp === 'esc') && s.alerts.some(a => a.disp !== 'esc')));
  ok('tool severity is not always the answer (some High/Critical close, some Low escalate)', S.some(s => s.alerts.some(a => a.disp !== 'esc' && /High|Critical/.test(a.sev))) && S.some(s => s.alerts.some(a => a.disp === 'esc' && a.sev === 'Low')));
  const a0 = S[0].alerts[0];
  ok('perfect ticket scores 100%', H.socScoreTicket(a0, { key: a0.key, disp: a0.disp, pri: a0.pri }).total === 1);
  ok('closing a real incident is flagged as missed', H.socScoreTicket(a0, { key: a0.key, disp: 'btp', pri: a0.pri }).missed === true);
  const c = S[0].alerts.find(a => a.disp === 'btp');
  ok('confusing the two close dispositions earns partial credit', H.socScoreTicket(c, { key: c.key, disp: 'fp', pri: c.pri }).disp === 0.5);
  // full perfect run
  H.renderSoc(); ok('home lists the shifts', /Start shift/.test(String(els['soc-area'].innerHTML)));
  H.startSocShift('s1'); let R = H.getSocRun();
  S[0].alerts.forEach(a => { R.draft[a.id] = { key: a.key, disp: a.disp, pri: String(a.pri), note: a.id === 's1a1' ? '<img src=x onerror=alert(1)>' : '' }; H.socSubmitTicket(a.id); });
  ok('all tickets recorded', Object.keys(R.tickets).length === S[0].alerts.length);
  H.startSocTier2();
  ok('Tier 2 receives exactly the escalated true positives', R.t2list.length === S[0].alerts.filter(a => a.disp === 'esc').length);
  R.t2list.forEach(x => { x.sel = x.correct.slice(); x.done = true; x.ok = true; });
  const sc = H.socShiftScore(R);
  ok('perfect shift scores 100% with no missed incidents', Math.abs(sc.score - 1) < 1e-9 && sc.missed === 0 && sc.caught === sc.tpTotal);
  H.finishSocShift();
  const rep = String(els['soc-area'].innerHTML);
  ok('shift report shows score, escalations and missed incidents', /Shift report/.test(rep) && /real incidents escalated/.test(rep) && /missed incidents/.test(rep));
  ok('ticket notes are escaped in the report', rep.indexOf('&lt;img src=x') > 0 && !/<img src=x/.test(rep));
  ok('result is saved', JSON.parse(store.cybersec_soc_v1).runs.s1.best === 1);
  ok('triage answers reach the evidence log', H.evidenceLoad().ev.filter(r => r[1] === 'soc').length >= S[0].alerts.length);
  // missed-incident run
  H.startSocShift('s2'); R = H.getSocRun();
  S[1].alerts.forEach(a => { R.draft[a.id] = { key: a.key, disp: a.disp === 'esc' ? 'btp' : a.disp, pri: String(a.pri), note: '' }; H.socSubmitTicket(a.id); });
  H.startSocTier2();
  const sc2 = H.socShiftScore(R);
  ok('closing every real incident is heavily penalized', sc2.missed === S[1].alerts.filter(a => a.disp === 'esc').length && sc2.score < 0.5);
  const errs = []; try{ H.switchTab('soc'); }catch(e){ errs.push(e.message); }
  ok('SOC tab opens', !errs.length && els['soc-panel'].style.display === 'block');
}catch(err){ errors.push('soc: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
let pass = 0; checks.forEach(([n, c]) => { if(c) pass++; else console.log('FAIL', n); });
errors.forEach(e => console.log('ERROR', e));
console.log('soc-sim: ' + pass + ' passed, ' + (checks.length - pass) + ' failed' + (errors.length ? ', ' + errors.length + ' errors' : ''));
process.exit(pass === checks.length && !errors.length ? 0 : 1);
