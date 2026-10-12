// Next-sector portal: the next sector's photo opens from a small window to a wide frame as the reader reaches the end of the page,
// and the whole frame links to that sector. The previous sector is a plain link beside it.
const { D, T, esc, n2, L } = require('./util');

function render({ idx }) {
  const n = D.sectors.length;
  const prev = D.sectors[(idx + n - 1) % n];
  const nextIdx = (idx + 1) % n;
  const next = D.sectors[nextIdx];
  const nav = D.navigation;
  return `
<section class="sx-next on-dark dark" id="sx-next" data-sx-next aria-label="${esc(T['sx-next-aria'])}">
  <div class="container">
    <a class="sx-next__portal" href="/sectors/${next.slug}">
      <span class="sx-next__media" data-sx-next-media><img src="${esc(next.photo)}" alt="" loading="lazy" decoding="async"></span>
      <span class="sx-next__copy">
        <small>${esc(nav.nextSectorLabel)} →</small>
        <span class="sx-next__n" aria-hidden="true">${n2(nextIdx)}</span>
        <strong>${esc(next.title)}</strong>
        <span class="sx-next__p">${esc(next.problem)}</span>
      </span>
    </a>
    <div class="sx-next__foot">
      <a class="link" href="/sectors/${prev.slug}">${L.arrowL}<span>${esc(nav.previousSectorLabel)}: ${esc(prev.title)}</span></a>
      <a class="link" href="/sectors">${esc(D.pageText.sectors['cta-all-sectors'])}${L.arrow}</a>
    </div>
  </div>
</section>`;
}

module.exports = { render };
