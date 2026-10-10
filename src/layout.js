const cfg = require('./config');
const D = require('./data');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const plain = (s) => esc(s).replace(/&amp;/g, '&');
// plain text from the CMS; only <em>…</em> is allowed to survive as markup
const rich = (s) => esc(s).replace(/&lt;(\/?)em&gt;/g, '<$1em>');
const strip = (s) => String(s).replace(/<[^>]+>/g, '');
const arrow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const arrowL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>';

const fontsHref = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,100..900,0..100,0..1;1,9..144,100..900,0..100,0..1&family=Lato:wght@300;400;700&family=Montserrat:wght@400;500;600;700&display=swap';

function btn(label, href, cls = '') {
  return `<a class="btn ${cls}" href="${href}">${label}${arrow}</a>`;
}

function sectionHead(key) {
  const h = D.headings[key];
  return `<div class="section__head"><span class="eyebrow" data-reveal>${esc(h.eyebrow || '')}</span><h2 class="split">${rich(h.title)}</h2>${h.lead ? `<p class="lead" data-reveal>${esc(h.lead)}</p>` : ''}</div>`;
}

function header(path) {
  const cur = (href) => (path === href || (href !== '/' && path.startsWith(href + '/')) ? ' aria-current="page"' : '');
  const nav = D.navigation;
  const primary = nav.primary.filter((item) => !item.hidden);
  const links = primary.map((n) => `<a href="${esc(n.href)}"${cur(n.href)}>${esc(n.label)}</a>`).join('');
  const dlinks = [{ href: nav.homeHref, label: nav.homeLabel }, ...primary, { href: nav.contactHref, label: nav.contactLabel }]
    .map((n, i) => `<a class="d-link" style="transition-delay:${0.25 + i * 0.05}s" href="${esc(n.href)}">${esc(n.label)}</a>`).join('');
  return `
<header class="head" data-head>
  <div class="head__bar">
    <a class="brand" href="${esc(nav.homeHref)}" aria-label="${cfg.name} — home">
      <img src="/assets/logo/ip3-mark.png" width="42" height="42" alt="" decoding="async">
      <span class="brand__t"><span class="brand__n">IP3 <b>Consulting</b></span><span class="brand__d">${cfg.descriptor}</span></span>
    </a>
    <nav class="nav" aria-label="Primary">${links}</nav>
    <div class="head__cta">
      ${btn(esc(nav.headerCta), esc(nav.contactHref), 'btn--sm')}
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
  const nav = D.navigation;
  const col = (title, items, escapeLabel = true) => `<div><h4>${esc(title)}</h4><ul>${items.map((item) => `<li><a href="${esc(item.href)}">${escapeLabel ? esc(item.label) : item.label}</a></li>`).join('')}</ul></div>`;
  return `
<footer class="foot">
  <div class="container">
    <div class="foot__grid">
      <div>
        <a class="foot__logo" href="${esc(nav.homeHref)}" aria-label="${cfg.name} — home">
          <i><img src="/assets/logo/ip3-mark.png" width="44" height="44" alt="" loading="lazy"></i>
          <span class="brand__t"><span class="brand__n">IP3 <b style="color:#f0a98f">Consulting</b></span><span class="brand__d">${cfg.descriptor}</span></span>
        </a>
        <p style="max-width:34ch">${esc(nav.footerDescription)}</p>
      </div>
      ${col(nav.exploreTitle, nav.explore)}
      ${col(nav.sectorsTitle, D.sectors.slice(0, 8).map((s) => ({ label: s.title.replace(', Trade & Private-Sector Development', ' & Trade'), href: `/sectors/${s.slug}` })), false)}
      <div>
        <h4>${esc(nav.officeTitle)}</h4>
        <address>${cfg.address.join('<br>')}<br><br><a href="mailto:${cfg.email}">${cfg.email}</a><br><a href="tel:${cfg.phoneHref}">${cfg.phone}</a><br><span style="opacity:.7">${cfg.hours}</span></address>
      </div>
    </div>
    <div class="foot__big" aria-hidden="true">IP3 Consulting</div>
    <div class="foot__bar">
      <span>© ${new Date().getFullYear()} ${cfg.name} — ${cfg.alt}. All rights reserved.</span>
      <nav aria-label="${esc(nav.legalNavLabel)}">${nav.legal.map((item) => `<a href="${esc(item.href)}">${esc(item.label)}</a>`).join('')}</nav>
    </div>
  </div>
</footer>`;
}

function formBlock({ light = false, id = 'contact' } = {}) {
  const caps = D.capabilities.cards.map((c) => `<option>${esc(c.title)}</option>`).join('');
  return `
<form class="form ${light ? 'form--light' : ''}" id="${id}" data-contact-form novalidate>
  <h3>${rich(D.headings['contact-form'].title)}</h3>
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
  <button class="btn" type="submit">${esc(D.pageText.contact['form-submit'])}${arrow}</button>
  <p class="form__ok" role="status">${esc(D.pageText.contact['form-success'].replace(/\{\{email\}\}/g, cfg.email))}</p>
  <p class="form__note">${esc(D.pageText.contact['form-note'])}</p>
</form>`;
}

function cta(key = 'cta-default', options = {}) {
  const copy = D.headings[key];
  const eyebrow = options.eyebrow === undefined ? copy.eyebrow : options.eyebrow;
  const paths = D.navigation.ctaPaths.map((p) => `<a class="path" href="${esc(p.href)}"><div><b>${esc(p.label)}</b><span>${esc(p.description)}</span></div>${arrow}</a>`).join('');
  return `
<section class="cta section on-dark dark" id="start">
  <div class="container cta__grid">
    <div>
      <span class="eyebrow" data-reveal>${plain(eyebrow || '')}</span>
      <h2 class="split" style="margin-top:20px">${rich(copy.title)}</h2>
      ${copy.lead ? `<p class="lead" data-reveal style="margin-top:26px">${esc(copy.lead)}</p>` : ''}
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
  const items = [{ label: D.navigation.homeLabel, href: D.navigation.homeHref }, ...crumbs];
  const bc = items.map((c, i) => i === 0
    ? `<a href="${esc(c.href)}">${esc(c.label)}</a>`
    : i === items.length - 1
      ? `<span>${esc(c.label)}</span>`
      : `<span><a href="${esc(c.href)}">${esc(c.label)}</a></span>`).join('');
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

function breadcrumb(href) {
  const item = D.navigation.breadcrumbs.find((entry) => entry.href === href);
  if (!item) throw new Error(`No CMS breadcrumb label configured for ${href}`);
  return { label: item.label, href: item.href };
}

function page({ title, desc, path, body, bodyClass = '', ogImage = '/assets/img/og.jpg', jsonld = [], noindex = false, preload = '' }) {
  const url = cfg.url + (path === '/' ? '/' : path);
  const fullTitle = path === '/' ? title : `${title} | ${cfg.short}`;
  const org = {
    '@context': 'https://schema.org', '@type': 'Organization', legalName: cfg.name, name: cfg.short, alternateName: cfg.alt, url: cfg.url,
    logo: cfg.url + '/assets/logo/icon-512.png', foundingDate: String(cfg.founded), email: cfg.email, telephone: cfg.phone,
    address: { '@type': 'PostalAddress', streetAddress: cfg.streetAddress, addressLocality: cfg.addressLocality, postalCode: cfg.postalCode, addressCountry: cfg.countryCode },
  };
  const crumbLd = path === '/' ? null : {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [{ '@type': 'ListItem', position: 1, name: D.navigation.homeLabel, item: cfg.url + '/' }, ...path.split('/').filter(Boolean).map((seg, i, a) => ({ '@type': 'ListItem', position: i + 2, name: seg.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()), item: cfg.url + '/' + a.slice(0, i + 1).join('/') }))],
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

module.exports = { esc, plain, rich, strip, arrow, arrowL, btn, header, footer, formBlock, cta, sectionHead, phero, breadcrumb, page, cfg, D };
