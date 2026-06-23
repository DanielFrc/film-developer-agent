import { NavLink } from "react-router-dom";
import type { RoutePath } from "../../api/types";
import { APP_NAME } from "../../lib/constants";
import { Badge } from "../ui/Badge";

const workflowLinks: { to: RoutePath; label: string }[] = [
  { to: "/search", label: "Search" },
  { to: "/compare", label: "Compare" },
  { to: "/library", label: "Library" },
];

const dataLinks: { to: RoutePath; label: string }[] = [
  { to: "/preferences", label: "Preferences" },
  { to: "/explorer", label: "Explorer" },
  { to: "/", label: "Dashboard" },
];

function navLinkClass(isActive: boolean) {
  return `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-accent-soft text-ink" : "text-muted hover:bg-accent-soft/50 hover:text-ink"
  }`;
}

interface NavBarProps {
  apiStatus: "loading" | "ok" | "error";
}

export function NavBar({ apiStatus }: NavBarProps) {
  return (
    <header className="border-b border-border bg-surface-elevated/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-4 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Darkroom data</p>
          <h1 className="text-lg font-semibold text-ink">{APP_NAME}</h1>
        </div>
        <nav
          className="flex flex-wrap items-center gap-1"
          aria-label="Main navigation"
        >
          <div className="flex items-center gap-1" aria-label="Workflow">
            {workflowLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => navLinkClass(isActive)}>
                {link.label}
              </NavLink>
            ))}
          </div>
          <span
            className="mx-1 hidden h-5 w-px bg-border sm:inline-block"
            aria-hidden="true"
          />
          <div className="flex items-center gap-1" aria-label="Data and settings">
            {dataLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) => navLinkClass(isActive)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </nav>
        <Badge tone={apiStatus === "ok" ? "success" : apiStatus === "error" ? "warning" : "neutral"}>
          {`API ${apiStatus === "loading" ? "…" : apiStatus}`}
        </Badge>
      </div>
    </header>
  );
}
