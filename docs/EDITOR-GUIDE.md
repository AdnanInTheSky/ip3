# IP3 website editor guide

This guide is for staff who update the website in Pages CMS. You can edit text, lists and media in forms; you do not need to edit code or JSON.

## Sign in and choose the safe editing branch

1. Open [Pages CMS](https://app.pagescms.org/) and sign in with the GitHub account the owner authorized, or use the invited Pages CMS collaborator access if the owner set that up.
2. Open `mdsyfulhoque-afk/ip3-bd.org`.
3. Choose the `content` branch before changing anything. It is the draft branch. The `main` branch is production and must only be changed through an approved pull request.
4. Use the left menu to find the area:
   - **Start here · page titles & copy** for search titles, search descriptions and common page headings.
   - **Home page** for the hero, statistics, cards, testimonials and partner names.
   - **Capabilities & proof of work** for capabilities, assignment examples, photos and videos.
   - **Sectors** for sector order and sector page content.
   - **Engagements & insights** for project summaries, articles and publications.
   - **People** for profiles and the founder bio.
   - **About IP3 & approach** for organization and methodology pages.
   - **Contact page** for contact page headings and FAQs.
   - **Website settings** for contact details, navigation and footer links.
   - **Privacy & terms** for legal copy; changes there need legal review.

## Edit, check and preview

1. Open the item you want to change. Field descriptions explain what the field controls and show limits or formatting rules.
2. Change only the content you intend to update. Use **Hide this item** where available to take a record off the website while keeping it available to restore. Reorder list items only when display order should change.
3. Save. Pages CMS writes the draft to the `content` branch. Saving does not update the public website.
4. The automatic **Content check** validates the content, builds the site and checks internal links. When it passes, GitHub opens or updates the review pull request.
5. Open the Vercel Preview link in that pull request. Check the affected page at desktop and mobile widths. Ask an authorized reviewer to merge only after the preview and required check pass.
6. Merge using **Create a merge commit**. The production site updates after Vercel successfully builds and deploys `main`.

### What “real time” means here

The editor save and GitHub check start automatically, and the preview becomes available after the check opens a pull request and Vercel finishes its preview build. A saved draft is not public. The production site changes after human approval, merge to `main`, and a successful Vercel deployment. That is the quickest safe path this static site supports; it is not a keystroke-by-keystroke or direct-to-production update.

## Common updates

| Update | Where to edit |
|---|---|
| Search title or description | Start here → Page titles, descriptions & headlines |
| Homepage hero headline, video or buttons | Home page → Hero slider |
| Homepage number or testimonial | Home page → Numbers or Testimonials |
| Capability title or service details | Capabilities & proof of work → Capabilities |
| Sector order or sector photo | Sectors → Sectors |
| Project or publication | Engagements & insights → Engagements or Insights |
| Profile photograph or bio | People → People or Founder profile |
| Phone, email or address | Website settings → Contact details |
| Navigation or footer text | Website settings → Navigation & footer links |
| Contact FAQ | Contact page → FAQ |

## Content and media safeguards

- The CMS menu does not offer create, rename or delete operations for whole content files. Edit existing lists and records. Use a hide control where one is provided instead of removing an item.
- Slugs are checked for lowercase letters, numbers and hyphens. A slug can change a page URL, so do not change a published slug without an owner-approved redirect plan.
- Upload photos to **Photos** in JPEG, PNG or WebP format. Aim for 500 KiB or less; images over 2 MiB fail validation.
- Upload videos to **Videos** in MP4 or WebM format. Aim for 8 MiB or less. WebM files over 8 MiB and any video over 25 MiB fail validation.
- Keep existing filenames when replacing media only if the old file is no longer needed and every reference has been checked. The CMS upload limit has not been verified; the repository validation is authoritative.
- Do not edit privacy or terms language without legal review. Do not change website contact details, navigation destinations, or SEO metadata unless authorized to do so.

## If the check fails

Open the failed **Content check** run linked from the commit or pull request. Read the first content error. Common causes are a missing required field, invalid slug/reference, broken internal link, unsupported media type, or file-size limit. Correct the CMS field and save again. If the error is unclear, send the site owner the workflow link and error text. Never send passwords, API keys or private enquiry contents in a public issue.

## Owner setup still required

Before staff onboarding, the repository owner must confirm Pages CMS hosted access and terms, install the Pages CMS GitHub App on this repository, create `content` from `main`, confirm the editor can select that branch, and invite named staff accounts. The site owner must also confirm the GitHub and Vercel preview/review workflow. These account-level actions have not been performed or verified by this configuration change.
