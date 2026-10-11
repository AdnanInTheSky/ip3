const { str, text, file } = require('../helpers');

module.exports = file('capproof_room', '10 · Capabilities page — In the room (meeting photos)', 'content/capability-proof/room.json', [
  str('eyebrow', 'Eyebrow', { max: 80 }),
  str('title', 'Heading', { em: true, max: 140 }),
  text('lead', 'Intro', { max: 420 }),
  text('note', 'Caption policy note', { max: 240 }),
  str('prevLabel', 'Previous', { max: 30 }), str('nextLabel', 'Next', { max: 30 }),
  str('openLabel', 'Open a photo', { max: 40 }), str('closeLabel', 'Close', { max: 30 }),
  str('countLabel', 'Count label', { max: 30 }),
]);
