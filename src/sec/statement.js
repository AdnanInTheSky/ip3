// Opening statement: one large sentence whose words light up as the reader scrolls past, the paragraphs under it,
// and optional principle tiles. Without JavaScript the sentence is simply shown at full strength.
const { esc, rich, n2 } = require('./util');

function render({ pg, idx }) {
  const st = pg.statement;
  const tiles = (st.principles || []).length
    ? `<ul class="sx-principles" data-stagger>${st.principles.map((p, i) => `<li><span class="sx-principles__n">${n2(i)}</span><b>${esc(p.title)}</b><span>${esc(p.text)}</span></li>`).join('')}</ul>`
    : '';
  return `
<section class="section sx-state" id="sx-statement" aria-labelledby="sx-statement-h">
  <div class="container sx-state__grid">
    <div class="sx-state__aside"><span class="eyebrow" data-reveal>${esc(st.eyebrow)}</span><span class="sx-state__glyph" aria-hidden="true">${n2(idx)}</span></div>
    <div class="sx-state__main">
      <h2 class="sx-lit" id="sx-statement-h" data-sx-lit>${rich(st.title)}</h2>
      <div class="sx-state__body">${st.paragraphs.map((p) => `<p data-reveal>${esc(p)}</p>`).join('')}</div>
      ${tiles}
    </div>
  </div>
</section>`;
}

module.exports = { render };
