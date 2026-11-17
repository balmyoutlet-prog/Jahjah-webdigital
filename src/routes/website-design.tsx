import { createFileRoute } from "@tanstack/react-router";
import { CustomSystemPage, customSystemHead } from "@/components/site/CustomSystemPage";
import { CUSTOM_SYSTEMS } from "@/lib/custom-systems";

const system = CUSTOM_SYSTEMS.websiteDesign;

export const Route = createFileRoute("/website-design")({
  head: () => customSystemHead(system),
  component: () => <CustomSystemPage system={system} />,
});
