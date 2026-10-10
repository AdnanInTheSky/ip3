// All page content. Only client-supplied or publicly listed facts are used here.
// Items marked VERIFY need confirmation from IP3 before the first public launch.
const approach = ['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'].map((s) => require(`./data/approach/${s}.json`));

const img = (n) => `/assets/img/${n}.webp`;
const vid = (n) => ({ src: `/assets/video/${n}.mp4`, poster: img(`poster-${n}`) });

const hero = [
  {
    key: 'policy',
    tab: 'Policy to delivery',
    video: vid('hero-1'),
    eyebrow: 'Policy • Economics • Development Finance • Implementation',
    h1: 'Turning complex policy challenges into <em>implementable,</em> investable solutions.',
    sub: 'IP3 Consulting Limited is a policy and development advisory firm helping multilateral institutions, development partners, governments, businesses and research organizations design better policies, mobilize investment, strengthen institutions and deliver measurable results.',
    cta: [{ label: 'Discuss an Assignment', href: '/contact' }, { label: 'Explore Our Capabilities', href: '/capabilities', ghost: true }],
  },
  {
    key: 'sustainable',
    tab: 'Sustainable finance',
    video: vid('hero-2'),
    eyebrow: 'Sustainable Finance • ESG • Circular Economy',
    h1: 'Designing the <em>sustainable future</em> into policy and investment.',
    sub: 'We integrate sustainability into policy-making and corporate governance — from ESG strategy and green finance to the circular-economy investment cases that turn commitments into credible, bankable pipelines.',
    cta: [{ label: 'Sustainable finance & ESG', href: '/sectors/sustainable-finance-esg-circular-economy' }, { label: 'See our approach', href: '/approach', ghost: true }],
  },
  {
    key: 'climate',
    tab: 'Climate & resilience',
    video: vid('hero-3'),
    eyebrow: 'Climate • Energy • Resilience • Livelihoods',
    h1: 'Resilience, built with the <em>people</em> it is meant to serve.',
    sub: 'From climate economics and adaptation investment planning to evidence gathered in the field, we help institutions turn climate ambition into projects that communities can own and capital can fund.',
    cta: [{ label: 'Climate, energy & resilience', href: '/sectors/climate-energy-resilience' }, { label: 'Selected engagements', href: '/engagements', ghost: true }],
  },
  {
    key: 'institutions',
    tab: 'Institutions & data',
    video: vid('hero-4'),
    eyebrow: 'Institutions • Data • Digital Governance',
    h1: 'Institutions that can <em>deliver</em> — powered by data and inclusive digital systems.',
    sub: 'Empowering institutions with data-driven governance and inclusive digital ecosystems for resilient, future-ready public services.',
    cta: [{ label: 'Digital government & data', href: '/sectors/digital-government-data-dpi' }, { label: 'Meet our people', href: '/people', ghost: true }],
  },
];

const reassurance = ['Policy & Economic Advisory', 'Project Preparation', 'Development Finance', 'Institutional Reform', 'MEL & Impact', 'Digital & Responsible AI'];

const mandates = {
  eyebrow: 'Built for complex mandates',
  h2: 'From evidence to decisions. <em>From decisions to delivery.</em>',
  body: 'Development challenges rarely fit within one ministry, one sector or one financing instrument. IP3 brings together economics, public policy, finance, institutional analysis, technology and implementation expertise to help clients move through the full decision cycle.',
  cards: [
    { title: 'Diagnose', text: 'Economic, institutional, market and political-economy analysis that clarifies the problem and identifies realistic options.' },
    { title: 'Design', text: 'Policies, programs, investment concepts, theories of change, financing strategies and implementation arrangements.' },
    { title: 'Finance', text: 'Bankability analysis, blended finance, climate finance, private-capital mobilization and investment pipelines.' },
    { title: 'Deliver', text: 'Institutional strengthening, implementation support, capacity development and adaptive problem-solving.' },
    { title: 'Measure', text: 'MEL frameworks, evaluations, results systems, dashboards and learning processes.' },
    { title: 'Scale', text: 'Evidence translation, replication strategies, policy uptake and institutionalization.' },
  ],
};

const stats = [
  { n: 17, suffix: '+', label: 'Years of founder experience in economic policy & sustainability' },
  { n: 75, suffix: '+', label: 'High-impact projects underpinned' },
  { n: 30, suffix: '+', label: 'International development partners' },
  { n: 8, suffix: '', label: 'Connected sectors, one delivery model' },
];

const capabilities = {
  eyebrow: 'What we do',
  h2: 'What clients hire <em>IP3</em> to deliver.',
  cards: [
    { slug: 'policy-economics-strategy', title: 'Policy, Economics & Strategy Advisory', short: 'Policy & Economics', problem: 'We need to understand the problem and choose a defensible course of action.', deliverables: ['Diagnostics', 'Modeling', 'Political-economy analysis', 'Regulatory reviews', 'Sector strategies', 'Fiscal and cost-benefit analysis', 'Reform road maps'] },
    { slug: 'program-project-design', title: 'Program & Project Design', short: 'Program Design', problem: 'We have a mandate or funding window but need an implementable program.', deliverables: ['Feasibility studies', 'Theories of change', 'Concepts', 'Results frameworks', 'Implementation and financing plans', 'Risk registers', 'Project-preparation support'] },
    { slug: 'development-finance', title: 'Development Finance & Private Capital Mobilization', short: 'Development Finance', problem: 'Public funding is insufficient; how do we make this investable?', deliverables: ['Investment cases', 'Blended-finance strategy', 'PPP advisory', 'Financial models', 'Bankability assessments', 'Climate-finance strategy', 'Pipelines', 'Market sounding', 'De-risking'] },
    { slug: 'institutions-governance-delivery', title: 'Institutions, Governance & Delivery', short: 'Institutions', problem: 'A policy exists, but institutions cannot implement it consistently.', deliverables: ['Institutional diagnostics', 'Governance frameworks', 'PFM reform', 'Delivery models', 'Process redesign', 'Capacity development', 'Change management'] },
    { slug: 'monitoring-evaluation-learning', title: 'Monitoring, Evaluation, Learning & Impact', short: 'MEL & Impact', problem: 'We need to know what is working, why, for whom, and whether it can scale.', deliverables: ['MEL frameworks', 'Baselines', 'Process and impact evaluations', 'Learning agendas', 'Outcome harvesting', 'Dashboards', 'Adaptive management'] },
    { slug: 'data-digital-responsible-ai', title: 'Data, Digital & Responsible AI', short: 'Data, Digital & AI', problem: 'We need to modernize systems without creating new governance, exclusion or accountability risks.', deliverables: ['DPI diagnostics', 'Digital-government strategy', 'Data governance', 'Interoperability', 'AI readiness and governance', 'Service design', 'Digital inclusion'] },
  ],
};

const whyIp3 = [
  { n: '01', title: 'From polycrisis to polysolutions', text: 'Eight connected sectors. One integrated delivery model.', href: '/sectors', cta: 'Explore sectors' },
  { n: '02', title: 'Translation, not theory', text: 'Evidence converted into delivery architecture: strategies, project preparation, institutional reform, results systems.', href: '/capabilities', cta: 'See deliverables' },
  { n: '03', title: 'Research that changes decisions', text: 'Decision-ready diagnostics, business cases and evaluations — not publications for their own sake.', href: '/insights', cta: 'Read insights' },
  { n: '04', title: 'A convenor between worlds', text: 'Structured policy dialogue, investment forums and technical working groups that align governments, capital and implementers.', href: '/contact', cta: 'Commission a dialogue' },
];

const sectors = [
  {
    slug: 'climate-energy-resilience', n: '01', title: 'Climate, Energy & Resilience',
    problem: 'Climate commitments must become investment-ready adaptation and resilient infrastructure.',
    areas: ['Climate economics', 'Adaptation investment planning', 'Climate finance & NDC implementation', 'Green pipelines', 'Transition planning'],
    caps: ['policy-economics-strategy', 'development-finance', 'program-project-design', 'monitoring-evaluation-learning'],
    media: { type: 'video', ...vid('energy') }, card: img('poster-energy'), photo: img('solar'),
    engagements: ['gggf-urban-climate', 'agro-board-biodiversity'],
  },
  {
    slug: 'education-skills-human-capital', n: '02', title: 'Education, Skills & Human Capital',
    problem: 'Learning systems must produce skills for changing economies.',
    areas: ['Education policy & financing', 'TVET & skills systems', 'Learning outcomes', 'Institutional reform', 'Human-capital analytics'],
    caps: ['policy-economics-strategy', 'program-project-design', 'monitoring-evaluation-learning', 'data-digital-responsible-ai'],
    media: { type: 'image', src: img('education') }, card: img('education'), photo: img('training-3'),
    engagements: ['adb-nsep'],
  },
  {
    slug: 'health-systems-social-protection', n: '03', title: 'Health Systems & Social Protection',
    problem: 'Coverage and protection must be fiscally sustainable and well targeted.',
    areas: ['Health economics & financing', 'Social-protection design', 'Targeting & delivery systems', 'Costing', 'Evaluation'],
    caps: ['policy-economics-strategy', 'program-project-design', 'institutions-governance-delivery', 'monitoring-evaluation-learning'],
    media: { type: 'image', src: img('survey-4') }, card: img('survey-4'), photo: img('pilot-3'),
    engagements: [],
  },
  {
    slug: 'digital-government-data-dpi', n: '04', title: 'Digital Government, Data & DPI',
    problem: 'Digital transformation must improve services without creating governance or exclusion risks.',
    areas: ['DPI diagnostics', 'Digital-government strategy', 'Data governance & interoperability', 'Digital inclusion', 'Service transformation'],
    caps: ['data-digital-responsible-ai', 'institutions-governance-delivery', 'program-project-design', 'monitoring-evaluation-learning'],
    media: { type: 'video', ...vid('city') }, card: img('poster-city'), photo: img('poster-city'),
    engagements: ['bmdf-oscb', 'worldbank-fat'],
  },
  {
    slug: 'governance-institutions-public-finance', n: '05', title: 'Governance, Institutions & Public Finance',
    problem: 'Policies fail when institutions cannot implement them consistently.',
    areas: ['Institutional diagnostics', 'PFM reform', 'Public-administration reform', 'Accountability & anti-corruption', 'Delivery systems', 'Capacity development'],
    caps: ['institutions-governance-delivery', 'policy-economics-strategy', 'development-finance', 'monitoring-evaluation-learning'],
    media: { type: 'image', src: img('workshop-adb') }, card: img('workshop-adb'), photo: img('dhaka'),
    engagements: ['bmdf-transformation', 'bmdf-oscb'],
  },
  {
    slug: 'economic-transformation-trade-private-sector', n: '06', title: 'Economic Transformation, Trade & Private-Sector Development',
    problem: 'Growth must create jobs through productive investment and diversification.',
    areas: ['Macro & sector diagnostics', 'Competitiveness & trade', 'Investment climate', 'Value chains & MSMEs', 'Jobs & productivity', 'Private-capital mobilization'],
    caps: ['policy-economics-strategy', 'development-finance', 'program-project-design', 'monitoring-evaluation-learning'],
    media: { type: 'image', src: img('factory') }, card: img('factory'), photo: img('factory'),
    engagements: ['worldbank-fat', 'sida-cpd-textile'],
  },
  {
    slug: 'sustainable-finance-esg-circular-economy', n: '07', title: 'Sustainable Finance, ESG & Circular Economy',
    problem: 'Sustainability commitments must become investable pipelines and credible disclosure.',
    areas: ['ESG strategy & reporting', 'Sustainable and green finance', 'Circular-economy investment cases', 'Climate-risk integration'],
    caps: ['development-finance', 'policy-economics-strategy', 'program-project-design', 'monitoring-evaluation-learning'],
    media: { type: 'video', ...vid('textile') }, card: img('poster-textile'), photo: img('recycle'),
    engagements: ['sida-cpd-textile'],
  },
  {
    slug: 'ai-emerging-technology-public-systems', n: '08', title: 'AI & Emerging Technology for Public Systems',
    problem: 'Public AI needs readiness, governance and accountability, not software hype.',
    areas: ['AI readiness', 'Responsible-AI frameworks', 'Algorithmic accountability', 'Public-service applications', 'Workforce & adoption strategy'],
    caps: ['data-digital-responsible-ai', 'institutions-governance-delivery', 'policy-economics-strategy', 'program-project-design'],
    media: { type: 'video', ...vid('data') }, card: img('poster-data'), photo: img('poster-data'),
    engagements: [],
  },
];

const translation = {
  eyebrow: 'From analysis to implementation',
  h2: 'Translation, <em>not theory.</em>',
  sub: 'Our work is designed around the decisions institutions actually have to make: what to reform, what to finance, how to structure implementation, where risks sit, how results will be measured, and what evidence is needed to scale.',
  nodes: [
    { title: 'Diagnostics & Research', text: 'Understanding the problem, the system, and the realistic options.' },
    { title: 'Policy & Strategy Design', text: 'Choosing the course of action and designing the intervention.' },
    { title: 'Financing & Bankability', text: 'Making it investable and structuring the capital.' },
    { title: 'Delivery Architecture', text: 'Designing how it will actually be implemented.' },
    { title: 'Implementation Support', text: 'Staying engaged through execution and adaptation.' },
    { title: 'Learning & Scale', text: 'Measuring what works and translating evidence into uptake.' },
  ],
  outputs: [
    { title: 'Strategies & Policy Frameworks', items: ['Sector strategies', 'Reform road maps', 'Policy briefs', 'Regulatory frameworks', 'Theories of change'] },
    { title: 'Project Preparation', items: ['Feasibility studies', 'Investment concepts', 'Results frameworks', 'Risk registers', 'Implementation plans'] },
    { title: 'Institutional Reform', items: ['Institutional diagnostics', 'PFM reform', 'Governance frameworks', 'Capacity development', 'Change management'] },
    { title: 'Investment & Finance', items: ['Bankability assessments', 'Blended finance structures', 'PPP advisory', 'Financial models', 'Climate finance strategy'] },
    { title: 'Evidence & Evaluation', items: ['MEL frameworks', 'Baselines', 'Impact evaluations', 'Learning agendas', 'Dashboards'] },
    { title: 'Digital & AI Transformation', items: ['DPI diagnostics', 'Digital strategy', 'Data governance', 'AI readiness', 'Service design'] },
  ],
};

// Engagements — from the client's "Recent Engagements & Impact Projects" list.
const engagements = [
  { slug: 'adb-nsep', client: 'Asian Development Bank', year: '2024–2025', sector: 'Education & Human Capital', sectorSlug: 'education-skills-human-capital', title: 'Feasibility Study of New Secondary & Madrasah Education Projects (NSEP)', summary: 'Comprehensive economic, institutional and financial feasibility study for modernizing secondary and madrasah education infrastructure.', tags: ['Project Preparation', 'Feasibility', 'Institutional'], image: img('training-3') },
  { slug: 'sida-cpd-textile', client: 'SIDA / CPD', year: '2024', sector: 'Climate Action & ESG', sectorSlug: 'sustainable-finance-esg-circular-economy', title: 'Securing the Green Transition of the Textile and Ready-Made Garments Sector', summary: 'Empirical investigation into firm-level green technology adoption and circular water management in the textile and RMG sector.', tags: ['Climate & ESG', 'Research', 'Green Technology'], image: img('factory') },
  { slug: 'worldbank-fat', client: 'World Bank', year: '2023–2024', sector: 'Economic & Survey Design', sectorSlug: 'economic-transformation-trade-private-sector', title: 'Firm-Level Adoption of Technology (FAT) Survey for Manufacturing', summary: 'Nationwide empirical survey measuring technology intensity and digital management practices across manufacturing firms.', tags: ['Survey Design', 'Technology Adoption', 'Evidence'], image: img('survey-4') },
  { slug: 'bmdf-oscb', client: 'Ministry of Finance / BMDF', year: '2023–2025', sector: 'Data & Digital Governance', sectorSlug: 'governance-institutions-public-finance', title: 'Operation Support & Capacity Building (OSCB) for the Municipal Development Fund', summary: 'Technical assistance and capacity-building program to strengthen municipal revenue generation.', tags: ['Institutional Reform', 'Capacity Development', 'Municipal Finance'], image: img('dhaka') },
  { slug: 'bmdf-transformation', client: 'Bangladesh Municipal Development Fund (BMDF)', year: 'Transformation roadmap', sector: 'Institutions & Public Finance', sectorSlug: 'governance-institutions-public-finance', title: 'Transforming BMDF into a Next-Generation Municipal Financing Institution', summary: 'IP3 led a transformation roadmap — redesigning governance, introducing innovative finance tools such as PPPs and bonds, building institutional capacity and embedding a 10-year business plan.', tags: ['Development Finance', 'Governance', 'Institutional Reform'], image: img('workshop-adb') },
  { slug: 'agro-board-biodiversity', client: 'Agro-Board', year: '2024', sector: 'Climate Action & ESG', sectorSlug: 'climate-energy-resilience', title: 'Sustainable Agro-Ecosystems & Biodiversity: Beekeeping Value Chain', summary: 'Ecosystem-services valuation and a sustainable-livelihood strategy for mangrove honey gatherers.', tags: ['Biodiversity', 'Livelihoods', 'Value Chains'], image: img('poster-moss') },
  { slug: 'gggf-urban-climate', client: 'GGGF / Municipalities', year: '2024–2025', sector: 'Climate Action & ESG', sectorSlug: 'climate-energy-resilience', title: 'Urban Climate Resilience & Infrastructure Financing Assessment', summary: 'Systemic climate-vulnerability analysis and blended-finance structuring for storm-surge protection.', tags: ['Climate Finance', 'Blended Finance', 'Resilience'], image: img('poster-coast') },
];

const insights = [
  { type: 'Research', title: 'A Multi-Criteria Innovation Framework for Green Financial Product Design', text: 'A blueprint for sustainable finance to speed the green transition in emerging markets. Centred on Bangladesh, it designs context-specific green financial products — rather than copying Western models — using a multi-criteria lens that fuses AHP and TOPSIS to balance financial viability, environmental impact and social inclusion.', tags: ['Sustainable Finance', 'Bangladesh'], image: img('co2') },
  { type: 'Research', title: 'Deploying Data-Driven Tools to Monitor and Enhance Learning Outcomes in Schools', text: 'Advanced monitoring and analytics are used to assess how climate and disaster risks affect student performance. Findings show that real-time data integration enables targeted interventions.', tags: ['Education', 'Data'], image: img('training-5') },
  { type: 'Analysis', title: 'Bangladesh’s ESG Transition in 2025: Why It Lags India, Vietnam & ASEAN Peers', text: 'By examining multiple sectors, we uncover how embedding sustainability across operations delivers tangible economic, social and environmental returns.', tags: ['ESG', 'Competitiveness'], image: img('smokestacks') },
  { type: 'Case study', title: 'Transforming BMDF into a Next-Gen Municipal Financing Institution', text: 'IP3 led a transformation roadmap — redesigning governance, introducing innovative finance tools (PPPs, bonds), building institutional capacity and embedding a 10-year business plan.', tags: ['Municipal Finance', 'Institutional Reform'], image: img('dhaka') },
];

const convening = {
  eyebrow: 'Connecting policy, capital and implementation',
  h2: 'A convenor <em>between worlds.</em>',
  body: 'Complex reforms fail when ministries, development institutions, researchers, investors and implementers are solving different versions of the same problem. IP3 designs evidence-led dialogue and decision processes that bring those perspectives together around practical pathways to action.',
  items: [
    ['Policy dialogue', 'Structured conversations that move from diagnosis to decision, around a shared evidence base.'],
    ['Executive roundtables', 'High-level gatherings for strategic alignment, designed to produce concrete commitments.'],
    ['Investment forums', 'Curated events connecting capital to investment-ready pipelines.'],
    ['Technical working groups', 'Deep-dive sessions that produce technical outputs for policy and implementation.'],
    ['Research–policy translation', 'Processes that convert research findings into actionable policy options.'],
    ['Stakeholder consultations', 'Inclusive processes for legitimacy and uptake.'],
    ['Consensus-building processes', 'Facilitating agreement across diverse interests and ministries.'],
  ],
};

const partners = {
  clients: ['Asian Development Bank', 'PwC', 'Payra Port Authority', 'Bangladesh Municipal Development Fund', 'ICF International', 'SODEV', 'BUILD', 'Prokaushali Sangsad Ltd'],
  funders: ['World Bank', 'IFC', 'ADB', 'SIDA', 'WTO', 'European Commission'],
};

const testimonials = [
  { quote: 'Our partnership with IP3 Consulting exceeded every expectation. From research design and data collection to statistical modeling, stakeholder coordination, and impact-driven implementation, IP3 delivers the full spectrum of expertise — and real results.', name: 'Omar Faruk', role: 'PwC · Government Reform & Infrastructure Development (GRID)' },
  { quote: 'IP3’s expert brought a depth of expertise and agility that fundamentally transformed how we approach a next-gen institutional transformation… This wasn’t just a consultancy — it was a true partnership in building a resilient public institution for the future.', name: 'Ahmmad Zaman Tariq, PMP', role: 'Urban Development Specialist, Bangladesh Municipal Development Fund (BMDF)' },
];

const founder = {
  name: 'Mohammad Syful Hoque',
  role: 'Executive Chairman',
  tag: 'Economic policy & sustainability transformation expert',
  image: img('syful-hoque'),
  bio: [
    'Syful has 17 years of experience in economic policy and sustainability transformation, solving sustainability challenges in policy and practice. His work is characterized by deep knowledge of economic and development policy and sustainability consulting — championing the forefront of climate solutions, ESG excellence and the principles of a circular economy for long-term value creation.',
    'He has underpinned 75+ high-impact projects for global entities such as the World Bank, IFC, ADB, SIDA, W.T.O. and the European Commission, and has collaborated with over 30 international development organizations.',
  ],
  quote: 'IP3 Consulting isn’t just another policy or research institute — it’s a mission-driven impact accelerator. We turn intelligence into implementation, partnering with stakeholders at every level to build solutions that are not only visionary but viable.',
  expertise: ['Climate finance', 'ESG strategy', 'Circular economy', 'Biodiversity conservation', 'Trade & industrial growth', 'Technology adoption', 'Impact evaluation', 'Economic, social & environmental feasibility'],
};

const people = [
  { group: 'Board & Executive Leadership', members: [
    { name: 'Mohammad Syful Hoque', role: 'Executive Chairman', focus: 'Climate finance, climate adaptation & mitigation, sustainability, ESG strategy, circular economy & biodiversity conservation, trade, industrial growth, technology adoption, impact evaluation, economic, social & environmental feasibility' },
    { name: 'Md. Mazadul Hoque', role: 'Director (Policy & Advisory)', focus: 'Macroeconomic policy, fiscal & monetary policy, trade & FDI, regional connectivity, governance & transparency, migration, employment and development policy' },
  ] },
  { group: 'Advisors', members: [
    { name: 'Prof. Dr. Niaz Asadullah', role: 'Chief Economic Advisor', focus: 'Education, institutions, poverty, labor & gender' },
    { name: 'Prof. Dr. Shafiun Shimul', role: 'Policy Advisor (Lead Economist)', focus: 'Public health, policy & practice' },
    { name: 'Prof. Dr. M A Mannan', role: 'Senior Consulting Advisor', focus: 'Education, health, demography & social protection' },
  ] },
  { group: 'Founding Directors', members: [
    { name: 'Barr. Zareen Rahman', role: 'Founding Director', focus: 'Regulation, PPP formation & legal compliance' },
    { name: 'Adj. Prof. Harun Rashid', role: 'Founding Director', focus: 'Comparative politics, public policy & conflict management' },
    { name: 'Prof. Dr. Imran Mahmud', role: 'Founding Director', focus: 'Technology management, digital governance & system training, MIS & database management' },
    { name: 'Nizam Uddin Ahmed', role: 'Founding Director', focus: 'Data, financial and digital governance & system implementation' },
    { name: 'MD Shefatul Islam', role: 'Founding Director, Education & EdTech Policy & Innovation', focus: 'EdTech & blended-learning innovation, curriculum development & textbook authorship, digital capacity building & instructional design' },
  ] },
  { group: 'Deputy Directors', members: [
    { name: 'Dr. Tat Thanh Tran', role: 'Deputy Director (Practice Area Lead)', focus: 'Corporate finance & strategic investment, financial markets, institutions & R&D network policy' },
    { name: 'Dr. Md. Abu Zafor Sadek', role: 'Deputy Director (Practice Area Lead)', focus: 'Pharmaceutical industry dynamics, strategic market, product & biosimilars development' },
  ] },
  { group: 'Affiliated Research Scholars', members: [
    { name: 'Dr. Sibbir Ahmad', role: 'Affiliated Research Scholar', focus: 'Applied microeconomics (development, agriculture, labor, health & experimental economics)' },
    { name: 'Dr. Md. Latiful Haque', role: 'Affiliated Research Scholar', focus: 'Environmental, food systems & agricultural policy & practice' },
    { name: 'Asst. Prof. Siban Shahana', role: 'Affiliated Research Scholar', focus: 'Public policy economics, education & human resource development' },
    { name: 'Asst. Prof. Sazia Ahmed', role: 'Affiliated Research Scholar', focus: 'Agricultural, environmental & health economics' },
  ] },
  { group: 'Support Units', members: [
    { name: 'Zahidur Rahman', role: 'Practice Area Manager, IP3 Visual Lab', focus: 'Digital communication, data visualization & presentation design' },
    { name: 'Md. Sadid Uddin', role: 'Manager, Administration & Finance', focus: 'Administration & finance' },
  ] },
];

const about = {
  intro: [
    'The Institute for Public Policy and Practice (IP3) is a next-generation think tank and policy advisory firm founded in 2018 to transform how governments, multilaterals and communities in the Global South tackle today’s most urgent challenges. Unlike legacy consultancies bound by siloed expertise and static methods, IP3 combines systems thinking, data and digital ecosystems, and translational research to deliver adaptive, resilient solutions across the entire policy advisory value chain.',
    'As a translational policy studio, IP3 bridges visionary ideas and grounded execution. We accelerate policy design, co-implementation and continuous learning through cross-sectoral innovation and locally anchored practice — turning evidence and insight into measurable impact.',
  ],
  vision: { label: 'Our vision', title: 'Policy innovation for transformative, sustainable growth', text: 'We envision a future where governments, development partners, businesses and communities have the policies, institutions, data and capabilities to navigate complexity and create inclusive, resilient and sustainable growth. Policy innovation is more than designing better policies: it is building the systems that turn ambition into action — connecting evidence, institutional capacity, digital innovation, stakeholder intelligence and implementation.' },
  mission: { label: 'Our mission', title: 'Turning evidence, innovation and implementation into lasting impact', text: 'We help governments, multilaterals and development partners, private enterprises and communities solve overlapping, cascading and compounding policy and management challenges through translational research, strategic policy advisory, systems thinking, data-driven decision-making, action research and implementation support.' },
  aims: ['Strengthen resilient and effective institutions', 'Accelerate sustainable and circular economic transitions', 'Improve education systems and human capabilities', 'Enable data-driven and digitally empowered governance', 'Advance inclusive and equitable service delivery', 'Translate policy ambition into scalable, locally relevant solutions'],
  principles: { eyebrow: 'Founding principles', h2: 'Poly-crises demand <em>poly-solutions.</em>', text: 'In an era where AI intersects with climate, ESG overlaps biodiversity, and informal economies mesh with digital governance, single-axis approaches fail. IP3 was born to fill that gap: a practice-driven, cross-disciplinary platform built for the complexity of now — and the transformation of what’s next.' },
  lifecycle: [
    ['Diagnose', 'Map systems, institutions, incentives, data ecosystems, risks and underlying policy constraints.'],
    ['Co-design', 'Combine evidence, stakeholder knowledge and action research to develop practical policies, programs, regulatory frameworks and institutional solutions.'],
    ['Test & learn', 'Pilot interventions, experiment with delivery models, generate implementation evidence and adapt solutions to what works in practice.'],
    ['Implement & scale', 'Support institutional adoption, capacity development, digital and data systems, implementation and adaptive MERLA to strengthen performance over time.'],
  ],
  pillars: [
    ['Climate Action, ESG & Circular Economy', 'Translating sustainability ambition into practical strategies for climate action, ESG integration, circular-economy transition, climate finance, resilience and responsible growth.'],
    ['Education & Human Capacity Development', 'Action research, policy innovation, data, technology and systems thinking to support education reform, stronger learning systems, skills development and inclusive human development.'],
    ['Institutional Effectiveness, Data & Digital Governance', 'Strengthening governance, regulatory systems, organizational effectiveness, data ecosystems, digital transformation and service delivery.'],
  ],
  values: [
    ['People-centered collaboration', 'We foster trust, respect and empathy, building partnerships that are people-centered and truly collaborative — working side-by-side with our clients, from executives to technical experts.'],
    ['Bold innovation', 'We don’t just offer advice — we help reimagine possibilities, combining data-driven insights with social-science research to create systemic solutions that lead to transformative change.'],
    ['Genuine integrity', 'Our clients trust us because we are committed to delivering ethical, transparent and principled solutions.'],
    ['Flourish together', 'We don’t just work for clients — we work with them, investing time, empathy and expertise to create lasting value and ensure everyone benefits from the change we create.'],
    ['Championing diversity', 'Diverse voices at every level strengthen our ability to deliver creative, systemic solutions that resonate with all stakeholders.'],
  ],
  different: [
    ['Evidence that moves', 'Research is designed to inform decisions and implementation — not simply to produce another report.'],
    ['Systems, not silos', 'We connect policy, economics, institutions, technology, sustainability, data and implementation around the problem that needs to be solved.'],
    ['Global knowledge. Local intelligence.', 'International standards and emerging practices are translated into solutions suited to local institutional, political, economic and operational realities.'],
    ['Continuous learning', 'Implementation generates evidence. Evidence informs adaptation. Adaptation strengthens the path from pilot intervention to sustainable scale.'],
  ],
};

const faq = [
  ['What types of engagements does IP3 undertake?', 'Diagnostics, policy and program design, project preparation, implementation support, evaluations, convening processes and research partnerships. We work as prime consultant or subconsultant depending on the mandate.'],
  ['Does IP3 work as prime consultant or subconsultant?', 'Both. We lead assignments where our capabilities are the core requirement, and join larger multi-firm engagements as a specialist partner where our sector or technical expertise adds specific value.'],
  ['How do you approach quality assurance and fiduciary requirements?', 'Deliverables undergo internal peer review and senior technical review. We design our work to meet the fiduciary and safeguard expectations of multilateral and bilateral development partners.'],
  ['Can IP3 provide verified references?', 'Yes. References from previous clients are available on request, subject to confidentiality agreements where applicable.'],
  ['How quickly can IP3 mobilize a team?', 'This depends on scope and specialist requirements. Tell us the timeline and we will confirm a realistic mobilization plan when we respond.'],
  ['How does IP3 handle confidentiality and NDAs?', 'We routinely work under NDA and can execute client-specific confidentiality agreements before a proposal is submitted.'],
  ['What happens after I submit a message or consultation request?', 'Our team reviews every submission. For general messages you will receive an acknowledgment and response within one business day.'],
  ['Where is IP3 located for in-person consultations?', 'At our Dhaka office: Zenith Prime, House-39, Road-35/A, Gulshan-2, Dhaka-1212.'],
];

module.exports = { approach, hero, reassurance, mandates, stats, capabilities, whyIp3, sectors, translation, engagements, insights, convening, partners, testimonials, founder, people, about, faq, img, vid };
