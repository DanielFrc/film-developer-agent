import type { DatasetStatsResponse } from "../../api/types";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";

interface DatasetFreshnessCardProps {
  stats: DatasetStatsResponse;
}

function formatTimestamp(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function statusTone(status: string | null): "success" | "warning" | "neutral" {
  if (status === "success") return "success";
  if (status === "failed") return "warning";
  return "neutral";
}

export function DatasetFreshnessCard({ stats }: DatasetFreshnessCardProps) {
  return (
    <Card title="Dataset freshness">
      <p className="mb-4 text-sm text-muted">
        Gold parquet fingerprint and last pipeline run. Re-run{" "}
        <code className="rounded bg-surface px-1 text-xs">film-agent pipeline</code> via CLI to
        refresh. See{" "}
        <a
          href="https://github.com/DanielFrc/film-developer-agent/blob/master/docs/DATA_CONTRACT.md"
          target="_blank"
          rel="noreferrer"
          className="text-accent underline"
        >
          data contract
        </a>
        .
      </p>
      <dl className="space-y-3 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-muted">Schema version</dt>
          <dd className="font-mono text-ink">{stats.schema_version}</dd>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-muted">Source hash</dt>
          <dd className="font-mono text-xs text-ink">{stats.source_hash ?? "—"}</dd>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-muted">Last pipeline run</dt>
          <dd className="text-ink">{stats.pipeline_run_id ?? "No manifest found"}</dd>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-muted">Finished at</dt>
          <dd className="text-ink">{formatTimestamp(stats.pipeline_finished_at)}</dd>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-muted">Pipeline status</dt>
          <dd>
            {stats.pipeline_status ? (
              <Badge tone={statusTone(stats.pipeline_status)}>{stats.pipeline_status}</Badge>
            ) : (
              <span className="text-ink">—</span>
            )}
          </dd>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <dt className="text-muted">Source</dt>
          <dd className="font-medium text-ink">{stats.source}</dd>
        </div>
      </dl>
    </Card>
  );
}
