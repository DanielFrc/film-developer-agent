import { FormEvent, useEffect, useState } from "react";
import type { FilmEnrichment } from "../../api/types";
import {
  listFilmEnrichmentEntries,
  removeFilmEnrichment,
  saveFilmEnrichment,
} from "../../lib/userLibrary";
import { FilmAutocomplete } from "../search/FilmAutocomplete";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { FormField, textareaClassName } from "../ui/FormField";

const EMPTY_DRAFT = {
  boxSpeedIso: "",
  typicalEi: "",
  notes: "",
};

interface FilmEnrichmentSectionProps {
  onChange?: () => void;
}

function enrichmentToDraft(entry: FilmEnrichment | undefined) {
  return {
    boxSpeedIso: entry?.boxSpeedIso ?? "",
    typicalEi: entry?.typicalEi ?? "",
    notes: entry?.notes ?? "",
  };
}

export function FilmEnrichmentSection({ onChange }: FilmEnrichmentSectionProps) {
  const [entries, setEntries] = useState(() => listFilmEnrichmentEntries());
  const [filmQuery, setFilmQuery] = useState("");
  const [selectedFilm, setSelectedFilm] = useState<string | null>(null);
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!selectedFilm) {
      setDraft(EMPTY_DRAFT);
      return;
    }
    const existing = entries.find((entry) => entry.film === selectedFilm);
    setDraft(enrichmentToDraft(existing));
  }, [entries, selectedFilm]);

  function refresh() {
    setEntries(listFilmEnrichmentEntries());
    onChange?.();
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!selectedFilm) return;
    saveFilmEnrichment({ film: selectedFilm, ...draft });
    refresh();
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  function handleRemove(film: string) {
    removeFilmEnrichment(film);
    refresh();
    if (selectedFilm === film) {
      setSelectedFilm(null);
      setFilmQuery("");
    }
  }

  return (
    <Card title="Personal film notes">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge tone="warning">Your data — not from DigitalTruth</Badge>
        <p className="text-sm text-muted">
          Box speed and notes pre-fill Search; they never modify the gold dataset.
        </p>
      </div>

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
              <div className="flex items-center gap-2 text-xs text-muted">
                {entry.boxSpeedIso ? <span>Box {entry.boxSpeedIso}</span> : null}
                {entry.typicalEi ? <span>EI {entry.typicalEi}</span> : null}
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
            title="No personal film notes"
            description="Add box speed or exposure habits for films you shoot often."
          />
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
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
            <FormField
              label="Box speed (ISO)"
              hint="Pre-fills nominal ISO on Search — your subjective value."
              value={draft.boxSpeedIso}
              onChange={(event) => setDraft((c) => ({ ...c, boxSpeedIso: event.target.value }))}
              placeholder="e.g. 400"
            />
            <FormField
              label="Typical EI"
              hint="Optional reference only; lookup still uses exposed ISO you enter."
              value={draft.typicalEi}
              onChange={(event) => setDraft((c) => ({ ...c, typicalEi: event.target.value }))}
              placeholder="e.g. 320"
            />
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">Notes</span>
              <textarea
                value={draft.notes}
                onChange={(event) => setDraft((c) => ({ ...c, notes: event.target.value }))}
                rows={3}
                className={textareaClassName}
                placeholder="Metering habits, stock quirks…"
              />
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit">Save film notes</Button>
              {entries.some((e) => e.film === selectedFilm) ? (
                <Button type="button" variant="secondary" onClick={() => handleRemove(selectedFilm)}>
                  Remove
                </Button>
              ) : null}
              {saved ? <span className="text-sm text-success">Saved</span> : null}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">Select a film to add personal notes.</p>
        )}
      </form>
    </Card>
  );
}
