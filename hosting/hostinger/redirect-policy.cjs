'use strict';
const WP_KEYS = ['p', 'page_id', 'paged', 'author', 'cat', 's', 'feed'];
function validateRedirects(routes, rules, { queryAllowed = false } = {}) {
  const keys = new Set(), graph = new Map();
  for (const rule of rules) {
    if (typeof rule.source !== 'string' || !rule.source.startsWith('/') || /[\\?#\x00-\x20]/.test(rule.source) || rule.source.startsWith('//')) throw new Error('Unsafe redirect source');
    if (typeof rule.destination !== 'string' || !rule.destination.startsWith('/') || rule.destination.startsWith('//') || /[\\?\x00-\x20]/.test(rule.destination)) throw new Error('Unsupported redirect destination');
    const target = rule.destination.split('#')[0];
    let decoded;
    try { decoded = decodeURIComponent(target); } catch { throw new Error('Malformed redirect destination'); }
    if (decoded.split('/').some(x => x === '.' || x === '..') || decoded.includes('\\')) throw new Error('Unsafe redirect destination');
    let selector = '';
    if (rule.has) {
      const q = rule.has[0];
      if (!queryAllowed || rule.has.length !== 1 || q.type !== 'query' || !['page_id', 'p'].includes(q.key) || !/^\d+$/.test(q.value) || !['/', '/index.php', '/index.html'].includes(rule.source)) throw new Error('Unsupported query redirect');
      selector = '?' + q.key + '=' + q.value;
    } else graph.set(rule.source, target);
    const identity = rule.source + selector;
    if (keys.has(identity)) throw new Error('Duplicate redirect selector');
    keys.add(identity);
  }
  for (const source of graph.keys()) {
    const seen = new Set(); let current = source;
    while (graph.has(current)) {
      if (seen.has(current)) throw new Error('Redirect loop');
      seen.add(current); current = graph.get(current);
    }
  }
  for (const rule of rules) {
    if (!routes.includes(rule.destination.split('#')[0])) throw new Error('Redirect must land on a generated route');
    if (!rule.has && routes.includes(rule.source)) throw new Error('Canonical route cannot be an alias');
  }
  return true;
}

// Reference policy for local inventory tests. This does not execute Apache/LiteSpeed.
function classifyRequest(value, routes, aliases, preview = [], articleRules = []) {
  const url = new URL(value, 'https://ip3-bd.org');
  const selectors = [...url.searchParams.keys()].filter(x => WP_KEYS.includes(x.toLowerCase()));
  const legacyRoot = ['/', '/index.php', '/index.html'].includes(url.pathname);
  if (legacyRoot && /(?:^|&)[^=&]*%[^=&]*=/.test(url.search.slice(1))) return { status: 404 };
  if (legacyRoot && selectors.length) {
    const match = selectors.length === 1 && [...articleRules, ...preview].find(r => r.source === url.pathname && r.has?.[0].key === selectors[0] &&
      r.has[0].value === url.searchParams.get(selectors[0]) && url.search.slice(1).split('&').includes(selectors[0] + '=' + r.has[0].value));
    return match ? { status: 308, destination: match.destination } : { status: 404 };
  }
  if (selectors.length) return { status: 404 };
  const alias = [...aliases, ...articleRules.filter(r => !r.has), ...preview.filter(r => !r.has)].find(r => r.source === url.pathname || (!r.source.endsWith('.html') && r.source + '/' === url.pathname));
  if (alias) return { status: 308, destination: alias.destination };
  const canonical = url.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/';
  if (routes.includes(canonical)) return canonical === url.pathname ? { status: 200 } : { status: 308, destination: canonical };
  return { status: 404 };
}
module.exports = { WP_KEYS, validateRedirects, classifyRequest };
