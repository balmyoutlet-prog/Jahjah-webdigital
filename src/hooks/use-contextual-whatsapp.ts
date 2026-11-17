import { useRouterState } from "@tanstack/react-router";
import { whatsappUrlForPath } from "@/lib/whatsapp";

/** WhatsApp link pre-filled for the current page. Reads the router location
 *  (not `window`) so the server-rendered href already carries the right
 *  message and hydration never swaps it. */
export function useContextualWhatsAppUrl(): string {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return whatsappUrlForPath(pathname);
}
