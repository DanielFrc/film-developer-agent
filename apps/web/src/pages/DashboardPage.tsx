import { Link } from "react-router-dom";
import { useAsync } from "../hooks/useAsync";
import { filmApi } from "../api/client";
import { DatasetFreshnessCard } from "../components/dashboard/DatasetFreshnessCard";
import { PageHeader } from "../components/layout/PageHeader";
import { StatCard } from "../components/dashboard/StatCard";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { Card } from "../components/ui/Card";

export function DashboardPage() {
  const stats = useAsync(() => filmApi.getStats(), [], "stats");

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Dataset overview and entry points into the gold catalog and explorer."
        action={
          <div className="flex flex-wrap gap-2">
            <Link to="/explorer">
              <Button variant="secondary">Open explorer</Button>
            </Link>
            <Link to="/search">
              <Button>Look up times</Button>
            </Link>
          </div>
        }
      />

      {stats.loading ? <LoadingSpinner label="Loading dataset stats…" /> : null}
      {stats.error ? (
        <ErrorBanner
          message={stats.error.message}
          hint={stats.error.hint ?? "Run film-agent pipeline locally to build gold data under data/normalized/."}
          onRetry={stats.reload}
        />
      ) : null}

      {stats.data ? (
        <>
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
          <div className="mt-6">
            <DatasetFreshnessCard stats={stats.data} />
          </div>
        </>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card title="Explore data">
          <p className="mb-4 text-sm text-muted">
            Browse bronze, silver, and gold layers or open film and developer catalogs from
            normalized parquet.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to="/explorer?layer=gold">
              <Button variant="secondary">Gold developing times</Button>
            </Link>
            <Link to="/explorer?catalog=films">
              <Button variant="secondary">Film catalog</Button>
            </Link>
            <Link to="/explorer?catalog=developers">
              <Button variant="secondary">Developer catalog</Button>
            </Link>
          </div>
        </Card>
        <Card title="Your workflow">
          <p className="mb-4 text-sm text-muted">
            Saved combinations, recipes, and favorites moved to Library. Search still starts a new
            lookup from the chart.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to="/library">
              <Button variant="secondary">Open library</Button>
            </Link>
            <Link to="/search">
              <Button>New search</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
