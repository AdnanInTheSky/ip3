// Field gallery: a responsive editorial grid with permanent descriptive captions and user-controlled films.
const { T, esc, n2, head, media } = require('./util');

function render({ pg }) {
  const g = pg.gallery;
  const items = (g.items || []).filter((it) => !it.hidden);
  if (!items.length) return '';
  const lis = items.map((it, i) => {
    const kind = it.video ? T['sx-film-label'] : T['sx-photo-label'];
    const captionId = `sx-gallery-caption-${i + 1}`;
    const visual = it.video
      ? `<video class="sx-gal__m" controls playsinline preload="none" poster="${esc(it.image)}" aria-label="${esc(it.alt || it.caption || kind)}" aria-describedby="${captionId}"><source src="${esc(it.video)}" type="video/mp4"></video>`
      : media({ image: it.image, alt: it.alt, cls: 'sx-gal__m' });
    return `<li class="sx-gal__item${it.video ? ' is-film' : ''}" data-sx-gal-item><figure><div class="sx-gal__frame">${visual}</div><figcaption id="${captionId}"><span class="sx-gal__k">${esc(kind)} ${n2(i)}</span>${esc(it.caption)}</figcaption></figure></li>`;
  }).join('');
  return `
<section class="sx-gal on-dark dark" id="sx-gallery" data-sx-gal aria-labelledby="sx-gallery-h">
  <div class="container sx-gal__head">${head(g, 'sx-gallery-h', { split: !!g.lead })}</div>
  <div class="container sx-gal__stage">
    <ul class="sx-gal__world" role="list" data-sx-gal-world>${lis}</ul>
  </div>
</section>`;
}

module.exports = { render };
