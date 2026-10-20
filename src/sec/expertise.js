// Where we add value (the sector's focus areas) beside the capabilities applied — both from content/sectors.json.
const { D, T, esc, plain, rich, n2, capBySlug, L } = require('./util');
const { sectorCaps } = require('../pages-finder');

function render({ s }) {
  const h = D.headings['sector-add-value'];
  const caps = sectorCaps(s).map((k) => capBySlug[k]).filter(Boolean);
  return `
<section class="section section--sand sx-exp" id="sx-expertise" aria-labelledby="sx-exp-h">
  <div class="container sx-exp__grid">
    <div class="sx-exp__areas">
      <span class="eyebrow" data-reveal>${esc(h.eyebrow)}</span>
      <h2 class="split" id="sx-exp-h">${rich(h.title)}</h2>
      <ol class="sx-areas" data-stagger>${s.areas.map((a, i) => `<li><span>${n2(i)}</span>${plain(a)}</li>`).join('')}</ol>
      <p class="sx-exp__intro" data-reveal>${esc(T['sector-introduction'])}</p>
      <div class="sx-exp__btns" data-reveal>${L.btn(esc(T['cta-discuss-assignment']), '/contact')}${L.btn(esc(T['cta-all-sectors']), '/sectors', 'btn--ghost')}</div>
    </div>
    <div class="sx-exp__caps">
      ${L.sectionHead('sector-capabilities')}
      <div class="sx-caps" data-stagger>${caps.map((c) => `<a class="sx-cap" href="/capabilities#${c.slug}"><span class="sx-cap__n">${n2(c.i)}</span><h3>${plain(c.title)}</h3><p>${esc(c.problem)}</p><i aria-hidden="true">${L.arrow}</i></a>`).join('')}</div>
    </div>
  </div>
</section>`;
}

module.exports = { render };
