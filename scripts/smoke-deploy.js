'use strict';

const { buildStampMatches, fetchSameOrigin, parseSmokeBase } = require('./smoke-deploy-lib.cjs');

async function main(env = process.env) {
  const value = env.DEPLOYMENT_URL || env.SMOKE_URL;
  if (!value) throw new Error('Set DEPLOYMENT_URL or SMOKE_URL to the deployed site origin.');

  const base = parseSmokeBase(value);
  const pages = ['/', '/about', '/contact', '/privacy', '/terms'];
  let failed = false;

  for (const route of pages) {
    const response = await fetchSameOrigin(new URL(route, base.origin), base, {
      bypassSecret: env.VERCEL_AUTOMATION_BYPASS_SECRET,
    });
    const type = response.headers.get('content-type') || '';
    if (response.status !== 200 || !type.toLowerCase().includes('text/html')) {
      console.error(`FAIL ${route}: HTTP ${response.status}, content-type ${type || '(missing)'}`);
      failed = true;
    } else {
      console.log(`OK ${route}: HTTP 200`);
    }
  }

  if (env.EXPECTED_COMMIT_SHA) {
    const response = await fetchSameOrigin(new URL('/build.json', base.origin), base, {
      bypassSecret: env.VERCEL_AUTOMATION_BYPASS_SECRET,
    });
    let stamp;
    try { stamp = await response.json(); } catch { stamp = null; }
    if (!buildStampMatches(response, stamp, env.EXPECTED_COMMIT_SHA)) {
      console.error(`FAIL /build.json: expected JSON commit and vercelGitCommitSha ${env.EXPECTED_COMMIT_SHA}; received commit=${stamp?.commit || `HTTP ${response.status}`}, vercelGitCommitSha=${stamp?.vercelGitCommitSha || 'missing'}.`);
      failed = true;
    } else {
      console.log(`OK /build.json: commit ${stamp.commit}, Vercel commit ${stamp.vercelGitCommitSha}`);
    }
  }

  if (failed) process.exitCode = 1;
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { main };
