interface BadgeProps {
  children: string;
  tone?: "neutral" | "success" | "warning" | "accent";
}

const tones = {
  neutral: "bg-accent-soft text-ink",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  accent: "bg-accent/15 text-accent",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
