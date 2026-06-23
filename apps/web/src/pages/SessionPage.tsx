import { useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import type { DevelopingTimeItem, SessionNavigationState, ScrapedFormat } from "../api/types";
import { CombinationWorkbookPanel } from "../components/recipe/CombinationWorkbookPanel";
import { SessionCardPanel } from "../components/session/SessionCardPanel";
import { PageHeader } from "../components/layout/PageHeader";
import { useRecipeNavigation } from "../hooks/useRecipeNavigation";
import { useUserLibrary } from "../hooks/useUserLibrary";
import { buildLookupResultView } from "../lib/lookup";
import { buildSessionCard, matchFromSavedCombination } from "../lib/sessionCard";
import { DEFAULT_SEARCH_FORM } from "../api/types";
import {
  getCombinationWorkbook,
  getEffectivePreferences,
  incrementWorkbookRolls,
} from "../lib/userLibrary";

function resolveMatch(state: SessionNavigationState | null): DevelopingTimeItem | null {
  if (!state) return null;
  if (state.match) return state.match;
  if (state.combination) return matchFromSavedCombination(state.combination);
  return null;
}

export function SessionPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const navState = location.state as SessionNavigationState | null;
  const match = resolveMatch(navState);
  const { addCombination } = useUserLibrary();
  const navigateToRecipe = useRecipeNavigation();
  const [workbookRevision, setWorkbookRevision] = useState(0);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [showWorkbook, setShowWorkbook] = useState(false);

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

  return (
    <div className="print:text-black">
      <PageHeader
        title="Session card"
        description="Sink-ready checklist from chart data and your preferences — no LLM required."
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
        onSaveSession={handleSaveSession}
        onGenerateRecipe={handleGenerateRecipe}
        onEditWorkbook={() => setShowWorkbook((value) => !value)}
        onRecordRoll={handleRecordRoll}
        sessionSaved={sessionSaved}
        className="mb-6"
      />

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
        .
      </p>
    </div>
  );
}
