// Local packaging only. No shell, SSH, network, upload, promotion or deletion APIs.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const BASE_PAGES = ['index','about','why-ip3','approach','capabilities','sectors','engagements','insights','people','contact','privacy','terms','404'].map(x => x + '.html');
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const reject = message => { throw new Error(message); };
function safeRelative(value) {
  if (typeof value !== 'string' || !value || /[\\\x00-\x1f:%]/.test(value) || value.startsWith('/') || value.split('/').some(x => !x || x === '.' || x === '..')) reject('Unsafe relative path');
  if (value.split('/').some(x => /^(public_html|wp-admin|wp-content|wp-includes|\.git|\.ssh|node_modules)$/i.test(x))) reject('Live WordPress/private path forbidden');
  if (value.split('/').some(x => /^(\.env(?:\..*)?|wp-config\.php|id_rsa|id_ed25519|credentials(?:\..*)?)$/i.test(x))) reject('Secret filename forbidden');
  return value;
}
function noSymlinkAncestors(location) {
  let current = path.resolve(location);
  while (true) {
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) reject('Symlinks/junctions forbidden');
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
}
function safeLocalPath(location) {
  const absolute = path.resolve(location);
  if (absolute.split(/[\\/]/).some(x => /^(public_html|wp-admin|wp-content|wp-includes)$/i.test(x))) reject('Live WordPress path forbidden');
  noSymlinkAncestors(absolute);
  return absolute;
}
function scan(root, expectedPages, overlay = false, hostinger = false) {
  root = safeLocalPath(root);
  if (!fs.statSync(root).isDirectory()) reject('Expected local directory');
  const files = [];
  function walk(dir, prefix = '') {
    for (const name of fs.readdirSync(dir).sort()) {
      const relative = safeRelative(prefix + name);
      const file = path.join(dir, name), stat = fs.lstatSync(file);
      if (stat.isSymbolicLink()) reject('Symlinks/junctions forbidden');
      if (stat.isDirectory()) { walk(file, relative + '/'); continue; }
      if (!stat.isFile() || stat.nlink > 1) reject('Only ordinary unlinked files permitted');
      const hostingerAllowed = hostinger && ['.htaccess','api/contact.php','api/contact-lib.php','hostinger-build.json'].includes(relative);
      const allowed = overlay
        ? relative === '.htaccess'
        : hostingerAllowed || expectedPages.includes(relative) || ['build.json','robots.txt','sitemap.xml','site.webmanifest'].includes(relative) || /^assets\/insights\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+\.(?:png|webp)$/i.test(relative) || /^assets\/(?:img|video|logo|vendor|css|js)\/[a-zA-Z0-9_./ @()-]+\.(?:webp|jpg|jpeg|png|svg|ico|mp4|webm|woff2?|ttf|otf|css|js|txt)$/i.test(relative);
      if (!allowed) reject('Unexpected public file: ' + relative);
      const bytes = fs.readFileSync(file);
      // Conservative leak screening, not a replacement for repository secret review.
      if (/-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----|\b(?:ghp_|github_pat_)[A-Za-z0-9_]{20,}|\bAKIA[A-Z0-9]{16}\b|\bsk_live_[A-Za-z0-9]{16,}/.test(bytes.toString('utf8'))) reject('Potential credential in ' + relative);
      files.push({ path: relative, bytes: bytes.length, sha256: sha256(bytes), source: file });
    }
  }
  walk(root);
  return files;
}
function planRelease({ dist, commit, sectorSlugs, articleSlugs = [], overlay = null, remoteTarget = null, hostinger = false }) {
  if (!/^[a-f0-9]{40}$/.test(commit || '')) reject('Exact lowercase 40-character approved commit required');
  if (!Array.isArray(sectorSlugs) || sectorSlugs.length !== 8 || new Set(sectorSlugs).size !== 8 || sectorSlugs.some(x => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x))) reject('Exact eight distinct sector slugs required');
  if (!Array.isArray(articleSlugs) || new Set(articleSlugs).size !== articleSlugs.length || articleSlugs.some(x => !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x))) reject('Exact distinct verified article slugs required');
  const expectedPages = BASE_PAGES.concat(sectorSlugs.map(x => 'sectors/' + x + '.html'), articleSlugs.map(x => 'insights/' + x + '.html'));
  const files = scan(dist, expectedPages, false, hostinger);
  for (const required of expectedPages.concat(['build.json','robots.txt','sitemap.xml','site.webmanifest'])) if (!files.some(x => x.path === required)) reject('Missing required file: ' + required);
  const build = JSON.parse(fs.readFileSync(path.join(dist, 'build.json'), 'utf8'));
  if (build.commit !== commit || build.validated !== true || build.pageCount !== expectedPages.length || JSON.stringify(build.articleSlugs || []) !== JSON.stringify(articleSlugs)) reject('Build identity/validation mismatch');
  if (hostinger) {
    const stamp = JSON.parse(fs.readFileSync(path.join(dist, 'hostinger-build.json'), 'utf8'));
    if (stamp.sourceCommit !== commit || stamp.pageCount !== expectedPages.length || stamp.deployed !== false || JSON.stringify(stamp.articleSlugs || []) !== JSON.stringify(articleSlugs) ||
        stamp.contentHash !== build.contentHash || stamp.sourceHash !== build.sourceHash || stamp.requiresReviewedPromotion !== true)
      reject('Hostinger overlay identity mismatch');
  }
  if (overlay) files.push(...scan(overlay, expectedPages, true));
  files.sort((a,b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  if (new Set(files.map(x => x.path.toLowerCase())).size !== files.length) reject('Duplicate or case-colliding path');
  if (remoteTarget !== null && !new RegExp('^/home/u[0-9]+/ip3-static-releases/' + commit + '$').test(remoteTarget)) reject('Only a non-public immutable release path may be proposed');
  const publicFiles = files.map(({ source, ...rest }) => rest);
  const manifest = { version: 3, commit, pageCount: expectedPages.length, articleSlugs, articlePreservationComplete: build.articlePreservationComplete === true, preparationArticleSlugs: build.preparationArticleSlugs || [], sourceHash: build.sourceHash || null,
    sourceDirty: build.sourceDirty ?? null, reproducibleClock: build.reproducibleClock === true,
    totalBytes: files.reduce((n,x) => n + x.bytes, 0), files: publicFiles };
  return { manifest, manifestSha256: sha256(JSON.stringify(manifest)), remoteTarget, draft: true,
    approvalStatus: 'pending_approval', releaseReady: false, uploadEnabled: false, promotionEnabled: false, approvalRequired: true, files };
}
function verifyLocalPackage(output, expectedManifestSha256) {
  output = safeLocalPath(output);
  if (!/^[a-f0-9]{64}$/.test(expectedManifestSha256 || '')) reject('Pinned manifest hash required');
  const manifestFile = path.join(output, 'manifest.json');
  const stat = fs.lstatSync(manifestFile);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1) reject('Invalid manifest file');
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
  if (sha256(JSON.stringify(manifest)) !== expectedManifestSha256) reject('Manifest hash mismatch');
  const expectedPages = manifest.files.filter(x => x.path.endsWith('.html')).map(x => x.path);
  const actual = scan(path.join(output, 'payload'), expectedPages, false, manifest.files.some(x => x.path === 'hostinger-build.json'))
    .map(({ source, ...rest }) => rest).sort((a,b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  if (JSON.stringify(actual) !== JSON.stringify(manifest.files)) reject('Package file/hash mismatch');
  return { verified: true, files: actual.length, manifestSha256: expectedManifestSha256,
    uploadEnabled: false, promotionEnabled: false, releaseReady: false };
}
function writeLocalPackage(plan, workspace) {
  workspace = safeLocalPath(workspace);
  const output = path.join(workspace, 'hosting', 'hostinger', 'publishing', '.local-releases', plan.manifest.commit);
  safeLocalPath(output);
  if (fs.existsSync(output)) reject('Release package already exists; overwrite forbidden');
  fs.mkdirSync(output, { recursive: true });
  fs.writeFileSync(path.join(output, 'INCOMPLETE'), 'Local only; not deployable until verified.\n', { flag: 'wx' });
  for (const item of plan.files) {
    const target = path.join(output, 'payload', item.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const bytes = fs.readFileSync(item.source);
    if (sha256(bytes) !== item.sha256) reject('Source changed during packaging');
    fs.writeFileSync(target, bytes, { flag: 'wx' });
    if (sha256(fs.readFileSync(target)) !== item.sha256) reject('Package verification failed');
  }
  fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify(plan.manifest, null, 2) + '\n', { flag: 'wx' });
  verifyLocalPackage(output, plan.manifestSha256);
  // INCOMPLETE remains intentionally: no executable promotion capability exists in this POC.
  return output;
}
if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    if (args.some(x => !['--write-local','--hostinger'].includes(x))) reject('Only --hostinger and --write-local are supported; no remote or activation mode exists');
    const workspace = path.resolve(__dirname, '../../..');
    const sectorSlugs = JSON.parse(fs.readFileSync(path.join(workspace, 'content/sectors.json'))).items.map(x => x.slug);
    const articleSlugs = require('../../../cms/articles').visibleArticles().map(a => a.slug);
    const build = JSON.parse(fs.readFileSync(path.join(workspace, 'dist/build.json')));
    const plan = planRelease({ dist: path.join(workspace, args.includes('--hostinger') ? 'hosting/hostinger/dist-hostinger' : 'dist'), commit: build.commit, sectorSlugs, articleSlugs, hostinger: args.includes('--hostinger') });
    const { files, ...summary } = plan;
    if (args.includes('--write-local')) summary.localPackage = writeLocalPackage(plan, workspace);
    console.log(JSON.stringify(summary, null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
module.exports = { safeRelative, safeLocalPath, scan, planRelease, writeLocalPackage, verifyLocalPackage };
