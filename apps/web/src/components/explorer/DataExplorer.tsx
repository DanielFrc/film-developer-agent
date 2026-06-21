import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { filmApi } from "../../api/client";
import type {
  ExplorerLayer,
  ExplorerSchemaResponse,
  PaginatedExplorerResult,
} from "../../api/types";
import { exportRowsToCsv } from "../../lib/csv";
import { formatApiError, type ApiErrorView } from "../../lib/apiErrors";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { ErrorBanner } from "../ui/ErrorBanner";
import { FormField } from "../ui/FormField";
import { LoadingSpinner } from "../ui/LoadingSpinner";
import { CatalogExplorer } from "./CatalogExplorer";

const LAYERS: { id: ExplorerLayer; label: string; description: string }[] = [
  { id: "bronze", label: "Bronze", description: "Raw scraped JSON" },
  { id: "silver", label: "Silver", description: "Processed parquet" },
  { id: "gold", label: "Gold", description: "Normalized developing times" },
];

const PAGE_SIZE = 25;

const SOURCE_OPTIONS = [
  { value: "", label: "All sources" },
  { value: "digitaltruth", label: "DigitalTruth" },
] as const;

interface FilterDraft {
  film: string;
  developer: string;
  iso: string;
  source: string;
}

const EMPTY_FILTERS: FilterDraft = { film: "", developer: "", iso: "", source: "" };

export function DataExplorer() {
  const [searchParams] = useSearchParams();
  const catalogParam = searchParams.get("catalog");
  const catalog =
    catalogParam === "films" || catalogParam === "developers" ? catalogParam : null;

  const initialFilm = searchParams.get("film") ?? "";
  const initialDeveloper = searchParams.get("developer") ?? "";
  const initialLayer = searchParams.get("layer");

  const [layer, setLayer] = useState<ExplorerLayer>(
    initialLayer === "bronze" || initialLayer === "silver" || initialLayer === "gold"
      ? initialLayer
      : "gold",
  );
  const [draftFilters, setDraftFilters] = useState<FilterDraft>({
    film: initialFilm,
    developer: initialDeveloper,
    iso: "",
    source: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<FilterDraft>({
    film: initialFilm,
    developer: initialDeveloper,
    iso: "",
    source: "",
  });
  const [page, setPage] = useState(1);
  const [showSchema, setShowSchema] = useState(false);

  const [schema, setSchema] = useState<ExplorerSchemaResponse | null>(null);
  const [data, setData] = useState<PaginatedExplorerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiErrorView | null>(null);

  const loadExplorer = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [schemaResult, dataResult] = await Promise.all([
        filmApi.getExplorerSchema(layer),
        filmApi.getExplorerData({
          layer,
          page,
          page_size: PAGE_SIZE,
          film: appliedFilters.film || undefined,
          developer: appliedFilters.developer || undefined,
          iso: appliedFilters.iso || undefined,
          source: appliedFilters.source || undefined,
        }),
      ]);
      setSchema(schemaResult);
      setData(dataResult);
    } catch (err) {
      setError(formatApiError(err, "explorer"));
      setSchema(null);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, layer, page]);

  useEffect(() => {
    void loadExplorer();
  }, [loadExplorer]);

  function handleLayerChange(nextLayer: ExplorerLayer) {
    setLayer(nextLayer);
    setPage(1);
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
  }

  function handleApplyFilters(event: FormEvent) {
    event.preventDefault();
    setAppliedFilters(draftFilters);
    setPage(1);
  }

  function handleClearFilters() {
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(1);
  }

  function handleExportCsv() {
    if (!data?.rows.length) return;
    exportRowsToCsv(
      `film-developer-${layer}-page-${page}.csv`,
      data.columns,
      data.rows,
    );
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.page_size)) : 1;

  if (catalog) {
    return <CatalogExplorer catalog={catalog} />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap gap-2">
          {LAYERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleLayerChange(item.id)}
              className={`rounded-lg border px-4 py-2 text-left transition ${
                layer === item.id
                  ? "border-accent bg-accent-soft text-ink"
                  : "border-border bg-surface-elevated text-muted hover:text-ink"
              }`}
            >
              <span className="block text-sm font-medium">{item.label}</span>
              <span className="block text-xs">{item.description}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card title="Filters">
        <form
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
          onSubmit={handleApplyFilters}
        >
          <FormField
            label="Film"
            placeholder="Partial film name"
            value={draftFilters.film}
            onChange={(event) =>
              setDraftFilters((current) => ({ ...current, film: event.target.value }))
            }
          />
          <FormField
            label="Developer"
            placeholder="Partial developer name"
            value={draftFilters.developer}
            onChange={(event) =>
              setDraftFilters((current) => ({
                ...current,
                developer: event.target.value,
              }))
            }
          />
          <FormField
            label="ISO"
            placeholder="Exact ISO"
            value={draftFilters.iso}
            onChange={(event) =>
              setDraftFilters((current) => ({ ...current, iso: event.target.value }))
            }
          />
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">Source</span>
            <select
              value={draftFilters.source}
              onChange={(event) =>
                setDraftFilters((current) => ({ ...current, source: event.target.value }))
              }
              className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
            >
              {SOURCE_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-muted">
              Applies when the layer schema includes a source column.
            </span>
          </label>
          <div className="flex items-end gap-2">
            <Button type="submit" variant="secondary">
              Apply
            </Button>
            <Button type="button" variant="ghost" onClick={handleClearFilters}>
              Clear
            </Button>
          </div>
        </form>
      </Card>

      {error ? (
        <ErrorBanner
          message={error.message}
          hint={error.hint}
          onRetry={() => void loadExplorer()}
        />
      ) : null}

      {loading && !data ? <LoadingSpinner label="Loading layer data…" /> : null}

      {data ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
              <Badge tone="neutral">{`${data.total.toLocaleString()} rows`}</Badge>
              <span>
                Page {data.page} of {totalPages}
              </span>
              {appliedFilters.source && !data.source_filter_applied ? (
                <span className="text-xs text-warning">
                  Source filter not applied — no source column in this layer.
                </span>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowSchema((current) => !current)}
              >
                {showSchema ? "Hide schema" : "View schema"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={!data.rows.length}
                onClick={handleExportCsv}
              >
                Export CSV
              </Button>
            </div>
          </div>

          {showSchema && schema ? (
            <Card title={`${layer} schema`}>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                      <th className="px-3 py-2">Column</th>
                      <th className="px-3 py-2">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schema.columns.map((column) => (
                      <tr key={column.name} className="border-b border-border/60">
                        <td className="px-3 py-2 font-mono text-xs text-ink">{column.name}</td>
                        <td className="px-3 py-2 text-muted">{column.type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : null}

          {data.rows.length ? (
            <Card>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                      {data.columns.map((column) => (
                        <th key={column} className="whitespace-nowrap px-3 py-2">
                          {column}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.rows.map((row, index) => (
                      <tr key={index} className="border-b border-border/60 align-top">
                        {data.columns.map((column) => (
                          <td key={column} className="max-w-xs px-3 py-2 text-ink">
                            {formatCell(row[column])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <EmptyState
              title="No rows match"
              description="Try another layer or adjust your filters."
            />
          )}

          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-muted">
              Showing {data.rows.length} of {data.total.toLocaleString()}
            </span>
            <Button
              type="button"
              variant="secondary"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function formatCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return String(value);
}
