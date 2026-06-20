interface ErrorBannerProps {
  message: string;
  hint?: string;
  onRetry?: () => void;
}

export function ErrorBanner({ message, hint, onRetry }: ErrorBannerProps) {
  return (
    <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
      <p className="font-medium">{message}</p>
      {hint ? <p className="mt-2 text-warning/90">{hint}</p> : null}
      {onRetry ? (
        <button
          type="button"
          className="mt-2 font-medium underline"
          onClick={onRetry}
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
