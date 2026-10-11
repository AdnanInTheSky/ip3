const { str, text, file } = require('../helpers');

module.exports = file('capproof_reel', '10 · Capabilities page — On film (videos)', 'content/capability-proof/reel.json', [
  str('eyebrow', 'Eyebrow', { max: 80 }),
  str('title', 'Heading', { em: true, max: 140 }),
  text('lead', 'Intro', { max: 420 }),
  str('playLabel', 'Play', { max: 30 }), str('pauseLabel', 'Pause', { max: 30 }), str('closeLabel', 'Close', { max: 30 }),
  str('nowPlayingLabel', 'Now playing', { max: 40 }), str('relatedLabel', 'Related capability label', { max: 60 }),
]);
