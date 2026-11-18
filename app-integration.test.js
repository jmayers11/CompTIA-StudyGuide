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
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { exposure, getExamPolicy, renderExposureDashboard, cliTrainer, renderCliTab, cmdCards, getCmdSession: () => cmdSession, renderCmdCard, CMD_CARDS, gradeExamQuestion, instantiatePBQ, PBQ_BANK, renderExamQuestion, getExamState: () => examState, startLab, labSubmit, getLabRun: () => labRun, labEngine, showCliSection, CLI_LABS, renderReadiness, computeReadiness }; })();');
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
  // Phase 5: score labeling and readiness dashboard after three Cold Runs
  const sumHtml = document.getElementById('exam-summary').innerHTML;
  const attempts = JSON.parse(store['cybersec_progress_v1'] || '{}').examAttempts || [];
  globalThis.__hooks.renderReadiness();
  const rd = document.getElementById('readiness-content').innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  out.push('readiness: ' + rd.slice(0, 400));
  globalThis.__ready = { labeled: /UNOFFICIAL ESTIMATE \d+ \/ 900 · OFFICIAL PASSING 750/.test(sumHtml) && !/>SCORE \d/.test(sumHtml) && /not an official score/.test(sumHtml),
    attempts: attempts.filter(a => a.cert === 'security_plus'), rd };
  document.getElementById('exam-cert-select').value = 'network_plus';
  document.getElementById('exam-coldrun-btn').click(); const np = document.getElementById('exam-progress-text').textContent; document.getElementById('exam-submit-btn').click();
  out.push(`Net+ Cold Run: "${np}" -> ${JSON.stringify(fresh())}`);
  // Phase 2: CLI PBQs missed during the Cold Runs above feed the command trainer
  const H = globalThis.__hooks;
  const pbqMap = H.cliTrainer.raw().pbq;
  out.push('CLI commands flagged from missed PBQs: ' + Object.keys(pbqMap).join(', '));
  // Command flashcards: flip cards, typed recall, ratings (replaces the old five-mode trainer)
  H.renderCliTab();
  const sumTxt = document.getElementById('cmdc-summary').innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
  out.push('Card summary: ' + sumTxt.slice(0, 160));
  document.getElementById('cmdc-typed').checked = false; document.getElementById('cmdc-dir').value = 'd2c';
  document.getElementById('cmdc-start').click();
  const sess = H.getCmdSession();
  const graded = [];
  const front = document.getElementById('cmdc-area').innerHTML;
  const c0 = sess.queue[0];
  const esc = x => String(x).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  graded.push({ frontHasDesc: front.includes(esc(c0.desc)), frontHidesCmd: !/class="cmdc-cmd/.test(front), tap: /Tap to flip/.test(front) });
  document.getElementById('cmdc-card').click();
  const back = document.getElementById('cmdc-area').innerHTML;
  graded.push({ backHasCmd: /class="cmdc-cmd( cmdc-cmd-long)?"/.test(back) && back.includes(esc(c0.cmd)), rateButtons: /Missed It/.test(back) && /Almost/.test(back) && /Got It/.test(back) });
  document.querySelector = () => null;
  H.cmdCards.rate(c0.id, 'missed'); sess.rated[c0.id] = 'missed'; sess.idx++; sess.flipped = false; H.renderCmdCard();
  // typed recall on the next card
  document.getElementById('cmdc-typed').checked = true;
  sess.typed = true; H.renderCmdCard();
  const c1 = sess.queue[1];
  document.getElementById('cmdc-input').value = c1.cmd;
  document.getElementById('cmdc-check').click();
  const typedBack = document.getElementById('cmdc-area').innerHTML;
  graded.push({ typedCorrect: /✓ Correct/.test(typedBack) && /class="cmdc-cmd( cmdc-cmd-long)?"/.test(typedBack) });
  globalThis.__cliGraded = graded; globalThis.__cliPbq = Object.keys(pbqMap);
  globalThis.__cmdMissed = H.cmdCards.status(c0.id);
  // Phase 4: new PBQ types grade correctly and render inside a real exam
  const newTypes = H.PBQ_BANK.filter(p => p.cert === 'security_plus' && ['evidence','config','zones'].includes(p.type));
  let pbqOk = 0, pbqBad = [];
  newTypes.forEach(def => {
    const q = H.instantiatePBQ(def);
    let right, wrong;
    if(def.type === 'evidence'){ right = def.correct.slice().reverse(); wrong = def.correct.slice(0, -1); }
    else if(def.type === 'config'){ right = {}; def.rows.forEach((row, r) => row.cells.forEach((cell, c) => { if(cell.opts) right[r + ':' + c] = Array.isArray(cell.ans) ? cell.ans[0] : cell.ans; })); wrong = Object.assign({}, right); const k = Object.keys(wrong)[0]; const cell = def.rows[+k.split(':')[0]].cells[+k.split(':')[1]]; wrong[k] = cell.opts.find(o => o !== right[k]); }
    else { right = def.items.map(i => i.ans); wrong = right.slice(); wrong[0] = def.zones.find(z => z !== right[0]); }
    const g1 = H.gradeExamQuestion(q, right), g2 = H.gradeExamQuestion(q, wrong), g3 = H.gradeExamQuestion(q, null);
    if(g1.isCorrect && !g2.isCorrect && !g3.isCorrect && g1.isPBQ && g1.answerText) pbqOk++; else pbqBad.push(def.prompt.slice(0, 50));
  });
  out.push(`New PBQ types: ${newTypes.length} (${pbqOk} grade correctly)` + (pbqBad.length ? ' BAD: ' + pbqBad.join(' | ') : ''));
  document.getElementById('exam-cert-select').value = 'security_plus';
  document.getElementById('exam-allpbq-practice-btn').click();
  const es = H.getExamState();
  let rendered = 0, renderErr = [];
  if(es){ es.questions.forEach((q, i) => { try{ es.currentIndex = i; H.renderExamQuestion(); const html = document.getElementById('exam-options').innerHTML; if(['evidence','config','zones'].includes(q.type)){ if(/pbq-exhibit|pbq-config|pbq-zones/.test(html)) rendered++; else renderErr.push(q.type); } }catch(e){ renderErr.push(q.type + ': ' + e.message); } }); }
  out.push(`Practice-all exam: ${es ? es.questions.length : 0} PBQs; new types rendered: ${rendered}` + (renderErr.length ? ' ERR: ' + renderErr.join(', ') : ''));
  globalThis.__pbq = { n: newTypes.length, ok: pbqOk, rendered, renderErr, total: es ? es.questions.length : 0 };
  // Phase 3: terminal PBQs render in the exam and grade from typed answers
  let termRendered = 0, termGraded = 0, termN = 0;
  if(es){ es.questions.forEach((q, i) => { if(q.type !== 'terminal') return; termN++;
    es.currentIndex = i; H.renderExamQuestion(); if(/lab-term/.test(document.getElementById('exam-options').innerHTML)) termRendered++;
    const answers = q.lab.steps.map(st => st.kind === 'cmd' ? st.ex : (st.answer.type === 'choice' ? st.answer.correct : st.answer.shown));
    const good = H.gradeExamQuestion(q, { answers }), bad = H.gradeExamQuestion(q, { answers: answers.slice(0, -1) });
    if(good.isCorrect && !bad.isCorrect) termGraded++; }); }
  out.push(`Terminal PBQs in practice exam: ${termN}, rendered ${termRendered}, graded ${termGraded}`);
  // Phase 3: run a full Terminal Lab session through the real UI functions
  H.showCliSection('lab');
  const lab = H.CLI_LABS.find(l => l.id === 'lab-i1-backdoor');
  H.startLab(lab.id);
  H.labSubmit('netstat -an');                     // near-miss: one retry used
  const near = (document.getElementById('lab-list').innerHTML.match(/without -o[^<]*/i) || [''])[0];
  lab.steps.forEach(st => H.labSubmit(st.kind === 'cmd' ? st.ex : (st.answer.type === 'choice' ? st.answer.correct : st.answer.shown)));
  const labRunState = H.getLabRun();
  const doneHtml = document.getElementById('lab-list').innerHTML;
  const rec = H.labEngine.raw().labs[lab.id];
  out.push(`Lab run: done=${labRunState && labRunState.done} feedback="${near.slice(0, 40)}" score=${rec ? rec.best : 'none'}`);
  globalThis.__lab = { termN, termRendered, termGraded, done: !!(labRunState && labRunState.done), near: !!near, best: rec ? rec.best : null, msg: /Lab complete: 3\.5 \/ 4 points/.test(doneHtml) };
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
  ['command flashcards: front shows the description only, tap flips to the command with Got It / Almost / Missed It', /commands mastered/.test(out.join(' ')) && globalThis.__cliGraded && globalThis.__cliGraded[0].frontHasDesc && globalThis.__cliGraded[0].frontHidesCmd && globalThis.__cliGraded[0].tap && globalThis.__cliGraded[1].backHasCmd && globalThis.__cliGraded[1].rateButtons],
  ['Type the Command checks a typed answer and reveals the card; Missed It puts the command into review', globalThis.__cliGraded && globalThis.__cliGraded[2].typedCorrect && globalThis.__cmdMissed === 'review'],
  ['missed CLI PBQs in Cold Runs are recorded against their command', (globalThis.__cliPbq || []).length > 0],
  ['flashcard progress is saved to storage', !!store['cybersec_cmd_cards_v1'] && Object.keys(JSON.parse(store['cybersec_cmd_cards_v1']).c).length > 0],
  ['new PBQ types (evidence, config, zones) grade right/wrong/blank correctly', globalThis.__pbq && globalThis.__pbq.n >= 14 && globalThis.__pbq.ok === globalThis.__pbq.n],
  ['new PBQ types render inside a practice exam without errors', globalThis.__pbq && globalThis.__pbq.rendered === globalThis.__pbq.n && !globalThis.__pbq.renderErr.length],
  ['terminal PBQs render in exams and grade from typed answers', globalThis.__lab && globalThis.__lab.termN >= 8 && globalThis.__lab.termRendered === globalThis.__lab.termN && globalThis.__lab.termGraded === globalThis.__lab.termN],
  ['Terminal Lab: near-miss feedback, completion, partial-credit scoring recorded', globalThis.__lab && globalThis.__lab.done && globalThis.__lab.near && globalThis.__lab.best === 0.875 && globalThis.__lab.msg],
  ['exam results label the 100-900 score as an unofficial estimate next to the official 750', globalThis.__ready && globalThis.__ready.labeled],
  ['exam attempts store Cold Run, fresh/repeat and PBQ counts', globalThis.__ready && globalThis.__ready.attempts.length === 3 && globalThis.__ready.attempts.every(a => a.coldRun === true && a.freshTotal === 86 && a.freshTotal + a.repeatTotal + a.pbqTotal === 90 && a.pbqTotal === 4 && typeof a.weightedPct === 'number')],
  ['readiness tab renders disclaimer, confidence from 258 fresh questions, trend and domains', globalThis.__ready && /Unofficial practice estimate/.test(globalThis.__ready.rd) && /across 258 fresh questions/.test(globalThis.__ready.rd) && /official passing score \(CompTIA\)/.test(globalThis.__ready.rd) && /Cold Run trend/.test(globalThis.__ready.rd) && /5\.0 Security Program Management/.test(globalThis.__ready.rd) && /commands mastered \(flashcards\)/.test(globalThis.__ready.rd)],
  ['exposure persists across an app restart', /3 Cold Runs taken/.test(out.join(' ')) && /after restart: .*you've seen \d+ of \d+/.test(out.join(' ')) && /unchanged by restart/.test(out.join(' '))]
];
let failed = 0; checks.forEach(([n, ok]) => { if(!ok){ failed++; console.log('  FAIL ' + n); } });
console.log(`${checks.length - failed} passed, ${failed} failed`); process.exit(failed ? 1 : 0);
