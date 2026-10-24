const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const schema = require('../cms/schema');
const { editableSectionOrders } = require('../cms/section-order');
const { testimonialPlacements, defaultTestimonialPlacement } = require('../cms/section-placement');

const contractHash = '0d2e21fcbe07bc5abba7cd6f57afe34ee81689c533f9f12d356269dbbb2dffa1';
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

test('CMS contract matches the approved article, Explorer and About field mapping', () => {
  const contract = {
    media: schema.media.filter(item => item.name !== 'insights_images'),
    groups: schema.groups.map(({ name, items }) => ({ name, items: items.filter(item => item !== 'articles') })),
    content: schema.content.filter(item => item.name !== 'articles').map(item => item.name !== 'insights' ? item : ({ ...item,
      fields: item.fields.map(f => f.name !== 'items' ? f : ({ ...f, fields: f.fields.filter(child => child.name !== 'legacyWpId') })) })),
  };
  assert.ok(field(entry('section_order').fields, 'home').values.includes('Thinking in action'));
  const orderIndex = contract.content.findIndex(item => item.name === 'section_order');
  const order = { ...contract.content[orderIndex] };
  order.fields = order.fields.map(f => f.name === 'home' ? { ...f, values: f.values.filter(value => value !== 'Thinking in action') } : f);
  contract.content[orderIndex] = order;
  const actual = createHash('sha256').update(JSON.stringify(withoutEditorCopy(contract))).digest('hex');
  assert.equal(actual, contractHash, 'The existing forms must retain their content contract');
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

test('About fields map to visible content and its former lifecycle remains editable on Capabilities', () => {
  const root = path.join(__dirname, '..');
  const about = JSON.parse(fs.readFileSync(path.join(root, 'content/about.json'), 'utf8'));
  const capabilities = JSON.parse(fs.readFileSync(path.join(root, 'content/capabilities.json'), 'utf8'));
  const copy = JSON.parse(fs.readFileSync(path.join(root, 'content/page-text/about.json'), 'utf8'));
  const archive = JSON.parse(fs.readFileSync(path.join(root, 'docs/content-archive/about-sections-2026-10-25.json'), 'utf8'));
  const { parseHTML } = require('linkedom');
  const pages = require('../src/pages-inner');
  const normalize = text => text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  const visible = normalize(parseHTML(pages.about()).document.querySelector('main').textContent);
  const checkVisible = value => {
    if (typeof value === 'string') assert.ok(visible.includes(normalize(value)), `About CMS value is not rendered: ${value}`);
    else Object.values(value).forEach(checkVisible);
  };
  checkVisible(about);
  assert.deepEqual(entry('about').fields.map(f => f.name).sort(), Object.keys(about).sort());
  for (const key of ['lifecycle', 'pillars']) {
    assert.equal(field(entry('about').fields, key), undefined);
    assert.ok(!copy.headings.some(h => h.slug === `about-${key}`));
    assert.ok(archive.sections[key].content.length > 0);
  }
  assert.ok(field(entry('capabilities').fields, 'lifecycle'));
  const capabilityText = normalize(parseHTML(pages.capabilities()).document.querySelector('main').textContent);
  capabilities.lifecycle.forEach(step => {
    assert.ok(capabilityText.includes(normalize(step.title)));
    assert.ok(capabilityText.includes(normalize(step.text)));
  });
  assert.equal(archive.sections.lifecycle.content.length, 4);
  assert.equal(archive.sections.pillars.content.length, 3);
  const live = require('../src/data').capabilities.lifecycle[0];
  const originalTitle = live.title;
  try {
    live.title = 'CMS-CAPABILITY-PROCESS-EDIT-CHECK';
    assert.ok(pages.capabilities().includes(live.title), 'A process edit must reach Capabilities');
    assert.ok(!pages.about().includes(live.title), 'A Capabilities process edit must not become an About section');
  } finally {
    live.title = originalTitle;
  }
});
