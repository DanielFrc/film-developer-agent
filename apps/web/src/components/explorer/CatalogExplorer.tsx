import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { filmApi } from "../../api/client";
import type { ExplorerCatalogResult } from "../../api/types";
import { formatApiError, type ApiErrorView } from "../../lib/apiErrors";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { ErrorBanner } from "../ui/ErrorBanner";
import { FormField } from "../ui/FormField";
import { LoadingSpinner } from "../ui/LoadingSpinner";

const PAGE_SIZE = 25;

interface CatalogExplorerProps {
  catalog: "films" | "developers";
}

export function CatalogExplorer({ catalog }: CatalogExplorerProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [draftQuery, setDraftQuery] = useState(searchParams.get("q") ?? "");
  const [appliedQuery, setAppliedQuery] = useState(searchParams.get("q") ?? "");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const [data, setData] = useState<ExplorerCatalogResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorView | null>(null);

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await filmApi.getExplorerCatalog({
        catalog,
        page,
        page_size: PAGE_SIZE,
        q: appliedQuery || undefined,
      });
      setData(result);
    } catch (err) {
      setError(formatApiError(err, "explorer"));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [appliedQuery, catalog, page]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    setAppliedQuery(draftQuery.trim());
    setSearchParams({ catalog, q: draftQuery.trim(), page: "1" });
  }

  function setPage(nextPage: number) {
    const params: Record<string, string> = { catalog, page: String(nextPage) };
    if (appliedQuery) params.q = appliedQuery;
    setSearchParams(params);
  }

  const labelColumn = catalog === "films" ? "film" : "developer";
  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">
              {catalog === "films" ? "Film catalog" : "Developer catalog"}
            </h2>
            <p className="text-sm text-muted">Gold dimension view from normalized parquet.</p>
          </div>
          <Link to="/explorer?layer=gold" className="text-sm text-accent underline">
            View developing times
          </Link>
        </div>
      </Card>

      <Card title="Search catalog">
        <form className="flex flex-wrap gap-3" onSubmit={handleSearch}>
          <FormField
            label={catalog === "films" ? "Film" : "Developer"}
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder="Partial name"
            className="min-w-[240px] flex-1"
          />
          <div className="flex items-end">
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </div>
        </form>
      </Card>

      {error ? (
        <ErrorBanner message={error.message} hint={error.hint} onRetry={() => void loadCatalog()} />
      ) : null}

      {loading && !data ? <LoadingSpinner label="Loading catalog…" /> : null}

      {data ? (
        <div className="space-y-4">
          <Badge tone="neutral">{`${data.total.toLocaleString()} entries`}</Badge>
          {data.rows.length ? (
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                      {data.columns.map((column) => (
                        <th key={column} className="px-3 py-2">
                          {column}
                        </th>
                      ))}
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((row, index) => (
                      <tr key={index} className="border-b border-border/60">
                        {data.columns.map((column) => (
                          <td key={column} className="px-3 py-2 text-ink">
                            {row[column] == null ? "—" : String(row[column])}
                          </td>
                        ))}
                        <td className="px-3 py-2">
                          <Link
                            to={`/explorer?layer=gold&${labelColumn}=${encodeURIComponent(String(row[labelColumn] ?? ""))}`}
                            className="text-accent underline"
                          >
                            View times
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <EmptyState title="No catalog rows" description="Try another search term." />
          )}
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={page <= 1 || loading}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted">
              Page {page} of {totalPages}
            </span>
            <Button
              type="button"
              variant="secondary"
              disabled={page >= totalPages || loading}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
