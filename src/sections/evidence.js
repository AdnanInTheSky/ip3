// Home — "Engagements & insights": one section for the work IP3 has delivered (engagements), the thinking behind it
// (insights) and the published record (publications). One filterable carousel/grid, same bar and card grammar as the
// delivery section above. All words come from content/engagements.json, content/insights.json and content/home/evidence.json.
const { esc, rich, arrow, arrowL, btn, D } = require('../layout');
const { seed } = require('../cap/util');

const trim = (s, n) => (s.length > n ? s.slice(0, n - 3).replace(/\s+\S*$/, '') + '…' : s);

function plate(img, key, text) {
  if (img) return `<span class="ev-plate"><img src="${esc(img)}" width="900" height="600" alt="" loading="lazy" decoding="async" sizes="(min-width:1000px) 380px, 82vw"></span>`;
  const at = (salt) => Math.round(seed(key, salt) * 100);
  return `<span class="ev-plate ev-plate--motif" aria-hidden="true" style="--x1:${at(1)}%;--y1:${at(2)}%;--x2:${at(3)}%;--y2:${at(4)}%"><span class="ev-plate__big">${esc(text)}</span></span>`;
}

function card(c, labels) {
  const ext = /^https?:/.test(c.href);
  return `
      <li class="ev-card" data-kind="${c.kind}" data-tone="${c.tone}">
        <article class="ev-card__in" aria-labelledby="ev-${esc(c.id)}">
          <div class="ev-card__img">${plate(c.image, c.id, c.big)}<span class="ev-card__badge">${esc(c.badge)}</span></div>
          <p class="ev-card__k">${esc(c.kicker)}</p>
          <h3 class="ev-card__t" id="ev-${esc(c.id)}">${esc(c.title)}</h3>
          ${c.by ? `<p class="ev-card__by">${esc(labels.by)} ${esc(c.by)}</p>` : ''}
          <p class="ev-card__p">${esc(c.text)}</p>
          ${c.tags && c.tags.length ? `<div class="chips">${c.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>` : ''}
          <a class="link ev-card__open" href="${esc(c.href)}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(c.cta)}<span class="vh">: ${esc(c.title)}</span>${arrow}</a>
        </article>
      </li>`;
}

function evidence() {
  const E = D.evidence;
  const labels = E.labels;
  const he = D.headings['home-engagements'];
  const hi = D.headings['home-insights'];

  const eng = D.engagements.map((e) => ({
    kind: 'engagements', tone: 1, id: 'e-' + e.slug, image: e.image, big: e.client, badge: e.year,
    kicker: [e.client, e.sector].join(' · '), title: e.title, text: e.summary, tags: e.tags,
    href: `/sectors/${e.sectorSlug}`, cta: labels.openEngagement,
  }));
  const ins = D.insights.map((i, k) => ({
    kind: 'insights', tone: 2, id: 'i-' + k, image: i.image, big: i.type, badge: i.type,
    kicker: i.type, title: i.title, text: trim(i.text, 190), tags: i.tags, href: E.links.insights, cta: labels.openInsight,
  }));
  const pub = D.publications.map((p, k) => ({
    kind: 'publications', tone: 4, id: 'p-' + k, image: '', big: String(p.year), badge: p.kind,
    kicker: [p.kind, p.year].join(' · '), title: p.title, by: p.authors, text: p.summary, tags: [p.publisher.split(',')[0]],
    href: p.href || E.links.insights, cta: labels.openPublication,
  }));
  // interleave the three kinds so the carousel alternates between work, thinking and publications
  const groups = [eng, ins, pub];
  const list = [];
  for (let i = 0; groups.some((g) => i < g.length); i++) groups.forEach((g) => { if (g[i]) list.push(g[i]); });

  const n = { all: list.length, engagements: eng.length, insights: ins.length, publications: pub.length };
  const pill = (key, label, on) => `<button type="button" class="ev-pill" aria-pressed="${on}" data-kind="${key === 'all' ? '' : key}"${key !== 'all' ? ` data-tone="${{ engagements: 1, insights: 2, publications: 4 }[key]}"` : ''}>${esc(label)} <i>${n[key]}</i></button>`;

  return `
<section class="section section--paper ev" id="insights" aria-labelledby="ev-title" data-ev>
  <span id="engagements" class="ev__anchor" aria-hidden="true"></span>
  <div class="container">
    <div class="ev__head">
      <div class="ev__title-wrap"><span class="eyebrow" data-reveal>${esc(hi.eyebrow)}</span><h2 class="split ev__title" id="ev-title">${rich(he.title)}</h2></div>
      <div class="ev__lead"><p class="lead" data-reveal>${esc(he.lead)} ${esc(hi.lead)}</p>
        <div class="ev__cta" data-reveal>${btn(esc(D.pageText.home['cta-all-engagements']), E.links.engagements, 'btn--ghost')}${btn(esc(D.pageText.home['cta-all-insights']), E.links.insights, 'btn--ghost')}</div>
      </div>
    </div>
    <div class="ev-bar">
      <div class="ev-pills" role="group" aria-label="${esc(labels.filter)}">${pill('all', labels.all, true)}${pill('engagements', labels.engagements, false)}${pill('insights', labels.insights, false)}${pill('publications', labels.publications, false)}</div>
      <p class="ev-bar__count" aria-live="polite" aria-atomic="true"><b data-ev-count>${n.all}</b> ${esc(labels.count)}</p>
      <div class="ev-view" role="group" aria-label="${esc(labels.view)}"><button type="button" aria-pressed="true" data-view="carousel">${esc(labels.carousel)}</button><button type="button" aria-pressed="false" data-view="grid">${esc(labels.grid)}</button></div>
    </div>
    <div class="ev-deck" data-view="carousel" data-ev-deck>
      <ul class="ev-cards" data-ev-cards>${list.map((c) => card(c, labels)).join('')}
      </ul>
      <div class="ev-deck__nav" data-ev-nav hidden><button type="button" class="ev-deck__btn" data-dir="-1" aria-label="${esc(D.capProof.browser.prevLabel)}">${arrowL}</button><span class="ev-deck__bar" aria-hidden="true"><i></i></span><button type="button" class="ev-deck__btn" data-dir="1" aria-label="${esc(D.capProof.browser.nextLabel)}">${arrow}</button></div>
    </div>
  </div>
</section>`;
}

module.exports = { evidence };
