# Sector pages — institutional motion architecture

Design revision for [PR #9](https://github.com/mdsyfulhoque-afk/ip3-bd.org/pull/9), branch `sectors-cinematic`, 13 October 2026. The sector pages connect policy frameworks, local systems and implementation through restrained spatial depth. All policy content remains readable independently of the animation.

## Reading structure

| Chapter | Behaviour | Purpose |
| --- | --- | --- |
| Hero | Full headline and challenge remain visible; desktop media has at most 24 px of scroll-linked drift | Establish the sector and its mandate without moving the text |
| Statement | Static, readable thesis and supporting paragraphs | State IP3's position directly |
| Method | Three labelled spatial layers accompany five fully readable steps | Connect policy context, local conditions and practical work |
| Practice | Native disclosure rows for the detailed service lists | Keep the service offer scannable and keyboard accessible |
| Field gallery | Editorial grid with captions and native video controls | Let readers inspect media at their own pace |
| Assignment record | Responsive grid of linked assignment cards | Keep every record available to keyboard, touch and pointer users |
| Expertise and next sector | Direct capability links and a static next-sector route | Support continued exploration without another scroll sequence |

## Three layers, eight models

The optional CMS `scene.system` object contains `framework`, `setting` and `outcome`, each limited to 100 characters. These appear under the labels **Policy frameworks**, **Local systems** and **Implementation**. They summarize concepts already present in each page; they are conceptual framing, not new measurements or claims of delivered results.

The framework layer sits furthest back, the local system occupies the middle, and the implementation layer is nearest the reader. Small differences in translation and Z-axis placement make those relationships legible. The model is labelled conceptual; its explanatory text is available in the neighbouring ordered list.

| Sector | Drawing | Method represented |
| --- | --- | --- |
| Climate, Energy & Resilience | CSS 3D terrain | Risk → Plan → Build → Finance → Govern |
| Education, Skills & Human Capital | CSS 3D platforms | Primary → Secondary → Madrasah → Skills → Systems |
| Health Systems & Social Protection | Canvas coverage model | Measure → Compare → Include → Adapt → Cost |
| Digital Government, Data & DPI | CSS 3D stack | Data → Systems → Ecosystem → Services → People |
| Governance, Institutions & Public Finance | SVG policy flow | Diagnose → Co-create → Regulate → Deliver → Account |
| Economic Transformation, Trade & PSD | SVG value chain | Firms → Value chains → Trade → Investment → Policy |
| Sustainable Finance, ESG & Circular Economy | SVG circular model | Linear → Design → Recover → Regenerate → Finance |
| AI & Emerging Technology | Canvas layered network | Data → Analytics → Governance → Applications → Adoption |

There are no idle ambient diagram loops. Model changes follow reading progress. Canvas drawings have static SVG fallbacks, including grouped coverage dots and a connected layered network, so JavaScript or canvas failure does not leave an empty model.

## Runtime and lifecycle

- `src/sec/*.js` renders the chapters and drawings at build time. Sector CSS and JavaScript are bundled from `src/css/sec/` and `src/js/sec/` and loaded on the eight sector pages.
- CSS 3D, SVG and canvas 2D provide the drawings. No Three.js or WebGL runtime is used for this redesign.
- Existing GSAP ScrollTrigger supplies progress and refresh notifications. The sector pages use native browser scrolling. A sector-only early return in `src/js/site.js` bypasses global GSAP reveals and Lenis; other routes retain their existing initialization path.
- The scene controller maps the centres of the five steps to the reading line at 52% of viewport height. A bounded requestAnimationFrame loop approaches that target with time-based exponential damping: `1 - exp(-dt / 240)`, using a 240 ms time constant and a capped elapsed-time step.
- The loop stops after convergence, when the page is hidden, or when the scene leaves the viewport. Resize, font readiness, load and motion-preference changes recalculate the layout.
- Desktop sticky motion requires at least 900 px width, at least 680 px height, an available drawer and ScrollTrigger, and no reduced-motion preference. The measured sticky stack must also fit the viewport, including the reserved offset. Wrapped navigation, longer labels or text zoom can therefore trigger the static layout.
- Native in-page method links update the hash, transfer focus to the selected step and scroll to it. Reading the content never depends on using these controls.

## Preferences and media

The **Reduce motion** checkbox stores the reader's preference in local storage when available. OS `prefers-reduced-motion` changes apply immediately, and an OS reduction request takes precedence over the page control. No reload is required.

The hero uses a poster before loading background video. Playback starts only while the hero is visible and motion is permitted; it pauses off screen, in a hidden document, with reduced motion, or when Save-Data is enabled. Gallery films use native video controls rather than background playback.

| Condition | Result |
| --- | --- |
| Mobile or short viewport | Compact static overview in normal document flow; all five steps follow |
| Reduced motion, including a saved preference or live OS change | Static model and hero, with all text available |
| No JavaScript | Readable server-rendered content, static drawings and SVG canvas fallbacks |
| Blocked or unavailable ScrollTrigger | Static method overview; no sticky scroll choreography |
| Canvas unavailable | Static SVG remains visible; it is hidden only after a successful canvas draw |
| Hidden tab or off-screen scene | Animation work stops; hero background playback pauses |
| Keyboard navigation | Visible focus, labelled method links, focusable steps and ordinary assignment links |

The drawing is decorative and hidden from assistive technology; the ordered method text carries its meaning. Sector headings and supporting text remain visible without global reveal scripts. Gallery captions and assignment content remain in normal document flow.

## Performance scope

At the current verification checkpoint, the sector JavaScript is approximately 8.6 KB gzipped and CSS approximately 7.9 KB gzipped. These figures describe the sector bundles, not the entire page or its media, and should be refreshed if final layout refinements change the build.

The implementation reduces continuous animation work and avoids a WebGL dependency. Real-device frame pacing, field Core Web Vitals and corporate-network performance have not been measured. No zero-frame-drop guarantee is made. See [QA-REPORT.md](QA-REPORT.md) for the tested environments and remaining checks.
