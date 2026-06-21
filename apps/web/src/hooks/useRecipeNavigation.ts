import { useNavigate } from "react-router-dom";
import type { LookupResultView, RecipeNavigationState, SearchFormValues } from "../api/types";
import { buildRecipeRequest } from "../lib/recipe";

export function useRecipeNavigation() {
  const navigate = useNavigate();

  return (
    lookup: LookupResultView,
    form: SearchFormValues,
    options?: { forceGenerate?: boolean },
  ) => {
    const state: RecipeNavigationState = {
      request: buildRecipeRequest(lookup.match, form, options?.forceGenerate ?? false),
      lookup,
      forceGenerate: options?.forceGenerate,
    };
    navigate("/recipe", { state });
  };
}
