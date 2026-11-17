export const WHATSAPP_NUMBER = "96171466516";

export function buildWhatsAppUrl(
  message = "Hello Jahjah WebDigital, I'd like to discuss a website for my business.",
) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_URL = buildWhatsAppUrl();

/** Market names for /restaurants/:market pages, used in pre-filled messages. */
const MARKET_NAMES: Record<string, string> = {
  lebanon: "Lebanon",
  dubai: "Dubai",
  "abu-dhabi": "Abu Dhabi",
  "saudi-arabia": "Saudi Arabia",
  riyadh: "Riyadh",
  jeddah: "Jeddah",
  qatar: "Qatar",
  doha: "Doha",
  kuwait: "Kuwait",
};

const RESTAURANT_NAME_PROMPT = "\nRestaurant name: ";

/**
 * Pre-filled WhatsApp message for the page the visitor is on. Each message
 * states who is writing and what they want, and ends with a blank to type
 * the restaurant or business name, so the first message is already a
 * qualified lead instead of "hi".
 */
export function whatsappMessageForPath(pathname: string): string {
  const path = pathname.replace(/\/+$/, "") || "/";

  const market = /^\/restaurants\/([a-z-]+)$/.exec(path)?.[1];
  if (market && MARKET_NAMES[market]) {
    return `Hi Jahjah WebDigital, I own/manage a restaurant in ${MARKET_NAMES[market]} and I'd like to see what you can build for us — digital menu and direct ordering.${RESTAURANT_NAME_PROMPT}`;
  }

  const byPath: Record<string, string> = {
    "/qr-menu":
      "Hi Jahjah WebDigital, I'd like a QR menu for my restaurant that guests can order from.",
    "/whatsapp-ordering":
      "Hi Jahjah WebDigital, I want customers to order from my restaurant on WhatsApp with a proper menu and cart.",
    "/restaurant-online-ordering":
      "Hi Jahjah WebDigital, I want direct online ordering for my restaurant so we depend less on delivery apps.",
    "/restaurant-digital-menu":
      "Hi Jahjah WebDigital, I'd like a digital menu for my restaurant that helps us sell more.",
    "/restaurant":
      "Hi Jahjah WebDigital, I'm interested in a full ordering system for my restaurant.",
    "/free-restaurant-demo": "Hi Jahjah WebDigital, I'd like my free restaurant demo.",
    "/restaurant-contact": "Hi Jahjah WebDigital, I'd like to talk about my restaurant.",
    "/work":
      "Hi Jahjah WebDigital, I saw your live restaurant ordering websites and I'd like to see what you can build for us.",
    "/packages":
      "Hi Jahjah WebDigital, I'd like a website for my business and have a question about the packages.\nBusiness name: ",
    "/contact": "Hi Jahjah WebDigital, I'd like a website for my business.\nBusiness name: ",
    "/process": "Hi Jahjah WebDigital, I'd like a website for my business.\nBusiness name: ",
    "/website-design": "Hi Jahjah WebDigital, I'd like a website for my business.\nBusiness name: \nCountry: ",
    "/google-business-profile":
      "Hi Jahjah WebDigital, I'd like help with my Google Business Profile / Google Maps listing.\nBusiness name: \nGoogle Maps link: ",
    "/google-ads": "Hi Jahjah WebDigital, I'd like to run Google Ads for my business.\nBusiness name: \nCity / country: ",
    "/google-merchant-center":
      "Hi Jahjah WebDigital, I'd like help with Google Merchant Center / Google Shopping.\nStore link: ",
    "/seo-services": "Hi Jahjah WebDigital, I'd like my website to be found on Google.\nWebsite: ",
    "/marketing-system": "Hi Jahjah WebDigital, I'd like a quote for a marketing system.\nBusiness name: ",
    "/custom-accounting-system": "Hi Jahjah WebDigital, I'd like a quote for a custom accounting system.\nBusiness name: ",
    "/ar": "مرحباً Jahjah WebDigital، بدي اعرف أكتر عن خدماتكم.\nاسم المطعم / الشركة: \nالبلد: ",
  };
  const exact = byPath[path];
  if (exact) return exact.includes("\n") ? exact : `${exact}${RESTAURANT_NAME_PROMPT}`;

  if (path.startsWith("/guides/")) {
    return `Hi Jahjah WebDigital, I read your restaurant guide and I'd like help with my restaurant's menu and ordering.${RESTAURANT_NAME_PROMPT}`;
  }
  if (path.startsWith("/restaurant-")) {
    return `Hi Jahjah WebDigital, I used one of your free restaurant tools and I'd like help fixing what it found.${RESTAURANT_NAME_PROMPT}`;
  }

  // Homepage and anything else: the site leads with restaurants.
  return `Hi Jahjah WebDigital, I own/manage a restaurant and I'd like to see what you can build for us.${RESTAURANT_NAME_PROMPT}`;
}

export function whatsappUrlForPath(pathname: string): string {
  return buildWhatsAppUrl(whatsappMessageForPath(pathname));
}
