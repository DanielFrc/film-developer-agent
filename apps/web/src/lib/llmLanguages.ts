export const LLM_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
] as const;

export type LlmLanguage = (typeof LLM_LANGUAGES)[number]["code"];

export function normalizeLlmLanguage(value: unknown): LlmLanguage {
  if (value === "es") return "es";
  return "en";
}
