// Shared helpers for the eight /sectors/<slug> pages (src/sec/*.js). A module exports render(ctx) and returns an HTML string.
// Rules every module follows:
//   • visible words come from content/sector-pages/<slug>.json, content/sectors.json, the assignment records or
//     content/page-text/sectors.json — never hard-coded — and are escaped with esc()/rich()
//   • class names start with sx- and ids with sx-; the page reads fully without JavaScript (src/js/sec/*.js only enhances)
//   • drawings in the scroll scene are decorative (aria-hidden); the steps beside them carry the same words as text
const L = require('../layout');
const { D, esc, plain, rich, arrow, arrowL } = L;

const T = D.pageText.sectors;
const proofBySlug = Object.fromEntries(D.proof.map((p) => [p.slug, p]));
const engBySlug = Object.fromEntries(D.engagements.map((e) => [e.slug, e]));
const capBySlug = Object.fromEntries(D.capabilities.cards.map((c, i) => [c.slug, { ...c, i }]));
const n2 = (i) => String(i + 1).padStart(2, '0');

// section heading: eyebrow, h2 (carrying the id the section is labelled by) and an optional lead
const head = (c, id, { split = false } = {}) => `<div class="section__head${split ? ' section__head--split' : ''}"><div><span class="eyebrow" data-reveal>${esc(c.eyebrow || '')}</span><h2 class="split" id="${id}">${rich(c.title)}</h2></div>${c.lead ? `<p class="lead" data-reveal>${esc(c.lead)}</p>` : ''}</div>`;

// "Label — text" bullets: the part before the first dash is bold
const point = (s) => {
  const i = s.indexOf(' — ');
  return i > 0 ? `<li><b>${esc(s.slice(0, i))}</b> ${esc(s.slice(i + 3))}</li>` : `<li>${esc(s)}</li>`;
};
const points = (list, cls = 'sx-pts') => ((list || []).length ? `<ul class="${cls}">${list.map(point).join('')}</ul>` : '');

// small deterministic number in [0,1) from a string, for generated patterns
const seed = (s, salt = 0) => { let h = 2166136261 ^ salt; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000) / 1000; };

// the records a page shows, in its order, skipping any slug that is hidden or missing
const recordsFor = (pg) => ((pg && pg.evidence && pg.evidence.records) || []).map((k) => proofBySlug[k]).filter(Boolean);

// media element for a header or gallery item: a film (muted loop, lazy) or a photo
function media({ image, video, alt = '', lazy = true, cls = '' }) {
  if (video) {
    return `<video class="${cls}" muted loop playsinline preload="none" poster="${esc(image)}"${alt ? ` aria-label="${esc(alt)}"` : ' aria-hidden="true"'} data-lazyvideo><source data-src="${esc(video)}" type="video/mp4"></video>`;
  }
  return `<img class="${cls}" src="${esc(image)}" alt="${esc(alt)}"${lazy ? ' loading="lazy"' : ' fetchpriority="high"'} decoding="async">`;
}

module.exports = { L, D, T, esc, plain, rich, arrow, arrowL, proofBySlug, engBySlug, capBySlug, n2, head, point, points, seed, recordsFor, media };
