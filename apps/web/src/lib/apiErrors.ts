import { FilmApiError } from "../api/client";

export type ApiErrorContext = "lookup" | "recipe" | "explorer" | "stats" | "generic";

export interface ApiErrorView {
  message: string;
  hint?: string;
}

export function formatApiError(
  error: unknown,
  context: ApiErrorContext = "generic",
): ApiErrorView {
  if (!(error instanceof FilmApiError)) {
    return {
      message: error instanceof Error ? error.message : "Request failed",
    };
  }

  const detail = error.message;

  switch (error.status) {
    case 404:
      return {
        message: detail,
        hint:
          context === "lookup"
            ? "Adjust film, developer, ISO, or format. Select canonical names from autocomplete suggestions."
            : undefined,
      };
    case 409:
      return {
        message: detail,
        hint: "Multiple developing times match. Select a dilution in the lookup results, then generate the recipe.",
      };
    case 400:
      return {
        message: detail,
        hint: "Check your input fields and try again.",
      };
    case 502:
      return {
        message: detail,
        hint:
          context === "recipe"
            ? "Large Ollama models can take several minutes on first load. Increase OLLAMA_TIMEOUT in .env (e.g. 900) and restart film-api."
            : "Check your LLM provider configuration and try again.",
      };
    case 503:
      return {
        message: detail,
        hint: "Run the pipeline first: film-agent pipeline --skip-scrape",
      };
    default:
      return { message: detail };
  }
}
