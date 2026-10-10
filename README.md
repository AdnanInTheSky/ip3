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
| `src/data.js` | **All page content** — hero slides, capabilities, sectors, engagements, people, FAQ |
| `src/data/approach/*.json` | Copy for the Approach page |
| `src/config.js` | Name, address, phone, email, navigation, `SITE_URL` |
| `src/layout.js` | Header, footer, contact form, shared page shell + SEO tags |
| `src/pages-home.js`, `src/pages-inner.js` | Page templates |
| `src/css/site.css` | Design system (Fraunces / Montserrat / Lato, rust · cream · charcoal, green accent from the logo) |
| `src/js/site.js` | Motion: hero slider, word reveals, pinned horizontal sectors, sticky steps, parallax, counters |
| `assets/` | Optimised video (`video/`), photos (`img/`), logo set (`logo/`), vendored GSAP/Lenis (`vendor/`) |
| `*.html`, `sectors/*.html` | **Generated** — edit `src/`, then `npm run build` and commit the output |

The generated HTML is committed so Vercel can serve it directly; `vercel.json` also runs `npm run build`.

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
