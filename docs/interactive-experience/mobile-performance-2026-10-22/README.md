# Mobile optimisation — evidence index

Completed 23 October 2026; started 22 October. [Full review](MOBILE_PERFORMANCE_REVIEW.md). [Issue update](ISSUE_UPDATE.csv) supplements the original register with IP3-22/23 and updates still-partial IP3-18.

## Preview

- [Local Home](http://localhost:3123/) / [Local Explore](http://localhost:3123/explore).
- [Protected application preview, code 1d7d8c5](https://ip3-bd-iqkkh64q5-ip-3.vercel.app/) — normal Vercel sign-in may be required. Deployment metadata does not establish authenticated runtime acceptance.

## Accepted performance proof

- [COMPARISON.json](gzip-comparison/COMPARISON.json): **20 unique accepted runs**, same mobile/gzip settings on both sides. Three Home trials per side; one per hub/model.
- [Before](gzip-comparison/performance-baseline.json), [after](gzip-comparison/performance-after.json), [Home priority trials](gzip-comparison/performance-priority-home.json).
- [Native equality](unchanged-native-output-proof.json): seven HTML pages and 23 referenced CSS/JS assets unchanged across the Home-only priority change.
- [Home report-copy receipt](gzip-comparison/home-report-copy-receipt.json): canonical copies retain original bytes; they are not additional trials.
- [Lighthouse archive manifest](LIGHTHOUSE_ARCHIVES.json): **127 archives / 124 unique report byte sets**, including rejected history. Only 20 accepted runs form the final comparison. Every archive round trip and original JSON SHA-256 is recorded.

Home median LCP **5.453 → 4.636 s**, TBT **300 → 208 ms**, score **73 → 78**. FCP **1.590 → 2.099 s** is slower. Home remains Partially Fixed. Earlier 7.60/7.63 s results used uncompressed delivery and must not be mixed with this gzip comparison.

## Functional evidence

| File | Actual scope |
|---|---|
| [Regression](regression.log), [hosting](hosting.log) | 123/123 and 36/36 pass |
| [Content](content.log), [links](links.log) | Schema and 33-page checks; seven inherited warnings |
| [Scientific vectors](scientific-vectors.json) | 46 independent arithmetic vectors, not empirical validation |
| [Chromium matrix](chromium/browser-results.json) | 64 variants at four widths |
| [Chromium review](chromium/review-browser-results.json), [Firefox review](firefox/review-browser-results.json) | Each: 64 resets, 18 complete graph/table/export vectors |
| [Edge touch](edge-touch/edge-touch-results.json), [edge cases](edge-cases/edge-results.json) | Six models at 390/320; adversity and Home preview controls |
| [Home scroll](home-scroll-proof.json) | 22 viewport/section checks, six stage controls, six No-JavaScript panels |
| [Visual/control proof](visual-after.json), [baseline](visual-before.json) | 16 pairs, six Pause breakpoints, pointer tilt, menu, sector scrolling, enlarged text and Home CDN-failure fallback |
| [Hero proof](hero-release/final-browser-specific.json), [log](hero-release.log) | 12 playback/pause/resume/selection/reduced-motion/privacy checks |
| [Font proof](font-outline-proof.json) | 17,800 glyph/location comparisons; file hashes and retained axes |

Local Chromium/Firefox and Edge touch emulation do not establish physical-device, NVDA/VoiceOver or full WCAG acceptance. The 30-file equality receipt covers native reuse across the final Home-only priority change.

## Before / after images

Reduced motion keeps captures repeatable. “Motion off” is the test preference; normal video/motion is verified separately.

| Page | Mobile before / after | Desktop before / after |
|---|---|---|
| Home | [Before](home-390-before.png) / [After](home-390-after.png) | [Before](home-1440-before.png) / [After](home-1440-after.png) |
| Hub | [Before](hub-390-before.png) / [After](hub-390-after.png) | [Before](hub-1440-before.png) / [After](hub-1440-after.png) |
| Trade | [Before](economics-trade-390-before.png) / [After](economics-trade-390-after.png) | [Before](economics-trade-1440-before.png) / [After](economics-trade-1440-after.png) |
| Finance | [Before](finance-investment-390-before.png) / [After](finance-investment-390-after.png) | [Before](finance-investment-1440-before.png) / [After](finance-investment-1440-after.png) |
| Enterprise | [Before](market-enterprise-390-before.png) / [After](market-enterprise-390-after.png) | [Before](market-enterprise-1440-before.png) / [After](market-enterprise-1440-after.png) |
| Impact | [Before](development-impact-390-before.png) / [After](development-impact-390-after.png) | [Before](development-impact-1440-before.png) / [After](development-impact-1440-after.png) |
| Governance | [Before](policy-governance-390-before.png) / [After](policy-governance-390-after.png) | [Before](policy-governance-1440-before.png) / [After](policy-governance-1440-after.png) |
| Delivery | [Before](management-delivery-390-before.png) / [After](management-delivery-390-after.png) | [Before](management-delivery-1440-before.png) / [After](management-delivery-1440-after.png) |

[Home font-CDN unavailable / local fallback](font-cdn-unavailable-fallback.png). Screenshots are evidence; the website retains native infographics and original media.

## History and integrity

`resolved-observations/` preserves hidden mobile Pause, CTA overlap and the stalled CI installation receipt. Rejected font configurations are explicitly separated in `rejected-*` and `intermediate-*` directories. Superseded flow and pre-priority Home reports remain under `gzip-comparison/`. Root uncompressed baseline files are historical diagnostics. No rejected run is counted as acceptance.

`EVIDENCE_MANIFEST.json`, `CI_APPLICATION.json` and `HOSTED_PREVIEW_METADATA.json` identify saved bytes and exact application/deployment metadata. The dependency-installation stall did not execute browser tests. CI pins the previously successful Ubuntu 24.04 image and limits installation to eight minutes; all Chromium/Firefox tests, assertions and the job budget remain.

The [release decision](../review-2026-10-22/RELEASE_DECISION.md) remains **NO-GO**. Scientific, human-accessibility and authenticated hosted-runtime acceptance remain open. No merge, production deployment or protection change was performed.
