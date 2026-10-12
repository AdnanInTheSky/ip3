# Sector pages — motion architecture

## One page system, eight signature scenes

Every sector page follows the same chapter order, so the eight read as one family. Only the signature scene changes, and each one draws the sector's own argument.

| # | Chapter | What moves | Why |
| --- | --- | --- | --- |
| 1 | Aperture hero | The header film opens from a narrow window to full bleed. Then, as the reader scrolls, the frame closes in and recedes, the giant sector number sinks and the headline lifts away. | A window into the sector, then the camera pulls back to the whole picture. |
| 2 | Statement | One large sentence lights up word by word as it crosses the viewport. | Slows the reader down for the sector's thesis. |
| 3 | Signature scene | A sticky drawing beside five text steps. Scroll position becomes a continuous step value that drives the drawing. A rail jumps between steps. | The sector's method, as a picture that changes with the argument. |
| 4 | Practice index | Large expanding rows. The headline slides on hover and the body eases open. | Dense service lists stay scannable. |
| 5 | Field gallery | Photos and films hang at different depths and sides; the camera flies forward through them. | Real rooms and real places, felt as space rather than as a grid. |
| 6 | On the record | Assignment cards slide sideways in a pinned stage and turn towards the centre in 3D. Each card opens the full record on /capabilities. | The evidence reads as a ledger. |
| 7 | Expertise | Focus areas and the capabilities applied (existing copy), with pointer-tilt cards. | Routes the reader to /capabilities. |
| 8 | Next-sector portal | The next sector's photo opens from a small window to a wide frame. | A continuous journey through all eight sectors. |

### The eight scenes

| Sector | Scene | The five steps drive… |
| --- | --- | --- |
| 01 Climate, Energy & Resilience | **Terrain** (CSS 3D): nine contour slices of a landscape with shadowed terrace walls, a water plane and a slowly orbiting camera | Risk: water rises and low ground floods rust → Plan: a planning grid settles over the land → Build: infrastructure extrudes from the terraces and the water recedes → Finance: flows run in from the edge → Govern: a canopy spreads |
| 02 Education, Skills & Human Capital | **Ladder** (CSS 3D): five thick platforms climbing, with a trail of light | Each platform is a stage of the system (primary, secondary, madrasah, skills, systems), each tied to an assignment. The camera climbs and earlier stages turn green. |
| 03 Health Systems & Social Protection | **Coverage** (canvas): a population of 336 dots, labelled illustrative | Measure: dots form a grid in a sweep → Compare: two groups separate → Include: a subgroup is ringed and some dots are left out → Adapt: those in the programme are reached → Cost: the dots stack into two columns |
| 04 Digital Government, Data & DPI | **Stack** (CSS 3D): five plates of a digital state in an exploded view, with data packets rising through them | Data → Systems → Ecosystem → Services → People; the current plate lights up |
| 05 Governance, Institutions & Public Finance | **Flow** (SVG): five nodes on an arc; dashed "hand-offs" become solid links as the reader moves on, with pulses travelling once a link is complete | Diagnose → Co-create → Regulate → Deliver → Account; on the last step a feedback loop draws back to the start |
| 06 Economic Transformation, Trade & PSD | **Chain** (SVG): a value chain panning sideways at three parallax depths (far hills, the track and stations, the cargo) | Firms → Value chains → Trade → Investment → Policy |
| 07 Sustainable Finance, ESG & Circular Economy | **Loop** (SVG morph): "Take · Make · Waste" on a straight line bends into a circle | The segments of the loop light in turn as an arrow travels round; E·S·G appears at the centre on the last step |
| 08 AI & Emerging Technology | **Lattice** (canvas): about 50 nodes, labelled illustrative | Scattered signals → collected data → a layered model with links → guardrails go up and weak links fade → four service nodes → pulses reach people |

## Technology

- **Existing stack only.** The site's vendored GSAP and Lenis stay as they are; the sector scripts use Lenis for smooth jumps and their own single scroll loop. No new runtime library was added, three.js and WebGL included. Every scene is CSS 3D, SVG or canvas 2D, so the scenes cost about 9 KB of gzipped JavaScript and render on low-end GPUs.
- **Files.** `src/sec/*.js` render the HTML at build time, one module per chapter. `src/css/sec/*.css` and `src/js/sec/*.js` are joined into `assets/css/sectors.css` (31 KB) and `assets/js/sectors.js` (30 KB), loaded only on the eight sector pages. The body class `sxp` scopes the styles; `.sx` was already the sector list on /sectors.
- **Scroll engine.** `00-base.js` runs one `requestAnimationFrame` loop after each scroll or resize, and each module subscribes to it. The scene engine (`39-scene.js`) finds the fractional step whose centre sits at 55% of the viewport height, eases towards it, and calls the drawing's `set(sp)`. Drawings interpolate keyframes with smoothstep. Sticky positioning does the pinning, which avoids pin-spacer conflicts with Lenis.
- **Content-driven.** Step labels and text come from `content/sector-pages/<slug>.json` (CMS: "11 · Sector pages"). The drawing type is a select field, and validation insists on five steps because the drawings are built for five.

## Fallbacks

| Condition | Behaviour |
| --- | --- |
| No JavaScript | Every word is in the HTML. Drawings show their final state. The gallery and the ledger are swipeable rows. The hero is a static full-bleed header. |
| `prefers-reduced-motion` | No hero pull-back, word lighting, gallery flight or ledger pinning; the drawings show their final state and every step is at full strength. The header film does not autoplay. Ambient canvas motion and SVG pulses are paused. |
| Under 900 px wide | The drawing sticks above the steps, which scroll beneath it. The gallery and ledger fall back to native swipe rows; the step rail is hidden because the steps are numbered. |
| Off screen | The header film pauses, canvas loops stop and the scene engine stops updating. |
| Accessibility | Drawings are `aria-hidden` because the steps carry the same words. The rail is a labelled `nav` of in-page links. A "Skip the scroll scene" link appears on keyboard focus. Every section is labelled by its heading. Films have descriptive labels. |

## References consulted

The listing pages were read on 12 Oct 2026. Behance returned 403 and Dribbble returned no readable results, so neither informed the work. The designs here are original, and no code or assets were copied.

| Reference | Source | Technique taken as a cue | Verified from page text |
| --- | --- | --- | --- |
| Heron AI | Awwwards (Site of the Day, 12 Oct 2026), heronaiapp.com | A four-step "observe / advise / act / learn" scroll sequence built with GSAP and canvas, the same stack used here | Yes |
| AskLex — journey | Awwwards, asklex.law/journey | Scene counter ("01 / 06"), a skip link and a reduced-motion setting on a long scroll journey | Yes |
| Point Of View | Awwwards, readingstones.com | A long-read organised in dated chapters (scrollytelling cadence) | Yes |
| New York's New Maestro | Awwwards, nyphil.org | Parallax and transitions with GSAP, Svelte and canvas, no WebGL | Tags only |
| Singularity | Awwwards, singularity.engl.design | Camera flying through depth (the gallery flight) | From the description |
| TIGRIS; Chladni · A Geometry of Sound | Awwwards | Particles moving from chaos to order (the AI lattice) | From the descriptions; both are WebGL, so only the idea was used |
| Hitit | Awwwards, hitit.com | Tone: a corporate "digital journey" in CSS and GSAP | Tags and description |
| 3D Tablet Scroll Animation; 3D Fold On Scroll; tc-playground | Webflow Made-in-Webflow | Objects turning in 3D on scroll (ledger cards, exploded stack) | From the descriptions |

No reference matched the aperture hero, the word-lit statement or the next-sector portal. Those are standard editorial techniques, built here from scratch.
