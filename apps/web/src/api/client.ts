import type {
  ApiError,
  DatasetStatsResponse,
  DevelopingTimeItem,
  ExplorerSchemaResponse,
  FormatItem,
  HealthResponse,
  PaginatedExplorerResult,
  RecipeRequest,
  RecipeResponse,
  SearchResultItem,
} from "./types";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "/api";

export class FilmApiError extends Error {
  status: number;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = "FilmApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const payload = (await response.json()) as ApiError;
      if (typeof payload.detail === "string") {
        detail = payload.detail;
      }
    } catch {
      // keep statusText
    }
    throw new FilmApiError(response.status, detail);
  }

  return (await response.json()) as T;
}

function queryString(params: Record<string, string | number | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const encoded = search.toString();
  return encoded ? `?${encoded}` : "";
}

export const filmApi = {
  health(): Promise<HealthResponse> {
    return request<HealthResponse>("/health");
  },

  searchFilms(q: string, limit = 10): Promise<SearchResultItem[]> {
    return request<SearchResultItem[]>(`/films${queryString({ q, limit })}`);
  },

  searchDevelopers(q: string, limit = 10): Promise<SearchResultItem[]> {
    return request<SearchResultItem[]>(`/developers${queryString({ q, limit })}`);
  },

  listFormats(): Promise<FormatItem[]> {
    return request<FormatItem[]>("/formats");
  },

  getStats(): Promise<DatasetStatsResponse> {
    return request<DatasetStatsResponse>("/stats");
  },

  getDevelopingTimes(params: {
    film: string;
    developer: string;
    format: string;
    iso: string;
    dilution?: string | null;
  }): Promise<DevelopingTimeItem[]> {
    return request<DevelopingTimeItem[]>(
      `/developing-times${queryString(params)}`,
    );
  },

  createRecipe(body: RecipeRequest): Promise<RecipeResponse> {
    return request<RecipeResponse>("/recipes", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  getExplorerSchema(layer: string): Promise<ExplorerSchemaResponse> {
    return request<ExplorerSchemaResponse>(`/explorer/schema${queryString({ layer })}`);
  },

  getExplorerData(params: {
    layer: string;
    page?: number;
    page_size?: number;
    film?: string;
    developer?: string;
    iso?: string;
  }): Promise<PaginatedExplorerResult> {
    return request<PaginatedExplorerResult>(`/explorer/data${queryString(params)}`);
  },
};
