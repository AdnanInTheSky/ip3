'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const { registry, loadArticles, validateArticles, publishedArticles, articleRedirects, articlePath, bodyHash, contentApprovalDigest } = require('../cms/articles');
const { blocksToMarkdown } = require('../cms/article-markdown');
const { classifyRequest, validateRedirects } = require('../hosting/hostinger/redirect-policy.cjs');
const { generateHtaccess } = require('../hosting/hostinger/build');
const { routes: actualRoutes, inventory, aliases, preview } = require('../hosting/hostinger/migration-audit.cjs');
// Publication fixtures exercise future approved routes; repository entries remain drafts.
const approve = a => { a.publicationStatus = 'published'; a.contentReadiness = 'ready-for-review'; a.approvalStatus = 'approved'; a.approvedContentSha256 = contentApprovalDigest(a); return a; };
const records = loadArticles().map(a => a.sourceStatus === 'verified' ? approve(a) : a), rules = articleRedirects(records);
const routes = [...actualRoutes, ...records.filter(a => a.publicationStatus === 'published').map(articlePath)];
const copy = () => structuredClone(records);
test('16 stable CMS identities cover exactly the 32 audited legacy article URLs', () => {
  assert.equal(registry.length, 16); assert.equal(records.length, 16);
  assert.deepEqual(validateArticles(records), []);
  for (const article of registry) {
    assert.equal(article.disposition, 'preserve');
    assert.deepEqual([...article.legacyPaths].sort(), inventory.rows.filter(r => r.action === 'ARTICLE_GAP' && r.wp_id === article.wpId).map(r => r.legacy_path_and_query).sort());
    assert.equal(records.filter(a => a.wpId === article.wpId && a.slug === article.slug).length, 1);
  }
});
test('missing text, changed identity/body, duplicate IDs/slugs and absent preservation records fail closed', () => {
  for (const mutate of [
    a => { a.find(a => a.sourceStatus === 'missing').publicationStatus = 'published'; },
    a => { a.find(a => a.publicationStatus === 'published').body += ' Unsourced addition.'; },
    a => { a.find(a => a.publicationStatus === 'published').title = 'Changed identity'; },
    a => { a[0].slug = '../escape'; }, a => { a[1].wpId = a[0].wpId; }, a => { a.pop(); },
    a => { a.find(a => a.publicationStatus === 'published').body = '# Only title'; },
  ]) { const changed = copy(); mutate(changed); assert.ok(validateArticles(changed).length); assert.throws(() => publishedArticles(changed)); }
});
test('complete source content is preserved verbatim as text; drafts and attachment references stay out of publication', () => {
  const sources = require('../docs/articles-preservation-20261017/sources/public-articles.json');
  const compact = text => text.replace(/\s/g, '');
  for (const article of publishedArticles(records).filter(a => a.sourceStatus === 'verified')) {
    const source = sources.find(s => s.wpId === article.wpId);
    assert.equal(article.sourceTitle, source.title);
    assert.equal(article.title, registry.find(r => r.wpId === article.wpId).approvedTitle || source.title);
    const fullText = article.omittedMediaLabels ? source.fullContentText.replace(article.omittedMediaLabels, '') : source.fullContentText;
    assert.equal(compact(article.legacySourceBody.map(b => b.text).join('')), compact(fullText));
    assert.equal(article.verifiedBodySha256, bodyHash(article.legacySourceBody));
    assert.equal(article.body, blocksToMarkdown(article.legacySourceBody));
    assert.equal(article.verifiedMarkdownSha256, bodyHash(article.body));
    if (article.wpId === '8763') {
      assert.equal(source.omittedReferences.length, 8); assert.ok(article.mediaNote);
    } else assert.equal(source.omittedReferences.length, 0);
  }
  assert.equal(records.find(a => a.wpId === '8763').publicationStatus, 'published');
  assert.equal(records.filter(a => a.sourceStatus === 'missing').length, 12);
});
test('all 32 current legacy rows redirect to their own verified article or remain 404', () => {
  for (const item of registry) {
    const article = records.find(a => a.wpId === item.wpId);
    const expected = article.publicationStatus === 'published' ? { status: 308, destination: articlePath(article) } : { status: 404 };
    for (const url of item.legacyPaths) assert.deepEqual(classifyRequest(url, routes, aliases, preview, rules), expected, url);
  }
});
test('all 16 identities and query/pretty variants can map after future verified source import using memory-only fixtures', () => {
  const fixtures = copy().map(a => ({ ...a, publicationStatus: 'published', sourceStatus: 'verified', title: registry.find(r => r.wpId === a.wpId).approvedTitle || a.sourceTitle,
    summary: 'Test fixture summary.', body: 'Synthetic test fixture only. '.repeat(8) }));
  fixtures.forEach(a => { a.verifiedMarkdownSha256 = bodyHash(a.body); approve(a); });
  const allRules = articleRedirects(fixtures), allRoutes = [...new Set([...routes, ...fixtures.map(articlePath)])];
  assert.equal(validateRedirects(allRoutes, [...aliases, ...allRules], { queryAllowed: true }), true);
  for (const article of fixtures) {
    const expected = { status: 308, destination: articlePath(article) };
    for (const root of ['/', '/index.php', '/index.html']) assert.deepEqual(classifyRequest(root + '?p=' + article.wpId, allRoutes, aliases, [], allRules), expected);
    for (const pretty of registry.find(r => r.wpId === article.wpId).prettyPaths) {
      assert.deepEqual(classifyRequest(pretty, allRoutes, aliases, [], allRules), expected);
      assert.deepEqual(classifyRequest(pretty.replace(/\/$/, ''), allRoutes, aliases, [], allRules), expected);
    }
    assert.equal(classifyRequest(articlePath(article), allRoutes, aliases, [], allRules).status, 200);
  }
});

test('BMDF title uses only the exact owner-approved source heading and retains original-title provenance', () => {
  const article = records.find(a => a.wpId === '8763');
  assert.equal(article.title, 'From Donor‑Dependent Projects to Sustainable Urban Finance');
  assert.equal(article.sourceTitle, 'Urban Planning for Resilient Infrastructure');
  assert.equal(articlePath(article), '/insights/from-donor-dependent-projects-to-sustainable-urban-finance');
  assert.ok(article.legacySourceBody.some(b => b.kind === 'heading' && b.text === article.title));
  const changed = copy(); changed.find(a => a.wpId === '8763').title = 'Urban Planning for Resilient Infrastructure';
  assert.ok(validateArticles(changed).some(e => e.includes('owner-approved title')));
});
test('query selectors reject duplicates/conflicts/encoding/case/unknown values; known article aliases normalize once', () => {
  const article = publishedArticles(records)[0], id = article.wpId;
  for (const url of [`/?p=${id}&p=${id}`, `/?p=${id}&p`, `/?p=${id}&page_id=6281`, `/?p=${id}&s`, `/?P=${id}`, `/?%70=${id}`, '/?p=%31' + id.slice(1), '/?p=999999', '/?p', '/insights?p=' + id])
    assert.equal(classifyRequest(url, routes, aliases, preview, rules).status, 404, url);
  assert.deepEqual(classifyRequest('/?utm_source=review&p=' + id, routes, aliases, [], rules), { status: 308, destination: articlePath(article) });
  for (const suffix of ['/', '.html']) assert.deepEqual(classifyRequest(articlePath(article) + suffix, routes, aliases, [], rules), { status: 308, destination: articlePath(article) });
  assert.equal(classifyRequest('/insights/unknown-article', routes, aliases, [], rules).status, 404);
  assert.throws(() => validateRedirects(routes, [{ source: '/old-a', destination: '/old-b' }, { source: '/old-b', destination: '/old-a' }]), /loop/);
});
test('generated Hostinger rules contain verified article selectors only, discard queries and preserve PHP denial', () => {
  const config = generateHtaccess(routes, aliases, { articleRules: rules });
  for (const article of records) assert.equal(config.includes('p=' + article.wpId + '(&|$)'), article.publicationStatus === 'published');
  assert.match(config, /R=308,L,NE,QSD/);
  assert.ok(config.includes('p=[^&]*&(?:[^&]*&)*p(?:=|&|$)'));
  assert.ok(config.includes('api/contact-lib'));
});
test('article renderer escapes text and hub links only published articles with accessible return navigation', () => {
  const { renderBody, articlePage } = require('../src/pages-articles');
  const { insights } = require('../src/pages-inner');
  assert.match(renderBody([{ kind: 'paragraph', text: '<img src=x onerror=alert(1)>' }]), /&lt;img/);
  const hub = insights();
  for (const article of records) assert.equal(hub.includes('href="' + articlePath(article) + '"'), true);
  for (const article of publishedArticles(records)) {
    const html = articlePage(article);
    assert.match(html, /aria-label="Breadcrumb"/); assert.match(html, /Back to Insights/);
    assert.ok(html.includes('rel="canonical" href="https://www.ip3-bd.org' + articlePath(article)));
    assert.doesNotMatch(html, /\/wp-content\/uploads\//);
  }
});
