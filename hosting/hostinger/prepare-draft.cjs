// Local candidate preparation only; no network, upload, SSH, activation or dependency install.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { outputPath, buildTime } = require('../../build/local-output');
const { planRelease, writeLocalPackage, verifyLocalPackage } = require('./publishing/release-plan.cjs');
const { auditLegacy, reconcileSite, legacyCases } = require('./migration-audit.cjs');
const { verify } = require('../../build/check-links');
const root = path.resolve(__dirname, '../..');
const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== '--output') throw new Error('Use --output <new local run directory>');
if (!process.env.SOURCE_DATE_EPOCH) throw new Error('Explicit SOURCE_DATE_EPOCH required');
buildTime(process.env.SOURCE_DATE_EPOCH);
const output = outputPath(root, path.resolve(args[1]));
fs.mkdirSync(output, { recursive: true });
fs.writeFileSync(path.join(output, 'NOT_APPROVED'), 'MOCK / DRAFT; plan pending_approval; production NO-GO.\n', {flag:'wx'});
fs.writeFileSync(path.join(output, 'legacy-cases.json'), JSON.stringify(legacyCases(), null, 2) + '\n');
const env = { ...process.env, CONTACT_API_ENABLED: '0', ENABLE_ANALYTICS: '0' };
for (const name of ['RESEND_API_KEY','CONTACT_TO','CONTACT_FROM','TURNSTILE_SECRET','PUBLIC_TURNSTILE_SITE_KEY',
  'CONTACT_RATE_DIR','IP3_CONTACT_CONFIG','VERCEL_ENV','VERCEL_GIT_COMMIT_SHA','SITE_URL']) delete env[name];
const sectors = require('../../content/sectors.json').items.map(s => s.slug);
const plans = [];
for (const name of ['candidate-a', 'candidate-b', 'legacy-preview']) {
  const dist = path.join(output, name);
  const command = ['hosting/hostinger/build.js', '--output', dist, ...(name === 'legacy-preview' ? ['--legacy-preview'] : [])];
  const result = spawnSync(process.execPath, command, { cwd: root, env, encoding: 'utf8' });
  fs.writeFileSync(path.join(output, name + '.log'), (result.stdout || '') + (result.stderr || ''));
  if (result.status !== 0) throw new Error('Candidate build failed: ' + name);
  const links = verify({ dist, siteUrl: 'https://ip3-bd.org' });
  if (links.errors.length) throw new Error('Candidate link verification failed: ' + links.errors.join('; '));
  const pages = reconcileSite(dist);
  const stamp = JSON.parse(fs.readFileSync(path.join(dist, 'build.json'), 'utf8'));
  const plan = planRelease({ dist, commit: stamp.commit, sectorSlugs: sectors, hostinger: true });
  plans.push(plan);
  fs.writeFileSync(path.join(output, name + '-manifest.json'), JSON.stringify(plan.manifest, null, 2) + '\n');
  console.log(JSON.stringify({ candidate: name, manifestSha256: plan.manifestSha256, ...pages, files: plan.manifest.files.length }));
}
if (plans[0].manifestSha256 !== plans[1].manifestSha256) throw new Error('Reproducible candidate manifests differ');
const localPackage = writeLocalPackage(plans[0], output);
const verification = verifyLocalPackage(localPackage, plans[0].manifestSha256);
const summary = { status: 'pending_approval', production: 'NO-GO', source: 'dirty local draft; commit is ancestry only',
  reproducible: true, manifestSha256: plans[0].manifestSha256, sourceHash: plans[0].manifest.sourceHash,
  localPackage, verification, audit: auditLegacy(), uploadEnabled: false, promotionEnabled: false };
fs.writeFileSync(path.join(output, 'summary.json'), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
