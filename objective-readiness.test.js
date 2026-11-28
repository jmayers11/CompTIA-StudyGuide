/* Objective readiness test: CS0-004 per-objective accuracy, ratings, recommendations and study notes.
   Run:  node tests/objective-readiness.test.js [path/to/index.html] */
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
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { objectiveReadinessData, renderObjectiveReadiness, OBJ_NOTES, RAW_CYSA_BANK, exposure, switchTab, renderReadiness };\n})();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', code);
class Ev { constructor(t){ this.type = t; } }
const errors = [];
try{ run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev); }
catch(err){ errors.push('boot: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const H = globalThis.__hooks;
try{
  const N = H.OBJ_NOTES;
  ok('study notes for all 15 CS0-004 objectives', N.length === 15 && ['1.1','1.2','1.3','1.4','1.5','1.6','2.1','2.2','2.3','2.4','3.1','3.2','3.3','4.1','4.2'].every(o => N.some(n => n.obj === o)));
  ok('each note has a summary, 5+ key points, traps and practice links', N.every(n => n.summary.length > 30 && n.points.length >= 5 && n.traps.length >= 2 && n.links.length >= 1));
  const tabs = ['analyst','recognition','invest','cmdquery','exam','acronyms'];
  ok('practice links point to real tabs', N.every(n => n.links.every(l => tabs.includes(l[0]))));
  let D = H.objectiveReadinessData();
  ok('with no history every objective shows Not enough data', D.list.length === 15 && D.list.every(o => o.status === 'nodata'));
  ok('each objective counts its available exam questions', D.list.every(o => o.avail > 0));
  // seed exam history: 1.2 mostly wrong, 4.1 mostly right
  const ex = { cysa: { v: 1, runs: 3, q: {}, p: {}, hist: [] } };
  const pick = (obj, n) => H.RAW_CYSA_BANK.filter(q => q.obj === obj).slice(0, n).map(q => q.oid || H.exposure.qid(q.question));
  pick('1.2', 20).forEach(id => { ex.cysa.q[id] = [1, 1, 0, 0, 1]; });
  pick('1.2', 4).forEach(id => { ex.cysa.q[id] = [1, 1, 0, 1, 0]; });
  pick('4.1', 20).forEach(id => { ex.cysa.q[id] = [1, 1, 0, 1, 0]; });
  pick('2.3', 10).forEach((id, i) => { ex.cysa.q[id] = [1, 1, 0, i < 7 ? 1 : 0, i < 7 ? 0 : 1]; });
  localStorage.setItem('cybersec_exposure_v1', JSON.stringify(ex));
  D = H.objectiveReadinessData();
  const g = o => D.list.find(x => x.obj === o);
  ok('weak objective rated Needs work', g('1.2').status === 'weak' && Math.round(g('1.2').acc * 100) === 20);
  ok('strong objective rated Strong', g('4.1').status === 'strong' && g('4.1').acc === 1);
  ok('70% objective rated Developing', g('2.3').status === 'developing');
  ok('weakest heavily weighted objective is the first recommendation', D.recs[0].obj === '1.2' && D.recs.length === 3 && !D.recs.some(o => o.obj === '4.1'));
  document.getElementById('obj-readiness');
  H.renderObjectiveReadiness();
  const html = document.getElementById('obj-readiness').innerHTML;
  ok('panel renders 15 rows with study notes', (html.match(/objr-note/g) || []).length === 15 && /Suggested next steps/.test(html));
  ok('panel says these are not official scores or pass predictions', /not official CompTIA scores or a prediction of passing/.test(html));
}catch(err){ errors.push('test: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
let pass = 0; checks.forEach(([n, c]) => { if(c) pass++; else console.log('FAIL', n); });
errors.forEach(e => console.log('ERROR', e));
console.log('objective-readiness: ' + pass + ' passed, ' + (checks.length - pass) + ' failed' + (errors.length ? ', ' + errors.length + ' errors' : ''));
process.exit(pass === checks.length && !errors.length ? 0 : 1);
