# IP3 interactive experience — implementation review

Date: 22 October 2026. Base: `origin/main` at `679e788`. Branch: `codex/ip3-interactive-experience`.

## Delivered experience

The existing CommonJS/Node 24 generator now renders `/explore` and six permanent `/explore/<discipline>` routes. Each model is native DOM in the shared IP3 shell, with the original editorial hero, diagrams, scenario selector, public/private applications, controls and charts. There are no iframes, copied brand headers, replacement logo assets, video substitutes or nested page scroll containers. Horizontal scenario tabs remain available on narrow screens.

Full scenario variants preserved: Economics 10; Finance 8; Market 10; Impact 12; Governance 12; Delivery 12. These 64 variants are separate from the hub's canonical 12 entry scenarios.

`src/explore/reference/` contains byte-preserved originals and is excluded from the generated public output. `reference-manifest.json` records SHA-256 provenance. `.gitattributes` disables newline conversion for those reference files. `npm run explore:import` deterministically extracts the native HTML, scoped CSS, controller and scenario records. The original global CSS declarations are scoped to `.ip3-model`, animation names are isolated, and the original font aliases resolve to the website's Fraunces, Montserrat and Lato. An external framework is not introduced.

The generator renders the initial controller state using a local DOM implementation, so default charts/results and all scenario transcripts are present in HTML. Browser scripts attach the original interactions afterward. JavaScript is needed for recalculation; the page makes that requirement clear. Each route loads only its own controller and CSS plus a small shared math/accessibility layer. Content-hashed query strings prevent stale scripts under the existing asset cache headers.

## Integration with the existing website

- Home has one lightweight six-discipline preview after Why IP3 and before Sectors in the saved order. One control per selected discipline calculates a synthetic preview with explicit fixed assumptions; a second link opens the 12-scenario hub. It loads no full model controller or video.
- `Thinking in action` is a supported CMS section-order choice. The current order and generated `.pages.yml` are updated together. Existing authoring forms remain unchanged; the contract test explicitly isolates the new order option.
- The original six-movement Approach film remains. Added links connect its methodology with relevant analytical examples.
- The six official Capabilities and eight Sectors retain their names, content and routes. Contextual links supplement those pages. Existing Engagements receive links to analytical methods; no proposed client result is added.
- The footer includes Interactive Explorer. The established desktop navigation stays usable without adding another crowded item.
- Contact accepts an allowlisted discipline slug, prefills the existing focus/message fields and reuses the current contact infrastructure. It sends no slider values and adds no tracking or new backend.
- Model pages use native page scrolling and avoid stacking Lenis/global section reveals over their own interactions. Existing shared navigation and contact behaviour are retained.

## Mathematical and interpretation corrections

`src/explore/math.js` is used by the full browser models and the Node numerical tests. Independent expected values in the tests are derived separately through identities, closed-form annuity calculations, known roots, boundary conditions and grid evaluations. This is numerical implementation verification; it is not external peer review or empirical calibration.

- Trade: neutral indices, elasticity, FX sign and receipt identities are checked. The 60% pass-through assumption remains explicitly synthetic.
- Finance: Year 0 is included; all eight cash-flow cases are tested against annuity calculations. Conventional IRR is bracketed and checked by its NPV residual. Nonconventional/no-positive-return flows return unavailable rather than an arbitrary root. Generic illustrative NPV/IRR replace labels that conflated the simple annuity with independently calibrated ENPV/FNPV or EIRR/FIRR. A full annual table includes Year 0.
- Enterprise: fixed/variable costs and nonpositive contribution are checked. Break-even is unavailable when contribution is nonpositive. Both chart axes accommodate adverse inputs and demand above the original 2,500-unit horizon.
- Impact: units are percentage points. The chart expands to display counterfactual values outside 0–100 and provides a warning; it does not silently clip them or imply identified causality.
- Governance: the neutral baseline releases zero hours; high rework can produce negative released hours. BDT staff-time opportunity value is explicitly not budget saving.
- Delivery: capacity and ceiling-to-whole-week calculations are checked. A 138-week adverse scenario is shown on a 144-week chart, and the 24-week target marker and axis labels move consistently.

## Evidence and publication boundary

The supplied engagement reference sheet is a draft, and its notes identify unresolved dates and missing publication-credit approval. Newly proposed named-client credits are therefore not added to these pages. Scenario applications remain available with hypothetical labels. Existing public engagement records are linked separately and are not treated as proof of simulated outcomes. The reference originals preserve the original wording for owner review.

The handoff has no empirical datasets supporting its synthetic coefficients. The pages disclose this. Owner approval and a domain review of interpretation/calibration remain release requirements; no automated check can supply them.

## Research anchors checked during implementation

- [World Bank, Impact Evaluation in Practice](https://www.worldbank.org/en/programs/sief-trust-fund/publication/impact-evaluation-in-practice): reference for evaluation methods and identification assumptions, not validation of synthetic slider values.
- [European Commission/JASPERS, Economic Appraisal Vademecum](https://jaspers.eib.org/knowledge/publications/economic-appraisal-vademecum-2021-2027-general-principles-and-sector-applications): reference for investment appraisal context; the teaching annuity is not a complete economic appraisal.
- [UK Government, Project Delivery Functional Standard](https://www.gov.uk/government/publications/project-delivery-functional-standard): broader project delivery framework; it does not calibrate the linear throughput illustration.
- WTO tariffs, World Bank Enterprise Surveys and World Bank governance are discipline references. None is presented as an empirical source for invented model coefficients.

## Review and rollback

The work is submitted for PR/preview review. No production merge or publication is authorised by this document. Preserve the original source package and use the feature PR to review visual composition, wording, formulas and evidence boundaries. Rollback consists of reverting the feature commit; existing public routes and content remain available.

Reproduce checks with `npm ci`, `npm run check`, `npm test`, `npm run test:hostinger`, `npm run verify`, `npm run test:explore:browser` and `node scripts/explore-edge-check.cjs`. Browser checks need the Playwright Chromium install and a static server on port 3123. Local performance reproduction uses `LIGHTHOUSE_CLI` to point to an installed Lighthouse CLI before running `node scripts/explore-performance.cjs`.
