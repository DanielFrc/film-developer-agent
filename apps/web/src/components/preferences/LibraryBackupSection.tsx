import { useRef, useState } from "react";
import { downloadUserLibraryBackup, importUserLibrary } from "../../lib/userLibrary";
import {
  useFilmPreferencesState,
  useUserLibrary,
} from "../../hooks/useUserLibrary";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface LibraryBackupSectionProps {
  onImported?: () => void;
}

export function LibraryBackupSection({ onImported }: LibraryBackupSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const library = useUserLibrary();
  const filmPreferences = useFilmPreferencesState();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleExport() {
    setError(null);
    downloadUserLibraryBackup();
    setMessage("Library backup downloaded.");
    window.setTimeout(() => setMessage(null), 2500);
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);
    setMessage(null);
    try {
      const text = await file.text();
      const payload = importUserLibrary(JSON.parse(text) as unknown);
      library.refresh();
      filmPreferences.refresh();
      onImported?.();
      setMessage(
        `Imported backup from ${new Date(payload.exportedAt).toLocaleString()} (${payload.savedRecipes.length} recipes).`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed.");
    }
  }

  return (
    <Card title="Library backup">
      <p className="mb-4 text-sm text-muted">
        Export or restore saved sessions, developed rolls, recipes, defaults, favorites, preferences,
        film notes, and combo workbooks from this browser. v4 backups include the roll registry;
        v1–v3 imports remain supported.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={handleExport}>
          Export JSON
        </Button>
        <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()}>
          Import JSON
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleImport}
        />
      </div>
      {message ? <p className="mt-3 text-sm text-success">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-warning">{error}</p> : null}
      <p className="mt-3 text-xs text-muted">Import replaces all library keys in this browser.</p>
    </Card>
  );
}
