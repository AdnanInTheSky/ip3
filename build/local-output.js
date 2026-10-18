'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

// Check every ancestor before allowing a generated local output path.
function outputPath(root, location, { fresh = true } = {}) {
  const absolute = path.resolve(location), base = path.resolve(root);
  const relative = path.relative(base, absolute);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative) ||
      relative.split(/[\\/]/).some(x => /^(?:public_html|wp-admin|wp-content|wp-includes|content|assets|src|\.git)$/i.test(x)))
    throw new Error('Unsafe generated output path');
  let current = absolute;
  while (true) {
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw new Error('Output symlink/junction forbidden');
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  if (fresh && fs.existsSync(absolute)) throw new Error('Output already exists; overwrite forbidden');
  return absolute;
}

function buildTime(value = process.env.SOURCE_DATE_EPOCH) {
  if (value === undefined) return new Date();
  if (!/^\d{1,10}$/.test(String(value))) throw new Error('SOURCE_DATE_EPOCH must be integer Unix seconds');
  const date = new Date(Number(value) * 1000);
  if (!Number.isFinite(date.getTime())) throw new Error('Invalid SOURCE_DATE_EPOCH');
  return date;
}
function sourceDigest(root) {
  const files = [];
  function collect(relative) {
    const file = path.join(root, relative), stat = fs.lstatSync(file);
    if (stat.isSymbolicLink()) throw new Error('Source symlink/junction forbidden');
    if (stat.isDirectory()) for (const name of fs.readdirSync(file).sort()) collect(relative + '/' + name);
    else if (stat.isFile()) files.push(relative);
  }
  for (const relative of ['src', 'cms', 'content', 'assets', 'build', 'package.json', 'package-lock.json', 'vercel.json', '.pages.yml']) collect(relative);
  for (const relative of ['hosting/hostinger/build.js', 'hosting/hostinger/redirect-policy.cjs', 'hosting/hostinger/confirmed-legacy-preview.json',
    'hosting/hostinger/contact/index.php', 'hosting/hostinger/contact/handler.php', 'hosting/hostinger/publishing/release-plan.cjs']) {
    if (fs.existsSync(path.join(root, relative))) collect(relative);
  }
  const hash = crypto.createHash('sha256');
  for (const file of files.sort()) hash.update(file).update('\0').update(fs.readFileSync(path.join(root, file))).update('\0');
  return hash.digest('hex');
}
module.exports = { outputPath, buildTime, sourceDigest };
