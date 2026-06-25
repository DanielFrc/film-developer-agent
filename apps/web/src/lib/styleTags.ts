/** Curated recipe style tags — serialized into extra_context for the LLM. */

export interface RecipeStyleTag {
  id: string;
  label: string;
}

export const RECIPE_STYLE_TAGS: RecipeStyleTag[] = [
  { id: "cinematic", label: "Cinematic" },
  { id: "fine-grain", label: "Fine grain" },
  { id: "high-contrast", label: "High contrast" },
  { id: "flat-for-scanning", label: "Flat for scanning" },
  { id: "gritty", label: "Gritty" },
  { id: "vintage", label: "Vintage" },
  { id: "stand-development", label: "Stand development" },
  { id: "minimal-agitation", label: "Minimal agitation" },
];

export function buildStyleTagsContext(tags: string[]): string | undefined {
  if (!tags.length) return undefined;
  const labels = tags.map((id) => {
    const preset = RECIPE_STYLE_TAGS.find((tag) => tag.id === id);
    return preset?.label ?? id;
  });
  return `Style: ${labels.join(", ")}`;
}

export function toggleStyleTag(tags: string[], tagId: string): string[] {
  return tags.includes(tagId) ? tags.filter((id) => id !== tagId) : [...tags, tagId];
}
