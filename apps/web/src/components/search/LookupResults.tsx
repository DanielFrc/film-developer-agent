import type { DevelopingTimeItem, LookupResultView } from "../../api/types";
import { DATA_SOURCE_URL } from "../../lib/constants";
import { formatTemperature } from "../../lib/format";
import { uniqueDilutions } from "../../lib/lookup";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { selectClassName } from "../ui/FormField";

interface LookupResultsProps {
  matches: DevelopingTimeItem[];
  result: LookupResultView | null;
  temperatureUnit: "C" | "F";
  selectedDilution: string;
  onSelectDilution: (dilution: string) => void;
  onConfirmMatch: (match: DevelopingTimeItem) => void;
  onGenerateRecipe?: () => void;
  onSaveCombination?: () => void;
  pushPullHint?: string | null;
}

const confidenceTone = {
  high: "success" as const,
  medium: "accent" as const,
  low: "warning" as const,
};

export function LookupResults({
  matches,
  result,
  temperatureUnit,
  selectedDilution,
  onSelectDilution,
  onConfirmMatch,
  onGenerateRecipe,
  onSaveCombination,
  pushPullHint,
}: LookupResultsProps) {
  if (!matches.length) {
    return null;
  }

  const dilutions = uniqueDilutions(matches);
  const needsDilutionPick = matches.length > 1 && !result;

  return (
    <Card title="Lookup results" className="mt-8">
      {needsDilutionPick ? (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Multiple developing times found. Select a dilution to continue.
          </p>
          <label className="block max-w-xs">
            <span className="mb-1 block text-sm font-medium text-ink">Dilution</span>
            <select
              value={selectedDilution}
              onChange={(e) => onSelectDilution(e.target.value)}
              className={selectClassName}
            >
              <option value="">Choose dilution…</option>
              {dilutions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            variant="secondary"
            disabled={!selectedDilution}
            onClick={() => {
              const match = matches.find(
                (m) => (m.dilution || "stock") === selectedDilution,
              );
              if (match) onConfirmMatch(match);
            }}
          >
            Confirm selection
          </Button>
        </div>
      ) : null}

      {result ? (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={confidenceTone[result.confidence]}>
              {`Confidence ${result.confidence} (${result.confidenceScore.toFixed(0)}%)`}
            </Badge>
            <Badge tone="neutral">{result.source}</Badge>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Recommended time</dt>
              <dd className="mt-1 text-2xl font-semibold text-ink">
                {result.match.dev_time} min
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Temperature</dt>
              <dd className="mt-1 text-lg font-medium text-ink">
                {formatTemperature(result.match.temp, temperatureUnit)}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Film</dt>
              <dd className="mt-1 text-sm text-ink">{result.match.film}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Developer</dt>
              <dd className="mt-1 text-sm text-ink">{result.match.developer}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Format · ISO</dt>
              <dd className="mt-1 text-sm text-ink">
                {result.match.format} · ISO {result.match.iso}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">Dilution</dt>
              <dd className="mt-1 text-sm text-ink">{result.match.dilution || "stock"}</dd>
            </div>
          </dl>

          {pushPullHint ? (
            <div className="rounded-lg border border-accent/20 bg-accent-soft/40 px-4 py-3 text-sm text-ink">
              {pushPullHint}
            </div>
          ) : null}

          {result.match.notes ? (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Notes</h3>
              <p className="mt-2 text-sm leading-6 text-ink">{result.match.notes}</p>
            </div>
          ) : null}

          {result.warnings.length ? (
            <div className="rounded-lg border border-warning/20 bg-warning/5 px-4 py-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-warning">
                Warnings
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-warning">
                {result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <p className="text-sm text-muted">
            Source:{" "}
            <a
              href={DATA_SOURCE_URL}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-accent underline"
            >
              DigitalTruth Massive Dev Chart
            </a>
          </p>

          <div className="flex flex-wrap gap-3">
            {onSaveCombination ? (
              <Button type="button" variant="secondary" onClick={onSaveCombination}>
                Save combination
              </Button>
            ) : null}
            {onGenerateRecipe ? (
              <Button type="button" onClick={onGenerateRecipe}>
                Generate recipe
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}
    </Card>
  );
}
