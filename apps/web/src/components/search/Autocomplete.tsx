import { useEffect, useId, useRef, useState } from "react";
import type { SearchResultItem } from "../../api/types";
import { useDebounce } from "../../hooks/useDebounce";
import { SEARCH_DEBOUNCE_MS } from "../../lib/constants";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface AutocompleteProps {
  label: string;
  placeholder: string;
  query: string;
  selectedName: string | null;
  onQueryChange: (value: string) => void;
  onSelect: (item: SearchResultItem) => void;
  onClear: () => void;
  fetchSuggestions: (query: string) => Promise<SearchResultItem[]>;
  hint?: string;
}

export function Autocomplete({
  label,
  placeholder,
  query,
  selectedName,
  onQueryChange,
  onSelect,
  onClear,
  fetchSuggestions,
  hint,
}: AutocompleteProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(query, SEARCH_DEBOUNCE_MS);
  const [suggestions, setSuggestions] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedName && query === selectedName) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    if (debouncedQuery.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchSuggestions(debouncedQuery)
      .then((results) => {
        if (cancelled) return;
        setSuggestions(results);
        setOpen(results.length > 0);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Search failed");
        setSuggestions([]);
        setOpen(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, fetchSuggestions, query, selectedName]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-1 block text-sm font-medium text-ink">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 pr-16 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          onChange={(event) => {
            onQueryChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length) setOpen(true);
          }}
        />
        {selectedName ? (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-ink"
            onClick={onClear}
          >
            Clear
          </button>
        ) : null}
      </div>
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
      {loading ? (
        <div className="mt-2">
          <LoadingSpinner label="Searching…" />
        </div>
      ) : null}
      {error ? <p className="mt-2 text-xs text-warning">{error}</p> : null}
      {open && suggestions.length ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-surface-elevated py-1 shadow-lg"
        >
          {suggestions.map((item) => (
            <li key={item.name} role="option">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-accent-soft"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onSelect(item);
                  setOpen(false);
                }}
              >
                <span>
                  <span className="font-medium text-ink">{item.name}</span>
                  {item.value ? (
                    <span className="ml-2 text-xs text-muted">{item.value}</span>
                  ) : null}
                </span>
                <span className="text-xs text-muted">{item.score.toFixed(0)}%</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
