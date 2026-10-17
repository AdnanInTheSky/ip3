# Insights CMS — লেখার সহজ নির্দেশিকা

18 October 2026. **This configuration is prepared for GitHub’s content branch.** Keep every article draft. Hosted editor/save/review UAT is still required; a successful repository check is not publication approval.

**১. কোথায় লিখবেন / Open the right branch**

Sign into [Pages CMS](https://app.pagescms.org/) with your own GitHub session. Choose the IP3 repository and **content** branch. Open **Engagements & insights → Insights — full articles & source review**. Confirm the branch before saving. Do not work directly on main. The content branch disables Vercel Git deployments. No Hostinger upload workflow is enabled. This configuration does not itself enforce branch choice; actual GitHub review protection remains a launch gate.

**২. Existing 16 articles**

Open the existing entry by title and check its readonly Legacy article ID. Do not create a duplicate of any of these 16. Titles, URL slug, Category, Summary and body are separate fields. Keep the approved 8763 title. Existing legacy slugs are editable during draft work but changing a final legacy address requires maintainer review before publication; the source registry must agree. Filename rename/delete remains disabled.

Choose **Publication status = draft**. Choose **Writing progress = needs-owner-content** until the article is complete. Enter a concise factual summary. Write the complete article in **Full article — visual Markdown editor** using Editor mode. Heading, bold/italic, lists, links, quotations and tables are supported. Markdown remains portable text stored in the JSON body field. Source mode shows the Markdown. Raw HTML and reference-style links are rejected. Nested lists/advanced Markdown extensions are not implemented as rich layout; keep lists flat and verify the generated review. No CommonMark-conformance claim is made.

**৩. A genuinely new article / নতুন entry**

Use Create/Add in the article collection. Fill title, lowercase-hyphen slug, Category (Blog Post, Featured Article, Project Report or Article), draft status and needs-owner-content. Leave Legacy article ID/source/approval fields alone. A new owner-written article needs no invented WordPress ID, author, date or source URL. Filename uses the slug, e.g. new-topic.json; avoid an existing slug. Create is enabled only for this article collection. UI defaults have not been assumed: explicitly choose draft before saving. This does not replace the requirement to finish the original 16.

**৪. Cover image and infographic / ছবি যোগ করা**

Use images you own or may publish. PNG or WebP, up to **2 MiB per file**. In Cover image, select/upload through **Insights — owned infographics**. Storage: assets/insights; public path: /assets/insights. Complete **Cover image alternative text**; caption is optional. Alt text describes the information conveyed, not merely “image”.

For a diagram/infographic, open **Infographics — images shown after the article → Add item**. Upload/select the PNG/WebP, write its required Alternative text and optional Caption. These fields generate an actual img alt attribute and, if supplied, a visible figcaption. This is the simplest recommended workflow. Several images can be added; reorder their entries to set their order. Images here appear after the body.

For an image inside the body, insert it on its own paragraph using the editor's image control and Insights media. Enter its alt text. An optional caption is stored as a Markdown image title, e.g. in Source mode:

`![Describe the infographic](/assets/insights/your-graphic.webp "Optional visible caption")`

Save, then inspect the generated preview. Hosted editor round-trip behavior for image-title captions still needs UAT; use the separate Infographics fields if it does not retain the caption. Inline images inside a sentence are rejected. Do not hotlink, import WordPress attachments, upload SVG/HTML, or delete images already used by another page.

**৫. Save → review → approve / প্রকাশের আগে**

Keep draft and save to content. When complete, set Writing progress to ready-for-review, leaving Publication status=draft. Reviewer checks full text, factual support, type/summary, title/slug, images/rights/alt/captions and source preservation. Approval fields are readonly in CMS. A maintainer records explicit owner/reviewer acceptance and pins the exact content digest after that review; no approval was recorded by this task. The digest includes body, title/slug/type/summary, cover/infographic fields, inline images, edition/date metadata and image file bytes. Later edits require new review and invalidate the approved revision. Legacy-source changes also require source re-verification, or an explicit reviewed owner-written replacement classification.

Changing the dropdown to published cannot bypass validation. Unapproved, changed, missing or title-only content fails the build. Drafts have no full page, sitemap URL, card or legacy redirect. Published legacy destinations get their own query/pretty aliases only after the complete approved revision passes. Other source-backed research summaries remain; legacy summary cards cannot bypass draft status. A green draft build is not approval or release readiness.

**৬. GitHub review and $0 controls**

The content PR helper lists both content files and assets/insights media and rejects stale successful checks from an older branch head. It does not approve/merge/deploy. Actual named reviewer enforcement, admin bypass protection, CMS access roles, Actions allowance and hosted editor UAT are still unverified. Proposed policy previously allowed zero approvals/admin bypass; do not claim protected publishing until corrected and evidenced through separately authorized settings work. Only the authorized content-branch update is in scope; no main merge, production deployment or hosting/DNS change is authorized.

Official references checked for this design: [Markdown rich-text](https://pagescms.org/docs/configuration/fields/rich-text/), [media storage/output paths](https://pagescms.org/docs/configuration/media/), [image fields](https://pagescms.org/docs/configuration/fields/image/), [collection filename templates](https://pagescms.org/docs/configuration/content/filename/). Hosted acceptance is required even though the documented configuration is supported.
