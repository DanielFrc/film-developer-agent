import { NavLink } from "react-router-dom";
import type { RoutePath } from "../../api/types";
import { APP_NAME } from "../../lib/constants";
import { Badge } from "../ui/Badge";

const links: { to: RoutePath; label: string }[] = [
  { to: "/", label: "Dashboard" },
  { to: "/search", label: "Search" },
  { to: "/explorer", label: "Explorer" },
  { to: "/preferences", label: "Preferences" },
];

interface NavBarProps {
  apiStatus: "loading" | "ok" | "error";
}

export function NavBar({ apiStatus }: NavBarProps) {
  return (
    <header className="border-b border-border bg-surface-elevated/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Darkroom data</p>
          <h1 className="text-lg font-semibold text-ink">{APP_NAME}</h1>
        </div>
        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-accent-soft text-ink"
                    : "text-muted hover:bg-accent-soft/50 hover:text-ink"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <Badge tone={apiStatus === "ok" ? "success" : apiStatus === "error" ? "warning" : "neutral"}>
          {`API ${apiStatus === "loading" ? "…" : apiStatus}`}
        </Badge>
      </div>
    </header>
  );
}
