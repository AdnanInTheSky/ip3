# Accessibility acceptance

Date: 22 October 2026. Gate **IP3-09: Blocked** pending qualified human acceptance. Automated results and independent-engine coverage are recorded in `FINAL_QA_EVIDENCE`; they do not supply a human sign-off or WCAG certification.

## Environment and boundary

The available host is Windows. The baseline had Chromium and Microsoft Edge, which share an engine. Playwright Firefox was installed from the official Playwright distribution for fresh Gecko checks. The installer reports Firefox 157.0 / Playwright build 1555; the browser receipt records the actual running version/engine. An installed NVDA executable was not found at its standard path; no qualified human tester is present. VoiceOver/Safari require an Apple environment unavailable here. No physical-device session is available. A lack of human testers is an external acceptance dependency, not proof that the interface passes their tasks.

## Software defects addressed

- Server-rendered bounds/defaults previously exposed `NaN` / null metadata. The build now reads authoritative input attributes and rejects invalid metadata. Labels and units are shared by the server and browser; this also improves the no-JavaScript reading path.
- The homepage carousel lacked an explicit keyboard-operable pause mechanism. Its theme-matched control now pauses automatic slides, video and CSS motion. Keyboard focus holds automatic slide advancement; reduced-motion preference and visibility are respected. Existing next/previous/tab controls and all configured visible hero videos remain.
- Impact's old footnote called the constructed line dashed while the current graph renders it dotted. The wording now agrees with the chart and accessible explanation.
- All model data tables remain near their calculators. Unchanged table nodes are retained; no redundant rerender is introduced by this work.

## Fresh automated evidence

The final evidence index lists the executed suites and actual outcomes, including axe checks with new tables opened, full 64-case reset coverage, numeric/control contracts, keyboard navigation, reduced motion, 320-pixel reflow, enlarged text, touch emulation and no-JavaScript defaults. Firefox coverage is separately identified; automated/emulated devices must not be described as physical devices. Any failure discovered during execution must remain in the issue register until corrected and rerun.

## Ready-to-execute human acceptance script

### Required record (complete for every real session)

Tester and role; test date/time; operating system; physical device/model; browser name/version; assistive technology/version; tested URL; exact deployed SHA and build identity; language/verbosity settings; page/case/audience/input values; expected versus actual behavior; severity; steps; screenshot or permitted recording; and disposition. Never fill a pending record with an automated result.

| Target session | Current actual outcome | Owner / next action |
|---|---|---|
| NVDA + Firefox on Windows | **Not conducted** | Accessibility lead assigns a proficient NVDA user and records installed versions. |
| VoiceOver + Safari on macOS/iOS | **Not conducted** | Accessibility lead arranges an authorised Apple device and proficient tester. |
| Physical Android/iOS touch and enlargement | **Not conducted** | Owner supplies representative devices/testers; record browser and display settings. |
| Firefox/Gecko automation | See final machine-readable receipts | Technical coverage only; does not close the three human sessions above. |

### Common journey — perform on every model

1. Start at the hub using only the keyboard/AT. Locate the single main heading and distinguish 12 entry pathways from 64 detailed case variants. Follow a public pathway, return, and follow its private pathway.
2. Read the hero, decision guide and synthetic-evidence status. Explain in the tester's own words what is assumed and what cannot be concluded. Expect no suggestion of empirical validation or institutional endorsement.
3. Reach scenario tabs; use arrows/Home/End and confirm the selected narrative/audience and accessible state. Ensure hidden narratives are not announced as active. Follow a representative first and last case.
4. Reach every slider. Confirm name, unit, current value, minimum, maximum and step. Use keyboard arrows/Home/End; no pointer drag is required. Ensure focus remains visible and no focus trap occurs.
5. Change one value and read the updated result announcement. It should convey the current synthetic results with units and important warnings, without duplicating every update or moving focus. Test rapid changes as well as one deliberate step.
6. Understand the chart without seeing it: read its description, open current inputs and chart data, navigate header associations/rows with the AT's table commands and recover a selected point. Compare with a sighted reading of the graph. A drawn counterfactual is not an observed outcome.
7. Reset. Expect the same case/audience, all selected-case defaults restored, paused tour and an intelligible status. Finance must restore that case's own default discount rate.
8. Activate JSON and CSV downloads. Confirm a meaningful file name, synthetic evidence status, valid numeric bounds, complete series, defaults and calculation version. Confirm focus/announcement behavior and that no enquiry is sent.
9. Turn on reduced motion before navigation and while on the page. Check that continuous motion/tours stop, content remains readable and manual controls still work. Test motion-pause controls independently.
10. Enlarge text to 200%, test reflow equivalent to 320 CSS pixels/400% zoom on an appropriate desktop viewport, and check keyboard focus under the sticky navigation. Complete the journey on a physical mobile device with relevant screen-reader gestures.
11. Follow capability/sector links and open Contact. Expect only the allowlisted discipline context, with no slider values copied into the enquiry. Do not submit a real message during acceptance testing.

### Model-specific adverse tasks

| Model | Inputs / task | Expected interpretation |
|---|---|---|
| Economics | Tariff 30%, FX −15%, elasticity 3; then tariff 0%, FX +25% | Recover the current volume and receipt indices from text/table. Understand baseline 100 and conditional elasticity sensitivity; not a forecast. |
| Finance | Public/private first and last cases; discount rate 14%, stress 40% | Recover negative Year 0 and every later signed discounted flow. Distinguish generic NPV/IRR from a full economic/financial account. |
| Enterprise | Price 85, variable cost 120, productivity 0, elasticity 2.5 | Announce/read N/A break-even, negative contribution and expanded volume range without interpreting missing marker as a software error. |
| Impact | 100/100/0/100, then 0/0/100/0 | Recover CF200% and CF−100%, warnings and pp contrast. State that the percentages are infeasible counterfactual assumptions and no causal effect is established. |
| Governance | 0 removed steps, 0% digital, 40% rework, 10,000 cases/month | Recover extra workload (negative released hours) and opportunity value; do not call it budget savings. |
| Delivery | 5 people, 50% availability, 40% rework, 35% drag | Recover 138-week rounded duration, 144-week plot horizon and fixed week-24 target; not CPM/probabilistic forecasting. |

### Homepage carousel task

Locate Pause with the keyboard; pause for more than eight seconds and confirm slides, background video and continuous CSS motion remain stopped. Resume, then confirm automatic advancement is possible when focus/hover leaves the hero. Move focus into controls and read the copy without automatic advancement. Test all configured visible selections; use reduced motion from initial load and dynamically. Confirm the poster remains visible while video is deferred and no hero content is removed.

## Failure and closure rules

Record blocker/critical/high/medium/low severity with reproducible actual behavior. Correct software failures and rerun affected tasks. Close IP3-09 only after required qualified human sessions, evidence and owner acceptance exist. Passing axe or Firefox alone does not satisfy that gate. Criteria are framed by [W3C, WCAG 2.2](https://www.w3.org/TR/WCAG22/), including keyboard access, names/states, reflow, colour alternatives, status messages and pause/stop/hide.
