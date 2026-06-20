import { useNavigate } from "react-router-dom";
import type { LookupResultView, RecipeNavigationState, SearchFormValues } from "../api/types";
import { buildRecipeRequest } from "../lib/recipe";

export function useRecipeNavigation() {
  const navigate = useNavigate();

  return (lookup: LookupResultView, form: SearchFormValues) => {
    const state: RecipeNavigationState = {
      request: buildRecipeRequest(lookup.match, form),
      lookup,
    };
    navigate("/recipe", { state });
  };
}
