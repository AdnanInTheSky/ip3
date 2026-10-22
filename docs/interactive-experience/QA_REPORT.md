# IP3 native interactive experience — QA record

Date: 22 October 2026. Environment: Node 24.16.0, Windows, local static server, Playwright Chromium and installed Microsoft Edge. Release classification: implemented and locally verified for PR review; owner acceptance and production release are pending.

## Observed results

| Check | Measured result | Evidence |
|---|---|---|
| Handoff integrity | 6/6 original model SHA-256 hashes match the supplied ZIP manifest | `qa/handoff-integrity.json` |
| Build | 33 pages; 32 sitemap URLs | `qa/build-links.log` |
| Internal links, anchors, metadata, image alt and sitemap | PASS on all 33 pages | `qa/build-links.log` |
| Locked dependency install | PASS; 0 vulnerabilities reported by npm | `qa/npm-ci.log` |
| CMS/content validation | PASS, generated config current; seven pre-existing warnings | `qa/content-cms.log` |
| Project regressions | 102/102 PASS, including 10 model/architecture tests | `qa/regression-tests.log` |
| Hostinger regressions | 36/36 PASS | `qa/hostinger-tests.log` |
| Full model scenarios | 64/64 original public/private variants work | `qa/browser-results.json` |
| Responsive layout | Every variant checked at 1440, 820, 390 and 320 px; no page-level horizontal overflow | `qa/browser-results.json` |
| Numerical results in browser | 48 default/individual-boundary vectors match independently expressed expectations | `qa/browser-results.json` |
| Additional adverse combinations | PASS: infeasible counterfactuals, slow delivery, negative contribution and increased governance workload | `qa/edge-results.json` |
| Keyboard | Tab selection with End, range Home/Arrow keys and visible focus tested | `qa/browser-results.json`, `qa/edge-results.json` |
| Microsoft Edge/touch | Six pages pass touch taps, mobile 390/320 layout and mobile automated WCAG checks | `qa/edge-touch-results.json` |
| Automated accessibility | 0 findings for new model main content against WCAG 2 A/AA, 2.1 AA and 2.2 AA tags in tested Chromium/Edge views | `qa/*-axe.json`, `qa/edge-touch-results.json` |
| Reduced motion and pause | PASS: reduced-motion changes, tour interruption, offscreen tour stop, explicit CSS/SVG pause | `qa/browser-results.json`, `qa/edge-results.json` |
| Shared shell | Six pages each have one main, one shared site header/footer, one H1 and no iframe | Numerical/architecture suite and browser checks |
| Theme fonts | Fraunces hero, Lato body and Montserrat controls confirmed on all six pages | `qa/browser-results.json` |
| No-JS content | Initial hero/results/chart markup plus all 64 readable scenario transcripts available | Architecture and browser checks |
| Enquiry privacy | Allowlisted discipline prefill works; supplied slider query value is absent from the message | `qa/browser-results.json` |
| Home preview | Six selectors and six meaningful single-input synthetic calculations work; no full-model controller loads | Architecture and edge checks |

The automated accessibility result applies to the tested new main content; it is not a complete WCAG conformance certificate or an actual screen-reader session. Edge and Chromium share an engine. Safari/Firefox, physical devices and human screen-reader usability have not been tested here.

## Local mobile Lighthouse measurements

One cold lab run per route using Lighthouse 13.4.1, default mobile settings. The before-home HTML was generated from base commit `679e788` before changes, with its original shared script served for the baseline. Common media and theme fonts are shared. Raw reports and screenshots are in `qa/`.

| Route | Performance | Accessibility | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|
| Home before | 65 | 95 | 14.71 s | 0.0000 | 261 ms |
| Home after | 66 | 95 | 14.74 s | 0.0000 | 231 ms |
| Economics & Trade | 89 | 100 | 3.38 s | 0.0033 | 75 ms |
| Finance & Investment | 88 | 100 | 3.54 s | 0.0035 | 17 ms |
| Market & Enterprise | 91 | 100 | 3.23 s | 0.0035 | 8 ms |
| Development & Impact | 90 | 100 | 3.38 s | 0.0004 | 44 ms |
| Policy & Governance | 92 | 100 | 3.08 s | 0.0039 | 33 ms |
| Management & Delivery | 90 | 100 | 3.38 s | 0.0015 | 24 ms |

The single comparison shows similar homepage LCP/CLS and no observed performance-score regression. The existing homepage's approximately 14.7-second lab LCP is slow; the new model pages' LCP also exceeds a 2.5-second goal in these runs. This implementation does not claim that either meets a good field-LCP threshold. Autoplay timing can change transfer totals, so the different byte counts are not claimed as a saving caused by this feature. One local run cannot establish a statistically reliable performance improvement.

These are local lab measurements, not Vercel-preview measurements, field Core Web Vitals or field INP. Lighthouse TBT is not INP. Hosted checks and deployment behaviour are recorded in the PR separately.

## Numerical verification and remaining analytical limits

Independent expected-value tests cover neutral identities, a tariff/FX/elasticity grid, all eight Finance cases over stress/discount boundaries, conventional IRR known roots and NPV residuals, contribution and break-even boundaries, DiD arithmetic and invalid counterfactuals, neutral/adverse workload and delivery capacity/rounding. The browser asserts that displayed values match those calculations. Edge tests additionally exercise touch interactions and mobile accessibility.

This establishes implementation arithmetic for the specified simplified models. It does not validate the synthetic 60% trade pass-through, administrative time coefficients, hourly time valuation, homogeneous delivery packages, constant investment benefits or inferred causal effects against real observations. No external economist/finance/evaluation peer-review signoff or empirical calibration dataset was supplied. These remain explicitly illustrative labs.

## Claims review

The handoff's proposed evidence sheet is unapproved and notes conflicting assignment dates. No new named-client/result credit from that sheet is published by the integration. Existing Engagements are linked separately. Original named context is retained only in source reference files that the build does not deploy. Primary contracts/TORs, approved CV and publicity wording remain needed before adding those proposed credits.

## Issues found and corrected

- Finance text contrast was too light in portions of the original prototype; scoped colours were darkened and settled views rechecked.
- The prototype's public/private return labels overstated what the annuity establishes; the result labels now state illustrative NPV and project IRR.
- Original Impact chart bounds could hide infeasible percentage counterfactuals; the axis and warning now show them.
- Original Enterprise chart bounds could exclude high demand/adverse endpoints; axes and labels now expand consistently.
- Original Delivery chart stopped at 48 weeks while adverse scenarios exceeded that duration; horizon, labels and target marker now update together.
- New static routes were added to the CMS validator's route registry, and CMS order was updated without changing existing forms.
- Extracted global styles were scoped; original nested page/nav/footer structures were removed while keeping all functional analytical sections.

## Release gates still requiring review

Owner acceptance of the six full experiences and homepage scroll composition; domain review of assumptions and interpretation; approval of any future named engagement credits; a human screen-reader pass; physical-device and broader engine coverage; hosted preview/CI results; final authorised merge and release. No production deployment or owner signoff is claimed by this report.

See `IMPLEMENTATION.md` for architecture and reproduction commands and `DECISION_MAPPING.md` for D01–D18.
