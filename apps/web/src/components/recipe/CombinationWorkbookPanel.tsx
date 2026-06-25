import { FormEvent, useEffect, useState } from "react";
import type {
  CombinationWorkbookEntry,
  DevelopingTimeItem,
  OutcomeContrast,
  OutcomeDensity,
  OutcomeGrain,
  OutcomeScan,
  OutputGoal,
} from "../../api/types";
import {
  getCombinationWorkbook,
  removeCombinationWorkbook,
  saveCombinationWorkbook,
} from "../../lib/userLibrary";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { FormField, selectClassName, textareaClassName } from "../ui/FormField";

const OUTPUT_GOALS: { value: OutputGoal | ""; label: string }[] = [
  { value: "", label: "Not specified" },
  { value: "print", label: "Print" },
  { value: "scan", label: "Scan" },
  { value: "both", label: "Print & scan" },
];

const DENSITY_OPTIONS: { value: OutcomeDensity | ""; label: string }[] = [
  { value: "", label: "Not rated" },
  { value: "thin", label: "Too thin" },
  { value: "ok", label: "OK" },
  { value: "dense", label: "Too dense" },
];

const GRAIN_OPTIONS: { value: OutcomeGrain | ""; label: string }[] = [
  { value: "", label: "Not rated" },
  { value: "fine", label: "Fine" },
  { value: "ok", label: "OK" },
  { value: "heavy", label: "Heavy" },
];

const CONTRAST_OPTIONS: { value: OutcomeContrast | ""; label: string }[] = [
  { value: "", label: "Not rated" },
  { value: "flat", label: "Flat" },
  { value: "ok", label: "OK" },
  { value: "punchy", label: "Punchy" },
];

const SCAN_OPTIONS: { value: OutcomeScan | ""; label: string }[] = [
  { value: "", label: "Not rated" },
  { value: "flat", label: "Flat for scanning" },
  { value: "ok", label: "Scans well" },
  { value: "needs-contrast", label: "Needs contrast in post" },
];

function emptyDraft(match: DevelopingTimeItem): Omit<CombinationWorkbookEntry, "updatedAt"> {
  return {
    film: match.film,
    developer: match.developer,
    format: match.format,
    iso: match.iso,
    dilution: match.dilution ?? "stock",
    adjustedDevTime: "",
    adjustmentReason: "",
    outputGoal: "",
    environmentNotes: "",
    workflowNotes: "",
    presoakOverride: "",
    rollsDeveloped: 0,
    outcomeDensity: "",
    outcomeGrain: "",
    outcomeContrast: "",
    outcomeScan: "",
    outcomeNotes: "",
    executiveSummary: "",
    executiveSummaryAt: "",
    executiveSummaryLanguage: "",
  };
}

function toDraft(entry: CombinationWorkbookEntry): Omit<CombinationWorkbookEntry, "updatedAt"> {
  return {
    film: entry.film,
    developer: entry.developer,
    format: entry.format,
    iso: entry.iso,
    dilution: entry.dilution,
    adjustedDevTime: entry.adjustedDevTime,
    adjustmentReason: entry.adjustmentReason,
    outputGoal: entry.outputGoal,
    environmentNotes: entry.environmentNotes,
    workflowNotes: entry.workflowNotes,
    presoakOverride: entry.presoakOverride,
    rollsDeveloped: entry.rollsDeveloped,
    outcomeDensity: entry.outcomeDensity,
    outcomeGrain: entry.outcomeGrain,
    outcomeContrast: entry.outcomeContrast,
    outcomeScan: entry.outcomeScan,
    outcomeNotes: entry.outcomeNotes,
    executiveSummary: "",
    executiveSummaryAt: "",
    executiveSummaryLanguage: "",
  };
}

interface CombinationWorkbookPanelProps {
  match: DevelopingTimeItem;
  onSaved?: () => void;
  onRegenerateWithNotes?: () => void;
  regenerateLoading?: boolean;
  className?: string;
}

export function CombinationWorkbookPanel({
  match,
  onSaved,
  onRegenerateWithNotes,
  regenerateLoading = false,
  className = "",
}: CombinationWorkbookPanelProps) {
  const [draft, setDraft] = useState(() => {
    const existing = getCombinationWorkbook(
      match.film,
      match.developer,
      match.format,
      match.iso,
      match.dilution,
    );
    return existing ? toDraft(existing) : emptyDraft(match);
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = getCombinationWorkbook(
      match.film,
      match.developer,
      match.format,
      match.iso,
      match.dilution,
    );
    setDraft(existing ? toDraft(existing) : emptyDraft(match));
  }, [match]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    saveCombinationWorkbook(draft);
    setSaved(true);
    onSaved?.();
    window.setTimeout(() => setSaved(false), 2000);
  }

  function handleClear() {
    removeCombinationWorkbook(
      match.film,
      match.developer,
      match.format,
      match.iso,
      match.dilution,
    );
    setDraft(emptyDraft(match));
    onSaved?.();
  }

  return (
    <Card title="Development journal" className={className}>
      <div className="mb-4 space-y-2">
        <Badge tone="warning">Your annotations — not from chart</Badge>
        <p className="text-sm text-muted">
          Chart developing time:{" "}
          <span className="font-medium text-ink">{match.dev_time} min</span>
          {draft.adjustedDevTime ? (
            <>
              {" "}
              · Your working time:{" "}
              <span className="font-medium text-ink">{draft.adjustedDevTime} min</span>
            </>
          ) : null}
          {draft.rollsDeveloped > 0 ? (
            <>
              {" "}
              · Rolls developed:{" "}
              <span className="font-medium text-ink">{draft.rollsDeveloped}</span>
            </>
          ) : null}
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormField
          label="Your working dev time (minutes)"
          hint="For your workflow only — LLM prompt still anchors to chart time."
          value={draft.adjustedDevTime}
          onChange={(event) => setDraft((c) => ({ ...c, adjustedDevTime: event.target.value }))}
          placeholder="e.g. 13.5"
        />
        <FormField
          label="Why adjust?"
          value={draft.adjustmentReason}
          onChange={(event) => setDraft((c) => ({ ...c, adjustmentReason: event.target.value }))}
          placeholder="e.g. hot weather, optimize for scanning"
        />
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">Output goal</span>
          <select
            value={draft.outputGoal}
            onChange={(event) =>
              setDraft((c) => ({ ...c, outputGoal: event.target.value as OutputGoal | "" }))
            }
            className={selectClassName}
          >
            {OUTPUT_GOALS.map((option) => (
              <option key={option.label} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <FormField
          label="Environment"
          value={draft.environmentNotes}
          onChange={(event) => setDraft((c) => ({ ...c, environmentNotes: event.target.value }))}
          placeholder="Water temp, season…"
        />
        <FormField
          label="Pre-soak (this combo)"
          hint="Overrides global default when set — not from chart."
          value={draft.presoakOverride}
          onChange={(event) => setDraft((c) => ({ ...c, presoakOverride: event.target.value }))}
          placeholder="e.g. 1 min in water at 20°C"
        />
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-ink">Workflow notes</span>
          <textarea
            value={draft.workflowNotes}
            onChange={(event) => setDraft((c) => ({ ...c, workflowNotes: event.target.value }))}
            rows={3}
            className={textareaClassName}
            placeholder="Stand development tweaks, scanning-oriented agitation…"
          />
        </label>

        <div className="rounded-lg border border-border px-4 py-4">
          <h4 className="mb-1 text-sm font-semibold text-ink">After developing</h4>
          <p className="mb-3 text-xs text-muted">
            Log results from your last roll — feeds Regenerate with notes and your session card.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">Negative density</span>
              <select
                value={draft.outcomeDensity}
                onChange={(event) =>
                  setDraft((c) => ({ ...c, outcomeDensity: event.target.value as OutcomeDensity | "" }))
                }
                className={selectClassName}
              >
                {DENSITY_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">Grain</span>
              <select
                value={draft.outcomeGrain}
                onChange={(event) =>
                  setDraft((c) => ({ ...c, outcomeGrain: event.target.value as OutcomeGrain | "" }))
                }
                className={selectClassName}
              >
                {GRAIN_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">Contrast</span>
              <select
                value={draft.outcomeContrast}
                onChange={(event) =>
                  setDraft((c) => ({
                    ...c,
                    outcomeContrast: event.target.value as OutcomeContrast | "",
                  }))
                }
                className={selectClassName}
              >
                {CONTRAST_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2 lg:col-span-3">
              <span className="mb-1 block text-sm font-medium text-ink">Scan result</span>
              <select
                value={draft.outcomeScan}
                onChange={(event) =>
                  setDraft((c) => ({ ...c, outcomeScan: event.target.value as OutcomeScan | "" }))
                }
                className={selectClassName}
              >
                {SCAN_OPTIONS.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="mt-4 block">
            <span className="mb-1 block text-sm font-medium text-ink">Journal notes</span>
            <textarea
              value={draft.outcomeNotes}
              onChange={(event) => setDraft((c) => ({ ...c, outcomeNotes: event.target.value }))}
              rows={3}
              className={textareaClassName}
              placeholder="e.g. Roll 3 too dense for scanning — pull 30s next time"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit">Save journal</Button>
          <Button type="button" variant="secondary" onClick={handleClear}>
            Clear
          </Button>
          {onRegenerateWithNotes ? (
            <Button
              type="button"
              variant="secondary"
              disabled={regenerateLoading}
              onClick={onRegenerateWithNotes}
            >
              Regenerate with notes
            </Button>
          ) : null}
          {saved ? <span className="self-center text-sm text-success">Saved</span> : null}
        </div>
      </form>
      <p className="mt-3 text-xs leading-5 text-muted">
        You are responsible for verifying adjusted times. The chart value remains the authoritative
        lookup reference.
      </p>
    </Card>
  );
}
