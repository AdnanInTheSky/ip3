'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildStampMatches, fetchSameOrigin, parseSmokeBase } = require('./smoke-deploy-lib.cjs');

test('accepts the exact IP3 Vercel production deployment URL and known project aliases', () => {
  for (const value of [
    'https://ip3-bd-hqkdjgzgs-ip-3.vercel.app',
    'https://ip3-bd-org.vercel.app',
    'https://ip3-bd-org-ip-3.vercel.app',
    'https://ip3-bd-org-git-main-ip-3.vercel.app',
  ]) {
    assert.equal(parseSmokeBase(value).isVercelHost, true, value);
  }
});

test('permits canonical public hosts without treating them as trusted Vercel hosts', () => {
  assert.equal(parseSmokeBase('https://ip3-bd.org').isVercelHost, false);
  assert.equal(parseSmokeBase('https://www.ip3-bd.org/').isVercelHost, false);
});

test('rejects unrelated projects, lookalike hosts, unsafe URL syntax and protocols', () => {
  for (const value of [
    'https://other-project.vercel.app',
    'https://ip3-bd-org-fork.vercel.app',
    'https://ip3-bd-hqkdjgzgs-ip-3.vercel.app.attacker.test',
    'https://ip3-bd.org.attacker.test',
    'https://ip3-bd-hqkdjgzgs-other-team.vercel.app',
    'https://ip3-bd-hqkdjgzgs-ip-3.vercel.app@attacker.test',
    'https://ip3-bd-hqkdjgzgs-ip-3.vercel.app:444',
    'https://user:pass@ip3-bd-hqkdjgzgs-ip-3.vercel.app',
    'https://ip3-bd-hqkdjgzgs-ip-3.vercel.app/about',
    'https://ip3-bd-hqkdjgzgs-ip-3.vercel.app/?next=elsewhere',
    'https://ip3-bd-hqkdjgzgs-ip-3.vercel.app/#fragment',
    'http://ip3-bd-hqkdjgzgs-ip-3.vercel.app',
    'javascript:alert(1)',
  ]) {
    assert.throws(() => parseSmokeBase(value), /Refusing|valid HTTPS/ , value);
  }
});

test('follows relative same-origin redirects and keeps the bypass header on that origin only', async () => {
  const base = parseSmokeBase('https://ip3-bd-hqkdjgzgs-ip-3.vercel.app');
  const requests = [];
  const response = await fetchSameOrigin(new URL('/about', base.origin), base, {
    bypassSecret: 'test-secret',
    fetchImpl: async (url, options) => {
      requests.push({ url: url.href, options });
      if (requests.length === 1) return new Response(null, { status: 302, headers: { location: '/about/' } });
      return new Response('<h1>About</h1>', { status: 200, headers: { 'content-type': 'text/html' } });
    },
  });

  assert.equal(response.status, 200);
  assert.equal(requests.length, 2);
  assert.equal(requests[0].options.headers['x-vercel-protection-bypass'], 'test-secret');
  assert.equal(requests[1].options.headers['x-vercel-protection-bypass'], 'test-secret');
  assert.equal(requests[0].options.redirect, 'manual');
  assert.equal(requests[1].url, 'https://ip3-bd-hqkdjgzgs-ip-3.vercel.app/about/');
});

test('never sends a bypass header to an external redirect destination', async () => {
  const base = parseSmokeBase('https://ip3-bd-hqkdjgzgs-ip-3.vercel.app');
  const requests = [];
  await assert.rejects(fetchSameOrigin(new URL('/about', base.origin), base, {
    bypassSecret: 'test-secret',
    fetchImpl: async (url, options) => {
      requests.push({ url: url.href, options });
      return new Response(null, { status: 302, headers: { location: 'https://attacker.test/collect' } });
    },
  }), /outside the verified deployment origin/);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].url, 'https://ip3-bd-hqkdjgzgs-ip-3.vercel.app/about');
});

test('never sends a bypass header to the canonical host through a redirect', async () => {
  const base = parseSmokeBase('https://ip3-bd-hqkdjgzgs-ip-3.vercel.app');
  const requests = [];
  await assert.rejects(fetchSameOrigin(new URL('/about', base.origin), base, {
    bypassSecret: 'test-secret',
    fetchImpl: async (url, options) => {
      requests.push({ url: url.href, options });
      return new Response(null, { status: 302, headers: { location: 'https://ip3-bd.org/collect' } });
    },
  }), /outside the verified deployment origin/);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].options.headers['x-vercel-protection-bypass'], 'test-secret');
});

test('does not attach Vercel bypass credentials to a canonical public hostname', async () => {
  const base = parseSmokeBase('https://ip3-bd.org');
  let headers;
  await fetchSameOrigin(new URL('/', base.origin), base, {
    bypassSecret: 'test-secret',
    fetchImpl: async (_url, options) => {
      headers = options.headers;
      return new Response('<html></html>', { status: 200, headers: { 'content-type': 'text/html' } });
    },
  });
  assert.deepEqual(headers, {});
});

test('requires a valid JSON build stamp with both commit identities matching', () => {
  const expected = '5f91025568b2ede8985c46e26e3544bed567be5f';
  const validResponse = new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
  assert.equal(buildStampMatches(validResponse, { commit: expected, vercelGitCommitSha: expected }, expected), true);
  assert.equal(buildStampMatches(validResponse, { commit: expected, vercelGitCommitSha: 'wrong' }, expected), false);
  assert.equal(buildStampMatches(new Response('{}', { status: 200, headers: { 'content-type': 'text/html' } }), { commit: expected, vercelGitCommitSha: expected }, expected), false);
  assert.equal(buildStampMatches(new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } }), { commit: expected, vercelGitCommitSha: expected }, expected), false);
});
