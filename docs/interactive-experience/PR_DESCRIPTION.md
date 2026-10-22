# IP3 Explore — final scientific/technical acceptance refinement

## Latest mobile follow-up — 23 October 2026

- **123 regression / 36 hosting tests pass.** All six native experiences, 64 variants, original media, theme fonts and controls are retained.
- Matched mobile/gzip comparison, 20 unique accepted runs: Home median LCP **5.453 → 4.636 s**, TBT **300 → 208 ms**, performance **73 → 78**. Six model LCP values **1.89–1.90 → 1.57–1.59 s**. Home FCP is slower (**1.590 → 2.099 s**); IP3-18 remains **Partially Fixed**.
- Deliver route-relevant CSS, omit unused native-page vendors, optimize Home font/script scheduling, defer Home reveals near view and compress local text responses. Preserve original Explore font delivery after rejecting measured regressions.
- Restore the single existing Pause control on compact screens (IP3-22) and fix mobile CTA/tab overlap with responsive flow (IP3-23). Paired screenshots, enlarged text, six breakpoints, 22 scroll checks, 12 hero checks, font fallback and glyph proofs are retained.
- Browser CI pins the previously successful Ubuntu 24.04 image after a dependency-install stall; no tests or thresholds are removed.
- [Full mobile report and evidence](https://github.com/mdsyfulhoque-afk/ip3-bd.org/blob/codex/ip3-interactive-experience/docs/interactive-experience/mobile-performance-2026-10-22/MOBILE_PERFORMANCE_REVIEW.md).

**Production remains NO-GO.** Scientific, human-accessibility and authorised hosted-runtime gates remain open. The earlier acceptance history follows; its original counts/measurements are historical.

## Verdict: NO-GO for production

This draft preserves the existing Node static-site architecture, six complete native model experiences, 64 detailed case variants, 12 entry pathways, approved heroes/diagrams, theme fonts and shared shell. No merge, production deployment or protection changes are authorised.

The final reassessment supersedes the earlier reported counts. It reconciles **21 issues: 8 Fixed / 9 Verified / 3 Blocked / 1 Partially Fixed**. Critical IP3-03 remains open; automated arithmetic is not empirical calibration or external domain approval.

## Targeted corrections

- Fix server-side min/max/step serialization (undefined Linkedom properties previously produced NaN/null). Share readable labels; require metadata to match browser controls before endpoint testing.
- Remove residual unapproved Enterprise fieldwork counts/credit and Delivery professional-engagement wording through the authoritative importer. Preserve original references.
- Correct Impact's dotted-counterfactual footnote; supply verified author-year method context for all six models.
- Stage hero media, retain a pixel-identical lossless poster and add explicit keyboard pause/focus/reduced-motion handling. No film/animation replaced by evidence screenshots.
- Move Lighthouse warning rules to supported ci.assert.assertions without lowering thresholds. Add Gecko and final hero/scientific checks; isolate CI artifacts.

## Fresh local proof

- **115 regression / 36 hosting tests pass**; build, CMS and 33-page link/metadata checks pass (seven inherited warnings remain).
- Full Chromium: 64 variants at four widths and 48 displayed-value vectors, no failures.
- Chromium **and Firefox/Gecko**: each 64 selected-case resets + 18 true default/min/max complete series/table/graph/download vectors, finite metadata contracts and zero tested axe findings.
- Microsoft Edge touch emulation at 390/320; 46 independently expressed worked scientific vectors; 12 new hero/privacy/no-JS checks pass.
- **60 Lighthouse reports** retained: controlled baseline and two targeted iterations, repeated Home mobile/desktop measurements, separate hub/model results.
- Home median LCP: **mobile 14.74 → 7.60s; desktop 2.57 → 1.46s**. Mobile remains slow; no field CWV/INP pass or statistical significance claim.

Earlier endpoint proofs were insufficient for invalid metadata; this is explicitly documented, not relabelled as prior success. Resolved harness assumptions and actual before/after captures are preserved.

## Open gates

- **IP3-03 P0:** intended-use empirical evidence and qualified independent model sign-off unavailable.
- **IP3-09 P1:** human NVDA/Firefox, VoiceOver/Safari and physical-device acceptance unavailable; executable scripts prepared.
- **IP3-15 P1:** protected hosted acceptance unavailable (team ip-3 API scope 403; anonymous SSO redirect). No local/CI substitution or weakening of protection.
- **IP3-18 P1 Partially Fixed:** remaining mobile LCP and authenticated/field performance work.
- Final owner content/visual acceptance and release authorisation remain required.

## Review deliverables

All in [review-2026-10-22](https://github.com/mdsyfulhoque-afk/ip3-bd.org/tree/codex/ip3-interactive-experience/docs/interactive-experience/review-2026-10-22):

- FINAL_ACCEPTANCE_REVIEW.md
- ISSUE_REGISTER_FINAL.csv
- SCIENTIFIC_MODEL_REVIEW.md (six individual dossiers)
- EDITORIAL_AND_GRAPH_REVIEW.md
- ACCESSIBILITY_ACCEPTANCE.md
- HOSTED_VERIFICATION.md
- PERFORMANCE_REVIEW.md
- FINAL_QA_EVIDENCE/ (index, hashed receipts, logs, exported files and before/after screenshots; full Lighthouse JSON archived without byte changes)
- RELEASE_DECISION.md

Technically available for review; scientific acceptance incomplete; production release not authorised. Revert this feature PR for rollback. Existing source/evidence history is preserved.
