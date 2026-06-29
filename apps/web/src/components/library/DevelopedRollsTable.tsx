import { Link, useNavigate } from "react-router-dom";
import type { DevelopedRoll, SavedRecipe } from "../../api/types";
import { developedRollToMatch, formatDevelopedDate } from "../../lib/developedRolls";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface DevelopedRollsTableProps {
  rolls: DevelopedRoll[];
  recipes: SavedRecipe[];
  onDelete: (id: string) => void;
  className?: string;
}

export function DevelopedRollsTable({
  rolls,
  recipes,
  onDelete,
  className = "",
}: DevelopedRollsTableProps) {
  const navigate = useNavigate();

  function recipeLabel(recipeId: string | null): { label: string; recipeId: string | null } {
    if (!recipeId) {
      return { label: "—", recipeId: null };
    }
    const recipe = recipes.find((item) => item.id === recipeId);
    if (!recipe) {
      return { label: "—", recipeId: null };
    }
    return { label: `${recipe.film} · ${recipe.developer}`, recipeId };
  }

  return (
    <Card title="Developed rolls" className={className}>
      <p className="mb-4 text-sm text-muted">
        Minimal registry — log from a session card after developing. Write the roll code in your
        notebook and use it for scan filenames (e.g. <code className="text-ink">250619-K400-RODI_001.tif</code>
        ). Detailed notes stay on paper.
      </p>

      {rolls.length === 0 ? (
        <p className="text-sm text-muted">No rolls logged yet. Open a session card and use Log roll.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase tracking-wide text-muted">
                <th className="px-2 py-2 font-medium">Date</th>
                <th className="px-2 py-2 font-medium">Code</th>
                <th className="px-2 py-2 font-medium">Combo</th>
                <th className="px-2 py-2 font-medium">Recipe</th>
                <th className="px-2 py-2 font-medium">Notebook</th>
                <th className="px-2 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rolls.map((roll) => {
                const recipe = recipeLabel(roll.recipeId);
                return (
                  <tr key={roll.id} className="border-b border-border/70 align-top">
                    <td className="px-2 py-3 whitespace-nowrap text-ink">
                      {formatDevelopedDate(roll.developedAt)}
                    </td>
                    <td className="px-2 py-3 font-mono text-sm font-medium text-ink">{roll.code}</td>
                    <td className="px-2 py-3 text-ink">
                      <span className="block font-medium">{roll.film}</span>
                      <span className="text-muted">
                        {roll.developer} · {roll.format} · ISO {roll.iso}
                        {roll.dilution !== "stock" ? ` · ${roll.dilution}` : ""}
                      </span>
                    </td>
                    <td className="px-2 py-3">
                      {recipe.recipeId ? (
                        <Link
                          to="/recipe"
                          state={{ recipe: recipes.find((item) => item.id === recipe.recipeId) }}
                          className="text-accent underline"
                        >
                          {recipe.label}
                        </Link>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="px-2 py-3 text-muted">{roll.notebookRef || "—"}</td>
                    <td className="px-2 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() =>
                            navigate("/session", { state: { match: developedRollToMatch(roll) } })
                          }
                        >
                          Session
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => onDelete(roll.id)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
