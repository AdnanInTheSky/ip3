// Shared helpers for the /capabilities page modules (src/cap/*.js). A module exports render() and returns an HTML string.
// Rules every module follows:
//   • all visible words come from D.capProof.<module> or the records (never hard-coded), and are escaped with esc()/rich()
//   • class names start with cp- (page-wide) and the module name, e.g. cp-proof__card; ids start with cp-
//   • the page reads fully without JavaScript; src/js/cap/<module>.js only enhances
// Cross-module contract (so sections can link to each other):
//   section ids  : cp-led · cp-capabilities (rows; each row keeps id=<capability slug>) · cp-method · cp-proof · cp-room · cp-reel
//   record anchors: proof-<slug> (the list entry for an assignment) · room-<slug> (a meeting photo) · reel-<slug> (a film)
//   link hooks   : data-cp-open="<proof slug>" opens that record · data-cp-filter="<capability slug>" filters the browser
//                  data-cp-photo="<photo slug>" opens that photo · data-cp-film="<video slug>" plays that film
//   events       : window 'cp:open' {slug} · 'cp:filter' {cap} · 'cp:photo' {slug} · 'cp:film' {slug}   (the section that owns the target listens)
const L = require('../layout');
const { D, esc, plain, rich, arrow, arrowL } = L;

const caps = D.capabilities.cards.map((c, i) => ({ ...c, i, n: String(i + 1).padStart(2, '0') }));
const capBySlug = Object.fromEntries(caps.map((c) => [c.slug, c]));
const engBySlug = Object.fromEntries(D.engagements.map((e) => [e.slug, e]));
const proof = D.proof;
const proofBySlug = Object.fromEntries(proof.map((p) => [p.slug, p]));
const photos = D.fieldMedia.photos;
const videos = D.fieldMedia.videos;
const photoBySlug = Object.fromEntries(photos.map((p) => [p.slug, p]));
const videoBySlug = Object.fromEntries(videos.map((v) => [v.slug, v]));
const peopleBySlug = Object.fromEntries(D.people.flatMap((g) => g.members).map((m) => [m.slug, m]));
const T = D.capProof;

// assignments that prove a capability: primary ones first, then those that list it second or third
const proofFor = (slug) => proof.filter((p) => p.caps.includes(slug)).sort((a, b) => a.caps.indexOf(slug) - b.caps.indexOf(slug));
const photosFor = (slug) => photos.filter((p) => p.caps.includes(slug));
const videosFor = (slug) => videos.filter((v) => v.caps.includes(slug));

// the caption under a meeting photo: only what the record states
const photoCaption = (p) => [p.event, p.place, p.year].filter(Boolean).join(' · ');

// "Mar 2019 – Dec 2020" -> first four-digit year; blank when the period is withheld
const yearOf = (p) => (p.period && (p.period.match(/\d{4}/) || [])[0]) || '';

// object-position for a photo's focal point
const focal = (p) => `${p.fx}% ${p.fy}%`;

// short label for the client, used as a monogram on generated thumbnails (decorative; the client's full name is always shown as text)
const ABBR = [
  [/^ifc\b/i, 'IFC'], [/asian development bank/i, 'ADB'], [/world bank/i, 'WB'], [/european commission/i, 'EC'], [/unctad/i, 'UNCTAD'],
  [/embassy of sweden/i, 'SE'], [/payra/i, 'PSA'], [/army/i, 'BA'], [/dhaka south/i, 'DSCC'], [/dfid/i, 'DFID'], [/new vision/i, 'JICA'],
  [/clasp/i, 'CLASP'], [/gates/i, 'BMGF'], [/cuts international/i, 'CUTS'], [/tobacco/i, 'TFK'], [/ifad/i, 'IFAD'], [/omera/i, 'OMERA'],
  [/korean institute/i, 'KIET'], [/sumitomo/i, 'SC'], [/jetro/i, 'JETRO'], [/prokaushali/i, 'PSL'],
];
const abbr = (client) => {
  const hit = ABBR.find(([re]) => re.test(client));
  if (hit) return hit[1];
  return client.split(/\s+/).filter((w) => /^[A-Z]/.test(w)).slice(0, 3).map((w) => w[0]).join('') || '·';
};

// tone (rgb triplet) per capability, for chips, dots and generated thumbnails; see --cp-t1..6 in 00-base.css
const toneOf = (p) => (capBySlug[p.caps[0]] ? capBySlug[p.caps[0]].i + 1 : 1);

// small deterministic number from a slug, for the generated thumbnail pattern
const seed = (s, salt = 0) => { let h = 2166136261 ^ salt; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 1000) / 1000; };

// E·D·T·R dots: f = demonstrated, h = partial, n = not recorded. The text alternative names each pillar and level.
function pillarDots(code) {
  const b = T.browser;
  const names = [b.pillarNames.e, b.pillarNames.d, b.pillarNames.t, b.pillarNames.r];
  const letters = ['E', 'D', 'T', 'R'];
  const alt = names.map((n, i) => `${n}: ${b.pillarLevels[code[i]]}`).join('; ');
  return `<span class="cp-pillars" role="img" aria-label="${esc(alt)}">${letters.map((l, i) => `<i data-l="${code[i]}" aria-hidden="true">${l}</i>`).join('')}</span>`;
}

// thumbnail for an assignment: a verified photo, else the matching IP3 engagement's image, else a generated contour motif with the client monogram
function thumb(p, { sizes = '(min-width:900px) 360px, 80vw' } = {}) {
  const ph = p.photo && photoBySlug[p.photo];
  const eng = p.engagement && engBySlug[p.engagement];
  const src = ph ? ph.image : eng ? eng.image : '';
  if (src) {
    const dims = ph ? `width="${ph.w}" height="${ph.h}"` : 'width="1200" height="900"';
    return `<div class="cp-thumb" data-tone="${toneOf(p)}"><img src="${esc(src)}" ${dims} alt="" loading="lazy" decoding="async" sizes="${sizes}"${ph ? ` style="object-position:${focal(ph)}"` : ''}></div>`;
  }
  const x1 = Math.round(seed(p.slug, 1) * 100); const y1 = Math.round(seed(p.slug, 2) * 100);
  const x2 = Math.round(seed(p.slug, 3) * 100); const y2 = Math.round(seed(p.slug, 4) * 100);
  return `<div class="cp-thumb cp-motif" data-tone="${toneOf(p)}" style="--x1:${x1}%;--y1:${y1}%;--x2:${x2}%;--y2:${y2}%" aria-hidden="true"><span class="cp-thumb__abbr">${esc(abbr(p.client))}</span></div>`;
}

// the period as a short label for badges and meta lines
const periodShort = (p) => (p.status === 'current' ? T.browser.currentLabel : yearOf(p));

module.exports = {
  ...L, D, esc, plain, rich, arrow, arrowL, T,
  caps, capBySlug, engBySlug, proof, proofBySlug, photos, photoBySlug, videos, videoBySlug, peopleBySlug,
  proofFor, photosFor, videosFor, photoCaption, yearOf, focal, abbr, toneOf, seed, pillarDots, thumb, periodShort,
};
