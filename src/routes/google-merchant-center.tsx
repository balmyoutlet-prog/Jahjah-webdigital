import { createFileRoute } from "@tanstack/react-router";
import { CustomSystemPage, customSystemHead } from "@/components/site/CustomSystemPage";
import { CUSTOM_SYSTEMS } from "@/lib/custom-systems";

const system = CUSTOM_SYSTEMS.merchantCenter;

export const Route = createFileRoute("/google-merchant-center")({
  head: () => customSystemHead(system),
  component: () => <CustomSystemPage system={system} />,
});
