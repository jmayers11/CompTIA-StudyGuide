/* PBQ engine fairness (P9): command answer tolerance, keyboard/screen-reader access for drag-and-drop, grading sanity across every PBQ. */
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
const hooked = BASE.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { switchTab, BACKUP_KEYS, importBackupFile, validateBackupPayload, sanitizeNotesArray, getNotes: () => notes, cliMatches, cliNormalize, pbqKeyboardize, gradeExamQuestion, PBQ_BANK };\n})();');
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
  const q = { answerPattern: /^ss\s*-tulpn$/i, example: 'ss -tulpn' };
  ok('exact command accepted', H.cliMatches(q, 'ss -tulpn'));
  ok('extra spaces and case accepted', H.cliMatches(q, '  SS   -TULPN '));
  ok('flag letters in another order accepted', H.cliMatches(q, 'ss -lntup'));
  ok('wrong flags rejected', !H.cliMatches(q, 'ss -tu') && !H.cliMatches(q, 'netstat -tulpn'));
  ok('empty answer rejected', !H.cliMatches(q, '') && !H.cliMatches(q, '   '));
  const g = { answerPattern: /^grep\s*Failed\s*auth\.log$/i, example: 'grep Failed auth.log' };
  ok('quoted search term accepted', H.cliMatches(g, 'grep "Failed" auth.log') && H.cliMatches(g, "grep 'Failed' auth.log"));
  ok('different file rejected', !H.cliMatches(g, 'grep Failed syslog'));
  ok('alternate answers listed on an item are accepted', H.cliMatches({ example: 'ipconfig /all', alt: ['ipconfig -all'] }, 'IPCONFIG -ALL'));
  // every CLI PBQ accepts its own example
  const cli = H.PBQ_BANK.filter(p => p.type === 'cli');
  const bad = cli.filter(p => p.example && !H.cliMatches(p, p.example)).map(p => p.example);
  ok('all ' + cli.length + ' command PBQs accept their own example answer (' + (bad.join('; ') || 'none failing') + ')', bad.length === 0);
  // grading sanity: perfect and empty answers across PBQ types
  const sample = H.PBQ_BANK.filter(p => ['match', 'order', 'zones', 'evidence'].includes(p.type)).slice(0, 400);
  let perfectBad = 0, emptyBad = 0;
  sample.forEach(p => {
    let perfect = null;
    if(p.type === 'match') perfect = p.pairs.map(x => x.right);
    if(p.type === 'order') perfect = p.steps.slice();
    if(p.type === 'zones') perfect = p.items.map(x => x.ans);
    if(p.type === 'evidence') perfect = (p.correct || []).slice();
    try{ const gr = H.gradeExamQuestion(Object.assign({}, p, { question: p.prompt }), perfect); if(!gr.isCorrect || gr.points < gr.maxPoints - 1e-9) perfectBad++; }catch(e){ perfectBad++; }
    try{ const ge = H.gradeExamQuestion(Object.assign({}, p, { question: p.prompt }), null); if(ge.isCorrect || ge.points > 0) emptyBad++; }catch(e){ emptyBad++; }
  });
  ok('a perfect answer earns full credit on every sampled PBQ (' + sample.length + ', failures ' + perfectBad + ')', perfectBad === 0);
  ok('a blank answer earns nothing on every sampled PBQ (failures ' + emptyBad + ')', emptyBad === 0);
  ok('keyboard helper is wired into the exam renderer', /pbqKeyboardize\(optsWrap\)/.test(html) && /role', 'button'\); c\.setAttribute\('tabindex'/.test(html));
  ok('order steps get labelled move buttons', /'Move step ' \+/.test(html));
}catch(err){ errors.push('pbq: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
let pass = 0; checks.forEach(([n, c]) => { if(c) pass++; else console.log('FAIL', n); });
errors.forEach(e => console.log('ERROR', e));
console.log('pbq-engine: ' + pass + ' passed, ' + (checks.length - pass) + ' failed' + (errors.length ? ', ' + errors.length + ' errors' : ''));
process.exit(pass === checks.length && !errors.length ? 0 : 1);
