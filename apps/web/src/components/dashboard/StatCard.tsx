import { Link } from "react-router-dom";
import { formatNumber } from "../../lib/format";

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
  to?: string;
}

export function StatCard({ label, value, hint, to }: StatCardProps) {
  const display = typeof value === "number" ? formatNumber(value) : value;

  const body = (
    <>
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{display}</p>
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </>
  );

  if (!to) {
    return (
      <article className="rounded-xl border border-border bg-surface-elevated p-5 shadow-sm">
        {body}
      </article>
    );
  }

  return (
    <Link
      to={to}
      className="block rounded-xl border border-border bg-surface-elevated p-5 shadow-sm transition hover:border-accent hover:bg-accent-soft/30"
    >
      {body}
    </Link>
  );
}
