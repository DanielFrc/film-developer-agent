import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
import { useScrapedFormats } from "../hooks/useScrapedFormats";
import { useUserLibrary } from "../hooks/useUserLibrary";
import { buildLookupResultView } from "../lib/lookup";
import { formatApiError, type ApiErrorView } from "../lib/apiErrors";
import { buildPushPullHint } from "../lib/recipe";
import { hasFilmPreferenceOverride } from "../lib/userLibrary";

export function SearchPage() {
  const location = useLocation();
  const { recordQuery } = useRecentQueries();
  const { addCombination, recordLookup } = useUserLibrary();
  const navigateToRecipe = useRecipeNavigation();
  const { formats, loading: formatsLoading } = useScrapedFormats();
  const [form, setForm] = useState<SearchFormValues>(DEFAULT_SEARCH_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorView | null>(null);
  const [matches, setMatches] = useState<DevelopingTimeItem[]>([]);
  const [result, setResult] = useState<LookupResultView | null>(null);
  const [selectedDilution, setSelectedDilution] = useState("");
  const [comboSaved, setComboSaved] = useState(false);

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
    setComboSaved(false);
    recordLookup(match.film, match.developer);
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
    setComboSaved(false);

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

  function handleSaveCombination() {
    if (!result) return;
    addCombination({
      film: result.match.film,
      developer: result.match.developer,
      format: result.match.format,
      iso: result.match.iso,
      dilution: result.match.dilution ?? null,
      devTime: result.match.dev_time,
    });
    setComboSaved(true);
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
          formats={formats}
          formatsLoading={formatsLoading}
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
        pushPullHint={buildPushPullHint(form.isoNominal, form.isoExposed)}
        onSaveCombination={result ? handleSaveCombination : undefined}
        onGenerateRecipe={
          result ? () => navigateToRecipe(result, form) : undefined
        }
      />

      {result ? (
        <p className="mt-3 text-sm text-muted">
          {hasFilmPreferenceOverride(result.match.film) ? (
            <>
              Film-specific preferences active —{" "}
              <Link
                to={`/preferences?film=${encodeURIComponent(result.match.film)}`}
                className="text-accent underline"
              >
                edit for {result.match.film}
              </Link>
            </>
          ) : (
            <>
              <Link
                to={`/preferences?film=${encodeURIComponent(result.match.film)}`}
                className="text-accent underline"
              >
                Set film-specific preferences
              </Link>{" "}
              for {result.match.film}
            </>
          )}
        </p>
      ) : null}

      {comboSaved ? (
        <p className="mt-3 text-sm text-success">Combination saved to your dashboard library.</p>
      ) : null}
    </div>
  );
}
