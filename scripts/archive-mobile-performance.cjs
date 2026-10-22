const fs = require('node:fs'), path = require('node:path'), zlib = require('node:zlib'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const workspace = path.resolve(__dirname, '..'), root = path.resolve(process.env.EXPLORE_QA_OUT || path.join(workspace, 'docs/interactive-experience/mobile-performance-2026-10-22'));
if (!root.startsWith(workspace + path.sep)) throw Error('Evidence must remain inside this workspace');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const manifestFile = path.join(root, 'LIGHTHOUSE_ARCHIVES.json');
const previous = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile)).files : [], entries = [...previous];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw Error('Do not follow evidence symlinks');
    if (entry.isDirectory()) { walk(full); continue; }
    if (!/^lh-[a-z0-9-]+\.json$/.test(entry.name)) continue;
    const bytes = fs.readFileSync(full), report = JSON.parse(bytes);
    assert.ok(report.lighthouseVersion && report.audits, 'Unexpected non-Lighthouse file');
    const compressed = zlib.gzipSync(bytes, { level: 9 }), archive = full + '.gz';
    assert.ok(zlib.gunzipSync(compressed).equals(bytes));
    if (fs.existsSync(archive)) assert.ok(zlib.gunzipSync(fs.readFileSync(archive)).equals(bytes), 'Never overwrite differing history');
    else fs.writeFileSync(archive, compressed);
    const relative = path.relative(root, full).replaceAll('\\', '/');
    if (!entries.some(e => e.name === relative)) entries.push({ name: relative, archive: relative + '.gz', bytes: bytes.length, archiveBytes: compressed.length, sha256: sha(bytes), archiveSHA256: sha(compressed), roundTripVerified: true });
    fs.unlinkSync(full); // only this task's matched file, after equality proof
  }
}
walk(root);
const manifest = { meaning: 'Original Lighthouse JSON bytes, gzip archived after verified round trip. Canonical Home copies are duplicates, not additional trials. Rejected/intermediate runs are not acceptance results.', uniqueReportBytes: new Set(entries.map(e => e.sha256)).size, files: entries.sort((a, b) => a.name.localeCompare(b.name)) };
fs.writeFileSync(manifestFile, JSON.stringify(manifest, null, 2) + '\n'); console.log(JSON.stringify({ archives: entries.length, uniqueReports: manifest.uniqueReportBytes }));
