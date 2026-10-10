# Handoff — CMS admin panel (2026-10-10)

- Dir: `D:\CONTENT IP3 WEBSITE\NEW WEBSITE DESIGN\ip3-bd.org` · branch `cms-admin` (from `main`) · not pushed
- Goal: keep the old Pages CMS / Git-based admin design, fix the limitations found in the adnanv1 version.

## Limitations found → fix
| Old system | Now |
| --- | --- |
| md→JSON build scripts missing; client-side `fetch` of `data/*.json` | `content/*.json` written by the CMS, read at build time → pre-rendered HTML |
| No validation; a bad edit could ship | `build/validate.js` runs first in `npm run build`; failure keeps previous deploy |
| `.pages.yml` hand-written, drifted from the site (~fields that rendered nothing) | `cms/schema.js` generates `.pages.yml`; `npm run audit` lists unread fields (last run: none) |
| Items ordered by numeric `order` fields | List fields (drag to reorder); `hidden` switch per item |
| Fabricated placeholder content, Rickroll hero, `approch` typo | real client content only; `/approach` |
| Page titles/SEO/headlines hard-coded | `content/pages.json`; contact details in `content/site.json` |
| Media: wrong folders, no limits | `images`/`videos` media sources; size/extension limits enforced at build |
| No visible failure signal | `.github/workflows/check.yml` → red ✗ on the commit |

## Files
New: `content/**`, `cms/schema.js`, `build/validate.js`, `build/cms.js`, `src/content.js`, `.pages.yml`, `.github/workflows/check.yml`
Changed: `src/data.js` (now a loader), `src/config.js`, `src/layout.js` (`rich`), `src/pages-inner.js`, `src/pages-home.js`, `build/build-all.js`, `package.json`, `README.md`
Removed: `src/data/approach/*.json` (→ `content/approach/*`; unused s1/s2 dropped)

## Verified
- Regenerated HTML byte-identical to pre-migration output (git shows no `.html` changes) · 20 pages build
- `npm run check` passes; `.pages.yml` parses as YAML (PyYAML) and is in sync
- 15 negative tests (missing image, bad link/anchor, script tag, unclosed em, empty required, bad email, unknown key, broken ref, all slides hidden, wrong type, duplicate slug, broken JSON, oversized image, build aborts with HTML untouched) all fail correctly
- Simulated editor edits (headline, SEO title, hidden testimonial/slide, phone) appear in built HTML, then restored

## Not verified / risks
- Real Pages CMS login, form rendering and commit flow (needs GitHub auth; field syntax taken from pagescms.org docs, `required`/`list.collapsible` not individually confirmed)
- Vercel actually running `npm run build` on a CMS commit (check the Build Command in the Vercel dashboard is not overridden)
- Committed root `*.html` goes stale after a CMS edit until the next local build; Vercel rebuilds so the live site is right
- Contact form is still mailto-only (no enquiry inbox)
- 6 SEO description/title length warnings from client copy

## Next
1. `git push -u origin cms-admin` → Vercel preview URL → try an edit in Pages CMS against that branch
2. Merge to `main` when happy; give editors Write access
3. Optional: sharp-based image optimisation on upload; move Privacy/Terms and in-page headings into the CMS
