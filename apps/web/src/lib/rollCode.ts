/** Short roll codes for physical notebook + scan filenames (YYMMDD-FILM-DEV). */

export interface RollCodeInput {
  film: string;
  developer: string;
  developedAt?: Date;
}

function padDatePart(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatRollDatePrefix(date: Date): string {
  const year = String(date.getFullYear()).slice(-2);
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());
  return `${year}${month}${day}`;
}

/** Build a compact film token from chart name (e.g. kentmere 400 → K400). */
export function filmToken(film: string): string {
  const words = film
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return "FILM";
  }

  let token = "";
  for (const word of words) {
    if (/\d/.test(word)) {
      token += word.replace(/[^a-z0-9]/g, "").toUpperCase();
    } else {
      token += word[0]?.toUpperCase() ?? "";
    }
  }

  return token.slice(0, 8) || "FILM";
}

/** First meaningful developer token (e.g. rodinal → RODI, d-76 → D76). */
export function developerToken(developer: string): string {
  const chunks = developer.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const cleaned = chunks.join("").toUpperCase();
  return cleaned.slice(0, 4) || "DEV";
}

export function suggestRollCode(input: RollCodeInput): string {
  const date = input.developedAt ?? new Date();
  return `${formatRollDatePrefix(date)}-${filmToken(input.film)}-${developerToken(input.developer)}`;
}
