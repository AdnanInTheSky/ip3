// Home — "Translation, not theory". One section: what IP3 delivers (six stages), what the client receives at each stage,
// and the documented assignments that prove it. Choosing a stage opens its panel directly under that tile and filters the
// assignment cards below it, so the three parts read as one chain. Cards read their facts from content/proof.json (the
// /capabilities records); the build checks that each recorded activity is quoted word for word. Everything is in the HTML,
// so the section reads fully without JavaScript; src/js/site.js only filters, opens the panel and drives the carousel.
const { esc, rich, arrow, arrowL, btn, D } = require('../layout');
const { photoBySlug, engBySlug, focal, abbr, seed, yearOf } = require('../cap/util');

const fill = (tpl, vars) => tpl.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));

// photo for an assignment: its own recorded photo, else the matching engagement image, else the library image chosen in the CMS
function photoOf(r, ev) {
  const ph = r.photo && photoBySlug[r.photo];
  const eng = r.engagement && engBySlug[r.engagement];
  const src = ph ? ph.image : eng ? eng.image : ev.image || '';
  if (!src) return null;
  return { src, w: ph ? ph.w : 1200, h: ph ? ph.h : 900, pos: ph ? focal(ph) : '50% 50%' };
}

function plate(r, ev) {
  const p = photoOf(r, ev);
  if (p) return `<span class="dc-plate"><img src="${esc(p.src)}" width="${p.w}" height="${p.h}" alt="" loading="lazy" decoding="async" sizes="(min-width:1000px) 380px, 82vw" style="object-position:${p.pos}"></span>`;
  const at = (salt) => Math.round(seed(r.slug, salt) * 100);
  return `<span class="dc-plate dc-plate--motif" aria-hidden="true" style="--x1:${at(1)}%;--y1:${at(2)}%;--x2:${at(3)}%;--y2:${at(4)}%"><span class="dc-plate__abbr">${esc(abbr(r.client))}</span></span>`;
}

function thumb(c) {
  const p = photoOf(c.r, c.ev);
  const inner = p ? `<img src="${esc(p.src)}" width="96" height="96" alt="" loading="lazy" decoding="async" style="object-position:${p.pos}">` : `<span>${esc(abbr(c.r.client))}</span>`;
  return `<a class="dc-thumb" href="#dc-card-${esc(c.r.slug)}" data-jump="${esc(c.r.slug)}" title="${esc(c.r.short || c.r.title)}"><span class="vh">${esc(c.r.short || c.r.title)}</span>${inner}</a>`;
}

function card(c, L, b) {
  const { r, ev, stages, tone } = c;
  const status = r.status === 'current' ? b.currentLabel : yearOf(r);
  const kick = stages.map((s) => esc(s.title)).join(' / ');
  return `
      <li class="dc-card" id="dc-card-${esc(r.slug)}" data-slug="${esc(r.slug)}" data-stages="${stages.map((s) => s.n).join(' ')}" data-tone="${tone}">
        <article class="dc-card__in" aria-labelledby="dc-card-${esc(r.slug)}-t">
          <div class="dc-card__img">${plate(r, ev)}<span class="dc-card__badge${r.status === 'current' ? ' is-current' : ''}">${esc(status || '—')}</span></div>
          <p class="dc-card__k">${kick}</p>
          <h5 class="dc-card__t" id="dc-card-${esc(r.slug)}-t">${esc(r.short || r.title)}</h5>
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
  const forStage = (n) => list.filter((c) => c.stages.some((s) => s.n === n));

  // each tile and each panel carries its grid row/column for the three layouts (3, 2 and 1 columns), so a panel opens
  // directly under the row of the tile that was chosen and its notch points at that tile
  const pos = (i) => `--r3:${Math.floor(i / 3) * 2 + 1};--c3:${i % 3};--r2:${Math.floor(i / 2) * 2 + 1};--c2:${i % 2};--r1:${i * 2 + 1};--c1:0`;
  const slots = t.phases.map((p, i) => {
    const n = i + 1;
    const mine = forStage(n);
    const dels = (p.deliverables || []).map((g) => `
              <div class="dc-panel__g">${g.group ? `<em>${esc(g.group)}</em>` : ''}<ul>${g.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`).join('');
    return `
        <li class="dc-slot" style="${pos(i)}" data-tone="${n}"><section class="dc-panel" data-panel="${n}" aria-labelledby="dc-panel-${n}">
          <div class="dc-panel__col dc-panel__what">
            <h4 id="dc-panel-${n}"><i aria-hidden="true"></i>${esc(p.title)}</h4>
            <p class="dc-panel__body">${esc(p.body)}</p>
          </div>
          <div class="dc-panel__col dc-panel__dels"><span class="dc-panel__lab">${esc(L.deliverables)}</span>${dels}
          </div>
          <div class="dc-panel__col dc-panel__proof"><span class="dc-panel__lab">${esc(fill(L.proven, { count: mine.length }))}</span>
            <div class="dc-thumbs">${mine.slice(0, 7).map(thumb).join('')}${mine.length > 7 ? `<span class="dc-thumbs__more" aria-hidden="true">+${mine.length - 7}</span>` : ''}</div>
            <button type="button" class="dc-panel__go" data-go-cards>${esc(L.seeAll)}<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M12 5v13m0 0-5-5m5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
          </div>
        </section></li>`;
  }).join('');

  const tiles = t.phases.map((p, i) => `
        <li class="dc-cell" style="${pos(i)}" data-tone="${i + 1}"><button type="button" class="dc-tile" aria-pressed="false" data-stage="${i + 1}" data-tone="${i + 1}">
          <span class="dc-tile__k"><i aria-hidden="true"></i>${p.tag ? esc(p.tag) : '&nbsp;'}</span>
          <b class="dc-tile__t">${esc(p.title)}</b>
          <span class="dc-tile__l">${esc(p.quote)}</span>
          <span class="dc-tile__n"><i>${forStage(i + 1).length}</i> ${esc(L.count)}</span>
        </button></li>`).join('');

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
    <ol class="dc-grid" role="group" aria-label="${esc(L.filterLabel)}" data-stagger data-grid>${tiles}${slots}
    </ol>
    <div class="dc-bar" data-bar>
      <p class="dc-bar__count" aria-live="polite" aria-atomic="true"><b data-dc-count>${list.length}</b> ${esc(L.count)}<span class="dc-bar__stage" data-dc-stage></span></p>
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
