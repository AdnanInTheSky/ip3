// Top of the page: the headline, the jump bar, the figures band and the names of clients and funders (text only, no logos).
const { D, T, esc, rich, phero, breadcrumb } = require('./util');

function render() {
  const pg = D.pages.capabilities;
  const h = T.hero;
  const top = phero({ crumbs: [breadcrumb('/capabilities')], h1: rich(pg.h1), lead: esc(pg.lead), bg: { type: 'video', src: '/assets/video/data.mp4', poster: '/assets/img/poster-data.webp' } });
  const jump = `
<nav class="cp-jump" aria-label="${esc(h.jumpLabel)}" data-cp-jump><div class="cp-jump__in"><span class="cp-mono cp-jump__label" aria-hidden="true">${esc(h.jumpLabel)}</span><ul>${h.jump.map((j) => `<li><a href="#${esc(j.id)}">${esc(j.label)}</a></li>`).join('')}</ul></div></nav>`;
  const names = [...new Set([...D.partners.funders, ...D.partners.clients])];
  const list = (hidden) => `<ul${hidden ? ' aria-hidden="true"' : ''}>${names.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>`;
  const figs = `
<section class="cp-figs on-dark dark" aria-labelledby="cp-figs-h">
  <div class="container">
    <h2 class="eyebrow" id="cp-figs-h">${esc(h.statsEyebrow)}</h2>
    <div class="cp-figs__grid" data-cp-figs>${h.stats.map((s) => `<div class="cp-fig"><span class="cp-fig__n"><span data-count="${s.n}">${s.n}</span>${esc(s.suffix || '')}</span><span class="cp-fig__l">${esc(s.label)}</span></div>`).join('')}</div>
    <p class="cp-figs__note">${esc(h.statsNote)}</p>
    <div class="cp-marquee"><div class="cp-marquee__top"><p class="cp-mono cp-marquee__label" id="cp-partners-h">${esc(h.partnersLabel)}</p><button type="button" class="cp-marquee__toggle cp-mono" data-pause="${esc(T.reel.pauseLabel)}" data-play="${esc(T.reel.playLabel)}" hidden>${esc(T.reel.pauseLabel)}</button></div><div class="cp-marquee__view" role="group" aria-labelledby="cp-partners-h"><div class="cp-marquee__track">${list(false)}${list(true)}</div></div></div>
  </div>
</section>`;
  return top + jump + figs;
}

module.exports = { render };
