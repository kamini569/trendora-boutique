import type { Doc } from "@/convex/_generated/dataModel";

export type Product = Doc<"products">;

export const CATEGORIES = [
  {
    slug: "dresses",
    label: "Dresses",
    note: "Silk slips, linen midis and occasion wraps",
  },
  {
    slug: "tops",
    label: "Tops",
    note: "Satin blouses and fine-gauge camis",
  },
  {
    slug: "knitwear",
    label: "Knitwear",
    note: "Cashmere, merino and soft ribbed layers",
  },
  {
    slug: "jewellery",
    label: "Jewellery",
    note: "Gold vermeil, pearls and everyday heirlooms",
  },
  {
    slug: "handbags",
    label: "Handbags",
    note: "Leather shapes made for every day",
  },
  {
    slug: "accessories",
    label: "Accessories",
    note: "Silk, sun and finishing touches",
  },
] as const;

export const CATEGORY_SLUGS = CATEGORIES.map((category) => category.slug);

export function categoryLabel(slug: string) {
  return CATEGORIES.find((category) => category.slug === slug)?.label ?? slug;
}

export function categoryNote(slug: string) {
  return (
    CATEGORIES.find((category) => category.slug === slug)?.note ??
    "The full Trendora edit"
  );
}

export const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "One size"];

export const PRICE_BANDS = [
  { value: "all", label: "Any price", min: 0, max: Infinity },
  { value: "under-75", label: "Under $75", min: 0, max: 74.99 },
  { value: "75-150", label: "$75 – $150", min: 75, max: 150 },
  { value: "150-250", label: "$150 – $250", min: 150.01, max: 250 },
  { value: "250-plus", label: "$250 and above", min: 250.01, max: Infinity },
] as const;

export type PriceBand = (typeof PRICE_BANDS)[number]["value"];

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest in" },
] as const;

export type SortKey = (typeof SORT_OPTIONS)[number]["value"];

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number) {
  return priceFormatter.format(value);
}

export function sortProducts(products: Product[], sort: SortKey) {
  const sorted = [...products];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "newest":
      return sorted.sort((a, b) => b.createdAt - a.createdAt);
    default:
      return sorted;
  }
}
