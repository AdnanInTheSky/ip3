// Reads the editable content (content/**/*.json — the files the CMS writes).
// With --audit every value is wrapped so the build can report content fields no page ever reads.
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'content');
const AUDIT = process.argv.includes('--audit');
const raw = {};
const read = new Set();

function parse(name) {
  const f = path.join(DIR, name + '.json');
  try {
    return JSON.parse(fs.readFileSync(f, 'utf8'));
  } catch (e) {
    throw new Error(`content/${name}.json: ${e.message}`);
  }
}

const norm = (p, k) => (Array.isArray(p.value) ? p.path + '[]' : p.path + '.' + k);
function track(value, p) {
  if (!value || typeof value !== 'object') return value;
  return new Proxy(value, {
    get(t, k, r) {
      const v = Reflect.get(t, k, r);
      if (typeof k !== 'string' || k === 'length') return v;
      if (v && typeof v === 'object') return track(v, { value: v, path: norm({ value: t, path: p.path }, k) });
      if (typeof v !== 'function') read.add(norm({ value: t, path: p.path }, k));
      return v;
    },
  });
}

function file(name) {
  const v = parse(name);
  raw[name] = v;
  return AUDIT ? track(v, { value: v, path: name }) : v;
}

function dir(name) {
  return fs.readdirSync(path.join(DIR, name)).filter((f) => f.endsWith('.json')).sort().map((f) => file(`${name}/${f.slice(0, -5)}`));
}

function leaves(v, p, acc) {
  if (Array.isArray(v)) v.forEach((x) => leaves(x, p + '[]', acc));
  else if (v && typeof v === 'object') Object.keys(v).forEach((k) => leaves(v[k], p + '.' + k, acc));
  else acc.add(p);
  return acc;
}

// content paths that were loaded but never read while rendering
function unread() {
  const all = new Set();
  Object.entries(raw).forEach(([n, v]) => leaves(v, n, all));
  // These values configure the editor UI or stable CMS records; they are not rendered content.
  const editorMetadata = [/^page-text\/.*\.copy\[\]\.label$/, /^insights\.fieldStories\[\]\.slug$/];
  return [...all].filter((p) => !read.has(p) && !editorMetadata.some((pattern) => pattern.test(p))).sort();
}

module.exports = { file, dir, unread, DIR };
