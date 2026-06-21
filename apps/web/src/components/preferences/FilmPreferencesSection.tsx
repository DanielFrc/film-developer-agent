import { FormEvent, useEffect, useState } from "react";
import type { FilmPreferencesOverride, UserPreferences } from "../../api/types";
import { EMPTY_USER_PREFERENCES } from "../../lib/userLibrary";
import { FilmAutocomplete } from "../search/FilmAutocomplete";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { PreferencesFormFields } from "./PreferencesFormFields";

const EMPTY_OVERRIDE: UserPreferences = { ...EMPTY_USER_PREFERENCES };

interface FilmPreferencesSectionProps {
  globalPreferences: UserPreferences;
  entries: Array<{ film: string; override: FilmPreferencesOverride }>;
  initialFilm?: string | null;
  onSave: (film: string, override: FilmPreferencesOverride) => void;
  onRemove: (film: string) => void;
}

function overrideToDraft(override: FilmPreferencesOverride | undefined): UserPreferences {
  return {
    camera: override?.camera ?? "",
    agitationMethod: override?.agitationMethod ?? "",
    styleNotes: override?.styleNotes ?? "",
    preferredDevelopers: override?.preferredDevelopers ?? [],
  };
}

function summarizeOverride(override: FilmPreferencesOverride): string {
  const parts: string[] = [];
  if (override.camera?.trim()) parts.push("camera");
  if (override.agitationMethod?.trim()) parts.push("agitation");
  if (override.styleNotes?.trim()) parts.push("style");
  if (override.preferredDevelopers?.length) parts.push("developers");
  return parts.length ? parts.join(", ") : "empty";
}

export function FilmPreferencesSection({
  globalPreferences,
  entries,
  initialFilm,
  onSave,
  onRemove,
}: FilmPreferencesSectionProps) {
  const [filmQuery, setFilmQuery] = useState(initialFilm ?? "");
  const [selectedFilm, setSelectedFilm] = useState<string | null>(initialFilm ?? null);
  const [draft, setDraft] = useState<UserPreferences>(EMPTY_OVERRIDE);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!initialFilm) return;
    setFilmQuery(initialFilm);
    setSelectedFilm(initialFilm);
  }, [initialFilm]);

  useEffect(() => {
    if (!selectedFilm) {
      setDraft(EMPTY_OVERRIDE);
      return;
    }
    const existing = entries.find((entry) => entry.film === selectedFilm);
    setDraft(overrideToDraft(existing?.override));
  }, [entries, selectedFilm]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!selectedFilm) return;
    onSave(selectedFilm, draft);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  function handleRemove(film: string) {
    onRemove(film);
    if (selectedFilm === film) {
      setSelectedFilm(null);
      setFilmQuery("");
      setDraft(EMPTY_OVERRIDE);
    }
  }

  return (
    <div className="space-y-6">
      <Card title="Per-film overrides">
        <p className="mb-5 text-sm text-muted">
          Override global preferences for specific films. Leave a field blank to inherit the global
          value when generating recipes for that film.
        </p>

        {entries.length ? (
          <ul className="mb-6 divide-y divide-border rounded-lg border border-border">
            {entries.map((entry) => (
              <li
                key={entry.film}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
              >
                <button
                  type="button"
                  className="min-w-0 text-left font-medium text-ink hover:text-accent"
                  onClick={() => {
                    setSelectedFilm(entry.film);
                    setFilmQuery(entry.film);
                  }}
                >
                  {entry.film}
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">{summarizeOverride(entry.override)}</span>
                  <Button type="button" variant="ghost" onClick={() => handleRemove(entry.film)}>
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mb-6">
            <EmptyState
              title="No film overrides"
              description="Add overrides for films you develop differently — e.g. stand development for HP5."
            />
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <FilmAutocomplete
            query={filmQuery}
            selectedName={selectedFilm}
            onQueryChange={(value) => {
              setFilmQuery(value);
              setSelectedFilm(null);
            }}
            onSelect={(item) => {
              setFilmQuery(item.name);
              setSelectedFilm(item.name);
            }}
            onClear={() => {
              setFilmQuery("");
              setSelectedFilm(null);
            }}
          />

          {selectedFilm ? (
            <>
              <p className="text-sm text-muted">
                Editing overrides for <span className="font-medium text-ink">{selectedFilm}</span>.
                Blank fields inherit global preferences.
              </p>
              <PreferencesFormFields
                values={draft}
                hints={globalPreferences}
                onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
                idPrefix="film-pref"
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit">Save film override</Button>
                {entries.some((entry) => entry.film === selectedFilm) ? (
                  <Button type="button" variant="secondary" onClick={() => handleRemove(selectedFilm)}>
                    Remove override
                  </Button>
                ) : null}
                {saved ? <span className="text-sm text-success">Saved</span> : null}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted">Select a film from autocomplete to configure overrides.</p>
          )}
        </form>
      </Card>
    </div>
  );
}
