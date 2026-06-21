import { Link } from "react-router-dom";
import type { SavedCombination } from "../../api/types";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Button } from "../ui/Button";

interface SavedCombinationsProps {
  combinations: SavedCombination[];
  onRemove: (id: string) => void;
}

export function SavedCombinations({ combinations, onRemove }: SavedCombinationsProps) {
  if (!combinations.length) {
    return (
      <Card title="Saved combinations">
        <EmptyState
          title="No saved combinations"
          description="Pin a lookup from Search to quickly reopen film + developer + ISO setups."
        />
      </Card>
    );
  }

  return (
    <Card title="Saved combinations">
      <ul className="divide-y divide-border">
        {combinations.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <Link to="/search" state={{ prefill: item }} className="min-w-0 flex-1 hover:text-accent">
              <p className="font-medium text-ink">
                {item.film} · {item.developer}
              </p>
              <p className="text-sm text-muted">
                {item.format} · ISO {item.iso}
                {item.dilution ? ` · ${item.dilution}` : ""}
              </p>
            </Link>
            <Button type="button" variant="ghost" onClick={() => onRemove(item.id)}>
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
