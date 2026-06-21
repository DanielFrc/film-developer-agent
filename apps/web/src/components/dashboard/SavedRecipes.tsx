import { Link } from "react-router-dom";
import type { SavedRecipe } from "../../api/types";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Button } from "../ui/Button";

interface SavedRecipesProps {
  recipes: SavedRecipe[];
  onRemove: (id: string) => void;
}

export function SavedRecipes({ recipes, onRemove }: SavedRecipesProps) {
  if (!recipes.length) {
    return (
      <Card title="Saved recipes">
        <EmptyState
          title="No saved recipes"
          description="Save a generated recipe to keep your preferred workflow steps offline."
        />
      </Card>
    );
  }

  return (
    <Card title="Saved recipes">
      <ul className="divide-y divide-border">
        {recipes.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-4 py-3 first:pt-0 last:pb-0">
            <Link
              to="/recipe"
              state={{ recipe: item }}
              className="min-w-0 flex-1 hover:text-accent"
            >
              <p className="font-medium text-ink">
                {item.film} · {item.developer}
              </p>
              <p className="text-sm text-muted">{item.format}</p>
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
