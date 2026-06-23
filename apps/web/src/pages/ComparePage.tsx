import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { filmApi } from "../api/client";
import type { DevelopingTimeItem, SearchPrefill, ScrapedFormat } from "../api/types";
import { FilmAutocomplete } from "../components/search/FilmAutocomplete";
import { PageHeader } from "../components/layout/PageHeader";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { FormField, selectClassName } from "../components/ui/FormField";
import { useScrapedFormats } from "../hooks/useScrapedFormats";
import { formatApiError, type ApiErrorView } from "../lib/apiErrors";
import { formatTemperature } from "../lib/format";
import { COMMON_ISO_VALUES } from "../lib/constants";

interface CompareFormValues {
  filmQuery: string;
  filmSelected: string | null;
  format: ScrapedFormat;
  iso: string;
}

const DEFAULT_FORM: CompareFormValues = {
  filmQuery: "",
  filmSelected: null,
  format: "120",
  iso: "400",
};

function formatLabel(format: string, description?: string | null) {
  return description ? `${format} — ${description}` : format;
}

function toSearchPrefill(item: DevelopingTimeItem): SearchPrefill {
  return {
    film: item.film,
    developer: item.developer,
    format: item.format,
    iso: item.iso,
    dilution: item.dilution ?? null,
  };
}

export function ComparePage() {
  const navigate = useNavigate();
  const { formats, loading: formatsLoading } = useScrapedFormats();
  const [form, setForm] = useState<CompareFormValues>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorView | null>(null);
  const [results, setResults] = useState<DevelopingTimeItem[]>([]);
  const [hasCompared, setHasCompared] = useState(false);

  async function handleCompare() {
    if (!form.filmSelected) {
      setError({ message: "Select a film from the autocomplete suggestions." });
      return;
    }
    if (!form.iso.trim()) {
      setError({ message: "ISO is required." });
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);
    setHasCompared(true);

    try {
      const items = await filmApi.compareDevelopers({
        film: form.filmSelected,
        format: form.format,
        iso: form.iso.trim(),
      });
      setResults(items);
    } catch (err) {
      setError(formatApiError(err, "lookup"));
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void handleCompare();
  }

  return (
    <div>
      <PageHeader
        title="Compare developers"
        description="Side-by-side developing times from the gold chart for the same film, format, and ISO. Chart data only — no personal notes."
      />

      <Card>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <FilmAutocomplete
            query={form.filmQuery}
            selectedName={form.filmSelected}
            onQueryChange={(filmQuery) =>
              setForm((current) => ({ ...current, filmQuery, filmSelected: null }))
            }
            onSelect={(item) =>
              setForm((current) => ({
                ...current,
                filmQuery: item.name,
                filmSelected: item.name,
              }))
            }
            onClear={() =>
              setForm((current) => ({ ...current, filmQuery: "", filmSelected: null }))
            }
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">Format</span>
              <select
                value={form.format}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    format: event.target.value as ScrapedFormat,
                  }))
                }
                className={selectClassName}
                disabled={formatsLoading}
              >
                {formats.map((item) => (
                  <option key={item.format} value={item.format}>
                    {formatLabel(item.format, item.description)}
                  </option>
                ))}
              </select>
            </label>
            <FormField
              label="ISO"
              hint="Exact chart ISO row — same value used in Search lookup."
              value={form.iso}
              onChange={(event) => setForm((current) => ({ ...current, iso: event.target.value }))}
              list="compare-iso-options"
              inputMode="numeric"
              placeholder="e.g. 400"
              required
            />
          </div>

          <datalist id="compare-iso-options">
            {COMMON_ISO_VALUES.map((iso) => (
              <option key={iso} value={iso} />
            ))}
          </datalist>

          <Button type="submit" disabled={loading}>
            {loading ? "Loading…" : "Compare developers"}
          </Button>
        </form>
      </Card>

      {error ? (
        <div className="mt-6">
          <ErrorBanner message={error.message} hint={error.hint} onRetry={handleCompare} />
        </div>
      ) : null}

      {results.length ? (
        <Card title="Chart times" className="mt-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{form.filmSelected ?? ""}</Badge>
            <Badge tone="neutral">{`${form.format} · ISO ${form.iso.trim()}`}</Badge>
            <Badge tone="success">{`${results.length} row${results.length === 1 ? "" : "s"}`}</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                  <th className="px-3 py-2 font-semibold">Developer</th>
                  <th className="px-3 py-2 font-semibold">Dilution</th>
                  <th className="px-3 py-2 font-semibold">Time</th>
                  <th className="px-3 py-2 font-semibold">Temp</th>
                  <th className="px-3 py-2 font-semibold">Notes</th>
                  <th className="px-3 py-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {results.map((item) => (
                  <tr key={`${item.developer}-${item.dilution ?? "stock"}-${item.dev_time}`}>
                    <td className="px-3 py-3 font-medium text-ink">{item.developer}</td>
                    <td className="px-3 py-3 text-ink">{item.dilution || "stock"}</td>
                    <td className="px-3 py-3 font-semibold text-ink">{item.dev_time} min</td>
                    <td className="px-3 py-3 text-ink">
                      {item.temp ? formatTemperature(item.temp, "C") : "—"}
                    </td>
                    <td className="max-w-xs px-3 py-3 text-muted">{item.notes || "—"}</td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        className="text-accent underline"
                        onClick={() =>
                          navigate("/search", { state: { prefill: toSearchPrefill(item) } })
                        }
                      >
                        Open in search
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}

      {!loading && hasCompared && !error && !results.length ? (
        <div className="mt-8">
          <EmptyState
            title="No comparison yet"
            description="Pick a film, format, and ISO to see all chart times for that combination."
          />
        </div>
      ) : null}

      <p className="mt-6 text-sm text-muted">
        Need a single developer lookup with recipe generation? Use{" "}
        <Link to="/search" className="text-accent underline">
          Search
        </Link>
        .
      </p>
    </div>
  );
}
