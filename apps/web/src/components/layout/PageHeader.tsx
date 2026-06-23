import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, action, className = "" }: PageHeaderProps) {
  return (
    <div
      className={`mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between ${className}`}
    >
      <div>
        <h2 className="text-2xl font-semibold text-ink">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
