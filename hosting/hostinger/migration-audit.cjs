'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { validateRedirects, classifyRequest } = require('./redirect-policy.cjs');
const { loadArticles, publishedArticles, articleRedirects, articlePath } = require('../../cms/articles');
const inventory = require('./legacy-inventory.draft.json');
const aliases = require('../../vercel.json').redirects;
const preview = require('./confirmed-legacy-preview.json');
const sectors = require('../../content/sectors.json').items;
const articleRecords = loadArticles(), published = publishedArticles(articleRecords), articleRules = articleRedirects(articleRecords);
const routes = ['/', '/404', '/about', '/why-ip3', '/approach', '/capabilities', '/sectors', '/engagements', '/insights', '/people', '/contact', '/privacy', '/terms', ...sectors.map(s => '/sectors/' + s.slug), ...published.map(articlePath)];
function inventoryOutcome(row, draft = []) {
  // robots.txt is a generated static crawl file, independently hash-checked by HTTP acceptance.
  if (row.legacy_path_and_query === '/robots.txt') return { status: 200 };
  return classifyRequest(row.legacy_path_and_query, routes, aliases, draft, articleRules);
}
function auditLegacy() {
  validateRedirects(routes, aliases); validateRedirects(routes, preview, { queryAllowed: true });
  const seen = new Set(), classifications = {}, outcomes = {}, draftOutcomes = {};
  for (const row of inventory.rows) {
    const url = new URL(row.legacy_url);
    if (!['https://ip3-bd.org', 'https://www.ip3-bd.org'].includes(url.origin) || seen.has(url.href)) throw new Error('Unexpected or duplicate legacy URL');
    seen.add(url.href);
    if (url.pathname + url.search !== row.legacy_path_and_query) throw new Error('Legacy path/query identity mismatch');
    classifications[row.action] = (classifications[row.action] || 0) + 1;
    const result = inventoryOutcome(row);
    outcomes[result.status] = (outcomes[result.status] || 0) + 1;
    const draft = inventoryOutcome(row, preview);
    draftOutcomes[draft.status] = (draftOutcomes[draft.status] || 0) + 1;
  }
  if (inventory.articles.some(a => a.approvalStatus !== 'approved_preserve' || a.disposition !== 'preserve' || a.equivalenceVerified !== false)) throw new Error('All 16 articles must retain the approved preservation disposition');
  validateRedirects(routes, [...aliases, ...articleRules], { queryAllowed: true });
  return { scope: 'local reference policy; not HTTP/Hostinger execution', sourceSha256: inventory.sourceSha256,
    inventoryRows: seen.size, classifications, baselineReferenceOutcomes: outcomes, optInDraftReferenceOutcomes: draftOutcomes,
    articleRows: inventory.rows.filter(r => r.action === 'ARTICLE_GAP').length, uniqueArticles: inventory.articles.length,
    articleApprovalStatus: 'approved_preserve_all_16', publishedArticleCount: published.length,
    articleLegacyRowsMapped: inventory.rows.filter(r => r.action === 'ARTICLE_GAP' && published.some(a => a.wpId === r.wp_id)).length,
    articleReadiness: articleRecords.map(a => ({ wpId: a.wpId, sourceStatus: a.sourceStatus, published: a.publicationStatus === 'published', destination: a.publicationStatus === 'published' ? articlePath(a) : null })),
    baselineAliases: aliases.length, optInDraftRules: preview.length,
    hostVerification: 'pending', production: 'NO-GO', uploadEnabled: false, promotionEnabled: false };
}
function reconcileSite(dist) {
  const html = [];
  const walk = dir => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, e.name);
    if (e.isSymbolicLink()) throw new Error('Unexpected build symlink');
    if (e.isDirectory()) walk(file);
    else if (e.name.endsWith('.html')) html.push(path.relative(dist, file).split(path.sep).join('/'));
  }};
  walk(dist);
  const actual = html.map(f => f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, '')).sort();
  if (JSON.stringify(actual) !== JSON.stringify([...routes].sort())) throw new Error('Expected exactly the base routes plus source-verified published article routes');
  const xml = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
  const mapped = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => {
    const url = new URL(m[1]);
    if (url.origin !== require('../../content/site.json').url || url.search || url.hash) throw new Error('Invalid sitemap canonical host/query');
    return url.pathname;
  }).sort();
  if (JSON.stringify(mapped) !== JSON.stringify(routes.filter(r => r !== '/404').sort())) throw new Error('Sitemap must contain exactly the indexable base and published article routes');
  return { generatedPages: actual.length, sitemapUrls: mapped.length, excluded: [{ route: '/404', reason: 'Custom error document' }], routes: actual };
}
function legacyCases() {
  return inventory.rows.map(row => ({ url: row.legacy_url, path: row.legacy_path_and_query, action: row.action,
    baseline: inventoryOutcome(row), preview: inventoryOutcome(row, preview) }));
}
if (require.main === module) console.log(JSON.stringify(auditLegacy(), null, 2));
module.exports = { auditLegacy, reconcileSite, legacyCases, routes, inventory, aliases, preview, articleRules, articleRecords };
