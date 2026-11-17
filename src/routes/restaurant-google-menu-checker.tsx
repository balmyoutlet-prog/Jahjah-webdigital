import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { canonicalFor } from "@/lib/seo";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useTrackEvent } from "@/hooks/use-track-event";

const title="Restaurant Google Menu Checker | Jahjah WebDigital";
const description="Free guided restaurant Google menu checker for menu links, branch routing, prices, providers, photos and dish-name accuracy.";

type Answer="yes"|"unsure"|"no";
const checks=[
["Does your Google Business Profile point to your current official menu URL?",15,"Verify the menu link on the exact branch profile."],
["Do the items, prices and availability shown through Google match your current menu?",15,"Compare current items and prices across Google and your owned menu."],
["Do you know which system or provider supplies menu data to Google?",15,"Identify the active menu source before editing."],
["If you use a third-party menu or ordering provider, is its Google data current?",15,"Review active providers and correct stale menu sources."],
["For multiple branches, does each profile lead to the correct branch menu?",15,"Map every location to its own current menu."],
["Are menu photos on Google current rather than showing obsolete printed menus?",10,"Upload current information and flag clearly obsolete menu photos."],
["Are prominent dish names and photos accurate?",10,"Review visible dish names and photos for accuracy."],
["Do you have a repeatable process for menu, price or branch changes?",5,"Use one source of truth and a simple update checklist."]
] as const;
const factor:Record<Answer,number>={yes:1,unsure:.5,no:0};

export const Route=createFileRoute("/restaurant-google-menu-checker")({
head:()=>({
meta:[{title},{name:"description",content:description},{property:"og:title",content:title},{property:"og:description",content:description},{property:"og:type",content:"website"},{property:"og:url",content:canonicalFor("/restaurant-google-menu-checker")},{name:"twitter:card",content:"summary_large_image"}],
links:[{rel:"canonical",href:canonicalFor("/restaurant-google-menu-checker")}],
scripts:[{type:"application/ld+json",children:JSON.stringify({"@context":"https://schema.org","@graph":[{"@type":"WebApplication",name:"Restaurant Google Menu Source Checker",applicationCategory:"BusinessApplication",operatingSystem:"Web",url:canonicalFor("/restaurant-google-menu-checker"),description,provider:{"@type":"ProfessionalService",name:"Jahjah WebDigital",url:canonicalFor("/")}},{"@type":"BreadcrumbList",itemListElement:[{"@type":"ListItem",position:1,name:"Home",item:canonicalFor("/")},{"@type":"ListItem",position:2,name:"Google Menu Checker",item:canonicalFor("/restaurant-google-menu-checker")}]}]})}]
}),
component:Page
});

function Page(){
const track=useTrackEvent();
const [answers,setAnswers]=useState<Record<number,Answer>>({});
const started=useRef(false);
const completed=useRef(false);
const answered=Object.keys(answers).length;
const score=useMemo(()=>Math.round(checks.reduce((sum,c,i)=>sum+(answers[i]?c[1]*factor[answers[i]]:0),0)),[answers]);
const complete=answered===checks.length;
useEffect(()=>{if(answered>0&&!started.current){started.current=true;track("restaurant_readiness_started",{tool:"google_menu_source",answered});track("free_tool_start",{tool:"google_menu_source"});}if(complete&&!completed.current){completed.current=true;track("restaurant_readiness_completed",{tool:"google_menu_source",score});track("free_tool_complete",{tool:"google_menu_source"});}},[answered,complete,score,track]);
const priorities=checks.map((c,i)=>({q:c[0],fix:c[2],w:c[1],a:answers[i]})).filter(x=>x.a==="no"||x.a==="unsure").sort((a,b)=>b.w-a.w).slice(0,3);
const band=score>=85?"Strong menu-source control":score>=60?"Mixed menu sources":"High menu-source risk";
const whatsapp=buildWhatsAppUrl(`Hello Jahjah WebDigital, I completed the Google Menu Source Checker and scored ${score}/100. I'd like a free restaurant-specific audit.`);
return <div className="min-h-screen bg-background"><SiteHeader/><main>
<section className="px-5 pb-14 pt-32 text-center sm:px-8 sm:pt-44"><div className="mx-auto max-w-5xl"><p className="eyebrow text-primary">Free restaurant visibility tool</p><h1 className="display mx-auto mt-5 max-w-4xl text-5xl leading-[.96] sm:text-7xl">Is Google showing the right menu for your restaurant?</h1><p className="mx-auto mt-6 max-w-2xl text-muted-foreground sm:text-lg">Answer eight public-data questions about menu links, prices, providers, branches, photos and dish names. No account access is required.</p></div></section>
<section className="px-5 pb-20 sm:px-8"><div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_.62fr]"><div className="space-y-4">{checks.map((c,i)=><div key={c[0]} className="rounded-2xl border border-border bg-surface p-5"><p className="font-medium">{c[0]}</p><p className="mt-1 text-xs text-muted-foreground">{c[1]} points</p><div className="mt-4 grid grid-cols-3 gap-2">{([["yes","Yes"],["unsure","Not sure"],["no","No"]] as const).map(([v,l])=><button key={v} type="button" onClick={()=>setAnswers(x=>({...x,[i]:v}))} className={`min-h-11 rounded-full border px-3 text-xs font-medium ${answers[i]===v?"border-primary bg-primary text-primary-foreground":"border-border bg-background"}`}>{l}</button>)}</div></div>)}</div>
<aside className="lg:sticky lg:top-28"><div className="rounded-3xl border border-primary/15 bg-[#fff8f7] p-6 shadow-soft"><p className="eyebrow text-primary">Google menu source score</p><div className="mt-5 flex items-end gap-2"><span className="display text-7xl">{score}</span><span className="pb-2 text-sm text-muted-foreground">/ 100</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-primary/10"><div className="h-full rounded-full bg-primary" style={{width:`${score}%`}}/></div><p className="mt-3 text-xs text-muted-foreground">{answered}/{checks.length} checks answered</p>{complete&&<div className="mt-7"><h2 className="text-lg font-medium">{band}</h2><p className="mt-2 text-sm text-muted-foreground">{score>=85?"Keep checking the profile after pricing, provider or branch changes.":"Fix the highest-weight conflicts before sending more traffic to the profile."}</p>{priorities.length>0&&<div className="mt-5 space-y-3">{priorities.map(p=><p key={p.q} className="flex gap-2 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-primary"/>{p.fix}</p>)}</div>}<div className="mt-7 grid gap-3"><Link to="/free-restaurant-demo" onClick={()=>track("restaurant_offer_click",{location:"google_menu_source_checker",score})} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-xs font-semibold uppercase tracking-[.14em] text-white">Audit My Real Restaurant <ArrowRight className="size-4"/></Link><a href={whatsapp} target="_blank" rel="noopener noreferrer" onClick={()=>track("whatsapp_click",{location:"google_menu_source_checker",score})} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-6 text-xs font-semibold uppercase tracking-[.14em] text-foreground"><MessageCircle className="size-4"/> Ask on WhatsApp</a></div></div>}</div></aside></div></section>
<section className="hairline px-5 py-20 sm:px-8"><div className="mx-auto max-w-4xl"><p className="eyebrow text-primary">What to verify</p><h2 className="display mt-5 text-4xl sm:text-6xl">One restaurant can have more than one public menu source.</h2><div className="mt-8 grid gap-4 sm:grid-cols-2">{[["Business Profile menu editor","Items, descriptions and prices may be managed directly when the editor is available."],["Menu URL","Your profile can point customers to an owned or authorized menu destination."],["Connected providers","Some menu data can come from providers or APIs, so identify the source before fixing stale information."],["Photos and dish names","Current menu photos and accurate dish names help customers recognize what you actually serve."]].map(([a,b])=><div key={a} className="rounded-2xl border border-border bg-surface p-5"><h3 className="font-medium">{a}</h3><p className="mt-2 text-sm text-muted-foreground">{b}</p></div>)}</div><a href="https://support.google.com/business/answer/9455840" target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex text-sm font-medium text-primary underline">Google Business Profile menu guidance</a></div></section>
<section className="hairline px-5 py-20 text-center sm:px-8"><div className="mx-auto max-w-3xl"><p className="eyebrow text-primary">Next step</p><h2 className="display mt-5 text-4xl sm:text-6xl">Check the real menu journey, not just the score.</h2><p className="mx-auto mt-5 max-w-2xl text-muted-foreground">We can review your public Google and Maps profile, owned menu, branch routing and ordering flow and prepare a restaurant-specific demo.</p><Link to="/free-restaurant-demo" className="mt-8 inline-flex min-h-14 items-center gap-2 rounded-full bg-primary px-7 text-xs font-semibold uppercase tracking-[.15em] text-primary-foreground">Request My Free Audit <ArrowRight className="size-4"/></Link></div></section>
</main><SiteFooter/></div>;
}