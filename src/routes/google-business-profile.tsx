import { createFileRoute } from "@tanstack/react-router";
import { CustomSystemPage, customSystemHead } from "@/components/site/CustomSystemPage";
import { CUSTOM_SYSTEMS } from "@/lib/custom-systems";

const system = CUSTOM_SYSTEMS.googleBusiness;

export const Route = createFileRoute("/google-business-profile")({
  head: () => customSystemHead(system),
  component: () => <CustomSystemPage system={system} />,
});
