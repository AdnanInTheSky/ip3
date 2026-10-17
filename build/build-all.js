// Static site generator: renders the site into dist/ for local and Vercel serving.
// Run: npm run build   (Node.js 24.x)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');
const { outputPath, buildTime, sourceDigest } = require('./local-output');

const ROOT = path.join(__dirname, '..');

async function build({ root = ROOT, assetRoots = [root], quiet = false, output } = {}) {
  const OUT = outputPath(root, output || path.join(root, 'dist'), { fresh: Boolean(output) });
  const timestamp = buildTime();
  // Validate before replacing dist. If a CMS edit is bad, the last good build stays intact.
  const validation = require('./validate').run({ root, assetRoots, quiet });
  if (validation.errors.length) throw new Error('Content validation failed; the previous build was left untouched.');

  if (process.env.VERCEL_ENV === 'production' && !process.env.SITE_URL) {
    console.warn('SITE_URL is unset for a production build; canonical URLs will use content/site.json.');
  }

  const cfg = require('../src/config');
  if (cfg.contactApiEnabled && !cfg.turnstileSiteKey) {
    throw new Error('CONTACT_API_ENABLED=1 requires PUBLIC_TURNSTILE_SITE_KEY so the protected form can render.');
  }
  const D = require('../src/data');
  const home = require('../src/pages-home').home;
  const P = require('../src/pages-inner');
  const { why } = require('../src/pages-why');
  const { articlePage } = require('../src/pages-articles');
  const normalizeText = (value) => value.replace(/\r\n/g, '\n');
  const hash = (s) => crypto.createHash('md5').update(s).digest('hex').slice(0, 8);
  const read = (p) => normalizeText(fs.readFileSync(path.join(root, p), 'utf8'));
  const write = (p, c) => { const f = path.join(OUT, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, typeof c === 'string' ? normalizeText(c) : c); };

  // dist is generated output and can always be recreated from source.
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  fs.cpSync(path.join(root, 'assets'), path.join(OUT, 'assets'), {
    recursive: true,
    filter: source => path.basename(source) !== '.gitkeep',
  });

  // 1. assets: copy CSS + JS (strip comments/blank space for size)
  const css = read('src/css/site.css').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*\n/g, '\n');
  const js = read('src/js/site.js').replaceAll('__IP3_CONTACT_EMAIL__', JSON.stringify(cfg.email));
  const whyJs = read('src/js/why.js');
  // /capabilities loads its own stylesheet and script: every file in src/css/cap and src/js/cap, joined in name order
  const bundle = (dir, ext) => fs.readdirSync(path.join(root, dir)).filter((f) => f.endsWith(ext)).sort().map((f) => read(`${dir}/${f}`)).join('\n');
  const capCss = bundle('src/css/cap', '.css').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*\n/g, '\n');
  const capJs = bundle('src/js/cap', '.js');
  // the eight /sectors/<slug> pages share one stylesheet and script: src/css/sec and src/js/sec, joined in name order
  const secCss = bundle('src/css/sec', '.css').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*\n/g, '\n');
  const secJs = bundle('src/js/sec', '.js');
  write('assets/css/site.css', css);
  write('assets/js/site.js', js);
  write('assets/js/why.js', whyJs);
  write('assets/css/capabilities.css', capCss);
  write('assets/js/capabilities.js', capJs);
  write('assets/css/sectors.css', secCss);
  write('assets/js/sectors.js', secJs);
  const V = { __CSSV__: hash(css), __JSV__: hash(js), __WHYV__: hash(whyJs), __CAPCSSV__: hash(capCss), __CAPJSV__: hash(capJs), __SECCSSV__: hash(secCss), __SECJSV__: hash(secJs) };

  // 2. pages
  const pages = [
    ['index.html', home()],
    ['about.html', P.about()],
    ['why-ip3.html', why()],
    ['approach.html', P.approach()],
    ['capabilities.html', P.capabilities()],
    ['sectors.html', P.sectorsIndex()],
    ...D.sectors.map((s, i) => [`sectors/${s.slug}.html`, P.sectorPage(s, i)]),
    ['engagements.html', P.engagements()],
    ['insights.html', P.insights()],
    ...D.articles.map(article => [`insights/${article.slug}.html`, articlePage(article)]),
    ['people.html', P.people()],
    ['contact.html', P.contact()],
    ['privacy.html', P.legal('privacy')],
    ['terms.html', P.legal('terms')],
    ['404.html', P.notFound()],
  ];
  for (const [file, html] of pages) write(file, html.replace(/__CSSV__|__JSV__|__WHYV__|__CAPCSSV__|__CAPJSV__|__SECCSSV__|__SECJSV__/g, (m) => V[m]));

  // 3. sitemap, robots, manifest
  const urls = pages.map(([f]) => f).filter((f) => f !== '404.html').map((f) => (f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, '')));
  const today = timestamp.toISOString().slice(0, 10);
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${cfg.url}${u}</loc><lastmod>${today}</lastmod><priority>${u === '/' ? '1.0' : u.split('/').length > 2 ? '0.6' : '0.8'}</priority></url>`).join('\n')}\n</urlset>\n`);
  write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${cfg.url}/sitemap.xml\n`);
  write('site.webmanifest', JSON.stringify({ name: cfg.name, short_name: 'IP3', start_url: '/', display: 'standalone', background_color: '#faf8f5', theme_color: '#12100f', icons: [{ src: '/assets/logo/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/assets/logo/icon-512.png', sizes: '512x512', type: 'image/png' }] }, null, 2));

  const contentFiles = [];
  const collectJson = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) collectJson(file);
      else if (entry.isFile() && file.endsWith('.json')) contentFiles.push(file);
    }
  };
  collectJson(path.join(root, 'content'));
  contentFiles.sort((a, b) => a.localeCompare(b));
  const contentDigest = crypto.createHash('sha256');
  for (const file of contentFiles) {
    contentDigest.update(path.relative(root, file).split(path.sep).join('/'));
    contentDigest.update('\0');
    contentDigest.update(fs.readFileSync(file));
    contentDigest.update('\0');
  }
  const gitCommit = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' });
  const vercelGitCommitSha = process.env.VERCEL_GIT_COMMIT_SHA || null;
  const commit = vercelGitCommitSha || (gitCommit.status === 0 ? gitCommit.stdout.trim() : null);
  const gitStatus = spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
  write('build.json', JSON.stringify({
    commit,
    vercelGitCommitSha,
    builtAt: timestamp.toISOString(),
    contentHash: contentDigest.digest('hex'),
    sourceHash: sourceDigest(root),
    sourceDirty: gitStatus.status === 0 ? gitStatus.stdout.trim() !== '' : null,
    reproducibleClock: process.env.SOURCE_DATE_EPOCH !== undefined,
    pageCount: pages.length,
    sitemapUrlCount: urls.length,
    articleSlugs: D.articles.map(a => a.slug),
    articlePreservationComplete: require('../cms/articles').registry.every(item => D.articles.some(a => a.wpId === item.wpId)),
    excludedFromSitemap: [{ route: '/404', reason: 'Custom error document; not an indexable content page.' }],
    validated: true,
  }, null, 2) + '\n');

  if (process.argv.includes('--audit')) {
    const dead = require('../src/content').unread();
    console.log(dead.length ? `\n${dead.length} content field(s) never read by any page:\n  ${dead.join('\n  ')}` : '\nEvery content field is used by a page.');
  }
  console.log(`Built ${pages.length} pages, sitemap with ${urls.length} URLs.`);
  return { pageCount: pages.length, urlCount: urls.length };
}

if (require.main === module) {
  const args = process.argv.slice(2);
  let output;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--audit') continue;
    if (args[i] === '--output' && args[i + 1]) output = path.resolve(args[++i]);
    else throw new Error('Only --audit and --output <new local directory> are supported');
  }
  build({ output }).catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  });
}

module.exports = { build };
