# IP3 Pages CMS requirements and onboarding checklist

**Repository source revision:** `main` at `5ca90c53c4c62f409b1aaa2332496b4ccfa835a8` (13 October 2026).  
**Configuration status:** the grouped, safer Pages CMS configuration is implemented in this local branch; the Pages CMS account, editor access, and live workflow still need owner setup and acceptance testing.

## Budget and publishing decision

Use the existing Pages CMS configuration if the hosted service confirms no charge for IP3. The CMS configuration and content remain in the GitHub repository; no content database or paid vendor plan is introduced by this design. Hosted-service pricing and IP3's account terms still need confirmation. If hosted access is not free, stop before onboarding editors and assess a free hosting/authentication plan before choosing another CMS.

The public website is a static build. Editors save drafts to the `content` branch, automated checks run, GitHub opens a review pull request, and Vercel builds a private/preview deployment. After reviewer approval and merge to `main`, Vercel builds and publishes production. The editor save is fast, but the public site does not change while typing or on save; publication follows the reviewed deployment.

## Editor navigation and field map

The sidebar groups the existing 48 configured content sections by the words staff use to describe their work. The content files and data model are unchanged.

| Sidebar section | Content editors will find there |
|---|---|
| Start here · page titles & copy | Search result metadata and shared headings, descriptions and labels for each page. |
| Home page | Hero slides, homepage cards, statistics, testimonials and partner names. |
| Contact page | Contact page copy and FAQs. |
| Capabilities & proof of work | Capabilities, assignment examples, and related photos/videos. |
| Sectors | Sector order, sector cards and the long-form sector pages. |
| Engagements & insights | Engagement summaries, articles, field stories and publications. |
| People | Team groups, profile details and founder bio. |
| About IP3 & approach | About, Why IP3 and methodology content. |
| Website settings | Contact information, navigation and footer content. |
| Privacy & terms | Privacy and terms content; legal review remains required. |

All schema-defined text remains structured. Page-text template keys are read-only; URL slugs receive a lowercase/hyphen format check. Repeated cards and other nested items use human-readable collapsed summaries. The CMS is configured to merge submitted fields into existing JSON so unmodeled properties are preserved; the site's content validator remains the gate and rejects unsupported keys or malformed content.

## Current field map

| Area | Existing source | Existing content and safeguards |
|---|---|---|
| Page copy and SEO | `content/pages.json`, `content/page-text/*.json` | Page title, search description, page headlines, section headings, leads and CTA labels. Length guidance is shown; validator warns on soft limits. |
| Home | `content/home/*.json` | Hero slides/video/posters, cards, statistics, testimonials, partners and FAQs. Existing hidden fields preserve records where available. |
| Capabilities and proof | `content/capabilities.json`, `content/capability-proof/*.json`, `content/proof.json`, `content/field-media.json` | Nested service groups, deliverables, related engagements and proof media. Reference and media validation is retained. |
| Sectors | `content/sectors.json`, `content/sector-pages/*.json` | Sector order and narrative details, media and cross-references. Fixed renderer constraints remain validated. |
| Engagements and insights | `content/engagements.json`, `content/insights.json` | Engagements, articles, field stories and publications, with categories, dates, images, authors and links. |
| People | `content/people.json`, `content/founder.json` | Profile groups, roles, biographies, portraits and credited-person references. |
| About and approach | `content/about.json`, `content/why.json`, `content/approach/*.json` | Organizational narrative, fixed 3D story scenes, evidence, outcomes, methodology and toolkit. |
| Site-wide settings | `content/site.json`, `content/navigation.json` | Contact details, links, footer and navigation. Internal routes and required visible navigation are validated. |
| Legal | `content/legal.json` | Privacy and terms content; changes must be reviewed by the owner/counsel. |
| Media | `assets/img/`, `assets/video/` | Repository-hosted JPEG, PNG, WebP, MP4 and WebM. Existing validator enforces image/video size rules. Pages CMS upload byte limits still need a live check. |

## Safety and usability controls in this configuration

- Sidebar grouping puts related forms together without changing content storage.
- Descriptive field names and helper text explain what editors may change and how text appears.
- Whole-file create, rename and delete operations are disabled. Editors update the existing records and use hide controls where present.
- CMS saves merge into the current JSON so unrelated keys are not discarded by a partial form save.
- Slug fields receive a format check; fixed page-template keys are read-only.
- CMS commits use the editor identity when available and clear `IP3 content` commit labels.
- Existing content validation, build, internal-link checks, pull request review and production branch protections remain the release controls.

These are configuration-level safeguards. They do not prove the hosted CMS interface, account permission boundaries, file-size rejection or branch selection works as intended; complete the checks below before inviting staff.

## Owner setup and acceptance checklist

Perform account-level checks on the repository owner account before general staff onboarding. Do not enable writes to `main`.

| # | Check | Pass evidence | Status |
|---:|---|---|---|
| 1 | Confirm hosted Pages CMS access has no subscription or per-editor fee for IP3. Review the exact GitHub App permissions and install scope. | Owner records the current terms, repository-scoped install, and permission decision. | Pending owner |
| 2 | Create/confirm `content` from current `main`; open Pages CMS on the repository and select `content`. | The expected 48 content forms and media sources load from the draft branch. | Pending owner |
| 3 | Invite one named editor using the least-privilege Pages CMS collaborator/access path available; verify who can edit content, configuration and collaborators. | Editor can edit approved content; cannot alter CMS configuration, collaborator access or production branch protections. | Pending owner |
| 4 | Edit a harmless homepage headline and save. | CMS writes to `content`; commit attribution and label are clear; production SHA does not change. | Pending owner |
| 5 | Wait for Content check and open the generated PR. | Valid content gets a green check; the PR is opened/updated automatically and links changed files. | Pending owner |
| 6 | Inspect Vercel Preview on desktop and mobile for the changed page. | Preview shows the draft content and current layout; `main`/production remains unchanged. | Pending owner |
| 7 | Edit a nested Capabilities field, reorder a supported list, hide an item, then restore it. | Saved data and preview reflect edits; hidden content can be restored; no unintended record deletion. | Pending owner |
| 8 | Replace one portrait and upload a supported image; try an unsupported image/file and an image over 2 MiB. | Valid asset reference resolves; invalid/oversized media is blocked by CMS or fails the check before review. | Pending owner |
| 9 | Change one SEO description and inspect the page preview metadata. | Correct route metadata updates and validator length warning is understandable. | Pending owner |
| 10 | Save invalid content and test two editors saving overlapping content. | Invalid change cannot merge; conflict behavior is visible and no silent lost update occurs. | Pending owner |
| 11 | After owner review, merge one valid change using **Create a merge commit**. | Production deploy completes from `main`; `/build.json` matches the deployed Git SHA; `content` syncs. | Pending owner |
| 12 | Restore a previous valid text value through Git history and the normal review path. | Revert is reviewable, checks pass and Vercel redeploys the restored content. | Pending owner |

The site owner records tester, date, links and outcomes in [UAT.md](UAT.md). Until account setup and these acceptance checks pass, this is a finalized architecture/configuration proposal, not a demonstrated live editor service.
