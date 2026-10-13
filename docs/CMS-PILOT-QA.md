# Home Testimonials pilot verification

Verified locally on 2026-10-13. The story is: a saved Pages CMS location value → existing shared testimonial records → validation → Home renderer → review preview → human approval and deployment.

| Check | Evidence |
|---|---|
| Default layout preservation | Raw Home and Engagements HTML matched the pre-change baseline exactly with the default location. |
| Placement behavior | Both standalone locations rendered the shared cards once, immediately after Engagements or before Founder, including when Home section order was reversed. |
| Data identity | Records remain in `content/home/testimonials.json`; placement stores only one selector. Home placement changes did not alter Engagements HTML. |
| Negative checks | Unsupported locations, empty/hidden standalone content, invalid orders and video headers without posters were rejected. Existing fixed Why IP3 sequence checks also pass. |
| Repository tests | `npm test`: 60 passed, zero failures. |
| Build and link checks | 21 pages built; internal links, assets, anchors, image alt attributes, metadata and sitemap verified. |
| Browser checks | Isolated Chromium tested all three placement values at 1440 × 900 and 390 × 844. Two cards rendered once in each case; placement adjacency passed, no horizontal overflow and no page errors. |
| Visual review | Desktop cards remain side by side; mobile cards stack with readable text and attribution. Local screenshots and `report.json` are in the workspace `cms-testimonials-pilot-preview` folder. |
| Automatic review workflow | The repaired Content publishing job automatically opened PR #13 after the exact draft head passed Content check. Subsequent saves updated that same PR. |
| Deployed move | [Saved move preview](https://ip3-bd-7pq3m0cz2-ip-3.vercel.app), commit `61e1049`, reached a ready Vercel deployment. Isolated Chromium accessed its protection using the existing account's project development token, attached only to the deployment origin. At desktop and mobile widths, the testimonial section immediately followed Engagements, with two cards and no overflow or page errors. |
| Default restored | Commit `40a9974` restored **With clients and funders (default)** on `content`; Content check and Vercel deployment passed again. The review branch retains the original layout. |

## Inherited build failures repaired

The pilot began from current `main`, whose latest sector edits could not build. Two chosen PNGs exceeded 2 MiB; lossless PNG compression reduced each from 2,453,674 to 1,880,391 bytes with identical decoded pixels. The Governance header now uses its selected card photo; AI uses its existing selected card as the video poster; Sustainable Finance uses its selected header image as the video poster. No selected media was removed.

The sector evidence renderer now treats an omitted optional `engagements` array as empty, consistent with the content schema. Video header validation now requires the actual poster used by the renderer, including when a separate photo is set. Remaining SEO-length and image-size recommendations are warnings; hard media limits stay enforced.

## Account configuration and remaining UAT

The `content` draft branch exists. GitHub Actions PR creation was enabled while retaining read-only default workflow permissions, using the repository's documented workflow-permissions setting. The publishing workflow contains no approval or merge operation. See [GitHub's repository Actions settings](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository).

Vercel previews require an authorized Vercel login. Production protection was not changed. Development credentials are in ignored local configuration only; tokens are absent from source, test reports and screenshots.

Hosted Pages CMS sign-in, selecting this new field, and saving it through its UI still require the named-editor UAT rows in `docs/UAT.md`. Automated render and browser verification does not substitute for that account-level test. Wider section transfers remain outside this one-page, one-type pilot.
