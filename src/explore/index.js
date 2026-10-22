const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { esc, page, btn } = require('../layout');
const catalogue = require('./catalogue');
const normalizedRead = filename => fs.readFileSync(filename, 'utf8').replace(/\r\n/g,'\n');
const file = (slug, ext) => normalizedRead(path.join(__dirname, 'models', `${slug}.${ext}`));
const version = value => crypto.createHash('sha256').update(value).digest('hex').slice(0, 12);
function assets(name = 'explorer') {
  const css = normalizedRead(path.join(__dirname, `${name}.css`));
  const js = normalizedRead(path.join(__dirname, `${name}.js`));
  return { styles: `<link rel="stylesheet" href="/assets/css/${name}.css?v=${version(css)}">`, scripts: `<script src="/assets/js/${name}.js?v=${version(js)}" defer></script>` };
}
function signature(m, factor = 50) {
  const grid = '<path d="M30 45H510M30 100H510M30 155H510M30 210H510" class="xp-grid"/>';
  const label = `<text x="30" y="255">${esc(m.title.toUpperCase())} · CONCEPTUAL DIAGRAM</text>`;
  const circles = (nodes) => nodes.map(([x,y,label],i)=>`<g class="xp-node" style="--i:${i}"><circle cx="${x}" cy="${y}" r="27"/><text x="${x}" y="${y+48}" text-anchor="middle">${label}</text></g>`).join('');
  let draw = '';
  if (m.slug === 'economics-trade') draw = '<path class="xp-flow" d="M105 130Q270 5 435 130M105 130Q270 240 435 130"/>' + circles([[105,130,'MARKETS'],[270,65,'PRICES'],[435,130,'TRADE']]);
  if (m.slug === 'finance-investment') draw = [0,1,2,3,4,5,6].map((i)=>`<rect class="xp-bar" x="${48+i*65}" y="${180-(30+i*17)*(1-factor/200)}" width="35" height="${30+i*17}"/>`).join('')+'<path class="xp-flow" d="M40 210H500"/>';
  if (m.slug === 'market-enterprise') draw = '<path class="xp-flow" d="M270 125L95 70M270 125L445 70M270 125L95 195M270 125L445 195"/>'+circles([[270,125,'FIRM'],[95,70,'DEMAND'],[445,70,'COST'],[95,195,'SKILLS'],[445,195,'TECH']]);
  if (m.slug === 'development-impact') draw = '<path class="xp-flow" d="M55 195L470 75"/><path class="xp-compare" d="M55 205L470 155M55 195L470 145"/><text x="380" y="60">TREATED</text><text x="380" y="180">COMPARISON</text>';
  if (m.slug === 'policy-governance') draw = '<path class="xp-flow" d="M80 120H455M270 120V50M270 120V200"/>'+circles([[80,120,'RULES'],[270,50,'AGENCIES'],[270,200,'ACCOUNTABILITY'],[455,120,'SERVICE']]);
  if (m.slug === 'management-delivery') draw = '<path class="xp-flow" d="M70 85H470M70 175H470"/>'+[0,1,2,3].map(i=>`<circle class="xp-milestone" cx="${90+i*120}" cy="85" r="10"/><rect class="xp-bar" x="${75+i*100}" y="150" width="${55+i*9}" height="35"/>`).join('')+'<text x="60" y="225">MILESTONES → CAPACITY → DELIVERY</text>';
  return `<svg viewBox="0 0 540 275" role="img" aria-label="${esc(m.title)}: conceptual analytical diagram. No measured or calculated result.">${grid}${draw}${label}</svg>`;
}
function preview() {
  const m = catalogue[0];
  return `<section class="section xp-preview" id="thinking-in-action" aria-labelledby="xp-home-title" data-explorer data-home-preview>
    <div class="container"><div class="section__head"><span class="eyebrow">Explore Our Thinking in Action</span><h2 id="xp-home-title">Complex questions.<br><em>Evidence-led decisions.</em></h2><p class="lead">Explore six analytical disciplines through illustrative public and private decisions.</p></div>
    <div class="xp-layout"><div class="xp-choices" aria-label="Analytical disciplines">${catalogue.map((x,i)=>`<button type="button" data-xp-select="${x.slug}" aria-pressed="${i===0}"><span>0${i+1}</span><b>${esc(x.title)}</b><small>${esc(x.tag)}</small></button>`).join('')}</div>
    <div class="xp-stage"><div class="xp-switch" aria-label="Decision context"><button type="button" data-xp-context="public" aria-pressed="true">Public</button><button type="button" data-xp-context="private" aria-pressed="false">Private</button><button type="button" data-xp-motion aria-pressed="false">Pause motion</button></div>
    <p class="xp-overline" data-xp-kicker>${esc(m.title)}</p><h3 data-xp-question>${esc(m.public[1])}</h3><div data-xp-visual>${signature(m)}</div><p class="xp-note">Conceptual preview · synthetic teaching examples</p>
    <label class="xp-sensitivity"><span data-xp-input-label>Additional tariff (%)</span><input data-xp-factor type="range" min="0" max="30" value="12" aria-describedby="xp-factor-note"></label><output class="xp-result" data-xp-result aria-live="polite">Illustrative export volume index: ${(require('./math').trade(.12,.08,1.5).qty*100).toFixed(1)}</output><p class="xp-note" id="xp-factor-note" data-xp-assumptions>Illustrative assumptions: FX +8%, elasticity 1.5, baseline index 100.</p>
    <a class="btn btn--light" data-xp-link href="/explore/${m.slug}">Explore the interactive model</a></div></div>
    <p class="xp-more"><a class="link" href="/explore">Discover all 12 entry scenarios →</a></p>
    <script type="application/json" data-xp-data>${JSON.stringify(catalogue.map(x=>({slug:x.slug,title:x.title,public:x.public,private:x.private,visual:signature(x)}))).replace(/</g,'\\u003c')}</script>
    <noscript><p>Select a full experience below. Scenario descriptions and methodology remain available without scripting.</p><ul>${catalogue.map(x=>`<li><a href="/explore/${x.slug}">${esc(x.title)}</a></li>`).join('')}</ul></noscript>
    </div></section>`;
}
function hub() {
  const body = `<section class="section xp-hub"><div class="container"><span class="eyebrow">Interactive Explorer · Illustrative labs</span><h1>Explore our thinking<br><em>in action.</em></h1><p class="lead">Six disciplines. Twelve entry scenarios. Follow a question into a complete animated experience, change the assumptions and examine what the model can—and cannot—indicate.</p><p class="xp-intro-note">All numerical examples are synthetic. They are not forecasts or client results.</p>
    <nav class="xp-index" aria-label="Choose an analytical discipline">${catalogue.map(m=>`<a href="#${m.slug}">${esc(m.title)}</a>`).join('')}</nav>
    <div class="xp-tour-controls"><button type="button" class="btn btn--ghost" data-hub-tour aria-pressed="false">Start guided tour</button><p role="status" data-hub-status>Tour starts only when you choose.</p></div>
    ${catalogue.map((m,i)=>`<section class="xp-hub-discipline" id="${m.slug}" aria-labelledby="xp-title-${m.slug}"><div><span class="eyebrow">0${i+1} / Analytical discipline</span><h2 id="xp-title-${m.slug}">${esc(m.title)}</h2><p>${esc(m.tag)}</p></div><div class="xp-cases">${['public','private'].map(context=>{const c=m[context];return `<article data-hub-case><span class="xp-context">${context==='public'?'Public':'Private'} application</span><h3>${esc(c[0])}</h3><p>${esc(c[1])}</p><dl><dt>Evidence approach</dt><dd>${esc(c[2])}</dd><dt>Decision output</dt><dd>${esc(c[3])}</dd></dl><p class="xp-source">Research anchor: <a href="${esc(m.sources[0][1])}" target="_blank" rel="noopener noreferrer">${esc(m.sources[0][0])}</a>. Method reference; no coefficient calibration implied.</p><a class="link" href="/explore/${m.slug}?context=${context}">Open full ${context} experience →</a></article>`}).join('')}</div></section>`).join('')}
    </div></section>`;
  return page({ title:'Interactive Explorer — Illustrative Analytical Labs', desc:'Explore twelve public and private decision scenarios across six full interactive analytical experiences. Synthetic examples with transparent methods.', path:'/explore', body, bodyClass:'explore-hub', ...assets() });
}
function transcripts(m) {
  const { order, cases } = JSON.parse(file(m.slug,'json'));
  return `<details class="xp-transcripts"><summary>Read all ${order.length*2} scenario narratives</summary>${order.flatMap(key=>['public','private'].map(context=>{
    const d=cases[key][context];
    return `<article><h3>${esc(d.title)}</h3><p><strong>${context==='public'?'Public':'Private'} application</strong> · ${esc(d.label||key)}</p><p>${esc(d.desc||d.description||'')}</p>${['problems','outputs','results','methods','steps','gates'].filter(k=>Array.isArray(d[k])).map(k=>`<h4>${k==='problems'?'Decision challenge':['outputs','results'].includes(k)?'Illustrative decision outputs':'Evidence and diagnosis'}</h4><ul>${d[k].map(v=>`<li>${esc(Array.isArray(v)?v.join(': '):v)}</li>`).join('')}</ul>`).join('')}${d.note?`<p>${esc(d.note)}</p>`:''}</article>`;
  })).join('')}</details>`;
}
function model(m) {
  const css = file(m.slug,'css'), js = file(m.slug,'js');
  const originalBody = require('./render-initial')(file(m.slug,'html'), js);
  const body = `<div class="xp-model-toolbar"><div class="container"><a href="/explore">← All analytical experiences</a><span>Illustrative lab · synthetic assumptions</span><button type="button" data-model-motion aria-pressed="false">Pause motion</button></div></div>
    <noscript><p>The default illustration is shown below. Turn on JavaScript to change scenarios and recalculate charts, or read every scenario in the narrative list after the model.</p></noscript>
    <div class="ip3-model" data-model="${m.slug}">${originalBody}${m.slug==='finance-investment'?`<script type="application/json" data-finance-cases>${JSON.stringify(JSON.parse(file(m.slug,'json')).cases).replace(/</g,'\\u003c')}</script>`:''}</div>
    <section class="section xp-method" id="model-methodology" aria-labelledby="xp-method-title"><div class="container narrow"><span class="eyebrow">Interpretation & methodology</span><h2 id="xp-method-title">Understand the assumptions.</h2><p class="lead">${esc(m.method)}</p><details open><summary>Calculation and units</summary><p>${esc(m.formula)}</p></details><details open><summary>What this model cannot establish</summary><p>${esc(m.limits)}</p><p>There is no empirical calibration dataset in the handoff. Changing a scenario changes its narrative; controls are a shared teaching model, except Finance, where each case also defines its own cash-flow assumptions.</p></details><p role="status" aria-live="polite" aria-atomic="true" data-model-summary></p><div data-model-table></div>
    <details><summary>Research references and professional context</summary><ul>${m.sources.map(([label,url])=>`<li><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a></li>`).join('')}</ul><p>These references explain the analytical discipline. They do not validate the synthetic coefficients or imply endorsement.</p><p>For professional context, explore <a href="/engagements">documented engagements</a>. The hypothetical applications and model outputs on this page are not engagement results.</p></details>
    ${transcripts(m)}<noscript><p>JavaScript is required to recalculate the interactive charts. The original hero, all scenario narratives, assumptions and links remain readable here.</p></noscript>
    <div class="xp-next"><a class="link" href="/capabilities#${m.capability}">Related IP3 capability →</a><a class="link" href="/sectors">Explore relevant sectors →</a></div>
    <div class="xp-enquire"><h3>Discuss your ${esc(m.title.toLowerCase())} question.</h3><p>Bring your decision and evidence needs. Simulator values stay in this browser.</p>${btn('Discuss this discipline',`/contact?discipline=${m.slug}#contact-form`)}</div></div></section>`;
  const shell = assets('model');
  return page({ title:`${m.title} — Full Interactive Illustrative Lab`, desc:`Explore the full ${m.title.toLowerCase()} experience: animated scenarios, public and private applications, analytical controls, charts and transparent assumptions.`, path:`/explore/${m.slug}`, body, bodyClass:'explore-model',
    styles: `<link rel="stylesheet" href="/assets/css/models/${m.slug}.css?v=${version(css)}">`+shell.styles,
    scripts:`<script src="/assets/js/model-math.js?v=${version(normalizedRead(path.join(__dirname,'math.js')))}" defer></script><script src="/assets/js/models/${m.slug}.js?v=${version(js)}" defer></script>`+shell.scripts });
}
function related(slugs, label='Explore the analytical disciplines') {
  const models=catalogue.filter(m=>slugs.includes(m.slug));
  return `<section class="section" aria-label="${esc(label)}"><div class="container"><span class="eyebrow">Thinking in action</span><h2 style="margin:18px 0 26px">${esc(label)}</h2><p class="lead">Illustrative models show how analytical questions can be explored. Each experience explains its assumptions and limitations.</p><div class="paths" style="margin-top:24px">${models.map(m=>`<a class="path" href="/explore/${m.slug}"><div><b>${esc(m.title)}</b><span>${esc(m.tag)}</span></div><span aria-hidden="true">↗</span></a>`).join('')}</div></div></section>`;
}
module.exports = { catalogue, preview, hub, model, signature, assets, related, version };
