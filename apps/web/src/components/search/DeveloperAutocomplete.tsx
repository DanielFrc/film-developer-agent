import { filmApi } from "../../api/client";
import type { SearchResultItem } from "../../api/types";
import { Autocomplete } from "./Autocomplete";

interface DeveloperAutocompleteProps {
  query: string;
  selectedName: string | null;
  onQueryChange: (value: string) => void;
  onSelect: (item: SearchResultItem) => void;
  onClear: () => void;
}

export function DeveloperAutocomplete(props: DeveloperAutocompleteProps) {
  return (
    <Autocomplete
      label="Developer"
      placeholder="e.g. Rodinal"
      hint="Pick a canonical match from suggestions (min. 2 characters)."
      fetchSuggestions={(q) => filmApi.searchDevelopers(q)}
      {...props}
    />
  );
}
