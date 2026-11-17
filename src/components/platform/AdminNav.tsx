import { Link } from "@tanstack/react-router";

const LINKS = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/leads", label: "Leads" },
  { to: "/admin/outreach", label: "Outreach Queue" },
  { to: "/admin/inquiries", label: "Inquiries" },
  { to: "/admin/restaurants", label: "Restaurants" },
  { to: "/admin/payments", label: "Payments" },
  { to: "/admin/domains", label: "Domains" },
  { to: "/admin/addons", label: "Add-ons" },
  { to: "/admin/case-studies", label: "Case Studies" },
  { to: "/admin/playbooks", label: "Playbooks" },
] as const;

export function AdminNav({ active }: { active: string }) {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <span className="font-display text-lg">
          Jahjah <span className="text-champagne">Admin</span>
        </span>
        <nav className="flex items-center gap-1 overflow-x-auto text-xs">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`whitespace-nowrap rounded-sm px-3 py-1.5 transition-colors ${
                active === l.to
                  ? "bg-surface text-champagne"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/dashboard"
            className="ml-2 whitespace-nowrap text-muted-foreground hover:text-champagne"
          >
            Back to workspace
          </Link>
        </nav>
      </div>
    </header>
  );
}
