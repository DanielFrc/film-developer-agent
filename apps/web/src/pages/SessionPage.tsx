import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import type { DevelopingTimeItem, SessionNavigationState, ScrapedFormat } from "../api/types";
import { filmApi } from "../api/client";
import { CombinationWorkbookPanel } from "../components/recipe/CombinationWorkbookPanel";
import { SessionCardPanel } from "../components/session/SessionCardPanel";
import { PageHeader } from "../components/layout/PageHeader";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { useRecipeNavigation } from "../hooks/useRecipeNavigation";
import { useUserLibrary } from "../hooks/useUserLibrary";
import { buildLookupResultView } from "../lib/lookup";
import { formatApiError, type ApiErrorView } from "../lib/apiErrors";
import { suggestRollCode } from "../lib/rollCode";
import { buildSessionCard, buildSessionSummaryRequest, matchFromSavedCombination } from "../lib/sessionCard";
import { DEFAULT_SEARCH_FORM } from "../api/types";
import {
  buildWorkbookContext,
  findMatchingRecipeId,
  getCombinationWorkbook,
  getEffectivePreferences,
  incrementWorkbookRolls,
  isExecutiveSummaryStale,
  saveWorkbookExecutiveSummary,
} from "../lib/userLibrary";

function resolveMatch(state: SessionNavigationState | null): DevelopingTimeItem | null {
  if (!state) return null;
  if (state.match) return state.match;
  if (state.combination) return matchFromSavedCombination(state.combination);
  return null;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function SessionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const navState = location.state as SessionNavigationState | null;
  const match = resolveMatch(navState);
  const { addCombination, addDevelopedRoll } = useUserLibrary();
  const navigateToRecipe = useRecipeNavigation();
  const [workbookRevision, setWorkbookRevision] = useState(0);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [showWorkbook, setShowWorkbook] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<ApiErrorView | null>(null);
  const [developedAt, setDevelopedAt] = useState(todayIsoDate);
  const [rollCode, setRollCode] = useState("");
  const [notebookRef, setNotebookRef] = useState("");
  const [rollLogged, setRollLogged] = useState(false);

  const workbook = useMemo(() => {
    if (!match) return null;
    return getCombinationWorkbook(
      match.film,
      match.developer,
      match.format,
      match.iso,
      match.dilution,
    );
  }, [match, workbookRevision]);

  const card = useMemo(() => {
    if (!match) return null;
    return buildSessionCard({
      match,
      preferences: getEffectivePreferences(match.film),
      workbook,
    });
  }, [match, workbook, workbookRevision]);

  const executiveSummary = workbook?.executiveSummary.trim() || null;
  const executiveSummaryStale = isExecutiveSummaryStale(workbook);

  useEffect(() => {
    if (!match) return;
    setRollLogged(false);
    const date = developedAt ? new Date(`${developedAt}T12:00:00`) : new Date();
    setRollCode(
      suggestRollCode({
        film: match.film,
        developer: match.developer,
        developedAt: Number.isNaN(date.getTime()) ? new Date() : date,
      }),
    );
  }, [match, developedAt]);

  if (!match || !card) {
    return <Navigate to="/search" replace />;
  }

  function handleSaveSession() {
    addCombination({
      film: match!.film,
      developer: match!.developer,
      format: match!.format,
      iso: match!.iso,
      dilution: match!.dilution ?? null,
      devTime: match!.dev_time,
    });
    setSessionSaved(true);
  }

  function handleRecordRoll() {
    incrementWorkbookRolls(match!);
    setWorkbookRevision((value) => value + 1);
  }

  function handleLogRoll() {
    const code = rollCode.trim();
    if (!code) return;

    addDevelopedRoll(
      {
        code,
        developedAt,
        film: match!.film,
        developer: match!.developer,
        format: match!.format,
        iso: match!.iso,
        dilution: match!.dilution?.trim() || "stock",
        chartTimeMin: card!.chartTimeMin,
        recipeId: findMatchingRecipeId(match!.film, match!.developer, match!.format),
        notebookRef,
      },
      match!,
    );
    setWorkbookRevision((value) => value + 1);
    setRollLogged(true);
  }

  function handleGenerateRecipe() {
    const lookup = buildLookupResultView(match!, { film: null, developer: null });
    navigateToRecipe(lookup, {
      ...DEFAULT_SEARCH_FORM,
      format: match!.format as ScrapedFormat,
      filmQuery: match!.film,
      filmSelected: match!.film,
      developerQuery: match!.developer,
      developerSelected: match!.developer,
      isoExposed: match!.iso,
      dilution: match!.dilution ?? "",
    });
  }

  async function handleGenerateSummary() {
    if (!card) return;
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const journalContext = buildWorkbookContext(workbook);
      const preferences = getEffectivePreferences(match!.film);
      const response = await filmApi.createSessionSummary(
        buildSessionSummaryRequest(card, journalContext, preferences.recipeLanguage),
      );
      saveWorkbookExecutiveSummary(match!, response.summary, response.language);
      setWorkbookRevision((value) => value + 1);
    } catch (err) {
      setSummaryError(formatApiError(err, "recipe"));
    } finally {
      setSummaryLoading(false);
    }
  }

  return (
    <div className="print:text-black">
      <PageHeader
        title="Session card"
        description="Chart times and tank volumes for the sink. Copy a roll code to your notebook — detailed notes stay on paper."
        className="print:hidden"
        action={
          <button
            type="button"
            className="text-sm text-muted underline hover:text-ink"
            onClick={() => navigate("/library")}
          >
            Back to library
          </button>
        }
      />

      <SessionCardPanel
        card={card}
        rollCode={rollCode}
        onRollCodeChange={setRollCode}
        developedAt={developedAt}
        onDevelopedAtChange={setDevelopedAt}
        notebookRef={notebookRef}
        onNotebookRefChange={setNotebookRef}
        onLogRoll={handleLogRoll}
        rollLogged={rollLogged}
        onSaveSession={handleSaveSession}
        onGenerateRecipe={handleGenerateRecipe}
        onGenerateSummary={handleGenerateSummary}
        onEditWorkbook={() => setShowWorkbook((value) => !value)}
        onRecordRoll={handleRecordRoll}
        sessionSaved={sessionSaved}
        executiveSummary={executiveSummary}
        executiveSummaryAt={workbook?.executiveSummaryAt || null}
        executiveSummaryLanguage={workbook?.executiveSummaryLanguage || ""}
        executiveSummaryStale={executiveSummaryStale}
        summaryLoading={summaryLoading}
        className="mb-6"
      />

      {summaryError ? (
        <div className="mb-6 print:hidden">
          <ErrorBanner
            message={summaryError.message}
            hint={summaryError.hint}
            onRetry={handleGenerateSummary}
          />
        </div>
      ) : null}

      {showWorkbook ? (
        <CombinationWorkbookPanel
          match={match}
          onSaved={() => {
            setWorkbookRevision((value) => value + 1);
            setSessionSaved(false);
          }}
        />
      ) : null}

      <p className="mt-4 text-sm text-muted print:hidden">
        Configure tank volume and stop bath in{" "}
        <Link to="/preferences" className="text-accent underline">
          Preferences
        </Link>
        . See{" "}
        <Link to="/library" className="text-accent underline">
          Developed rolls
        </Link>{" "}
        in Library lists logged rolls.
      </p>
    </div>
  );
}
