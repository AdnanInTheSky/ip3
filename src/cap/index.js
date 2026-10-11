// /capabilities — page assembly. Each section is a module in this folder that returns an HTML string.
// Section order: hero (+ figures) → led → rows → method (3D scroll) → browser → room → reel → "how an engagement starts" → CTA.
const { D, esc, rich, page, breadcrumb, cta, sectionHead } = require('./util');
const { sec, tile } = require('./shared');
const hero = require('./hero');
const led = require('./led');
const rows = require('./rows');
const method = require('./method');
const browser = require('./browser');
const room = require('./room');
const reel = require('./reel');

function capabilities() {
  const pg = D.pages.capabilities;
  const body = [
    hero.render(),
    led.render(),
    rows.render(),
    method.render(),
    browser.render(),
    room.render(),
    reel.render(),
    sec(`${sectionHead('capabilities-start')}<div class="cards4" data-stagger>${D.about.lifecycle.map((l, i) => tile(l.title, l.text, '0' + (i + 1))).join('')}</div>`, 'section--sand'),
    cta('cta-capabilities'),
  ].join('\n');
  return page({
    title: pg.title,
    desc: pg.desc,
    path: '/capabilities',
    body,
    bodyClass: 'cp',
    styles: '<link rel="stylesheet" href="/assets/css/capabilities.css?v=__CAPCSSV__">',
    scripts: '<script src="/assets/js/capabilities.js?v=__CAPJSV__" defer></script>',
  });
}

module.exports = { capabilities };
