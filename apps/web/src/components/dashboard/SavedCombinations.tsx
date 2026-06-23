import { Link, useNavigate } from "react-router-dom";
import type { SavedCombination } from "../../api/types";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Button } from "../ui/Button";

interface SavedCombinationsProps {
  combinations: SavedCombination[];
  onRemove: (id: string) => void;
}

export function SavedCombinations({ combinations, onRemove }: SavedCombinationsProps) {
  const navigate = useNavigate();

  if (!combinations.length) {
    return (
      <Card title="Saved sessions">
        <EmptyState
          title="No saved sessions"
          description="Save a session card from Search to reopen film + developer setups at the sink."
        />
      </Card>
    );
  }

  return (
    <Card title="Saved sessions">
      <ul className="divide-y divide-border">
        {combinations.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-ink">
                {item.film} · {item.developer}
              </p>
              <p className="text-sm text-muted">
                {item.format} · ISO {item.iso}
                {item.dilution ? ` · ${item.dilution}` : ""}
                {item.devTime ? ` · ${item.devTime} min` : ""}
              </p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                <button
                  type="button"
                  className="text-accent underline"
                  onClick={() => navigate("/session", { state: { combination: item } })}
                >
                  Session card
                </button>
                <Link to="/search" state={{ prefill: item }} className="text-muted underline hover:text-ink">
                  Open in search
                </Link>
              </div>
            </div>
            <Button type="button" variant="ghost" onClick={() => onRemove(item.id)}>
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
