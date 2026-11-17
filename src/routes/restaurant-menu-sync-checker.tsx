import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Check, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { canonicalFor } from "@/lib/seo";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useTrackEvent } from "@/hooks/use-track-event";

const title="Restaurant Menu Sync Checker | Jahjah WebDigital";
const description="Free restaurant menu sync checker for website, Google, delivery apps, QR menus, booking pages and branch menus after a menu update.";
type Answer="yes"|"unsure"|"no";
const factor:Record<Answer,number>={yes:1,unsure:.5,no:0};
const checks=[
["Website menu matches the current approved items, prices and availability",15],
["Google or Maps points to the current menu for the correct branch",15],
["Delivery and ordering platforms show the current items, prices and availability",15],
["QR codes and printed menu links open the current menu, not an old PDF or page",12],
["Booking or experience pages show current menu names, offers and pricing where relevant",8],
["Every branch points to the correct local menu",12],
["Menu photos, featured dishes and seasonal promotions are current",8],
["Dietary, allergen and availability notes match the restaurant-approved information",5],
["WhatsApp or direct-order flows use the current choices and add-ons",5],
["Old public menu URLs are redirected, retired or clearly superseded",5]
] as const;

export const Route=createFileRoute("/restaurant-menu-sync-checker")({
head:()=>({meta:[{title},{name:"description",content:description},{property:"og:title",content:title},{property:"og:description",content:description}],links:[{rel:"canonical",href:canonicalFor("/restaurant-menu-sync-checker")}],scripts:[{type:"application/ld+json",children:JSON.stringify({"@context":"https://schema.org","@type":"WebApplication",name:"Restaurant Menu Sync Checker",applicationCategory:"BusinessApplication",operatingSystem:"Web",url:canonicalFor("/restaurant-menu-sync-checker"),description,provider:{"@type":"ProfessionalService",name:"Jahjah WebDigital",url:canonicalFor("/")}})}]}),
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
useEffect(()=>{
  if(answered>0&&!started.current){started.current=true;track("restaurant_readiness_started",{tool:"menu_sync",answered});track("free_tool_start",{tool:"menu_sync"});}
  if(complete&&!completed.current){completed.current=true;track("restaurant_readiness_completed",{tool:"menu_sync",score});track("free_tool_complete",{tool:"menu_sync"});}
},[answered,complete,score,track]);
const whatsapp=buildWhatsAppUrl("Hello Jahjah WebDigital, I completed the Restaurant Menu Sync Checker and scored "+score+"/100. I would like a free restaurant-specific audit.");
const priorities=checks.map((c,i)=>({name:c[0],weight:c[1],answer:answers[i]})).filter(x=>x.answer==="no"||x.answer==="unsure").sort((a,b)=>b.weight-a.weight).slice(0,3);
return <div className="min-h-screen bg-background"><SiteHeader/><main>
<section className="px-5 pb-14 pt-32 text-center sm:px-8 sm:pt-44"><div className="mx-auto max-w-5xl"><p className="eyebrow text-primary">Free restaurant menu update tool</p><h1 className="display mx-auto mt-5 max-w-4xl text-5xl leading-[.96] sm:text-7xl">Your menu changed. Did every customer-facing channel change with it?</h1><p className="mx-auto mt-6 max-w-2xl text-muted-foreground sm:text-lg">Check the website, Google, delivery apps, QR codes, booking pages, branch menus and old URLs after a menu or price update. No login is required.</p></div></section>
<section className="px-5 pb-20 sm:px-8"><div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_.62fr]"><div className="space-y-4">{checks.map((c,i)=><div key={c[0]} className="rounded-2xl border border-border bg-surface p-5"><p className="font-medium">{c[0]}</p><p className="mt-1 text-xs text-muted-foreground">{c[1]} points</p><div className="mt-4 grid grid-cols-3 gap-2">{([["yes","Yes"],["unsure","Not sure"],["no","No"]] as const).map(([v,l])=><button key={v} type="button" onClick={()=>setAnswers(x=>({...x,[i]:v}))} className={"min-h-11 rounded-full border px-3 text-xs font-medium "+(answers[i]===v?"border-primary bg-primary text-primary-foreground":"border-border bg-background")}>{l}</button>)}</div></div>)}</div><aside className="lg:sticky lg:top-28"><div className="rounded-3xl border border-primary/15 bg-[#fff8f7] p-6 shadow-soft"><p className="eyebrow text-primary">Menu sync score</p><div className="mt-5 flex items-end gap-2"><span className="display text-7xl">{score}</span><span className="pb-2 text-sm text-muted-foreground">/ 100</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-primary/10"><div className="h-full rounded-full bg-primary" style={{width:score+"%"}}/></div><p className="mt-3 text-xs text-muted-foreground">{answered}/{checks.length} checks answered</p>{complete&&<div className="mt-7"><h2 className="text-lg font-medium">{score>=85?"Strong menu propagation":score>=60?"Some menu surfaces may be out of sync":"High menu-sync risk"}</h2>{priorities.length>0&&<div className="mt-5 space-y-3">{priorities.map(p=><p key={p.name} className="flex gap-2 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-primary"/>{p.name}</p>)}</div>}<div className="mt-7 grid gap-3"><Link to="/free-restaurant-demo" onClick={()=>track("restaurant_offer_click",{location:"menu_sync_checker",score})} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-xs font-semibold uppercase tracking-[.14em] text-white">Audit My Real Restaurant <ArrowRight className="size-4"/></Link><a href={whatsapp} target="_blank" rel="noopener noreferrer" onClick={()=>track("whatsapp_click",{location:"menu_sync_checker",score})} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-6 text-xs font-semibold uppercase tracking-[.14em] text-foreground"><MessageCircle className="size-4"/> Ask on WhatsApp</a></div></div>}</div></aside></div></section>
<section className="hairline px-5 py-20 sm:px-8"><div className="mx-auto max-w-5xl"><p className="eyebrow text-primary">Why menus drift</p><h2 className="display mt-5 max-w-4xl text-4xl sm:text-6xl">One menu update can leave several older versions behind.</h2><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[["Owned website","Old PDFs and branch pages can survive after a new menu goes live."],["Google & Maps","A profile can keep an old menu URL or another data source."],["Delivery & ordering","Providers can retain old items, prices, modifiers or availability."],["QR codes","Printed codes can still open a legacy destination."],["Booking pages","Experiences can carry old menu names, packages or pricing."],["Multiple branches","One location can remain on the previous menu."]].map(([a,b])=><div key={a} className="rounded-2xl border border-border bg-surface p-5"><h3 className="font-medium">{a}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b}</p></div>)}</div></div></section>
<section className="hairline bg-[#fff8f7] px-5 py-20 sm:px-8"><div className="mx-auto max-w-5xl"><p className="eyebrow text-primary">Use it after every change</p><h2 className="display mt-5 text-4xl sm:text-5xl">Menu launch, price update, seasonal refresh or new branch.</h2><p className="mt-5 max-w-3xl text-muted-foreground">The goal is not to force every channel to look identical. It is to make sure every customer-facing surface uses the correct approved information for that location and moment.</p><div className="mt-8 flex flex-wrap gap-3"><Link to="/restaurant-google-menu-checker" className="rounded-full border border-border px-5 py-3 text-sm font-medium">Google Menu Checker</Link><Link to="/restaurant-digital-menu" className="rounded-full border border-border px-5 py-3 text-sm font-medium">Digital Menu</Link><Link to="/restaurant-ordering-readiness-score" className="rounded-full border border-border px-5 py-3 text-sm font-medium">Ordering Readiness</Link></div></div></section>
<section className="hairline px-5 py-20 text-center sm:px-8"><div className="mx-auto max-w-3xl"><p className="eyebrow text-primary">Next step</p><h2 className="display mt-5 text-4xl sm:text-6xl">Check the real menu journey, not just one menu page.</h2><p className="mx-auto mt-5 max-w-2xl text-muted-foreground">Send the restaurant name, website or Instagram. We can review the public menu journey and prepare a focused restaurant-specific demo.</p><Link to="/free-restaurant-demo" className="mt-8 inline-flex min-h-14 items-center gap-2 rounded-full bg-primary px-7 text-xs font-semibold uppercase tracking-[.15em] text-primary-foreground">Request My Free Audit <ArrowRight className="size-4"/></Link></div></section>
</main><SiteFooter/></div>;
}