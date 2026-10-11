// The six capability rows, each followed by the evidence for it: the assignments that prove it (opening in the assignment browser),
// photos from the room, a related film, and the call to action.
const { D, T, esc, plain, arrow, engBySlug, caps, proofFor, photosFor, videosFor, photoCaption, focal, thumb, pillarDots, periodShort } = require('./util');
const { head } = require('./shared');

const MAX = 8;

/* The expandable detail under each capability row: what the capability includes, plus related engagements */
function capMore(c) {
  const items = c.groups.map((g) => `<section class="capmore__item"><h5>${esc(g.title)}</h5>${g.text ? `<p>${esc(g.text)}</p>` : ''}<ul class="checks">${g.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></section>`).join('');
  const engs = (c.engagements || []).map((k) => engBySlug[k]).filter(Boolean).map((e) => `<li><a class="link" href="/engagements#${e.slug}">${esc(e.title)}${arrow}</a></li>`).join('');
  return `<details class="capmore"><summary><span>${esc(D.headings['capability-includes'].title)}</span><i>${c.groups.length}</i></summary><div class="capmore__grid">${items}</div>${engs ? `<div class="capmore__engs"><h4>${esc(D.headings['capability-related'].title)}</h4><ul>${engs}</ul></div>` : ''}</details>`;
}

// "Multilateral 9 · Government of Bangladesh 3": who commissioned the assignments behind this capability
function clients(list) {
  const n = {};
  list.forEach((p) => { n[p.clientType] = (n[p.clientType] || 0) + 1; });
  return Object.entries(n).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<span>${esc(T.browser.clientTypes[k] || k)} <b>${v}</b></span>`).join('');
}

const mini = (p) => `<li class="cp-mini"><a href="#proof-${esc(p.slug)}" data-cp-open="${esc(p.slug)}" data-tilt>${thumb(p, { sizes: '260px' })}<span class="cp-mini__meta cp-mono"><span>${esc(p.client)}</span>${periodShort(p) ? `<span>${esc(periodShort(p))}</span>` : ''}</span><b class="cp-mini__t">${esc(p.short)}</b>${pillarDots(p.pillars, { decorative: true })}</a></li>`;

function row(c) {
  const r = T.rows;
  const list = proofFor(c.slug);
  const pics = photosFor(c.slug).slice(0, 3);
  const film = videosFor(c.slug)[0];
  const more = list.length > MAX ? `<li class="cp-mini cp-mini--more"><a href="#cp-proof" data-cp-filter="${c.slug}"><b>${list.length - MAX}+</b><span>${esc(r.proofMore)}</span>${arrow}</a></li>` : '';
  const sectors = D.sectors.filter((s) => s.caps.includes(c.slug)).slice(0, 4).map((s) => `<a class="chip" href="/sectors/${s.slug}">${esc(s.title.split(',')[0].split(' & ')[0])}</a>`).join('');
  return `
  <article class="caprow cp-row" id="${c.slug}" data-tone="${c.i + 1}" aria-labelledby="${c.slug}-h">
    <div class="n" aria-hidden="true">${c.n}</div>
    <div class="cp-row__a">
      <p class="cp-mono cp-row__desc">${esc(c.descriptor)}</p>
      <h3 id="${c.slug}-h">${plain(c.title)}</h3>
      <q>“${esc(c.problem)}”</q>
      <p class="caprow__intro">${esc(c.intro)}</p>
    </div>
    <div class="cp-row__b">
      <h4>${esc(r.taskLabel)}</h4><p class="cp-row__task">${esc(c.task)}</p>
      <h4>${esc(r.clientsLabel)}</h4><p class="cp-row__clients">${clients(list)}</p>
      <h4>${esc(D.headings['capability-deliverables'].title)}</h4><div class="chips">${c.deliverables.map((d) => `<span class="chip">${esc(d)}</span>`).join('')}</div>
      ${sectors ? `<h4>${esc(D.headings['capability-applied'].title)}</h4><div class="chips">${sectors}</div>` : ''}
    </div>
    ${capMore(c)}
    <div class="cp-row__proof">
      <div class="cp-row__bar"><h4>${esc(r.proofLabel)} <i>${list.length}</i></h4><a class="link" href="#cp-proof" data-cp-filter="${c.slug}">${esc(r.proofMore)}${arrow}</a></div>
      <ul class="cp-strip" aria-label="${esc(r.proofLabel)}: ${esc(plain(c.title))}">${list.slice(0, MAX).map(mini).join('')}${more}</ul>
      <div class="cp-row__foot">
        ${pics.length ? `<div class="cp-row__room"><h4>${esc(r.roomLabel)}</h4><ul>${pics.map((p) => `<li><a href="#room-${esc(p.slug)}" data-cp-photo="${esc(p.slug)}"><img src="${esc(p.image)}" width="${p.w}" height="${p.h}" alt="${esc(photoCaption(p))}" loading="lazy" decoding="async" style="object-position:${focal(p)}"></a></li>`).join('')}</ul></div>` : ''}
        ${film ? `<div class="cp-row__film"><h4>${esc(r.filmLabel)}</h4><a class="cp-filmchip" href="#reel-${esc(film.slug)}" data-cp-film="${esc(film.slug)}"><span class="cp-filmchip__play" aria-hidden="true"></span><span>${esc(film.title)}</span><span class="cp-mono">${esc(film.runtime)}</span></a></div>` : ''}
        <a class="btn btn--sm cp-row__cta" href="/contact">${esc(c.ctaLabel)}${arrow}</a>
      </div>
    </div>
  </article>`;
}

function render() {
  return `
<section class="section cp-rows" id="cp-capabilities" aria-labelledby="cp-capabilities-h">
  <div class="container">
    ${head(T.rows, 'cp-capabilities-h', true)}
    ${caps.map(row).join('')}
  </div>
</section>`;
}

module.exports = { render };
