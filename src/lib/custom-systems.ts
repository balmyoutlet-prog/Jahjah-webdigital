export type CustomSystem = {
  path:
    | "/custom-accounting-system"
    | "/marketing-system"
    | "/kitchen-display-dashboard"
    | "/website-design"
    | "/google-business-profile"
    | "/google-merchant-center"
    | "/google-ads"
    | "/seo-services";
  label: string;
  arabic: string;
  title: string;
  description: string;
  headline: string;
  intro: string;
  forWho: string[];
  modules: { name: string; detail: string }[];
  discovery: string[];
  faqs: { q: string; a: string }[];
  whatsapp: string;
  /** Heading above `modules`; defaults to "Typical modules we can build". */
  modulesHeading?: string;
};

const ask = "\nBusiness name: \nCountry: \nWhat I need: ";

export type CustomSystemKey =
  | "accounting"
  | "marketing"
  | "kitchen"
  | "websiteDesign"
  | "googleBusiness"
  | "merchantCenter"
  | "googleAds"
  | "seo";

export const CUSTOM_SYSTEMS: Record<CustomSystemKey, CustomSystem> = {
  accounting: {
    path: "/custom-accounting-system",
    label: "Custom accounting systems",
    arabic: "نظام محاسبة مخصص",
    title: "Custom Accounting System Development for Businesses | Jahjah WebDigital",
    description:
      "Custom web-based accounting and bookkeeping systems: invoices, expenses, sales records and reports built around how your business works. Scope confirmed in a discovery call.",
    headline: "A custom accounting system built around how your business actually runs.",
    intro:
      "When spreadsheets and generic software stop fitting, we design and build a private, web-based system for recording sales, expenses and invoices — shaped to your workflow. Every feature is agreed with you before development starts.",
    forWho: [
      "Restaurants and cafés tracking daily sales, purchases and supplier costs",
      "Small and growing companies that have outgrown spreadsheets",
      "Teams that need several users with different access levels",
    ],
    modules: [
      { name: "Invoices & receipts", detail: "Create, number and export invoices in your currency." },
      { name: "Expenses & suppliers", detail: "Record purchases and supplier balances in one place." },
      { name: "Sales records", detail: "Daily or per-branch sales entries with simple summaries." },
      { name: "Reports", detail: "Period summaries you can filter and export." },
      { name: "User roles", detail: "Owner, accountant and staff access kept separate." },
      { name: "Arabic & English", detail: "Interface language agreed during discovery." },
    ],
    discovery: [
      "We review your current spreadsheets or software and the reports you need.",
      "We agree the modules, users and any tax or local rules your accountant must confirm.",
      "You receive a written scope and price before any build begins.",
    ],
    faqs: [
      { q: "Does this replace my accountant?", a: "No. It organises your records; tax and compliance decisions stay with your accountant." },
      { q: "Can it follow my country's tax rules?", a: "Requirements such as VAT fields are scoped with you and confirmed with your accountant during discovery." },
      { q: "Is pricing fixed?", a: "Custom systems are quoted after discovery, once the scope is written and agreed." },
    ],
    whatsapp: `Hi Jahjah WebDigital, I'd like a quote for a custom accounting system.${ask}`,
  },
  marketing: {
    path: "/marketing-system",
    label: "Marketing systems",
    arabic: "نظام تسويق رقمي",
    title: "Custom Marketing System: Lead Capture, CRM & Campaign Tracking | Jahjah WebDigital",
    description:
      "Custom marketing systems for businesses and restaurants: lead capture forms, a simple customer list, WhatsApp follow-up and campaign tracking. Scope agreed in discovery.",
    headline: "A marketing system that turns visitors into a customer list you own.",
    intro:
      "We connect your website, forms and WhatsApp into one place where enquiries are collected, followed up and measured — built for your business rather than a template. Features are confirmed with you before development.",
    forWho: [
      "Businesses getting enquiries from Instagram, Google and WhatsApp with no single list",
      "Restaurants that want to follow up with customers who already ordered",
      "Teams that want to see which pages and campaigns bring enquiries",
    ],
    modules: [
      { name: "Lead capture", detail: "Forms and landing pages that save enquiries securely." },
      { name: "Customer list (CRM)", detail: "Contacts, status and notes in a private dashboard." },
      { name: "WhatsApp follow-up", detail: "One-tap pre-filled messages; sending stays manual." },
      { name: "Campaign tracking", detail: "See which pages and links produce enquiries." },
      { name: "Offers & promotions", detail: "Pages for seasonal offers linked from your site." },
      { name: "Search-ready pages", detail: "Titles, descriptions and structure for Google." },
    ],
    discovery: [
      "We map where your enquiries come from today and where they get lost.",
      "We agree which channels, fields and reports matter to you.",
      "You receive a written scope and price before any build begins.",
    ],
    faqs: [
      { q: "Do you run paid ads?", a: "Not as part of this system — it covers capture, follow-up and tracking. Google Ads campaign setup and management is a separate service: see /google-ads." },
      { q: "Will it send bulk messages automatically?", a: "No automatic bulk sending is included; follow-up is one-tap and stays under your control." },
      { q: "Can it connect to my existing website?", a: "Usually yes; we confirm the connection during discovery." },
    ],
    whatsapp: `Hi Jahjah WebDigital, I'd like a quote for a marketing system (lead capture and follow-up).${ask}`,
  },
  kitchen: {
    path: "/kitchen-display-dashboard",
    label: "Kitchen dashboards",
    arabic: "شاشة مطبخ للطلبات",
    title: "Kitchen Display Dashboard for Restaurant Orders | Jahjah WebDigital",
    description:
      "A custom kitchen dashboard that shows incoming website and QR orders on a screen or tablet, with order status from new to ready. Built to fit your restaurant; scope agreed in discovery.",
    headline: "A kitchen dashboard so every order reaches the kitchen clearly.",
    intro:
      "We build a browser-based kitchen screen that lists orders from your Jahjah ordering website or QR menu, so staff can move each order from new to preparing to ready. It runs on a tablet or screen you already have; details are agreed in discovery.",
    forWho: [
      "Restaurants taking orders through their own website or QR menu",
      "Kitchens where paper tickets or WhatsApp screenshots get missed",
      "Multi-branch restaurants that want orders routed per branch",
    ],
    modules: [
      { name: "Live order list", detail: "New orders appear on the kitchen screen." },
      { name: "Order status", detail: "New → preparing → ready, tapped by staff." },
      { name: "Item notes", detail: "Customer notes and add-ons shown with each item." },
      { name: "Branch view", detail: "Orders separated per branch where needed." },
      { name: "Works on a tablet", detail: "Runs in a browser — no special hardware required." },
      { name: "Part of a complete system", detail: "Pairs with your digital menu and ordering site." },
    ],
    discovery: [
      "We look at how orders reach your kitchen today and where delays happen.",
      "We agree the screens, statuses and branches you need.",
      "You receive a written scope and price before any build begins.",
    ],
    faqs: [
      { q: "Does it connect to my POS or delivery apps?", a: "Integrations are not assumed; any POS or third-party connection is assessed during discovery." },
      { q: "Do I need new hardware?", a: "Usually a tablet or screen with a modern browser is enough." },
      { q: "Can it come with a digital menu?", a: "Yes — it can be part of a complete restaurant system with digital menu and direct ordering." },
    ],
    whatsapp: `Hi Jahjah WebDigital, I'd like a quote for a kitchen display dashboard for my restaurant.\nRestaurant name: \nCountry: \nNumber of branches: `,
  },

  websiteDesign: {
    path: "/website-design",
    label: "Website design",
    arabic: "تصميم مواقع إلكترونية",
    title: "Website Design Company in Lebanon, Dubai & the Gulf | Jahjah WebDigital",
    description:
      "Custom website design and development for businesses, restaurants and online stores in Lebanon, the UAE and the Gulf. Mobile-first, Arabic/English, built to be found on Google. From $319.",
    headline: "A website that brings you enquiries — not just a page that exists.",
    intro:
      "We design and build fast, mobile-first websites for companies, restaurants and online stores: clear services, real photos, WhatsApp and call buttons on every page, Arabic and English, and the structure Google needs to show you in search. Live examples are on our work page.",
    forWho: [
      "Businesses in Lebanon, Dubai, Saudi Arabia, Qatar or Kuwait with no website, or one that brings nothing",
      "Restaurants and cafés that need a menu, ordering or reservations — not just photos",
      "Shops that want an online store their customers can browse and buy from",
    ],
    modulesHeading: "What a Jahjah website can include",
    modules: [
      { name: "Mobile-first design", detail: "Built for the phones your customers actually use." },
      { name: "Arabic & English", detail: "A second language is added as a $50 feature." },
      { name: "WhatsApp & call buttons", detail: "Pre-filled WhatsApp messages so the first message is useful." },
      { name: "Search-ready structure", detail: "Titles, descriptions, structured data and a sitemap for Google." },
      { name: "Online store or ordering", detail: "Catalogue, cart and checkout, or a restaurant ordering flow." },
      { name: "Care & hosting", detail: "Hosting, updates and support at $99/month after launch." },
    ],
    discovery: [
      "Send us your Instagram, Google Maps page or current website — or just describe the business.",
      "We recommend a package (from $319 one-time) and confirm the pages and features in writing.",
      "We design, you review two design directions, then we build and launch.",
    ],
    faqs: [
      { q: "How much does a website cost?", a: "Business websites are $319, $519 or $719 one-time; restaurant systems are $299, $699 or $1,299. Website Care & Hosting is $99/month after launch ($149 for the Advanced restaurant package)." },
      { q: "Do you work outside Lebanon?", a: "Yes. We are based in Lebanon and build for clients in the UAE, Saudi Arabia, Qatar, Kuwait and worldwide — our live work includes Al Afandi Chicken in Dubai." },
      { q: "Will my website show up on Google?", a: "Every site is built with the technical foundations Google needs and submitted for indexing. Nobody can honestly guarantee a ranking; we can add Google Business Profile, SEO and Google Ads work to speed it up." },
      { q: "How long does it take?", a: "Most projects go from kickoff to a live site within a few weeks, depending on the package and how quickly we receive your content and feedback." },
    ],
    whatsapp: `Hi Jahjah WebDigital, I'd like a website for my business.${ask}`,
  },
  googleBusiness: {
    path: "/google-business-profile",
    label: "Google Business Profile & Maps",
    arabic: "إدارة حساب جوجل بزنس وخرائط جوجل",
    title: "Google Business Profile Setup & Optimization for Restaurants and Businesses | Jahjah WebDigital",
    description:
      "Get found on Google Maps: Google Business Profile setup, verification help, categories, photos, menu and ordering links, and a review routine — for restaurants and local businesses in Lebanon and the Gulf.",
    headline: "Show up on Google Maps when people nearby search for what you sell.",
    intro:
      "When someone searches “restaurant near me”, “shawarma Dubai” or “clinic in Tripoli”, Google shows the Maps results first. We set up or clean up your Google Business Profile so it is complete, accurate and connected to your website, menu and WhatsApp — the details Google and customers both look at.",
    forWho: [
      "Restaurants and cafés with no profile, a duplicate profile or an old menu link",
      "Local businesses that appear on Maps but get few calls or direction requests",
      "Multi-branch businesses where each branch needs its own correct profile",
    ],
    modulesHeading: "What we set up and check",
    modules: [
      { name: "Profile setup or claim", detail: "Create the profile or help you claim and verify the existing one through Google’s own steps." },
      { name: "Categories & services", detail: "Primary and secondary categories and services that match what people search." },
      { name: "Menu, ordering & booking links", detail: "Point Google to your official menu, ordering and reservation pages." },
      { name: "Photos & details", detail: "Hours, phone, WhatsApp, area served and real photos of the place and products." },
      { name: "Review routine", detail: "A QR card and link so happy customers can leave a review — no fake or paid reviews." },
      { name: "Website connection", detail: "Your website and profile describe the same business, address and phone." },
    ],
    discovery: [
      "Send us your business name and Google Maps link (or tell us there is none yet).",
      "We review the profile against what your customers search and list what is missing.",
      "You receive a written scope and price before we change anything.",
    ],
    faqs: [
      { q: "Can you guarantee the first position on Google Maps?", a: "No one can honestly guarantee a position. Google ranks local results by relevance, distance and prominence; we make the profile complete and accurate, which is the part you control." },
      { q: "Who owns the profile?", a: "You do. We work as a manager on your profile and the business owner keeps full ownership." },
      { q: "Do you write fake reviews?", a: "Never. Fake reviews break Google’s policies and can get a profile suspended. We help you ask real customers." },
      { q: "Is this included in a package?", a: "Google Maps and reviews integration is part of the Advanced restaurant package ($1,299). It is also available on its own and quoted after a free review." },
    ],
    whatsapp: `Hi Jahjah WebDigital, I'd like help with my Google Business Profile / Google Maps listing.\nBusiness name: \nGoogle Maps link: \nCountry: `,
  },
  merchantCenter: {
    path: "/google-merchant-center",
    label: "Google Merchant Center & Shopping",
    arabic: "جوجل ميرشانت سنتر وإعلانات جوجل شوبينج",
    title: "Google Merchant Center Setup & Google Shopping Listings for Online Stores | Jahjah WebDigital",
    description:
      "Put your products on Google Shopping: Google Merchant Center setup, product feed, website requirements, free listings and Shopping/Performance Max campaigns for online stores in Lebanon, the UAE and the Gulf.",
    headline: "Get your products in front of people searching Google to buy them.",
    intro:
      "Google Shopping shows product photos, prices and your store name right in the search results. To appear there, your online store needs a verified Google Merchant Center account, a clean product feed and a website that meets Google’s shopping policies. We set that up and fix what Google rejects.",
    forWho: [
      "Online stores and retailers — fashion, electronics, beauty, home and more",
      "Stores whose Merchant Center products are disapproved or the account is suspended",
      "Businesses that want an online store built correctly for Google Shopping from day one",
    ],
    modulesHeading: "What we set up",
    modules: [
      { name: "Merchant Center account", detail: "Account setup, business information and website verification." },
      { name: "Product feed", detail: "Titles, images, prices, availability and identifiers Google requires." },
      { name: "Website requirements", detail: "Contact, shipping and returns pages and checkout details Google checks." },
      { name: "Free product listings", detail: "Eligible products shown in the Shopping tab at no cost per click." },
      { name: "Shopping / Performance Max", detail: "Paid product campaigns linked to Google Ads, with a budget you set." },
      { name: "Disapproval fixes", detail: "We read Google’s diagnostics and correct the products or pages it flags." },
    ],
    discovery: [
      "Send us your store link and roughly how many products you sell.",
      "We check your site and feed against Google’s Merchant Center requirements.",
      "You receive a written scope and price before setup begins.",
    ],
    faqs: [
      { q: "Is Google Shopping available in my country?", a: "Free listings and Shopping ads are available in many countries but not all; we check your target country against Google’s current list before you pay for setup." },
      { q: "Do I need an online store first?", a: "Yes — products must link to a page where customers can buy. We build e-commerce sites too, such as the large-catalogue Bloom Outlet store." },
      { q: "Why are my products disapproved?", a: "Common causes are missing shipping or returns information, price mismatches between the feed and the page, and image or identifier problems. Merchant Center shows the reason per product and we fix them." },
      { q: "What does it cost?", a: "Setup is quoted after a free review of your store and catalogue size. Any ad budget is paid by you directly to Google." },
    ],
    whatsapp: `Hi Jahjah WebDigital, I'd like help with Google Merchant Center / Google Shopping for my online store.\nStore link: \nNumber of products: \nCountry: `,
  },
  googleAds: {
    path: "/google-ads",
    label: "Google Ads & keywords",
    arabic: "إعلانات جوجل والكلمات المفتاحية",
    title: "Google Ads Management & Keyword Research for Restaurants and Businesses | Jahjah WebDigital",
    description:
      "Google Ads search campaigns built around the keywords your customers type: keyword research, ad copy in Arabic and English, landing pages, call and WhatsApp conversion tracking. Lebanon, UAE and the Gulf.",
    headline: "Appear at the top of Google the day you decide to — for the searches that bring customers.",
    intro:
      "SEO takes time; Google Ads puts you in the results immediately. We research what your customers actually search, build tight campaigns around those keywords, send clicks to a page made to convert, and track every call, WhatsApp message and form — so you see what each dollar brings.",
    forWho: [
      "Restaurants that want more direct orders and reservations, not just more views",
      "Service businesses that need calls and WhatsApp enquiries this month",
      "Anyone who tried Google Ads, spent money and could not tell what it brought",
    ],
    modulesHeading: "What a campaign includes",
    modules: [
      { name: "Keyword research", detail: "Real search terms in Arabic and English, by city, with negative keywords to cut waste." },
      { name: "Search campaigns", detail: "Tight ad groups, ad copy and assets for calls, locations and links." },
      { name: "Landing page", detail: "A page that matches the ad and makes the next step obvious." },
      { name: "Conversion tracking", detail: "Calls, WhatsApp clicks and form submissions measured as results." },
      { name: "Location targeting", detail: "Ads shown only where you can serve — a city, area or radius." },
      { name: "Monthly report", detail: "Spend, enquiries and cost per enquiry in plain language." },
    ],
    discovery: [
      "Tell us what you sell, where, and the customer you want more of.",
      "We research the keywords and estimate a realistic starting budget.",
      "You approve the plan; the ad budget is paid by you directly to Google.",
    ],
    faqs: [
      { q: "How much budget do I need?", a: "It depends on your market and keywords. We estimate a starting daily budget from real keyword data before launch; you pay Google directly and can pause at any time." },
      { q: "Do you guarantee results?", a: "We do not promise numbers we cannot control. We do measure every enquiry, so you can judge the campaign on cost per enquiry, not clicks." },
      { q: "Is the ad account mine?", a: "Yes. The account is created under your business and you keep full access." },
      { q: "Can ads point to my WhatsApp?", a: "Yes. Ads can lead to a landing page with WhatsApp and call buttons, or use call assets, and we track those clicks as conversions." },
    ],
    whatsapp: `Hi Jahjah WebDigital, I'd like to run Google Ads for my business.\nBusiness name: \nCity / country: \nWhat I want more of (calls, orders, bookings): `,
  },
  seo: {
    path: "/seo-services",
    label: "SEO services",
    arabic: "تحسين محركات البحث SEO",
    title: "SEO Services for Restaurants and Businesses in Lebanon & the Gulf | Jahjah WebDigital",
    description:
      "SEO that brings enquiries: technical fixes, page titles and content for the searches your customers make in Arabic and English, local SEO, Google Search Console and structured data.",
    headline: "Be found on Google for what you sell — in Arabic and English.",
    intro:
      "Most small business websites are invisible on Google because they have one vague page, no local content and no technical setup. We fix the foundations, write a page for each service and city you serve, and connect Google Search Console so you can see which searches bring visitors.",
    forWho: [
      "Businesses whose website gets almost no visitors from Google",
      "Restaurants that want to appear for “menu”, “delivery” and dish searches in their city",
      "Companies that serve several cities or countries and need a page for each",
    ],
    modulesHeading: "What we work on",
    modules: [
      { name: "Technical SEO", detail: "Speed, mobile layout, indexing, sitemap, canonical tags and errors." },
      { name: "Keyword map", detail: "Which page targets which search, in Arabic and English." },
      { name: "Service & city pages", detail: "Useful pages for each service and area you actually serve." },
      { name: "Structured data", detail: "Business, menu, product and FAQ data Google can read." },
      { name: "Local SEO", detail: "Google Business Profile, consistent name/address/phone and local links." },
      { name: "Search Console", detail: "Setup, sitemap submission and a monthly look at real search terms." },
    ],
    discovery: [
      "Send us your website and the services and cities that matter most.",
      "We run a free review and show you what is blocking you on Google.",
      "You receive a written scope and price before work begins.",
    ],
    faqs: [
      { q: "How long does SEO take?", a: "Technical fixes are indexed within days to weeks; ranking for competitive searches usually takes months. Google Ads is the faster option while SEO grows." },
      { q: "Can you guarantee first page?", a: "No honest agency can. We work on what Google publicly says matters — useful content, a sound site and an accurate local presence — and report real search data." },
      { q: "Do you write Arabic content?", a: "Yes. Many customers in Lebanon and the Gulf search in Arabic, so we plan Arabic and English pages where it makes sense." },
    ],
    whatsapp: `Hi Jahjah WebDigital, I'd like help getting my website found on Google (SEO).\nWebsite: \nCity / country: `,
  },
};

export const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLScKTLSkFln1cYORo0gmaHHKiRMhLpInWm3aeXauls9iOqc6_w/viewform";
