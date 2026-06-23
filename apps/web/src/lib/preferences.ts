/** Parse comma-separated developer names for display and LLM context. */
export function parsePreferredDevelopers(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
