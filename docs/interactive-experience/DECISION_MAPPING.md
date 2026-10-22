# D01–D18 implementation and evidence map

22 October 2026. This is an engineering mapping for review, not an owner signature or release approval.

| Decision | Implementation | Verification / approval state |
|---|---|---|
| D01 · Home preview | `src/explore/index.js::preview`, `explorer.js/css`: six static choices, one stage, public/private and one bounded input | Browser checks six selectors; edge checks all six inputs change a synthetic result. No full-model requests on Home. |
| D02 · Separate hub | `/explore`, 12 static entry scenarios, explicit tour control | Unit test counts 12 records; browser validates hub and route navigation. Tour is never automatic on entry. |
| D03 · Six full pages | Build renders all six routes; original hero, scenario variants, controls and charts retained | 64 scenario variants exercised; 48 independent browser input vectors; single shared shell/no iframe assertions. |
| D04 · Approach method | Existing six-movement film retained; relevant analytical links added | Existing regression suite; mobile route check; owner visual review remains. |
| D05 · Six capabilities | Original capability data and slugs unchanged; links supplement service page | CMS contract and link checks; native browser route check. |
| D06 · Eight sectors | Original taxonomy and order unchanged; contextual analytical links on each detail page | Build/internal links and existing regressions; owner editorial review of link relevance remains. |
| D07 · Evidence integrity | New unapproved named-client credits omitted; existing engagements linked separately | Draft evidence notes reviewed; original wording preserved privately in source references. Primary attribution/date disputes remain for owner review. |
| D08 · Analytical honesty | Shared tested math, explicit assumptions, units, limitations and generic return labels | Independent numeric vectors and boundaries; no empirical calibration or external expert signoff is claimed. |
| D09 · Purposeful motion | Six distinct visual signatures and retained original animations; explicit pause | Scenario and keyboard tests; motion pause includes CSS and SVG animation. |
| D10 · Lightweight Home | Small route-local preview; model scripts load only on dedicated routes | Unit check excludes model-controller/video embeds; local before/after Lighthouse reports in QA directory. |
| D11 · Desktop/touch | Original responsive layouts plus theme typography, target/focus improvements | Every scenario at 1440/820/390/320; keyboard tab/range interaction; screenshot review. Physical-device testing remains. |
| D12 · Opt-in lengthy motion | Tours default off, stop on reader intervention and offscreen; reduced-motion and visibility controls | Browser reduced-motion checks; edge test proves tour stops and explicit SVG pause works. |
| D13 · No duplicate framework | No third six-step film introduced; original Approach and delivery chain retained | Template review and existing regression suite. |
| D14 · Home placement | CMS-supported section inserted after Why IP3 and before Sectors in saved order | Browser ordering assertion; preview screenshot. Owner scroll-composition acceptance remains. |
| D15 · Native architecture | Existing Node/CommonJS static generator and CMS; no framework rewrite or generated-source edits | `npm run check`, `npm run verify`, 33 built pages, metadata/sitemap/link checks. |
| D16 · Release process | Isolated feature branch and review PR; no main commit/production publication | Git/PR records. Owner approval before merge remains mandatory. |
| D17 · Contextual enquiry | Allowlisted discipline slug integrates with existing contact fields; no slider data passed | Browser checks focus/message prefill and absence of supplied slider value; existing contact regressions. |
| D18 · Evaluate before migration | Six unchanged originals retained and full functional bodies extracted into scoped native components | Hash provenance, original-case count, numerical parity and responsive browser checks. Native migration is implemented for review; no iframe ships. |

Owner review still covers placement, wording, visual identity, client attribution, domain assumptions and production release. Automated evidence cannot replace those decisions.
