// Single source of truth for the editable content.
//   • `node build/cms.js`   turns this into .pages.yml (the editor forms in Pages CMS)
//   • `node build/validate.js` checks every content/*.json file against it before each build
// Field options: optional · max (hard limit) · soft (warning limit) · em (allow <em>) · link · slug · email · hint · summary
const T = (type) => (name, label, o = {}) => ({ name, label, type, ...o });
const str = T('string');
const text = T('text');
const num = T('number');
const bool = T('boolean');
const image = T('image');
const video = T('video');
const select = (name, label, values, o = {}) => ({ name, label, type: 'select', values, ...o });
const obj = (name, label, fields, o = {}) => ({ name, label, type: 'object', fields, ...o });
const list = (name, label, fields, o = {}) => ({ name, label, type: 'object', list: true, fields, ...o });
const strs = (name, label, o = {}) => ({ name, label, type: 'string', list: true, ...o });
const hidden = bool('hidden', 'Hide this item', { optional: true, hint: 'Tick to take it off the website without deleting it.' });
const slug = (name = 'slug', label = 'URL slug', o = {}) => str(name, label, { slug: true, hint: 'Lower-case words joined by hyphens. Changing it changes the page address — set once.', ...o });
const pair = (name, label, o = {}) => list(name, label, [str('title', 'Title'), text('text', 'Text')], { summary: '{title}', ...o });

const file = (name, label, path, fields) => ({ name, label, type: 'file', path, fields });
const collection = (name, label, path, fields, view) => ({ name, label, type: 'collection', path, fields, view });

const pageMeta = (withHero = true) => [
  str('title', 'Search-result title', { soft: 70, hint: 'Shown in the browser tab and Google. Aim for 70 characters or fewer.' }),
  text('desc', 'Search-result description', { soft: 165, hint: 'Shown under the title in Google. Aim for 165 characters or fewer.' }),
  ...(withHero ? [str('h1', 'Page headline', { em: true, max: 140 }), text('lead', 'Intro paragraph under the headline', { max: 420 })] : []),
];
const pg = (name, label, withHero) => obj(name, label, pageMeta(withHero));

module.exports = {
  media: [
    { name: 'images', label: 'Photos', input: 'assets/img', output: '/assets/img', extensions: ['webp', 'jpg', 'jpeg', 'png'] },
    { name: 'videos', label: 'Videos', input: 'assets/video', output: '/assets/video', extensions: ['mp4', 'webm'] },
  ],
  content: [
    file('site', '00 · Contact details', 'content/site.json', [
      str('email', 'Email address', { email: true }),
      str('phone', 'Phone number', { hint: 'Written as you want it shown, e.g. +880 1914 011 329.' }),
      strs('address', 'Address lines', { hint: 'One line per entry.' }),
      str('hours', 'Office hours'),
    ]),
    file('pages', '00 · Page titles, descriptions & headlines', 'content/pages.json', [
      pg('home', 'Home', false), pg('about', 'About', true), pg('approach', 'Approach', true), pg('capabilities', 'Capabilities', true),
      pg('sectors', 'Sectors', true), pg('engagements', 'Engagements', true), pg('insights', 'Insights', true),
      pg('people', 'People', true), pg('contact', 'Contact', true),
    ]),

    file('home_hero', '01 · Home — Hero slider', 'content/home/hero.json', [
      strs('reassurance', 'Scrolling ticker words'),
      list('slides', 'Hero slides', [
        hidden,
        str('tab', 'Tab label', { max: 40 }),
        obj('video', 'Background video', [video('src', 'Video file'), image('poster', 'Poster image', { hint: 'Shown while the video loads and if it cannot play.' })]),
        str('eyebrow', 'Small line above the headline', { max: 90 }),
        str('h1', 'Headline', { em: true, max: 120 }),
        text('sub', 'Sub-headline', { max: 300 }),
        list('cta', 'Buttons', [str('label', 'Label', { max: 40 }), str('href', 'Link', { link: true }), bool('ghost', 'Outline style', { optional: true })], { summary: '{label}' }),
      ], { summary: '{tab}' }),
    ]),
    file('home_mandates', '02 · Home — Built for complex mandates', 'content/home/mandates.json', [
      str('eyebrow', 'Small label'), str('h2', 'Heading', { em: true }), text('body', 'Introduction'),
      pair('cards', 'Cards'),
    ]),
    file('home_stats', '03 · Home — Numbers', 'content/home/stats.json', [
      list('items', 'Numbers', [hidden, num('n', 'Number'), str('suffix', 'Suffix', { optional: true, hint: 'e.g. + or %' }), str('label', 'Label')], { summary: '{n}{suffix} {label}' }),
    ]),
    file('home_why', '04 · Home — Why IP3', 'content/home/why-ip3.json', [
      list('items', 'Reasons', [str('n', 'Number'), str('title', 'Title'), text('text', 'Text'), str('href', 'Link', { link: true }), str('cta', 'Link label')], { summary: '{title}' }),
    ]),
    file('home_translation', '05 · Home — Translation, not theory', 'content/home/translation.json', [
      str('eyebrow', 'Small label'), str('h2', 'Heading', { em: true }), text('sub', 'Introduction'),
      pair('nodes', 'Steps'),
      list('outputs', 'What clients receive', [str('title', 'Group'), strs('items', 'Items')], { summary: '{title}' }),
    ]),
    file('home_convening', '06 · Home — Convening', 'content/home/convening.json', [
      str('eyebrow', 'Small label'), str('h2', 'Heading', { em: true }), text('body', 'Introduction'),
      pair('items', 'Items'),
    ]),
    file('home_testimonials', '07 · Home — Testimonials', 'content/home/testimonials.json', [
      list('items', 'Testimonials', [hidden, text('quote', 'Quote'), str('name', 'Name'), str('role', 'Role & organisation')], { summary: '{name}' }),
    ]),
    file('home_partners', '08 · Clients & funders', 'content/home/partners.json', [
      strs('clients', 'Clients & partners'), strs('funders', 'Funders & development partners'),
    ]),
    file('home_faq', '09 · Contact — FAQ', 'content/home/faq.json', [
      list('items', 'Questions', [hidden, str('q', 'Question'), text('a', 'Answer')], { summary: '{q}' }),
    ]),

    file('capabilities', '10 · Capabilities', 'content/capabilities.json', [
      str('eyebrow', 'Small label'), str('h2', 'Heading', { em: true }),
      list('cards', 'Capabilities', [
        slug(), str('title', 'Title'), str('short', 'Short name'), text('problem', 'The problem a client brings'), strs('deliverables', 'Typical deliverables'),
      ], { summary: '{title}' }),
    ]),
    collection('sectors', '11 · Sectors (one file each)', 'content/sectors', [
      slug(), str('n', 'Order number', { hint: 'Two digits — 01, 02… Sectors are listed in this order.' }),
      str('title', 'Sector name'), text('problem', 'The problem we solve'),
      strs('areas', 'Focus areas'),
      strs('caps', 'Capabilities applied', { hint: 'Capability URL slugs, e.g. policy-economics-strategy.', ref: 'capabilities' }),
      video('video', 'Page header video', { optional: true, hint: 'Leave empty to use the photo instead.' }),
      image('poster', 'Poster for the video', { optional: true }),
      image('image', 'Page header photo', { optional: true, hint: 'Used when there is no video.' }),
      image('card', 'Card image (home & sector list)'),
      image('photo', 'Inline photo'),
      strs('engagements', 'Related engagements', { optional: true, hint: 'Engagement slugs from the Engagements list.', ref: 'engagements' }),
    ], { primary: 'title', sort: 'n', order: 'asc', fields: ['n', 'title'] }),
    file('engagements', '12 · Engagements', 'content/engagements.json', [
      list('items', 'Engagements', [
        hidden, slug(), str('client', 'Client'), str('year', 'Year'), str('sector', 'Sector name'),
        str('sectorSlug', 'Sector slug', { hint: 'Must match a sector slug.', ref: 'sectors' }),
        str('title', 'Title'), text('summary', 'Summary'), strs('tags', 'Tags'), image('image', 'Image'),
      ], { summary: '{client} — {title}' }),
    ]),
    file('insights', '13 · Insights', 'content/insights.json', [
      list('items', 'Articles', [hidden, str('type', 'Type'), str('title', 'Title'), text('text', 'Summary'), strs('tags', 'Tags'), image('image', 'Image')], { summary: '{title}' }),
    ]),
    file('people', '14 · People', 'content/people.json', [
      list('groups', 'Groups', [
        str('group', 'Group name'),
        list('members', 'People', [hidden, str('name', 'Name'), str('role', 'Role'), text('focus', 'Focus areas', { optional: true })], { summary: '{name}' }),
      ], { summary: '{group}' }),
    ]),
    file('founder', '15 · Founder profile', 'content/founder.json', [
      str('name', 'Name'), str('role', 'Role'), str('tag', 'Tagline'), image('image', 'Portrait'),
      strs('bio', 'Biography paragraphs'), text('quote', 'Quote'), strs('expertise', 'Areas of expertise'),
    ]),
    file('about', '16 · About', 'content/about.json', [
      strs('intro', 'Introduction paragraphs'),
      obj('vision', 'Vision', [str('label', 'Label'), str('title', 'Headline'), text('text', 'Text')]),
      obj('mission', 'Mission', [str('label', 'Label'), str('title', 'Headline'), text('text', 'Text')]),
      strs('aims', 'Aims'),
      obj('principles', 'Founding principles', [str('eyebrow', 'Small label'), str('h2', 'Heading', { em: true }), text('text', 'Text')]),
      pair('lifecycle', 'Lifecycle steps'), pair('pillars', 'Three areas'), pair('values', 'Values'), pair('different', 'What makes us different'),
    ]),

    file('approach_problem', '20 · Approach — Start with the problem', 'content/approach/problem-first.json', [
      str('subtitle', 'Small label'), text('paragraph', 'Introduction'),
      obj('currentState', 'Where clients are', [str('title', 'Title'), strs('items', 'Points')]),
      obj('desiredState', 'Where they want to be', [str('title', 'Title'), strs('items', 'Points')]),
      list('questionCards', 'Question cards', [str('title', 'Title', { hint: 'Begin with the two-digit number, e.g. "01 What is the decision?"' }), text('text', 'Text')], { summary: '{title}' }),
      obj('bigCard', 'Define the decision first', [str('title', 'Heading'), strs('items', 'Points')]),
    ]),
    file('approach_pathway', '21 · Approach — Six movements', 'content/approach/pathway.json', [
      str('subtitle', 'Small label'), str('title', 'Heading'), text('paragraph', 'Introduction'),
      list('cards', 'Movements', [
        str('title', 'Title'), text('text', 'Text'),
        strs('bullets', 'Bullets', { hint: 'Format: "Label — text". The part before the dash is shown in bold.' }),
        text('paragraph', 'Case-study example', { optional: true }),
      ], { summary: '{title}' }),
    ]),
    file('approach_standards', '22 · Approach — Six commitments', 'content/approach/standards.json', [
      str('subtitle', 'Small label'), text('paragraph', 'Introduction'), pair('cards', 'Commitments'),
    ]),
    file('approach_orbit', '23 · Approach — Learning orbit', 'content/approach/orbit.json', [
      str('subtitle', 'Small label'), text('paragraph', 'Introduction'),
      list('orbitItems', 'Orbit items', [str('label', 'Label'), str('shortLabel', 'Short label', { max: 6 }), text('description', 'Description')], { summary: '{label}' }),
      str('iterateText', 'Centre text'), strs('tags', 'Tags'), text('questionAnswer', 'Closing sentence'),
    ]),
    file('approach_toolkit', '24 · Approach — Toolkit', 'content/approach/toolkit.json', [
      str('subtitle', 'Small label'), text('paragraph', 'Introduction'), pair('cards', 'Cards'),
      obj('subsection', 'Combination section', [
        str('subtitle', 'Small label'), str('title', 'Heading'), text('description', 'Introduction'),
        str('leftTitle', 'Left column title'), strs('leftItems', 'Left column points'),
        str('rightTitle', 'Right column title'), strs('rightItems', 'Right column points'),
        str('togetherTitle', 'Together — title'), text('togetherDescription', 'Together — text'),
      ]),
    ]),
    file('approach_outcomes', '25 · Approach — Outcomes', 'content/approach/outcomes.json', [
      str('subtitle', 'Small label'), text('paragraph', 'Introduction'),
      list('cards', 'From → to', [str('text', 'From → to', { hint: 'Format: "Before → after".' })], { summary: '{text}' }),
      obj('subsection1', 'Why the approach is different', [str('title', 'Heading'), text('paragraph', 'Introduction'), pair('cards', 'Cards')]),
      obj('subsection2', 'Beyond the recommendation', [str('title', 'Heading'), text('paragraph', 'Introduction'), pair('cards', 'Cards')]),
    ]),
  ],
};
