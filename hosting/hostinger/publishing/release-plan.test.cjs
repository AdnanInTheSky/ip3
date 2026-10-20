'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { safeRelative, safeLocalPath, planRelease, writeLocalPackage, verifyLocalPackage } = require('./release-plan.cjs');
const COMMIT = 'a'.repeat(40);
const sectorSlugs = Array.from({ length: 8 }, (_,i) => 'sector-' + i);
test('CLI refuses every remote upload or activation flag before reading build files', () => {
  for (const flag of ['--upload','--activate','--promote','--remote']) {
    const result = spawnSync(process.execPath, [path.join(__dirname, 'release-plan.cjs'), flag], {encoding:'utf8'});
    assert.equal(result.status, 1); assert.match(result.stderr, /no remote or activation mode/);
  }
});
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ip3-local-release-'));
  t.after(() => {
    // Verify the resolved delete target remains the exact test-created temp directory.
    const resolved = path.resolve(root), tempRoot = path.resolve(os.tmpdir());
    assert.equal(path.dirname(resolved), tempRoot);
    assert.match(path.basename(resolved), /^ip3-local-release-[A-Za-z0-9]+$/);
    fs.rmSync(resolved, { recursive: true, force: true });
  });
  const dist = path.join(root, 'dist');
  const write = (name, bytes) => { const file = path.join(dist, name); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, bytes); };
  for (const page of ['index','about','why-ip3','approach','capabilities','sectors','engagements','insights','people','contact','privacy','terms','404']) write(page + '.html', '<!doctype html><title>IP3</title>');
  for (const slug of sectorSlugs) write('sectors/' + slug + '.html', '<!doctype html><title>Sector</title>');
  write('build.json', JSON.stringify({ commit: COMMIT, pageCount: 21, validated: true }));
  write('robots.txt', 'User-agent: *'); write('sitemap.xml', '<urlset/>'); write('site.webmanifest', '{}');
  write('assets/img/profile.webp', Buffer.from([0,1,2]));
  return { root, dist, write, options: { dist, commit: COMMIT, sectorSlugs } };
}
test('valid build produces deterministic manifest with disabled upload and promotion', t => {
  const f = fixture(t), a = planRelease(f.options), b = planRelease(f.options);
  assert.equal(a.manifest.pageCount, 21); assert.equal(a.manifest.files.length, 26);
  assert.equal(a.manifestSha256, b.manifestSha256);
  assert.equal(a.uploadEnabled, false); assert.equal(a.promotionEnabled, false); assert.equal(a.approvalRequired, true);
});
test('rejects traversal, encoded paths, absolute paths, control chars and Windows paths', () => {
  for (const value of ['../secrets','/etc/passwd','a/../b','a\\b','a/%2e%2e/b','C:/site','a//b','a\0b','assets/.git/config']) assert.throws(() => safeRelative(value));
});
test('rejects WordPress root paths regardless of case', () => {
  for (const value of ['public_html','a/PUBLIC_HTML/b','a/wp-content/b']) assert.throws(() => safeLocalPath(value), /WordPress/);
});
test('rejects missing pages and unvalidated or wrong-commit build', t => {
  const f = fixture(t);
  assert.throws(() => planRelease({ ...f.options, commit: 'b'.repeat(40) }), /identity/);
  f.write('build.json', JSON.stringify({ commit: COMMIT, pageCount: 21, validated: false }));
  assert.throws(() => planRelease(f.options), /identity/);
  fs.unlinkSync(path.join(f.dist, 'people.html'));
  assert.throws(() => planRelease(f.options), /Missing/);
});
test('rejects source files, environment files, unexpected PHP and source maps', t => {
  const f = fixture(t);
  for (const name of ['.env','src/data.js','api/shell.php','assets/js/site.js.map']) {
    f.write(name, 'x'); assert.throws(() => planRelease(f.options)); fs.unlinkSync(path.join(f.dist, name));
  }
});
test('rejects credential marker embedded in otherwise allowed public file', t => {
  const f = fixture(t); f.write('assets/js/site.js', '-----BEGIN PRIVATE KEY-----');
  assert.throws(() => planRelease(f.options), /credential/);
});
test('rejects arbitrary remote target and accepts only private immutable release proposal', t => {
  const f = fixture(t);
  for (const remoteTarget of ['/home/u123/domains/ip3-bd.org/public_html','/tmp/release','/home/u123/ip3-static-releases/latest','/home/u123/ip3-static-releases/' + COMMIT + '/..']) assert.throws(() => planRelease({ ...f.options, remoteTarget }));
  const p = planRelease({ ...f.options, remoteTarget: '/home/u123/ip3-static-releases/' + COMMIT });
  assert.equal(p.uploadEnabled, false);
});
test('explicit Hostinger mode allows only the exact reviewed runtime overlay names', t => {
  const f = fixture(t);
  for (const name of ['.htaccess','api/contact.php','api/contact-lib.php']) f.write(name, '{}');
  f.write('hostinger-build.json', JSON.stringify({ sourceCommit: COMMIT, pageCount: 21, deployed: false, requiresReviewedPromotion: true }));
  assert.throws(() => planRelease(f.options), /Unexpected/);
  const p = planRelease({ ...f.options, hostinger: true }); assert.equal(p.manifest.files.length, 30);
  f.write('api/secret.php', '{}'); assert.throws(() => planRelease({ ...f.options, hostinger: true }), /Unexpected/);
});
test('local package hashes bytes and refuses overwrite', t => {
  const f = fixture(t), p = planRelease(f.options), output = writeLocalPackage(p, f.root);
  assert.equal(fs.readFileSync(path.join(output, 'payload/index.html'), 'utf8'), '<!doctype html><title>IP3</title>');
  assert.equal(JSON.parse(fs.readFileSync(path.join(output, 'manifest.json'))).commit, COMMIT);
  assert.ok(fs.existsSync(path.join(output, 'INCOMPLETE')));
  assert.throws(() => writeLocalPackage(p, f.root), /overwrite/);
});
test('source mutation between planning and packaging fails closed', t => {
  const f = fixture(t), p = planRelease(f.options); f.write('index.html', 'changed');
  assert.throws(() => writeLocalPackage(p, f.root), /changed/);
});

test('package verification rejects changed bytes, missing/extra files and unpinned manifest', t => {
  const f = fixture(t), p = planRelease(f.options), output = writeLocalPackage(p, f.root);
  assert.equal(verifyLocalPackage(output, p.manifestSha256).verified, true);
  assert.throws(() => verifyLocalPackage(output, '0'.repeat(64)), /Manifest hash/);
  const index = path.join(output, 'payload/index.html'), bytes = fs.readFileSync(index);
  fs.writeFileSync(index, 'tampered'); assert.throws(() => verifyLocalPackage(output, p.manifestSha256), /file\/hash/);
  fs.writeFileSync(index, bytes);
  const extra = path.join(output, 'payload/assets/img/extra.webp'); fs.writeFileSync(extra, 'extra');
  assert.throws(() => verifyLocalPackage(output, p.manifestSha256), /file\/hash/); fs.unlinkSync(extra);
  fs.unlinkSync(index); assert.throws(() => verifyLocalPackage(output, p.manifestSha256), /file\/hash/);
});

test('stale Hostinger overlay metadata fails closed', t => {
  const f = fixture(t);
  for (const name of ['.htaccess','api/contact.php','api/contact-lib.php']) f.write(name, '{}');
  f.write('hostinger-build.json', JSON.stringify({ sourceCommit: 'b'.repeat(40), pageCount: 21, deployed: false, requiresReviewedPromotion: true }));
  assert.throws(() => planRelease({ ...f.options, hostinger: true }), /overlay identity/);
});
test('rejects directory junctions and symlinks without following them', t => {
  const f = fixture(t), link = path.join(f.dist, 'linked-assets');
  try { fs.symlinkSync(path.join(f.dist, 'assets'), link, process.platform === 'win32' ? 'junction' : 'dir'); }
  catch (error) { if (error.code === 'EPERM') { t.skip('OS denies creating test symlink'); return; } throw error; }
  assert.throws(() => planRelease(f.options), /Symlinks/);
  assert.throws(() => safeLocalPath(link), /Symlinks/);
});
test('exact sector identities required; no duplicates or unsafe slugs', t => {
  const f = fixture(t);
  assert.throws(() => planRelease({ ...f.options, sectorSlugs: Array(8).fill('same') }), /distinct/);
  assert.throws(() => planRelease({ ...f.options, sectorSlugs: ['../escape', ...sectorSlugs.slice(1)] }), /distinct/);
});

test('existing logo density suffixes and image names remain allowed without path escapes', t => {
  const f = fixture(t);
  f.write('assets/logo/ip3-logo-nav-reverse@1x.png', 'image');
  f.write('assets/img/example (1).webp', 'image');
  assert.ok(planRelease(f.options).manifest.files.some(x => x.path.endsWith('@1x.png')));
  assert.throws(() => safeRelative('assets/img/../private.png'), /Unsafe/);
});

test('Insights PNG and WebP media package safely; executable and unsupported media fail closed', t => {
  const f = fixture(t);
  f.write('assets/insights/3355-cover.webp', 'image');
  f.write('assets/insights/figures/finance-chart.png', 'image');
  const plan = planRelease(f.options);
  assert.equal(plan.manifest.files.filter(x => x.path.startsWith('assets/insights/')).length, 2);
  const output = writeLocalPackage(plan, f.root);
  assert.equal(verifyLocalPackage(output, plan.manifestSha256).verified, true);
  for (const name of ['payload.php', 'unreviewed.svg', 'image.jpg']) {
    f.write('assets/insights/' + name, 'unsafe');
    assert.throws(() => planRelease(f.options), /Unexpected public file/);
    fs.unlinkSync(path.join(f.dist, 'assets/insights', name));
  }
  assert.throws(() => safeRelative('assets/insights/../private.webp'), /Unsafe/);
});

test('verified article identities determine exact release page count and missing/extra routes fail closed', t => {
  const f = fixture(t), articleSlugs = ['verified-article-one', 'verified-article-two'];
  for (const slug of articleSlugs) f.write('insights/' + slug + '.html', '<!doctype html><title>Full article</title>');
  f.write('build.json', JSON.stringify({ commit: COMMIT, pageCount: 23, validated: true, articleSlugs }));
  const plan = planRelease({ ...f.options, articleSlugs });
  assert.equal(plan.manifest.pageCount, 23); assert.deepEqual(plan.manifest.articleSlugs, articleSlugs);
  assert.equal(plan.manifest.articlePreservationComplete, false);
  assert.equal(plan.uploadEnabled, false); assert.equal(plan.promotionEnabled, false); assert.equal(plan.releaseReady, false);
  assert.throws(() => planRelease(f.options), /Unexpected|identity/);
  assert.throws(() => planRelease({ ...f.options, articleSlugs: ['verified-article-one', '../escape'] }));
  fs.unlinkSync(path.join(f.dist, 'insights/verified-article-two.html'));
  assert.throws(() => planRelease({ ...f.options, articleSlugs }), /Missing/);
});

test('local recovery rehearsal restores the previous pinned payload after a simulated file replacement', t => {
  const f = fixture(t), before = planRelease(f.options), previous = writeLocalPackage(before, f.root);
  const nextCommit = 'b'.repeat(40);
  f.write('index.html', '<!doctype html><title>Candidate version</title>');
  f.write('build.json', JSON.stringify({ commit: nextCommit, pageCount: 21, validated: true }));
  const next = planRelease({ ...f.options, commit: nextCommit }), candidate = writeLocalPackage(next, f.root);
  const simulated = path.join(f.root, 'local-recovery-fixture');
  assert.equal(path.dirname(path.resolve(simulated)), path.resolve(f.root));
  fs.cpSync(previous, simulated, { recursive: true });
  assert.equal(verifyLocalPackage(simulated, before.manifestSha256).verified, true);
  fs.rmSync(simulated, { recursive: true });
  fs.cpSync(candidate, simulated, { recursive: true });
  assert.equal(verifyLocalPackage(simulated, next.manifestSha256).verified, true);
  fs.rmSync(simulated, { recursive: true });
  fs.cpSync(previous, simulated, { recursive: true });
  assert.equal(verifyLocalPackage(simulated, before.manifestSha256).verified, true);
  assert.equal(before.uploadEnabled, false); assert.equal(next.promotionEnabled, false);
});
