import { ProductCard } from "@/components/store/ProductCard";
import { ProductImage } from "@/components/store/ProductImage";
import { RatingStars } from "@/components/store/RatingStars";
import { StoreShell } from "@/components/store/StoreShell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import {
  categoryLabel,
  formatPrice,
  type Product as ProductType,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";

export default function Product() {
  const { slug } = useParams();
  const product = useQuery(
    api.products.getBySlug,
    slug ? { slug } : "skip",
  );
  const products = useQuery(api.products.list);

  useEffect(() => {
    document.title = product
      ? `${product.name} · Trendora Boutique`
      : "The boutique edit · Trendora";
    window.scrollTo({ top: 0 });
  }, [product]);

  return (
    <StoreShell>
      {product === undefined ? (
        <ProductSkeleton />
      ) : product === null ? (
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-24 text-center">
          <p className="eyebrow">The rail has moved</p>
          <h1 className="display-tight mt-3 text-4xl font-semibold text-ink sm:text-5xl">
            This piece isn't here.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
            It may have sold out of the launch edit, or the link might be older
            than the collection. The rest of the rail is waiting.
          </p>
          <Button asChild className="mt-7 rounded-full px-6">
            <Link to="/shop">
              Back to the edit
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      ) : (
        <ProductDetail
          key={product._id}
          product={product}
          catalogue={products ?? []}
        />
      )}
    </StoreShell>
  );
}

function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-3 w-40 rounded-full bg-sand" />
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="aspect-[4/5] rounded-[1.6rem] bg-sand" />
        <div className="space-y-4 pt-4">
          <div className="h-3 w-24 rounded-full bg-sand" />
          <div className="h-10 w-3/4 rounded-full bg-sand" />
          <div className="h-4 w-32 rounded-full bg-sand" />
          <div className="h-20 w-full rounded-2xl bg-sand" />
          <div className="h-12 w-full rounded-full bg-sand" />
        </div>
      </div>
    </div>
  );
}

function ProductDetail({
  product,
  catalogue,
}: {
  product: ProductType;
  catalogue: ProductType[];
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [colour, setColour] = useState(product.colours[0]?.name ?? "");
  const [size, setSize] = useState(product.sizes[0] ?? "");

  const onSale =
    typeof product.compareAtPrice === "number" &&
    product.compareAtPrice > product.price;
  const saving = onSale
    ? (product.compareAtPrice as number) - product.price
    : 0;

  const related = (() => {
    const sameCategory = catalogue.filter(
      (item) =>
        item._id !== product._id && item.category === product.category,
    );
    if (sameCategory.length >= 4) return sameCategory.slice(0, 4);
    const fillers = catalogue.filter(
      (item) =>
        item._id !== product._id &&
        !sameCategory.some((match) => match._id === item._id),
    );
    return [...sameCategory, ...fillers].slice(0, 4);
  })();

  function addToBag() {
    toast("The bag opens with the next drop", {
      description: `${product.name}${size ? ` · ${size}` : ""}${colour ? ` · ${colour}` : ""} — browse the launch edit for now.`,
    });
  }

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground"
        >
          <Link to="/" className="transition-colors hover:text-primary">
            Home
          </Link>
          <span className="text-border">/</span>
          <Link to="/shop" className="transition-colors hover:text-primary">
            Shop
          </Link>
          <span className="text-border">/</span>
          <Link
            to={`/shop?category=${product.category}`}
            className="transition-colors hover:text-primary"
          >
            {categoryLabel(product.category)}
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground/70">{product.name}</span>
        </nav>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:px-8 lg:py-10">
        <div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] border border-border/50 bg-sand">
            <ProductImage
              key={product.images[activeImage] ?? activeImage}
              src={product.images[activeImage]}
              alt={`${product.name} — view ${activeImage + 1}`}
              eager
              imgClassName="transition-transform duration-700"
            />
            {product.badge && (
              <span className="absolute left-4 top-4 rounded-full bg-card/95 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-ink shadow-sm backdrop-blur">
                {product.badge}
              </span>
            )}
            {product.stock > 0 && product.stock <= 3 && (
              <span className="absolute bottom-4 left-4 rounded-full bg-ink/85 px-3 py-1.5 text-[10px] font-medium text-background backdrop-blur">
                Only {product.stock} left in the studio
              </span>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2.5">
              {product.images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Show view ${index + 1}`}
                  aria-pressed={activeImage === index}
                  className={cn(
                    "size-20 overflow-hidden rounded-xl border-2 bg-sand transition-all sm:size-24",
                    activeImage === index
                      ? "border-primary"
                      : "border-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <ProductImage src={image} alt={`${product.name} view ${index + 1}`} />
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
            <Sparkles className="size-3.5 text-marigold" />
            Photographed in the Trendora studio. Natural light, no retouching.
          </div>
        </div>

        <div className="lg:pt-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="eyebrow">{categoryLabel(product.category)}</p>
            {product.badge && (
              <span className="rounded-full bg-blush px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.13em] text-primary">
                {product.badge}
              </span>
            )}
          </div>

          <h1 className="display-tight mt-3 text-[2.5rem] font-semibold text-ink sm:text-5xl">
            {product.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <RatingStars
              rating={product.rating}
              reviewCount={product.reviewCount}
            />
            {product.reviewCount > 0 && (
              <span className="text-[11px] text-muted-foreground">
                from {product.reviewCount} considered wardrobes
              </span>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="font-display text-3xl font-medium tracking-tight text-ink">
              {formatPrice(product.price)}
            </span>
            {onSale && (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.compareAtPrice as number)}
                </span>
                <span className="rounded-full bg-marigold-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink">
                  Save {formatPrice(saving)}
                </span>
              </>
            )}
          </div>

          <p className="mt-5 max-w-lg text-[14px] leading-7 text-muted-foreground">
            {product.description}
          </p>

          {product.colours.length > 0 && (
            <div className="mt-7">
              <div className="flex items-baseline gap-2">
                <p className="field-label">Colour</p>
                <span className="text-[12px] text-foreground/75">{colour}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {product.colours.map((option) => {
                  const active = colour === option.name;
                  return (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => setColour(option.name)}
                      aria-label={`Colour ${option.name}`}
                      aria-pressed={active}
                      className={cn(
                        "flex size-9 items-center justify-center rounded-full border transition-all",
                        active
                          ? "border-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
                          : "border-border hover:border-primary/50",
                      )}
                      title={option.name}
                    >
                      <span
                        className="size-6 rounded-full border border-black/5"
                        style={{ backgroundColor: option.hex }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {product.sizes.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="field-label">
                  Size <span className="normal-case tracking-normal text-foreground/75">· {size}</span>
                </p>
                <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                  True to size
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((option) => {
                  const active = size === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSize(option)}
                      aria-pressed={active}
                      className={cn(
                        "min-w-12 rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-all",
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-[0_10px_20px_-14px_rgba(126,53,72,0.9)]"
                          : "border-border bg-card text-foreground/75 hover:border-primary/40 hover:text-primary",
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-7">
            <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.12em]">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  product.stock > 0 ? "bg-[#5f7a52]" : "bg-destructive",
                )}
              />
              {product.stock > 0
                ? product.stock <= 3
                  ? `Low stock — ${product.stock} left`
                  : "In stock and ready to send"
                : "Currently sold out"}
            </p>
            <Button
              type="button"
              onClick={addToBag}
              disabled={product.stock === 0}
              size="lg"
              className="mt-3 h-12 w-full rounded-full text-[12px] font-semibold uppercase tracking-[0.14em] sm:w-auto sm:min-w-64"
            >
              <ShoppingBag className="size-4" />
              Add to bag
            </Button>
            <p className="mt-2.5 text-[10px] uppercase tracking-[0.13em] text-muted-foreground">
              Launch preview · bag and checkout arrive with the next drop
            </p>
          </div>

          <div className="mt-7 grid gap-3 rounded-2xl border border-border/80 bg-card p-4 sm:grid-cols-3">
            <div className="flex items-center gap-2.5">
              <Truck className="size-4 shrink-0 text-primary" strokeWidth={1.6} />
              <span className="text-[11px] leading-4 text-muted-foreground">
                Free delivery
                <br />
                over $150
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <RefreshCw className="size-4 shrink-0 text-primary" strokeWidth={1.6} />
              <span className="text-[11px] leading-4 text-muted-foreground">
                30-day returns
                <br />
                on full-price pieces
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="size-4 shrink-0 text-primary" strokeWidth={1.6} />
              <span className="text-[11px] leading-4 text-muted-foreground">
                Packed by hand
                <br />
                in the studio
              </span>
            </div>
          </div>

          <Accordion type="single" collapsible className="mt-6">
            <AccordionItem value="details" className="border-border/70">
              <AccordionTrigger className="font-display text-sm font-medium tracking-tight hover:no-underline">
                The details
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {product.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-start gap-2.5 text-[13px] leading-6 text-muted-foreground"
                    >
                      <Check className="mt-1 size-3.5 shrink-0 text-primary/70" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="delivery" className="border-border/70">
              <AccordionTrigger className="font-display text-sm font-medium tracking-tight hover:no-underline">
                Delivery & returns
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2.5 text-[13px] leading-6 text-muted-foreground">
                  <p>
                    Orders over $150 ship complimentary; below that, delivery is
                    $9 flat. Pieces leave the studio within two business days.
                  </p>
                  <p>
                    Full-price pieces can be returned within 30 days, unworn and
                    with tags attached. Sale pieces are final sale.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="care" className="border-border/70">
              <AccordionTrigger className="font-display text-sm font-medium tracking-tight hover:no-underline">
                Care & the studio note
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-[13px] leading-6 text-muted-foreground">
                  We choose pieces to be worn, not saved. Follow the care note on
                  the label, store knitwear folded, and keep jewellery dry. If
                  you're ever unsure, write to the studio — we'll help.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button
            asChild
            variant="ghost"
            className="mt-3 h-9 rounded-full px-0 text-[11px] font-medium text-muted-foreground hover:bg-transparent hover:text-primary"
          >
            <Link to="/shop">
              <ArrowLeft className="size-3.5" />
              Back to the full edit
            </Link>
          </Button>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-6 pt-8 sm:px-6 lg:px-8 lg:pt-12">
          <div className="flex items-end justify-between gap-4 border-t border-border/70 pt-10">
            <div>
              <p className="eyebrow">Keep looking</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.035em] text-ink">
                Complete the edit
              </h2>
            </div>
            <Link
              to={`/shop?category=${product.category}`}
              className="hidden items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:text-primary/70 sm:inline-flex"
            >
              More {categoryLabel(product.category).toLowerCase()}
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-4 lg:gap-x-6">
            {related.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
