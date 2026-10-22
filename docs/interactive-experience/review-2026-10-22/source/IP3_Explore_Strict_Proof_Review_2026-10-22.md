# IP3 Explore Addendum: Strict Evidence and Presentation Review
**Independent implementation-readiness assessment | 22 October 2026**

**Review perimeter.** User-supplied *Final INTEGRATION_IP3_Codex_Implementation_Review_Handoff_2026-10-22.zip*: decisions, draft route/evidence plans, six source-extracted model descriptions, an isolated HTML/JS reference prototype, and supplied design images. **Not inspected:** the actual application at `http://localhost:3123/explore` (connection refused), production repo source, a deployed preview, or a real-browser screenshot of the running application. The public GitHub/release pages also could not be retrieved. This is therefore a **reference-implementation and editorial review**, not a production accessibility, security, or deployment certificate. All internal findings are traceable to `IP3_Explore_Proof_Receipts_2026-10-22.json`; source tags appear in square brackets.

## Executive decision

**Recommendation: retain the six-discipline / public-private Explorer architecture, but hold publication of quantitative decision outputs and unapproved engagement claims pending verification.** The design direction—editorial typography, restrained palette, six recognizable analytical worlds and a separate `/explore` hub—is differentiated and worth preserving. A World Bank/ADB academic or policy reviewer will, however, look beyond visual polish for exact method specification, falsifiable assumptions, traceable sources, uncertainty, counterfactual logic and a defensible *decision implication*. Today, the supplied reference exhibits gaps in each area. [inventory, decision, modelref, evidenceNotes]

**Risk hierarchy:** P0 = block publishing the specific claim/calculator as a validated decision tool; P1 = fix before public release; P2 = improvement after the scientific/evidence foundation is secure. The accompanying issue register provides individually testable work items.

| Dimension | Observed reference strength | Key gap | Release judgment |
|---|---|---|---|
| Information architecture | Disciplines vs services correctly separated; six detail pages | Hub's 12 entry scenarios differ from further model-specific cases | Retain; clarify |
| Content and editorial voice | Strong, memorable domain headlines | Generic repeated copy, few decision rules and unanswered uncertainty questions | Revise |
| Professional provenance | Source-extracted contexts, cautious disclaimers | Client name/assignment is not a verified citation or publicity approval | Block unapproved references |
| Analytical models | Calculations and formula text can be read and independently tested | No independent calibration or formula acceptance, with material method/label concerns | Block empirical or advisory claims |
| Graph communication | Domain-specific visual grammar | Some input motion is not a quantitative relationship; poor research-ready data disclosure | Redesign data layer |
| Accessibility and runtime | Basic semantic controls, reduced-motion logic in some scripts | Browser inaccessible; iframe, contrast, keyboard, mobile and performance QA outstanding | Verify on real build |

## 1. Content: move from a portfolio showcase to an evidence-to-decision experience

### 1.1 Establish one rigorous question-to-decision sequence

For each selected scenario, place the following content within a glance of the graphic:

1. **Decision at stake.** Who must choose, and by when? Define the policy, capital-allocation, operational or evaluation decision—rather than only an evocative question.
2. **Identification and evidence.** Which data source or design can answer it? Explain when a literature review, causal design, CBA, administrative data or qualitative institutional diagnosis is appropriate.
3. **What the tool actually calculates.** Give a one-sentence equation description, horizon, units, baseline, sensitivity range and provenance status.
4. **Decision threshold.** What would cause the preferred option to change? Examples: negative economic NPV under plausible downside cases; cost above an affordability envelope; unacceptable equity implications.
5. **Limits and next evidence.** State missing data, questionable assumptions, who may be affected adversely and what evidence is required before action.

These are proposed editorial criteria, **not claims about measured project performance**. They align with ADB's separation of economic viability, sensitivity, risk, sustainability and distributional concerns ([Asian Development Bank, 2017](https://doi.org/10.22617/TIM178607-2)) and practical impact-evaluation design in the World Bank handbook ([Gertler et al., 2016](https://www.worldbank.org/en/programs/sief-trust-fund/publication/impact-evaluation-in-practice)).

### 1.2 Make evidence status unmissable

Replace unlabeled organizational mentions under **Research anchor** with a short, clickable **Evidence and provenance** drawer:

| Field | Appropriate disclosure |
|---|---|
| Evidence category | Peer-reviewed method / published administrative data / verified project deliverable / documented professional role / hypothetical scenario |
| Exact bibliographic source | Author, date, title, link to DOI/publisher/official record (when available) |
| IP3's role | Specific workstream and attribution, only if approved |
| Data origin and year | Primary data, external dataset, simulated inputs, or not available |
| Parameter status | Empirically estimated / literature-informed / assumed |
| Approval status | Cleared for publication / pending / remove from public site |
| Applicable interpretation | What the evidence supports—and explicitly what it does not |

**Observed inconsistency:** `assets/app.js` renders a destination labeled **“Verified engagements”**, but the handoff says approved wording and client authorization are not available. An internal portfolio record is not equivalent to client permission, assignment verification or independent validation of an effect. Resolve this before using named institutional proof to promote a graph. [engine, evidenceNotes, data]

### 1.3 Proposed homepage/hub rewrite

**Existing conceptual strength:** *Complex questions. Evidence-led decisions.* Keep it. Immediately add a more precise value proposition:

> Explore how economic analysis, impact evaluation and institutional evidence clarify choices across public investment, market development and programme delivery. Each interactive example illustrates a method—not a forecast, evaluation finding or completed client outcome.

For scenario cards, replace vague action copy with:
**Question → Method → Decision output → What would change the recommendation.**

For models, distinguish the **12 Explore entry pathways** (six disciplines × public/private use cases) from the additional, domain-specific cases within each standalone simulator. A counter reading “01 of 12” at the hub must not be confused with the internal case pagination. [data, routeNotes]

### 1.4 Copy tone suitable for the target audience

Keep editorial distinction, but prioritize specificity over superlatives: short research-oriented main clauses, short and descriptive chart titles, normal-case rather than uppercase paragraph labels, with method notes visible before the user enters the simulator. For academics, offer methodological footnotes, assumptions and citations; for donors, evidence maturity and delivery readiness; for ministries, decision thresholds, affordability and distributional implications; for enterprises, financial sensitivity and risk ownership.

## 2. Graph and visualization audit

**Two types of graphic need separate visual languages.** A *conceptual system map* illustrates causal hypotheses, institutional relationships or process flow, with no pretence of estimated magnitude. A *quantitative chart* displays outputs from a defined calculation or verified observations and must show axis units, baseline, inputs, method, data status and important uncertainty. The current Explore SVGs often behave as the former but sit next to scenario sliders as if they were the latter. In the Policy & Governance preview, `scene(d, level)` does not use the slider value in the policy diagram geometry; changing the input therefore provides interaction without a corresponding analytical interpretation. [engine]

**Recommended graph architecture for the dark-stage component:**
- Above chart: decision question, audience label, method and evidence status.
- Main visual: **Concept map** or **Model output** (explicit mode selector only when both exist); no unlabeled transition between them.
- At right or below: current assumption with unit, default, allowed range and **Reset**.
- Under chart: sentence-level reading: “Under these illustrative assumptions, moving X from A to B changes modeled Y by Z; this is not an empirical estimate.”
- On request: data table, equation, evidence link, assumptions and a direct explanation of failure/edge cases.
- Use direct data labels or line patterns in addition to color; avoid relying on animation to encode meaning. Validate text, graph and control contrast under WCAG 2.2 AA ([W3C, 2023](https://www.w3.org/TR/WCAG22/)). Moving content that runs long or updates automatically needs appropriate user control ([W3C, 2023](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide)).

### 2.1 Model-specific graph changes

| Discipline | Observed model concept | Upgrade |
|---|---|---|
| Economics & Trade | Tariff, FX and elasticity produce indexed export outcomes [modelref] | Plot foreign-buyer price, quantity and receipts against tariff change as **separate unit-index charts**, baseline 100, and annotate assumed 60% FX pass-through; never imply a Bangladesh sector forecast without estimation data. |
| Finance & Investment | Annual cash flows, NPV and an IRR routine [financeModel] | Use a signed annual cash-flow waterfall, discounted net-flow chart with values, rate-vs-NPV curve, zero-NPV reference and explicit discount convention; create separate economic/financial accounts before claiming ENPV/EIRR vs FNPV/FIRR. |
| Market & Enterprise | Demand/price/productivity and break-even [modelref] | Plot profit vs units with a marked break-even and current volume; show price-dependent demand separately, capacity and unit-cost assumptions; when contribution ≤ 0 label “No finite break-even at these assumptions.” |
| Development & Impact | Two-group two-period DiD [impactmodel] | Label observed series and constructed counterfactual directly; show time and percent/pp axes, DiD arithmetic, counterfactual warning outside feasible range and identification assumptions. No 95% CI without real standard-error inputs. |
| Policy & Governance | Staff-hour accounting [modelref] | Use two stacked, common-axis horizontal bars (core handling vs rework), then an opportunity-capacity figure. **Never title the BDT conversion budget savings** without payroll/expenditure evidence. |
| Management & Delivery | Constant throughput and forecast completion [managementmodel] | Plot cumulative completed packages vs weeks with baseline, scenario and target; extend the horizon to encompass adverse settings; state that it is not a critical-path or PERT estimate. |

### 2.2 Two demonstrable boundary cases

**Development & Impact:** the embedded formula computes a treated counterfactual endline of `T_pre + (C_post − C_pre)` even though user inputs are percentages constrained to 0–100. With `T_pre=100`, `C_pre=0`, `C_post=100`, the displayed counterfactual is **200%**, which can be graphed beyond the 0–100 axis. The fix is not to silently clip away an inconvenient output: retain the computed value, state that the implied counterfactual violates the feasible outcome scale, and prevent a valid-looking interpretation. A two-period arithmetic contrast alone does not establish parallel trends, no anticipation, no spillover or defensible standard errors ([Roth et al., 2023](https://doi.org/10.1016/j.jeconom.2023.03.008)). [impactmodel, modelref]

**Management & Delivery:** at the documented minimum team size and availability and maximum rework and dependency drag, throughput is `5 × 0.75 × 0.50 × (1−0.35) / (1+0.40) ≈ 0.871` packages/week. For 120 packages, the synthetic forecast is **138 weeks**, while the existing visual scale ends at **48 weeks**. Add a dynamic maximum and an explicit beyond-horizon indication rather than a misleading flat or unfinished-looking chart. These are independent *arithmetic checks on supplied toy-model definitions*, not browser pass results. [managementmodel, modelref]

## 3. Scientific and economic assurance by discipline

**Finance:** The actual source uses a common `flow()` and `npv()` engine in public and private modes and changes only the labels to “Economic NPV”/“Financial NPV” and “EIRR”/“FIRR.” Correct project economic analysis needs its own appropriate valuation, resource accounting, incremental counterfactual, external effects and distributional treatment; financial analysis must reflect project/financing cash flows consistently. The safe immediate correction is **“Illustrative discounted net benefit”** and **“Illustrative return from assumed net flows”**, avoiding economic vs financial claims until the methods truly diverge. ([Asian Development Bank, 2017](https://doi.org/10.22617/TIM178607-2)). [financeModel]

**Impact:** Label the displayed +15 percentage-point difference as **“illustrative two-period DiD contrast”** where default input values are used, not an impact estimate. Display a checklist of pre-trend plausibility, comparison integrity, treatment timing, outcome validity, attrition and inference, including *Not assessed* states when data are missing ([Roth et al., 2023](https://doi.org/10.1016/j.jeconom.2023.03.008); [Gertler et al., 2016](https://www.worldbank.org/en/programs/sief-trust-fund/publication/impact-evaluation-in-practice)). [impactmodel]

**Trade and enterprise:** Document demand-elasticity and FX pass-through provenance and sensitivity. Since calibration and sector data are unavailable, treat outputs as conditional elasticities and unit-accounting illustrations. Explicitly separate revenue projections, real welfare measures and commercial pricing decisions. [modelref]

**Governance:** Report reduced handling-time capacity, not fiscal saving or welfare benefit. Before claiming a reform benefit, require evidence about displaced effort, service quality, digital exclusion, transition cost and realized government budget flows. [modelref]

**Delivery:** Separate FTE throughput and calendar completion; require dependencies, procurement, critical path and uncertainty modeling before using it for contract schedules. [modelref]

## 4. UX and presentation: preserve the aesthetic, correct the hierarchy

**Keep:** the ivory editorial canvas, charcoal diagram stage, restrained terracotta/evergreen accents, differentiated diagram motifs, six-option selector and one discipline per detailed page. The supplied desktop/mobile composition images are visual design references, not rendered measurements. [visual]

**Improve hierarchy:** the real research question should appear before the ornamental motto on detail pages. Visualize the decision output at readable size; move complex formula disclosure into a visible disclosure panel, not an inaccessible footnote. In model views, replace generic “What must be examined?” language with a domain-specific assumption and method summary. Do not bury the analytic chart so deep beneath multiple ceremonial headline bands that policymakers leave before encountering it.

**Model page sequence:**
1. Decision question and audience.
2. “What this illustrates / what it does not establish.”
3. Method and evidence status.
4. Main quantified workbench.
5. Interpreted result + threshold + alternative scenarios.
6. Transparent equation, data, limitations and ethics/equity.
7. Source-approved professional experience and relevant sectors/capabilities.
8. Contextual enquiry (never required to use the demonstration).

**Interaction:** guided tour remains opt-in; provide pause/reset, focus management, touch-friendly selectors, predictable keyboard interaction and `prefers-reduced-motion`. The prototype has static hub selector buttons, but editorial cards built through JavaScript still require progressive-enhancement fallback. The current wrapper uses a fixed 1,800px iframe height; the child finance file sends height `postMessage` but the wrapper app script has no matching message listener. Decide between an accessible integrated component and tested embed, with no duplicate site branding or internal scroll areas. [engine, css, financeModel]

**Mobile:** ensure the graph and explanatory result precede long lists; preserve legible units and labels at 320px and with 200%/400% zoom. No claim of WCAG conformance is possible from supplied mockups. [qaAddendum]

## 5. Codex-ready implementation priorities

| Sequence | Deliverable | Evidence needed for acceptance |
|---|---|---|
| P0-A | Case/claim approval ledger for any named institution, role, date and output | Source document identifier, signed wording approval, status + owner; hide unapproved items |
| P0-B | Finance label/method remediation and separate unit tests for every calculator | Versioned assumptions, independent known-answer vectors, expert reviewer signature |
| P0-C | Visible synthetic/calibration disclosures and distinction between conceptual and quantitative visualization | Each output includes assumption status, units, model equation and prohibited interpretations |
| P1-A | Chart rebuild for impact bounds, delivery horizon, finance labelling and all axis legends | Edge-case screenshot/accessible result-table parity at 1440/820/390/320 |
| P1-B | Full detail-page editorial content and hyperlinkable sources | Specific questions, sources, assumptions, thresholds, methods and distribution/equity caveats |
| P1-C | Integrate native/embed decision into the production static-site architecture | No duplicate navigation; no nested scroll; keyboard + screen reader + reduced motion checks |
| P1-D | Baseline-vs-preview browser, accessibility, regression and performance checks | Captured source branch/commit, check logs and viewport screenshots; review and PR approval |
| P2 | Reproducibility + usability enhancements | Reset, full assumption table, downloadable illustrative scenario card, citation links, accessible table |

**Pre-release tests:** For each model include baseline/zero/adverse/extreme vectors; perform independent arithmetic and expert domain review, tab order and accessible chart summaries, actual mobile viewport screenshots, offscreen-motion behavior, graph legend/color contrast, no-JS route fallbacks, fixed-vs-dynamic iframe handling, exact crosslinks, and CMS ordering. The handoff's prior static summary is **not equivalent** to a live-page or validated-model pass. [qaAddendum, inventory]

## 6. Proposed public-facing sample

**Explore title:** *Evidence that clarifies decisions.*

**Support line:** *Explore illustrative decision frameworks across economics, investment, enterprise, development impact, governance and delivery. Each example links the question, method and assumptions to the choices practitioners must make.*

**On every graph:** *Illustrative scenario — user-selected assumptions; not project data, official forecasts or verified client results.*

**Below every graph:** *This calculation shows [mechanical result] under [inputs]. It does not establish [causal / economic / financial / fiscal claim]. Before applying it, verify [required evidence].*

**Approved-proof label, only after checking:** *Relevant professional experience: [assignment], [specific role], [period], [deliverable/status], [approved source].* Otherwise omit this block.

**Do not present a speculative model as a credible calculation by adding more sophisticated animation.** Scientific credibility comes from consistent definitions, data provenance, testable formulas, clear limitations and independently inspectable reasoning.

## 7. Verification status and proof method

This review checked the supplied source text, static HTML structures, model equation definitions, a subset of independent extreme-case arithmetic, and supplied design compositions. The local site was inaccessible (a connection attempt to localhost:3123 was refused). Attempts to load the extracted reference prototype through a headless Chromium session were **blocked by administrator**; no live interactions, screenshots of the running page, keyboard audit, screen reader, or Lighthouse results are claimed. The bundle has a prior `qa-static.json` that reports passes, but its standalone `static_checks.py` references original HTML files outside the transmitted reference subfolder, so that exact legacy rerun is not self-contained within the ZIP. [qaAddendum, inventory]

**Proof receipts:** `IP3_Explore_Proof_Receipts_2026-10-22.json` lists source paths, whole-file SHA-256 digests and exact text anchor offsets for the internal evidence used here. `IP3_Explore_Issue_Register_2026-10-22.csv` maps actionable findings to receipt tags and acceptance gates. **Receipt completeness for this report's cited internal source tags is verifiable; a 98% external-corpus retrieval/validation gate or production-test threshold is not claimed.**

**Final classification:** **Design direction: retain. Editorial and methodological improvements: required. Production publication: not certified.**

## References

- Asian Development Bank. (2017). *Guidelines for the economic analysis of projects*. https://doi.org/10.22617/TIM178607-2
- Gertler, P. J., Martinez, S., Premand, P., Rawlings, L. B., & Vermeersch, C. M. J. (2016). *Impact evaluation in practice* (2nd ed.). World Bank and Inter-American Development Bank. https://www.worldbank.org/en/programs/sief-trust-fund/publication/impact-evaluation-in-practice
- Roth, J., Sant'Anna, P. H. C., Bilinski, A., & Poe, J. (2023). What's trending in difference-in-differences? A synthesis of the recent econometrics literature. *Journal of Econometrics, 235*(2), 2218–2244. https://doi.org/10.1016/j.jeconom.2023.03.008
- World Wide Web Consortium. (2023). *Web Content Accessibility Guidelines (WCAG) 2.2*. https://www.w3.org/TR/WCAG22/
- World Wide Web Consortium. (2023). *Understanding success criterion 2.2.2: Pause, stop, hide*. https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide

---
Prepared as a technical/editorial review of a supplied prototype and handoff, not an appraisal of IP3's actual past project outcomes.
