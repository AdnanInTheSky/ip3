// Maintenance only. Pin Google-generated SOFT=0 Latin faces and local mirrors.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const { request } = require('@playwright/test');
const root = path.join(__dirname, '..'), filename = path.join(root, 'src/theme-fonts.json');
(async () => {
  const manifest = JSON.parse(fs.readFileSync(filename)), source = manifest.source.replaceAll('0..100', '0');
  const client = await request.newContext({ userAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Mobile Safari/537.36' });
  try {
    const get = async url => { const r = await client.get(url); if (!r.ok()) throw Error(`${r.status()} ${url}`); return r.body(); };
    const faces = [...(await get(source)).toString('utf8').matchAll(/@font-face\s*\{([^}]+)\}/g)].map(m => m[1]);
    const originalCss = fs.readFileSync(path.join(root, 'assets/fonts/theme-source.css'), 'utf8');
    const originals = [...originalCss.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(m => m[1]);
    let deliveryCss = originalCss; const optimized = [];
    for (const style of ['normal', 'italic']) {
      const match = f => f.includes("font-family: 'Fraunces'") && f.includes(`font-style: ${style};`) && f.includes('U+0000-00FF');
      const face = faces.find(match), old = originals.find(match);
      const url = face.match(/url\(([^)]+)\)/)[1], name = url.split('/').at(-1), original = old.match(/url\(\/assets\/fonts\/([^)]+)\)/)[1];
      const bytes = await get(url); fs.writeFileSync(path.join(root, 'assets/fonts', name), bytes);
      optimized.push({ filename: name, source: url, original, style, weightRange: [100, 900], soft: 0, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), retainedVariableAxes: ['opsz', 'wght', 'WONK'] });
      deliveryCss = deliveryCss.replace(original, name);
    }
    manifest.optimizedFonts = optimized; manifest.optimizedSource = source;
    manifest.delivery = 'Embedded font-face declarations, existing Google font CDN primary with byte-identical same-origin fallback; no visitor/build Google stylesheet API request.';
    fs.writeFileSync(filename, JSON.stringify(manifest, null, 2) + '\n');
    fs.writeFileSync(path.join(root, 'assets/fonts/theme.css'), deliveryCss);
    console.log(JSON.stringify(optimized));
  } finally { await client.dispose(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
