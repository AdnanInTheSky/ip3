# Skill: Verify Static HTML References Without Blind Spots

Version: 0.1.0
Scope: HTML emitted by static-site generators, including link, image, script, source, poster, canonical, and accessibility attributes.
Origin: IP3 link-checker regression, 2026-10-23.

## Trigger
Apply this skill when an agent changes or audits a checker that reads HTML attributes or generated page links.

## Verified failure mode
A validator using a quoted-attribute-only regular expression silently skipped valid unquoted HTML references. A broken `href=/missing-page` was not flagged, and `alt=Photo` was misreported as absent. This was reproduced in the IP3 GitHub Actions **Content check** job, not merely asserted by an agent.

## Repeatable procedure
1. Before changing implementation, write a failing regression on an actual project's verifier. Include at least one genuinely broken unquoted `href` or `src` and a correctly populated unquoted `alt`.
2. Verify the regression is red in an independent runner. Keep that commit SHA and CI run URL.
3. Make the smallest isolated parser fix. Recognize double-quoted, single-quoted and valid unquoted attribute values. Preserve boundaries: `src` must not accidentally match `data-src`.
4. Execute the entire existing test command, not just the new test.
5. Add a distinct positive fixture using valid unquoted `rel=canonical`, `href`, `src`, `data-src`, and `alt`. A fix that rejects valid content fails.
6. Re-run checks independently on the fresh fixture. Save pass/fail counts, logs, commit SHAs and outputs.
7. If any test fails, do not promote the lesson. Record the failure and revise the candidate.

## Acceptance criteria
- Original regression fails before the fix and passes afterward.
- Existing test suite stays green.
- Distinct positive fixture passes; no new false positives from attribute boundary matching.
- Source patch remains reviewable and isolated from deployment.
- The evidence record links to real commits and independent tests.

## Reuse limitations
This is a **project-verified engineering lesson**, not a proof that LLM model weights have changed, and not yet a cross-model transfer result. A different parser/runtime should independently test its own fixtures. This regular expression is a scoped patch for the existing checker; for arbitrary hostile or malformed HTML, use an HTML parser and broaden security tests. Do not extrapolate this test to `srcset` data URLs, entity decoding or unquoted `id` attributes without separate evidence.

## Source evidence
- Baseline: `cd4ae9dbf3e208faa6ae15e4ce39161904ecd70c`; red GitHub Actions Content check.
- Targeted fix: `8d833de9dad2159e083c43ba3f6afa1be3a58c8b`; green GitHub Actions Content check.
- Distinct positive fixture: `cfb753baf13b0299c9084a17c15e986347942167`; green GitHub Actions Content check.
- Draft review: https://github.com/mdsyfulhoque-afk/ip3-bd.org/pull/31

## Portable prompt for other agents
"Treat this as an evidence-gated task. Reproduce the reported HTML-attribute blind spot as a failing regression before modifying code. Make a scoped fix, run the existing project suite, run an independent positive fixture and record real result artifacts. Do not claim success or a reusable skill without the observed green results and a new-task transfer check."
