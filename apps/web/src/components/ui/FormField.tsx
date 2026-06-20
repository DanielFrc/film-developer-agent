import type { InputHTMLAttributes, ReactNode } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  children?: ReactNode;
}

export function FormField({ label, hint, children, className = "", id, ...props }: FormFieldProps) {
  const fieldId = id || label.toLowerCase().replace(/\s+/g, "-");

  if (children) {
    return (
      <label htmlFor={fieldId} className={`block ${className}`}>
        <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
        {children}
        {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
      </label>
    );
  }

  return (
    <label htmlFor={fieldId} className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      <input
        id={fieldId}
        className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        {...props}
      />
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export const selectClassName =
  "w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

export const textareaClassName =
  "w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";
