import type { UserPreferences } from "../../api/types";
import { FormField, textareaClassName } from "../ui/FormField";

interface PreferencesFormFieldsProps {
  values: UserPreferences;
  onChange: (patch: Partial<UserPreferences>) => void;
  hints?: Partial<UserPreferences>;
  idPrefix?: string;
  showDarkroomSetup?: boolean;
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
  showDarkroomSetup = false,
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
          hints?.preferredDevelopers?.trim()
            ? `Global: ${hints.preferredDevelopers}`
            : "Separate with commas — e.g. rodinal, d-76, xtol"
        }
        value={values.preferredDevelopers}
        onChange={(event) => onChange({ preferredDevelopers: event.target.value })}
        placeholder="rodinal, d-76, xtol"
        id={`${idPrefix}-developers`}
      />

      {showDarkroomSetup ? (
        <>
          <FormField
            label="Tank volume (ml)"
            hint="Used to calculate developer + water from chart dilution."
            value={values.tankVolumeMl}
            onChange={(event) => onChange({ tankVolumeMl: event.target.value })}
            inputMode="numeric"
            placeholder="500"
            id={`${idPrefix}-tank-volume`}
          />
          <label className="block" htmlFor={`${idPrefix}-stop-bath`}>
            <span className="mb-1 block text-sm font-medium text-ink">Stop bath</span>
            <span className="mb-1 block text-xs text-muted">
              Your chemistry — not from DigitalTruth chart.
            </span>
            <textarea
              id={`${idPrefix}-stop-bath`}
              value={values.stopBathRecipe}
              onChange={(event) => onChange({ stopBathRecipe: event.target.value })}
              rows={2}
              className={textareaClassName}
              placeholder="e.g. 5% white vinegar, same volume as developer, ~30s"
            />
          </label>
          <FormField
            label="Default pre-soak"
            hint="Used on session cards when chart notes do not mention pre-soak."
            value={values.presoakDefault}
            onChange={(event) => onChange({ presoakDefault: event.target.value })}
            placeholder="e.g. No pre-soak"
            id={`${idPrefix}-presoak`}
          />
        </>
      ) : (
        <FormField
          label="Default pre-soak (override)"
          hint={hintFor(hints, "presoakDefault")}
          value={values.presoakDefault}
          onChange={(event) => onChange({ presoakDefault: event.target.value })}
          placeholder={hints?.presoakDefault?.trim() ? hints.presoakDefault : "Inherit global default"}
          id={`${idPrefix}-presoak`}
        />
      )}
    </>
  );
}
