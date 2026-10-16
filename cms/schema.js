// Single source of truth for the editable content.
//   • `node build/cms.js`   turns this into .pages.yml (the editor forms in Pages CMS)
//   • `node build/validate.js` checks every content/*.json file against it before each build
// Field options: optional · max (hard limit) · soft (warning limit) · em (allow <em>) · link · slug · email · hint · summary
const { str, text, num, bool, image, video, select, obj, list, strs, hidden, slug, pair, file, collection } = require('./helpers');
const { editableSectionOrders } = require('./section-order');
const { testimonialPlacements } = require('./section-placement');

const pageMeta = (withHero = true) => [
  str('title', 'Search title (browser & results)', { soft: 70, hint: 'Used for the browser tab and search listings. Search engines may rewrite it. Aim for 70 characters or fewer.' }),
  text('desc', 'Search description', { soft: 165, hint: 'Suggested text for search listings; search engines may rewrite it. Aim for 165 characters or fewer.' }),
  ...(withHero ? [str('h1', 'On-page headline', { em: true, max: 140 }), text('lead', 'Opening paragraph under the headline', { max: 420 })] : []),
];
const pg = (name, label, withHero) => obj(name, label, pageMeta(withHero));
const pageText = (name, label, path) => file(name, `00 · Page text — ${label}`, path, [
  list('headings', 'Headings, eyebrows & leads', [
    slug('slug', 'Template key (leave unchanged)', { readonly: true, hint: 'Developer-managed link between this copy and the page design. You do not need to edit it.' }),
    str('eyebrow', 'Eyebrow', { optional: true, max: 80, soft: 50 }),
    text('title', 'Heading', { max: 160, soft: 85, em: true, hint: 'Keep <em> only on headings where that emphasis already appears.' }),
    text('lead', 'Lead paragraph', { optional: true, max: 420, soft: 260 }),
  ], { summary: '{title}' }),
  list('copy', 'Other marketing copy & CTA labels', [
    slug('slug', 'Template key (leave unchanged)', { hint: 'Developer-managed link between this copy and the page design. Leave it as is unless the website maintainer asks you to change it.' }),
    str('label', 'Editor label', { max: 100 }),
    text('text', 'Copy', { max: 1000, soft: 450 }),
  ], { summary: '{label}', optional: true }),
]);

const groups = [
  { name: 'start_here', label: 'Page titles, search & page copy', items: ['pages', 'page_text_home', 'page_text_about', 'page_text_why', 'page_text_approach', 'page_text_capabilities', 'page_text_sectors', 'page_text_engagements', 'page_text_insights', 'page_text_people', 'page_text_notfound'] },
  { name: 'page_sections', label: 'Page layout · approved section order', items: ['section_order', 'section_placement'] },
  { name: 'home_page', label: 'Homepage content', items: ['home_hero', 'home_stats', 'home_why', 'home_translation', 'home_evidence', 'home_convening', 'home_testimonials', 'home_partners'] },
  { name: 'contact', label: 'Contact page & FAQs', items: ['page_text_contact', 'home_faq'] },
  { name: 'capabilities', label: 'Capabilities, assignments & proof', items: ['capabilities', 'capproof_hero', 'capproof_led', 'capproof_method', 'capproof_rows', 'capproof_browser', 'capproof_room', 'capproof_reel', 'proof', 'field_media'] },
  { name: 'sectors', label: 'Sectors & sector pages', items: ['sectors', 'sector_pages'] },
  { name: 'work_insights', label: 'Engagements & insights', items: ['engagements', 'insights'] },
  { name: 'people', label: 'People & founder profiles', items: ['people', 'founder'] },
  { name: 'about_approach', label: 'About IP3 & approach', items: ['about', 'why', 'approach_problem', 'approach_pathway', 'approach_standards', 'approach_orbit', 'approach_toolkit', 'approach_outcomes'] },
  { name: 'site_settings', label: 'Website settings · contact & navigation', items: ['site', 'navigation'] },
  { name: 'legal', label: 'Legal pages · review before edits', items: ['legal'] },
];

module.exports = {
  groups,
  media: [
    { name: 'images', label: 'Photos', input: 'assets/img', output: '/assets/img', extensions: ['webp', 'jpg', 'jpeg', 'png'] },
    { name: 'videos', label: 'Videos', input: 'assets/video', output: '/assets/video', extensions: ['mp4', 'webm'] },
  ],
  content: [
    file('section_placement', '00 · Reusable sections — Testimonials pilot', 'content/section-placement.json', [
      select('homeTestimonials', 'Home — Testimonials location', Object.keys(testimonialPlacements), {
        hint: 'Choose one approved location. The same testimonial records move there once; edit their text in Home page → Testimonials. After engagements and before founder follow those sections wherever the Home section order places them. Save on the content branch and review the preview before publishing.',
      }),
    ]),
    file('section_order', '00 · Page section order', 'content/section-order.json', Object.entries(editableSectionOrders).map(([key, spec]) =>
      select(key, spec.fieldLabel, spec.default, { list: true, hint: spec.hint })
    )),
    file('site', '00 · Website settings — contact & office details', 'content/site.json', [
      str('url', 'Canonical website URL', { link: true, hint: 'Set this to the public production site origin. SITE_URL overrides it during a Vercel build.' }),
      str('email', 'Email address', { email: true }),
      str('phone', 'Phone number shown on the site', { hint: 'Use the display format you want visitors to see, e.g. +880 1914 011 329.' }),
      strs('address', 'Address lines', { hint: 'One line per entry.' }),
      str('streetAddress', 'Structured street address'),
      str('addressLocality', 'Address locality'), str('postalCode', 'Postal code'), str('countryCode', 'Country code'),
      str('hours', 'Office hours'),
      str('mapUrl', 'Office map link', { link: true, hint: 'The destination opened by the contact page map button. Use a complete HTTPS link.' }),
      str('officeLabel', 'Office label'), str('emailLabel', 'Email label'), str('phoneLabel', 'Phone label'), str('hoursLabel', 'Hours label'),
    ]),
    file('navigation', '00 · Website settings — header, navigation & footer', 'content/navigation.json', [
      list('primary', 'Header navigation links', [str('label', 'Text visitors see'), str('href', 'Page destination', { link: true, hint: 'Use a site route such as /about/ or a full HTTPS URL.' }), hidden], { summary: '{label}' }),
      list('breadcrumbs', 'Breadcrumb names and destinations', [str('label', 'Text visitors see'), str('href', 'Page destination', { link: true, hint: 'Use the page route, for example /about/.' })], { summary: '{label}' }),
      str('homeLabel', 'Home link text'), str('homeHref', 'Home link destination', { link: true, hint: 'Usually /.' }),
      str('contactLabel', 'Contact link text'), str('contactHref', 'Contact link destination', { link: true, hint: 'Usually /contact/.' }), str('headerCta', 'Header contact button text'),
      str('exploreTitle', 'Footer explore heading'), str('sectorsTitle', 'Footer sectors heading'), str('officeTitle', 'Footer office heading'),
      text('footerDescription', 'Footer firm description', { max: 300, soft: 180 }),
      str('exploreSectorLabel', 'Engagement sector link label', { max: 80 }),
      str('previousSectorLabel', 'Previous sector label', { max: 40 }),
      str('nextSectorLabel', 'Next sector label', { max: 40 }),
      str('horizontalScrollLabel', 'Horizontal scroller label', { max: 40 }),
      list('explore', 'Footer explore links', [str('label', 'Text visitors see'), str('href', 'Page destination', { link: true, hint: 'Use a site route or a full HTTPS URL.' })], { summary: '{label}' }),
      list('legal', 'Footer legal links', [str('label', 'Text visitors see'), str('href', 'Page destination', { link: true, hint: 'Use a site route or a full HTTPS URL. Legal destinations need owner review.' })], { summary: '{label}' }),
      str('legalNavLabel', 'Footer legal navigation label'),
      list('ctaPaths', 'Contact pathways', [str('label', 'Text visitors see'), text('description', 'Short explanation'), str('href', 'Destination', { link: true, hint: 'Use a site route, full HTTPS URL, mailto: address, or tel: number as appropriate.' })], { summary: '{label}' }),
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
    file('pages', '00 · Page titles, search descriptions & headlines', 'content/pages.json', [
      pg('home', 'Home', false), pg('about', 'About', true), pg('why', 'Why choose IP3', true), pg('approach', 'Approach', true), pg('capabilities', 'Capabilities', true),
      pg('sectors', 'Sectors', true), pg('engagements', 'Engagements', true), pg('insights', 'Insights', true),
      pg('people', 'People', true), pg('contact', 'Contact', true), pg('privacy', 'Privacy', false), pg('terms', 'Terms', false),
    ]),

    file('home_hero', '01 · Home — hero headlines, slides & media', 'content/home/hero.json', [
      strs('reassurance', 'Words in the scrolling ticker', { hint: 'Short phrases shown in the moving line above the hero. Keep the existing number and order unless asked.' }),
      list('slides', 'Homepage slides (display order)', [
        hidden,
        str('tab', 'Slide selector text', { max: 40, hint: 'The short label visitors use to select this slide.' }),
        obj('video', 'Slide background media', [video('src', 'Video file (MP4 or WebM)'), image('poster', 'Fallback poster image', { hint: 'Shown while the video loads or cannot play. Keep this image when replacing the video.' })]),
        str('eyebrow', 'Small line above the headline', { max: 90 }),
        str('h1', 'Headline shown on the slide', { em: true, max: 120, hint: 'Keep any existing <em> emphasis in place; it controls the current headline styling.' }),
        text('sub', 'Supporting text under the headline', { max: 300 }),
        list('cta', 'Call-to-action buttons', [str('label', 'Button text', { max: 40 }), str('href', 'Button destination', { link: true, hint: 'Use a site route or a full HTTPS URL.' }), bool('ghost', 'Outline button style', { optional: true })], { summary: '{label}' }),
      ], { summary: '{tab}' }),
    ]),
    file('home_stats', '03 · Home — Numbers', 'content/home/stats.json', [
      list('items', 'Numbers', [hidden, num('n', 'Number'), str('suffix', 'Suffix', { optional: true, hint: 'e.g. + or %' }), str('label', 'Label')], { summary: '{n}{suffix} {label}' }),
    ]),
    file('home_why', '04 · Home — Why IP3', 'content/home/why-ip3.json', [
      image('photo', 'Photo beside the reasons', { hint: 'Shown on a floating phone. A photo with a transparent background works best.' }),
      str('photoAlt', 'Photo description (alt text)', { max: 200 }),
      list('items', 'Reasons', [str('n', 'Number'), str('title', 'Title'), text('text', 'Text'), str('href', 'Link', { link: true }), str('cta', 'Link label')], { summary: '{title}' }),
    ]),
    file('home_translation', '05 · Home — Translation, not theory (delivery chain)', 'content/home/translation.json', [
      str('eyebrow', 'Small label'), str('h2', 'Heading', { em: true }), text('body', 'Introduction', { max: 420 }),
      str('closing', 'Closing line', { em: true, max: 140 }),
      text('bridge', 'Line linking the heading to the six stages', { max: 200 }),
      text('attribution', 'Note above the assignment cards', { max: 320, hint: 'Where the founder is named: the assignments were led or supported by IP3’s founder and expert team.' }),
      obj('labels', 'Labels', [
        str('chain', 'Stage selector name (screen readers)', { max: 80 }),
        str('proven', 'Line linking a stage to its assignments', { max: 60, hint: 'Write {count} for the number of assignments.' }),
        str('seeAll', 'Button that jumps to the assignments', { max: 40 }),
        str('deliverables', 'Deliverables heading', { max: 40 }),
        str('impact', 'Impact label', { max: 30 }), str('activity', 'Recorded activity label', { max: 40 }),
        str('all', 'Link to every assignment', { max: 60 }), str('allAssignments', 'Label of the show-all choice', { max: 30 }),
        str('count', 'Word after the number of assignments', { max: 30 }), str('filterLabel', 'Filter name (screen readers)', { max: 80 }),
        str('viewLabel', 'View switch name (screen readers)', { max: 30 }), str('carouselLabel', 'Carousel', { max: 20 }), str('gridLabel', 'Grid', { max: 20 }),
        str('role', 'Role label', { max: 20 }), str('period', 'Period label', { max: 20 }),
      ]),
      list('phases', 'Phases (in order)', [
        str('title', 'Phase name', { max: 60 }),
        str('tag', 'Small category on the tile', { optional: true, max: 30 }),
        text('quote', 'One line shown on the stage tile', { max: 220 }),
        text('body', 'Description shown when the stage is chosen', { max: 260 }),
        list('deliverables', 'Tangible deliverables', [
          str('group', 'Deliverable group', { optional: true, max: 60, hint: 'The service group these belong to; leave blank for none.' }),
          strs('items', 'Deliverables'),
        ], { summary: '{group}' }),
        list('evidence', 'Evidence — documented assignments', [
          str('record', 'Assignment slug', { ref: 'proof', hint: 'The slug of a record in “11 · Proof — documented assignments”.' }),
          text('activity', 'Recorded activity (copied exactly)', { optional: true, max: 400, hint: 'Optional. Paste one line from that record’s “Recorded activities”, unchanged; the build stops if it does not match. Leave empty to show the record’s summary instead.' }),
          image('image', 'Photo for the card', { optional: true, hint: 'Used only when the assignment has no photo of its own. Pick a library image that fits the sector; it is shown as an indicative image, not as documentation.' }),
        ], { summary: '{record}' }),
      ], { summary: '{title}' }),
    ]),
    file('home_evidence', '05b · Home — Engagements & insights (labels)', 'content/home/evidence.json', [
      obj('labels', 'Labels', [
        str('filter', 'Filter name (screen readers)', { max: 60 }), str('all', 'Show-all choice', { max: 20 }),
        str('engagements', 'Engagements choice', { max: 30 }), str('insights', 'Insights choice', { max: 30 }), str('publications', 'Publications choice', { max: 30 }),
        str('count', 'Word after the number of items', { max: 20 }), str('view', 'View switch name (screen readers)', { max: 20 }),
        str('carousel', 'Carousel', { max: 20 }), str('grid', 'Grid', { max: 20 }),
        str('openEngagement', 'Engagement link text', { max: 40 }), str('openInsight', 'Insight link text', { max: 40 }), str('openPublication', 'Publication link text', { max: 40 }),
        str('by', 'Word before authors', { max: 20 }),
      ]),
      obj('links', 'Links', [
        str('engagements', 'Where “All engagements” goes', { link: true }), str('insights', 'Where “All insights” goes', { link: true }),
      ]),
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
    file('home_faq', '09 · Contact — questions & answers', 'content/home/faq.json', [
      list('items', 'Contact page questions and answers', [hidden, str('q', 'Question shown on the page'), text('a', 'Answer shown when opened')], { summary: '{q}' }),
    ]),

    file('capabilities', '10 · Capabilities', 'content/capabilities.json', [
      str('eyebrow', 'Small label'), str('h2', 'Heading', { em: true }),
      list('cards', 'Capabilities', [
        slug(), str('title', 'Title'), str('short', 'Short name'), text('problem', 'The problem a client brings'), strs('deliverables', 'Typical deliverables'),
        str('descriptor', 'Plain-language line under the title', { max: 140, hint: 'The words a buyer would search for, e.g. Policy studies, economic appraisal, regulatory reform and sector strategies.' }),
        str('task', 'Often commissioned to', { max: 120 }),
        image('image', 'Home card photo', { optional: true, hint: 'Shown at the top of the Home capability card. Use a landscape photo of the work.' }),
        str('ctaLabel', 'Button under the row', { max: 60 }),
        text('intro', 'What this capability covers', { max: 600, soft: 420 }),
        list('groups', 'What it includes (opens under the row)', [
          str('title', 'Area title', { max: 80 }), text('text', 'Short description', { optional: true, max: 300 }), strs('points', 'Points'),
        ], { summary: '{title}' }),
        strs('engagements', 'Related engagements', { optional: true, hint: 'Engagement slugs from the Engagements list.', ref: 'engagements' }),
      ], { summary: '{title}' }),
    ]),
    ...require('./capability-proof'),
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
    require('./sector-pages'),
    file('engagements', '12 · Engagements — projects & assignments', 'content/engagements.json', [
      list('items', 'Project and assignment records', [
        hidden, slug('slug', 'Record key (leave unchanged)', { hint: 'Developer-managed link used by the website. Do not change a published key; ask the site maintainer if a change is required.' }), str('client', 'Client or commissioning organization'), str('year', 'Year or period'), str('sector', 'Sector name shown to visitors'),
        str('sectorSlug', 'Linked sector key', { hint: 'Must exactly match an existing sector key. Leave unchanged unless correcting a verified link.', ref: 'sectors' }),
        str('title', 'Project or assignment title'), text('summary', 'Short project description'), strs('tags', 'Topic tags'), image('image', 'Project image', { hint: 'Select an approved image from Photos. If the hosted editor offers upload, use only supported images. Do not remove a file used elsewhere.' }),
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
    file('people', '14 · People — teams & profiles', 'content/people.json', [
      list('groups', 'Profile groups', [
        str('group', 'Group name'),
        list('members', 'Profiles in this group', [
          hidden, slug('slug', 'Profile anchor (leave unchanged)', { hint: 'Developer-managed link used in profile addresses and publication credits. Do not change it when editing a profile.' }),
          str('name', 'Name'), str('role', 'Role'), text('focus', 'Focus areas', { optional: true }),
          image('photo', 'Profile photograph', { optional: true, hint: 'Select an approved image from Photos. If the hosted editor offers upload, use only supported images. A square or portrait crop around 480 px wide works well. Leave empty to show initials.' }),
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
