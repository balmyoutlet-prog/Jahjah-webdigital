import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { ShowUsYourBusiness } from "./ShowUsYourBusiness";
import { useTrackEvent } from "@/hooks/use-track-event";

const STORAGE_KEY = "jwd_lightbox_last_shown";
const COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days
const SCROLL_THRESHOLD = 0.32;
const TIME_THRESHOLD_MS = 18_000;

function alreadyShownRecently(): boolean {
  try {
    if (sessionStorage.getItem("jwd_lead_engaged")) return true;
    if (localStorage.getItem("jwd_restaurant_lead_submitted")) return true;
    const last = localStorage.getItem(STORAGE_KEY);
    if (!last) return false;
    return Date.now() - Number(last) < COOLDOWN_MS;
  } catch {
    return true; // fail closed — never annoy on a storage error
  }
}

function markShown() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

export function LeadLightbox() {
  const [open, setOpen] = useState(false);
  const track = useTrackEvent();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (alreadyShownRecently()) return;
    // Already shown once this session? Don't re-arm listeners.
    let shownThisSession = false;
    const mountedAt = Date.now();
    const MIN_DWELL_MS = 4000; // ignore a stray exit-intent right at page load

    const reveal = () => {
      if (shownThisSession || alreadyShownRecently()) return;
      if (Date.now() - mountedAt < MIN_DWELL_MS) return;
      shownThisSession = true;
      markShown();
      setOpen(true);
      track("popup_opened", { popup: "restaurant_demo" });
    };

    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;
      if (window.scrollY / scrollable >= SCROLL_THRESHOLD) reveal();
    };

    const timeTimer = window.setTimeout(reveal, TIME_THRESHOLD_MS);

    const isCoarsePointer = window.matchMedia?.("(pointer: coarse)").matches;
    const onMouseLeave = (e: MouseEvent) => {
      if (!isCoarsePointer && e.clientY <= 0) reveal();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    if (!isCoarsePointer) document.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.clearTimeout(timeTimer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, [track]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-foreground/30 p-4 backdrop-blur-sm sm:items-center motion-reduce:transition-none"
      role="dialog"
      aria-modal="true"
      aria-label="Free restaurant demo"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-lift sm:p-8">
        <button
          ref={closeButtonRef}
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Not now"
          className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
        >
          <X className="size-4" />
        </button>
        <p className="display text-2xl">Own or manage a restaurant?</p>
        <p className="mt-1.5 text-sm text-muted-foreground">
          See your restaurant as a branded digital menu with direct ordering, WhatsApp, reservations and smart upselling — before you decide.
        </p>
        <div className="mt-5">
          <ShowUsYourBusiness compact />
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
