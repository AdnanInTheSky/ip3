// Generates .pages.yml (the Pages CMS editor config) from cms/schema.js.
//   node build/cms.js           write .pages.yml
//   node build/cms.js --check   exit 1 if .pages.yml is out of date (used in CI)
const fs = require('fs');
const path = require('path');
const schema = require('../cms/schema');

const OUT = path.join(__dirname, '..', '.pages.yml');
const q = (s) => JSON.stringify(s); // JSON strings are valid YAML double-quoted scalars
const lines = [];
// Keep this allowlist aligned with keys documented at https://pagescms.org/docs/configuration/.
const ALLOWED_KEYS = new Set([
  'media', 'content', 'name', 'label', 'input', 'output', 'rename', 'extensions',
  'type', 'path', 'format', 'filename', 'view', 'primary', 'fields', 'sort', 'items',
  'list', 'collapsible', 'collapsed', 'summary', 'required', 'description',
  'options', 'maxlength', 'values', 'settings', 'content', 'merge', 'commit',
  'identity', 'templates', 'create', 'update', 'delete', 'operations', 'pattern',
  'regex', 'message', 'readonly', 'switcher',
]);
const put = (indent, s) => {
  if (!s.startsWith('#')) {
    const match = s.trim().match(/^(?:-\s*)?([a-z][a-z0-9_-]*):/i);
    if (!match || !ALLOWED_KEYS.has(match[1])) throw new Error(`Undocumented Pages CMS config key "${match ? match[1] : s}". Check the official docs before emitting it.`);
  }
  lines.push(' '.repeat(indent) + s);
};

function field(f, indent) {
  const type = { video: 'file', text: 'text' }[f.type] || f.type;
  put(indent, `- name: ${f.name}`);
  const i = indent + 2;
  put(i, `label: ${q(f.label)}`);
  put(i, `type: ${type}`);
  if (f.list) {
    if (f.summary) { put(i, 'list:'); put(i + 2, 'collapsible:'); put(i + 4, 'collapsed: true'); put(i + 4, `summary: ${q(f.summary)}`); } else put(i, 'list: true');
  }
  if (!f.optional) put(i, 'required: true');
  if (f.readonly) put(i, 'readonly: true');
  const help = [f.hint, f.em && !f.hint && 'Wrap words in <em>…</em> to show them in the accent colour.'].filter(Boolean).join(' ');
  if (help) put(i, `description: ${q(help)}`);
  if (f.slug) {
    put(i, 'pattern:');
    put(i + 2, 'regex: "^[a-z0-9]+(?:-[a-z0-9]+)*$"');
    put(i + 2, 'message: "Use lowercase letters and numbers separated by hyphens."');
  }
  const opts = [];
  if ((f.type === 'string' || f.type === 'text') && f.max) opts.push(['maxlength', f.max]);
  if (f.type === 'select') opts.push(['values', `[${f.values.map(q).join(', ')}]`]);
  if (f.type === 'image') opts.push(['media', f.media || 'images']);
  if (f.type === 'rich-text') {
    for (const [key, value] of Object.entries(f.options || {})) opts.push([key, Array.isArray(value) ? `[${value.map(q).join(', ')}]` : typeof value === 'string' ? q(value) : value]);
  }
  if (f.type === 'video') { opts.push(['media', 'videos']); opts.push(['extensions', '[mp4, webm]']); }
  if (opts.length) { put(i, 'options:'); opts.forEach(([k, v]) => put(i + 2, `${k}: ${v}`)); }
  if (f.type === 'object') { put(i, 'fields:'); f.fields.forEach((x) => field(x, i + 2)); }
}

function build() {
  lines.length = 0;
  put(0, '# GENERATED from cms/schema.js — do not edit by hand. Change the schema, then run: npm run cms');
  put(0, '# Pages CMS configuration docs: https://pagescms.org/docs/configuration/');
  put(0, 'media:');
  for (const m of schema.media) {
    put(2, `- name: ${m.name}`);
    put(4, `label: ${q(m.label)}`);
    put(4, `input: ${m.input}`);
    put(4, `output: ${m.output}`);
    put(4, 'rename: safe');
    put(4, `extensions: [${m.extensions.join(', ')}]`);
  }
  put(0, 'settings:');
  put(2, 'content:');
  put(4, 'merge: true');
  put(2, 'commit:');
  put(4, 'identity: user');
  put(4, 'templates:');
  put(6, 'create: "IP3 content: add {path}"');
  put(6, 'update: "IP3 content: update {path}"');
  put(6, 'delete: "IP3 content: delete {path}"');
  put(6, 'rename: "IP3 content: rename {oldPath} to {newPath}"');
  put(0, 'content:');
  const contentByName = new Map(schema.content.map((c) => [c.name, c]));
  const assigned = new Set();
  const labelFor = (label) => {
    const plain = label.replace(/^\d+\s*·\s*/, '');
    const marker = plain.lastIndexOf(' — ');
    return marker >= 0 ? plain.slice(marker + 3) : plain;
  };
  function entry(c, indent) {
    if (!c || assigned.has(c.name)) throw new Error(`CMS navigation has a missing or duplicate content entry: ${c ? c.name : '(unknown)'}`);
    assigned.add(c.name);
    put(indent, `- name: ${c.name}`);
    put(indent + 2, `label: ${q(labelFor(c.label))}`);
    put(indent + 2, `type: ${c.type}`);
    put(indent + 2, `path: ${c.path}`);
    put(indent + 2, 'format: json');
    put(indent + 2, 'operations:');
    put(indent + 4, `create: ${c.name === 'articles'}`);
    put(indent + 4, 'rename: false');
    put(indent + 4, 'delete: false');
    if (c.type === 'collection') {
      put(indent + 2, c.name === 'articles' ? 'filename: "{fields.slug}.json"' : 'filename: "{primary}.json"');
      put(indent + 2, 'view:');
      put(indent + 4, `primary: ${c.view.primary}`);
      put(indent + 4, `fields: [${c.view.fields.join(', ')}]`);
      put(indent + 4, `sort: ${c.view.sort}`);
    }
    put(indent + 2, 'fields:');
    c.fields.forEach((f) => field(f, indent + 4));
  }
  for (const group of schema.groups) {
    put(2, `- name: ${group.name}`);
    put(4, `label: ${q(group.label)}`);
    put(4, 'type: group');
    put(4, 'items:');
    for (const name of group.items) entry(contentByName.get(name), 6);
  }
  const unassigned = schema.content.filter((c) => !assigned.has(c.name)).map((c) => c.name);
  if (unassigned.length) throw new Error(`CMS navigation is missing content entries: ${unassigned.join(', ')}`);
  return lines.join('\n') + '\n';
}

const yml = build();
if (process.argv.includes('--check')) {
  const have = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8').replace(/\r\n/g, '\n') : '';
  if (have !== yml) { console.error('.pages.yml is out of date with cms/schema.js — run: npm run cms'); process.exit(1); }
  console.log('.pages.yml is up to date.');
} else {
  fs.writeFileSync(OUT, yml);
  console.log(`.pages.yml written (${schema.content.length} sections, ${yml.split('\n').length} lines).`);
}
