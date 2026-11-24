/* Ports quiz test: checks the port data, that every generated question has exactly one right
   answer (no second protocol on the same port, no overlapping port distractors, one valid secure
   replacement), weighting of missed ports, and a full quiz through the UI.
   Run:  node tests/ports-quiz.test.js [path/to/index.html] */
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
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { exposure, getExamPolicy, renderExposureDashboard, cliTrainer, renderCliTab, cmdCards, getCmdSession: () => cmdSession, renderCmdCard, CMD_CARDS, gradeExamQuestion, instantiatePBQ, PBQ_BANK, renderExamQuestion, getExamState: () => examState, startLab, labSubmit, getLabRun: () => labRun, labEngine, showCliSection, CLI_LABS, renderReadiness, computeReadiness, PRACTICE_FORMS, buildPracticeFormExam, practiceFormStatus, renderPracticeFormPicker, EXPOSURE_GROUPS, EXPOSURE_SUPPLEMENTAL_SET, QUESTION_BANKS, switchTab, buildCmdQuiz, startCmdQuiz, getCmdQuiz: () => cmdQuiz, renderCmdQuizQ, finishCmdQuiz, showCliSection, cmdQuizSubmit, PORTS, buildPortsQuiz, portLabel, startPortsQuiz, getPortsQuiz: () => portsQuiz, renderPortsQ, portsSubmit, renderPorts, getPortsData: () => portsData }; })();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', code);
class Ev { constructor(t){ this.type = t; } }
const errors = [];
try{ run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev); }
catch(err){ errors.push('boot: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }

const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const H = globalThis.__hooks;
try{
  const P = H.PORTS, by = {}; P.forEach(p => { by[p.proto] = p; });
  ok('port data: unique ids, numeric ports, valid transport', new Set(P.map(p => p.id)).size === P.length && P.every(p => p.ports.length && p.ports.every(x => /^\d+$/.test(x) && +x < 65536) && ['TCP', 'UDP', 'TCP and UDP'].includes(p.transport)));
  ok('key ports are correct', by.HTTPS.ports[0] === '443' && by.SSH.ports[0] === '22' && by.RDP.ports[0] === '3389' && by.DNS.ports[0] === '53' && by.LDAPS.ports[0] === '636' && by.SMB.ports[0] === '445' && by.FTP.ports.join() === '20,21' && by.SNMP.ports.join() === '161,162' && by.RADIUS.ports.join() === '1812,1813' && by.DHCP.transport === 'UDP' && by.TFTP.ports[0] === '69');
  ok('every secure replacement points to a protocol in the list', P.filter(p => p.secureOf).every(p => by[p.secureOf]));
  let seed = 3; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const bad = []; let n = 0;
  for(let run = 0; run < 80; run++){
    seed = run + 11;
    const qs = H.buildPortsQuiz(P, { set: run % 2 ? 'all' : 'core', count: 40 }, rnd);
    n += qs.length;
    qs.forEach(q => {
      const p = P.find(x => x.id === q.id);
      if(q.options.filter(o => o === q.answer).length !== 1 || new Set(q.options).size !== q.options.length) bad.push('options ' + q.kind + ' ' + q.id);
      if(q.kind !== 'transport' && q.options.length !== 4) bad.push('count ' + q.kind);
      if(q.kind === 'p2s'){
        if(!p.ports.includes(q.port) || q.answer !== p.proto) bad.push('p2s answer ' + q.id);
        q.options.filter(o => o !== q.answer).forEach(o => { if(by[o] && by[o].ports.includes(q.port)) bad.push('p2s second right answer ' + q.id + ' ' + o); });
      }
      if(q.kind === 's2p'){
        if(q.answer !== H.portLabel(p)) bad.push('s2p answer ' + q.id);
        q.options.filter(o => o !== q.answer).forEach(o => { if(o.split(/, |–/).some(x => p.ports.includes(x))) bad.push('s2p overlapping distractor ' + q.id + ' ' + o); });
      }
      if(q.kind === 'secure'){
        if(p.secureOf !== q.about) bad.push('secure answer ' + q.id);
        q.options.filter(o => o !== q.answer).forEach(o => { const name = o.replace(/ \(.*$/, ''); if(by[name] && by[name].secureOf === q.about) bad.push('secure second right answer ' + q.about + ' ' + o); });
      }
      if(q.kind === 'transport' && q.answer !== p.transport) bad.push('transport ' + q.id);
    });
  }
  if(bad.length) console.log(bad.slice(0, 10));
  ok('80 random 40-question quizzes: one right answer per question, no duplicate options', n >= 80 * 38 && !bad.some(b => /^options|^count/.test(b)));
  ok('port → service never offers a second protocol on the same port (e.g. SSH and SFTP on 22)', !bad.some(b => /p2s/.test(b)));
  ok('service → port distractors never share a port with the answer', !bad.some(b => /s2p/.test(b)));
  ok('secure-replacement questions have exactly one valid replacement among the options', !bad.some(b => /secure/.test(b)));
  ok('TCP/UDP questions match the data', !bad.some(b => /transport/.test(b)));
  const core = H.buildPortsQuiz(P, { set: 'core', count: 100, kinds: ['s2p'] }, rnd);
  ok('exam-core set only asks about core ports', core.every(q => P.find(x => x.id === q.id).core));
  const wq = H.buildPortsQuiz(P, { set: 'core', count: 5, kinds: ['s2p'], weights: { rdp: 6, ldaps: 4 } }, rnd);
  ok('missed ports are asked first', wq[0].id === 'rdp' && wq[1].id === 'ldaps');
  // UI
  H.renderPorts();
  ok('reference table lists every port', (document.getElementById('pq-table').innerHTML.match(/<tr>/g) || []).length === P.length + 1);
  document.getElementById('pq-count').value = '10'; document.getElementById('pq-kind').value = 'mixed'; document.getElementById('pq-set').value = 'core';
  document.getElementById('pq-start').click();
  const Q = H.getPortsQuiz();
  ok('quiz starts with 10 mixed questions', Q && Q.qs.length === 10 && new Set(Q.qs.map(q => q.kind)).size >= 3);
  const q0 = Q.qs[0]; Q.sel = q0.options.find(o => o !== q0.answer); H.renderPortsQ();
  ok('selecting an option enables Submit without grading', !Q.answered && !/id="pq-submit" disabled/.test(document.getElementById('pq-area').innerHTML));
  H.portsSubmit();
  ok('Submit grades and explains the answer', Q.answered && Q.score === 0 && /Not quite/.test(document.getElementById('pq-area').innerHTML) && /cmdq-explain/.test(document.getElementById('pq-area').innerHTML));
  const next = () => { Q.idx++; Q.sel = null; Q.answered = false; H.renderPortsQ(); };
  next(); for(let i = 1; i < Q.qs.length; i++){ Q.sel = Q.qs[i].answer; H.portsSubmit(); next(); }
  const res = document.getElementById('pq-area').innerHTML.replace(/<[^>]+>/g, ' ');
  ok('results show 9 / 10 with the missed question', /Quiz complete: 9 \/ 10/.test(res) && /Correct answer:/.test(res));
  ok('missed port gets higher priority and progress is saved', (H.getPortsData().miss[q0.id] || 0) > 0 && !!store['cybersec_ports_v1']);
}catch(err){ errors.push('drive: ' + err.message + ' ' + (err.stack || '').split('\n').slice(1, 3).join(' ')); }
ok('no script errors', errors.length === 0);
if(errors.length) console.log(errors);
let failed = 0; checks.forEach(([n, p]) => { console.log((p ? '  ok   ' : '  FAIL ') + n); if(!p) failed++; });
console.log(`${checks.length - failed} passed, ${failed} failed`); process.exit(failed ? 1 : 0);
