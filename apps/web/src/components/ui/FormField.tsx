import type { InputHTMLAttributes, ReactNode } from "react";

interface FormFieldBaseProps {
  label: string;
  hint?: string;
  className?: string;
}

type FormFieldProps =
  | (FormFieldBaseProps & {
      htmlFor?: string;
      children: ReactNode;
    })
  | (FormFieldBaseProps &
      InputHTMLAttributes<HTMLInputElement> & {
        htmlFor?: string;
        children?: never;
      });

export function FormField(props: FormFieldProps) {
  const { label, hint, className = "", htmlFor } = props;
  const fieldId = htmlFor || ("id" in props && props.id) || label.toLowerCase().replace(/\s+/g, "-");

  if ("children" in props && props.children) {
    return (
      <label htmlFor={fieldId} className={`block ${className}`}>
        <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
        {props.children}
        {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
      </label>
    );
  }

  const { children: _, ...inputProps } = props as FormFieldBaseProps & InputHTMLAttributes<HTMLInputElement>;

  return (
    <label htmlFor={fieldId} className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      <input
        id={fieldId}
        className={inputClassName}
        {...inputProps}
      />
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export const inputClassName =
  "w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

export const selectClassName =
  "w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

export const textareaClassName =
  "w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";
