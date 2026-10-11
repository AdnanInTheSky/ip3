const { str, text, num, list, strs, select, image, video, hidden, slug, file } = require('../helpers');

// Real meeting photographs and videos used on /capabilities. A caption says only what the photograph shows.
module.exports = file('field_media', '11 · Proof — meeting photos & videos', 'content/field-media.json', [
  list('photos', 'Meeting photos', [
    hidden, slug(),
    image('image', 'Photo'),
    num('w', 'Width in pixels'), num('h', 'Height in pixels'),
    select('kind', 'What it shows', ['meeting', 'panel', 'workshop', 'conference', 'training', 'fieldwork', 'briefing', 'group']),
    text('alt', 'Description for screen readers', { max: 300 }),
    str('event', 'Caption: event', { max: 160 }),
    str('place', 'Caption: place', { optional: true, max: 80 }),
    str('year', 'Caption: year', { optional: true, max: 12 }),
    num('fx', 'Focal point, left to right (0-100)'), num('fy', 'Focal point, top to bottom (0-100)'),
    select('confidence', 'Caption confidence', ['verified', 'generic'], { hint: 'verified = a banner, slide or name plate in the photo proves the event; generic = the caption describes only what is visible.' }),
    strs('caps', 'Capabilities it relates to', { ref: 'capabilities' }),
    strs('projects', 'Assignments it documents', { optional: true, ref: 'proof', hint: 'Only where a banner or slide proves the assignment.' }),
  ], { summary: '{event}' }),
  list('videos', 'Videos', [
    hidden, slug(),
    video('src', 'Video file'), image('poster', 'Poster image'),
    str('title', 'Title', { max: 120 }),
    text('caption', 'Caption', { max: 240 }),
    str('runtime', 'Running time', { optional: true, max: 12 }),
    strs('caps', 'Capabilities it relates to', { ref: 'capabilities' }),
  ], { summary: '{title}' }),
]);
