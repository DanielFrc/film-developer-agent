import type { ExplorerRow } from "../api/types";

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function exportRowsToCsv(
  filename: string,
  columns: string[],
  rows: ExplorerRow[],
): void {
  const header = columns.map(escapeCsvValue).join(",");
  const body = rows
    .map((row) => columns.map((column) => escapeCsvValue(row[column])).join(","))
    .join("\n");
  const blob = new Blob([`${header}\n${body}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
