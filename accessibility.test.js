/* Accessibility and small-screen checks (Phase 3, P11). Static checks on the shipped file; the viewport
   overflow audit itself was run in a real browser at 320/375/430/768/1024 px (see ACCESSIBILITY.md). */
const fs = require('fs');
const html = fs.readFileSync(process.argv[2] || require('path').join(__dirname, '..', 'index.html'), 'utf8');
const checks = []; const ok = (n, c) => checks.push([n, !!c]);
const lum = hx => { hx = hx.replace('#', ''); const [r, g, b] = [0, 2, 4].map(i => parseInt(hx.slice(i, i + 2), 16) / 255).map(c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const block = sel => { const i = html.indexOf(sel); return html.slice(i, html.indexOf('}', i)); };
const vars = b => { const o = {}; (b.match(/--([a-z]+):\s*(#[0-9a-fA-F]{6})/g) || []).forEach(m => { const [k, v] = m.replace('--', '').split(/:\s*/); o[k] = v; }); return o; };
const dark = vars(block(':root{')), light = vars(block('body.theme-light{'));
['text', 'muted', 'accent', 'danger', 'warn', 'good'].forEach(k => {
  ok(`dark theme ${k} text meets 4.5:1 on panels (${cr(dark[k], dark.panel).toFixed(2)})`, cr(dark[k], dark.panel) >= 4.5 && cr(dark[k], dark.bg) >= 4.5);
  ok(`light theme ${k} text meets 4.5:1 on panels (${cr(light[k], light.panel).toFixed(2)})`, cr(light[k], light.panel) >= 4.5 && cr(light[k], light.bg) >= 4.5);
});
ok('dark theme palette unchanged (visual identity)', dark.bg === '#0f1420' && dark.accent === '#4fd1c5' && dark.panel === '#161d2e');
ok('page language is set', /<html lang="en">/.test(html));
ok('viewport meta allows zoom (no user-scalable=no / maximum-scale=1)', /name="viewport"/.test(html) && !/user-scalable\s*=\s*no|maximum-scale\s*=\s*1[^.]/.test(html));
ok('skip link to main content', /<a class="skip-link" href="#main">/.test(html));
ok('main and navigation landmarks', /id="main" role="main"/.test(html) && /id="tab-bar" role="navigation" aria-label=/.test(html));
const ids = ['planner-exam-date','planner-days-per-week','planner-minutes-per-day','quiz-source-select','quiz-question-count','exam-cert-select','exam-source-select','exam-question-count','exam-time-limit','exam-policy-select','exam-pbq-count','exam-coldrun-form','fc-source-select','fc-domain-select','topic-input','terms-input','summary-input','questions-input','command-palette-input'];
const unl = ids.filter(id => { const m = html.match(new RegExp('<(input|select|textarea)\\b[^>]*id="' + id + '"[^>]*>')); return !m || !/aria-label=|aria-labelledby=/.test(m[0]); });
ok('form controls have accessible names (' + (unl.join(', ') || 'all ' + ids.length) + ')', unl.length === 0);
const tiny = (html.match(/font-size:\s*(\d+(?:\.\d+)?)px/g) || []).filter(s => parseFloat(s.split(':')[1]) < 11);
ok('no text smaller than 11px (' + tiny.length + ')', tiny.length === 0);
ok('visible keyboard focus for all interactive elements', /button:focus-visible, a:focus-visible, select:focus-visible, input:focus-visible, textarea:focus-visible, summary:focus-visible, \[role="button"\]:focus-visible/.test(html));
ok('reduced-motion preference stops animations', /@media \(prefers-reduced-motion: reduce\)\{\s*\*, \*::before, \*::after\{ animation-duration:0\.01ms !important/.test(html));
ok('no positive tabindex (keeps natural tab order)', !/tabindex="[1-9]/.test(html));
ok('order-step arrows have names', /aria-label="Move step \$\{i\+1\} up"/.test(html) && /aria-label="Move step \$\{i\+1\} down"/.test(html));
ok('drag-and-drop has a keyboard path', /function pbqKeyboardize/.test(html));
ok('confidence buttons expose pressed state', /class="conf-btn\$\{cur === v \? ' on' : ''\}" data-conf="\$\{v\}" aria-pressed=/.test(html));
ok('SOC queue rows are keyboard-operable', /class="soc-row" data-id="\$\{a\.id\}" tabindex="0" role="button"/.test(html));
ok('320px overflow fixes present (cram grid, status rows)', /\.cram-term-grid\{ grid-template-columns:minmax\(0,1fr\) minmax\(0,1fr\); \}/.test(html) && /\.status-row\{ flex-wrap:wrap; \}/.test(html));
ok('no hard-coded orange status text left in templates', !/'#ffb454'\]|: '#ffb454'|High: '#ff7a59'/.test(html));
let failed = 0; checks.forEach(([n, c]) => { console.log((c ? '  ok   ' : '  FAIL ') + n); if(!c) failed++; });
console.log(`accessibility: ${checks.length - failed} passed, ${failed} failed`); process.exit(failed ? 1 : 0);
