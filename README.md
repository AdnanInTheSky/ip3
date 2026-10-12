# IP3 Consulting website

Static site for IP3 Consulting Limited (Institute for Public Policy & Practice). Node renders the CMS JSON content into HTML in `dist/`; Vercel serves that directory. The frontend uses vendored GSAP and Lenis browser libraries; /why-ip3 also loads vendored three.js (`assets/vendor/three.module.min.js`, MIT, see `three.LICENSE.txt`).

## Run locally

Requires Node.js 24.x and npm.

```bash
npm ci
npm run dev      # builds dist/ and serves http://localhost:3000
npm run check    # validates CMS content and generated Pages CMS config
npm test         # content, link-checker and contact API regression tests
npm run verify   # builds dist/ and checks links, anchors, metadata and sitemap
```

`dist/` is generated and ignored by Git. Do not edit generated output. `npm run build` regenerates the deployment directory; `npm run audit` finds CMS fields that are not read by templates.

## Source map

| Path | Purpose |
| --- | --- |
| `content/**/*.json` | CMS-managed page copy, navigation, legal drafts, sectors, contact details and media references |
| `cms/schema.js` | Pages CMS editor fields and content validation rules |
| `.pages.yml` | Generated Pages CMS configuration; change `cms/schema.js` and run `npm run cms` instead |
| `src/data.js`, `src/content.js` | Load CMS content for the templates |
| `src/config.js` | Brand constants and build-time site settings |
| `src/layout.js`, `src/pages-home.js`, `src/pages-inner.js`, `src/pages-why.js` | Shared shell and page templates |
| `src/css/site.css`, `src/js/site.js` | Site styling and browser interactions |
| `src/js/why.js` | The /why-ip3 3D journey (vendored three.js r160, loaded only on that page; the page reads fully without WebGL) |
| `src/cap/`, `src/css/cap/`, `src/js/cap/` | The /capabilities page: one module per section (hero and figures, founder and experts, capability rows, the 3D method scroll, the assignment browser, the meeting-photo coverflow, the films). The build bundles the CSS and JS into `assets/css/capabilities.css` and `assets/js/capabilities.js`, loaded only on that page |
| `src/sec/`, `src/css/sec/`, `src/js/sec/` | The eight /sectors/<slug> pages: aperture hero, statement, a signature scroll scene per sector (CSS 3D, SVG or canvas; no WebGL), practice index, field gallery, the assignment ledger and the next-sector portal. Bundled into `assets/css/sectors.css` and `assets/js/sectors.js`, loaded only on those pages |
| `content/sector-pages/` | The long-form story for each sector (CMS "11 · Sector pages"), mapped from IP3's earlier service pages. See [docs/sectors/](docs/sectors/) for the content mapping, media manifest, motion architecture and QA report |
| `content/capability-proof/`, `content/proof.json`, `content/field-media.json` | Copy for those sections, the 37 documented assignment records (from the founder's signed CV and the portfolio) and the meeting photos and films |
| `assets/img`, `assets/video`, `assets/logo`, `assets/vendor` | Source media, logos and vendored browser libraries |
| `api/contact.js` | Vercel contact function; email delivery stays unavailable until owner setup is complete |
| `build/`, `.github/` | Site build, validation, publishing checks and CI-only media optimization |
| `dist/` | Generated deployment output, including `build.json`, sitemap and robots file |

Sectors are ordered by position in `content/sectors.json`. Changing the order updates the home carousel, sector index and footer sector links. A hidden sector is omitted from generated routes, navigation and sitemap. Each capability in `content/capabilities.json` renders as a row on /capabilities with a `#slug` anchor; its `groups` open under the row as "What this includes".

## Pages CMS publishing

The intended Pages CMS flow, after the owner setup is complete, stores editor commits on a `content` branch. The check workflow validates and builds that commit; after a successful check for the exact current branch head, a trusted workflow opens or updates a review PR. Vercel creates a PR preview, and an authorized reviewer merges to `main`. The workflow synchronizes later `main` changes into `content` and explicitly dispatches a check because token-authored pushes do not start ordinary push workflows.

The live Pages CMS branch selector and commit attribution still require a human test. See [docs/EDITOR-GUIDE.md](docs/EDITOR-GUIDE.md) for content workflow details and [docs/ADMIN-SETUP.md](docs/ADMIN-SETUP.md) for the remaining owner setup.

Photos may be JPEG, PNG or WebP; videos may be MP4 or WebM. CI recompresses changed images above 500 KiB (maximum 2400 px wide) and changed MP4 videos above 8 MiB (H.264 up to 1080p). WebM uploads must stay at or below 8 MiB because changing their container to H.264 would break the extension; images above 2 MiB and videos above 25 MiB fail validation. Pages CMS itself has no verified upload-byte limit, so follow these sizes before upload. See the [editor guide](docs/EDITOR-GUIDE.md).

## Vercel and contact form

`vercel.json` selects the Other framework preset, runs `npm ci` and `npm run build`, and publishes `dist/`. The build generates a `dist/build.json` stamp with `commit` from Vercel or local Git and `vercelGitCommitSha` from Vercel only. Both are null in a source archive without Vercel or Git metadata. Production `SITE_URL` should be `https://ip3-bd.org`.

The public Vercel team was confirmed as Hobby during the preflight. That plan is a release blocker for this consulting-company website until the team uses a plan that permits commercial use. Contact delivery also stays gated on confirming the recipient mailbox, approving US processing by Resend, legal review, Resend domain verification and Turnstile setup. The contact function uses `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`, and `TURNSTILE_SECRET`; the public widget uses `PUBLIC_TURNSTILE_SITE_KEY`. Keep secrets in Vercel runtime variables, not source. The form retains a prefilled `mailto:` fallback. See the single owner checklist at [docs/ADMIN-SETUP.md](docs/ADMIN-SETUP.md).

## Quality and monitoring

GitHub Actions runs regression tests, content/CMS validation, a build and link checks, plus mobile Lighthouse CI reports for five representative pages. A successful production deployment triggers route and build-stamp smoke checks. A scheduled workflow checks production every 30 minutes; GitHub and Vercel notifications must be configured by the owner. Vercel Web Analytics and Speed Insights remain disabled until privacy review. Search Console ownership still needs confirmation.

## Remaining review

- Confirm the Approach case-study paragraphs, engagement summaries, counts, client names and testimonials against IP3 source documents.
- Review Privacy Policy and Terms with counsel; approve any Resend/Turnstile and analytics disclosures before enabling those services.
- Confirm the expanded detail under each of the six capabilities on /capabilities (`content/capabilities.json`). Five of the six are carried over and lightly edited from the earlier WordPress service pages; the copy for 04 Institutions, Governance & Delivery is new, written from its existing deliverables and generic delivery practice, and needs IP3 review. Before publishing, IP3 must also confirm the old site's claims that were held back: "over a decade with the World Bank, ADB and European Commission"; "Bangladesh's first feasibility study for secondary and madrasah education"; and the case studies not yet in `content/engagements.json` (Payra Seaport 2017, Jolshiri Aqua Green City 2019, BIFFL/BEZA equity investment 2017, Global LEAP results-based financing, World Bank ESMAP/ASTAE evaluation, HALOW+ 2019, Dhaka Sewerage Improvement Project M&E 2020). These now appear on /capabilities as assignment records taken from the founder's signed CV, with the CV's own dates; confirm they may be published.
- Sector pages (`content/sector-pages/`): the claims, figures, photos and bridge sentences waiting on IP3 are listed under "Waiting on IP3" in [docs/sectors/QA-REPORT.md](docs/sectors/QA-REPORT.md). Three Sustainable-finance figures are in the CMS but hidden until a source is added.
- Review the six SEO copy proposals in [docs/SEO-COPY-PROPOSALS.md](docs/SEO-COPY-PROPOSALS.md); no client copy has been changed.
- /capabilities proof layer (`content/proof.json`, `content/field-media.json`, `content/capability-proof/`). Settled by IP3 on 2026-10-11: 20 years of experience (signed CV); all 37 records listed; dates and engagement years taken from the CV (Costing & Financing Expert CV, Sep 2026); client names may be shown; photo consent obtained; the SANEM-era ADB events are shown as the founder's experience, not IP3's work; all films are by the Institute for Public Policy & Practice (IP3), the research entity of IP3 Consulting Limited. Still open:
  - 100+ projects in total (home page and founder bio); /capabilities shows the 37 documented in the CV. Three engagement summaries keep their page wording and add the CV record (sida-cpd-textile, worldbank-fat, bmdf-transformation).
  - Wording edits made for accuracy: the portfolio's published rewording for four activities, "evaluated" (not "implemented") for the 20 IFC simplification projects, the early-warning outputs described as in preparation, and the CV's geography caveat on three records.
  - The method section's chart and options test are illustrative and labelled so; the 528 figure comes from the green-transition record (400 firms, 120 KIIs, 8 FGDs).
