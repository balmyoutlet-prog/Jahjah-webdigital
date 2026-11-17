import { projects, type Project } from "@/lib/site-data";

// Checked against the live site: language picker, five-branch selection,
// "complete your meal" add-on step, AED pricing and a "Created by Jahjah
// WebDigital" credit in the footer.
const afandiDubai: Project = {
  slug: "al-afandi-chicken-dubai",
  name: "Al Afandi Chicken — Dubai",
  category: "Restaurant Ordering · 5 branches",
  outcome: "Five-branch bilingual ordering system",
  description:
    "A bilingual, mobile-first ordering website for Al Afandi Chicken Dubai with branch selection, a complete-your-meal add-on step and direct checkout.",
  url: "https://alafandichicken.com/",
  image: "/images/alafandi.jpg",
  year: "Live",
  market: "Dubai, UAE",
  restaurant: true,
  challenge:
    "A five-branch Dubai operation needed one ordering experience that lets customers pick their meal, add sides and drinks, choose the right branch and complete the order from a phone — in Arabic or English.",
  whatWeBuilt: [
    "Arabic / English language choice on arrival",
    "“Complete your meal” upsell step",
    "Nearest-branch selection across 5 branches",
    "Cart with send-or-pay checkout",
    "AED pricing and mobile-first layout",
  ],
  journey: ["Choose your meal", "Add what goes with it", "Choose the branch", "Send or pay"],
  businessValue:
    "The add-on step suggests sides and drinks before checkout, and every order reaches the correct branch — without a marketplace sitting between the restaurant and its customer.",
};

/** Restaurant work first: it is the proof restaurant owners came to see. */
export const portfolioProjects: Project[] = [
  afandiDubai,
  ...projects.filter((p) => p.restaurant),
  ...projects.filter((p) => !p.restaurant),
];

export const restaurantProjects: Project[] = portfolioProjects.filter((p) => p.restaurant);
