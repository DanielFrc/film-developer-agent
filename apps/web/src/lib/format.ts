export function formatNumber(value: number): string {
  return new Intl.NumberFormat().format(value);
}

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32;
}

export function formatTemperature(
  temp: string | null | undefined,
  unit: "C" | "F",
): string {
  if (!temp) {
    return "n/a";
  }
  const parsed = Number.parseFloat(temp);
  if (Number.isNaN(parsed)) {
    return `${temp}°${unit}`;
  }
  if (unit === "F") {
    return `${celsiusToFahrenheit(parsed).toFixed(1)}°F`;
  }
  return `${parsed}°C`;
}

export function confidenceFromScore(score: number): "high" | "medium" | "low" {
  if (score >= 90) return "high";
  if (score >= 70) return "medium";
  return "low";
}

export function buildExtraContext(
  agitation: string,
  extra: string,
  isoNominal: string,
  isoExposed: string,
): string | undefined {
  const parts: string[] = [];
  if (agitation.trim()) {
    parts.push(`Agitation: ${agitation.trim()}`);
  }
  if (isoNominal.trim() && isoNominal.trim() !== isoExposed.trim()) {
    parts.push(`Box speed ISO ${isoNominal.trim()}, exposed at ISO ${isoExposed.trim()}`);
  }
  if (extra.trim()) {
    parts.push(extra.trim());
  }
  return parts.length ? parts.join(". ") : undefined;
}
