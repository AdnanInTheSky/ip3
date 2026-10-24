# About CMS and deployment consistency audit — 25 October 2026

## Cause and owner decision

The About renderer removed its lifecycle and three-area sections in commit `c5bbaae`. The About CMS fields and `about-lifecycle` / `about-pillars` heading controls remained. The owner chose to remove unused About controls and archive their text rather than restore those website sections.

The lifecycle cards are still rendered on `/capabilities`. They must remain editable there. Their active data moves from `content/about.json:lifecycle` to `content/capabilities.json:lifecycle`, and the CMS control moves to **Capabilities, assignments & proof → Capabilities → Lifecycle steps — Capabilities page**.

The original two arrays and headings are preserved in `docs/content-archive/about-sections-2026-10-25.json`, with source commit `bed71d21bde00131225c9754eeaf2d45981f073a`. The archive is outside the CMS and generated website.

## Deployed baseline verified before this cleanup

| Surface | Observed revision | Result |
|---|---|---|
| `main` and production `/build.json` | `e5999f39eda0d24856f378811ec4fdbfe3336da5` | Commit and Vercel Git commit both match; validated 33-page build |
| `content` and authenticated preview `/build.json` | `bed71d21bde00131225c9754eeaf2d45981f073a` | Commit and Vercel Git commit both match; validated build |
| Main and content Git trees | `a9d108a6fa84bdbc3a40f560f15516f139063128` | Identical tracked file trees despite different merge commit IDs |
| Production and preview content hash | `90dffe3f64dacdce4fb715295ad9bad98dd83fc6578906679f70a9e74368747e` | Identical |
| Production and preview source hash | `e402653d1a11e4805ccaa5b2d88674eaeea9c0040ed2c908f6c45ad8ac3f319e` | Identical |
| About headings | Six displayed H2 headings on both deployments | Same headings; no retired lifecycle / three-area sections |
| Production deployment | GitHub deployment `7304407090` | Success, Production environment |
| Synced content preview | GitHub deployment `7304410889` | Success, Preview environment |
| Main-to-content synchronization | Content publishing run `40132166261` | Success after PR #39 merged |

The preview requires Vercel authorization. It was read with the existing authenticated Vercel CLI; Deployment Protection was retained.

## Public rendering preservation

The page renderer output was hashed in separate Node processes before and after the data migration. Both matched exactly:

- About HTML SHA-256: `f83f1d507ee17aeba43932075a1179f529dbb8074567d98e28ffdbefcb4e3002`
- Capabilities HTML SHA-256: `77dafb59b7cdce984ca17cb30aefdbe7757ff170d7da88e4c5f917e8dd820c31`

## Cleanup verification

- 127 main tests passed, including a check that every remaining About form field is rendered and a controlled lifecycle edit reaches Capabilities without appearing on About.
- 36 Hostinger preparation regressions passed.
- CMS validation and generated `.pages.yml` consistency passed for 52 forms; the 7 pre-existing content warnings remain.
- The build and link checker verified 33 pages and 32 sitemap URLs.
- Both archived arrays and their headings were compared directly with the original Git source and matched exactly.
- Current lifecycle text is editable; the regression does not require future CMS edits to equal the archived historical copy.

## Meaning of consistency

CMS fields must edit their actual published page components. Preview must match the current `content` revision; production must match the deployed `main` revision. Unmerged CMS drafts may intentionally differ from production until a reviewer approves and merges them. An automatic main-to-content sync can have a different commit ID while retaining the same file tree and content hash.

This cleanup is a new draft after the baseline above. Its updated CMS configuration becomes available on `content` after push; main receives it through the review PR. Select `content` and reload Pages CMS to load that branch's latest forms.

Named-editor Pages CMS login/save permissions are outside this repository test; this audit verifies the generated CMS configuration, website renderers and actual deployed production/preview responses.
