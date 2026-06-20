import type { ReactNode } from "react";

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, children, className = "" }: CardProps) {
  return (
    <section
      className={`rounded-xl border border-border bg-surface-elevated p-5 shadow-sm ${className}`}
    >
      {title ? <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">{title}</h2> : null}
      {children}
    </section>
  );
}
