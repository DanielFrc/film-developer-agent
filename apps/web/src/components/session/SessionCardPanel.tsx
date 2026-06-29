import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { LlmLanguage, SessionCard } from "../../api/types";
import { DATA_SOURCE_URL } from "../../lib/constants";
import { formatTemperature } from "../../lib/format";
import { LLM_LANGUAGES } from "../../lib/llmLanguages";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { FormField, inputClassName } from "../ui/FormField";

interface SessionCardPanelProps {
  card: SessionCard;
  rollCode?: string;
  onRollCodeChange?: (value: string) => void;
  developedAt?: string;
  onDevelopedAtChange?: (value: string) => void;
  notebookRef?: string;
  onNotebookRefChange?: (value: string) => void;
  onLogRoll?: () => void;
  rollLogged?: boolean;
  onSaveSession?: () => void;
  onGenerateRecipe?: () => void;
  onGenerateSummary?: () => void;
  onEditWorkbook?: () => void;
  onRecordRoll?: () => void;
  sessionSaved?: boolean;
  executiveSummary?: string | null;
  executiveSummaryAt?: string | null;
  executiveSummaryLanguage?: LlmLanguage | "";
  executiveSummaryStale?: boolean;
  summaryLoading?: boolean;
  className?: string;
}

const densityLabels = { thin: "Thin", ok: "OK", dense: "Dense" } as const;
const grainLabels = { fine: "Fine grain", ok: "OK", heavy: "Heavy grain" } as const;
const contrastLabels = { flat: "Flat", ok: "OK", punchy: "Punchy" } as const;
const scanLabels = {
  flat: "Flat for scanning",
  ok: "Scans well",
  "needs-contrast": "Needs contrast in post",
} as const;

const sourceTone = {
  chart: "neutral" as const,
  personal: "warning" as const,
  search: "accent" as const,
  unspecified: "neutral" as const,
};

function sourceLabel(source: SessionCard["presoakSource"]): string {
  switch (source) {
    case "chart":
      return "From chart notes";
    case "personal":
      return "Your preference";
    case "search":
      return "From search form";
    default:
      return "Not specified";
  }
}

export function SessionCardPanel({
  card,
  rollCode = "",
  onRollCodeChange,
  developedAt = "",
  onDevelopedAtChange,
  notebookRef = "",
  onNotebookRefChange,
  onLogRoll,
  rollLogged = false,
  onSaveSession,
  onGenerateRecipe,
  onGenerateSummary,
  onEditWorkbook,
  onRecordRoll,
  sessionSaved = false,
  executiveSummary = null,
  executiveSummaryAt = null,
  executiveSummaryLanguage = "",
  executiveSummaryStale = false,
  summaryLoading = false,
  className = "",
}: SessionCardPanelProps) {
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  function handlePrint() {
    window.print();
  }

  async function handleCopyCode() {
    if (!rollCode.trim()) return;
    try {
      await navigator.clipboard.writeText(rollCode.trim());
      setCopyMessage("Copied");
      window.setTimeout(() => setCopyMessage(null), 2000);
    } catch {
      setCopyMessage("Copy failed");
    }
  }

  const summaryLanguageLabel =
    LLM_LANGUAGES.find((option) => option.code === executiveSummaryLanguage)?.label ?? null;
  const summarySavedLabel = executiveSummaryAt
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(executiveSummaryAt),
      )
    : null;

  return (
    <Card title="Session card" className={`session-card print:border-none print:shadow-none ${className}`}>
      <div className="mb-4 flex flex-wrap items-center gap-2 print:hidden">
        <Badge tone="success">Ready to develop</Badge>
        <Badge tone="neutral">{card.film}</Badge>
        <Badge tone="neutral">{`${card.developer} · ${card.dilution}`}</Badge>
      </div>

      <header className="session-card-header mb-4 hidden print:block">
        <h2 className="text-xl font-semibold text-ink">Development session</h2>
        <p className="text-sm text-muted">
          {card.film} · {card.developer} · {card.format} · ISO {card.iso} · {card.dilution}
        </p>
        {rollCode ? (
          <p className="mt-2 font-mono text-base font-semibold text-ink">Roll code: {rollCode}</p>
        ) : null}
      </header>

      {onLogRoll ? (
        <section className="session-roll-code mb-5 rounded-lg border border-border bg-surface-elevated/60 px-4 py-4 print:border-border print:bg-transparent">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Roll code</h3>
            <Badge tone="accent">Notebook + scans</Badge>
          </div>
          <p className="mb-3 text-sm text-muted print:hidden">
            Copy this code into your Midori notebook and use it when you export scans (e.g.{" "}
            <span className="font-mono text-ink">{rollCode || "CODE"}_001.tif</span>).
          </p>
          <div className="grid gap-3 sm:grid-cols-2 print:hidden">
            <FormField label="Code" htmlFor="roll-code">
              <input
                id="roll-code"
                className={inputClassName}
                value={rollCode}
                onChange={(event) => onRollCodeChange?.(event.target.value)}
              />
            </FormField>
            <FormField label="Developed on" htmlFor="developed-at">
              <input
                id="developed-at"
                type="date"
                className={inputClassName}
                value={developedAt}
                onChange={(event) => onDevelopedAtChange?.(event.target.value)}
              />
            </FormField>
            <FormField label="Notebook ref (optional)" htmlFor="notebook-ref" className="sm:col-span-2">
              <input
                id="notebook-ref"
                className={inputClassName}
                placeholder="Midori p. 42"
                value={notebookRef}
                onChange={(event) => onNotebookRefChange?.(event.target.value)}
              />
            </FormField>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 print:hidden">
            <Button type="button" variant="secondary" onClick={handleCopyCode}>
              Copy code
            </Button>
            <Button type="button" onClick={onLogRoll}>
              Log roll
            </Button>
            {copyMessage ? <span className="text-sm text-muted">{copyMessage}</span> : null}
            {rollLogged ? <span className="text-sm text-success">Logged to library</span> : null}
          </div>
        </section>
      ) : null}

      <dl className="grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Chart time</dt>
          <dd className="mt-1 text-2xl font-semibold text-ink">{card.chartTimeMin} min</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Your working time</dt>
          <dd className="mt-1 text-2xl font-semibold text-ink">{card.workingTimeMin} min</dd>
          {card.workingTimeIsPersonal ? (
            <p className="mt-1 text-xs text-muted">From your notes — not from chart</p>
          ) : card.outputGoal === "scan" ? (
            <p className="mt-1 text-xs text-muted">Set adjusted time in workbook for scanning</p>
          ) : null}
        </div>
        {card.outputGoal ? (
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Output goal</dt>
            <dd className="mt-1 text-sm font-medium capitalize text-ink">{card.outputGoal}</dd>
          </div>
        ) : null}
        {card.temperature ? (
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted">Temperature</dt>
            <dd className="mt-1 text-sm font-medium text-ink">
              {formatTemperature(card.temperature, "C")}
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Rolls developed</dt>
          <dd className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-2xl font-semibold text-ink">{card.rollsDeveloped}</span>
            {onRecordRoll ? (
              <Button type="button" variant="secondary" className="print:hidden" onClick={onRecordRoll}>
                +1 roll
              </Button>
            ) : null}
          </dd>
        </div>
      </dl>

      {card.outcomeDensity ||
      card.outcomeGrain ||
      card.outcomeContrast ||
      card.outcomeScan ||
      card.outcomeNotes ? (
        <section className="mt-5 rounded-lg border border-border bg-surface-elevated/60 px-4 py-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Combo notes</h3>
            <Badge tone="warning">Your notes</Badge>
          </div>
          {card.outcomeDensity ||
          card.outcomeGrain ||
          card.outcomeContrast ||
          card.outcomeScan ? (
            <p className="text-sm text-ink">
              {[
                card.outcomeDensity ? densityLabels[card.outcomeDensity] : null,
                card.outcomeGrain ? grainLabels[card.outcomeGrain] : null,
                card.outcomeContrast ? contrastLabels[card.outcomeContrast] : null,
                card.outcomeScan ? scanLabels[card.outcomeScan] : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          ) : null}
          {card.outcomeNotes ? (
            <p className="mt-2 text-sm leading-6 text-ink">{card.outcomeNotes}</p>
          ) : null}
        </section>
      ) : null}

      {executiveSummary ? (
        <section className="mt-5 rounded-lg border border-accent/30 bg-accent/5 px-4 py-4 print:border-border print:bg-transparent">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Executive summary
            </h3>
            <Badge tone="accent">LLM</Badge>
            {summarySavedLabel ? (
              <Badge tone="neutral">{`Saved ${summarySavedLabel}`}</Badge>
            ) : null}
            {summaryLanguageLabel ? (
              <Badge tone="neutral">{summaryLanguageLabel}</Badge>
            ) : null}
          </div>
          {executiveSummaryStale ? (
            <p className="mb-2 text-xs text-warning">
              Journal notes changed after this summary — regenerate for an updated brief.
            </p>
          ) : null}
          <div className="prose prose-sm max-w-none text-ink prose-headings:font-semibold prose-p:my-2 prose-ul:my-2">
            <ReactMarkdown>{executiveSummary}</ReactMarkdown>
          </div>
          <p className="mt-3 text-xs text-muted print:hidden">
            Saved with this combo in your library backup. Not a full recipe — verify all times
            independently.
          </p>
        </section>
      ) : null}

      <section className="mt-6 space-y-4 border-t border-border pt-5">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-ink">Developer preparation</h3>
            <Badge tone="neutral">{`${card.volumes.tankVolumeMl} ml tank`}</Badge>
          </div>
          <p className="text-sm text-ink">
            {card.volumes.dilutionLabel.toLowerCase() === "stock" ? (
              <>
                Pour <span className="font-semibold">{card.volumes.developerMl} ml</span> stock{" "}
                {card.developer} into the tank.
              </>
            ) : card.volumes.computed ? (
              <>
                <span className="font-semibold">{card.volumes.developerMl} ml</span> {card.developer}{" "}
                + <span className="font-semibold">{card.volumes.waterMl} ml</span> water (
                {card.volumes.dilutionLabel})
              </>
            ) : (
              <span className="text-muted">{card.volumes.note}</span>
            )}
          </p>
          {card.volumes.note && card.volumes.computed ? (
            <p className="mt-1 text-xs text-muted">{card.volumes.note}</p>
          ) : null}
        </div>

        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-ink">Stop bath</h3>
            <Badge tone={sourceTone.personal}>Your preference</Badge>
          </div>
          <p className="text-sm text-ink">{card.stopBath}</p>
        </div>

        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-ink">Agitation</h3>
            <Badge tone={sourceTone[card.agitationSource]}>{sourceLabel(card.agitationSource)}</Badge>
          </div>
          <p className="text-sm text-ink">{card.agitation}</p>
        </div>

        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-ink">Pre-soak</h3>
            <Badge tone={sourceTone[card.presoakSource]}>{sourceLabel(card.presoakSource)}</Badge>
          </div>
          <p className="text-sm text-ink">{card.presoak}</p>
        </div>
      </section>

      {card.chartNotes ? (
        <div className="mt-5 rounded-lg border border-border bg-surface-elevated/60 px-4 py-3 print:hidden">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Chart notes</h3>
          <p className="mt-2 text-sm leading-6 text-ink">{card.chartNotes}</p>
        </div>
      ) : null}

      <p className="mt-4 text-xs leading-5 text-muted print:mt-6">
        Chart reference:{" "}
        <a href={DATA_SOURCE_URL} target="_blank" rel="noreferrer" className="text-accent underline print:no-underline">
          DigitalTruth
        </a>
        . Verify chemistry and times before processing.
      </p>

      <div className="mt-5 flex flex-wrap gap-3 print:hidden">
        {onSaveSession ? (
          <Button type="button" variant="secondary" onClick={onSaveSession}>
            Save session
          </Button>
        ) : null}
        {onEditWorkbook ? (
          <Button type="button" variant="secondary" onClick={onEditWorkbook}>
            Edit combo tweaks
          </Button>
        ) : null}
        <Button type="button" variant="secondary" onClick={handlePrint}>
          Print card
        </Button>
        {onGenerateSummary ? (
          <Button
            type="button"
            variant="secondary"
            disabled={summaryLoading}
            onClick={onGenerateSummary}
          >
            {summaryLoading ? "Summarizing…" : executiveSummary ? "Regenerate summary" : "Executive summary (LLM)"}
          </Button>
        ) : null}
        {onGenerateRecipe ? (
          <Button type="button" onClick={onGenerateRecipe}>
            Full recipe (LLM)
          </Button>
        ) : null}
        {sessionSaved ? <span className="self-center text-sm text-success">Saved to library</span> : null}
      </div>
    </Card>
  );
}
