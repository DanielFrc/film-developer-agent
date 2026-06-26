interface TagChipGroupProps {
  label: string;
  hint?: string;
  options: { id: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  className?: string;
}

export function TagChipGroup({
  label,
  hint,
  options,
  selected,
  onChange,
  className = "",
}: TagChipGroupProps) {
  function toggle(tagId: string) {
    onChange(
      selected.includes(tagId)
        ? selected.filter((id) => id !== tagId)
        : [...selected, tagId],
    );
  }

  return (
    <div className={className}>
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => toggle(option.id)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                active
                  ? "border-accent bg-accent/15 font-medium text-ink"
                  : "border-border bg-surface-elevated text-muted hover:border-accent/50 hover:text-ink"
              }`}
              aria-pressed={active}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </div>
  );
}
