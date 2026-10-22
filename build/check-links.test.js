const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { verify } = require('./check-links');

function fixture(t, pages, sitemap = ['https://example.test/', 'https://example.test/about']) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ip3-links-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  for (const [file, html] of Object.entries(pages)) {
    const full = path.join(root, file);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, html);
  }
  fs.writeFileSync(path.join(root, 'sitemap.xml'), `<urlset>${sitemap.map((url) => `<url><loc>${url}</loc></url>`).join('')}</urlset>`);
  return root;
}

function page({ path: route, title, heading, body = '' }) {
  return `<!doctype html><html><head><title>${title}</title><link rel="canonical" href="https://example.test${route}"></head><body><h1>${heading}</h1>${body}</body></html>`;
}

test('accepts valid page metadata, local assets, anchors and sitemap URLs', (t) => {
  const root = fixture(t, {
    'index.html': page({ path: '/', title: 'Home', heading: 'Home', body: '<link rel="stylesheet" href="/assets/site.css"><a href="/about#details">About</a><img src="/assets/photo.jpg" alt="A building">' }),
    'about.html': page({ path: '/about', title: 'About', heading: 'About', body: '<section id="details"></section>' }),
    'assets/site.css': 'body {}',
    'assets/photo.jpg': 'image',
  });
  const result = verify({ dist: root, siteUrl: 'https://example.test' });
  assert.deepEqual(result.errors, []);
  assert.equal(result.pageCount, 2);
});

test('rejects missing href, src, srcset, poster targets and anchor fragments', (t) => {
  const root = fixture(t, {
    'index.html': page({
      path: '/', title: 'Home', heading: 'Home',
      body: '<a href="/missing">Missing</a><a href="/#absent">Missing anchor</a><img src="/missing.jpg" srcset="/missing-2.jpg 2x"><video poster="/poster.jpg"></video>',
    }),
  }, ['https://example.test/']);
  const errors = verify({ dist: root, siteUrl: 'https://example.test' }).errors.join('\n');
  assert.match(errors, /\/missing does not resolve/);
  assert.match(errors, /#absent has no matching id/);
  assert.match(errors, /\/missing\.jpg does not resolve/);
  assert.match(errors, /\/missing-2\.jpg does not resolve/);
  assert.match(errors, /\/poster\.jpg does not resolve/);
});

test('accepts accessible SVG titles without treating them as page metadata', (t) => {
  const root = fixture(t, {'index.html': page({path:'/',title:'Home',heading:'Home',body:'<svg role="img"><title>Chart</title><g><title>Year 0 investment</title></g></svg>'})}, ['https://example.test/']);
  assert.deepEqual(verify({dist:root,siteUrl:'https://example.test'}).errors, []);
});

test('rejects missing image alt text and duplicate title, h1 and canonical values', (t) => {
  const root = fixture(t, {
    'index.html': page({ path: '/', title: 'Same', heading: 'Same heading', body: '<img src="/photo.jpg">' }),
    'about.html': page({ path: '/', title: 'Same', heading: 'Same heading' }),
    'photo.jpg': 'image',
  }, ['https://example.test/']);
  const errors = verify({ dist: root, siteUrl: 'https://example.test' }).errors.join('\n');
  assert.match(errors, /duplicate title/);
  assert.match(errors, /duplicate h1/);
  assert.match(errors, /duplicate canonical URL/);
  assert.match(errors, /image is missing an alt attribute/);
});

test('rejects missing required metadata and sitemap URLs without built pages', (t) => {
  const root = fixture(t, {
    'index.html': '<html><body><p>Incomplete</p></body></html>',
  }, ['not a URL', 'https://example.test/not-built']);
  const errors = verify({ dist: root, siteUrl: 'https://example.test' }).errors.join('\n');
  assert.match(errors, /expected exactly one non-empty <title>/);
  assert.match(errors, /expected exactly one non-empty <h1>/);
  assert.match(errors, /expected exactly one canonical link/);
  assert.match(errors, /sitemap: malformed URL/);
  assert.match(errors, /does not resolve to a generated page/);
});
