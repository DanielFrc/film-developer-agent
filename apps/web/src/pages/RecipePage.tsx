import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { filmApi } from "../api/client";
import type {
  RecipeNavigationState,
  RecipeResponse,
  SavedRecipe,
  SavedRecipeViewState,
} from "../api/types";
import { RecipeDetail } from "../components/recipe/RecipeDetail";
import { CombinationWorkbookPanel } from "../components/recipe/CombinationWorkbookPanel";
import { RecipePrintSummary } from "../components/recipe/RecipePrintSummary";
import { SourcePanel } from "../components/recipe/SourcePanel";
import { PageHeader } from "../components/layout/PageHeader";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { formatApiError, type ApiErrorView } from "../lib/apiErrors";
import { buildRecipeRequest } from "../lib/recipe";
import { getCombinationWorkbook, getDefaultRecipe } from "../lib/userLibrary";
import { useUserLibrary } from "../hooks/useUserLibrary";
import { Card } from "../components/ui/Card";

function buildDefaultResponse(
  markdown: string,
  request: RecipeNavigationState["request"],
  lookup: RecipeNavigationState["lookup"],
): RecipeResponse {
  return {
    recipe: markdown,
    cached: false,
    cache_key: "local-default",
    source: lookup.source,
    source_hash: "",
    disclaimer: "Using your saved default recipe for this film, developer, and format.",
    prompt_version: "local",
    llm_provider: "local",
    llm_model: "default-recipe",
    lookup: {
      film: lookup.match.film,
      developer: lookup.match.developer,
      format: lookup.match.format,
      iso: lookup.match.iso,
      dilution: lookup.match.dilution || "stock",
      base_time: lookup.match.dev_time,
      temperature: lookup.match.temp,
      notes: lookup.match.notes,
    },
    extra_context: request.extra_context ?? null,
  };
}

function buildSavedResponse(recipe: SavedRecipe): RecipeResponse {
  return {
    recipe: recipe.markdown,
    cached: false,
    cache_key: "local-saved",
    source: "Saved recipe",
    source_hash: "",
    disclaimer: "Saved recipe snapshot from your local library.",
    prompt_version: "local",
    llm_provider: "local",
    llm_model: "saved-recipe",
    lookup: {
      film: recipe.film,
      developer: recipe.developer,
      format: recipe.format,
      iso: "",
      dilution: "stock",
      base_time: "",
      temperature: null,
      notes: null,
    },
    extra_context: null,
  };
}

export function RecipePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const navState = location.state as RecipeNavigationState | null;
  const savedState = location.state as SavedRecipeViewState | null;
  const savedRecipe = savedState?.recipe ?? null;

  const { addRecipe, saveAsDefault } = useUserLibrary();
  const [response, setResponse] = useState<RecipeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorView | null>(null);
  const [usingDefault, setUsingDefault] = useState(false);
  const [workbookRevision, setWorkbookRevision] = useState(0);

  const generate = useCallback(
    async (request: RecipeNavigationState["request"]) => {
      setLoading(true);
      setError(null);
      setUsingDefault(false);
      try {
        const result = await filmApi.createRecipe(request);
        setResponse(result);
      } catch (err) {
        setError(formatApiError(err, "recipe"));
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (savedRecipe) {
      setResponse(buildSavedResponse(savedRecipe));
      setUsingDefault(false);
      return;
    }
    if (!navState?.request || !navState.lookup) return;

    const { request, lookup, forceGenerate } = navState;
    if (!forceGenerate) {
      const defaultRecipe = getDefaultRecipe(request.film, request.developer, request.format);
      if (defaultRecipe) {
        setResponse(buildDefaultResponse(defaultRecipe.markdown, request, lookup));
        setUsingDefault(true);
        return;
      }
    }

    void generate(request);
  }, [generate, navState, savedRecipe]);

  if (!savedRecipe && (!navState?.request || !navState.lookup)) {
    return <Navigate to="/search" replace />;
  }

  const request = navState?.request;
  const lookup = navState?.lookup;
  const searchForm = navState?.searchForm;
  const match = lookup?.match;
  const workbook = useMemo(() => {
    if (!match) return null;
    return getCombinationWorkbook(
      match.film,
      match.developer,
      match.format,
      match.iso,
      match.dilution,
    );
  }, [match, workbookRevision]);

  function rebuildRequest(forceRegenerate: boolean) {
    if (!match || !searchForm) return null;
    return buildRecipeRequest(match, searchForm, forceRegenerate);
  }

  function handleRegenerate() {
    const fresh = rebuildRequest(true);
    if (!fresh) return;
    void generate(fresh);
  }

  function handleRegenerateWithNotes() {
    handleRegenerate();
  }

  function handlePrint() {
    window.print();
  }

  function handleSaveRecipe() {
    if (!response) return;
    const film = request?.film ?? savedRecipe!.film;
    const developer = request?.developer ?? savedRecipe!.developer;
    const format = request?.format ?? savedRecipe!.format;
    addRecipe({ film, developer, format, markdown: response.recipe });
  }

  function handleSetDefault() {
    if (!response || !request) return;
    saveAsDefault({
      film: request.film,
      developer: request.developer,
      format: request.format,
      markdown: response.recipe,
    });
    setUsingDefault(true);
  }

  return (
    <div className="print:text-black">
      <PageHeader
        title="Development recipe"
        description={
          savedRecipe
            ? "Saved recipe from your local library."
            : "Step-by-step instructions generated from lookup data. Base developing time comes from DigitalTruth — never modified by the LLM."
        }
        action={
          <button
            type="button"
            className="text-sm text-muted underline hover:text-ink print:hidden"
            onClick={() => navigate(savedRecipe ? "/library" : "/search")}
          >
            {savedRecipe ? "Back to library" : "Back to search"}
          </button>
        }
        className="print:hidden"
      />

      {usingDefault ? (
        <Card className="mb-6 print:hidden">
          <p className="text-sm text-muted">
            Showing your default recipe for this film, developer, and format. Use Regenerate to call the LLM instead.
          </p>
        </Card>
      ) : null}

      {loading && !response ? (
        <LoadingSpinner label="Generating recipe with LLM… Large models may take several minutes." />
      ) : null}

      {error ? (
        <div className="mb-6">
          <ErrorBanner
            message={error.message}
            hint={error.hint}
            onRetry={() => {
              const fresh = rebuildRequest(false) ?? request;
              if (fresh) void generate(fresh);
            }}
          />
        </div>
      ) : null}

      {response ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)] print:block">
          <div>
            <RecipePrintSummary response={response} workbook={workbook} />
            <RecipeDetail
            response={response}
            loading={loading}
            onRegenerate={searchForm ? handleRegenerate : undefined}
            onPrint={handlePrint}
            onSaveRecipe={handleSaveRecipe}
            onSetDefault={request ? handleSetDefault : undefined}
            />
          </div>
          {lookup && match ? (
            <div className="space-y-6 print:hidden">
              <CombinationWorkbookPanel
                match={match}
                onSaved={() => setWorkbookRevision((value) => value + 1)}
                onRegenerateWithNotes={searchForm ? handleRegenerateWithNotes : undefined}
                regenerateLoading={loading}
              />
              <SourcePanel response={response} workbook={workbook} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
