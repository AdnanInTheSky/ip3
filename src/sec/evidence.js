// On the record: the sector's documented assignments in a responsive evidence grid. Each card opens the full record
// on /capabilities. The sector's engagements are linked from the connected-work section (links.js).
const { T, esc, n2, head, recordsFor, L } = require('./util');

function card(p, i) {
  const scope = p.scope && p.scope.value ? `<span class="sx-card__scope"><b>${esc(p.scope.value)}</b> ${esc(p.scope.label)}</span>` : '';
  const status = p.status === 'current' ? `<span class="sx-card__status">${esc(T['sx-status-current'])}</span>` : '';
  return `<li class="sx-card" data-sx-card>
    <a class="sx-card__a" href="/capabilities#proof-${esc(p.slug)}">
      <span class="sx-card__top"><span class="sx-card__n">${n2(i)}</span><span class="sx-card__period">${esc(p.period || '')}</span>${status}</span>
      <span class="sx-card__client">${esc(p.client)}</span>
      <h3 class="sx-card__t">${esc(p.title)}</h3>
      <span class="sx-card__q">${esc(p.short)}</span>
      <span class="sx-card__s">${esc(p.summary)}</span>
      ${scope}
      <span class="sx-card__go">${esc(T['sx-open-record'])}${L.arrow}</span>
    </a>
  </li>`;
}

function render({ pg }) {
  const ev = pg.evidence;
  const recs = recordsFor(pg);
  const ledger = recs.length ? `
<section class="sx-led section--paper" id="sx-evidence" data-sx-led aria-labelledby="sx-evidence-h">
  <div class="container sx-led__head">${head(ev, 'sx-evidence-h', { split: !!ev.lead })}<p class="sx-led__count"><b>${String(recs.length).padStart(2, '0')}</b> ${esc(T['sx-meta-records'])}</p></div>
  <div class="container sx-led__stage">
    <ol class="sx-led__track" role="list" data-sx-led-track>${recs.map(card).join('')}</ol>
  </div>
</section>` : '';
  return ledger;
}

module.exports = { render };
