import type { RecipeRequest, SearchFormValues } from "../api/types";
import { buildExtraContext } from "./format";

export function buildRecipeRequest(
  match: {
    film: string;
    developer: string;
    format: string;
    iso: string;
    dilution?: string | null;
  },
  form: Pick<
    SearchFormValues,
    "agitationMethod" | "extraContext" | "isoNominal" | "isoExposed"
  >,
  forceRegenerate = false,
): RecipeRequest {
  return {
    film: match.film,
    developer: match.developer,
    format: match.format,
    iso: match.iso,
    dilution: match.dilution ?? undefined,
    extra_context: buildExtraContext(
      form.agitationMethod,
      form.extraContext,
      form.isoNominal,
      form.isoExposed,
    ),
    force_regenerate: forceRegenerate,
  };
}
