// Signature scroll scene: a sticky drawing beside five text steps. The drawing is decorative (aria-hidden) and differs per sector
// (content/sector-pages/<slug>.json → scene.type); the steps carry the words. src/js/sec/30-scene.js turns scroll position into a
// continuous step value and hands it to the drawing's script (src/js/sec/31-38-*.js). Without JavaScript or with reduced motion,
// the drawing shows its final state and the steps read as an ordered list.
const { T, esc, rich, n2, points, seed } = require('./util');

const f1 = (v) => Math.round(v * 10) / 10;

// a closed, slightly irregular blob path around (cx, cy), for contour slices and plates
function blob(key, r, cx = 0, cy = 0, wob = 0.12, n = 56) {
  const a = [1, 2, 3].map((k) => seed(key, k) * Math.PI * 2);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    const rr = r * (1 + wob * (0.55 * Math.sin(2 * t + a[0]) + 0.3 * Math.sin(3 * t + a[1]) + 0.15 * Math.sin(5 * t + a[2])));
    pts.push(`${f1(cx + rr * Math.cos(t))} ${f1(cy + rr * Math.sin(t))}`);
  }
  return `M${pts.join('L')}Z`;
}

/* ---- 01 terrain: stacked contour slices in CSS 3D, a rising water plane, infrastructure extrusions, finance flows, canopy ---- */
function terrain(slug) {
  const L = 9;
  const layers = Array.from({ length: L }, (_, z) => {
    const r = 92 * (1 - (z / L) * 0.82);
    const d = blob(`${slug}-t${z}`, r, f1((seed(slug, z + 10) - 0.5) * z * 4), f1((seed(slug, z + 20) - 0.5) * z * 4), 0.14);
    // low ground in warm sand, high ground in IP3 green
    const k = z / (L - 1), mix = (a, b) => Math.round(a + (b - a) * k);
    const fill = `rgb(${mix(74, 34)} ${mix(58, 92)} ${mix(44, 52)})`;
    // a dark copy just under each slice reads as the terrace wall
    return `<svg class="sx-terrain__l sx-terrain__l--wall" viewBox="-100 -100 200 200" style="--z:${z - 0.55}"><path d="${d}"/></svg><svg class="sx-terrain__l" viewBox="-100 -100 200 200" style="--z:${z}"><path class="sx-terrain__fill" style="fill:${fill}" d="${d}"/><path class="sx-terrain__flood" d="${d}"/></svg>`;
  }).join('');
  const blocks = [[-38, 22, 3], [-14, 34, 2], [18, 30, 2], [34, -6, 3], [-30, -24, 4], [6, -36, 5]].map(([x, y, z], i) => {
    const h = 3 + Math.round(seed(slug, 40 + i) * 3);
    return `<i class="sx-terrain__b" style="--x:${x};--y:${y};--z:${z};--n:${h}">${Array.from({ length: h }, (_, k) => `<b style="--k:${k}"></b>`).join('')}</i>`;
  }).join('');
  const flows = [[-34, 22], [-12, 32], [20, 28], [36, -6], [-28, -22], [8, -34]].map(([x, y]) => `<path d="M-96 96 Q${f1((x - 96) / 2)} ${f1((y + 96) / 2 - 40)} ${x} ${y}"/>`).join('');
  const trees = Array.from({ length: 26 }, (_, i) => {
    const t = seed(slug, 60 + i) * Math.PI * 2, r = 12 + seed(slug, 90 + i) * 56;
    return `<i class="sx-terrain__tree" style="--x:${f1(Math.cos(t) * r)};--y:${f1(Math.sin(t) * r)};--z:${Math.max(1, Math.round(5 - r / 16))};--d:${f1(seed(slug, 120 + i))}"></i>`;
  }).join('');
  return `<div class="sx-terrain"><div class="sx-terrain__world">${layers}<i class="sx-terrain__grid"></i><i class="sx-terrain__water"></i>${blocks}<svg class="sx-terrain__flows" viewBox="-100 -100 200 200">${flows}</svg>${trees}</div></div>`;
}

/* ---- 02 ladder: five platforms climbing in 3D, a trail of dots for the learner's path ---- */
function ladder(steps) {
  const slab = Array.from({ length: 6 }, (_, k) => `<b style="--k:${k}"></b>`).join('');
  const plats = steps.map((st, i) => `<div class="sx-ladder__p" style="--i:${i}">${slab}<span>${n2(i)} · ${esc(st.label)}</span></div>`).join('');
  const trail = Array.from({ length: 33 }, (_, k) => `<i class="sx-ladder__dot" style="--t:${f1((k / 32) * (steps.length - 1))}"></i>`).join('');
  return `<div class="sx-ladder"><div class="sx-ladder__world">${plats}${trail}</div></div>`;
}

/* ---- 03 coverage: a population of dots drawn on canvas (measure, compare, include, adapt, cost) ---- */
const coverage = () => `<canvas class="sx-canvas" data-sx-canvas="coverage" width="900" height="680"></canvas>`;

/* ---- 04 stack: five plates of a digital state, exploding apart, with data packets rising through them ---- */
function stack(steps) {
  const plates = steps.map((st, i) => `<div class="sx-stack__p" style="--i:${i}"><i class="sx-stack__pat sx-stack__pat--${i}"></i><span>${n2(i)} · ${esc(st.label)}</span></div>`).join('');
  const packets = Array.from({ length: 9 }, (_, k) => `<i class="sx-stack__pk" style="--x:${f1(18 + seed('pk', k) * 64)};--y:${f1(18 + seed('pk', k + 9) * 64)};--dl:${f1(k * 0.37)}"></i>`).join('');
  return `<div class="sx-stack"><div class="sx-stack__world">${plates}${packets}</div></div>`;
}

/* ---- 05 flow: five links from diagnosis to accountability, drawn as the reader scrolls; a feedback loop closes the chain ---- */
function flow(steps) {
  const n = steps.length, W = 900, x = (i) => 90 + (i * (W - 180)) / (n - 1), y = (i) => 300 - Math.sin((i / (n - 1)) * Math.PI) * 110;
  const links = steps.slice(1).map((_, i) => `<path class="sx-flow__link" data-i="${i}" pathLength="1" d="M${f1(x(i))} ${f1(y(i))} C${f1(x(i) + 70)} ${f1(y(i) - 30)} ${f1(x(i + 1) - 70)} ${f1(y(i + 1) - 30)} ${f1(x(i + 1))} ${f1(y(i + 1))}"/>`).join('');
  const ghost = steps.slice(1).map((_, i) => `<path class="sx-flow__ghost" d="M${f1(x(i))} ${f1(y(i))} C${f1(x(i) + 70)} ${f1(y(i) - 30)} ${f1(x(i + 1) - 70)} ${f1(y(i + 1) - 30)} ${f1(x(i + 1))} ${f1(y(i + 1))}"/>`).join('');
  const loopD = `M${f1(x(n - 1))} ${f1(y(n - 1) + 26)} C${f1(x(n - 1))} 590 ${f1(x(0))} 590 ${f1(x(0))} ${f1(y(0) + 26)}`;
  const nodes = steps.map((st, i) => `<g class="sx-flow__n" data-i="${i}" transform="translate(${f1(x(i))} ${f1(y(i))})"><circle class="sx-flow__halo" r="34"/><circle class="sx-flow__dot" r="15"/><text class="sx-flow__num" y="5">${n2(i)}</text><text class="sx-flow__lbl" y="-50">${esc(st.label)}</text></g>`).join('');
  const pulses = steps.slice(1).map((_, i) => `<circle class="sx-flow__pulse" data-i="${i}" r="5"><animateMotion dur="${f1(2.4 + i * 0.3)}s" repeatCount="indefinite" path="M${f1(x(i))} ${f1(y(i))} C${f1(x(i) + 70)} ${f1(y(i) - 30)} ${f1(x(i + 1) - 70)} ${f1(y(i + 1) - 30)} ${f1(x(i + 1))} ${f1(y(i + 1))}"/></circle>`).join('');
  return `<div class="sx-flow"><svg viewBox="0 40 ${W} 580" preserveAspectRatio="xMidYMid meet">${ghost}${links}<path class="sx-flow__loop" pathLength="1" d="${loopD}"/><circle class="sx-flow__pulse sx-flow__pulse--loop" r="5"><animateMotion dur="5s" repeatCount="indefinite" path="${loopD}"/></circle>${pulses}${nodes}</svg></div>`;
}

/* ---- 06 chain: a value chain panning sideways with three parallax depths; five stations ---- */
function chain(steps) {
  const n = steps.length, gap = 560, X = (i) => 300 + i * gap, W = X(n - 1) + 300;
  const icon = [
    // factory, linked rings, port crane and ship, rising columns, a public building
    '<path d="M-60 40V-10l30-20v20l30-20v20l30-20V-40h20v80z"/><rect x="-45" y="10" width="14" height="14"/><rect x="-15" y="10" width="14" height="14"/><rect x="15" y="10" width="14" height="14"/>',
    '<circle cx="-30" cy="0" r="26"/><circle cx="0" cy="0" r="26"/><circle cx="30" cy="0" r="26"/>',
    '<path d="M-60 40h120l-14 16H-46z"/><rect x="-36" y="14" width="22" height="22"/><rect x="-10" y="14" width="22" height="22"/><path d="M30 36V-46h6v82M36-40l40 14"/>',
    '<rect x="-54" y="10" width="20" height="30"/><rect x="-24" y="-10" width="20" height="50"/><rect x="6" y="-30" width="20" height="70"/><rect x="36" y="-50" width="20" height="90"/>',
    '<path d="M-60-22L0-52 60-22z"/><rect x="-56" y="-18" width="112" height="8"/><rect x="-48" y="-6" width="12" height="40"/><rect x="-18" y="-6" width="12" height="40"/><rect x="12" y="-6" width="12" height="40"/><rect x="40" y="-6" width="12" height="40"/><rect x="-60" y="36" width="120" height="8"/>',
  ];
  const stations = steps.map((st, i) => `<g class="sx-chain__s" data-i="${i}" transform="translate(${X(i)} 300)"><circle class="sx-chain__disc" r="110"/><g class="sx-chain__icon">${icon[i % icon.length]}</g><text class="sx-chain__lbl" y="160">${n2(i)} · ${esc(st.label)}</text></g>`).join('');
  const hills = `<path class="sx-chain__far" d="M0 300 ${Array.from({ length: 24 }, (_, k) => `L${f1((k + 1) * (W / 24))} ${f1(230 + seed('hill', k) * 70)}`).join(' ')} L${W} 600 L0 600Z"/>`;
  const cargo = Array.from({ length: 14 }, (_, k) => `<rect class="sx-chain__cargo" x="${f1(seed('cg', k) * W)}" y="${f1(452 + seed('cg', k + 20) * 20)}" width="18" height="12" rx="2" style="--dl:${f1(k * -0.7)}s"/>`).join('');
  return `<div class="sx-chain"><svg class="sx-chain__svg" viewBox="0 0 ${W} 600" preserveAspectRatio="xMidYMid meet" style="--w:${W}"><g class="sx-chain__l0">${hills}</g><g class="sx-chain__l1"><path class="sx-chain__track" d="M0 470H${W}"/><path class="sx-chain__fill" pathLength="1" d="M0 470H${W}"/>${stations}</g><g class="sx-chain__l2">${cargo}</g></svg></div>`;
}

/* ---- 07 loop: a straight take–make–waste line bends into a circle; segments light as the loop turns ---- */
function loop(steps) {
  const segs = steps.slice(1).map((st, i) => {
    const a0 = (-90 + i * 90 + 6) * (Math.PI / 180), a1 = (-90 + (i + 1) * 90 - 6) * (Math.PI / 180), r = 190;
    const p = (a) => `${f1(r * Math.cos(a))} ${f1(r * Math.sin(a))}`;
    const am = (a0 + a1) / 2, lr = 250;
    return `<g class="sx-loop__seg" data-i="${i + 1}"><path pathLength="1" d="M${p(a0)} A${r} ${r} 0 0 1 ${p(a1)}"/><text x="${f1(lr * Math.cos(am))}" y="${f1(lr * Math.sin(am) + 6)}">${esc(st.label)}</text></g>`;
  }).join('');
  const words = String(T['sx-loop-linear'] || '').split('|').map((w, i, a) => `<text class="sx-loop__word" x="${f1(-300 + (600 * (i + 0.5)) / a.length)}" y="12">${esc(w.trim())}</text>`).join('');
  return `<div class="sx-loop"><svg viewBox="-340 -320 680 640"><path class="sx-loop__ghost" d="M-300 40H300"/><path class="sx-loop__path" data-sx-morph d="M0 -190A190 190 0 1 1 -0.1 -190"/>${words}<g class="sx-loop__orbit">${segs}<path class="sx-loop__arrow" d="M0 -204l14 14-14 14"/></g><g class="sx-loop__core"><circle r="96"/><text y="-8">E · S · G</text><text class="sx-loop__core-sub" y="26">${esc(steps[steps.length - 1].label)}</text></g></svg></div>`;
}

/* ---- 08 lattice: a network that moves from scattered signals to an ordered, guarded structure (canvas) ---- */
const lattice = () => `<canvas class="sx-canvas" data-sx-canvas="lattice" width="900" height="680"></canvas>`;

const DRAW = { terrain, ladder, coverage, stack, flow, chain, loop, lattice };

function render({ s, pg }) {
  const sc = pg.scene;
  const steps = sc.steps;
  const draw = DRAW[sc.type](sc.type === 'terrain' ? s.slug : steps);
  const rail = steps.map((st, i) => `<li><a href="#sx-step-${i + 1}" data-sx-jump="${i}"${i === 0 ? ' aria-current="step"' : ''}><i aria-hidden="true"></i><span>${esc(st.label)}</span></a></li>`).join('');
  const list = steps.map((st, i) => `<li class="sx-step" id="sx-step-${i + 1}" data-sx-step="${i}"><p class="sx-step__n">${n2(i)} <span>/ ${n2(steps.length - 1)}</span> · ${esc(st.label)}</p><h3>${esc(st.title)}</h3><p>${esc(st.text)}</p>${points(st.points)}</li>`).join('');
  const illustrative = ['coverage', 'lattice'].includes(sc.type) ? `<p class="sx-viz__note">${esc(T['sx-illustrative'])}</p>` : '';
  return `
<section class="sx-scene sx-scene--${sc.type} on-dark dark" id="sx-scene" data-sx-scene="${sc.type}" aria-labelledby="sx-scene-h">
  <div class="container sx-scene__head">
    <div><span class="eyebrow" data-reveal>${esc(sc.eyebrow)}</span><h2 class="split" id="sx-scene-h">${rich(sc.title)}</h2></div>
    ${sc.lead ? `<p class="lead" data-reveal>${esc(sc.lead)}</p>` : ''}
  </div>
  <a class="sx-skip" href="#sx-after-scene">${esc(T['sx-skip-scene'])}</a>
  <div class="container sx-scene__grid">
    <div class="sx-scene__sticky">
      <div class="sx-viz" data-sx-viz aria-hidden="true">${draw}<div class="sx-viz__now"><b data-sx-now-n>01</b><span data-sx-now-l>${esc(steps[0].label)}</span></div>${illustrative}</div>
      <nav class="sx-rail" aria-label="${esc(T['sx-steps-label'])}"><ol>${rail}</ol></nav>
    </div>
    <ol class="sx-steps">${list}</ol>
  </div>
  <span id="sx-after-scene" tabindex="-1"></span>
</section>`;
}

module.exports = { render };
