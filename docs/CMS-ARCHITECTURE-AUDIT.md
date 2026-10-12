# IP3 CMS architecture audit and Pages CMS implementation

**Audit date:** 13 October 2026  
**Repository:** `mdsyfulhoque-afk/ip3-bd.org`  
**Audited ref:** GitHub `main`, `5ca90c53c4c62f409b1aaa2332496b4ccfa835a8`  
**Implementation branch:** local branch `cms-pages-usability`, based on that audited commit

## Executive decision

**Final design decision under the no-spend constraint:** Use Pages CMS with the existing GitHub JSON and Vercel build workflow, provided the hosted service confirms no fee for IP3. CloudCannon's published plans are paid and are excluded. Pages CMS is open source, but the official docs reviewed do not guarantee hosted-service pricing or IP3's account terms. Confirm the hosted terms and app permissions before inviting editors. Do not self-host just to avoid a subscription unless free hosting and database capacity are confirmed; self-hosting transfers authentication, patching, backups, and security operations to IP3.

CloudCannon was excluded because its plans are paid and did not meet IP3's stated budget. No CloudCannon configuration or visual-editing markers remain in the implementation branch. No external CMS account has been connected.

The repository's JSON remains the source of truth and its Node build produces the public pages. The existing Pages CMS schema describes 48 editorial sections. This branch now groups them under plain-language sidebar headings, makes template keys read-only, validates slugs, prevents whole-file creation/rename/deletion from the editor, preserves unmanaged JSON properties during saves, and gives editors clearer field help and commit labels. Continue with the established workflow: **Pages CMS edits the non-production `content` branch → validation and content PR workflow → human review/merge to `main` → Vercel production deployment.**

“Real time” here means a fast draft save followed by automatic validation and a Vercel Preview when the review PR is ready. Production updates only after approval, merge and a successful deployment. Pages CMS is a Git editing layer; this architecture does not update the public static website while an editor types or immediately on save. A database-backed live-content system would require a separate migration and operating-cost review.

The Pages CMS hosted interface has not been connected to this repository. The local changes finalize its configuration and usability plan, but cannot prove live sign-in, branch selection, permission boundaries, uploads or preview access. Those account-level checks are listed in [CMS-REQUIREMENTS-MATRIX.md](CMS-REQUIREMENTS-MATRIX.md).

The chosen production architecture is: **Pages CMS editor → non-production `content` branch → validation and content PR workflow → human review/merge to `main` → Vercel production deployment.** The repository's existing GitHub workflow already opens/updates a PR when `content` changes. Editors must not receive direct production write or merge permissions.

## Audit scope and repository source of truth

The checkout was fetched from GitHub and verified at the `main` SHA above before changes. The workspace's pre-existing checkout was left untouched. The Pages CMS changes are isolated on the local implementation branch; nothing has been pushed, merged, or deployed.

The supplied architecture prompt is broadly aligned with the latest repository, but it is not a precise inventory. Current `main` already contains a `/capabilities` page, eight long-form sector pages, a dedicated page-text layer, media/proof content, a generated Pages CMS schema, CMS/content checks, internal-link tests, a Vercel build stamp, and GitHub workflows that were not fully described by the prompt. This audit follows the fetched repository rather than treating the supplied prompt or phone screenshots as evidence of implementation. The screenshots are planning mockups only.

## Current architecture

| Layer | Current implementation | CMS implication |
|---|---|---|
| Public site | Custom CommonJS/Node static renderer; no React, Astro, Next, or application server. Node engine is 24.x. | Keep the existing build and deployment; CMS remains an editing layer. |
| Content store | 55 JSON files under `content/`; `cms/schema.js` describes 48 editor sections/files, including one collection. | JSON paths and structures already exist. Map those fields instead of inventing CMS entities. |
| Content loading | `src/data.js` reads content and filters hidden items; `src/content.js` provides the content reader/audit. | Preserve hidden/order semantics and existing references. |
| Rendering | `src/layout.js`, `src/pages-home.js`, `src/pages-inner.js`, `src/pages-why.js`, `src/cap/`, and `src/sec/` render HTML. | Visual binding requires attributes in rendered templates; Data Editor alone does not make in-page regions clickable. |
| Validation | `build/validate.js` checks known keys, required values/types, media paths/types/sizes, cross-references, internal routes, page metadata, and content-specific constraints. | Keep it in the editor preview build and the GitHub gate. Unknown JSON keys currently fail validation. |
| CMS configuration | `cms/schema.js` is the maintained Pages CMS schema; `build/cms.js` generates `.pages.yml`, and `npm run check` detects drift. | Pages CMS already has a field-by-field UI definition. Keep schema ownership clear if adding a second CMS configuration. |
| Media | 44 files in `assets/img/` and 13 in `assets/video/`; the Pages CMS config targets those directories. Validator limits images to 2 MiB and video to 25 MiB, with a tighter WebM warning rule. | Keep repository-hosted media and existing validation. Verify upload-size rejection in the hosted editor before staff onboarding. |
| Build output | `npm run build` validates first and writes a 21-file HTML site plus sitemap, robots, manifest and `build.json` into ignored `dist/`. There are 20 public URLs plus the 404 document. | GitHub Actions and Vercel continue to run the existing build. |
| Production | Vercel uses the Other framework preset, Node/npm build, and `dist/` output. Production is expected to deploy from `main`. | Vercel Preview supplies the review preview; production remains tied to `main`. |
| Editorial workflow | Existing design is `content` branch → Content check → trusted PR → Vercel preview → authorized reviewer merge → production. A main-to-content sync dispatches a fresh check. | Let the CMS write to `content`; use GitHub's review and protected `main` as the production approval boundary. |
| Secrets and services | Contact email credentials and Turnstile settings are environment variables; the site has no content database. Admin setup lists release gates and owner actions. | Never place runtime credentials in CMS content. |

### Actual routes and content groups

The public route set is `/`, `/about`, `/why-ip3`, `/approach`, `/capabilities`, `/sectors`, eight `/sectors/{slug}` pages, `/engagements`, `/insights`, `/people`, `/contact`, `/privacy`, and `/terms`. The renderer also emits `/404.html`.

The content schema currently covers global site/navigation/page metadata; page-text headings and copy; home hero, mandates, statistics, partner lists, testimonials and FAQs; About narrative; Why IP3 and Approach modules; Capabilities cards and their nested deliverables/groups; sector index items and eight sector narratives; proof/engagement/field-media relationships; Insights, field stories and publications; People groups and founder profile; and privacy/terms. `content/pages.json` holds page titles/descriptions. `content/legal.json` holds privacy and terms. `content/navigation.json` holds the primary/footer navigation and pathway labels.

### Existing controls and review notes

* `build/validate.js` rejects unknown fields against `cms/schema.js`; it currently enforces strict schema coverage, so adding a field requires a coordinated schema/validation change.
* Missing media, bad extensions, broken route/anchor/reference links, duplicate slugs/keys, invalid content, and excessive files stop builds. `build/check-links.js` inspects generated `href`, `src`, `srcset`, posters, anchors, metadata, alt text, and sitemap URLs.
* `.github/workflows/check.yml` runs `npm ci`, tests, content/CMS checks, build and link verification for PRs and the `main`/`content` branches. `.github/workflows/content-pr.yml` synchronizes `main` to `content` and creates/updates the content PR after a passing check.
* `docs/ADMIN-SETUP.md` says owner tasks remain for Vercel commercial-use eligibility, contact delivery/legal review, Actions PR permissions, branch protection, Pages CMS account/branch setup, preview access, notifications, monitoring, and Search Console. `docs/UAT.md` has an uncompleted live CMS/Vercel acceptance checklist. A local passing build does not complete those owner tasks.
* Current baseline has five non-blocking SEO length warnings in `content/pages.json`: home title and descriptions for home, About, sectors, and engagements. The CMS usability work does not rewrite copy.

## Pages CMS usability implementation

The current implementation changes only CMS configuration and documentation:

- The generator organizes all 48 schema entries into ten familiar sidebar areas without changing the files or data model.
- Whole-file create, rename and delete operations are disabled in the CMS. List items remain editable according to their existing form controls.
- Saves merge configured fields into the existing JSON so an editor save does not drop unrelated keys. The site validator still rejects unknown keys and invalid relationships.
- Template keys are read-only; slug fields receive a lowercase/hyphen check. Field hints, list summaries, editor-attributed commits and consistent commit labels improve orientation and auditability.
- The guide explains where to make common changes and how a save moves through draft, validation, preview, approval and production.

### Local verification performed

| Check | Result |
|---|---|
| `npm run cms` | Pass; regenerated `.pages.yml` from the schema, including sidebar groups and safe operations. |
| `npm run check` | Pass; 48 schema entries and `.pages.yml` current. Five existing SEO-length warnings remain. |
| Pages CMS hosted login / GitHub App | Not run; no account was connected or changed. |
| Live editor, branch, collaborator, media and Vercel preview behavior | Not run; listed for owner-led UAT. |

This checks the generated configuration against the repository's schema and validators; it does not claim that the hosted UI has been tested.

## CMS options and recommendation

### A. CloudCannon — exclude under current budget

**Fit:** Strong visual-editing capability for the current renderer and JSON model, based on vendor documentation. A live integration was not tested and is not recommended under the current budget.

**Workflow:** CloudCannon Standard currently lists Git sync, visual editing and three users. It does not list branching workflows/custom roles; Team lists advanced branching workflows and custom permissions. Standard can still be assessed with a repository restricted to `content`: the existing GitHub Actions workflow opens the PR, and GitHub owns the approval/merge. Confirm branch-specific authorization and how the CMS writes/attributes commits in the actual account. CloudCannon Team's own UI PR/merge capability is not a reason to bypass GitHub branch protections.

**Cost decision:** Paid plans make it incompatible with the current budget. Current list pricing is recorded at [CloudCannon pricing](https://cloudcannon.com/pricing/); re-evaluate only if IP3 later approves a CMS budget.

**Limitations/risks:** Visual binding needs template-level work and a live proof on these custom string-rendered pages. The site depends on its own validators to enforce schema, media size/type, references and links. CloudCannon behavior for preserving unknown properties, limiting deletion, preventing concurrent overwrites, and restricting publication must be demonstrated. Standard's advertised default permissions may not match IP3's editor/reviewer roles. CloudCannon builds a static preview; it does not make Vercel's production page update on every keystroke.

**Effort:** A small technical proof would be straightforward, while a full rollout would require substantial template and workflow work. Both are deferred while the no-spend constraint applies.

### B. Pages CMS — preserve existing editor and workflow

**Fit:** Lowest change/risk. The repo already has 48 editor sections, labels, nested fields, media paths and validation. The configuration in this branch adds plain-language sidebar groups, clearer forms, read-only template keys, slug format checks, safer content operations, merge-on-save, and editor-attributed commits. Pages CMS edits the existing Git files directly and leaves the generator/deployment workflow in place. Its current configuration docs support sidebar groups, nested fields, list summaries, operation controls and merge-on-save.

**Limitations and cost:** It is structured-form editing, not clickable live-page editing. The hosted app's cost and IP3 account terms must be confirmed. Live branch selection, draft-to-preview turnaround, collaborator permissions, upload size enforcement and conflict behavior still need UAT. The GitHub App's exact requested permissions need owner review before install. The software is open source and the official quick start documents a hosted app, but the docs reviewed do not guarantee that hosted access is free. Self-hosting is an option only if free hosting and database capacity are available; it also makes IP3 responsible for authentication, security updates, monitoring and backups. Sources: [Pages CMS introduction](https://pagescms.org/docs/), [quick start](https://pagescms.org/docs/quick-start/), [sidebar groups and content config](https://pagescms.org/docs/configuration/content/), [settings and merge-on-save](https://pagescms.org/docs/configuration/settings/), [collaborators](https://pagescms.org/docs/configuration/collaborators/), [self-hosting guide](https://pagescms.org/docs/guides/installing/self-host/).

**Effort:** Lowest. It is already configured, so this is the first option to validate under the no-subscription requirement. See [EDITOR-GUIDE.md](EDITOR-GUIDE.md) and [CMS-REQUIREMENTS-MATRIX.md](CMS-REQUIREMENTS-MATRIX.md) for staff instructions and account-level acceptance tests.

### C. Decap CMS — free open-source alternative, with integration work

**Fit:** Decap CMS is an open-source Git-based editor with structured forms, media management, editor previews, and editorial workflows that save draft changes for review through pull requests. It can work with static sites and GitHub.

**Cost and limitations:** The CMS itself is open source. GitHub authentication still needs a supported OAuth/authentication endpoint, and the current repository's 48-section Pages CMS schema would need a separate Decap configuration and content-model review. A free hosting/auth setup may be possible, but it is not already configured or proven for this repository. Review official [editorial workflow](https://decapcms.org/docs/editorial-workflows/), [GitHub backend](https://decapcms.org/docs/github-backend/), and [backend overview](https://decapcms.org/docs/backends-overview/) docs before choosing it.

**Effort:** Medium. Consider only if Pages CMS hosted access has a fee or cannot meet the staff workflow, and only after confirming a no-cost authentication/hosting arrangement.

### D. Sanity Studio — free tier, but a larger migration

**Fit:** Rich structured editor, live preview/visual editing, collaboration and a hosted content API. This would best fit a requirement for published data to change independently of a Vercel static rebuild.

**Cost and limitations:** Sanity's current Free plan is $0 within its quotas, but its included datasets are public; private datasets and expanded roles require a paid plan. It also introduces new schemas, content migration, API/runtime integration or webhook-driven builds, preview/draft mode, backup/export, and a revised approval model. Sources: [Sanity pricing](https://www.sanity.io/pricing/), [Visual Editing](https://www.sanity.io/docs/visual-editing), [Live Content API](https://www.sanity.io/docs/content-lake/live-content-api).

**Recommendation:** Do not migrate to Sanity merely to avoid a CMS subscription. Revisit only if IP3 accepts its public-dataset terms and migration/operating work, or if live database-backed delivery becomes a requirement.

## Go/no-go gate

**Current no-cost go/no-go:** The configuration and editor usability improvements are ready for owner review on this local branch. Go to account-level UAT only after confirming hosted Pages CMS access has no fee for IP3 and reviewing the GitHub App's exact permissions. Invite editors with the least-privilege access option the hosted CMS supports; keep production approval on protected `main`. If hosted access is paid or unavailable, pause editor onboarding and test Decap CMS only after confirming a zero-cost auth/hosting design. Sanity Free remains a migration option only if its public dataset and quotas are acceptable. CloudCannon is no-go under the current budget.

Pages CMS hosted access and editor onboarding are not complete. No production source has been changed, deployed, or merged. The Pages CMS configuration, editor guidance and audit are isolated on the local `cms-pages-usability` branch.

## Reference documents

Repository sources: `README.md`, `docs/ADMIN-SETUP.md`, `docs/UAT.md`, `cms/schema.js`, `build/cms.js`, `build/validate.js`, `build/build-all.js`, `src/data.js`, `src/content.js`, `src/layout.js`, `src/pages-home.js`, `src/pages-inner.js`, `src/pages-why.js`, `src/cap/`, `src/sec/`, `.pages.yml`, `.github/workflows/check.yml`, `.github/workflows/content-pr.yml`, and `vercel.json`.

Official CloudCannon references: [configuration file](https://cloudcannon.com/documentation/developer-reference/configuration-file/), [initial site settings](https://cloudcannon.com/documentation/developer-reference/initial-site-settings-file/), [Editable Regions](https://cloudcannon.com/documentation/developer-reference/editable-regions/), [visual editing overview](https://cloudcannon.com/documentation/developer-guides/set-up-visual-editing/an-overview-of-editable-regions/), [deprecated editable class warning](https://cloudcannon.com/documentation/developer-articles/define-editable-regions-in-your-html/).
