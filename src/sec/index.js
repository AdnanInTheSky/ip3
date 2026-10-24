// /sectors/<slug> — page assembly for the eight sector pages. Each section is a module in this folder that returns an HTML string.
// Section order: aperture hero → statement → signature scroll scene → practice index → who we serve → context → field gallery →
// on the record → where we add value / capabilities → connected work (capabilities, engagements, articles) → closing → next-sector portal → CTA.
// The long-form words live in content/sector-pages/<slug>.json; a sector without that file falls back to hero, expertise and CTA.
const { D, esc } = require('./util');
const { page, cta, orgId, cfg } = require('../layout');
const hero = require('./hero');
const statement = require('./statement');
const scene = require('./scene');
const { practice, audiences, context, closing } = require('./practice');
const gallery = require('./gallery');
const evidence = require('./evidence');
const expertise = require('./expertise');
const links = require('./links');
const next = require('./next');

function sectorPage(s, idx) {
  const pg = D.sectorPages[s.slug] || null;
  const ctx = { s, idx, pg };
  const modelLinks = {
    'climate-energy-resilience':['finance-investment','development-impact','policy-governance'],
    'education-skills-human-capital':['development-impact','finance-investment','management-delivery'],
    'health-systems-social-protection':['development-impact','finance-investment','management-delivery'],
    'digital-government-data-dpi':['policy-governance','management-delivery','market-enterprise'],
    'governance-institutions-public-finance':['policy-governance','management-delivery','finance-investment'],
    'economic-transformation-trade-private-sector':['economics-trade','market-enterprise','finance-investment'],
    'sustainable-finance-esg-circular-economy':['finance-investment','market-enterprise','policy-governance'],
    'ai-emerging-technology-public-systems':['policy-governance','management-delivery','development-impact'],
  };
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
    links.render(ctx),
    require('../explore').related(modelLinks[s.slug] || ['policy-governance'], 'Explore analytical questions in this sector'),
    pg ? closing(ctx) : '',
    next.render(ctx),
    cta('cta-sector', { eyebrow: s.title }),
  ].filter(Boolean).join('\n');
  return page({
    title: s.title,
    // Name as many service areas as fit the ~160-character search snippet.
    desc: [3, 2, 1].map((n) => `${s.problem} IP3 supports clients with ${s.areas.slice(0, n).join(', ').toLowerCase()} and more.`).find((d) => d.length <= 160) || s.problem,
    path: `/sectors/${s.slug}`,
    body,
    jsonld: [{ '@context': 'https://schema.org', '@type': 'Service', name: s.title, description: s.problem, serviceType: s.areas,
      url: `${cfg.url}/sectors/${s.slug}`, provider: { '@id': orgId } }],
    bodyClass: `sxp sxp--${esc(pg ? pg.scene.type : 'plain')}`,
    styles: '<link rel="stylesheet" href="/assets/css/sectors.css?v=__SECCSSV__">',
    scripts: '<script src="/assets/js/sectors.js?v=__SECJSV__" defer></script>',
  });
}

module.exports = { sectorPage };
