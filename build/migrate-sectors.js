// One-time migration from content/sectors/*.json records with numeric `n` fields to an ordered list.
// Usage: node build/migrate-sectors.js [legacy-directory] [output-file] [--overwrite]
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const input = path.resolve(process.argv[2] || path.join(ROOT, 'content', 'sectors'));
const output = path.resolve(process.argv[3] || path.join(ROOT, 'content', 'sectors.json'));
const overwrite = process.argv.includes('--overwrite');

if (fs.existsSync(output) && !overwrite) throw new Error(`${path.relative(ROOT, output)} already exists; pass --overwrite only after backing it up.`);
const files = fs.readdirSync(input).filter((name) => name.endsWith('.json'));
if (!files.length) throw new Error(`No legacy sector JSON files found in ${input}`);

const rows = files.map((name) => {
  const file = path.join(input, name);
  const value = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!Number.isFinite(Number(value.n))) throw new Error(`${name} has no numeric n field`);
  if (!value.slug) throw new Error(`${name} has no slug`);
  return { file, value };
}).sort((a, b) => Number(a.value.n) - Number(b.value.n));

const slugs = new Set();
const items = rows.map(({ file, value }) => {
  if (slugs.has(value.slug)) throw new Error(`${path.basename(file)} duplicates sector slug ${value.slug}`);
  slugs.add(value.slug);
  const { n, ...sector } = value;
  return sector;
});

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify({ items }, null, 2) + '\n');
console.log(`Migrated ${items.length} sectors in numeric n order to ${path.relative(ROOT, output) || output}.`);
