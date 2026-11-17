import { Link } from "@tanstack/react-router";

const tools = [
  {
    to: "/restaurant-ordering-readiness-score",
    label: "Check ordering readiness",
    detail: "Review menu access, order paths and customer friction.",
  },
  {
    to: "/restaurant-launch-readiness-score",
    label: "Check launch readiness",
    detail: "Review opening details, branches and reservation paths.",
  },
  {
    to: "/restaurant-google-menu-checker",
    label: "Check your Google menu",
    detail: "Review links, menu sources and branch accuracy.",
  },
] as const;

export function RestaurantToolLinks() {
  return (
    <section
      aria-labelledby="restaurant-tools-heading"
      className="border-t border-border px-5 py-14 sm:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <h2 id="restaurant-tools-heading" className="font-display text-3xl text-foreground">
          Free restaurant growth tools
        </h2>
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {tools.map((tool) => (
            <div key={tool.to} className="border-t border-primary/25 pt-4">
              <Link
                to={tool.to}
                className="text-base font-medium text-foreground underline decoration-primary/40 underline-offset-4 hover:text-primary"
              >
                {tool.label}
              </Link>
              <p className="mt-2 text-sm text-muted-foreground">{tool.detail}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Moving an existing restaurant?{" "}
          <Link
            to="/restaurant-relocation-seo-checklist"
            className="text-foreground underline underline-offset-4"
          >
            Use the address-change checklist
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
