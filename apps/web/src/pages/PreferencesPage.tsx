import { FormEvent, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { UserPreferences } from "../api/types";
import { FilmPreferencesSection } from "../components/preferences/FilmPreferencesSection";
import { LibraryBackupSection } from "../components/preferences/LibraryBackupSection";
import { PreferencesFormFields } from "../components/preferences/PreferencesFormFields";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { loadUserPreferences } from "../lib/userLibrary";
import { useFilmPreferencesState, useUserPreferencesState } from "../hooks/useUserLibrary";

export function PreferencesPage() {
  const [searchParams] = useSearchParams();
  const initialFilm = searchParams.get("film");

  const { preferences, saveAll } = useUserPreferencesState();
  const filmPreferences = useFilmPreferencesState();
  const [draft, setDraft] = useState<UserPreferences>(preferences);
  const [saved, setSaved] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    saveAll(draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <PageHeader
        title="Preferences"
        description="Global darkroom profile, tank volume, stop bath, and optional per-film overrides for session cards and recipes."
      />

      <Card title="Global profile" className="mb-8">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <PreferencesFormFields
            values={draft}
            onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
            idPrefix="global-pref"
            showDarkroomSetup
          />
          <div className="flex items-center gap-3">
            <Button type="submit">Save global preferences</Button>
            {saved ? <span className="text-sm text-success">Saved</span> : null}
          </div>
        </form>
      </Card>

      <LibraryBackupSection
        onImported={() => {
          const next = loadUserPreferences();
          saveAll(next);
          setDraft(next);
        }}
      />

      <div className="mt-8">
        <FilmPreferencesSection
        globalPreferences={preferences}
        entries={filmPreferences.entries}
        initialFilm={initialFilm}
        onSave={filmPreferences.saveOverride}
        onRemove={filmPreferences.removeOverride}
        />
      </div>
    </div>
  );
}
