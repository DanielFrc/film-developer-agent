import type { FavoriteEntry } from "../../lib/userLibrary";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { topFavorites } from "../../hooks/useUserLibrary";

interface FavoritesPanelProps {
  films: FavoriteEntry[];
  developers: FavoriteEntry[];
  onToggleFilm: (name: string) => void;
  onToggleDeveloper: (name: string) => void;
}

function FavoriteList({
  title,
  items,
  onToggle,
}: {
  title: string;
  items: FavoriteEntry[];
  onToggle: (name: string) => void;
}) {
  const visible = topFavorites(items, 6);

  return (
    <div>
      <h3 className="text-sm font-medium text-ink">{title}</h3>
      {visible.length ? (
        <ul className="mt-3 space-y-2">
          {visible.map((item) => (
            <li key={item.name} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-ink">{item.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">{item.lookupCount} lookups</span>
                <Button type="button" variant="ghost" onClick={() => onToggle(item.name)}>
                  {item.starred ? "★" : "☆"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-muted">Run searches to populate favorites automatically.</p>
      )}
    </div>
  );
}

export function FavoritesPanel({
  films,
  developers,
  onToggleFilm,
  onToggleDeveloper,
}: FavoritesPanelProps) {
  return (
    <Card title="Favorites">
      <div className="grid gap-6 md:grid-cols-2">
        <FavoriteList title="Films" items={films} onToggle={onToggleFilm} />
        <FavoriteList title="Developers" items={developers} onToggle={onToggleDeveloper} />
      </div>
    </Card>
  );
}
