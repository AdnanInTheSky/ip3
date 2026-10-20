# AI handoff — Sector links + Approach "what you receive" (2026-10-20, slice 2)

- Worktree: `D:\CONTENT IP3 WEBSITE\NEW WEBSITE DESIGN\ip3-bd.org-sector-links`, branch `sector-links` from origin/main `ca7e83a`. Commit 1 is a copy of the uncommitted Mandate Finder work (slice 1, from the `mandate-finder` worktree, which was left untouched); commit 2 is this slice. Not pushed.
- Preview: config `sl-main` (port 3540) in the parent folder's `.claude/launch.json`.

## Done
- Every `/sectors/<slug>` page now has the same "Related work" block (`src/sec/links.js`, CSS `src/css/sec/75-links.css`) after "Where we add value": three columns linking capabilities (`/capabilities#slug`), engagements (`/engagements#slug`) and published articles (`/insights/<slug>`), each with an "All …" link, plus a link to `/find-support`. An empty column says so instead of disappearing (Health and AI have no engagement or article yet).
- One source for the mappings: `src/pages-finder.js` now exports `sectorCaps` (sector `caps` + the data/digital capability for `DIGITAL_SECTORS`), `sectorEngagements` (engagements whose `sectorSlug` is the sector, then any slugs an editor listed on the sector) and `sectorArticles` (from `ARTICLE_LINKS`). "Capabilities applied" cards use `sectorCaps` too.
- The old "Related engagements" row list under the assignment ledger is gone; those engagements now sit in the new block. Its heading (`sector-related`) is reused, with the eyebrow changed from "Related engagements" to "Related work".
- `/approach` six movements: each step now has a "What you receive" line and "Related capability: <title>" linking to `/capabilities#slug`. Fields `receive` and `capability` are in `content/approach/pathway.json` and registered in `cms/schema.js` (form "21 · Approach — Six movements"); labels are in `content/page-text/approach.json` (`pathway-receive`, `pathway-capability`). `npm run cms` was re-run, and the CMS contract hash in `build/cms-editor-usability.test.js` was updated for this intended schema change.

## Verification
- `npm run build`, `npm run check`, `npm run links`, `npm test` (84 pass), `npm run test:hostinger` (36 pass). The 5 metadata-length warnings were there before this work.
- Browser (1440px and 375px): climate page links to 4 capabilities, 2 engagements and 2 articles; health page shows the empty-column notes; /approach shows all six lines and links. No horizontal overflow, no console errors.

## Needs IP3 review (new copy and mappings, not from a client source)
- The six "What you receive" sentences in `content/approach/pathway.json` are drafted from each movement's own "What We Deliver" / "Deliverable Map" bullets. Please confirm the wording.
- Step → capability mapping: Sense & Diagnose → Policy, Economics & Strategy; Build Intelligence → Data, Digital & Responsible AI (from "decision-grade data and service analytics"; Policy, Economics & Strategy is the other candidate); Co-Design & Test → Program & Project Design; Mobilise → Development Finance; Implement & Transfer → Institutions, Governance & Delivery; Learn & Scale → Monitoring, Evaluation, Learning & Impact.
- New sector-page labels in `content/page-text/sectors.json` (`sx-links-*`), including the empty-column notes "No engagement in this sector is published on the site yet." and "No article on this sector is published yet."
- The Digital Government page still lists `bmdf-oscb` and `worldbank-fat` through its own `engagements` field, although their `sectorSlug` is Governance and Economic Transformation. They were kept on purpose; remove them in the CMS if they should not appear there.
- Article → sector mapping is still `ARTICLE_LINKS` in `src/pages-finder.js` (as in slice 1).

## Not done (later slices)
- About/Why proof points linked to evidence; engagement entries (mandate, role, deliverables, evidenced result); People → work links; Insights topic filters; Privacy/Terms review; metadata-length warnings. The Approach case-study paragraphs (Ghana, Malawi, municipal finance, LDC graduation) were not checked against proof.json in this slice.

---

# AI handoff — Mandate Finder (2026-10-20)

- Worktree: `D:\CONTENT IP3 WEBSITE\NEW WEBSITE DESIGN\ip3-bd.org-mandate`, branch `mandate-finder` from origin/main `ca7e83a`. Uncommitted, not pushed.
- Preview: config `mf-main` (port 3530) in the parent folder's `.claude/launch.json`.

## Done (slice 1 of the review: challenge → capability → proof → contact)
- New page `/find-support` (`src/pages-finder.js`): step 1 sector (shows each sector's problem), step 2 help type (diagnosis / project design / finance / implementation / evaluation). Results list matching capabilities, engagements and the 4 published articles. Browser-only; nothing stored or sent.
- "Discuss this mandate" links to `/contact?sector=<slug>&help=<key>#contact-form`; the contact page pre-fills Engagement type, Focus area and a starter message. Only known keys are accepted; no free text is taken from the URL.
- Home hero slide 1 primary CTA → "Find the right support" (`/find-support`). Finder also in footer Explore and breadcrumbs.
- Copy is CMS-editable: `content/page-text/finder.json` (form "00 · Page text — Mandate Finder") + `pages.finder`.
- Route registered in `build/validate.js`, Hostinger route list + test (21 → 22), CMS contract hash updated in `build/cms-editor-usability.test.js` (intended schema change).

## Verification
- `npm run build`, `npm run check`, `npm run links`, `npm test` (84 pass), `npm run test:hostinger` (36 pass).
- Browser: filtering (Governance + Finance → 1 capability, 3 engagements, 2 articles), contact prefill, mobile 375px (hero CTA above the fold, no overflow), no console errors.

## Needs IP3 review
- Mappings in `src/pages-finder.js`: help type → capability, engagement tags → help type, and article → sectors/help (articles have no sector field). Keep to published, source-backed work.
- Contact page: the "prepares an email, you send it" note already sits under the button (`form-note`); no change made.

## Not done (later slices from the review)
- Approach "what you receive at each step" + service links; About/Why proof points linked to evidence; sector → capabilities/engagements/articles links; engagement entries (mandate, role, deliverables, evidenced result); People → work links; Insights topic filters; Privacy/Terms review; metadata-length warnings (about/sectors/engagements desc).

---

# Responsive refinement — 2026-10-12 (branch `responsive-refine`, from main 92e8786)

- Goal: phone and tablet presentation only. No text, order, asset, link or route changes.
- Files:
  - `src/css/site.css`: new block at the end, "responsive art direction".
  - `src/css/cap/90-responsive.css`: new; /capabilities micro labels.
  - `src/css/cap/50-browser.css`: record-sheet arrows keep their names for screen readers.
  - `src/layout.js`: drawer links get `aria-current`; the drawer gets `data-lenis-prevent` so it scrolls while Lenis is stopped.
  - `src/js/site.js`: `initHsNative`, so the sector progress line follows a native swipe below 900px.
- Fixed:
  - Menu clipped in phone landscape and on short phones (it now scrolls, and the current page is marked).
  - Hero slide labels hidden at 760px and below (restored; 2×2 at 420px and below).
  - Hero copy clipped on short screens (the hero now grows with its copy).
  - Sector card text shown only on hover on touch screens (now always shown).
  - Sector thumbnails and the "Scroll / All sectors" bar hidden on mobile (both restored).
  - Text under 10.8px at 1040px and below (lifted to 10.9 to 11.5px).
  - Small tap targets (hit areas expanded with no layout change).
  - Safe areas; the footer wordmark spans the full width.
- Verified:
  - The content inventory (text, headings, sections, links, media, alts, controls, meta) is identical on all 21 pages.
  - Desktop layout is identical at 1280, 1440 and 1920 (positions of every h1–h3, p, img and .btn).
  - No horizontal overflow at 320, 360, 375, 390, 430, 600, 768 or 1024px.
  - `npm run check`, `npm test` (50/50) and `npm run verify` all pass.
- Not verified: real iOS/Android devices, Safari/Firefox, Lighthouse field data (LCP/INP/CLS), screen readers.

# IP3 site implementation handoff — 2026-10-10

## Repository state

- Repo: `mdsyfulhoque-afk/ip3-bd.org`
- Local branch: `ops-hardening`; changes are local and have not been pushed or deployed.
- Fix groups F1–F8 are separate commits. The preflight report remains untracked at `PREFLIGHT_REPORT.md`; scratch manifests are under the locally excluded `scratchpad/`.
- Do not change GitHub/Vercel/DNS settings, add credentials, send a real email, or deploy without the owner's later instruction.

## Prompt 4 follow-up

- G1: moved contact endpoint tests to `build/contact.test.js`; `api/` contains only deployable `contact.js`, enforced by a selftest.
- G2: Content check push triggers are limited to `main` and `content`; pull requests and manual dispatch remain enabled.
- G3: admin setup now documents contact spam controls, scheduled-workflow re-enabling, and repository visibility confirmation.
- G4: the preflight report remains untracked, starts with the internal-note warning, and uses plain-text scratchpad references.
- `core.autocrlf=false` is set in this repository's local `.git/config` only; the global setting is unchanged.

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

Prompt 3 verification is complete in two fresh `git -c core.autocrlf=false archive HEAD` exports: `npm test`, `npm run check`, and `npm run verify` passed in both. Each run passed 42 tests; check emitted six existing SEO-length hints; verify built 20 pages and 19 sitemap URLs. After converting the 8 text files under `src/` to CRLF, all 86 `dist/` file hashes still matched the LF export after normalizing only `build.json.builtAt`. Export directories and manifests are under the locally excluded `scratchpad/`. No external rollout actions have been performed.

The `ip-3` Vercel team was confirmed as Hobby, which is not permitted for this consulting-company use until the owner moves to a commercially eligible plan. Remaining human checks include GitHub branch protection and exact check context, Vercel project settings and preview access, DNS and mailbox verification, Resend/privacy approval, editor accounts and live CMS flow, production smoke, analytics privacy approval, Search Console access, and hosted CI/Lighthouse/media execution. The owner checklist is in [docs/ADMIN-SETUP.md](docs/ADMIN-SETUP.md); record acceptance in [docs/UAT.md](docs/UAT.md).

## F8 independent source recheck — 2026-10-10

- Vercel's [Hobby plan](https://vercel.com/docs/plans/hobby) and [Terms](https://vercel.com/legal/terms) limit Hobby to personal, non-commercial use. The team's actual plan came from the owner; production use remains gated.
- Vercel's [Automation Bypass documentation](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/protection-bypass-automation) says the feature is available on all plans. This does not confirm whether this project's previews are protected or which bypass mode is enabled.
- GitHub's [required-check guidance](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks) and [workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax) document job names and required checks. The workflow job is explicitly `check`; only a live successful check run can establish the exact context for this repository.
- GitHub's [Actions settings documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository) documents the setting for Actions to create/approve PRs and read-only defaults for new personal-account repositories. Existing repository or organization values remain unverified. The [GITHUB_TOKEN documentation](https://docs.github.com/en/actions/concepts/security/github_token) confirms token-authored pushes generally do not trigger new workflow runs.
- Resend's [pricing](https://resend.com/pricing) states Free includes 3,000 emails/month, 100/day, 3 domains and 30-day retention. [Domain documentation](https://resend.com/docs/dashboard/domains/introduction) requires a verified sending domain; [setup instructions](https://resend.com/docs/add-a-domain) specify provider DNS records including SPF/DKIM.
- Pages CMS [configuration docs](https://pagescms.org/docs/configuration/) describe branch-specific repository configuration; [settings docs](https://pagescms.org/docs/configuration/settings/) document `settings.commit.templates`. The live editor's branch-selection UI remains unverified.
- GitHub's current [Ubuntu 24.04 runner inventory](https://github.com/actions/runner-images/blob/main/images/ubuntu/Ubuntu2404-Readme.md) does not list ffmpeg. On 2026-10-10, the `ubuntu-latest` label still maps to Ubuntu 24.04; GitHub announced it will move to 26.04 in November 2026. CI installs pinned `ffmpeg-static`, so it does not depend on the runner's system ffmpeg.

The repository-specific CI check name, Actions settings, Pages CMS live editor behavior and Vercel project protection are not independently confirmed without owner access and a successful run. Source links and statuses are also recorded in the untracked `PREFLIGHT_REPORT.md`.

No external credentials are stored in the repository. No production form submission was sent.

## Motion pages — /why-ip3, Insights and People merge (2026-10-10, Claude Code)

- Worktree `D:\CONTENT IP3 WEBSITE\NEW WEBSITE DESIGN\ip3-bd.org-motion`, branch `motion-pages` from `origin/main` e165bf6, kept apart from Codex's `admin-landing` checkout. Committed and pushed; opened as a PR against `main` (not merged).
- **Merging with `admin-landing` (PR #2):** a trial merge conflicts only in `dev-server.js` and `src/layout.js`. To resolve, take `admin-landing`'s version of both, then (1) add `'.webm': 'video/webm'` to `TYPES` and (2) add `scripts = ''` after `minimal = false` in `page()` and insert `${scripts ? `${scripts}\n` : ''}` just before `</body>`, outside the `minimal` block. With that resolution: `npm test` passed 65/65, `npm run check` was OK, and `npm run verify` built 22 pages.
- **/why-ip3 (new page, in header nav after About):** the ip3website home page rebuilt for this static site. A seven-part scroll journey (opening, complexity, evidence, insight, policy, practice, impact) runs over a three.js world ported from React-Three-Fiber to plain three.js in `src/js/why.js`. It has contour terrain that turns from rough to terraced, system layers with links, evidence strata, about 1,900 GPU signals, travelling policy documents, rising institutions, projected DOM labels, a scene rail, a 3D on/off switch, a DPR governor and a context-loss fallback. The page then continues with a giant-word bridge, a brand film that grows to full width, a capabilities list, a sector network (ties are sectors sharing three or more capabilities), selected work, a pinned Policy Intelligence Terminal walkthrough, the six-movement line and a CTA. Colours follow the IP3 palette. All words live in `content/why.json` and `content/page-text/why.json`, with schema and validation added. Without WebGL, or with reduced motion, the static contour poster stays and CSS draws the layers.
- **Insights:** the 10 published ip3website publications are in `insights.json → publications`, with a type filter, outside links and ItemList JSON-LD. Credits link to `/people#anchor`.
- **People:** the 17 published ip3website profiles were merged by name into the existing groups. They add portraits (13), affiliation, bio paragraphs, degrees and profile anchors; a profile opens in a dialog, with a `<details>` fallback. Dr. Md. Esraz-Ul-Zannat was added to Affiliated Research Scholars. This site's roles and group names were kept. A drifting labelled network canvas from the IP3 Motion engine sits beside the network heading.
- **Site-wide motion (portfolio site and the project GSAP kits):**
  - page heroes dolly in 3D;
  - the founder portrait drifts in 3D;
  - cards tilt toward the pointer;
  - the Approach page shows the six movements as a pinned CSS-3D film of 48 fragments (portfolio technique);
  - charts draw in.
- **Assets:**
  - three.js r160, copied from the portfolio starter kit: `assets/vendor/three.module.min.js` (sha256 3e690ac7d180b0aa…, 656 KB), with its MIT licence alongside;
  - the ip3-reel mp4/webm and poster;
  - four terminal screenshots;
  - 13 portraits;
  - a recoloured contour SVG.

  `dev-server.js` now serves `.webm` as `video/webm`.
- **Validation:**
  - `npm test` passed 50/50, including 7 new negative tests.
  - `npm run check` was OK, with the same 6 SEO hints.
  - `npm run verify` built 21 pages and 20 sitemap URLs.
  - `npm run audit` confirmed every content field is read.
  - Browser checks at 1440, 800 and 375 px and with `?view=simple` showed no console errors.
  - Not run: a clean `git archive` export (nothing is committed yet), Lighthouse, real devices, Safari.
- **Owner review needed:**
  1. Roles differ between this site and the ip3website team pack. Examples: Shafiun Shimul (Advisor here, Founding Director & Lead Economist there), Tat Thanh Tran (Dr. or Prof. Dr.), Siban Shahana (Asst. Prof. or Research Fellow, BIDS).
  2. Esraz-Ul-Zannat's doctorate is not listed in the 2015 CV.
  3. Confirm that the Policy Intelligence Terminal claims, its screenshots and the brand film are approved for the public site.
  4. The ip3website summary gives the founder 20 years of experience; `founder.json` says 17 and was left unchanged.
  5. The eight-item header nav fits at 1440 px; check it on the owner's screens.

## Art-direction pass (2026-10-10, Claude Code) — uncommitted on `motion-pages`

- **Site-wide finish (`src/css/site.css`):** a fine film-grain layer (`body::after`, inline SVG noise, hidden in print); `text-wrap: pretty` on body copy; hanging punctuation on quotes; tabular figures on stats.
- **Contour motif:** the `/why-ip3` contour terrain (`assets/img/why-contours.svg`, no new asset) now drifts behind the home hero headline (`.hero__contours`) and sits faintly behind the stats band (`.stats-band`). It is static under reduced motion.
- **Partners (`src/pages-home.js` → `proof()`):** the two name lists are now full-width typographic marquees running in opposite directions, alternating roman and italic. They pause on hover, the duplicate copy is `aria-hidden`, and under reduced motion they become a static wrapped list. They use the same `partners` content, with no new facts.
- **Footer wordmark:** the outlined "IP3 Consulting" fills with the rust-to-leaf gradient as the page reaches the end (GSAP scrub of `--fill` in `src/js/site.js`). Without JS it is fully filled.
- **Page transitions:** native cross-document View Transitions (`@view-transition`). The old page lifts away and the new one rises behind a night curtain, and the header keeps its own transition group. `initTransitions()` skips the scripted fade where `onpagereveal` is supported, and reduced motion turns it off.
- **Validation:**
  - `npm test` passed 50/50.
  - `npm run check` was OK, with the same 6 SEO hints.
  - `npm run verify` checked 21 pages.
  - `npm run audit` found every field used.
  - Browser checks at 1440 and 375 px showed no horizontal overflow.
- **Not verified:** the transition animation could not be seen in the hidden in-app pane. Chrome skipped it there and logged "Transition was skipped", so it needs a check in a visible Chrome or Safari 18.2+. Also not run: Firefox (keeps the scripted fade-out and loses the fade-in), Lighthouse, real devices.
- **Merge note:** these edits do not touch `dev-server.js` or `src/layout.js`, so the PR #2 conflict resolution above is unchanged.

## Logo replacement (2026-10-11, Claude Code, worktree ip3-bd.org-brand-claude, branch brand-identity-claude, from main 8591e42)
Goal: the owner chose their original logo (black P/words, #054d3b CONSULTING bar) as the site logo, as crisp vector, lettering and layout unchanged. Not committed, not pushed.
- New: `src/brand.js` (`brandLogo()`), `assets/logo/ip3-logo-primary.svg`, `ip3-logo-reverse.svg`, `ip3-favicon.svg`; replaced favicon-32/48, apple-touch-icon, icon-192/512 PNGs (same names).
- Edited: `src/layout.js` (header + footer use `brandLogo()`, svg favicon link), `src/css/site.css` (`.brand__logo` 54px, 42px under 1040px; `.foot__logo` 72px).
- Unused now but left in place: `assets/logo/ip3-mark.png|webp`, `ip3-lockup.png`; `.brand__t/.brand__n/.brand__d` CSS.
- Sources, colourways, final sheets, guidelines: `docs/brand-claude/` (not deployed). Read `GUIDELINES.md` first.
- Checked: `npm test` 50 pass; `npm run check` OK; `npm run verify` OK (21 pages); header/footer/mobile viewed in Chrome. Not checked: Safari, real devices, Vercel preview.
- Tight nav logo (follow-up): `assets/logo/ip3-logo-nav(.svg|@1x/2x/3x.png)` + `-reverse` variants, viewBox `86.87 126.81 358.09 166.38` (zero padding, PNG margins 0 px). `brandLogo({png:true})` emits PNG with srcset. CSS heights: header 48px, ≤1040px 40px, footer 64px. Old padded `ip3-logo-primary/reverse.svg` removed from assets (kept in docs/brand-claude/final). Tests 50/50, verify OK.
