# Release decision — NO-GO

Date: 22 October 2026. Applies to IP3 Explore / draft PR #30 under the owner's existing acceptance policy. This is a technical audit recommendation, not authority to merge or deploy.

## Decision

**NO-GO for production acceptance.** The implementation is available for informed technical/editorial review, with fresh numerical, browser, export and performance evidence. Scientific acceptance is incomplete. No policy authorises a conditional release that overrides the open critical gate, so **CONDITIONAL GO is not recommended**.

Three required gates remain open:

| Gate | Unmet requirement | Owner | Exact evidence/action needed | Residual risk |
|---|---|---|---|---|
| **IP3-03, P0** | Empirical/intended-use validation and independent qualified specialist acceptance | Site owner and appropriate independent domain specialists | Review the six dossiers; specify permitted use; provide calibration/validation data, uncertainty/identification evidence and recorded reviewer acceptance. No calibration or sign-off may be invented. A learning-only policy change, if proposed, requires explicit owner authority and does not silently close this gate. | Readers may overextend synthetic arithmetic into policy, investment, impact or scheduling claims. |
| **IP3-09, P1** | Required qualified human accessibility acceptance | Accessibility lead and owner | Execute the ready-to-run NVDA/Firefox, VoiceOver/Safari and physical-device tasks; record real versions, behavior, severity and fixes. Accept only after the required human sessions. | Automated success does not establish effective assistive-technology use or full WCAG conformance. |
| **IP3-15, P1** | Authorised hosted runtime/build acceptance | Vercel team administrator and authorised reviewer | Authorise the existing connection/reviewer for team ip-3 and the protected preview. Verify authenticated build identity and complete route/model/download/asset/accessibility journeys. Retain protection. | Deployed routing, assets, identity and interaction remain unverified despite local/CI success. |

Additional unresolved limitation: **IP3-18, P1, Partially Fixed**. Homepage mobile median local LCP improved from 14.74 to 7.60 seconds but remains slow; model mobile LCP is around 3.5 seconds. Continue authenticated deployment/font/CSS/media profiling and obtain representative device/field evidence. No field INP or good field Core Web Vitals is established.

Owner approval of final content, visual presentation and actual experiences is still unrecorded. New named project/client publication rights have not been approved; the implementation avoids asserting those new credits. Existing site Engagements are not retroactively certified by this audit.

## What is technically verified

See `FINAL_ACCEPTANCE_REVIEW.md` and `FINAL_QA_EVIDENCE/README.md` for exact executed counts, browser/engine coverage and current PR receipts. Fixes include numerical metadata integrity, residual claim removal, line-description consistency, controllable hero motion and staged media. Original source receipts/design architecture and all 64 analytical case variants are retained. Fresh tests are implementation evidence, not scientific/owner approval.

## Conditions for a future GO

Close the named gates with actual evidence; resolve any material numeric/privacy/accessibility defect found; complete required build/regression checks on the accepted source/deployed SHA; obtain owner content/visual acceptance and release authorisation. Re-evaluate performance against the owner's intended audience/device criteria. Only a separately authorised release action may then merge or deploy. This task performs neither.
