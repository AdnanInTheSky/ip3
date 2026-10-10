const test = require('node:test');
const assert = require('node:assert/strict');
const handler = require('./contact');

function responseMock() {
  return {
    headers: {}, statusCode: 200, payload: null,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.payload = value; return this; },
  };
}

function request(body, options = {}) {
  return {
    method: options.method || 'POST',
    headers: {
      host: options.host || 'ip3-bd.org',
      origin: options.origin || 'https://ip3-bd.org',
      'content-type': options.contentType || 'application/json',
      ...(options.headers || {}),
    },
    body,
  };
}

function validBody(overrides = {}) {
  return {
    name: 'Amina Rahman', email: 'amina@example.org', organization: 'Example Org',
    engagement: 'Diagnostic', focus: 'Public systems', message: 'Please contact me about a policy review.',
    website: '', startedAt: Date.now() - 4000, turnstileToken: '', ...overrides,
  };
}

function setEnv(t, values) {
  const prior = {};
  for (const key of ['RESEND_API_KEY', 'CONTACT_TO', 'CONTACT_FROM', 'TURNSTILE_SECRET']) {
    prior[key] = process.env[key];
    if (values[key] === undefined) delete process.env[key];
    else process.env[key] = values[key];
  }
  t.after(() => {
    for (const [key, value] of Object.entries(prior)) value === undefined ? delete process.env[key] : process.env[key] = value;
  });
}

async function call(req) {
  const res = responseMock();
  await handler(req, res);
  return res;
}

test('rejects non-POST and cross-origin submissions', async () => {
  const method = await call(request({}, { method: 'GET' }));
  assert.equal(method.statusCode, 405);
  assert.equal(method.headers.Allow, 'POST');
  const origin = await call(request(validBody(), { origin: 'https://attacker.example' }));
  assert.equal(origin.statusCode, 403);
});

test('silently accepts a filled honeypot without contacting providers', async (t) => {
  setEnv(t, { RESEND_API_KEY: 'test-key', CONTACT_TO: 'info@example.org', CONTACT_FROM: 'web@example.org' });
  let calls = 0;
  t.mock.method(global, 'fetch', async () => { calls += 1; return new Response('{}', { status: 200 }); });
  const result = await call(request(validBody({ website: 'spam.example' })));
  assert.equal(result.statusCode, 200);
  assert.equal(calls, 0);
});

test('rejects a form submitted before the minimum fill time', async (t) => {
  setEnv(t, { RESEND_API_KEY: 'test-key', CONTACT_TO: 'info@example.org', CONTACT_FROM: 'web@example.org' });
  const result = await call(request(validBody({ startedAt: Date.now() - 100 })));
  assert.equal(result.statusCode, 400);
});

test('validates fields and enforces the request-size limit', async (t) => {
  setEnv(t, { RESEND_API_KEY: 'test-key', CONTACT_TO: 'info@example.org', CONTACT_FROM: 'web@example.org' });
  const invalid = await call(request(validBody({ email: 'not-an-email' })));
  assert.equal(invalid.statusCode, 400);
  const large = await call(request(JSON.stringify(validBody({ message: 'x'.repeat(17000) }))));
  assert.equal(large.statusCode, 413);
});

test('sends escaped HTML and plain text through Resend with a safe reply-to', async (t) => {
  setEnv(t, { RESEND_API_KEY: 'test-secret', CONTACT_TO: 'info@example.org', CONTACT_FROM: 'web@example.org' });
  let requestBody;
  let requestHeaders;
  t.mock.method(global, 'fetch', async (url, options) => {
    assert.equal(url, 'https://api.resend.com/emails');
    requestHeaders = options.headers;
    requestBody = JSON.parse(options.body);
    return new Response('{"id":"mock-id"}', { status: 200 });
  });
  const result = await call(request(validBody({ name: 'Amina\r\nBcc:bad@example.org', message: '<img src=x onerror=alert(1)>' })));
  assert.equal(result.statusCode, 200);
  assert.equal(requestBody.reply_to, 'amina@example.org');
  assert.match(requestBody.subject, /Amina Bcc:bad@example\.org/);
  assert.match(requestBody.html, /&lt;img src=x onerror=alert\(1\)&gt;/);
  assert.doesNotMatch(requestBody.html, /<img/);
  assert.match(requestBody.text, /<img src=x onerror=alert\(1\)>/);
  assert.equal(requestHeaders.Authorization, 'Bearer test-secret');
});

test('verifies Turnstile server-side when a secret is configured', async (t) => {
  setEnv(t, { RESEND_API_KEY: 'test-key', CONTACT_TO: 'info@example.org', CONTACT_FROM: 'web@example.org', TURNSTILE_SECRET: 'turnstile-secret' });
  const calls = [];
  t.mock.method(global, 'fetch', async (url, options) => {
    calls.push({ url, options });
    if (String(url).includes('siteverify')) return new Response('{"success":true,"hostname":"ip3-bd.org"}', { status: 200 });
    return new Response('{"id":"mock-id"}', { status: 200 });
  });
  const result = await call(request(validBody({ turnstileToken: 'mock-token' })));
  assert.equal(result.statusCode, 200);
  assert.equal(calls.length, 2);
  assert.match(String(calls[0].options.body), /secret=turnstile-secret/);
  assert.match(String(calls[0].options.body), /response=mock-token/);
});

test('rejects a Turnstile verdict for a different hostname before sending mail', async (t) => {
  setEnv(t, { RESEND_API_KEY: 'test-key', CONTACT_TO: 'info@example.org', CONTACT_FROM: 'web@example.org', TURNSTILE_SECRET: 'turnstile-secret' });
  let calls = 0;
  t.mock.method(global, 'fetch', async () => {
    calls += 1;
    return new Response('{"success":true,"hostname":"attacker.example"}', { status: 200 });
  });
  const result = await call(request(validBody({ turnstileToken: 'mock-token' })));
  assert.equal(result.statusCode, 400);
  assert.equal(calls, 1);
});

test('returns only a generic error when Resend rejects the request', async (t) => {
  setEnv(t, { RESEND_API_KEY: 'test-key', CONTACT_TO: 'info@example.org', CONTACT_FROM: 'web@example.org' });
  t.mock.method(global, 'fetch', async () => new Response('{"message":"sensitive provider details"}', { status: 500 }));
  const result = await call(request(validBody()));
  assert.equal(result.statusCode, 502);
  assert.deepEqual(result.payload, { message: 'We could not send your message. Please use the email fallback.' });
});
