const { esc, plain, rich, arrow, arrowL, btn, cta, sectionHead, phero, breadcrumb, page, formBlock, cfg, D } = require('./layout');
const { engRow, insCard } = require('./pages-home');
const { renderOrder } = require('../cms/section-order');
const { testimonialCards } = require('./sections/testimonials');
const { capabilities } = require('./cap'); // /capabilities lives in src/cap/ (one module per section)
const { sectorPage } = require('./sec'); // /sectors/<slug> lives in src/sec/ (one module per section)

const capBySlug = Object.fromEntries(D.capabilities.cards.map((c, i) => [c.slug, { ...c, i }]));
const engBySlug = Object.fromEntries(D.engagements.map((e) => [e.slug, e]));
const sec = (inner, cls = '', id = '') => `<section class="section ${cls}"${id ? ` id="${id}"` : ''}><div class="container">${inner}</div></section>`;
const head = (eyebrow, h2, lead) => `<div class="section__head"><span class="eyebrow" data-reveal>${eyebrow}</span><h2 class="split">${h2}</h2>${lead ? `<p class="lead" data-reveal>${lead}</p>` : ''}</div>`;
const tile = (t, p, n) => `<div class="tile">${n ? `<span class="n">${n}</span>` : ''}<h3>${t}</h3><p>${p}</p></div>`;

/* ---------------- About ---------------- */
function about() {
  const pg = D.pages.about;
  const a = D.about;
  const intro = D.headings['about-intro'];
  const values = D.headings['about-values'];
  const network = D.headings['about-network'];
  const sections = [
    phero({ crumbs: [breadcrumb('/about')], h1: rich(pg.h1), lead: esc(pg.lead), bg: { type: 'image', src: '/assets/img/group-2.webp' } }),
    sec(`<div class="two two--top"><div><span class="eyebrow" data-reveal>${esc(intro.eyebrow)}</span><h2 class="split" style="margin:18px 0 28px">${rich(intro.title)}</h2></div><div data-stagger style="display:grid;gap:18px" class="lead">${a.intro.map((p) => `<p>${esc(p)}</p>`).join('')}<p>${esc(D.pageText.about['supporting-paragraph'])}</p></div></div>`),
    `<section class="section--dark on-dark dark" style="padding:clamp(70px,9vw,130px) 0"><div class="container cards2" data-stagger>${[a.vision, a.mission].map((x) => `<div class="tile" style="padding:clamp(28px,4vw,52px);gap:20px"><span class="eyebrow">${x.label}</span><h3 style="font-size:clamp(1.7rem,3vw,2.6rem);line-height:1.12">${x.title}</h3><p style="font-size:1.05rem">${x.text}</p></div>`).join('')}</div><div class="container" style="margin-top:50px"><ul class="checks" data-stagger style="grid-template-columns:repeat(2,1fr);column-gap:50px">${a.aims.map((x) => `<li>${x}</li>`).join('')}</ul></div></section>`,
    sec(`<div class="two"><div><span class="eyebrow" data-reveal>${a.principles.eyebrow}</span><h2 class="split" style="margin:18px 0 26px">${a.principles.h2}</h2><p class="lead" data-reveal>${a.principles.text}</p></div><div class="compare" data-compare><img src="/assets/img/polycrisis.webp" width="1024" height="1024" alt="Polluted industrial landscape — the polycrisis" loading="lazy"><img class="compare__top" src="/assets/img/polysolutions.webp" width="1024" height="1024" alt="The same landscape transformed into a green, resilient city — polysolutions" loading="lazy"><span class="compare__lbl compare__lbl--a">${esc(D.pageText.about['compare-label-polycrisis'])}</span><span class="compare__lbl compare__lbl--b">${esc(D.pageText.about['compare-label-polysolutions'])}</span><div class="compare__bar"></div></div></div>`, 'section--sand'),
    sec(`<div class="two two--top"><div style="position:sticky;top:130px"><span class="eyebrow" data-reveal>${esc(values.eyebrow)}</span><h2 class="split" style="margin:18px 0 22px">${rich(values.title)}</h2><p class="lead" data-reveal>${esc(values.lead)}</p></div><div class="acc" data-stagger>${a.values.map((v, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(v.title)}</summary><p>${esc(v.text)}</p></details>`).join('')}</div></div>`),
    sec(`${sectionHead('about-different')}<div class="cards4" data-stagger>${a.different.map((l, i) => tile(l.title, l.text, '0' + (i + 1))).join('')}</div>`, 'section--paper'),
    sec(`<div class="two"><div class="photo photo--wide clip" data-clip><img src="/assets/img/workshop-adb.webp" width="800" height="520" alt="Panel at an ADB-supported policy workshop" loading="lazy" data-parallax></div><div><span class="eyebrow" data-reveal>${esc(network.eyebrow)}</span><h2 class="split" style="margin:18px 0 22px">${rich(network.title)}</h2><p class="lead" data-reveal>${esc(network.lead)}</p><div style="margin-top:28px;display:flex;gap:14px;flex-wrap:wrap" data-reveal>${btn(esc(D.pageText.about['cta-meet-people']), '/people')}${btn(esc(D.pageText.about['cta-start-conversation']), '/contact', 'btn--ghost')}</div></div></div>`),
    cta('cta-about'),
  ];
  const body = [sections[0], renderOrder('about', D.sectionOrder.about, sections.slice(1, -1)), sections.at(-1)].join('\n');
  return page({ title: pg.title, desc: pg.desc, path: '/about', body });
}

/* ---------------- Approach ---------------- */
function approach() {
  const pg = D.pages.approach;
  const { problem: s3, pathway: s4, standards: s5, orbit: s6, toolkit: s7, outcomes: s8 } = D.approach;
  const case_ = (p) => (p ? `<div class="case">${esc(p)}</div>` : '');
  // What the client receives at each movement, linked to the capability that delivers it.
  const receive = (c) => {
    const cap = D.capabilities.cards.find((k) => k.slug === c.capability);
    return `<p class="move__get"><b>${esc(D.pageText.approach['pathway-receive'])}</b> ${esc(c.receive)}${cap ? ` <span>${esc(D.pageText.approach['pathway-capability'])} <a class="link" href="/capabilities#${cap.slug}">${esc(cap.title)}${arrow}</a></span>` : ''}</p>`;
  };
  const move = (c, i) => `<article class="move" data-reveal><div><div class="move__n">0${i + 1}</div><h3>${esc(c.title)}</h3><p style="color:var(--ink-2)">${esc(c.text)}</p>${receive(c)}${case_(c.paragraph)}</div><ul>${c.bullets.map((b) => { const [k, ...v] = b.split(' — '); return `<li><b>${esc(k)}</b>${esc(v.join(' — '))}</li>`; }).join('')}</ul></article>`;
  const nodes = s6.orbitItems.map((o, i) => `<div class="orbit__node" style="--a:${i * 60 - 90}deg"><div><b>${o.shortLabel}</b><span>${esc(o.label)}</span></div></div>`).join('');
  // The six movements as a pinned CSS-3D film: 48 fragments move from scatter to an ordered grid, one arrangement per movement.
  const frags = Array.from({ length: 48 }, (_, i) => `<i class="frag${i % 9 === 0 ? ' frag--k' : ''}"></i>`).join('');
  const ffilm = `<div class="ffilm on-dark dark" data-ffilm aria-label="${esc(s4.title)}" role="group">
      <div class="ffilm__stage" aria-hidden="true"><div class="ffilm__world" data-ffilm-world>${frags}<svg class="ffilm__svg" viewBox="-300 -220 600 440"><path data-ffilm-curve d="M-200 60 C-120 60 -90 -95 0 -95 S120 60 200 60"/><ellipse data-ffilm-ring cx="0" cy="0" rx="150" ry="123"/></svg></div></div>
      <ol class="ffilm__caps">${s4.cards.map((c, i) => `<li data-ffilm-cap="${i}"><b>0${i + 1} / 0${s4.cards.length}</b><span>${esc(c.title)}</span></li>`).join('')}</ol>
      <nav class="ffilm__rail" aria-label="${esc(s4.subtitle)}"><ol>${s4.cards.map((c, i) => `<li><button type="button" data-ffilm-jump="${i}"${i === 0 ? ' aria-current="step"' : ''}><i aria-hidden="true"></i><span>${esc(c.title)}</span></button></li>`).join('')}</ol></nav>
    </div>`;
  const body = [
    phero({ crumbs: [breadcrumb('/approach')], h1: rich(pg.h1), lead: esc(pg.lead), bg: { type: 'video', src: '/assets/video/hero-4.mp4', poster: '/assets/img/poster-hero-4.webp' } }),
    sec(`${head(esc(s3.subtitle.toLowerCase().replace(/^./, (c) => c.toUpperCase())), rich(D.headings['approach-problem'].title), esc(s3.paragraph))}
      <div class="state" data-reveal><div class="state__box"><h3>${s3.currentState.title}</h3><ul class="checks">${s3.currentState.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div><div class="state__arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div><div class="state__box state__box--b dark"><h3>${s3.desiredState.title}</h3><ul class="checks" style="--x:0">${s3.desiredState.items.map((x) => `<li style="border-color:rgba(255,255,255,.16);color:rgba(255,255,255,.85)">${esc(x)}</li>`).join('')}</ul></div></div>
      <div class="cards3" style="margin-top:22px" data-stagger>${s3.questionCards.map((q) => tile(esc(q.title.replace(/^\d+\s+/, '')), esc(q.text), q.title.slice(0, 2))).join('')}</div>`),
    `<section class="section section--sand"><div class="container two two--top"><div class="approach-decision__lead"><span class="eyebrow" data-reveal>${esc(D.pageText.approach['eyebrow-define-decision'])}</span><h2 class="split" style="margin:18px 0 22px">${esc(s3.bigCard.title)}</h2><div class="photo photo--wide clip" data-clip style="margin-top:30px"><img src="/assets/img/workshop-1.webp" width="960" height="720" alt="Stakeholders working through a problem at a policy workshop" loading="lazy" data-parallax></div></div><ul class="checks" data-stagger>${s3.bigCard.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></section>`,
    sec(`${head(esc(s4.subtitle), esc(s4.title).replace('Reform', '<em>Reform</em>'), esc(s4.paragraph))}${ffilm}<div class="movements">${s4.cards.map(move).join('')}</div>`),
    `<section class="section section--dark on-dark dark"><div class="container">${head(esc(s5.subtitle.toLowerCase().replace(/^./, (c) => c.toUpperCase())), rich(D.headings['approach-standards'].title), esc(s5.paragraph))}<div class="cards3" data-stagger>${s5.cards.map((c, i) => `<div class="tile"><span class="n" style="color:#f0b9a3">0${i + 1}</span><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></div>`).join('')}</div></div></section>`,
    sec(`<div class="two"><div><span class="eyebrow" data-reveal>${esc(s6.subtitle.toLowerCase().replace(/^./, (c) => c.toUpperCase()))}</span><h2 class="split" style="margin:18px 0 22px">${rich(D.headings['approach-orbit'].title)}</h2><p class="lead" data-reveal>${esc(s6.paragraph)} ${esc(s6.questionAnswer)}</p><div class="chips" style="margin-top:26px" data-reveal>${s6.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div><ul class="checks" style="margin-top:30px" data-stagger>${s6.orbitItems.map((o) => `<li><span><b style="color:var(--ink)">${esc(o.label)}.</b> ${esc(o.description)}</span></li>`).join('')}</ul></div><div class="orbit" data-orbit><div class="orbit__ring"></div><div class="orbit__core">${esc(s6.iterateText)}</div>${nodes}</div></div>`, 'section--paper'),
    sec(`${head(esc(s7.subtitle.toLowerCase().replace(/^./, (c) => c.toUpperCase())), rich(D.headings['approach-toolkit'].title), esc(s7.paragraph))}<div class="cards3" data-stagger>${s7.cards.map((c, i) => tile(esc(c.title), esc(c.text), '0' + (i + 1))).join('')}</div>
      <div style="margin-top:clamp(60px,8vw,110px)"><span class="eyebrow" data-reveal>${esc(s7.subsection.subtitle.toLowerCase().replace(/^./, (c) => c.toUpperCase()))}</span><h2 class="split" style="margin:18px 0 18px">${esc(s7.subsection.title)}</h2><p class="lead" data-reveal style="margin-bottom:36px">${esc(s7.subsection.description)}</p>
      <div class="twosides" data-stagger><div class="tile"><h3>${esc(s7.subsection.leftTitle)}</h3><ul class="checks">${s7.subsection.leftItems.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div><div class="twosides__plus">+</div><div class="tile"><h3>${esc(s7.subsection.rightTitle)}</h3><ul class="checks">${s7.subsection.rightItems.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
      <p class="lead" style="margin-top:30px" data-reveal><b style="color:var(--ink)">${esc(s7.subsection.togetherTitle)}</b> — ${esc(s7.subsection.togetherDescription)}</p></div>`, 'section--sand'),
    sec(`${head(esc(s8.subtitle.toLowerCase().replace(/^./, (c) => c.toUpperCase())), rich(D.headings['approach-outcomes'].title), esc(s8.paragraph))}<ul class="arrowlist" data-stagger>${s8.cards.map((c) => { const [a, b] = c.text.split(' → '); return `<li><span>${esc(a)}</span><i>→</i><span>${esc(b || '')}</span></li>`; }).join('')}</ul>`),
    sec(`${head(esc(D.pageText.approach['eyebrow-why-different']), esc(s8.subsection1.title), esc(s8.subsection1.paragraph))}<div class="cards3" data-stagger>${s8.subsection1.cards.map((c) => tile(esc(c.title), esc(c.text))).join('')}</div>`, 'section--paper'),
    sec(`${head(esc(D.pageText.approach['eyebrow-beyond-recommendation']), esc(s8.subsection2.title), esc(s8.subsection2.paragraph))}<div class="cards4" data-stagger>${s8.subsection2.cards.map((c, i) => tile(esc(c.title), esc(c.text), String(i + 1).padStart(2, '0'))).join('')}</div>`),
    require('./explore').related(['economics-trade','finance-investment','development-impact'],'Explore the method through analytical examples'),
    cta('cta-approach'),
  ].join('\n');
  return page({ title: pg.title, desc: pg.desc, path: '/approach', body });
}

/* ---------------- Sectors ---------------- */
function sectorsIndex() {
  const pg = D.pages.sectors;
  const list = D.sectors.map((s, i) => `<a href="/sectors/${s.slug}" data-reveal><b class="n">${String(i + 1).padStart(2, '0')}</b><div><h3>${s.title}</h3><p>${esc(s.problem)}</p></div><div class="thumb"><img src="${s.card}" width="440" height="275" alt="" loading="lazy"></div>${arrow}</a>`).join('');
  const body = [
    phero({ crumbs: [breadcrumb('/sectors')], h1: rich(pg.h1), lead: esc(pg.lead), bg: { type: 'video', src: '/assets/video/coast.mp4', poster: '/assets/img/poster-coast.webp' } }),
    sec(`<div class="sx">${list}</div>`),
    cta('cta-sectors'),
  ].join('\n');
  return page({ title: pg.title, desc: pg.desc, path: '/sectors', body });
}

/* ---------------- Engagements ---------------- */
function engagements() {
  const pg = D.pages.engagements;
  const body = [
    phero({ crumbs: [breadcrumb('/engagements')], h1: rich(pg.h1), lead: esc(pg.lead), bg: { type: 'video', src: '/assets/video/energy.mp4', poster: '/assets/img/poster-energy.webp' } }),
    sec(`<div class="eng">${D.engagements.map(engRow).join('')}</div>`),
    sec(`<div class="partners" data-reveal><div><h3>${esc(D.headings['engagements-clients'].title)}</h3><div class="names">${D.partners.clients.map((n) => `<span>${esc(n)}</span>`).join('')}</div></div><div><h3>${esc(D.headings['engagements-funders'].title)}</h3><div class="names">${D.partners.funders.map((n) => `<span>${esc(n)}</span>`).join('')}</div></div></div>`, 'section--sand'),
    sec(`<div class="quotes" data-stagger>${testimonialCards(D.testimonials)}</div>`),
    require('./explore').related(['economics-trade','market-enterprise','policy-governance'],'Explore related analytical methods'),
    cta('cta-engagements'),
  ].join('\n');
  return page({ title: pg.title, desc: pg.desc, path: '/engagements', body });
}

/* ---------------- Insights ---------------- */
function insights() {
  const pg = D.pages.insights;
  const t = D.pageText.insights;
  const pubs = D.publications;
  const { articleCard } = require('./pages-articles');
  // Legacy article summaries must not bypass the draft/publication gate.
  const summaries = D.insights.filter(item => !item.legacyWpId);
  const order = ['Report', 'Journal article', 'Book chapter', 'Policy brief', 'Commentary'];
  const kinds = order.filter((k) => pubs.some((p) => p.kind === k));
  const plural = (k) => (k === 'Commentary' ? k : `${k}s`);
  const personBySlug = Object.fromEntries(D.people.flatMap((g) => g.members).map((m) => [m.slug, m]));
  const pubRow = (p) => `<li class="pub" data-kind="${esc(p.kind)}"><p class="pub__y">${p.year}<span>${esc(p.kind)}</span></p><div>
      <h3>${p.href ? `<a href="${esc(p.href)}" target="_blank" rel="noopener noreferrer">${esc(p.title)}<span class="vh"> ${esc(t['publications-new-tab'])}</span></a>` : esc(p.title)}</h3>
      <p class="pub__c">${esc(p.authors)}. ${esc(p.publisher)}.</p><p>${esc(p.summary)}</p>
      ${(p.people || []).length ? `<p class="pub__p">${p.people.filter((s) => personBySlug[s]).map((s) => `<a href="/people#${s}">${esc(personBySlug[s].name)}</a>`).join('')}</p>` : ''}
    </div></li>`;
  const publications = pubs.length ? sec(`${sectionHead('insights-publications')}
      ${kinds.length > 1 ? `<div class="pubf" role="group" aria-label="${esc(t['publications-filter'])}" data-pub-filter="#publications" hidden><button type="button" aria-pressed="true" data-kind="">${esc(t['publications-all'])}</button>${kinds.map((k) => `<button type="button" aria-pressed="false" data-kind="${esc(k)}">${esc(plural(k))}</button>`).join('')}</div>` : ''}
      <ol class="pubs" id="publications" data-stagger>${pubs.map(pubRow).join('')}</ol>
      <p class="small" style="margin-top:28px;max-width:70ch">${esc(t['publications-note'])}</p>`, 'section--paper', 'research') : '';
  const jsonld = pubs.length ? [{ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: pubs.map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: { '@type': p.kind === 'Commentary' ? 'Article' : 'ScholarlyArticle', name: p.title, datePublished: String(p.year), publisher: p.publisher, ...(p.href ? { url: p.href } : {}) } })) }] : [];
  const body = [
    phero({ crumbs: [breadcrumb('/insights')], h1: rich(pg.h1), lead: esc(pg.lead), bg: { type: 'image', src: '/assets/img/co2.webp' } }),
    ...(D.articles.length ? [sec(`<h2>Articles</h2><div class="ins article-grid">${D.articles.map(articleCard).join('')}</div>`, '', 'articles')] : []),
    sec(`<h2>Research summaries</h2><div class="ins" data-stagger>${summaries.map(insCard).join('')}</div>`),
    publications,
    `<section class="section section--dark on-dark dark"><div class="container">${sectionHead('insights-field')}<div class="cards3" data-stagger>${D.fieldStories.map((story) => `<figure class="photo" style="aspect-ratio:4/5;border-radius:var(--r)"><video muted loop playsinline preload="none" poster="${story.poster}" data-lazyvideo><source data-src="${story.video}" type="${story.video.endsWith('.webm') ? 'video/webm' : 'video/mp4'}"></video><figcaption style="position:absolute;inset:auto 0 0 0;padding:24px;background:linear-gradient(0deg,rgba(14,12,11,.9),transparent)"><span class="eyebrow" style="font-size:.64rem">${esc(story.type)}</span><h3 style="margin-top:10px;color:#fff;font-size:1.3rem">${esc(story.title)}</h3></figcaption></figure>`).join('')}</div></div></section>`,
    cta('cta-insights'),
  ].join('\n');
  return page({ title: pg.title, desc: pg.desc, path: '/insights', body, jsonld });
}

/* ---------------- People ---------------- */
function people() {
  const pg = D.pages.people;
  const network = D.headings['people-network'];
  const ini = (n) => n.replace(/\b(Prof|Dr|Adj|Asst|Barr|Md|MD)\.?\s+/gi, '').split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const f = D.founder;
  const t = D.pageText.people;
  const avatar = (m) => (m.photo
    ? `<div class="person__av person__av--img" aria-hidden="true"><img src="${m.photo}" width="480" height="480" alt="" loading="lazy" decoding="async"></div>`
    : `<div class="person__av" aria-hidden="true">${ini(m.name)}</div>`);
  const profile = (m) => ((m.bio || []).length || (m.education || []).length
    ? `<details class="person__more"><summary>${esc(t['profile-open'])}</summary><div class="person__bio" data-profile-body>${(m.bio || []).map((b) => `<p>${esc(b)}</p>`).join('')}${m.focus ? `<h5>${esc(t['profile-practice'])}</h5><p>${esc(m.focus)}</p>` : ''}${(m.education || []).length ? `<h5>${esc(t['profile-education'])}</h5><ul>${m.education.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}</div></details>`
    : '');
  const card = (m) => `<article class="person" id="${m.slug}"${(m.bio || []).length || (m.education || []).length ? ' data-profile' : ''}>${avatar(m)}<h4>${esc(m.name)}</h4><span class="role">${esc(m.role)}</span>${m.affiliation ? `<span class="aff">${esc(m.affiliation)}</span>` : ''}${m.focus ? `<span class="focus">${esc(m.focus)}</span>` : ''}${profile(m)}</article>`;
  const groups = D.people.map((g) => `<div class="people-group"><h3 data-reveal>${g.group}</h3><div class="persons" data-stagger>${g.members.map(card).join('')}</div></div>`).join('');
  const net = `<canvas class="net" aria-hidden="true" data-net data-nodes="${esc(D.people.map((g) => g.group).join('|'))}"></canvas>`;
  const dialog = `<dialog class="pdlg" data-profile-dialog aria-label="${esc(t['profile-open'])}"><button class="pdlg__x" type="button" data-profile-close aria-label="${esc(t['profile-close'])}"><span aria-hidden="true">×</span></button><div data-profile-content></div></dialog>`;
  const sections = [
    phero({ crumbs: [breadcrumb('/people')], h1: rich(pg.h1), lead: esc(pg.lead), bg: { type: 'image', src: '/assets/img/group-2.webp' } }),
    `<section class="section section--paper"><div class="container founder"><div class="founder__img clip" data-clip data-drift><img src="${f.image}" width="900" height="969" alt="${esc(f.name)}" loading="lazy" data-parallax></div><div><span class="eyebrow" data-reveal>${esc(D.pageText.people['founder-eyebrow'])}</span><h2 class="split" style="margin-top:18px">${esc(f.name)}</h2><p class="founder__tag" data-reveal>${esc(f.role)} · ${plain(f.tag)}</p><div class="founder__bio" data-reveal>${f.bio.map((b) => `<p>${esc(b)}</p>`).join('')}</div><div class="chips" style="margin:24px 0" data-reveal>${f.expertise.map((x) => `<span class="chip">${plain(x)}</span>`).join('')}</div><blockquote data-reveal>${esc(f.quote)}</blockquote><div data-reveal>${btn(esc(D.pageText.people['cta-talk']), '/contact')}</div></div></div></section>`,
    sec(`<div class="people-head">${sectionHead('people-network')}${net}</div>${groups}${dialog}`),
    cta('cta-people'),
  ];
  const body = [sections[0], renderOrder('people', D.sectionOrder.people, sections.slice(1, -1)), sections.at(-1)].join('\n');
  return page({ title: pg.title, desc: pg.desc, path: '/people', body });
}

/* ---------------- Contact ---------------- */
function contact() {
  const pg = D.pages.contact;
  const visit = D.headings['contact-visit'];
  const ways = D.headings['contact-ways'];
  const faqHead = D.headings['contact-faq'];
  const sections = [
    phero({ crumbs: [breadcrumb('/contact')], h1: rich(pg.h1), lead: esc(pg.lead), bg: { type: 'image', src: '/assets/img/dhaka.webp' } }),
    sec(`<div class="two two--top"><div data-reveal><span class="eyebrow">${esc(visit.eyebrow)}</span><h2 class="split" style="margin:18px 0 30px">${rich(visit.title)}</h2><ul class="checks"><li><span><b style="color:var(--ink)">${esc(cfg.officeLabel)}</b> ${esc(cfg.address.join(', '))}</span></li><li><span><b style="color:var(--ink)">${esc(cfg.emailLabel)}</b> <a class="link" style="text-transform:none;letter-spacing:0" href="mailto:${esc(cfg.email)}">${esc(cfg.email)}</a></span></li><li><span><b style="color:var(--ink)">${esc(cfg.phoneLabel)}</b> <a href="tel:${esc(cfg.phoneHref)}">${esc(cfg.phone)}</a></span></li><li><span><b style="color:var(--ink)">${esc(cfg.hoursLabel)}</b> ${esc(cfg.hours)}</span></li></ul><div style="margin-top:28px">${btn(esc(D.pageText.contact['cta-open-maps']), plain(cfg.mapUrl), 'btn--ghost')}</div></div><div data-reveal>${formBlock({ light: true, id: 'contact-form' })}</div></div>`),
    sec(`${sectionHead('contact-ways')}<div class="cards4" data-stagger>${D.navigation.contactPathways.map((p, i) => tile(esc(p.label), esc(p.description), '0' + (i + 1))).join('')}</div>`, 'section--sand'),
    sec(`<div class="two two--top"><div style="position:sticky;top:130px"><span class="eyebrow" data-reveal>${esc(faqHead.eyebrow)}</span><h2 class="split" style="margin-top:18px">${rich(faqHead.title)}</h2></div><div class="acc" data-stagger>${D.faq.map((q, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(q.q)}</summary><p>${esc(q.a)}</p></details>`).join('')}</div></div>`),
  ];
  const body = [sections[0], renderOrder('contact', D.sectionOrder.contact, sections.slice(1)), require('./pages-finder').finderPrefill()].join('\n');
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: D.faq.map((q) => ({ '@type': 'Question', name: q.q, acceptedAnswer: { '@type': 'Answer', text: q.a } })) }];
  return page({ title: pg.title, desc: pg.desc, path: '/contact', body: body + `<script type="application/json" id="explorer-prefill">${JSON.stringify(Object.fromEntries(require('./explore/catalogue').map(m=>[m.slug,{title:m.title,focus:m.focus}]))).replace(/</g,'\\u003c')}</script>`, jsonld });
}

/* ---------------- Legal & 404 ---------------- */
function legal(kind) {
  const doc = D.legal[kind];
  const meta = D.pages[kind];
  const legalText = (value) => esc(value)
    .replace(/\{\{company\}\}/g, esc(cfg.name))
    .replace(/\{\{email\}\}/g, esc(cfg.email))
    .replace(/\{\{address\}\}/g, esc(cfg.address.join(', ')));
  const lastSection = doc.sections.at(-1);
  const lastParagraph = lastSection?.paragraphs.at(-1) || '';
  const hasReviewNote = lastParagraph.startsWith('This text is a plain-language summary');
  const content = doc.sections.map((section) => {
    const values = hasReviewNote && section === lastSection ? section.paragraphs.slice(0, -1) : section.paragraphs;
    const paragraphs = values.map((p) => `<li>${legalText(p)}</li>`);
    const body = kind === 'privacy' && section.heading === 'How we use it'
      ? `<ul>${paragraphs.join('')}</ul>`
      : values.map((p) => `<p>${legalText(p)}</p>`).join('');
    return `<h2>${esc(section.heading)}</h2>${body}`;
  }).join('\n');
  const footnote = `${doc.updated ? `Last updated: ${esc(doc.updated)}. ` : ''}${hasReviewNote ? legalText(lastParagraph) : ''}`;
  const body = [
    phero({ crumbs: [{ label: doc.title }], h1: esc(doc.title), lead: esc(doc.lead), bg: { type: 'image', src: '/assets/img/dhaka.webp' } }),
    sec(`<div class="narrow legal">\n${content}${footnote ? `<p class="small">${footnote}</p>` : ''}</div>`),
  ].join('\n');
  return page({ title: meta.title, desc: legalText(meta.desc), path: `/${kind}`, body, noindex: false });
}

function notFound() {
  const h = D.headings['not-found'];
  const body = `<section class="notfound on-dark dark"><div><span class="eyebrow">${esc(h.eyebrow)}</span><h1 class="display">${rich(h.title)}</h1><p class="lead" style="margin:20px auto 34px">${esc(h.lead)}</p><div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center">${btn(esc(D.pageText.notfound['cta-back-home']), '/', 'btn--light')}${btn(esc(D.pageText.notfound['cta-capabilities']), '/capabilities', 'btn--outline-light')}${btn(esc(D.pageText.notfound['cta-contact']), '/contact', 'btn--outline-light')}</div></div></section>`;
  return page({ title: 'Page not found', desc: 'Page not found.', path: '/404', body, noindex: true });
}

module.exports = { about, approach, capabilities, sectorsIndex, sectorPage, engagements, insights, people, contact, legal, notFound };
