const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const root = path.join(__dirname, '..'), out = path.resolve(process.env.EXPLORE_QA_OUT || path.join(root, 'docs/interactive-experience/mobile-performance-2026-10-22'));
const phases = Object.fromEntries(['baseline', 'after'].map(phase => [phase, JSON.parse(fs.readFileSync(path.join(out, `performance-${phase}.json`)))]));
const metric = (rows, key) => { const values = rows.map(r => r[key]).sort((a, b) => a - b); return { median: values.length % 2 ? values[(values.length - 1) / 2] : (values[values.length / 2 - 1] + values[values.length / 2]) / 2, min: values[0], max: values.at(-1) }; };
const forms = process.env.EXPLORE_PERFORMANCE_FORMS?.split(',') || ['mobile', 'desktop'];
for (const p of Object.values(phases)) assert.equal(p.results.length, forms.length * 10, 'Incomplete phase must not become final evidence');
assert.equal(phases.baseline.browser, phases.after.browser);
const comparisons = [];
for (const form of forms) for (const name of ['home', 'hub', ...require('../src/explore/catalogue').map(m => m.slug)]) {
  const row = { name, form };
  for (const [phase, data] of Object.entries(phases)) {
    const rows = data.results.filter(r => r.name === name && r.form === form).map(r => {
      const raw = JSON.parse(fs.readFileSync(path.join(out, `lh-${phase}-${form}-${name}-${r.trial}.json`)));
      return { ...r, FCP: raw.audits['first-contentful-paint'].numericValue, mainThread: raw.audits['mainthread-work-breakdown'].numericValue };
    }); assert.equal(rows.length, name === 'home' ? 3 : 1);
    row[phase] = { runs: rows.length, ...Object.fromEntries(['LCP', 'FCP', 'TBT', 'CLS', 'performance', 'accessibility', 'bytes', 'mainThread'].map(k => [k, metric(rows, k)])) };
  }
  row.LCPChangePercent = (row.after.LCP.median / row.baseline.LCP.median - 1) * 100;
  comparisons.push(row);
}
const diagnostics = [];
for (const form of forms) {
  const before = JSON.parse(fs.readFileSync(path.join(out, `lh-baseline-${form}-home-1.json`)));
  const after = JSON.parse(fs.readFileSync(path.join(out, `lh-after-${form}-home-1.json`)));
  assert.equal(before.lighthouseVersion, after.lighthouseVersion);
  for (const key of ['formFactor', 'screenEmulation', 'throttlingMethod', 'throttling']) assert.deepEqual(before.configSettings[key], after.configSettings[key]);
  diagnostics.push({ form, lighthouseVersion: after.lighthouseVersion, config: after.configSettings, beforeFonts: before.audits['network-requests'].details.items.filter(r => r.resourceType === 'Font'), afterFonts: after.audits['network-requests'].details.items.filter(r => r.resourceType === 'Font'), lcpBreakdown: after.audits['lcp-breakdown-insight'].details, renderBlocking: after.audits['render-blocking-insight'].details });
}
const hashes = [];
for (const filename of ['build/build-all.js', 'build/page-css.cjs', 'build/http-compression.cjs', 'src/layout.js', 'src/pages-home.js', 'src/fonts.js', 'src/theme-fonts.json', 'src/js/site.js', 'src/css/site.css', 'assets/fonts/theme.css']) { const bytes = fs.readFileSync(path.join(root, filename)); hashes.push({ filename, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex') }); }
assert.equal(phases.baseline.transport, phases.after.transport);
const result = { scope: 'Paired local Lighthouse lab comparison: Home uses embedded pinned declarations/optimized font CDN with local mirrors; Explore retains baseline font delivery. Both sides use the same negotiated gzip transport, simulated throttling, Chromium and Lighthouse. No field INP or authenticated deployment acceptance.', transport: phases.after.transport, build: JSON.parse(fs.readFileSync(path.join(root, 'dist/build.json'))), baselineIdentity: JSON.parse(fs.readFileSync(path.join(out, 'performance-baseline/identity.json'))), comparisons, diagnostics, sourceFiles: hashes };
fs.writeFileSync(path.join(out, 'COMPARISON.json'), JSON.stringify(result, null, 2) + '\n');
for (const r of comparisons) console.log(JSON.stringify({ route: r.name, form: r.form, beforeLCP: r.baseline.LCP.median / 1000, afterLCP: r.after.LCP.median / 1000, changePercent: r.LCPChangePercent, afterPerformance: r.after.performance.median, afterTBT: r.after.TBT.median }));
