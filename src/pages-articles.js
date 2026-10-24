'use strict';
const { esc, page, orgId, cfg } = require('./layout');
const { articlePath } = require('../cms/articles');
const { renderMarkdown, figure } = require('../cms/article-markdown');

function renderBody(blocks) {
  let html = '', group = null;
  const close = () => { if (group) html += group === 'list-item' ? '</ul>' : '</tbody></table></div>'; group = null; };
  for (const block of blocks) {
    const grouped = ['list-item', 'table-row'].includes(block.kind) ? block.kind : null;
    if (group !== grouped) { close(); if (grouped) { group = grouped; html += group === 'list-item' ? '<ul>' : '<div class="article-table"><table><tbody>'; } }
    if (block.kind === 'heading') html += `<h2>${esc(block.text)}</h2>`;
    else if (block.kind === 'list-item') html += `<li>${esc(block.text)}</li>`;
    else if (block.kind === 'table-row') html += `<tr>${block.text.split('\t').map(cell => `<td>${esc(cell)}</td>`).join('')}</tr>`;
    else html += `<p>${esc(block.text)}</p>`;
  }
  close();
  return html;
}
function articleCard(article) {
  if (article.publicationStatus === 'in-preparation') return `<article class="ins-card article-card"><div class="ins-card__b"><span class="ins-card__t">In preparation</span><h3><a href="${articlePath(article)}">${esc(article.title)}</a></h3><p>The full article will be added after editorial review.</p></div></article>`;
  return `<article class="ins-card article-card">${article.coverImage ? `<img src="${esc(article.coverImage)}" alt="${esc(article.coverAlt)}" loading="lazy" decoding="async">` : ''}<div class="ins-card__b"><span class="ins-card__t">${esc(article.category)}</span><h3><a href="${articlePath(article)}">${esc(article.title)}</a></h3><p>${esc(article.summary)}</p></div></article>`;
}
function articlePage(article) {
  if (article.publicationStatus === 'in-preparation') return page({
    title: article.title, desc: 'This Insights article is in preparation. The full text will be added after editorial review.',
    path: articlePath(article), noindex: true,
    body: `<section class="section article-page"><div class="container article-reading"><nav aria-label="Breadcrumb"><a href="/insights">Insights</a></nav><p class="eyebrow">In preparation</p><h1>${esc(article.title)}</h1><p>This article is in preparation. The full text will be added after editorial review.</p><a class="btn btn--ghost" href="/insights">Back to Insights</a></div></section>`,
  });
  const body = `<section class="section article-page"><div class="container article-reading">
    <nav aria-label="Breadcrumb"><a href="/insights">Insights</a></nav>
    <header><p class="eyebrow">${esc(article.category)}</p><h1>${esc(article.title)}</h1>${article.publishedDate ? `<p class="small"><time datetime="${esc(article.publishedDate)}">${esc(article.publishedDate)}</time></p>` : ''}</header>
    ${article.mediaNote ? `<aside class="small" aria-label="Edition note">${esc(article.mediaNote)}</aside>` : ''}
    <article class="article-body" aria-label="${esc(article.title)}">${article.coverImage ? figure({ image: article.coverImage, alt: article.coverAlt, caption: article.coverCaption }) : ''}${renderMarkdown(article.body)}${(article.infographics || []).map(figure).join('')}</article>
    <a class="btn btn--ghost" href="/insights">Back to Insights</a>
  </div></section>`;
  const desc = article.summary.length <= 165 ? article.summary : article.summary.slice(0, 162).replace(/\s+\S*$/, '') + '…';
  return page({ title: article.title, desc, path: articlePath(article), body, ogType: 'article',
    ...(article.coverImage ? { ogImage: article.coverImage } : {}),
    jsonld: [{ '@context': 'https://schema.org', '@type': 'Article', headline: article.title, description: desc,
      mainEntityOfPage: cfg.url + articlePath(article), ...(article.publishedDate ? { datePublished: article.publishedDate } : {}),
      ...(article.coverImage ? { image: cfg.url + article.coverImage } : {}), articleSection: article.category,
      author: { '@id': orgId }, publisher: { '@id': orgId } }] });
}
module.exports = { renderBody, articleCard, articlePage };
