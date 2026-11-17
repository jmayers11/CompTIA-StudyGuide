/* Automated tests for Security+ Command-Line Mastery (grading, spaced repetition, sessions, PBQ priority).
   Run:  node tests/cli-mastery.test.js [path/to/index.html]   (Node 18+, no packages) */
const fs = require('fs'), path = require('path');
const htmlPath = process.argv[2] || path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');
function between(a, b){ const i = html.indexOf(a), j = html.indexOf(b, i); if(i < 0 || j < 0) throw new Error('marker missing: ' + a); return html.slice(i, j + b.length); }
const createCliTrainer = new Function(between('/* CLI_TRAINER_START */', '/* CLI_TRAINER_END */') + '; return createCliTrainer;')();
const CLI_COMMANDS = new Function(between('/* CLI_DATA_START */', '/* CLI_DATA_END */') + '; return CLI_COMMANDS;')();
const sm2Src = html.slice(html.indexOf('  function sm2NextState('), html.indexOf('  function fcNextState('));
let clock = Date.UTC(2026, 10, 17, 9, 0, 0);
const sm2 = new Function('Date', sm2Src + '; return sm2NextState;')({ now: () => clock });
let failures = 0, passes = 0;
function check(name, cond, detail){ if(cond) passes++; else { failures++; console.log('  FAIL ' + name + (detail ? ' — ' + detail : '')); } }
function memStore(){ const m = {}; return { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); return true; } }; }
function seeded(seed){ return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }
const make = (store, seed) => createCliTrainer({ getItem: store.getItem, setItem: store.setItem, sm2, commands: CLI_COMMANDS, now: () => clock, random: seeded(seed || 1) });

console.log('Command-Line Mastery tests — ' + path.basename(htmlPath));
const t = make(memStore());

// 1. Dataset integrity
const requested = ['ipconfig','ipconfig /all','ipconfig /flushdns','ping','tracert','nslookup','netstat','netstat -ano','whoami','whoami /priv','arp -a','route print','net user','net localgroup','gpresult','sfc /scannow','tasklist',
  'ip addr','ip route','ping','traceroute','dig','nslookup','ss','netstat','grep','cat','tail','chmod','chown','ps','top','systemctl','journalctl','tcpdump','nmap','curl','openssl'];
const missing = requested.filter(r => !CLI_COMMANDS.some(c => c.cmd === r || c.cmd.startsWith(r + ' ') || c.cmd.split(' ')[0] === r.split(' ')[0] && r.indexOf(' ') < 0 || c.cmd.startsWith(r)));
check('every requested command is covered', missing.length === 0, missing.join(', '));
check('ids are unique', new Set(CLI_COMMANDS.map(c => c.id)).size === CLI_COMMANDS.length);
check('every command has platform, purpose, accepted answers and an expected example', CLI_COMMANDS.every(c => (c.plat === 'windows' || c.plat === 'linux') && c.what && c.accept && c.accept.length && c.ex));
check('every expected example is accepted by its own allowlist', CLI_COMMANDS.every(c => t.gradeCommand(c, c.ex)), CLI_COMMANDS.filter(c => !t.gradeCommand(c, c.ex)).map(c => c.id).join(','));
check('both platforms present (Windows >= 17, Linux >= 21)', CLI_COMMANDS.filter(c => c.plat === 'windows').length >= 17 && CLI_COMMANDS.filter(c => c.plat === 'linux').length >= 21);

// 2. Typed-answer grading: valid variants accepted, wrong answers rejected
const cases = {
'win-ipconfig':[['ipconfig','IPCONFIG','C:\\Users\\jsmith> ipconfig'],['ipconfig /all','ifconfig']],
'win-ipconfig-all':[['ipconfig /all','ipconfig -all','IPCONFIG /ALL'],['ipconfig','ipconfig /a']],
'win-flushdns':[['ipconfig /flushdns'],['ipconfig /registerdns','ipconfig flushdns']],
'win-ping':[['ping 10.20.30.1','ping -n 4 10.20.30.1','ping -t 10.20.30.1'],['ping 10.20.30.2','ping -c 4 10.20.30.1']],
'win-tracert':[['tracert 8.8.8.8','tracert -d 8.8.8.8'],['traceroute 8.8.8.8']],
'win-nslookup':[['nslookup -type=mx example.com','nslookup -q=MX example.com'],['nslookup example.com','dig example.com mx']],
'win-netstat':[['netstat'],['netstat -ano']],
'win-netstat-ano':[['netstat -ano','netstat -nao','netstat -a -n -o','NETSTAT -ANO','netstat -oan'],['netstat -an','netstat -anob','netstat -aano']],
'win-whoami':[['whoami'],['whoami /priv']],
'win-whoami-priv':[['whoami /priv','whoami -priv'],['whoami /all','whoami']],
'win-arp':[['arp -a','arp -g'],['arp -d']],
'win-route-print':[['route print','netstat -r'],['route add']],
'win-net-user':[['net user'],['net users','net localgroup']],
'win-net-localgroup':[['net localgroup administrators','NET LOCALGROUP Administrators'],['net localgroup','net user administrators']],
'win-gpresult':[['gpresult /r','gpresult /z','gpresult /scope computer /r'],['gpupdate /force']],
'win-sfc':[['sfc /scannow'],['sfc /verifyonly','chkdsk']],
'win-tasklist':[['tasklist','tasklist /fi "PID eq 4412"',"tasklist /FI 'pid eq 4412'"],['tasklist /fi "PID eq 4413"','taskkill /pid 4412']],
'lin-ip-addr':[['ip addr','ip a','ip address show','sudo ip addr show eth0'],['ifconfig','ip route']],
'lin-ip-route':[['ip route','ip r','ip route show'],['route print','ip addr']],
'lin-ping':[['ping -c 4 8.8.8.8','ping -c4 8.8.8.8','ping 8.8.8.8 -c 4'],['ping -n 4 8.8.8.8','ping 8.8.8.8']],
'lin-traceroute':[['traceroute 8.8.8.8','traceroute -n 8.8.8.8','sudo traceroute -n 8.8.8.8'],['tracert 8.8.8.8']],
'lin-dig':[['dig example.com TXT','dig txt example.com','dig +short example.com txt'],['dig example.com mx','nslookup example.com']],
'lin-nslookup':[['nslookup 8.8.8.8','dig -x 8.8.8.8','host 8.8.8.8'],['nslookup dns.google']],
'lin-ss':[['ss -tulpn','ss -tlnpu','sudo ss -tulpn','ss -t -u -l -p -n','ss -tlpn'],['ss -tuln','ss -a','netstat -tulpn']],
'lin-netstat':[['netstat -tulpn','sudo netstat -plntu'],['netstat -ano','ss -tulpn']],
'lin-grep':[['grep "Failed password" /var/log/auth.log',"grep 'Failed password' /var/log/auth.log",'grep -i "failed password" /var/log/auth.log','sudo grep Failed /var/log/auth.log'],['grep "Accepted" /var/log/auth.log','cat /var/log/auth.log']],
'lin-cat':[['cat /etc/passwd','sudo cat /etc/passwd','getent passwd'],['cat /etc/shadow']],
'lin-tail':[['tail -f /var/log/auth.log','tail -n 50 -f /var/log/auth.log','sudo tail -F /var/log/auth.log'],['tail /var/log/auth.log','head -f /var/log/auth.log']],
'lin-chmod':[['chmod 640 payroll.csv','chmod 0640 payroll.csv','chmod u=rw,g=r,o= payroll.csv'],['chmod 644 payroll.csv','chmod 777 payroll.csv']],
'lin-chown':[['chown alice:finance report.txt','sudo chown alice:finance report.txt'],['chmod alice:finance report.txt','chown finance:alice report.txt']],
'lin-ps':[['ps aux','ps -ef','sudo ps aux'],['ps','top']],
'lin-top':[['top','htop'],['ps aux']],
'lin-systemctl':[['sudo systemctl disable --now vsftpd','systemctl disable --now vsftpd.service','systemctl --now disable vsftpd'],['systemctl stop vsftpd','systemctl disable vsftpd']],
'lin-journalctl':[['journalctl -u sshd','journalctl -u ssh.service','sudo journalctl --unit=sshd','journalctl -usshd'],['journalctl','journalctl -f']],
'lin-tcpdump':[['tcpdump -i eth0 port 53','sudo tcpdump -i eth0 udp port 53','sudo tcpdump -nn -i eth0 port 53','tcpdump -i eth0 -w dns.pcap port 53'],['tcpdump port 53','tcpdump -i eth1 port 53']],
'lin-nmap':[['nmap -sV 10.0.0.5','sudo nmap -sV -p- 10.0.0.5','nmap -A 10.0.0.5'],['nmap -sv 10.0.0.5','nmap -sn 10.0.0.5','nmap 10.0.0.5']],
'lin-curl':[['curl -I https://intranet.example.com','curl --head https://intranet.example.com/'],['curl -i https://intranet.example.com','curl https://intranet.example.com']],
'win-certutil-hash':[['certutil -hashfile patch.iso SHA256','CertUtil -HashFile patch.iso sha256','Get-FileHash .\\patch.iso','get-filehash patch.iso -Algorithm SHA256'],['certutil -hashfile patch.iso MD5','sha256sum patch.iso']],
'win-icacls':[['icacls C:\\Finance','icacls "C:\\Finance"','ICACLS c:\\finance\\'],['icacls C:\\HR','cacls C:\\Finance']],
'lin-sha256sum':[['sha256sum patch.iso'],['md5sum patch.iso','sha1sum patch.iso']],
'lin-usermod-lock':[['usermod -L jsmith','sudo usermod -L jsmith','sudo passwd -l jsmith'],['usermod -l jsmith','userdel jsmith']],
'lin-ufw':[['ufw status','sudo ufw status verbose'],['ufw enable']],
'lin-openssl':[['openssl s_client -connect mail.example.com:443','openssl s_client -connect mail.example.com:443 -servername mail.example.com','openssl s_client -showcerts -connect mail.example.com:443'],['openssl x509 -in cert.pem','openssl s_client -connect mail.example.com:25']],
};
let gradeProblems = [];
CLI_COMMANDS.forEach(c => { const k = cases[c.id]; if(!k){ gradeProblems.push('no cases: ' + c.id); return; }
  k[0].forEach(x => { if(!t.gradeCommand(c, x)) gradeProblems.push('rejected valid ' + c.id + ': ' + x); });
  k[1].forEach(x => { if(t.gradeCommand(c, x)) gradeProblems.push('accepted wrong ' + c.id + ': ' + x); });
  if(c.comp) c.comp.ans.forEach(a => { if(!t.gradeCompletion(c, a.flags || a)) gradeProblems.push('completion rejects ' + c.id); });
});
check('grading allowlists (' + Object.values(cases).reduce((s, k) => s + k[0].length + k[1].length, 0) + ' cases)', gradeProblems.length === 0, gradeProblems.slice(0, 5).join(' | '));
const byId = id => CLI_COMMANDS.find(c => c.id === id);
check('completion: flag order free (netstat -oan)', t.gradeCompletion(byId('win-netstat-ano'), 'oan'));
check('completion: Linux flags are case-sensitive (nmap -sv rejected)', !t.gradeCompletion(byId('lin-nmap'), 'v') && t.gradeCompletion(byId('lin-nmap'), 'V'));
check('pasted prompts and smart quotes are tolerated', t.gradeCommand(byId('win-netstat-ano'), 'C:\\Users\\a> netstat -ano') && t.gradeCommand(byId('lin-grep'), '$ grep \u201cFailed password\u201d /var/log/auth.log'));
check('nothing is executed: grader is pure string matching', !/eval\(|Function\(|child_process|exec\(/.test(between('/* CLI_TRAINER_START */', '/* CLI_TRAINER_END */')));

const recog = [['lin-grep','grep',true],['win-netstat-ano','netstat -nao',true],['win-netstat-ano','netstat -an',false],['lin-ss','ss -tlnpu',true],['lin-ping','ping -c 4 8.8.8.8',true],['lin-ping','ping',false],['win-ipconfig-all','IPCONFIG /ALL',true],['lin-nmap','nmap -sV',true],['lin-nmap','nmap -sn',false],['lin-openssl','openssl s_client',true],['win-tracert','traceroute',false]];
check('recognition mode accepts the bare command (and rejects near-misses)', recog.every(([id, x, exp]) => t.gradeRecognition(byId(id), x) === exp), recog.filter(([id, x, exp]) => t.gradeRecognition(byId(id), x) !== exp).map(r => r[1]).join(', '));
check('every command\'s own name passes its recognition card', CLI_COMMANDS.every(c => t.gradeRecognition(c, c.cmd)));

// 3. Cards and modes
const cards = t.cardsFor({});
check('five modes exist and every command has at least 3 card types', ['A','B','C','D','E'].every(m => cards.some(c => c.mode === m)) && CLI_COMMANDS.every(c => t.modesFor(c).length >= 3));
check('filters work (Windows only, core only, single mode)', t.cardsFor({ plat: 'windows' }).every(c => c.cmd.plat === 'windows') && t.cardsFor({ coreOnly: true }).every(c => c.cmd.core) && t.cardsFor({ mode: 'D' }).every(c => c.mode === 'D'));

// 4. Spaced repetition + tracking
(() => {
  const store = memStore(); let tr = make(store, 3);
  const card = tr.cardsFor({ mode: 'A' }).find(c => c.cmd.id === 'win-netstat-ano');
  const s1 = tr.review(card, 'know', true);
  check('"I Know This" schedules the card into the future', s1.due > clock && s1.streak === 1);
  const s2 = tr.review(card, 'dk', false);
  check('"Didn\'t Know" brings it back within ~10 minutes and resets the streak', s2.due - clock <= 10 * 60000 + 1000 && s2.streak === 0 && s2.wrong === 1);
  tr.review(card, 'struggled', true);
  const st = tr.commandStatus(byId('win-netstat-ano'));
  check('per-command accuracy, streak and last review are tracked', st.accuracy !== null && Math.abs(st.accuracy - 2 / 3) < 1e-9 && st.streak === 1 && st.last === clock);
  // mastery: answer every card of one command correctly over spaced days
  const cmd = byId('lin-ss');
  for(let round = 0; round < 4; round++){ tr.cardsFor({}).filter(c => c.cmd.id === 'lin-ss').forEach(c => tr.review(c, 'know', true)); clock += 30 * 86400000; }
  check('consistent recall over time marks a command mastered', tr.commandStatus(cmd).status === 'mastered', tr.commandStatus(cmd).status);
  tr = make(store, 4);
  check('progress persists across a restart', tr.commandStatus(cmd).status === 'mastered' && tr.commandStatus(byId('win-netstat-ano')).accuracy !== null);
  // due logic
  const sess = tr.buildSession({ plat: 'linux', coreOnly: true, mode: 'mixed' }, 20);
  check('session size capped and filter respected', sess.length === 20 && sess.every(c => c.cmd.plat === 'linux' && c.cmd.core));
  check('no duplicate cards in a session', new Set(sess.map(c => c.key)).size === sess.length);
  let adj = 0; for(let i = 1; i < sess.length; i++) if(sess[i].cmd.id === sess[i-1].cmd.id) adj++;
  check('same command rarely back-to-back', adj <= 2, adj + ' adjacent repeats');
})();

// 5. PBQ misses raise priority
(() => {
  const store = memStore(); const tr = make(store, 9);
  const mapped = tr.recordPbqResult('netstat -ano', false);
  check('a missed CLI PBQ maps to its command', mapped === 'win-netstat-ano');
  check('unrelated PBQ answers do not map to a wrong command', tr.recordPbqResult('net accounts', false) === null && tr.recordPbqResult('sourcetype=auth action=failure', false) === null);
  const sess = tr.buildSession({ plat: 'all', mode: 'mixed', pbqPriority: true }, 10);
  check('missed-in-PBQ command cards come first', sess.length && sess[0].cmd.id === 'win-netstat-ano');
  check('command is flagged as needing work', tr.commandStatus(byId('win-netstat-ano')).status === 'struggling' || tr.commandStatus(byId('win-netstat-ano')).status === 'new');
  const off = tr.buildSession({ plat: 'linux', mode: 'mixed', pbqPriority: true }, 10);
  check('PBQ priority still respects the platform filter', off.every(c => c.cmd.plat === 'linux'));
  // every existing Security+ CLI PBQ that names a known command maps correctly
  const pbqs = (() => { const c = html, i = c.indexOf('const PBQ_BANK = ['); return c.slice(i, c.indexOf('\n  ];', i)); })();
  const examples = [...pbqs.matchAll(/example:'([^']+)'/g)].map(m => m[1]);
  const wrongMaps = examples.map(e => [e, tr.commandForExample(e)]).filter(([e, c]) => c && !tr.gradeCommand(c, e) && c.cmd.split(' ').length > 1 && e.split(' ')[1] !== c.cmd.split(' ')[1]);
  check('PBQ-to-command mapping has no mismatches', wrongMaps.length === 0, wrongMaps.map(w => w[0]).join(', '));
})();

console.log(`\n${passes} passed, ${failures} failed`);
process.exit(failures ? 1 : 0);
