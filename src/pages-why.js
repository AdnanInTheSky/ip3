// /why-ip3 — the scroll-driven 3D journey carried over from the ip3website home page, rebuilt for this
// static site: the words come from content/why.json, the 3D world is src/js/why.js (three.js, vendored).
const { esc, plain, rich, arrow, btn, cta, page, breadcrumb, D } = require('./layout');

const W = () => D.why;
const T = () => D.pageText.why;
const pad = (i) => String(i + 1).padStart(2, '0');
const head = (key, cls = '') => {
  const h = D.headings[key];
  return `<div class="section__head ${cls}"><span class="eyebrow" data-reveal>${esc(h.eyebrow || '')}</span><h2 class="split">${rich(h.title)}</h2>${h.lead ? `<p class="lead" data-reveal>${esc(h.lead)}</p>` : ''}</div>`;
};

/* ---------------- method diagrams (illustrative, not data) ---------------- */
function impactChart() {
  const c = W().charts;
  const y = (v) => +(252 - v * 2.2).toFixed(1);
  const base = 104; const start = 226; const end = 374;
  const comparison = [[base, 48], [start, 54], [end, 60]];
  const supported = [[base, 36], [start, 42], [end, 70]];
  const pts = (arr) => arr.map(([x, v]) => `${x},${y(v)}`).join(' ');
  const dots = (arr, cls) => arr.map(([x, v]) => `<circle class="${cls}" cx="${x}" cy="${y(v)}" r="4"/>`).join('');
  return `<figure class="chart" data-chart aria-labelledby="chart-impact-title">
  <h3 id="chart-impact-title">${esc(c.impactTitle)}</h3>
  <svg viewBox="0 0 480 320" role="img" aria-label="Line chart. Before the programme starts, a supported group and a comparison group move in parallel. After it starts, the supported group rises faster. The gap between its actual result and a dashed line showing where it would have been without the programme is the estimated impact.">
    <line class="ax" x1="72" y1="252" x2="440" y2="252"/><line class="ax" x1="72" y1="24" x2="72" y2="252"/>
    <text class="lbl" x="22" y="138" transform="rotate(-90 22 138)" text-anchor="middle">Outcome indicator (illustrative scale)</text>
    <line class="mark" x1="${start}" y1="40" x2="${start}" y2="252"/>
    <text class="lbl lbl--strong" x="${start}" y="30" text-anchor="middle">Programme starts</text>
    <line class="ax" x1="${base}" y1="252" x2="${base}" y2="258"/><text class="lbl" x="${base}" y="278" text-anchor="middle">Baseline</text>
    <line class="ax" x1="${end}" y1="252" x2="${end}" y2="258"/><text class="lbl" x="${end}" y="278" text-anchor="middle">Endline</text>
    <text class="lbl" x="256" y="304" text-anchor="middle">Time</text>
    <polyline class="fade-in dash" points="${start},${y(42)} ${end},${y(48)}"/>
    <polyline class="draw line line--muted" pathLength="1" points="${pts(comparison)}"/>
    <polyline class="draw line line--accent" pathLength="1" points="${pts(supported)}"/>
    ${dots(comparison, 'dot dot--muted')}${dots(supported, 'dot dot--accent')}
    <text class="lbl lbl--strong" x="${base - 10}" y="${y(48) - 24}">Comparison group</text>
    <text class="lbl lbl--accent" x="${base - 10}" y="${y(36) + 30}">Supported group</text>
    <g class="fade-in">
      <text class="lbl lbl--accent lbl--sm" x="${end}" y="${y(48) + 26}" text-anchor="end"><tspan x="${end}" dy="0">Without the</tspan><tspan x="${end}" dy="15">programme</tspan><tspan x="${end}" dy="15">(estimate)</tspan></text>
      <path class="bracket" d="M${end + 14} ${y(48)} h7 V${y(70)} h-7"/>
      <text class="lbl lbl--green" x="${end + 30}" y="${((y(70) + y(48)) / 2 - 2).toFixed(1)}"><tspan x="${end + 30}" dy="0">Estimated</tspan><tspan x="${end + 30}" dy="16">impact</tspan></text>
    </g>
  </svg>
  <figcaption>${esc(c.impactCaption)}<span>${esc(c.note)}</span></figcaption>
</figure>`;
}

function costChart() {
  const c = W().charts;
  const costs = [-40, -25, -8, -5, -5, -5, -5, -5];
  const benefits = [0, 6, 18, 28, 34, 38, 40, 40];
  const cumulative = [];
  costs.forEach((v, i) => cumulative.push((cumulative[i - 1] || 0) + v + benefits[i]));
  const X0 = 72; const X1 = 420; const n = costs.length; const slot = (X1 - X0) / n; const barW = slot * 0.5;
  const top = 44; const bottom = 250; const vMax = 110; const vMin = -64;
  const y = (v) => +(top + ((vMax - v) / (vMax - vMin)) * (bottom - top)).toFixed(1);
  const x = (i) => +(X0 + slot * (i + 0.5)).toFixed(1);
  let cross = x(n - 1);
  for (let i = 1; i < n; i++) {
    const a = cumulative[i - 1]; const b = cumulative[i];
    if (a < 0 && b >= 0) { cross = +(x(i - 1) + ((0 - a) / (b - a)) * slot).toFixed(1); break; }
  }
  const bars = costs.map((v, i) => `<rect class="bar bar--cost" x="${(x(i) - barW / 2).toFixed(1)}" y="${y(0)}" width="${barW.toFixed(1)}" height="${(y(v) - y(0)).toFixed(1)}"/>`).join('')
    + benefits.map((v, i) => (v > 0 ? `<rect class="bar bar--benefit" x="${(x(i) - barW / 2).toFixed(1)}" y="${y(v)}" width="${barW.toFixed(1)}" height="${(y(0) - y(v)).toFixed(1)}"/>` : '')).join('');
  return `<figure class="chart" data-chart aria-labelledby="chart-cba-title">
  <h3 id="chart-cba-title">${esc(c.costTitle)}</h3>
  <svg viewBox="0 0 440 320" role="img" aria-label="Bar and line chart. Costs fall mostly in the early years and benefits build over time. The cumulative net benefit line starts below zero and crosses zero at the break-even point, after which the investment has paid back.">
    <g class="legend"><rect class="bar bar--cost" x="${X0}" y="10" width="12" height="12"/><text class="lbl lbl--strong" x="${X0 + 18}" y="21">Costs</text>
    <rect class="bar bar--benefit" x="${X0 + 74}" y="10" width="12" height="12"/><text class="lbl lbl--green" x="${X0 + 92}" y="21">Benefits</text>
    <line class="line line--accent" x1="${X0 + 168}" y1="16" x2="${X0 + 190}" y2="16"/><text class="lbl lbl--accent" x="${X0 + 196}" y="21">Cumulative net benefit</text></g>
    <line class="ax" x1="${X0}" y1="${top}" x2="${X0}" y2="${bottom}"/><line class="ax" x1="${X0}" y1="${y(0)}" x2="${X1}" y2="${y(0)}"/>
    <text class="lbl" x="${X0 - 8}" y="${y(0) + 5}" text-anchor="end">0</text>
    <text class="lbl" x="22" y="150" transform="rotate(-90 22 150)" text-anchor="middle">Value (illustrative units)</text>
    <text class="lbl" x="${X0 + 4}" y="290">Start</text><text class="lbl" x="${X1}" y="290" text-anchor="end">Later years</text>
    <text class="lbl" x="${(X0 + X1) / 2}" y="310" text-anchor="middle">Time since the project starts</text>
    ${bars}
    <polyline class="draw line line--accent" pathLength="1" points="${cumulative.map((v, i) => `${x(i)},${y(v)}`).join(' ')}"/>
    ${cumulative.map((v, i) => `<circle class="dot dot--accent" cx="${x(i)}" cy="${y(v)}" r="3.5"/>`).join('')}
    <g class="fade-in"><line class="mark" x1="${cross}" y1="${y(0)}" x2="${cross}" y2="62"/><circle class="even" cx="${cross}" cy="${y(0)}" r="5.5"/>
    <text class="lbl lbl--strong" x="${(cross - 8).toFixed(1)}" y="64" text-anchor="end">Break-even</text></g>
  </svg>
  <figcaption>${esc(c.costCaption)}<span>${esc(c.note)}</span></figcaption>
</figure>`;
}

function flow(items, label) {
  return `<ol class="flow" style="--cols:${items.length}" aria-label="${esc(label)}" data-stagger>${items.map((it, i) => `<li class="flow__i${i === items.length - 1 ? ' flow__i--end' : ''}"><span class="flow__dot" aria-hidden="true"></span><h3>${esc(it.title)}</h3><p>${esc(it.text)}</p>${it.choices ? `<ul class="chips">${it.choices.map((x) => `<li class="chip">${esc(x)}</li>`).join('')}</ul>` : ''}</li>`).join('')}</ol>`;
}

/* A layered figure for the simple (no-WebGL) view: the same layers, drawn in CSS 3D. */
function stack(items, group) {
  return `<div class="wj-stack" aria-hidden="true">${items.map((it, i) => `<span style="--i:${i}" data-focus-layer="${group}:${i}"><b>${esc(it.name)}</b></span>`).join('')}</div>`;
}

/* ---------------- the journey ---------------- */
function journey() {
  const w = W();
  const sc = Object.fromEntries(w.scenes.map((s) => [s.slug, s]));
  const body = (s) => s.body.map((p) => `<p>${esc(p)}</p>`).join('');
  const shell = (s, inner, { wide = false, last = false } = {}) => `
    <section class="wj-scene${wide ? ' wj-scene--wide' : ''}${last ? ' wj-scene--last' : ''}" id="${s.slug}" aria-labelledby="${s.slug}-title" data-wj-scene>
      <div class="container"><div class="wj-scene__col">
        <h2 class="wj-scene__t" id="${s.slug}-title">${esc(s.title)}</h2>
        <div class="wj-scene__b">${body(s)}</div>
        ${inner}
      </div></div>
    </section>`;
  const shortcut = esc(T()['hero-shortcut'])
    .replace(/\{sectors\}( [^\s.,]+)?/, (m, word = '') => `<a href="/sectors">${D.sectors.length}${word}</a>`)
    .replace(/\{capabilities\}( [^\s.,]+)?/, (m, word = '') => `<a href="/capabilities">${D.capabilities.cards.length}${word}</a>`);
  const systems = `
        ${stack(w.systems, 'systems')}
        <ul class="wj-chips" aria-label="${esc(sc.complexity.rail)}">${w.systems.map((s, i) => `<li><button type="button" aria-pressed="false" data-focus="systems:${i}">${esc(s.name)}</button></li>`).join('')}</ul>
        <div class="wj-note" aria-live="polite" data-wj-note>${w.systems.map((s, i) => `<div data-note="${i}" hidden><p>${esc(s.note)}</p><p class="wj-note__rel">${esc(w.tiedTo)} ${s.relates.map((r) => esc(w.systems.find((x) => x.slug === r).name.toLowerCase())).join(', ').replace(/, ([^,]*)$/, ' and $1')}.</p></div>`).join('')}</div>`;
  const evidence = `
        ${stack(w.evidence, 'evidence')}
        <ul class="wj-layers" aria-label="${esc(sc.evidence.rail)}">${w.evidence.map((l, i) => `<li id="evidence-${l.slug}"><button type="button" aria-pressed="false" data-focus="evidence:${i}"><b>${esc(l.name)}</b><span>${esc(l.text)}</span></button></li>`).join('')}</ul>`;
  const insight = `<div class="wj-charts"><div class="glass">${impactChart()}</div><div class="glass">${costChart()}</div></div>`;
  const policy = `<div class="glass wj-flowbox"><p class="wj-eg">${esc(w.policyExample)}</p>${flow(w.policySteps, sc.policy.title)}</div>`;
  const practice = `<div class="glass wj-flowbox">${flow(w.practiceStages, sc.practice.title)}</div>`;
  const impact = `
        <ul class="wj-outcomes">${w.impactOutcomes.map((o) => `<li class="glass"><h3>${esc(o.title)}</h3><p>${esc(o.change)}</p><p class="wj-shown"><b>${esc(w.shownLabel)}</b>${esc(o.shown)}</p></li>`).join('')}</ul>
        <div class="wj-cta">${w.impactCtas.map((c) => btn(esc(c.label), esc(c.href), c.ghost ? 'btn--outline-light' : 'btn--light')).join('')}</div>`;
  const scene3d = {
    systems: w.systems.map((s) => ({ name: s.name, relates: s.relates.map((r) => w.systems.findIndex((x) => x.slug === r)) })),
    evidence: w.evidence.map((l) => l.name),
    sites: w.siteLabels,
  };
  const rail = w.scenes.map((s) => `<li><a href="#${s.slug}" data-rail-link><span>${esc(s.rail)}</span><i></i></a></li>`).join('');
  return `
<div class="wj on-dark dark" data-wj>
  <div class="wj__stage" aria-hidden="true">
    <img class="wj__poster" src="/assets/img/why-contours.svg" width="1920" height="1080" alt="" fetchpriority="high">
    <div class="wj__canvas" data-wj-canvas></div>
    <div class="wj__fade"></div>
  </div>
  <div class="wj__scenes">
    <section class="wj-hero" id="why-start" aria-labelledby="why-title" data-wj-scene>
      <div class="container">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="${esc(D.navigation.homeHref)}">${esc(D.navigation.homeLabel)}</a><span>${esc(breadcrumb('/why-ip3').label)}</span></nav>
        <h1 class="split" id="why-title" data-hero-title>${rich(D.pages.why.h1)}</h1>
        <p class="lead" data-reveal>${esc(D.pages.why.lead)}</p>
        <div class="wj-cta" data-reveal>${btn(esc(w.hero.primary.label), esc(w.hero.primary.href), 'btn--light')}${btn(esc(w.hero.secondary.label), esc(w.hero.secondary.href), 'btn--outline-light')}</div>
        <p class="wj-hero__aud" data-reveal>${esc(w.hero.audience)}</p>
        <p class="wj-hero__aud" data-reveal>${shortcut}</p>
      </div>
      <a class="wj-cue" href="#complexity"><span>${esc(T()['scroll-cue'])}</span><i aria-hidden="true"></i></a>
    </section>
    ${shell(sc.complexity, systems)}
    ${shell(sc.evidence, evidence)}
    ${shell(sc.insight, insight, { wide: true })}
    ${shell(sc.policy, policy, { wide: true })}
    ${shell(sc.practice, practice, { wide: true })}
    ${shell(sc.impact, impact, { last: true })}
  </div>
  <nav class="wj-rail" aria-label="Story scenes" data-wj-rail><ol>${rail}</ol></nav>
  <div class="wj-mbar" aria-hidden="true" data-wj-mbar><span>${w.scenes.map(() => '<i></i>').join('')}</span><b data-wj-mlabel></b></div>
  <button class="wj-toggle" type="button" aria-pressed="true" data-wj-toggle data-on="${esc(T()['view-3d-on'])}" data-off="${esc(T()['view-3d-off'])}" hidden>${esc(T()['view-3d-on'])}</button>
  <script type="application/json" data-wj-data>${JSON.stringify(scene3d).replace(/</g, '\\u003c')}</script>
</div>`;
}

/* ---------------- giant word that grows and blows past the camera ---------------- */
function bridge() {
  return `<section class="giant on-dark dark" aria-hidden="true" data-giant><div class="giant__pin"><span class="giant__w" data-giant-word>${esc(W().bridgeWord)}</span></div></section>`;
}

/* ---------------- brand film ---------------- */
function film() {
  const f = W().film;
  return `
<section class="wfilm on-dark dark" aria-labelledby="film-title" data-film>
  <div class="container">
    <span class="eyebrow" data-reveal>${esc(f.kicker)}</span>
    <h2 class="split" id="film-title">${esc(f.heading)}</h2>
    <p class="lead" data-reveal>${esc(f.lead)}</p>
  </div>
  <div class="wfilm__frame" data-film-frame>
    <video muted loop playsinline preload="none" poster="${f.poster}" aria-label="${esc(f.label)}" data-lazyvideo><source data-src="${f.video.replace(/\.mp4$/, '.webm')}" type="video/webm"><source data-src="${f.video}" type="video/mp4"></video>
  </div>
</section>`;
}

/* ---------------- what clients hire IP3 to deliver ---------------- */
function capabilities() {
  const rows = D.capabilities.cards.map((c, i) => {
    const applied = D.sectors.filter((s) => s.caps.includes(c.slug));
    return `<details class="wcap"${i === 0 ? ' open' : ''}><summary><span class="wcap__n">${pad(i)}</span><span class="wcap__t">${plain(c.title)}</span><span class="wcap__i" aria-hidden="true"></span></summary>
      <div class="wcap__b"><q>“${esc(c.problem)}”</q><div><div class="chips">${c.deliverables.map((d) => `<span class="chip">${esc(d)}</span>`).join('')}</div>
      <p class="wcap__s">${applied.map((s) => `<a href="/sectors/${s.slug}">${esc(s.title.split(',')[0].split(' & ')[0])}</a>`).join(' · ')}</p>
      <a class="link" href="/capabilities#${c.slug}">${plain(c.short || c.title)}${arrow}</a></div></div></details>`;
  }).join('');
  return `<section class="section section--sand" id="why-capabilities"><div class="container">${head('why-capabilities', 'section__head--split')}<div class="wcaps" data-stagger>${rows}</div><div style="margin-top:36px" data-reveal>${btn(esc(T()['cta-all-capabilities']), '/capabilities', 'btn--ghost')}</div></div></section>`;
}

/* ---------------- sectors as a network: linked where they share three or more capabilities ---------------- */
function sectorMap() {
  const list = D.sectors;
  const n = list.length;
  const R = 150; const C = 200;
  const pos = list.map((_, i) => { const a = (i / n) * Math.PI * 2 - Math.PI / 2; return [+(C + Math.cos(a) * R).toFixed(1), +(C + Math.sin(a) * R).toFixed(1)]; });
  const shared = (a, b) => a.caps.filter((c) => b.caps.includes(c)).length;
  const ties = list.map((s, i) => list.map((t, j) => (i !== j && shared(s, t) >= 3 ? j : -1)).filter((j) => j >= 0));
  const edges = [];
  list.forEach((s, i) => ties[i].forEach((j) => { if (j > i) edges.push([i, j, shared(s, list[j])]); }));
  const short = (s) => s.title.split(',')[0].split(' & ')[0];
  const svg = `<svg class="smap__g" viewBox="0 0 400 400" aria-hidden="true">
    <circle class="smap__ring" cx="${C}" cy="${C}" r="${R}"/>
    ${edges.map(([a, b, k]) => `<path class="smap__e" data-e="${a} ${b}" style="--k:${k}" d="M${pos[a][0]} ${pos[a][1]} Q${C} ${C} ${pos[b][0]} ${pos[b][1]}"/>`).join('')}
    ${pos.map(([x, y], i) => `<g class="smap__n" data-n="${i}"><circle cx="${x}" cy="${y}" r="9"/><text x="${x}" y="${y + (y < C ? -18 : 28)}" text-anchor="middle">${pad(i)}</text></g>`).join('')}
  </svg>`;
  const panels = list.map((s, i) => `<article class="smap__p${i === 0 ? ' is-active' : ''}" data-panel="${i}" id="map-${s.slug}">
      <span class="smap__k">${pad(i)}</span><h3>${esc(s.title)}</h3><p>${esc(s.problem)}</p>
      <p class="smap__h">${esc(T()['sector-shared'])}</p><p class="smap__ties">${ties[i].map((j) => `<a href="/sectors/${list[j].slug}">${esc(short(list[j]))}</a>`).join('')}</p>
      <p class="smap__h">${esc(T()['sector-focus'])}</p><ul class="smap__areas">${s.areas.slice(0, 4).map((a) => `<li>${plain(a)}</li>`).join('')}</ul>
      <a class="link" href="/sectors/${s.slug}">${esc(T()['cta-sector-page'])}${arrow}</a>
    </article>`).join('');
  const tabs = list.map((s, i) => `<li><button type="button" aria-pressed="${i === 0}" data-pick="${i}"><b>${pad(i)}</b>${esc(short(s))}</button></li>`).join('');
  return `<section class="section on-dark dark section--dark" id="why-sectors"><div class="container">${head('why-sectors', 'section__head--split')}
    <div class="smap" data-smap><div class="smap__vis">${svg}<ul class="smap__tabs" aria-label="${esc(D.headings['why-sectors'].eyebrow)}">${tabs}</ul></div><div class="smap__panels" aria-live="polite">${panels}</div></div>
  </div></section>`;
}

/* ---------------- selected work ---------------- */
function work() {
  const cards = D.engagements.slice(0, 4).map((e) => `<article class="wk" data-tilt><div class="wk__img"><img src="${e.image}" width="800" height="600" alt="" loading="lazy"></div><div class="wk__b"><p class="wk__m"><b>${esc(e.client)}</b><span>${esc(e.year)}</span></p><h3>${esc(e.title)}</h3><p>${esc(e.summary)}</p><a class="link" href="/sectors/${e.sectorSlug}">${esc(e.sector)}${arrow}</a></div></article>`).join('');
  return `<section class="section section--paper" id="why-work"><div class="container">${head('why-work', 'section__head--split')}<div class="wks" data-stagger>${cards}</div><div style="margin-top:36px" data-reveal>${btn(esc(T()['cta-all-engagements']), '/engagements', 'btn--ghost')}</div></div></section>`;
}

/* ---------------- Policy Intelligence Terminal: pinned walkthrough ---------------- */
function terminal() {
  const t = W().terminal;
  const beats = t.beats.map((b, i) => `
      <article class="term__beat" data-beat="${i}" aria-labelledby="term-beat-${i}">
        <div class="term__txt" data-beat-text>
          <p class="term__k">${pad(i)} / ${pad(t.beats.length - 1)}</p>
          <h3 id="term-beat-${i}">${esc(b.title)}</h3>
          <p>${esc(b.text)}</p>
          <ul>${b.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
        </div>
        <figure class="term__fig" data-beat-fig>
          <div class="term__screen"><div class="term__bar" aria-hidden="true"><i></i><i></i><i></i><span>IP3 · ${esc(t.heading)}</span><b>${esc(T()['terminal-live'])}</b></div>
          <div class="term__img"><img src="${b.image}" width="1600" height="1000" alt="${esc(b.caption)}" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async"><span class="term__scan" aria-hidden="true"></span></div></div>
          <figcaption>${esc(b.caption)}</figcaption>
        </figure>
      </article>`).join('');
  return `
<section class="term on-dark dark" id="terminal" aria-labelledby="terminal-title" data-term>
  <div class="container term__intro">
    <span class="eyebrow" data-reveal>${esc(t.kicker)}</span>
    <h2 class="split" id="terminal-title">${esc(t.heading)}</h2>
    <p class="lead" data-reveal>${esc(t.lead)}</p>
  </div>
  <div class="container term__stage" data-term-stage>
    <nav class="term__rail" aria-label="${esc(t.heading)}"><ol>${t.beats.map((b, i) => `<li><button type="button" data-term-jump="${i}"${i === 0 ? ' aria-current="step"' : ''}><i aria-hidden="true"></i><b>${pad(i)}</b><span>${esc(b.title)}</span></button></li>`).join('')}</ol></nav>
    <div class="term__beats">${beats}</div>
    <div class="term__pipe"><div class="term__line" aria-hidden="true"><i data-term-fill></i></div><ol>${t.pipeline.map((p, k) => `<li data-term-node><i aria-hidden="true"></i><span><b>${String(k).padStart(2, '0')}</b> ${esc(p)}</span></li>`).join('')}</ol></div>
  </div>
  <div class="container term__cta">${btn(esc(t.cta.label), esc(t.cta.href), 'btn--light')}</div>
</section>`;
}

/* ---------------- six movements, one line ---------------- */
function method() {
  const cards = D.approach.pathway.cards;
  const items = cards.map((c) => ({ title: c.title, text: c.text.split(/(?<=\.)\s/)[0] }));
  return `<section class="section" id="why-method"><div class="container">${head('why-method')}${flow(items, D.headings['why-method'].eyebrow)}<div style="margin-top:40px" data-reveal>${btn(esc(T()['cta-approach']), '/approach', 'btn--ghost')}</div></div></section>`;
}

function why() {
  const pg = D.pages.why;
  const body = [journey(), bridge(), film(), capabilities(), sectorMap(), work(), terminal(), method(), cta('cta-why')].join('\n');
  return page({
    title: pg.title, desc: pg.desc, path: '/why-ip3', body, bodyClass: 'why',
    preload: '<link rel="preload" as="image" href="/assets/img/why-contours.svg" fetchpriority="high">',
    scripts: '<script type="module" src="/assets/js/why.js?v=__WHYV__"></script>',
  });
}

module.exports = { why };
