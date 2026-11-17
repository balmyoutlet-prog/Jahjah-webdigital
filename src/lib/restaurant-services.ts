// Content for the restaurant service landing pages. One search intent per
// page; each page explains how it works, compares the alternatives honestly,
// links to live proof and ends in a demo / WhatsApp next step.

export type ServiceFaq = { q: string; a: string };

export type RestaurantService = {
  path: "/qr-menu" | "/whatsapp-ordering" | "/restaurant-online-ordering";
  key: string;
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  intro: string;
  steps: { title: string; body: string }[];
  compare: {
    heading: string;
    columns: [string, string, string?];
    rows: [string, string, string, string?][];
  };
  proofSlugs: string[];
  faqs: ServiceFaq[];
  guide: { to: string; label: string };
  serviceType: string;
};

export const RESTAURANT_SERVICES: Record<string, RestaurantService> = {
  "qr-menu": {
    path: "/qr-menu",
    key: "qr_menu",
    title: "QR Menu for Restaurants & Cafés — Order From the Table | Jahjah WebDigital",
    description:
      "Branded QR menus guests can order from: Arabic/English, photos, options, add-on suggestions and dine-in ordering. Update prices once — no reprinting. Free demo for your restaurant.",
    eyebrow: "QR menu & table ordering",
    h1: "A QR menu guests can order from — not a PDF squeezed onto a phone.",
    intro:
      "Guests scan the code on the table and get your real menu: photos, options, prices in your currency, Arabic or English. They add items, see a suggested side or drink, and send the order — while your staff spend less time taking orders and more time serving.",
    steps: [
      {
        title: "Scan",
        body: "The QR code on the table opens your menu in the browser. No app to download.",
      },
      {
        title: "Browse",
        body: "Categories, photos and options designed for a phone screen, in the guest's language.",
      },
      {
        title: "Add & upsell",
        body: "Items go into a cart and the menu suggests the side, drink or dessert that goes with them.",
      },
      {
        title: "Order",
        body: "The order is sent with its dine-in details, so staff confirm instead of writing it down.",
      },
    ],
    compare: {
      heading: "PDF menu vs an ordering QR menu",
      columns: ["PDF / image menu", "Jahjah QR menu"],
      rows: [
        ["Reading on a phone", "Pinch and zoom", "Designed for the screen"],
        ["Price changes", "Edit, export and re-upload the file", "Update once, correct everywhere"],
        ["Ordering", "Call the waiter", "Add to cart and send"],
        ["Upselling", "None", "Add-on suggestions before checkout"],
        ["Languages", "A separate file per language", "Arabic / English switch"],
        ["What you learn", "Nothing", "Menu views, popular items, orders"],
      ],
    },
    proofSlugs: ["sweet-spot-lebanon", "al-afandi-chicken", "al-afandi-chicken-dubai"],
    faqs: [
      {
        q: "Do guests need to download an app?",
        a: "No. The QR code opens a normal web page, so it works on any phone with a camera and a browser.",
      },
      {
        q: "Can we use the same menu for delivery and takeaway?",
        a: "Yes. The QR menu is the same menu that powers your website ordering, so dine-in, takeaway and delivery stay in sync.",
      },
      {
        q: "What does it cost?",
        a: "The Menu & Ordering System package is $699 one-time plus $99/month Website Care & Hosting after launch. A simple menu-and-contact landing page is $299. No per-order commission.",
      },
    ],
    guide: {
      to: "/guides/qr-menu-vs-pdf-menu",
      label: "QR menu vs PDF menu: what actually changes for your restaurant",
    },
    serviceType: "QR code menu and table ordering for restaurants",
  },
  "whatsapp-ordering": {
    path: "/whatsapp-ordering",
    key: "whatsapp_ordering",
    title: "WhatsApp Ordering System for Restaurants | Jahjah WebDigital",
    description:
      "Let customers build their order on your branded menu and send it to your WhatsApp complete — items, options, branch and details. No commission per order. Live examples in Dubai and Lebanon.",
    eyebrow: "WhatsApp ordering for restaurants",
    h1: "WhatsApp orders that arrive complete — not ten messages back and forth.",
    intro:
      "Your customers already message you on WhatsApp. We give them a proper menu and cart first, so the message that reaches you already says what they want, the options, the branch and how to reach them. Your team confirms instead of interviewing every customer.",
    steps: [
      {
        title: "Open your menu",
        body: "From your Instagram bio, Google profile, a QR code or a link you send.",
      },
      {
        title: "Build the order",
        body: "Items, sizes, spicy or regular, extras — chosen on the menu, not typed in chat.",
      },
      {
        title: "See a suggestion",
        body: "A side, drink or dessert offered before checkout to grow the basket.",
      },
      {
        title: "Send to WhatsApp",
        body: "WhatsApp opens with the full order written out. Your staff confirm and prepare.",
      },
    ],
    compare: {
      heading: "Three ways to take orders on your phone",
      columns: ["Plain WhatsApp chat", "Delivery app", "Jahjah WhatsApp ordering"],
      rows: [
        ["Commission per order", "None", "A percentage of every order", "None"],
        [
          "Back-and-forth to get the order right",
          "A lot",
          "None",
          "None — the order arrives complete",
        ],
        ["Customer's number stays with you", "Yes", "Usually not", "Yes"],
        ["Upsell before checkout", "Only if staff ask", "Set by the app", "Built into your menu"],
        ["Your brand, your menu", "No menu", "The app's design", "Yes"],
      ],
    },
    proofSlugs: ["al-afandi-chicken-dubai", "sweet-spot-lebanon", "al-afandi-chicken"],
    faqs: [
      {
        q: "Do we need the WhatsApp Business API?",
        a: "No. The order is handed to your normal WhatsApp or WhatsApp Business number through a pre-written message, so there is no API account or per-message fee.",
      },
      {
        q: "Can each branch receive its own orders?",
        a: "Yes. The customer picks the branch and the order goes to that branch's number. Extra branches beyond your package are $50 each.",
      },
      {
        q: "What does it cost?",
        a: "WhatsApp ordering is part of the Menu & Ordering System package: $699 one-time plus $99/month Website Care & Hosting after launch. No commission per order.",
      },
    ],
    guide: {
      to: "/guides/whatsapp-ordering-vs-delivery-apps",
      label: "WhatsApp ordering vs delivery apps — with a commission calculator",
    },
    serviceType: "WhatsApp ordering system for restaurants",
  },
  "restaurant-online-ordering": {
    path: "/restaurant-online-ordering",
    key: "online_ordering",
    title: "Restaurant Online Ordering System — Commission-Free Direct Orders | Jahjah WebDigital",
    description:
      "Your own restaurant online ordering website: delivery, takeaway and dine-in, branch selection, add-on upsells, Arabic/English and order-again — with no commission per order. Free demo.",
    eyebrow: "Direct online ordering",
    h1: "Your own online ordering — your menu, your customers, no commission per order.",
    intro:
      "Delivery apps are good at finding new customers and expensive at keeping them. Your own ordering website is where regulars, Instagram followers and Google searchers order directly — with your brand, your prices and their contact details coming to you.",
    steps: [
      {
        title: "Discover",
        body: "Customers arrive from Google, Instagram, a QR code or a link you send.",
      },
      {
        title: "Choose how and where",
        body: "Delivery, takeaway or dine-in — and the branch that serves them.",
      },
      {
        title: "Build a bigger basket",
        body: "Options, combos and a “complete your meal” add-on step before checkout.",
      },
      {
        title: "Order — and come back",
        body: "Send or pay, then re-order later with order-again shortcuts.",
      },
    ],
    compare: {
      heading: "Marketplace listing vs your own ordering website",
      columns: ["Marketplace listing", "Your own ordering website"],
      rows: [
        ["Cost per order", "Commission on every order", "None — fixed build price + monthly care"],
        ["Who owns the customer", "The app", "You"],
        ["Who else is on the page", "Your competitors", "Only you"],
        ["Upsells", "The app's rules", "Your combos and add-ons"],
        ["Best for", "Being found by new customers", "Repeat orders and loyal customers"],
      ],
    },
    proofSlugs: ["al-afandi-chicken-dubai", "al-afandi-chicken", "sweet-spot-lebanon"],
    faqs: [
      {
        q: "Should we leave the delivery apps?",
        a: "Not necessarily. Use them to be discovered, and use your own site — linked from Instagram, Google, packaging and QR codes — for repeat customers who would otherwise pay you minus a commission.",
      },
      {
        q: "Can customers pay online?",
        a: "Orders can always be sent to you directly or through WhatsApp. Online card payment depends on a payment provider available to your business in your country; we confirm the options before the build.",
      },
      {
        q: "What does it cost?",
        a: "The Menu & Ordering System is $699 one-time; the Advanced package with marketing & local SEO is $1,299. Website Care & Hosting is $99/month after launch ($149 for Advanced).",
      },
    ],
    guide: {
      to: "/guides/restaurant-upselling-online",
      label: "How online upselling raises your average order value",
    },
    serviceType: "Restaurant online ordering system",
  },
};
