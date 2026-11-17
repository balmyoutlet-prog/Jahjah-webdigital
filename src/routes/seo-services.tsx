import { createFileRoute } from "@tanstack/react-router";
import { CustomSystemPage, customSystemHead } from "@/components/site/CustomSystemPage";
import { CUSTOM_SYSTEMS } from "@/lib/custom-systems";

const system = CUSTOM_SYSTEMS.seo;

export const Route = createFileRoute("/seo-services")({
  head: () => customSystemHead(system),
  component: () => <CustomSystemPage system={system} />,
});
