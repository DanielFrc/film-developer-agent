import { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { filmApi } from "../api/client";
import type { RecipeNavigationState, RecipeResponse } from "../api/types";
import { RecipeDetail } from "../components/recipe/RecipeDetail";
import { SourcePanel } from "../components/recipe/SourcePanel";
import { PageHeader } from "../components/layout/PageHeader";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { formatApiError, type ApiErrorView } from "../lib/apiErrors";

export function RecipePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const navState = location.state as RecipeNavigationState | null;

  const [response, setResponse] = useState<RecipeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorView | null>(null);

  const generate = useCallback(
    async (request: RecipeNavigationState["request"]) => {
      setLoading(true);
      setError(null);
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
    if (!navState?.request) return;
    void generate(navState.request);
  }, [generate, navState?.request]);

  if (!navState?.request || !navState.lookup) {
    return <Navigate to="/search" replace />;
  }

  const { request } = navState;

  function handleRegenerate() {
    void generate({ ...request, force_regenerate: true });
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div>
      <PageHeader
        title="Development recipe"
        description="Step-by-step instructions generated from lookup data. Base developing time comes from DigitalTruth — never modified by the LLM."
        action={
          <button
            type="button"
            className="text-sm text-muted underline hover:text-ink"
            onClick={() => navigate("/search")}
          >
            Back to search
          </button>
        }
      />

      {loading && !response ? (
        <LoadingSpinner label="Generating recipe with LLM… Large models may take several minutes." />
      ) : null}

      {error ? (
        <div className="mb-6">
          <ErrorBanner
            message={error.message}
            hint={error.hint}
            onRetry={() => void generate(request)}
          />
        </div>
      ) : null}

      {response ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <RecipeDetail
            response={response}
            loading={loading}
            onRegenerate={handleRegenerate}
            onPrint={handlePrint}
          />
          <SourcePanel response={response} />
        </div>
      ) : null}
    </div>
  );
}
