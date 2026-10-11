// One CMS form per section of the /capabilities page, plus the two record lists the sections draw on.
// Each module owns its own form file and its content file in content/capability-proof/ (records live in content/proof.json and content/field-media.json).
const modules = ['hero', 'led', 'method', 'rows', 'browser', 'room', 'reel'].map((name) => require('./' + name));
module.exports = [...modules, require('./records-proof'), require('./records-media')];
