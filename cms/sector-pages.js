// One CMS file per sector page (content/sector-pages/<sector slug>.json): the long-form story under each /sectors/<slug> page.
// The sector's name, problem, focus areas, capabilities, header media and engagements stay in content/sectors.json.
// The words come from IP3's earlier service pages, mapped to sectors in docs/sectors/CONTENT-MAPPING.md.
const { str, text, image, video, select, obj, list, strs, hidden, collection } = require('./helpers');

const SCENES = ['terrain', 'ladder', 'coverage', 'stack', 'flow', 'chain', 'loop', 'lattice'];

module.exports = collection('sector_pages', '11 · Sector pages — long-form story (one file per sector)', 'content/sector-pages', [
  str('slug', 'Sector', { ref: 'sectors', hint: 'The sector this story belongs to (its slug in Sectors). Set once.' }),
  obj('statement', 'Opening statement (always readable)', [
    str('eyebrow', 'Eyebrow', { max: 60 }),
    text('title', 'Statement', { em: true, max: 200 }),
    strs('paragraphs', 'Paragraphs', { hint: 'Two or three short paragraphs read best.' }),
    list('principles', 'Principles (small tiles under the statement)', [str('title', 'Title', { max: 60 }), text('text', 'Text', { max: 160 })], { summary: '{title}', optional: true }),
  ]),
  obj('scene', 'Signature scroll scene (a drawing that changes step by step)', [
    select('type', 'Drawing', SCENES, { hint: 'Each sector has its own drawing; the steps below drive it. Keep five steps.' }),
    str('eyebrow', 'Eyebrow', { max: 60 }),
    text('title', 'Heading', { em: true, max: 160 }),
    text('lead', 'Intro', { optional: true, max: 420 }),
    obj('system', 'Policy, local systems and implementation layers', [
      str('framework', 'Policy frameworks', { max: 100 }),
      str('setting', 'Local systems', { max: 100 }),
      str('outcome', 'Implementation', { max: 100 }),
    ], { optional: true }),
    list('steps', 'Steps (five)', [
      str('label', 'Short label on the drawing and the step rail', { max: 18 }),
      str('title', 'Step heading', { max: 110 }),
      text('text', 'Text', { max: 600 }),
      strs('points', 'Points', { optional: true }),
    ], { summary: '{label} — {title}' }),
  ]),
  obj('practice', 'Practice index (expanding rows)', [
    str('eyebrow', 'Eyebrow', { max: 60 }),
    text('title', 'Heading', { em: true, max: 160 }),
    text('lead', 'Intro', { optional: true, max: 520 }),
    list('rows', 'Rows', [
      str('title', 'Title', { max: 90 }),
      text('text', 'Text', { optional: true, max: 600 }),
      strs('points', 'Points', { optional: true, hint: 'Optional "Label — text" format: the part before the dash is shown in bold.' }),
    ], { summary: '{title}' }),
  ], { optional: true }),
  obj('audiences', 'Who we serve', [
    str('eyebrow', 'Eyebrow', { max: 60 }),
    text('title', 'Heading', { em: true, max: 160 }),
    list('items', 'Client types', [str('title', 'Client type', { max: 90 }), text('text', 'What we do for them', { max: 300 })], { summary: '{title}' }),
  ], { optional: true }),
  obj('context', 'Context and figures', [
    str('eyebrow', 'Eyebrow', { max: 60 }),
    text('title', 'Heading', { em: true, max: 160 }),
    text('text', 'Text', { max: 600 }),
    list('figures', 'Figures — only shown when a source is filled in and the item is not hidden', [
      hidden,
      str('value', 'Figure', { max: 20 }), str('label', 'What it measures', { max: 120 }),
      str('source', 'Source (publisher, year)', { optional: true, max: 160, hint: 'Required before the figure is shown on the website.' }),
    ], { summary: '{value} {label}', optional: true }),
  ], { optional: true }),
  obj('gallery', 'Editorial field gallery (photos and films with captions)', [
    str('eyebrow', 'Eyebrow', { max: 60 }),
    text('title', 'Heading', { em: true, max: 160 }),
    text('lead', 'Intro', { optional: true, max: 420 }),
    list('items', 'Photos and films', [
      hidden,
      image('image', 'Photo, or poster frame for a film'),
      video('video', 'Film (MP4)', { optional: true, hint: 'Leave empty for a photo.' }),
      text('alt', 'Description for screen readers', { max: 300 }),
      str('caption', 'Caption', { max: 160, hint: 'Say only what the photo shows. Name a project, client or year only when the frame proves it or IP3 confirms it.' }),
    ], { summary: '{caption}' }),
  ]),
  obj('evidence', 'On the record (documented assignments)', [
    str('eyebrow', 'Eyebrow', { max: 60 }),
    text('title', 'Heading', { em: true, max: 160 }),
    text('lead', 'Intro', { optional: true, max: 420 }),
    strs('records', 'Assignments, in display order', { ref: 'proof', hint: 'Assignment slugs from Capabilities page — assignment records.' }),
  ]),
  obj('closing', 'Closing note before the next sector', [
    text('title', 'Heading', { em: true, max: 160 }),
    text('text', 'Text', { max: 600 }),
  ], { optional: true }),
], { primary: 'slug', fields: ['slug'], sort: ['slug'] });

