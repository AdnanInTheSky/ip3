// "On film": a featured player and a playlist. Poster first; the film loads only when the visitor presses play (preload="none"),
// one film plays at a time, sound only after the visitor starts it. Without JS the featured film has native controls and the
// playlist links to each file.
const { T, esc, arrow, capBySlug, videos } = require('./util');
const { head } = require('./shared');

function render() {
  const r = T.reel;
  if (!videos.length) return '';
  const v0 = videos[0];
  const capLink = (v) => { const c = capBySlug[v.caps[0]]; return c ? `<a class="link" href="#${c.slug}" data-cap-link>${esc(r.relatedLabel)}: ${esc(c.short)}${arrow}</a>` : ''; };
  const list = videos.map((v, i) => `
        <li id="reel-${esc(v.slug)}" class="cp-reel__li${i === 0 ? ' is-current' : ''}" data-src="${esc(v.src)}" data-poster="${esc(v.poster)}" data-cap="${esc(v.caps[0] || '')}">
          <a class="cp-reel__item" href="${esc(v.src)}" data-cp-film="${esc(v.slug)}"${i === 0 ? ' aria-current="true"' : ''}>
            <span class="cp-reel__thumb"><img src="${esc(v.poster)}" width="1280" height="720" alt="" loading="lazy" decoding="async"><span class="cp-reel__rt cp-mono">${esc(v.runtime)}</span></span>
            <span class="cp-reel__meta"><b class="cp-reel__t">${esc(v.title)}</b><span class="cp-reel__c">${esc(v.caption)}</span></span>
          </a>
          <template data-caplink>${capLink(v)}</template>
        </li>`).join('');
  return `
<section class="section section--dark on-dark dark cp-reel" id="cp-reel" aria-labelledby="cp-reel-h">
  <div class="container">
    ${head(r, 'cp-reel-h', true)}
    <div class="cp-reel__grid">
      <figure class="cp-reel__feature" data-slug="${esc(v0.slug)}">
        <div class="cp-reel__media">
          <video controls preload="none" playsinline poster="${esc(v0.poster)}" width="1280" height="720" aria-labelledby="cp-reel-now"><source src="${esc(v0.src)}" type="video/mp4"></video>
          <button type="button" class="cp-reel__play" data-play="${esc(r.playLabel)}" hidden><span class="cp-reel__playicon" aria-hidden="true"></span><span class="vh" data-play-label>${esc(r.playLabel)}: ${esc(v0.title)}</span></button>
        </div>
        <figcaption>
          <span class="cp-mono cp-reel__k">${esc(r.nowPlayingLabel)} · <span data-rt>${esc(v0.runtime)}</span></span>
          <h3 id="cp-reel-now" data-title>${esc(v0.title)}</h3>
          <p data-caption>${esc(v0.caption)}</p>
          <span data-caplink>${capLink(v0)}</span>
        </figcaption>
      </figure>
      <ol class="cp-reel__list">${list}
      </ol>
    </div>
  </div>
</section>`;
}

module.exports = { render };
