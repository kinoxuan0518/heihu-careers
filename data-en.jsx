/* global window */
// ============ Heihu Careers v2 · Data (EN) ============

const VALUES = [
  { idx: "01", title: "Intelligent Humility", meta: "In factories, the wisest people often wear work uniforms. We listen first, ask first, learn first — then speak." },
  { idx: "02", title: "Pragmatic Optimism", meta: "We believe Chinese manufacturing deserves better tools. But belief isn't a slogan — it's a scheduling algorithm, an on-site debug session, an iteration after overtime." },
  { idx: "03", title: "Grow on the Factory Floor", meta: "We embed in workshops, production lines, and beside engineers' screens. Real insight comes from the factory floor, not the boardroom." },
  { idx: "04", title: "Make Complexity Simple", meta: "Manufacturing is complex. Our job is to make it so a frontline worker gets it at a glance, and a manager instantly sees what's happening." },
];

const JOBS = [
  { id: "eng-001", title: "Senior Frontend Engineer · Production Collaboration", team: "Product & Engineering", category: "Engineering", loc: "Shanghai / Remote", type: "Full-time", level: "P6-P7",
    desc: "Own the core frontend architecture of Blacklake's manufacturing product line. Work alongside product managers and manufacturing experts to craft workshop workstations.",
    resp: ["Lead architecture design & evolution of core business modules", "Co-create the workshop workstation experience with product & design", "Drive component library and performance baseline improvements", "Mentor a team of 3-5 engineers"],
    req: ["5+ years frontend experience, proficient in React / TypeScript", "Deep hands-on experience with complex state management & performance optimization", "ToB, industrial, or collaboration product experience preferred", "Willing to visit factory sites regularly"] },
  { id: "eng-002", title: "Production Scheduling Algorithm Engineer", team: "AI · Intelligent Scheduling", category: "Engineering", loc: "Shanghai", type: "Full-time", level: "P6",
    desc: "Design and deploy intelligent scheduling, dispatch, and material flow algorithms for discrete and process manufacturing scenarios.",
    resp: ["Model real-world factory scheduling, changeover, and material constraints", "Design hybrid heuristic / OR / RL solving strategies", "Debug and launch algorithms on-site with customer engineers until production is stable"],
    req: ["Operations Research / OR / Mathematical Optimization background", "Familiar with CP-SAT, Gurobi, or OR-Tools", "Real project deployment experience in manufacturing or scheduling preferred"] },
  { id: "pd-001", title: "Senior Product Manager · MES", team: "Product", category: "Product", loc: "Shanghai / Shenzhen", type: "Full-time", level: "P6",
    desc: "Own product planning for the Manufacturing Execution System (MES), accountable for key business metrics on the factory floor.",
    resp: ["Deep-dive into factory operations to understand real pain points", "Define product roadmap; deliver requirements, prototypes, and documentation", "Ship features to production lines alongside engineering, delivery & customers"],
    req: ["3+ years ToB product experience", "Manufacturing / supply chain / ERP / MES background preferred", "Willing to spend at least 1 week per month on-site at factories"] },
  { id: "des-001", title: "Senior Product Designer", team: "Design", category: "Design", loc: "Shanghai", type: "Full-time", level: "P6",
    desc: "Design cross-screen production collaboration experiences for frontline workers, team leads, and factory managers.",
    resp: ["Lead end-to-end experience design for core scenarios, from research to launch", "Co-build the component library and data visualization standards with engineering", "Contribute to brand, recruitment, and marketing visual direction"],
    req: ["5+ years product design experience, able to independently lead complex projects", "Genuine preference and experience with data-intensive, tool-type products", "Portfolio that clearly articulates decision-making processes"] },
  { id: "cs-001", title: "Customer Success Manager · East China", team: "Customer Success", category: "Delivery", loc: "Suzhou / Changzhou", type: "Full-time", level: "P5",
    desc: "As the customer's primary owner, help them truly adopt and extract value from Blacklake's products.",
    resp: ["Own renewal & expansion for a vertical / regional customer portfolio", "On-site presence at critical milestones, driving transformation with factories", "Bring frontline feedback back to the product team"],
    req: ["3+ years ToB customer success or consulting experience", "Manufacturing / supply chain background preferred", "Comfortable with frequent travel"] },
  { id: "ops-001", title: "Solutions Consultant · Automotive", team: "Solutions", category: "Solutions", loc: "Shanghai / Guangzhou", type: "Full-time", level: "P6",
    desc: "For automotive and parts customers, codify industry know-how into replicable solutions.",
    resp: ["Lead pre-sales solution design and customer presentations", "Document industry solutions, best practices, and standardized capabilities", "Co-plan industry-specific product versions with the product team"],
    req: ["5+ years in automotive / auto parts industry", "Familiarity with APQP / PPAP / IATF systems preferred", "OEM or Tier 1 work background strongly preferred"] },
  { id: "data-001", title: "Data Scientist · Quality Analytics", team: "AI", category: "Engineering", loc: "Shanghai", type: "Full-time", level: "P6",
    desc: "Build quality prediction and defect root-cause analysis capabilities based on factory-collected data.",
    resp: ["Design the algorithmic framework for quality analysis & defect attribution", "Deploy models to production lines with on-site engineers", "Document reusable analytics assets"],
    req: ["Statistics / ML background, solid SQL / Python skills", "Hands-on experience with time-series or industrial data preferred"] },
  { id: "hr-001", title: "HRBP · Engineering", team: "People", category: "HR", loc: "Shanghai", type: "Full-time", level: "P5",
    desc: "Support the engineering organization in hiring, talent development, and organizational effectiveness.",
    resp: ["Understand the business; participate in talent reviews and org design", "Drive leadership development and team building for engineering leaders", "End-to-end recruiting for critical roles"],
    req: ["3+ years HRBP experience supporting engineering / technical teams", "Rational, empathetic; able to iterate on the organization as a product"] },
  { id: "intern-001", title: "Product Design Intern (Class of 2026)", team: "Design", category: "Internship", loc: "Shanghai", type: "Internship", level: "Intern",
    desc: "Work on real factory products alongside senior designers. Not exercises.",
    resp: ["Participate in real projects under senior designer mentorship", "Own component, visualization, and micro-interaction polish", "Join factory visits, user interviews, and research"],
    req: ["Available 4+ days/week for 3+ months", "Strong interaction / visual fundamentals with a clear portfolio narrative"] },
];

const CATEGORIES = ["All", "Engineering", "Product", "Design", "Solutions", "Delivery", "HR", "Internship"];
const LOCATIONS = ["All Cities", "Shanghai", "Shenzhen", "Guangzhou", "Suzhou / Changzhou", "Remote"];

const STORIES = [
  { name: "Icy", fullName: "Icy · Employee No.3", role: "Commercial · 9 years", quote: "It was the mission that first attracted me. Later we'd have heated debates about fold-ear-root, get excited about cosplay at the annual party. Candid, simple, open, fun — I can't find a reason to leave.", team: "Commercial" },
  { name: "Shaw", fullName: "Shaw · Head of Marketing", role: "Brand · 8 years", quote: "My resume was 4,000 words, red-bolded, and got thrown in the trash. Then it got fished back out. The recruiter said: this person is either a genius or genuinely eccentric.", team: "Marketing" },
  { name: "Leo", fullName: "Leo · South China AM", role: "Field Sales · 4 years", quote: "Getting chased out by security, getting scolded by a factory boss — totally normal. Freezing rain, broken car AC, soaked through, still out there hustling — all for the win.", team: "Sales" },
  { name: "Jenny", fullName: "Jenny · AI Product Lead", role: "AI Manufacturing · 2 years", quote: "To explore AI-driven flexible quick-turn, I gave up my Shanghai apartment, shipped my Tesla to Dongguan, and embedded in the workshop. When rush orders came, I sat on the line packing with workers.", team: "AI Manufacturing" },
  { name: "Peter", fullName: "Peter · Data Scientist", role: "Algorithms · 3 years", quote: "The order-splitting agent hit 92% accuracy — about 8 out of 100 steps go wrong. A veteran worker spends 15 minutes correcting, instead of 2-3 hours before. Those corrections get recorded, forming a second round of learning.", team: "AI" },
  { name: "Kevin", fullName: "Kevin · Overseas Delivery", role: "Mexico Project · 1 year", quote: "Stationed in Puebla, Mexico — no Chinese food for a month, too dangerous to go out at night. The warehouse manager lady said: because of Blacklake's product, she walks less in the warehouse now. She's gained weight.", team: "Overseas" },
];

const PERKS = [
  { idx: "01", t: "Field Subsidies & Travel", d: "Full reimbursement for factory trips; extra workshop allowances. The intelligence gained is never something we skimp on." },
  { idx: "02", t: "AI Budget", d: "No fixed cap. Any useful AI tool is reimbursable — we think this investment always pays off." },
  { idx: "03", t: "Equity & Long-term", d: "We believe in doing something hard and right for the long run." },
  { idx: "04", t: "Health & Time Off", d: "Full social insurance + supplemental medical; annual check-up; family coverage; 15 days PTO increasing annually; extra benefit leave." },
  { idx: "05", t: "Equipment", d: "Mac of your choice, ultrawide monitors. We'll set up your productivity tools properly." },
  { idx: "06", t: "AI Bonus & Community", d: "Bi-monthly cash bonus — help the team, get rewarded. Internal AI sharing culture with occasional Silicon Valley guest visits." },
];

const PLACES = [
  { label: "Shanghai · Changning, 333 Wuyi Rd", n: "01" },
  { label: "Shenzhen · Nanshan", n: "02" },
  { label: "Suzhou · Industrial Park", n: "03" },
  { label: "On-site · Customer Factories", n: "04" },
  { label: "Mexico · Puebla", n: "05" },
];

// ── Hero Stats ──
const HERO_STATS = [
  { k: "Factories Served", v: "40000", unit: "+", countUp: true },
  { k: "SaaS MES Market Share", v: "52.7", unit: "%", countUp: true },
  { k: "Offices", v: "5", unit: "", countUp: false },
  { k: "Founded", v: "2016", unit: "", countUp: false },
];

// ── Client Logos ──
const CLIENTS = [
  "Tesla Supply Chain", "GAC Group", "Nongfu Spring", "China Resources", "Mixue",
  "Mengniu Dairy", "Crayon Shin-chan Foods", "Food & Beverage", "Auto Parts", "Precision Electronics", "Home Appliances", "FMCG",
];

const FAQS = [
  { q: "What type of customers does Blacklake serve?", a: "Discrete and process manufacturing factories — spanning automotive, new energy, food & beverage, precision electronics, chemicals, and more. Our clients include Tesla's supply chain, GAC Group, Nongfu Spring, and Mixue, as well as tens of thousands of SME manufacturers with 20-100 employees." },
  { q: "How is Blacklake different from other industrial software companies?", a: "We're #1 in China's SaaS MES market (52.7% share), and one of the few companies genuinely deploying AI Agents in real manufacturing scenarios." },
  { q: "Do I need to visit factories often?", a: "Depends on the role. Product, Solutions, and Customer Success involve significant on-site time — we've had 'go to the factory' in our DNA since day one. R&D teams arrange quarterly factory visits as well." },
  { q: "What does the interview process look like?", a: "Typically: Resume → Phone screen → 2-3 technical/business rounds → Leader round. We aim to complete the entire process within 1-2 weeks." },
  { q: "What if I don't see a role that fits?", a: "If none of our current openings fit — you can create your own role." },
];

Object.assign(window, { VALUES, JOBS, CATEGORIES, LOCATIONS, STORIES, PERKS, PLACES, FAQS, HERO_STATS, CLIENTS });
