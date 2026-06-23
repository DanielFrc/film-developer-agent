import type { SessionCard } from "../../api/types";
import { DATA_SOURCE_URL } from "../../lib/constants";
import { formatTemperature } from "../../lib/format";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface SessionCardPanelProps {
  card: SessionCard;
  onSaveSession?: () => void;
  onGenerateRecipe?: () => void;
  onEditWorkbook?: () => void;
  onRecordRoll?: () => void;
  sessionSaved?: boolean;
  className?: string;
}

const densityLabels = { thin: "Thin", ok: "OK", dense: "Dense" } as const;
const grainLabels = { fine: "Fine grain", ok: "OK", heavy: "Heavy grain" } as const;

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
  onSaveSession,
  onGenerateRecipe,
  onEditWorkbook,
  onRecordRoll,
  sessionSaved = false,
  className = "",
}: SessionCardPanelProps) {
  function handlePrint() {
    window.print();
  }

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
      </header>

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

      {card.outcomeDensity || card.outcomeGrain || card.outcomeNotes ? (
        <section className="mt-5 rounded-lg border border-border bg-surface-elevated/60 px-4 py-3">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Last results</h3>
            <Badge tone="warning">Your notes</Badge>
          </div>
          {card.outcomeDensity || card.outcomeGrain ? (
            <p className="text-sm text-ink">
              {card.outcomeDensity ? densityLabels[card.outcomeDensity] : null}
              {card.outcomeDensity && card.outcomeGrain ? " · " : null}
              {card.outcomeGrain ? grainLabels[card.outcomeGrain] : null}
            </p>
          ) : null}
          {card.outcomeNotes ? (
            <p className="mt-2 text-sm leading-6 text-ink">{card.outcomeNotes}</p>
          ) : null}
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
            Edit workbook notes
          </Button>
        ) : null}
        <Button type="button" variant="secondary" onClick={handlePrint}>
          Print card
        </Button>
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
