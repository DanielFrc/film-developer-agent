import type {
  CombinationWorkbookEntry,
  DefaultRecipeEntry,
  FavoriteEntry,
  FilmEnrichment,
  FilmPreferencesEntry,
  FilmPreferencesOverride,
  SavedCombination,
  SavedRecipe,
  UserLibraryExport,
  UserPreferences,
} from "../api/types";
import { parsePreferredDevelopers } from "./preferences";
import {
  LIBRARY_EXPORT_VERSION as EXPORT_VERSION,
  LIBRARY_EXPORT_VERSION_V1,
  LIBRARY_EXPORT_VERSION_V2,
} from "../api/types";

const KEYS = {
  savedCombinations: "film-agent:saved-combinations",
  savedRecipes: "film-agent:saved-recipes",
  defaultRecipes: "film-agent:default-recipes",
  favoriteFilms: "film-agent:favorite-films",
  favoriteDevelopers: "film-agent:favorite-developers",
  userPreferences: "film-agent:user-preferences",
  filmPreferences: "film-agent:film-preferences",
  filmEnrichment: "film-agent:film-enrichment",
  combinationWorkbook: "film-agent:combination-workbook",
} as const;

const LIMITS = {
  savedCombinations: 20,
  savedRecipes: 30,
} as const;

export type { DefaultRecipeEntry, FavoriteEntry } from "../api/types";

export const EMPTY_USER_PREFERENCES: UserPreferences = {
  agitationMethod: "",
  camera: "",
  styleNotes: "",
  preferredDevelopers: "",
  tankVolumeMl: "500",
  stopBathRecipe: "5% white vinegar (acetic acid), same volume as developer, ~30 seconds",
  presoakDefault: "",
};

function normalizeUserPreferences(raw: Partial<UserPreferences> & { preferredDevelopers?: unknown }): UserPreferences {
  const merged = { ...EMPTY_USER_PREFERENCES, ...raw };
  if (Array.isArray(raw.preferredDevelopers)) {
    merged.preferredDevelopers = raw.preferredDevelopers.join(", ");
  } else if (typeof merged.preferredDevelopers !== "string") {
    merged.preferredDevelopers = "";
  }
  return merged;
}

function normalizeWorkbookEntry(entry: CombinationWorkbookEntry): CombinationWorkbookEntry {
  return {
    ...entry,
    presoakOverride: entry.presoakOverride ?? "",
    rollsDeveloped: entry.rollsDeveloped ?? 0,
    outcomeDensity: entry.outcomeDensity ?? "",
    outcomeGrain: entry.outcomeGrain ?? "",
    outcomeNotes: entry.outcomeNotes ?? "",
  };
}

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

export function combinationWorkbookKey(
  film: string,
  developer: string,
  format: string,
  iso: string,
  dilution?: string | null,
): string {
  return `${film}|${developer}|${format}|${iso}|${dilution?.trim() || "stock"}`;
}

export function loadFilmEnrichmentMap(): Record<string, FilmEnrichment> {
  return readJson<Record<string, FilmEnrichment>>(KEYS.filmEnrichment, {});
}

export function listFilmEnrichmentEntries(): FilmEnrichment[] {
  return Object.values(loadFilmEnrichmentMap()).sort((a, b) => a.film.localeCompare(b.film));
}

export function getFilmEnrichment(film: string): FilmEnrichment | null {
  return loadFilmEnrichmentMap()[film] ?? null;
}

function cleanFilmEnrichment(entry: Omit<FilmEnrichment, "updatedAt">): FilmEnrichment | null {
  const cleaned = {
    film: entry.film,
    boxSpeedIso: entry.boxSpeedIso.trim(),
    typicalEi: entry.typicalEi.trim(),
    notes: entry.notes.trim(),
    updatedAt: new Date().toISOString(),
  };
  if (!cleaned.boxSpeedIso && !cleaned.typicalEi && !cleaned.notes) {
    return null;
  }
  return cleaned;
}

export function saveFilmEnrichment(
  entry: Omit<FilmEnrichment, "updatedAt">,
): Record<string, FilmEnrichment> {
  const cleaned = cleanFilmEnrichment(entry);
  const current = loadFilmEnrichmentMap();
  if (!cleaned) {
    const { [entry.film]: _, ...rest } = current;
    writeJson(KEYS.filmEnrichment, rest);
    return rest;
  }
  const next = { ...current, [entry.film]: cleaned };
  writeJson(KEYS.filmEnrichment, next);
  return next;
}

export function removeFilmEnrichment(film: string): Record<string, FilmEnrichment> {
  const { [film]: _, ...rest } = loadFilmEnrichmentMap();
  writeJson(KEYS.filmEnrichment, rest);
  return rest;
}

export function loadCombinationWorkbookMap(): Record<string, CombinationWorkbookEntry> {
  return readJson<Record<string, CombinationWorkbookEntry>>(KEYS.combinationWorkbook, {});
}

export function getCombinationWorkbook(
  film: string,
  developer: string,
  format: string,
  iso: string,
  dilution?: string | null,
): CombinationWorkbookEntry | null {
  const key = combinationWorkbookKey(film, developer, format, iso, dilution);
  const entry = loadCombinationWorkbookMap()[key];
  return entry ? normalizeWorkbookEntry(entry) : null;
}

function workbookDraftFromMatch(match: {
  film: string;
  developer: string;
  format: string;
  iso: string;
  dilution?: string | null;
}): Omit<CombinationWorkbookEntry, "updatedAt"> {
  return {
    film: match.film,
    developer: match.developer,
    format: match.format,
    iso: match.iso,
    dilution: match.dilution?.trim() || "stock",
    adjustedDevTime: "",
    adjustmentReason: "",
    outputGoal: "",
    environmentNotes: "",
    workflowNotes: "",
    presoakOverride: "",
    rollsDeveloped: 0,
    outcomeDensity: "",
    outcomeGrain: "",
    outcomeNotes: "",
  };
}

function cleanWorkbookEntry(
  entry: Omit<CombinationWorkbookEntry, "updatedAt">,
): CombinationWorkbookEntry | null {
  const cleaned: CombinationWorkbookEntry = {
    film: entry.film,
    developer: entry.developer,
    format: entry.format,
    iso: entry.iso,
    dilution: entry.dilution?.trim() || "stock",
    adjustedDevTime: entry.adjustedDevTime.trim(),
    adjustmentReason: entry.adjustmentReason.trim(),
    outputGoal: entry.outputGoal,
    environmentNotes: entry.environmentNotes.trim(),
    workflowNotes: entry.workflowNotes.trim(),
    presoakOverride: entry.presoakOverride.trim(),
    rollsDeveloped: Math.max(0, entry.rollsDeveloped ?? 0),
    outcomeDensity: entry.outcomeDensity,
    outcomeGrain: entry.outcomeGrain,
    outcomeNotes: entry.outcomeNotes.trim(),
    updatedAt: new Date().toISOString(),
  };
  const hasContent =
    cleaned.adjustedDevTime ||
    cleaned.adjustmentReason ||
    cleaned.outputGoal ||
    cleaned.environmentNotes ||
    cleaned.workflowNotes ||
    cleaned.presoakOverride ||
    cleaned.rollsDeveloped > 0 ||
    cleaned.outcomeDensity ||
    cleaned.outcomeGrain ||
    cleaned.outcomeNotes;
  return hasContent ? cleaned : null;
}

export function saveCombinationWorkbook(
  entry: Omit<CombinationWorkbookEntry, "updatedAt">,
): CombinationWorkbookEntry | null {
  const cleaned = cleanWorkbookEntry(entry);
  const key = combinationWorkbookKey(
    entry.film,
    entry.developer,
    entry.format,
    entry.iso,
    entry.dilution,
  );
  const current = loadCombinationWorkbookMap();
  if (!cleaned) {
    const { [key]: _, ...rest } = current;
    writeJson(KEYS.combinationWorkbook, rest);
    return null;
  }
  const next = { ...current, [key]: cleaned };
  writeJson(KEYS.combinationWorkbook, next);
  return cleaned;
}

export function removeCombinationWorkbook(
  film: string,
  developer: string,
  format: string,
  iso: string,
  dilution?: string | null,
): void {
  const key = combinationWorkbookKey(film, developer, format, iso, dilution);
  const { [key]: _, ...rest } = loadCombinationWorkbookMap();
  writeJson(KEYS.combinationWorkbook, rest);
}

export function incrementWorkbookRolls(
  match: {
    film: string;
    developer: string;
    format: string;
    iso: string;
    dilution?: string | null;
  },
): CombinationWorkbookEntry {
  const existing = getCombinationWorkbook(
    match.film,
    match.developer,
    match.format,
    match.iso,
    match.dilution,
  );
  const draft = existing
    ? {
        film: existing.film,
        developer: existing.developer,
        format: existing.format,
        iso: existing.iso,
        dilution: existing.dilution,
        adjustedDevTime: existing.adjustedDevTime,
        adjustmentReason: existing.adjustmentReason,
        outputGoal: existing.outputGoal,
        environmentNotes: existing.environmentNotes,
        workflowNotes: existing.workflowNotes,
        presoakOverride: existing.presoakOverride,
        rollsDeveloped: existing.rollsDeveloped + 1,
        outcomeDensity: existing.outcomeDensity,
        outcomeGrain: existing.outcomeGrain,
        outcomeNotes: existing.outcomeNotes,
      }
    : { ...workbookDraftFromMatch(match), rollsDeveloped: 1 };

  const saved = saveCombinationWorkbook(draft);
  return saved ?? { ...draft, updatedAt: new Date().toISOString() };
}

export function buildWorkbookContext(entry: CombinationWorkbookEntry | null): string | undefined {
  if (!entry) return undefined;
  const parts: string[] = [];
  if (entry.adjustedDevTime) {
    parts.push(
      `Photographer working dev time: ${entry.adjustedDevTime} min (chart lookup time remains authoritative; adapt agitation/workflow only)`,
    );
  }
  if (entry.adjustmentReason) {
    parts.push(`Adjustment reason: ${entry.adjustmentReason}`);
  }
  if (entry.outputGoal) {
    parts.push(`Output goal: ${entry.outputGoal}`);
  }
  if (entry.environmentNotes) {
    parts.push(entry.environmentNotes);
  }
  if (entry.workflowNotes) {
    parts.push(entry.workflowNotes);
  }
  if (entry.presoakOverride) {
    parts.push(`Pre-soak: ${entry.presoakOverride}`);
  }
  if (entry.rollsDeveloped > 0) {
    parts.push(`Rolls developed with this combo: ${entry.rollsDeveloped}`);
  }
  if (entry.outcomeDensity || entry.outcomeGrain) {
    const tags = [entry.outcomeDensity, entry.outcomeGrain].filter(Boolean).join(", ");
    parts.push(`Recent results: ${tags}`);
  }
  if (entry.outcomeNotes) {
    parts.push(`Outcome notes: ${entry.outcomeNotes}`);
  }
  return parts.length ? parts.join(". ") : undefined;
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
  return normalizeUserPreferences(readJson(KEYS.userPreferences, EMPTY_USER_PREFERENCES));
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
  if (override.preferredDevelopers?.trim()) {
    cleaned.preferredDevelopers = override.preferredDevelopers.trim();
  }
  if (override.presoakDefault?.trim()) {
    cleaned.presoakDefault = override.presoakDefault.trim();
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
    preferredDevelopers: override.preferredDevelopers?.trim()
      ? override.preferredDevelopers.trim()
      : global.preferredDevelopers,
    tankVolumeMl: global.tankVolumeMl,
    stopBathRecipe: global.stopBathRecipe,
    presoakDefault: override.presoakDefault?.trim()
      ? override.presoakDefault.trim()
      : global.presoakDefault,
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
  const developers = parsePreferredDevelopers(preferences.preferredDevelopers);
  if (developers.length) {
    parts.push(`Preferred developers: ${developers.join(", ")}`);
  }
  if (preferences.agitationMethod.trim()) {
    parts.push(`Preferred agitation: ${preferences.agitationMethod.trim()}`);
  }
  if (preferences.styleNotes.trim()) {
    parts.push(preferences.styleNotes.trim());
  }
  if (preferences.presoakDefault.trim()) {
    parts.push(`Default pre-soak: ${preferences.presoakDefault.trim()}`);
  }
  return parts.length ? parts.join(". ") : undefined;
}

export function buildUserLibraryExport(): UserLibraryExport {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    savedCombinations: loadSavedCombinations(),
    savedRecipes: loadSavedRecipes(),
    defaultRecipes: loadDefaultRecipes(),
    favoriteFilms: loadFavoriteFilms(),
    favoriteDevelopers: loadFavoriteDevelopers(),
    userPreferences: loadUserPreferences(),
    filmPreferences: loadFilmPreferenceOverrides(),
    filmEnrichment: loadFilmEnrichmentMap(),
    combinationWorkbook: loadCombinationWorkbookMap(),
  };
}

function isLibraryExportRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function normalizeLibraryImport(record: Record<string, unknown>): UserLibraryExport {
  const version = record.version;
  if (version !== EXPORT_VERSION && version !== LIBRARY_EXPORT_VERSION_V2 && version !== LIBRARY_EXPORT_VERSION_V1) {
    throw new Error("Invalid library backup file (expected version 1, 2, or 3).");
  }
  if (typeof record.exportedAt !== "string") {
    throw new Error("Invalid library backup file (missing exportedAt).");
  }

  return {
    version: EXPORT_VERSION,
    exportedAt: record.exportedAt,
    savedCombinations: (record.savedCombinations as SavedCombination[]) ?? [],
    savedRecipes: (record.savedRecipes as SavedRecipe[]) ?? [],
    defaultRecipes: (record.defaultRecipes as Record<string, DefaultRecipeEntry>) ?? {},
    favoriteFilms: (record.favoriteFilms as FavoriteEntry[]) ?? [],
    favoriteDevelopers: (record.favoriteDevelopers as FavoriteEntry[]) ?? [],
    userPreferences: normalizeUserPreferences(
      (record.userPreferences as Partial<UserPreferences>) ?? {},
    ),
    filmPreferences: (record.filmPreferences as Record<string, FilmPreferencesOverride>) ?? {},
    filmEnrichment: (record.filmEnrichment as Record<string, FilmEnrichment>) ?? {},
    combinationWorkbook: Object.fromEntries(
      Object.entries(
        (record.combinationWorkbook as Record<string, CombinationWorkbookEntry>) ?? {},
      ).map(([key, entry]) => [key, normalizeWorkbookEntry(entry)]),
    ),
  };
}

export function importUserLibrary(payload: unknown): UserLibraryExport {
  if (!isLibraryExportRecord(payload)) {
    throw new Error("Invalid library backup file.");
  }

  const normalized = normalizeLibraryImport(payload);

  writeJson(KEYS.savedCombinations, normalized.savedCombinations);
  writeJson(KEYS.savedRecipes, normalized.savedRecipes);
  writeJson(KEYS.defaultRecipes, normalized.defaultRecipes);
  writeJson(KEYS.favoriteFilms, normalized.favoriteFilms);
  writeJson(KEYS.favoriteDevelopers, normalized.favoriteDevelopers);
  writeJson(KEYS.userPreferences, normalized.userPreferences);
  writeJson(KEYS.filmPreferences, normalized.filmPreferences);
  writeJson(KEYS.filmEnrichment, normalized.filmEnrichment);
  writeJson(KEYS.combinationWorkbook, normalized.combinationWorkbook);

  return normalized;
}

export function downloadUserLibraryBackup(): void {
  const payload = buildUserLibraryExport();
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `film-agent-library-${payload.exportedAt.slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}
