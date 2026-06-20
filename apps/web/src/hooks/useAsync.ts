import { useCallback, useEffect, useState } from "react";
import { formatApiError, type ApiErrorContext, type ApiErrorView } from "../lib/apiErrors";

export function useAsync<T>(
  task: () => Promise<T>,
  deps: unknown[] = [],
  context: ApiErrorContext = "generic",
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiErrorView | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await task();
      setData(result);
    } catch (err) {
      setError(formatApiError(err, context));
      setData(null);
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    void run();
  }, [run]);

  return { data, loading, error, reload: run };
}
