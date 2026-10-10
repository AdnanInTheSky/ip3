# Content editor guide

## Publishing flow

1. Sign in to Pages CMS with the GitHub account the owner added.
2. Open `mdsyfulhoque-afk/ip3-bd.org` and choose the `content` branch. The live branch selector must be verified by an owner before editors start; if you cannot select `content` or the forms do not load, stop and contact the owner.
3. Edit content in the numbered CMS sections and save. Pages CMS records the save as a Git commit on `content`; that commit does not publish to the production site.
4. Wait for the **Content check** run. A green check lets the trusted workflow open or update the review PR. A red X means the proposed edit failed validation or build; open the workflow run and fix the reported content problem before saving again.
5. Review the Vercel Preview linked from the PR. Ask an authorized reviewer to merge the PR into `main` after reviewing the preview and green check. Choose **Create a merge commit**; do not squash or rebase. The automatic sync uses commit ancestry to keep `content` aligned with `main`, while squash/rebase creates replacement commits and leaves the branches diverged. The production site updates from `main`.

## Editing common content

- Change text only in the matching page or content form. Keep page titles and search descriptions within the character guidance shown in the form.
- Hide a testimonial, slide, FAQ, person or sector by turning on **Hide this item**. Hidden records stay in the CMS so they can be restored later.
- Drag items in a list to change their order. The one **Sectors — drag to set display order** list controls the home sector cards, sector index and footer sector links.
- Do not change a URL slug after a page is published unless the owner has planned the redirect.
- Privacy and Terms are drafts and need legal review. Do not describe a provider as enabled unless the owner confirms it.

## Uploading media

- Upload photos to **Photos** in JPEG, PNG or WebP format. Aim for 500 KiB or less; files above 500 KiB may be compressed in CI. Images over 2 MiB fail validation.
- Upload videos to **Videos** in MP4 or WebM format. Aim for 8 MiB or less. CI can re-encode large MP4 files as H.264 while keeping the same filename and extension. WebM cannot be safely changed to H.264 without changing its container, so WebM files over 8 MiB fail validation. Videos over 25 MiB fail validation.
- Keep filenames and extensions as uploaded references use them. Do not upload a renamed file to replace another asset without updating the content reference.
- Pages CMS does not have a verified upload-byte limit. The repository check is authoritative for the image/video limits above.

## If an edit fails

Read the first useful error shown in the red workflow. Common causes are a missing or unsupported asset, a broken page link, an invalid slug/reference, a required field left blank, or a media file over its limit. Correct the CMS value and save again. If the error is not clear, send the owner the workflow run link and the error text; do not paste passwords, API keys or private form submissions into a public issue.
