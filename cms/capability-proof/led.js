const { str, text, strs, file } = require('../helpers');

module.exports = file('capproof_led', '10 · Capabilities page — Founder-led, expert-backed', 'content/capability-proof/led.json', [
  str('eyebrow', 'Eyebrow', { max: 80 }),
  str('title', 'Heading', { em: true, max: 120 }),
  text('lead', 'Intro', { max: 420 }),
  str('founderLabel', 'Founder label', { max: 40 }),
  text('founderSummary', 'Founder summary (from the signed CV)', { max: 460, hint: 'Do not add a years-of-experience figure here until IP3 confirms one number: the signed CV says 20, the IP3 profile and site say 17.' }),
  text('founderEducation', 'Founder education line', { max: 200 }),
  str('founderSource', 'Source line', { max: 120 }),
  str('founderCta', 'Founder link label', { max: 40 }),
  str('founderHref', 'Founder link', { link: true }),
  str('expertsLabel', 'Experts label', { max: 40 }),
  strs('experts', 'Experts shown', { ref: 'people', hint: 'Person slugs from the People list.' }),
  str('expertsCta', 'Team link label', { max: 40 }),
  str('expertsHref', 'Team link', { link: true }),
]);
