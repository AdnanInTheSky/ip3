// The six capability rows. Foundation version = the rows exactly as they were on /capabilities before the proof layer.
const { D, esc, plain, arrow, engBySlug } = require('./util');
const { sec } = require('./shared');

/* The expandable detail under each capability row: what the capability includes, plus related engagements */
function capMore(c) {
  const items = c.groups.map((g) => `<section class="capmore__item"><h5>${esc(g.title)}</h5>${g.text ? `<p>${esc(g.text)}</p>` : ''}<ul class="checks">${g.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></section>`).join('');
  const engs = (c.engagements || []).map((k) => engBySlug[k]).filter(Boolean).map((e) => `<li><a class="link" href="/engagements#${e.slug}">${esc(e.title)}${arrow}</a></li>`).join('');
  return `<details class="capmore"><summary><span>${esc(D.headings['capability-includes'].title)}</span><i>${c.groups.length}</i></summary><div class="capmore__grid">${items}</div>${engs ? `<div class="capmore__engs"><h4>${esc(D.headings['capability-related'].title)}</h4><ul>${engs}</ul></div>` : ''}</details>`;
}

function render() {
  const rows = D.capabilities.cards.map((c, i) => `
  <article class="caprow" id="${c.slug}"><div class="n">0${i + 1}</div><div data-reveal><h3>${plain(c.title)}</h3><q>“${esc(c.problem)}”</q><p class="caprow__intro">${esc(c.intro)}</p></div><div data-reveal><h4>${esc(D.headings['capability-deliverables'].title)}</h4><div class="chips">${c.deliverables.map((d) => `<span class="chip">${esc(d)}</span>`).join('')}</div><div style="margin-top:26px"><h4>${esc(D.headings['capability-applied'].title)}</h4><div class="chips">${D.sectors.filter((s) => s.caps.includes(c.slug)).slice(0, 4).map((s) => `<a class="chip" href="/sectors/${s.slug}">${esc(s.title.split(',')[0].split(' & ')[0])}</a>`).join('')}</div></div></div>${capMore(c)}</article>`).join('');
  return sec(rows, '', 'cp-capabilities');
}

module.exports = { render };
