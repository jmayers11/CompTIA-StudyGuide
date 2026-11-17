/* Automated tests for the Phase 3 Terminal Lab and terminal PBQs (grading, scoring, persistence).
   Run:  node tests/cli-lab.test.js [path/to/index.html]   (Node 18+, no packages) */
const fs = require('fs'), path = require('path');
const htmlPath = process.argv[2] || path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
function between(a, b){ const i = html.indexOf(a), j = html.indexOf(b, i); if(i < 0 || j < 0) throw new Error('marker missing: ' + a); return html.slice(i, j + b.length); }
const createCliTrainer = new Function(between('/* CLI_TRAINER_START */', '/* CLI_TRAINER_END */') + '; return createCliTrainer;')();
const createLabEngine = new Function(between('/* CLI_LAB_START */', '/* CLI_LAB_END */') + '; return createLabEngine;')();
const CLI_COMMANDS = new Function(between('/* CLI_DATA_START */', '/* CLI_DATA_END */') + '; return CLI_COMMANDS;')();
const CLI_LABS = new Function(between('/* CLI_LABS_START */', '/* CLI_LABS_END */') + '; return CLI_LABS;')();
let failures = 0, passes = 0;
function check(name, cond, detail){ if(cond) passes++; else { failures++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); } }
function memStore(){ const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); return true; } }; }
const trainer = createCliTrainer({ getItem: () => null, setItem: () => true, sm2: () => ({}), commands: CLI_COMMANDS });
let clock = 1000;
const make = store => createLabEngine({ getItem: store.getItem, setItem: store.setItem, grader: trainer, labs: CLI_LABS, now: () => clock });
console.log('Terminal Lab tests — ' + path.basename(htmlPath));
const E = make(memStore());

// 1. Dataset
const levels = ['beginner', 'intermediate', 'advanced'];
check('12+ labs across beginner, intermediate and advanced', CLI_LABS.length >= 12 && levels.every(l => CLI_LABS.filter(x => x.level === l).length >= 3));
check('both Windows and Linux labs exist', CLI_LABS.some(l => l.plat === 'windows') && CLI_LABS.some(l => l.plat === 'linux'));
check('every lab mixes typed commands and interpretation steps', CLI_LABS.every(l => l.steps.some(s => s.kind === 'cmd') && l.steps.some(s => s.kind === 'ask')));
check('every step has a hint and an explanation', CLI_LABS.every(l => l.steps.every(s => s.hint && s.explain)));
check('lab ids are unique', new Set(CLI_LABS.map(l => l.id)).size === CLI_LABS.length);

// 2. Expected answers pass; wrong answers fail with a reason
const problems = [];
CLI_LABS.forEach(l => l.steps.forEach((s, i) => {
  const exp = s.kind === 'cmd' ? s.ex : (s.answer.type === 'choice' ? s.answer.correct : s.answer.shown);
  if(!E.gradeStep(l, s, exp).ok) problems.push(`${l.id}#${i} expected answer rejected`);
  if(s.kind === 'cmd'){
    if(E.gradeStep(l, s, 'definitely-not-a-command').ok) problems.push(`${l.id}#${i} accepted junk`);
    if(!E.gradeStep(l, s, 'definitely-not-a-command').why) problems.push(`${l.id}#${i} no feedback on wrong command`);
    if(E.expected(l, s) !== s.ex) problems.push(`${l.id}#${i} expected() mismatch`);
  }else if(s.answer.type === 'choice'){
    if(E.gradeStep(l, s, (s.answer.correct + 1) % s.answer.options.length).ok) problems.push(`${l.id}#${i} wrong choice accepted`);
  }else if(E.gradeStep(l, s, '999.999').ok) problems.push(`${l.id}#${i} wrong text accepted`);
}));
check('every step: expected answer accepted, wrong answer rejected, feedback given', problems.length === 0, problems.slice(0, 5).join(' | '));

// 3. Multiple valid approaches and targeted feedback on common mistakes
const lab = id => CLI_LABS.find(l => l.id === id);
const i1 = lab('lab-i1-backdoor'), i2 = lab('lab-i2-bindshell'), a3 = lab('lab-a3-miner'), i3 = lab('lab-i3-bruteforce');
check('alternate valid commands accepted (netstat -nao, tasklist, Get-Process, ss/netstat, top)',
  E.gradeStep(i1, i1.steps[0], 'netstat -nao').ok && E.gradeStep(i1, i1.steps[2], 'tasklist').ok && E.gradeStep(i1, i1.steps[2], 'Get-Process -Id 4412').ok &&
  E.gradeStep(i2, i2.steps[0], 'sudo netstat -tulpn').ok && E.gradeStep(a3, a3.steps[0], 'top').ok);
check('targeted feedback for near-misses (netstat -an, ss -tuln, cat log, /var/log/secure)',
  /PID/.test(E.gradeStep(i1, i1.steps[0], 'netstat -an').why) && /-p/.test(E.gradeStep(i2, i2.steps[0], 'ss -tuln').why) &&
  /grep/.test(E.gradeStep(i3, i3.steps[0], 'cat /var/log/auth.log').why) && /Ubuntu/.test(E.gradeStep(i3, i3.steps[0], 'grep "Failed password" /var/log/secure').why));
check('platform rules respected (Linux syntax rejected on Windows lab and vice versa)', !E.gradeStep(i1, i1.steps[0], 'ss -tulpn').ok && !E.gradeStep(i2, i2.steps[0], 'netstat -ano').ok);

// 4. Scoring and persistence
(() => {
  const store = memStore(); let e = make(store);
  const L = lab('lab-b1-apipa');
  const r = e.record(L.id, [{ ok: true, tries: 1 }, { ok: true, tries: 2 }], 'practice', 1);
  check('scoring: first try = 1, retry = 0.5', r.points === 1.5 && Math.abs(r.score - 0.75) < 1e-9);
  e.record(L.id, [{ ok: true, tries: 1 }, { ok: true, tries: 1 }], 'exam', 0);
  e = make(store);
  const s = e.summary();
  check('best score, attempts and exam results persist across restart', s.completed === 1 && s.levels.beginner.find(x => x.lab.id === L.id).best === 1 && s.examAttempts === 1 && s.examCorrect === 1);
  check('lab results are stored separately from flashcards and MC exposure', e.KEY === 'cybersec_cli_lab_v1');
})();

// 5. Terminal PBQs reference real labs
const pbqSrc = html.slice(html.indexOf('const PBQ_BANK = ['), html.indexOf('\n  ];', html.indexOf('const PBQ_BANK = [')));
const termRefs = [...pbqSrc.matchAll(/"type": ?"terminal"[^}]*"lab": ?"([^"]+)"/g)].map(m => m[1]);
check('terminal PBQs exist for exams and every one points at a real lab', termRefs.length >= 8 && termRefs.every(id => CLI_LABS.some(l => l.id === id)), termRefs.join(','));
check('no hints in exam terminal PBQs (renderer has no hint control)', !/hint/i.test(html.slice(html.indexOf('function renderPBQTerminal'), html.indexOf('function renderPBQTerminal') + 3500).replace(/no hints/g, '')));

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
