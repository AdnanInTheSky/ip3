// Practice index (expanding rows), "who we serve" and the context block with source-gated figures.
const { T, esc, rich, n2, head, points } = require('./util');

function practice({ pg }) {
  const p = pg.practice;
  if (!p || !(p.rows || []).length) return '';
  const rows = p.rows.map((r, i) => `<li class="sx-index__row"><details${i === 0 ? ' open' : ''}><summary><span class="sx-index__n">${n2(i)}</span><h3>${esc(r.title)}</h3><i class="sx-index__plus" aria-hidden="true"></i></summary><div class="sx-index__body">${r.text ? `<p>${esc(r.text)}</p>` : ''}${points(r.points)}</div></details></li>`).join('');
  return `
<section class="section sx-practice" id="sx-practice" aria-labelledby="sx-practice-h">
  <div class="container">
    ${head(p, 'sx-practice-h', { split: !!p.lead })}
    <ol class="sx-index" data-sx-index>${rows}</ol>
  </div>
</section>`;
}

function audiences({ pg }) {
  const a = pg.audiences;
  if (!a || !(a.items || []).length) return '';
  return `
<section class="section section--tight sx-aud" aria-labelledby="sx-aud-h">
  <div class="container">
    ${head(a, 'sx-aud-h')}
    <ul class="sx-aud__grid" data-stagger>${a.items.map((it, i) => `<li class="sx-aud__item" data-tilt><span class="sx-aud__n">${n2(i)}</span><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p></li>`).join('')}</ul>
  </div>
</section>`;
}

// figures are shown only when an editor has filled in the source and not hidden the item
function context({ pg }) {
  const c = pg.context;
  if (!c) return '';
  const figs = (c.figures || []).filter((f) => !f.hidden && f.source);
  return `
<section class="section section--sand sx-ctx" aria-labelledby="sx-ctx-h">
  <div class="container sx-ctx__grid">
    <div><span class="eyebrow" data-reveal>${esc(c.eyebrow)}</span><h2 class="split" id="sx-ctx-h">${rich(c.title)}</h2></div>
    <div><p class="lead" data-reveal>${esc(c.text)}</p>${figs.length ? `<dl class="sx-figs" data-stagger>${figs.map((f) => `<div><dt>${esc(f.value)}</dt><dd>${esc(f.label)}<small>${esc(T['sx-source-label'])} ${esc(f.source)}</small></dd></div>`).join('')}</dl>` : ''}</div>
  </div>
</section>`;
}

function closing({ pg }) {
  const c = pg.closing;
  if (!c) return '';
  return `
<section class="section section--tight sx-close" aria-labelledby="sx-close-h">
  <div class="container narrow"><h2 class="split" id="sx-close-h">${rich(c.title)}</h2><p class="lead" data-reveal>${esc(c.text)}</p></div>
</section>`;
}

module.exports = { practice, audiences, context, closing };
