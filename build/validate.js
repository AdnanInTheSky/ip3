// Checks every content/*.json file against cms/schema.js before the site is built.
// A failed check stops the build, so a bad edit never replaces the live site (Vercel keeps the last good deploy).
//   node build/validate.js        → prints errors/warnings, exit code 1 on error
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const schema = require('../cms/schema');
const { validateArticles } = require('../cms/articles');
const { editableSectionOrders, validateOrder } = require('../cms/section-order');
const { validateHomeTestimonialsPlacement } = require('../cms/section-placement');

const KB = 1024;
const MB = 1024 * KB;
const LIMITS = { image: { warn: 500 * KB, max: 2 * MB }, video: { warn: 8 * MB, max: 25 * MB } };
const EXT = { image: ['.webp', '.jpg', '.jpeg', '.png'], video: ['.mp4', '.webm'] };
const ROUTES = ['/', '/about', '/why-ip3', '/approach', '/capabilities', '/sectors', '/engagements', '/insights', '/people', '/contact', '/find-support', '/privacy', '/terms', '/explore', ...require('../cms/explorer-routes').map(slug => `/explore/${slug}`)];
// The 3D camera on /why-ip3 has one keyframe per scene, in this order.
const WHY_SCENES = ['complexity', 'evidence', 'insight', 'policy', 'practice', 'impact'];
const REQUIRED_HEADING_KEYS = [
  'home-why', 'home-sectors', 'home-engagements', 'home-insights', 'partners-clients', 'partners-funders',
  'about-intro', 'about-lifecycle', 'about-pillars', 'about-values', 'about-different', 'about-network',
  'why-capabilities', 'why-sectors', 'why-work', 'why-method', 'cta-why',
  'approach-problem', 'approach-standards', 'approach-orbit', 'approach-toolkit', 'approach-outcomes',
  'capabilities-start', 'capability-deliverables', 'capability-applied', 'capability-includes', 'capability-related', 'sector-add-value', 'sector-capabilities',
  'sector-related', 'insights-field', 'insights-publications', 'people-network', 'contact-visit', 'contact-ways', 'contact-faq', 'contact-form',
  'cta-default', 'cta-about', 'cta-approach', 'cta-capabilities', 'cta-sectors', 'cta-sector',
  'cta-engagements', 'cta-insights', 'cta-people', 'not-found', 'finder-step-sector', 'finder-step-help', 'finder-results',
];
const RICH_HEADING_KEYS = new Set([
  'finder-results', 'about-intro', 'about-lifecycle', 'about-pillars', 'about-values', 'about-different', 'cta-about',
  'why-capabilities', 'why-sectors', 'why-work', 'why-method', 'cta-why',
  'approach-problem', 'approach-standards', 'approach-orbit', 'approach-toolkit', 'approach-outcomes', 'cta-approach',
  'capabilities-start', 'cta-capabilities', 'contact-ways', 'contact-faq', 'cta-engagements',
  'home-why', 'home-sectors', 'home-engagements', 'home-insights', 'cta-default', 'insights-field', 'insights-publications',
  'cta-insights', 'people-network', 'cta-people', 'sector-add-value', 'sector-capabilities',
  'sector-related', 'cta-sectors', 'cta-sector',
]);
const kb = (n) => (n / KB >= 1000 ? (n / MB).toFixed(1) + ' MB' : Math.round(n / KB) + ' KB');

function run({ quiet = false } = {}) {
  const errors = [];
  const warnings = [];
  const data = {}; // schema entry name -> parsed content (collections: array)
  const where = { file: '' };
  const err = (p, m) => errors.push(`${where.file}${p ? ' → ' + p : ''}: ${m}`);
  const warn = (p, m) => warnings.push(`${where.file}${p ? ' → ' + p : ''}: ${m}`);
  const refs = []; // deferred cross-reference checks

  const asset = (kind, v, p) => {
    if (typeof v !== 'string' || !v.startsWith('/assets/')) return err(p, `expected a path like /assets/${kind === 'image' ? 'img' : 'video'}/name${EXT[kind][0]}, got ${JSON.stringify(v)}`);
    const ext = path.extname(v).toLowerCase();
    if (!EXT[kind].includes(ext)) return err(p, `${v} must be a ${EXT[kind].join(' / ')} file`);
    const f = path.join(ROOT, v);
    if (!fs.existsSync(f)) return err(p, `file not found: ${v} (upload it in the Media tab, or pick another file)`);
    const size = fs.statSync(f).size;
    if (size > LIMITS[kind].max) err(p, `${v} is ${kb(size)} — the limit is ${kb(LIMITS[kind].max)}. Compress it (WebP for photos, H.264 MP4 for video) and upload again.`);
    else if (kind === 'video' && ext === '.webm' && size > LIMITS.video.warn) err(p, `${v} is ${kb(size)} — WebM cannot be re-encoded as H.264 without changing its container; upload an MP4 under ${kb(LIMITS.video.warn)} or convert it before upload.`);
    else if (size > LIMITS[kind].warn) warn(p, `${v} is ${kb(size)} — large for the web; consider compressing it`);
  };

  const link = (v, p) => {
    if (/^(https?:\/\/|mailto:|tel:)/.test(v)) return;
    if (!v.startsWith('/')) return err(p, `link "${v}" must start with / (site page) or https://`);
    refs.push({ p, file: where.file, kind: 'route', value: v });
  };

  function scalar(f, v, p) {
    const empty = v === '' || v === null || v === undefined;
    if (empty) { if (!f.optional) err(p, 'is required'); return; }
    switch (f.type) {
      case 'string':
      case 'text': {
        if (typeof v !== 'string') return err(p, 'must be text');
        if (!f.optional && !v.trim()) return err(p, 'is required');
        const tags = v.match(/<[^>]*>?/g) || [];
        if (tags.some((t) => !/^<\/?em>$/.test(t))) err(p, 'contains HTML other than <em>…</em>');
        else if (tags.length && !f.em) err(p, 'contains <em> tags, which this field does not support');
        else if (f.em && (v.match(/<em>/g) || []).length !== (v.match(/<\/em>/g) || []).length) err(p, '<em> tags are not closed');
        if (f.max && v.length > f.max) err(p, `${v.length} characters — the limit is ${f.max}`);
        if (f.soft && v.length > f.soft) warn(p, `${v.length} characters — aim for ${f.soft} or fewer`);
        if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) err(p, `"${v}" is not a valid email address`);
        if (f.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v)) err(p, `"${v}" must be lower-case words joined by hyphens`);
        if (f.link) link(v, p);
        if (f.ref) refs.push({ p, file: where.file, kind: f.ref, value: v });
        return;
      }
      case 'rich-text': if (typeof v !== 'string') err(p, 'must be Markdown text'); return;
      case 'number': if (typeof v !== 'number' || !Number.isFinite(v)) err(p, 'must be a number'); return;
      case 'boolean': if (typeof v !== 'boolean') err(p, 'must be true or false'); return;
      case 'select': if (!f.values.includes(v)) err(p, `"${v}" is not one of ${f.values.join(', ')}`); return;
      case 'image': return asset('image', v, p);
      case 'video': return asset('video', v, p);
      default: err(p, `unknown field type ${f.type}`);
    }
  }

  function node(f, v, p) {
    if (f.list) {
      if (!Array.isArray(v)) return err(p, 'must be a list');
      if (!v.length && !f.optional) err(p, 'needs at least one entry');
      const seen = new Set();
      v.forEach((item, i) => {
        single(f, item, `${p}[${i + 1}]`);
        if (f.type === 'object' && item && item.slug !== undefined) {
          if (seen.has(item.slug)) err(`${p}[${i + 1}].slug`, `"${item.slug}" is used twice`);
          seen.add(item.slug);
        }
      });
      return;
    }
    single(f, v, p);
  }

  function single(f, v, p) {
    if (f.type !== 'object') return scalar(f, v, p);
    if (!v || typeof v !== 'object' || Array.isArray(v)) return err(p, 'must be a group of fields');
    const names = new Set(f.fields.map((x) => x.name));
    for (const k of Object.keys(v)) if (!names.has(k)) err(p ? `${p}.${k}` : k, 'is not a field the editor knows (remove it, or add it to cms/schema.js)');
    for (const sub of f.fields) {
      const sp = p ? `${p}.${sub.name}` : sub.name;
      if (v[sub.name] === undefined) { if (!sub.optional) err(sp, 'is missing'); continue; }
      node(sub, v[sub.name], sp);
    }
  }

  const readJSON = (rel) => {
    where.file = rel;
    try { return JSON.parse(fs.readFileSync(path.join(ROOT, rel), 'utf8')); } catch (e) {
      err('', e.code === 'ENOENT' ? 'file is missing' : `not valid JSON — ${e.message}`);
      return null;
    }
  };

  const covered = new Set();
  for (const entry of schema.content) {
    const root = { type: 'object', fields: entry.fields };
    if (entry.type === 'file') {
      covered.add(entry.path);
      const v = readJSON(entry.path);
      if (v) single(root, v, '');
      data[entry.name] = v;
    } else {
      const dir = path.join(ROOT, entry.path);
      const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort() : [];
      if (!files.length) { where.file = entry.path; err('', 'folder has no .json files'); }
      data[entry.name] = files.map((f) => {
        const rel = `${entry.path}/${f}`;
        covered.add(rel);
        const v = readJSON(rel);
        if (v) single(root, v, '');
        return v;
      }).filter(Boolean);
      where.file = entry.path;
      const slugs = new Set();
      data[entry.name].forEach((s) => { if (slugs.has(s.slug)) err('slug', `"${s.slug}" is used by more than one file`); slugs.add(s.slug); });
    }
  }

  // content files that no editor form covers
  (function scan(dir) {
    for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
      const rel = `${dir}/${e.name}`;
      if (e.isDirectory()) scan(rel);
      else if (e.name.endsWith('.json') && !covered.has(rel)) { where.file = rel; err('', 'is not in cms/schema.js, so editors cannot reach it'); }
    }
  })('content');

  // Section lists must contain every supported middle section exactly once.
  // Hero, CTA, and scroll-journey sequences are deliberately outside these lists.
  where.file = 'content/section-order.json';
  const sectionOrder = data.section_order || {};
  for (const [page, spec] of Object.entries(editableSectionOrders)) {
    try { validateOrder(page, sectionOrder[page]); }
    catch (e) { err(page, e.message); }
  }
  where.file = 'content/section-placement.json';
  try {
    validateHomeTestimonialsPlacement(data.section_placement?.homeTestimonials, sectionOrder.home, data.home_testimonials?.items);
  } catch (e) { err('homeTestimonials', e.message); }

  for (const message of validateArticles(data.articles || [], ROOT)) { where.file = 'content/articles'; err('', message); }
  const articleRoutes = new Set((data.articles || []).filter(a => a.publicationStatus === 'published').map(a => '/insights/' + a.slug));

  // cross-references between files
  const slugsOf = (list) => new Set((list || []).map((x) => x.slug));
  const capSlugs = slugsOf((data.capabilities || {}).cards);
  const engSlugs = slugsOf((data.engagements || {}).items);
  const sectorItems = ((data.sectors || {}).items || []);
  const secSlugs = slugsOf(sectorItems);
  const members = ((data.people || {}).groups || []).flatMap((group) => group.members || []);
  const peopleSlugs = new Set();
  where.file = 'content/people.json';
  members.forEach((member) => {
    if (peopleSlugs.has(member.slug)) err('groups', `profile anchor "${member.slug}" is used by more than one person`);
    peopleSlugs.add(member.slug);
  });
  const proofSlugs = slugsOf((data.proof || {}).items);
  const photoSlugs = slugsOf((data.field_media || {}).photos);
  const sets = { capabilities: capSlugs, engagements: engSlugs, sectors: secSlugs, people: peopleSlugs, proof: proofSlugs, fieldphotos: photoSlugs };

  // /capabilities proof records: pillar codes are four letters of f/h/n; the capability list is non-empty; ids on the page are unique
  where.file = 'content/proof.json';
  ((data.proof || {}).items || []).forEach((item, i) => {
    if (!/^[fhn]{4}$/.test(item.pillars || '')) err(`items[${i + 1}].pillars`, `"${item.pillars}" must be four letters, each f, h or n`);
    if (item.status === 'delivered' && /current/i.test(item.period || '')) warn(`items[${i + 1}].status`, 'period says current but status is delivered');
  });
  const refLabels = new Set();
  ((data.proof || {}).items || []).forEach((item, i) => {
    if (refLabels.has(item.ref)) err(`items[${i + 1}].ref`, `reference label "${item.ref}" is used twice`);
    refLabels.add(item.ref);
  });

  // Home delivery chain: every evidence line is copied verbatim from its assignment record, and each assignment appears once
  const chain = data.home_translation;
  if (chain) {
    where.file = 'content/home/translation.json';
    const bySlug = Object.fromEntries(((data.proof || {}).items || []).map((item) => [item.slug, item]));
    const used = new Map();
    (chain.phases || []).forEach((phase, i) => (phase.evidence || []).forEach((ev, k) => {
      const p = `phases[${i + 1}].evidence[${k + 1}]`;
      const rec = bySlug[ev.record];
      if (!rec) return; // reported by the reference check below
      if (rec.hidden) err(`${p}.record`, `"${ev.record}" is hidden on the assignments list, so it cannot be shown as evidence`);
      if (ev.activity && !(rec.activities || []).includes(ev.activity)) err(`${p}.activity`, `does not match any recorded activity of "${ev.record}" word for word — copy one line from that record unchanged`);
      if (used.has(ev.record)) warn(`${p}.record`, `"${ev.record}" is already evidence for ${used.get(ev.record)}`);
      else used.set(ev.record, `phase ${i + 1}`);
    }));
    const STAGES = ['Research & Diagnostics', 'Policy Intelligence', 'Systemic Design', 'Delivery Architecture', 'Implementation Management', 'Learning & Scale'];
    const titles = (chain.phases || []).map((phase) => phase.title);
    if (titles.join('|') !== STAGES.join('|')) err('phases', `the delivery section is designed for exactly six stages in this order: ${STAGES.join(', ')} (found ${titles.length ? titles.join(', ') : 'none'})`);
  }

  // sector pages: one story per visible sector; each drawing is built for five steps
  const sectorPages = data.sector_pages || [];
  const pageSlugs = new Set(sectorPages.map((pg) => pg.slug));
  sectorPages.forEach((pg) => {
    where.file = `content/sector-pages/${pg.slug}.json`;
    const steps = ((pg.scene || {}).steps || []).length;
    if (steps !== 5) err('scene.steps', `the ${(pg.scene || {}).type || ''} drawing is built for five steps (found ${steps})`);
    const recs = (pg.evidence || {}).records || [];
    if (new Set(recs).size !== recs.length) err('evidence.records', 'an assignment is listed twice');
  });
  sectorItems.filter((s) => !s.hidden && !pageSlugs.has(s.slug)).forEach((s) => {
    where.file = 'content/sector-pages';
    warn(s.slug, 'this sector has no long-form story file, so its page shows only the header, focus areas and capabilities');
  });

  // /why-ip3: the 3D scene has a camera keyframe per scene and draws a link per related system.
  const why = data.why;
  if (why) {
    where.file = 'content/why.json';
    const sceneSlugs = (why.scenes || []).map((scene) => scene.slug);
    if (sceneSlugs.join() !== WHY_SCENES.join()) err('scenes', `must be exactly ${WHY_SCENES.join(', ')}, in that order (found ${sceneSlugs.join(', ') || 'none'})`);
    const systems = why.systems || [];
    if (systems.length > 6) err('systems', `the 3D scene draws at most six systems (found ${systems.length})`);
    if ((why.evidence || []).length > 6) err('evidence', `the 3D stack draws at most six layers (found ${why.evidence.length})`);
    const systemSlugs = new Set(systems.map((system) => system.slug));
    systems.forEach((system, i) => (system.relates || []).forEach((rel, k) => {
      if (rel === system.slug) err(`systems[${i + 1}].relates[${k + 1}]`, `"${rel}" cannot relate to itself`);
      else if (!systemSlugs.has(rel)) err(`systems[${i + 1}].relates[${k + 1}]`, `"${rel}" is not a system key in this list`);
    }));
    if ((why.siteLabels || []).length > 4) err('siteLabels', `the 3D practice scene has four labelled buildings (found ${why.siteLabels.length})`);
  }
  where.file = 'content/headings.json';
  const headingItems = schema.content.filter((entry) => entry.name.startsWith('page_text_')).flatMap((entry) => (data[entry.name] || {}).headings || []);
  const headingSlugs = new Set(headingItems.map((item) => item.slug));
  if (headingSlugs.size !== headingItems.length) err('headings', 'template heading keys must be unique across all page-text forms');
  REQUIRED_HEADING_KEYS.forEach((key) => { if (!headingSlugs.has(key)) err('items', `required template heading "${key}" is missing`); });
  headingItems.forEach((item) => {
    if (!RICH_HEADING_KEYS.has(item.slug) && /<\/?em>/.test(item.title)) {
      where.file = 'content/page-text'; err(item.slug, 'does not use <em> emphasis in the existing page design');
    }
  });
  for (const r of refs) {
    where.file = r.file;
    if (r.kind === 'route') {
      const [route, hash] = r.value.split('#');
      const ok = ROUTES.includes(route) || articleRoutes.has(route) || (route.startsWith('/sectors/') && secSlugs.has(route.slice(9)) && !sectorItems.find((sector) => sector.slug === route.slice(9)).hidden);
      if (!ok) err(r.p, `link ${r.value} does not match any page`);
      else if (hash && route === '/capabilities' && !capSlugs.has(hash)) err(r.p, `link ${r.value}: no capability with slug "${hash}"`);
    } else if (!sets[r.kind].has(r.value)) err(r.p, `"${r.value}" is not an existing ${{ capabilities: 'capability', people: 'person', fieldphotos: 'meeting photo', proof: 'assignment' }[r.kind] || r.kind.replace(/s$/, '')} slug`);
  }
  sectorItems.forEach((s, i) => {
    where.file = `content/sectors.json → items[${i + 1}]`;
    if (s.video && !s.poster) err('poster', 'a header video needs its poster image, even when a header photo is also set');
    if (!s.video && !s.image) err('', 'needs either a header video with its poster, or a header photo');
  });
  if (!sectorItems.some((sector) => !sector.hidden)) {
    where.file = 'content/sectors.json'; err('items', 'at least one sector must remain visible');
  }
  const hiddenSectorSlugs = new Set(sectorItems.filter((sector) => sector.hidden).map((sector) => sector.slug));
  (data.engagements?.items || []).forEach((engagement, index) => {
    if (!engagement.hidden && hiddenSectorSlugs.has(engagement.sectorSlug)) {
      where.file = 'content/engagements.json';
      warn(`items[${index + 1}].sectorSlug`, `visible engagement "${engagement.title}" references hidden sector "${engagement.sectorSlug}"`);
    }
  });
  where.file = 'content/navigation.json';
  const navigation = data.navigation || {};
  if (!((navigation.primary || []).some((item) => !item.hidden))) err('primary', 'at least one primary navigation item must be visible');
  const hero = data.home_hero;
  if (hero && !hero.slides.some((s) => !s.hidden)) { where.file = 'content/home/hero.json'; err('slides', 'at least one slide must be visible'); }

  if (!quiet) {
    if (warnings.length) console.warn(`\n${warnings.length} content warning(s):\n` + warnings.map((w) => '  ! ' + w).join('\n'));
    if (errors.length) console.error(`\n${errors.length} content error(s) — the site was NOT built:\n` + errors.map((e) => '  ✗ ' + e).join('\n') + '\n');
  }
  return { errors, warnings };
}

if (require.main === module) {
  const { errors, warnings } = run();
  if (!errors.length) console.log(`Content OK (${schema.content.length} editor sections${warnings.length ? `, ${warnings.length} warnings` : ''}).`);
  process.exit(errors.length ? 1 : 0);
}

module.exports = { run };
