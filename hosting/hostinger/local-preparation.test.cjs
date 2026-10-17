'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { outputPath, buildTime } = require('../../build/local-output');
const { generateHtaccess } = require('./build');
const { validateRedirects, classifyRequest } = require('./redirect-policy.cjs');
const { auditLegacy, reconcileSite, legacyCases, routes, inventory, aliases, preview, articleRules, articleRecords } = require('./migration-audit.cjs');

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ip3-prep-'));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
    assert.match(path.basename(root), /^ip3-prep-/);
    fs.rmSync(root, { recursive: true, force: true });
  });
  return root;
}
test('fresh build output refuses existing/source/escaped paths and directory junctions', t => {
  const root = fixture(t), existing = path.join(root, 'existing'); fs.mkdirSync(existing);
  for (const value of [root, path.dirname(root), existing, path.join(root, 'content/generated'), path.join(root, 'public_html')]) assert.throws(() => outputPath(root, value));
  assert.equal(outputPath(root, path.join(root, 'draft')), path.join(root, 'draft'));
  const link = path.join(root, 'link');
  try { fs.symlinkSync(existing, link, process.platform === 'win32' ? 'junction' : 'dir'); }
  catch (e) { if (e.code === 'EPERM') { t.skip('OS denies fixture junction creation'); return; } throw e; }
  assert.throws(() => outputPath(root, path.join(link, 'draft')), /symlink\/junction/);
});
test('reproducible build clock validates SOURCE_DATE_EPOCH', () => {
  assert.equal(buildTime('1792195200').toISOString(), '2026-10-17T00:00:00.000Z');
  for (const value of ['-1','1.5','yesterday','Infinity','']) assert.throws(() => buildTime(value));
});
test('all 342 inventory URLs and 16 preservation-approved identities reconcile without claiming missing text', () => {
  const audit = auditLegacy();
  assert.equal(audit.inventoryRows, 342); assert.equal(audit.articleRows, 32); assert.equal(audit.uniqueArticles, 16);
  assert.equal(audit.classifications.MEDIA_PATH_GAP, 254);
  assert.ok(inventory.articles.every(a => a.rowCount === 2 && a.equivalenceVerified === false && a.disposition === 'preserve'));
  assert.equal(audit.articleApprovalStatus, 'approved_preserve_all_16');
  assert.equal(audit.hostVerification, 'pending'); assert.equal(audit.uploadEnabled, false);
  assert.equal(legacyCases().find(c => c.path === '/robots.txt').baseline.status, 200);
});
test('each article URL maps only when full text and identity are verified', () => {
  for (const row of inventory.rows.filter(r => r.action === 'ARTICLE_GAP')) {
    const article = articleRecords.find(a => a.wpId === row.wp_id);
    const expected = article.publicationStatus === 'published' ? { status: 308, destination: '/insights/' + article.slug } : { status: 404 };
    assert.deepEqual(classifyRequest(row.legacy_path_and_query, routes, aliases, preview, articleRules), expected, row.legacy_url);
  }
});
test('baseline aliases land directly on canonical pages; draft page IDs require opt-in', () => {
  for (const rule of aliases) {
    assert.deepEqual(classifyRequest(rule.source, routes, aliases), { status: 308, destination: rule.destination });
    assert.equal(classifyRequest(rule.destination, routes, aliases).status, 200);
    if (!rule.source.endsWith('.html')) assert.deepEqual(classifyRequest(rule.source + '/', routes, aliases), { status:308, destination:rule.destination });
  }
  for (const rule of preview.filter(r => r.has)) {
    const url = rule.source + '?page_id=' + rule.has[0].value;
    assert.equal(classifyRequest(url, routes, aliases).status, 404);
    assert.deepEqual(classifyRequest(url, routes, aliases, preview), { status: 308, destination: rule.destination });
  }
});
test('conflicting, duplicate, encoded, missing and unknown WordPress query selectors fail closed', () => {
  for (const url of ['/?p=3355','/?page_id=999999','/?page_id=6281&p=3355','/?page_id=6281&page_id=6281','/?page_id=6281&utm=a&page_id=999','/?p%61ge_id=6281','/?PAGE_ID=6281','/?page_id','/index.html?p=3355','/?cat=105','/?author=3','/?s=secret']) {
    assert.equal(classifyRequest(url, routes, aliases, preview).status, 404, url);
  }
  assert.equal(classifyRequest('/?utm_source=local%20test', routes, aliases).status, 200);
  const rules = generateHtaccess(routes, aliases, { legacyPreview: true });
  assert.match(rules, /R=404,L/); assert.match(rules, /R=308,L,NE,QSD/);
  assert.ok(rules.includes('page_id=[^&]*&(?:[^&]*&)*page_id(?:=|&|$)'));
});
test('redirect graph rejects loops, duplicates, offsite targets, canonical shadowing and missing destinations', () => {
  for (const rules of [
    [{source:'/a',destination:'/b'},{source:'/b',destination:'/a'}],
    [{source:'/a',destination:'/about'},{source:'/a',destination:'/contact'}],
    [{source:'/a',destination:'//evil.invalid'}], [{source:'/a',destination:'/missing'}],
    [{source:'/about',destination:'/contact'}], [{source:'/a',destination:'/../about'}],
  ]) assert.throws(() => validateRedirects(routes, rules));
});
test('unknown paths return 404 while generated html and slash aliases normalize once', () => {
  for (const route of routes.filter(r => r !== '/')) {
    for (const suffix of ['.html','/']) assert.deepEqual(classifyRequest(route + suffix, routes, aliases), {status:308,destination:route});
  }
  assert.equal(classifyRequest('/not-an-ip3-page', routes, aliases).status, 404);
});
test('base pages plus verified articles reconcile with canonical sitemap and excluded 404', t => {
  const root = fixture(t);
  for (const route of routes) {
    const file = path.join(root, route === '/' ? 'index.html' : route.slice(1) + '.html');
    fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file, '<!doctype html>');
  }
  const origin = require('../../content/site.json').url;
  const preparing = new Set(articleRecords.filter(a=>a.publicationStatus==='in-preparation').map(a=>'/insights/'+a.slug));
  const indexable = routes.filter(r => r !== '/404' && !preparing.has(r));
  const sitemap = indexable.map(r => '<url><loc>' + origin + r + '</loc></url>').join('');
  fs.writeFileSync(path.join(root, 'sitemap.xml'), '<urlset>'+sitemap+'</urlset>');
  assert.equal(reconcileSite(root).sitemapUrls, indexable.length);
  fs.writeFileSync(path.join(root, 'sitemap.xml'), '<urlset>'+sitemap.replace('<url><loc>' + origin + '/about</loc></url>', '')+'</urlset>');
  assert.throws(() => reconcileSite(root), /indexable base and published/);
  fs.writeFileSync(path.join(root, 'sitemap.xml'), '<urlset>'+sitemap+'<url><loc>' + origin + '/about</loc></url></urlset>');
  assert.throws(() => reconcileSite(root), /indexable base and published/);
});
