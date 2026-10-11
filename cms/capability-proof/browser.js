const { str, text, obj, file } = require('../helpers');

module.exports = file('capproof_browser', '10 · Capabilities page — Assignment browser', 'content/capability-proof/browser.json', [
  str('eyebrow', 'Eyebrow', { max: 80 }),
  str('title', 'Heading', { em: true, max: 140 }),
  text('lead', 'Intro', { max: 520 }),
  text('note', 'Note under the browser', { max: 420 }),
  str('countLabel', 'Count label', { max: 30 }),
  str('filterLabel', 'Filter group label', { max: 60 }),
  str('allLabel', 'All filter', { max: 20 }),
  str('prevLabel', 'Previous', { max: 30 }), str('nextLabel', 'Next', { max: 30 }),
  str('openLabel', 'Open a record', { max: 40 }), str('closeLabel', 'Close a record', { max: 30 }),
  str('currentLabel', 'Current status', { max: 20 }), str('deliveredLabel', 'Delivered status', { max: 20 }),
  str('withheldLabel', 'Dates withheld note', { max: 100 }),
  str('clientLabel', 'Client label', { max: 30 }), str('roleLabel', 'Role label', { max: 30 }), str('periodLabel', 'Period label', { max: 30 }),
  str('referenceLabel', 'Reference label', { max: 30 }), str('locationLabel', 'Geography label', { max: 30 }),
  str('scopeLabel', 'Scope-figure label', { max: 60 }), str('activitiesLabel', 'Activities label', { max: 40 }),
  str('methodsLabel', 'Methods label', { max: 40 }), str('pillarsLabel', 'Pillars label', { max: 60 }),
  str('capsLabel', 'Capabilities label', { max: 40 }), str('engagementLabel', 'IP3 engagement label', { max: 60 }),
  str('sourceLabel', 'Source label', { max: 30 }),
  obj('pillarNames', 'The four pillars', [str('e', 'E', { max: 24 }), str('d', 'D', { max: 24 }), str('t', 'T', { max: 24 }), str('r', 'R', { max: 24 })]),
  obj('pillarLevels', 'Pillar levels', [str('f', 'Full', { max: 30 }), str('h', 'Partial', { max: 30 }), str('n', 'None', { max: 30 })]),
  obj('clientTypes', 'Client types', [
    str('multilateral', 'Multilateral', { max: 40 }), str('government', 'Government', { max: 40 }), str('bilateral', 'Bilateral', { max: 40 }),
    str('foundation', 'Foundation', { max: 40 }), str('private', 'Private', { max: 40 }), str('research', 'Research', { max: 40 }),
  ]),
  str('indexTitle', 'List-view heading', { max: 80 }),
  str('ctaLabel', 'Closing button', { max: 60 }), str('ctaHref', 'Closing button link', { link: true }),
]);
