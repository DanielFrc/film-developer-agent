import type {
  CombinationWorkbookEntry,
  DevelopingTimeItem,
  SessionCard,
  SessionCardSource,
  UserPreferences,
} from "../api/types";
import { computeDilutionVolumes } from "./dilution";

const PRESOAK_PATTERN = /pre[-\s]?soak/i;

function extractPresoakFromNotes(notes: string | null | undefined): string | null {
  if (!notes?.trim()) return null;
  if (!PRESOAK_PATTERN.test(notes)) return null;

  const sentences = notes
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const presoakSentence = sentences.find((sentence) => PRESOAK_PATTERN.test(sentence));
  return presoakSentence ?? notes.trim();
}

export interface BuildSessionCardInput {
  match: DevelopingTimeItem;
  preferences: UserPreferences;
  workbook?: CombinationWorkbookEntry | null;
  agitationOverride?: string;
}

export function buildSessionCard({
  match,
  preferences,
  workbook,
  agitationOverride,
}: BuildSessionCardInput): SessionCard {
  const chartTimeMin = match.dev_time;
  const workingTimeMin = workbook?.adjustedDevTime.trim() || chartTimeMin;
  const workingTimeIsPersonal = Boolean(workbook?.adjustedDevTime.trim());

  const volumes = computeDilutionVolumes(match.dilution, preferences.tankVolumeMl);

  const chartPresoak = extractPresoakFromNotes(match.notes);
  const workbookPresoak = workbook?.presoakOverride?.trim();
  const defaultPresoak = preferences.presoakDefault.trim();

  let presoak = "Not specified";
  let presoakSource: SessionCardSource = "unspecified";

  if (workbookPresoak) {
    presoak = workbookPresoak;
    presoakSource = "personal";
  } else if (chartPresoak) {
    presoak = chartPresoak;
    presoakSource = "chart";
  } else if (defaultPresoak) {
    presoak = defaultPresoak;
    presoakSource = "personal";
  }

  const agitation =
    agitationOverride?.trim() ||
    preferences.agitationMethod.trim() ||
    "Not set — add in Preferences";

  const stopBath =
    preferences.stopBathRecipe.trim() ||
    "Not set — add your stop bath in Preferences";

  const outputGoal = workbook?.outputGoal || null;

  return {
    film: match.film,
    developer: match.developer,
    format: match.format,
    iso: match.iso,
    dilution: match.dilution || "stock",
    temperature: match.temp ?? null,
    chartTimeMin,
    workingTimeMin,
    workingTimeIsPersonal,
    outputGoal,
    volumes,
    agitation,
    agitationSource: agitationOverride?.trim() ? "search" : preferences.agitationMethod.trim() ? "personal" : "unspecified",
    stopBath,
    presoak,
    presoakSource,
    chartNotes: match.notes ?? null,
    rollsDeveloped: workbook?.rollsDeveloped ?? 0,
    outcomeDensity: workbook?.outcomeDensity ?? "",
    outcomeGrain: workbook?.outcomeGrain ?? "",
    outcomeNotes: workbook?.outcomeNotes?.trim() || null,
  };
}

export function matchFromSavedCombination(item: {
  film: string;
  developer: string;
  format: string;
  iso: string;
  dilution: string | null;
  devTime: string | null;
}): DevelopingTimeItem {
  return {
    film: item.film,
    developer: item.developer,
    format: item.format,
    iso: item.iso,
    dilution: item.dilution,
    dev_time: item.devTime ?? "",
    temp: null,
    notes: null,
  };
}
