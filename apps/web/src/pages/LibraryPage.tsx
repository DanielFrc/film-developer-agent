import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useRecentQueries } from "../hooks/useRecentQueries";
import { useUserLibrary } from "../hooks/useUserLibrary";
import { PageHeader } from "../components/layout/PageHeader";
import { RecentQueries } from "../components/dashboard/RecentQueries";
import { SavedCombinations } from "../components/dashboard/SavedCombinations";
import { SavedRecipes } from "../components/dashboard/SavedRecipes";
import { FavoritesPanel } from "../components/dashboard/FavoritesPanel";
import { FilmEnrichmentSection } from "../components/library/FilmEnrichmentSection";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export function LibraryPage() {
  const { queries } = useRecentQueries();
  const library = useUserLibrary();

  useEffect(() => {
    library.refresh();
  }, [library.refresh]);

  return (
    <div>
      <PageHeader
        title="Library"
        description="Saved combinations, recipes, favorites, and recent searches — stored in this browser only."
        action={
          <div className="flex gap-2">
            <Link to="/preferences">
              <Button variant="secondary">Backup & preferences</Button>
            </Link>
            <Link to="/search">
              <Button>New query</Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentQueries queries={queries} />
        <SavedCombinations
          combinations={library.combinations}
          onRemove={library.deleteCombination}
        />
        <SavedRecipes recipes={library.recipes} onRemove={library.deleteRecipe} />
        <FavoritesPanel
          films={library.favoriteFilms}
          developers={library.favoriteDevelopers}
          onToggleFilm={library.starFilm}
          onToggleDeveloper={library.starDeveloper}
        />
        <Card title="About your library">
          <p className="text-sm leading-6 text-muted">
            Pins and recipes live in localStorage. Export a JSON backup from Preferences before
            clearing site data or switching browsers. After installing the app (Add to Home Screen),
            saved and default recipes stay readable offline.
          </p>
          <Link to="/preferences" className="mt-3 inline-block text-sm text-accent underline">
            Open preferences & backup
          </Link>
        </Card>
      </div>

      <div className="mt-6">
        <FilmEnrichmentSection />
      </div>
    </div>
  );
}
