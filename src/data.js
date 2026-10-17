// Site content for the templates. The words, links and media paths live in content/*.json
// (edited through the CMS — see .pages.yml and cms/schema.js); this file only assembles them.
const C = require('./content');

const live = (list) => list.filter((x) => !x.hidden);

const hero = C.file('home/hero');
const engagements = live(C.file('engagements').items);
const insightContent = C.file('insights');
const articles = require('../cms/articles').publishedArticles(C.dir('articles'));
const pageNames = ['home', 'about', 'why', 'approach', 'capabilities', 'sectors', 'engagements', 'insights', 'people', 'contact', 'notfound'];
const pageText = Object.fromEntries(pageNames.map((name) => [name, C.file(`page-text/${name}`)]));
const headings = Object.fromEntries(Object.values(pageText).flatMap((page) => page.headings.map((item) => [item.slug, item])));
const copy = Object.fromEntries(Object.entries(pageText).map(([name, page]) => [name, Object.fromEntries(page.copy.map((item) => [item.slug, item.text]))]));

module.exports = {
  pages: C.file('pages'),
  sectionOrder: C.file('section-order'),
  sectionPlacement: C.file('section-placement'),
  navigation: C.file('navigation'),
  headings,
  pageText: copy,
  legal: C.file('legal'),
  hero: live(hero.slides),
  reassurance: hero.reassurance,
  stats: live(C.file('home/stats').items),
  capabilities: C.file('capabilities'),
  proof: live(C.file('proof').items),
  fieldMedia: (() => { const m = C.file('field-media'); return { photos: live(m.photos), videos: live(m.videos) }; })(),
  capProof: Object.fromEntries(['hero', 'led', 'method', 'rows', 'browser', 'room', 'reel'].map((k) => [k, C.file(`capability-proof/${k}`)])),
  whyIp3: C.file('home/why-ip3').items,
  whyPhoto: (() => { const w = C.file('home/why-ip3'); return { image: w.photo, alt: w.photoAlt }; })(),
  sectors: live(C.file('sectors').items),
  sectorPages: Object.fromEntries(C.dir('sector-pages').map((p) => [p.slug, p])),
  translation: C.file('home/translation'),
  engagements,
  insights: live(insightContent.items),
  articles,
  fieldStories: insightContent.fieldStories,
  publications: live(insightContent.publications || []),
  evidence: C.file('home/evidence'),
  convening: C.file('home/convening'),
  partners: C.file('home/partners'),
  testimonials: live(C.file('home/testimonials').items),
  founder: C.file('founder'),
  people: C.file('people').groups.map((group) => ({ ...group, members: live(group.members) })),
  about: C.file('about'),
  why: C.file('why'),
  faq: live(C.file('home/faq').items),
  approach: {
    problem: C.file('approach/problem-first'),
    pathway: C.file('approach/pathway'),
    standards: C.file('approach/standards'),
    orbit: C.file('approach/orbit'),
    toolkit: C.file('approach/toolkit'),
    outcomes: C.file('approach/outcomes'),
  },
};
