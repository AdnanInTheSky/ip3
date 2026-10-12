// /sectors/<slug> — page assembly for the eight sector pages. Each section is a module in this folder that returns an HTML string.
// Section order: aperture hero → statement → signature scroll scene → practice index → who we serve → context → field gallery →
// on the record (+ related engagements) → where we add value / capabilities → closing → next-sector portal → CTA.
// The long-form words live in content/sector-pages/<slug>.json; a sector without that file falls back to hero, expertise and CTA.
const { D, esc } = require('./util');
const { page, cta } = require('../layout');
const hero = require('./hero');
const statement = require('./statement');
const scene = require('./scene');
const { practice, audiences, context, closing } = require('./practice');
const gallery = require('./gallery');
const evidence = require('./evidence');
const expertise = require('./expertise');
const next = require('./next');

function sectorPage(s, idx) {
  const pg = D.sectorPages[s.slug] || null;
  const ctx = { s, idx, pg };
  const body = [
    hero.render(ctx),
    pg ? statement.render(ctx) : '',
    pg ? scene.render(ctx) : '',
    pg ? practice(ctx) : '',
    pg ? audiences(ctx) : '',
    pg ? context(ctx) : '',
    pg ? gallery.render(ctx) : '',
    pg ? evidence.render(ctx) : '',
    expertise.render(ctx),
    pg ? closing(ctx) : '',
    next.render(ctx),
    cta('cta-sector', { eyebrow: s.title }),
  ].filter(Boolean).join('\n');
  return page({
    title: s.title,
    desc: `${s.problem} IP3 supports clients with ${s.areas.slice(0, 3).join(', ').toLowerCase()} and more.`,
    path: `/sectors/${s.slug}`,
    body,
    bodyClass: `sxp sxp--${esc(pg ? pg.scene.type : 'plain')}`,
    styles: '<link rel="stylesheet" href="/assets/css/sectors.css?v=__SECCSSV__">',
    scripts: '<script src="/assets/js/sectors.js?v=__SECJSV__" defer></script>',
  });
}

module.exports = { sectorPage };
