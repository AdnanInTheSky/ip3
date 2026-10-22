Six original standalone analytical infographics now run as native IP3 website pages. Their 64 public/private scenario variants, editorial heroes, animated sections, controls, calculations and charts are retained inside the existing navigation/footer and theme fonts. No iframe or video replacement is used.

## Current review remediation — 22 October 2026

- Reconciled all 16 supplied findings against current code and authenticated 14 original-source proof receipts.
- Added six decision/evidence guides, full readable chart data, selected-case reset and local versioned JSON/CSV exports. Finance now shows signed flows including Year 0 and every year; conceptual preview geometry stays non-quantitative. Original model experiences and theme fonts retained.
- Current local proof: 105 regression tests; 36 hosting tests; 64-case reset matrix; 18 independent chart/table/download vectors; desktop/mobile Chromium and Edge touch; zero automated axe findings in tested main content. Lighthouse model scores: 88–91 performance, 100 accessibility. Inherited Home LCP remains slow.
- **8 Fixed / 5 Verified / 3 Blocked. This draft is not ready for production acceptance.** Critical empirical/domain gate IP3-03 remains blocked; human screen-reader acceptance (IP3-09) and authenticated hosted proof (IP3-15) are also blocked.
- [Full current audit and before/after evidence](https://github.com/mdsyfulhoque-afk/ip3-bd.org/blob/codex/ip3-interactive-experience/docs/interactive-experience/review-2026-10-22/CURRENT_REVIEW.md)
- [Updated 16-row issue register](https://github.com/mdsyfulhoque-afk/ip3-bd.org/blob/codex/ip3-interactive-experience/docs/interactive-experience/review-2026-10-22/ISSUE_REGISTER_UPDATED.csv)

## Review routes

- `/explore` — 12 entry scenarios
- `/explore/economics-trade`
- `/explore/finance-investment`
- `/explore/market-enterprise`
- `/explore/development-impact`
- `/explore/policy-governance`
- `/explore/management-delivery`

Home adds a lightweight CMS-orderable preview after Why IP3. Approach retains its six-movement film. Existing six Capabilities and eight Sectors get contextual links. The existing contact form accepts an allowlisted discipline prefill without sending simulation values.

## Verification

- `npm ci`, `npm run check`, `npm run verify`: pass; 33 pages and internal links/sitemap verified.
- `npm test`: 102 pass, including independent model arithmetic/architecture tests.
- `npm run test:hostinger`: 36 pass.
- Chromium: all 64 variants at 1440/820/390/320; 48 browser numerical vectors; keyboard, reduced motion, no-JS content and no-iframe/single-shell checks pass.
- Microsoft Edge: touch interactions, mobile widths and automated WCAG checks pass on six pages. Automated new-main-content findings: 0.
- Local mobile Lighthouse: new pages performance 88–92/accessibility 100. Home before/after performance 65/66, LCP 14.71/14.74 seconds, CLS 0/0. Existing slow homepage LCP remains; these are single local lab runs, not field INP or hosted-preview evidence.
- All six reference SHA-256 values match the handoff manifest. Originals remain source-only.

## Corrections and review boundaries

Finance result labels now describe generic illustrative NPV/IRR, with correct Year 0 cash flows and a full annual table. Impact warns about infeasible percentage counterfactuals. Enterprise and Delivery chart domains now expand with adverse inputs. Finance contrast and motion lifecycle were corrected.

Numerical correctness is checked against independently expressed expectations; empirical calibration and external domain signoff have not been supplied. No newly proposed named client/result credit is published. Owner visual/content acceptance, a human screen-reader pass, broader engine/physical-device checks and authorised release remain pending. This draft PR must not be merged as an assertion that those approvals already exist.

## Review documents and actual browser screenshots

- [Implementation and changed-file architecture](https://github.com/mdsyfulhoque-afk/ip3-bd.org/blob/codex/ip3-interactive-experience/docs/interactive-experience/IMPLEMENTATION.md)
- [Measured QA report and remaining gates](https://github.com/mdsyfulhoque-afk/ip3-bd.org/blob/codex/ip3-interactive-experience/docs/interactive-experience/QA_REPORT.md)
- [D01–D18 mapping](https://github.com/mdsyfulhoque-afk/ip3-bd.org/blob/codex/ip3-interactive-experience/docs/interactive-experience/DECISION_MAPPING.md)
- [Before: homepage](https://github.com/mdsyfulhoque-afk/ip3-bd.org/blob/codex/ip3-interactive-experience/docs/interactive-experience/baseline/home.png)
- [After: mobile homepage preview](https://github.com/mdsyfulhoque-afk/ip3-bd.org/blob/codex/ip3-interactive-experience/docs/interactive-experience/qa/homepage-preview-390.png)
- [Economics: desktop hero](https://github.com/mdsyfulhoque-afk/ip3-bd.org/blob/codex/ip3-interactive-experience/docs/interactive-experience/qa/economics-trade-1440-hero.png)
- [Finance: desktop analytical section](https://github.com/mdsyfulhoque-afk/ip3-bd.org/blob/codex/ip3-interactive-experience/docs/interactive-experience/qa/finance-investment-1440-lab.png)
- [Delivery: mobile hero](https://github.com/mdsyfulhoque-afk/ip3-bd.org/blob/codex/ip3-interactive-experience/docs/interactive-experience/qa/management-delivery-390-hero.png)

The QA directory also contains four actual browser captures per model, raw Lighthouse/axe results and machine-readable test summaries. CI includes a dedicated browser job and extends Lighthouse coverage to the new routes.

Rollback: revert this feature PR. No production merge or deployment is requested by creating the draft.
