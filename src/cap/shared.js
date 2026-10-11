// Small layout helpers copied from pages-inner.js so the page modules do not depend on that file.
const { esc, rich } = require('../layout');

const sec = (inner, cls = '', id = '') => `<section class="section ${cls}"${id ? ` id="${id}"` : ''}><div class="container">${inner}</div></section>`;
const tile = (t, p, n) => `<div class="tile">${n ? `<span class="n">${n}</span>` : ''}<h3>${t}</h3><p>${p}</p></div>`;

// section heading from a module's content file: eyebrow, h2 (carrying the id the section is labelled by) and an optional lead.
// split = heading left, lead right.
const head = (c, id, split = false) => `<div class="section__head${split ? ' section__head--split' : ''}"><div class="cp-head"><span class="eyebrow" data-reveal>${esc(c.eyebrow)}</span><h2 class="split" id="${id}">${rich(c.title)}</h2></div>${c.lead ? `<p class="lead" data-reveal>${esc(c.lead)}</p>` : ''}</div>`;

module.exports = { sec, tile, head };
