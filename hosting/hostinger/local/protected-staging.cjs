'use strict';
// Local composition only; no upload, credentials, authentication changes or production mode.
const HOST = 'plum-mantis-800876.hostingersite.com';
function protectedStagingHtaccess(prefix, routing) {
  const directives = prefix.split(/\r?\n/).map(x=>x.trim()).filter(x=>x && !x.startsWith('#'));
  const expected = [
    /^AuthType Basic$/,
    /^AuthName "Restricted Access"$/,
    new RegExp('^AuthUserFile /home/u[0-9]+/domains/' + HOST.replaceAll('.','\\.') + '/public_html/\\.htpasswd$'),
    /^Require valid-user$/,
  ];
  if (directives.length !== expected.length || !directives.every((x,i)=>expected[i].test(x))) throw Error('Exact observed staging-only authentication prefix required');
  if (!prefix.includes('PWPROTECTID:') || !prefix.includes(':PWPROTECTID')) throw Error('Existing protection markers required');
  if (/^\s*(?:Auth\w+|Require|Satisfy)\b/im.test(routing)) throw Error('Candidate must not redefine authentication');
  if (!routing.includes('RewriteEngine On') || !routing.includes('DirectoryIndex index.html')) throw Error('Expected reviewed static routing');
  const privateRouting = routing.replace(/^Header set Cache-Control "public,[^"]*"\r?$/gm, '# Public caching omitted on protected staging');
  return prefix + '\n' + privateRouting + '\n' + [
    '# Protected staging only. Preserve authentication; prevent public caching/indexing.',
    '<IfModule mod_headers.c>',
    'Header onsuccess unset Cache-Control',
    'Header always unset Cache-Control',
    'Header always set Cache-Control "private, no-cache, no-store, must-revalidate, max-age=0"',
    'Header always set X-Robots-Tag "noindex, nofollow, noarchive, nosnippet"',
    '</IfModule>',
    '',
  ].join('\n');
}
module.exports = { protectedStagingHtaccess, HOST };
