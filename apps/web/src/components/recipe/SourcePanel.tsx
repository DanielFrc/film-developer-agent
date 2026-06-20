import type { RecipeResponse } from "../../api/types";
import { DATA_SOURCE_URL } from "../../lib/constants";
import { Card } from "../ui/Card";

interface SourcePanelProps {
  response: RecipeResponse;
}

export function SourcePanel({ response }: SourcePanelProps) {
  return (
    <Card title="Sources consulted">
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Dataset</dt>
          <dd className="font-medium text-ink">
            <a href={DATA_SOURCE_URL} target="_blank" rel="noreferrer" className="text-accent underline">
              {response.source}
            </a>
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Dataset hash</dt>
          <dd className="font-mono text-xs text-ink">{response.source_hash}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Lookup</dt>
          <dd className="text-right text-ink">
            {response.lookup.film} · {response.lookup.developer} · {response.lookup.format} · ISO{" "}
            {response.lookup.iso}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Base time</dt>
          <dd className="font-medium text-ink">{response.lookup.base_time} min</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">LLM</dt>
          <dd className="text-ink">
            {response.llm_provider} / {response.llm_model}
          </dd>
        </div>
        {response.extra_context ? (
          <div>
            <dt className="text-muted">Extra context</dt>
            <dd className="mt-1 text-ink">{response.extra_context}</dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-4 text-xs leading-5 text-muted">{response.disclaimer}</p>
    </Card>
  );
}
