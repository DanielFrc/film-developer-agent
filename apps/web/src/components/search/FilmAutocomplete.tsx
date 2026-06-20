import { filmApi } from "../../api/client";
import type { SearchResultItem } from "../../api/types";
import { Autocomplete } from "./Autocomplete";

interface FilmAutocompleteProps {
  query: string;
  selectedName: string | null;
  onQueryChange: (value: string) => void;
  onSelect: (item: SearchResultItem) => void;
  onClear: () => void;
}

export function FilmAutocomplete(props: FilmAutocompleteProps) {
  return (
    <Autocomplete
      label="Film stock"
      placeholder="e.g. Ilford HP5 Plus"
      hint="Pick a canonical match from suggestions (min. 2 characters)."
      fetchSuggestions={(q) => filmApi.searchFilms(q)}
      {...props}
    />
  );
}
