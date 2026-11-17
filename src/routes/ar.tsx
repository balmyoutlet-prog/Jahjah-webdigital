import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { canonicalFor } from "@/lib/seo";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { projects } from "@/lib/site-data";
import { useTrackEvent } from "@/hooks/use-track-event";

// Arabic landing page: many restaurant and business owners in Lebanon and the
// Gulf search in Arabic ("منيو الكتروني", "تصميم موقع مطعم"), and the rest of
// the site is English. Prices must match src/lib/restaurant.ts and /packages.

const TITLE = "منيو إلكتروني وتصميم مواقع للمطاعم والشركات في لبنان ودبي والخليج | Jahjah WebDigital";
const DESCRIPTION =
  "منيو إلكتروني QR، نظام طلبات أونلاين وواتساب بدون عمولة، تصميم مواقع للشركات والمتاجر، وإدارة جوجل بزنس وإعلانات جوجل وجوجل ميرشانت سنتر. لبنان، الإمارات، السعودية، قطر والكويت.";
const PATH = "/ar";

const WHATSAPP_MESSAGE =
  "مرحباً Jahjah WebDigital، بدي اعرف أكتر عن خدماتكم.\nاسم المطعم / الشركة: \nالبلد: \nشو بحاجة: ";

const SERVICES = [
  { to: "/restaurant-digital-menu", title: "منيو إلكتروني للمطاعم", body: "منيو رقمي بالعربي والإنكليزي، صور وأسعار تتعدل مرة وحدة وبتتحدث بكل مكان." },
  { to: "/qr-menu", title: "منيو QR والطلب من الطاولة", body: "الزبون بيعمل سكان للكود وبيطلب مباشرة من الطاولة بدون تطبيق." },
  { to: "/whatsapp-ordering", title: "نظام طلبات واتساب", body: "الطلب بيوصلك على الواتساب كامل: الأصناف، الإضافات، الفرع ورقم الزبون." },
  { to: "/restaurant-online-ordering", title: "طلبات أونلاين بدون عمولة", body: "موقع طلبات خاص فيك: توصيل، تيك أواي وصالة، بدون نسبة على كل طلب." },
  { to: "/website-design", title: "تصميم مواقع للشركات", body: "مواقع سريعة ومناسبة للموبايل، بالعربي والإنكليزي، جاهزة لجوجل." },
  { to: "/google-business-profile", title: "جوجل بزنس وخرائط جوجل", body: "إنشاء وتحسين حسابك على Google Maps حتى يلاقيك الزبون القريب منك." },
  { to: "/google-ads", title: "إعلانات جوجل والكلمات المفتاحية", body: "حملات بحث مبنية على الكلمات اللي بيكتبها زبونك، مع قياس كل اتصال ورسالة." },
  { to: "/google-merchant-center", title: "جوجل ميرشانت سنتر وجوجل شوبينج", body: "عرض منتجات متجرك بصورها وأسعارها بنتائج جوجل." },
  { to: "/seo-services", title: "تحسين الظهور على جوجل (SEO)", body: "صفحات لكل خدمة ومدينة، إصلاحات تقنية وربط Google Search Console." },
  { to: "/marketing-system", title: "نظام تسويق وإدارة زبائن", body: "جمع الطلبات والاستفسارات بمكان واحد ومتابعة سريعة على الواتساب." },
  { to: "/kitchen-display-dashboard", title: "شاشة مطبخ للطلبات", body: "الطلبات بتظهر على شاشة المطبخ من جديد لجاهز." },
  { to: "/custom-accounting-system", title: "نظام محاسبة مخصص", body: "فواتير، مصاريف وتقارير مبنية على طريقة شغلك." },
] as const;

const PRICES = [
  ["صفحة تعريفية للمطعم", "$299", "+ $99 شهرياً استضافة ودعم"],
  ["منيو ونظام طلبات كامل", "$699", "+ $99 شهرياً استضافة ودعم"],
  ["نظام طلبات + تسويق وSEO محلي", "$1,299", "+ $149 شهرياً استضافة ودعم"],
  ["مواقع الشركات", "من $319", "+ $99 شهرياً استضافة ودعم"],
] as const;

const FAQS = [
  { q: "قديش كلفة المنيو الإلكتروني؟", a: "المنيو ونظام الطلبات الكامل $699 دفعة وحدة، و$99 شهرياً للاستضافة والدعم بعد الإطلاق. ما في عمولة على الطلبات." },
  { q: "لازم الزبون ينزّل تطبيق؟", a: "لا. المنيو بيفتح بالمتصفح من كود QR أو رابط، على أي موبايل." },
  { q: "بتشتغلوا برا لبنان؟", a: "إيه. نحنا بلبنان ومنشتغل لمطاعم وشركات بالإمارات والسعودية وقطر والكويت، ومن شغلنا المباشر Al Afandi Chicken بدبي." },
  { q: "بتضمنوا أول نتيجة على جوجل؟", a: "ما حدا بيقدر يضمن ترتيب بصدق. منبني الأساس الصح، ومنحسن حساب جوجل بزنس، ومنقدر نشغّل إعلانات جوجل لنتائج أسرع، ومنقيس كل استفسار." },
  { q: "في عرض تجريبي مجاني؟", a: "إيه. ابعتلنا اسم المطعم والإنستغرام ومنحضّرلك اتجاه منيو وطلبات خاص فيك، بدون أي التزام." },
] as const;

export const Route = createFileRoute("/ar")({
  head: () => {
    const url = canonicalFor(PATH);
    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESCRIPTION },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESCRIPTION },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:locale", content: "ar_LB" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebPage",
                name: TITLE,
                description: DESCRIPTION,
                url,
                inLanguage: "ar",
                about: { "@id": `${canonicalFor("/")}#organization` },
              },
              {
                "@type": "FAQPage",
                inLanguage: "ar",
                mainEntity: FAQS.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              },
            ],
          }),
        },
      ],
    };
  },
  component: ArabicLanding,
});

function ArabicLanding() {
  const track = useTrackEvent();
  const wa = buildWhatsAppUrl(WHATSAPP_MESSAGE);
  return (
    <>
      <SiteHeader />
      <main lang="ar" dir="rtl" className="bg-background text-right text-foreground">
        <section className="mx-auto max-w-5xl px-5 pb-14 pt-28 sm:px-8 sm:pt-36">
          <p className="text-sm text-primary">Jahjah WebDigital · لبنان · دبي · الخليج</p>
          <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
            منيو إلكتروني، طلبات أونلاين، مواقع وأنظمة — وكل شي بيخلّي جوجل يجيبلك زبائن.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            منبني للمطاعم والشركات أنظمة كاملة: منيو رقمي وطلبات بدون عمولة، مواقع للشركات والمتاجر،
            وحضور قوي على جوجل — خرائط جوجل، إعلانات جوجل وجوجل شوبينج. أسعار ثابتة ومعلنة، وشغل حي فيك تجربه بنفسك.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_click", { location: "ar_hero" })}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
            >
              <MessageCircle className="h-4 w-4" aria-hidden /> احكينا على الواتساب
            </a>
            <Link
              to="/free-restaurant-demo"
              onClick={() => track("demo_cta_click", { location: "ar_hero" })}
              className="text-sm font-semibold underline underline-offset-4"
            >
              اطلب عرض تجريبي مجاني لمطعمك
            </Link>
          </div>
        </section>

        <section className="border-t border-border bg-secondary/40">
          <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
            <h2 className="font-display text-2xl sm:text-3xl">خدماتنا</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((s) => (
                <Link
                  key={s.to}
                  to={s.to}
                  className="rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40"
                >
                  <h3 className="font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
          <h2 className="font-display text-2xl sm:text-3xl">شغل حي — افتحه وجرّبه</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {projects.map((p) => (
              <li key={p.slug}>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("work_click", { project: p.slug, location: "ar" })}
                  className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40"
                >
                  <span className="text-xs text-primary" dir="ltr">{p.market ?? p.category}</span>
                  <span className="mt-1 font-semibold" dir="ltr">{p.name}</span>
                  <span className="mt-2 text-sm text-muted-foreground" dir="ltr">{p.outcome}</span>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold">
                    افتح الموقع <ArrowUpRight className="size-3.5" aria-hidden />
                  </span>
                </a>
              </li>
            ))}
          </ul>
          <Link to="/work" className="mt-5 inline-flex text-sm font-semibold underline underline-offset-4">
            شوف كل المشاريع
          </Link>
        </section>

        <section className="border-t border-border bg-secondary/40">
          <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
            <h2 className="font-display text-2xl sm:text-3xl">الأسعار</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              دفعة وحدة للبناء، بلا عمولة على الطلبات. أي ميزة إضافية (لغة تانية، حجوزات، فرع إضافي...) $50.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {PRICES.map(([name, price, care]) => (
                <div key={name} className="rounded-2xl border border-border bg-card p-5">
                  <p className="font-semibold">{name}</p>
                  <p className="mt-2 font-display text-3xl text-primary" dir="ltr">{price}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{care}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              خدمات جوجل (جوجل بزنس، إعلانات جوجل، ميرشانت سنتر وSEO) منسعّرها بعد مراجعة مجانية، وميزانية الإعلانات بتدفعها مباشرة لجوجل.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8">
          <h2 className="font-display text-2xl sm:text-3xl">أسئلة متكررة</h2>
          <dl className="mt-6 space-y-5">
            {FAQS.map((f) => (
              <div key={f.q} className="border-t border-border pt-4">
                <dt className="font-semibold">{f.q}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-10 rounded-2xl border border-primary/20 bg-[#fff8f7] p-6 sm:p-8">
            <p className="font-display text-2xl">جاهز؟ ابعتلنا اسم شغلك ومنرجعلك بأسرع وقت.</p>
            <ul className="mt-4 space-y-2 text-sm">
              {["رابط الإنستغرام أو الموقع", "رابط خرائط جوجل إذا موجود", "شو بدك: منيو، طلبات، موقع، أو جوجل"].map((t) => (
                <li key={t} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_click", { location: "ar_final" })}
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#1fa855] px-6 text-sm font-semibold text-white"
            >
              <MessageCircle className="h-4 w-4" aria-hidden /> واتساب <span dir="ltr">+961 71 466 516</span>
            </a>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
