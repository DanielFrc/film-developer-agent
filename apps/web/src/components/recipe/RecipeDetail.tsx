import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { RecipeResponse } from "../../api/types";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { RecipeMetadata } from "./RecipeMetadata";

interface RecipeDetailProps {
  response: RecipeResponse;
  loading?: boolean;
  onRegenerate: () => void;
  onPrint: () => void;
}

export function RecipeDetail({
  response,
  loading = false,
  onRegenerate,
  onPrint,
}: RecipeDetailProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(response.recipe);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6 print:space-y-4">
      <RecipeMetadata response={response} />

      <Card title="Development recipe" className="print:border-none print:shadow-none">
        <article className="recipe-markdown max-w-none text-ink">
          <ReactMarkdown>{response.recipe}</ReactMarkdown>
        </article>
      </Card>

      <div className="flex flex-wrap gap-3 print:hidden">
        <Button type="button" variant="secondary" onClick={handleCopy}>
          {copied ? "Copied!" : "Copy recipe"}
        </Button>
        <Button type="button" variant="secondary" onClick={onPrint}>
          Print
        </Button>
        <Button type="button" onClick={onRegenerate} disabled={loading}>
          {loading ? "Regenerating…" : "Regenerate"}
        </Button>
      </div>
    </div>
  );
}
