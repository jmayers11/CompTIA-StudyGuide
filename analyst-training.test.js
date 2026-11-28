/* Analyst Training Center test: six modules of CySA+ evidence drills, sessions, feedback, missed review and saved progress.
   Run:  node tests/analyst-training.test.js [path/to/index.html] */
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
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { ATC_DRILLS, ATC_MODS, startAtc, getAtc: () => atcSession, atcSubmit, renderAtcHome, renderAtc, getAtcData: () => atcData, BACKUP_KEYS, switchTab, M_TAB_NAMES };\n})();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', code);
class Ev { constructor(t){ this.type = t; } }
const errors = [];
try{ run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev); }
catch(err){ errors.push('boot: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const H = globalThis.__hooks;
try{
  const D = H.ATC_DRILLS, mods = Object.keys(H.ATC_MODS);
  ok('eight modules (six core + AI in SecOps + Architecture & Identity)', mods.length === 8 && ['siem','vuln','hunt','net','ir','rep','ai','arch'].every(m => mods.includes(m)));
  ok('every core module has 6+ drills and AI has 4+', mods.every(m => D.filter(d => d.mod === m).length >= (m === 'ai' || m === 'arch' ? 4 : 6)));
  const qs = []; D.forEach(d => d.qs.forEach(q => qs.push([d, q])));
  ok('100+ questions in total (' + qs.length + ')', qs.length >= 100);
  ok('drill ids unique', new Set(D.map(d => d.id)).size === D.length);
  const OBJ = ['1.1','1.2','1.3','1.4','1.5','1.6','2.1','2.2','2.3','2.4','3.1','3.2','3.3','4.1','4.2'];
  ok('every drill has a CS0-004 objective and level', D.every(d => OBJ.includes(d.obj) && (d.level === 'core' || d.level === 'advanced')));
  ok('every drill has evidence and 2+ questions', D.every(d => d.art && d.art.length > 40 && d.qs.length >= 2));
  ok('options unique, 4+, explanation present', qs.every(([d, q]) => q.o.length >= 4 && new Set(q.o).size === q.o.length && q.why.split(' ').length >= 10));
  ok('multi-select stems name the count', qs.every(([d, q]) => (q.n || 1) === (/Select TWO/.test(q.q) ? 2 : /Select THREE/.test(q.q) ? 3 : 1)));
  ok('multi-select items exist', qs.filter(([d, q]) => q.n > 1).length >= 5);
  ok('artifacts use reserved example addresses or private ranges only', D.every(d => (d.art.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g) || []).every(ip => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|192\.0\.2\.|198\.51\.100\.|203\.0\.113\.|8\.8\.8\.8$|20\.190\.|52\.96\.|45\.83\.|185\.220\.|91\.240\.|102\.89\.)/.test(ip))));
  ok('backup includes Analyst Training progress', H.BACKUP_KEYS.includes('cybersec_atc_v1'));
  ok('mobile tab name registered', H.M_TAB_NAMES.analyst === 'Analyst Training');
  H.switchTab('analyst');
  ok('tab opens the panel', document.getElementById('analyst-panel').style.display === 'block' && /atc-card/.test(document.getElementById('atc-area').innerHTML));
  // run a SIEM session: answer every question wrong, then check missed review
  document.getElementById('atc-count').value = 'all'; document.getElementById('atc-level').value = 'all';
  H.startAtc('siem', false);
  let S = H.getAtc();
  ok('module session contains only that module', S && S.qs.length === qs.filter(([d]) => d.mod === 'siem').length && S.qs.every(q => q.did.startsWith('siem')));
  ok('shuffled options keep the right answers', S.qs.every(q => { const d = D.find(x => x.id === q.did), src = d.qs[q.qi]; return q.correct.length === (src.n || 1) && q.correct.every(i => src.o.indexOf(q.opts[i]) < (src.n || 1)); }));
  let n = S.qs.length;
  for(let k = 0; k < n; k++){
    const q = S.qs[S.idx]; const wrong = q.opts.map((o, i) => i).filter(i => !q.correct.includes(i)).slice(0, q.n);
    S.sel = wrong; H.atcSubmit(); S.idx++; S.sel = []; S.answered = false;
  }
  H.renderAtc(); // finishes the session
  ok('session ends and records history', !H.getAtc() && H.getAtcData().hist.length === 1 && H.getAtcData().hist[0].score === 0);
  ok('results screen lists missed questions with the evidence', /Review what you missed/.test(document.getElementById('atc-area').innerHTML) && /atc-art/.test(document.getElementById('atc-area').innerHTML));
  const stored = JSON.parse(localStorage.getItem('cybersec_atc_v1'));
  ok('progress saved to storage', stored && Object.keys(stored.q).length === n && Object.values(stored.q).every(r => r.lastOk === false));
  H.startAtc('siem', true);
  S = H.getAtc();
  ok('missed-only session has exactly the missed questions', S && S.qs.length === n && S.missedOnly);
  // answer all correctly
  for(let k = 0; k < n; k++){ const q = S.qs[S.idx]; S.sel = q.correct.slice(); H.atcSubmit(); S.idx++; S.sel = []; S.answered = false; }
  H.renderAtc();
  const st2 = H.getAtcData();
  ok('correct answers clear the missed list', Object.values(st2.q).every(r => r.lastOk === true));
  H.startAtc('siem', true);
  ok('no missed questions left -> friendly message, no session', !H.getAtc() && /No missed questions/.test(document.getElementById('atc-area').innerHTML));
  // multi-select needs the right count before submit
  H.startAtc(null, false); S = H.getAtc();
  ok('mixed session spans modules', S && new Set(S.qs.map(q => q.did.split('-')[0])).size >= 2);
  const before = S.log.length; S.sel = []; H.atcSubmit();
  ok('submit is ignored until an answer is chosen', S.log.length === before && !S.answered);
  H.renderAtcHome();
  ok('home shows per-module accuracy', /% correct/.test(document.getElementById('atc-area').innerHTML));
}catch(err){ errors.push('test: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
let pass = 0; checks.forEach(([n, c]) => { if(c) pass++; else console.log('FAIL', n); });
errors.forEach(e => console.log('ERROR', e));
console.log('analyst-training: ' + pass + ' passed, ' + (checks.length - pass) + ' failed' + (errors.length ? ', ' + errors.length + ' errors' : ''));
process.exit(pass === checks.length && !errors.length ? 0 : 1);
