import { CategoryFilters } from "@/components/store/CategoryFilters";
import { ProductCard } from "@/components/store/ProductCard";
import { StoreShell } from "@/components/store/StoreShell";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { api } from "@/convex/_generated/api";
import {
  CATEGORY_SLUGS,
  PRICE_BANDS,
  SIZE_OPTIONS,
  SORT_OPTIONS,
  categoryLabel,
  sortProducts,
  type PriceBand,
  type SortKey,
} from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { useQuery } from "convex/react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";

type FilterPanelProps = {
  priceBand: PriceBand;
  onPriceBand: (value: PriceBand) => void;
  size: string | null;
  onSize: (value: string | null) => void;
  onClear: () => void;
  activeCount: number;
};

function FilterPanel({
  priceBand,
  onPriceBand,
  size,
  onSize,
  onClear,
  activeCount,
}: FilterPanelProps) {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between">
          <p className="eyebrow">Price</p>
          {activeCount > 0 && (
            <span className="rounded-full bg-blush px-2 py-0.5 text-[10px] font-semibold text-primary">
              {activeCount} active
            </span>
          )}
        </div>
        <div className="mt-3 space-y-1">
          {PRICE_BANDS.map((band) => {
            const active = priceBand === band.value;
            return (
              <button
                key={band.value}
                type="button"
                onClick={() => onPriceBand(band.value)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-[13px] transition-colors",
                  active
                    ? "bg-blush/60 font-medium text-primary"
                    : "text-foreground/70 hover:bg-sand/50 hover:text-ink",
                )}
              >
                <span
                  className={cn(
                    "flex size-3.5 items-center justify-center rounded-full border",
                    active ? "border-primary" : "border-sand-deep",
                  )}
                >
                  {active && <span className="size-1.5 rounded-full bg-primary" />}
                </span>
                {band.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="eyebrow">Size</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((option) => {
            const active = size === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onSize(active ? null : option)}
                className={cn(
                  "min-w-10 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground/70 hover:border-primary/40 hover:text-primary",
                )}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border/70 pt-5">
        <Button
          type="button"
          variant="ghost"
          onClick={onClear}
          className="h-9 w-full justify-start rounded-lg px-2 text-[12px] font-medium text-muted-foreground hover:text-primary"
        >
          <X className="size-3.5" />
          Clear all filters
        </Button>
      </div>
    </div>
  );
}

export default function Shop() {
  const products = useQuery(api.products.list);
  const [searchParams, setSearchParams] = useSearchParams();

  const rawCategory = searchParams.get("category") ?? "all";
  const category = CATEGORY_SLUGS.includes(
    rawCategory as (typeof CATEGORY_SLUGS)[number],
  )
    ? rawCategory
    : "all";
  const search = searchParams.get("search") ?? "";

  const [priceBand, setPriceBand] = useState<PriceBand>("all");
  const [size, setSize] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    document.title = "Shop the edit · Trendora Boutique";
  }, []);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams);
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams(), { replace: true });
    setPriceBand("all");
    setSize(null);
    setSort("featured");
  }

  const counts = useMemo(() => {
    const next: Record<string, number> = {};
    for (const product of products ?? []) {
      next[product.category] = (next[product.category] ?? 0) + 1;
    }
    return next;
  }, [products]);

  const filtered = useMemo(() => {
    let list = products ?? [];
    if (category !== "all") {
      list = list.filter((product) => product.category === category);
    }
    const term = search.trim().toLowerCase();
    if (term) {
      list = list.filter((product) =>
        [
          product.name,
          product.category,
          categoryLabel(product.category),
          product.description,
          ...product.colours.map((colour) => colour.name),
        ]
          .join(" ")
          .toLowerCase()
          .includes(term),
      );
    }
    const band = PRICE_BANDS.find((option) => option.value === priceBand);
    if (band && band.value !== "all") {
      list = list.filter(
        (product) => product.price >= band.min && product.price <= band.max,
      );
    }
    if (size) {
      list = list.filter((product) => product.sizes.includes(size));
    }
    return sortProducts(list, sort);
  }, [products, category, search, priceBand, size, sort]);

  const activeExtras =
    (priceBand !== "all" ? 1 : 0) + (size ? 1 : 0) + (search ? 1 : 0);
  const activeCount = activeExtras + (category !== "all" ? 1 : 0);
  const priceLabel = PRICE_BANDS.find((band) => band.value === priceBand)?.label;

  return (
    <StoreShell>
      <section className="relative overflow-hidden border-b border-border/70 bg-[#f6ebe1]">
        <div
          className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full bg-blush/60 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <p className="eyebrow">The full rail</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h1 className="display-tight max-w-xl text-5xl font-semibold text-ink sm:text-6xl">
              The boutique edit
            </h1>
            <p className="max-w-xs text-[13px] leading-6 text-muted-foreground">
              Dresses, knitwear, jewellery and leather — every piece in the
              launch collection, in one place.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-card/60">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <CategoryFilters
            value={category}
            onChange={(value) => updateParam("category", value)}
            counts={counts}
            total={products?.length}
          />
        </div>
      </section>

      <section
        id="catalogue"
        className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12"
      >
        <div className="grid gap-10 lg:grid-cols-[230px_1fr] lg:gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-32">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg font-medium tracking-tight text-ink">
                  Filters
                </h2>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:text-primary"
                >
                  Reset
                </button>
              </div>
              <div className="mt-5">
                <FilterPanel
                  priceBand={priceBand}
                  onPriceBand={setPriceBand}
                  size={size}
                  onSize={setSize}
                  onClear={clearFilters}
                  activeCount={activeExtras}
                />
              </div>
            </div>
          </aside>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative min-w-[180px] flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => updateParam("search", event.target.value)}
                  placeholder="Search dresses, gold hoops, leather…"
                  aria-label="Search the catalogue"
                  className="h-11 w-full rounded-full border border-border bg-card pl-10 pr-4 text-[13px] text-foreground outline-none transition-all placeholder:text-muted-foreground/75 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => updateParam("search", "")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:text-primary"
                    aria-label="Clear search"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-full border-border px-4 text-xs font-medium lg:hidden"
                  >
                    <SlidersHorizontal className="size-3.5" />
                    Filters
                    {activeExtras > 0 && (
                      <span className="ml-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">
                        {activeExtras}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[86%] overflow-y-auto bg-background p-0 sm:max-w-sm"
                >
                  <SheetHeader className="border-b border-border/70 px-6 py-5 text-left">
                    <SheetTitle className="font-display text-xl tracking-tight">
                      Refine the edit
                    </SheetTitle>
                  </SheetHeader>
                  <div className="px-6 py-6">
                    <FilterPanel
                      priceBand={priceBand}
                      onPriceBand={setPriceBand}
                      size={size}
                      onSize={setSize}
                      onClear={() => {
                        clearFilters();
                        setFiltersOpen(false);
                      }}
                      activeCount={activeExtras}
                    />
                  </div>
                  <div className="sticky bottom-0 border-t border-border/70 bg-background px-6 py-4">
                    <Button
                      className="w-full rounded-full"
                      onClick={() => setFiltersOpen(false)}
                    >
                      Show {filtered.length} pieces
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              <Select value={sort} onValueChange={(value) => setSort(value as SortKey)}>
                <SelectTrigger className="h-11 w-[190px] rounded-full border-border bg-card text-xs">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent align="end" className="rounded-xl">
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {products === undefined
                  ? "Loading the rail…"
                  : `${filtered.length} ${filtered.length === 1 ? "piece" : "pieces"}`}
                {category !== "all" ? ` · ${categoryLabel(category)}` : ""}
              </p>
              {activeCount > 0 && (
                <>
                  <span className="h-3 w-px bg-border" />
                  {search && (
                    <button
                      type="button"
                      onClick={() => updateParam("search", "")}
                      className="inline-flex items-center gap-1.5 rounded-full bg-blush/70 px-2.5 py-1 text-[10px] font-medium text-primary"
                    >
                      “{search}”
                      <X className="size-3" />
                    </button>
                  )}
                  {priceBand !== "all" && (
                    <button
                      type="button"
                      onClick={() => setPriceBand("all")}
                      className="inline-flex items-center gap-1.5 rounded-full bg-blush/70 px-2.5 py-1 text-[10px] font-medium text-primary"
                    >
                      {priceLabel}
                      <X className="size-3" />
                    </button>
                  )}
                  {size && (
                    <button
                      type="button"
                      onClick={() => setSize(null)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-blush/70 px-2.5 py-1 text-[10px] font-medium text-primary"
                    >
                      Size {size}
                      <X className="size-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-[10px] font-medium text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-primary"
                  >
                    Clear all
                  </button>
                </>
              )}
            </div>

            {products === undefined ? (
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-[3/4] rounded-[1.35rem] bg-sand" />
                    <div className="mt-4 h-2.5 w-20 rounded-full bg-sand" />
                    <div className="mt-2 h-3.5 w-32 rounded-full bg-sand" />
                    <div className="mt-2 h-3 w-16 rounded-full bg-sand" />
                  </div>
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 xl:grid-cols-4 xl:gap-x-5">
                {filtered.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="mt-6 flex flex-col items-center justify-center rounded-[1.4rem] border border-dashed border-border bg-card px-6 py-16 text-center">
                <p className="font-display text-2xl tracking-tight text-ink">
                  No pieces match this edit
                </p>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  Try widening the price, removing a size, or searching for
                  something else — the rail is small on purpose.
                </p>
                <Button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-full px-6"
                >
                  Clear filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </StoreShell>
  );
}
