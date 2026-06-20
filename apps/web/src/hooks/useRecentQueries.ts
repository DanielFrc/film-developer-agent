import { useCallback, useState } from "react";
import type { RecentQuery } from "../api/types";
import { loadRecentQueries, saveRecentQuery } from "../lib/storage";

export function useRecentQueries() {
  const [queries, setQueries] = useState<RecentQuery[]>(() => loadRecentQueries());

  const refresh = useCallback(() => {
    setQueries(loadRecentQueries());
  }, []);

  const recordQuery = useCallback(
    (entry: Omit<RecentQuery, "id" | "queriedAt">) => {
      const next = saveRecentQuery(entry);
      setQueries(next);
      return next;
    },
    [],
  );

  return { queries, refresh, recordQuery };
}
