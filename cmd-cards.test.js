/* Command flashcards test: extracts CMD_CARDS and createCmdCardEngine from index.html and checks the
   card data rules, typed-answer acceptance (equivalent syntax only), the Got It / Almost / Missed It
   scheduling, missed-first ordering, Review missed only, and PBQ-miss priority.
   Run:  node tests/cmd-cards.test.js [path/to/index.html] */
const fs = require('fs');
const html = fs.readFileSync(process.argv[2] || require('path').join(__dirname, '..', 'index.html'), 'utf8');
const grab = (a, b) => html.slice(html.indexOf(a), html.indexOf(b));
const sm2src = html.slice(html.indexOf('function sm2NextState'), html.indexOf('\n  }\n', html.indexOf('function sm2NextState')) + 4);
const lib = new Function(grab('/* CMD_CARDS_START */', '/* CMD_CARDS_END */') + grab('/* CMD_CARD_ENGINE_START */', '/* CMD_CARD_ENGINE_END */') + sm2src +
  '; return { CMD_CARDS, CMD_CARD_CATS, createCmdCardEngine, sm2NextState };')();
const { CMD_CARDS, CMD_CARD_CATS, createCmdCardEngine, sm2NextState } = lib;
let clock = 1e12, store = {};
const mk = () => createCmdCardEngine({ getItem: k => store[k] || null, setItem: (k, v) => { store[k] = v; }, now: () => clock, sm2: sm2NextState, cards: CMD_CARDS, random: () => 0.5 });
const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const E = mk();
const card = id => CMD_CARDS.find(c => c.id === id);

// data rules
const cats = new Set(CMD_CARD_CATS.map(c => c.key));
ok('every card has a front description, a command, a category and a platform', CMD_CARDS.every(c => c.desc && c.cmd && cats.has(c.cat) && ['windows', 'linux', 'powershell'].includes(c.plat)));
ok('the front never contains the command', CMD_CARDS.every(c => !c.desc.toLowerCase().includes(c.cmd.toLowerCase())));
ok('every card whose command has options or arguments explains them', CMD_CARDS.every(c => c.cmd.split(' ').length === 1 || (c.flags || []).length > 0));
ok('the front never names the command itself (whole word)', CMD_CARDS.every(c => !new RegExp('\\b' + c.cmd.split(' ')[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(c.desc)));
ok('every card has a short explanation', CMD_CARDS.every(c => c.about && c.about.length > 20));
ok('alternatives use only the three kinds, and every listed command names its platform', CMD_CARDS.every(c => (c.alts || []).every(a => ['equivalent', 'different', 'none'].includes(a.kind) && (a.kind === 'none' || (a.cmd && a.plat)))));
ok('ids are unique', new Set(CMD_CARDS.map(c => c.id)).size === CMD_CARDS.length);
ok('every card accepts its own command when typed', CMD_CARDS.every(c => E.check(c, c.cmd)));
ok('every "equivalent syntax" alternative is accepted when typed', CMD_CARDS.every(c => (c.alts || []).filter(a => a.kind === 'equivalent').every(a => E.check(c, a.cmd))));
ok('no "different command" alternative is accepted as the answer', CMD_CARDS.every(c => (c.alts || []).filter(a => a.kind === 'different').every(a => !E.check(c, a.cmd))));

ok('deck covers every command named in the spec', ['ipconfig','ping','tracert','nslookup','netstat','arp','route','whoami','net','tasklist','gpresult','ip','ss','traceroute','dig','tcpdump','chmod','chown','grep','ps','journalctl','nmap','openssl','curl'].every(b => CMD_CARDS.some(c => c.cmd.split(' ')[0] === b)));
ok('five categories, each with cards', CMD_CARD_CATS.length === 5 && CMD_CARD_CATS.every(k => CMD_CARDS.some(c => c.cat === k.key)));
// typed acceptance, sample cards
const n = card('win-netstat-ano'), f = card('win-flushdns'), s = card('lin-ss-tuln');
ok('netstat: -ano, -a -n -o and -nao accepted', ['netstat -ano', 'netstat -a -n -o', 'netstat -nao', 'NETSTAT -ano', 'C:\\> netstat -ano'].every(x => E.check(n, x)));
ok('netstat: missing or extra options rejected (-an, -anob, -ano -a)', ['netstat -an', 'netstat -anob', 'netstat -ano -a', 'netstat', 'Get-NetTCPConnection'].every(x => !E.check(n, x)));
ok('flushdns: case-insensitive, other ipconfig options rejected', E.check(f, 'ipconfig /flushdns') && E.check(f, 'IPCONFIG /FlushDNS') && !E.check(f, 'ipconfig /displaydns') && !E.check(f, 'ipconfig') && !E.check(f, 'Clear-DnsClientCache'));
ok('ss: short, separate, reordered, long and mixed forms accepted', ['ss -tuln', 'ss -t -u -l -n', 'ss -lntu', 'ss --tcp --udp --listening --numeric', 'ss --numeric -tu --listening', 'sudo ss -tuln', '$ ss -tuln'].every(x => E.check(s, x)));
ok('ss: case matters on Linux; -tulpn, netstat -tuln and unknown long options rejected', ['SS -tuln', 'ss -TULN', 'ss -tulpn', 'netstat -tuln', 'ss --tcp --udp --listen --numeric', 'ss -tuln -t'].every(x => !E.check(s, x)));

// typed acceptance, rest of the deck (spot checks)
const C2 = id => card(id);
const yes = (id, xs) => xs.every(x => E.check(C2(id), x)), no = (id, xs) => xs.every(x => !E.check(C2(id), x));
ok('ipconfig /all: case-insensitive; other switches rejected', yes('win-ipconfig-all', ['ipconfig /all', 'IPCONFIG /ALL']) && no('win-ipconfig-all', ['ipconfig', 'ipconfig /renew']));
ok('ping/tracert/nslookup accept any target, need the right options', yes('win-ping', ['ping 8.8.8.8', 'Ping example.com']) && yes('win-ping-t', ['ping -t 10.0.0.1', 'ping 10.0.0.1 -t']) && no('win-ping-t', ['ping 10.0.0.1']) && yes('win-tracert-d', ['tracert -d 8.8.8.8']) && no('win-tracert', ['traceroute 8.8.8.8']));
ok('nslookup MX: -type and -querytype accepted; dig rejected', yes('win-nslookup-mx', ['nslookup -type=mx example.com', 'nslookup -querytype=MX example.com']) && no('win-nslookup-mx', ['dig example.com MX', 'nslookup example.com']));
ok('arp -a and arp -g accepted; arp -d * is its own card', yes('win-arp', ['arp -a', 'arp -g']) && no('win-arp', ['arp -d *']) && yes('win-arp-d', ['arp -d *']));
ok('net user / localgroup variants', yes('win-net-user-disable', ['net user jsmith /active:no', 'NET USER jsmith /ACTIVE:NO']) && no('win-net-user-disable', ['net user jsmith /delete']) && yes('win-net-localgroup-del', ['net localgroup administrators support_tmp /delete']));
ok('tasklist filter and gpresult report', yes('win-tasklist-fi', ['tasklist /fi "PID eq 4412"']) && yes('win-gpresult-h', ['gpresult /h report.html', 'gpresult /h report.html /f']) && no('win-gpresult', ['gpresult /z']));
ok('ip abbreviations accepted; ifconfig rejected', yes('lin-ip-addr', ['ip a', 'ip addr', 'ip address', 'ip addr show']) && no('lin-ip-addr', ['ifconfig', 'ip route']) && yes('lin-ip-neigh', ['ip neigh', 'ip neighbor', 'ip n']));
ok('ss -tulpn long form accepted; -tuln rejected for the -p card', yes('lin-ss', ['sudo ss -tulpn', 'ss --tcp --udp --listening --processes --numeric']) && no('lin-ss', ['ss -tuln']));
ok('dig variants', yes('lin-dig-mx', ['dig example.com MX', 'dig -t MX example.com', 'dig MX example.com']) && yes('lin-dig-x', ['dig -x 8.8.8.8']) && yes('lin-dig-short', ['dig +short example.com']) && no('lin-dig', ['nslookup example.com']));
ok('tcpdump variants', yes('lin-tcpdump', ['sudo tcpdump -i eth0', 'tcpdump --interface=eth0']) && yes('lin-tcpdump-port', ['tcpdump -i eth0 port 53', 'sudo tcpdump -nn -i eth0 udp port 53']) && yes('lin-tcpdump-w', ['tcpdump -i eth0 -w cap.pcap']) && yes('lin-tcpdump-r', ['tcpdump -r cap.pcap']));
ok('chmod numeric and symbolic equivalents', yes('lin-chmod-640', ['chmod 640 /etc/shadow', 'chmod 0640 /etc/shadow', 'chmod u=rw,g=r,o= /etc/shadow']) && no('lin-chmod-640', ['chmod 644 /etc/shadow', 'chmod 600 /etc/shadow']) && yes('lin-chmod-600', ['chmod 600 id_rsa']) && no('lin-chmod-x', ['chmod a+x run.sh']));
ok('chown, grep and journalctl long forms', yes('lin-chown-r', ['chown -R www-data:www-data /var/www', 'chown --recursive www-data:www-data /var/www']) && yes('lin-grep-i', ['grep -i "failed" auth.log', 'grep --ignore-case error app.log']) && yes('lin-journalctl-u', ['journalctl -u sshd', 'journalctl --unit=sshd']) && yes('lin-journalctl-p', ['journalctl -p err', 'journalctl -p 3', 'journalctl --priority=err']));
ok('ps aux vs ps -ef are separate cards', yes('lin-ps', ['ps aux']) && no('lin-ps', ['ps -ef']) && yes('lin-ps-ef', ['ps -ef', 'ps -e -f']));
ok('nmap options in either position; wrong scan types rejected', yes('lin-nmap', ['nmap -sV 10.0.0.5', 'nmap 10.0.0.5 -sV']) && no('lin-nmap', ['nmap -sS 10.0.0.5']) && yes('lin-nmap-p-all', ['nmap -p- 10.0.0.5', 'nmap -p 1-65535 10.0.0.5']) && yes('lin-nmap-a', ['sudo nmap -A 10.0.0.5']));
ok('openssl and curl variants', yes('lin-openssl', ['openssl s_client -connect mail.example.com:443', 'openssl s_client -connect mail.example.com:443 -servername mail.example.com']) && yes('lin-openssl-x509', ['openssl x509 -in cert.pem -noout -text']) && yes('lin-curl', ['curl -I https://example.com', 'curl --head https://example.com']) && yes('lin-curl-k', ['curl --insecure https://test.local']) && no('lin-curl', ['curl -v https://example.com']));

// scheduling + statuses
ok('all cards start as not started', E.summary({}).fresh === CMD_CARDS.length && E.status(n.id) === 'new');
E.rate(n.id, 'missed');
ok('Missed It: command needs review and is due again within minutes', E.status(n.id) === 'review' && E.raw().c[n.id].due - clock <= 15 * 60000);
E.rate(f.id, 'almost');
ok('Almost: command is still being learned, due in about a day', E.status(f.id) === 'learning' && Math.round((E.raw().c[f.id].due - clock) / 86400000) === 1);
E.rate(s.id, 'got');
ok('Got It: due later, still learning after one success', E.status(s.id) === 'learning' && E.raw().c[s.id].due - clock >= 86400000);
let sess = E.buildSession({}, 20);
ok('a session puts missed commands first', sess[0].id === n.id);
ok('Review missed only returns missed (and Almost) commands, not ones you got', (() => { const m = E.buildSession({ missedOnly: true }, 20).map(c => c.id); return m[0] === n.id && m.includes(f.id) && !m.includes(s.id); })());
ok('category filter limits the session', E.buildSession({ cat: 'lin-net' }, 20).every(c => c.cat === 'lin-net'));
// mastery: three Got Its spaced out
for(let i = 0; i < 4; i++){ clock += 30 * 86400000; E.rate(s.id, 'got'); }
ok('repeated Got It over weeks marks the command mastered', E.status(s.id) === 'mastered' && E.summary({}).mastered === 1);
clock += 400 * 86400000;
ok('a mastered command that becomes due goes back to review', E.status(s.id) === 'review');
// persistence + PBQ priority
const E2 = mk();
ok('progress persists across a restart', E2.status(n.id) === 'review' && E2.raw().c[s.id].got === 5);
E2.rate(n.id, 'got'); clock += 1000;
E2.recordPbqResult('netstat -nao', false);
ok('a missed PBQ that used this command puts it back into review first', E2.status(n.id) === 'review' && E2.buildSession({}, 20)[0].id === n.id);
ok('PBQ answers for commands not in the deck are ignored', E2.recordPbqResult('robocopy C:\\a D:\\b', false) === null);
E2.pref('dir', 'c2d');
ok('direction and options are remembered', mk().pref('dir') === 'c2d');

// migration from the old trainer
const legacy = JSON.stringify({ cards: { 'win-netstat-ano|A': { interval: 6, ease: 2.6, reps: 3, due: clock + 5 * 86400000, streak: 3 }, 'win-netstat-ano|B': { interval: 3, ease: 2.4, reps: 2, due: clock + 2 * 86400000 } },
  cmds: { 'win-netstat-ano': { right: 7, wrong: 1, streak: 3, best: 3, last: clock - 1000 }, 'win-sfc': { right: 2, wrong: 0, streak: 2, last: clock } }, pbq: { 'win-flushdns': { missed: 1, passed: 0, lastMiss: clock } } });
const st3 = {}; const M = createCmdCardEngine({ getItem: k => st3[k] || null, setItem: (k, v) => { st3[k] = v; }, now: () => clock, sm2: sm2NextState, cards: CMD_CARDS, legacy });
const mg = M.raw().c['win-netstat-ano'];
ok('old progress carries over for matching commands (history, interval, earliest due)', mg && mg.got === 7 && mg.missed === 1 && mg.interval === 6 && mg.due === clock + 2 * 86400000 && mg.lastRating === 'got');
ok('commands no longer in the deck are skipped; PBQ misses carry over', !M.raw().c['win-sfc'] && M.status('win-flushdns') === 'review');
const M2 = createCmdCardEngine({ getItem: k => st3[k] || null, setItem: (k, v) => { st3[k] = v; }, now: () => clock, sm2: sm2NextState, cards: CMD_CARDS, legacy: JSON.stringify({ cmds: { 'win-ping': { right: 9, wrong: 0, streak: 9 } } }) });
ok('migration runs only once', !M2.raw().c['win-ping']);

let failed = 0;
checks.forEach(([name, pass]) => { console.log((pass ? '  ok   ' : '  FAIL ') + name); if(!pass) failed++; });
console.log(`${checks.length - failed} passed, ${failed} failed`); process.exit(failed ? 1 : 0);
