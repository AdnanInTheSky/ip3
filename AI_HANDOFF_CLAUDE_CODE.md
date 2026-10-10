# IP3 site implementation handoff — 2026-10-10

## Repository state

- Repo: `mdsyfulhoque-afk/ip3-bd.org`
- Local branch: `ops-hardening`, based on the user's `cms-admin` branch.
- The implementation is local and has not been pushed or deployed. The authorized workstreams are kept in separate commits; inspect `git log --oneline` for the current hashes.
- Do not make GitHub/Vercel/DNS changes, add credentials, send a real email or deploy without the owner's later instruction. The preflight remains in untracked `PREFLIGHT_REPORT.md`; baseline manifests and scratch comparisons are in untracked `scratchpad/`.

## Implemented

- `build/selftest.js` and `npm test` cover negative content/build checks. `build/check-links.test.js` covers link, anchor, target, metadata, image-alt and sitemap validation. `api/contact.test.js` mocks provider requests; it sends no email.
- CMS sectors are a single ordered list. Navigation, footer links, legal drafts and page headings/copy are schema-backed. Sector order is derived from the list position; hidden sectors are omitted from routes/navigation/sitemap. The undocumented Pages CMS `view.order` key is gone.
- The build writes generated pages, assets, sitemap, robots, manifest and `build.json` to ignored `dist/`. `vercel.json` publishes `dist`; `dev-server.js` serves it. The build stamp includes Git SHA when available, timestamp, content hash, page count and validation state.
- The content publishing workflow checks a content-branch head, then opens/updates a PR only after that exact SHA passes. The default-branch workflow syncs `main` into `content` and dispatches the check explicitly. Branch-protection policy and exact `gh api` command are in `docs/BRANCH-PROTECTION.md`.
- The Vercel function is `api/contact.js` (CommonJS, no runtime dependencies). It checks same-origin JSON, input bounds, honeypot and minimum fill time; optionally verifies Turnstile; sends escaped HTML and plain text using Resend; and does not log message PII. The browser falls back to a prefilled `mailto:` on failure. Environment variable names are `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`, `TURNSTILE_SECRET`, and build-time `PUBLIC_TURNSTILE_SITE_KEY`.
- CI-only media optimization uses pinned Sharp and ffmpeg-static; it modifies only changed upload files on the content branch and dispatches a new check after a bot push. Images above 500 KiB are recompressed; MP4 videos above 8 MiB are encoded H.264. WebM is accepted only at or below 8 MiB because its container cannot be kept while changing to H.264. Hard limits are 2 MiB for images and 25 MiB for videos.
- Quality workflows include static link/anchor validation, mobile Lighthouse CI reports, production route/build-stamp smoke checks, failure notification support and a 30-minute uptime check. Analytics snippets are present only when explicitly enabled for Production and supplied with both Vercel script paths; they are currently off.

## Required local commands

Run from the repository root:

```bash
npm ci
npm test
npm run check
npm run audit
npm run verify
node scratchpad/compare-baseline.js
```

The preflight comparison expects only documented contact form markup and generated asset fingerprint differences. Do not commit `PREFLIGHT_REPORT.md`, `scratchpad/` or `dist/`.

## Human gates

The `ip-3` Vercel team was confirmed as Hobby, which blocks production rollout for this consulting company until the plan permits commercial use. The owner-side setup actions and exact dashboard paths are maintained in one place: [docs/ADMIN-SETUP.md](docs/ADMIN-SETUP.md). Fill [docs/UAT.md](docs/UAT.md) during the first human rollout.

## Limitations still requiring live access

- Pages CMS UI branch selection and live save/PR flow.
- GitHub repository Actions settings, branch protection and actual status context.
- Vercel dashboard settings, protected preview access, post-deployment behavior and notifications.
- Production form delivery, mailbox deliverability and DNS verification.
- Lighthouse CI on the GitHub-hosted runner and actual `ffmpeg-static` video encoding; the local Windows package does not include a runnable ffmpeg binary.
- Analytics privacy approval and assigned production script paths; Search Console property access.

No external credentials are stored in the repository. No production form submission was sent.
