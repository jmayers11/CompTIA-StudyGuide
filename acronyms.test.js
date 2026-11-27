/* Acronym Trainer test: official CySA+ and Security+ acronym lists, flashcards with spaced review, four quiz modes, missed review, saved progress.
   Run:  node tests/acronyms.test.js [path/to/index.html] */
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
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { ACRONYMS, ACR_CATS, startAcrDeck, rateAcr, getDeck: () => acrDeck, startAcrQuiz, getQuiz: () => acrQuiz, acrSubmit, renderAcronyms, renderAcrQ, getAcrData: () => acrData, setView: v => { acrView = v; }, BACKUP_KEYS, switchTab, M_TAB_NAMES };\n})();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', code);
class Ev { constructor(t){ this.type = t; } }
const errors = [];
try{ run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev); }
catch(err){ errors.push('boot: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const H = globalThis.__hooks;
try{
  const A = H.ACRONYMS;
  const cy = A.filter(a => a.sets.includes('cysa')), se = A.filter(a => a.sets.includes('sec'));
  ok('full official CySA+ list present (81)', cy.length === 81);
  ok('full official Security+ list present (336 entries)', se.length === 336);
  ok('ids unique', new Set(A.map(a => a.id)).size === A.length);
  ok('every entry has meaning, function, topic and scenario', A.every(a => (a.exp.cysa || a.exp.sec) && a.desc.length > 10 && H.ACR_CATS[a.cat] && a.scen && a.scen.length > 10));
  ok('multi-meaning acronyms kept separate (MAC x3, PAM x2, RA, SAN, RBAC)', A.filter(a => a.acr === 'MAC').length === 3 && A.filter(a => a.acr === 'PAM').length === 2 && A.filter(a => a.acr === 'RBAC').length === 2);
  ok('known misprints in the official lists carry a note', ['ASN', 'EPSS', 'YAML', 'DNS', 'DES', 'URL', 'ISO'].every(k => A.find(a => a.acr === k).note));
  ok('functions never contain the acronym itself', A.filter(a => a.acr.length > 2 && new RegExp('\\b' + a.acr.replace(/[^A-Za-z0-9]/g, '.') + '\\b').test(a.desc)).length === 0);
  ok('backup includes acronym progress', H.BACKUP_KEYS.includes('cybersec_acronyms_v1'));
  ok('mobile tab name registered', H.M_TAB_NAMES.acronyms === 'Acronyms');
  H.switchTab('acronyms');
  ok('tab opens with CySA+... or default list and stats', document.getElementById('acronyms-panel').style.display === 'block' && /acronyms in set/.test(document.getElementById('acr-area').innerHTML));
  document.getElementById('acr-set').value = 'cysa'; document.getElementById('acr-cat').value = 'all'; document.getElementById('acr-deck-size').value = '10'; document.getElementById('acr-front').value = 'acr';
  H.startAcrDeck(false); let K = H.getDeck();
  ok('deck starts with 10 CySA+ cards', K && K.cards.length === 10 && K.cards.every(a => a.sets.includes('cysa')));
  const first = K.cards[0], second = K.cards[1];
  ok('rating before flipping is ignored', (H.rateAcr(2), H.getDeck().idx === 0));
  K.flipped = true; H.rateAcr(2);
  K.flipped = true; H.rateAcr(0);
  const d = H.getAcrData();
  ok('Got It moves the card up a box with a later due date', d.cards[first.id].box === 1 && d.cards[first.id].due > Date.now() + 80000000);
  ok('Missed It resets to box 0 and requeues the card', d.cards[second.id].box === 0 && H.getDeck().cards.length === 11);
  ok('flashcard progress saved', JSON.parse(localStorage.getItem('cybersec_acronyms_v1')).cards[first.id]);
  // quiz: each mode
  H.setView('quiz');
  ['a2e', 'e2a', 'fn', 'sc'].forEach(m => {
    document.getElementById('acr-mode').value = m; document.getElementById('acr-count').value = '20';
    H.startAcrQuiz(false); const Q = H.getQuiz();
    ok(m + ' quiz: 20 questions, 4 unique options, answer included', Q && Q.qs.length === 20 && Q.qs.every(q => q.options.length === 4 && new Set(q.options).size === 4 && q.options.includes(q.answer) && q.mode === m));
  });
  document.getElementById('acr-set').value = 'both'; document.getElementById('acr-mode').value = 'e2a'; document.getElementById('acr-count').value = 'all';
  H.startAcrQuiz(false); let Q = H.getQuiz();
  ok('meaning -> acronym never shows two options with the same letters', Q.qs.every(q => new Set(q.options).size === 4));
  ok('MAC question options exclude the other MAC meanings', Q.qs.filter(q => q.a.acr === 'MAC').every(q => q.options.filter(o => o === 'MAC').length === 1));
  // answer first 5 wrong
  document.getElementById('acr-set').value = 'cysa'; document.getElementById('acr-mode').value = 'mixed'; document.getElementById('acr-count').value = '10';
  H.startAcrQuiz(false); Q = H.getQuiz();
  const wrongIds = [];
  for(let i = 0; i < 10; i++){ const q = Q.qs[Q.idx]; const wi = q.options.findIndex(o => o !== q.answer); Q.sel = i < 5 ? wi : q.options.indexOf(q.answer); if(i < 5) wrongIds.push(q.id); H.acrSubmit(); Q.idx++; Q.sel = null; Q.answered = false; }
  H.renderAcrQ();
  ok('quiz ends and logs history', !H.getQuiz() && H.getAcrData().hist.some(h => h.kind === 'quiz' && h.total === 10 && h.score === 5));
  ok('quiz misses pull flashcards back to box 0', wrongIds.every(id => H.getAcrData().cards[id].box === 0));
  H.startAcrQuiz(true); Q = H.getQuiz();
  ok('missed-only quiz contains exactly the 5 missed', Q && Q.qs.length === 5 && Q.qs.every(q => wrongIds.includes(q.id)));
  H.setView('list'); H.renderAcronyms();
  ok('list view renders a table of the set', /<table/.test(document.getElementById('acr-area').innerHTML) && (document.getElementById('acr-area').innerHTML.match(/<tr>/g) || []).length === A.filter(a => { const s = document.getElementById('acr-set').value; return s === 'both' || a.sets.includes(s); }).length + 1);
}catch(err){ errors.push('test: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
let pass = 0; checks.forEach(([n, c]) => { if(c) pass++; else console.log('FAIL', n); });
errors.forEach(e => console.log('ERROR', e));
console.log('acronyms: ' + pass + ' passed, ' + (checks.length - pass) + ' failed' + (errors.length ? ', ' + errors.length + ' errors' : ''));
process.exit(pass === checks.length && !errors.length ? 0 : 1);
