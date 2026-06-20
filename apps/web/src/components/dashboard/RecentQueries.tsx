import { Link } from "react-router-dom";
import type { RecentQuery } from "../../api/types";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Button } from "../ui/Button";

interface RecentQueriesProps {
  queries: RecentQuery[];
}

export function RecentQueries({ queries }: RecentQueriesProps) {
  if (!queries.length) {
    return (
      <Card title="Last queries">
        <EmptyState
          title="No recent lookups"
          description="Run a search to see your latest film and developer combinations here."
          action={
            <Link to="/search">
              <Button variant="secondary">Start searching</Button>
            </Link>
          }
        />
      </Card>
    );
  }

  return (
    <Card title="Last queries">
      <ul className="divide-y divide-border">
        {queries.map((query) => (
          <li key={query.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <Link
              to="/search"
              state={{ prefill: query }}
              className="min-w-0 flex-1 hover:text-accent"
            >
              <p className="font-medium text-ink">
                {query.film} · {query.developer}
              </p>
              <p className="text-sm text-muted">
                {query.format} · ISO {query.iso}
                {query.dilution ? ` · ${query.dilution}` : ""}
                {query.devTime ? ` · ${query.devTime} min` : ""}
              </p>
            </Link>
            <time className="text-xs text-muted">
              {new Date(query.queriedAt).toLocaleString()}
            </time>
          </li>
        ))}
      </ul>
    </Card>
  );
}
