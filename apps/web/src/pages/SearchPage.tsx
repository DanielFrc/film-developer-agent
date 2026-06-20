import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { filmApi } from "../api/client";
import {
  DEFAULT_SEARCH_FORM,
  type DevelopingTimeItem,
  type LookupResultView,
  type RecentQuery,
  type SearchFormValues,
} from "../api/types";
import { LookupResults } from "../components/search/LookupResults";
import { SearchForm } from "../components/search/SearchForm";
import { PageHeader } from "../components/layout/PageHeader";
import { Card } from "../components/ui/Card";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { useRecentQueries } from "../hooks/useRecentQueries";
import { useRecipeNavigation } from "../hooks/useRecipeNavigation";
import { buildLookupResultView } from "../lib/lookup";
import { formatApiError, type ApiErrorView } from "../lib/apiErrors";

export function SearchPage() {
  const location = useLocation();
  const { recordQuery } = useRecentQueries();
  const navigateToRecipe = useRecipeNavigation();
  const [form, setForm] = useState<SearchFormValues>(DEFAULT_SEARCH_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorView | null>(null);
  const [matches, setMatches] = useState<DevelopingTimeItem[]>([]);
  const [result, setResult] = useState<LookupResultView | null>(null);
  const [selectedDilution, setSelectedDilution] = useState("");

  useEffect(() => {
    const prefill = (location.state as { prefill?: RecentQuery } | null)?.prefill;
    if (!prefill) return;

    setForm((current) => ({
      ...current,
      filmQuery: prefill.film,
      filmSelected: prefill.film,
      developerQuery: prefill.developer,
      developerSelected: prefill.developer,
      format: prefill.format as SearchFormValues["format"],
      isoExposed: prefill.iso,
      dilution: prefill.dilution || "",
    }));
  }, [location.state]);

  function updateForm(patch: Partial<SearchFormValues>) {
    setForm((current) => ({ ...current, ...patch }));
  }

  function confirmMatch(match: DevelopingTimeItem) {
    const view = buildLookupResultView(match, {
      film: form.filmScore,
      developer: form.developerScore,
    });
    setResult(view);
    recordQuery({
      film: match.film,
      developer: match.developer,
      format: match.format,
      iso: match.iso,
      dilution: match.dilution ?? null,
      devTime: match.dev_time,
    });
  }

  async function handleLookup() {
    if (!form.filmSelected || !form.developerSelected) {
      setError({
        message: "Select a film and developer from the autocomplete suggestions.",
      });
      return;
    }
    if (!form.isoExposed.trim()) {
      setError({ message: "ISO exposed (EI) is required." });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setMatches([]);
    setSelectedDilution("");

    try {
      const items = await filmApi.getDevelopingTimes({
        film: form.filmSelected,
        developer: form.developerSelected,
        format: form.format,
        iso: form.isoExposed.trim(),
      });

      setMatches(items);

      if (items.length === 1) {
        confirmMatch(items[0]);
      }
    } catch (err) {
      setError(formatApiError(err, "lookup"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Search"
        description="Look up recommended developing times by film, developer, format, and ISO. Select canonical matches from autocomplete before searching."
      />

      <Card>
        <SearchForm
          values={form}
          loading={loading}
          onChange={updateForm}
          onSubmit={handleLookup}
        />
      </Card>

      {error ? (
        <div className="mt-6">
          <ErrorBanner
            message={error.message}
            hint={error.hint}
            onRetry={handleLookup}
          />
        </div>
      ) : null}

      <LookupResults
        matches={matches}
        result={result}
        temperatureUnit={form.temperatureUnit}
        selectedDilution={selectedDilution}
        onSelectDilution={setSelectedDilution}
        onConfirmMatch={confirmMatch}
        onGenerateRecipe={
          result ? () => navigateToRecipe(result, form) : undefined
        }
      />
    </div>
  );
}
