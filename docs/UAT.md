# User acceptance test

Run this checklist after the owner steps in [ADMIN-SETUP.md](ADMIN-SETUP.md) are complete and the code is merged to `main`. Use a harmless draft change and restore it through the same reviewed publishing flow if needed. Do not send a live enquiry until the recipient and contact-provider setup are approved.

Complete the detailed Pages CMS editor, permissions, media and draft-to-preview acceptance checks in [CMS-REQUIREMENTS-MATRIX.md](CMS-REQUIREMENTS-MATRIX.md) as part of the first onboarding. This file records the resulting CMS and production UAT evidence. No hosted CMS login or editor-side preview has been tested by the local configuration work.

| # | Test | Expected result | Pass / fail | Evidence, date and tester |
|---:|---|---|---|---|
| 1 | Sign in to Pages CMS with a named editor account, open this repository and select `content`. | CMS forms and the content-branch files load. |  |  |
| 2 | Edit a harmless headline and save. | A commit appears on `content`; **Content check** passes; the trusted workflow creates or updates a PR. |  |  |
| 3 | Hide one home testimonial and save. | The testimonial disappears from the preview; the CMS record remains available to restore. |  |  |
| 4 | Drag two home hero slides into a different order and save. | Preview slide order follows the CMS list order. |  |  |
| 5 | In Page layout → section order, move two Home middle sections, save, and open the preview. | Their page order follows the saved list; the hero stays first and contact CTA last. |  |  |
| 6 | In a local draft, remove or duplicate one section entry in `content/section-order.json` and run `npm run check`. | Validation fails with a clear page-specific section-order error. Restore the draft before continuing. |  |  |
| 7 | Upload an image larger than 2 MiB and save. | Pages CMS may reject the upload, or the validation check fails with the image-size limit; the invalid change cannot merge to production. |  |  |
| 8 | Open the PR's Vercel Preview as a named editor. | `/`, `/about`, `/contact`, `/privacy` and `/terms` are accessible; deployment protection does not block the authorized reviewer. |  |  |
| 9 | Review the PR's generated page changes and successful check, then merge as an authorized reviewer. | Production deploys from `main`; the sync workflow updates `content` and explicitly dispatches a fresh check. |  |  |
| 10 | Inspect the production deployment's `/build.json` and the deployment smoke workflow. | `build.json.commit` and `build.json.vercelGitCommitSha` match the deployed Git SHA; all five smoke routes return HTTP 200. Missing `VERCEL_GIT_COMMIT_SHA` fails the smoke check. |  |  |
| 11 | After mailbox, privacy, Resend and Turnstile gates are complete, and the owner has named a test recipient and approved one live test, submit one controlled enquiry. | One email arrives; the sender can reply to the submitter; message contents are absent from CI/function logs. |  |  |
| 12 | After setup, verify email routing with an approved non-production check failure and inspect a scheduled uptime result. | Owner email receives the configured GitHub/Vercel notifications; optional webhook receives only commit, author and up to 20 error lines for a failed content check. |  |  |
| 13 | If analytics were approved, inspect a production page and a Preview page. | Approved Vercel Web Analytics and Speed Insights scripts appear only on Production; the privacy notice is already published. |  |  |

**Acceptance:** all applicable rows pass; any skipped row has an owner and a reason recorded above. Keep this file as the manual record for the first editor onboarding and release.
