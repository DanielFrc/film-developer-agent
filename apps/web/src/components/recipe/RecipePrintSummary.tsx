import type { CombinationWorkbookEntry, RecipeResponse } from "../../api/types";
import { DATA_SOURCE_URL } from "../../lib/constants";
import { formatTemperature } from "../../lib/format";

interface RecipePrintSummaryProps {
  response: RecipeResponse;
  workbook?: CombinationWorkbookEntry | null;
}

export function RecipePrintSummary({ response, workbook }: RecipePrintSummaryProps) {
  const lookup = response.lookup;

  return (
    <section className="recipe-print-summary mb-6 hidden border-b border-border pb-6 print:block">
      <h1 className="text-xl font-semibold text-ink">Development recipe</h1>
      <p className="mt-1 text-sm text-muted">
        {lookup.film} · {lookup.developer} · {lookup.format} · ISO {lookup.iso} ·{" "}
        {lookup.dilution}
      </p>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Chart developing time</dt>
          <dd className="text-lg font-semibold text-ink">
            {lookup.base_time ? `${lookup.base_time} min` : "—"}
          </dd>
        </div>
        {workbook?.adjustedDevTime ? (
          <div>
            <dt className="text-muted">Your working time</dt>
            <dd className="text-lg font-semibold text-ink">{workbook.adjustedDevTime} min</dd>
            <p className="text-xs text-muted">Personal note — verify before use</p>
          </div>
        ) : null}
        <div>
          <dt className="text-muted">Temperature</dt>
          <dd className="font-medium text-ink">
            {lookup.temperature ? formatTemperature(lookup.temperature, "C") : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Source</dt>
          <dd className="font-medium text-ink">{response.source}</dd>
        </div>
      </dl>

      {workbook?.workflowNotes ? (
        <p className="mt-3 text-sm text-ink">
          <span className="font-medium">Workflow notes:</span> {workbook.workflowNotes}
        </p>
      ) : null}

      <p className="mt-4 text-xs leading-5 text-muted">
        {response.disclaimer} Chart reference:{" "}
        <span className="break-all">{DATA_SOURCE_URL}</span>
      </p>
    </section>
  );
}
