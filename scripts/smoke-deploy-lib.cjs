'use strict';

const CANONICAL_HOSTS = new Set(['ip3-bd.org', 'www.ip3-bd.org']);
const VERCEL_ALIAS_HOSTS = new Set([
  'ip3-bd-org.vercel.app',
  'ip3-bd-org-ip-3.vercel.app',
  'ip3-bd-org-git-main-ip-3.vercel.app',
]);
const VERCEL_DEPLOYMENT_HOST = /^ip3-bd-[a-z0-9]{9}-ip-3\.vercel\.app$/;
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

function parseSmokeBase(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Deployment URL must be a valid HTTPS URL.');
  }

  const host = url.hostname.toLowerCase();
  const isVercelHost = VERCEL_ALIAS_HOSTS.has(host) || VERCEL_DEPLOYMENT_HOST.test(host);
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443') ||
      url.pathname !== '/' || url.search || url.hash || (!CANONICAL_HOSTS.has(host) && !isVercelHost)) {
    throw new Error(`Refusing to smoke-test an unexpected deployment URL: ${url.origin}`);
  }

  return { origin: url.origin, host, isVercelHost };
}

async function fetchSameOrigin(input, base, { bypassSecret, fetchImpl = globalThis.fetch, timeoutMs = 15000 } = {}) {
  let current = new URL(input);
  const headers = base.isVercelHost && bypassSecret
    ? { 'x-vercel-protection-bypass': bypassSecret }
    : {};

  for (let redirects = 0; redirects <= 5; redirects += 1) {
    if (current.origin !== base.origin || current.protocol !== 'https:' || current.username || current.password) {
      throw new Error(`Refusing to follow a redirect outside the verified deployment origin: ${current.origin}`);
    }

    const response = await fetchImpl(current, {
      headers,
      redirect: 'manual',
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!REDIRECT_STATUSES.has(response.status)) return response;

    const location = response.headers.get('location');
    if (!location) throw new Error(`Refusing redirect without a Location header from ${current.pathname}.`);
    if (redirects === 5) throw new Error('Refusing to follow more than five redirects.');
    current = new URL(location, current);
    if (current.origin !== base.origin) {
      throw new Error(`Refusing to follow a redirect outside the verified deployment origin: ${current.origin}`);
    }
  }

  throw new Error('Redirect limit exceeded.');
}

function buildStampMatches(response, stamp, expectedCommit) {
  const contentType = response.headers.get('content-type') || '';
  return response.status === 200 && contentType.toLowerCase().includes('application/json') &&
    stamp?.commit === expectedCommit && stamp?.vercelGitCommitSha === expectedCommit;
}

module.exports = { parseSmokeBase, fetchSameOrigin, buildStampMatches };
