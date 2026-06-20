import { formatNumber } from "../../lib/format";

interface StatCardProps {
  label: string;
  value: number | string;
  hint?: string;
}

export function StatCard({ label, value, hint }: StatCardProps) {
  const display = typeof value === "number" ? formatNumber(value) : value;

  return (
    <article className="rounded-xl border border-border bg-surface-elevated p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{display}</p>
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </article>
  );
}
