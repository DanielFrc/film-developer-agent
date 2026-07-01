import type { RecentQuery } from "../api/types";
import { RECENT_QUERIES_KEY, RECENT_QUERIES_LIMIT } from "./constants";
import { randomId } from "./randomId";

export function loadRecentQueries(): RecentQuery[] {
  try {
    const raw = localStorage.getItem(RECENT_QUERIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RecentQuery[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecentQuery(entry: Omit<RecentQuery, "id" | "queriedAt">): RecentQuery[] {
  const item: RecentQuery = {
    ...entry,
    id: randomId(),
    queriedAt: new Date().toISOString(),
  };
  const next = [item, ...loadRecentQueries().filter((q) => !isSameQuery(q, entry))].slice(
    0,
    RECENT_QUERIES_LIMIT,
  );
  localStorage.setItem(RECENT_QUERIES_KEY, JSON.stringify(next));
  return next;
}

function isSameQuery(
  a: RecentQuery,
  b: Omit<RecentQuery, "id" | "queriedAt">,
): boolean {
  return (
    a.film === b.film &&
    a.developer === b.developer &&
    a.format === b.format &&
    a.iso === b.iso &&
    a.dilution === b.dilution
  );
}
