/* App integration test: boots the real index.html script against a minimal fake DOM (no browser or
   npm packages needed), drives three Security+ Cold Runs and one Network+ Cold Run through the real
   button handlers, runs a Command-Line Mastery session (typed answers graded by the real code),
   then restarts the app on the same storage to confirm persistence.
   Run:  node tests/app-integration.test.js [path/to/index.html] */
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
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { exposure, getExamPolicy, renderExposureDashboard, cliTrainer, renderCliTab, renderCliCard, cliExpected, getCliSession: () => cliSession }; })();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', code);
class Ev { constructor(t){ this.type = t; } }
const errors = [];
try{ run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev); }
catch(err){ errors.push('boot: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
const out = []; const results = [];
function fresh(){ const t = document.getElementById('exam-summary').innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  const m = t.match(/(\d+) never seen before (\d+) repeated questions (\d+)% unique in this exam (\d+) from your last 3 Cold Runs (\d+)% of the bank explored (\d+) questions still unseen/);
  return { stats: m ? m.slice(1).map(Number) : null, label: (t.match(/Cold Run #\d+/) || [''])[0] }; }
try{
  for(let r = 1; r <= 3; r++){
    document.getElementById('exam-coldrun-btn').click();
    const prog = document.getElementById('exam-progress-text').textContent;
    document.getElementById('exam-submit-btn').click();
    const f = fresh(); results.push({ prog, f, r });
    out.push(`Sec+ Cold Run ${r}: "${prog}" -> ${JSON.stringify(f)}`);
    document.getElementById('exam-retry-btn').click && document.getElementById('exam-retry-btn').click();
  }
  globalThis.__hooks && globalThis.__hooks.renderExposureDashboard();
  const dash = document.getElementById('exam-exposure-dashboard').innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  out.push('dashboard: ' + dash.slice(0, 330));
  document.getElementById('exam-cert-select').value = 'network_plus';
  document.getElementById('exam-coldrun-btn').click(); const np = document.getElementById('exam-progress-text').textContent; document.getElementById('exam-submit-btn').click();
  out.push(`Net+ Cold Run: "${np}" -> ${JSON.stringify(fresh())}`);
  // Phase 2: CLI PBQs missed during the Cold Runs above feed the command trainer
  const H = globalThis.__hooks;
  const pbqMap = H.cliTrainer.raw().pbq;
  out.push('CLI commands flagged from missed PBQs: ' + Object.keys(pbqMap).join(', '));
  // Phase 2: drive the Command-Line Mastery tab
  H.renderCliTab();
  const sumTxt = document.getElementById('cli-summary').innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  out.push('CLI summary: ' + sumTxt.slice(0, 160));
  document.getElementById('cli-start-btn').click();
  const sess = H.getCliSession();
  let graded = [];
  for(let i = 0; i < 6 && sess; i++){
    const card = sess.queue[sess.idx];
    const area = document.getElementById('cli-card-area').innerHTML;
    const header = (area.match(/Card \d+ of \d+/) || [''])[0];
    if(card.mode === 'B'){ document.getElementById('cli-reveal-btn').click(); }
    else {
      const ans = card.mode === 'D' ? (card.cmd.comp.ans[0].flags || card.cmd.comp.ans[0]) : H.cliExpected(card);
      document.getElementById('cli-answer').value = (i % 3 === 2 && card.mode !== 'D') ? 'definitely-wrong' : ans;
      document.getElementById('cli-check-btn').click();
    }
    const res = document.getElementById('cli-result').innerHTML;
    graded.push({ header, mode: card.mode, cmd: card.cmd.id, verdict: /✓ Correct/.test(res) ? 'correct' : (/Not quite/.test(res) ? 'wrong' : 'revealed'), rated: /Didn't Know/.test(res) && /I Know This/.test(res) });
    H.cliTrainer.review(card, /✓ Correct/.test(res) ? 'know' : 'dk', /✓ Correct/.test(res)); sess.idx++; H.renderCliCard(); // rating buttons are wired via innerHTML, so rate through the trainer here
  }
  graded.forEach(g => out.push('CLI card ' + JSON.stringify(g)));
  globalThis.__cliGraded = graded; globalThis.__cliPbq = Object.keys(pbqMap);
  // restart: re-run script against the same storage
  const before = store['cybersec_exposure_v1'];
  run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev);
  document.getElementById('exam-cert-select').value = 'security_plus';
  globalThis.__hooks.renderExposureDashboard();
  const dash2 = document.getElementById('exam-exposure-dashboard').innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  out.push('after restart: ' + dash2.slice(0, 120));
  out.push('storage bytes: ' + (store['cybersec_exposure_v1'] || '').length + (before === store['cybersec_exposure_v1'] ? ' (unchanged by restart)' : ' (changed on restart)'));
}catch(err){ errors.push('drive: ' + err.message + ' ' + (err.stack || '').split('\n').slice(1,3).join(' ')); }
console.log(out.join('\n')); console.log('errors:', errors.length ? errors : 'none');
const checks = [
  ['app boots and runs without script errors', errors.length === 0],
  ['each Cold Run is 90 questions', results.length === 3 && results.every(x => x.prog === 'Question 1 of 90')],
  ['each Cold Run: 86 never-seen, 0 from last 3, 100% unique', results.every(x => x.f.stats && x.f.stats[0] === 86 && x.f.stats[3] === 0 && x.f.stats[2] === 100)],
  ['Cold Runs are numbered #1-#3', results.every(x => x.f.label === 'Cold Run #' + x.r)],
  ['CLI tab renders its summary and starts a 20-card session', /commands mastered/.test(out.join(' ')) && (globalThis.__cliGraded || []).length === 6 && globalThis.__cliGraded.every((g, i) => g.header === 'Card ' + (i + 1) + ' of 20')],
  ['typed answers graded: expected answers correct, wrong answers rejected, rating buttons shown', (globalThis.__cliGraded || []).every((g, i) => g.rated && (g.mode === 'B' ? g.verdict === 'revealed' : (i % 3 === 2 && g.mode !== 'D' ? g.verdict === 'wrong' : g.verdict === 'correct')))],
  ['missed CLI PBQs in Cold Runs are recorded against their command', (globalThis.__cliPbq || []).length > 0],
  ['CLI progress persists across an app restart', /cybersec_cli_mastery_v1/.test(Object.keys(store).join(' ')) && JSON.parse(store['cybersec_cli_mastery_v1']).cmds && Object.keys(JSON.parse(store['cybersec_cli_mastery_v1']).cmds).length > 0],
  ['exposure persists across an app restart', /3 Cold Runs taken/.test(out.join(' ')) && /after restart: .*258 of/.test(out.join(' '))]
];
let failed = 0; checks.forEach(([n, ok]) => { if(!ok){ failed++; console.log('  FAIL ' + n); } });
console.log(`${checks.length - failed} passed, ${failed} failed`); process.exit(failed ? 1 : 0);
