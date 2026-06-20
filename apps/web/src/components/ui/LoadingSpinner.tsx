interface LoadingSpinnerProps {
  label?: string;
}

export function LoadingSpinner({ label = "Loading…" }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center gap-3 text-sm text-muted" role="status">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent" />
      {label}
    </div>
  );
}
