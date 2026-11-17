export const INSTAGRAM_URL = "https://www.instagram.com/jahjah.webdigital.lb/";

export type Project = {
  slug: string;
  name: string;
  category: string;
  /** Short, truthful outcome tag — what the site actually does, never a fabricated result. */
  outcome: string;
  description: string;
  url: string;
  image: string;
  year: string;
  /** Where the business operates, as shown on its own live website. */
  market?: string;
  /** True for restaurant / food-service work — used to order sales proof first. */
  restaurant?: boolean;
  challenge: string;
  whatWeBuilt: string[];
  /** The customer journey a visitor can test on the live site, step by step. */
  journey?: string[];
  businessValue: string;
};

// Every claim below was checked against the client's live website. Do not add
// performance numbers, reviews or results unless the client has approved them.
export const projects: Project[] = [
  {
    slug: "wholesome-craft",
    name: "Wholesome Craft Resto Café",
    category: "Restaurant & Reservations",
    outcome: "Menu, table reservations and online ordering",
    description:
      "A farm-to-table resto café website in El Mina with the menu, table reservations, online ordering and private-event enquiries in one place.",
    url: "https://wholesomecraft.life/",
    image: "/images/wholesomecraft.jpg",
    year: "Live",
    market: "El Mina, Lebanon",
    restaurant: true,
    challenge:
      "A premium resto café needed guests to see the food, feel the atmosphere and then act — reserve a table, view the menu, order or ask about an event — without hunting through Instagram.",
    whatWeBuilt: [
      "Reserve-a-table flow from every key section",
      "Full menu with dish photography",
      "Online ordering entry point",
      "Occasions & private-events enquiries",
      "Location and directions for El Mina",
    ],
    journey: ["Discover the café", "View the menu", "Reserve a table or order", "Find the location"],
    businessValue:
      "Every visit ends in a clear next step — a reservation, an order or an event enquiry — instead of a DM that may never be answered.",
  },
  {
    slug: "sweet-spot-lebanon",
    name: "The Sweet Spot",
    category: "Desserts · Multi-branch",
    outcome: "Online ordering for pickup or delivery",
    description:
      "A dessert brand website with a categorised menu, featured picks, offers and online ordering for pickup or delivery across its Lebanese branches.",
    url: "https://sweetspotlebanon.today/",
    image: "/images/sweetspot.jpg",
    year: "Live",
    market: "Tripoli, Lebanon · multiple branches",
    restaurant: true,
    challenge:
      "A dessert and drinks business with several branches needed customers to browse the menu and place an order from their phone in seconds — without queueing or calling.",
    whatWeBuilt: [
      "Browse-by-category digital menu",
      "Featured picks and offers sections",
      "Online ordering for pickup or delivery",
      "Branch locations page",
      "WhatsApp and contact paths",
    ],
    journey: ["Browse by category", "Pick featured items", "Order for pickup or delivery", "Choose the branch"],
    businessValue:
      "Featured picks and offers sit inside the ordering journey, so customers see the products the business wants to sell before they check out.",
  },
  {
    slug: "al-afandi-chicken",
    name: "Afandi Chicken",
    category: "Restaurant Ordering",
    outcome: "Bilingual delivery & takeaway ordering",
    description:
      "An Arabic/English ordering website with a categorised menu, item options, delivery or takeaway selection, cart and an order-again shortcut.",
    url: "https://alafandi-chicken.com/",
    image: "/images/alafandi.jpg",
    year: "Live",
    market: "Lebanon",
    restaurant: true,
    challenge:
      "A fried-chicken restaurant with a large menu — combos, family meals, burgers, wraps, kids meals — needed customers to find their meal fast and order without calling.",
    whatWeBuilt: [
      "Arabic / English menu and ordering",
      "Delivery or takeaway selection",
      "Item options (e.g. regular or spicy)",
      "Family meals, kids and combo categories",
      "“Recently viewed & order again” shortcut",
    ],
    journey: ["Choose delivery or takeaway", "Pick a category", "Customise the item", "Add to cart and order"],
    businessValue:
      "Family meals and combos are one tap away and returning customers can re-order quickly — the two habits that grow basket size and repeat orders.",
  },
  {
    slug: "bloom-outlet",
    name: "Bloom Outlet",
    category: "Fashion & E-commerce",
    outcome: "Large-catalogue e-commerce experience",
    description:
      "A large-catalogue retail experience with editorial styling, structured navigation and a search-first path to products.",
    url: "https://www.bloom-outlet.com/",
    image: "/images/bloomoutlet.jpg",
    year: "Live",
    challenge:
      "A fashion retailer with a large, fast-moving catalogue needed shoppers to find what they want quickly, without the site feeling cluttered.",
    whatWeBuilt: [
      "Structured category navigation",
      "Search-first product discovery",
      "Editorial-style product presentation",
      "A large catalogue that stays fast to browse",
    ],
    businessValue:
      "Shoppers can move from 'just looking' to a specific product in a few taps, across a catalogue large enough that this is genuinely hard to get right.",
  },
];

export const services = [
  {
    title: "A website that makes sense",
    description: "Custom-designed and built around your business — not a theme adjusted to fit it.",
  },
  {
    title: "Online stores that sell",
    description:
      "Product pages, checkout and catalogue structure built for people to actually buy.",
  },
  {
    title: "A tired website, rebuilt",
    description:
      "We rebuild outdated sites so the experience finally matches the business behind it.",
  },
  {
    title: "Booking, ordering & tools",
    description:
      "Reservation systems, order flows and small back-office tools built around how you actually work.",
  },
  {
    title: "Design that guides people",
    description:
      "Clear layouts and an obvious next step — for customers who are deciding in seconds.",
  },
  {
    title: "Fast on the phones your customers use",
    description:
      "Most visitors arrive on a phone, on real-world connections. We build for that reality first.",
  },
  {
    title: "Support after launch",
    description:
      "Updates, small changes and improvements so the site keeps working for you over time.",
  },
];

/** "Solutions by business type" — homepage entry points. */
export type IndustrySolution = {
  key: string;
  label: string;
  blurb: string;
  features: string[];
};

export const industrySolutions: IndustrySolution[] = [
  {
    key: "restaurants",
    label: "Restaurants & Cafés",
    blurb: "A menu people can browse in seconds, and a clear way to order.",
    features: ["Digital menu", "WhatsApp ordering", "Locations & hours", "Mobile-first"],
  },
  {
    key: "beauty",
    label: "Beauty & Wellness",
    blurb: "A site that makes booking an appointment feel effortless.",
    features: ["Service menu", "Booking requests", "Before/after gallery", "WhatsApp contact"],
  },
  {
    key: "retail",
    label: "Retail & Fashion",
    blurb: "Products presented properly, with an easy way to shop.",
    features: [
      "Product catalogue",
      "Lookbook-style galleries",
      "Store locations",
      "Instagram integration",
    ],
  },
  {
    key: "ecommerce",
    label: "E-commerce",
    blurb: "A store built for browsing, trust and checkout — at any catalogue size.",
    features: ["Product search", "Cart & checkout", "Reviews-ready", "Order tracking"],
  },
  {
    key: "professional",
    label: "Professional Services",
    blurb: "A site that builds credibility before the first conversation.",
    features: ["Services overview", "Inquiry / quote forms", "Case studies", "Team presentation"],
  },
  {
    key: "clinics",
    label: "Clinics & Practices",
    blurb: "Clear information and an easy way to request an appointment.",
    features: [
      "Services & specialties",
      "Appointment requests",
      "Location & hours",
      "Trust & credentials",
    ],
  },
  {
    key: "hospitality",
    label: "Hotels & Hospitality",
    blurb: "A site that makes people want to book — and makes it easy to.",
    features: ["Rooms / experiences", "Booking inquiries", "Gallery", "Multilingual-ready"],
  },
  {
    key: "growing-brands",
    label: "Growing Brands",
    blurb: "A serious digital home for a business that's outgrown its old site.",
    features: ["Brand presentation", "Lead capture", "Analytics", "Room to grow"],
  },
];

export const howItWorks = [
  {
    step: "01",
    title: "Show us your business",
    description:
      "Send your Instagram, current website, Google Maps page — or just tell us about the business.",
  },
  {
    step: "02",
    title: "Choose what fits",
    description:
      "We help you choose the package and features that make sense for where you are right now.",
  },
  {
    step: "03",
    title: "We build and launch",
    description: "You review it, we refine it together, and your new website goes live.",
  },
];

export const processSteps = [
  {
    step: "01",
    title: "Discover",
    description:
      "We learn your business, audience, offer and competitors before a single pixel is placed.",
  },
  {
    step: "02",
    title: "Strategy",
    description:
      "Structure, page architecture, messaging priorities and the actions we want visitors to take.",
  },
  {
    step: "03",
    title: "Design",
    description:
      "A custom visual direction built around your brand, refined until it feels unmistakably yours.",
  },
  {
    step: "04",
    title: "Build",
    description:
      "Clean, modern development with responsive behaviour and performance treated as a requirement.",
  },
  {
    step: "05",
    title: "Test",
    description:
      "Cross-device, cross-browser and accessibility checks — every link, form and breakpoint verified.",
  },
  {
    step: "06",
    title: "Launch",
    description:
      "Deployment, handover, documentation and support while your new site settles into the world.",
  },
];

export const comparison = [
  {
    topic: "Starting point",
    template: "A pre-made theme thousands of businesses already use",
    studio: "Strategy built around your market, offer and goals",
  },
  {
    topic: "Visual direction",
    template: "Generic layouts and stock styling",
    studio: "A custom art direction created for your brand alone",
  },
  {
    topic: "Responsive experience",
    template: "Desktop-first, squeezed onto mobile",
    studio: "Designed mobile-first, refined on every breakpoint",
  },
  {
    topic: "Performance",
    template: "Bloated plugins and slow loading",
    studio: "Lean builds, optimised media, fast first impressions",
  },
  {
    topic: "Conversion",
    template: "No clear path to contact or purchase",
    studio: "Deliberate conversion paths on every page",
  },
  {
    topic: "Measurement",
    template: "No visibility into what visitors do",
    studio: "Analytics configured so decisions are informed",
  },
  {
    topic: "After launch",
    template: "You are on your own",
    studio: "Launch support, handover and ongoing improvement",
  },
];

export const whyPoints = [
  {
    title: "Direct communication",
    description:
      "You speak with the people building your site. No account layers, no lost context.",
  },
  {
    title: "Custom builds",
    description:
      "Every project is designed and developed for its business — never recycled from a template.",
  },
  {
    title: "Business-first thinking",
    description:
      "Design decisions are made against commercial goals: credibility, inquiries and sales.",
  },
  {
    title: "Fast, modern experiences",
    description:
      "Speed, clarity and smooth interaction on the devices your customers actually use.",
  },
  {
    title: "Ownership",
    description: "The site is yours — your domain, your content, your assets, fully handed over.",
  },
  {
    title: "Launch support",
    description: "We stay involved through launch and beyond, so nothing is left half-finished.",
  },
];

export const needOptions = [
  "New website",
  "Website redesign",
  "E-commerce store",
  "Custom web application",
  "Digital Menu / Ordering System",
  "Reservation System",
  "UI/UX design",
  "Performance & SEO",
  "Maintenance & growth",
  "Not sure yet",
  "Other",
];

/**
 * Independent, third-party research — every entry here was verified against
 * its primary source before being added. Never edit the number/claim without
 * re-checking the source. Framed as observed study findings, never as a
 * promise about any individual business's results.
 */
export type EvidenceItem = {
  headline: string;
  stat: string;
  context: string;
  source: string;
  sourceUrl: string;
  year: string;
};

export const evidenceItems: EvidenceItem[] = [
  {
    headline: "Speed changes what people do next",
    stat: "53%",
    context:
      "of mobile site visits were abandoned if a page took longer than 3 seconds to load, per Google's mobile-speed research.",
    source: 'Google, "The Need for Mobile Speed"',
    sourceUrl:
      "https://www.thinkwithgoogle.com/marketing-strategies/app-and-mobile/mobile-page-speed-new-industry-benchmarks/",
    year: "2016",
  },
  {
    headline: "Small speed gains, measurable movement",
    stat: "+8.4%",
    context:
      "was the observed increase in retail conversions (and +9.2% in average order value) linked to a 0.1-second mobile speed improvement, across 4 weeks of data from European and US retail sites.",
    source: 'Deloitte, commissioned by Google — "Milliseconds Make Millions"',
    sourceUrl:
      "https://www.deloitte.com/ie/en/services/consulting/research/milliseconds-make-millions.html",
    year: "2020",
  },
  {
    headline: "Search is where trust starts in this region",
    stat: "77%",
    context:
      "of surveyed consumers in the UAE and Saudi Arabia said Google Search is their first touchpoint when looking for information before a purchase.",
    source: 'Google × Kantar, "The Emotional Value of Search" (UAE & KSA, n=4,000)',
    sourceUrl:
      "https://business.google.com/en-all/think/consumer-insights/consumer-behavior-emotional-buying-mena/",
    year: "2022",
  },
];

export const faqs = [
  {
    q: "Do you take a commission on our orders?",
    a: "No. Restaurant packages are a fixed one-time build price ($299 landing page, $699 menu & ordering system, $1,299 with marketing & SEO) plus Website Care & Hosting after launch ($99/month, or $149/month for Advanced). There is no per-order commission.",
  },
  {
    q: "Do we have to leave Talabat, Toters or other delivery apps?",
    a: "No. Many restaurants keep marketplaces for discovery and add a direct channel for regulars, Instagram followers and QR or dine-in guests. You decide the mix; the direct channel simply means those orders don't pay a marketplace commission.",
  },
  {
    q: "How do orders reach us?",
    a: "From the Menu & Ordering package up, the customer builds a structured order — items, options, branch and their details — and it is submitted to you directly or handed to WhatsApp, instead of starting from an empty chat.",
  },
  {
    q: "Can the menu be in Arabic and English, with reservations and several branches?",
    a: "Yes. Bilingual ordering and multi-branch selection are live on Al Afandi Chicken Dubai. A second language, a reservation system or an extra branch is added as a $50 feature where your package doesn't already include it.",
  },
  {
    q: "Is the restaurant demo really free?",
    a: "Yes. Send your restaurant name and Instagram or website. We review your public menu and ordering journey and show you a restaurant-specific direction. There's no obligation to buy.",
  },
  {
    q: "Do I need to know exactly what I want before we start?",
    a: "No. Send us your Instagram, current website or Google Maps page and a short description — we'll help you figure out the rest, including which package fits.",
  },
  {
    q: "How long does a project usually take?",
    a: "It depends on the package and how quickly we get your content and feedback, but most projects move from kickoff to a live site within a few weeks.",
  },
  {
    q: "Can I pay from outside Lebanon?",
    a: "Yes. Pricing is in USD and payment is handled through Whish Money today, with clear instructions and manual confirmation on our side.",
  },
  {
    q: "What if I want more than what's included in a package?",
    a: "Add-ons are transparent and priced individually — you'll see the exact total before you pay, and can add features like extra languages, booking systems or an admin dashboard.",
  },
  {
    q: "Do I own the website afterward?",
    a: "Yes. The domain, content and assets are yours. We don't lock you into a platform you don't control.",
  },
  {
    q: "We're not based in Lebanon — can you still work with us?",
    a: "Yes — the studio is based in Lebanon and works with businesses worldwide, remotely, with clear communication and USD pricing throughout.",
  },
];
