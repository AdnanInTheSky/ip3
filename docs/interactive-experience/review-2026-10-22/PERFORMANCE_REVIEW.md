# Performance review

Date: 22 October 2026. Local Lighthouse lab measurements, not authenticated Vercel performance or field Core Web Vitals. Mobile LCP remains a **Partially Fixed P1 issue (IP3-18)**. No field INP is inferred from TBT.

## Controlled baseline and method

The baseline is the actual clean reviewed implementation at `addb8ad303032aec3938ed8ac64c34ab6f737e36`, not the older pre-Explorer `df4d5e9` reference. `scripts/explore-final-performance.cjs capture` saved eight HTML pages and 19 versioned CSS/JS assets before edits. The baseline route serves those exact bytes; original media remains available. The comparison uses the same local static benchmark server, installed Chromium and Lighthouse CLI, default simulated mobile settings and the desktop preset.

Three Home runs per form factor per phase; one run per hub/model/form factor. There are 20 runs per phase: original baseline, first safe media iteration and final media/pause iteration (**60 total**). Lighthouse default storage reset is used, but browser process/DNS/OS caches and network conditions can persist. The first cold run varied more; report ranges and medians, not a confidence interval or significance claim. Reproduction and raw configurations are in the evidence files. Baseline captures are preserved.

## Actual contributors inspected

- The mobile report identifies the active hero lead paragraph as its LCP node. The old raw observed timing and the simulated Lantern timing differ; do not add raw render-delay values and call that the 14.7-second simulated result. Both are retained in the reports.
- Hidden video posters were eagerly present in markup, including a 1,360,481-byte education PNG. CSS visibility did not prevent those poster requests. The first video autoloaded and the next video was warmed immediately, competing with other startup work.
- The dependency chain includes Google Fonts CSS, font files, shared site CSS and Explorer CSS. The measured shared CSS is approximately 116 KB uncompressed; the original report flags render blocking. Fraunces faces are substantial variable-font downloads. Font-family/axes/weights and approved copy animations were preserved, not substituted or removed to improve scores.
- Hero media, the hidden PNG and shared font/HTML/CSS dominate the old transfer breakdown. Lazy below-fold image opportunities remain. This is a Node-generated static site, not a client-hydrated application; no hydration cost is asserted. Shared GSAP/ScrollTrigger/Lenis and homepage initialization contribute main-thread work; model routes already take their native-motion path.
- The generated site still has seven CMS/media warnings, including long descriptions, a large education poster even after lossless conversion, and the existing 10.4 MB About film. They are not silently marked resolved.

## Targeted changes

1. `src/pages-home.js:hero` keeps the first poster/preload hint but stages all video sources and hidden posters using data attributes. The first film starts after the existing copy-reveal window; subsequent films still play on selection and the next is warmed shortly before the eight-second slide transition. Videos, copy, timings of slide advancement, graphics and theme fonts are retained.
2. `src/js/site.js:initHero` owns the lifecycle: poster-first startup, on-demand source attachment, late warming, explicit pause/resume, keyboard focus hold, visibility and reduced-motion handling. Actual browser checks verify playback and automatic advancement can resume, and that Pause stops video/CSS/slide motion longer than one interval. No animation/video is replaced by a screenshot.
3. `content/home/hero.json` uses a lossless WebP copy for the education poster: **955,076 bytes**, versus **1,360,481 bytes** (29.8% smaller). The 1366×768 pixels compare exactly using Pillow. The original PNG is retained; this is not a claim of reducing the total repository/deployment asset inventory.
4. `lighthouserc.json` had warning assertions outside `ci.assert.assertions`, where LHCI does not read them. They are moved to the documented configuration path, keeping the original warning levels and thresholds: SEO .95, accessibility .90, performance .70. The report workflow remains warning/report-oriented; a green collection job is not a performance acceptance certificate. A regression test checks the schema and unchanged values.

## Repeated homepage results

| Form factor / phase | Runs | Median LCP (range) | Median CLS | Median TBT (range) | Median performance score |
|---|---:|---|---:|---|---:|
| mobile Before | 3 | 14.74 s (14.69 s–14.99 s) | 0.0000 | 330 ms (193–402) | 62 |
| mobile After | 3 | 7.60 s (7.60 s–7.65 s) | 0.0000 | 295 ms (276–427) | 65 |
| desktop Before | 3 | 2.57 s (2.57 s–2.61 s) | 0.0150 | 2 ms (0–6) | 83 |
| desktop After | 3 | 1.46 s (1.46 s–1.46 s) | 0.0150 | 0 ms (0–10) | 92 |

Observed median LCP improvement: mobile 48.5%; desktop 43.3%. These are controlled local observations, not a field improvement or statistical guarantee. Mobile remains approximately 7.6 seconds and does not meet a 2.5-second good-LCP objective. The first iteration was approximately 7.64 seconds mobile; the final startup refinement does not justify a large additional LCP claim.

The Home transfer median in the measurement window changed from 5.35 MB to 3.18 MB on mobile. Much of this is deferred work; later slides still download their original media. Do not describe it as total-site payload removal.

## Explorer measured separately

One run per route/form factor; insufficient for a variability/significance estimate.

| Route | Form | Before LCP | After LCP | After performance | After CLS | After TBT |
|---|---|---:|---:|---:|---:|---:|
| hub | mobile | 2.93 s | 3.01 s | 93 | 0.0143 | 0 ms |
| economics-trade | mobile | 3.53 s | 3.53 s | 88 | 0.0002 | 22 ms |
| finance-investment | mobile | 3.54 s | 3.54 s | 88 | 0.0002 | 9 ms |
| market-enterprise | mobile | 3.46 s | 3.53 s | 88 | 0.0027 | 45 ms |
| development-impact | mobile | 3.53 s | 3.53 s | 88 | 0.0002 | 34 ms |
| policy-governance | mobile | 3.46 s | 3.54 s | 88 | 0.0000 | 17 ms |
| management-delivery | mobile | 3.53 s | 3.53 s | 88 | 0.0042 | 37 ms |
| hub | desktop | 0.65 s | 0.65 s | 100 | 0.0041 | 0 ms |
| economics-trade | desktop | 1.13 s | 1.12 s | 96 | 0.0048 | 0 ms |
| finance-investment | desktop | 0.89 s | 1.00 s | 96 | 0.0051 | 0 ms |
| market-enterprise | desktop | 1.12 s | 0.93 s | 96 | 0.0853 | 0 ms |
| development-impact | desktop | 1.14 s | 1.12 s | 96 | 0.0049 | 0 ms |
| policy-governance | desktop | 1.14 s | 1.13 s | 95 | 0.0063 | 0 ms |
| management-delivery | desktop | 1.12 s | 1.12 s | 95 | 0.0527 | 0 ms |

The six model mobile LCP results remain around 3.5 seconds; good field LCP is not established. Desktop results are quicker, but neither form establishes physical-device behavior. Mobile model accessibility scores in these Lighthouse runs are 100; this is not human accessibility acceptance.

## Remaining work and release implication

Owner: performance engineer and site owner. Next: profile the authenticated deployment/CDN, verify compression/cache headers and asset scheduling, evaluate identical licensed font delivery/critical CSS and responsive below-fold assets with before/after visual proof. Retain the exact approved font appearance and media; obtain owner approval before any meaningful design/animation trade-off. Collect representative physical-device/field data. The severe mobile delay is reduced but not closed, and no field INP is available. The overall release remains NO-GO independently because required domain, human accessibility and hosted gates are open.

## Evidence and reproduction

- `FINAL_QA_EVIDENCE/performance-baseline/`: captured HTML/versioned assets and original identity.
- `performance-baseline.json`, `performance-after.json`, `performance-after-final.json`: all individual measurements.
- `performance-analysis.json`: medians/ranges, raw diagnostic items and tested build/source identity.
- `lh-*.json`: original complete Lighthouse reports; any compressed copies are byte-preserving gzip archives, not rewritten scores.
- `poster-optimization.json`: pixel equality, dimensions and exact encoded sizes.
- `final-browser-specific.json`: observed hero/media/pause behavior.

Commands: set `LIGHTHOUSE_CLI` to the installed Lighthouse CLI path; run `node scripts/explore-final-performance.cjs capture`, then `node scripts/explore-final-performance.cjs baseline`. After the targeted build, run with `EXPLORE_PERFORMANCE_LABEL=after-final node scripts/explore-final-performance.cjs after`. `EXPLORE_QA_OUT` can isolate a new evidence directory. Do not recapture over the historical baseline.

Configuration reference: [GoogleChrome/Lighthouse CI configuration — assert](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md#assert). Interpretation reference: [Chrome’s LCP guidance](https://developer.chrome.com/docs/performance/insights/lcp-breakdown).
