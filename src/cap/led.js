// Who does the work: the founder (from the signed CV) and the expert network. No years-of-experience figure anywhere.
const { D, T, esc, arrow, peopleBySlug } = require('./util');
const { head } = require('./shared');

const initials = (name) => name.replace(/^(Prof\.|Dr\.|Md\.)\s*/g, '').replace(/^(Prof\.|Dr\.)\s*/g, '').split(/\s+/).filter((w) => /^[A-Z]/.test(w)).slice(0, 2).map((w) => w[0]).join('');

function render() {
  const c = T.led;
  const f = D.founder;
  const fp = peopleBySlug['mohammad-syful-hoque'];
  const founder = `
    <article class="cp-founder" data-reveal>
      <div class="cp-founder__img"><img src="${esc(f.image)}" width="900" height="968" alt="" loading="lazy" decoding="async" data-drift></div>
      <div class="cp-founder__body">
        <span class="cp-mono cp-founder__k">${esc(c.founderLabel)}</span>
        <h3>${esc(f.name)}</h3>
        <p class="cp-founder__role">${esc((fp && fp.role) || f.role)}</p>
        <p class="cp-founder__sum">${esc(c.founderSummary)}</p>
        <p class="cp-founder__edu">${esc(c.founderEducation)}</p>
        <p class="cp-mono cp-founder__src">${esc(c.founderSource)}</p>
        <a class="link" href="${esc(c.founderHref)}">${esc(c.founderCta)}${arrow}</a>
      </div>
    </article>`;
  const experts = c.experts.map((s) => peopleBySlug[s]).filter(Boolean).map((m) => `<li><a class="cp-expert" href="/people#${esc(m.slug)}" data-tilt>${m.photo ? `<span class="cp-expert__av"><img src="${esc(m.photo)}" width="480" height="480" alt="" loading="lazy" decoding="async"></span>` : `<span class="cp-expert__av cp-expert__av--ini" aria-hidden="true">${esc(initials(m.name))}</span>`}<span class="cp-expert__txt"><b>${esc(m.name)}</b><span class="cp-expert__role">${esc(m.role)}</span>${m.affiliation ? `<span class="cp-expert__aff">${esc(m.affiliation)}</span>` : ''}</span>${arrow}</a></li>`).join('');
  return `
<section class="section section--paper cp-led" id="cp-led" aria-labelledby="cp-led-h">
  <div class="container">
    ${head(c, 'cp-led-h', true)}
    <div class="cp-led__grid">
      ${founder}
      <div class="cp-experts">
        <h3 class="cp-mono cp-experts__k">${esc(c.expertsLabel)}</h3>
        <ul class="cp-experts__list" data-stagger>${experts}</ul>
        <a class="link" href="${esc(c.expertsHref)}">${esc(c.expertsCta)}${arrow}</a>
      </div>
    </div>
  </div>
</section>`;
}

module.exports = { render };
