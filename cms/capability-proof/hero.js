const { str, text, num, list, file } = require('../helpers');

module.exports = file('capproof_hero', '10 · Capabilities page — Top of page & figures', 'content/capability-proof/hero.json', [
  str('jumpLabel', 'Jump-links label', { max: 40 }),
  list('jump', 'Jump links', [str('label', 'Label', { max: 40 }), str('id', 'Section id on the page', { max: 40, hint: 'Developer-set. Do not change.' })], { summary: '{label}' }),
  str('scrollCue', 'Scroll cue', { max: 30 }),
  str('statsEyebrow', 'Figures eyebrow', { max: 80 }),
  list('stats', 'Figures', [num('n', 'Number'), str('suffix', 'Suffix', { optional: true, max: 4 }), str('label', 'Label', { max: 120 })], { summary: '{n}{suffix} {label}' }),
  text('statsNote', 'Note under the figures', { max: 320 }),
  str('partnersLabel', 'Development partners label', { max: 100 }),
]);
