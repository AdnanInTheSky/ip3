// Site content for the templates. The words, links and media paths live in content/*.json
// (edited through the CMS — see .pages.yml and cms/schema.js); this file only assembles them.
const C = require('./content');

const live = (list) => list.filter((x) => !x.hidden);

const hero = C.file('home/hero');
const engagements = live(C.file('engagements').items);
const insightContent = C.file('insights');
const pageNames = ['home', 'about', 'approach', 'capabilities', 'sectors', 'engagements', 'insights', 'people', 'contact', 'notfound'];
const pageText = Object.fromEntries(pageNames.map((name) => [name, C.file(`page-text/${name}`)]));
const headings = Object.fromEntries(Object.values(pageText).flatMap((page) => page.headings.map((item) => [item.slug, item])));
const copy = Object.fromEntries(Object.entries(pageText).map(([name, page]) => [name, Object.fromEntries(page.copy.map((item) => [item.slug, item.text]))]));

module.exports = {
  pages: C.file('pages'),
  navigation: C.file('navigation'),
  headings,
  pageText: copy,
  legal: C.file('legal'),
  hero: live(hero.slides),
  reassurance: hero.reassurance,
  mandates: C.file('home/mandates'),
  stats: live(C.file('home/stats').items),
  capabilities: C.file('capabilities'),
  whyIp3: C.file('home/why-ip3').items,
  sectors: live(C.file('sectors').items),
  translation: C.file('home/translation'),
  engagements,
  insights: live(insightContent.items),
  fieldStories: insightContent.fieldStories,
  convening: C.file('home/convening'),
  partners: C.file('home/partners'),
  testimonials: live(C.file('home/testimonials').items),
  founder: C.file('founder'),
  people: C.file('people').groups,
  about: C.file('about'),
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
