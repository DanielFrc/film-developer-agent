import { useMemo } from "react";
import { filmApi } from "../api/client";
import type { FormatItem, ScrapedFormat } from "../api/types";
import { SCRAPED_FORMATS } from "../api/types";
import { useAsync } from "./useAsync";

function fallbackFormats(): FormatItem[] {
  return SCRAPED_FORMATS.map((format) => ({ format }));
}

function scrapedFormats(items: FormatItem[]): FormatItem[] {
  const scraped = new Set<string>(SCRAPED_FORMATS);
  return items.filter((item) => scraped.has(item.format));
}

export function useScrapedFormats() {
  const formatsQuery = useAsync(() => filmApi.listFormats(), [], "generic");

  const formats = useMemo(() => {
    if (!formatsQuery.data?.length) {
      return fallbackFormats();
    }
    const filtered = scrapedFormats(formatsQuery.data);
    return filtered.length ? filtered : fallbackFormats();
  }, [formatsQuery.data]);

  return {
    formats,
    loading: formatsQuery.loading,
    error: formatsQuery.error,
    reload: formatsQuery.reload,
  };
}

export function isScrapedFormat(format: string): format is ScrapedFormat {
  return (SCRAPED_FORMATS as readonly string[]).includes(format);
}
