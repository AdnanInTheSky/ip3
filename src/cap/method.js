// "How the work is done": five stages (Reality → Evidence → Model → Decision → System). With JavaScript on a wide screen the stages
// become planes in a pinned CSS-3D tunnel the visitor scrolls through; otherwise they are five stacked panels. Each stage carries one
// graphic chosen by the fields it has: a photo, an evidence dot field, a cash-flow chart with the formula, an options test or a results chain.
// Every number in the chart and the options test is illustrative and labelled so; the evidence counts come from an assignment record.
const { T, esc, arrow, capBySlug, photoBySlug, proofBySlug, photoCaption, focal } = require('./util');
const { head } = require('./shared');

// arbitrary illustration values: two years of investment, then net benefits that level off
const FLOWS = [-60, -36, 8, 15, 19, 22, 24, 26, 27, 28, 28, 29, 29, 30, 30, 31];

function chart(s, m) {
  const base = 120, k = 1.35, w = 17, gap = 9.6, x0 = 34;
  let cum = 0;
  const pts = [];
  const bars = FLOWS.map((v, i) => {
    const h = Math.abs(v) * k, x = x0 + i * (w + gap);
    cum += v; pts.push(`${(x + w / 2).toFixed(1)},${(base - cum * 0.34).toFixed(1)}`);
    return `<rect class="cp-bar${v < 0 ? ' cp-bar--neg' : ''}" style="--k:${i}" x="${x.toFixed(1)}" y="${(v < 0 ? base : base - h).toFixed(1)}" width="${w}" height="${h.toFixed(1)}" rx="2"/>`;
  }).join('');
  const ticks = [0, 5, 10, 15].map((i) => `<text x="${(x0 + i * (w + gap) + w / 2).toFixed(1)}" y="236" text-anchor="middle">Y${i}</text>`).join('');
  return `<figure class="cp-g cp-g--model">
          <svg viewBox="0 0 480 244" aria-hidden="true" focusable="false"><line class="cp-axis" x1="24" x2="470" y1="${base}" y2="${base}"/>${bars}<path class="cp-curve" pathLength="1" d="M${pts.join(' L')}"/>${ticks}</svg>
          <figcaption><p class="cp-g__formula">${esc(s.formula)}</p><p class="cp-mono">${esc(s.chartLabel || '')}</p><p class="cp-mono cp-g__illus">${esc(m.formulaLabel)}</p></figcaption>
        </figure>`;
}

function dots(s) {
  const parts = s.parts || [];
  return `<figure class="cp-g cp-g--dots">
          <canvas class="cp-dots" width="990" height="480" data-parts="${parts.map((p) => p.n).join(',')}" aria-hidden="true"></canvas>
          <figcaption><p class="cp-g__fig"><b data-cp-count="${esc(s.figureValue)}">${esc(s.figureValue)}</b><span>${esc(s.figureLabel)}</span></p>
          <ul class="cp-g__legend">${parts.map((p, i) => `<li data-k="${i}"><i aria-hidden="true"></i><b>${p.n}</b> ${esc(p.label)}</li>`).join('')}</ul></figcaption>
        </figure>`;
}

function photo(s) {
  const p = photoBySlug[s.photo];
  return `<figure class="cp-g cp-g--photo"><div class="cp-g__frame"><img src="${esc(p.image)}" width="${p.w}" height="${p.h}" alt="" loading="lazy" decoding="async" style="object-position:${focal(p)}"></div><figcaption class="cp-mono">${esc(photoCaption(p))}</figcaption></figure>`;
}

// three options, one over the ceiling; when the stage plays, the bars grow and the feasible ones move up
function options(s, m) {
  const widths = [88, 63, 51];
  const order = [2, 0, 1];
  return `<figure class="cp-g cp-g--opts">
          <div class="cp-opts" aria-hidden="true">${s.options.map((o, i) => `<div class="cp-opt${widths[i] > 72 ? ' cp-opt--over' : ''}" style="--k:${i};--to:${order[i]};--w:${widths[i]}%"><span class="cp-mono">${esc(o)}</span><i><b></b></i></div>`).join('')}<span class="cp-opts__limit" style="--x:.72"><span class="cp-mono">${esc(s.constraintLabel || '')}</span></span></div>
          <figcaption><ul class="cp-g__crit">${(s.criteria || []).map((c) => `<li class="cp-mono">${esc(c)}</li>`).join('')}</ul><p class="cp-mono cp-g__illus">${esc(m.formulaLabel)}</p></figcaption>
        </figure>`;
}

function chain(s, m) {
  return `<figure class="cp-g cp-g--chain">
          <ol class="cp-chain">${s.chain.map((c, i) => `<li style="--k:${i}"><span class="cp-mono">0${i + 1}</span><b>${esc(c)}</b></li>`).join('')}</ol>
          <div class="cp-phases" aria-hidden="true">${(s.phases || []).map((p, i) => `<span style="--k:${i}"><i></i><span class="cp-mono">${esc(p)}</span></span>`).join('')}</div>
          <figcaption class="cp-mono cp-g__illus">${esc(m.formulaLabel)}</figcaption>
        </figure>`;
}

function graphic(s, m) {
  if (s.photo && photoBySlug[s.photo]) return photo(s);
  if (s.parts && s.parts.length) return dots(s);
  if (s.formula) return chart(s, m);
  if (s.options && s.options.length) return options(s, m);
  if (s.chain && s.chain.length) return chain(s, m);
  return '';
}

function render() {
  const m = T.method;
  const n = m.stages.length;
  const pad = (x) => String(x).padStart(2, '0');
  const planes = m.stages.map((s, i) => {
    const rec = s.record && proofBySlug[s.record];
    return `
      <article class="cp-plane" id="cp-stage-${esc(s.slug)}" data-i="${i}" aria-labelledby="cp-stage-${esc(s.slug)}-h">
        <div class="cp-plane__txt">
          <span class="cp-mono cp-plane__n">${pad(i + 1)} / ${pad(n)}</span>
          <h3 id="cp-stage-${esc(s.slug)}-h">${esc(s.label)}</h3>
          <p class="cp-plane__line">${esc(s.line)}</p>
          <p class="cp-plane__detail">${esc(s.detail)}</p>
          <ul class="cp-plane__caps">${s.caps.filter((c) => capBySlug[c]).map((c) => `<li><a class="chip" href="#${c}" data-tone="${capBySlug[c].i + 1}">${esc(capBySlug[c].short)}</a></li>`).join('')}</ul>
          ${rec ? `<a class="link cp-plane__rec" href="#proof-${esc(rec.slug)}" data-cp-open="${esc(rec.slug)}">${esc(m.recordLabel)}${arrow}</a>` : ''}
        </div>
        ${graphic(s, m)}
      </article>`;
  }).join('');
  return `
<section class="section section--dark on-dark dark cp-method" id="cp-method" aria-labelledby="cp-method-h">
  <div class="container">
    ${head(m, 'cp-method-h', true)}
    <p class="cp-mono cp-method__hint" aria-hidden="true"><i></i>${esc(m.hint)}</p>
  </div>
  <div class="cp-method__stage" data-cp-method>
    <div class="cp-method__floor" aria-hidden="true"></div>
    <div class="cp-tunnel container">${planes}
    </div>
    <nav class="cp-rail" aria-label="${esc(m.railLabel)}"><ol>${m.stages.map((s, i) => `<li><a href="#cp-stage-${esc(s.slug)}" data-i="${i}"><span class="cp-rail__dot" aria-hidden="true"></span><span class="cp-rail__t">${esc(s.label)}</span></a></li>`).join('')}</ol></nav>
  </div>
  <div class="container"><p class="cp-method__statement">${esc(m.statement)}</p></div>
</section>`;
}

module.exports = { render };
