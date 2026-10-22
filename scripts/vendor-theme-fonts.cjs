// Explicit maintenance task only. Builds never call the Google stylesheet API.
// Preserve the exact Google-provided WOFF2 bytes, axes, weights and subsets.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { request } = require('@playwright/test');
const root = path.join(__dirname, '..');
const source = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,100..900,0..100,0..1;1,9..144,100..900,0..100,0..1&family=Lato:wght@300;400;700&family=Montserrat:wght@400;500;600;700&display=swap';
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
(async () => {
  const client = await request.newContext({ userAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Mobile Safari/537.36' });
  try {
    const get = async url => { const r = await client.get(url); if (!r.ok()) throw Error(`${r.status()} ${url}`); return r.body(); };
    const css = (await get(source)).toString('utf8');
    const directory = path.join(root, 'assets/fonts'); fs.mkdirSync(directory, { recursive: true });
    const files = [];
    for (const url of new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map(m => m[1]))) {
      const filename = url.split('/').at(-1), bytes = await get(url);
      fs.writeFileSync(path.join(directory, filename), bytes);
      files.push({ filename, source: url, bytes: bytes.length, sha256: hash(bytes) });
    }
    const licenses = [];
    for (const name of ['fraunces', 'lato', 'montserrat']) {
      const url = `https://raw.githubusercontent.com/google/fonts/main/ofl/${name}/OFL.txt`;
      const bytes = await get(url), filename = `${name}-OFL.txt`;
      fs.writeFileSync(path.join(directory, filename), bytes);
      licenses.push({ filename, source: url, sha256: hash(bytes) });
    }
    const localCss = css.replace(/https:\/\/fonts\.gstatic\.com\/s\/[^/)]+\/[^/)]+\//g, '/assets/fonts/');
    fs.writeFileSync(path.join(directory, 'theme-source.css'), localCss);
    fs.writeFileSync(path.join(directory, 'theme.css'), localCss);
    fs.writeFileSync(path.join(root, 'src/theme-fonts.json'), JSON.stringify({ source, note: 'Unmodified Google Fonts WOFF2 bytes; full original subsets and variable axes retained.', files, licenses }, null, 2) + '\n');
    console.log(JSON.stringify({ files: files.length, bytes: files.reduce((n, f) => n + f.bytes, 0), licenses: licenses.length }));
  } finally { await client.dispose(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
