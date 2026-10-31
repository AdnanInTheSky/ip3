# IP3 Consulting website

Static site for IP3 Consulting Limited (Institute for Public Policy & Practice). Node renders the CMS JSON content into HTML in `dist/`; Vercel serves that directory. The frontend uses vendored GSAP and Lenis browser libraries; /why-ip3 also loads vendored three.js (`assets/vendor/three.module.min.js`, MIT, see `three.LICENSE.txt`). D3 v7.9.0 is vendored for data visuals (`assets/vendor/d3.min.js`, ISC, see `d3.LICENSE.txt`; sha256 f2094bbf…86539, 280 KB) loaded only by /evidence-map: a page opts in with `page({ scripts: '<script src="/assets/vendor/d3.min.js" defer></script>' })` and then uses `window.d3` — keep it off the shared layout so other pages don't pay for it.

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
| `src/sections/` | Home sections shared by templates: testimonials, and the delivery chain (`chain.js`) that merges the former "Built for complex mandates" and "Translation, not theory" sections |
| `src/js/why.js` | The /why-ip3 3D journey (vendored three.js r160, loaded only on that page; the page reads fully without WebGL) |
| `src/cap/`, `src/css/cap/`, `src/js/cap/` | The /capabilities page: one module per section (hero and figures, founder and experts, capability rows, the 3D method scroll, the assignment browser, the meeting-photo coverflow, the films). The build bundles the CSS and JS into `assets/css/capabilities.css` and `assets/js/capabilities.js`, loaded only on that page |
| `src/sec/`, `src/css/sec/`, `src/js/sec/` | The eight /sectors/<slug> pages: aperture hero, statement, a signature scroll scene per sector (CSS 3D, SVG or canvas; no WebGL), practice index, field gallery, the assignment ledger and the next-sector portal. Bundled into `assets/css/sectors.css` and `assets/js/sectors.js`, loaded only on those pages |
| `src/pages-evidence.js`, `src/css/evidence.css`, `src/js/evidence.js` | /evidence-map: the 37 records in `content/proof.json` as one dot each (D3), regrouped by client type, delivery-chain phase and sector as the scroll steps pass (GSAP ScrollTrigger), then an explorer with grouping buttons, client search and a record panel, and the same data as a table. Client and client type are record fields; phases are the home delivery chain (`content/home/translation.json`) and sectors the sector pages' evidence lists. Every count and step note is computed at build time; copy is in CMS → Page text → Evidence map. Without JavaScript the steps and table carry the page |
| `content/sector-pages/` | The long-form story for each sector (CMS → Sectors → Sector pages), mapped from IP3's earlier service pages. See [docs/sectors/](docs/sectors/) for the content mapping, media manifest, motion architecture and QA report |
| `content/capability-proof/`, `content/proof.json`, `content/field-media.json` | Copy for those sections, the 37 documented assignment records (from the founder's signed CV and the portfolio) and the meeting photos and films |
| `assets/img`, `assets/video`, `assets/logo`, `assets/vendor` | Source media, logos and vendored browser libraries |
| `api/contact.js` | Vercel contact function; email delivery stays unavailable until owner setup is complete |
| `build/`, `.github/` | Site build, validation, publishing checks and CI-only media optimization |
| `dist/` | Generated deployment output, including `build.json`, sitemap and robots file |

Sectors are ordered by position in `content/sectors.json`. Changing the order updates the home carousel, sector index and footer sector links. A hidden sector is omitted from generated routes, navigation and sitemap. Each capability in `content/capabilities.json` renders as a row on /capabilities with a `#slug` anchor; its `groups` open under the row as "What this includes".

## Pages CMS publishing

The Pages CMS editor uses grouped, plain-language navigation and forms for existing content. After the owner confirms hosted access and completes setup, editors save commits to the `content` draft branch. Each save independently starts Content check and an automatic Vercel Preview build; `vercel.json` explicitly enables deployments for `content`, while `main` remains the Production branch. After a successful check for the exact current branch head, a trusted workflow opens or updates a review PR. An authorized reviewer checks the successful preview and checks for that same commit, then merges to `main` using **Create a merge commit**. The workflow synchronizes later `main` changes into `content` and explicitly dispatches a check because token-authored pushes do not start ordinary push workflows. Production changes appear after approval, merge and successful deployment; a CMS save does not publish immediately. Preview access follows Vercel Deployment Protection and may require a separate authorized Vercel login.

The **Page layout · section order** form lets editors reorder supported middle sections on Home, About, People and Contact. The hero and closing calls to action remain fixed; validation requires each supported section exactly once. Why IP3, Approach, Capabilities, sector detail and legal pages retain fixed sequences. See [the editor guide](docs/EDITOR-GUIDE.md) for use and restrictions.

The Home **Testimonials pilot** can move the shared testimonial cards after Engagements or before Founder, or keep them beside clients and funders in the default layout. It reuses the existing records rather than copying them. See [the section mapping and safeguards](docs/CMS-SECTION-MAPPING.md).

The live Pages CMS branch selector, collaborator permissions, preview timing and commit attribution still require a human test. See the [editor guide](docs/EDITOR-GUIDE.md), [CMS requirements and onboarding checklist](docs/CMS-REQUIREMENTS-MATRIX.md), [UAT record](docs/UAT.md) and [owner setup](docs/ADMIN-SETUP.md).

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
- Home delivery chain (`content/home/translation.json`, CMS → Home page → 05). Redesigned Oct 2026 as one dark section: six stage tiles that filter the 27 assignment cards (same bar, Carousel/Grid and card style as the /capabilities record). Stage titles, tile lines and deliverables are IP3's supplied copy; the key-activities and benchmark lists were removed. To confirm:
  - The one-sentence stage descriptions (`body`) and the tile lines (IP3's original quotes) promise work some records do not show (for example cabinet delivery units, green bonds, statutory drafting). Confirm IP3 can evidence these, or soften the wording.
  - The note above the cards names the founder directly; card copy otherwise speaks as IP3.
  - Photos: every assignment card has a picture. Records with their own recorded photo or engagement image use it; the other 30 use a library image of the sector (chosen per record in the CMS, field “Photo for the card”). Those are indicative, not documentation, and the note above the cards says so. IP3 should replace them with real project photos where they exist.
- Home Engagements + Insights are now one section, “Engagements & insights” (`src/sections/evidence.js`, labels in `content/home/evidence.json`): 7 engagements, 4 insights and 10 publications in one filterable carousel/grid. The Home section order has 9 entries (“Engagements & insights” replaces the two). The old `#engagements` and `#insights` anchors still resolve.
- All Home section headings now share one size (`.home section:not(.hero) h2`).
  - The `impact` line added to each of the 37 records in `content/proof.json` was drafted from that record's own summary and activities, not from outcome data; current assignments start "Under way:". Review each before publishing.
  - Key activities for phases 1, 2, 4, 5 and 6 are compiled from the methods recorded in that phase's evidence and say so under the list; replace them with IP3 wording if preferred. Performance benchmarks exist only for Systemic Design.
  - Only Phase 4 carries a category tag ("Architecture"); an earlier brief put it on Phase 3. Add a tag to each phase or clear it.
  - The 30 deliverables from the former output cards are each placed under one phase, keeping their group name; the five finance deliverables sit under Delivery Architecture.
- Evidence map (/evidence-map, new Oct 2026, reached from the footer and breadcrumb only): confirm IP3 wants it published and where it should be linked from (header menu, /capabilities, home delivery chain). Its headings and step copy are new and need IP3 review; the numbers in them are computed from the records, not written in. It names the most frequent client (Asian Development Bank, 7 of 37) and shows client names on hover, as /capabilities already does.
- Review the six SEO copy proposals in [docs/SEO-COPY-PROPOSALS.md](docs/SEO-COPY-PROPOSALS.md); no client copy has been changed.
- /capabilities proof layer (`content/proof.json`, `content/field-media.json`, `content/capability-proof/`). Settled by IP3 on 2026-10-11: 20 years of experience (signed CV); all 37 records listed; dates and engagement years taken from the CV (Costing & Financing Expert CV, Sep 2026); client names may be shown; photo consent obtained; the SANEM-era ADB events are shown as the founder's experience, not IP3's work; all films are by the Institute for Public Policy & Practice (IP3), the research entity of IP3 Consulting Limited. Still open:
  - 100+ projects in total (home page and founder bio); /capabilities shows the 37 documented in the CV. Three engagement summaries keep their page wording and add the CV record (sida-cpd-textile, worldbank-fat, bmdf-transformation).
  - Wording edits made for accuracy: the portfolio's published rewording for four activities, "evaluated" (not "implemented") for the 20 IFC simplification projects, the early-warning outputs described as in preparation, and the CV's geography caveat on three records.
  - The method section's chart and options test are illustrative and labelled so; the 528 figure comes from the green-transition record (400 firms, 120 KIIs, 8 FGDs).
#   i p 3  
 