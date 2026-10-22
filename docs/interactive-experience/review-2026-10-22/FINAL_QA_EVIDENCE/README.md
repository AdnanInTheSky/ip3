# Final QA evidence index

Date: 22 October 2026. Acceptance verdict: **NO-GO**, with IP3-03 / IP3-09 / IP3-15 Blocked and homepage mobile performance Partially Fixed. All evidence is scoped to what was actually tested. No human/empirical/hosted sign-off is implied.

## Identity and integrity

- [BASELINE.json](BASELINE.json): actual initial branch, SHA, clean status and build identity. Original review reference `df4d5e9` is distinct from this reassessment baseline `addb8ad`.
- [Final task input](final-task-input.json): supplied master-prompt byte hash and instruction boundary; exact source copy remains in `../source/`.
- [Source/runtime receipt](source-runtime-receipt.json): exact saved implementation/test source hashes and measured local build identity. Local test build may have `sourceDirty:true` while changes await commit; it must not be described as an authenticated deployed commit.
- `source-receipt-verification.json`: fresh original-package receipt authentication. Original prototypes are additionally hashed in the regression suite.
- `EVIDENCE_MANIFEST.json`: final evidence-file byte sizes and SHA-256 values, excluding the manifest itself. Any later CI status is identified by its own source SHA.
- [Lighthouse archives](lighthouse-archives.json): original JSON hash/size, compressed hash/size and byte-equality proof for **60 complete reports**. `.json.gz` is storage compression, not score editing. To inspect: `gunzip -c <report.json.gz>` or Python/Node gzip APIs.

## Actual current verification

| Evidence | Result / scope |
|---|---|
| [baseline-regression.log](baseline-regression.log) | 105/105 reproduced before application edits. |
| [baseline-hosting.log](baseline-hosting.log) | 36/36 reproduced. |
| [final-regression.log](final-regression.log) | **115/115** after scientific, metadata, claim, hero and CI-configuration changes. |
| [final-hosting.log](final-hosting.log) | **36/36** pass. |
| [build.log](build.log), [content-check.log](content-check.log), [links.log](links.log) | 33 generated pages; CMS/schema/link/metadata checks pass; seven recorded metadata/media warnings remain. |
| [chromium-full/browser-results.json](chromium-full/browser-results.json) | 64 variants at 1440/820/390/320; 48 numeric display vectors; fonts/keyboard/reduced motion/no-JS/Contact privacy; no failures. |
| [Chromium full log](chromium-full.log), [adversarial.log](adversarial.log) | Current matrix and adverse CF/delivery/enterprise/workload cases plus cross-site journeys. |
| [chromium-models/review-browser-results.json](chromium-models/review-browser-results.json) | **64 resets, 18 true default/min/max full-series vectors**, actual JSON/CSV, every table row and chart coordinates, opened-table axe, enlarged text and reflow pass. Finite metadata is checked against the actual DOM first. |
| [firefox-models/review-browser-results.json](firefox-models/review-browser-results.json) | Same **64 resets / 18 vectors** and full model/download/axe/reflow proof in Gecko. Independent engine, not a human AT session. |
| [edge/edge-touch-results.json](edge/edge-touch-results.json) | Installed Microsoft Edge, touch emulation at 390/320, six models, zero automated findings. No physical-device claim. |
| [scientific-vectors.json](scientific-vectors.json) | **46** independently expressed worked vectors across six methods; synthetic implementation identities only. |
| [model-protocols.json](model-protocols.json) | Current explicit numeric units/defaults/bounds/steps, method references and evidence status for all models. |
| [final-browser-specific.json](final-browser-specific.json) | **12 checks**: deferred actual video, pause longer than a slide interval, resume/automatic advancement, every configured visible hero selection, dynamic/initial reduced motion, no control/reset POST or storage and finite no-JS defaults. |
| [environments.json](environments.json) | Windows, Node 24.16.0, Chromium 156.0.8078.4, Firefox 157.0, installed Edge; automated/emulated scope. |

There are 128 selected-case resets and 36 full-series vectors across the two engines, not 128 distinct scenarios. Each engine exercises the same 64 model variants. The 46 worked vectors and 48 display vectors are different verification layers, not extra empirical datasets.

## Before/after captures

| Correction | Before | After |
|---|---|---|
| No-JS bounds/labels | [Before](input-bounds-nojs-before.png) | [After](input-bounds-nojs-after.png) |
| Enterprise residual claims, desktop | [Before](enterprise-claims-1440-before.png) | [After](enterprise-claims-1440-after.png) |
| Enterprise residual claims, mobile | [Before](enterprise-claims-390-before.png) | [After](enterprise-claims-390-after.png) |
| Delivery evidence boundary, desktop | [Before](delivery-claim-1440-before.png) | [After](delivery-claim-1440-after.png) |
| Delivery evidence boundary, mobile | [Before](delivery-claim-390-before.png) | [After](delivery-claim-390-after.png) |
| Impact line note, desktop | [Before](impact-line-note-1440-before.png) | [After](impact-line-note-1440-after.png) |
| Impact line note, mobile | [Before](impact-line-note-390-before.png) | [After](impact-line-note-390-after.png) |
| Home, desktop | [Before](home-1440-before.png) | [After](home-1440-after.png) |
| Home, mobile | [Before](home-390-before.png) | [After](home-390-after.png) |

The browser directories contain model after/data screenshots and real exported fixtures. The complete original models remain interactive native pages; screenshots are review evidence only. Before captures came from the unchanged running baseline, after captures from the corrected running implementation.

## Performance

- [performance-baseline.json](performance-baseline.json): current baseline, 20 individual runs.
- [performance-after.json](performance-after.json): first targeted iteration, 20 runs.
- [performance-after-final.json](performance-after-final.json): final iteration, 20 runs.
- [performance-analysis.json](performance-analysis.json): medians/ranges, Explorer comparisons, diagnostics, configurations and tested build. Three Home runs per form factor; one hub/model run per form factor/phase. No field INP or significance claim.
- [poster-optimization.json](poster-optimization.json): exact pixel comparison and 29.8% encoded-size reduction; original asset retained.
- `performance-baseline/`: captured original HTML and versioned CSS/JS assets, with identity. Do not overwrite it when reproducing a later audit.

Home median mobile LCP 14.74 → 7.60 seconds; desktop 2.57 → 1.46 seconds. Mobile remains slow. Deferred transfer is not removal of all later media or an overall deployment-size saving. See [full review](../PERFORMANCE_REVIEW.md).

## Hosted/human restrictions

[hosted-http.json](hosted-http.json) records anonymous 302 to Vercel SSO with query omitted; [hosted-connector.json](hosted-connector.json) records team ip-3 scope 403. GitHub deployment metadata is not an authenticated build.json/interaction test. No credentials/cookies are recorded.

Human NVDA/Firefox, VoiceOver/Safari and physical devices are **not conducted**. Scripts and closure criteria: [accessibility](../ACCESSIBILITY_ACCEPTANCE.md), [hosted](../HOSTED_VERIFICATION.md), [release decision](../RELEASE_DECISION.md).

## Preserved failures and correction of historical coverage

`resolved-harness-failures/` retains two initial test-harness failures: expecting six visible home slides when the CMS config has five visible out of six records, and trying to verify auto-advance while the pointer/focus intentionally held the hero paused. The harness now derives visible count from authoritative data and moves focus/pointer to the header for resume testing. Product visibility was not changed to fit a test; pause behavior was not weakened.

The earlier export protocol's null bounds also limited old endpoint proofs. That actual product defect is fixed, and current proof asserts finite min/max/step against controls before every endpoint matrix. The old receipt history is not deleted or relabelled as new success.

## Reproduction commands

`npm run explore:import`; `npm run build`; `npm test`; `npm run test:hostinger`; `npm run check`; `npm run links`.

With the local server running on 3123, set `EXPLORE_QA_OUT` to a new output directory and run `npm run test:explore:browser`, `node scripts/explore-review-check.cjs`, `node scripts/explore-edge-check.cjs`, `node scripts/explore-final-browser.cjs`, and `node scripts/explore-scientific-proof.cjs`. Run the review check again with `EXPLORE_BROWSER=firefox` and a separate output directory. Firefox must be installed via the official Playwright distribution. `explore-edge-touch.cjs` requires installed Microsoft Edge on the local host.

Performance reproduction and limitations are in `../PERFORMANCE_REVIEW.md`. New CI runs isolate their artifacts outside historical repository evidence and exercise both Chromium and Firefox. Read current PR check receipts at the exact source SHA; production-only smoke is skipped for preview by design.
