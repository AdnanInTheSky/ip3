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
const pageText = (name, label, path) => file(name, `00 · Page text — ${label}`, path, [
  list('headings', 'Headings, eyebrows & leads', [
    slug('slug', 'Template key', { hint: 'Internal template key. Do not change unless a developer asks.' }),
    str('eyebrow', 'Eyebrow', { optional: true, max: 80, soft: 50 }),
    text('title', 'Heading', { max: 160, soft: 85, em: true, hint: 'Keep <em> only on headings where that emphasis already appears.' }),
    text('lead', 'Lead paragraph', { optional: true, max: 420, soft: 260 }),
  ], { summary: '{slug}' }),
  list('copy', 'Other marketing copy & CTA labels', [
    slug('slug', 'Template key', { hint: 'Internal template key. Do not change unless a developer asks.' }),
    str('label', 'Editor label', { max: 100 }),
    text('text', 'Copy', { max: 1000, soft: 450 }),
  ], { summary: '{label}', optional: true }),
]);

module.exports = {
  media: [
    { name: 'images', label: 'Photos', input: 'assets/img', output: '/assets/img', extensions: ['webp', 'jpg', 'jpeg', 'png'] },
    { name: 'videos', label: 'Videos', input: 'assets/video', output: '/assets/video', extensions: ['mp4', 'webm'] },
  ],
  content: [
    file('site', '00 · Contact details', 'content/site.json', [
      str('url', 'Canonical website URL', { link: true, hint: 'Set this to the public production site origin. SITE_URL overrides it during a Vercel build.' }),
      str('email', 'Email address', { email: true }),
      str('phone', 'Phone number', { hint: 'Written as you want it shown, e.g. +880 1914 011 329.' }),
      strs('address', 'Address lines', { hint: 'One line per entry.' }),
      str('streetAddress', 'Structured street address'),
      str('addressLocality', 'Address locality'), str('postalCode', 'Postal code'), str('countryCode', 'Country code'),
      str('hours', 'Office hours'),
      str('mapUrl', 'Map link', { link: true, hint: 'The link opened by the contact page map button.' }),
      str('officeLabel', 'Office label'), str('emailLabel', 'Email label'), str('phoneLabel', 'Phone label'), str('hoursLabel', 'Hours label'),
    ]),
    file('navigation', '00 · Navigation & footer links', 'content/navigation.json', [
      list('primary', 'Primary navigation links', [str('label', 'Label'), str('href', 'Link', { link: true }), hidden], { summary: '{label}' }),
      list('breadcrumbs', 'Breadcrumb labels', [str('label', 'Label'), str('href', 'Page route', { link: true })], { summary: '{label}' }),
      str('homeLabel', 'Home link label'), str('homeHref', 'Home link destination', { link: true }),
      str('contactLabel', 'Contact link label'), str('contactHref', 'Contact link destination', { link: true }), str('headerCta', 'Header contact button'),
      str('exploreTitle', 'Footer explore heading'), str('sectorsTitle', 'Footer sectors heading'), str('officeTitle', 'Footer office heading'),
      text('footerDescription', 'Footer firm description', { max: 300, soft: 180 }),
      str('exploreSectorLabel', 'Engagement sector link label', { max: 80 }),
      str('previousSectorLabel', 'Previous sector label', { max: 40 }),
      str('nextSectorLabel', 'Next sector label', { max: 40 }),
      str('horizontalScrollLabel', 'Horizontal scroller label', { max: 40 }),
      list('explore', 'Footer explore links', [str('label', 'Label'), str('href', 'Link', { link: true })], { summary: '{label}' }),
      list('legal', 'Footer legal links', [str('label', 'Label'), str('href', 'Link', { link: true })], { summary: '{label}' }),
      str('legalNavLabel', 'Footer legal navigation label'),
      list('ctaPaths', 'Contact pathways', [str('label', 'Label'), text('description', 'Description'), str('href', 'Link', { link: true })], { summary: '{label}' }),
      list('contactPathways', 'Contact page pathways', [str('label', 'Label'), text('description', 'Description')], { summary: '{label}' }),
    ]),
    pageText('page_text_home', 'Home', 'content/page-text/home.json'),
    pageText('page_text_about', 'About', 'content/page-text/about.json'),
    pageText('page_text_why', 'Why choose IP3', 'content/page-text/why.json'),
    pageText('page_text_approach', 'Approach', 'content/page-text/approach.json'),
    pageText('page_text_capabilities', 'Capabilities', 'content/page-text/capabilities.json'),
    pageText('page_text_sectors', 'Sectors', 'content/page-text/sectors.json'),
    pageText('page_text_engagements', 'Engagements', 'content/page-text/engagements.json'),
    pageText('page_text_insights', 'Insights', 'content/page-text/insights.json'),
    pageText('page_text_people', 'People', 'content/page-text/people.json'),
    pageText('page_text_contact', 'Contact', 'content/page-text/contact.json'),
    pageText('page_text_notfound', '404', 'content/page-text/notfound.json'),
    file('legal', '00 · Privacy & terms', 'content/legal.json', [
      obj('privacy', 'Privacy policy', [
        str('title', 'Page title', { hint: 'Needs legal review.' }), text('lead', 'Intro paragraph', { hint: 'Needs legal review.' }),
        str('updated', 'Last updated date', { optional: true, hint: 'Needs legal review. Leave blank until counsel confirms a date.' }),
        list('sections', 'Policy sections', [
          str('heading', 'Section heading', { hint: 'Needs legal review.' }), strs('paragraphs', 'Paragraphs', { hint: 'Needs legal review.' }),
        ], { summary: '{heading}' }),
      ]),
      obj('terms', 'Terms of use', [
        str('title', 'Page title', { hint: 'Needs legal review.' }), text('lead', 'Intro paragraph', { hint: 'Needs legal review.' }),
        str('updated', 'Last updated date', { optional: true, hint: 'Needs legal review. Leave blank until counsel confirms a date.' }),
        list('sections', 'Terms sections', [
          str('heading', 'Section heading', { hint: 'Needs legal review.' }), strs('paragraphs', 'Paragraphs', { hint: 'Needs legal review.' }),
        ], { summary: '{heading}' }),
      ]),
    ]),
    file('pages', '00 · Page titles, descriptions & headlines', 'content/pages.json', [
      pg('home', 'Home', false), pg('about', 'About', true), pg('why', 'Why choose IP3', true), pg('approach', 'Approach', true), pg('capabilities', 'Capabilities', true),
      pg('sectors', 'Sectors', true), pg('engagements', 'Engagements', true), pg('insights', 'Insights', true),
      pg('people', 'People', true), pg('contact', 'Contact', true), pg('privacy', 'Privacy', false), pg('terms', 'Terms', false),
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
    file('sectors', '11 · Sectors (drag to reorder)', 'content/sectors.json', [
      list('items', 'Sectors — drag to set display order', [
      hidden, slug(),
      str('title', 'Sector name'), text('problem', 'The problem we solve'),
      strs('areas', 'Focus areas'),
      strs('caps', 'Capabilities applied', { hint: 'Capability URL slugs, e.g. policy-economics-strategy.', ref: 'capabilities' }),
      video('video', 'Page header video', { optional: true, hint: 'Leave empty to use the photo instead.' }),
      image('poster', 'Poster for the video', { optional: true }),
      image('image', 'Page header photo', { optional: true, hint: 'Used when there is no video.' }),
      image('card', 'Card image (home & sector list)'),
      image('photo', 'Inline photo'),
      strs('engagements', 'Related engagements', { optional: true, hint: 'Engagement slugs from the Engagements list.', ref: 'engagements' }),
      ], { summary: '{title}' }),
    ]),
    file('engagements', '12 · Engagements', 'content/engagements.json', [
      list('items', 'Engagements', [
        hidden, slug(), str('client', 'Client'), str('year', 'Year'), str('sector', 'Sector name'),
        str('sectorSlug', 'Sector slug', { hint: 'Must match a sector slug.', ref: 'sectors' }),
        str('title', 'Title'), text('summary', 'Summary'), strs('tags', 'Tags'), image('image', 'Image'),
      ], { summary: '{client} — {title}' }),
    ]),
    file('insights', '13 · Insights', 'content/insights.json', [
      list('items', 'Articles', [hidden, str('type', 'Type'), str('title', 'Title'), text('text', 'Summary'), strs('tags', 'Tags'), image('image', 'Image')], { summary: '{title}' }),
      list('fieldStories', 'Field video stories', [
        slug(), str('type', 'Category'), str('title', 'Story headline'), video('video', 'Video'), image('poster', 'Poster image'),
      ], { summary: '{title}' }),
      list('publications', 'Publications (newest first)', [
        hidden,
        select('kind', 'Type', ['Report', 'Journal article', 'Book chapter', 'Policy brief', 'Commentary']),
        num('year', 'Year'),
        str('title', 'Title', { max: 220 }),
        str('authors', 'Credit as published', { max: 300, hint: 'Name the authors as the publication credits them. If IP3 contributed to a report written by others, say so here.' }),
        str('publisher', 'Publisher', { max: 200 }),
        str('href', 'Link to the publisher’s copy', { optional: true, link: true, hint: 'Leave empty to list the publication without a link.' }),
        text('summary', 'One-sentence summary', { max: 300 }),
        strs('people', 'IP3 people credited', { optional: true, ref: 'people', hint: 'Person slugs from the People list, e.g. mohammad-syful-hoque.' }),
      ], { summary: '{year} — {title}', optional: true }),
    ]),
    file('people', '14 · People', 'content/people.json', [
      list('groups', 'Groups', [
        str('group', 'Group name'),
        list('members', 'People', [
          hidden, slug('slug', 'Profile anchor', { hint: 'Lower-case words joined by hyphens. Used for /people#anchor links and publication credits — set once.' }),
          str('name', 'Name'), str('role', 'Role'), text('focus', 'Focus areas', { optional: true }),
          image('photo', 'Portrait', { optional: true, hint: 'Square or portrait crop, about 480 px wide. Leave empty to show initials.' }),
          str('affiliation', 'Current post outside IP3', { optional: true, max: 160 }),
          strs('bio', 'Profile paragraphs', { optional: true }),
          strs('education', 'Degrees, most recent first', { optional: true }),
        ], { summary: '{name}' }),
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
    file('why', '17 · Why choose IP3 (3D journey page)', 'content/why.json', [
      obj('hero', 'Opening screen (headline and intro are under Page titles → Why choose IP3)', [
        text('audience', 'Who we work for', { max: 420 }),
        obj('primary', 'Main button', [str('label', 'Label', { max: 40 }), str('href', 'Link', { link: true })]),
        obj('secondary', 'Second button', [str('label', 'Label', { max: 40 }), str('href', 'Link', { link: true })]),
      ]),
      list('scenes', 'Story scenes — keep all six, in this order', [
        slug('slug', 'Scene key', { hint: 'Fixed: complexity, evidence, insight, policy, practice, impact. The 3D camera is set for this order.' }),
        str('rail', 'Short name in the scene rail', { max: 24 }), str('title', 'Scene heading', { max: 120 }),
        strs('body', 'Paragraphs'),
      ], { summary: '{rail}' }),
      list('systems', 'Complexity — systems drawn as 3D layers (up to six)', [
        slug('slug', 'System key', { hint: 'Used by "Related systems". Lower-case, set once.' }),
        str('name', 'Name', { max: 24 }), text('note', 'What it is tied to and why', { max: 220 }),
        strs('relates', 'Related systems', { hint: 'System keys from this list, e.g. economy. Each one draws a link in the 3D scene.' }),
      ], { summary: '{name}' }),
      str('tiedTo', 'Label before related systems', { max: 30 }),
      list('evidence', 'Evidence — layers in the 3D stack (up to six)', [
        slug('slug', 'Layer key'), str('name', 'Name', { max: 40 }), text('text', 'Description', { max: 200 }),
      ], { summary: '{name}' }),
      obj('charts', 'Insight — the two method diagrams', [
        str('impactTitle', 'First diagram title', { max: 40 }), text('impactCaption', 'First diagram caption', { max: 320 }),
        str('costTitle', 'Second diagram title', { max: 40 }), text('costCaption', 'Second diagram caption', { max: 320 }),
        str('note', 'Note under both diagrams', { max: 120 }),
      ]),
      text('policyExample', 'Policy — worked example line', { max: 200 }),
      list('policySteps', 'Policy — steps from findings to a decision', [
        str('title', 'Step', { max: 40 }), text('text', 'Text', { max: 220 }), strs('choices', 'Options shown as chips', { optional: true }),
      ], { summary: '{title}' }),
      list('practiceStages', 'Practice — how a decision reaches people', [str('title', 'Stage', { max: 40 }), text('text', 'Text', { max: 220 })], { summary: '{title}' }),
      strs('siteLabels', 'Practice — labels on the 3D buildings', { hint: 'Four labels, in order: the large institution, then three services.' }),
      list('impactOutcomes', 'Impact — outcomes', [
        str('title', 'Outcome', { max: 60 }), text('change', 'What changes', { max: 220 }), text('shown', 'How it can be shown', { max: 220 }),
      ], { summary: '{title}' }),
      str('shownLabel', 'Impact — label before "how it can be shown"', { max: 40 }),
      list('impactCtas', 'Impact — buttons', [str('label', 'Label', { max: 40 }), str('href', 'Link', { link: true }), bool('ghost', 'Outline style', { optional: true })], { summary: '{label}' }),
      str('bridgeWord', 'Giant word between the story and the film', { max: 24 }),
      obj('film', 'Brand film', [
        str('kicker', 'Small label', { max: 40 }), str('heading', 'Heading', { max: 90 }), text('lead', 'Introduction', { max: 300 }),
        video('video', 'Film (MP4)'), image('poster', 'Poster image'),
        text('label', 'Film description for screen readers', { max: 300 }),
      ]),
      obj('terminal', 'Policy Intelligence Terminal', [
        str('kicker', 'Small label', { max: 40 }), str('heading', 'Heading', { max: 80 }), text('lead', 'Introduction', { max: 360 }),
        list('beats', 'Walkthrough steps', [
          str('title', 'Title', { max: 80 }), text('text', 'Text', { max: 500 }), strs('points', 'Points'),
          image('image', 'Screenshot'), str('caption', 'Caption', { max: 90 }),
        ], { summary: '{title}' }),
        strs('pipeline', 'Pipeline steps'),
        obj('cta', 'Button', [str('label', 'Label', { max: 40 }), str('href', 'Link', { link: true })]),
      ]),
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
