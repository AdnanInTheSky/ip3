// The assignment browser: filter chips, a carousel (or grid) of all documented assignments, and a record sheet per assignment.
// The full record of every assignment is rendered once, in the all-assignments list below the carousel (no-JS and SEO base);
// the record sheet dialog clones it from there, so there is a single source in the HTML.
const { T, esc, plain, strip, arrow, arrowL, caps, capBySlug, engBySlug, proof, photoBySlug, photoCaption, focal, abbr, yearOf, thumb, pillarDots, periodShort } = require('./util');
const { head } = require('./shared');

// newest first; records whose dates are withheld go last
const byDate = (a, b) => (yearOf(b) || '0').localeCompare(yearOf(a) || '0') || (a.status === 'current' ? -1 : 0) - (b.status === 'current' ? -1 : 0);

function card(p, i) {
  const c = capBySlug[p.caps[0]];
  const yr = periodShort(p);
  const meta = [p.client, c ? c.short : '', yearOf(p)].filter(Boolean).map(esc).join(' · ');
  return `<li class="cp-card" data-caps="${p.caps.join(' ')}" data-o="${i}" data-tone="${c ? c.i + 1 : 1}">
        <a class="cp-card__a" href="#proof-${esc(p.slug)}" data-cp-open="${esc(p.slug)}">
          <span class="cp-card__img">${thumb(p, { sizes: '(min-width:900px) 340px, 82vw', mono: false })}<span class="cp-card__badge cp-mono${p.status === 'current' ? ' is-current' : ''}">${esc(yr || '—')}</span><span class="cp-card__glyph" aria-hidden="true">${esc(abbr(p.client))}</span></span>
          <b class="cp-card__t">${esc(p.short)}</b>
          <span class="cp-card__meta cp-mono">${meta}</span>
          ${pillarDots(p.pillars, { decorative: true })}
        </a>
      </li>`;
}

// one full record: what the record sheet shows
function record(p) {
  const b = T.browser;
  const eng = p.engagement && engBySlug[p.engagement];
  const ph = p.photo && photoBySlug[p.photo];
  const row = (k, v) => (v ? `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>` : '');
  const legend = ['e', 'd', 't', 'r'].map((k, i) => `<li><b>${'EDTR'[i]}</b> ${esc(b.pillarNames[k])}: ${esc(b.pillarLevels[p.pillars[i]])}</li>`).join('');
  return `<li class="cp-rec" id="proof-${esc(p.slug)}" data-slug="${esc(p.slug)}">
        <article class="cp-rec__in" aria-labelledby="proof-${esc(p.slug)}-h">
          <p class="cp-fx"><span class="cp-fx__k" aria-hidden="true">fx</span><span class="vh">${esc(b.sourceLabel)}: </span><code>${esc(p.source)}</code></p>
          <p class="cp-mono cp-rec__k">${esc(p.ref)} · ${p.caps.filter((s) => capBySlug[s]).map((s) => esc(capBySlug[s].short)).join(' · ')}${p.status === 'current' ? ` · <span class="is-current">${esc(b.currentLabel)}</span>` : ''}</p>
          <h3 id="proof-${esc(p.slug)}-h">${esc(p.title)}</h3>
          <dl class="cp-rec__dl">${row(b.clientLabel, p.client)}${row(b.roleLabel, p.role)}${row(b.periodLabel, p.period || b.withheldLabel)}${row(b.referenceLabel, p.reference)}${row(b.locationLabel, p.location)}</dl>
          ${p.scope && p.scope.value ? `<p class="cp-rec__scope"><b>${esc(p.scope.value)}</b><span>${esc(p.scope.label)}</span><span class="cp-mono">${esc(b.scopeLabel)}</span></p>` : ''}
          <p class="cp-rec__sum">${esc(p.summary)}</p>
          ${p.activities && p.activities.length ? `<h4>${esc(b.activitiesLabel)}</h4><ul class="checks">${p.activities.map((a) => `<li>${esc(a)}</li>`).join('')}</ul>` : ''}
          ${p.methods && p.methods.length ? `<h4>${esc(b.methodsLabel)}</h4><div class="chips">${p.methods.map((m) => `<span class="chip">${esc(m)}</span>`).join('')}</div>` : ''}
          <div class="cp-rec__pillars"><h4>${esc(b.pillarsLabel)}</h4>${pillarDots(p.pillars)}<ul class="cp-mono">${legend}</ul></div>
          <h4>${esc(b.capsLabel)}</h4><div class="chips">${p.caps.filter((s) => capBySlug[s]).map((s) => `<a class="chip" href="#${s}" data-tone="${capBySlug[s].i + 1}">${esc(plain(capBySlug[s].title))}</a>`).join('')}</div>
          ${eng ? `<p class="cp-rec__eng"><span class="cp-mono">${esc(b.engagementLabel)}</span><a class="link" href="/engagements#${esc(eng.slug)}">${esc(eng.title)}${arrow}</a></p>` : ''}
          ${p.note ? `<p class="cp-rec__note">${esc(p.note)}</p>` : ''}
          ${ph ? `<figure class="cp-rec__photo"><img src="${esc(ph.image)}" width="${ph.w}" height="${ph.h}" alt="${esc(ph.alt)}" loading="lazy" decoding="async" style="object-position:${focal(ph)}"><figcaption class="cp-mono">${esc(b.photoLabel)} · ${esc(photoCaption(ph))}</figcaption></figure>` : ''}
        </article>
      </li>`;
}

function render() {
  const b = T.browser;
  const sorted = [...proof].sort(byDate);
  const count = (slug) => proof.filter((p) => p.caps.includes(slug)).length;
  const filters = [`<button type="button" class="cp-filter" aria-pressed="true" data-cap="">${esc(b.allLabel)} <i>${proof.length}</i></button>`, ...caps.map((c) => `<button type="button" class="cp-filter" aria-pressed="false" data-cap="${c.slug}" data-tone="${c.i + 1}">${esc(c.short)} <i>${count(c.slug)}</i></button>`)].join('');
  return `
<section class="section section--dark on-dark dark cp-proof" id="cp-proof" aria-labelledby="cp-proof-h">
  <div class="container">
    ${head(b, 'cp-proof-h', true)}
    <div class="cp-proof__bar">
      <div class="cp-filters" role="group" aria-label="${esc(b.filterLabel)}">${filters}</div>
      <div class="cp-proof__right">
        <p class="cp-mono cp-proof__count" aria-live="polite" aria-atomic="true"><b>${proof.length}</b> ${esc(b.countLabel)}</p>
        <div class="cp-view" role="group" aria-label="${esc(b.viewLabel)}"><button type="button" aria-pressed="true" data-view="carousel">${esc(b.carouselLabel)}</button><button type="button" aria-pressed="false" data-view="grid">${esc(b.gridLabel)}</button></div>
      </div>
    </div>
    <div class="cp-deck" data-view="carousel">
      <ul class="cp-cards" aria-label="${esc(strip(b.title))}">${sorted.map(card).join('')}
      </ul>
      <div class="cp-deck__nav"><button type="button" class="cp-deck__btn" data-dir="-1" aria-label="${esc(b.prevLabel)}">${arrowL}</button><span class="cp-deck__bar" aria-hidden="true"><i></i></span><button type="button" class="cp-deck__btn" data-dir="1" aria-label="${esc(b.nextLabel)}">${arrow}</button></div>
    </div>
    <p class="cp-proof__note">${esc(b.note)}</p>
    <details class="cp-index" id="proof-index">
      <summary><span>${esc(b.indexTitle)}</span><i>${proof.length}</i></summary>
      <ol class="cp-index__list">${sorted.map(record).join('')}
      </ol>
    </details>
  </div>
  <dialog class="cp-sheet" aria-labelledby="cp-sheet-h">
    <div class="cp-sheet__top"><span class="cp-mono" data-pos></span><button type="button" class="cp-sheet__x" data-close aria-label="${esc(b.closeLabel)}"><span aria-hidden="true">×</span></button></div>
    <div class="cp-sheet__body" data-body data-lenis-prevent></div>
    <div class="cp-sheet__foot"><button type="button" class="cp-sheet__nav" data-step="-1">${arrowL}<span>${esc(b.prevRecordLabel)}</span></button><a class="btn btn--sm" href="${esc(b.ctaHref)}">${esc(b.ctaLabel)}${arrow}</a><button type="button" class="cp-sheet__nav" data-step="1"><span>${esc(b.nextRecordLabel)}</span>${arrow}</button></div>
  </dialog>
</section>`;
}

module.exports = { render };
