const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { generateHtaccess } = require('./build');
const config = require('../../vercel.json');
const data = require('../../src/data');
const routes = ['/', '/404','/about','/approach','/capabilities','/contact','/engagements','/insights','/people','/privacy','/terms','/why-ip3','/sectors',...data.sectors.map(s=>'/sectors/'+s.slug)];
const base = generateHtaccess(routes, config.redirects);
test('all21supported clean routes are mapped without changing page identities', () => {
  assert.equal(routes.length,21);
  for(const route of routes.filter(r=>r!=='/')) assert.ok(base.includes('"'+route.slice(1)+'.html" [L]'));
});
test('directory collision and listings are controlled without generic redirect backreferences', () => {
  assert.ok(base.includes('Options -Indexes -MultiViews'));
  assert.ok(base.includes('DirectorySlash Off'));
  assert.ok(!base.includes('"/$1"'));
});
test('preserves14existing relative aliases and adds no cross-domain host rule', () => {
  assert.equal(config.redirects.length,14);
  for(const rule of config.redirects) assert.ok(base.includes('"'+rule.destination+'" ['+(rule.destination.includes('#')?'R=308,L,NE,QSD':'R=308,L,NE')+']'));
  assert.ok(!base.includes('ip3cl.com'));
  assert.ok(!base.includes('HTTP_HOST'));
});
test('error document is explicit and raw PHP/private library paths are blocked', () => {
  assert.ok(base.includes('ErrorDocument 404 /404.html'));
  assert.ok(base.includes('"^api/contact-lib\\.php$" - [F,L]'));
  assert.ok(base.includes('"^api/contact$" "api/contact.php" [L]'));
});
test('current security headers and versioned asset cache behavior are retained', () => {
  for(const key of ['X-Content-Type-Options','X-Frame-Options','Referrer-Policy','Permissions-Policy']) assert.ok(base.includes('Header always set '+key));
  assert.ok(base.includes('max-age=31536000, immutable'));
  assert.ok(base.includes('stale-while-revalidate=86400'));
});
test('candidate legacy query rules are absent unless explicitly requested locally', () => {
  assert.ok(!base.includes('page_id=6281'));
  const preview=generateHtaccess(routes,config.redirects,{legacyPreview:true});
  assert.equal((preview.match(/\(\^\|&\)page_id=\d+/g)||[]).length,20);
  assert.equal(preview.split('RewriteCond %{QUERY_STRING} !(^|&)(p|paged|author|cat|s|feed)(?:=|&|$) [NC]').length - 1,20);
  for(const id of ['9526','12782','13516','17320'])assert.ok(!preview.includes('page_id='+id));
});
test('external redirect destinations are refused', () => {
  for(const destination of ['https://other.example/','//other.example/']) assert.throws(()=>generateHtaccess(routes,[{source:'/test',destination}]),/Unsupported/);
});
