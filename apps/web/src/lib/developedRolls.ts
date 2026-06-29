import type { DevelopedRoll, DevelopingTimeItem } from "../api/types";

export function developedRollToMatch(roll: DevelopedRoll): DevelopingTimeItem {
  return {
    film: roll.film,
    developer: roll.developer,
    format: roll.format,
    iso: roll.iso,
    dilution: roll.dilution === "stock" ? null : roll.dilution,
    dev_time: roll.chartTimeMin ?? "",
  };
}

export function formatDevelopedDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(parsed);
}
