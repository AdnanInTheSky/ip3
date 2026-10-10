const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_DIST = path.join(ROOT, 'dist');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(file) : entry.isFile() ? [file] : [];
  });
}

function decodeHtml(value) {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/gi, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function attr(tag, name) {
  const expression = new RegExp(`(?:^|\\s)${name}\\s*=\\s*(["'])(.*?)\\1`, 'i');
  const match = tag.match(expression);
  return match ? decodeHtml(match[2]) : null;
}

function verify({ dist = DEFAULT_DIST, siteUrl = process.env.SITE_URL || require('../content/site.json').url } = {}) {
  const absoluteDist = path.resolve(dist);
  const siteOrigin = new URL(siteUrl).origin;
  const errors = [];
  if (!fs.existsSync(absoluteDist)) return { errors: ['dist/ is missing; run npm run build first.'], pageCount: 0 };

  function insideDist(file) {
    const relative = path.relative(absoluteDist, file);
    return !relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative);
  }

  function resolveTarget(urlPath) {
    let decoded;
    try { decoded = decodeURIComponent(urlPath); } catch { return null; }
    if (!decoded || decoded === '/') decoded = '/index.html';
    const rel = decoded.replace(/^\/+/, '');
    const candidates = [path.resolve(absoluteDist, rel)];
    if (!path.extname(rel)) {
      candidates.push(path.resolve(absoluteDist, `${rel}.html`));
      candidates.push(path.resolve(absoluteDist, rel, 'index.html'));
    }
    if (decoded.endsWith('/')) candidates.unshift(path.resolve(absoluteDist, rel, 'index.html'));
    for (const file of candidates) if (insideDist(file) && fs.existsSync(file) && fs.statSync(file).isFile()) return file;
    return null;
  }

  function sameSite(url) {
    if (url.origin === siteOrigin) return true;
    const siteHost = new URL(siteOrigin).hostname.replace(/^www\./i, '');
    return url.hostname.replace(/^www\./i, '') === siteHost;
  }

  const htmlFiles = walk(absoluteDist).filter((file) => file.endsWith('.html'));
  const idsByFile = new Map();
  const seenTitles = new Map();
  const seenHeadings = new Map();
  const seenCanonicals = new Map();

  function idsFor(file) {
    if (!idsByFile.has(file)) {
      const html = fs.readFileSync(file, 'utf8');
      idsByFile.set(file, new Set([...html.matchAll(/\b(?:id|name)\s*=\s*(["'])(.*?)\1/gi)].map((match) => decodeHtml(match[2]))));
    }
    return idsByFile.get(file);
  }

  function unique(map, value, file, label) {
    const prior = map.get(value);
    const current = path.relative(absoluteDist, file).split(path.sep).join('/');
    if (prior) errors.push(`${current}: duplicate ${label} also appears in ${prior}`);
    else map.set(value, current);
  }

  for (const sourceFile of htmlFiles) {
    const html = fs.readFileSync(sourceFile, 'utf8');
    const sourcePath = path.relative(absoluteDist, sourceFile).split(path.sep).join('/');
    const base = `${siteOrigin}/${sourcePath}`;

    const titles = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map((match) => decodeHtml(match[1].replace(/<[^>]*>/g, '').trim()));
    if (titles.length !== 1 || !titles[0]) errors.push(`${sourcePath}: expected exactly one non-empty <title>, found ${titles.length}`);
    else unique(seenTitles, titles[0], sourceFile, 'title');

    const headings = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi)].map((match) => decodeHtml(match[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()));
    if (headings.length !== 1 || !headings[0]) errors.push(`${sourcePath}: expected exactly one non-empty <h1>, found ${headings.length}`);
    else unique(seenHeadings, headings[0], sourceFile, 'h1');

    const canonicals = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]).filter((tag) => (attr(tag, 'rel') || '').toLowerCase().split(/\s+/).includes('canonical')).map((tag) => attr(tag, 'href')).filter(Boolean);
    if (canonicals.length !== 1) errors.push(`${sourcePath}: expected exactly one canonical link, found ${canonicals.length}`);
    else {
      unique(seenCanonicals, canonicals[0], sourceFile, 'canonical URL');
      try {
        const canonical = new URL(canonicals[0], siteOrigin);
        if (!sameSite(canonical) || resolveTarget(canonical.pathname) !== sourceFile) errors.push(`${sourcePath}: canonical URL does not resolve back to this generated page`);
      } catch { errors.push(`${sourcePath}: malformed canonical URL ${canonicals[0]}`); }
    }

    const tags = html.matchAll(/<(a|img|script|source|video|link)\b[^>]*>/gi);
    for (const tagMatch of tags) {
      const tag = tagMatch[0];
      const line = html.slice(0, tagMatch.index).split('\n').length;
      if (/^<img\b/i.test(tag) && attr(tag, 'alt') === null) errors.push(`${sourcePath}:${line}: image is missing an alt attribute`);
      const references = [attr(tag, 'href'), attr(tag, 'src'), attr(tag, 'data-src'), attr(tag, 'poster')].filter(Boolean);
      const srcset = attr(tag, 'srcset');
      if (srcset && !/^data:/i.test(srcset.trim())) {
        for (const candidate of srcset.split(',')) {
          const candidateUrl = candidate.trim().split(/\s+/)[0];
          if (candidateUrl) references.push(candidateUrl);
        }
      }
      for (const reference of references) {
        if (/^(?:https?:|mailto:|tel:|javascript:|data:|blob:)/i.test(reference)) continue;
        let url;
        try { url = new URL(reference, base); } catch { errors.push(`${sourcePath}:${line}: malformed URL ${reference}`); continue; }
        if (!sameSite(url)) continue;
        const target = resolveTarget(url.pathname);
        if (!target) {
          errors.push(`${sourcePath}:${line}: ${reference} does not resolve in dist/`);
          continue;
        }
        if (url.hash && target.endsWith('.html')) {
          let fragment;
          try { fragment = decodeURIComponent(url.hash.slice(1)); } catch { errors.push(`${sourcePath}:${line}: malformed fragment in ${reference}`); continue; }
          if (!idsFor(target).has(fragment)) errors.push(`${sourcePath}:${line}: ${reference} has no matching id in ${path.relative(absoluteDist, target).split(path.sep).join('/')}`);
        }
      }
    }
  }

  const sitemapFile = path.join(absoluteDist, 'sitemap.xml');
  if (!fs.existsSync(sitemapFile)) errors.push('dist/sitemap.xml is missing');
  else {
    const sitemap = fs.readFileSync(sitemapFile, 'utf8');
    const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/gi)].map((match) => decodeHtml(match[1].trim()));
    if (!locations.length) errors.push('dist/sitemap.xml contains no <loc> URLs');
    const seen = new Set();
    for (const location of locations) {
      let url;
      try { url = new URL(location); } catch { errors.push(`sitemap: malformed URL ${location}`); continue; }
      if (seen.has(url.href)) errors.push(`sitemap: duplicate URL ${url.href}`);
      seen.add(url.href);
      if (!sameSite(url) || !resolveTarget(url.pathname)) errors.push(`sitemap: ${location} does not resolve to a generated page`);
    }
  }

  return { errors, pageCount: htmlFiles.length };
}

if (require.main === module) {
  const result = verify();
  if (result.errors.length) {
    console.error(`Found ${result.errors.length} site verification error(s):\n${result.errors.map((error) => `  ✗ ${error}`).join('\n')}`);
    process.exit(1);
  }
  console.log(`Verified ${result.pageCount} pages, internal href/src/srcset/poster targets, anchors, metadata, image alt attributes and sitemap URLs.`);
}

module.exports = { verify };
