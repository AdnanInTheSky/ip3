# Mobile performance follow-up

Completed: 23 October 2026, Asia/Dhaka. Work began on 22 October. Baseline application: `e38bf3312b6c4dcd40007c97ffba2c66d55b559c`. Implementation under review: `1d7d8c5` and its preceding implementation commits. [Draft PR #30](https://github.com/mdsyfulhoque-afk/ip3-bd.org/pull/30).

## ফলাফল — উন্নতি হয়েছে; Homepage budget এখনও পূরণ হয়নি

একই mobile lab settings এবং দুই দিকেই একই gzip delivery দিয়ে তুলনা করা হয়েছে। Homepage-এর median LCP **5.45 → 4.64 seconds**, TBT **300 → 208 ms**, performance score **73 → 78**। ছয়টি analytical model-এর LCP **1.89–1.90 → 1.57–1.59 seconds**।

একটি trade-off আছে: Homepage-এর FCP **1.59 → 2.10 seconds** হয়েছে। প্রথম কিছু content দেখা দিতে সময় বেড়েছে, যদিও বড় প্রধান content-এর LCP ও paint-এর পর blocking time কমেছে। তাই **IP3-18 remains Partially Fixed**। Homepage 2.5-second LCP objective পূরণ করেছে বলা যাবে না। এই ফল local lab evidence; live hosting বা field Core Web Vitals acceptance নয়।

Fraunces, Montserrat, Lato, approved colours, original media, hero animation timings, native charts, public/private applications, all 64 case variants and 12 pathways are preserved. Five visible homepage slides remain configured from six CMS records. The six analytical pages remain complete native experiences. No infographic has become an iframe, image or video substitute.

## 1. Fair comparison and evidence boundaries

- **20 accepted, unique Lighthouse runs:** three Home mobile runs and one run each for the hub and six models, before and after. Home medians/ranges are reported; a single model run does not establish significance or variability.
- Both sides use the same negotiated gzip response helper, benchmark port/routes, simulated mobile throttling, Lighthouse version and Chromium. Configuration equality is checked by `scripts/mobile-performance-summary.cjs`.
- The baseline HTML and versioned CSS/JS were captured before edits. Original imagery/video remains unchanged. External Google font/network/cache behavior can vary on later reproduction; exact observed reports are retained.
- Earlier **7.60/7.63-second Home results used uncompressed local delivery**. They must not be directly contrasted with a gzip-enabled after result. Raw diagnostics remain in this directory, separately from the accepted matched comparison.
- The final Home-only script-priority change did not alter **seven Explore HTML pages or 23 referenced local CSS/JS assets**. Their 30 SHA-256 values match byte-for-byte. Native timings are therefore reused for the same delivered bytes. Three Home reports were copied unchanged to canonical filenames; those copies are **not additional trials**. Receipts: `unchanged-native-output-proof.json` and `gzip-comparison/home-report-copy-receipt.json`.
- Tests ran against saved worktree builds; some build stamps retain an earlier commit with `sourceDirty:true`. Source/resource hashes and the later application commits identify the executed implementation. This is not an authenticated deployed-build claim.

## 2. Actual mobile results

Lower LCP/TBT/CLS is preferable. Higher Lighthouse score is preferable.

| Route | Before LCP | After LCP | After TBT | After performance |
|---|---:|---:|---:|---:|
| Home — median of 3 | 5.453 s | **4.636 s** | **208 ms** | **78** |
| Explore hub | 1.663 s | **1.589 s** | 0 ms | 99 |
| Economics & Trade | 1.905 s | **1.583 s** | 0 ms | 99 |
| Finance & Investment | 1.890 s | **1.578 s** | 0 ms | 99 |
| Market & Enterprise | 1.887 s | **1.576 s** | 0 ms | 99 |
| Development Impact | 1.889 s | **1.575 s** | 0 ms | 99 |
| Policy & Governance | 1.889 s | **1.586 s** | 0 ms | 99 |
| Management & Delivery | 1.888 s | **1.572 s** | 0 ms | 99 |

### Home repeated measurements

| Metric | Before median (range) | After median (range) |
|---|---|---|
| LCP | 5.453 s (5.392–5.462) | **4.636 s (4.629–4.729)** |
| FCP | 1.590 s (1.587–1.674) | **2.099 s (2.004–2.103)** — slower |
| TBT | 300 ms (269–397) | **208 ms (200–306)** |
| CLS | 0 (0–0) | **0 (0–0.0060)** |
| Performance | 73 (68–74) | **78 (74–79)** |
| Accessibility score | 95 | **97**; not human acceptance |
| Transfer in capture window | 2.728 MB | **2.599 MB** |

Observed median changes: LCP **15.0% lower**, TBT **30.7% lower**, performance **+5 points**. These are small local samples, not field guarantees. Transfer is measured during the audit window; deferred media still downloads later. The repository's total asset inventory has not shrunk. No new paired desktop-performance claim is made; desktop functionality/layout was checked separately.

Machine-readable accepted comparison: [gzip-comparison/COMPARISON.json](gzip-comparison/COMPARISON.json).

## 3. Implemented changes and sources

| Source / function | Change | Preservation / proof |
|---|---|---|
| `build/page-css.cjs:pageCss`; `build/build-all.js` | Deliver relevant shared CSS to Home/hub/models; equal model styles share one immutable URL | Original declarations/order/media/keyframes retained. Functional, attribute and escaped selectors remain conservative; runtime classes are derived from the existing script. Tests protect word wrapping, JS states, pointer tilt and profile headers. |
| `src/layout.js:page`; `src/fonts.js` | Home embeds pinned font-face declarations, preconnects the existing font CDN and uses local mirrors | Explore retains its original, measured font delivery after alternative delivery regressed its LCP. No new font family/provider is introduced. |
| `src/theme-fonts.json`; `assets/fonts/`; font maintenance scripts | Use Google-generated Home Latin Fraunces files with the currently used `SOFT=0`; preserve variable weight/optical/WONK axes | Two Latin files: **270,312 → 149,268 bytes (44.8% smaller)**. All codepoints retained. Original full files/subsets/licenses remain. Lato/Montserrat are unchanged. |
| `src/layout.js:page` | Preload four essential Home scripts at high priority | Execution remains through the original ordered defer tags, once each. Native page/asset byte equality is independently checked. |
| `src/js/site.js:initScroll` | Home prepares ordinary scroll reveals 600 px before approach | Original animation durations/effects/thresholds remain; pinned sequences initialize immediately. Other pages keep their original initialization. 22 section/viewport checks pass. |
| `src/js/site.js:initChrome`; `src/css/site.css` | Avoid initial whole-document height measurement at scroll position zero; avoid initially laying out five unselected chain panels | Progress still updates on scrolling. All six stage controls work; all six panels remain readable without JavaScript. |
| `build/http-compression.cjs:sendFile`; `dev-server.js` | Negotiate gzip for text/SVG in local preview | Exact decompressed bytes tested; q=0 honored; WOFF2/media not recompressed; MP4 range handling retained. Vercel already provides transport compression, so this local change is not represented as a new deployed gain. |
| Vercel headers; Hostinger `release-plan.cjs:scan` | Permit/cache the pinned font assets within existing static architecture | No hosting protection or release authorization is changed. |
| `.github/workflows/explorer-browser.yml` | Pin the previously successful Ubuntu 24.04 image; cap dependency installation at eight minutes | A later dependency installation stalled without reaching tests. Full Chromium/Firefox coverage, test assertions and the 20-minute job budget remain; the exact stall cause is not asserted. |

CSS source payload: original shared stylesheet **116,596 bytes**; delivered Home shared CSS **68,947 bytes**, model shared CSS **22,411 bytes**, hub shared CSS **22,544 bytes**. These are uncompressed CSS sizes, distinct from wire transfer. Model routes omit **129,079 bytes** of unused global GSAP/ScrollTrigger/Lenis JavaScript while preserving their own native animation/controllers.

### Font verification

`font-outline-proof.json` compares all 222 normal / 223 italic Latin glyphs at 40 weight/optical/WONK locations: **17,800 comparisons**. Maximum outline/advance delta is **0.2593 font unit out of 2000/em**, and all original codepoints remain. Actual browser typography and geometry are checked separately. The same pinned CDN bytes are available as local Home fallbacks. A deliberate CDN-failure test confirms Home's four required font faces load from the mirrors.

Current CSS uses SOFT=0; a guard test requires reconsidering these optimized files if that design setting changes. Builds never call the Google stylesheet API or require Python. Font maintenance/verification uses Python + FontTools 4.67.0 only when explicitly run.

## 4. Additional mobile defects fixed

### IP3-22 — existing Pause control was hidden

The old 1040 px CSS breakpoint hid the entire desktop control group, including Pause. `initHero:placePauseButton` moves the **same button** into an unused tab-grid cell below that breakpoint and returns it to the original desktop position above it. Focus is preserved on resize. No duplicate Pause control is created. The visible label and accessible state update together.

Verified at **320/390/820/1040/1041/1440 px**: one visible Pause control, five original slide selectors and targets at least 44×44 px. Normal playback/pause/resume and reduced-motion preferences are exercised separately.

### IP3-23 — CTA overlapped slide tabs

On small screens the absolutely positioned tabs could overlap the secondary CTA. Mobile tabs now participate in the existing flex document flow, with a 32 px copy-to-controls allowance. Desktop positioning, typography, imagery and original actions remain.

The visual comparison explicitly permits the predicted Home mobile vertical shift for this spacing fix; font/style, x/width/height and desktop/native geometry assertions remain. A separate non-overlap assertion protects the intended result, including **320 px / 200% text** (measured gap **58.27 px**).

Screenshots use reduced motion for repeatability. The label “Motion off” reflects that preference; normal-mode animated video and controls remain functional. See [evidence index](README.md).

## 5. Verification

- **123/123 Node regression tests**, **36/36 hosting tests**; content/schema and 33-page links/metadata checks pass. Seven inherited content/media warnings remain.
- Full Chromium scenario matrix: 64 variants at 1440/820/390/320; original numerical/display checks pass.
- Chromium and Firefox each exercise 64 selected-case resets and 18 complete series/table/graph/export vectors. Edge touch/reflow covers six models at 390/320. Exact current application CI receipts are retained separately.
- 46 independently expressed numerical vectors pass; no equations, synthetic assumptions or calculation-version rules changed.
- 16 paired visual/layout checks; six Pause breakpoints; 320 px enlarged-text spacing; desktop pointer tilt; mobile menu and native sector scrolling; Home CDN-fallback test pass.
- **22 Home section/viewport animation checks**, six delivery-stage controls and six no-JavaScript panels pass.
- **12 hero/privacy/no-JavaScript checks** pass, including real playback, pause beyond a slide interval, resume, manual selections and reduced motion.
- Automated accessibility success is scoped evidence, not NVDA/VoiceOver/physical-device acceptance or WCAG certification.

## 6. Rejected and superseded runs

All intermediate results are retained with explicit scope. They are excluded from the accepted comparison:

- Weight-specific font overlays caused duplicate font downloads and were rejected.
- Self-host-only font delivery and a font-delivery change across all Explore routes regressed their simulated LCP. Explore was restored to its baseline font path.
- Early measurements were superseded while the mobile control/flow defects were being repaired. No mixed-build result is treated as final proof.
- Home results before script prioritization had worse post-paint blocking; the accepted three-run priority comparison is recorded separately and copied without altering JSON bytes.
- The initial hidden-Pause failure and CTA-overlap screenshot are kept in `resolved-observations/`; the product was corrected rather than the failed control check being skipped.

## 7. Remaining work / release implication

**IP3-18: Partially Fixed.** Home LCP remains 4.64 s, median TBT remains just over 200 ms and FCP is slower. Further work needs authenticated deployment/CDN and representative-device profiling, followed by a measured decision about the remaining critical asset/motion cost. Preserve the approved visual experience; do not hide/remove hero content to improve a score.

The original scientific acceptance, qualified human accessibility and authenticated hosted-runtime gates remain open. Preview deployment success is metadata, not authenticated runtime verification. **Production recommendation remains NO-GO. No PR merge, production deployment or protection changes were performed.**

The owner can review the live local preview and matched screenshots now. A performance trade-off is documented for review; no owner or domain sign-off is invented.

## 8. Reproduction

Use a **fresh output directory**. Copy the supplied `performance-baseline/` snapshot into it; do not recapture the current implementation and call it the original baseline. Set `EXPLORE_QA_OUT` to that directory, `EXPLORE_PERFORMANCE_FORMS=mobile`, `EXPLORE_PERFORMANCE_GZIP=1`, and `LIGHTHOUSE_CLI` to the installed Lighthouse CLI. Run `node scripts/explore-final-performance.cjs baseline`, then `... after`, then `node scripts/mobile-performance-summary.cjs`. Each full mobile phase produces 10 runs. Chrome is launched by the project Playwright package.

For UI proof: build/start port 3123; run `scripts/home-scroll-proof.cjs`, `scripts/mobile-performance-proof.cjs after` against the supplied baseline visual record, the existing model browser/review/edge scripts, and repository tests. New screenshots/logs should use a fresh evidence directory. Font maintenance: vendor original files, run `prepare-theme-cdn.cjs`, then `verify-theme-fonts.py`; review the new hashes/shape proof before accepting an upstream font update.

Reports are preserved as byte-verified gzip archives; the summary reader supports `.json.gz`. `LIGHTHOUSE_ARCHIVES.json` identifies duplicate report copies and rejected history. `EVIDENCE_MANIFEST.json` authenticates the delivered review/evidence bytes.
