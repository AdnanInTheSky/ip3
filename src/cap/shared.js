// Small layout helpers copied from pages-inner.js so the page modules do not depend on that file.
const sec = (inner, cls = '', id = '') => `<section class="section ${cls}"${id ? ` id="${id}"` : ''}><div class="container">${inner}</div></section>`;
const tile = (t, p, n) => `<div class="tile">${n ? `<span class="n">${n}</span>` : ''}<h3>${t}</h3><p>${p}</p></div>`;

module.exports = { sec, tile };
