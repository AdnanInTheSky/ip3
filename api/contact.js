const MAX_BODY_BYTES = 16 * 1024;
const MIN_FILL_MS = 2500;
const MAX_FORM_AGE_MS = 24 * 60 * 60 * 1000;

function reply(res, status, message) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(status).json({ message });
}

function clean(value, max) {
  return String(value == null ? '' : value).replace(/[\r\n\u0000-\u001f\u007f]+/g, ' ').trim().slice(0, max);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function sameOrigin(req) {
  const originHeader = req.headers.origin;
  const hostHeader = req.headers.host;
  if (!originHeader || !hostHeader) return false;
  try {
    const origin = new URL(originHeader);
    const host = String(hostHeader).split(',')[0].trim().toLowerCase();
    const local = host.startsWith('localhost:') || host.startsWith('127.0.0.1:');
    return origin.host.toLowerCase() === host && (origin.protocol === 'https:' || (local && origin.protocol === 'http:'));
  } catch {
    return false;
  }
}

function validField(value, max) {
  return typeof value === 'string' && value.length <= max;
}

async function verifyTurnstile(token, secret, req, host) {
  const form = new URLSearchParams({ secret, response: token });
  const forwarded = clean(req.headers['x-forwarded-for'], 200).split(',')[0].trim();
  if (forwarded) form.set('remoteip', forwarded);
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) return false;
  const result = await response.json();
  return result.success === true && String(result.hostname || '').toLowerCase() === host;
}

async function sendWithResend({ apiKey, from, to, name, email, organization, engagement, focus, message }) {
  const fields = [
    ['Name', name], ['Email', email], ['Organization', organization || 'Not provided'],
    ['Engagement type', engagement || 'Not provided'], ['Focus area', focus || 'Not provided'],
  ];
  const text = `${fields.map(([label, value]) => `${label}: ${value}`).join('\n')}\n\n${message}`;
  const html = `${fields.map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`).join('')}<p><strong>Message:</strong></p><pre style="white-space:pre-wrap;font:inherit">${escapeHtml(message)}</pre>`;
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: email,
      subject: `Website enquiry — ${engagement || 'General'} — ${name}`,
      html,
      text,
    }),
    signal: AbortSignal.timeout(10000),
  });
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return reply(res, 405, 'Method not allowed.');
  }
  if (!sameOrigin(req)) return reply(res, 403, 'This request could not be verified.');
  if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
    return reply(res, 415, 'Expected a JSON request.');
  }

  let body = req.body;
  if (typeof body === 'string') {
    if (Buffer.byteLength(body, 'utf8') > MAX_BODY_BYTES) return reply(res, 413, 'Request is too large.');
    try { body = JSON.parse(body); } catch { return reply(res, 400, 'Invalid request.'); }
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return reply(res, 400, 'Invalid request.');
  if (Buffer.byteLength(JSON.stringify(body), 'utf8') > MAX_BODY_BYTES) return reply(res, 413, 'Request is too large.');

  // Silently accept filled honeypots; never forward the content to the mail provider.
  if (clean(body.website, 200)) return reply(res, 200, 'Message received.');

  const startedAt = Number(body.startedAt);
  const elapsed = Date.now() - startedAt;
  if (!Number.isSafeInteger(startedAt) || elapsed < MIN_FILL_MS || elapsed > MAX_FORM_AGE_MS) {
    return reply(res, 400, 'Please review the form and try again.');
  }
  if (!validField(body.name, 120) || !validField(body.email, 254) || !validField(body.organization || '', 160) ||
      !validField(body.engagement || '', 120) || !validField(body.focus || '', 160) || !validField(body.message, 5000) ||
      !validField(body.turnstileToken || '', 2048)) {
    return reply(res, 400, 'One or more fields are too long or invalid.');
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 254);
  const organization = clean(body.organization, 160);
  const engagement = clean(body.engagement, 120);
  const focus = clean(body.focus, 160);
  const message = String(body.message || '').trim();
  const token = clean(body.turnstileToken, 2048);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !message) {
    return reply(res, 400, 'Enter your name, a valid email address and a message.');
  }

  const { RESEND_API_KEY: apiKey, CONTACT_TO: to, CONTACT_FROM: from, TURNSTILE_SECRET: turnstileSecret } = process.env;
  if (!apiKey || !to || !from) return reply(res, 503, 'The contact service is not configured yet.');
  const requestHost = String(req.headers.host).split(',')[0].trim().split(':')[0].toLowerCase();
  if (turnstileSecret) {
    if (!token) return reply(res, 400, 'Complete the security check and try again.');
    try {
      if (!await verifyTurnstile(token, turnstileSecret, req, requestHost)) return reply(res, 400, 'The security check expired. Please try again.');
    } catch {
      return reply(res, 502, 'The security check could not be verified. Please try again.');
    }
  } else if (token) {
    return reply(res, 503, 'The contact security check is not configured yet.');
  }

  try {
    const sent = await sendWithResend({ apiKey, from: clean(from, 320), to: clean(to, 320), name, email, organization, engagement, focus, message });
    if (!sent.ok) return reply(res, 502, 'We could not send your message. Please use the email fallback.');
    return reply(res, 200, 'Message sent.');
  } catch {
    return reply(res, 502, 'We could not send your message. Please use the email fallback.');
  }
}

module.exports = handler;
module.exports._test = { escapeHtml, sameOrigin, sendWithResend };
