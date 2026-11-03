import { cn } from "@/lib/utils";
import { Star } from "lucide-react";

export function RatingStars({
  rating,
  reviewCount,
  className,
}: {
  rating: number;
  reviewCount?: number;
  className?: string;
}) {
  if (!rating) {
    return (
      <span
        className={cn(
          "text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
          className,
        )}
      >
        New arrival
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            className={cn(
              "size-3",
              index < Math.round(rating)
                ? "fill-marigold text-marigold"
                : "fill-transparent text-sand-deep",
            )}
          />
        ))}
      </span>
      <span className="text-[11px] font-medium text-muted-foreground">
        {rating.toFixed(1)}
        {typeof reviewCount === "number" ? ` (${reviewCount})` : ""}
      </span>
      <span className="sr-only">
        Rated {rating.toFixed(1)} out of 5
        {typeof reviewCount === "number" ? ` from ${reviewCount} reviews` : ""}
      </span>
    </span>
  );
}
