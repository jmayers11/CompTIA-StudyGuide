/* Query sandbox (P10): simulated SPL/KQL/Wireshark engine, challenges, error messages, labelling. */
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
const hooked = BASE.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { switchTab, BACKUP_KEYS, importBackupFile, validateBackupPayload, sanitizeNotesArray, getNotes: () => notes, runSpl, runKql, runWs, qsbRun, qsbSame, QSB_CHALLENGES, QSB_DATA, renderQuerySandbox, getQsb: () => qsbState };\n})();');
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
  const spray = H.runSpl('index=auth EventCode=4625 | stats dc(user) as users by src_ip | where users > 10');
  ok('SPL finds the password-spray source', spray.length === 1 && spray[0].src_ip === '198.51.100.44' && spray[0].users === 26);
  const brute = H.runSpl('index=auth EventCode=4625 user=admin | stats count by src_ip');
  ok('SPL counts the brute-force failures', brute.length === 1 && brute[0].count === 12);
  ok('SPL wildcard, sort and head work', H.runSpl('index=auth user=a* | sort -_time | head 3').length === 3);
  ok('SPL table keeps only chosen fields', Object.keys(H.runSpl('index=proc | table host image')[0]).join() === 'host,image');
  const k1 = H.runKql('auth | where EventCode == 4624 and user == "admin" | project _time, src_ip');
  ok('KQL where/and/project work', k1.length === 1 && k1[0].src_ip === '203.0.113.9');
  ok('KQL summarize count() by field', H.runKql('auth | where EventCode == 4625 | summarize count() by src_ip | order by count_ desc')[0].src_ip === '198.51.100.44');
  ok('KQL contains finds encoded PowerShell', H.runKql('proc | where cmdline contains "-enc"').length === 2);
  ok('Wireshark filter isolates the beacon', H.runWs('ip.dst == 203.0.113.80 && tcp.dstport == 443').length === 10);
  ok('Wireshark ip.addr matches either direction', H.runWs('ip.addr == 10.20.30.1').length === 3);
  ok('Wireshark protocol keyword and contains', H.runWs('dns && info contains "data.example"').length === 2 && H.runWs('http && info contains "pass="').length === 1);
  ok('Wireshark ! negation', H.runWs('!tcp').length === 3);
  // helpful errors instead of crashes
  const e1 = H.qsbRun('kql', 'auth | where EventCode = 4625');
  ok('KQL single = gets a teaching message', e1.error && /==/.test(e1.error));
  const e2 = H.qsbRun('ws', 'host 10.20.30.45 and port 443');
  ok('BPF capture syntax in a display filter is explained', e2.error && /capture-filter/i.test(e2.error));
  const e3 = H.qsbRun('spl', 'index=auth | rex field=user "(?<x>.*)"');
  ok('unsupported SPL command is named, not silently ignored', e3.error && /rex/.test(e3.error));
  ok('unknown index is reported', /Unknown index/.test(H.qsbRun('spl', 'index=firewall').error));
  ok('garbage input never throws', ['', '|||', '<script>', 'index=', 'auth | where', '((('].every(q => { try{ H.qsbRun('spl', q); H.qsbRun('kql', q); H.qsbRun('ws', q); return true; }catch(e){ return false; } }));
  // challenges
  const C = H.QSB_CHALLENGES;
  ok('8 challenges across SPL, KQL and Wireshark', C.length === 8 && ['spl', 'kql', 'ws'].every(l => C.some(c => c.lang === l)));
  ok('every reference query runs and returns rows', C.every(c => { const r = H.qsbRun(c.lang, c.ref); return r.rows && r.rows.length > 0; }));
  ok('every reference answer matches itself', C.every(c => { const r = H.qsbRun(c.lang, c.ref).rows; return H.qsbSame(r, r, c.cols, c.loose); }));
  const c6 = C.find(c => c.id === 'c6');
  ok('an equivalent alternative answer is accepted', H.qsbSame(H.runWs('ip.dst eq 203.0.113.80 and tcp.dstport eq 443'), H.runWs(c6.ref), c6.cols));
  ok('a too-broad answer is rejected', !H.qsbSame(H.runWs('ip.dst == 203.0.113.80'), H.runWs('tls'), c6.cols) && !H.qsbSame(H.runWs('tcp.dstport == 443'), H.runWs(c6.ref), c6.cols));
  // UI
  H.switchTab('cmdquery');
  const st = H.getQsb(); st.ch = 'c1'; st.lang = 'spl'; st.query = 'index=auth EventCode=4625 | stats count by src_ip'; H.renderQuerySandbox();
  const ui = String(els['qsb-area'].innerHTML || '');
  ok('sandbox is clearly labelled as simulated', /Simulated\./.test(ui) && /not Splunk, Sentinel or Wireshark/.test(ui));
  ok('a correct challenge answer is confirmed and saved', /match the expected answer/.test(ui) && JSON.parse(store.cybersec_qsb_v1).done.c1);
  st.query = 'index=auth <img src=x onerror=alert(1)>'; H.renderQuerySandbox();
  ok('query text and results are escaped', !/<img src=x/.test(String(els['qsb-area'].innerHTML || '')));
}catch(err){ errors.push('qsb: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
let pass = 0; checks.forEach(([n, c]) => { if(c) pass++; else console.log('FAIL', n); });
errors.forEach(e => console.log('ERROR', e));
console.log('query-sandbox: ' + pass + ' passed, ' + (checks.length - pass) + ' failed' + (errors.length ? ', ' + errors.length + ' errors' : ''));
process.exit(pass === checks.length && !errors.length ? 0 : 1);
