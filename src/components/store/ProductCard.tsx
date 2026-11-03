import { categoryLabel, formatPrice, type Product } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router";
import { ProductImage } from "./ProductImage";
import { RatingStars } from "./RatingStars";

export function ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const hasSecondImage = product.images.length > 1;
  const onSale =
    typeof product.compareAtPrice === "number" &&
    product.compareAtPrice > product.price;

  return (
    <article className={cn("group", className)}>
      <Link
        to={`/product/${product.slug}`}
        className="block focus-visible:outline-none"
        aria-label={`View ${product.name}`}
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-[1.35rem] bg-sand">
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            imgClassName="transition-transform duration-[900ms] ease-out group-hover:scale-[1.045]"
          />
          {hasSecondImage && (
            <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <ProductImage
                src={product.images[1]}
                alt={`${product.name} — alternate view`}
                imgClassName="transition-transform duration-[900ms] ease-out group-hover:scale-[1.045]"
              />
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <div className="flex flex-wrap gap-1.5">
              {product.badge && (
                <span className="rounded-full bg-card/95 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-ink shadow-sm backdrop-blur">
                  {product.badge}
                </span>
              )}
              {onSale && (
                <span className="rounded-full bg-primary px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-primary-foreground">
                  Sale
                </span>
              )}
            </div>
            <span className="flex size-8 items-center justify-center rounded-full bg-card/95 text-primary opacity-0 shadow-sm backdrop-blur transition-all duration-300 group-hover:opacity-100">
              <ArrowUpRight className="size-4" />
            </span>
          </div>

          {product.stock > 0 && product.stock <= 3 && (
            <span className="absolute inset-x-3 bottom-3 rounded-full bg-ink/85 px-3 py-1.5 text-center text-[10px] font-medium tracking-wide text-background backdrop-blur">
              Only {product.stock} left in the studio
            </span>
          )}
        </div>

        <div className="mt-3.5 space-y-1.5 px-0.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {categoryLabel(product.category)}
            </p>
            <RatingStars rating={product.rating} />
          </div>
          <h3 className="font-display text-[1.05rem] font-medium leading-snug tracking-tight text-ink transition-colors group-hover:text-primary">
            {product.name}
          </h3>
          <p className="flex items-baseline gap-2 text-sm">
            <span className="font-medium text-ink">{formatPrice(product.price)}</span>
            {onSale && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice as number)}
              </span>
            )}
          </p>
        </div>
      </Link>
    </article>
  );
}
