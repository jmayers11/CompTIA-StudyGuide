/* CySA+ v2 PBQ test: 60 new performance-based questions, distribution, objective tags, full and partial-credit grading.
   Run:  node tests/cysa-pbq-v2.test.js [path/to/index.html] */
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
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { PBQ_BANK, instantiatePBQ, gradeExamQuestion, exposure, reservedPracticeIds: typeof reservedPracticeIds === "function" ? reservedPracticeIds : null };\n})();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', code);
class Ev { constructor(t){ this.type = t; } }
const errors = [];
try{ run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev); }
catch(err){ errors.push('boot: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const H = globalThis.__hooks;
try{
  const V = H.PBQ_BANK.filter(p => p.rev === '2026-11-cs4v2');
  ok('60 new CySA+ PBQs', V.length === 60);
  const by = {}; V.forEach(p => { by[p.topic] = (by[p.topic] || 0) + 1; });
  ok('distribution 12 SIEM / 12 vuln / 10 IR / 8 network / 8 intel-hunting / 6 reporting / 4 forensics', by.siem === 12 && by.vuln === 12 && by.ir === 10 && by.net === 8 && by.hunt === 8 && by.rep === 6 && by.for === 4);
  ok('all tagged cysa with a CS0-004 objective and an explanation', V.every(p => p.cert === 'cysa' && /^[1-4]\.[1-6]$/.test(p.obj) && p.explanation && p.explanation.length > 30));
  { const others = new Set(H.PBQ_BANK.filter(p => p.rev !== '2026-11-cs4v2').map(p => H.exposure.qid(p.prompt))); ok('new prompts are unique and don\'t collide with existing PBQs', new Set(V.map(p => H.exposure.qid(p.prompt))).size === 60 && V.every(p => !others.has(H.exposure.qid(p.prompt)))); }
  const G = (def, sel) => H.gradeExamQuestion(H.instantiatePBQ(def), sel);
  const full = p => {
    if(p.type === 'match') return p.pairs.map(x => x.right);
    if(p.type === 'order') return p.steps.slice();
    if(p.type === 'evidence') return p.correct.slice();
    if(p.type === 'zones') return p.items.map(i => i.ans);
    if(p.type === 'config'){ const o = {}; p.rows.forEach((r, ri) => r.cells.forEach((c, k) => { if(c.opts) o[ri + ':' + k] = c.ans; })); return o; }
  };
  const partial = p => {
    const f = full(p);
    if(p.type === 'match') return f.map((r, i) => i === 0 ? null : r);
    if(p.type === 'order'){ const s = f.slice(); [s[0], s[1]] = [s[1], s[0]]; return s; }
    if(p.type === 'evidence') return f.slice(0, f.length - 1);
    if(p.type === 'zones'){ const s = f.slice(); s[0] = p.zones.find(z => z !== s[0]); return s; }
    if(p.type === 'config'){ const s = Object.assign({}, f), k = Object.keys(s)[0], [r, c] = k.split(':').map(Number); s[k] = p.rows[r].cells[c].opts.find(x => x !== s[k]); return s; }
  };
  let fullBad = [], partBad = [];
  V.forEach(p => { const g = G(p, full(p)); if(!(g.credit === 1 && g.isCorrect)) fullBad.push(p.prompt.slice(0, 50));
    const gp = G(p, partial(p)); if(!(gp.credit > 0 && gp.credit < 1 && !gp.isCorrect)) partBad.push(p.type + ': ' + p.prompt.slice(0, 50) + ' ' + gp.credit); });
  ok('every new PBQ grades a full answer as fully correct', fullBad.length === 0); if(fullBad.length) console.log(fullBad);
  ok('every new PBQ gives partial credit for a partly right answer', partBad.length === 0); if(partBad.length) console.log(partBad);
  const evs = V.filter(p => p.type === 'evidence');
  ok('evidence: selecting everything earns no free credit', evs.every(p => G(p, (p.mode === 'items' ? p.items : p.exhibit.lines).map((_, i) => i)).credit === 0));
  ok('no raw </ sequences in new PBQ text', !JSON.stringify(V).includes('</'));
}catch(err){ errors.push('test: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
let pass = 0; checks.forEach(([n, c]) => { if(c) pass++; else console.log('FAIL', n); });
errors.forEach(e => console.log('ERROR', e));
console.log('cysa-pbq-v2: ' + pass + ' passed, ' + (checks.length - pass) + ' failed' + (errors.length ? ', ' + errors.length + ' errors' : ''));
process.exit(pass === checks.length && !errors.length ? 0 : 1);
