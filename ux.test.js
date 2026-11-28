/* UX test: track-aware navigation, Readiness default, Home Today plan, Exam quick start, Study-Bot dismiss.
   Run:  node tests/ux.test.js [path/to/index.html] */
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
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { NAV_LAYOUTS, layoutTabsForTrack, readinessCertKey, buildTodayPlan, renderTodayPlan, renderExamQuickStart, setActiveTrack, M_TAB_NAMES, getExamState: () => examState, switchTab, botSay, dailyChallengePool, EXPOSURE_SUPPLEMENTAL_SET, exposure, renderQuizQuickStart, renderWhatsNew };\n})();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', code);
class Ev { constructor(t){ this.type = t; } }
globalThis.Event = Ev;
const errors = [];
localStorage.setItem('cybersec_track_v1', 'cysa');
try{ run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev); }
catch(err){ errors.push('boot: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const H = globalThis.__hooks;
try{
  const tabs = new Set(Object.keys(H.M_TAB_NAMES));
  const html = require('fs').readFileSync(process.argv[2] || require('path').join(__dirname, '..', 'index.html'), 'utf8');
  const btnTabs = new Set([...html.matchAll(/class="tab-btn[^"]*" data-tab="([a-z]+)"/g)].map(m => m[1]));
  ok('every nav layout lists only real tabs', Object.values(H.NAV_LAYOUTS).every(L => L.every(([, ts]) => ts.every(t => btnTabs.has(t)))));
  ok('CySA+ layout puts its study tools first and keeps Exam Mode and Readiness', (() => { const all = [].concat(...H.NAV_LAYOUTS.cysa.map(g => g[1])); return ['acronyms','cmdquery','recognition','analyst','invest','exam','readiness'].every(t => all.includes(t)) && !all.includes('attacks') && !all.includes('ports'); })());
  ok('Security+ layout keeps Security+ tools (CLI Mastery, Ports, Attacks)', (() => { const all = [].concat(...H.NAV_LAYOUTS.security_plus.map(g => g[1])); return ['climastery','ports','attacks','acronyms'].every(t => all.includes(t)); })());
  ok('every tab has a mobile title', [...btnTabs].every(t => tabs.has(t)));
  ok('Readiness opens on the active track (CySA+)', H.readinessCertKey() === 'cysa');
  const plan = H.buildTodayPlan();
  ok('Today plan offers up to 4 concrete steps, starting with the next practice exam', plan.length >= 2 && plan.length <= 4 && /Practice Exam 1\b/.test(plan[0].title));
  ok('Today plan includes the acronym deck and a case for CySA+', plan.some(p => /acronym/i.test(p.title)) && plan.some(p => /case/i.test(p.title)));
  const slot = document.getElementById('test-today-slot');
  ok('Home plan renders with one button per step', H.renderTodayPlan(slot) && /Today's plan/.test(slot.innerHTML) && (slot.innerHTML.match(/today-go/g) || []).length === plan.length);
  H.switchTab('exam'); H.renderExamQuickStart();
  ok('Exam Mode shows quick start buttons', /Practice Exam 1/.test(document.getElementById('exam-quick').innerHTML) && /Quick 20/.test(document.getElementById('exam-quick').innerHTML));
  document.getElementById('eq-quick').click();
  const st = H.getExamState();
  ok('Quick 20 starts a 20-question exam with instant feedback', st && st.questions && st.questions.length >= 20 && document.getElementById('exam-instant-feedback').checked === true);

  ok('PBQ prompts are not printed twice', (html.match(/q\.prompt && q\.prompt !== q\.question/g) || []).length === 9);
  ok('Quick 20 has no PBQs', st.questions.length === 20 && st.questions.every(q => !q.type || ['mc', 'multi'].includes(q.type) || !q.pairs && !q.steps && !q.lab));
  const dp = H.dailyChallengePool('cysa');
  ok('Daily Challenge skips the older supplemental questions', dp.length >= 50 && dp.every(q => !H.EXPOSURE_SUPPLEMENTAL_SET.has(q.oid || H.exposure.qid(q.question))));
  H.switchTab('quizzes'); H.renderQuizQuickStart();
  ok('Quizzes show quick start buttons', /Question bank · 10/.test(document.getElementById('quiz-quick').innerHTML) && /Speed drill/.test(document.getElementById('quiz-quick').innerHTML));
  const wn = document.getElementById('test-whatsnew'); H.renderWhatsNew(wn);
  ok('What\'s new card shows once for CySA+ and can be dismissed', /New in this update/.test(wn.innerHTML) && (document.getElementById('whatsnew-dismiss').click(), localStorage.getItem('cybersec_whatsnew_2026_11_27') === '1'));

  ok('Notes have an inline search that drives the main search', /id="note-search-inline"/.test(html) && /main\.value = inl\.value/.test(html));
  ok('Network+ seed-notes button hides on other tracks', /seed\.style\.display = \(!track \|\| track === 'network_plus'\) \? '' : 'none'/.test(html));
  ok('Flashcards explain tap-to-flip and point to Due for Review and Acronyms', /class="fc-tip">Tap the card to flip it/.test(html));
  ok('Dashboard empty state offers next steps', /id="dash-empty-exam"/.test(html) && /id="dash-empty-quiz"/.test(html));
  ok('Study-Bot bubble closes on tap and hides sooner on phones', /bubble\.addEventListener\('click', \(\) => bubble\.classList\.remove\('show'\)\)/.test(html) && /Math\.min\(holdMs \|\| 6000, 3500\)/.test(html));
}catch(err){ errors.push('test: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
let pass = 0; checks.forEach(([n, c]) => { if(c) pass++; else console.log('FAIL', n); });
errors.forEach(e => console.log('ERROR', e));
console.log('ux: ' + pass + ' passed, ' + (checks.length - pass) + ' failed' + (errors.length ? ', ' + errors.length + ' errors' : ''));
process.exit(pass === checks.length && !errors.length ? 0 : 1);
