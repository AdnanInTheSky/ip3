# Sector pages — media manifest

Archive root: `D:\CONTENT IP3 WEBSITE\NEW WEBSITE DESIGN\DATABASE ARCHIVE\` (read only; no original was changed or moved).
Derivatives were made with the same tools CI uses (`sharp@0.35.5`, `ffmpeg-static@5.3.0`): photos as WebP, at most 1600 px wide, quality 78, with EXIF/GPS metadata removed; films as H.264 MP4, 1280 px wide, CRF 27, 10 seconds, no audio, faststart, each with a WebP poster.

Provenance and consent come from the owner's photo manifest (`PORTFOLIO WEBSITE/REDESIGN-2026/photo-manifest.json`, 24 Sep 2026), which classifies each photo's source and consent risk, and from a frame-by-frame look at every file used here. Captions say only what each frame shows. A project, client or year appears only where a banner, slide or filename date shows it.

## New derivatives

| Published file | Archive original | Used on | Provenance · consent risk | Notes |
| --- | --- | --- | --- | --- |
| `assets/img/sectors/factory-floor-2018.webp` (1600×1200, 214 KB) | `PHOTOS - Copy/2018-05-07 13.59.04.jpg` | 03 Health gallery | Own field photo · low (distant workers) | The manifest links the 2018 factory series to HALOW+ with medium confidence, so the caption does not name the project. |
| `assets/img/sectors/factory-line-2018.webp` (1600×1755, 123 KB) | `PHOTOS - Copy/IMG_20180428_103626.jpg` | 06 Economic gallery, 07 Sustainable finance gallery, 06 next-sector portal | Own field photo · low (distant workers) | Same series as above. |
| `assets/img/sectors/workplace-health-rooms-2018.webp` (1600×600, 131 KB) | `IP3 Website Photos & Videos/IP3 Photos/IMG_20180430_123930.jpg` | 03 Health gallery | Inferred own field photo (same camera series and week as the 2018 factory set; not in the owner's manifest) · **cropped to the top half** | The full frame shows a child below the signs. The crop keeps only the building and its "Doctor's room" and "Child care room" signs; two adults on a balcony remain, too far away to identify. **Owner to confirm the photo is IP3's.** |
| `assets/img/sectors/wash-workshop-2019.webp` (960×720, 29 KB) | `PHOTOS - Copy/67296698_10156578151128590_1976292582363234304_n.jpg` | 03 Health gallery | Own event photo · low | |
| `assets/img/sectors/planning-notes.webp` (1200×700, 68 KB) | `PHOTOS - Copy/016.jpg` | 05 Governance gallery, 05 next-sector portal (shown on the Digital page) | Own photo · none | The manifest asks the owner to confirm it is his photo, not a generic image. |
| `assets/img/sectors/head-table-2021.webp` (1600×900, 51 KB) | `PHOTOS - Copy/IMG_0412.JPG` | 05 Governance gallery | Own event photo · low | |
| `assets/img/sectors/training-cohort-2018.webp` (1440×1080, 93 KB) | `PHOTOS - Copy/41729962_10155921950728590_5349045406804213760_n.jpg` | 02 Education gallery | Own event photo · low (posed group) | |
| `assets/img/sectors/working-session-2013.webp` (1600×1200, 59 KB) | `PHOTOS - Copy/906177_10151781512168590_2131793631_o.jpg` | 04 Digital gallery and next-sector portal (shown on the Health page) | Own event photo · low | |
| `assets/video/sectors/linear-waste.mp4` (10 s, 398 KB) + `assets/img/sectors/poster-linear-waste.webp` | `VIDEOS & GIF/Destroying our Planet Video.mp4` (0:01–0:11) | 07 Sustainable finance gallery | IP3-produced Canva film; the same source and status as the films already on the site | Full-resolution frames checked: no watermark. **Owner to confirm the Canva licence covers web use.** |

## Existing site media reused

| File | Used on | Status |
| --- | --- | --- |
| `assets/img/field/*.webp` (9 of the 16 consented meeting photos) | Digital, Governance, Economic, Sustainable finance and AI galleries; Governance hero; Sustainable-finance next-sector portal | Consent settled by IP3 on 11 Oct 2026. Captions copied from `content/field-media.json`. The two SANEM-era ADB images are labelled as the founder's work before IP3. |
| `assets/video/reel/climate-data-technology.mp4`, `circular-economy-projects.mp4` | Climate, AI and Sustainable finance galleries | IP3 films, settled 11 Oct 2026 |
| `assets/video/coast.mp4`, `energy.mp4`, `moss.mp4`, `waste.mp4`, `textile.mp4`, `city.mp4`, `data.mp4` and their posters | Heroes and galleries | Already published on the site |
| `assets/img/training-3.webp`, `training-5.webp`, `survey-4.webp`, `pilot-3.webp`, `factory.webp` | Education, Health and Economic heroes and galleries | Already published. `survey-4` and `pilot-3` carry medium consent risk (identifiable respondents) in the owner's manifest. `training-5`'s original is not identified. |

## Header and portal changes (`content/sectors.json`, fields used only by the sector pages)

| Sector | Field | Before | After | Reason |
| --- | --- | --- | --- | --- |
| 01 Climate | `photo` | `solar.webp` | `poster-coast.webp` | `solar.webp` traces to "Energy solar.jpg", which the manifest classes as unlicensed stock |
| 02 Education | `image` | `education.webp` | `training-5.webp` | `education.webp` is stock showing children (manifest: avoid) |
| 04 Digital | `photo` | `poster-city.webp` | `sectors/working-session-2013.webp` | Was the same image as its video poster; now an authentic photo |
| 05 Governance | `image` | `workshop-adb.webp` | `field/financing-recommendations-panel.webp` | The old header was the founder's SANEM-era ADB workshop; the new one is a consented IP3 panel |
| 05 Governance | `photo` | `dhaka.webp` | `sectors/planning-notes.webp` | `dhaka.webp` traces to a credited web image that needs a licence |
| 06 Economic | `photo` | `factory.webp` | `sectors/factory-line-2018.webp` | Was the same image as its header |
| 07 Sustainable finance | `photo` | `recycle.webp` | `field/cpd-green-transition-enumerator-training.webp` | `recycle.webp` is concept stock; the new photo is verified project evidence |

`card` images (home carousel and /sectors list) were **not** changed, because they appear on protected pages. The Education card is still `education.webp`, stock showing children that the manifest marks "avoid". IP3 should decide whether to replace it there too (for example with `training-5.webp`, now the Education page header).

## Reviewed and not used

| Archive file(s) | Reason |
| --- | --- |
| `VIDEOS & GIF/Upcycle Level Up Video.mp4` | A stock-agency watermark is visible on the hanger tag in full-resolution frames |
| `VIDEOS & GIF/Untitled design (2).mp4` (circular-economy illustration) | Clean, but its purple palette is outside the IP3 palette |
| `VIDEOS & GIF/Recycling fashion_ … BBC News.mp4`, `videoplayback*.webm`, `Recycling Bangladesh.webm` | Third-party broadcast or downloaded footage |
| `IP3 Photos/istockphoto-*`, `PHOTOS - Copy/istockphoto-*`, `*-unsplash.jpg`, `Recycle Bag.jpg`, `Property Tax.jpg` | Stock, watermarked or third-party |
| `ip3primary-main/wp-content/uploads/…/DeWatermark.ai_*` (used by the old climate pages) | Watermarks were removed from these images; they are not publishable |
| `Sanitation sewerage.jpg`, `Payra.jpg`, `Property.jpg`, `Energy solar.jpg`, `Education.webp`, `Waste amangement.webp`, `Global GHG Emission.png` | Manifest: unknown or stock provenance, third-party chart, or children |
| `IMG_3173`–`IMG_3380`, `IP3 HALOW+.jpg` (worker headset series) | Manifest: HIGH consent risk (close-up identifiable workers) |
| `66774592…`, `67327919…` (community discussions) | Manifest: HIGH consent risk (community members, children) |
| `Final survey-5/6/7/10`, `Pilot test-1/2/4/5`, `1.jpeg`, `66810114…`, factory training hall `2018-05-07 10.12.55` and `IMG_20180507_10131x` | Medium consent risk (identifiable respondents or workers). Good candidates for Digital and Health once IP3 confirms consent. |
| `DSC_0115/0130`, `IMG_2353`, `IMG_20180430_120002` and other personal photos | Personal photographs, not work |
| `67654489…` (2019 consultation) | Same frame as the published `field/conference-table-consultation.webp` |
