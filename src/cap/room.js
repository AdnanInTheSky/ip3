// "In the room": the meeting photos as a 3D coverflow (a plain scroll-snap strip without JS, on touch screens and with reduced motion).
// Captions state only what the photograph shows: event · place · year from the record, plus the capabilities it relates to.
const { T, esc, plain, arrow, arrowL, capBySlug, photos, photoCaption, focal } = require('./util');
const { head } = require('./shared');

function render() {
  const r = T.room;
  const items = photos.map((p, i) => `
        <li class="cp-flow__item" id="room-${esc(p.slug)}" data-i="${i}">
          <figure>
            <a class="cp-flow__open" href="${esc(p.image)}" data-cp-photo="${esc(p.slug)}"><img src="${esc(p.image)}" width="${p.w}" height="${p.h}" alt="${esc(p.alt)}" loading="lazy" decoding="async" style="object-position:${focal(p)}" draggable="false"></a>
            <figcaption><span class="cp-mono">${esc(photoCaption(p))}</span><span class="cp-flow__caps">${p.caps.filter((c) => capBySlug[c]).map((c) => `<a class="chip" href="#${c}" data-tone="${capBySlug[c].i + 1}">${esc(capBySlug[c].short)}</a>`).join('')}</span></figcaption>
          </figure>
        </li>`).join('');
  return `
<section class="section section--sand cp-room" id="cp-room" aria-labelledby="cp-room-h">
  <div class="container">
    ${head(r, 'cp-room-h', true)}
  </div>
  <div class="cp-flow" role="region" aria-roledescription="carousel" aria-labelledby="cp-room-h">
    <div class="cp-flow__depth"><ul class="cp-flow__track">${items}
    </ul></div>
  </div>
  <div class="container">
    <div class="cp-flow__nav"><button type="button" class="cp-flow__btn" data-dir="-1" aria-label="${esc(r.prevLabel)}">${arrowL}</button><p class="cp-mono cp-flow__count" aria-live="polite" aria-atomic="true"><b>1</b> / ${photos.length} ${esc(r.countLabel)}</p><button type="button" class="cp-flow__btn" data-dir="1" aria-label="${esc(r.nextLabel)}">${arrow}</button></div>
    <p class="cp-room__note">${esc(r.note)}</p>
  </div>
  <dialog class="cp-lightbox" aria-label="${esc(plain(r.eyebrow))}">
    <button type="button" class="cp-lightbox__x" data-close aria-label="${esc(r.closeLabel)}"><span aria-hidden="true">×</span></button>
    <figure class="cp-lightbox__fig"><img alt="" data-img><figcaption><span class="cp-mono" data-cap></span><span class="cp-lightbox__alt" data-alt></span></figcaption></figure>
    <button type="button" class="cp-lightbox__nav" data-step="-1" aria-label="${esc(r.prevLabel)}">${arrowL}</button><button type="button" class="cp-lightbox__nav" data-step="1" aria-label="${esc(r.nextLabel)}">${arrow}</button>
  </dialog>
</section>`;
}

module.exports = { render };
