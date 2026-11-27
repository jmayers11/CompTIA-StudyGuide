/* CySA+ CS0-004 bank quality test: checks the 828 rewritten CySA+ pool questions (rev "2026-11-cs4").
   - every item has a valid CS0-004 objective tag whose domain matches the item's domain
   - options are unique, 4+ per item, correct index/indices are valid, multi-select counts match the stem
   - explanations are present and substantive
   - correct answer is not systematically the longest option, and the length ratio stays in range
   - domain split stays close to the official weights (34/26/24/16)
   - no raw "</" sequences that could close the page's <script> early
   Run:  node tests/cysa-bank-quality.test.js [path/to/index.html] */
const fs = require('fs');
const html = fs.readFileSync(process.argv[2] || require('path').join(__dirname, '..', 'index.html'), 'utf8');
let pass = 0, fail = 0;
function check(name, ok, info){ if(ok){ pass++; } else { fail++; console.log('FAIL', name, info === undefined ? '' : info); } }

const items = [];
const S = '"(?:[^"\\\\]|\\\\.)*"';
const re = new RegExp('\\{ domain:"(secops|vulnmgmt|ir_mgmt|reporting)", question:' + S + ', options:\\[(?:' + S + ',?)+\\], correct:\\[[0-9,]+\\], why:' + S + ', oid:' + S + ', rev:"2026-11-cs4", obj:"[0-9.]+"(?:, src:' + S + ')? \\}', 'g');
let m;
while((m = re.exec(html))){ try { items.push(eval('(' + m[0] + ')')); } catch(e){ check('item parses', false, m[0].slice(0, 80)); } }
check('828 rewritten CySA+ items found', items.length === 828, items.length);
check('oids unique', new Set(items.map(q => q.oid)).size === items.length);

const OBJ = ['1.1','1.2','1.3','1.4','1.5','1.6','2.1','2.2','2.3','2.4','3.1','3.2','3.3','4.1','4.2'];
const DOM = { '1':'secops', '2':'vulnmgmt', '3':'ir_mgmt', '4':'reporting' };
const W = s => (String(s).match(/\S+/g) || []).length;
let badObj = 0, badDom = 0, badOpts = 0, badCorrect = 0, badMulti = 0, shortWhy = 0, longest = 0, single = 0, ratios = [];
const byObj = {}, byDom = {};
items.forEach(q => {
  if(!OBJ.includes(q.obj)) badObj++;
  if(DOM[q.obj[0]] !== q.domain) badDom++;
  byObj[q.obj] = (byObj[q.obj] || 0) + 1; byDom[q.domain] = (byDom[q.domain] || 0) + 1;
  if(!Array.isArray(q.options) || q.options.length < 4 || new Set(q.options.map(o => o.toLowerCase())).size !== q.options.length) badOpts++;
  const cs = Array.isArray(q.correct) ? q.correct : [q.correct];
  const multi = cs.length > 1;
  if(cs.some(c => !Number.isInteger(c) || c < 0 || c >= q.options.length) || new Set(cs).size !== cs.length) badCorrect++;
  const want = /Select TWO/.test(q.question) ? 2 : /Select THREE/.test(q.question) ? 3 : 1;
  if(cs.length !== want) badMulti++;
  if(W(q.why) < 10) shortWhy++;
  if(!multi){
    single++;
    const k = cs[0], L = q.options.map(W), c = L[k], others = L.filter((_, i) => i !== k);
    if(c === Math.max(...L) && L.filter(x => x === c).length === 1) longest++;
    ratios.push(c / (others.reduce((a, b) => a + b, 0) / others.length));
  }
});
check('every item has a CS0-004 objective', badObj === 0, badObj);
check('objective matches item domain', badDom === 0, badDom);
check('4+ unique options per item', badOpts === 0, badOpts);
check('correct answers are valid indices', badCorrect === 0, badCorrect);
check('multi-select answer count matches stem', badMulti === 0, badMulti);
check('explanations have 10+ words', shortWhy === 0, shortWhy);
check('every objective has questions', OBJ.every(o => byObj[o] > 0), JSON.stringify(byObj));
const pctLongest = 100 * longest / single;
check('correct answer uniquely longest in <= 15% of items', pctLongest <= 15, pctLongest.toFixed(1));
const ratio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
check('correct/distractor length ratio within 0.90-1.10', ratio >= 0.90 && ratio <= 1.10, ratio.toFixed(2));
const multiCount = items.filter(q => [].concat(q.correct).length > 1).length;
check('bank includes multi-select items', multiCount >= 10, multiCount);
const W8 = { secops:34, vulnmgmt:26, ir_mgmt:24, reporting:16 };
Object.keys(W8).forEach(d => { const p = 100 * (byDom[d] || 0) / items.length; check('domain ' + d + ' within 3 points of weight', Math.abs(p - W8[d]) <= 3, p.toFixed(1)); });
// position balance after display shuffle isn't testable statically; check stored positions aren't all one slot
const pos = [0,0,0,0,0]; items.forEach(q => { const c = [].concat(q.correct); if(c.length === 1) pos[c[0]]++; });
check('stored correct positions spread across slots', Math.max(...pos.slice(0,4)) / single < 0.4, pos.join('/'));
// script safety
const s = html.indexOf('\n<script>\n'); const e = html.indexOf('</script>', s);
check('first </script> after main script is the real close', html.slice(e - 1, e) === '\n', html.slice(e - 40, e));
console.log('cysa-bank-quality: ' + pass + ' passed, ' + fail + ' failed');
console.log('  items ' + items.length + ', longest ' + pctLongest.toFixed(1) + '%, ratio ' + ratio.toFixed(2) + ', multi ' + multiCount + ', by objective ' + JSON.stringify(byObj));
process.exit(fail ? 1 : 0);
