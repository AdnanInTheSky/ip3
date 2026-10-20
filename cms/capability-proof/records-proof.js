const { str, text, list, obj, strs, select, image, hidden, slug, file } = require('../helpers');

// The documented assignments shown as proof on /capabilities. Facts are copied from the founder's signed CV
// (via the portfolio record); nothing is inferred. Scope figures are scope, never outcomes.
module.exports = file('proof', '11 · Proof — documented assignments', 'content/proof.json', [
  list('items', 'Assignments', [
    hidden, slug(),
    str('ref', 'Reference label', { max: 8, hint: 'Short label shown on the card, e.g. B1.' }),
    str('title', 'Assignment title (as recorded)', { max: 260 }),
    str('short', 'Plain-language title', { max: 120 }),
    str('client', 'Client or funder (as recorded)', { max: 300 }),
    select('clientType', 'Client type', ['multilateral', 'government', 'bilateral', 'foundation', 'private', 'research']),
    select('market', 'Market', ['bangladesh', 'international']),
    str('role', 'Role (as recorded)', { max: 300 }),
    select('roleLevel', 'Role level', ['lead', 'specialist']),
    str('period', 'Period as shown', { optional: true, max: 60, hint: 'Leave blank where dates are withheld while the record is reconciled.' }),
    select('status', 'Status', ['current', 'delivered']),
    str('reference', 'Programme reference', { optional: true, max: 140 }),
    str('location', 'Geography', { optional: true, max: 260 }),
    text('summary', 'Summary', { max: 460 }),
    text('impact', 'Impact', { optional: true, max: 260, hint: 'Shown on the Home delivery chain. Say what the work produced or informed, as the record supports it; never an outcome the record does not state. Start current assignments with “Under way:”.' }),
    strs('activities', 'Recorded activities', { optional: true }),
    strs('methods', 'Methods demonstrated', { optional: true }),
    obj('scope', 'Scope figure (scope, not an outcome)', [str('value', 'Value', { max: 24 }), str('label', 'What it counts', { max: 160 })], { optional: true }),
    str('pillars', 'Pillars E-D-T-R', { max: 4, hint: 'Four letters, one each for Economics, Data stories, Technology, Research: f = full, h = partial, n = none, e.g. fhff.' }),
    strs('caps', 'Capabilities this assignment proves', { ref: 'capabilities', hint: 'First one is the primary capability.' }),
    str('engagement', 'Matching IP3 selected engagement', { optional: true, ref: 'engagements', hint: 'Only where the two records are the same assignment.' }),
    str('photo', 'Verified photo of this assignment', { optional: true, ref: 'fieldphotos', hint: 'Only where a banner or slide in the photo proves the assignment.' }),
    image('thumb', 'Card thumbnail (illustrative)', { optional: true, hint: 'Decorative picture for the assignment card when there is no verified photo or matching engagement. It is not claimed to be from the assignment.' }),
    str('source', 'Source line', { max: 320 }),
    text('note', 'Caveat shown on the record', { optional: true, max: 320 }),
  ], { summary: '{ref} — {short}' }),
]);
