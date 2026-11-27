/* Terminal help test: the help function in the simulated terminals (help / ? lists commands,
   COMMAND --help, man COMMAND, COMMAND /?, HELP COMMAND, Get-Help) covers every command the labs, simulations
   and the Help Drill use, never counts as an attempt or locks an exam step, and never prints a step's answer.
   Also checks the Help Drill (find it with help).
   Run:  node tests/terminal-help.test.js [path/to/index.html] */
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
code = code.replace(/\}\)\(\);\s*$/, '  ;globalThis.__hooks = { exposure, getExamPolicy, renderExposureDashboard, cliTrainer, renderCliTab, cmdCards, getCmdSession: () => cmdSession, renderCmdCard, CMD_CARDS, gradeExamQuestion, instantiatePBQ, PBQ_BANK, renderExamQuestion, getExamState: () => examState, startLab, labSubmit, getLabRun: () => labRun, labEngine, showCliSection, CLI_LABS, renderReadiness, computeReadiness, PRACTICE_FORMS, buildPracticeFormExam, practiceFormStatus, renderPracticeFormPicker, EXPOSURE_GROUPS, EXPOSURE_SUPPLEMENTAL_SET, QUESTION_BANKS, switchTab, buildCmdQuiz, startCmdQuiz, getCmdQuiz: () => cmdQuiz, renderCmdQuizQ, finishCmdQuiz, showCliSection, cmdQuizSubmit, buildSimCmdQuiz, simLabsForTrack, startSimQuiz, getSimQuiz: () => simQuiz, renderSimQuizQ, simQuizSubmit, renderSimQuizSetup, getSimRec: () => simRec, termHelpReply, TERM_HELP, termPbqHelp, cliPbqHelp, HELP_DRILL, buildHelpDrill, startHelpDrill, helpDrillSubmit, helpDrillFinishTask, finishHelpDrill, getHelpDrill: () => helpDrill, getHelpDrillData: () => helpDrillData, renderHelpDrillIdle, BACKUP_KEYS, CMD_CARDS }; })();');
globalThis.pdfjsLib = anything(); globalThis.JSZip = anything(); globalThis.sessionStorage = localStorage; globalThis.getComputedStyle = () => anything(); globalThis.HTMLElement = function(){}; globalThis.Element = function(){};
const run = new Function('window','document','localStorage','navigator','location','confirm','alert','setTimeout','setInterval','clearInterval','clearTimeout','matchMedia','requestAnimationFrame','Event', code);
class Ev { constructor(t){ this.type = t; } }
const errors = [];
try{ run(windowObj, document, localStorage, windowObj.navigator, windowObj.location, () => true, () => {}, () => 0, () => 0, () => {}, () => {}, windowObj.matchMedia, () => 0, Ev); }
catch(err){ errors.push('boot: ' + err.message + ' ' + (err.stack || '').split('\n')[1]); }

const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const H = globalThis.__hooks;
try{
  const R = H.termHelpReply, labs = H.CLI_LABS, grade = (l, s, x) => H.labEngine.gradeStep(l, s, x).ok;
  const base = (ex) => { const t = ex.trim().split(/\s+/); return (t[0].toLowerCase() === 'sudo' ? t[1] : t[0]).toLowerCase(); };
  const P = p => p === 'windows' ? 'windows' : 'linux';
  const used = new Set(); labs.forEach(l => l.steps.forEach(s => { if(s.ex) used.add(P(l.plat) + ':' + base(s.ex)); }));
  H.HELP_DRILL.forEach(t => used.add(t.plat + ':' + base(t.ex)));
  const missing = [...used].filter(k => { const [p, b] = k.split(':'); return !H.TERM_HELP[p][b]; });
  ok('help covers every command used by the labs, simulations and Help Drill (' + used.size + ' commands)', missing.length === 0);
  if(missing.length) console.log(missing);
  ok('help / ? list the commands on both platforms', /Available commands/.test(R('help', 'linux')) && /ufw/.test(R('?', 'linux')) && /IPCONFIG/.test(R('help', 'windows')) && /NETSTAT/.test(R('/?', 'windows')));
  const lin = ['ss --help', 'man ss', 'help ss', 'sudo ss --help'].map(x => R(x, 'linux'));
  ok('Linux forms: COMMAND --help, man COMMAND, help COMMAND, sudo COMMAND --help', lin.every(t => t && /USAGE:/.test(t) && /-p\s+Show the owning process/.test(t)));
  const win = ['netstat /?', 'help netstat', 'NETSTAT -?', 'Get-Help netstat'].map(x => R(x, 'windows'));
  ok('Windows forms: COMMAND /?, HELP COMMAND, COMMAND -?, Get-Help COMMAND', win.every(t => t && /USAGE:/.test(t) && /-o\s+The owning process ID/.test(t)));
  ok('subcommand help: net user /?, net help localgroup, openssl x509 -help, man openssl-x509', /ACTIVE/.test(R('net user /?', 'windows')) && /\/ADD/.test(R('net help localgroup', 'windows')) && /-enddate/.test(R('openssl x509 -help', 'linux')) && /-noout/.test(R('man openssl-x509', 'linux')));
  ok('unknown commands get a polite message', /No manual entry for foo/.test(R('foo --help', 'linux')) && /not recognized/.test(R('foo /?', 'windows')));
  const exs = []; labs.forEach(l => l.steps.forEach(s => { if(s.ex) exs.push([l, s]); }));
  ok('no real answer is mistaken for a help request (' + exs.length + ' simulation steps)', exs.every(([l, s]) => R(s.ex, l.plat) === null) && H.HELP_DRILL.every(t => R(t.ex, t.plat) === null) && R('sudo -l', 'linux') === null && R('ls -l', 'linux') === null);
  const allHelp = Object.keys(H.TERM_HELP.linux).map(k => R(k + ' --help', 'linux')).concat(Object.keys(H.TERM_HELP.windows).map(k => R(k + ' /?', 'windows'))).concat([R('help', 'linux'), R('help', 'windows')]).join('\n').toLowerCase();
  // answers made only of a tool's own subcommand words (e.g. vssadmin list shadows) appear in any real help listing, so only answers with real arguments are checked
  const leaks = exs.filter(([l, s]) => s.ex.trim().split(/\s+/).length >= 3 && /[^a-z\s]/i.test(s.ex.split(/\s+/).slice(1).join(' ')) && allHelp.includes(s.ex.toLowerCase()));
  ok('help text never prints a simulation step\'s full answer', leaks.length === 0);
  if(leaks.length) console.log(leaks.map(x => x[1].ex));
  // Terminal Lab: help doesn't use a try
  const lab = labs.find(l => l.id === 'lab-i1-backdoor');
  H.startLab(lab.id);
  H.labSubmit('help'); H.labSubmit('netstat /?');
  const run = H.getLabRun();
  ok('Terminal Lab: help lookups show output and don\'t count as tries', run.results[0].tries === 0 && run.history.length === 2 && /OPTIONS/.test(run.history[1].out) && run.helpUsed === 2);
  H.labSubmit(lab.steps[0].ex);
  ok('Terminal Lab: the first real command after help still counts as a first try', run.results[0].ok && run.results[0].tries === 1);
  // exam terminal PBQ
  const sim = labs.find(l => l.id === 'sim-ufw'), st = { answers: [] };
  ok('exam terminal PBQ: help is shown under the current step and doesn\'t lock it', H.termPbqHelp(sim, st, 'ufw --help') && st.answers.length === 0 && st.help.length === 1 && st.help[0].i === 0 && !H.termPbqHelp(sim, st, 'ufw status verbose'));
  const def = H.PBQ_BANK.find(p => p.lab === 'sim-ufw'), q = H.instantiatePBQ(def);
  const answers = sim.steps.map(s => s.kind === 'cmd' ? s.ex : (s.answer.type === 'choice' ? s.answer.correct : s.answer.shown));
  const g = H.gradeExamQuestion(q, { answers, help: st.help });
  ok('help lookups don\'t change exam scoring', g.isCorrect && g.points === g.maxPoints);
  const sel = { typed: 'whoami --help' };
  ok('single-command PBQ: help shows output and clears the box, so it is never graded as the answer', H.cliPbqHelp(sel, 'whoami --help', true) && sel.typed === '' && /USAGE/.test(sel.helpOut) && !H.cliPbqHelp(sel, 'whoami', true));
  // Help Drill
  const tasks = H.HELP_DRILL;
  ok('Help Drill: ' + tasks.length + ' tasks across Linux and Windows, unique ids', tasks.length >= 20 && new Set(tasks.map(t => t.id)).size === tasks.length && tasks.some(t => t.plat === 'linux') && tasks.some(t => t.plat === 'windows'));
  const gd = (t, x) => H.labEngine.gradeStep({ plat: t.plat }, { kind: 'cmd', accept: t.accept }, x).ok;
  ok('every task\'s answer is accepted and an unrelated command is rejected', tasks.every(t => gd(t, t.ex) && !gd(t, base(t.ex))));
  const optsFound = tasks.filter(t => { const hp = (R(base(t.ex) + (t.plat === 'windows' ? ' /?' : ' --help'), t.plat) || '').toLowerCase();
    const sub = t.ex.split(/\s+/)[1] || ''; const subHelp = (R(base(t.ex) + ' ' + sub + (t.plat === 'windows' ? ' /?' : ' -help'), t.plat) || '').toLowerCase();
    const flagRe = t.plat === 'windows' ? /^[-/]/ : /^(-|@|\+)/;
    let flags = t.ex.split(/\s+/).slice(1).filter(x => flagRe.test(x) && !/^-\d/.test(x)).map(x => x.toLowerCase().replace(/[:=].*$/, '').replace(/^@.*/, '@'));
    // combined short Linux flags (-tn) are checked letter by letter
    flags = flags.flatMap(f => t.plat === 'linux' && /^-[a-z]{2,}$/.test(f) && !hp.includes(f) && !subHelp.includes(f) ? f.slice(1).split('').map(c => '-' + c) : [f]);
    return flags.every(f => hp.includes(f) || subHelp.includes(f)); });
  ok('the options each task needs appear in that command\'s help text (' + optsFound.length + ' of ' + tasks.length + ')', optsFound.length === tasks.length);
  if(optsFound.length !== tasks.length) console.log(tasks.filter(t => !optsFound.includes(t)).map(t => t.ex));
  H.showCliSection('helpd');
  document.getElementById('helpd-plat').value = 'linux'; document.getElementById('helpd-count').value = '5';
  H.startHelpDrill(false);
  const D = H.getHelpDrill();
  ok('drill starts with the chosen platform and count', D && D.qs.length === 5 && D.qs.every(t => t.plat === 'linux'));
  const t0 = D.qs[0];
  H.helpDrillSubmit('help'); H.helpDrillSubmit(base(t0.ex) + ' --help');
  ok('drill: help lookups are free (no tries used)', D.cur.tries === 0 && D.cur.helps === 2 && /help-out|OPTIONS/.test(document.getElementById('helpd-area').innerHTML));
  H.helpDrillSubmit(t0.ex);
  ok('drill: a correct command after lookups counts as first try and is saved', D.cur.done && D.cur.ok && H.getHelpDrillData().items[t0.id].firstTry === true && JSON.parse(localStorage.getItem('cybersec_helpdrill_v1')).items[t0.id].right === 1);
  D.idx++; D.cur = { lines: [], tries: 0, helps: 0, done: false, ok: false, wrong: null };
  const t1 = D.qs[1]; H.helpDrillSubmit('echo nope'); H.helpDrillSubmit('echo again');
  ok('drill: wrong commands count as tries and offer Show me after two', D.cur.tries === 2 && /helpd-show/.test(document.getElementById('helpd-area').innerHTML));
  H.helpDrillFinishTask(false); H.finishHelpDrill();
  ok('drill results and history saved; missed task available for Missed only', /Drill complete: 1 \/ 2 solved, 1 on the first try/.test(document.getElementById('helpd-area').innerHTML) && H.getHelpDrillData().hist.length === 1 && H.getHelpDrillData().items[t1.id].lastOk === false);
  H.startHelpDrill(true);
  ok('Missed only runs just the missed task', H.getHelpDrill().qs.length === 1 && H.getHelpDrill().qs[0].id === t1.id);
  ok('Backup/Restore includes the drill progress', H.BACKUP_KEYS.includes('cybersec_helpdrill_v1'));
  const html = require('fs').readFileSync(process.argv[2] || require('path').join(__dirname, '..', 'index.html'), 'utf8');
  const s0 = html.indexOf('\n<script>\n');
  ok('app script intact (nothing closes it early)', html.indexOf('</script>', s0) === html.indexOf('\n</script>', s0) + 1);
}catch(err){ errors.push('drive: ' + err.message + ' ' + (err.stack || '').split('\n').slice(1, 3).join(' ')); }
ok('no script errors', errors.length === 0);
if(errors.length) console.log(errors);
let failed = 0; checks.forEach(([n, p]) => { console.log((p ? '  ok   ' : '  FAIL ') + n); if(!p) failed++; });
console.log(`${checks.length - failed} passed, ${failed} failed`); process.exit(failed ? 1 : 0);
