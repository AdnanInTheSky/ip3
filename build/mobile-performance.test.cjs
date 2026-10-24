const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const root = path.join(__dirname, '..');
test('vendored theme fonts retain original bytes and redistributed licenses', () => {
  const manifest = require('../src/theme-fonts.json');
  assert.equal(manifest.files.length, 17); assert.equal(manifest.licenses.length, 3);
  assert.equal(manifest.optimizedFonts.length, 2);
  for (const f of [...manifest.files, ...manifest.licenses, ...manifest.optimizedFonts]) {
    const bytes = fs.readFileSync(path.join(root, 'assets/fonts', f.filename));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), f.sha256);
    if (f.bytes) assert.equal(bytes.length, f.bytes);
  }
});
test('same families, styles, full weights and subset ranges remain available locally', () => {
  const css = fs.readFileSync(path.join(root, 'assets/fonts/theme.css'), 'utf8');
  assert.doesNotMatch(css, /https?:/);
  assert.match(css, /font-family: 'Fraunces';\s*font-style: italic;\s*font-weight: 100 900/);
  assert.match(css, /font-family: 'Fraunces';\s*font-style: normal;\s*font-weight: 100 900/);
  for (const family of ['Lato', 'Montserrat']) assert.ok(css.includes(`font-family: '${family}'`));
  for (const subset of ['latin-ext', 'vietnamese', 'cyrillic']) assert.ok(css.includes(subset));
  for (const match of css.matchAll(/url\(([^)]+)\)/g)) assert.ok(fs.existsSync(path.join(root, match[1])));
});
test('Home discovers pinned fonts with local mirrors while Explore retains its baseline font delivery', () => {
  const { page } = require('../src/layout');
  const html = page({ title: 'Test', desc: 'Test', path: '/', body: '<h1>IP3</h1>' });
  assert.match(html, /<style data-theme-fonts>/); assert.match(html, /as="font" type="font\/woff2" crossorigin/);
  assert.doesNotMatch(html, /fonts\.googleapis\.com/);
  assert.match(html, /url\(https:\/\/fonts\.gstatic\.com/); assert.match(html, /url\(\/assets\/fonts\//);
  const { document } = require('linkedom').parseHTML(html);
  assert.equal(document.querySelectorAll('link[rel="preload"][as="script"][fetchpriority="high"]').length, 4);
  for (const name of ['gsap.min.js', 'ScrollTrigger.min.js', 'lenis.min.js', 'site.js']) assert.equal([...document.querySelectorAll('script[src]')].filter(n => n.getAttribute('src').split('?')[0].endsWith('/' + name)).length, 1, 'Preload must not execute a script twice');
  assert.match(page({ title: 'Test', desc: 'Test', path: '/explore', body: '<h1>IP3</h1>' }), /rel="stylesheet" href="https:\/\/fonts\.googleapis\.com/);
});
test('native analytical routes omit unused global motion vendors while Home preserves them', () => {
  const { model, catalogue } = require('../src/explore');
  for (const m of catalogue) {
    const html = model(m); assert.doesNotMatch(html, /assets\/vendor\/(gsap|ScrollTrigger|lenis)/);
    assert.match(html, /assets\/js\/models\//); assert.match(html, /assets\/js\/model\.js/);
  }
  assert.match(require('../src/pages-home').home(), /assets\/vendor\/gsap\.min\.js/);
});
test('local font delivery retains long cache lifetime and correct preview MIME', () => {
  const rule = require('../vercel.json').headers.find(h => h.source === '/assets/fonts/(.*)');
  assert.ok(rule.headers.some(h => h.key === 'Cache-Control' && /31536000.*immutable/.test(h.value)));
  assert.match(fs.readFileSync(path.join(root, 'dev-server.js'), 'utf8'), /'\.woff2': 'font\/woff2'/);
});
test('font optimization changes only Latin file URLs and preserves current SOFT=0 design settings', () => {
  const manifest = require('../src/theme-fonts.json');
  let expected = fs.readFileSync(path.join(root, 'assets/fonts/theme-source.css'), 'utf8').replace(/\r\n/g, '\n').trimEnd() + '\n';
  for (const font of manifest.optimizedFonts) {
    assert.deepEqual(font.weightRange, [100, 900]); assert.deepEqual(font.retainedVariableAxes, ['opsz', 'wght', 'WONK']);
    expected = expected.replace(font.original, font.filename);
  }
  assert.equal(fs.readFileSync(path.join(root, 'assets/fonts/theme.css'), 'utf8').replace(/\r\n/g, '\n'), expected);
  const site = fs.readFileSync(path.join(root, 'src/css/site.css'), 'utf8');
  for (const setting of site.matchAll(/['"]SOFT['"]\s+(-?[\d.]+)/g)) assert.equal(Number(setting[1]), 0, 'A changed SOFT design requires revisiting the optimized font');
});
test('page CSS keeps matching selectors, runtime words/states and functional selectors verbatim', () => {
  const { pageCss } = require('./page-css.cjs');
  const css = '.hero{color:red}.absent{color:blue}.hero,.other{margin:1px}.w .wi{display:inline-block}.js .gone{opacity:1}.is-ready{color:green}.lenis-smooth{height:auto}:not(.absent){color:yellow}:is(.absent,h1){color:purple}a[href$=".pdf"]{color:orange}@media(max-width:500px){.hero{padding:2px}.absent{padding:4px}}@keyframes go{from{opacity:0}to{opacity:1}}';
  const result = pageCss(css, '<html class="no-js"><body><div class="hero"></div></body></html>');
  assert.ok(!result.includes('.absent{color:blue}')); assert.ok(!result.includes('.absent{padding:4px}'));
  for (const preserved of ['.hero{color:red}', '.hero,.other{margin:1px}', '.w .wi{display:inline-block}', '.js .gone{opacity:1}', '.is-ready{color:green}', '.lenis-smooth{height:auto}', ':not(.absent){color:yellow}', ':is(.absent,h1){color:purple}', 'a[href$=".pdf"]{color:orange}', '@keyframes go{from{opacity:0}to{opacity:1}}']) assert.ok(result.includes(preserved), preserved);
  assert.equal(pageCss('.tilt{transform:perspective(900px)}.pdlg__head{display:flex}', '<body></body>'), '.tilt{transform:perspective(900px)}.pdlg__head{display:flex}');
});
test('Approach decision lead stops sticking when its two-column layout collapses on mobile', () => {
  const html = require('../src/pages-inner').approach();
  const css = fs.readFileSync(path.join(root, 'src/css/site.css'), 'utf8');
  assert.match(html, /class="approach-decision__lead"/);
  assert.doesNotMatch(html, /approach-decision__lead[^>]*style=/);
  const parsed = require('postcss').parse(css);
  const base = []; let mobile = [];
  parsed.walkRules('.approach-decision__lead', rule => {
    if (rule.parent.type === 'atrule' && rule.parent.params.includes('max-width:1040px')) mobile = rule.nodes;
    else base.push(...rule.nodes);
  });
  assert.equal(base.find(node => node.prop === 'position')?.value, 'sticky');
  assert.equal(mobile.find(node => node.prop === 'position')?.value, 'static');
  const delivered = require('./page-css.cjs').pageCss(css, html);
  assert.match(delivered, /\.approach-decision__lead\{position:sticky/);
  assert.match(delivered, /@media \(max-width:1040px\)\{[\s\S]*?\.approach-decision__lead\{position:static\}/);
});
test('gzip negotiation preserves exact response bytes and does not recompress WOFF2', async () => {
  const http = require('node:http'), os = require('node:os'), zlib = require('node:zlib');
  const { sendFile } = require('./http-compression.cjs');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ip3-http-compression-')), filename = path.join(directory, 'source.txt');
  const original = Buffer.from('IP3 — Fraunces, Montserrat, Lato; charts and inputs unchanged.\n'.repeat(300)); fs.writeFileSync(filename, original);
  const server = http.createServer((req, res) => sendFile(req, res, filename, req.url === '/font' ? 'font/woff2' : 'text/html; charset=utf-8'));
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const get = (encoding, url = '/') => new Promise((resolve, reject) => http.get({ hostname: '127.0.0.1', port: server.address().port, path: url, headers: { 'Accept-Encoding': encoding } }, res => { const chunks = []; res.on('data', b => chunks.push(b)); res.on('end', () => resolve({ headers: res.headers, body: Buffer.concat(chunks) })); }).on('error', reject));
  try {
    const gzip = await get('gzip, deflate'); assert.equal(gzip.headers['content-encoding'], 'gzip'); assert.equal(gzip.headers.vary, 'Accept-Encoding'); assert.ok(gzip.body.length < original.length); assert.deepEqual(zlib.gunzipSync(gzip.body), original);
    for (const encoding of ['identity', 'gzip;q=0', 'br, gzip;q=0.00']) { const plain = await get(encoding); assert.equal(plain.headers['content-encoding'], undefined); assert.deepEqual(plain.body, original); }
    const font = await get('gzip', '/font'); assert.equal(font.headers['content-encoding'], undefined); assert.deepEqual(font.body, original);
    assert.equal((await get('GZip')).headers['content-encoding'], 'gzip');
  } finally { await new Promise(resolve => server.close(resolve)); fs.unlinkSync(filename); fs.rmdirSync(directory); }
});
