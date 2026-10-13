# Sections and safe placement pilot

## Current section map

| Content or section | Source identity | Reuse and placement status |
|---|---|---|
| Testimonials | `content/home/testimonials.json` → `items` | Already shared by Home and Engagements. One common card renderer now serves both. Home alone has the new placement control. |
| FAQs | `content/home/faq.json` → `items` | Candidate for a later pilot. Contact currently owns the FAQ section and its FAQPage search metadata; relocating it requires updating that metadata too. |
| Text blocks | `content/about.json`, `content/page-text/*.json` | Candidates after defining a stable block identity and supported destination. Their current copy and heading records remain attached to their pages. |
| Card sections | About lifecycle, pillars and differentiators; Home mandates and convening | Whole sections can be ordered where already supported. Transfer requires an explicit template and destination allowlist, including the intended card counts and heading references. |
| Hero and closing CTA | Existing page templates | Fixed page boundaries. They are outside editable middle-section lists. |
| Why IP3 journey | `src/pages-why.js`, `content/why.json` | Fixed scenes and camera sequence. No reusable-section placement control. |
| Approach, Capabilities and sector journeys | `src/pages-inner.js`, `src/cap/`, `src/sec/` | Fixed linked sequences and interactive templates. No reusable-section placement control. |

## Testimonials pilot

The CMS form is **Page layout · section order → Testimonials pilot → Home — Testimonials location**. Its three choices are:

- **With clients and funders (default)**: keeps the existing combined proof section and its original HTML.
- **After selected engagements**: moves the existing testimonial cards into a standalone Home section immediately after Engagements.
- **Before founder profile**: moves them into a standalone Home section immediately before Founder.

Positions follow the named anchor even when the Home section order changes. Hero and closing CTA remain page boundaries. Each choice renders the testimonials once on Home. Engagements continues using the same records in its existing position. This pilot does not enable arbitrary transfers between pages.

The record source, hiding controls, names, roles and quotations stay in the original file. Placement stores only one selector in `content/section-placement.json`; it creates no copies of testimonial records. `src/sections/testimonials.js` renders those shared records.

## Safeguards and verification

The CMS offers only the three approved locations. Build validation and the Home renderer reject unsupported values, invalid section lists, missing content, and a standalone placement with no visible testimonials. The single selector and renderer ensure one instance per page. Existing content, link, image and media checks remain authoritative.

Regression tests exercise both moves under the normal and reversed Home section order, check that the cards appear once, reject unsupported placements and hidden/missing content, and confirm that Home placement does not change Engagements. Before publishing, review the preview at desktop and mobile widths and record the CMS sign-in/save experience in `docs/UAT.md`.

Restore the default location through the same draft review workflow to undo a placement. Git also retains the placement value and source records in each content commit; use a reviewed revert to restore a prior version.
