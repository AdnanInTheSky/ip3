// Local-only Hostinger adapter. Does not edit dist sources or contact credentials.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { outputPath } = require('../../build/local-output');
const { validateRedirects } = require('./redirect-policy.cjs');
const { articleRedirects } = require('../../cms/articles');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(__dirname, 'dist-hostinger');
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
// Apache otherwise appends the inherited query after a literal fragment.
const redirectDestination = (s) => s.includes('#') ? s.replace('#', '?%{QUERY_STRING}#') : s;

function generateHtaccess(routes, redirects, { legacyPreview = false, articleRules = [] } = {}) {
  validateRedirects(routes, redirects);
  const lines = [
    '# Generated Hostinger LOCAL proof of concept. Not deployed or approved for activation.',
    '# No cross-domain or HTTPS redirect is activated by this adapter.',
    'Options -Indexes -MultiViews', 'DirectoryIndex index.html', 'DirectorySlash Off', 'ErrorDocument 404 /404.html',
    'RewriteEngine On',
    'RewriteRule "(^|/)\\.(?!well-known(?:/|$))" - [F,L]',
    'RewriteRule "^api/contact-lib\\.php$" - [F,L]',
    'RewriteCond %{QUERY_STRING} (^|&)[^=&]*%[^=&]*=',
    'RewriteRule "^(?:index\\.(?:php|html))?$" - [R=404,L]',
  ];
  if (legacyPreview || articleRules.length) {
    const candidate = [...articleRules, ...(legacyPreview ? JSON.parse(fs.readFileSync(path.join(__dirname, 'confirmed-legacy-preview.json'), 'utf8')) : [])];
    validateRedirects(routes, [...candidate, ...redirects], { queryAllowed: true });
    for (const key of ['p', 'page_id']) lines.push(`RewriteCond %{QUERY_STRING} (^|&)${key}=[^&]*&(?:[^&]*&)*${key}(?:=|&|$) [NC]`,
      'RewriteRule "^(?:index\\.(?:php|html))?$" - [R=404,L]');
    for (const rule of candidate) {
      if (!rule.destination.startsWith('/') || rule.destination.startsWith('//')) throw new Error('Relative redirects required');
      if (rule.has) {
        const id = rule.has[0].value;
        const key = rule.has[0].key;
        if (!/^\d+$/.test(id) || !['page_id', 'p'].includes(key)) throw new Error('Unexpected legacy rule');
        const otherKeys = ['p', 'page_id', 'paged', 'author', 'cat', 's', 'feed'].filter(k => k !== key).join('|');
        lines.push(`RewriteCond %{QUERY_STRING} (^|&)${key}=${id}(&|$)`,
          `RewriteCond %{QUERY_STRING} !(^|&)(${otherKeys})(?:=|&|$) [NC]`,
          `RewriteRule "^${escape(rule.source.slice(1))}$" "${rule.destination}" [R=308,L,NE,QSD]`);
      } else lines.push(`RewriteRule "^${escape(rule.source.slice(1))}/?$" "${redirectDestination(rule.destination)}" [R=308,L,NE]`);
    }
  }
  // An unresolved WordPress selector must not silently serve the static home page.
  lines.push('RewriteCond %{QUERY_STRING} (^|&)(p|page_id|paged|author|cat|s|feed)(?:=|&|$) [NC]',
    'RewriteRule "^" - [R=404,L]');
  for (const rule of redirects) {
    if (rule.has || !rule.destination.startsWith('/') || rule.destination.startsWith('//')) throw new Error('Unsupported baseline redirect');
    // THE_REQUEST distinguishes an external .html request from an internal clean-URL rewrite.
    const aliasPath = escape(rule.source.slice(1)) + (rule.source.endsWith('.html') ? '' : '/?');
    const requestGuard = `RewriteCond %{THE_REQUEST} "\\s/+${aliasPath}(?:[?\\s])" [NC]`;
    if (rule.destination.includes('#')) lines.push(requestGuard, 'RewriteCond %{QUERY_STRING} !^$',
      `RewriteRule "^${aliasPath}$" "${redirectDestination(rule.destination)}" [R=308,L,NE]`);
    const flags = rule.destination.includes('#') ? 'R=308,L,NE,QSD' : 'R=308,L,NE';
    lines.push(requestGuard, `RewriteRule "^${aliasPath}$" "${rule.destination}" [${flags}]`);
  }
  for (const route of routes.filter((r) => r !== '/')) {
    const relative = route.slice(1);
    lines.push(`RewriteCond %{THE_REQUEST} "\\s/+${escape(relative)}\\.html(?:[?\\s])" [NC]`,
      `RewriteRule "^${escape(relative)}\\.html$" "${route}" [R=308,L,NE]`,
      `RewriteRule "^${escape(relative)}/$" "${route}" [R=308,L,NE]`);
  }
  lines.push('RewriteRule "^api/contact$" "api/contact.php" [L]',
    'RewriteRule "^(?!api/contact\\.php$).*\\.php(?:/|$)" - [F,L,NC]');
  for (const route of routes.filter((r) => r !== '/')) {
    lines.push(`RewriteRule "^${escape(route.slice(1))}$" "${route.slice(1)}.html" [L]`);
  }
  lines.push('<IfModule mod_headers.c>',
    'Header always set X-Content-Type-Options "nosniff"',
    'Header always set X-Frame-Options "SAMEORIGIN"',
    'Header always set Referrer-Policy "strict-origin-when-cross-origin"',
    'Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"',
    '<FilesMatch "\\.(?:css|js)$">',
    'Header set Cache-Control "public, max-age=31536000, immutable"', '</FilesMatch>',
    '<FilesMatch "\\.(?:avif|webp|png|jpe?g|svg|ico|mp4|webm|woff2?)$">',
    'Header set Cache-Control "public, max-age=604800, stale-while-revalidate=86400"', '</FilesMatch>',
    '</IfModule>', '');
  return lines.join('\n');
}

function walk(dir, prefix = '') {
  return fs.readdirSync(dir, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name)).flatMap((e) => {
    if (e.isSymbolicLink()) throw new Error('Symlink build input is unsupported');
    const name = prefix + e.name;
    return e.isDirectory() ? walk(path.join(dir, e.name), name + '/') : [name];
  });
}
function build({ legacyPreview = false, output } = {}) {
  const out = outputPath(ROOT, output || OUT, { fresh: Boolean(output) });
  const staticOut = output ? outputPath(ROOT, out + '-static') : path.join(ROOT, 'dist');
  const result = spawnSync(process.execPath, ['build/build-all.js', ...(output ? ['--output', staticOut] : [])], { cwd: ROOT, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr + result.stdout);
  process.stdout.write(result.stdout); process.stderr.write(result.stderr);
  if (!output && (path.dirname(out) !== __dirname || path.basename(out) !== 'dist-hostinger')) throw new Error('Unsafe output path');
  walk(staticOut);
  // Only this fixed generated local directory is replaced; no hosting path is accepted.
  if (!output) fs.rmSync(out, { recursive: true, force: true });
  fs.cpSync(staticOut, out, { recursive: true });
  const pages = walk(out).filter((f) => f.endsWith('.html'));
  const routes = pages.map((f) => f === 'index.html' ? '/' : '/' + f.slice(0,-5));
  const config = require(path.join(ROOT, 'vercel.json'));
  fs.writeFileSync(path.join(out, '.htaccess'), generateHtaccess(routes, config.redirects, { legacyPreview, articleRules: articleRedirects() }));
  fs.mkdirSync(path.join(out, 'api'), { recursive: true });
  fs.copyFileSync(path.join(__dirname, 'contact/index.php'), path.join(out, 'api/contact.php'));
  fs.copyFileSync(path.join(__dirname, 'contact/handler.php'), path.join(out, 'api/contact-lib.php'));
  const stamp = JSON.parse(fs.readFileSync(path.join(out, 'build.json')));
  const metadata = { adapter: 'hostinger-local-poc', sourceCommit: stamp.commit, pageCount: pages.length,
    legacyPreview, contactEnabled: process.env.CONTACT_API_ENABLED === '1', deployed: false,
    routeCount: routes.length, articleSlugs: stamp.articleSlugs, articlePreservationComplete: stamp.articlePreservationComplete,
    contentHash: stamp.contentHash, sourceHash: stamp.sourceHash,
    sourceDirty: stamp.sourceDirty, requiresReviewedPromotion: true };
  fs.writeFileSync(path.join(out, 'hostinger-build.json'), JSON.stringify(metadata, null, 2) + '\n');
  const files = walk(out);
  const inventory = files.map((file) => ({ file, bytes: fs.statSync(path.join(out,file)).size,
    sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(out,file))).digest('hex') }));
  const summary = { ...metadata, bytes: inventory.reduce((n,f) => n + f.bytes,0), files: inventory.length, routes, inventory };
  fs.mkdirSync(path.join(__dirname, 'evidence'), { recursive: true });
  fs.writeFileSync(output ? out + '-inventory.json' : path.join(__dirname, 'evidence/build-inventory.json'), JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify({ ...metadata, files: files.length, bytes: summary.bytes, out }));
  return summary;
}
if (require.main === module) {
  const args = process.argv.slice(2);
  let output;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--legacy-preview') continue;
    if (args[i] === '--output' && args[i + 1]) output = path.resolve(args[++i]);
    else throw new Error('Only local --legacy-preview and --output <new directory> are supported');
  }
  build({ legacyPreview: args.includes('--legacy-preview'), output });
}
module.exports = { build, generateHtaccess };
