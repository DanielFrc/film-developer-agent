import { useCallback, useState } from "react";
import type {
  DevelopedRoll,
  FilmPreferencesOverride,
  SavedCombination,
  SavedRecipe,
  UserPreferences,
} from "../api/types";
import {
  listFilmPreferenceEntries,
  loadDevelopedRolls,
  loadFavoriteDevelopers,
  loadFavoriteFilms,
  loadSavedCombinations,
  loadSavedRecipes,
  loadUserPreferences,
  logDevelopedRoll,
  removeDevelopedRoll,
  removeFilmPreferenceOverride,
  removeSavedCombination,
  recordFavoriteLookup,
  removeSavedRecipe,
  saveCombination,
  saveFilmPreferenceOverride,
  saveRecipeMarkdown,
  saveUserPreferences,
  setDefaultRecipe,
  toggleFavoriteDeveloper,
  toggleFavoriteFilm,
  type FavoriteEntry,
} from "../lib/userLibrary";

export function useUserLibrary() {
  const [combinations, setCombinations] = useState(() => loadSavedCombinations());
  const [recipes, setRecipes] = useState(() => loadSavedRecipes());
  const [favoriteFilms, setFavoriteFilms] = useState(() => loadFavoriteFilms());
  const [favoriteDevelopers, setFavoriteDevelopers] = useState(() => loadFavoriteDevelopers());
  const [developedRolls, setDevelopedRolls] = useState(() => loadDevelopedRolls());

  const refresh = useCallback(() => {
    setCombinations(loadSavedCombinations());
    setRecipes(loadSavedRecipes());
    setFavoriteFilms(loadFavoriteFilms());
    setFavoriteDevelopers(loadFavoriteDevelopers());
    setDevelopedRolls(loadDevelopedRolls());
  }, []);

  const addCombination = useCallback(
    (entry: Omit<SavedCombination, "id" | "savedAt">) => {
      setCombinations(saveCombination(entry));
    },
    [],
  );

  const deleteCombination = useCallback((id: string) => {
    setCombinations(removeSavedCombination(id));
  }, []);

  const addRecipe = useCallback((entry: Omit<SavedRecipe, "id" | "savedAt">) => {
    setRecipes(saveRecipeMarkdown(entry));
  }, []);

  const deleteRecipe = useCallback((id: string) => {
    setRecipes(removeSavedRecipe(id));
  }, []);

  const saveAsDefault = useCallback(
    (entry: { film: string; developer: string; format: string; markdown: string }) => {
      setDefaultRecipe(entry);
    },
    [],
  );

  const starFilm = useCallback((name: string) => {
    setFavoriteFilms(toggleFavoriteFilm(name));
  }, []);

  const starDeveloper = useCallback((name: string) => {
    setFavoriteDevelopers(toggleFavoriteDeveloper(name));
  }, []);

  const recordLookup = useCallback((film: string, developer: string) => {
    recordFavoriteLookup(film, developer);
    setFavoriteFilms(loadFavoriteFilms());
    setFavoriteDevelopers(loadFavoriteDevelopers());
  }, []);

  const addDevelopedRoll = useCallback(
    (
      entry: Omit<DevelopedRoll, "id" | "createdAt">,
      match: {
        film: string;
        developer: string;
        format: string;
        iso: string;
        dilution?: string | null;
      },
    ) => {
      logDevelopedRoll(entry, match);
      setDevelopedRolls(loadDevelopedRolls());
    },
    [],
  );

  const deleteDevelopedRoll = useCallback((id: string) => {
    setDevelopedRolls(removeDevelopedRoll(id));
  }, []);

  return {
    combinations,
    recipes,
    favoriteFilms,
    favoriteDevelopers,
    developedRolls,
    refresh,
    addCombination,
    deleteCombination,
    addRecipe,
    deleteRecipe,
    saveAsDefault,
    starFilm,
    starDeveloper,
    recordLookup,
    addDevelopedRoll,
    deleteDevelopedRoll,
  };
}

export function useUserPreferencesState() {
  const [preferences, setPreferences] = useState<UserPreferences>(() => loadUserPreferences());

  const updatePreferences = useCallback((patch: Partial<UserPreferences>) => {
    setPreferences((current) => saveUserPreferences({ ...current, ...patch }));
  }, []);

  const saveAll = useCallback((next: UserPreferences) => {
    setPreferences(saveUserPreferences(next));
  }, []);

  return { preferences, updatePreferences, saveAll };
}

export function useFilmPreferencesState() {
  const [entries, setEntries] = useState(() => listFilmPreferenceEntries());

  const refresh = useCallback(() => {
    setEntries(listFilmPreferenceEntries());
  }, []);

  const saveOverride = useCallback((film: string, override: FilmPreferencesOverride) => {
    saveFilmPreferenceOverride(film, override);
    setEntries(listFilmPreferenceEntries());
  }, []);

  const removeOverride = useCallback((film: string) => {
    removeFilmPreferenceOverride(film);
    setEntries(listFilmPreferenceEntries());
  }, []);

  return { entries, refresh, saveOverride, removeOverride };
}

export function topFavorites(entries: FavoriteEntry[], limit = 5): FavoriteEntry[] {
  return [...entries]
    .sort((a, b) => Number(b.starred) - Number(a.starred) || b.lookupCount - a.lookupCount)
    .slice(0, limit);
}
