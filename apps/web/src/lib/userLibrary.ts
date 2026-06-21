import type {
  FilmPreferencesEntry,
  FilmPreferencesOverride,
  SavedCombination,
  SavedRecipe,
  UserPreferences,
} from "../api/types";

const KEYS = {
  savedCombinations: "film-agent:saved-combinations",
  savedRecipes: "film-agent:saved-recipes",
  defaultRecipes: "film-agent:default-recipes",
  favoriteFilms: "film-agent:favorite-films",
  favoriteDevelopers: "film-agent:favorite-developers",
  userPreferences: "film-agent:user-preferences",
  filmPreferences: "film-agent:film-preferences",
} as const;

const LIMITS = {
  savedCombinations: 20,
  savedRecipes: 30,
} as const;

export interface FavoriteEntry {
  name: string;
  starred: boolean;
  lookupCount: number;
}

export interface DefaultRecipeEntry {
  film: string;
  developer: string;
  format: string;
  markdown: string;
  savedAt: string;
}

export const EMPTY_USER_PREFERENCES: UserPreferences = {
  agitationMethod: "",
  camera: "",
  styleNotes: "",
  preferredDevelopers: [],
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function defaultRecipeKey(film: string, developer: string, format: string): string {
  return `${film}|${developer}|${format}`;
}

export function loadSavedCombinations(): SavedCombination[] {
  return readJson<SavedCombination[]>(KEYS.savedCombinations, []);
}

export function saveCombination(
  entry: Omit<SavedCombination, "id" | "savedAt">,
): SavedCombination[] {
  const item: SavedCombination = {
    ...entry,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  };
  const next = [
    item,
    ...loadSavedCombinations().filter(
      (existing) =>
        !(
          existing.film === entry.film &&
          existing.developer === entry.developer &&
          existing.format === entry.format &&
          existing.iso === entry.iso &&
          existing.dilution === entry.dilution
        ),
    ),
  ].slice(0, LIMITS.savedCombinations);
  writeJson(KEYS.savedCombinations, next);
  return next;
}

export function removeSavedCombination(id: string): SavedCombination[] {
  const next = loadSavedCombinations().filter((item) => item.id !== id);
  writeJson(KEYS.savedCombinations, next);
  return next;
}

export function loadSavedRecipes(): SavedRecipe[] {
  return readJson<SavedRecipe[]>(KEYS.savedRecipes, []);
}

export function saveRecipeMarkdown(
  entry: Omit<SavedRecipe, "id" | "savedAt">,
): SavedRecipe[] {
  const item: SavedRecipe = {
    ...entry,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  };
  const next = [item, ...loadSavedRecipes()].slice(0, LIMITS.savedRecipes);
  writeJson(KEYS.savedRecipes, next);
  return next;
}

export function removeSavedRecipe(id: string): SavedRecipe[] {
  const next = loadSavedRecipes().filter((item) => item.id !== id);
  writeJson(KEYS.savedRecipes, next);
  return next;
}

export function loadDefaultRecipes(): Record<string, DefaultRecipeEntry> {
  return readJson<Record<string, DefaultRecipeEntry>>(KEYS.defaultRecipes, {});
}

export function getDefaultRecipe(
  film: string,
  developer: string,
  format: string,
): DefaultRecipeEntry | null {
  return loadDefaultRecipes()[defaultRecipeKey(film, developer, format)] ?? null;
}

export function setDefaultRecipe(entry: Omit<DefaultRecipeEntry, "savedAt">): DefaultRecipeEntry {
  const key = defaultRecipeKey(entry.film, entry.developer, entry.format);
  const stored: DefaultRecipeEntry = {
    ...entry,
    savedAt: new Date().toISOString(),
  };
  const next = { ...loadDefaultRecipes(), [key]: stored };
  writeJson(KEYS.defaultRecipes, next);
  return stored;
}

export function loadFavoriteFilms(): FavoriteEntry[] {
  return readJson<FavoriteEntry[]>(KEYS.favoriteFilms, []);
}

export function loadFavoriteDevelopers(): FavoriteEntry[] {
  return readJson<FavoriteEntry[]>(KEYS.favoriteDevelopers, []);
}

function upsertFavorite(list: FavoriteEntry[], name: string, starred?: boolean): FavoriteEntry[] {
  const existing = list.find((item) => item.name === name);
  if (existing) {
    return list.map((item) =>
      item.name === name
        ? {
            ...item,
            lookupCount: item.lookupCount + 1,
            starred: starred ?? item.starred,
          }
        : item,
    );
  }
  return [{ name, starred: starred ?? false, lookupCount: 1 }, ...list];
}

export function recordFavoriteLookup(film: string, developer: string): void {
  writeJson(KEYS.favoriteFilms, upsertFavorite(loadFavoriteFilms(), film));
  writeJson(KEYS.favoriteDevelopers, upsertFavorite(loadFavoriteDevelopers(), developer));
}

export function toggleFavoriteFilm(name: string): FavoriteEntry[] {
  const list = loadFavoriteFilms();
  const existing = list.find((item) => item.name === name);
  const next = existing
    ? list.map((item) => (item.name === name ? { ...item, starred: !item.starred } : item))
    : [{ name, starred: true, lookupCount: 0 }, ...list];
  writeJson(KEYS.favoriteFilms, next);
  return next;
}

export function toggleFavoriteDeveloper(name: string): FavoriteEntry[] {
  const list = loadFavoriteDevelopers();
  const existing = list.find((item) => item.name === name);
  const next = existing
    ? list.map((item) => (item.name === name ? { ...item, starred: !item.starred } : item))
    : [{ name, starred: true, lookupCount: 0 }, ...list];
  writeJson(KEYS.favoriteDevelopers, next);
  return next;
}

export function loadUserPreferences(): UserPreferences {
  return { ...EMPTY_USER_PREFERENCES, ...readJson(KEYS.userPreferences, EMPTY_USER_PREFERENCES) };
}

export function saveUserPreferences(preferences: UserPreferences): UserPreferences {
  writeJson(KEYS.userPreferences, preferences);
  return preferences;
}

export type FilmPreferencesMap = Record<string, FilmPreferencesOverride>;

function cleanFilmOverride(override: FilmPreferencesOverride): FilmPreferencesOverride {
  const cleaned: FilmPreferencesOverride = {};
  if (override.camera?.trim()) {
    cleaned.camera = override.camera.trim();
  }
  if (override.agitationMethod?.trim()) {
    cleaned.agitationMethod = override.agitationMethod.trim();
  }
  if (override.styleNotes?.trim()) {
    cleaned.styleNotes = override.styleNotes.trim();
  }
  if (override.preferredDevelopers?.length) {
    cleaned.preferredDevelopers = override.preferredDevelopers;
  }
  return cleaned;
}

export function loadFilmPreferenceOverrides(): FilmPreferencesMap {
  return readJson<FilmPreferencesMap>(KEYS.filmPreferences, {});
}

export function listFilmPreferenceEntries(): FilmPreferencesEntry[] {
  return Object.entries(loadFilmPreferenceOverrides())
    .map(([film, override]) => ({ film, override }))
    .sort((a, b) => a.film.localeCompare(b.film));
}

export function getFilmPreferenceOverride(film: string): FilmPreferencesOverride | undefined {
  return loadFilmPreferenceOverrides()[film];
}

export function hasFilmPreferenceOverride(film: string): boolean {
  return film in loadFilmPreferenceOverrides();
}

export function getEffectivePreferences(film: string): UserPreferences {
  const global = loadUserPreferences();
  const override = getFilmPreferenceOverride(film);
  if (!override) {
    return global;
  }

  return {
    camera: override.camera?.trim() ? override.camera.trim() : global.camera,
    agitationMethod: override.agitationMethod?.trim()
      ? override.agitationMethod.trim()
      : global.agitationMethod,
    styleNotes: override.styleNotes?.trim() ? override.styleNotes.trim() : global.styleNotes,
    preferredDevelopers: override.preferredDevelopers?.length
      ? override.preferredDevelopers
      : global.preferredDevelopers,
  };
}

export function saveFilmPreferenceOverride(
  film: string,
  override: FilmPreferencesOverride,
): FilmPreferencesMap {
  const cleaned = cleanFilmOverride(override);
  const current = loadFilmPreferenceOverrides();

  if (!Object.keys(cleaned).length) {
    const { [film]: _, ...rest } = current;
    writeJson(KEYS.filmPreferences, rest);
    return rest;
  }

  const next = { ...current, [film]: cleaned };
  writeJson(KEYS.filmPreferences, next);
  return next;
}

export function removeFilmPreferenceOverride(film: string): FilmPreferencesMap {
  const { [film]: _, ...rest } = loadFilmPreferenceOverrides();
  writeJson(KEYS.filmPreferences, rest);
  return rest;
}

export function buildPreferencesContext(preferences: UserPreferences): string | undefined {
  const parts: string[] = [];
  if (preferences.camera.trim()) {
    parts.push(`Camera: ${preferences.camera.trim()}`);
  }
  if (preferences.agitationMethod.trim()) {
    parts.push(`Preferred agitation: ${preferences.agitationMethod.trim()}`);
  }
  if (preferences.styleNotes.trim()) {
    parts.push(preferences.styleNotes.trim());
  }
  return parts.length ? parts.join(". ") : undefined;
}
