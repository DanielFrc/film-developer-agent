import type { FormEvent } from "react";
import type { FormatItem, SearchFormValues, ScrapedFormat } from "../../api/types";
import { COMMON_ISO_VALUES } from "../../lib/constants";
import { RECIPE_STYLE_TAGS } from "../../lib/styleTags";
import { Button } from "../ui/Button";
import { FormField, selectClassName, textareaClassName } from "../ui/FormField";
import { TagChipGroup } from "../ui/TagChipGroup";
import { FilmAutocomplete } from "./FilmAutocomplete";
import { DeveloperAutocomplete } from "./DeveloperAutocomplete";

interface SearchFormProps {
  values: SearchFormValues;
  formats: FormatItem[];
  formatsLoading?: boolean;
  loading: boolean;
  onChange: (patch: Partial<SearchFormValues>) => void;
  onSubmit: () => void;
  onFilmSelect?: (item: { name: string; score: number }) => Partial<SearchFormValues>;
}

function formatLabel(item: FormatItem): string {
  if (item.description) {
    return `${item.format} — ${item.description}`;
  }
  return item.format;
}

export function SearchForm({
  values,
  formats,
  formatsLoading = false,
  loading,
  onChange,
  onSubmit,
  onFilmSelect,
}: SearchFormProps) {
  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <FilmAutocomplete
          query={values.filmQuery}
          selectedName={values.filmSelected}
          onQueryChange={(filmQuery) =>
            onChange({ filmQuery, filmSelected: null, filmScore: null })
          }
          onSelect={(item) =>
            onChange(
              onFilmSelect?.(item) ?? {
                filmQuery: item.name,
                filmSelected: item.name,
                filmScore: item.score,
              },
            )
          }
          onClear={() =>
            onChange({ filmQuery: "", filmSelected: null, filmScore: null })
          }
        />
        <DeveloperAutocomplete
          query={values.developerQuery}
          selectedName={values.developerSelected}
          onQueryChange={(developerQuery) =>
            onChange({ developerQuery, developerSelected: null, developerScore: null })
          }
          onSelect={(item) =>
            onChange({
              developerQuery: item.name,
              developerSelected: item.name,
              developerScore: item.score,
            })
          }
          onClear={() =>
            onChange({ developerQuery: "", developerSelected: null, developerScore: null })
          }
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <FormField label="ISO nominal (box speed)" hint="Optional — used in recipe context.">
          <input
            type="text"
            inputMode="numeric"
            list="iso-options"
            value={values.isoNominal}
            onChange={(e) => onChange({ isoNominal: e.target.value })}
            placeholder="e.g. 400"
            className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm"
          />
        </FormField>
        <FormField label="ISO exposed (EI)" hint="Sent to lookup API.">
          <input
            type="text"
            inputMode="numeric"
            list="iso-options"
            value={values.isoExposed}
            onChange={(e) => onChange({ isoExposed: e.target.value })}
            placeholder="e.g. 400"
            className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm"
            required
          />
        </FormField>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">Format</span>
          <select
            value={values.format}
            onChange={(e) => onChange({ format: e.target.value as ScrapedFormat })}
            className={selectClassName}
            disabled={formatsLoading}
          >
            {formats.map((item) => (
              <option key={item.format} value={item.format}>
                {formatLabel(item)}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-xs text-muted">
            {formatsLoading ? "Loading formats from API…" : "From gold format catalog (scraped formats only)."}
          </span>
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">Temperature unit</span>
          <select
            value={values.temperatureUnit}
            onChange={(e) =>
              onChange({ temperatureUnit: e.target.value as "C" | "F" })
            }
            className={selectClassName}
          >
            <option value="C">Celsius</option>
            <option value="F">Fahrenheit</option>
          </select>
        </label>
      </div>

      <datalist id="iso-options">
        {COMMON_ISO_VALUES.map((iso) => (
          <option key={iso} value={iso} />
        ))}
      </datalist>

      <TagChipGroup
        label="Recipe style tags"
        hint="Optional — shapes tone and workflow in the generated recipe (chart time stays fixed)."
        options={RECIPE_STYLE_TAGS}
        selected={values.styleTags}
        onChange={(styleTags) => onChange({ styleTags })}
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <FormField
          label="Agitation method"
          hint="Optional — included in recipe extra context."
          value={values.agitationMethod}
          onChange={(e) => onChange({ agitationMethod: e.target.value })}
          placeholder="e.g. stand development, 30s every minute"
        />
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">Extra context</span>
          <textarea
            value={values.extraContext}
            onChange={(e) => onChange({ extraContext: e.target.value })}
            placeholder="e.g. grainy look, push one stop"
            rows={3}
            className={textareaClassName}
          />
          <span className="mt-1 block text-xs text-muted">
            Photographer preferences for recipe generation.
          </span>
        </label>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Looking up…" : "Look up developing time"}
        </Button>
      </div>
    </form>
  );
}
