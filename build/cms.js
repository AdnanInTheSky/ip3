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
  'type', 'path', 'format', 'filename', 'view', 'primary', 'fields', 'sort',
  'list', 'collapsible', 'collapsed', 'summary', 'required', 'description',
  'options', 'maxlength', 'values',
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
  const help = [f.hint, f.em && !f.hint && 'Wrap words in <em>…</em> to show them in the accent colour.'].filter(Boolean).join(' ');
  if (help) put(i, `description: ${q(help)}`);
  const opts = [];
  if ((f.type === 'string' || f.type === 'text') && f.max) opts.push(['maxlength', f.max]);
  if (f.type === 'select') opts.push(['values', `[${f.values.map(q).join(', ')}]`]);
  if (f.type === 'image') opts.push(['media', 'images']);
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
  put(0, 'content:');
  for (const c of schema.content) {
    put(2, `- name: ${c.name}`);
    put(4, `label: ${q(c.label)}`);
    put(4, `type: ${c.type}`);
    put(4, `path: ${c.path}`);
    put(4, 'format: json');
    if (c.type === 'collection') {
      put(4, 'filename: "{primary}.json"');
      put(4, 'view:');
      put(6, `primary: ${c.view.primary}`);
      put(6, `fields: [${c.view.fields.join(', ')}]`);
      put(6, `sort: ${c.view.sort}`);
    }
    put(4, 'fields:');
    c.fields.forEach((f) => field(f, 6));
  }
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
