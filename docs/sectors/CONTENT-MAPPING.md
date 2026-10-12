# Sector pages — content mapping and coverage

Seven legacy WordPress pages from `DATABASE ARCHIVE/ip3primary-main/ip3primary-main/` were read as source documents (not destinations). Their text was extracted without the theme's header, footer, navigation and scripts, then mapped to the eight sector pages by subject. The result lives in `content/sector-pages/<sector slug>.json` (one CMS file per sector).

**Source codes**

| Code | Source file |
| --- | --- |
| S1 | `monitoring-evaluation-research-learning-and-adaptation-merla.html` |
| S2 | `program-and-survey-design-and-management.html` |
| S3 | `public-policy-innovation-and-action-research.html` |
| S4 | `climate-action-esg-strategy-sustainability-solutions.html` |
| S5 | `climate-action-sustainability-analysis-and-solutions.html` |
| S6 | `data-and-digitalgovernance.html` |
| S7 | `economic-financial-and-environmental-assessment-and-feasibility-studies.html` |
| CV | `content/proof.json`: the 37 assignment records from the founder's signed CV (Sep 2026) and the portfolio, already published on /capabilities |

**Rules used**

- Source wording is kept and lightly edited for grammar and the site's American spelling. No project, client, figure, credential or year was added.
- Project case studies in the sources are not re-quoted. Each one already exists as a CV record, so the sector pages link to that record on /capabilities. The CV dates and wording therefore win over the old pages wherever they differ (see Conflicts).
- Most of the generic service lists in S1–S3, S6 and S7 are already on /capabilities (`content/capabilities.json`). The sector pages keep only the parts that belong to a sector, framed for that sector.
- New connecting sentences are marked *(bridge)* below. They frame source material and make no claims.

## Placement by source block

Status: **Placed**, **Record** (shown through the CV record), **Held** (needs IP3's approval), **Omitted** (boilerplate, placeholder or duplicate).

### S1 — MERLA

| Block | Destination | Placement | Status |
| --- | --- | --- | --- |
| Intro (MERLA solutions, social science, digital, adaptive learning) | already on /capabilities (MEL intro) | — | Omitted as duplicate |
| Impact Evaluation: 4 services | 03 Health | statement paras; scene step "Compare" and "Include" | Placed |
| Monitoring & Results Measurement: data systems, real-time dashboards and GIS, capacity building (Paris, SDGs, ESG) | 03 Health (step "Measure"); 01 Climate (step "Risk": GIS point; practice row "Monitoring aligned with global commitments") | | Placed |
| Fit-for-Purpose Evaluation: mixed methods, sector-specific (climate, global health/NTD, education), operational research | 03 Health (step "Adapt"); 02 Education (practice row "Evaluation built for education") | | Placed |
| Digital Monitoring Solutions: AI analytics and predictive modeling, platforms and dashboards, IoT and ICT | 08 AI (steps "Data", "Analytics", "Adoption") | | Placed |
| Action Research & Collaboration: co-creation, "Pause and Reflect", multi-level knowledge exchange (UNFCCC, SDGs, Paris) | 03 Health (step "Adapt" point); 01 Climate (practice row "Knowledge exchange that scales") | | Placed |
| "Our Distinctive Edge" lines (3 sets) | 03 Health | practice ("Our distinctive edge", 3 rows) | Placed |
| Project: HALOW+ (2019) | 03 Health | evidence → record `halow` (Apr 2018 – Apr 2020) | Record |
| Project: Dhaka Sewerage Improvement Project M&E (2020) | 03 Health | evidence → record `dsip-dwasa` (Apr 2018 – Jun 2019) | Record |
| Project: Global LEAP RBF (2018) | 01 Climate | evidence → record `global-leap` (Jun 2015 – Jun 2016) | Record |
| HALOW+ claim "reshaped industry strategies — driving factory investments" | — | not in the CV record | Held |

### S2 — Program and survey design and management

| Block | Destination | Placement | Status |
| --- | --- | --- | --- |
| Comprehensive program design (ToC, logframes, sustainability and scale) + "Program design and scaling" list | 02 Education | practice row "Program design and scaling" | Placed |
| Survey design and implementation (tools, ODK/SurveyCTO, baseline/midline/end-line) | 04 Digital | scene step "Data" | Placed |
| Data analytics and reporting; survey design and management; data collection and analysis lists | 04 Digital | practice (3 rows) | Placed |
| Data science and digital engineering (ML, AI, pipelines, dashboards) | 08 AI | steps "Data", "Analytics", "Adoption" | Placed |
| Policy-relevant insights and adaptation | 08 AI (step "Adoption"); 04 Digital (step "People") | | Placed |
| Distinctive edge: Sustainability, Innovation, Customization | covered by the placed lists | — | Omitted as duplicate |
| Distinctive edge: Global Network ("thought leaders, academic and industry pioneers") | — | generic, no destination | Omitted (no evidence to place it with) |
| "Over a decade of experience with … World Bank, ADB and European Commission" | — | already listed as held in the README | Held |
| "All our experts have more than a decade-long experience … WORLD BANK, IFC, ADB, WTO, EU, UNDP, UNICEF" | — | unverifiable team claim | Held |
| Project: FAT survey, 1,200 firms (2019) | 06 Economic (scene step "Firms"; evidence `fat-survey`); 08 AI (evidence) | | Record |
| Project: Digital & Informality Survey, 500 suppliers (2021) | 04 Digital | evidence `digital-informality-survey` | Record |
| Project: CPD green transition, 400 firms, 120 KIIs, 7 FGDs, 2 EGMs (2023) | 07 Sustainable finance | evidence `green-transition-rmg` | Record |

### S3 — Public policy innovation and action research

| Block | Destination | Placement | Status |
| --- | --- | --- | --- |
| Tagline (inclusive growth, educational reform, environmental stewardship) | 02 Education | statement title | Placed |
| Policy research intro ("turning ambitious visions into results") | already on /capabilities (policy intro) | — | Omitted as duplicate |
| Your benefits: Informed decisions, Policy impact, Actionable insights | 05 Governance (practice, 3 rows); "Policy impact" also 03 Health step "Cost" | | Placed |
| Root-cause analysis; stakeholder-inclusive frameworks | 05 Governance | steps "Diagnose", "Co-create" | Placed |
| Regulation (intro + 3 items) | 05 Governance (statement, step "Regulate"); 06 Economic (practice row "Regulation that lets business grow") | | Placed |
| Evaluation (M&E systems, impact assessments, data modeling) | 05 Governance (step "Account"); 08 AI (step "Analytics") | | Placed |
| Economic analysis (CBA, modeling, data-driven solutions) | 06 Economic | step "Policy" | Placed |
| Approach to policy influence (evidence, collaboration, experimentation) | 05 Governance | steps "Co-create", "Deliver" | Placed |
| Approach to policy programming (research, capacity building, design, MEL) | 05 Governance (step "Deliver"); 02 Education (step "Systems" points) | | Placed |
| Why choose IP3: Innovation-driven policy development | 08 AI | statement | Placed |
| Why choose IP3: Bridging policy and practice; Customization and local contexts | — | repeats site-wide positioning on /why-ip3 and /approach | Omitted as duplicate |

### S4 — Climate action, ESG strategy and sustainability solutions

| Block | Destination | Placement | Status |
| --- | --- | --- | --- |
| Climate adaptation and resilience-building services (5) | 01 Climate | steps "Risk", "Plan", "Build", "Finance", "Govern" | Placed |
| "An advisor to governments, corporates and financial institutions…" + holistic-strategy paragraph | 01 Climate | statement | Placed |
| Policy focus (3 pillars) | 01 Climate (green transition) / 07 Sustainable finance (other two) | scene steps | Placed |
| Expertise: Responsible growth (decoupling) | 07 Sustainable finance | step "Linear" | Placed |
| Expertise: Supportive regulatory and policy frameworks | 01 Climate | step "Finance" | Placed |
| Expertise: Educational, financial and investment instruments | 07 Sustainable finance | step "Finance" | Placed |
| Expertise: ESG and circular strategy, biodiversity | 07 Sustainable finance | step "Regenerate"; practice lead | Placed |
| Application areas (urban planning, biogas, agriculture, biodiversity, waste-to-energy) | 01 Climate (step "Build"); waste-to-energy → 07 (step "Recover") | | Placed |
| "Driving responsible growth…" paragraph | 07 Sustainable finance | statement | Placed |
| How we ensure responsible growth (6 tiles) | 07 Sustainable finance | statement principles | Placed |
| ESG excellence paragraph; ESG roadmaps paragraph | 07 Sustainable finance | practice lead | Placed |
| Specialized industry solutions (4 client types) | 07 Sustainable finance | "Who we serve" | Placed |
| Key service offerings for Bangladesh (textile mentorship, municipal CE, food waste, policy advocacy SDG 11/12) | 07 Sustainable finance | steps "Design", "Recover", "Finance" | Placed |
| IP3 Approach: holistic sustainability transformation (2 paras) | 07 Sustainable finance | partly in practice lead | Placed (condensed) |
| Highlights: context paragraph | 07 Sustainable finance | "Context and figures" text | Placed |
| Highlights: RMG 84% of exports; Dhaka 6,500+ tons of waste a day; $12 billion opportunity | 07 Sustainable finance | `context.figures`, **hidden** until a source is entered in the CMS | Held |
| ESG team: "Benjamin Shah — Founder", "Takehiro Kanegi — Graphic Designer", "Rufus Stewart — Visual Designer", "Interesting work experiences" | — | theme placeholder | Omitted |
| Testimonial "Shakib Ahmed, Managing Director, RMG factory owner, Dhaka" | — | unverified quotation | Held |
| "The Circular Economist" magazine and team; "power of social media" paragraph | — | template text; the initiative's status is unknown | Held (confirm whether the Circular Economist group still exists) |
| Contact block: circulareconomist@ip3-bd.org.com, www.greeneconomy.com, @greeneconomy | — | malformed or placeholder | Omitted |
| "Get involved in green economy initiatives / green job opportunities" | — | call to action, not content | Omitted |
| Why choose us (4 lines) | — | repeats site-wide positioning | Omitted as duplicate |

### S5 — Climate action, sustainability analysis and solutions (compared line by line with S4)

| Block | Destination | Placement | Status |
| --- | --- | --- | --- |
| Distinctive edge paragraph (unique to S5) | 01 Climate | statement paragraph 1 | Placed |
| How we deliver (4 lines, unique) | 01 Climate (steps "Plan", "Build"); ESG frameworks → 07 | | Placed |
| Climate focus statement | 01 Climate | covered by the statement | Placed (condensed) |
| Green transition: equity-focused, natural capital, collaborative governance (unique) | 01 Climate | step "Govern" | Placed |
| Circularity and regenerative pathways (3, unique) | 07 Sustainable finance | steps "Design", "Regenerate" | Placed |
| Sustainable market solutions (3, unique; partly duplicated inside S5) | 07 Sustainable finance | step "Finance" | Placed |
| ESG services: Environmental (6), Social (5), Governance (5), Additional (4) | 07 Sustainable finance | practice (4 rows) | Placed |
| Partner with us for a sustainable future (closing) | 07 Sustainable finance | closing | Placed |
| Testimonials "Miguel Rivera", "Larissa Charter", "Carey Larson" (theme lorem text) | — | placeholder | Omitted |

### S6 — Data and digital governance

| Block | Destination | Placement | Status |
| --- | --- | --- | --- |
| Title and tagline; "Driving transformation through digital tools" (2 paras) | 04 Digital | statement | Placed |
| Our solutions: Digitization, Data and governance ecosystem, Service delivery | 04 Digital | steps "Systems", "Ecosystem", "Services" | Placed |
| Digital capability roadmaps; smart data systems | 04 Digital | step "Systems" | Placed |
| AI-driven governance models | 08 AI | step "Governance" | Placed |
| Capacity building in digital proficiency | 04 Digital (step "People"); 02 Education (practice row) | | Placed |
| Utility data-ecosystem mapping; collaborative ecosystem design | 04 Digital | step "Ecosystem" | Placed |
| Smart utility platforms (IoT, blockchain) | 08 AI | step "Applications" | Placed |
| Localized digital innovations (disaster resilience, mobile-first) | 04 Digital | steps "Services", "People" | Placed |
| "Bringing intelligence to the farm" (precision agriculture) | 08 AI | step "Applications" | Placed |
| "Innovative approaches to teaching and learning for the digital age" | 02 Education | statement | Placed |
| Regulation: reform strategies (ISO, TCFD, CSRD), anti-corruption and whistleblower platforms, service-quality tools, stakeholder models | 05 Governance (steps "Diagnose", "Co-create", "Account"); KPI tools → 04 Digital step "Services" | | Placed |

### S7 — Economic, financial and environmental assessment and feasibility

| Block | Destination | Placement | Status |
| --- | --- | --- | --- |
| Heading and intro paragraph | 06 Economic | statement | Placed |
| Our expertise: economic and financial feasibility; EIA; integrated frameworks | 06 Economic (practice, 3 rows); EIA and integrated → 01 Climate practice; feasibility → 02 Education practice | | Placed |
| Why IP3 Consulting ("strong track record … large-scale infrastructure") | 06 Economic | statement paragraph 2, worded as "our record" because the records support it | Placed (edited) |
| Project: Secondary and madrasah feasibility (2024, ADB TA-6950-BAN) | 02 Education | step "Secondary"; evidence `nsep-56088` (Jan 2022 – Dec 2023) | Record |
| "Bangladesh's first economic and financial feasibility study for secondary and madrasah education" | — | already listed as held in the README | Held |
| Project: Payra Seaport (2017) | 06 Economic | step "Trade"; evidence `payra-port` (Apr 2018 – Dec 2018) | Record |
| Project: Jolshiri Aqua Green City (2019, $1.4 billion) | 06 Economic | step "Investment"; evidence `jolshiri` (USD 1,414M capital in scope) | Record |
| Project: BIFFL and BEZA equity investment and SEZ (2017) | 05 Governance (evidence); 06 Economic (step "Investment") | `jica-beza-biffl` | Record |
| Project: Global LEAP (2015) | 01 Climate | `global-leap` | Record |
| Project: World Bank ESMAP and ASTAE evaluation (2016) | 01 Climate | `esmap-astae` | Record |

### Bridge sentences written for the new pages

Climate step "Risk" opening sentence; Education statement ("— and test it, cost it and appraise it before money is committed" and the closing sentence); Health statement paragraph 2 ending and scene title; Digital, Governance, Economic and Sustainable-finance scene titles and leads; Economic stations' framing; AI statement paragraph 2 ("Technology only earns its place…"). Every scene title and lead is new framing. None of them names a client, figure or result.

## Conflicts between sources

| Item | Old site | Record used (CV) |
| --- | --- | --- |
| Global LEAP | 2018 (S1) and 2015 (S7) | Jun 2015 – Jun 2016 |
| HALOW+ | 2019 | Apr 2018 – Apr 2020 |
| DSIP M&E | 2020; "Dhaka Sewerage Improvement Project" | Apr 2018 – Jun 2019; "Dhaka Sanitation Improvement Project" |
| Payra Seaport | 2017 | Apr 2018 – Dec 2018; the record notes the feasibility study itself was produced by third-party consultants |
| Jolshiri | 2019; "$1.4 billion" | May 2019 – Jun 2020; USD 1,414M capital in scope |
| Secondary and madrasah feasibility | 2024; ADB TA-6950-BAN | Jan 2022 – Dec 2023 (`nsep-56088`); the current madrasah assignment is Jan 2025 – ongoing |
| CPD green transition | 7 FGDs and 2 EGMs (2023) | 8 FGDs; Jan 2022 – Jun 2023 |
| FAT survey | 1,200 firms | 8 manufacturing sectors (the CV does not give a firm count) |

## Sector coverage

| Sector | Source blocks placed | Assignment records | Note |
| --- | --- | --- | --- |
| 01 Climate, Energy & Resilience | S4, S5, S1, S7 | 6 + 2 engagements | Strong |
| 02 Education, Skills & Human Capital | S3, S6, S2, S7, S1 | 5 | Strong |
| 03 Health Systems & Social Protection | S1, S3 | 3 | **Social protection has no source text or record.** IP3 should supply any targeting or social-protection work before the page claims it. |
| 04 Digital Government, Data & DPI | S6, S2 | 4 + 2 engagements | Strong |
| 05 Governance, Institutions & Public Finance | S3, S6 | 4 + 1 engagement | PFM has records (municipal finance, DSCC); no public-finance text in the sources |
| 06 Economic Transformation, Trade & PSD | S7, S2, S3 | 11 + 1 engagement | Strong |
| 07 Sustainable Finance, ESG & Circular Economy | S4, S5 | 3 | Rich service text; held figures and testimonial |
| 08 AI & Emerging Technology | S1, S2, S3, S6 | 4, all shared with other sectors | **Thinnest evidence.** "Responsible-AI frameworks" and "algorithmic accountability" (focus areas on the existing page) have no source text or record. |
