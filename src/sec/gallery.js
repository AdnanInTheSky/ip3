// Field gallery: photos and films placed at different depths. On wide screens with motion allowed, the camera flies through them as
// the page scrolls (src/js/sec/50-gallery.js); otherwise they form a swipeable row. Captions state only what each item shows.
const { T, esc, n2, head, media } = require('./util');

function render({ pg }) {
  const g = pg.gallery;
  const items = (g.items || []).filter((it) => !it.hidden);
  if (!items.length) return '';
  const lis = items.map((it, i) => {
    const kind = it.video ? T['sx-film-label'] : T['sx-photo-label'];
    return `<li class="sx-gal__item${it.video ? ' is-film' : ''}" style="--i:${i}" data-sx-gal-item><figure><div class="sx-gal__frame">${media({ image: it.image, video: it.video, alt: it.alt, cls: 'sx-gal__m' })}</div><figcaption><span class="sx-gal__k">${esc(kind)} ${n2(i)}</span>${esc(it.caption)}</figcaption></figure></li>`;
  }).join('');
  return `
<section class="sx-gal on-dark dark" id="sx-gallery" data-sx-gal aria-labelledby="sx-gallery-h" style="--n:${items.length}">
  <div class="container sx-gal__head">${head(g, 'sx-gallery-h', { split: !!g.lead })}</div>
  <div class="sx-gal__stage">
    <ul class="sx-gal__world" data-sx-gal-world>${lis}</ul>
    <p class="sx-gal__hint" aria-hidden="true">${esc(T['sx-gallery-hint'])}</p>
  </div>
</section>`;
}

module.exports = { render };
