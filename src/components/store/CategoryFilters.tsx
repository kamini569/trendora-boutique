import { CATEGORIES } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export function CategoryFilters({
  value,
  onChange,
  counts,
  total,
  className,
}: {
  value: string;
  onChange: (category: string) => void;
  counts?: Record<string, number>;
  total?: number;
  className?: string;
}) {
  const options = [
    { slug: "all", label: "All pieces", count: total },
    ...CATEGORIES.map((category) => ({
      slug: category.slug,
      label: category.label,
      count: counts?.[category.slug],
    })),
  ];

  return (
    <div
      className={cn(
        "scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0",
        className,
      )}
      role="group"
      aria-label="Filter pieces by category"
    >
      {options.map((option) => {
        const active = value === option.slug;
        return (
          <button
            key={option.slug}
            type="button"
            onClick={() => onChange(option.slug)}
            aria-pressed={active}
            className={cn(
              "group inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-[13px] font-medium transition-all duration-300",
              active
                ? "border-primary bg-primary text-primary-foreground shadow-[0_10px_24px_-14px_rgba(126,53,72,0.9)]"
                : "border-border bg-card text-foreground/80 hover:border-primary/40 hover:bg-blush/50 hover:text-primary",
            )}
          >
            {option.label}
            {typeof option.count === "number" && option.count > 0 && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                  active
                    ? "bg-primary-foreground/15 text-primary-foreground"
                    : "bg-sand text-muted-foreground group-hover:bg-card",
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
