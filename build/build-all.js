// Static site generator: renders every page to plain HTML in the repo root.
// Run: npm run build   (no dependencies — Node 18+)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');

// 0. content check — a bad edit stops here, so the previous deploy stays live
if (require('./validate').run().errors.length) process.exit(1);

const cfg = require('../src/config');
const D = require('../src/data');
const home = require('../src/pages-home').home;
const P = require('../src/pages-inner');

const hash = (s) => crypto.createHash('md5').update(s).digest('hex').slice(0, 8);
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, c) => { const f = path.join(ROOT, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, c); };

// 1. assets: copy CSS + JS (strip comments/blank space for size)
const css = read('src/css/site.css').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*\n/g, '\n');
const js = read('src/js/site.js');
write('assets/css/site.css', css);
write('assets/js/site.js', js);
const V = { __CSSV__: hash(css), __JSV__: hash(js) };

// 2. pages
const pages = [
  ['index.html', home()],
  ['about.html', P.about()],
  ['approach.html', P.approach()],
  ['capabilities.html', P.capabilities()],
  ['sectors.html', P.sectorsIndex()],
  ...D.sectors.map((s, i) => [`sectors/${s.slug}.html`, P.sectorPage(s, i)]),
  ['engagements.html', P.engagements()],
  ['insights.html', P.insights()],
  ['people.html', P.people()],
  ['contact.html', P.contact()],
  ['privacy.html', P.legal('privacy')],
  ['terms.html', P.legal('terms')],
  ['404.html', P.notFound()],
];
for (const [file, html] of pages) write(file, html.replace(/__CSSV__|__JSV__/g, (m) => V[m]));

// 3. sitemap, robots, manifest
const urls = pages.map(([f]) => f).filter((f) => f !== '404.html').map((f) => (f === 'index.html' ? '/' : '/' + f.replace(/\.html$/, '')));
const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${cfg.url}${u}</loc><lastmod>${today}</lastmod><priority>${u === '/' ? '1.0' : u.split('/').length > 2 ? '0.6' : '0.8'}</priority></url>`).join('\n')}\n</urlset>\n`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${cfg.url}/sitemap.xml\n`);
write('site.webmanifest', JSON.stringify({ name: cfg.name, short_name: 'IP3', start_url: '/', display: 'standalone', background_color: '#faf8f5', theme_color: '#12100f', icons: [{ src: '/assets/logo/icon-192.png', sizes: '192x192', type: 'image/png' }, { src: '/assets/logo/icon-512.png', sizes: '512x512', type: 'image/png' }] }, null, 2));

// npm run audit  → lists content fields that no page reads (editing them would change nothing)
if (process.argv.includes('--audit')) {
  const dead = require('../src/content').unread();
  console.log(dead.length ? `\n${dead.length} content field(s) never read by any page:\n  ${dead.join('\n  ')}` : '\nEvery content field is used by a page.');
}
console.log(`Built ${pages.length} pages, sitemap with ${urls.length} URLs.`);
