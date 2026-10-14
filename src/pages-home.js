const { esc, plain, rich, arrow, btn, cta, page, cfg, D } = require('./layout');
const { editableSectionOrders, renderOrder } = require('../cms/section-order');
const { validateHomeTestimonialsPlacement } = require('../cms/section-placement');
const { testimonialCards, testimonialsSection } = require('./sections/testimonials');
const { chainSection } = require('./sections/chain');
const { evidence } = require('./sections/evidence');

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
  <div class="hero__contours" aria-hidden="true"></div>
  <div class="container hero__inner"><div class="hero__copy" aria-live="polite">${texts}</div></div>
  <div class="hero__ctrl">
    <button type="button" data-prev aria-label="Previous slide"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg></button>
    <button type="button" data-next aria-label="Next slide"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></button>
  </div>
  <div class="hero__ui"><div class="container"><div class="hero__tabs">${tabs}</div></div></div>
</section>
<div class="ticker" aria-label="Areas of work"><div class="ticker__track">${[0, 1].map(() => `<div style="display:flex">${D.reassurance.map((r) => `<span>${esc(r)}</span>`).join('')}${D.reassurance.map((r) => `<span>${esc(r)}</span>`).join('')}</div>`).join('')}</div></div>`;
}

function stats() {
  return `
<section class="section--dark stats-band on-dark dark" style="padding:clamp(60px,8vw,110px) 0">
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
<section class="section section--sand ih" id="capabilities" data-hand>
  <div class="container">
    <div class="section__head section__head--split">
      <div><span class="eyebrow" data-reveal>${c.eyebrow}</span><h2 class="split" style="margin-top:18px">${c.h2}</h2></div>
      <div><p class="lead" data-reveal>${esc(D.pageText.home['capabilities-lead'])}</p><div style="margin-top:26px" data-reveal>${btn(esc(D.pageText.home['cta-all-capabilities']), '/capabilities', 'btn--ghost')}</div></div>
    </div>
    <div class="ih__board" data-hand-board>
      <svg class="ih__thread" aria-hidden="true" focusable="false"><path class="ih__path" data-hand-path d="" /><path class="ih__path ih__path--lit" data-hand-lit d="" /><g data-hand-dot><circle class="ih__halo" r="16"/><circle class="ih__dot" r="6.5"/></g></svg>
      <div class="caps">
        ${c.cards.map((x, i) => `<a class="cap${x.image ? ' cap--media' : ''}" href="/capabilities#${x.slug}" data-hand-card>${x.image ? `<span class="cap__media" aria-hidden="true" data-cap-media><img class="cap__m1" src="${x.image}" alt="" loading="lazy" decoding="async"></span>` : ''}<i class="cap__big" aria-hidden="true">0${i + 1}</i><span class="cap__n" data-hand-n>0${i + 1}</span><h3>${x.title}</h3><q>“${x.problem}”</q><div class="chips">${x.deliverables.slice(0, 4).map((d) => `<span class="chip">${d}</span>`).join('')}</div></a>`).join('')}
      </div>
    </div>
  </div>
</section>`;
}

function why() {
  const h = D.headings['home-why'];
  const ph = D.whyPhoto;
  const first = D.whyIp3[0];
  return `
<section class="section wy" id="why-ip3" aria-labelledby="wy-title" data-why>
  <div class="container wy__grid">
    <div class="wy__stage" data-tilt>
      <div class="wy__rings" aria-hidden="true"><i></i><i></i><i></i></div>
      <b class="wy__num" aria-hidden="true" data-wy-num>${first.n}</b>
      <figure class="wy__phone"><img src="${ph.image}" width="1007" height="1221" alt="${esc(ph.alt)}" loading="lazy" decoding="async"></figure>
      <p class="wy__cap" aria-hidden="true" data-wy-cap><span>${first.n}</span><b>${esc(first.title)}</b></p>
    </div>
    <div class="wy__body">
      <span class="eyebrow" data-reveal>${esc(h.eyebrow)}</span>
      <h2 class="split wy__title" id="wy-title">${rich(h.title)}</h2>
      <ol class="wy__list" data-wy-list>
        ${D.whyIp3.map((w, i) => `<li class="wy__item${i === 0 ? ' is-active' : ''}" data-wy-item data-n="${esc(w.n)}" data-t="${esc(w.title)}"><b>${w.n}</b><div><h3>${w.title}</h3><p>${w.text}</p><a class="link" href="${w.href}">${w.cta}${arrow}</a></div></li>`).join('')}
      </ol>
      <div class="wy__cta" data-reveal>${btn(esc(D.pageText.home['cta-why-ip3']), '/why-ip3')}</div>
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
      <div class="hs__title"><span class="eyebrow">${esc(h.eyebrow)}</span><h2 class="split">${rich(h.title)}</h2></div>
      <p class="hs__intro">${esc(D.pageText.home['sector-intro'])}</p>
    </div>
    <div class="hs__track" data-hs-track>
      ${D.sectors.map((s, i) => `<a class="hs__card" href="/sectors/${s.slug}"><img src="${s.card}" width="800" height="600" alt="" loading="lazy"><div><b>${String(i + 1).padStart(2, '0')}</b><h3>${s.title}</h3><p>${s.problem}</p></div></a>`).join('')}
    </div>
    <div class="hs__bar"><span>${esc(D.navigation.horizontalScrollLabel)}</span><div class="hs__line"><i data-hs-fill></i></div><a class="link" href="/sectors">${esc(D.pageText.home['cta-all-sectors'])}${arrow}</a></div>
  </div>
</section>`;
}

function engRow(e) {
  return `
<article class="eng-row" id="${e.slug}">
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

function insCard(i) {
  return `<article class="ins-card"><div class="ins-card__img"><img src="${i.image}" width="900" height="506" alt="" loading="lazy"></div><div class="ins-card__b"><span class="ins-card__t">${esc(i.type)}</span><h3>${esc(i.title)}</h3><p>${esc(i.text.length > 200 ? i.text.slice(0, 197).replace(/\s+\S*$/, '') + '…' : i.text)}</p><div class="chips">${i.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div></div></article>`;
}

function convening() {
  const c = D.convening;
  const next = D.headings['partners-clients'];
  return `
<section class="conv section on-dark dark" id="convening">
  <div class="conv__bg"><video muted loop playsinline autoplay preload="none" poster="/assets/img/poster-city.webp" data-lazyvideo><source data-src="/assets/video/city.mp4" type="video/mp4"></video></div>
  <div class="container conv__grid">
    <div class="conv__lead">
      <span class="eyebrow" data-reveal>${c.eyebrow}</span>
      <h2 class="split conv__h">${c.h2}</h2>
      <p class="lead" data-reveal>${c.body}</p>
      <div class="conv__cta" data-reveal>${btn(esc(D.pageText.home['cta-commission-dialogue']), '/contact', 'btn--light')}</div>
    </div>
    <ol class="conv__list" data-conv>
      ${c.items.map((it, i) => `<li class="conv__item${i === 0 ? ' is-active' : ''}"><b>0${i + 1}</b><h3>${it.title}</h3><p>${it.text}</p></li>`).join('')}
    </ol>
  </div>
  <a class="conv__next" href="#clients"><span>${esc(next.title)}</span><i aria-hidden="true"></i></a>
</section>`;
}

function proof(includeTestimonials = true) {
  const p = D.partners;
  const clients = D.headings['partners-clients'];
  const funders = D.headings['partners-funders'];
  // each group runs as a typographic marquee; the second copy only closes the loop, so it is hidden from assistive tech
  const set = (names, hidden) => `<ul class="marq__set"${hidden ? ' aria-hidden="true"' : ''}>${names.map((n, i) => `<li${i % 2 ? ' class="i"' : ''}>${esc(n)}</li>`).join('')}</ul>`;
  const row = (title, names, rev) => `
    <div class="marq${rev ? ' marq--rev' : ''}">
      <div class="container"><h3 class="marq__h">${esc(title)}</h3></div>
      <div class="marq__win"><div class="marq__track" style="--dur:${Math.max(28, names.length * 5)}s">${set(names)}${set(names, true)}</div></div>
    </div>`;
  return `
<section class="section" id="clients">
  <div class="partners" data-reveal>${row(clients.title, p.clients)}${row(funders.title, p.funders, true)}</div>${includeTestimonials ? `
  <div class="container">
    <div class="quotes" style="margin-top:clamp(50px,7vw,100px)" data-stagger>
      ${testimonialCards(D.testimonials)}
    </div>
  </div>` : ''}
</section>`;
}

function founder() {
  const f = D.founder;
  return `
<section class="section section--paper fd" id="leadership">
  <div class="container founder">
    <figure class="founder__card" data-tilt>
      <span class="founder__ring" aria-hidden="true"></span>
      <span class="founder__ring founder__ring--2" aria-hidden="true"></span>
      <div class="founder__img"><img src="${f.image}" width="900" height="969" alt="${f.name}, ${f.role} of IP3 Consulting" loading="lazy"></div>
      <figcaption class="founder__chip"><b>${f.name}</b><span>${f.role}</span></figcaption>
    </figure>
    <div class="founder__txt">
      <span class="eyebrow" data-reveal>${esc(D.pageText.home['leadership-eyebrow'])}</span>
      <h2 class="split founder__name">${f.name}</h2>
      <p class="founder__tag" data-reveal>${f.role} · ${f.tag}</p>
      <div class="founder__bio" data-reveal>${f.bio.map((b) => `<p>${esc(b)}</p>`).join('')}</div>
      <blockquote class="founder__quote" data-reveal>${esc(f.quote)}</blockquote>
      <div class="founder__cta" data-reveal>${btn(esc(D.pageText.home['cta-meet-people']), '/people')}${btn(esc(D.pageText.home['cta-start-conversation']), '/contact', 'btn--ghost')}</div>
    </div>
  </div>
</section>`;
}

function home() {
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'WebSite', name: cfg.name, url: cfg.url }];
  const rule = validateHomeTestimonialsPlacement(D.sectionPlacement.homeTestimonials, D.sectionOrder.home, D.testimonials);
  const renderers = [stats, capabilities, why, sectors, chainSection, evidence, convening, () => proof(Boolean(rule.embedded)), founder];
  const sections = Object.fromEntries(editableSectionOrders.home.default.map((key, i) => [key, renderers[i]]));
  const anchor = rule.before || rule.after;
  if (anchor) {
    const original = sections[anchor];
    sections[anchor] = () => rule.before
      ? [testimonialsSection(D.testimonials), original()].join('\n')
      : [original(), testimonialsSection(D.testimonials)].join('\n');
  }
  const body = [hero(), renderOrder('home', D.sectionOrder.home, sections), cta('cta-default')].join('\n');
  return page({
    title: D.pages.home.title,
    desc: D.pages.home.desc,
    path: '/', body, bodyClass: 'home', jsonld,
    preload: '<link rel="preload" as="image" href="/assets/img/poster-hero-1.webp" fetchpriority="high">',
  });
}

module.exports = { home, engRow, insCard };
