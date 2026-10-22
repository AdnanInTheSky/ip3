# Final acceptance review — IP3 Explore

Date: 22 October 2026 (Asia/Dhaka). Repository: `mdsyfulhoque-afk/ip3-bd.org`; branch `codex/ip3-interactive-experience`; [draft PR #30](https://github.com/mdsyfulhoque-afk/ip3-bd.org/pull/30). Original review reference: `df4d5e9`; actual clean baseline for this reassessment: `addb8ad303032aec3938ed8ac64c34ab6f737e36`.

## A. Overall verdict — NO-GO

**Technical refinement and available verification are complete for review. Production acceptance is not complete.** Required domain/empirical acceptance (IP3-03), human accessibility acceptance (IP3-09) and authenticated hosted verification (IP3-15) remain Blocked. Homepage mobile performance is improved but Partially Fixed (IP3-18). No authorised policy permits overriding these gates.

বাংলায়: আগের report-কে চূড়ান্ত প্রমাণ ধরে নেওয়া হয়নি। Fresh audit-এ export-এর invalid bounds এবং কিছু residual unapproved claim পাওয়া গেছে ও ঠিক করা হয়েছে। Website-এর original design, theme fonts, diagrams, controls ও ৬৪টি analytical case রাখা হয়েছে। Testing ভালো ফল দিলেও synthetic model-কে বাস্তব data দিয়ে validated estimate বলা যাবে না। তাই **production release-এর সিদ্ধান্ত NO-GO**।

The [final register](ISSUE_REGISTER_FINAL.csv) retains all 16 original issues and adds five findings: **21 total — 8 Fixed, 9 Verified, 3 Blocked, 1 Partially Fixed**. IP3-02 and IP3-13 have explicit Reopened → Fixed history rather than being assumed closed from the earlier review.

## B. Changes implemented

| Finding | Authoritative source / function | Behavior and proof |
|---|---|---|
| Invalid input bounds/default metadata | `src/explore/index.js:model`; new `input-labels.js`; `src/explore/model.js` | Read real min/max/step attributes, reject invalid contracts, share readable labels and include inputs in content-derived calculation version. No-JS defaults and JSON/CSV no longer expose NaN/null bounds. Both browser engines assert exact agreement with controls before endpoint tests. |
| Residual unapproved credits/counts | `scripts/import-explore.cjs`; regenerated Enterprise/Delivery controllers/data | Replace the 400/120/8 fieldwork panel and related method strings with qualitative research steps; remove implied documented professional engagement. Original reference bytes remain immutable. |
| Misdescribed Impact line | Importer → `development-impact.html` | Dotted constructed counterfactual wording now agrees with the current graph; dashed comparison remains distinct. |
| Verified methods context | `src/explore/guidance.js`; `index.js:model` | Six model-specific author–year primary references, rendered from structured metadata. Method reference ≠ parameter calibration or endorsement. |
| Homepage media/reader control | `src/pages-home.js:hero`; `src/js/site.js:initHero`; scoped `src/css/site.css` | Poster-first source staging, late warming, explicit pause/resume, focus hold, visibility and reduced motion. All configured visible hero slides retained. No animation/film replaced with static evidence. |
| Image delivery | `content/home/hero.json`; lossless WebP asset | Same 1366×768 pixels; file 1,360,481 → 955,076 bytes. Original PNG retained. |
| Verification integrity | `lighthouserc.json`; browser workflow and test scripts | Supported `ci.assert.assertions` placement with unchanged warning thresholds; isolated evidence directories; Chromium and Firefox checks; final hero/scientific proofs added to CI. |

Fraunces, Montserrat and Lato, approved colours/layouts/heroes, original conceptual and analytical diagrams, public/private narratives, all 64 detailed variants and 12 entry pathways, native routes/shared shell, official taxonomies and local-only exports are preserved. No architecture migration or unapproved redesign was introduced.

## C. Scientific assessment

All six models remain **Illustrative Learning Models**, not **Empirically Calibrated Decision Models**. Their equations, units, permitted inputs, default/boundary/adverse behavior, graph/data/download agreement and misuse risks are reviewed in [six individual dossiers](SCIENTIFIC_MODEL_REVIEW.md).

- Trade: normalized comparative statics with assumed pass-through/elasticity; no estimated market/welfare response.
- Finance: generic synthetic discounted flows and conventional-stream IRR; no validated economic/financial account or financing conclusion.
- Enterprise: stylised demand and fixed-price volume sweep, exact/rounded break-even distinctions; no real sales forecast.
- Impact: two-period arithmetic contrast and constructed counterfactual; no identified causal effect, observations or confidence interval.
- Governance: synthetic staff-time workload and opportunity value; no fiscal saving or documented institutional outcome.
- Delivery: linear equivalent-package throughput; no critical path, real dependency network or completion probability.

The 46 worked vectors independently express expected equations. Browser proofs separately test actual data/geometry/downloads. Neither is empirical calibration or external human review. A learning-only publication route may be proposed to the owner, but changing labels or policy wording does not silently satisfy the existing P0 gate.

## D. Content and visualization

[Editorial and graph review](EDITORIAL_AND_GRAPH_REVIEW.md) covers the hub, each detail page and homepage. Specific assumptions, thresholds, caveats and next evidence remain near controls. Counterfactual, signed cash-flow, contribution, workload and horizon interpretations remain explicit. Readable labels/defaults and corrected line wording strengthen scientific presentation. No institutional prestige claim substitutes for data or professional acceptance.

Actual matched before/after captures are indexed in the evidence README. Every source change is tied to a finding; generated model files are regenerated through the importer. New named client/project credits are not approved or asserted. Existing site Engagements are not retroactively certified by this audit.

## E. Fresh verification

| Check | Actual result / scope |
|---|---|
| Before-change repository regression / hosting | 105/105 and 36/36 passed again; historical reports were not assumed current. |
| Final regression | **115/115 passed**, including scientific sign/threshold identities, correct metadata, claim exclusion, homepage media structure and LHCI configuration. |
| Final hosting regression | **36/36 passed**. |
| Build, CMS/content and site links | Build 33 pages; content/schema check and 33-page link/metadata/anchor verification pass. Seven existing metadata/media warnings remain, explicitly recorded. |
| Full Chromium scenario matrix | 64 case variants at 1440/820/390/320 widths; 48 independent displayed-value vectors; no failures. |
| Chromium model proof | 64 selected-case resets; 18 true default/min/max exported-series/table/graph vectors; six CSV downloads; opened-table axe, keyboard, enlarged text and reflow pass. |
| Firefox / Gecko model proof | Same 64 resets, 18 vectors and download/data/axe/reflow proof pass independently of Chromium. |
| Microsoft Edge touch emulation | Six models at 390/320; zero automated findings in tested main content. No physical device is claimed. |
| Worked scientific proof | 46 independently expressed vectors pass across six methods. |
| New homepage/privacy/no-JS proof | 12 recorded checks pass: retained visible selections, actual deferred playback, >8-second pause, resume/automatic advancement, reduced motion, finite no-JS bounds and no model-input POST/persistence. |
| Performance | 60 retained Lighthouse reports: three Home mobile/desktop runs and one per hub/model/form factor in baseline, first iteration and final iteration. |

Actual local browser versions: Chromium **156.0.8078.4**, Firefox **157.0**; Node **24.16.0**, Windows. Detailed environment/scope is recorded in the evidence directory. Passing automated axe is not WCAG certification or a human screen-reader session.

### Honest correction of earlier evidence

The previous min/max export protocol contained null bounds; an old “max” proof could therefore exercise fallback values. It is not accepted as former full endpoint coverage. Fresh contracts require finite metadata matching the real DOM, followed by genuine endpoint vectors in both engines. During this final audit, two additional harness assumptions failed and were corrected without changing the product to fit them: six CMS records did not mean six visible homepage slides (five are configured visible), and hover/focus intentionally pauses auto-advance. Those initial failed receipts and explanations are preserved, and the final runs pass.

### Performance results and limits

Local Home median LCP: **mobile 14.74 → 7.60 seconds**, **desktop 2.57 → 1.46 seconds** (three runs each). Mobile remains slow; no good field LCP/INP is established. The six model mobile runs remain around 3.5 seconds. The [performance review](PERFORMANCE_REVIEW.md) includes ranges, CLS/TBT, all route comparisons, raw diagnostic evidence, remaining font/CSS/media work and repeatable commands. Do not turn small score differences or one model run into a significance claim. Deferment is not total payload removal.

## F. Remaining blockers and next actions

1. **IP3-03 — owner + qualified independent domain specialists:** provide intended-use calibration/validation and uncertainty/identification evidence; accept each model through recorded review. Six dossiers are ready. No dataset or sign-off was fabricated.
2. **IP3-09 — accessibility lead + proficient human testers:** execute [NVDA/Firefox, VoiceOver/Safari and physical-device script](ACCESSIBILITY_ACCEPTANCE.md), record actual versions/outcomes and resolve findings. Firefox automation does not close human acceptance.
3. **IP3-15 — hosting administrator + authorised QA reviewer:** authorise the existing connection/reviewer for Vercel team ip-3/protected preview; verify exact authenticated build identity and full journeys. Current read-only API returns scope 403; anonymous runtime redirects to SSO. See [secure action and script](HOSTED_VERIFICATION.md).
4. **IP3-18 — performance engineer + owner:** continue authenticated deployment/font/CSS/media profiling; preserve approved visual identity and remeasure on intended devices. Meaningful design trade-offs require owner approval.

Final owner visual/content acceptance is unrecorded. These are closure requirements from the supplied master prompt and existing policy, not invented approvals.

## G. Deliverables and traceability

- [Final issue register](ISSUE_REGISTER_FINAL.csv)
- [Scientific model dossiers](SCIENTIFIC_MODEL_REVIEW.md)
- [Editorial and graph review](EDITORIAL_AND_GRAPH_REVIEW.md)
- [Accessibility acceptance / pending human script](ACCESSIBILITY_ACCEPTANCE.md)
- [Hosted verification / precise restriction](HOSTED_VERIFICATION.md)
- [Performance diagnosis and repeated comparison](PERFORMANCE_REVIEW.md)
- [Final evidence index, logs and screenshots](FINAL_QA_EVIDENCE/README.md)
- [Release decision](RELEASE_DECISION.md)

Original review sources, receipts and original-model SHA records remain unchanged. New compressed Lighthouse reports preserve complete original JSON bytes; the archive manifest carries hashes and verified round trips. Source/runtime/evidence manifests distinguish local tested bytes, baseline SHA and final PR identity. GitHub check links/receipts identify the actual source commit; they are not treated as authenticated hosted acceptance.

## H. PR #30 readiness

**Ready for technical/editorial review, subject to its current recorded CI results. Scientific acceptance: incomplete. Production release: not authorised and not recommended.** The PR remains a draft; no merge, production deployment or weakening of protection is performed. See [release decision](RELEASE_DECISION.md) for exact conditions for a future GO.
