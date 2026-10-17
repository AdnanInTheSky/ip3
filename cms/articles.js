'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const registry = require('./legacy-articles.json');
const { parseMarkdown } = require('./article-markdown');
const ROOT = path.resolve(__dirname, '..');
const bodyHash = blocks => crypto.createHash('sha256').update(JSON.stringify(blocks)).digest('hex');
const articlePath = article => '/insights/' + article.slug;
const contentApprovalDigest = (article, root = ROOT) => bodyHash({
  wpId: article.wpId || '', slug: article.slug, title: article.title, category: article.category,
  summary: article.summary || '', body: article.body, coverImage: article.coverImage || '',
  coverAlt: article.coverAlt || '', coverCaption: article.coverCaption || '', infographics: article.infographics || [],
  mediaNote: article.mediaNote || '', publishedDate: article.publishedDate || '',
  imageBytes: [...parseMarkdown(article.body || '').nodes.filter(n => n.kind === 'image').map(n => n.image), article.coverImage, ...(Array.isArray(article.infographics) ? article.infographics.map(i => i.image) : [])].filter(Boolean).map(image => {
    if (!/^\/assets\/insights\/[a-z0-9/_-]+\.(png|webp)$/.test(image)) return [image, 'invalid'];
    try {
      const file = path.join(root, image.slice(1)), stat = fs.statSync(file);
      const actual = fs.realpathSync(file), media = fs.realpathSync(path.join(root, 'assets/insights'));
      if (!actual.startsWith(media + path.sep) || !stat.isFile() || stat.size > 2 * 1024 * 1024) return [image, 'invalid'];
      return [image, crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')];
    }
    catch { return [image, 'missing']; }
  }),
});
function imageErrors(image, root) {
  const errors = [];
  if (!image || typeof image.image !== 'string' || !/^\/assets\/insights\/[a-z0-9]+(?:[a-z0-9_/-]*[a-z0-9])?\.(png|webp)$/.test(image.image) || image.image.includes('..'))
    return ['image must use a PNG/WebP in /assets/insights/'];
  if (typeof image.alt !== 'string' || !image.alt.trim() || /<[^>]+>/.test(image.alt)) errors.push('image requires editable, plain-text alternative text');
  if (image.caption != null && (typeof image.caption !== 'string' || /<[^>]+>/.test(image.caption))) errors.push('image caption must be plain text');
  const file = path.join(root, image.image.slice(1));
  try {
    const stat = fs.statSync(file), actual = fs.realpathSync(file), media = fs.realpathSync(path.join(root, 'assets/insights'));
    if (!actual.startsWith(media + path.sep) || !stat.isFile() || stat.size > 2 * 1024 * 1024) return [...errors, 'image must be a local file of at most 2 MiB inside Insights media'];
    const b = fs.readFileSync(file);
    const png = b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    const webp = b.subarray(0,4).toString() === 'RIFF' && b.subarray(8,12).toString() === 'WEBP';
    if (!(image.image.endsWith('.png') ? png : webp)) errors.push('image bytes do not match PNG/WebP extension');
  } catch { errors.push('image file is missing or unreadable'); }
  return errors;
}
function loadArticles(root = ROOT) {
  return fs.readdirSync(path.join(root, 'content/articles')).filter(f => f.endsWith('.json')).sort()
    .map(f => JSON.parse(fs.readFileSync(path.join(root, 'content/articles', f), 'utf8')));
}
function validateArticles(records, root = ROOT) {
  const errors = [], seen = new Set(), slugs = new Set();
  const reject = (article, text) => errors.push(`article ${article?.wpId || '(unknown)'}: ${text}`);
  for (const article of records) {
    const expected = registry.find(r => r.wpId === article.wpId);
    if (article.wpId && (!expected || seen.has(article.wpId))) { reject(article, 'unknown or duplicate legacy identity'); continue; }
    if (article.wpId) seen.add(article.wpId);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug || '') || slugs.has(article.slug)) reject(article, 'slug is invalid or duplicated');
    slugs.add(article.slug);
    if (!['draft', 'in-preparation', 'published'].includes(article.publicationStatus)) reject(article, 'invalid publication status');
    if (!['missing', 'identity-review', 'verified', 'owner-written', undefined, ''].includes(article.sourceStatus)) reject(article, 'invalid source status');
    if (!['Article', 'Blog Post', 'Featured Article', 'Project Report'].includes(article.category)) reject(article, 'invalid article type');
    if (!article.title?.trim()) reject(article, 'title required');
    if (!['pending', 'approved', undefined, ''].includes(article.approvalStatus)) reject(article, 'invalid approval status');
    if (!['needs-owner-content', 'ready-for-review'].includes(article.contentReadiness)) reject(article, 'invalid content readiness');
    const parsed = parseMarkdown(article.body || '');
    parsed.errors.forEach(error => reject(article, error));
    if (!Array.isArray(article.infographics || [])) { reject(article, 'infographics must be a list'); continue; }
    const images = [...parsed.nodes.filter(n => n.kind === 'image'), ...(article.infographics || [])];
    if (article.coverImage) images.push({ image: article.coverImage, alt: article.coverAlt, caption: article.coverCaption });
    else if (article.coverAlt || article.coverCaption) reject(article, 'cover alt/caption requires a cover image');
    images.forEach(image => imageErrors(image, root).forEach(error => reject(article, error)));
    if (article.publicationStatus !== 'published') continue;
    if (article.contentReadiness !== 'ready-for-review') reject(article, 'publication requires complete content');
    if (article.approvalStatus !== 'approved' || article.approvedContentSha256 !== contentApprovalDigest(article, root)) reject(article, 'publication requires approval of this exact content, metadata and media');
    if (expected && article.slug !== expected.slug) reject(article, 'stable published slug requires maintainer review');
    if (expected?.approvedTitle && article.title !== expected.approvedTitle) reject(article, 'title differs from explicit owner-approved title');
    if (!['verified', 'owner-written'].includes(article.sourceStatus)) reject(article, 'publication requires reviewed source or owner-written content');
    if (!article.summary?.trim()) reject(article, 'publication requires a sourced summary');
    const substantive = parsed.nodes.filter(n => !['image', 'rule'].includes(n.kind)).map(n => n.text || n.rows?.flat().join(' ') || '').join(' ').replace(/[\s\\#*_`~>-]/g, '');
    if (substantive.length < 100) reject(article, 'title-only or incomplete article cannot publish');
    if (article.sourceStatus === 'verified') {
      if (bodyHash(article.body) !== article.verifiedMarkdownSha256) reject(article, 'body changed after source verification; review and reverify before publication');
      if (!/^https:\/\/(?:www\.)?ip3-bd\.org\/\?p=\d+$/.test(article.sourceUrl || '') || !article.sourceUrl.endsWith('p=' + article.wpId)) reject(article, 'verified public source URL required');
      if (!Number.isFinite(Date.parse(article.sourceObservedAt || ''))) reject(article, 'source observation timestamp required');
    }
  }
  for (const item of registry) if (!seen.has(item.wpId)) errors.push(`article ${item.wpId}: preservation record missing`);
  return errors;
}
function publishedArticles(records = loadArticles()) {
  const errors = validateArticles(records);
  if (errors.length) throw new Error(errors.join('\n'));
  return records.filter(a => a.publicationStatus === 'published').sort((a, b) => (a.wpId || a.slug).localeCompare(b.wpId || b.slug));
}
function visibleArticles(records = loadArticles()) {
  const errors = validateArticles(records);
  if (errors.length) throw new Error(errors.join('\n'));
  return records.filter(a => ['published', 'in-preparation'].includes(a.publicationStatus)).sort((a,b) => (a.wpId || a.slug).localeCompare(b.wpId || b.slug));
}
function articleRedirects(records = loadArticles()) {
  return publishedArticles(records).filter(article => article.wpId).flatMap(article => {
    const legacy = registry.find(r => r.wpId === article.wpId);
    return [
      ...['/', '/index.php', '/index.html'].map(source => ({ source, destination: articlePath(article), has: [{ type: 'query', key: 'p', value: article.wpId }] })),
      ...legacy.prettyPaths.map(source => ({ source: source.replace(/\/$/, ''), destination: articlePath(article) })),
    ];
  });
}
module.exports = { registry, loadArticles, validateArticles, publishedArticles, visibleArticles, articleRedirects, articlePath, bodyHash, contentApprovalDigest, imageErrors };
