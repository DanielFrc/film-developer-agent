import type { DevelopingTimeItem, LookupResultView } from "../api/types";
import { DATA_SOURCE } from "./constants";
import { confidenceFromScore } from "./format";

export function buildLookupResultView(
  match: DevelopingTimeItem,
  scores: { film: number | null; developer: number | null },
): LookupResultView {
  const confidenceScore =
    scores.film !== null && scores.developer !== null
      ? Math.min(scores.film, scores.developer)
      : 100;

  const warnings: string[] = [];
  if (!match.temp) {
    warnings.push("Temperature not specified — assume 20°C unless noted otherwise.");
  }
  warnings.push("Verify all times independently before developing film.");

  return {
    match,
    source: DATA_SOURCE,
    confidence: confidenceFromScore(confidenceScore),
    confidenceScore,
    warnings,
  };
}

export function uniqueDilutions(matches: DevelopingTimeItem[]): string[] {
  return [...new Set(matches.map((m) => m.dilution || "stock"))].sort();
}
