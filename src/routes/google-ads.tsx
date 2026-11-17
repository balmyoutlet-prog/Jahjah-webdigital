import { createFileRoute } from "@tanstack/react-router";
import { CustomSystemPage, customSystemHead } from "@/components/site/CustomSystemPage";
import { CUSTOM_SYSTEMS } from "@/lib/custom-systems";

const system = CUSTOM_SYSTEMS.googleAds;

export const Route = createFileRoute("/google-ads")({
  head: () => customSystemHead(system),
  component: () => <CustomSystemPage system={system} />,
});
