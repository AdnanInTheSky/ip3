const fs = require('node:fs');
const path = require('node:path');
const manifest = require('./theme-fonts.json');
const sources = [...manifest.files, ...manifest.optimizedFonts];
const localCss = fs.readFileSync(path.join(__dirname, '../assets/fonts/theme.css'), 'utf8');
// Preserve the site's existing dedicated font CDN connection, avoiding HTTP/1
// contention with page media in local previews. Keep exact local mirrors when
// the font CDN is unavailable. The Google stylesheet API is no longer blocking.
const css = localCss.replace(/url\(\/assets\/fonts\/([^)]+)\) format\('woff2'\)/g, (full, name) => {
  const font = sources.find(f => f.filename === name); if (!font) throw Error(`Unpinned font ${name}`);
  return `url(${font.source}) format('woff2'), ${full}`;
});
// Network proofs identify these four Latin faces in the visible shared chrome,
// headline and lead. Discover them before CSS/layout rather than a late cascade.
// All other weights/language subsets remain demand-loaded.
const faces = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(m => m[1]);
const critical = [['Lato', 'normal', 400], ['Fraunces', 'normal', 400], ['Fraunces', 'italic', 400], ['Montserrat', 'normal', 600]];
const preloads = critical.map(([family, style, weight]) => {
  const face = faces.find(f => {
    const range = f.match(/font-weight:\s*(\d+)(?:\s+(\d+))?\s*;/);
    return f.includes(`font-family: '${family}'`) && f.includes(`font-style: ${style};`) && /U\+0000-00FF/.test(f) && range && weight >= +range[1] && weight <= +(range[2] || range[1]);
  });
  if (!face) throw Error(`Missing critical ${family} ${style} ${weight} Latin face`);
  return face.match(/url\(([^)]+)\)/)[1];
});
module.exports = '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' + [...new Set(preloads)].map(href => `<link rel="preload" href="${href}" as="font" type="font/woff2" crossorigin>`).join('\n') + `\n<style data-theme-fonts>${css}</style>`;
