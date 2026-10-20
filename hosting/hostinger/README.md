# Hostinger compatibility proof of concept — LOCAL ONLY

Fresh draft source improvements, reproducible candidates and results are documented in [the local implementation report](../../docs/local-preparation-20261017/IMPLEMENTATION_REPORT.md). Earlier counts below are historical and must not be substituted for the fresh evidence.

Based on production source `936279720b8a2b9e62b02a4c9404288b25bf3fc0`; branch `codex/hostinger-local-poc`. This is an uncommitted local candidate. It is not installed on Hostinger, a new CMS, a second production website or approval to publish.

## Local build and tests

Node.js24:

```text
npm ci
npm run check
npm test
npm run verify
node hosting/hostinger/build.js
node --test hosting/hostinger/routing.test.js hosting/hostinger/publishing/release-plan.test.cjs
node hosting/hostinger/publishing/release-plan.cjs --hostinger
```

The existing npm scripts, renderer, `.pages.yml`, content, identifiers, assets, API and Vercel configuration remain untouched. `build.js` first runs the existing validated builder, then copies its generated public output into the fixed ignored local folder `hosting/hostinger/dist-hostinger/`. It adds only `.htaccess`, `api/contact.php`, `api/contact-lib.php` and `hostinger-build.json`. It refuses output symlinks and accepts no hosting destination.

`--legacy-preview` additionally converts the21confirmed rules in `confirmed-legacy-preview.json` **for local testing only**. It does not apply or modify the separate Vercel redirect package. The default build omits this optional subset and contains the original14aliases. Final generated output was left in default mode. No cross-domain or HTTPS redirect is activated; canonical URLs stay `https://ip3-bd.org`.

PHP tests, with a local PHP8.3+ executable:

```text
php -n hosting/hostinger/contact/test.php
```

The executed runtime here was extracted Ubuntu **PHP8.5.4**. Exact8.3 execution is pending: the attempted Windows package download yielded HTML rather than the expected binary and failed SHA256verification; it was never extracted or run. No application test is marked passed on8.3. The code uses syntax available in8.3 and needs cURL/TLS for real sending, but syntax inspection is not runtime proof.

## Real local Apache tests

`local/server.py` uses separately extracted Ubuntu Apache2.4.66 and PHP CGI8.5.4 under the user's local cache, binds **127.0.0.1 only** on43128/43130 and runs no system service. It does not connect to Hostinger. The custom Apache config is a local harness only; it is not uploaded and does not assume access to Hostinger vhosts/httpd.conf. `local/http-check.py` tests actual HTTP responses and content hashes; it is not a simulated route engine. Modules include rewrite, headers and FastCGI.

Ubuntu packages were downloaded from configured official Ubuntu repositories and extracted into the local user cache without root installation. Docker's engine was unavailable and was not started. `local/runtime.sh` extracts already downloaded packages; it does not enable remote services or modify Hostinger.

Hostinger uses LiteSpeed, so local Apache compatibility does **not** prove account-specific LiteSpeed behavior. DirectorySlash, inherited headers, PHP variables, real HTTPS, CDN/cache interactions, rate-limit IP attribution and filesystem permissions need an explicitly approved isolated provider test. No production root is an acceptable test destination.

## Routing and security

- Exact generated clean routes avoid unsupported route guesses and the `/sectors` directory collision. Directory listings and MultiViews are off; DirectorySlash is off with explicit canonical page-slash redirects.
- External `.html` redirects use `THE_REQUEST` to avoid loops on internal rewrites. All14existing aliases retain their destinations. Fragment redirects explicitly put preserved query parameters **before** the fragment.
- Unknown paths return the existing custom404with HTTP404; `.env`, `.git`, unexpected PHP and direct contact library access are denied. No source/content directory is in the public payload.
- Preserve the existing four security headers and current asset cache policies. No new CSP/HSTS restriction is silently introduced. HTTPS/certificate enforcement remains a future provider/cutover test.
- Native static files support media byte ranges. Existing Google Fonts links remain external; this adapter does not relicense, download or self-host fonts.
- Contact API remains off in the original default frontend build. A future activation needs reviewed private credentials, explicit origins, Turnstile and real delivery tests. See [contact.README.md](contact.README.md).
- Existing CMS email escaping/security and smoke corrections remain separate review packages; this POC does not deploy or silently integrate them.

## Publishing and rollback

See [PUBLISHING.md](PUBLISHING.md). The local manifest/packager is executable and tested; upload/promotion are deliberately unavailable. The optional `--write-local` package remains marked `INCOMPLETE`. A source HEAD in a build is not proof that uncommitted adapters are approved. Never publish `.git`, source JSON, private configuration, tests, local runtimes or evidence logs.

No SSH login, key creation, permission change, remote directory, workflow, upload, CDN purge, WordPress operation, backup, domain transfer, DNS/NS edit or public redirect was performed. The WordPress/public_html directory and database were not accessed through file or deployment tools.
