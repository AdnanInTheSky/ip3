const cfg = require('./config');
const D = require('./data');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const strip = (s) => String(s).replace(/<[^>]+>/g, '');
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const arrowL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';

const fontsHref = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,100..900,0..100,0..1;1,9..144,100..900,0..100,0..1&family=Lato:wght@300;400;700&family=Montserrat:wght@400;500;600;700&display=swap';

function btn(label, href, cls = '') {
  return `<a class="btn ${cls}" href="${href}">${label}${arrow}</a>`;
}

function header(path) {
  const cur = (href) => (path === href || (href !== '/' && path.startsWith(href + '/')) ? ' aria-current="page"' : '');
  const links = cfg.nav.map((n) => `<a href="${n.href}"${cur(n.href)}>${n.label}</a>`).join('');
  const dlinks = [{ href: '/', label: 'Home' }, ...cfg.nav, { href: '/contact', label: 'Contact' }]
    .map((n, i) => `<a class="d-link" style="transition-delay:${0.25 + i * 0.05}s" href="${n.href}">${n.label}</a>`).join('');
  return `
<header class="head" data-head>
  <div class="head__bar">
    <a class="brand" href="/" aria-label="${cfg.name} — home">
      <img src="/assets/logo/ip3-mark.png" width="42" height="42" alt="" decoding="async">
      <span class="brand__t"><span class="brand__n">IP3 <b>Consulting</b></span><span class="brand__d">${cfg.descriptor}</span></span>
    </a>
    <nav class="nav" aria-label="Primary">${links}</nav>
    <div class="head__cta">
      ${btn('Contact Us', '/contact', 'btn--sm')}
      <button class="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="drawer" data-burger><span></span></button>
    </div>
  </div>
</header>
<div class="drawer" id="drawer" data-drawer aria-hidden="true">
  ${dlinks}
  <div class="drawer__foot">${cfg.address.join(', ')}<br><a href="mailto:${cfg.email}">${cfg.email}</a> · <a href="tel:${cfg.phoneHref}">${cfg.phone}</a></div>
</div>`;
}

function footer() {
  const col = (title, items) => `<div><h4>${title}</h4><ul>${items.map(([l, h]) => `<li><a href="${h}">${l}</a></li>`).join('')}</ul></div>`;
  return `
<footer class="foot">
  <div class="container">
    <div class="foot__grid">
      <div>
        <a class="foot__logo" href="/" aria-label="${cfg.name} — home">
          <i><img src="/assets/logo/ip3-mark.png" width="44" height="44" alt="" loading="lazy"></i>
          <span class="brand__t"><span class="brand__n">IP3 <b style="color:#f0a98f">Consulting</b></span><span class="brand__d">${cfg.descriptor}</span></span>
        </a>
        <p style="max-width:34ch">A policy and development advisory firm turning evidence into decisions, and decisions into delivery. Founded ${cfg.founded}, based in Dhaka.</p>
      </div>
      ${col('Explore', [['About', '/about'], ['Our approach', '/approach'], ['Capabilities', '/capabilities'], ['Sectors', '/sectors'], ['Selected engagements', '/engagements'], ['Insights', '/insights'], ['People', '/people']])}
      ${col('Sectors', D.sectors.slice(0, 8).map((s) => [s.title.replace(', Trade & Private-Sector Development', ' & Trade'), `/sectors/${s.slug}`]))}
      <div>
        <h4>Dhaka office</h4>
        <address>${cfg.address.join('<br>')}<br><br><a href="mailto:${cfg.email}">${cfg.email}</a><br><a href="tel:${cfg.phoneHref}">${cfg.phone}</a><br><span style="opacity:.7">${cfg.hours}</span></address>
      </div>
    </div>
    <div class="foot__big" aria-hidden="true">IP3 Consulting</div>
    <div class="foot__bar">
      <span>© ${new Date().getFullYear()} ${cfg.name} — ${cfg.alt}. All rights reserved.</span>
      <nav aria-label="Legal"><a href="/privacy">Privacy Policy</a><a href="/terms">Terms</a><a href="/contact">Contact</a></nav>
    </div>
  </div>
</footer>`;
}

function formBlock({ light = false, id = 'contact' } = {}) {
  const caps = D.capabilities.cards.map((c) => `<option>${esc(c.title)}</option>`).join('');
  return `
<form class="form ${light ? 'form--light' : ''}" id="${id}" data-contact-form novalidate>
  <h3>Start the conversation</h3>
  <div class="field--row field">
    <div class="field"><label for="${id}-name">Name</label><input id="${id}-name" name="name" autocomplete="name" required></div>
    <div class="field"><label for="${id}-email">Email</label><input id="${id}-email" name="email" type="email" autocomplete="email" required></div>
  </div>
  <div class="field"><label for="${id}-org">Organization</label><input id="${id}-org" name="organization" autocomplete="organization"></div>
  <div class="field--row field">
    <div class="field"><label for="${id}-type">Engagement type</label><select id="${id}-type" name="engagement"><option>Diagnostic</option><option>Design</option><option>Implementation support</option><option>Evaluation</option><option>Convening</option><option>Partnership / consortium</option></select></div>
    <div class="field"><label for="${id}-focus">Focus area</label><select id="${id}-focus" name="focus">${caps}</select></div>
  </div>
  <div class="field"><label for="${id}-msg">Tell us what you are trying to change</label><textarea id="${id}-msg" name="message" required></textarea></div>
  <button class="btn" type="submit">Send message${arrow}</button>
  <p class="form__ok" role="status">Thank you — your message is ready. If your email app did not open, write to ${cfg.email}.</p>
  <p class="form__note">We aim to respond within one business day. Your details are used only to reply to this enquiry.</p>
</form>`;
}

function cta({ eyebrow = 'Ready to work with IP3?', h2 = 'Tell us the mandate <em>you need to deliver.</em>', text = 'Whether you are preparing a new program, assessing an investment, designing a reform, commissioning an evaluation or assembling a consortium, IP3 can help define the analytical and implementation support required.' } = {}) {
  const paths = [
    ['Discuss a Consulting Assignment', 'Diagnostic, design, implementation or evaluation work.'],
    ['Partner With IP3', 'Consortium or subcontracting opportunities.'],
    ['Discuss a Research Partnership', 'Research, evidence generation or thought leadership.'],
    ['Request Our Capability Statement', 'Ask for our full capabilities document.'],
  ].map(([t, d]) => `<a class="path" href="/contact"><div><b>${t}</b><span>${d}</span></div>${arrow}</a>`).join('');
  return `
<section class="cta section on-dark dark" id="start">
  <div class="container cta__grid">
    <div>
      <span class="eyebrow" data-reveal>${eyebrow}</span>
      <h2 class="split" style="margin-top:20px">${h2}</h2>
      <p class="lead" data-reveal style="margin-top:26px">${text}</p>
      <div class="paths" data-stagger>${paths}</div>
    </div>
    <div data-reveal>${formBlock()}</div>
  </div>
</section>`;
}

function phero({ crumbs = [], h1, lead, bg }) {
  const media = bg && bg.type === 'video'
    ? `<video muted loop playsinline autoplay preload="metadata" poster="${bg.poster}" data-parallax-bg><source src="${bg.src}" type="video/mp4"></video>`
    : `<img src="${bg.src}" alt="" data-parallax-bg fetchpriority="high">`;
  const items = [{ label: 'Home', href: '/' }, ...crumbs];
  const bc = items.map((c, i) => (i === items.length - 1 ? `<span>${esc(c.label)}</span>` : i === 0 ? `<a href="${c.href}">Home</a>` : `<span><a href="${c.href}">${esc(c.label)}</a></span>`)).join('');
  return `
<section class="phero on-dark dark">
  <div class="phero__bg">${media}</div>
  <div class="container">
    <nav class="crumbs" aria-label="Breadcrumb">${bc}</nav>
    <h1 class="split" data-hero-title>${h1}</h1>
    ${lead ? `<p class="lead" data-reveal>${lead}</p>` : ''}
  </div>
</section>`;
}

function page({ title, desc, path, body, bodyClass = '', ogImage = '/assets/img/og.jpg', jsonld = [], noindex = false, preload = '' }) {
  const url = cfg.url + (path === '/' ? '/' : path);
  const fullTitle = path === '/' ? title : `${title} | ${cfg.short}`;
  const org = {
    '@context': 'https://schema.org', '@type': 'Organization', legalName: cfg.name, name: cfg.short, alternateName: cfg.alt, url: cfg.url,
    logo: cfg.url + '/assets/logo/icon-512.png', foundingDate: String(cfg.founded), email: cfg.email, telephone: cfg.phone,
    address: { '@type': 'PostalAddress', streetAddress: 'Zenith Prime, House-39, Road-35/A, Gulshan-2', addressLocality: 'Dhaka', postalCode: '1212', addressCountry: 'BD' },
  };
  const crumbLd = path === '/' ? null : {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: cfg.url + '/' }, ...path.split('/').filter(Boolean).map((seg, i, a) => ({ '@type': 'ListItem', position: i + 2, name: seg.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()), item: cfg.url + '/' + a.slice(0, i + 1).join('/') }))],
  };
  const ld = [org, crumbLd, ...jsonld].filter(Boolean).map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n');
  return `<!DOCTYPE html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
${noindex ? '<meta name="robots" content="noindex">' : '<meta name="robots" content="index,follow,max-image-preview:large">'}
<meta name="theme-color" content="#12100f">
<meta property="og:type" content="website"><meta property="og:site_name" content="${cfg.name}">
<meta property="og:title" content="${esc(fullTitle)}"><meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}"><meta property="og:image" content="${cfg.url}${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/logo/favicon-32.png">
<link rel="icon" type="image/png" sizes="48x48" href="/assets/logo/favicon-48.png">
<link rel="apple-touch-icon" href="/assets/logo/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fontsHref}">
<link rel="stylesheet" href="/assets/css/site.css?v=__CSSV__">
${preload}
<script>document.documentElement.className=document.documentElement.className.replace('no-js','js')</script>
${ld}
</head>
<body class="${bodyClass}" data-path="${path}">
<a class="skip" href="#main">Skip to content</a>
<div class="progress" aria-hidden="true"><i data-progress></i></div>
${header(path)}
<main id="main">
${body}
</main>
${footer()}
<script src="/assets/vendor/gsap.min.js" defer></script>
<script src="/assets/vendor/ScrollTrigger.min.js" defer></script>
<script src="/assets/vendor/lenis.min.js" defer></script>
<script src="/assets/js/site.js?v=__JSV__" defer></script>
</body>
</html>
`;
}

module.exports = { esc, strip, arrow, arrowL, btn, header, footer, formBlock, cta, phero, page, cfg, D };
