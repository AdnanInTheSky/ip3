# IP3 site implementation handoff — 2026-10-10

## Repository state

- Repo: `mdsyfulhoque-afk/ip3-bd.org`
- Local branch: `ops-hardening`; changes are local and have not been pushed or deployed.
- Fix groups F1–F7 are separate commits. The preflight report remains untracked at `PREFLIGHT_REPORT.md`; scratch manifests are under the locally excluded `scratchpad/`.
- Do not change GitHub/Vercel/DNS settings, add credentials, send a real email, or deploy without the owner's later instruction.

## Implemented

- `.gitattributes` forces text checkouts to LF and marks uploaded media/font formats binary. The build normalizes source and generated text line endings; `build/selftest.js` compares every `dist/` file from LF and CRLF source copies, excluding only `build.json.builtAt`.
- CMS sectors are a single ordered list. Navigation, footer links, legal drafts and page headings/copy are schema-backed. Sector order follows list order; hidden sectors are omitted from routes/navigation/sitemap.
- The build writes pages, assets, sitemap, robots, manifest and `build.json` to ignored `dist/`. Vercel publishes `dist`; the dev server serves it. The stamp carries local/Vercel `commit` and a separate `vercelGitCommitSha`; the latter is null outside a Vercel Git build.
- The required Content check job is explicitly named `check` and contains only install, tests, content/CMS validation and build/link verification. Lighthouse runs in a separate non-gating workflow and saves reports as artifacts. The main branch policy requests PRs, zero approvals to prevent a single-owner deadlock, strict checks, no force-push and no deletion. An owner must verify the live check-run name before applying it; details are in `docs/BRANCH-PROTECTION.md`.
- The publishing bot skips cleanly if `origin/content` is absent, resets content to main when it has no unique commits, and fails clearly on a real conflict. Content PRs must use **Create a merge commit** so branch histories remain connected. Tests use a temporary local Git repository and mocked GitHub fetch calls.
- The contact form only posts to `/api/contact` when the build flag `CONTACT_API_ENABLED=1` is set. Otherwise it opens a prefilled `mailto:` without a network request. The endpoint requires Turnstile, checks the client timestamp only for more than five minutes of future skew or age above 24 hours, retains the honeypot, sends through Resend, and has no per-IP limit. A Vercel Firewall rate-limit rule is an available extra control. Provider calls are mocked in tests.
- The uptime workflow is skipped until the GitHub repository variable `UPTIME_URL` is set. The smoke script retains its project-host allowlist. Production smoke requires both build stamp SHA fields and reports a missing `VERCEL_GIT_COMMIT_SHA` with the Vercel environment-variable setting to check.
- CI and `package.json` target Node.js 24.x. Analytics remain opt-in through `ENABLE_ANALYTICS=1` and the Production environment gate; static snippets use Vercel's fixed Web Analytics and Speed Insights paths.
- Media optimization remains CI-only, with pinned Sharp and ffmpeg-static. Images above 500 KiB are recompressed; MP4 files above 8 MiB are encoded H.264. WebM above 8 MiB is rejected; image/video hard limits are 2/25 MiB.

## Verification and owner gates

Per Prompt 3, run `npm test`, `npm run check`, and `npm run verify` from a fresh `git -c core.autocrlf=false archive HEAD` extraction, not from the working tree. Repeat with a CRLF-converted `src/` copy and compare all output hashes except `build.json.builtAt`. No external rollout actions have been performed.

The `ip-3` Vercel team was confirmed as Hobby, which is not permitted for this consulting-company use until the owner moves to a commercially eligible plan. Remaining human checks include GitHub branch protection and exact check context, Vercel project settings and preview access, DNS and mailbox verification, Resend/privacy approval, editor accounts and live CMS flow, production smoke, analytics privacy approval, Search Console access, and hosted CI/Lighthouse/media execution. The owner checklist is in [docs/ADMIN-SETUP.md](docs/ADMIN-SETUP.md); record acceptance in [docs/UAT.md](docs/UAT.md).

No external credentials are stored in the repository. No production form submission was sent.
