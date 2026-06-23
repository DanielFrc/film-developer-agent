interface OfflineNoticeProps {
  online: boolean;
}

export function OfflineNotice({ online }: OfflineNoticeProps) {
  if (online) return null;

  return (
    <div
      className="border-b border-warning/20 bg-warning/10 px-4 py-2 text-center text-sm text-ink print:hidden"
      role="status"
    >
      Offline — saved recipes and defaults in your library still open. Lookups and LLM generation
      need the API.
    </div>
  );
}
