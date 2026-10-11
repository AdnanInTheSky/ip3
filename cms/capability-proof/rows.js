const { str, text, file } = require('../helpers');

module.exports = file('capproof_rows', '10 · Capabilities page — The six rows: labels', 'content/capability-proof/rows.json', [
  str('eyebrow', 'Eyebrow', { max: 80 }),
  str('title', 'Heading', { em: true, max: 140 }),
  text('lead', 'Intro', { max: 420 }),
  str('taskLabel', 'Often-commissioned-to label', { max: 60 }),
  str('clientsLabel', 'Commissioned-by label', { max: 60 }),
  str('proofLabel', 'Assignments-that-prove-it label', { max: 60 }),
  str('proofMore', 'Open-browser link label', { max: 60 }),
  str('roomLabel', 'From-the-room label', { max: 60 }),
  str('filmLabel', 'Related-film label', { max: 60 }),
  str('startLabel', 'Start-a-conversation label', { max: 60 }),
]);
