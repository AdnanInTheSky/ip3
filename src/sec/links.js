// Connected work: every sector page links to the same three things in the same place — the capabilities applied,
// the engagements in this sector and the published articles on it. The sector → work mappings are shared with the
// Mandate Finder (src/pages-finder.js) so the two never disagree. An empty column says so and links to the full list.
const { D, T, esc, plain, rich, capBySlug, engBySlug, L } = require('./util');
const { sectorCaps, sectorEngagements, sectorArticles } = require('../pages-finder');

const item = (href, title, meta) => `<li><a href="${href}"><b>${plain(title)}</b>${meta ? `<span>${esc(meta)}</span>` : ''}${L.arrow}</a></li>`;

function col(key, items, all) {
  const list = items.length ? `<ul>${items.join('')}</ul>` : `<p class="sx-links__none">${esc(T[`sx-links-none-${key}`])}</p>`;
  return `<div class="sx-links__col"><h3>${esc(T[`sx-links-${key}`])}</h3>${list}<a class="link" href="${all}">${esc(T[`sx-links-all-${key}`])}${L.arrow}</a></div>`;
}

function render({ s }) {
  const caps = sectorCaps(s).map((k) => capBySlug[k]).filter(Boolean).map((c) => item(`/capabilities#${c.slug}`, c.title, c.descriptor));
  const engs = sectorEngagements(s).map((k) => engBySlug[k]).filter(Boolean).map((e) => item(`/engagements#${e.slug}`, e.title, `${e.client} · ${e.year}`));
  const arts = sectorArticles(s.slug).map((a) => item(`/insights/${a.slug}`, a.title, a.category || ''));
  return `
<section class="section section--paper sx-links" id="sx-links" aria-labelledby="sx-links-h">
  <div class="container">
    <div class="section__head"><div><span class="eyebrow" data-reveal>${esc(D.headings['sector-related'].eyebrow)}</span><h2 class="split" id="sx-links-h">${rich(D.headings['sector-related'].title)}</h2></div></div>
    <div class="sx-links__grid" data-stagger>${col('capabilities', caps, '/capabilities')}${col('engagements', engs, '/engagements')}${col('insights', arts, '/insights')}</div>
    <p class="sx-links__finder" data-reveal><a class="link" href="/find-support">${esc(T['sx-links-finder'])}${L.arrow}</a></p>
  </div>
</section>`;
}

module.exports = { render };
