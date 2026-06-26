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
  schema_version: string;
  pipeline_run_id: string | null;
  pipeline_started_at: string | null;
  pipeline_finished_at: string | null;
  pipeline_status: string | null;
}

/** Browser library backup format */
export const LIBRARY_EXPORT_VERSION_V1 = 1 as const;
export const LIBRARY_EXPORT_VERSION_V2 = 2 as const;
export const LIBRARY_EXPORT_VERSION = 3 as const;

export type OutputGoal = "print" | "scan" | "both";

/** Personal film notes — not from DigitalTruth chart */
export interface FilmEnrichment {
  film: string;
  boxSpeedIso: string;
  typicalEi: string;
  notes: string;
  updatedAt: string;
}

export type OutcomeDensity = "thin" | "ok" | "dense";
export type OutcomeGrain = "fine" | "ok" | "heavy";
export type OutcomeContrast = "flat" | "ok" | "punchy";
export type OutcomeScan = "flat" | "ok" | "needs-contrast";

export type LlmLanguage = "en" | "es";

/** Per-lookup-row annotations — not written to gold */
export interface CombinationWorkbookEntry {
  film: string;
  developer: string;
  format: string;
  iso: string;
  dilution: string;
  adjustedDevTime: string;
  adjustmentReason: string;
  outputGoal: OutputGoal | "";
  environmentNotes: string;
  workflowNotes: string;
  presoakOverride: string;
  rollsDeveloped: number;
  outcomeDensity: OutcomeDensity | "";
  outcomeGrain: OutcomeGrain | "";
  outcomeContrast: OutcomeContrast | "";
  outcomeScan: OutcomeScan | "";
  outcomeNotes: string;
  /** LLM executive summary — personal, client-side only */
  executiveSummary: string;
  executiveSummaryAt: string;
  executiveSummaryLanguage: LlmLanguage | "";
  updatedAt: string;
}

export type SessionCardSource = "chart" | "personal" | "search" | "unspecified";

/** Sink-ready session view — computed from chart + preferences + workbook */
export interface SessionCard {
  film: string;
  developer: string;
  format: string;
  iso: string;
  dilution: string;
  temperature: string | null;
  chartTimeMin: string;
  workingTimeMin: string;
  workingTimeIsPersonal: boolean;
  outputGoal: OutputGoal | null;
  volumes: {
    tankVolumeMl: number;
    developerMl: number;
    waterMl: number;
    dilutionLabel: string;
    computed: boolean;
    note?: string;
  };
  agitation: string;
  agitationSource: SessionCardSource;
  stopBath: string;
  presoak: string;
  presoakSource: SessionCardSource;
  chartNotes: string | null;
  rollsDeveloped: number;
  outcomeDensity: OutcomeDensity | "";
  outcomeGrain: OutcomeGrain | "";
  outcomeContrast: OutcomeContrast | "";
  outcomeScan: OutcomeScan | "";
  outcomeNotes: string | null;
}

/** Navigate to session card from Search or Library */
export interface SessionNavigationState {
  match?: DevelopingTimeItem;
  combination?: SavedCombination;
}

export interface UserLibraryExport {
  version: typeof LIBRARY_EXPORT_VERSION;
  exportedAt: string;
  savedCombinations: SavedCombination[];
  savedRecipes: SavedRecipe[];
  defaultRecipes: Record<string, DefaultRecipeEntry>;
  favoriteFilms: FavoriteEntry[];
  favoriteDevelopers: FavoriteEntry[];
  userPreferences: UserPreferences;
  filmPreferences: Record<string, FilmPreferencesOverride>;
  filmEnrichment: Record<string, FilmEnrichment>;
  combinationWorkbook: Record<string, CombinationWorkbookEntry>;
}

export interface DefaultRecipeEntry {
  film: string;
  developer: string;
  format: string;
  markdown: string;
  savedAt: string;
}

export interface FavoriteEntry {
  name: string;
  starred: boolean;
  lookupCount: number;
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
  language?: LlmLanguage | null;
}

export interface SessionSummaryRequest {
  film: string;
  developer: string;
  format: string;
  iso: string;
  dilution?: string | null;
  chart_time: string;
  working_time?: string | null;
  temperature?: string | null;
  output_goal?: string | null;
  developer_prep?: string | null;
  stop_bath?: string | null;
  agitation?: string | null;
  presoak?: string | null;
  chart_notes?: string | null;
  journal_context?: string | null;
  language?: LlmLanguage | null;
}

export interface SessionSummaryResponse {
  summary: string;
  prompt_version: string;
  llm_provider: string;
  llm_model: string;
  disclaimer: string;
  language: LlmLanguage;
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
  language?: LlmLanguage;
}

export interface ApiError {
  detail: string;
}

// --- UI domain types ---

export const SCRAPED_FORMATS = ["35mm", "120", "sheet"] as const;
export type ScrapedFormat = (typeof SCRAPED_FORMATS)[number];

export type RoutePath =
  | "/"
  | "/search"
  | "/compare"
  | "/session"
  | "/recipe"
  | "/explorer"
  | "/library"
  | "/preferences";

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
  styleTags: string[];
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
  styleTags: [],
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

/** Fields passed Search ← Compare or recent-query replay */
export type SearchPrefill = Pick<
  RecentQuery,
  "film" | "developer" | "format" | "iso" | "dilution"
>;

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
  /** Comma-separated developer names — parsed when used */
  preferredDevelopers: string;
  /** Total tank volume for dilution math (ml) */
  tankVolumeMl: string;
  /** Personal stop bath recipe — not from chart */
  stopBathRecipe: string;
  /** Default pre-soak when chart notes are silent */
  presoakDefault: string;
  /** LLM output language for recipes and session summaries */
  recipeLanguage: LlmLanguage;
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
  searchForm: SearchFormValues;
  forceGenerate?: boolean;
}

/** View a saved recipe from the library */
export interface SavedRecipeViewState {
  recipe: SavedRecipe;
}
