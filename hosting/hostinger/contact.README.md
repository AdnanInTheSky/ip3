# Hostinger PHP contact proof of concept — local only

This adapter preserves the existing `/api/contact` JSON form contract while replacing the Vercel Node runtime with PHP 8.3+. It does **not** activate the form, alter content, send an email, register an account, provision a widget, edit DNS or deploy a file. Existing `CONTACT_API_ENABLED=0` mailto fallback remains the current baseline.

## Package layout

The local packaging script may copy only:

- `contact/index.php` → public `api/contact.php`.
- `contact/handler.php` → public `api/contact-lib.php`.

Map `/api/contact` to `api/contact.php` in the Hostinger routing proposal. Never publish the test file, populated private configuration, rate-limit storage or this example configuration. The library itself emits no response when requested directly; the proposed Apache rules additionally deny direct library access.

## Security controls

- POST-only JSON; same-origin equality and explicit host allowlist. HTTPS required except an explicitly allowed localhost port. No CORS permission is emitted.
- Read at most 16 KiB plus one sentinel byte; reject arrays, malformed JSON, wrong field types, overlong fields, invalid email, stale/future timestamps. UTF-16 length limits match the existing JavaScript form contract.
- Honeypot silently accepts without external calls. Clean single-line metadata; escape every HTML field; preserve message line breaks only as escaped content.
- Turnstile must succeed server-side with the exact request hostname. The upstream single-use/expiry protections remain Cloudflare responsibilities. No forwarded-IP header is trusted.
- Private filesystem rate limiter: at most five checked attempts per canonical client IP per 15 minutes. One exclusively locked `ip3-rate-limits-v1.json` store holds at most 1,024 active hashed identities; expired entries are removed on the next permitted write. Reads are capped at 256 KiB; malformed state, unsafe links and storage failure fail closed. This is a new local draft storage format and has not been deployed. A shared reverse proxy may cause multiple clients to share one limit; confirm Hostinger's direct address/proxy behavior before release. No forwarded-IP header is trusted and no cron is activated.
- cURL permits only the two fixed HTTPS Cloudflare/Resend endpoints, verifies TLS, disables redirects, uses 5-second connect/10-second total timeouts and limits response bytes. Provider errors never reveal credentials, raw messages or private filesystem paths to the browser.
- A successful mocked provider receipt demonstrates adapter behavior, **not inbox delivery**. No `mail()` call is treated as delivery success.

## Private configuration proposal — not provisioned

Prefer server-side environment values if the actual shared PHP plan supports them securely. Otherwise a populated PHP configuration can live outside `public_html`, outside Git and outside uploaded release artifacts; the absolute path is supplied through `IP3_CONTACT_CONFIG`. The endpoint rejects configuration/rate storage resolving inside the document root, including symlinks. An administrator would separately approve the exact mechanism for setting the path without publishing secret values.

Required private values: `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM` (bare verified sender address), `TURNSTILE_SECRET`, `CONTACT_ALLOWED_HOSTS` (explicit array in private config or comma-separated server environment), `CONTACT_RATE_DIR` (existing private writable directory). Configuration must be owner-readable only where hosting permissions permit; the PHP process needs minimal read/write rights. Missing credentials, security service or rate storage fail closed. No real values are present in this proof of concept.

The site build also requires the **public** `PUBLIC_TURNSTILE_SITE_KEY` and `CONTACT_API_ENABLED=1` for a future separately approved activation. Public key is not a secret; the private Turnstile secret must never enter the static build or CMS. Both current domains and any preview hostname would need intentional widget/allowlist entries; do not use wildcard origins. No email, widget or domain configuration is performed now.

## Zero-additional-cost options and limitations

1. **Existing Hostinger mailbox SMTP:** official settings describe `smtp.hostinger.com` with authenticated TLS (465 implicit TLS or 587 STARTTLS). The existing mailbox entitlement, sending allowance and long-term trial/renewal terms must be confirmed before it is called a $0-incremental dependency. A maintained SMTP library such as PHPMailer would be required for a future SMTP adapter; there is no SMTP adapter or live SMTP test in this package. Do not embed a mailbox password in the website, CMS, artifact or logs. No additional mailbox is needed in the proposal.
2. **Resend Free adapter implemented here:** official current pricing documents $0/month, 100 transactional emails/day and 3,000/month, with three verified domains. Existing account status, sender verification and Free plan are **not verified**. Any new account or DNS verification requires owner approval. Use only Free with no paid subscription, payment method, overage opt-in or auto-upgrade; reaching a cap must stop delivery and retain the existing email fallback. Provider capacity is shared with other account activity and is not guaranteed by this code. No provider account, API key or DNS record has been created.
3. **Turnstile Free:** the documented free tier includes unlimited challenges; actual widget ownership, keys, hostname binding, Hostinger outbound cURL/CA trust and data-processing approval remain unverified. No widget is created and no live verification request is sent.

The static website can remain at $0 additional hosting cost while these contact-delivery gates are unresolved; keep the current email fallback. A fully working server-delivered form must not be claimed until an authorized isolated live test demonstrates delivery and safe failure behavior.

## Local tests

Run with a PHP 8.3+ CLI:

```text
php -l hosting/hostinger/contact/handler.php
php -l hosting/hostinger/contact/index.php
php -l hosting/hostinger/contact/private-config.example.php
php -l hosting/hostinger/contact/test.php
php hosting/hostinger/contact/test.php
```

Tests inject both external HTTP and rate checking. All addresses are reserved/example values, all receipts are mocked, and all provider calls are intercepted. The filesystem test creates and removes its own randomly named temporary directory. The test process does not use credentials or contact any provider. The final `externalRequests: 0` result describes those mocked tests only.

Exact execution results and PHP version belong in the parent compatibility report; do not infer a pass from this source being present. Future endpoint/browser tests must exercise the packaged public layout, without enabling provider configuration.

## Rollback and remaining release gates

This code is uncommitted in an isolated local worktree and has no production effect. Reverting an eventual separately reviewed adapter change restores the existing contact implementation; keep form activation disabled until the correct backend is ready. A release rollback must preserve private configuration and rate counters outside release directories; it must never expose a secret by copying an entire private directory into public output.

Before any activation: authorize a non-production Hostinger test; confirm PHP/cURL/TLS/private-path controls on the actual plan; choose and verify a strictly included/free mail provider; review rate/storage policy; verify Turnstile and SMTP/sender DNS without disturbing existing mail records; demonstrate allowed-origin delivery, invalid token rejection, duplicate submission behavior, provider cap failure and inbox receipt. This package authorizes none of those remote changes.

## Primary documentation checked 17 October 2026

- [Hostinger mailbox configuration](https://www.hostinger.com/support/1575756-how-to-get-email-account-configuration-details-for-hostinger-email/).
- [Hostinger PHPMailer guidance](https://www.hostinger.com/tutorials/how-to-send-emails-using-phpmailer/).
- [Resend pricing](https://resend.com/pricing) and [account quotas](https://resend.com/docs/knowledge-base/account-quotas-and-limits).
- [Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/) and [Free plan](https://developers.cloudflare.com/turnstile/plans/).

Provider documentation establishes offered capabilities, not this account's entitlement or successful operation.
