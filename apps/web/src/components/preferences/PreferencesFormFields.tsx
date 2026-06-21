import type { UserPreferences } from "../../api/types";
import { FormField, textareaClassName } from "../ui/FormField";

interface PreferencesFormFieldsProps {
  values: UserPreferences;
  onChange: (patch: Partial<UserPreferences>) => void;
  hints?: Partial<UserPreferences>;
  idPrefix?: string;
}

function hintFor(hints: Partial<UserPreferences> | undefined, key: keyof UserPreferences): string | undefined {
  if (!hints) return undefined;
  const value = hints[key];
  if (Array.isArray(value)) {
    return value.length ? `Global: ${value.join(", ")}` : undefined;
  }
  return value?.trim() ? `Global: ${value.trim()}` : undefined;
}

export function PreferencesFormFields({
  values,
  onChange,
  hints,
  idPrefix = "pref",
}: PreferencesFormFieldsProps) {
  return (
    <>
      <FormField
        label="Camera"
        hint={hintFor(hints, "camera")}
        value={values.camera}
        onChange={(event) => onChange({ camera: event.target.value })}
        placeholder={hints?.camera?.trim() ? hints.camera : "e.g. Pentax 67, Leica M6"}
        id={`${idPrefix}-camera`}
      />
      <FormField
        label="Agitation"
        hint={hintFor(hints, "agitationMethod")}
        value={values.agitationMethod}
        onChange={(event) => onChange({ agitationMethod: event.target.value })}
        placeholder={hints?.agitationMethod?.trim() ? hints.agitationMethod : "e.g. 10s every minute"}
        id={`${idPrefix}-agitation`}
      />
      <label className="block" htmlFor={`${idPrefix}-style`}>
        <span className="mb-1 block text-sm font-medium text-ink">Style / look notes</span>
        {hints?.styleNotes?.trim() ? (
          <span className="mb-1 block text-xs text-muted">Global: {hints.styleNotes}</span>
        ) : null}
        <textarea
          id={`${idPrefix}-style`}
          value={values.styleNotes}
          onChange={(event) => onChange({ styleNotes: event.target.value })}
          rows={4}
          className={textareaClassName}
          placeholder="e.g. high contrast street photography, fine grain portraits"
        />
      </label>
      <FormField
        label="Preferred developers"
        hint={
          hints?.preferredDevelopers?.length
            ? `Global: ${hints.preferredDevelopers.join(", ")}`
            : "Comma-separated canonical names — used as hints only."
        }
        value={values.preferredDevelopers.join(", ")}
        onChange={(event) =>
          onChange({
            preferredDevelopers: event.target.value
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
          })
        }
        placeholder="rodinal, d-76, xtol"
        id={`${idPrefix}-developers`}
      />
    </>
  );
}
