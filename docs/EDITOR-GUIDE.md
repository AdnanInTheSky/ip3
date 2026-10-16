# IP3 website editor guide

This guide is for staff who update the website in Pages CMS. You can edit text, lists and media in forms; you do not need to edit code or JSON.

## Sign in and choose the safe editing branch

1. Open [Pages CMS](https://app.pagescms.org/) and sign in with the GitHub account the owner authorized, or use the invited Pages CMS collaborator access if the owner set that up.
2. Open `mdsyfulhoque-afk/ip3-bd.org`.
3. Choose the `content` branch before changing anything. It is the draft branch. The `main` branch is production and must only be changed through an approved pull request.
4. Use the left menu to find the area:
   - **Page titles, search & page copy** for browser/search titles, search descriptions and page headings.
   - **Page layout · approved section order** for the limited section-order controls on eligible pages.
   - **Homepage content** for the hero, statistics, cards, testimonials and partner names.
   - **Contact page & FAQs** for contact page headings and questions.
   - **Capabilities, assignments & proof** for capabilities, assignment examples, photos and videos.
   - **Sectors & sector pages** for sector order and page content.
   - **Engagements & insights** for project summaries, articles and publications.
   - **People & founder profiles** for profiles and the founder bio.
   - **About IP3 & approach** for organization and methodology pages.
   - **Website settings · contact & navigation** for contact details, navigation and footer links.
   - **Legal pages · review before edits** for legal copy; changes there need legal review.

## Edit, check and preview

1. Open the item you want to change. Start with the task shortcuts below; field descriptions explain what a field controls and show limits or formatting rules.
2. Change only the content you intend to update. Use **Hide this item** where available to take a record off the website while keeping it available to restore. Reorder list items only when display order should change.
3. To reorder a page, open **Page layout · section order** and drag the middle sections into the order you want. The page headline stays first; Home, About and People keep their contact call to action at the end. Keep every listed section in the list exactly once. The build rejects missing, duplicated or unsupported sections, so an invalid order cannot reach production.
4. Save. Pages CMS writes the draft to the `content` branch. Saving does not update the public website.
5. The automatic **Content check** validates the content, builds the site and checks internal links. When it passes, GitHub opens or updates the review pull request.
6. Open the Vercel Preview link in that pull request. Check the affected page at desktop and mobile widths. Ask an authorized reviewer to merge only after the preview and required check pass.
7. Merge using **Create a merge commit**. The production site updates after Vercel successfully builds and deploys `main`.

Section order is available on Home, About, People and Contact. The hero stays first. Home, About and People keep their closing contact section last. The Why IP3 journey, Approach film, Capabilities sequence, sector detail templates, and legal pages have fixed or connected sequences and do not expose this control.

To move the existing Home testimonials, open **Page layout · section order → Testimonials pilot** and choose **Home — Testimonials location**. Choose **With clients and funders (default)**, **After selected engagements**, or **Before founder profile**. The testimonials follow the named section when the Home section order changes. Their text stays under **Home page → Testimonials**, and Engagements uses those same records. A move creates no new records. Keep at least one testimonial visible when choosing a standalone location. Save on `content`, open the preview, and check the position and spacing on desktop and mobile before review. Choose the default location to restore the original combined section.

### What “real time” means here

The editor save and GitHub check start automatically, and the preview becomes available after the check opens a pull request and Vercel finishes its preview build. A saved draft is not public. The production site changes after human approval, merge to `main`, and a successful Vercel deployment. That is the quickest safe path this static site supports; it is not a keystroke-by-keystroke or direct-to-production update.

## Common updates

| Update | Where to edit |
|---|---|
| Homepage headline, video, poster or button | Homepage content → hero headlines, slides & media |
| Replace a photo or video | Photos or Videos library, then the matching field in Homepage content, People & founder profiles, Engagements & insights, or another relevant form |
| Add or update a people profile | People & founder profiles → teams & profiles |
| Update a project or assignment | Engagements & insights → projects & assignments |
| Search title or description | Page titles, search & page copy → Page titles, search descriptions & headlines |
| Contact page FAQ | Contact page & FAQs → questions & answers |
| Phone, email, address or office map | Website settings · contact & navigation → contact & office details |
| Header navigation or footer link | Website settings · contact & navigation → header, navigation & footer |
| Homepage number or testimonial | Homepage content → Numbers or Testimonials |
| Capability title or service details | Capabilities, assignments & proof → Capabilities |
| Sector order or sector photo | Sectors & sector pages → Sectors |
| Article or publication | Engagements & insights → Insights |

### Content fields and website keys

Edit the words, descriptions, dates, links, and images intended for visitors. Fields called **Template key**, **Record key**, or **Profile anchor** connect content to page templates, URLs, or related records. They are developer-managed identifiers; leave them unchanged when updating copy or media. A change may break links or page rendering even if the field accepts text.

Search titles and descriptions are suggestions for browsers and search engines. Search engines may display different text. Keep them accurate and concise; the displayed length guidance is a target, not a guarantee of the search result.

Use the existing hide control to temporarily remove a supported list item while keeping its record. List reordering changes the order within that list only. **Page layout · approved section order** is a separate, restricted control: it does not make every section reusable or allow moving sections across pages. Keep all existing items once and use only the options shown by the CMS.

For the homepage hero, keep the poster image when replacing a background video. It is used while the video loads and when it cannot play. Update a button's text and destination together, then inspect the preview to ensure the destination is correct.

## Content and media safeguards

- The CMS menu does not offer create, rename or delete operations for whole content files. Edit existing lists and records. Use a hide control where one is provided instead of removing an item.
- Slugs and other keys may connect page URLs, templates, or related records. Leave existing identifiers unchanged unless the site maintainer has planned and approved the change.
- Use **Photos** for JPEG, PNG or WebP images and **Videos** for MP4 or WebM video. Aim for images under 500 KiB and video under 8 MiB; validation rejects images over 2 MiB, WebM over 8 MiB, and any video over 25 MiB.
- The hosted upload control and its size limits have not been verified. If the editor offers upload, follow the repository format and size rules above. Before replacing a file, confirm it is not referenced by another page or record. Do not delete media files as part of routine editing.
- Do not edit privacy or terms language without legal review. Do not change website contact details, navigation destinations, or SEO metadata unless authorized to do so.

## If the check fails

Open the failed **Content check** run linked from the commit or pull request. Read the first content error. Common causes are a missing required field, invalid slug/reference, broken internal link, unsupported media type, or file-size limit. Correct the CMS field and save again. If the error is unclear, send the site owner the workflow link and error text. Never send passwords, API keys or private enquiry contents in a public issue.

If a save does not reach a preview, first confirm that the CMS branch selector says `content`. Saving to an old merged feature branch does not enter the content publishing workflow. If Content check passes but no review PR appears, the owner should inspect **Content publishing** and confirm that GitHub **Settings → Actions → General → Workflow permissions → Allow GitHub Actions to create and approve pull requests** is enabled. The publishing workflow only opens or updates review PRs; a reviewer still merges them.

For sector headers, a selected video always needs a poster image. For a photo header, clear the video and choose the header photo. A card image by itself does not configure the header. Oversized uploads and missing posters stop the build, so production continues serving its previous successful deployment.

## Owner setup still required

Before staff onboarding, the repository owner must confirm Pages CMS hosted access and terms, install the Pages CMS GitHub App on this repository, create `content` from `main`, confirm the editor can select that branch, and invite named staff accounts. The site owner must also confirm the GitHub and Vercel preview/review workflow. These account-level actions have not been performed or verified by this configuration change.
