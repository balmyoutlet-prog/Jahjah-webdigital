import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, ExternalLink } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ShowUsYourBusiness } from "@/components/site/ShowUsYourBusiness";
import { canonicalFor } from "@/lib/seo";

const title="Restaurant Website, Digital Menu & Ordering Abu Dhabi | Jahjah WebDigital";
const description="Restaurant websites, digital and QR menus, direct ordering, WhatsApp, reservations, Google menu journeys and branch systems for Abu Dhabi restaurants.";

const services=[
  ["Digital & QR menu","Mobile-first menu pages that guests can actually read, browse and revisit."],
  ["Direct online ordering","A branded path for delivery, takeaway or other restaurant-specific order flows."],
  ["WhatsApp ordering","Structured handoff from menu and branch context instead of an empty chat."],
  ["Reservations","Clear booking paths that send diners to the right outlet and booking destination."],
  ["Google & menu consistency","Keep owned menu links, branch details and high-intent discovery paths aligned."],
  ["Customer insights","Measure useful actions such as menu views, order starts, reservation clicks and inquiries."]
] as const;

const faqs=[
  ["Can an Abu Dhabi restaurant keep delivery marketplaces and add direct ordering?","Yes. Direct ordering can complement marketplace discovery. The right mix depends on the restaurant, branch operations and how customers already order."],
  ["Should each branch have its own menu and contact path?","For multi-location restaurants, each branch should have a clear source of truth for address, hours, menu, booking or order destination and contact details."],
  ["Can you update an existing website instead of rebuilding it?","Yes. If the current site is structurally sound, a focused menu, booking, ordering or local-discovery update may be more useful than a full rebuild."],
  ["How should menu changes be handled across QR, Google and ordering pages?","Keep one approved menu source and test every public destination after changes. Old PDFs, stale Google menu links and branch-specific ordering pages are common places for previous information to survive."]
] as const;

export const Route=createFileRoute("/restaurants/abu-dhabi")({
  head:()=>({
    meta:[
      {title},
      {name:"description",content:description},
      {property:"og:title",content:title},
      {property:"og:description",content:description},
      {property:"og:type",content:"website"},
      {property:"og:url",content:canonicalFor("/restaurants/abu-dhabi")}
    ],
    links:[{rel:"canonical",href:canonicalFor("/restaurants/abu-dhabi")}],
    scripts:[{type:"application/ld+json",children:JSON.stringify({
      "@context":"https://schema.org",
      "@graph":[
        {"@type":"Service",name:"Restaurant Digital Menu, Ordering & Website Services",areaServed:"Abu Dhabi, UAE",provider:{"@type":"ProfessionalService",name:"Jahjah WebDigital",url:canonicalFor("/")},url:canonicalFor("/restaurants/abu-dhabi"),description},
        {"@type":"FAQPage",mainEntity:faqs.map(([q,a])=>({"@type":"Question",name:q,acceptedAnswer:{"@type":"Answer",text:a}}))}
      ]
    })}]
  }),
  component:Page
});

function Page(){
return <div className="min-h-screen bg-background"><SiteHeader/><main>
<section className="px-5 pb-20 pt-32 sm:px-8 sm:pb-28 sm:pt-44"><div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.05fr_.95fr]"><div>
<p className="eyebrow text-primary">Restaurant growth · Abu Dhabi, UAE</p>
<h1 className="display mt-5 text-5xl leading-[.96] sm:text-7xl">From Google search to the right menu, branch, order or reservation.</h1>
<p className="mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">Build one clear customer journey across your restaurant website, mobile menu, QR, Google discovery, WhatsApp and reservations — without forcing every guest into the same channel.</p>
<div className="mt-8 flex flex-wrap gap-3"><a href="#free-demo" className="inline-flex min-h-14 items-center gap-2 rounded-full bg-foreground px-7 text-xs font-semibold uppercase tracking-[.15em] text-white">Get My Free Demo <ArrowRight className="size-4"/></a><Link to="/restaurant-google-menu-checker" className="inline-flex min-h-14 items-center rounded-full border border-border px-7 text-xs font-semibold uppercase tracking-[.15em]">Check Google Menu</Link></div>
</div><div id="free-demo" className="scroll-mt-28"><ShowUsYourBusiness/></div></div></section>

<section className="hairline px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl">
<p className="eyebrow text-primary">One restaurant journey</p><h2 className="display mt-5 max-w-4xl text-4xl sm:text-6xl">Use the right channel at the right moment.</h2>
<div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{services.map(([name,body])=><div key={name} className="rounded-2xl border border-border bg-surface p-6"><h3 className="text-lg font-medium">{name}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p></div>)}</div>
</div></section>

<section className="hairline bg-[#fff8f7] px-5 py-20 sm:px-8"><div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.8fr_1.2fr]">
<div><p className="eyebrow text-primary">October 2026 operator note</p><h2 className="display mt-5 text-4xl sm:text-5xl">When the approved menu changes, the digital menu has to follow.</h2></div>
<div><p className="text-base leading-relaxed text-muted-foreground">DCT Abu Dhabi's official circulars page currently lists Circular 7/2026 on minimum healthy food options in hotel restaurant menus and Circular 8/2026 on potassium-enriched salt in hotel restaurants. For covered operators, the compliance decision belongs with the restaurant, DCT Abu Dhabi and the relevant public-health authority. Our role is the customer-facing handoff: making sure the approved current menu is also the version guests reach from the website, QR code, Google menu link and ordering journey.</p>
<div className="mt-6 grid gap-3 sm:grid-cols-2">{["Website / mobile menu","QR destination","Google menu link","Ordering menu","Children's menu","Old PDF cleanup"].map(x=><p key={x} className="flex gap-2 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-primary"/>{x}</p>)}</div>
<a href="https://dct.gov.ae/en/media.centre/circulars.aspx/" target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-4">Check current DCT Abu Dhabi circulars <ExternalLink className="size-4"/></a>
<p className="mt-5 text-xs leading-relaxed text-muted-foreground">Jahjah WebDigital does not classify dishes or provide legal, licensing, nutritional or SEHHI certification advice.</p></div>
</div></section>

<section className="hairline px-5 py-20 sm:px-8"><div className="mx-auto max-w-7xl">
<p className="eyebrow text-primary">Multi-branch restaurants</p><h2 className="display mt-5 max-w-4xl text-4xl sm:text-6xl">One source of truth for every Abu Dhabi location.</h2>
<p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground">As branches open, relocate or change hours and menus, each location should keep its own approved address, phone, hours, menu, booking destination and order path. That reduces the chance of one branch inheriting another branch's information across the website, Google or external providers.</p>
<div className="mt-8 flex flex-wrap gap-3"><Link to="/restaurant-launch-readiness-score" className="rounded-full border border-border px-5 py-3 text-sm font-medium">Launch Readiness Score</Link><Link to="/restaurant-relocation-seo-checklist" className="rounded-full border border-border px-5 py-3 text-sm font-medium">Relocation Checklist</Link><Link to="/restaurant-ordering-readiness-score" className="rounded-full border border-border px-5 py-3 text-sm font-medium">Ordering Readiness Score</Link></div>
</div></section>

<section className="hairline px-5 py-20 sm:px-8"><div className="mx-auto max-w-6xl"><p className="eyebrow text-primary">Common questions</p><h2 className="display mt-5 text-4xl sm:text-5xl">Abu Dhabi restaurant digital FAQs</h2><div className="mt-10 grid gap-x-12 gap-y-9 md:grid-cols-2">{faqs.map(([q,a])=><div key={q} className="border-t border-border pt-5"><h3 className="text-lg font-medium">{q}</h3><p className="mt-3 text-base leading-relaxed text-muted-foreground">{a}</p></div>)}</div></div></section>

<section className="hairline px-5 py-20 text-center sm:px-8"><div className="mx-auto max-w-4xl"><p className="eyebrow text-primary">Free restaurant-specific review</p><h2 className="display mt-5 text-4xl sm:text-6xl">Show us the restaurant. We will check the public customer journey.</h2><p className="mx-auto mt-6 max-w-2xl text-muted-foreground">Send the restaurant name, website or Instagram. We can review how customers reach the menu, branch, reservation or order path and prepare a focused demo based on the real business.</p><Link to="/free-restaurant-demo" className="mt-8 inline-flex min-h-14 items-center gap-2 rounded-full bg-primary px-7 text-xs font-semibold uppercase tracking-[.15em] text-primary-foreground">Request My Free Audit <ArrowRight className="size-4"/></Link></div></section>
</main><SiteFooter/></div>
}
