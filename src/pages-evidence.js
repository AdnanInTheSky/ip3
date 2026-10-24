// /evidence-map — the documented assignments (content/proof.json) drawn as one dot each and regrouped as the reader
// scrolls: by client type, by delivery-chain phase and by sector. Client and client type are fields of each record;
// phases are the home delivery chain (content/home/translation.json) and sectors the evidence lists on the sector
// pages, so nothing here is new data. Every count is computed at build time. The chart is src/js/evidence.js (D3,
// vendored, loaded only on this page); the table below it carries the same records without JavaScript.
const { esc, rich, arrow, phero, breadcrumb, cta, sectionHead, page, D } = require('./layout');

const t = () => D.pageText.evidence;
const fill = (s, v) => s.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in v ? v[k] : m));
const pad = (n) => String(n).padStart(2, '0');

function model() {
  const recs = D.proof;
  const bySlug = Object.fromEntries(recs.map((r) => [r.slug, r]));
  const types = D.capProof.browser.clientTypes;

  // record slug -> group indexes; a record listed twice in one grouping gets two placements
  const assign = (lists) => {
    const of = {};
    lists.forEach((slugs, i) => slugs.forEach((s) => { if (bySlug[s] && !(of[s] || []).includes(i)) (of[s] = of[s] || []).push(i); }));
    return of;
  };
  const phaseOf = assign(D.translation.phases.map((p) => (p.evidence || []).map((e) => e.record)));
  const sectorOf = assign(D.sectors.map((s) => { const pg = D.sectorPages[s.slug]; return (pg && pg.evidence && pg.evidence.records) || []; }));

  const typeKeys = [...new Set(recs.map((r) => r.clientType))]
    .map((k) => ({ k, n: recs.filter((r) => r.clientType === k).length }))
    .sort((a, b) => b.n - a.n);
  const typeIdx = Object.fromEntries(typeKeys.map((x, i) => [x.k, i]));

  const groups = {
    client: typeKeys.map((x) => ({ label: types[x.k] || x.k })),
    phase: D.translation.phases.map((p, i) => ({ label: `${pad(i + 1)} ${p.title}` })),
    sector: D.sectors.map((s) => ({ label: s.title, href: `/sectors/${s.slug}` })),
  };
  const rows = recs.map((r) => ({
    s: r.slug, q: r.short, t: r.title, c: r.client, p: r.period, role: r.role, sum: r.summary,
    client: [typeIdx[r.clientType]], phase: phaseOf[r.slug] || [], sector: sectorOf[r.slug] || [],
  }));

  // the client named most often, exact field value
  const byClient = {};
  recs.forEach((r) => { byClient[r.client] = (byClient[r.client] || 0) + 1; });
  const [topClient, topN] = Object.entries(byClient).sort((a, b) => b[1] - a[1])[0];
  const count = (dim, i) => rows.filter((r) => r[dim].includes(i)).length;
  const stats = (dim) => {
    const ns = groups[dim].map((g, i) => count(dim, i));
    return { ns, min: Math.min(...ns), max: Math.max(...ns), placements: ns.reduce((a, b) => a + b, 0), multi: rows.filter((r) => r[dim].length > 1).length, none: rows.filter((r) => !r[dim].length).length };
  };
  return { rows, groups, topClient, topN, typeKeys, stats };
}

function evidenceMap() {
  const pg = D.pages.evidence;
  const T = t();
  const H = (k) => D.headings[k];
  const M = model();
  const total = M.rows.length;
  const ph = M.stats('phase'); const se = M.stats('sector');
  const unplaced = (s) => (s.none ? ` ${fill(T['callout-unplaced'], { n: s.none })}` : '');
  const top = M.typeKeys[0];
  const callouts = {
    client: fill(T['callout-client'], { client: M.topClient, n: M.topN, total, type: M.groups.client[0].label, typeN: top.n }),
    phase: fill(T['callout-phase'], { min: ph.min, max: ph.max }) + unplaced(ph),
    sector: fill(T['callout-sector'], { placements: se.placements, total, dupes: se.multi }) + unplaced(se),
  };
  const head = (k, tag = 'h2') => {
    const h = H(k);
    return `<span class="eyebrow">${esc(h.eyebrow || '')}</span><${tag} class="em-step__h">${rich(h.title)}</${tag}>${h.lead ? `<p class="em-step__lead">${esc(h.lead)}</p>` : ''}`;
  };
  const step = (mode, k, extra, hl = '') => `<article class="em-step" data-em-step="${mode}"${hl ? ` data-em-hl="${hl}"` : ''}><div class="em-step__card">${head(k)}${extra}</div></article>`;
  const note = (s) => `<p class="em-step__note">${esc(s)}</p>`;

  // client + client type, phase and sector for the table and the chart's script
  const label = (dim, r) => r[dim].map((i) => M.groups[dim][i].label).join('; ');
  const payload = {
    total,
    groups: M.groups,
    rows: M.rows,
    hl: { top: M.rows.filter((r) => r.c === M.topClient).map((r) => r.s), multi: M.rows.filter((r) => r.sector.length > 1).map((r) => r.s) },
    copy: Object.fromEntries(['group-all', 'group-client', 'group-phase', 'group-sector', 'all-row', 'unplaced-row', 'search-count', 'search-none', 'detail-empty', 'detail-link', 'also-listed', 'chart-label', 'th-client', 'th-type', 'th-period', 'th-phase', 'th-sector']
      .map((k) => [k, T[k]])),
  };
  const json = JSON.stringify(payload).replace(/</g, '\\u003c');

  const groupBtns = ['all', 'client', 'phase', 'sector'].map((m) => `<button type="button" class="em-seg__b" data-em-group="${m}" aria-pressed="${m === 'client'}">${esc(T[`group-${m}`])}</button>`).join('');
  const table = `<table class="em-table">
      <thead><tr><th scope="col">${esc(T['th-assignment'])}</th><th scope="col">${esc(T['th-client'])}</th><th scope="col">${esc(T['th-type'])}</th><th scope="col">${esc(T['th-period'])}</th><th scope="col">${esc(T['th-phase'])}</th><th scope="col">${esc(T['th-sector'])}</th></tr></thead>
      <tbody>${M.rows.map((r) => `<tr><th scope="row"><a href="/capabilities#proof-${esc(r.s)}">${esc(r.q)}</a><span>${esc(r.t)}</span></th><td>${esc(r.c)}</td><td>${esc(label('client', r))}</td><td>${esc(r.p)}</td><td>${esc(label('phase', r))}</td><td>${esc(label('sector', r))}</td></tr>`).join('')}</tbody>
    </table>`;

  const body = [
    phero({ crumbs: [breadcrumb('/evidence-map')], h1: rich(pg.h1), lead: esc(pg.lead), bg: { type: 'image', src: '/assets/img/poster-data.webp' } }),
    `<section class="section em-story" aria-label="${esc(H('em-intro').eyebrow)}">
  <div class="container em__story">
    <div class="em__steps">
      ${step('all', 'em-intro', `<p class="em-total"><b data-em-count="${total}">${total}</b> ${esc(T['total-label'])}</p>`)}
      ${step('client', 'em-client', note(callouts.client), 'top')}
      ${step('phase', 'em-phase', note(callouts.phase))}
      ${step('sector', 'em-sector', note(callouts.sector), 'multi')}
    </div>
    <figure class="em__fig" data-em-chart="story"><div class="em-chart" data-em-svg></div><div class="em-tip" data-em-tip hidden></div></figure>
  </div>
</section>`,
    `<section class="section section--sand em-explore" id="explore">
  <div class="container">
    ${sectionHead('em-explore')}
    <noscript><p class="em-noscript">${esc(T.noscript)}</p></noscript>
    <div class="em-x" data-em-chart="explore">
      <div class="em-x__controls">
        <div class="em-seg" role="group" aria-label="${esc(T['group-label'])}"><span class="em-seg__l" aria-hidden="true">${esc(T['group-label'])}</span>${groupBtns}</div>
        <div class="em-find"><label for="em-q">${esc(T['search-label'])}</label><input id="em-q" type="search" autocomplete="off" placeholder="${esc(T['search-hint'])}" data-em-q><p class="em-find__n" data-em-n aria-live="polite"></p></div>
      </div>
      <div class="em-x__body">
        <figure class="em-x__fig"><div class="em-chart" data-em-svg></div><div class="em-tip" data-em-tip hidden></div></figure>
        <aside class="em-detail" data-em-detail aria-live="polite"><p class="em-detail__empty">${esc(T['detail-empty'])}</p></aside>
      </div>
    </div>
    <details class="em-data">
      <summary>${esc(T['table-toggle'])}</summary>
      <div class="em-data__wrap" tabindex="0" role="region" aria-label="${esc(T['table-toggle'])}">${table}</div>
    </details>
    <div class="em-method">${head('em-method', 'h3')}<p class="em-method__links"><a class="link" href="/capabilities#cp-proof">${esc(D.navigation.explore.find((x) => x.href === '/capabilities').label)}${arrow}</a> <a class="link" href="/sectors">${esc(D.navigation.sectorsTitle)}${arrow}</a></p></div>
  </div>
</section>`,
    cta(),
  ].join('\n');

  return page({
    title: pg.title, desc: pg.desc, path: '/evidence-map', body, bodyClass: 'em-page',
    styles: '<link rel="stylesheet" href="/assets/css/evidence.css?v=__EMCSSV__">',
    scripts: `<script type="application/json" id="em-data">${json}</script>\n<script src="/assets/vendor/d3.min.js" defer></script>\n<script src="/assets/js/evidence.js?v=__EMJSV__" defer></script>`,
  });
}

module.exports = { evidenceMap, model };
