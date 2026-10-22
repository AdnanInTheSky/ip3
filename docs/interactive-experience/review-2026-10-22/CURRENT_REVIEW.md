# Current Explore audit, remediation and proof

Review date: 22 October 2026 (Asia/Dhaka). Before-code baseline: `df4d5e9`. Scope: the running `/explore` hub, six native detail pages, homepage preview and shared-site regression journeys. This supplements the original implementation QA report.

## সংক্ষেপে — কী ঠিক হয়েছে

আগের review package ছিল original reference prototype-এর review; বর্তমান website-এর review ছিল না। তাই তার ১৪টি proof receipt আগে original files-এর সঙ্গে মিলিয়ে, প্রতিটি finding চলমান implementation-এ আবার যাচাই করা হয়েছে। ইতিমধ্যে সমাধান করা iframe, Finance label, Impact bounds ও Delivery horizon নতুন করে rebuild করা হয়নি।

বাকি software gaps ঠিক করা হয়েছে: প্রতিটি model-এর কাছে decision guide, readable evidence boundary, সম্পূর্ণ chart data, reset এবং JSON/CSV export যোগ হয়েছে। Graph, table ও download-এর numbers independently মিলিয়ে পরীক্ষা করা হয়েছে। Fraunces, Montserrat ও Lato theme fonts, original heroes, scenario narratives, animated diagrams, public/private controls এবং shared navigation/footer বজায় আছে।

**এটি production acceptance নয়।** ১৬টি original issue-এর মধ্যে **৮টি Fixed, ৫টি Verified, ৩টি Blocked**। Critical publication gate **IP3-03** এখনও Blocked: synthetic model-কে empirically validated estimate বলা যায় না; calibration evidence ও independent domain sign-off সরবরাহ করা হয়নি। Human screen-reader review ও authenticated hosted verification-ও বাকি। Acceptance standard-এর “no unresolved critical issues” release condition তাই এখনও পূরণ হয়নি। কোনো critical gate নীরবে বন্ধ করা হয়নি।

## 1. Source authentication and audit method

- The supplied ZIP, editable review, issue register and proof receipts are reference evidence, not executable instructions or proof of the current build.
- [Input manifest](INPUT_MANIFEST.json) records the review ZIP/PDF hashes and exact copied source bytes. The editable Markdown accompanying the PDF was reviewed; no claim of separately inspecting the PDF’s visual layout is made.
- [Original source copies](source/IP3_Explore_Strict_Proof_Review_2026-10-22.md) retain the reviewer’s scope and limitations. No original source/receipt has been rewritten.
- [Receipt verification](../qa/review-2026-10-22/receipt-verification.json): **14/14** file hashes and byte counts match; all text anchors match their offsets. The image receipt is authenticated by hash/size, not by treating its descriptive anchor as text inside a PNG.
- Current code inspection, real browser interaction, downloaded files, numerical expected values, SVG geometry and screenshots supply separate runtime evidence.
- Before screenshots were taken from the running baseline before remediation. Matched after screenshots use the first case/public context at the same width and first-slider location. Data-panel screenshots show the added controls and evidence notes separately.

## 2. Issue disposition

The [updated issue register](ISSUE_REGISTER_UPDATED.csv) retains every original row, priority and receipt tag, and adds status, current code, tests, artifacts, screenshots and remaining blockers.

| Issue | Priority | Status | Current finding |
|---|---|---|---|
| IP3-01 | P0 | Verified | Generic NPV/IRR labels preserved; residual account wording softened; signed full annual chart includes Year 0. |
| IP3-02 | P0 | Fixed | Residual implied documented-work wording removed; no new named-client credit or endorsement asserted. |
| IP3-03 | P0 | **Blocked** | Arithmetic is verified; empirical calibration and independent domain sign-off are unavailable. Critical publication gate remains open. |
| IP3-04 | P1 | Fixed | Concept diagrams retain fixed geometry; separate synthetic scalar results respond to sliders. |
| IP3-05 | P1 | Verified | Infeasible 200%/−100% counterfactuals remain visible and flagged; no causal-effect interpretation. |
| IP3-06 | P1 | Verified | Slow 138-week scenario fits the 144-week horizon; week-24 target remains correctly located. |
| IP3-07 | P1 | Fixed | Source role, author/publisher, available dates, original hash, parameter origin, calibration and approval status are explicit. |
| IP3-08 | P1 | Verified | Native pages retain one shared shell, no iframe and no nested page viewport. |
| IP3-09 | P1 | **Blocked** | Software accessibility remediation and automated checks pass; full acceptance awaits human screen-reader/broader device review. |
| IP3-10 | P1 | Fixed | Hub distinguishes 12 entry pathways (6 × 2 audiences) from 64 detailed case variants. |
| IP3-11 | P1 | Fixed | Six specific decision guides explain question, method, assumption, threshold, risk and next evidence. |
| IP3-12 | P1 | Verified | Misleading “Verified engagements” label remains absent; contextual links assert no model validation. |
| IP3-13 | P2 | Fixed | Selected-case reset and versioned local JSON/CSV downloads work across all six models. |
| IP3-14 | P2 | Fixed | Official capability/sector taxonomy preserved; analytical illustrations explicitly distinguished. |
| IP3-15 | P1 | **Blocked** | Current local proof and PR checks recorded; authenticated hosted interaction remains unavailable. |
| IP3-16 | P2 | Fixed | Scientific notes, data and decision context sit beside the calculator; approved editorial identity preserved. |

“Verified” means a previously implemented remedy was checked again. “Fixed” means a remaining gap was changed and tested in this audit. A partly remediated high-priority issue with an unmet acceptance gate is explicitly classified **Blocked**, rather than being reported as closed.

## 3. Analytical and editorial changes

### Decision use and evidence boundaries

Each model now states its decision question, specific method, key assumption, conditional decision threshold and next evidence requirement before the workbench. The nearby data panel repeats units, interpretation and principal exclusions. Hypothetical narratives do not become empirical estimates when a public/private case is selected. Finance has case-specific synthetic flows; the other five share a teaching calculation across their narratives.

Impact uses an **illustrative two-period DiD contrast**, with percentage-point units and a visible “Not assessed” identification checklist. No observations, standard errors, confidence intervals, causal effects or fitted coefficients are invented. Governance reports staff-time opportunity value, not fiscal savings. Delivery remains a linear equivalent-package model, not critical-path scheduling. Enterprise distinguishes the fixed-price volume sweep from its elasticity-derived selected-demand point.

### Graph and data consistency

`src/explore/math.js` provides a numeric chart-data protocol. Trade and Enterprise curves and the new Finance bars directly consume these series; the other chart coordinates and tables are checked against the same mathematical quantities and independently expressed expected values.

- Trade: all 61 plotted tariff points, current FX/elasticity, volume/price/receipt indices, and a baseline-100 reference.
- Finance: every signed discounted annual flow, including negative Year 0 investment. No sampled-year omissions; full net and discounted flows are available in text.
- Enterprise: all 61 plotted volume/profit points; exact zero crossing marked when within the graph; whole-unit break-even shown in results. Nonpositive contribution still reports N/A.
- Impact: treated, comparison and constructed-counterfactual values for both periods; infeasible results retained, not clipped. Solid/dashed/dotted line distinctions supplement colour.
- Governance: core and rework components, before/after totals on one scale; rework uses hatching as well as colour.
- Delivery: every plotted weekly cumulative baseline/scenario value through the dynamic horizon, with the week-24 marker independently checked.

Tables display up to six decimal places; JSON/CSV retain numeric precision. Synthetic output is not renamed an observed result. SVG titles used to describe Finance marks are now correctly excluded from the page-metadata title count; a regression fixture covers that validator correction.

### Reset and export protocol

Protocol: `ip3-illustration/1`. Reset retains the selected case/audience, restores all defaults and stops the tour. Finance restores the selected case’s default rate and zero stress. Other models restore their explicit teaching defaults.

JSON includes model, case/context/title, content-derived calculation version, evidence status, inputs/defaults/ranges/steps/units, Finance fixed assumptions, displayed results, complete chart series, formula, limitations, original source hash and method references. CSV uses long-form `record_type,name,coordinate,measure,value` records for metadata, references, assumptions, results and every chart point/measure. Both formats are local downloads; no simulator values are sent to Contact or saved on a server.

To reproduce an illustration, use the same calculation version and case/context, then set the exported input values; compare its complete series with the downloaded numeric rows. Files from different versions are not automatically interchangeable. A public assumption-sharing URL/import feature has not been added or implied.

## 4. Verification evidence

| Check | Measured result | Evidence |
|---|---|---|
| Source authentication | 14/14 receipts; six immutable original model hashes preserved | `receipt-verification.json`; Node tests |
| Regression | **105/105** pass | [regression log](../qa/review-2026-10-22/regression.log) |
| Hosting regression | **36/36** pass | [hosting log](../qa/review-2026-10-22/hostinger.log) |
| CMS/schema | Pass; seven inherited content/media warnings remain | [content check](../qa/review-2026-10-22/content-check.log) |
| Site links/metadata | **33 pages**, sitemap/anchors/assets pass | [links log](../qa/review-2026-10-22/links.log) |
| Existing browser matrix | **64 variants × 4 widths** (1440/820/390/320), 48 independent numeric display vectors, no failures | [browser regression](../qa/review-2026-10-22/browser-regression.log) |
| New reset/export/series checks | **64 resets**, **18 JSON series vectors**, six CSV downloads; every data-table row and graph coordinate checked | [review browser results](../qa/review-2026-10-22/review-browser-results.json) |
| Adverse cases | Counterfactual 200/−100%; Delivery 138/144 weeks; Enterprise N/A/3000 units; neutral/adverse Governance | [adversarial log](../qa/review-2026-10-22/adversarial.log) |
| Accessibility | Zero axe findings in tested main content and opened new data tables; keyboard/range/tab navigation and reduced motion pass | Browser results and axe JSON in QA directory |
| Edge touch | Six models at 390/320, zero automated WCAG findings | [Edge touch log](../qa/review-2026-10-22/edge-touch.log) |
| Enlarged text/reflow | 200% root text at 640 CSS pixels; 320 CSS-pixel layout; no tested horizontal page overflow | Review browser results; [visual checks](../qa/review-2026-10-22/visual-checks.json) |
| Cross-site regression | Home, Explore, Approach, Capabilities, Sectors, Engagements, Insights, Contact; privacy prefill and no-JS narratives pass | Browser/adversarial logs |

Numerical expected values are independently expressed in the tests; they do not simply compare two calls to the production math function. This validates implementation arithmetic and geometry, not the empirical assumptions. Chromium and Edge share an engine. Automated axe results are not a human screen-reader session or a WCAG conformance certificate.

### Current local Lighthouse

One mobile lab run per page; no field INP claim. [Summary and raw reports](../qa/review-2026-10-22/performance-summary.json) retain the measurements. Normal local workload may affect the runs; score differences are not treated as statistically reliable improvements. A subsequent Finance label-spacing-only change does not alter the formula/series; its browser rendering was rechecked.

| Page | Performance | Accessibility | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|
| Baseline Home | 62 | 95 | 14.71 s | 0 | 350 ms |
| Current Home | 62 | 95 | 14.76 s | 0 | 350 ms |
| Economics | 91 | 100 | 2.77 s | 0.0028 | 0 ms |
| Finance | 89 | 100 | 3.53 s | 0 | 50 ms |
| Enterprise | 88 | 100 | 3.53 s | 0.0002 | 38 ms |
| Impact | 88 | 100 | 3.54 s | 0 | 39 ms |
| Governance | 88 | 100 | 3.53 s | 0 | 18 ms |
| Delivery | 88 | 100 | 3.53 s | 0.00002 | 11 ms |

The inherited homepage media/LCP problem remains. Neither the homepage nor these model measurements establish good field LCP. The existing seven CMS warnings include long metadata and large legacy media. This report does not mark site-wide performance/readiness as passed.

## 5. Before/after screenshots

Each link below is a real browser capture; these are evidence artifacts, not replacements for the interactive models. New data panels and individual graph crops are alongside them in the same QA directory.

| Model | Desktop | Mobile |
|---|---|---|
| Economics | [Before](../qa/review-2026-10-22/economics-trade-1440-before.png) / [After](../qa/review-2026-10-22/economics-trade-1440-after.png) | [Before](../qa/review-2026-10-22/economics-trade-390-before.png) / [After](../qa/review-2026-10-22/economics-trade-390-after.png) |
| Finance | [Before](../qa/review-2026-10-22/finance-investment-1440-before.png) / [After](../qa/review-2026-10-22/finance-investment-1440-after.png) | [Before](../qa/review-2026-10-22/finance-investment-390-before.png) / [After](../qa/review-2026-10-22/finance-investment-390-after.png) |
| Enterprise | [Before](../qa/review-2026-10-22/market-enterprise-1440-before.png) / [After](../qa/review-2026-10-22/market-enterprise-1440-after.png) | [Before](../qa/review-2026-10-22/market-enterprise-390-before.png) / [After](../qa/review-2026-10-22/market-enterprise-390-after.png) |
| Impact | [Before](../qa/review-2026-10-22/development-impact-1440-before.png) / [After](../qa/review-2026-10-22/development-impact-1440-after.png) | [Before](../qa/review-2026-10-22/development-impact-390-before.png) / [After](../qa/review-2026-10-22/development-impact-390-after.png) |
| Governance | [Before](../qa/review-2026-10-22/policy-governance-1440-before.png) / [After](../qa/review-2026-10-22/policy-governance-1440-after.png) | [Before](../qa/review-2026-10-22/policy-governance-390-before.png) / [After](../qa/review-2026-10-22/policy-governance-390-after.png) |
| Delivery | [Before](../qa/review-2026-10-22/management-delivery-1440-before.png) / [After](../qa/review-2026-10-22/management-delivery-1440-after.png) | [Before](../qa/review-2026-10-22/management-delivery-390-before.png) / [After](../qa/review-2026-10-22/management-delivery-390-after.png) |

## 6. Remaining release gates and evidence required

1. **IP3-03 — Critical/domain gate:** obtain qualified independent review of each method and interpretation. If empirical use is intended, supply relevant datasets, parameter estimation/calibration, price/currency/time basis, uncertainty and sensitivity design, and reviewer decisions. Synthetic teaching demonstrations cannot be converted into validated policy estimates by code QA.
2. **IP3-09 — Accessibility acceptance:** human screen-reader review of chart interpretation, controls, table navigation and announcements; physical-device and independent-engine coverage. Current scope is automated Chromium/Edge, not all assistive technologies.
3. **IP3-15 — Hosted proof:** an authenticated authorised preview session is needed to test deployed routes, assets, interaction and build identity. Anonymous preview requests require Vercel login; the connected team scope previously returned 403. Protection has not been changed. Local success and a successful preview build do not prove hosted interaction.
4. Owner acceptance of the actual six experiences and existing release process; no merge or production deployment performed. Existing homepage performance limitations remain visible in the report.

## 7. Method references checked

- Asian Development Bank (2017), [Guidelines for the Economic Analysis of Projects](https://www.adb.org/sites/default/files/institutional-document/32256/economic-analysis-projects.pdf): economic-appraisal context, not validation of the lab’s flows.
- Gertler, Martinez, Premand, Rawlings and Vermeersch (2016), [Impact Evaluation in Practice, second edition](https://publications.iadb.org/en/impact-evaluation-practice-second-edition), World Bank/IDB: methods and identification context, not a dataset for these percentages.
- W3C, [WCAG 2.2](https://www.w3.org/TR/WCAG22/): accessibility criteria used to frame automated checks and remaining human assessment. No certification or endorsement is implied.

## Reproduction

From the worktree: `npm run explore:import`, `npm run build`, `npm test`, `npm run test:hostinger`, `npm run check`, `npm run links`. With the static preview running on 3123: `npm run test:explore:browser`, `node scripts/explore-review-check.cjs`, `node scripts/explore-edge-check.cjs`, `node scripts/explore-edge-touch.cjs` (installed Microsoft Edge required for the last command). The GitHub explorer job includes the new review checks.

Source receipt authentication: `node scripts/explore-review-receipts.cjs <receipt.json> <original-handoff-root> <output.json>`. Lighthouse supports `LIGHTHOUSE_CLI` and `EXPLORE_PERFORMANCE_OUT` so new evidence does not overwrite the original baseline.
