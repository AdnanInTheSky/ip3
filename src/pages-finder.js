const { esc, rich, arrow, phero, breadcrumb, page, D } = require('./layout');

// Mandate Finder (/find-support): sector + kind of help → IP3's published capabilities, engagements and articles.
// Everything runs in the visitor's browser; nothing is stored or sent. The links below only connect existing
// content — editorial review: keep each mapping to work IP3 has actually published.
const HELP = [
  { key: 'diagnosis', cap: 'policy-economics-strategy', engagement: 'Diagnostic', tags: ['Research', 'Evidence', 'Survey Design'] },
  { key: 'design', cap: 'program-project-design', engagement: 'Design', tags: ['Project Preparation', 'Feasibility'] },
  { key: 'finance', cap: 'development-finance', engagement: 'Design', tags: ['Development Finance', 'Climate Finance', 'Blended Finance', 'Municipal Finance'] },
  { key: 'implementation', cap: 'institutions-governance-delivery', engagement: 'Implementation support', tags: ['Institutional Reform', 'Institutional', 'Capacity Development', 'Governance'] },
  { key: 'evaluation', cap: 'monitoring-evaluation-learning', engagement: 'Evaluation', tags: ['Evidence', 'Survey Design'] },
];
// Sectors whose work also draws on the data and digital capability.
const DIGITAL_SECTORS = ['digital-government-data-dpi', 'ai-emerging-technology-public-systems'];
// Published articles by sector and help type (articles carry no sector field of their own).
const ARTICLE_LINKS = {
  'bangladeshs-esg-transition-in-2025-why-it-lags-india-and-vietnam-and-what-it-can-learn-from-asean-peers': { sectors: ['sustainable-finance-esg-circular-economy', 'economic-transformation-trade-private-sector'], help: ['diagnosis'] },
  'unlocking-inclusive-green-finance-in-bangladesh-a-multi-criteria-innovation-approach-for-product-design': { sectors: ['sustainable-finance-esg-circular-economy'], help: ['finance', 'design'] },
  'enhancing-environmental-compliance-and-performance-in-bangladesh': { sectors: ['climate-energy-resilience', 'sustainable-finance-esg-circular-economy'], help: ['implementation', 'diagnosis'] },
  'from-donor-dependent-projects-to-sustainable-urban-finance': { sectors: ['governance-institutions-public-finance', 'climate-energy-resilience'], help: ['finance', 'implementation'] },
};

const t = () => D.pageText.finder;
const helpLabel = (h) => t()[`help-${h.key}`];
const attrs = (sectors, helps) => ` data-sectors="${sectors.join(' ')}" data-helps="${helps.join(' ')}"`;
const allHelp = HELP.map((h) => h.key);

function capItems() {
  return D.capabilities.cards.map((c) => {
    const helps = HELP.filter((h) => h.cap === c.slug).map((h) => h.key);
    const digital = c.slug === 'data-digital-responsible-ai';
    // A help-type capability matches every sector; the digital capability matches its own sectors for any help type.
    const sectors = digital ? DIGITAL_SECTORS : ['*'];
    return `<li class="mf-item"${attrs(sectors, digital ? allHelp : helps)}><a href="/capabilities#${c.slug}"><b>${esc(c.title)}</b><span>${esc(c.descriptor || c.problem)}</span>${arrow}</a></li>`;
  }).join('');
}

function engItems() {
  return D.engagements.map((e) => {
    const helps = HELP.filter((h) => e.tags.some((tag) => h.tags.includes(tag))).map((h) => h.key);
    return `<li class="mf-item"${attrs([e.sectorSlug], helps)}><a href="/engagements#${e.slug}"><b>${esc(e.title)}</b><span>${esc(e.client)} · ${esc(e.year)}</span>${arrow}</a></li>`;
  }).join('');
}

function articleItems() {
  return D.articles.filter((a) => a.publicationStatus === 'published' && ARTICLE_LINKS[a.slug]).map((a) => {
    const m = ARTICLE_LINKS[a.slug];
    return `<li class="mf-item"${attrs(m.sectors, m.help)}><a href="/insights/${a.slug}"><b>${esc(a.title)}</b><span>${esc(a.category || 'Article')}</span>${arrow}</a></li>`;
  }).join('');
}

function finder() {
  const pg = D.pages.finder;
  const x = t();
  const h = (k) => D.headings[k];
  const step = (k, inner) => `<fieldset class="mf-step"><legend><span class="eyebrow">${esc(h(k).eyebrow)}</span><span class="mf-step__t">${rich(h(k).title)}</span></legend>${h(k).lead ? `<p class="mf-step__l">${esc(h(k).lead)}</p>` : ''}${inner}</fieldset>`;
  const sectors = D.sectors.map((s) => `<label class="mf-opt"><input type="radio" name="sector" value="${s.slug}" data-label="${esc(s.title)}"><span><b>${esc(s.title)}</b><small>${esc(s.problem)}</small></span></label>`).join('');
  const helps = HELP.map((hh) => `<label class="mf-opt mf-opt--s"><input type="radio" name="help" value="${hh.key}" data-label="${esc(helpLabel(hh))}"><span><b>${esc(helpLabel(hh))}</b></span></label>`).join('');
  // Capabilities must fit both answers; engagements and articles show if they fit either.
  const group = (key, items, mode) => `<div class="mf-group" data-mode="${mode}"><h3>${esc(x[key])}</h3><ul>${items}</ul><p class="mf-none" hidden>${esc(x['results-none'])}</p></div>`;
  const res = h('finder-results');
  const body = [
    phero({ crumbs: [breadcrumb('/find-support')], h1: rich(pg.h1), lead: esc(pg.lead), bg: { type: 'image', src: '/assets/img/workshop-1.webp' } }),
    `<section class="section"><div class="container">
      <noscript><p class="lead">${esc(x.noscript)}</p></noscript>
      <form class="mf" data-finder novalidate>
        <div class="mf-steps">${step('finder-step-sector', `<div class="mf-opts">${sectors}</div>`)}${step('finder-step-help', `<div class="mf-opts mf-opts--s">${helps}</div>`)}</div>
        <div class="mf-results" aria-live="polite">
          <span class="eyebrow">${esc(res.eyebrow)}</span><h2 class="mf-results__t">${rich(res.title)}</h2><p class="small">${esc(res.lead)}</p>
          <p class="mf-empty" data-finder-empty>${esc(x['results-empty'])}</p>
          <div data-finder-out>${group('results-capabilities', capItems(), 'and')}${group('results-engagements', engItems(), 'or')}${group('results-insights', articleItems(), 'or')}</div>
          <div class="mf-cta"><a class="btn" href="/contact#contact-form" data-finder-contact>${esc(x['cta-contact'])}${arrow}</a><button class="link" type="reset">${esc(x['cta-reset'])}</button></div>
          <p class="form__note">${esc(x['cta-note'])}</p>
        </div>
      </form>
    </div></section>`,
  ].join('\n');
  return page({ title: pg.title, desc: pg.desc, path: '/find-support', body });
}

// Read by the contact page so a ?sector=&help= link from the finder can pre-fill the form.
function finderPrefill() {
  const map = {
    sectors: Object.fromEntries(D.sectors.map((s) => [s.slug, s.title])),
    help: Object.fromEntries(HELP.map((hh) => [hh.key, { label: helpLabel(hh), engagement: hh.engagement, focus: (D.capabilities.cards.find((c) => c.slug === hh.cap) || {}).title }])),
    message: t()['contact-prefill'],
  };
  return `<script type="application/json" id="finder-prefill">${JSON.stringify(map).replace(/</g, '\\u003c')}</script>`;
}

module.exports = { finder, finderPrefill, HELP, ARTICLE_LINKS };
