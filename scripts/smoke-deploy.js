const base = process.env.DEPLOYMENT_URL || process.env.SMOKE_URL;
if (!base) throw new Error('Set DEPLOYMENT_URL or SMOKE_URL to the deployed site origin.');

const origin = new URL(base);
const host = origin.hostname.toLowerCase();
const isProductionHost = host === 'ip3-bd.org' || host === 'www.ip3-bd.org';
const isProjectVercelHost = /^ip3-bd-org(?:-|\.|$)/.test(host) && host.endsWith('.vercel.app');
if (origin.protocol !== 'https:' || (!isProductionHost && !isProjectVercelHost)) {
  throw new Error(`Refusing to smoke-test an unexpected deployment host: ${host}`);
}

const pages = ['/', '/about', '/contact', '/privacy', '/terms'];
const headers = process.env.VERCEL_AUTOMATION_BYPASS_SECRET
  ? { 'x-vercel-protection-bypass': process.env.VERCEL_AUTOMATION_BYPASS_SECRET }
  : {};
let failed = false;
for (const route of pages) {
  const url = new URL(route, origin.origin);
  const response = await fetch(url, { headers, redirect: 'follow', signal: AbortSignal.timeout(15000) });
  const type = response.headers.get('content-type') || '';
  if (response.status !== 200 || !type.includes('text/html')) {
    console.error(`FAIL ${route}: HTTP ${response.status}, content-type ${type || '(missing)'}`);
    failed = true;
  } else {
    console.log(`OK ${route}: HTTP 200`);
  }
}
if (process.env.EXPECTED_COMMIT_SHA) {
  const response = await fetch(new URL('/build.json', origin.origin), { headers, redirect: 'follow', signal: AbortSignal.timeout(15000) });
  let stamp;
  try { stamp = await response.json(); } catch { stamp = null; }
  if (response.status !== 200 || !stamp || stamp.commit !== process.env.EXPECTED_COMMIT_SHA || stamp.vercelGitCommitSha !== process.env.EXPECTED_COMMIT_SHA) {
    console.error(`FAIL /build.json: expected commit and vercelGitCommitSha ${process.env.EXPECTED_COMMIT_SHA}; received commit=${stamp?.commit || `HTTP ${response.status}`}, vercelGitCommitSha=${stamp?.vercelGitCommitSha || 'missing'}. Check Vercel's Automatically expose System Environment Variables setting.`);
    failed = true;
  } else {
    console.log(`OK /build.json: commit ${stamp.commit}, Vercel commit ${stamp.vercelGitCommitSha}`);
  }
}
if (failed) process.exit(1);
