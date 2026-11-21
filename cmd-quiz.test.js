/* Command Quiz test: multiple-choice questions built from the command deck. Checks option quality
   (4 distinct options, one right answer, no equivalent or similar-job commands as distractors),
   settings, track filtering, and a full quiz through the real UI.
   Run:  node tests/cmd-quiz.test.js [path/to/index.html] */
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
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { exposure, getExamPolicy, renderExposureDashboard, cliTrainer, renderCliTab, cmdCards, getCmdSession: () => cmdSession, renderCmdCard, CMD_CARDS, gradeExamQuestion, instantiatePBQ, PBQ_BANK, renderExamQuestion, getExamState: () => examState, startLab, labSubmit, getLabRun: () => labRun, labEngine, showCliSection, CLI_LABS, renderReadiness, computeReadiness, PRACTICE_FORMS, buildPracticeFormExam, practiceFormStatus, renderPracticeFormPicker, EXPOSURE_GROUPS, EXPOSURE_SUPPLEMENTAL_SET, QUESTION_BANKS, switchTab, buildCmdQuiz, startCmdQuiz, getCmdQuiz: () => cmdQuiz, renderCmdQuizQ, finishCmdQuiz, showCliSection, cmdQuizSubmit }; })();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', code);
class Ev { constructor(t){ this.type = t; } }
const errors = [];
try{ run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev); }
catch(err){ errors.push('boot: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }

const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const H = globalThis.__hooks;
try{
  const cards = H.CMD_CARDS;
  const norm = s => String(s).toLowerCase().replace(/\s+/g, ' ').trim();
  const base = s => norm(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const alts = c => new Set([c.cmd].concat((c.alts || []).map(a => a.cmd).filter(Boolean)).map(base));
  let seed = 1; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  let total = 0, bad = [];
  for(let run = 0; run < 60; run++){
    seed = run + 7;
    const qs = H.buildCmdQuiz(cards, { cert: 'security_plus', count: 40 }, rnd);
    total += qs.length;
    qs.forEach(q => {
      const card = cards.find(c => c.id === q.cardId);
      if(q.options.length !== 4 || new Set(q.options.map(norm)).size !== 4) bad.push('options ' + q.cardId);
      if(q.options.filter(o => o === q.answer).length !== 1) bad.push('answer count ' + q.cardId);
      if(q.kind === 'd2c'){
        q.options.filter(o => o !== q.answer).forEach(o => {
          const r = cards.find(c => c.cmd === o);
          if(!r || alts(card).has(base(o)) || alts(r).has(base(card.cmd))) bad.push('related distractor ' + q.cardId + ' ' + o);
          if(r && r.desc === card.desc) bad.push('same desc ' + o);
        });
        if(q.prompt !== card.desc || q.prompt.includes(card.cmd)) bad.push('prompt ' + q.cardId);
      }
      if(q.kind === 'c2d' && (q.prompt !== card.cmd || q.answer !== card.desc)) bad.push('c2d ' + q.cardId);
      if(q.kind === 'flag'){
        const f = (card.flags || []).find(x => x[0] === q.flag);
        if(!f || f[1] !== q.answer) bad.push('flag answer ' + q.cardId);
        q.options.filter(o => o !== q.answer).forEach(o => { if((card.flags || []).some(x => x[1] === o)) bad.push('own flag as distractor ' + q.cardId); });
      }
    });
  }
  ok('60 random 40-question quizzes: every question has 4 distinct options and exactly one correct answer', total >= 60 * 38 && !bad.some(b => /^options|^answer count/.test(b)));
  ok('no distractor is an equivalent or "similar job" command of the correct answer', !bad.some(b => /related|same desc/.test(b)));
  ok('description questions never show the command; command questions match the card', !bad.some(b => /^prompt|^c2d/.test(b)));
  ok('option questions ask about a real option of that command and never offer its other options as distractors', !bad.some(b => /flag/.test(b)));
  if(bad.length) console.log(bad.slice(0, 8));
  const d = H.buildCmdQuiz(cards, { cert: 'security_plus', count: 10, kinds: ['d2c'] }, rnd);
  ok('question count and type settings are respected', d.length === 10 && d.every(q => q.kind === 'd2c'));
  const t = H.buildCmdQuiz(cards, { cert: 'security_plus', cat: 'lin-net', count: 15, kinds: ['c2d'] }, rnd);
  ok('category filter limits questions to that category', t.length > 0 && t.every(q => cards.find(c => c.id === q.cardId).cat === 'lin-net'));
  const sp = H.buildCmdQuiz(cards, { cert: 'security_plus', count: 85, kinds: ['d2c'] }, rnd);
  ok('Security+ deck: no Cisco IOS commands appear', sp.every(q => !cards.find(c => c.id === q.cardId).certs || cards.find(c => c.id === q.cardId).certs.includes('security_plus')) && !sp.some(q => q.options.some(o => /^show |^copy run/.test(o))));
  ok('all 85 Security+ commands can be quizzed in one Description → Command pass', new Set(sp.map(q => q.cardId)).size === 85);
  // UI run through the real functions
  H.showCliSection('quiz');
  document.getElementById('cmdq-count').value = '10'; document.getElementById('cmdq-kind').value = 'mixed'; document.getElementById('cmdq-cat').value = 'all';
  document.getElementById('cmdq-start').click();
  const Q = H.getCmdQuiz();
  ok('quiz starts with 10 mixed questions', Q && Q.qs.length === 10 && new Set(Q.qs.map(q => q.kind)).size >= 2);
  const html0 = document.getElementById('cmdq-area').innerHTML;
  ok('question screen shows 4 options and a disabled Submit Answer', (html0.match(/cmdq-opt/g) || []).length >= 4 && /id="cmdq-submit" disabled/.test(html0));
  // answer the first wrong, the rest right
  const q0 = Q.qs[0], wrongOpt = q0.options.find(o => o !== q0.answer);
  Q.sel = wrongOpt; H.renderCmdQuizQ();
  ok('selecting an option enables Submit without grading', !Q.answered && !/id="cmdq-submit" disabled/.test(document.getElementById('cmdq-area').innerHTML));
  document.getElementById('cmdq-submit').click();
  ok('Submit grades the answer and shows the explanation', Q.answered && Q.score === 0 && /Not quite/.test(document.getElementById('cmdq-area').innerHTML) && /cmdq-explain/.test(document.getElementById('cmdq-area').innerHTML));
  // (the test DOM reuses element objects, so later steps call the same functions the buttons call)
  const next = () => { Q.idx++; Q.sel = null; Q.answered = false; H.renderCmdQuizQ(); };
  next();
  for(let i = 1; i < Q.qs.length; i++){ Q.sel = Q.qs[i].answer; H.cmdQuizSubmit(); next(); }
  const res = document.getElementById('cmdq-area').innerHTML.replace(/<[^>]+>/g, ' ');
  ok('results show 9 / 10 and list the missed question', /Quiz complete: 9 \/ 10/.test(res) && /Correct answer:/.test(res));
  ok('the missed command is added to flashcard review', H.cmdCards.status(q0.cardId) === 'review');
  ok('quiz history is saved', (H.cmdCards.pref('quizHistory') || []).slice(-1)[0].score === 9);
}catch(err){ errors.push('drive: ' + err.message + ' ' + (err.stack || '').split('\n').slice(1, 3).join(' ')); }
ok('no script errors', errors.length === 0);
if(errors.length) console.log(errors);
let failed = 0; checks.forEach(([n, p]) => { console.log((p ? '  ok   ' : '  FAIL ') + n); if(!p) failed++; });
console.log(`${checks.length - failed} passed, ${failed} failed`); process.exit(failed ? 1 : 0);
