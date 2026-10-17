'use strict';
const test = require('node:test'), assert = require('node:assert/strict');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
const { loadArticles, validateArticles, publishedArticles, visibleArticles, articleRedirects, articlePath, contentApprovalDigest } = require('../cms/articles');
const { blocksToMarkdown, parseMarkdown, renderMarkdown, unescape } = require('../cms/article-markdown');
const records = loadArticles(), copy = () => structuredClone(records).map(a => ({...a, publicationStatus:'draft', approvalStatus:'pending', approvedContentSha256:''}));
const approve = a => { a.publicationStatus = 'published'; a.contentReadiness = 'ready-for-review'; a.approvalStatus = 'approved'; a.approvedContentSha256 = contentApprovalDigest(a); return a; };
test('owner readiness decision exposes four complete articles and keeps twelve missing bodies as private drafts', () => {
  assert.deepEqual(validateArticles(records), []); assert.equal(records.length, 16);
  assert.equal(records.filter(a => a.sourceStatus === 'verified').length, 3);
  assert.equal(records.filter(a => a.contentReadiness === 'ready-for-review').length, 4);
  assert.equal(records.filter(a => a.contentReadiness === 'needs-owner-content').length, 12);
  assert.equal(records.filter(a => a.approvalStatus === 'pending').length, 12);
  assert.equal(publishedArticles(records).length, 4); assert.equal(visibleArticles(records).length,4);
  assert.equal(records.filter(a=>a.publicationStatus==='draft').length,12);
  for(const a of records.filter(a=>a.publicationStatus==='draft')) assert.ok(!articleRedirects(records).some(r=>r.destination===articlePath(a)));
});
test('Markdown conversion retains complete source text and the BMDF mismatch/owner title decision', () => {
  const compact = text => text.replace(/\s/g, '');
  for (const a of records.filter(a => a.sourceStatus === 'verified')) {
    assert.equal(a.body, blocksToMarkdown(a.legacySourceBody));
    assert.equal(compact(parseMarkdown(a.body).nodes.map(n => unescape(n.text || '')).join('')), compact(a.legacySourceBody.map(b => b.text).join('')));
  }
  const a = records.find(a => a.wpId === '8763');
  assert.match(a.reviewNotes, /Title mismatch explicitly recorded/);
  assert.equal(a.sourceTitle, 'Urban Planning for Resilient Infrastructure');
  assert.equal(a.title, 'From Donor‑Dependent Projects to Sustainable Urban Finance');
  assert.equal(a.publishedDate, ''); assert.equal(a.approvalStatus, 'approved');
});
test('new and existing drafts can be authored without manufactured legacy IDs, authors, dates or source URLs', () => {
  const changed = copy(); changed[0].slug = 'edited-draft-slug'; changed[0].title = 'Draft editing test'; changed[0].body += '\n\nOwner edit pending review.';
  const extra = { slug: 'new-owner-draft', title: 'New owner draft', category: 'Blog Post', publicationStatus: 'draft', contentReadiness: 'needs-owner-content', body: '', infographics: [] };
  changed.push(extra); assert.deepEqual(validateArticles(changed), []);
  extra.body = 'Synthetic owner-written test text. '.repeat(8); extra.summary = 'Synthetic summary'; extra.sourceStatus = 'owner-written'; approve(extra);
  assert.deepEqual(validateArticles(changed), []); assert.ok(publishedArticles(changed).some(a => a.slug === extra.slug));
  assert.ok(!articleRedirects(changed).some(r => r.destination === articlePath(extra)));
});
test('publication requires an approved complete revision; later metadata or body edits invalidate approval', () => {
  const changed = copy(), a = changed.find(a => a.sourceStatus === 'verified');
  a.publicationStatus = 'published'; assert.ok(validateArticles(changed).some(e => e.includes('approval')));
  approve(a); assert.deepEqual(validateArticles(changed), []);
  for (const field of ['title', 'summary', 'body', 'mediaNote', 'publishedDate']) {
    const bad = structuredClone(changed); bad.find(x => x.wpId === a.wpId)[field] += ' Changed';
    assert.ok(validateArticles(bad).some(e => e.includes('exact content')), field);
  }
  a.body = '# Only a title'; approve(a); assert.ok(validateArticles(changed).some(e => e.includes('title-only')));
});
test('Markdown supports visual editor formatting and safely rejects active HTML, unsafe links and malformed images', () => {
  const html = renderMarkdown('## Heading\n\n**Bold** and *italic* and `code` [link](https://example.org)\n\n- One\n- Two\n\n1. First\n2. Second\n\n> Quotation\n\n| Name | Value |\n| --- | --- |\n| A | B |');
  for (const snippet of ['<h2>Heading</h2>', '<strong>Bold</strong>', '<em>italic</em>', '<ul>', '<ol>', '<blockquote>', '<th scope="col">Name</th>']) assert.ok(html.includes(snippet), snippet);
  for (const body of ['<img src=x onerror=alert(1)>', '[bad](javascript:evil)', '![x](https://ip3-bd.org/wp-content/uploads/a.png)', 'text ![x](/assets/insights/a.png)', '```\nunclosed']) assert.ok(parseMarkdown(body).errors.length, body);
  assert.equal(renderMarkdown('A & B'), '<p>A &amp; B</p>');
  assert.throws(() => renderMarkdown('<script>bad</script>'));
});
test('cover, infographic and Markdown image paths/alt/captions are validated and rendered into actual HTML', t => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ip3-article-media-'));
  t.after(() => { assert.equal(path.dirname(path.resolve(temp)), path.resolve(os.tmpdir())); assert.match(path.basename(temp), /^ip3-article-media-/); fs.rmSync(temp, { recursive: true, force: true, maxRetries: 5 }); });
  fs.mkdirSync(path.join(temp, 'assets/insights'), { recursive: true });
  fs.writeFileSync(path.join(temp, 'assets/insights/test.png'), Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jhZkAAAAASUVORK5CYII=', 'base64'));
  const changed = copy(), a = changed[0];
  for (const other of changed) { other.coverImage = ''; other.coverAlt = ''; other.coverCaption = ''; }
  a.coverImage = '/assets/insights/test.png'; a.coverAlt = 'Cover description'; a.coverCaption = 'Cover caption';
  a.infographics = [{ image: a.coverImage, alt: 'Infographic description', caption: 'Infographic caption' }];
  a.body += '\n\n![Inline description](/assets/insights/test.png "Inline caption")';
  assert.deepEqual(validateArticles(changed, temp), []);
  const html = require('../src/pages-articles').articlePage(a);
  for (const text of ['alt="Cover description"', 'alt="Infographic description"', 'alt="Inline description"', '<figcaption>Cover caption</figcaption>', '<figcaption>Infographic caption</figcaption>', '<figcaption>Inline caption</figcaption>']) assert.ok(html.includes(text), text);
  for (const mutate of [a => { a.coverAlt = ''; }, a => { a.infographics[0].alt = ''; }, a => { a.coverImage = 'https://example.org/x.png'; }, a => { a.coverImage = '/assets/insights/../test.png'; }, a => { a.coverImage = '/assets/img/a.png'; }, a => { a.coverImage = '/assets/insights/missing.png'; }, a => { a.body += '\n\n![](/assets/insights/test.png)'; }, a => { a.infographics = 'bad'; }]) {
    const bad = structuredClone(changed); mutate(bad[0]); assert.ok(validateArticles(bad, temp).length);
  }
  a.sourceStatus = 'owner-written'; approve(a); a.approvedContentSha256 = contentApprovalDigest(a, temp);
  assert.deepEqual(validateArticles(changed, temp), []);
  fs.appendFileSync(path.join(temp, 'assets/insights/test.png'), 'changed bytes');
  assert.ok(validateArticles(changed, temp).some(e => e.includes('exact content')));
  fs.writeFileSync(path.join(temp, 'assets/insights/test.png'), 'not an image'); assert.ok(validateArticles(changed, temp).some(e => e.includes('bytes do not match')));
});
test('owner kit for 3355 retains its caveats and legacy identity under the explicit phased publication instruction', () => {
  const a = records.find(a => a.wpId === '3355');
  assert.equal(a.sourceStatus, 'owner-written'); assert.equal(a.publicationStatus, 'published'); assert.equal(a.approvalStatus, 'approved');
  assert.equal(a.title, 'Enhancing Environmental Compliance and Performance in Bangladesh');
  assert.equal(a.slug, 'enhancing-environmental-compliance-and-performance-in-bangladesh');
  assert.ok(a.body.length > 20000); assert.match(a.body, /Greener exports/); assert.match(a.body, /illustrative/i); assert.match(a.body, /unverified/i);
  assert.match(a.body, /https:\/\/doi\.org\//); assert.match(a.reviewNotes, /Existing legacy title\/slug retained/);
  assert.equal(a.publishedDate || '', ''); assert.ok(a.coverAlt); assert.ok(articleRedirects(records).some(rule => rule.destination === articlePath(a)));
});
test('in-preparation topics visibly disclose missing text, hide unfinished edits and have no Article schema or legacy redirect', () => {
  const a=structuredClone(records.find(a=>a.sourceStatus==='missing'));
  a.publicationStatus='in-preparation';
  a.body='UNFINISHED-EDITOR-TEXT'; a.summary='UNREVIEWED-SUMMARY';
  const {articlePage,articleCard}=require('../src/pages-articles'), html=articlePage(a), card=articleCard(a);
  assert.match(html,/In preparation/); assert.match(html,/<meta name="robots" content="noindex">/);
  assert.doesNotMatch(html,/UNFINISHED-EDITOR-TEXT|UNREVIEWED-SUMMARY|"@type":"Article"/);
  assert.match(card,/In preparation/); assert.doesNotMatch(card,/UNREVIEWED-SUMMARY/);
  assert.match(html,/Back to Insights/);
  const all=copy(); Object.assign(all.find(x=>x.wpId===a.wpId),a); assert.deepEqual(validateArticles(all),[]);
});
test('content branch explicitly disables Vercel Git deployments while production release stays gated', () => {
  const config = require('../vercel.json'); assert.equal(config.git.deploymentEnabled.content, false);
});
test('CMS exposes Markdown, editable metadata and dedicated infographic fields with safe new-entry creation', () => {
  const schema = require('../cms/schema'), collection = schema.content.find(c => c.name === 'articles');
  const field = name => collection.fields.find(f => f.name === name);
  assert.equal(field('body').type, 'rich-text'); assert.equal(field('body').options.format, 'markdown');
  assert.equal(field('body').options.media, 'insights_images'); assert.ok(!field('slug').readonly);
  for (const name of ['title', 'slug', 'summary', 'category', 'publicationStatus', 'coverImage', 'coverAlt', 'coverCaption', 'infographics']) assert.ok(field(name));
  assert.equal(field('approvedContentSha256').readonly, true); assert.equal(field('wpId').optional, true);
  const media = schema.media.find(m => m.name === 'insights_images'); assert.equal(media.input, 'assets/insights'); assert.deepEqual(media.extensions, ['png', 'webp']);
  const config = fs.readFileSync(path.join(__dirname, '../.pages.yml'), 'utf8'), start = config.indexOf('- name: articles');
  const articleConfig = config.slice(start, config.indexOf('- name: people', start));
  assert.match(articleConfig, /create: true/); assert.match(articleConfig, /filename: "\{fields.slug\}\.json"/); assert.match(articleConfig, /type: rich-text/); assert.match(articleConfig, /format: "markdown"/);
});
