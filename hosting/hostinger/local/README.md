# Local Hostinger verification helpers

These helpers do not upload, activate, provision credentials, send enquiries or operate on production.

## Phased article HTTP policy

`article_http_policy.py` defines separate acceptance rules for draft (404), in-preparation (200, noindex, honest notice, no Article schema) and complete published articles (200 with eligible legacy redirects). `verify-draft.py` uses that policy, retains unknown-selector rejection and supports new owner-written articles without inventing WordPress IDs.

```text
python -B -m unittest discover -s hosting/hostinger/local -p test_article_http_policy.py -v
node --test hosting/hostinger/local/protected-staging.test.cjs
```

Both commands use built-in libraries, perform no network requests and require no credentials. Python bytecode generation is disabled by `-B`.

## Protected staging composition

`protected-staging.cjs` composes a staging-only routing overlay from an authentication prefix actually observed in the authorized Hostinger File Manager and the pinned candidate's routing. It accepts only the existing temporary hostname, Basic authentication, the observed directive order and an existing password-file path. It preserves the prefix verbatim, rejects extra/weakening authentication directives, removes public asset cache headers and adds private/no-store and noindex response headers. It never reads the password file or performs remote operations. A passing composition test does not prove that a host applied the overlay; live header and authentication checks are still necessary.

Do not use this overlay on production. Keep production release/upload/activation controls disabled.

## Cached Apache/PHP harness limitations

`verify-draft.py` uses an existing cached **PHP8.5** CGI/Apache runtime, binds to loopback only, removes provider credentials from its child environment, and restricts output/document roots to named local evidence folders. It is not a PHP8.3 or Hostinger execution claim. On this Windows host PHP CLI is unavailable and the cached runtime's WSL access previously failed; the updated full harness has not been executed. Its source was syntax-parsed and its pure policy tests were executed separately. Do not run it until its existing runtime is usable; do not install dependencies or replace it with unapproved infrastructure.

Actual PHP8.3 handler behavior, authenticated staging HTTP/content hashes, inbox delivery and provider rollback require separate live evidence. Mocked delivery never proves receipt in an inbox.
