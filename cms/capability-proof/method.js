const { str, text, list, strs, file, slug } = require('../helpers');

module.exports = file('capproof_method', '10 · Capabilities page — How the work is done (3D scroll)', 'content/capability-proof/method.json', [
  str('eyebrow', 'Eyebrow', { max: 80 }),
  str('title', 'Heading', { em: true, max: 140 }),
  text('lead', 'Intro', { max: 420 }),
  str('hint', 'Scroll hint', { max: 80 }),
  str('formulaLabel', 'Label under the formula', { max: 80 }),
  text('statement', 'Closing statement', { max: 420 }),
  list('stages', 'The five stages', [
    slug('slug', 'Stage key'),
    str('label', 'Name', { max: 24 }),
    str('line', 'One line', { max: 100 }),
    text('detail', 'What it covers', { max: 220 }),
    str('formula', 'Formula or method line', { optional: true, max: 120 }),
    str('figureValue', 'Figure', { optional: true, max: 12 }),
    str('figureLabel', 'What the figure counts', { optional: true, max: 160 }),
    str('photo', 'Photo from the meeting-photo list', { optional: true, ref: 'fieldphotos' }),
    strs('caps', 'Capabilities it feeds', { ref: 'capabilities' }),
  ], { summary: '{label}' }),
]);
