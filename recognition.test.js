/* Recognition quiz test: 11 CySA+ quick-recognition types, option building, reverse questions, missed review and saved progress.
   Run:  node tests/recognition.test.js [path/to/index.html] */
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
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { REC_ITEMS, REC_TYPES, startRecQuiz, getQ: () => recQuiz, recSubmit, renderRec, renderRecHome, getData: () => recData, BACKUP_KEYS, switchTab, M_TAB_NAMES };\n})();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', code);
class Ev { constructor(t){ this.type = t; } }
const errors = [];
try{ run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev); }
catch(err){ errors.push('boot: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const H = globalThis.__hooks;
try{
  const I = H.REC_ITEMS, T = Object.keys(H.REC_TYPES);
  ok('12 recognition quiz types (acronyms live in their own tab)', T.length === 12);
  ok('every type has 12+ items', T.every(t => I.filter(i => i.t === t).length >= 12));
  ok('ids unique', new Set(I.map(i => i.id)).size === I.length);
  ok('every item has prompt, answer and explanation', I.every(i => i.p && i.a && i.w && i.w.length > 8));
  ok('backup includes recognition progress', H.BACKUP_KEYS.includes('cybersec_recognition_v1'));
  ok('mobile tab name registered', H.M_TAB_NAMES.recognition === 'Recognition');
  H.switchTab('recognition');
  ok('tab opens with all type cards', document.getElementById('recognition-panel').style.display === 'block' && (document.getElementById('rec-area').innerHTML.match(/rec-go/g) || []).length === 12);
  document.getElementById('rec-count').value = 'all';
  // build every type many times: options valid
  let bad = 0, rev = 0;
  for(let n = 0; n < 15; n++) T.forEach(t => { H.startRecQuiz(t, false); const Q = H.getQ(); Q.qs.forEach(q => { if(q.dir === 'r') rev++; if(q.options.length !== 4 || new Set(q.options).size !== 4 || !q.options.includes(q.answer)) bad++; }); });
  ok('every generated question has 4 unique options including the answer', bad === 0);
  ok('Event IDs and CVSS are also asked in reverse', rev > 0);
  H.startRecQuiz('winevt', false); let Q = H.getQ();
  ok('type session stays in its type', Q.qs.every(q => q.it.t === 'winevt'));
  const sysmonQ = Q.qs.filter(q => q.it.g === 'sysmon' && q.dir === 'f');
  ok('Sysmon questions only use Sysmon distractors', sysmonQ.every(q => q.options.every(o => o === q.answer || I.some(i => i.g === 'sysmon' && i.a === o))));
  document.getElementById('rec-count').value = '10';
  H.startRecQuiz('cvss', false); Q = H.getQ();
  const n = Q.qs.length, missedIds = [];
  for(let k = 0; k < n; k++){ const q = Q.qs[Q.idx]; Q.sel = k < 4 ? q.options.findIndex(o => o !== q.answer) : q.options.indexOf(q.answer); if(k < 4) missedIds.push(q.id + '|' + q.dir); H.recSubmit(); Q.idx++; Q.sel = null; Q.answered = false; }
  H.renderRec();
  ok('quiz finishes and records history', !H.getQ() && H.getData().hist.some(h => h.type === 'cvss' && h.score === n - 4));
  ok('results list the missed items', /Missed items come up first/.test(document.getElementById('rec-area').innerHTML));
  ok('progress saved to storage', missedIds.every(k => JSON.parse(localStorage.getItem('cybersec_recognition_v1')).items[k].lastOk === false));
  H.startRecQuiz('cvss', true); Q = H.getQ();
  ok('missed-only session has exactly the missed items', Q && Q.qs.length === 4 && Q.qs.every(q => missedIds.includes(q.id + '|' + q.dir)));
  Q.sel = null; H.recSubmit();
  ok('submit ignored with no answer selected', Q.log.length === 0);
  H.startRecQuiz(null, false); Q = H.getQ();
  ok('mixed session spans several types', new Set(Q.qs.map(q => q.it.t)).size >= 4);
  H.renderRecHome();
  ok('home shows the acronym shortcut', /Open Acronym Trainer/.test(document.getElementById('rec-area').innerHTML));
}catch(err){ errors.push('test: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
let pass = 0; checks.forEach(([n, c]) => { if(c) pass++; else console.log('FAIL', n); });
errors.forEach(e => console.log('ERROR', e));
console.log('recognition: ' + pass + ' passed, ' + (checks.length - pass) + ' failed' + (errors.length ? ', ' + errors.length + ' errors' : ''));
process.exit(pass === checks.length && !errors.length ? 0 : 1);
