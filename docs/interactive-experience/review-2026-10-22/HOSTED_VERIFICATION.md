# Authenticated hosted verification

Date: 22 October 2026. Gate **IP3-15: Blocked** until authorised hosted interaction is completed. Production deployment, merge, changing protection and exposing credentials remain unauthorised.

## Fresh baseline evidence

- PR #30 baseline head: `addb8ad303032aec3938ed8ac64c34ab6f737e36`; baseline GitHub regression/browser/Lighthouse and preview checks were inspected as successful. This is historical to the final refinements; final PR checks must be read again at the reviewed source commit.
- GitHub deployment `7251854289` reports Preview/success for that SHA and `https://ip3-bd-icap1r7e6-ip-3.vercel.app`. This is deployment metadata, **not authenticated runtime build identity**.
- An unauthenticated request to that deployment's `/explore` returned **302** to `https://vercel.com/sso-api`. The evidence omits redirect query/nonce parameters: [HTTP receipt](FINAL_QA_EVIDENCE/hosted-http.json).
- A correctly targeted read-only Vercel deployment request returned **403 forbidden**, explicitly requiring authorisation for team **ip-3**, ID `team_wuWWa216KA0tf2bVTaFarVGW`. An earlier alias request returned 404; it is not counted as evidence of a missing deployment. The corrected deployment request supplies the access restriction.
- The connector response recommends its team authorisation-link action, but that action is not exposed among this session's available tools. No approved protection-testing credential was configured in the inspected shell environment (name-only check). Credentials, cookies and authentication redirect queries are not recorded.
- No authenticated hosted route, animation, reset, export, numeric result, asset, font or console check is claimed. A successful build or local test is not substituted for it.

## Exact secure action required

The owner/team administrator must authorise the **existing Vercel connection for team ip-3** through its official consent/team access process, with permission to inspect the relevant preview deployment. If a qualified reviewer is to test the UI manually, give that reviewer the normal approved Vercel preview access and have them sign in through Vercel. An officially configured testing credential may be supplied through the approved secret/environment mechanism if the owner explicitly authorises that route; never paste it into reports or source control. Do not disable protection, add an unauthorised bypass, share session cookies in chat or deploy to production to avoid the gate.

## Hosted acceptance script — execute only once access exists

1. Retrieve the current PR head and associated successful deployment. Record exact URL, SHA, team/project and access mechanism, omitting secrets.
2. Read authenticated `/build.json`; require the expected commit/build identity, route count and source/content hashes. Compare model calculation versions and bounds metadata with the tested source. Merely trusting the alias name is insufficient.
3. Navigate `/explore` and each of the six detail routes on desktop and mobile. Confirm one shared shell, no iframe, theme typography, complete hero/diagram/scenario experience, all 12 entry pathways and 64 detailed variants.
4. Replay the 64 reset cases and independent exported-series/graph checks against the authorised deployment using an approved authenticated test context. Check public/private state, Finance case assumptions, negative Year 0, counterfactual extremes, delivery horizon and enterprise N/A.
5. Capture actual JSON/CSV downloads, status messages, file names, units, finite bounds, source provenance and calculation versions. Confirm no model values enter Contact or external persistence.
6. Check keyboard, reduced motion, motion controls, 320-pixel reflow, enlarged text, accessibility and representative assistive-technology tasks. Record browser/device versions and actual results.
7. Observe console/page errors, failed same-origin requests, font/media loading, redirects and cache/build consistency. Keep screenshots and machine-readable results with the exact build identity.
8. Attach evidence to the final issue record; obtain the designated reviewer/owner acceptance. Only then may the hosted gate be considered satisfied. That alone does not close domain or human-accessibility gates.

## Closure evidence and residual risk

Owner: repository/hosting administrator and authorised QA reviewer. Required proof: current authenticated build identity plus completed real route/interaction/asset/numerical/download checks. Residual risk: deployed environment, protection, headers, assets or routing could differ from local behavior. Release implication: **NO-GO while this required gate remains open**. Fresh final PR check receipts are linked from `FINAL_ACCEPTANCE_REVIEW.md` and the evidence index; passing CI does not change this conclusion.
