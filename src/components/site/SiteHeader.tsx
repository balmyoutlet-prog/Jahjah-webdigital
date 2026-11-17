import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, MessageCircle, Sparkles, X } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { useContextualWhatsAppUrl } from "@/hooks/use-contextual-whatsapp";
import { cn } from "@/lib/utils";
import { useTrackEvent } from "@/hooks/use-track-event";

const nav = [
  { label: "Websites", to: "/website-design" },
  { label: "Digital Menu", to: "/restaurant-digital-menu" },
  { label: "Accounting", to: "/custom-accounting-system" },
  { label: "CRM & Marketing", to: "/marketing-system" },
  { label: "Live Work", to: "/work" },
] as const;

export function SiteHeader() {
  const track = useTrackEvent();
  const whatsappUrl = useContextualWhatsAppUrl();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 px-3 pt-3 transition-all duration-500 sm:px-5",
        scrolled ? "pt-2" : "pt-3",
      )}
    >
      <div
        className={cn(
          "relative mx-auto flex h-[66px] max-w-7xl items-center justify-between overflow-hidden rounded-[1.35rem] border px-4 transition-all duration-500 sm:h-[72px] sm:px-5",
          scrolled
            ? "border-primary/20 bg-[#fff9f8]/88 shadow-[0_18px_55px_-30px_rgba(72,39,45,.38)] backdrop-blur-2xl"
            : "border-white/70 bg-[#fff9f8]/72 shadow-[0_12px_45px_-32px_rgba(72,39,45,.25)] backdrop-blur-xl",
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[8%] -top-10 h-20 rounded-full bg-[radial-gradient(circle,rgba(213,127,178,.18),rgba(141,114,255,.08)_42%,transparent_72%)] blur-xl"
        />

        <div className="relative flex items-center gap-3">
          <span onClick={() => setOpen(false)}>
            <BrandMark />
          </span>
          <span className="hidden items-center gap-1.5 rounded-full border border-primary/15 bg-white/65 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[.18em] text-primary lg:inline-flex">
            <Sparkles className="size-3" /> Websites & systems
          </span>
        </div>

        <nav className="relative hidden items-center gap-7 md:flex" aria-label="Primary">
          {nav.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="relative flex items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { location: "header" })}
            className="hidden min-h-11 items-center gap-2 rounded-full border border-[#25D366]/30 bg-white/75 px-4 text-xs font-medium text-foreground shadow-sm transition-transform hover:-translate-y-0.5 sm:inline-flex"
          >
            <MessageCircle className="size-4 text-[#159447]" /> WhatsApp
          </a>
          <Link
            to="/free-restaurant-demo"
            onClick={() => track("restaurant_offer_click", { location: "header" })}
            className="hidden min-h-11 items-center gap-2 rounded-full bg-foreground px-5 text-xs font-semibold uppercase tracking-[0.13em] text-white shadow-[0_12px_30px_-16px_rgba(40,20,24,.7)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_35px_-16px_rgba(40,20,24,.8)] sm:inline-flex"
          >
            Get free demo <Sparkles className="size-3.5 text-[#f0c6dc]" />
          </Link>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full border border-primary/20 bg-white/80 text-foreground shadow-sm md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 top-[82px] z-40 flex flex-col justify-between bg-[#fff9f8]/96 px-6 pb-8 pt-8 backdrop-blur-2xl md:hidden">
          <div>
            <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white px-3 py-1.5 text-[10px] uppercase tracking-[.18em] text-primary">
              <Sparkles className="size-3" /> Websites · menus · business systems
            </span>
            <nav className="flex flex-col gap-6" aria-label="Mobile">
              {nav.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="font-display text-4xl text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="space-y-3">
            <Link
              to="/free-restaurant-demo"
              onClick={() => setOpen(false)}
              className="flex min-h-14 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-xs font-semibold uppercase tracking-[0.16em] text-white"
            >
              Get free demo <Sparkles className="size-4" />
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("whatsapp_click", { location: "mobile_menu" })}
              className="flex min-h-14 items-center justify-center gap-2 rounded-full border border-[#25D366]/40 bg-white text-xs uppercase tracking-[0.16em]"
            >
              <MessageCircle className="size-4 text-[#159447]" /> WhatsApp us
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
