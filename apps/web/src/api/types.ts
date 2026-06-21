/** API types — mirror film_agent_api/schemas.py and openapi.json */

// --- API responses ---

export interface HealthResponse {
  status: string;
}

export interface DatasetStatsResponse {
  films: number;
  developers: number;
  developing_time_combinations: number;
  source: string;
  source_hash: string | null;
}

export interface SearchResultItem {
  name: string;
  value: string | null;
  score: number;
}

export interface FormatItem {
  format: string;
  description?: string | null;
}

export interface DevelopingTimeItem {
  film: string;
  developer: string;
  format: string;
  iso: string;
  dilution?: string | null;
  dev_time: string;
  temp?: string | null;
  notes?: string | null;
  film_id?: number | null;
  developer_id?: number | null;
  format_id?: number | null;
}

export interface RecipeLookupItem {
  film: string;
  developer: string;
  format: string;
  iso: string;
  dilution: string;
  base_time: string;
  temperature?: string | null;
  notes?: string | null;
}

export interface RecipeRequest {
  film: string;
  developer: string;
  format: string;
  iso: string;
  dilution?: string | null;
  extra_context?: string | null;
  force_regenerate?: boolean;
}

export interface RecipeResponse {
  recipe: string;
  cached: boolean;
  cache_key: string;
  source: string;
  source_hash: string;
  disclaimer: string;
  prompt_version: string;
  llm_provider: string;
  llm_model: string;
  lookup: RecipeLookupItem;
  extra_context?: string | null;
}

export interface ApiError {
  detail: string;
}

// --- UI domain types ---

export const SCRAPED_FORMATS = ["35mm", "120", "sheet"] as const;
export type ScrapedFormat = (typeof SCRAPED_FORMATS)[number];

export type RoutePath = "/" | "/search" | "/recipe" | "/explorer" | "/preferences";

export type ConfidenceLevel = "high" | "medium" | "low";

export type ExplorerLayer = "bronze" | "silver" | "gold";

/** Search form — maps interfacerules fields to API + extra_context */
export interface SearchFormValues {
  filmQuery: string;
  filmSelected: string | null;
  filmScore: number | null;
  isoNominal: string;
  isoExposed: string;
  developerQuery: string;
  developerSelected: string | null;
  developerScore: number | null;
  format: ScrapedFormat;
  dilution: string;
  temperatureUnit: "C" | "F";
  agitationMethod: string;
  extraContext: string;
}

export const DEFAULT_SEARCH_FORM: SearchFormValues = {
  filmQuery: "",
  filmSelected: null,
  filmScore: null,
  isoNominal: "",
  isoExposed: "400",
  developerQuery: "",
  developerSelected: null,
  developerScore: null,
  format: "120",
  dilution: "",
  temperatureUnit: "C",
  agitationMethod: "",
  extraContext: "",
};

/** Enriched lookup row for Search Results screen */
export interface LookupResultView {
  match: DevelopingTimeItem;
  source: string;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  warnings: string[];
}

/** Recipe detail view model */
export interface RecipeDetailView {
  response: RecipeResponse;
  copied: boolean;
}

/** Recent query persisted in localStorage (Dashboard) */
export interface RecentQuery {
  id: string;
  film: string;
  developer: string;
  format: string;
  iso: string;
  dilution: string | null;
  devTime: string | null;
  queriedAt: string;
}

/** Async state helper for pages */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** Data explorer — iteration 4 */
export interface ExplorerRow {
  [key: string]: string | number | boolean | null;
}

export interface PaginatedExplorerResult {
  layer: ExplorerLayer;
  rows: ExplorerRow[];
  total: number;
  page: number;
  page_size: number;
  columns: string[];
  source_filter_applied?: boolean;
}

export interface ExplorerFilters {
  layer: ExplorerLayer;
  film: string;
  developer: string;
  iso: string;
  source: string;
  page: number;
  pageSize: number;
}

export interface ExplorerColumnSchema {
  name: string;
  type: string;
}

export interface ExplorerSchemaResponse {
  layer: ExplorerLayer;
  columns: ExplorerColumnSchema[];
}

export interface ExplorerCatalogResult {
  catalog: "films" | "developers";
  rows: ExplorerRow[];
  total: number;
  page: number;
  page_size: number;
  columns: string[];
}

/** Saved lookup combination (client library) */
export interface SavedCombination {
  id: string;
  film: string;
  developer: string;
  format: string;
  iso: string;
  dilution: string | null;
  devTime: string | null;
  savedAt: string;
}

/** Saved recipe markdown snapshot */
export interface SavedRecipe {
  id: string;
  film: string;
  developer: string;
  format: string;
  markdown: string;
  savedAt: string;
}

/** Global user preferences (localStorage) */
export interface UserPreferences {
  agitationMethod: string;
  camera: string;
  styleNotes: string;
  preferredDevelopers: string[];
}

/** Per-film overrides — empty fields inherit from global preferences */
export type FilmPreferencesOverride = Partial<UserPreferences>;

export interface FilmPreferencesEntry {
  film: string;
  override: FilmPreferencesOverride;
}

/** State passed from Search → Recipe */
export interface RecipeNavigationState {
  request: RecipeRequest;
  lookup: LookupResultView;
  forceGenerate?: boolean;
}

/** View a saved recipe from the library */
export interface SavedRecipeViewState {
  recipe: SavedRecipe;
}
