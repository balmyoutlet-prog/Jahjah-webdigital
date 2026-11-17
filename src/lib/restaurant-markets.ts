// Content for the /restaurants/:market landing pages. Each market carries its
// own local context, proof and questions so the pages are genuinely useful to
// an owner there — not the same page with a different city name.
//
// Proof rule: only link projects that are live and checked. Where we have no
// live client in a market yet, say so and point to the closest real example.

export type MarketFaq = { q: string; a: string };

export type RestaurantMarket = {
  slug: string;
  path: string;
  /** Name used in headings and pre-filled WhatsApp messages. */
  name: string;
  country: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  currency: string;
  marketplaces: string;
  /** What restaurants in this market need online — 3–4 short cards. */
  context: { title: string; body: string }[];
  /** Portfolio slugs shown as proof, most relevant first. */
  proofSlugs: string[];
  proofNote: string;
  faqs: MarketFaq[];
  /** Nearby or parent markets to link to. */
  related: { to: string; label: string }[];
};

const commissionFaq = (marketplaces: string): MarketFaq => ({
  q: `Do we have to stop using ${marketplaces}?`,
  a: `No. Keep the apps for discovery if they bring you new customers. A direct ordering website gives your regulars, Instagram followers and dine-in or QR guests a way to order from you without a commission on each order. You decide how hard to push each channel.`,
});

const pricingFaq: MarketFaq = {
  q: "How much does it cost?",
  a: "Fixed one-time build prices in USD: $299 for a restaurant landing page, $699 for the menu & ordering system, $1,299 with marketing & SEO. Website Care & Hosting is $99/month after launch ($149 for Advanced). Extra features such as a second language, reservations or another branch are $50 each. No per-order commission.",
};

const remoteFaq = (name: string): MarketFaq => ({
  q: `You're based in Lebanon — how do you work with a restaurant in ${name}?`,
  a: "Remotely, mainly on WhatsApp. You send your menu, logo, branch details and photos; we build, share a live preview link for you to test on your phone, and refine it with you before launch. Payment is in USD.",
});

const SAUDI_CONTEXT = [
  {
    title: "Arabic first, English second",
    body: "Saudi customers expect to order in Arabic, with right-to-left layouts that feel native — not a translated English site. English stays available for expatriate guests.",
  },
  {
    title: "SAR prices and branch accuracy",
    body: "Each branch needs its own hours, delivery area and menu availability, with prices in riyals. A wrong branch or stale price costs an order and a review.",
  },
  {
    title: "A direct channel next to the apps",
    body: "HungerStation, Jahez and other apps bring discovery but take a cut of each order. Your own ordering site is where repeat customers can order without that cut.",
  },
  {
    title: "Upsell inside the order",
    body: "Combo upgrades, sides and drinks suggested before checkout raise basket size without extra staff time — the same “complete your meal” step running for Al Afandi Chicken Dubai.",
  },
];

export const RESTAURANT_MARKETS: Record<string, RestaurantMarket> = {
  lebanon: {
    slug: "lebanon",
    path: "/restaurants/lebanon",
    name: "Lebanon",
    country: "Lebanon",
    title: "Restaurant Website, Digital Menu & Online Ordering in Lebanon | Jahjah WebDigital",
    description:
      "Restaurant websites, QR and digital menus, WhatsApp ordering, online ordering and reservations for restaurants and cafés in Lebanon. Live projects in El Mina and Tripoli. Free demo for your restaurant.",
    eyebrow: "Restaurant ordering websites · Lebanon",
    h1: "Turn Instagram followers into direct orders for your restaurant in Lebanon.",
    intro:
      "In Lebanon, customers usually find you on Instagram and message you on WhatsApp. We give your restaurant a fast menu they can actually order from — items, options, branch and delivery details arrive as a clean order instead of ten messages back and forth.",
    currency: "USD (and LBP if you need it)",
    marketplaces: "Toters",
    context: [
      {
        title: "WhatsApp is already your ordering line",
        body: "For many restaurants here, orders start as a WhatsApp message. A structured menu and cart sends you the complete order — items, options, address, branch — so staff stop typing back and forth.",
      },
      {
        title: "Prices change — reprinting shouldn't",
        body: "Menu prices move often. A digital and QR menu is updated once and is correct everywhere: the website, the QR code on the table and the link in your Instagram bio.",
      },
      {
        title: "Built for real mobile connections",
        body: "Lightweight pages and compressed photos so the menu opens quickly on mobile data, not only on fast Wi-Fi.",
      },
      {
        title: "Same time zone, direct contact",
        body: "We're based in Lebanon. You talk to the people building your site on WhatsApp, and launch support is part of the package.",
      },
    ],
    proofSlugs: ["wholesome-craft", "sweet-spot-lebanon", "al-afandi-chicken"],
    proofNote: "Built by us and live in Lebanon today — open them on your phone.",
    faqs: [
      commissionFaq("Toters or other delivery apps"),
      {
        q: "Can orders come to our WhatsApp?",
        a: "Yes. The customer chooses items and options on your menu, then the order is handed to your WhatsApp already filled in — or submitted directly, depending on the package.",
      },
      {
        q: "Can the menu show USD and LBP?",
        a: "Yes. We show prices in the currency you actually charge, and can add a second currency or language if your customers need it.",
      },
      {
        q: "Can guests reserve a table online?",
        a: "Yes. Wholesome Craft Resto Café in El Mina has a reserve-a-table path on its site. Reservations are a $50 feature where your package doesn't include them.",
      },
      pricingFaq,
    ],
    related: [
      { to: "/restaurants/dubai", label: "Dubai, UAE" },
      { to: "/restaurants/saudi-arabia", label: "Saudi Arabia" },
      { to: "/restaurants/qatar", label: "Qatar" },
      { to: "/restaurants/kuwait", label: "Kuwait" },
    ],
  },
  dubai: {
    slug: "dubai",
    path: "/restaurants/dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    title: "Restaurant Website & Online Ordering System in Dubai, UAE | Jahjah WebDigital",
    description:
      "Commission-free restaurant ordering websites for Dubai and the UAE: Arabic/English digital menus, QR ordering, branch selection, upsells, WhatsApp ordering and reservations. Live 5-branch project in Dubai.",
    eyebrow: "Restaurant ordering websites · Dubai, UAE",
    h1: "Direct orders for your Dubai restaurant — next to Talabat, Deliveroo and Careem, not instead of them.",
    intro:
      "Marketplaces bring new customers, then take a commission on every repeat order. We build your own Arabic/English ordering website so regulars, Instagram followers and QR guests order straight from you — with the right branch, AED prices and a “complete your meal” upsell before checkout.",
    currency: "AED",
    marketplaces: "Talabat, Deliveroo or Careem",
    context: [
      {
        title: "Bilingual from the first tap",
        body: "Dubai guests switch between Arabic and English. Al Afandi Chicken Dubai asks for the language on arrival, then keeps the whole order in it.",
      },
      {
        title: "The right branch, every time",
        body: "Multi-branch groups need customers routed to the nearest kitchen with that branch's hours and menu. Branch selection is built into the order, not an afterthought.",
      },
      {
        title: "Bigger baskets without extra staff",
        body: "A dedicated add-on step suggests sides, drinks and desserts before checkout — the simplest way to lift average order value on every direct order.",
      },
      {
        title: "Your customers, not the app's",
        body: "Direct orders arrive with the customer's name and number, so you can bring them back with offers instead of paying to reach them again.",
      },
    ],
    proofSlugs: ["al-afandi-chicken-dubai", "al-afandi-chicken"],
    proofNote:
      "Al Afandi Chicken Dubai — five branches, Arabic/English, AED pricing — is live and built by us.",
    faqs: [
      commissionFaq("Talabat, Deliveroo or Careem"),
      {
        q: "Can it handle several branches across Dubai?",
        a: "Yes. Al Afandi Chicken Dubai routes customers to one of five branches inside the ordering flow. Each extra branch beyond your package is a $50 feature.",
      },
      {
        q: "Arabic and English with AED prices?",
        a: "Yes — that is exactly how the Al Afandi Chicken Dubai site works today.",
      },
      remoteFaq("Dubai"),
      pricingFaq,
    ],
    related: [
      { to: "/restaurants/abu-dhabi", label: "Abu Dhabi" },
      { to: "/restaurants/saudi-arabia", label: "Saudi Arabia" },
      { to: "/restaurants/qatar", label: "Qatar" },
      { to: "/restaurants/kuwait", label: "Kuwait" },
    ],
  },
  "saudi-arabia": {
    slug: "saudi-arabia",
    path: "/restaurants/saudi-arabia",
    name: "Saudi Arabia",
    country: "Saudi Arabia",
    title: "Restaurant Website & Digital Menu Ordering in Saudi Arabia | Jahjah WebDigital",
    description:
      "Arabic-first restaurant ordering websites for Saudi Arabia: digital and QR menus, branch selection, add-on upsells, WhatsApp ordering and reservations, priced in SAR. Free demo for your restaurant.",
    eyebrow: "Restaurant ordering websites · Saudi Arabia",
    h1: "An Arabic-first ordering website for your restaurant in Saudi Arabia.",
    intro:
      "Give customers in Riyadh, Jeddah and beyond a menu that feels native in Arabic, shows the right branch and price in riyals, and suggests the side or drink they were going to add anyway — all on your own website, without a commission on each order.",
    currency: "SAR",
    marketplaces: "HungerStation or Jahez",
    context: SAUDI_CONTEXT,
    proofSlugs: ["al-afandi-chicken-dubai", "al-afandi-chicken"],
    proofNote:
      "We don't have a published Saudi client yet. The closest live example is Al Afandi Chicken Dubai — Arabic/English, five branches and an add-on step — which is the same system we would adapt for you.",
    faqs: [
      commissionFaq("HungerStation or Jahez"),
      {
        q: "Will the Arabic version feel native?",
        a: "Yes. Arabic is built as a full right-to-left experience, not a translation pasted into an English layout. You can see it on Al Afandi Chicken Dubai.",
      },
      {
        q: "Can customers pay online?",
        a: "Orders can always be sent to you directly or via WhatsApp. Online card payment depends on a payment provider available to your business in Saudi Arabia; we confirm the options with you before the build.",
      },
      remoteFaq("Saudi Arabia"),
      pricingFaq,
    ],
    related: [
      { to: "/restaurants/riyadh", label: "Riyadh" },
      { to: "/restaurants/jeddah", label: "Jeddah" },
      { to: "/restaurants/dubai", label: "Dubai, UAE" },
      { to: "/restaurants/kuwait", label: "Kuwait" },
    ],
  },
  riyadh: {
    slug: "riyadh",
    path: "/restaurants/riyadh",
    name: "Riyadh",
    country: "Saudi Arabia",
    title: "Restaurant Ordering Website & Digital Menu in Riyadh | Jahjah WebDigital",
    description:
      "Arabic-first ordering websites for Riyadh restaurants and cafés: digital and QR menus, branch selection across the city, add-on upsells and WhatsApp ordering in SAR. Free demo for your restaurant.",
    eyebrow: "Restaurant ordering websites · Riyadh",
    h1: "Direct orders for your Riyadh restaurant, branch by branch.",
    intro:
      "Riyadh is spread out, and customers want the branch that can actually deliver to them. We build your own Arabic-first ordering website with branch selection, SAR prices and an add-on step before checkout — so repeat customers order from you, not through an app.",
    currency: "SAR",
    marketplaces: "HungerStation or Jahez",
    context: SAUDI_CONTEXT,
    proofSlugs: ["al-afandi-chicken-dubai"],
    proofNote:
      "No published Riyadh client yet. The closest live example is Al Afandi Chicken Dubai — Arabic/English with five-branch selection — the same flow a multi-branch Riyadh restaurant needs.",
    faqs: [
      commissionFaq("HungerStation or Jahez"),
      {
        q: "We have branches in different districts — can customers pick the right one?",
        a: "Yes. Branch selection is part of the ordering flow, with each branch's hours and menu. Additional branches beyond your package are $50 each.",
      },
      remoteFaq("Riyadh"),
      pricingFaq,
    ],
    related: [
      { to: "/restaurants/saudi-arabia", label: "Saudi Arabia" },
      { to: "/restaurants/jeddah", label: "Jeddah" },
      { to: "/restaurants/dubai", label: "Dubai" },
    ],
  },
  jeddah: {
    slug: "jeddah",
    path: "/restaurants/jeddah",
    name: "Jeddah",
    country: "Saudi Arabia",
    title: "Restaurant Ordering Website & Digital Menu in Jeddah | Jahjah WebDigital",
    description:
      "Arabic/English ordering websites for Jeddah restaurants and cafés: QR and digital menus, direct ordering, WhatsApp ordering, reservations and add-on upsells in SAR. Free demo for your restaurant.",
    eyebrow: "Restaurant ordering websites · Jeddah",
    h1: "A menu your Jeddah guests can order from — at the table, at home or on the way.",
    intro:
      "From a QR code at the table to a delivery order from home, your own ordering website keeps every guest in one branded journey — Arabic or English, SAR prices, the right branch, and a suggested add-on before checkout.",
    currency: "SAR",
    marketplaces: "HungerStation or Jahez",
    context: SAUDI_CONTEXT,
    proofSlugs: ["al-afandi-chicken-dubai", "wholesome-craft"],
    proofNote:
      "No published Jeddah client yet. Closest live examples: Al Afandi Chicken Dubai for bilingual multi-branch ordering, and Wholesome Craft Resto Café for reservations.",
    faqs: [
      commissionFaq("HungerStation or Jahez"),
      {
        q: "Can guests order from the table with a QR code?",
        a: "Yes. A QR code opens the same menu at the table, so guests can browse, add items and send the order — useful for cafés and busy dine-in service.",
      },
      remoteFaq("Jeddah"),
      pricingFaq,
    ],
    related: [
      { to: "/restaurants/saudi-arabia", label: "Saudi Arabia" },
      { to: "/restaurants/riyadh", label: "Riyadh" },
      { to: "/restaurants/dubai", label: "Dubai" },
    ],
  },
  qatar: {
    slug: "qatar",
    path: "/restaurants/qatar",
    name: "Qatar",
    country: "Qatar",
    title: "Restaurant Website & Online Ordering System in Qatar | Jahjah WebDigital",
    description:
      "Restaurant ordering websites for Qatar: Arabic/English digital and QR menus, direct ordering, WhatsApp ordering, reservations and upsells in QAR. Free demo built around your restaurant.",
    eyebrow: "Restaurant ordering websites · Qatar",
    h1: "Your own ordering website for your restaurant in Qatar — in Arabic and English.",
    intro:
      "Qatar's diners are a mix of nationalities, so the menu has to work in Arabic and English from the first screen. We build a direct ordering website with QAR prices, branch details, reservations and an add-on step — so repeat orders stop paying an app commission.",
    currency: "QAR",
    marketplaces: "Talabat or Snoonu",
    context: [
      {
        title: "One menu, two languages",
        body: "A large expatriate population means English matters as much as Arabic. Customers choose their language once and the whole order follows it.",
      },
      {
        title: "Dine-in, takeaway and delivery",
        body: "One menu link covers the QR code on the table, the takeaway order and delivery — each with the options and branch that apply.",
      },
      {
        title: "Reservations without phone tag",
        body: "A reserve-a-table path for evenings and weekends, so guests who like what they see can book on the spot.",
      },
      {
        title: "Upsells that don't need a waiter",
        body: "Sides, drinks and desserts suggested before checkout — the step that lifts basket value on every direct order.",
      },
    ],
    proofSlugs: ["al-afandi-chicken-dubai", "wholesome-craft"],
    proofNote:
      "No published Qatar client yet. Closest live examples: Al Afandi Chicken Dubai (bilingual, five branches, add-on step) and Wholesome Craft Resto Café (reservations).",
    faqs: [
      commissionFaq("Talabat or Snoonu"),
      {
        q: "Can the site take reservations as well as orders?",
        a: "Yes. Reservations can sit next to ordering on the same site; it's a $50 feature where your package doesn't include it.",
      },
      remoteFaq("Qatar"),
      pricingFaq,
    ],
    related: [
      { to: "/restaurants/doha", label: "Doha" },
      { to: "/restaurants/dubai", label: "Dubai, UAE" },
      { to: "/restaurants/kuwait", label: "Kuwait" },
      { to: "/restaurants/saudi-arabia", label: "Saudi Arabia" },
    ],
  },
  doha: {
    slug: "doha",
    path: "/restaurants/doha",
    name: "Doha",
    country: "Qatar",
    title: "Restaurant Ordering Website & QR Menu in Doha | Jahjah WebDigital",
    description:
      "Direct ordering websites and QR menus for Doha restaurants and cafés: Arabic/English, QAR prices, reservations, WhatsApp ordering and add-on upsells. Free demo for your restaurant.",
    eyebrow: "Restaurant ordering websites · Doha",
    h1: "Direct orders and reservations for your Doha restaurant.",
    intro:
      "Give Doha guests one link that works everywhere — Instagram bio, Google Maps, the QR code on the table — to view the menu in Arabic or English, order for delivery or pickup, or reserve a table.",
    currency: "QAR",
    marketplaces: "Talabat or Snoonu",
    context: [
      {
        title: "One link for every channel",
        body: "The same menu link sits in your Instagram bio, Google profile and table QR codes, so every guest lands in your ordering journey.",
      },
      {
        title: "Arabic and English",
        body: "Language is chosen once and the whole order follows it — important for Doha's mix of residents and visitors.",
      },
      {
        title: "Reserve or order",
        body: "Guests who want to come in can book a table; guests at home can order. Both from the same site.",
      },
    ],
    proofSlugs: ["al-afandi-chicken-dubai", "wholesome-craft"],
    proofNote:
      "No published Doha client yet. Closest live examples: Al Afandi Chicken Dubai (bilingual ordering) and Wholesome Craft Resto Café (reservations).",
    faqs: [commissionFaq("Talabat or Snoonu"), remoteFaq("Doha"), pricingFaq],
    related: [
      { to: "/restaurants/qatar", label: "Qatar" },
      { to: "/restaurants/dubai", label: "Dubai" },
      { to: "/restaurants/kuwait", label: "Kuwait" },
    ],
  },
  kuwait: {
    slug: "kuwait",
    path: "/restaurants/kuwait",
    name: "Kuwait",
    country: "Kuwait",
    title: "Restaurant Website & Online Ordering System in Kuwait | Jahjah WebDigital",
    description:
      "Restaurant ordering websites for Kuwait: Arabic/English digital and QR menus, direct ordering, WhatsApp ordering, branch selection and upsells in KWD. Free demo built around your restaurant.",
    eyebrow: "Restaurant ordering websites · Kuwait",
    h1: "Win back repeat orders from the apps — with your own ordering website in Kuwait.",
    intro:
      "Your regulars already know your food. A direct, bilingual ordering website lets them order from you — with KWD prices, the right branch and a suggested add-on before checkout — instead of through an app that charges you on every order.",
    currency: "KWD",
    marketplaces: "Talabat or Deliveroo",
    context: [
      {
        title: "Repeat customers, direct",
        body: "Put your own ordering link in your Instagram bio, on packaging and on table QR codes, so customers who already love you can order without the app.",
      },
      {
        title: "Arabic and English",
        body: "A native Arabic experience with English one tap away, chosen once and kept through the whole order.",
      },
      {
        title: "Branch-aware ordering",
        body: "Customers pick the right branch with its hours and menu, so orders don't go to a kitchen that can't fulfil them.",
      },
      {
        title: "Bigger baskets",
        body: "Combos, sides and drinks suggested before checkout — the step that lifts average order value without extra staff.",
      },
    ],
    proofSlugs: ["al-afandi-chicken-dubai", "al-afandi-chicken"],
    proofNote:
      "No published Kuwait client yet. The closest live example is Al Afandi Chicken Dubai — Arabic/English, five branches, add-on step — the same system we would adapt for you.",
    faqs: [commissionFaq("Talabat or Deliveroo"), remoteFaq("Kuwait"), pricingFaq],
    related: [
      { to: "/restaurants/saudi-arabia", label: "Saudi Arabia" },
      { to: "/restaurants/qatar", label: "Qatar" },
      { to: "/restaurants/dubai", label: "Dubai, UAE" },
      { to: "/restaurants/lebanon", label: "Lebanon" },
    ],
  },
};
