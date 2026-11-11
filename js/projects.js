/*
 * Projects shown on the site, in this order.
 *
 * To add a project, copy one object below and change its values. Nothing else needs editing.
 *
 *   id          short unique name, lowercase with dashes (used in the page address)
 *   title       project name
 *   status      one of: "completed" | "prototype" | "hackathon" | "concept"
 *   statusNote  short honest label shown next to the status, e.g. "Prototype with demo data"
 *   context     where or why it was built (event, client, personal project)
 *   year        year it was built
 *   summary     one or two sentences: what it ACTUALLY does today
 *   highlights  list of things that work today (never planned features)
 *   honesty     what is simulated, fictional or not finished
 *   stack       real technologies, taken from the project's package files
 *   team        optional: who built it
 *   image       optional: { src: "assets/projects/<id>", alt: "...", caption: "..." }
 *               Save two WebP files: <id>.webp (1200x750) and <id>-sm.webp (640x400).
 *   featured    true shows a bigger card in the "All" view
 *   links       { live: "", repo: "" }; leave "" for private repositories or unpublished sites
 *   show        false hides the project without deleting it
 */
window.PROJECTS = [
  {
    id: "thutovest",
    title: "ThutoVest",
    status: "hackathon",
    statusNote: "Prototype with demo data",
    context: "FNB App of the Year Hackathon 2026 · Access to Higher Education",
    year: 2026,
    summary:
      "Walks a South African matriculant from choosing a course to starting first year: a personal plan, early warnings before a deadline, document or funding gap becomes a problem, and verified sponsors who pay the institution directly.",
    highlights: [
      "Personal plan with one next best action, and course matches by field, APS, budget and province",
      "Risk Radar warnings and a Funding Gap Solver covering NSFAS, ISFAP, Funza Lushaka, university aid and loans",
      "Sponsor portal: ranked candidates, offers, document review, and payment that only ever goes to the institution",
      "Fair-funding and under-18 guardian-consent rules enforced on the server, not in the browser",
      "Student and sponsor screens update live; students low on data can follow along on WhatsApp",
      "Real, sourced data: all 26 public universities, all 50 public TVET colleges and the DHET private college register"
    ],
    honesty:
      "Prototype. Every sponsor, student and award is fictional and labelled as demo data. Identity checks, bank checks and payments are simulated.",
    stack: ["React 19", "TypeScript", "Vite", "Tailwind CSS 4", "Supabase", "PostgreSQL", "Edge Functions", "Twilio WhatsApp"],
    team: "Team Thuto: Samalani Maluwa, Reshoketswe Makhura and Tebogo Sasa",
    image: {
      src: "assets/projects/thutovest",
      alt: "ThutoVest home page: \"From I want to study to I can graduate\", beside a demo student's pathway with a funding gap of R92,400",
      caption: "Home page of the live demo"
    },
    featured: true,
    links: {
      live: "https://thutovest.vercel.app",
      repo: "https://github.com/SamkiDev/thutovest"
    },
    show: true
  },
  {
    id: "askthuso",
    title: "AskThuso",
    status: "hackathon",
    statusNote: "2nd place · prototype",
    context: "UNISA ICT Agentic AI Hackathon · team project",
    year: 2026,
    summary:
      "An agentic AI financial caseworker for UNISA student finance. It investigates a student's payment before anyone escalates it, says which known failure mode the payment hit and what to do, and hands finance staff a complete case when a person is really needed.",
    highlights: [
      "A five-stage payment investigation with seven possible outcomes, run as a durable Temporal workflow",
      "A scheduled agent that works the unallocated payment pool every working day at 06:00, with nobody present",
      "Rules decide every money outcome; the language model (Groq) only reads documents and writes the wording",
      "An authority model with live policy switches: turn off autonomous posting and every allocation becomes a draft for a person",
      "Working-day arithmetic that knows public holidays and the university shutdown, and a hash-chained audit log",
      "105 tests over the decision engine and workflow boundary, plus an end-to-end smoke test"
    ],
    honesty:
      "Prototype. Every student, payment and document is fictional; the banking file, mailbox and student system are simulated. Sign-in is not built yet.",
    stack: ["React", "TypeScript", "Vite", "TanStack Router", "Tailwind CSS", "Python", "FastAPI", "Temporal", "PostgreSQL", "Supabase", "Groq", "Docker"],
    team: "Built as a team",
    image: {
      src: "assets/projects/askthuso",
      alt: "AskThuso Autonomous Operations console: 14 actions taken without a person, an agent activity log with the tool behind each action, and switches for what the agent may do alone",
      caption: "Autonomous Operations console after one daily cycle, running locally with fictional data"
    },
    featured: true,
    links: { live: "", repo: "" },
    show: true
  },
  {
    id: "thengesa",
    title: "Thengesa",
    status: "prototype",
    statusNote: "In development · not deployed",
    context: "Personal project",
    year: 2026,
    summary:
      "A phone-first business assistant for spaza shops and small township retailers. It turns recorded sales, expenses and stock purchases into plain-language decisions: what to restock, how much cash that needs, and which products are losing money.",
    highlights: [
      "Record sales (cash or digital), running expenses and stock purchases from a phone",
      "Insights for low stock, products sold below cost, sales trends and unusual expenses, each with a \"Show the working\" panel",
      "A 7-day restock list with the estimated cash needed",
      "Says so when there is too little data, instead of guessing",
      "On-device accounts (salted PBKDF2-SHA256) and a separate database per business; money kept in whole cents",
      "Guided scenarios in a fictional demo shop, and unit tests for the calculation engine"
    ],
    honesty:
      "Not deployed yet. Records stay on one device with no backup or export so far. The demo shop and its prices are fictional.",
    stack: ["React 19", "TypeScript", "Vite", "IndexedDB", "Web Crypto", "Node test runner"],
    image: {
      src: "assets/projects/thengesa",
      alt: "Three phone screens from the Thengesa demo shop: a restock plan needing R2,067.16, today's sales of R212.34, and the stock list with days of stock left",
      caption: "Restock plan, home and stock screens in the demo shop"
    },
    links: { live: "", repo: "" },
    show: true
  },
  {
    id: "green-valley-online",
    title: "Green Valley Online",
    status: "prototype",
    statusNote: "MVP with demo data",
    context: "E-commerce MVP for a Johannesburg shopping centre",
    year: 2026,
    summary:
      "An e-commerce and local-delivery MVP for the Green Valley shopping centre in Johannesburg. Customers browse stores, order and track delivery; store staff, drivers and admins each have their own portal.",
    highlights: [
      "Storefront, checkout and order tracking, with a map for drivers",
      "Separate portals for admins, store staff and drivers, with role checks on every route",
      "Vallerie, a shopping assistant with a built-in basic mode and optional AI answers through the Anthropic API",
      "Paystack payment flow, tested against a mock Paystack; demo payments by default",
      "Security basics done properly: bcrypt, httpOnly cookie sessions, rate limits, zod validation and a strict Content-Security-Policy",
      "147 API checks and Playwright browser tests (desktop and phone) running in GitHub Actions"
    ],
    honesty:
      "MVP. Prices, people, payments and delivery tracking are demo data. No real money is processed.",
    stack: ["React 19", "TypeScript", "Vite", "Tailwind CSS 4", "TanStack Query", "Leaflet", "Express", "Prisma", "PostgreSQL", "Zod", "Playwright"],
    image: {
      src: "assets/projects/green-valley-online",
      alt: "Green Valley Online home page: \"Your local shopping centre, delivered to your door\", with the list of stores at the centre",
      caption: "Storefront home page, running locally with demo data"
    },
    links: { live: "", repo: "" },
    show: true
  },
  {
    id: "evans-photography",
    title: "Evans Photography",
    status: "completed",
    statusNote: "Client website · launch steps pending",
    context: "Website for a photography studio in Alberton",
    year: 2026,
    summary:
      "A fast static website for a photography studio: a filterable portfolio, services with starting prices, and a booking form that prepares a WhatsApp message.",
    highlights: [
      "Portfolio filters, with a photo shown only once the owner (and a parent, for children) has given permission",
      "Booking form that prepares a WhatsApp message with only the details filled in; it never claims a booking is confirmed",
      "Photos converted to WebP in two sizes; security headers and caching set for Cloudflare hosting",
      "Playwright tests and screenshots at six screen sizes"
    ],
    honesty:
      "Built and hosted on Cloudflare. The custom domain, real reviews and the privacy notice review are still to do before launch.",
    stack: ["HTML", "CSS", "JavaScript", "Cloudflare", "Playwright"],
    image: {
      src: "assets/projects/evans-photography",
      alt: "Evans Photography \"Book a Session\" section with WhatsApp and call buttons, FAQs and a booking form",
      caption: "The booking section"
    },
    links: { live: "", repo: "" },
    show: true
  },
  {
    id: "buhle-park-secondary",
    title: "Buhle Park Secondary School website",
    status: "prototype",
    statusNote: "Proposal · not approved by the school",
    context: "Proposed website for a Germiston high school",
    year: 2026,
    summary:
      "A proposed school website with news, events, a photo gallery, admissions and contact pages, a Speak up page for anonymous reports, and a staff dashboard.",
    highlights: [
      "Staff dashboard built with Payload CMS: enquiries, news, events, newsletters and photos, with roles for administrators, editors and teachers",
      "Anonymous Speak up reports with case codes, visible only to the safeguarding officer (or the SGB chair for reports about staff)",
      "A photo stays hidden until someone confirms it shows no identifiable learners, or that consent was given",
      "Playwright tests with automated accessibility checks (axe)"
    ],
    honesty:
      "Demonstration build. The school has not approved it and it is not published. Forms run in demo mode.",
    stack: ["Next.js 16", "React 19", "TypeScript", "Payload CMS 3", "PostgreSQL", "Zod", "Playwright", "axe-core"],
    image: {
      src: "assets/projects/buhle-park-secondary",
      alt: "Proposed Buhle Park Secondary School home page with the school name and motto over a photo of the school building, under a demonstration-website banner",
      caption: "Home page of the demonstration build"
    },
    links: { live: "", repo: "" },
    show: true
  },
  {
    id: "clinicflow-ai",
    title: "ClinicFlow AI",
    status: "concept",
    statusNote: "Not started yet",
    context: "Huawei Innovation Challenge",
    year: 2026,
    summary:
      "My planned entry for the Huawei Innovation Challenge. The build has not started yet; this card will grow as the work does.",
    highlights: [],
    honesty: "Concept only. There is no code or demo yet.",
    stack: [],
    links: { live: "", repo: "" },
    show: true
  }
];
