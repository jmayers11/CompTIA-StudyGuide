/* Standard PBQ Format practice exams test (Practice Exams 16-18): structure and domain weighting,
   originality against Exams 1-15, Select TWO counts, answer spread and style measures, PBQs that need no
   terminal or typed commands and grade correctly, labeling, and the hold-back until each exam is taken.
   Run:  node tests/standard-practice-exams.test.js [path/to/index.html] */
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
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { exposure, getExamPolicy, renderExposureDashboard, cliTrainer, renderCliTab, cmdCards, getCmdSession: () => cmdSession, renderCmdCard, CMD_CARDS, gradeExamQuestion, instantiatePBQ, PBQ_BANK, renderExamQuestion, getExamState: () => examState, startLab, labSubmit, getLabRun: () => labRun, labEngine, showCliSection, CLI_LABS, renderReadiness, computeReadiness, PRACTICE_FORMS, buildPracticeFormExam, practiceFormStatus, renderPracticeFormPicker, EXPOSURE_GROUPS, EXPOSURE_SUPPLEMENTAL_SET, QUESTION_BANKS, switchTab, getCombinedDomainPool, selectPBQs, fcCollectBankCards, dailyChallengePool, reservedPracticeIds, simLabsForTrack, getProgress: () => progressHistory, RAW_SECPLUS_BANK }; })();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', code);
class Ev { constructor(t){ this.type = t; } }
const errors = [];
try{ run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev); }
catch(err){ errors.push('boot: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }

const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const H = globalThis.__hooks;
try{
  const forms = H.PRACTICE_FORMS.security_plus, std = forms.filter(f => f.format === 'standard'), other = forms.filter(f => f.format !== 'standard');
  const NEED = { general: 10, threats: 19, architecture: 16, secops: 24, management: 17 };
  const ids = f => Object.keys(f.mc).reduce((a, k) => a.concat(f.mc[k]), []);
  ok('3 Standard PBQ Format exams numbered 16-18, held back until taken', std.length === 3 && std.map(f => f.n).join() === '16,17,18' && std.every(f => f.reserved));
  ok('each: 86 MC with SY0-701 weighting 10/19/16/24/17 + 4 PBQs', std.every(f => Object.keys(NEED).every(k => f.mc[k].length === NEED[k]) && f.pbq.length === 4));
  const raw = H.RAW_SECPLUS_BANK, byId = {}; raw.forEach(q => { byId[q.oid || H.exposure.qid(q.question)] = q; });
  const nid = std.reduce((a, f) => a.concat(ids(f)), []), otherIds = new Set(other.reduce((a, f) => a.concat(ids(f)), []));
  ok('258 original questions written for these exams, none used in Exams 1-15', nid.length === 258 && new Set(nid).size === 258 && nid.every(id => byId[id] && byId[id].src === 'original-2026-11-std' && !otherIds.has(id)));
  const STOP = new Set('which what the and that with from this their they for are was were have has into most best should first next does would about after before each than them then when where while your will can not but only following company organization security team administrator analyst'.split(' '));
  const tok = s => new Set((s.toLowerCase().match(/[a-z0-9]+/g) || []).filter(w => !STOP.has(w) && w.length > 2));
  const jac = (a, b) => { let n = 0; a.forEach(w => { if(b.has(w)) n++; }); return n / Math.max(1, a.size + b.size - n); };
  const prior = raw.filter(q => q.src !== 'original-2026-11-std').map(q => tok(q.question));
  const NQ = nid.map(id => byId[id]);
  let worst = 0; NQ.forEach(q => { const t = tok(q.question); prior.forEach(p => { const j = jac(t, p); if(j > worst) worst = j; }); });
  ok('no question closely paraphrases an existing one (highest word overlap ' + worst.toFixed(2) + ', limit 0.35)', worst <= 0.35);
  const multi = std.map(f => ids(f).filter(id => byId[id].correct.length > 1).length);
  ok('3 or 4 Select TWO questions per exam (' + multi.join('/') + ')', multi.every(n => n >= 3 && n <= 4));
  ok('answer keys valid: 4 options (5 for Select TWO, 2 answers)', NQ.every(q => new Set(q.options).size === q.options.length && q.correct.every(i => i >= 0 && i < q.options.length) && (q.correct.length === 1 ? q.options.length === 4 : (q.options.length === 5 && q.correct.length === 2 && /Select TWO/.test(q.question)))));
  const pos = [0, 0, 0, 0]; NQ.filter(q => q.correct.length === 1).forEach(q => pos[q.correct[0]]++);
  ok('correct answers spread across A-D (' + pos.join('/') + ')', pos.every(n => n >= 45 && n <= 80));
  const W = s => s.split(/\s+/).length, mean = a => a.reduce((x, y) => x + y, 0) / a.length, single = NQ.filter(q => q.correct.length === 1);
  const longest = single.filter(q => { const L = q.options.map(W), c = L[q.correct[0]]; return c === Math.max(...L) && L.filter(x => x === c).length === 1; }).length / single.length;
  const ratio = mean(single.map(q => { const L = q.options.map(W); return L[q.correct[0]] / mean(L.filter((x, i) => i !== q.correct[0])); }));
  const bfnm = NQ.filter(q => /\b(BEST|FIRST|NEXT|MOST)\b/.test(q.question)).length / NQ.length;
  const give = single.filter(q => { const sw = new Set((q.question.match(/[A-Za-z]{5,}/g) || []).map(x => x.toLowerCase())); const hit = o => (o.match(/[A-Za-z]{5,}/g) || []).some(w => sw.has(w.toLowerCase())); return hit(q.options[q.correct[0]]) && !q.options.some((o, i) => i !== q.correct[0] && hit(o)); }).length / single.length;
  ok(`style: BEST/FIRST/NEXT/MOST ${Math.round(bfnm * 100)}%, answer longest ${Math.round(longest * 100)}%, length ratio ${ratio.toFixed(2)}, keyword giveaway ${(give * 100).toFixed(1)}%`, bfnm >= 0.4 && longest < 0.15 && ratio > 0.85 && ratio < 1.15 && give < 0.05);
  ok('every question has an explanation and an objective', NQ.every(q => q.why && q.why.length > 30 && /^[1-5]\.\d$/.test(q.obj)));
  // PBQs
  const defs = {}; H.PBQ_BANK.filter(p => p.cert === 'security_plus').forEach(p => { defs[H.exposure.qid(p.prompt)] = p; });
  const P = std.reduce((a, f) => a.concat(f.pbq), []).map(id => defs[id]);
  const otherP = new Set(other.reduce((a, f) => a.concat(f.pbq), []));
  ok('12 new PBQs, none used in Exams 1-15', P.length === 12 && P.every(Boolean) && new Set(P).size === 12 && std.every(f => f.pbq.every(id => !otherP.has(id))));
  ok('no terminal simulations and no typed command-line PBQs', P.every(p => !['terminal', 'cli'].includes(p.type) && !p.sim && !p.lab));
  ok('interactive types only: configuration tables, evidence selection, diagrams, ordering, matching', P.every(p => ['config', 'evidence', 'zones', 'order', 'match'].includes(p.type)) && new Set(P.map(p => p.type)).size === 5);
  ok('each exam mixes at least three PBQ types', std.every(f => new Set(f.pbq.map(id => defs[id].type)).size >= 3));
  const topics = P.map(p => p.prompt).join(' ').toLowerCase();
  ok('topics include firewall config, segmentation, log analysis, attack identification, access control, incident response, certificates, control selection and command output', ['firewall', 'segment', 'log', 'attack', 'access', 'ransomware', 'certificate', 'control', 'output'].every(w => topics.includes(w)));
  let gOk = 0, bad = [];
  P.forEach(def => { const q = H.instantiatePBQ(def); let right, wrong;
    if(def.type === 'evidence'){ right = def.correct.slice(); wrong = def.correct.slice(0, -1); }
    else if(def.type === 'config'){ right = {}; def.rows.forEach((row, r) => row.cells.forEach((cell, c) => { if(cell.opts) right[r + ':' + c] = cell.ans; })); wrong = Object.assign({}, right); const k = Object.keys(wrong)[0]; wrong[k] = def.rows[+k.split(':')[0]].cells[+k.split(':')[1]].opts.find(o => o !== right[k]); }
    else if(def.type === 'zones'){ right = def.items.map(i => i.ans); wrong = right.slice(); wrong[0] = def.zones.find(z => z !== right[0]); }
    else if(def.type === 'order'){ right = def.steps.slice(); wrong = right.slice(); [wrong[0], wrong[1]] = [wrong[1], wrong[0]]; }
    else { right = def.pairs.map(p => p.right); wrong = right.slice(); [wrong[0], wrong[1]] = [wrong[1], wrong[0]]; }
    const g1 = H.gradeExamQuestion(q, right), g2 = H.gradeExamQuestion(q, wrong), g3 = H.gradeExamQuestion(q, null);
    if(g1.isCorrect && !g2.isCorrect && !g3.isCorrect && g2.credit > 0) gOk++; else bad.push(def.type + ': ' + def.prompt.slice(0, 40)); });
  if(bad.length) console.log(bad);
  ok('every PBQ grades a full answer right, a partial answer with partial credit, and a blank as wrong', gOk === 12);
  const sizes = P.map(p => p.type === 'config' ? p.rows.reduce((t, r) => t + r.cells.filter(c => c.opts).length, 0) : p.type === 'evidence' ? (p.items || p.exhibit.lines).length : p.type === 'zones' ? p.items.length : p.type === 'order' ? p.steps.length : p.pairs.length);
  ok('sized for about 2-5 minutes each (5-20 decisions per PBQ: ' + sizes.join(',') + ')', sizes.every(n => n >= 5 && n <= 20));
  ok('every PBQ has an explanation, except order and match which explain through their answers', P.every(p => ['order', 'match'].includes(p.type) || (p.explanation && p.explanation.length > 60)));
  const ex = H.buildPracticeFormExam('security_plus', 17);
  ok('Practice Exam 17 builds: 86 questions + 4 PBQs, nothing replaced', ex && ex.mc.length === 86 && ex.pbq.length === 4 && ex.replaced === 0);
  // hold-back and labels
  const R = H.reservedPracticeIds('security_plus'); const stdQ = new Set(nid), stdP = new Set(std.reduce((a, f) => a.concat(f.pbq), []));
  ok('all Standard Format questions and PBQs are held back before any attempt', nid.every(id => R.q.has(id)) && [...stdP].every(id => R.p.has(id)));
  const pool = new Set(); Object.keys(NEED).forEach(k => H.getCombinedDomainPool('security_plus', k, 'bank').forEach(q => pool.add(q.id)));
  const picked = H.selectPBQs(400, 'security_plus').map(q => q._pbqId);
  ok('not used by Fresh exams, quizzes, PBQ practice, flashcards or the daily challenge', nid.every(id => !pool.has(id)) && picked.every(id => !stdP.has(id)) && H.fcCollectBankCards().every(c => !nid.some(id => byId[id].question === c.front)) && H.dailyChallengePool('security_plus').every(q => !stdQ.has(q.oid || H.exposure.qid(q.question))));
  H.getProgress().examAttempts = (H.getProgress().examAttempts || []).concat([{ ts: Date.now(), cert: 'security_plus', form: 16, correctCount: 70, total: 90 }]);
  const R2 = H.reservedPracticeIds('security_plus'), f16 = std[0], f17 = std[1];
  ok('after Exam 16 is attempted only its items are released', ids(f16).every(id => !R2.q.has(id)) && f16.pbq.every(id => !R2.p.has(id)) && ids(f17).every(id => R2.q.has(id)));
  H.renderPracticeFormPicker();
  const opts = document.getElementById('exam-coldrun-form').innerHTML;
  ok('exam picker labels them Standard PBQ Format', /Practice Exam 16 \(Standard PBQ Format\): taken 1/.test(opts) && /Practice Exam 18 \(Standard PBQ Format\): not taken/.test(opts) && /Practice Exam 11 \(new questions\)/.test(opts));
  document.getElementById('exam-coldrun-form').value = '17'; H.renderPracticeFormPicker && 0;
  const html = require('fs').readFileSync(process.argv[2] || require('path').join(__dirname, '..', 'index.html'), 'utf8');
  ok('the exam note says the format does not reproduce the real exam exactly', /neither format reproduces the real exam exactly/.test(html));
  const s0 = html.indexOf('\n<script>\n');
  ok('no question text closes the app script early', html.indexOf('</script>', s0) === html.indexOf('\n</script>', s0) + 1);
}catch(err){ errors.push('drive: ' + err.message + ' ' + (err.stack || '').split('\n').slice(1, 3).join(' ')); }
ok('no script errors', errors.length === 0);
if(errors.length) console.log(errors);
let failed = 0; checks.forEach(([n, p]) => { console.log((p ? '  ok   ' : '  FAIL ') + n); if(!p) failed++; });
console.log(`${checks.length - failed} passed, ${failed} failed`); process.exit(failed ? 1 : 0);
