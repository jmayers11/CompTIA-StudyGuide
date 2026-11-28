/* App security and storage-robustness tests: hostile notes, corrupted storage, crafted backups. */
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
const hooked = BASE.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { switchTab, BACKUP_KEYS, importBackupFile, validateBackupPayload, sanitizeNotesArray, getNotes: () => notes };\n})();');
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
const X = '"><img src=x onerror=alert(1)>';
const hostile = { id: 'n1" onmouseover="alert(1)', topic: 'T' + X, tags: ['t' + X, { evil: 1 }], module: 'M' + X, date: '2026' + X, examCert: 'cysa', examDomain: 'secops' + X, terms: { text: 'not a string' }, summary: 'S' + X, questions: ['q'], extra: { nested: () => 1 } };
const TABS = ['home','notes','quizzes','exam','flashcards','dashboard','readiness','planner','cram','careerprep','acronyms','recognition','analyst','invest','cmdquery'];
// 1) hostile note in storage: boots, renders every screen, no unescaped markup
try{
  const H = boot({ cybersec_notes_v1: JSON.stringify([hostile, 42, null, 'str', [1], { id: 'ok_1', topic: 'Fine', terms: 'A: B' }]), cybersec_track_v1: 'cysa' });
  const n = H.getNotes();
  ok('non-object entries are dropped from stored notes', n.length === 2);
  ok('unsafe note id is replaced with a safe id', /^[A-Za-z0-9_.:-]+$/.test(n[0].id) && n[0].id !== hostile.id);
  ok('valid note id is preserved', n[1].id === 'ok_1');
  ok('non-string text fields become strings', typeof n[0].terms === 'string' && typeof n[0].questions === 'string');
  ok('tags become a list of strings', Array.isArray(n[0].tags) && n[0].tags.every(t => typeof t === 'string') && n[0].tags.length === 1);
  ok('unexpected nested objects are dropped', !('extra' in n[0]));
  const tabErr = [];
  TABS.forEach(t => { try{ H.switchTab(t); }catch(e){ tabErr.push(t + ': ' + e.message + (e.stack||'').split('\n')[1]); } });
  ok('every tab renders with a malformed note (' + (tabErr.join('; ') || 'ok') + ')', tabErr.length === 0);
  const hits = Object.keys(els).filter(id => { const v = String(els[id].innerHTML || ''); return /<img src=x onerror/i.test(v) || /onmouseover="alert/i.test(v); });
  ok('hostile note content is escaped on every screen (' + (hits.join(',') || 'none') + ')', hits.length === 0);
}catch(err){ errors.push('hostile note: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
// 1b) hostile plain-text settings (exam date, theme, policy, track) are never rendered as markup
try{
  const H = boot({ cybersec_track_v1: 'cysa' + X, cybersec_exam_date_v1: '2026-12-30' + X, cybersec_theme_v1: 'dark' + X, cybersec_exam_policy_v1: 'strict"]' + X, cybersec_study_planner_v1: JSON.stringify({ examDate: X, goal: X, notes: X }) });
  const te = []; TABS.forEach(t => { try{ H.switchTab(t); }catch(e){ te.push(t + ': ' + e.message); } });
  ok('tabs render with hostile settings values (' + (te.join('; ') || 'ok') + ')', !te.length);
  const hits = Object.keys(els).filter(id => /<img src=x onerror/i.test(String(els[id].innerHTML || '')));
  ok('hostile settings values are escaped (' + (hits.join(',') || 'none') + ')', hits.length === 0);
}catch(err){ errors.push('settings: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
// 2) corrupted storage: garbage in every backed-up key must not stop boot
try{
  const seed0 = {}; boot({}); const keys = globalThis.__hooks.BACKUP_KEYS;
  keys.forEach(k => { seed0[k] = '{not json'; });
  let bootErr = null; let H2; try{ H2 = boot(seed0); }catch(e){ bootErr = e.message; }
  ok('app boots with every stored key corrupted (' + (bootErr || 'ok') + ')', !bootErr);
  if(H2){ ok('corrupted notes storage loads as an empty notebook', Array.isArray(H2.getNotes())); const te = []; TABS.forEach(t => { try{ H2.switchTab(t); }catch(e){ te.push(t + ': ' + e.message); } }); ok('every tab renders after storage corruption (' + (te.join('; ') || 'ok') + ')', te.length === 0); }
  const seed1 = {}; keys.forEach(k => { seed1[k] = JSON.stringify({ __proto__: { polluted: 1 }, a: [1, { b: null }] }); });
  let e1 = null; try{ boot(seed1); }catch(e){ e1 = e.message; }
  ok('app boots when stored values have the wrong JSON shape (' + (e1 || 'ok') + ')', !e1);
  ok('no prototype pollution from stored data', ({}).polluted === undefined);
  ['[]', '5', '"text"', 'null', 'true', '[null,{"x":1}]'].forEach(val => {
    const sd = {}; keys.forEach(k => { sd[k] = val; });
    let be = null, H3; try{ H3 = boot(sd); }catch(e){ be = e.message + ' ' + (e.stack || '').split('\n')[1]; }
    const te = []; if(H3) TABS.forEach(t => { try{ H3.switchTab(t); }catch(e){ te.push(t + ': ' + e.message); } });
    ok('boots and renders when every stored key holds ' + val + ' (' + (be || te.join('; ') || 'ok') + ')', !be && !te.length);
  });
}catch(err){ errors.push('corrupt: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
// 3) backup payload validation
try{
  const H = boot({ cybersec_track_v1: 'cysa' });
  const V = H.validateBackupPayload;
  ok('rejects non-object payloads', !V(null).ok && !V([1,2]).ok && !V('x').ok && !V(5).ok);
  ok('rejects payloads with no known keys', !V({ data: { evil_key: '1', 'javascript:alert(1)': 'x' } }).ok);
  const r = V({ app: 'x', data: { cybersec_notes_v1: JSON.stringify([hostile]), cybersec_xp_v1: '{bad json', unknown_key: 'alert(1)', cybersec_theme_v1: 'dark', cybersec_progress_v1: { a: 1 } } });
  const keys = (r.entries || []).map(e => e[0]);
  ok('unknown keys are never imported', r.ok && !keys.includes('unknown_key'));
  ok('invalid JSON values are skipped, not written', !keys.includes('cybersec_xp_v1') && (r.skipped || []).includes('cybersec_xp_v1'));
  ok('object values are re-serialized to JSON strings', (r.entries || []).every(e => typeof e[1] === 'string'));
  const notesEntry = (r.entries || []).find(e => e[0] === 'cybersec_notes_v1');
  ok('imported notes are sanitized before writing', notesEntry && !notesEntry[1].includes('onmouseover=\\"alert'));
  ok('only allow-listed keys can appear', keys.every(k => H.BACKUP_KEYS.includes(k)));
  const poll = V(JSON.parse('{"data":{"__proto__":{"polluted":1},"cybersec_track_v1":"cysa"}}'));
  ok('__proto__ in a backup does not pollute objects', ({}).polluted === undefined && poll.ok);
}catch(err){ errors.push('validate: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
// 4) end-to-end restore: undo snapshot, nothing executed, bad file leaves data alone
try{
  const H = boot({ cybersec_track_v1: 'cysa', cybersec_xp_v1: JSON.stringify({ xp: 5 }) });
  globalThis.__pwned = 0;
  const evil = { data: { cybersec_track_v1: 'cysa', cybersec_xp_v1: JSON.stringify({ xp: 99, toString: 'globalThis.__pwned=1' }), cybersec_notes_v1: '[{"id":"<script>globalThis.__pwned=1<\/script>","topic":"x"}]' } };
  H.importBackupFile({ size: 100, _text: JSON.stringify(evil) }); if(pendingReader) pendingReader.onload();
  ok('restore writes validated data', JSON.parse(store.cybersec_xp_v1 || '{}').xp === 99);
  ok('restore keeps an undo snapshot of replaced data', !!store.cybersec_restore_undo_v1 && JSON.parse(store.cybersec_restore_undo_v1).data.cybersec_xp_v1 === JSON.stringify({ xp: 5 }));
  ok('restored notes are sanitized in storage', !/<script>/.test(store.cybersec_notes_v1 || ''));
  ok('backup content is never executed', globalThis.__pwned === 0);
  const before = store.cybersec_xp_v1; pendingReader = null;
  H.importBackupFile({ size: 100, _text: '{ this is not json' }); if(pendingReader) pendingReader.onload();
  ok('malformed backup file changes nothing', store.cybersec_xp_v1 === before);
  pendingReader = null; alerts = [];
  H.importBackupFile({ size: 999 * 1024 * 1024, _text: '{}' });
  ok('oversized backup file is refused before reading', pendingReader === null && alerts.some(a => /too large/i.test(a)));
}catch(err){ errors.push('restore: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }
// 4b) third-party scripts are pinned with Subresource Integrity
const cdn = (html.match(/<script src="https:\/\/[^"]+"[^>]*>/g) || []);
ok('every external script has an integrity hash and crossorigin (' + cdn.length + ')', cdn.length >= 1 && cdn.every(t => /integrity="sha(256|384|512)-[A-Za-z0-9+\/=]{40,}"/.test(t) && /crossorigin="anonymous"/.test(t)));
ok('import features say so clearly if a library is blocked', /typeof JSZip === 'undefined'/.test(html) && /if\(!window\.pdfjsLib\)/.test(html));
// 5) static: user-data attributes are escaped
const rawAttr = (html.match(/data-id="\$\{n\.id\}"/g) || []).length;
ok('note ids are escaped wherever they are written into attributes', rawAttr === 0);
ok('no eval / new Function on stored data', !/eval\(\s*(localStorage|data|payload|raw)/.test(BASE) && !/new Function\(\s*(localStorage|data|payload|raw)/.test(BASE));
let pass = 0; checks.forEach(([n, c]) => { if(c) pass++; else console.log('FAIL', n); });
errors.forEach(e => console.log('ERROR', e));
console.log('app-security: ' + pass + ' passed, ' + (checks.length - pass) + ' failed' + (errors.length ? ', ' + errors.length + ' errors' : ''));
process.exit(pass === checks.length && !errors.length ? 0 : 1);
