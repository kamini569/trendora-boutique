import { CategoryFilters } from "@/components/store/CategoryFilters";
import { ProductCard } from "@/components/store/ProductCard";
import { ProductImage } from "@/components/store/ProductImage";
import { RatingStars } from "@/components/store/RatingStars";
import { StoreShell } from "@/components/store/StoreShell";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { categoryLabel, categoryNote, formatPrice } from "@/lib/catalog";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Gem,
  Leaf,
  PackageCheck,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=85";
const OFFER_IMAGE =
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1100&q=80";
const BAG_IMAGE =
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80";

const VALUES = [
  {
    icon: Leaf,
    title: "Natural fibres first",
    copy: "Silk, linen, cashmere and leather — chosen for how they feel and how they age.",
  },
  {
    icon: Gem,
    title: "Small-batch, not mass-made",
    copy: "Every piece is produced in limited runs, so the rail stays considered.",
  },
  {
    icon: PackageCheck,
    title: "Packed by the studio",
    copy: "Orders are wrapped by hand in recycled tissue, with a note from us.",
  },
];

export default function Landing() {
  const products = useQuery(api.products.list);
  const [category, setCategory] = useState("all");

  const counts = useMemo(() => {
    const next: Record<string, number> = {};
    for (const product of products ?? []) {
      next[product.category] = (next[product.category] ?? 0) + 1;
    }
    return next;
  }, [products]);

  const filtered = useMemo(() => {
    if (!products) return [];
    return category === "all"
      ? products
      : products.filter((product) => product.category === category);
  }, [products, category]);

  const visible = filtered.slice(0, 8);
  const heading = category === "all" ? "Trending now" : categoryLabel(category);

  return (
    <StoreShell>
      <section className="relative overflow-hidden bg-[#f6ebe1]">
        <div
          className="pointer-events-none absolute -left-32 top-20 size-[28rem] rounded-full bg-blush/70 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-1/3 size-72 rounded-full bg-marigold-soft/70 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 lg:px-8 lg:pb-24 lg:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-card/70 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary backdrop-blur">
              <Sparkles className="size-3 text-marigold" />
              The autumn edit · 2026
            </div>

            <h1 className="display-tight mt-6 text-[3.4rem] font-semibold text-ink sm:text-7xl lg:text-[5.2rem]">
              Softly bold.
              <br />
              <span className="text-primary">Entirely you.</span>
            </h1>

            <p className="mt-6 max-w-md text-[15px] leading-7 text-muted-foreground">
              Dresses that move with you, jewellery you never take off, and
              leather that gets better with time. Meet the launch edit —{" "}
              <span className="font-medium text-ink">
                {products?.length ?? 17} considered pieces
              </span>
              , made to be kept.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full px-7 text-[12px] font-semibold uppercase tracking-[0.14em] shadow-[0_16px_30px_-20px_rgba(126,53,72,0.9)]"
              >
                <Link to="/shop">
                  Shop the edit
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-primary/20 bg-card/70 px-7 text-[12px] font-semibold uppercase tracking-[0.14em] backdrop-blur hover:border-primary/40 hover:bg-card"
              >
                <Link to="/shop?category=jewellery">Explore jewellery</Link>
              </Button>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2.5">
              <div className="flex items-center gap-2">
                <RatingStars rating={4.8} />
                <span className="text-[11px] text-muted-foreground">
                  600+ wardrobes
                </span>
              </div>
              <span className="hidden h-3 w-px bg-border sm:block" />
              <p className="text-[11px] text-muted-foreground">
                Complimentary delivery over $150
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="relative mx-auto h-[430px] w-full max-w-md sm:h-[540px] lg:h-[600px] lg:max-w-none"
          >
            <div className="absolute inset-y-0 right-0 w-[86%] overflow-hidden rounded-[14rem_14rem_2rem_2rem] border border-white/40 bg-sand shadow-[0_40px_80px_-50px_rgba(74,44,51,0.65)]">
              <ProductImage
                src={HERO_IMAGE}
                alt="Model wearing a considered Trendora look"
                eager
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />
            </div>

            <div
              className="absolute -left-1 top-8 hidden size-28 rotate-[-9deg] flex-col items-center justify-center rounded-full bg-marigold text-center text-ink shadow-[0_18px_30px_-18px_rgba(74,44,51,0.6)] sm:flex lg:left-0"
              aria-hidden="true"
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.14em]">
                Made to
              </span>
              <span className="font-display text-xl font-semibold leading-none">
                be kept
              </span>
              <span className="mt-1 text-[8px] uppercase tracking-[0.16em]">
                Est. 2026
              </span>
            </div>

            <Link
              to="/product/sienna-crescent-shoulder-bag"
              className="group absolute bottom-5 left-0 flex w-[15.5rem] items-center gap-3 rounded-2xl border border-white/60 bg-card/95 p-2.5 shadow-[0_24px_40px_-26px_rgba(74,44,51,0.55)] backdrop-blur transition-transform hover:-translate-y-0.5 sm:left-2"
            >
              <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-sand">
                <ProductImage src={BAG_IMAGE} alt="Sienna shoulder bag" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-primary/70">
                  Most wanted
                </p>
                <p className="truncate font-display text-sm font-medium text-ink">
                  Sienna shoulder bag
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatPrice(245)}
                </p>
              </div>
              <ArrowUpRight className="ml-auto size-4 shrink-0 text-primary transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>

            <div className="absolute -right-2 bottom-28 hidden rounded-full border border-border/70 bg-card px-3.5 py-2 text-[10px] font-medium uppercase tracking-[0.14em] text-foreground/70 shadow-sm sm:block">
              Small batch · 17 pieces
            </div>
          </motion.div>
        </div>
      </section>

      <section
        id="categories"
        className="border-y border-border/70 bg-card/60"
      >
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="eyebrow">Shop by category</p>
              <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-4xl">
                Find your next favourite
              </h2>
            </div>
            <div className="flex items-end justify-between gap-6 lg:flex-col lg:items-end">
              <p className="max-w-xs text-[13px] leading-6 text-muted-foreground">
                {categoryNote(category)}
              </p>
              <Link
                to="/shop"
                className="hidden items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary transition-colors hover:text-primary/70 sm:inline-flex"
              >
                View full shop
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>

          <CategoryFilters
            value={category}
            onChange={setCategory}
            counts={counts}
            total={products?.length}
            className="mt-7"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">The rail</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.035em] text-ink sm:text-[2.6rem]">
              {heading}
            </h2>
          </div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
            {products === undefined
              ? "Curating the rail…"
              : `${filtered.length} ${filtered.length === 1 ? "piece" : "pieces"}`}
          </p>
        </div>

        {products === undefined ? (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[3/4] rounded-[1.35rem] bg-sand" />
                <div className="mt-4 h-2.5 w-20 rounded-full bg-sand" />
                <div className="mt-2 h-3.5 w-32 rounded-full bg-sand" />
                <div className="mt-2 h-3 w-16 rounded-full bg-sand" />
              </div>
            ))}
          </div>
        ) : visible.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {visible.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <p className="font-display text-xl text-ink">
              This rail is being restyled.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try another category, or browse the full edit.
            </p>
            <Button
              variant="outline"
              className="mt-5 rounded-full"
              onClick={() => setCategory("all")}
            >
              View all pieces
            </Button>
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full border-primary/20 bg-transparent px-6 text-[11px] font-semibold uppercase tracking-[0.14em] hover:border-primary/40 hover:bg-blush/50"
          >
            <Link
              to={
                category === "all" ? "/shop" : `/shop?category=${category}`
              }
            >
              View all {category === "all" ? "pieces" : heading.toLowerCase()}
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-[2rem] bg-marigold-soft lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-14">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-ink/90 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#f8e8c8]">
              <Sparkles className="size-3 text-marigold" />
              The special offer
            </div>
            <h2 className="mt-5 max-w-md font-display text-3xl font-semibold leading-[1.05] tracking-[-0.035em] text-ink sm:text-[2.8rem]">
              A softer way to start your wardrobe.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-ink/70">
              Complimentary delivery on every order over $150, and thirty days
              to change your mind. The launch edit is intentionally small — when
              a piece is gone, it's gone.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Button
                asChild
                className="h-11 rounded-full bg-ink px-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#fbf6f0] hover:bg-ink/90"
              >
                <Link to="/shop">
                  Shop the edit
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-ink/55">
                No code needed
              </span>
            </div>
          </div>
          <div className="relative min-h-[280px] lg:min-h-[380px]">
            <ProductImage
              src={OFFER_IMAGE}
              alt="The Trendora studio rail"
              className="absolute inset-0 h-full w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/25 to-transparent lg:bg-gradient-to-r lg:from-marigold-soft/40 lg:to-transparent" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-8 sm:grid-cols-3 sm:gap-6">
          {VALUES.map((value) => (
            <div
              key={value.title}
              className="border-t border-border pt-5 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0"
            >
              <value.icon className="size-5 text-primary" strokeWidth={1.5} />
              <h3 className="mt-4 font-display text-lg font-medium tracking-tight text-ink">
                {value.title}
              </h3>
              <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                {value.copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-5 rounded-[1.6rem] border border-border/80 bg-card px-6 py-6 sm:flex-row sm:items-center sm:px-8">
          <div>
            <p className="eyebrow">For the boutique owner</p>
            <p className="mt-2 font-display text-xl tracking-tight text-ink">
              Your rail, your stock, one quiet studio.
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Publish pieces, adjust inventory and keep the edit current.
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-full border-primary/25 px-5 text-[11px] font-semibold uppercase tracking-[0.14em] hover:bg-blush/50"
          >
            <Link to="/admin">
              Open owner studio
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </section>
    </StoreShell>
  );
}
