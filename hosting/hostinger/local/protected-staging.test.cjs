'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { protectedStagingHtaccess } = require('./protected-staging.cjs');
const prefix = '# PWPROTECTID:fixture\nAuthType Basic\nAuthName "Restricted Access"\nAuthUserFile /home/u123/domains/plum-mantis-800876.hostingersite.com/public_html/.htpasswd\nRequire valid-user\n# fixture:PWPROTECTID\n';
const routing = 'DirectoryIndex index.html\nRewriteEngine On\n<IfModule mod_headers.c>\n<FilesMatch "\\.css$">\nHeader set Cache-Control "public, max-age=31536000, immutable"\n</FilesMatch>\n</IfModule>\n';
test('preserves exact observed authentication and removes public caching on staging only', () => {
  const result = protectedStagingHtaccess(prefix,routing);
  assert.ok(result.startsWith(prefix));
  assert.equal((result.match(/AuthUserFile /g)||[]).length,1);
  assert.doesNotMatch(result,/Cache-Control "public/);
  assert.match(result,/Cache-Control "private, no-cache, no-store/);
  assert.match(result,/X-Robots-Tag "noindex, nofollow/);
});
test('production paths, weakened authentication, extra directives and absent markers fail closed', () => {
  for(const value of [prefix.replace('plum-mantis-800876.hostingersite.com','ip3-bd.org'),prefix.replace('valid-user','all granted'),prefix+'Require all granted\n',prefix.replaceAll('PWPROTECTID','missing')]) {
    assert.throws(()=>protectedStagingHtaccess(value,routing));
  }
});
test('candidate authentication overrides and incomplete routing fail closed', () => {
  for(const value of [routing+'Require all granted\n',routing+'AuthType None\n',routing+'Satisfy any\n','RewriteEngine On']) {
    assert.throws(()=>protectedStagingHtaccess(prefix,value));
  }
});
