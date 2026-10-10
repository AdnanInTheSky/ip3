const { esc, arrow, arrowL, btn, cta, phero, page, formBlock, cfg, D } = require('./layout');
const { engRow, insCard } = require('./pages-home');

const capBySlug = Object.fromEntries(D.capabilities.cards.map((c, i) => [c.slug, { ...c, i }]));
const engBySlug = Object.fromEntries(D.engagements.map((e) => [e.slug, e]));
const sec = (inner, cls = '', id = '') => `<section class="section ${cls}"${id ? ` id="${id}"` : ''}><div class="container">${inner}</div></section>`;
const head = (eyebrow, h2, lead) => `<div class="section__head"><span class="eyebrow" data-reveal>${eyebrow}</span><h2 class="split">${h2}</h2>${lead ? `<p class="lead" data-reveal>${lead}</p>` : ''}</div>`;
const tile = (t, p, n) => `<div class="tile">${n ? `<span class="n">${n}</span>` : ''}<h3>${t}</h3><p>${p}</p></div>`;

/* ---------------- About ---------------- */
function about() {
  const a = D.about;
  const body = [
    phero({ crumbs: [{ label: 'About' }], h1: 'A strategic policy &amp; management solutions firm for a <em>sustainable future.</em>', lead: 'The Institute for Public Policy and Practice works at the intersection of policy research, strategic advisory, management solutions and implementation.', bg: { type: 'image', src: '/assets/img/group-2.webp' } }),
    sec(`<div class="two two--top"><div><span class="eyebrow" data-reveal>Who we are</span><h2 class="split" style="margin:18px 0 28px">Built for complex systems. <em>Anchored in local realities.</em></h2></div><div data-stagger style="display:grid;gap:18px" class="lead">${a.intro.map((p) => `<p>${esc(p)}</p>`).join('')}<p>Complex public challenges rarely fit within a single discipline. IP3 brings together economists, policy specialists, researchers, sector experts, data strategists and practitioners from diverse geographies — with a particular focus on the operational realities of the Global South.</p></div></div>`),
    `<section class="section--dark on-dark dark" style="padding:clamp(70px,9vw,130px) 0"><div class="container cards2" data-stagger>${[a.vision, a.mission].map((x) => `<div class="tile" style="padding:clamp(28px,4vw,52px);gap:20px"><span class="eyebrow">${x.label}</span><h3 style="font-size:clamp(1.7rem,3vw,2.6rem);line-height:1.12">${x.title}</h3><p style="font-size:1.05rem">${x.text}</p></div>`).join('')}</div><div class="container" style="margin-top:50px"><ul class="checks" data-stagger style="grid-template-columns:repeat(2,1fr);column-gap:50px">${a.aims.map((x) => `<li>${x}</li>`).join('')}</ul></div></section>`,
    sec(`<div class="two"><div><span class="eyebrow" data-reveal>${a.principles.eyebrow}</span><h2 class="split" style="margin:18px 0 26px">${a.principles.h2}</h2><p class="lead" data-reveal>${a.principles.text}</p></div><div class="compare" data-compare><img src="/assets/img/polycrisis.webp" width="1024" height="1024" alt="Polluted industrial landscape — the polycrisis" loading="lazy"><img class="compare__top" src="/assets/img/polysolutions.webp" width="1024" height="1024" alt="The same landscape transformed into a green, resilient city — polysolutions" loading="lazy"><span class="compare__lbl compare__lbl--a">Polycrisis</span><span class="compare__lbl compare__lbl--b">Polysolutions</span><div class="compare__bar"></div></div></div>`, 'section--sand'),
    sec(`${head('From insight to implementation', 'Our translational approach connects the <em>full lifecycle.</em>')}<div class="cards4" data-stagger>${a.lifecycle.map((l, i) => tile(l[0], l[1], '0' + (i + 1))).join('')}</div>`),
    sec(`${head('Three connected areas of transformation', 'One ambition. <em>Three connected systems.</em>')}<div class="cards3" data-stagger>${a.pillars.map((l, i) => tile(l[0], l[1], '0' + (i + 1))).join('')}</div>`, 'section--sand'),
    sec(`<div class="two two--top"><div style="position:sticky;top:130px"><span class="eyebrow" data-reveal>Our values</span><h2 class="split" style="margin:18px 0 22px">Diverse minds, <em>shared vision.</em></h2><p class="lead" data-reveal>Regardless of cultural, educational or professional background, IP3 people share the same commitment to challenging conventional thinking and solving complex problems — and a passion for helping clients succeed.</p></div><div class="acc" data-stagger>${a.values.map((v, i) => `<details${i === 0 ? ' open' : ''}><summary>${v[0]}</summary><p>${v[1]}</p></details>`).join('')}</div></div>`),
    sec(`${head('We are different', 'Beyond advice — expertise that drives <em>real transformation.</em>', 'We take a systemic perspective to policy research and develop new ideas and feasible solutions that put the needs of people and the health of the planet at the core of economic and development policy.')}<div class="cards4" data-stagger>${a.different.map((l, i) => tile(l[0], l[1], '0' + (i + 1))).join('')}</div>`, 'section--paper'),
    sec(`<div class="two"><div class="photo photo--wide clip" data-clip><img src="/assets/img/workshop-adb.webp" width="800" height="520" alt="Panel at an ADB-supported policy workshop" loading="lazy" data-parallax></div><div><span class="eyebrow" data-reveal>IP3 people — global and in-house</span><h2 class="split" style="margin:18px 0 22px">A dynamic network of economists and thinkers.</h2><p class="lead" data-reveal>A vibrant hub for networking, knowledge exchange and resource sharing — bringing together complementary skills and expertise from different geographies to drive economies towards a green, sustainable and prosperous future.</p><div style="margin-top:28px;display:flex;gap:14px;flex-wrap:wrap" data-reveal>${btn('Meet IP3 people', '/people')}${btn('Start a conversation', '/contact', 'btn--ghost')}</div></div></div>`),
    cta({ eyebrow: 'Choose IP3 Consulting', h2: 'Where purpose meets transformation, <em>and innovation drives impact.</em>' }),
  ].join('\n');
  return page({ title: 'About IP3 — Institute for Public Policy & Practice', desc: 'IP3 is a next-generation think tank and policy advisory firm founded in 2018, combining systems thinking, data and digital ecosystems, and translational research to turn evidence into measurable impact.', path: '/about', body });
}

/* ---------------- Approach ---------------- */
function approach() {
  const [s1, , s3, s4, s5, s6, s7, s8] = D.approach;
  const case_ = (p) => (p ? `<div class="case">${esc(p)}</div>` : '');
  const move = (c, i) => `<article class="move" data-reveal><div><div class="move__n">0${i + 1}</div><h3>${esc(c.title)}</h3><p style="color:var(--ink-2)">${esc(c.text)}</p>${case_(c.paragraph)}</div><ul>${c.bullets.map((b) => { const [k, ...v] = b.split(' — '); return `<li><b>${esc(k)}</b>${esc(v.join(' — '))}</li>`; }).join('')}</ul></article>`;
  const nodes = s6.orbitItems.map((o, i) => `<div class="orbit__node" style="--a:${i * 60 - 90}deg"><div><b>${o.shortLabel}</b><span>${esc(o.label)}</span></div></div>`).join('');
  const body = [
    phero({ crumbs: [{ label: 'Our approach' }], h1: 'Reform is a movement, <em>not a moment.</em>', lead: esc(s1.paragraph), bg: { type: 'video', src: '/assets/video/hero-4.mp4', poster: '/assets/img/poster-hero-4.webp' } }),
    sec(`${head(esc(s3.subtitle.toLowerCase().replace(/^./, (c) => c.toUpperCase())), 'We begin with the problem as it exists — <em>not with a pre-packaged solution.</em>', esc(s3.paragraph))}
      <div class="state" data-reveal><div class="state__box"><h3>${s3.currentState.title}</h3><ul class="checks">${s3.currentState.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div><div class="state__arrow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div><div class="state__box state__box--b dark"><h3>${s3.desiredState.title}</h3><ul class="checks" style="--x:0">${s3.desiredState.items.map((x) => `<li style="border-color:rgba(255,255,255,.16);color:rgba(255,255,255,.85)">${esc(x)}</li>`).join('')}</ul></div></div>
      <div class="cards3" style="margin-top:22px" data-stagger>${s3.questionCards.map((q) => tile(esc(q.title.replace(/^\d+\s+/, '')), esc(q.text), q.title.slice(0, 2))).join('')}</div>`),
    `<section class="section section--sand"><div class="container two two--top"><div style="position:sticky;top:130px"><span class="eyebrow" data-reveal>Define the decision first</span><h2 class="split" style="margin:18px 0 22px">${esc(s3.bigCard.title)}</h2><div class="photo photo--wide clip" data-clip style="margin-top:30px"><img src="/assets/img/workshop-1.webp" width="960" height="720" alt="Stakeholders working through a problem at a policy workshop" loading="lazy" data-parallax></div></div><ul class="checks" data-stagger>${s3.bigCard.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></section>`,
    sec(`${head(esc(s4.subtitle), esc(s4.title).replace('Reform', '<em>Reform</em>'), esc(s4.paragraph))}<div class="movements">${s4.cards.map(move).join('')}</div>`),
    `<section class="section section--dark on-dark dark"><div class="container">${head(esc(s5.subtitle.toLowerCase().replace(/^./, (c) => c.toUpperCase())), 'Six commitments that make the pathway <em>IP3.</em>', esc(s5.paragraph))}<div class="cards3" data-stagger>${s5.cards.map((c, i) => `<div class="tile"><span class="n" style="color:#f0b9a3">0${i + 1}</span><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></div>`).join('')}</div></div></section>`,
    sec(`<div class="two"><div><span class="eyebrow" data-reveal>${esc(s6.subtitle.toLowerCase().replace(/^./, (c) => c.toUpperCase()))}</span><h2 class="split" style="margin:18px 0 22px">Policy becomes real through <em>people’s experience.</em></h2><p class="lead" data-reveal>${esc(s6.paragraph)} ${esc(s6.questionAnswer)}</p><div class="chips" style="margin-top:26px" data-reveal>${s6.tags.map((t) => `<span class="chip">${esc(t)}</span>`).join('')}</div><ul class="checks" style="margin-top:30px" data-stagger>${s6.orbitItems.map((o) => `<li><span><b style="color:var(--ink)">${esc(o.label)}.</b> ${esc(o.description)}</span></li>`).join('')}</ul></div><div class="orbit" data-orbit><div class="orbit__ring"></div><div class="orbit__core">${esc(s6.iterateText)}</div>${nodes}</div></div>`, 'section--paper'),
    sec(`${head(esc(s7.subtitle.toLowerCase().replace(/^./, (c) => c.toUpperCase())), 'The pathway is consistent. <em>The toolkit changes.</em>', esc(s7.paragraph))}<div class="cards3" data-stagger>${s7.cards.map((c, i) => tile(esc(c.title), esc(c.text), '0' + (i + 1))).join('')}</div>
      <div style="margin-top:clamp(60px,8vw,110px)"><span class="eyebrow" data-reveal>${esc(s7.subsection.subtitle.toLowerCase().replace(/^./, (c) => c.toUpperCase()))}</span><h2 class="split" style="margin:18px 0 18px">${esc(s7.subsection.title)}</h2><p class="lead" data-reveal style="margin-bottom:36px">${esc(s7.subsection.description)}</p>
      <div class="twosides" data-stagger><div class="tile"><h3>${esc(s7.subsection.leftTitle)}</h3><ul class="checks">${s7.subsection.leftItems.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div><div class="twosides__plus">+</div><div class="tile"><h3>${esc(s7.subsection.rightTitle)}</h3><ul class="checks">${s7.subsection.rightItems.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
      <p class="lead" style="margin-top:30px" data-reveal><b style="color:var(--ink)">${esc(s7.subsection.togetherTitle)}</b> — ${esc(s7.subsection.togetherDescription)}</p></div>`, 'section--sand'),
    sec(`${head(esc(s8.subtitle.toLowerCase().replace(/^./, (c) => c.toUpperCase())), 'The objective is not a better report. <em>It is a system better able to act.</em>', esc(s8.paragraph))}<ul class="arrowlist" data-stagger>${s8.cards.map((c) => { const [a, b] = c.text.split(' → '); return `<li><span>${esc(a)}</span><i>→</i><span>${esc(b || '')}</span></li>`; }).join('')}</ul>`),
    sec(`${head('Why the IP3 approach is different', esc(s8.subsection1.title), esc(s8.subsection1.paragraph))}<div class="cards3" data-stagger>${s8.subsection1.cards.map((c) => tile(esc(c.title), esc(c.text))).join('')}</div>`, 'section--paper'),
    sec(`${head('Beyond the recommendation', esc(s8.subsection2.title), esc(s8.subsection2.paragraph))}<div class="cards4" data-stagger>${s8.subsection2.cards.map((c, i) => tile(esc(c.title), esc(c.text), String(i + 1).padStart(2, '0'))).join('')}</div>`),
    cta({ eyebrow: 'Start a conversation with IP3', h2: 'Where would your engagement <em>start?</em>', text: 'Most conversations begin with a diagnostic question — what is actually driving this, and what would have to change. Tell us where you are and we will suggest the right entry point.' }),
  ].join('\n');
  return page({ title: 'Our Approach — From Policy to Implementation', desc: 'IP3’s pathway from evidence to delivery: sense and diagnose, build intelligence, co-design and test, mobilise, implement and transfer, learn and scale.', path: '/approach', body });
}

/* ---------------- Capabilities ---------------- */
function capabilities() {
  const rows = D.capabilities.cards.map((c, i) => `
  <article class="caprow" id="${c.slug}"><div class="n">0${i + 1}</div><div data-reveal><h3>${c.title}</h3><q>“${c.problem}”</q></div><div data-reveal><h4>Typical deliverables</h4><div class="chips">${c.deliverables.map((d) => `<span class="chip">${d}</span>`).join('')}</div><div style="margin-top:26px"><h4>Applied most in</h4><div class="chips">${D.sectors.filter((s) => s.caps.includes(c.slug)).slice(0, 4).map((s) => `<a class="chip" href="/sectors/${s.slug}">${s.title.split(',')[0].split(' & ')[0]}</a>`).join('')}</div></div></div></article>`).join('');
  const body = [
    phero({ crumbs: [{ label: 'Capabilities' }], h1: 'What clients hire <em>IP3</em> to deliver.', lead: 'Six capabilities, each defined by the problem a client brings and the deliverables that move it toward implementation.', bg: { type: 'video', src: '/assets/video/data.mp4', poster: '/assets/img/poster-data.webp' } }),
    sec(rows),
    sec(`${head('How an engagement starts', 'Every engagement can begin at <em>any stage.</em>')}<div class="cards4" data-stagger>${D.about.lifecycle.map((l, i) => tile(l[0], l[1], '0' + (i + 1))).join('')}</div>`, 'section--sand'),
    cta({ eyebrow: 'Find the right expertise', h2: 'Find the right expertise for the issues <em>facing your organization.</em>' }),
  ].join('\n');
  return page({ title: 'Capabilities', desc: 'Policy, economics and strategy advisory; program and project design; development finance; institutions and governance; MEL and impact; data, digital and responsible AI.', path: '/capabilities', body });
}

/* ---------------- Sectors ---------------- */
function sectorsIndex() {
  const list = D.sectors.map((s) => `<a href="/sectors/${s.slug}" data-reveal><b class="n">${s.n}</b><div><h3>${s.title}</h3><p>${s.problem}</p></div><div class="thumb"><img src="${s.card}" width="440" height="275" alt="" loading="lazy"></div>${arrow}</a>`).join('');
  const body = [
    phero({ crumbs: [{ label: 'Sectors' }], h1: 'From polycrisis to <em>polysolutions.</em>', lead: 'IP3 works across eight interconnected sectors where economic, institutional, environmental and technological risks overlap. We combine specialist sector knowledge with cross-cutting capabilities in economics, finance, governance, data and implementation.', bg: { type: 'video', src: '/assets/video/coast.mp4', poster: '/assets/img/poster-coast.webp' } }),
    sec(`<div class="sx">${list}</div>`),
    cta({ eyebrow: 'Eight sectors. One integrated delivery model.', h2: 'Which sector is your <em>mandate in?</em>' }),
  ].join('\n');
  return page({ title: 'Sectors', desc: 'Eight connected sectors: climate and energy, education and skills, health and social protection, digital government, governance and public finance, economic transformation, sustainable finance and ESG, and AI for public systems.', path: '/sectors', body });
}

function sectorPage(s, idx) {
  const prev = D.sectors[(idx + D.sectors.length - 1) % D.sectors.length];
  const next = D.sectors[(idx + 1) % D.sectors.length];
  const engs = s.engagements.map((k) => engBySlug[k]).filter(Boolean);
  const bg = s.media.type === 'video' ? { type: 'video', src: s.media.src, poster: s.media.poster } : { type: 'image', src: s.media.src };
  const body = [
    phero({ crumbs: [{ label: 'Sectors', href: '/sectors' }, { label: s.title }], h1: esc(s.title), lead: s.problem, bg }),
    sec(`<div class="two two--top"><div><span class="eyebrow" data-reveal>The challenge</span><h2 class="split" style="margin:18px 0 26px">${esc(s.problem)}</h2><p class="lead" data-reveal>IP3 brings economics, finance, institutional analysis, technology and implementation expertise together around this sector — so that analysis arrives as a decision, and a decision as delivery.</p><div style="margin-top:30px;display:flex;gap:14px;flex-wrap:wrap" data-reveal>${btn('Discuss an assignment', '/contact')}${btn('All sectors', '/sectors', 'btn--ghost')}</div></div><div class="photo photo--wide clip" data-clip><img src="${s.photo}" width="1200" height="800" alt="" loading="lazy" data-parallax></div></div>`),
    sec(`<div class="two two--top"><div style="position:sticky;top:130px"><span class="eyebrow" data-reveal>Clients hire IP3 for</span><h2 class="split" style="margin:18px 0 0">Where we <em>add value.</em></h2></div><ul class="area-list" data-stagger>${s.areas.map((a) => `<li>${a}</li>`).join('')}</ul></div>`, 'section--sand'),
    sec(`${head('Capabilities applied', 'The capabilities behind this <em>sector work.</em>')}<div class="cards4" data-stagger>${s.caps.map((k) => { const c = capBySlug[k]; return `<a class="tile" href="/capabilities#${c.slug}"><span class="n">0${c.i + 1}</span><h3>${c.title}</h3><p>${c.problem}</p></a>`; }).join('')}</div>`),
    engs.length ? sec(`${head('Related engagements', 'Selected <em>work in this sector.</em>')}<div class="eng">${engs.map(engRow).join('')}</div>`, 'section--paper') : '',
    sec(`<div class="sector-nav"><a href="/sectors/${prev.slug}"><small>← Previous sector</small><b>${prev.title}</b></a><a href="/sectors/${next.slug}"><small>Next sector →</small><b>${next.title}</b></a></div>`, 'section--tight'),
    cta({ eyebrow: `${s.title}`, h2: 'Tell us the mandate <em>you need to deliver.</em>' }),
  ].join('\n');
  return page({ title: s.title, desc: `${s.problem} IP3 supports clients with ${s.areas.slice(0, 3).join(', ').toLowerCase()} and more.`, path: `/sectors/${s.slug}`, body });
}

/* ---------------- Engagements ---------------- */
function engagements() {
  const body = [
    phero({ crumbs: [{ label: 'Engagements' }], h1: 'The challenge. Our mandate. <em>What we delivered.</em>', lead: 'Recent engagements and impact projects with global development partners and national ministries. Results are shared with client permission; references are available on request.', bg: { type: 'video', src: '/assets/video/energy.mp4', poster: '/assets/img/poster-energy.webp' } }),
    sec(`<div class="eng">${D.engagements.map(engRow).join('')}</div>`),
    sec(`<div class="partners" data-reveal><div><h3>Clients &amp; partners</h3><div class="names">${D.partners.clients.map((n) => `<span>${esc(n)}</span>`).join('')}</div></div><div><h3>Development partners our team has worked with</h3><div class="names">${D.partners.funders.map((n) => `<span>${esc(n)}</span>`).join('')}</div></div></div>`, 'section--sand'),
    sec(`<div class="quotes" data-stagger>${D.testimonials.map((t) => `<figure class="quote"><blockquote>${esc(t.quote)}</blockquote><footer><b>${esc(t.name)}</b><span>${esc(t.role)}</span></footer></figure>`).join('')}</div>`),
    cta({ eyebrow: 'References on request', h2: 'Planning something <em>similar?</em>' }),
  ].join('\n');
  return page({ title: 'Selected Engagements', desc: 'Selected IP3 engagements with ADB, the World Bank, SIDA/CPD, the Ministry of Finance and BMDF: feasibility studies, surveys, institutional transformation and climate-resilience finance.', path: '/engagements', body });
}

/* ---------------- Insights ---------------- */
function insights() {
  const reel = [['waste', 'Circular economy', 'Waste becomes a resource'], ['textile', 'Textile transition', 'Reclaiming value from garment waste'], ['coast', 'Coastal Bangladesh', 'Where land, water and livelihoods meet']];
  const body = [
    phero({ crumbs: [{ label: 'Insights' }], h1: 'Research that <em>changes decisions.</em>', lead: 'Thinking that ships — how institutions diagnose, finance and deliver. Decision-ready diagnostics, business cases and evaluations, not publications for their own sake.', bg: { type: 'image', src: '/assets/img/co2.webp' } }),
    sec(`<div class="ins" data-stagger>${D.insights.map(insCard).join('')}</div>`),
    `<section class="section section--dark on-dark dark"><div class="container">${head('From the field and the data', 'Stories behind <em>the evidence.</em>')}<div class="cards3" data-stagger>${reel.map(([v, t, d]) => `<figure class="photo" style="aspect-ratio:4/5;border-radius:var(--r)"><video muted loop playsinline preload="none" poster="/assets/img/poster-${v}.webp" data-lazyvideo><source data-src="/assets/video/${v}.mp4" type="video/mp4"></video><figcaption style="position:absolute;inset:auto 0 0 0;padding:24px;background:linear-gradient(0deg,rgba(14,12,11,.9),transparent)"><span class="eyebrow" style="font-size:.64rem">${t}</span><h3 style="margin-top:10px;color:#fff;font-size:1.3rem">${d}</h3></figcaption></figure>`).join('')}</div></div></section>`,
    cta({ eyebrow: 'Research partnerships', h2: 'Collaborate on research, evidence generation or <em>thought leadership.</em>' }),
  ].join('\n');
  return page({ title: 'Evidence & Insights', desc: 'Research and analysis from IP3: green financial product design, data-driven learning outcomes, Bangladesh’s ESG transition and municipal finance transformation.', path: '/insights', body });
}

/* ---------------- People ---------------- */
function people() {
  const ini = (n) => n.replace(/\b(Prof|Dr|Adj|Asst|Barr|Md|MD)\.?\s+/gi, '').split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  const f = D.founder;
  const groups = D.people.map((g) => `<div class="people-group"><h3 data-reveal>${g.group}</h3><div class="persons" data-stagger>${g.members.map((m) => `<article class="person"><div class="person__av" aria-hidden="true">${ini(m.name)}</div><h4>${esc(m.name)}</h4><span class="role">${esc(m.role)}</span><span class="focus">${esc(m.focus)}</span></article>`).join('')}</div></div>`).join('');
  const body = [
    phero({ crumbs: [{ label: 'People' }], h1: 'Global and in-house. <em>Economists and thinkers.</em>', lead: 'A dynamic network of economists and thinkers from a range of disciplines who understand the intricate balance between prosperity and the planet.', bg: { type: 'image', src: '/assets/img/group-2.webp' } }),
    `<section class="section section--paper"><div class="container founder"><div class="founder__img clip" data-clip><img src="${f.image}" width="900" height="969" alt="${f.name}" loading="lazy" data-parallax></div><div><span class="eyebrow" data-reveal>Executive leadership profile</span><h2 class="split" style="margin-top:18px">${f.name}</h2><p class="founder__tag" data-reveal>${f.role} · ${f.tag}</p><div class="founder__bio" data-reveal>${f.bio.map((b) => `<p>${esc(b)}</p>`).join('')}</div><div class="chips" style="margin:24px 0" data-reveal>${f.expertise.map((x) => `<span class="chip">${x}</span>`).join('')}</div><blockquote data-reveal>${esc(f.quote)}</blockquote><div data-reveal>${btn('Let’s talk', '/contact')}</div></div></div></section>`,
    sec(`${head('The IP3 network', 'Advisors, directors, scholars <em>and support units.</em>')}${groups}`),
    cta({ eyebrow: 'Work with IP3 people', h2: 'Let’s build systems <em>that can handle complexity.</em>', text: 'Partner with IP3 to design policies, platforms and institutions that are resilient, inclusive, data-driven and ready for the future.' }),
  ].join('\n');
  return page({ title: 'IP3 People', desc: 'Meet IP3’s leadership, advisors, founding directors, deputy directors, affiliated research scholars and support units.', path: '/people', body });
}

/* ---------------- Contact ---------------- */
function contact() {
  const body = [
    phero({ crumbs: [{ label: 'Contact' }], h1: 'Tell us the mandate <em>you need to deliver.</em>', lead: 'Every submission is reviewed by our team. We aim to respond within one business day.', bg: { type: 'image', src: '/assets/img/dhaka.webp' } }),
    sec(`<div class="two two--top"><div data-reveal><span class="eyebrow">IP3 Consulting Limited — Dhaka</span><h2 class="split" style="margin:18px 0 30px">Visit, call or write.</h2><ul class="checks"><li><span><b style="color:var(--ink)">Office.</b> ${cfg.address.join(', ')}</span></li><li><span><b style="color:var(--ink)">Email.</b> <a class="link" style="text-transform:none;letter-spacing:0" href="mailto:${cfg.email}">${cfg.email}</a></span></li><li><span><b style="color:var(--ink)">Phone.</b> <a href="tel:${cfg.phoneHref}">${cfg.phone}</a></span></li><li><span><b style="color:var(--ink)">Hours.</b> ${cfg.hours}</span></li></ul><div style="margin-top:28px">${btn('Open in maps', 'https://www.google.com/maps/search/?api=1&query=Zenith+Prime+House+39+Road+35%2FA+Gulshan+2+Dhaka', 'btn--ghost')}</div></div><div data-reveal>${formBlock({ light: true, id: 'contact-form' })}</div></div>`),
    sec(`${head('Four ways to start', 'How would you like to <em>work with IP3?</em>')}<div class="cards4" data-stagger>${[['Discuss a Consulting Assignment', 'Engage IP3 for diagnostic, design, implementation or evaluation work.'], ['Partner With IP3', 'Explore consortium or subcontracting opportunities.'], ['Discuss a Research Partnership', 'Collaborate on research, evidence generation or thought leadership.'], ['Request Our Capability Statement', 'Ask for our full capabilities document.']].map((p, i) => tile(p[0], p[1], '0' + (i + 1))).join('')}</div>`, 'section--sand'),
    sec(`<div class="two two--top"><div style="position:sticky;top:130px"><span class="eyebrow" data-reveal>Frequently asked questions</span><h2 class="split" style="margin-top:18px">Common <em>questions.</em></h2></div><div class="acc" data-stagger>${D.faq.map((q, i) => `<details${i === 0 ? ' open' : ''}><summary>${esc(q[0])}</summary><p>${esc(q[1])}</p></details>`).join('')}</div></div>`),
  ].join('\n');
  const jsonld = [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: D.faq.map((q) => ({ '@type': 'Question', name: q[0], acceptedAnswer: { '@type': 'Answer', text: q[1] } })) }];
  return page({ title: 'Contact', desc: 'Contact IP3 Consulting Limited in Dhaka — discuss a consulting assignment, a partnership, a research collaboration, or request our capability statement.', path: '/contact', body, jsonld });
}

/* ---------------- Legal & 404 ---------------- */
function legal(kind) {
  const priv = kind === 'privacy';
  const title = priv ? 'Privacy Policy' : 'Terms of Use';
  const content = priv ? `
<h2>Who we are</h2><p>${cfg.name} (“IP3”, “we”) operates this website. You can reach us at ${cfg.email} or ${cfg.address.join(', ')}.</p>
<h2>What we collect</h2><p>When you use the contact form we receive the name, email address, organization and message you choose to share. This website does not require an account.</p>
<h2>How we use it</h2><ul><li>To respond to your enquiry.</li><li>To prepare a proposal or discuss a collaboration you have asked about.</li><li>To meet legal or contractual obligations.</li></ul>
<h2>Sharing</h2><p>We do not sell personal data. We share it only with service providers who help us run our email and website, and where the law requires.</p>
<h2>Cookies and analytics</h2><p>This site sets no advertising cookies. Fonts are loaded from Google Fonts, which may receive your IP address as part of delivering them.</p>
<h2>Your rights</h2><p>You may ask us to access, correct or delete the personal data we hold about you by writing to ${cfg.email}.</p>
<h2>Changes</h2><p>We may update this policy from time to time. The date below shows when it last changed.</p>` : `
<h2>Use of this website</h2><p>This website is provided for general information about ${cfg.name}. By using it you agree to these terms.</p>
<h2>Intellectual property</h2><p>Content, logos and design on this website belong to ${cfg.name} or its licensors. You may share links and short quotations with attribution; other reproduction needs our written permission.</p>
<h2>No professional advice</h2><p>Content is general and does not constitute legal, financial or investment advice. Engagements are governed by the terms agreed in writing with each client.</p>
<h2>Third-party links</h2><p>We are not responsible for the content or practices of third-party sites linked from this website.</p>
<h2>Liability</h2><p>We take care to keep information accurate and current but provide it without warranty to the fullest extent permitted by law.</p>
<h2>Governing law</h2><p>These terms are governed by the laws of Bangladesh.</p>`;
  const body = [
    phero({ crumbs: [{ label: title }], h1: title, lead: priv ? 'How we handle the information you share with us.' : 'The terms that apply when you use this website.', bg: { type: 'image', src: '/assets/img/dhaka.webp' } }),
    sec(`<div class="narrow legal">${content}<p class="small">Last updated: ${new Date().toISOString().slice(0, 10)}. This text is a plain-language summary and should be reviewed by IP3’s legal counsel before launch.</p></div>`),
  ].join('\n');
  return page({ title, desc: `${title} for ${cfg.name}.`, path: `/${kind}`, body, noindex: false });
}

function notFound() {
  const body = `<section class="notfound on-dark dark"><div><span class="eyebrow">Page not found</span><h1 class="display">404</h1><p class="lead" style="margin:20px auto 34px">That page has moved, or never existed. Try the home page or one of our main sections.</p><div style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center">${btn('Back home', '/', 'btn--light')}${btn('Capabilities', '/capabilities', 'btn--outline-light')}${btn('Contact', '/contact', 'btn--outline-light')}</div></div></section>`;
  return page({ title: 'Page not found', desc: 'Page not found.', path: '/404', body, noindex: true });
}

module.exports = { about, approach, capabilities, sectorsIndex, sectorPage, engagements, insights, people, contact, legal, notFound };
