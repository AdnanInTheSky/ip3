const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const schema = require('../cms/schema');
const { editableSectionOrders } = require('../cms/section-order');
const { testimonialPlacements, defaultTestimonialPlacement } = require('../cms/section-placement');

const contractHash = 'e8087c4765c912b87059ff210abd233766629b65f2724a5cd04a8b4ab92fb646';
const editorOnlyKeys = new Set(['label', 'hint', 'summary']);
function withoutEditorCopy(value) {
  if (Array.isArray(value)) return value.map(withoutEditorCopy);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !editorOnlyKeys.has(key))
    .map(([key, child]) => [key, withoutEditorCopy(child)]));
}
function entry(name) {
  const result = schema.content.find((item) => item.name === name);
  assert.ok(result, `Expected CMS form ${name}`);
  return result;
}
function field(fields, name) {
  for (const item of fields || []) {
    if (item.name === name) return item;
    const nested = field(item.fields, name);
    if (nested) return nested;
  }
  return undefined;
}

test('editor wording changes preserve the complete CMS content contract', () => {
  const contract = {
    media: schema.media,
    groups: schema.groups.map(({ name, items }) => ({ name, items })),
    content: schema.content,
  };
  const actual = createHash('sha256').update(JSON.stringify(withoutEditorCopy(contract))).digest('hex');
  assert.equal(actual, contractHash, 'Only labels, help text, summaries, and group display labels may change in this task');
});

test('common editing tasks have clear form, field, help, and collapsed-list labels', () => {
  assert.match(entry('home_hero').label, /hero headlines, slides & media/i);
  assert.match(field(entry('home_hero').fields, 'h1').label, /headline shown on the slide/i);
  assert.match(field(entry('home_hero').fields, 'poster').hint, /keep this image/i);
  assert.match(field(entry('home_hero').fields, 'href').hint, /site route/i);
  assert.match(entry('people').label, /teams & profiles/i);
  assert.match(field(entry('people').fields, 'slug').label, /leave unchanged/i);
  assert.match(field(entry('people').fields, 'slug').hint, /developer-managed/i);
  assert.equal(field(entry('people').fields, 'members').summary, '{name}');
  assert.match(entry('engagements').label, /projects & assignments/i);
  assert.match(field(entry('engagements').fields, 'slug').label, /leave unchanged/i);
  assert.equal(field(entry('engagements').fields, 'items').summary, '{client} — {title}');
  assert.match(entry('pages').label, /search descriptions/i);
  assert.match(field(entry('pages').fields, 'title').label, /search title/i);
  assert.match(field(entry('pages').fields, 'desc').hint, /search engines may rewrite/i);
  assert.match(entry('home_faq').label, /questions & answers/i);
  assert.equal(field(entry('home_faq').fields, 'items').summary, '{q}');
  assert.match(entry('site').label, /contact & office details/i);
  assert.match(entry('navigation').label, /header, navigation & footer/i);
  assert.equal(field(entry('home_testimonials').fields, 'items').summary, '{name}');
});

test('restricted section order and testimonial pilot remain unchanged', () => {
  assert.deepEqual(Object.keys(editableSectionOrders), ['home', 'about', 'people', 'contact']);
  assert.deepEqual(Object.keys(testimonialPlacements), [
    'With clients and funders (default)',
    'After selected engagements',
    'Before founder profile',
  ]);
  assert.equal(defaultTestimonialPlacement, 'With clients and funders (default)');
  const saved = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'content/section-placement.json'), 'utf8'));
  assert.equal(saved.homeTestimonials, defaultTestimonialPlacement);
});

test('generated Pages CMS configuration matches the schema', () => {
  const result = spawnSync(process.execPath, ['build/cms.js', '--check'], { cwd: path.join(__dirname, '..'), encoding: 'utf8' });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});
