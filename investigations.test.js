/* Investigations test: 12 CySA+ multi-stage cases at three levels, option filtering, hints, scoring, debrief and saved progress.
   Run:  node tests/investigations.test.js [path/to/index.html] */
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
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { INVESTIGATIONS, INV_LEVELS, startInv, getRun: () => invRun, invSubmit, renderInvStep, renderInvHome, getData: () => invData, BACKUP_KEYS, switchTab, M_TAB_NAMES };\n})();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', code);
class Ev { constructor(t){ this.type = t; } }
const errors = [];
try{ run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev); }
catch(err){ errors.push('boot: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const H = globalThis.__hooks;
const play = (correctUpTo, useHint) => { const R = H.getRun(); R.intro = false; while(R.i < R.steps.length){ const st = R.steps[R.i]; if(useHint) R.hintUsed = true; const good = st.opts.map((o, k) => k).filter(k => st.correct.includes(st.opts[k])); const bad = st.opts.map((o, k) => k).filter(k => !st.correct.includes(st.opts[k])); R.sel = R.i < correctUpTo ? good : bad.slice(0, st.n); H.invSubmit(); R.i++; R.sel = []; R.answered = false; R.hintUsed = false; } H.renderInvStep(); };
try{
  const V = H.INVESTIGATIONS;
  ok('14 investigations (12 core + 2 AI in SecOps)', V.length === 14);
  ok('each case has stages at all three levels', V.every(v => ['b','i','a'].every(l => v.stages.some(s => s.lvl === l))));
  ok('each case is multi-stage (6+) with evidence and explanations', V.every(v => v.stages.length >= 6 && v.stages.every(s => s.art && s.why && s.o.length >= 4)));
  ok('cases tagged with CS0-004 objectives across all four domains', ['1','2','3','4'].every(d => V.some(v => v.objs.some(o => o[0] === d))));
  ok('beginner stages all have hints', V.every(v => v.stages.filter(s => s.lvl === 'b').every(s => s.hint)));
  ok('backup and mobile name registered', H.BACKUP_KEYS.includes('cybersec_invest_v1') && H.M_TAB_NAMES.invest === 'Investigations');
  H.switchTab('invest');
  ok('tab shows 42 case/level buttons', (document.getElementById('inv-area').innerHTML.match(/inv-go/g) || []).length === 42);
  H.startInv('ransom', 'b'); let R = H.getRun();
  ok('beginner: only core stages, 3 choices on single-answer stages', R.steps.length === 2 && R.steps.every(st => st.n > 1 || st.opts.length === 3));
  ok('every stage keeps its correct answer(s) among the choices', V.every(v => ['b','i','a'].every(l => { H.startInv(v.id, l); return H.getRun().steps.every(st => st.correct.every(c => st.opts.includes(c))); })));
  H.startInv('ransom', 'i'); R = H.getRun();
  ok('intermediate: 4 stages, 4 choices', R.steps.length === 4 && R.steps.every(st => st.opts.length === 4 || st.n > 1));
  H.startInv('ransom', 'a'); R = H.getRun();
  ok('advanced: all 6 stages', R.steps.length === 6);
  play(99, false);
  ok('perfect advanced run scores 100% and is saved as best', H.getData().runs.ransom.a.best === 100 && /Case debrief/.test(document.getElementById('inv-area').innerHTML));
  H.startInv('kerb', 'a'); play(3, false);
  ok('partial run scores correctly and debrief lists misses', H.getData().runs.kerb.a.last === 50 && /Correct:/.test(document.getElementById('inv-area').innerHTML));
  H.startInv('phish', 'i'); play(99, true);
  ok('hints at intermediate cost half credit', H.getData().runs.phish.i.last === 50);
  H.startInv('dnstun', 'a'); R = H.getRun(); R.intro = false; R.sel = []; H.invSubmit();
  ok('submit ignored without an answer', R.log.length === 0);
  ok('progress saved to storage', JSON.parse(localStorage.getItem('cybersec_invest_v1')).runs.ransom.a.best === 100);
  H.renderInvHome();
  ok('home shows best scores', /100%/.test(document.getElementById('inv-area').innerHTML));
}catch(err){ errors.push('test: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
let pass = 0; checks.forEach(([n, c]) => { if(c) pass++; else console.log('FAIL', n); });
errors.forEach(e => console.log('ERROR', e));
console.log('investigations: ' + pass + ' passed, ' + (checks.length - pass) + ' failed' + (errors.length ? ', ' + errors.length + ' errors' : ''));
process.exit(pass === checks.length && !errors.length ? 0 : 1);
