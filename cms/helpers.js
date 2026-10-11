// Field helpers shared by cms/schema.js and the per-module forms in cms/capability-proof/.
const T = (type) => (name, label, o = {}) => ({ name, label, type, ...o });
const str = T('string');
const text = T('text');
const num = T('number');
const bool = T('boolean');
const image = T('image');
const video = T('video');
const select = (name, label, values, o = {}) => ({ name, label, type: 'select', values, ...o });
const obj = (name, label, fields, o = {}) => ({ name, label, type: 'object', fields, ...o });
const list = (name, label, fields, o = {}) => ({ name, label, type: 'object', list: true, fields, ...o });
const strs = (name, label, o = {}) => ({ name, label, type: 'string', list: true, ...o });
const hidden = bool('hidden', 'Hide this item', { optional: true, hint: 'Tick to take it off the website without deleting it.' });
const slug = (name = 'slug', label = 'URL slug', o = {}) => str(name, label, { slug: true, hint: 'Lower-case words joined by hyphens. Changing it changes the page address — set once.', ...o });
const pair = (name, label, o = {}) => list(name, label, [str('title', 'Title'), text('text', 'Text')], { summary: '{title}', ...o });

const file = (name, label, path, fields) => ({ name, label, type: 'file', path, fields });
const collection = (name, label, path, fields, view) => ({ name, label, type: 'collection', path, fields, view });

module.exports = { T, str, text, num, bool, image, video, select, obj, list, strs, hidden, slug, pair, file, collection };
