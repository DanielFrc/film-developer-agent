import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { useRecentQueries } from "../hooks/useRecentQueries";
import { useUserLibrary } from "../hooks/useUserLibrary";
import { filmApi } from "../api/client";
import { DATA_SOURCE } from "../lib/constants";
import { PageHeader } from "../components/layout/PageHeader";
import { StatCard } from "../components/dashboard/StatCard";
import { RecentQueries } from "../components/dashboard/RecentQueries";
import { SavedCombinations } from "../components/dashboard/SavedCombinations";
import { SavedRecipes } from "../components/dashboard/SavedRecipes";
import { FavoritesPanel } from "../components/dashboard/FavoritesPanel";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { Card } from "../components/ui/Card";

export function DashboardPage() {
  const { queries } = useRecentQueries();
  const stats = useAsync(() => filmApi.getStats(), [], "stats");
  const library = useUserLibrary();

  useEffect(() => {
    library.refresh();
  }, [library.refresh]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Consult developing times and generate recipes from normalized DigitalTruth gold data."
        action={
          <div className="flex gap-2">
            <Link to="/preferences">
              <Button variant="secondary">Preferences</Button>
            </Link>
            <Link to="/search">
              <Button>New query</Button>
            </Link>
          </div>
        }
      />

      {stats.loading ? <LoadingSpinner label="Loading dataset stats…" /> : null}
      {stats.error ? (
        <ErrorBanner
          message={stats.error.message}
          hint={stats.error.hint}
          onRetry={stats.reload}
        />
      ) : null}

      {stats.data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Films"
            value={stats.data.films}
            hint="Gold dimension — click to browse catalog"
            to="/explorer?catalog=films"
          />
          <StatCard
            label="Developers"
            value={stats.data.developers}
            hint="Gold dimension — click to browse catalog"
            to="/explorer?catalog=developers"
          />
          <StatCard
            label="Film + developer combinations"
            value={stats.data.developing_time_combinations}
            hint="Developing time fact rows"
            to="/explorer?layer=gold"
          />
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <RecentQueries queries={queries} />
        <SavedCombinations
          combinations={library.combinations}
          onRemove={library.deleteCombination}
        />
        <SavedRecipes recipes={library.recipes} onRemove={library.deleteRecipe} />
        <FavoritesPanel
          films={library.favoriteFilms}
          developers={library.favoriteDevelopers}
          onToggleFilm={library.starFilm}
          onToggleDeveloper={library.starDeveloper}
        />
        <Card title="About this project">
          <p className="text-sm leading-6 text-muted">
            Medallion pipeline: scrape → silver parquet → gold star schema. Personal library
            data (saved recipes, combinations, defaults) stays in your browser only.
          </p>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Source</dt>
              <dd className="font-medium text-ink">{DATA_SOURCE}</dd>
            </div>
            {stats.data?.source_hash ? (
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Dataset hash</dt>
                <dd className="font-mono text-xs text-ink">{stats.data.source_hash}</dd>
              </div>
            ) : null}
          </dl>
        </Card>
      </div>
    </div>
  );
}
