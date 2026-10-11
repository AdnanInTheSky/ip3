// Shared helpers for the /capabilities page modules (src/cap/*.js). A module exports render() and returns an HTML string.
// Rules every module follows:
//   • all visible words come from D.capProof.<module> or the records (never hard-coded), and are escaped with esc()/rich()
//   • class names start with cp- (page-wide) and the module name, e.g. cp-proof__card; ids start with cp-
//   • the page reads fully without JavaScript; src/js/cap/<module>.js only enhances
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

// assignments that prove a capability: primary ones first, then those that list it second or third
const proofFor = (slug) => proof.filter((p) => p.caps.includes(slug)).sort((a, b) => a.caps.indexOf(slug) - b.caps.indexOf(slug));
const photosFor = (slug) => photos.filter((p) => p.caps.includes(slug));
const videosFor = (slug) => videos.filter((v) => v.caps.includes(slug));

// the caption under a meeting photo: only what the record states
const photoCaption = (p) => [p.event, p.place, p.year].filter(Boolean).join(' · ');

// "Mar 2019 – Dec 2020" -> sortable year; blank when the period is withheld
const yearOf = (p) => (p.period && (p.period.match(/\d{4}/) || [])[0]) || '';

// object-position for a photo's focal point
const focal = (p) => `${p.fx}% ${p.fy}%`;

module.exports = {
  ...L, D, esc, plain, rich, arrow, arrowL,
  T: D.capProof,
  caps, capBySlug, engBySlug, proof, proofBySlug, photos, photoBySlug, videos, videoBySlug, peopleBySlug,
  proofFor, photosFor, videosFor, photoCaption, yearOf, focal,
};
