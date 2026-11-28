/* Commands & Queries test: CySA+ command/query lessons, tiers, interpretation quizzes, missed review and saved progress.
   Run:  node tests/cmd-query.test.js [path/to/index.html] */
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
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { CQ_TOPICS, renderCqHome, openCqLesson, startCqQuiz, getQ: () => cqQuiz, cqSubmit, renderCqQ, getData: () => cqData, BACKUP_KEYS, switchTab, M_TAB_NAMES };\n})();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', code);
class Ev { constructor(t){ this.type = t; } }
const errors = [];
try{ run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev); }
catch(err){ errors.push('boot: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const H = globalThis.__hooks;
try{
  const T = H.CQ_TOPICS, ids = T.map(t => t.id);
  const need = ['nmap','tcpdump','tshark','wireshark','grep','journalctl','pwsh','netstat','dns','curl','hash','spl','kql','yara','sigma','regex','scripts'];
  ok('every requested command/query area has a lesson', need.every(n => ids.includes(n)));
  ok('lesson text names the requested tools', ['grep','awk','sed','find','Get-WinEvent','Get-Process','Get-NetTCPConnection','netstat','ss ','dig','nslookup','curl','openssl','sha256sum','certutil'].every(w => JSON.stringify(T).includes(w)));
  ok('every topic has a tier, patterns, example and 3+ questions', T.every(t => ['core','supplemental','advanced'].includes(t.tier) && t.pats.length >= 3 && t.ex.cmd && t.ex.read && t.qs.length >= 3));
  ok('all three tiers used', ['core','supplemental','advanced'].every(x => T.some(t => t.tier === x)));
  ok('questions have 4 unique options and an explanation', T.every(t => t.qs.every(q => q.o.length === 4 && new Set(q.o).size === 4 && q.why.length > 15)));
  ok('panel states tiers are not CompTIA requirements', /not CompTIA's/.test(require('fs').readFileSync(process.argv[2] || require('path').join(__dirname, '..', 'index.html'), 'utf8')));
  ok('backup includes command/query progress', H.BACKUP_KEYS.includes('cybersec_cmdquery_v1'));
  ok('mobile tab name registered', H.M_TAB_NAMES.cmdquery === 'Commands & Queries');
  H.switchTab('cmdquery');
  ok('tab lists all topics', (document.getElementById('cq-area').innerHTML.match(/cq-open/g) || []).length === T.length);
  H.openCqLesson('yara');
  ok('lesson renders patterns and example, and is marked read', /Patterns to recognize/.test(document.getElementById('cq-area').innerHTML) && H.getData().read.yara);
  H.startCqQuiz(['yara'], false); let Q = H.getQ();
  ok('topic quiz has all its questions', Q.qs.length === T.find(t => t.id === 'yara').qs.length);
  const n = Q.qs.length;
  for(let k = 0; k < n; k++){ const x = Q.qs[Q.idx]; Q.sel = k === 0 ? x.opts.findIndex(o => o !== x.answer) : x.opts.indexOf(x.answer); H.cqSubmit(); Q.idx++; Q.sel = null; Q.answered = false; }
  H.renderCqQ();
  ok('quiz finishes with the right score', !H.getQ() && H.getData().hist.slice(-1)[0].score === n - 1);
  ok('results offer to review the lesson', /Review lesson/.test(document.getElementById('cq-area').innerHTML));
  H.startCqQuiz(ids, true); Q = H.getQ();
  ok('missed-only quiz has exactly the one miss', Q && Q.qs.length === 1);
  H.startCqQuiz(ids, false); Q = H.getQ();
  ok('mixed quiz draws 15 questions from several topics', Q.qs.length === 15 && new Set(Q.qs.map(x => x.tid)).size >= 5);
  ok('progress saved', JSON.parse(localStorage.getItem('cybersec_cmdquery_v1')).read.yara);
}catch(err){ errors.push('test: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
let pass = 0; checks.forEach(([n, c]) => { if(c) pass++; else console.log('FAIL', n); });
errors.forEach(e => console.log('ERROR', e));
console.log('cmd-query: ' + pass + ' passed, ' + (checks.length - pass) + ' failed' + (errors.length ? ', ' + errors.length + ' errors' : ''));
process.exit(pass === checks.length && !errors.length ? 0 : 1);
