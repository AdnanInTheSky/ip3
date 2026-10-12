// Aperture hero: the sector's film or photo opens from a narrow window to full bleed, then recedes like a camera pulling back
// as the page scrolls. The giant sector number and the figures under the headline are counted from the content.
const { D, T, esc, n2, recordsFor } = require('./util');

function render({ s, idx, pg }) {
  const nav = D.navigation;
  const crumbs = [{ label: nav.homeLabel, href: nav.homeHref }, D.navigation.breadcrumbs.find((b) => b.href === '/sectors'), { label: s.title }];
  const bc = crumbs.map((c, i) => (i === 0 ? `<a href="${esc(c.href)}">${esc(c.label)}</a>` : i === crumbs.length - 1 ? `<span>${esc(c.label)}</span>` : `<span><a href="${esc(c.href)}">${esc(c.label)}</a></span>`)).join('');
  const bg = s.video
    ? `<video muted loop playsinline preload="none" poster="${esc(s.poster)}" aria-hidden="true"><source data-src="${esc(s.video)}" type="video/mp4"></video>`
    : `<img src="${esc(s.image)}" alt="" fetchpriority="high" decoding="async">`;
  const meta = [
    [recordsFor(pg).length, T['sx-meta-records']],
    [s.caps.length, T['sx-meta-capabilities']],
    [s.areas.length, T['sx-meta-areas']],
  ].filter(([n]) => n).map(([n, label]) => `<li><b>${String(n).padStart(2, '0')}</b><span>${esc(label)}</span></li>`).join('');
  return `
<section class="sx-hero on-dark dark" id="sx-hero" data-sx-hero>
  <div class="sx-hero__stage">
    <div class="sx-hero__media" data-sx-aperture><div class="sx-hero__win">${bg}<i class="sx-hero__shade"></i></div></div>
    <div class="sx-hero__index" aria-hidden="true"><span>${n2(idx)}</span></div>
    <div class="container sx-hero__copy">
      <nav class="crumbs" aria-label="Breadcrumb">${bc}</nav>
      <p class="sx-hero__kicker">${esc(T['sx-sector-label'])} ${n2(idx)} <span>/ ${String(D.sectors.length).padStart(2, '0')}</span></p>
      <h1 class="split" data-hero-title>${esc(s.title)}</h1>
      <p class="sx-hero__lab">${esc(T['eyebrow-challenge'])}</p>
      <p class="lead sx-hero__lead">${esc(s.problem)}</p>
      ${meta ? `<ul class="sx-hero__meta">${meta}</ul>` : ''}
      <nav class="sx-route" aria-label="${esc(T['sx-route-label'])}">
        <a href="#sx-scene">${esc(T['sx-route-method'])}<span aria-hidden="true">↗</span></a>
        ${pg && pg.practice ? `<a href="#sx-practice">${esc(T['sx-route-practice'])}<span aria-hidden="true">↗</span></a>` : ''}
        ${recordsFor(pg).length ? `<a href="#sx-evidence">${esc(T['sx-route-evidence'])}<span aria-hidden="true">↗</span></a>` : ''}
      </nav>
      <label class="sx-motion" data-sx-motion-control hidden><input type="checkbox" data-sx-motion> ${esc(T['sx-motion-label'])}</label>
    </div>
    <div class="sx-hero__cue" aria-hidden="true"><i></i>${esc(T['sx-scroll-cue'])}</div>
  </div>
</section>`;
}

module.exports = { render };
