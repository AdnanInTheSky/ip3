const { esc, plain, rich, arrow, btn, cta, page, cfg, D } = require('./layout');

function hero() {
  const slides = D.hero.map((s, i) => `
    <article class="hero__slide${i === 0 ? ' is-active' : ''}" data-slide="${i}" aria-hidden="${i === 0 ? 'false' : 'true'}">
      <video muted loop playsinline ${i === 0 ? 'autoplay preload="auto"' : 'preload="none"'} poster="${s.video.poster}" aria-hidden="true" tabindex="-1"><source src="${s.video.src}" type="video/mp4"></video>
    </article>`).join('');
  const texts = D.hero.map((s, i) => `
    <div class="hero__text${i === 0 ? ' is-active' : ''}" data-text="${i}">
      <span class="eyebrow">${esc(s.eyebrow)}</span>
      ${i === 0 ? '<h1>' : '<h2 class="display" style="font-size:clamp(2.4rem,5.6vw,5.4rem);margin:22px 0 26px">'}${s.h1}${i === 0 ? '</h1>' : '</h2>'}
      <p class="lead">${esc(s.sub)}</p>
      <div class="hero__cta">${s.cta.map((c) => btn(esc(c.label), c.href, c.ghost ? 'btn--outline-light' : 'btn--light')).join('')}</div>
    </div>`).join('');
  const tabs = D.hero.map((s, i) => `<button class="hero__tab${i === 0 ? ' is-active' : ''}" type="button" data-tab="${i}" aria-label="Show slide ${i + 1}: ${esc(s.tab)}"><i></i><b>0${i + 1}</b><span>${esc(s.tab)}</span></button>`).join('');
  return `
<section class="hero on-dark dark" data-hero aria-roledescription="carousel" aria-label="Featured work">
  <div class="hero__slides">${slides}</div>
  <div class="hero__shade"></div>
  <div class="container hero__inner"><div class="hero__copy" aria-live="polite">${texts}</div></div>
  <div class="hero__ctrl">
    <button type="button" data-prev aria-label="Previous slide"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg></button>
    <button type="button" data-next aria-label="Next slide"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></button>
  </div>
  <div class="hero__ui"><div class="container"><div class="hero__tabs">${tabs}</div></div></div>
</section>
<div class="ticker" aria-label="Areas of work"><div class="ticker__track">${[0, 1].map(() => `<div style="display:flex">${D.reassurance.map((r) => `<span>${esc(r)}</span>`).join('')}${D.reassurance.map((r) => `<span>${esc(r)}</span>`).join('')}</div>`).join('')}</div></div>`;
}

function mandates() {
  const m = D.mandates;
  return `
<section class="section" id="mandates">
  <div class="container deck">
    <div class="deck__intro">
      <span class="eyebrow" data-reveal>${m.eyebrow}</span>
      <h2 class="split" style="margin-top:20px">${m.h2}</h2>
      <p class="lead" data-reveal>${m.body}</p>
      ${btn(esc(D.pageText.home['cta-explore-capabilities']), '/capabilities')}
    </div>
    <div class="deck__cards">
      ${m.cards.map((c, i) => `<article class="card-s" style="--i:${i}" data-deck><span class="card-s__n">0${i + 1}</span><h3>${c.title}</h3><p>${c.text}</p><div class="card-s__bar"><i></i></div></article>`).join('')}
    </div>
  </div>
</section>`;
}

function stats() {
  return `
<section class="section--dark on-dark dark" style="padding:clamp(60px,8vw,110px) 0">
  <div class="container">
    <div class="stats" data-stats>
      ${D.stats.map((s) => `<div class="stat"><b><span data-count="${s.n}">${s.n}</span><i>${s.suffix}</i></b><span>${esc(s.label)}</span></div>`).join('')}
    </div>
  </div>
</section>`;
}

function capabilities() {
  const c = D.capabilities;
  return `
<section class="section section--sand" id="capabilities">
  <div class="container">
    <div class="section__head section__head--split">
      <div><span class="eyebrow" data-reveal>${c.eyebrow}</span><h2 class="split" style="margin-top:18px">${c.h2}</h2></div>
      <div><p class="lead" data-reveal>${esc(D.pageText.home['capabilities-lead'])}</p><div style="margin-top:26px" data-reveal>${btn(esc(D.pageText.home['cta-all-capabilities']), '/capabilities', 'btn--ghost')}</div></div>
    </div>
    <div class="caps" data-stagger>
      ${c.cards.map((x, i) => `<a class="cap" href="/capabilities#${x.slug}"><span class="cap__n">0${i + 1}</span><h3>${x.title}</h3><q>“${x.problem}”</q><div class="chips">${x.deliverables.slice(0, 4).map((d) => `<span class="chip">${d}</span>`).join('')}</div></a>`).join('')}
    </div>
  </div>
</section>`;
}

function why() {
  const h = D.headings['home-why'];
  return `
<section class="section" id="why-ip3">
  <div class="container two two--top">
    <div class="photo photo--tall clip" data-clip><img src="/assets/img/group-2.webp" width="1600" height="900" alt="IP3 colleagues and partners gathered after a policy workshop" loading="lazy" data-parallax></div>
    <div>
      <span class="eyebrow" data-reveal>${esc(h.eyebrow)}</span>
      <h2 class="split" style="margin:18px 0 38px">${rich(h.title)}</h2>
      <ul class="checks" data-stagger style="gap:0">
        ${D.whyIp3.map((w) => `<li style="display:block"><b class="ui" style="color:var(--rust);letter-spacing:.2em;font-size:.72rem">${w.n}</b><h3 style="margin:8px 0 8px">${w.title}</h3><span style="font-weight:400;font-family:var(--f-body)">${w.text}</span><br><a class="link" style="margin-top:14px" href="${w.href}">${w.cta}${arrow}</a></li>`).join('')}
      </ul>
      <div style="margin-top:34px" data-reveal>${btn(esc(D.pageText.home['cta-why-ip3']), '/why-ip3')}</div>
    </div>
  </div>
</section>`;
}

function sectors() {
  const h = D.headings['home-sectors'];
  return `
<section class="hs on-dark dark" id="sectors" data-hs>
  <div class="hs__pin" data-hs-pin>
    <div class="container hs__head">
      <div><span class="eyebrow">${esc(h.eyebrow)}</span><h2 class="split" style="margin-top:18px">${rich(h.title)}</h2></div>
      <p>${esc(D.pageText.home['sector-intro'])}</p>
    </div>
    <div class="hs__track" data-hs-track>
      ${D.sectors.map((s, i) => `<a class="hs__card" href="/sectors/${s.slug}"><img src="${s.card}" width="800" height="600" alt="" loading="lazy"><div><b>${String(i + 1).padStart(2, '0')}</b><h3>${s.title}</h3><p>${s.problem}</p></div></a>`).join('')}
    </div>
    <div class="hs__bar"><span>${esc(D.navigation.horizontalScrollLabel)}</span><div class="hs__line"><i data-hs-fill></i></div><a class="link" href="/sectors">${esc(D.pageText.home['cta-all-sectors'])}${arrow}</a></div>
  </div>
</section>`;
}

function translation() {
  const t = D.translation;
  return `
<section class="section" id="translation">
  <div class="container">
    <div class="trans">
      <div class="trans__left">
        <span class="eyebrow" data-reveal>${t.eyebrow}</span>
        <h2 class="split" style="margin-top:20px">${t.h2}</h2>
        <p class="lead" data-reveal>${t.sub}</p>
        <ol class="trans__rail" data-rail>${t.nodes.map((n, i) => `<li${i === 0 ? ' class="is-active"' : ''}>${n.title}</li>`).join('')}</ol>
      </div>
      <div class="trans__steps">
        ${t.nodes.map((n, i) => `<article class="step${i === 0 ? ' is-active' : ''}" data-step="${i}"><span class="step__n">0${i + 1}</span><h3>${n.title}</h3><p>${n.text}</p></article>`).join('')}
      </div>
    </div>
    <div class="outputs" data-stagger>
      ${t.outputs.map((o) => `<div class="out"><h3>${o.title}</h3><ul>${o.items.map((i) => `<li>${i}</li>`).join('')}</ul></div>`).join('')}
    </div>
  </div>
</section>`;
}

function engagements() {
  const list = D.engagements.slice(0, 3);
  const h = D.headings['home-engagements'];
  return `
<section class="section section--paper" id="engagements">
  <div class="container">
    <div class="section__head section__head--split">
      <div><span class="eyebrow" data-reveal>${esc(h.eyebrow)}</span><h2 class="split" style="margin-top:18px">${rich(h.title)}</h2></div>
      <div><p class="lead" data-reveal>${esc(h.lead)}</p><div style="margin-top:26px" data-reveal>${btn(esc(D.pageText.home['cta-all-engagements']), '/engagements', 'btn--ghost')}</div></div>
    </div>
    <div class="eng">
      ${list.map((e) => engRow(e)).join('')}
    </div>
  </div>
</section>`;
}

function engRow(e) {
  return `
<article class="eng-row">
  <div class="eng-row__media clip" data-clip><img src="${e.image}" width="1200" height="900" alt="" loading="lazy" data-parallax></div>
  <div data-reveal>
    <div class="eng-row__meta"><b>${esc(e.client)}</b><span>${esc(e.year)}</span><span>${esc(e.sector)}</span></div>
    <h3>${esc(e.title)}</h3>
    <p>${esc(e.summary)}</p>
    <div class="chips" style="margin-bottom:22px">${e.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div>
    <a class="link" href="/sectors/${e.sectorSlug}">${esc(D.navigation.exploreSectorLabel)}${arrow}</a>
  </div>
</article>`;
}

function insights() {
  const list = D.insights.slice(0, 2);
  const h = D.headings['home-insights'];
  return `
<section class="section section--sand" id="insights">
  <div class="container">
    <div class="section__head section__head--split">
      <div><span class="eyebrow" data-reveal>${esc(h.eyebrow)}</span><h2 class="split" style="margin-top:18px">${rich(h.title)}</h2></div>
      <div><p class="lead" data-reveal>${esc(h.lead)}</p><div style="margin-top:26px" data-reveal>${btn(esc(D.pageText.home['cta-all-insights']), '/insights', 'btn--ghost')}</div></div>
    </div>
    <div class="ins" data-stagger>${list.map(insCard).join('')}</div>
  </div>
</section>`;
}

function insCard(i) {
  return `<article class="ins-card"><div class="ins-card__img"><img src="${i.image}" width="900" height="506" alt="" loading="lazy"></div><div class="ins-card__b"><span class="ins-card__t">${esc(i.type)}</span><h3>${esc(i.title)}</h3><p>${esc(i.text.length > 200 ? i.text.slice(0, 197).replace(/\s+\S*$/, '') + '…' : i.text)}</p><div class="chips">${i.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div></div></article>`;
}

function convening() {
  const c = D.convening;
  return `
<section class="conv section on-dark dark" id="convening">
  <div class="conv__bg"><video muted loop playsinline autoplay preload="none" poster="/assets/img/poster-city.webp" data-lazyvideo><source data-src="/assets/video/city.mp4" type="video/mp4"></video></div>
  <div class="container conv__grid">
    <div style="position:sticky;top:130px;align-self:start">
      <span class="eyebrow" data-reveal>${c.eyebrow}</span>
      <h2 class="split" style="margin:20px 0 26px">${c.h2}</h2>
      <p class="lead" data-reveal>${c.body}</p>
      <div style="margin-top:30px" data-reveal>${btn(esc(D.pageText.home['cta-commission-dialogue']), '/contact', 'btn--light')}</div>
    </div>
    <div class="conv__list" data-conv>
      ${c.items.map((it, i) => `<div class="conv__item${i === 0 ? ' is-active' : ''}"><b>0${i + 1}</b><h3>${it.title}</h3><p>${it.text}</p></div>`).join('')}
    </div>
  </div>
</section>`;
}

function proof() {
  const p = D.partners;
  const clients = D.headings['partners-clients'];
  const funders = D.headings['partners-funders'];
  return `
<section class="section">
  <div class="container">
    <div class="partners" data-reveal>
      <div><h3>${esc(clients.title)}</h3><div class="names">${p.clients.map((n) => `<span>${esc(n)}</span>`).join('')}</div></div>
      <div><h3>${esc(funders.title)}</h3><div class="names">${p.funders.map((n) => `<span>${esc(n)}</span>`).join('')}</div></div>
    </div>
    <div class="quotes" style="margin-top:clamp(50px,7vw,100px)" data-stagger>
      ${D.testimonials.map((t) => `<figure class="quote"><blockquote>${esc(t.quote)}</blockquote><footer><b>${esc(t.name)}</b><span>${esc(t.role)}</span></footer></figure>`).join('')}
    </div>
  </div>
</section>`;
}

function founder() {
  const f = D.founder;
  return `
<section class="section section--paper" id="leadership">
  <div class="container founder">
    <div class="founder__img clip" data-clip data-drift><img src="${f.image}" width="900" height="969" alt="${f.name}, ${f.role} of IP3 Consulting" loading="lazy" data-parallax></div>
    <div>
      <span class="eyebrow" data-reveal>${esc(D.pageText.home['leadership-eyebrow'])}</span>
      <h2 class="split" style="margin-top:18px">${f.name}</h2>
      <p class="founder__tag" data-reveal>${f.role} · ${f.tag}</p>
      <div class="founder__bio" data-reveal>${f.bio.map((b) => `<p>${esc(b)}</p>`).join('')}</div>
      <blockquote data-reveal>${esc(f.quote)}</blockquote>
      <div style="display:flex;flex-wrap:wrap;gap:14px" data-reveal>${btn(esc(D.pageText.home['cta-meet-people']), '/people')}${btn(esc(D.pageText.home['cta-start-conversation']), '/contact', 'btn--ghost')}</div>
    </div>
  </div>
</section>`;
}

function home() {
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'WebSite', name: cfg.name, url: cfg.url }];
  const body = [hero(), mandates(), stats(), capabilities(), why(), sectors(), translation(), engagements(), insights(), convening(), proof(), founder(), cta('cta-default')].join('\n');
  return page({
    title: D.pages.home.title,
    desc: D.pages.home.desc,
    path: '/', body, bodyClass: 'home', jsonld,
    preload: '<link rel="preload" as="image" href="/assets/img/poster-hero-1.webp" fetchpriority="high">',
  });
}

module.exports = { home, engRow, insCard };
