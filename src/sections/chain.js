// Home — "Translation, not theory". One section: what IP3 delivers (six stages), what the client receives at each stage,
// and the documented assignments that prove it. Cards read their facts from content/proof.json (the /capabilities records);
// the build checks that each recorded activity is quoted word for word. Everything is in the HTML, so the section reads
// fully without JavaScript; src/js/site.js only filters the cards by stage and drives the carousel.
const { esc, rich, arrow, arrowL, btn, D } = require('../layout');
const { photoBySlug, engBySlug, focal, abbr, seed, yearOf } = require('../cap/util');

const pad = (n) => String(n).padStart(2, '0');
const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

// plate for an assignment: its photo, else the matching engagement image, else a generated contour motif with the client monogram
function plate(r, tone) {
  const ph = r.photo && photoBySlug[r.photo];
  const eng = r.engagement && engBySlug[r.engagement];
  const src = ph ? ph.image : eng ? eng.image : '';
  if (src) {
    const dims = ph ? `width="${ph.w}" height="${ph.h}"` : 'width="1200" height="900"';
    return `<span class="dc-plate"><img src="${esc(src)}" ${dims} alt="" loading="lazy" decoding="async" sizes="(min-width:1000px) 340px, 82vw"${ph ? ` style="object-position:${focal(ph)}"` : ''}></span>`;
  }
  const at = (salt) => Math.round(seed(r.slug, salt) * 100);
  return `<span class="dc-plate dc-plate--motif" aria-hidden="true" style="--x1:${at(1)}%;--y1:${at(2)}%;--x2:${at(3)}%;--y2:${at(4)}%"><span class="dc-plate__abbr">${esc(abbr(r.client))}</span></span>`;
}

function card(c, L, b) {
  const { r, ev, stages, tone } = c;
  const status = r.status === 'current' ? b.currentLabel : yearOf(r);
  const kick = stages.map((s) => `${fill(L.stage, { n: pad(s.n) })} · ${esc(s.title)}`).join(' / ');
  return `
      <li class="dc-card" data-stages="${stages.map((s) => s.n).join(' ')}" data-tone="${tone}">
        <article class="dc-card__in" aria-labelledby="dc-card-${esc(r.slug)}">
          <div class="dc-card__img">${plate(r, tone)}<span class="dc-card__badge${r.status === 'current' ? ' is-current' : ''}">${esc(status || '—')}</span></div>
          <p class="dc-card__k">${kick}</p>
          <h5 class="dc-card__t" id="dc-card-${esc(r.slug)}">${esc(r.short || r.title)}</h5>
          <p class="dc-card__client"><span class="vh">${esc(b.clientLabel)}: </span>${esc(r.client)}</p>
          <dl class="dc-card__meta">
            <div><dt>${esc(L.role)}</dt><dd>${esc(r.role)}</dd></div>
            <div><dt>${esc(L.period)}</dt><dd>${esc(r.period || b.withheldLabel)}</dd></div>
          </dl>
          ${r.impact ? `<p class="dc-card__imp"><b>${esc(L.impact)}</b>${esc(r.impact)}</p>` : ''}
          <p class="dc-card__act"><b>${esc(L.activity)}</b>${esc(ev.activity || r.summary)}</p>
          <a class="link dc-card__open" href="/capabilities#proof-${esc(r.slug)}">${esc(b.openLabel)}<span class="vh">: ${esc(r.title)}</span>${arrow}</a>
        </article>
      </li>`;
}

function chainSection() {
  const t = D.translation;
  const L = t.labels;
  const b = D.capProof.browser;
  const bySlug = Object.fromEntries(D.proof.map((r) => [r.slug, r]));
  const stages = t.phases.map((p, i) => ({ n: i + 1, title: p.title }));

  // one card per assignment; an assignment used in two stages lists both
  const cards = new Map();
  t.phases.forEach((p, i) => (p.evidence || []).forEach((ev) => {
    const r = bySlug[ev.record];
    if (!r || r.hidden) return;
    if (cards.has(r.slug)) cards.get(r.slug).stages.push(stages[i]);
    else cards.set(r.slug, { r, ev, stages: [stages[i]], tone: i + 1 });
  }));
  const list = [...cards.values()];
  const countFor = (n) => list.filter((c) => c.stages.some((s) => s.n === n)).length;

  const tiles = t.phases.map((p, i) => `
        <li><button type="button" class="dc-tile" aria-pressed="false" data-stage="${i + 1}" data-tone="${i + 1}">
          <span class="dc-tile__k">${esc(fill(L.stage, { n: pad(i + 1) }))}${p.tag ? ` &bull; ${esc(p.tag)}` : ''}</span>
          <b class="dc-tile__t">${esc(p.title)}</b>
          <span class="dc-tile__l">${esc(p.quote)}</span>
          <span class="dc-tile__n"><i>${countFor(i + 1)}</i> ${esc(L.count)}</span>
        </button></li>`).join('');

  const panels = t.phases.map((p, i) => `
      <section class="dc-panel" data-panel="${i + 1}" data-tone="${i + 1}" aria-labelledby="dc-panel-${i + 1}">
        <h4 id="dc-panel-${i + 1}"><b>${pad(i + 1)}</b> ${esc(p.title)}</h4>
        <p class="dc-panel__body">${esc(p.body)}</p>
        <div class="dc-panel__dels"><span>${esc(L.deliverables)}</span>
          ${(p.deliverables || []).map((g) => `<div class="dc-panel__g">${g.group ? `<em>${esc(g.group)}</em>` : ''}<ul>${g.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('')}
        </div>
      </section>`).join('');

  const explore = btn(esc(D.pageText.home['cta-explore-capabilities']), '/capabilities');
  return `
<section class="section section--dark on-dark dark dc" id="translation" aria-labelledby="dc-title" data-chain>
  <div class="container">
    <div class="dc__intro">
      <div class="dc__head">
        <span class="eyebrow" data-reveal>${esc(t.eyebrow)}</span>
        <h2 class="split dc__title" id="dc-title">${rich(t.h2)}</h2>
      </div>
      <div class="dc__lead">
        <p class="lead" data-reveal>${esc(t.body)}</p>
        <div class="dc__cta" data-reveal>${explore}</div>
      </div>
    </div>
    <p class="dc__bridge" data-reveal>${esc(t.bridge)}</p>
    <ol class="dc-tiles" role="group" aria-label="${esc(L.filterLabel)}" data-stagger>${tiles}
    </ol>
    <div class="dc-panels" data-panels>${panels}
    </div>
    <div class="dc-bar">
      <p class="dc-bar__count" aria-live="polite" aria-atomic="true"><b data-dc-count>${list.length}</b> ${esc(L.count)}</p>
      <button type="button" class="dc-bar__all" data-stage-all hidden>${esc(L.allAssignments)}</button>
      <div class="dc-view" role="group" aria-label="${esc(L.viewLabel)}"><button type="button" aria-pressed="true" data-view="carousel">${esc(L.carouselLabel)}</button><button type="button" aria-pressed="false" data-view="grid">${esc(L.gridLabel)}</button></div>
    </div>
    <div class="dc-deck" data-view="carousel" data-deck>
      <ul class="dc-cards" aria-label="${esc(L.chain)}" data-cards>${list.map((c) => card(c, L, b)).join('')}
      </ul>
      <div class="dc-deck__nav" data-deck-nav hidden><button type="button" class="dc-deck__btn" data-dir="-1" aria-label="${esc(b.prevLabel)}">${arrowL}</button><span class="dc-deck__bar" aria-hidden="true"><i></i></span><button type="button" class="dc-deck__btn" data-dir="1" aria-label="${esc(b.nextLabel)}">${arrow}</button></div>
    </div>
    <p class="dc__attr small">${esc(t.attribution)}</p>
    <div class="dc__close">
      <p class="dc__closing display split">${rich(t.closing)}</p>
      <div class="dc__close-row">
        ${explore}
        <a class="link" href="/capabilities#cp-proof">${esc(L.all)}${arrow}</a>
      </div>
    </div>
  </div>
</section>`;
}

module.exports = { chainSection };
