// Dependency-free negative regression tests. Every mutation is made to a temporary content copy.
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const REPO = path.join(__dirname, '..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'ip3-selftest-'));
const root = path.join(temp, 'site');
const contentSource = path.join(REPO, 'content');
const contentTarget = path.join(root, 'content');
fs.mkdirSync(root, { recursive: true });
for (const rel of ['build/validate.js', 'build/build-all.js', 'cms/schema.js']) {
  const target = path.join(root, rel); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.copyFileSync(path.join(REPO, rel), target);
}
const validate = require(path.join(root, 'build', 'validate.js'));

function reset() {
  fs.rmSync(contentTarget, { recursive: true, force: true });
  fs.cpSync(contentSource, contentTarget, { recursive: true });
}

function json(rel) {
  return JSON.parse(fs.readFileSync(path.join(contentTarget, rel), 'utf8'));
}

function save(rel, value) {
  fs.writeFileSync(path.join(contentTarget, rel), JSON.stringify(value, null, 2) + '\n');
}

function expectValidation(pattern) {
  const result = validate.run({ quiet: true });
  assert.match(result.errors.join('\n'), pattern);
}

test('negative content/build safeguards', async (t) => {
  reset();
  try {
    await t.test('rejects a missing image', () => {
      reset(); const data = json('sectors.json'); data.items[0].card = '/assets/img/missing-selftest.webp'; save('sectors.json', data);
      expectValidation(/file not found: \/assets\/img\/missing-selftest\.webp/);
    });
    await t.test('rejects a bad internal route', () => {
      reset(); const data = json('home/why-ip3.json'); data.items[0].href = '/not-a-route'; save('home/why-ip3.json', data);
      expectValidation(/link \/not-a-route does not match any page/);
    });
    await t.test('rejects a bad page anchor', () => {
      reset(); const data = json('home/why-ip3.json'); data.items[0].href = '/capabilities#not-a-capability'; save('home/why-ip3.json', data);
      expectValidation(/no capability with slug "not-a-capability"/);
    });
    await t.test('rejects script tags in editor copy', () => {
      reset(); const data = json('pages.json'); data.about.h1 = 'About <script>alert(1)<\/script>'; save('pages.json', data);
      expectValidation(/contains HTML other than <em>…<\/em>/);
    });
    await t.test('rejects an unclosed emphasis tag', () => {
      reset(); const data = json('pages.json'); data.about.h1 = 'Evidence <em>drives decisions'; save('pages.json', data);
      expectValidation(/<em> tags are not closed/);
    });
    await t.test('rejects new emphasis on a heading that did not use it', () => {
      reset(); const data = json('page-text/contact.json'); data.headings.find((item) => item.slug === 'contact-visit').title = '<em>Visit</em>, call or write.'; save('page-text/contact.json', data);
      expectValidation(/contact-visit: does not use <em> emphasis/);
    });
    await t.test('rejects an empty required value', () => {
      reset(); const data = json('sectors.json'); data.items[0].title = ''; save('sectors.json', data);
      expectValidation(/title: is required/);
    });
    await t.test('rejects an invalid email address', () => {
      reset(); const data = json('site.json'); data.email = 'not-an-email'; save('site.json', data);
      expectValidation(/not-an-email.*not a valid email address/);
    });
    await t.test('rejects a key absent from the CMS schema', () => {
      reset(); const data = json('pages.json'); data.about.unexpected = 'no'; save('pages.json', data);
      expectValidation(/unexpected: is not a field the editor knows/);
    });
    await t.test('rejects a broken content reference', () => {
      reset(); const data = json('sectors.json'); data.items[0].caps = ['missing-capability']; save('sectors.json', data);
      expectValidation(/missing-capability.*not an existing capability slug/);
    });
    await t.test('rejects hiding every hero slide', () => {
      reset(); const data = json('home/hero.json'); data.slides.forEach((slide) => { slide.hidden = true; }); save('home/hero.json', data);
      expectValidation(/at least one slide must be visible/);
    });
    await t.test('rejects a link to a hidden sector', () => {
      reset(); const sectors = json('sectors.json'); sectors.items[0].hidden = true; save('sectors.json', sectors);
      const reasons = json('home/why-ip3.json'); reasons.items[0].href = `/sectors/${sectors.items[0].slug}`; save('home/why-ip3.json', reasons);
      expectValidation(/does not match any page/);
    });
    await t.test('rejects hiding every primary navigation link', () => {
      reset(); const data = json('navigation.json'); data.primary.forEach((item) => { item.hidden = true; }); save('navigation.json', data);
      expectValidation(/at least one primary navigation item must be visible/);
    });
    await t.test('warns when a visible engagement points to a hidden sector', () => {
      reset(); const sectors = json('sectors.json'); const hiddenSlug = sectors.items[0].slug; sectors.items[0].hidden = true; save('sectors.json', sectors);
      const engagements = json('engagements.json'); engagements.items[0].sectorSlug = hiddenSlug; save('engagements.json', engagements);
      const result = validate.run({ quiet: true });
      assert.match(result.warnings.join('\n'), /references hidden sector/);
    });
    await t.test('rejects a value of the wrong type', () => {
      reset(); const data = json('pages.json'); data.about.h1 = 17; save('pages.json', data);
      expectValidation(/h1: must be text/);
    });
    await t.test('rejects duplicate sector slugs', () => {
      reset(); const data = json('sectors.json'); data.items[1].slug = data.items[0].slug; save('sectors.json', data);
      expectValidation(/is used twice/);
    });
    await t.test('rejects malformed JSON', () => {
      reset(); fs.writeFileSync(path.join(contentTarget, 'site.json'), '{broken');
      expectValidation(/not valid JSON/);
    });
    await t.test('rejects an image over the hard size limit', () => {
      reset(); const data = json('sectors.json'); data.items[0].card = '/assets/img/selftest-oversized.webp'; save('sectors.json', data);
      const file = path.join(root, 'assets', 'img', 'selftest-oversized.webp');
      fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, Buffer.alloc(2 * 1024 * 1024 + 1));
      expectValidation(/selftest-oversized\.webp is .*limit is 2(?:\.0)? MB/);
    });
    await t.test('rejects WebM videos above the optimizer target', () => {
      reset(); const data = json('sectors.json'); data.items[0].video = '/assets/video/selftest-large.webm'; save('sectors.json', data);
      const file = path.join(root, 'assets', 'video', 'selftest-large.webm');
      fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, Buffer.alloc(8 * 1024 * 1024 + 1));
      expectValidation(/WebM cannot be re-encoded as H\.264/);
    });
    await t.test('leaves the previous HTML untouched when build validation fails', async () => {
      reset(); const output = path.join(root, 'dist'); const html = path.join(output, 'index.html');
      fs.mkdirSync(output, { recursive: true }); fs.writeFileSync(html, '<h1>last good build</h1>');
      const data = json('site.json'); data.email = ''; save('site.json', data);
      const result = spawnSync(process.execPath, ['build/build-all.js'], { cwd: root, encoding: 'utf8' });
      assert.notEqual(result.status, 0, 'invalid content should fail the build');
      assert.equal(fs.readFileSync(html, 'utf8'), '<h1>last good build</h1>');
    });
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('LF and CRLF source checkouts produce identical dist files apart from build time', (t) => {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ip3-line-ending-selftest-'));
  t.after(() => fs.rmSync(tempRoot, { recursive: true, force: true }));
  const roots = { lf: path.join(tempRoot, 'lf'), crlf: path.join(tempRoot, 'crlf') };
  for (const root of Object.values(roots)) {
    fs.mkdirSync(root, { recursive: true });
    for (const rel of ['build', 'cms', 'src', 'content', 'assets']) {
      fs.cpSync(path.join(REPO, rel), path.join(root, rel), { recursive: true });
    }
  }

  const sourceFiles = [];
  (function scan(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) scan(file);
      else sourceFiles.push(file);
    }
  })(path.join(roots.lf, 'src'));
  for (const file of sourceFiles) {
    const contents = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    fs.writeFileSync(file, contents);
    fs.writeFileSync(path.join(roots.crlf, path.relative(roots.lf, file)), contents.replace(/\n/g, '\r\n'));
  }

  for (const root of Object.values(roots)) {
    const result = spawnSync(process.execPath, ['build/build-all.js'], {
      cwd: root, encoding: 'utf8', env: { ...process.env, CONTACT_API_ENABLED: '', PUBLIC_TURNSTILE_SITE_KEY: '' },
    });
    assert.equal(result.status, 0, result.stderr || result.stdout || 'build failed');
  }

  function distHashes(root) {
    const result = {};
    const out = path.join(root, 'dist');
    (function scan(dir) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const file = path.join(dir, entry.name);
        if (entry.isDirectory()) scan(file);
        else {
          const rel = path.relative(out, file).split(path.sep).join('/');
          const bytes = fs.readFileSync(file);
          if (rel === 'build.json') {
            const stamp = JSON.parse(bytes.toString('utf8'));
            delete stamp.builtAt;
            result[rel] = crypto.createHash('sha256').update(JSON.stringify(stamp)).digest('hex');
          } else result[rel] = crypto.createHash('sha256').update(bytes).digest('hex');
        }
      }
    })(out);
    return result;
  }

  assert.deepEqual(distHashes(roots.crlf), distHashes(roots.lf));
  for (const root of Object.values(roots)) {
    assert.doesNotMatch(fs.readFileSync(path.join(root, 'dist', 'contact.html'), 'utf8'), /data-contact-api/);
  }

  const enabled = spawnSync(process.execPath, ['build/build-all.js'], {
    cwd: roots.lf, encoding: 'utf8',
    env: { ...process.env, CONTACT_API_ENABLED: '1', PUBLIC_TURNSTILE_SITE_KEY: 'public-test-key' },
  });
  assert.equal(enabled.status, 0, enabled.stderr || enabled.stdout || 'contact API enabled build failed');
  const enabledContact = fs.readFileSync(path.join(roots.lf, 'dist', 'contact.html'), 'utf8');
  assert.match(enabledContact, /data-contact-api/);
  assert.match(enabledContact, /data-sitekey="public-test-key"/);
});
