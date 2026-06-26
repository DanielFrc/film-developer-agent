import type { RecipeRequest, SearchFormValues } from "../api/types";
import { buildExtraContext } from "./format";
import { buildStyleTagsContext } from "./styleTags";
import {
  buildPreferencesContext,
  buildWorkbookContext,
  getCombinationWorkbook,
  getEffectivePreferences,
} from "./userLibrary";

function mergeExtraContext(...parts: Array<string | undefined>): string | undefined {
  const merged = parts
    .flatMap((part) => (part ? [part] : []))
    .join(". ")
    .trim();
  return merged || undefined;
}

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
    "agitationMethod" | "styleTags" | "extraContext" | "isoNominal" | "isoExposed"
  >,
  forceRegenerate = false,
): RecipeRequest {
  const preferences = getEffectivePreferences(match.film);
  const workbook = getCombinationWorkbook(
    match.film,
    match.developer,
    match.format,
    match.iso,
    match.dilution,
  );
  const formContext = buildExtraContext(
    form.agitationMethod || preferences.agitationMethod,
    form.extraContext,
    form.isoNominal,
    form.isoExposed,
  );

  return {
    film: match.film,
    developer: match.developer,
    format: match.format,
    iso: match.iso,
    dilution: match.dilution ?? undefined,
    extra_context: mergeExtraContext(
      buildPreferencesContext(preferences),
      buildWorkbookContext(workbook),
      buildStyleTagsContext(form.styleTags),
      formContext,
    ),
    language: preferences.recipeLanguage,
    force_regenerate: forceRegenerate,
  };
}

export function buildPushPullHint(isoNominal: string, isoExposed: string): string | null {
  const nominal = isoNominal.trim();
  const exposed = isoExposed.trim();
  if (!nominal || !exposed || nominal === exposed) {
    return null;
  }
  return `Box speed ISO ${nominal} but exposed at ISO ${exposed}. Lookup uses EI ${exposed} — for push/pull, look up the chart time at your target ISO rather than calculating from one row.`;
}
