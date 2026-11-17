import { createFileRoute } from "@tanstack/react-router";
import { CustomSystemPage, customSystemHead } from "@/components/site/CustomSystemPage";
import { CUSTOM_SYSTEMS } from "@/lib/custom-systems";

const system = CUSTOM_SYSTEMS.accounting;

export const Route = createFileRoute("/custom-accounting-system")({
  head: () => customSystemHead(system),
  component: () => <CustomSystemPage system={system} />,
});
