import type { RecipeResponse } from "../../api/types";
import { Badge } from "../ui/Badge";

interface RecipeMetadataProps {
  response: RecipeResponse;
}

export function RecipeMetadata({ response }: RecipeMetadataProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {response.cached ? <Badge tone="success">Cached</Badge> : <Badge tone="accent">Generated</Badge>}
      <Badge tone="neutral">{response.source}</Badge>
      <Badge tone="neutral">
        {`${response.lookup.film} · ${response.lookup.developer}`}
      </Badge>
      <Badge tone="neutral">
        {`${response.lookup.format} · ISO ${response.lookup.iso} · ${response.lookup.dilution}`}
      </Badge>
      <Badge tone="neutral">{`${response.lookup.base_time} min @ ${response.lookup.temperature ?? "20"}°C`}</Badge>
    </div>
  );
}
