export interface DilutionVolumes {
  tankVolumeMl: number;
  developerMl: number;
  waterMl: number;
  dilutionLabel: string;
  computed: boolean;
  note?: string;
}

const RATIO_PATTERN = /^(\d+(?:\.\d+)?)\s*[+:]\s*(\d+(?:\.\d+)?)$/i;

function parseTankVolumeMl(value: string): number {
  const parsed = Number.parseInt(value.trim(), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 500;
  }
  return parsed;
}

export function parseDilutionRatio(dilution: string): { developerParts: number; waterParts: number } | null {
  const normalized = dilution.trim().toLowerCase();
  if (!normalized || normalized === "stock") {
    return null;
  }

  const match = normalized.match(RATIO_PATTERN);
  if (!match) {
    return null;
  }

  const developerParts = Number.parseFloat(match[1]);
  const waterParts = Number.parseFloat(match[2]);
  if (!Number.isFinite(developerParts) || !Number.isFinite(waterParts) || developerParts <= 0) {
    return null;
  }

  return { developerParts, waterParts };
}

export function computeDilutionVolumes(
  dilution: string | null | undefined,
  tankVolumeMlInput: string,
): DilutionVolumes {
  const tankVolumeMl = parseTankVolumeMl(tankVolumeMlInput);
  const dilutionLabel = dilution?.trim() || "stock";
  const ratio = parseDilutionRatio(dilutionLabel);

  if (!ratio) {
    return {
      tankVolumeMl,
      developerMl: tankVolumeMl,
      waterMl: 0,
      dilutionLabel,
      computed: dilutionLabel.toLowerCase() !== "stock",
      note:
        dilutionLabel.toLowerCase() === "stock"
          ? "Use undiluted developer for the full tank volume."
          : `Could not parse "${dilutionLabel}" — measure manually.`,
    };
  }

  const totalParts = ratio.developerParts + ratio.waterParts;
  const developerMl = Math.round((tankVolumeMl * ratio.developerParts) / totalParts);
  const waterMl = tankVolumeMl - developerMl;

  return {
    tankVolumeMl,
    developerMl,
    waterMl,
    dilutionLabel,
    computed: true,
  };
}
