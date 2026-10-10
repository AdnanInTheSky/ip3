# IP3 Consulting — website

Static website for **IP3 Consulting Limited (Institute for Public Policy & Practice)**.
Plain HTML generated from a small Node build script, with GSAP + Lenis scroll motion. No framework, no runtime dependencies.

## Run locally

```bash
npm run dev      # builds, then serves http://localhost:3000
npm run build    # regenerates every .html file, sitemap.xml, robots.txt
```

## Where things live

| Path | What |
| --- | --- |
| `content/**/*.json` | **All editable content** — hero slides, page headlines & SEO titles, capabilities, sectors, engagements, people, FAQ, Approach page, contact details. Written by the admin panel. |
| `cms/schema.js` | The editor forms **and** the validation rules for `content/` (one definition, two uses) |
| `.pages.yml` | Pages CMS config — **generated** from `cms/schema.js` by `npm run cms`; don't edit by hand |
| `src/data.js`, `src/content.js` | Loads `content/` for the templates (hidden items filtered out) |
| `src/config.js` | Brand name, navigation, `SITE_URL` (contact details come from `content/site.json`) |
| `build/validate.js` | Checks `content/` before every build; a failed check stops the build |
| `src/layout.js` | Header, footer, contact form, shared page shell + SEO tags |
| `src/pages-home.js`, `src/pages-inner.js` | Page templates |
| `src/css/site.css` | Design system (Fraunces / Montserrat / Lato, rust · cream · charcoal, green accent from the logo) |
| `src/js/site.js` | Motion: hero slider, word reveals, pinned horizontal sectors, sticky steps, parallax, counters |
| `assets/` | Optimised video (`video/`), photos (`img/`), logo set (`logo/`), vendored GSAP/Lenis (`vendor/`) |
| `*.html`, `sectors/*.html` | **Generated** — edit `src/`, then `npm run build` and commit the output |

The generated HTML is committed so Vercel can serve it directly; `vercel.json` also runs `npm run build`.

## Admin panel — editing the content

The admin is **Pages CMS** (https://app.pagescms.org), a Git-based editor: it has no server or database of its own.
Editors sign in with GitHub, pick this repository and fill in forms; every save is a commit to `content/*.json`,
Vercel rebuilds, and the live site updates in about a minute.

```
Editor ──► Pages CMS (GitHub login) ──► commit content/*.json ──► GitHub check + Vercel build ──► live site
                                                   │                          │
                                                   └─ invalid? ✗ red check ◄──┘  build stops, previous version stays live
```

**One-time setup:** (1) give each editor *Write* access to the GitHub repo; (2) they open app.pagescms.org, sign in
with GitHub and choose `mdsyfulhoque-afk/ip3-bd.org`; (3) in Vercel, keep the project's Build Command empty so
`vercel.json` (`npm run build`) is used.

**What editors can change:** every section is a numbered form in the sidebar (`01 · Home — Hero slider` … `25 · Approach`).
Lists (slides, engagements, FAQ…) can be reordered by dragging and have a **Hide this item** switch, so something can
come off the site without being deleted. Photos and videos are uploaded from the same screen (WebP photos ≤ 500 KB,
MP4 videos ≤ 8 MB are the targets; the build refuses files over 2 MB / 25 MB).

**Safe publishing:** `npm run build` first runs `build/validate.js`. It rejects missing images, broken links and slugs,
empty required fields, stray HTML (only `<em>` is allowed), unknown fields and oversized media — with the file and field
named. A rejected edit shows as a red ✗ on the commit in GitHub (and a failed Vercel deployment) and the previous
version stays live. To review before publishing, editors can save to a branch (Pages CMS has a branch selector);
Vercel gives every branch its own preview URL, and merging the branch publishes it.

**Changing what is editable (developers):**

| Task | Do |
| --- | --- |
| Add / rename a field or section | edit `cms/schema.js`, run `npm run cms` (rewrites `.pages.yml`), commit both |
| Check content & `.pages.yml` | `npm run check` (CI runs this on every commit) |
| Find fields that do nothing | `npm run audit` — lists content no page reads |
| Run only the content check | `npm run validate` |

Still in the templates, not in the CMS: section headings inside pages (e.g. the About and Approach sub-headings),
the Privacy/Terms text, and the navigation.

## Deploy (Vercel)

Framework preset **Other**, output directory `.`, build command `npm run build` (already set in `vercel.json`).
Set the environment variable `SITE_URL` to the production origin (e.g. `https://ip3-bd.org`) so canonical URLs,
the sitemap and social tags are correct. `vercel.json` also redirects the old WordPress URLs to their new pages.

## Contact form

The form validates in the browser and opens the visitor's email app addressed to `info@ip3-bd.org` with the message
pre-filled (no server needed). To post to a form service instead, change the submit handler in `src/js/site.js`.

## Content to verify before launch

Everything on the site comes from IP3's own documents. These items should be confirmed by IP3:

- Approach page "Case Study Example" paragraphs (Ghana, Malawi, LDC graduation) — copied from the approach document.
- Engagement summaries — taken from the "Recent Engagements & Impact Projects" list; no outcome figures are published.
- Counts: 17+ years, 75+ projects, 30+ partners (founder profile) — the older copy deck said "verify counts".
- Client names in "Clients & partners" and the two testimonials (Omar Faruk, PwC · Ahmmad Zaman Tariq, BMDF).
- Privacy Policy and Terms are plain-language drafts and need legal review.
- Search-result descriptions on Home, About, Capabilities, Sectors and Engagements are longer than Google shows (the build lists them as warnings) — shorten them in *00 · Page titles, descriptions & headlines*.
