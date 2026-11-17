import { MessageCircle } from "lucide-react";
import { useTrackEvent } from "@/hooks/use-track-event";
import { useRouterState } from "@tanstack/react-router";
import { useContextualWhatsAppUrl } from "@/hooks/use-contextual-whatsapp";
import { cn } from "@/lib/utils";

export function FloatingWhatsApp() {
  const track = useTrackEvent();
  const whatsappUrl = useContextualWhatsAppUrl();
  // The homepage has its own mobile sticky bar with a WhatsApp button;
  // stacking this bubble on top of it would cover the main CTA.
  const hasStickyBar = useRouterState({ select: (s) => s.location.pathname === "/" });
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Jahjah WebDigital on WhatsApp"
      onClick={() => track("whatsapp_click", { location: "floating_button" })}
      className={cn(
        hasStickyBar && "max-sm:hidden",
        "fixed right-4 z-[70] inline-flex min-h-14 items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,.22)] transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 sm:right-6 sm:px-5",
      )}
      style={{ bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))" }}
    >
      <MessageCircle className="h-5 w-5" aria-hidden="true" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
